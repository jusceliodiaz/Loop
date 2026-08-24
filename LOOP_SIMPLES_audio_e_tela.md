# LOOP — versão simples: canais de áudio + compartilhamento de tela

Documento único. Substitui, para esta fase, o `LOOP_MASTER_SPEC.md`, o `plano_mvp_plataforma_comunidade_web.md` e o `plataforma-comunidade-tempo-real-spec_1.md`.

---

## 1. A ideia em uma frase

**Uma lista de salas de áudio sempre abertas. Você clica em uma, entra falando, e pode jogar sua tela no meio.** Nada mais.

Não é um Discord. É a parte do Discord que vocês realmente usam quando estão trabalhando juntos.

---

## 2. A inversão em relação às specs anteriores

As três specs colocavam **chat de texto** como o núcleo (Supabase Realtime, RLS, mensagens, snowflake, edição, histórico) e voz/tela como Fase 2 com LiveKit.

Esta versão inverte: **voz e tela são o produto; texto não existe.**

Isso não é uma redução de escopo — é uma troca de eixo. Quando o núcleo é mídia em tempo real, o banco de dados quase desaparece, porque o estado que importa (quem está na sala, quem está falando, quem está compartilhando) vive no SFU, não no Postgres.

### Morre

| O que sai | Por quê |
|---|---|
| Mensagens, edição, exclusão, tombstone, histórico, paginação por cursor | Não há texto no produto |
| Snowflake IDs, particionamento, FTS | Sem tabela grande para ordenar ou buscar |
| Hierarquia Space → Category → Room, cargos, bitfield de permissões, overrides | 5 pessoas não têm política interna |
| RLS, `server_members`, convites, banimentos | Ninguém entra sem estar na lista |
| Supabase Realtime, presença via Postgres, indicador de digitação | O LiveKit já entrega presença e fala ativa |
| Storage, upload, pipeline de mídia, emojis | Não há anexo |
| Vídeo de webcam | Câmera é outra dinâmica social; tela resolve o trabalho |
| Redis, gateway próprio, workers, microserviços | Não existe backend para escalar |

### Sobrevive

- **ADR-007** — SFU gerenciado (LiveKit Cloud) em vez de mesh WebRTC. Continua certo, e agora é a decisão central.
- **A regra de origem** — permissão aplicada no token, não na UI. Esconder o botão não é controle de acesso.
- **A hierarquia de degradação** — FPS → resolução → tela desligada → áudio reduzido → desconexão. **Áudio nunca é sacrificado por vídeo.**
- **Os perfis de compartilhamento**, especialmente `contentHint: 'detail'` para código. É o detalhe que decide se compartilhar tela é útil ou irritante.
- **A marca LOOP** e os tokens visuais. O produto encolheu; a identidade não precisa encolher junto.

---

## 3. Arquitetura

```
        NAVEGADOR (Next.js)
              │
      ┌───────┴────────┐
      ▼                ▼
 /api/token       LiveKit Cloud
 (1 rota)            (SFU)
      │                │
      └── assina JWT ──┘
```

Duas peças. Uma rota de servidor. Nenhum banco obrigatório.

| Camada | Escolha |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind |
| Mídia | LiveKit Cloud + `@livekit/components-react` |
| Backend | **uma** Route Handler: `POST /api/token` |
| Auth | Supabase Auth (e-mail) — ou lista fixa de e-mails, se quiserem cortar ainda mais |
| Salas | array em `config/rooms.ts`, versionado no Git |
| Hospedagem | Vercel |

A lista de salas ser um arquivo de código é a simplificação mais agressiva e a mais defensável: para 5 pessoas, criar sala é um commit de uma linha. No dia em que isso incomodar, vira uma tabela — e só ela.

---

## 4. O backend inteiro

```ts
// app/api/token/route.ts
import { AccessToken } from 'livekit-server-sdk';
import { ROOMS } from '@/config/rooms';

export async function POST(req: Request) {
  const user = await getUser();                 // Supabase Auth (server)
  if (!user) return new Response('unauthorized', { status: 401 });

  const { room } = await req.json();
  if (!ROOMS.some(r => r.id === room))          // sala precisa existir na config
    return new Response('unknown room', { status: 404 });

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity: user.id, name: user.user_metadata.display_name }
  );

  at.addGrant({
    room,
    roomJoin: true,
    canPublish: true,        // áudio e tela
    canSubscribe: true,
    canPublishData: false,   // sem chat, sem dados
  });

  return Response.json({ token: await at.toJwt() });
}
```

`LIVEKIT_API_SECRET` nunca sai do servidor e nunca recebe prefixo `NEXT_PUBLIC_`. É o mesmo princípio do `service_role` das specs antigas: um segredo vazado é acesso total.

---

## 5. Estado, sem banco

| Pergunta | Quem responde |
|---|---|
| Quem está na sala? | `useParticipants()` do LiveKit |
| Quem está falando agora? | `isSpeaking` por participante |
| Fulano está mudo? | `isMicrophoneEnabled` |
| Alguém compartilhando tela? | track `Source.ScreenShare` na sala |
| Quantas pessoas em cada sala da lista? | `RoomServiceClient.listRooms()` no servidor, revalidado a cada ~10 s |

Nenhuma dessas informações precisa ser gravada. Se ninguém está na sala, não há estado a manter.

---

## 6. Interface

```
┌──────────────┬───────────────────────────────────┐
│  LOOP        │                                   │
│              │      ┌─────────────────────┐      │
│ ● geral   3  │      │   TELA COMPARTILHADA │      │
│ ○ foco    0  │      │                     │      │
│ ○ pausa   1  │      └─────────────────────┘      │
│              │                                   │
│              │   (A)  (B)  (C)   ← anéis pulsam  │
│──────────────│        quando a pessoa fala       │
│ 🎤  🖥️  ⏻    │                                   │
└──────────────┴───────────────────────────────────┘
```

- **Coluna esquerda:** salas com contagem de pessoas ao vivo. Um clique entra — sem tela de "entrar na chamada", sem confirmação. Entrar é o mesmo gesto de trocar de aba.
- **Palco:** se ninguém compartilha, só os avatares, grandes, centralizados. Se alguém compartilha, a tela ocupa tudo e os avatares viram uma tira lateral.
- **Barra inferior:** microfone, compartilhar tela, sair. Três botões. Push-to-talk como opção (tecla configurável).
- **Anel de fala** em volta do avatar de quem está falando. É a única animação que o produto precisa ter, e ela carrega toda a sensação de presença.

Ao clicar em compartilhar, perguntar o perfil antes de abrir o seletor do navegador:

| Perfil | Resolução | FPS | `contentHint` |
|---|---|---|---|
| Código / documento | 1080p | 5 | `detail` |
| Padrão | 720p | 30 | `motion` |
| Alta qualidade | 1080p | 30 | `motion` |

```ts
navigator.mediaDevices.getDisplayMedia({
  video: { frameRate: { ideal: fps }, width: { max: 1920 } },
  audio: { suppressLocalAudioPlayback: false },
  surfaceSwitching: 'include',
  selfBrowserSurface: 'exclude',   // evita o espelho infinito
});
```

---

## 7. Escopo aprovável

Está pronto quando, com 5 pessoas simultâneas:

- [ ] Entrar em uma sala leva menos de 2 segundos do clique ao primeiro áudio.
- [ ] Dá para falar por 30 minutos sem queda, eco ou atraso perceptível.
- [ ] Mute e push-to-talk respondem instantaneamente e o estado aparece para os outros.
- [ ] Compartilhar tela com código a 5 FPS deixa o texto legível.
- [ ] Duas pessoas compartilhando ao mesmo tempo não quebram o layout.
- [ ] Quem fecha a aba some da lista em poucos segundos.
- [ ] Ninguém sem login consegue token, nem para uma sala cujo nome adivinhou.

Fora daqui: gravação, transcrição, salas privadas com senha, mobile, desktop, chat.

---

## 8. Ordem de construção

| Etapa | Entrega |
|---|---|
| 1 | Projeto Next.js + login Supabase + página com lista de salas fixa |
| 2 | `/api/token` e conexão ao LiveKit — **duas pessoas se ouvem**. Este é o milestone que decide tudo |
| 3 | Avatares, anel de fala, mute, sair |
| 4 | Compartilhamento de tela com os três perfis e o layout de palco |
| 5 | Contagem de pessoas por sala, push-to-talk, supressão de ruído |
| 6 | Reconexão (ICE restart), degradação, teste com os 5 juntos por uma hora |

A etapa 2 vem antes de qualquer trabalho visual. Enquanto duas pessoas não se ouvem, layout é decoração de algo que não existe.

---

## 9. Custo

LiveKit Cloud cobra por participante-minuto e tem tier gratuito — para 5 pessoas em uso normal, o consumo tende a caber nele (confirme os valores atuais antes de assumir). Vercel e Supabase Auth, no free tier. Sem banco de dados, sem Redis, sem storage: **o custo fixo do produto é o domínio.**

---

## 10. A porta que fica aberta

Nada aqui impede o produto grande das specs originais:

- **Chat** entra depois como tabela no Supabase, ao lado — não por dentro. O LiveKit continua cuidando da mídia.
- **Salas dinâmicas** trocam `config/rooms.ts` por uma tabela `rooms` e uma consulta. Uma tabela, uma migração.
- **Permissões** já estão no lugar certo: os grants do token. Trocar `canPublish: true` por um cálculo de cargo é uma linha, não uma refatoração.
- **Desktop** (Tauri/Electron) reaproveita 100% da interface web.

O que esta versão compra é o direito de descobrir, em uma semana e não em dois meses, se vocês realmente ficam nessas salas.
