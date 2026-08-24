# LOOP — Stay in the Loop.

Documento único. Substitui `LOOP_MASTER_SPEC.md`, `plano_mvp_plataforma_comunidade_web.md`, `plataforma-comunidade-tempo-real-spec_1.md`, `LOOP_SIMPLES_audio_e_tela.md`, `LOOP_REVISAO.md` e `LOOP_PLANOS_E_BILLING.md` (arquivados no histórico do Git — nada foi perdido, só consolidado). `LOOP_PROXIMA_CAMADA_B2B.md` também foi arquivado, mas **não** foi incorporado aqui — é um pivô deliberadamente adiado (seção 17).

## 1. A ideia

Um espaço para um grupo (não mais fixo em ~5 pessoas — qualquer um pode entrar, mas alguém do grupo precisa aprovar): salas de **voz sempre abertas** com compartilhamento de tela, mais salas de **texto**. Voz e tela são o plano pago; texto é sempre grátis.

Não é um clone de Discord. É a fatia do Discord que um grupo pequeno realmente usa — agora com um jeito de cobrar por ela.

## 2. Como chegamos aqui

Três specs iniciais (arquivadas) desenhavam uma plataforma completa ao estilo Discord — hierarquia Space → Category → Room, cargos em bitfield, gateway próprio, chat como núcleo. Isso foi abandonado por um produto menor: voz e tela como núcleo, texto como coadjuvante. Depois o texto voltou (do jeito simples: uma tabela `messages` presa a um `room_id`, ao lado do LiveKit, não dentro dele), veio um selo PRO manual, depois billing real via Stripe, e uma revisão de segurança (`LOOP_REVISAO.md`) apontou que "autenticado" não era o mesmo que "aprovado pelo grupo" — o que puxou a reformulação atual: aprovação de membro, três planos, e todo o estado ao vivo (presença, minutos de tela) saindo do polling client-side e passando a viver no Postgres via webhooks do LiveKit.

O que sobrevive desde o início:

- **SFU gerenciado (LiveKit Cloud)**, não mesh WebRTC.
- **Permissão aplicada no servidor** — token do LiveKit, RLS do Postgres, nunca só escondida na UI.
- **Hierarquia de degradação**: FPS → resolução → tela desligada → áudio reduzido → desconexão. Áudio nunca é sacrificado por vídeo.
- **Perfis de compartilhamento de tela**, com `contentHint: 'detail'` para código.
- **A marca e os tokens visuais.**

Continua fora: snowflake IDs, cargos em bitfield, servers/channels, webcam, gateway próprio, microserviços, multi-tenant (seção 17).

## 3. Arquitetura

| Camada | Escolha |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind v4 |
| Mídia (voz/tela) | LiveKit Cloud + `@livekit/components-react`, webhooks para presença/consumo |
| Auth + dados | Supabase (Auth por e-mail, Postgres, RLS, Realtime) |
| Billing | Stripe (Checkout + Billing Portal + webhook) |
| Salas | tabela `rooms`, criável por qualquer membro aprovado |
| Hospedagem | Vercel |

```
        NAVEGADOR (Next.js)
              │
   ┌──────────┼───────────┐
   ▼          ▼           ▼
Supabase  LiveKit Cloud  Stripe
(auth,     (SFU: voz +   (Checkout,
 perfis,    tela) ──┐     Portal) ──┐
 planos,            │               │
 salas,              ▼               ▼
 mensagens,   /api/livekit/webhook  /api/stripe/webhook
 presença,    (presença, sessões,   (plano, status)
 sessões)      minutos de tela)
```

Nenhum estado de mídia ao vivo é lido do LiveKit por polling do navegador — os webhooks dele (seção 6) alimentam tabelas no Postgres, lidas via Realtime ou consulta direta. O mesmo vale para o plano: a Stripe é a fonte da verdade, o webhook dela é o único jeito (fora de uma admin action explícita) de mudar `subscriptions`.

## 4. Salas

Tabela `rooms` (`id` slug, `name`, `type: "voice" | "text"`, `created_by`), seed inicial em [`supabase/schema.sql`](./supabase/schema.sql): `geral`, `foco`, `pausa` (voz), `avisos`, `dúvidas`, `random` (texto). Qualquer membro **aprovado** (seção 8) cria uma nova pela sidebar ("Criar sala" → `app/actions/rooms.ts`); sem UI de apagar/editar ainda. [`lib/rooms.ts`](./lib/rooms.ts) busca e filtra por `type`.

Salas de voz aparecem cadeadas para quem está no plano Free (seção 9) — clicar abre o comparativo de planos em vez de navegar.

## 5. Voz e compartilhamento de tela

| Pergunta | Quem responde |
|---|---|
| Quem está na sala agora? (sidebar, lista de membros) | `voice_presence` no Postgres, lida via Realtime — não é mais polling do LiveKit |
| Quem está na sala, do ponto de vista de quem já está conectado nela | `useParticipants()` (LiveKit, ao vivo) |
| Quem está falando? | `isSpeaking` por participante |
| Alguém compartilhando tela agora? | track `Source.ScreenShare` (dentro da sala) / `room_sessions.share_started_at` (fora dela) |
| Quanto cada um já usou de compartilhamento de tela este mês? | `room_sessions.share_seconds`, somado pelo webhook do LiveKit |

Perfis de compartilhamento de tela (o Free não compartilha; Basic vai até "Padrão", Pro libera "Alta" — ver seção 9):

| Perfil | Resolução | FPS | `contentHint` |
|---|---|---|---|
| Código / documento | 1080p | 5 | `detail` |
| Padrão | 720p | 30 | `motion` |
| Alta qualidade | 1080p | 30 | `motion` |

`getDisplayMedia` também pede `audio: true` (áudio da aba/sistema, quando o navegador suporta), `surfaceSwitching: 'include'` e `selfBrowserSurface: 'exclude'` (evita o espelho infinito ao compartilhar a própria aba do LOOP).

**Limite de chamada e cota de tela — aplicados no servidor, não no cliente**: `/api/token` lê o plano do usuário (`subscriptions`, via [`lib/getPlan.ts`](./lib/getPlan.ts)), nega token (`402 plan_required`) se o plano não inclui voz, define o **TTL do JWT do LiveKit** como o `maxCallMinutes` do plano (o LiveKit corta a conexão sozinho quando expira — o contador no cliente, [`lib/useCallTimer.ts`](./lib/useCallTimer.ts), é só cosmético, espelhando o mesmo número), e monta `canPublishSources` **sem** `screen_share`/`screen_share_audio` se a cota mensal de horas já estourou ([`lib/roomSessions.ts`](./lib/roomSessions.ts) soma `room_sessions.share_seconds` do ciclo de cobrança atual). Esconder o botão de compartilhar não seria controle de acesso — por isso o botão fica desabilitado *e* o SFU recusaria a track de qualquer forma.

## 6. Webhook do LiveKit — presença e consumo

`POST /api/livekit/webhook` ([código](./app/api/livekit/webhook/route.ts)), verificado por assinatura (`WebhookReceiver`, mesma API key/secret do token — não precisa de segredo à parte), rota pública (listada em `PUBLIC_PATHS`). Substitui todo polling de `RoomServiceClient` que existia antes:

- `participant_joined` → abre uma linha em `room_sessions` e um upsert em `voice_presence`.
- `participant_left` → fecha a linha de `room_sessions` (soma qualquer compartilhamento em andamento antes de fechar) e apaga a linha de `voice_presence`.
- `track_published`/`track_unpublished` (fonte `screen_share`) → marca/soma o tempo de compartilhamento em `room_sessions.share_started_at`/`share_seconds`.
- `room_finished` → limpeza defensiva, fecha qualquer sessão que tenha ficado aberta.

`voice_presence` alimenta, via Supabase Realtime, a contagem de gente por sala na sidebar ([`lib/useVoicePresence.ts`](./lib/useVoicePresence.ts)) e o online/offline da lista de membros — nenhuma dessas telas mais chama a API do LiveKit. `room_sessions` alimenta o recap semanal em **horas** (não em número de entradas) na Home e a cota de compartilhamento de tela da seção 5.

## 7. Texto

Cada sala `text` (e, sobreposto, o chat de qualquer sala `voice`) renderiza um `ChatThread`: lista de mensagens + composer, Supabase Realtime (`postgres_changes`) para atualização ao vivo, autor edita/apaga a própria mensagem (RLS garante isso no banco). Tabela: `messages(id, room_id, user_id, content, created_at, edited_at)`.

**Não-lidas**: `room_reads(user_id, room_id, last_read_at)` — o cliente marca como lida ao abrir uma sala de texto e ao focar a aba (`MarkRoomRead`); a sidebar mostra a contagem de mensagens de outras pessoas desde então (`useUnreadCounts`). Enquanto a aba está em segundo plano, o título do documento ganha um contador de não-lidas (`UnreadTitleWatcher`) e volta ao normal quando a aba foca de novo.

## 8. Quem pode entrar: aprovação de membro

Cadastro por e-mail no Supabase Auth é aberto por padrão — **autenticado não é a mesma coisa que aprovado**. Toda linha nova de `profiles` nasce com `approved = false`; uma tela de espera ("Esperando aprovação") é o que a pessoa vê até um admin liberar. RLS em `rooms`, `messages`, `room_events` e nas outras linhas de `profiles` exige `is_member()` (uma função que confere `approved`); a única exceção é que todo mundo pode sempre ler a **própria** linha de `profiles`, aprovado ou não, senão nem o nome dele apareceria na tela de espera.

Quem se cadastra primeiro vira admin + aprovado automaticamente (bootstrap). A partir daí, um admin aprova pela lista de membros ("Aguardando aprovação", com botão "Aprovar").

## 9. Papéis e planos

**Papel** (`profiles.role`, `admin`/`member`) controla moderação: um admin pode promover/rebaixar outros, aprovar novos membros, e remover qualquer participante de uma chamada de voz em andamento (`UserX` na lista "Nesta sala" → `POST /api/rooms/[roomId]/kick`, que confere `role = 'admin'` no banco antes de chamar `RoomServiceClient.removeParticipant`).

**Plano** (`subscriptions.plan`, fonte única em [`config/plans.ts`](./config/plans.ts)) controla o que a conta pode fazer:

| | Free | Basic | Pro |
|---|---|---|---|
| Texto | sim | sim | sim |
| Voz | não | sim | sim |
| Compartilhar tela | não | sim (até "Padrão") | sim (até "Alta") |
| Horas de tela/mês | 0 | 10 | 100 |
| Minutos por chamada | 0 | 60 | 240 |
| Salas criadas | 3 | 5 | 50 |

Esses números vieram de uma estimativa de custo do LiveKit Cloud (compartilhamento de tela pesa **~20–75× mais banda que só voz** — o teto certo é em horas de tela, não em minutos de chamada) e precisam ser reconferidos contra as tarifas atuais antes de cobrar de alguém de verdade; nunca solte um plano "ilimitado" sem um teto por trás.

Como o plano muda:

- **Assinatura via Stripe** — o comparativo de planos (`PlanComparisonDialog`, aberto pelo card "Ver planos" na sidebar ou ao clicar numa sala de voz trancada) chama `POST /api/stripe/checkout` com o plano escolhido, cria/reaproveita um Stripe Customer, e devolve uma Checkout Session (`mode: subscription`). O webhook `POST /api/stripe/webhook` mantém `subscriptions` sincronizada com o status real (`active`/`trialing` → o plano vale; `past_due` → mantém acesso durante a janela de nova tentativa da Stripe, não corta no primeiro cartão recusado; `canceled` → volta para `free`), é **idempotente** (cada `event.id` só processa uma vez, via `processed_events`) e trata cada evento como o estado atual completo, nunca como um delta — a ordem de entrega da Stripe não é garantida. Quem já é assinante vê "Gerenciar assinatura" no lugar de "Assinar", que abre o Billing Portal da Stripe (`/api/stripe/portal`) — trocar cartão, cancelar, ver fatura, tudo do lado de lá.
- **Concessão manual por um admin** (`app/actions/admin.ts`, `adminSetPlan`) — para comps/testes, sem passar pela Stripe. Preserva qualquer vínculo Stripe já existente (não zera `stripe_customer_id` de quem já é assinante de verdade).

`subscriptions` (com `stripe_customer_id`, `current_period_end` etc.) só é legível pelo próprio dono — não é informação pública. Para o selo "PRO" aparecer no nome de **outras** pessoas (lista de membros, mensagens de chat), existe uma cópia só-leitura-pública em `profiles.plan`, mantida em sincronia pelo mesmo código que escreve em `subscriptions` (webhook, admin action) — nunca editável de nenhum outro jeito (a trigger `protect_profile_privileges` reverte qualquer tentativa fora do `service_role`).

## 10. Página `/demo`

Rota `app/(app)/demo/page.tsx`, atrás do login mas 100% com dados fictícios hardcoded. Não escreve no Supabase nem conecta ao LiveKit.

## 11. Interface e design system

Tema escuro, neutro-frio, com um acento âmbar quente para "ao vivo/falando" (`--live`) e um dourado (`--supporter`) reservado ao selo PRO/planos — exceção deliberada à regra de "um acento só".

- **Sidebar**: salas de voz (contagem ao vivo via Realtime, cadeado se o plano não inclui voz) e salas de texto (com badge de não-lidas), agrupadas.
- **Palco de voz**: avatares centralizados sem compartilhamento; tela em destaque + avatares numa tira quando alguém compartilha, com layout de "principal + miniaturas clicáveis" para múltiplas telas ao mesmo tempo. Anel de fala pulsando é a única animação essencial.
- **Home**: hero, recap semanal em horas (`ActivityCards`), últimas conversas de texto (`ConversationCards`), lista de pessoas (`PeopleCards`), membros online/offline (`HomeMembersPanel`).
- **Barra da chamada**: microfone (atalho `Ctrl/Cmd+Shift+M`, ignorado com foco em campo de texto), compartilhar tela (desabilitado com tooltip se o plano/cota não permite), chat, contagem regressiva do limite, sair.
- Luz ambiente (`--amb-1/2/3`) amostrada do vídeo compartilhado (ou do identity hash de quem fala); pausa quando a aba está em segundo plano e respeita `prefers-reduced-motion`.

## 12. Segurança

- `/api/token` valida a sala contra a tabela `rooms`, o plano do usuário e a cota de tela — nunca uma lista fixa em código.
- `is_member()` (aprovação) e `role = 'admin'` (moderação) são checados em RLS ou em código de servidor, nunca só na UI.
- RLS cobre `profiles`, `rooms`, `messages`, `room_events`, `room_sessions`, `voice_presence`, `room_reads` e `subscriptions`. `subscriptions` e as colunas Stripe/plano/aprovação/papel de `profiles` só são graváveis pelo `service_role` (webhooks, admin actions) — nunca por um cliente autenticado comum, admin incluído (a trigger `protect_profile_privileges` garante isso mesmo se uma policy for editada por engano).
- `LIVEKIT_API_SECRET`, `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` e a `service_role key` do Supabase só existem no servidor.
- Os webhooks (Stripe e LiveKit) confiam na própria assinatura, não em sessão Supabase — por isso estão em `PUBLIC_PATHS` no middleware.
- Testes de RLS em [`supabase/tests/rls_checks.sql`](./supabase/tests/rls_checks.sql) — **não rodados neste ambiente** (exige Supabase CLI + Postgres local); rode antes de confiar numa mudança de policy.

## 13. Setup

### Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. **SQL Editor** → rode [`supabase/schema.sql`](./supabase/schema.sql) (idempotente).
3. **Database → Replication** → ligue Realtime para `messages` e `voice_presence`.
4. **Project Settings → Data API** → copie `Project URL` e `anon public key`.
5. **Project Settings → API** → copie a `service_role key`.
6. **Authentication → Providers** → confirme **Email** habilitado, e que **confirmação de e-mail** está ligada (senão dá para se cadastrar com um endereço que não se controla).

### LiveKit Cloud

1. Crie um projeto em [cloud.livekit.io](https://cloud.livekit.io).
2. **Settings → Keys** → copie `API Key`, `API Secret`, `WebSocket URL`.
3. **Settings → Webhooks** → adicione `https://<seu-domínio>/api/livekit/webhook`. Sem segredo extra — ele assina com a mesma API key/secret do token.

### Stripe (billing de Basic/Pro)

1. **Product catalog** → crie dois produtos, cada um com um price recorrente mensal — copie os dois `price_...`.
2. **Developers → API keys** → copie a `Secret key`.
3. **Developers → Webhooks** → endpoint para `/api/stripe/webhook`, escutando `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Copie o `Signing secret`.
4. Local: `stripe listen --forward-to localhost:3000/api/stripe/webhook` (Stripe CLI) em vez de endpoint público; teste com o cartão `4242 4242 4242 4242`.

### GitHub Actions (operação)

`.github/workflows/keep-alive.yml` (evita o projeto Supabase Free pausar após uma semana sem tráfego) e `.github/workflows/backup.yml` (`pg_dump` semanal, artefato guardado 90 dias) precisam destes secrets no repositório: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (já públicas, sem problema) e `SUPABASE_DB_URL` (a connection string direta do Postgres — **essa sim é sensível**, pegue em Project Settings → Database → Connection string).

### Variáveis de ambiente

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=wss://...
NEXT_PUBLIC_LIVEKIT_URL=wss://...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_ID_BASIC=...
STRIPE_PRICE_ID_PRO=...
```

### Rodar localmente

```bash
npm install
npm run dev
```

## 14. Estrutura de pastas

```
/app
  (auth)/login, (auth)/register
  (app)/                         — shell autenticado; bloqueia com tela de espera se !approved
  (app)/room/[roomId]            — voz+tela (LiveKit) ou chat (texto)
  (app)/demo
  api/token                      — plano, cota de tela, TTL, canPublishSources
  api/livekit/webhook            — presença + room_sessions (seção 6)
  api/rooms/[roomId]/kick
  api/activity, api/members, api/conversations
  api/stripe/checkout, api/stripe/portal, api/stripe/webhook
  actions/auth.ts, actions/rooms.ts
  actions/admin.ts               — aprovar membro, promover/rebaixar, comp de plano
/components/rooms
  RoomSidebar, StageInner, ChatThread, MembersPanel, AppMembersList,
  PlanComparisonDialog, UpgradeCard, MarkRoomRead, UnreadTitleWatcher, …
/config
  plans.ts   — fonte única de free/basic/pro
  limits.ts  — só o aviso visual de "tempo acabando"
/lib
  supabase/  — clientes (browser/server/middleware/admin)
  livekit/   — RoomServiceClient (só para o kick, agora)
  rooms.ts, getPlan.ts, roomSessions.ts, roomReads.ts
  useVoicePresence.ts, useCallTimer.ts, appUser.tsx
  stripe.ts
/supabase
  schema.sql
  tests/rls_checks.sql
/.github/workflows
  keep-alive.yml, backup.yml
```

## 15. Escopo aprovável

- [x] `/api/token` valida sala, plano e cota antes de assinar qualquer coisa.
- [x] Limite de chamada é o TTL do próprio token, não um timer de UI.
- [x] Cadastro fechado por aprovação, não só por login.
- [x] Presença e consumo vêm de webhooks + Postgres, não de polling do LiveKit.
- [x] Mensagens de texto em tempo real, não-lidas, editar/apagar.
- [ ] Teste real com várias pessoas simultâneas por uma hora, sem queda perceptível.
- [ ] Testes de RLS (`supabase/tests/rls_checks.sql`) rodados de verdade contra um Supabase local.
- [ ] Fluxo de checkout/portal/webhook testado ponta-a-ponta em modo teste da Stripe.
- [ ] Números de `config/plans.ts` reconferidos contra a tarifa atual do LiveKit Cloud.

Fora do escopo atual: gravação, transcrição, salas privadas com senha, mobile nativo, desktop, multi-empresa (seção 17).

## 16. Próximos passos possíveis

- Editar/apagar sala (hoje só criação existe).
- E-mail de aviso em falha de renovação (a Stripe já manda o dela em modo live; nada próprio ainda).
- Deafen, troca de dispositivo de áudio sem sair da sala, atalho de push-to-talk configurável por tecla diferente por pessoa.

## 17. Pivô adiado: multi-empresa (`workspaces`)

`LOOP_PROXIMA_CAMADA_B2B.md` propõe reestruturar o produto inteiro em torno de `workspaces` (várias empresas, convites, canais e billing por workspace em vez de por usuário) — a mudança de "app privado de um grupo" para "SaaS B2B". Isso foi **conscientemente adiado**: reescreveria `rooms`/`messages`/`subscriptions`/papéis em torno de `workspace_id`, e o produto atual ainda não validou que vale esse investimento. Fica registrado aqui como direção possível, não como próximo passo.
