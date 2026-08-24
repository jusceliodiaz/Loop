# LOOP — Stay in the Loop.

Salas de áudio sempre abertas com compartilhamento de tela, para até 5 pessoas. Ver [LOOP_SIMPLES_audio_e_tela.md](./LOOP_SIMPLES_audio_e_tela.md) para a especificação completa.

Stack: **Next.js (App Router) + TypeScript + Tailwind + LiveKit Cloud (áudio/tela) + Supabase Auth**, deploy na **Vercel**.

## Setup

### 1. Criar o projeto no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** e rode o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql). Isso cria a tabela `profiles`, as políticas de RLS e o trigger de perfil automático no signup.
3. Em **Project Settings → Data API**, copie a `Project URL` e a `anon public key`.
4. Em **Authentication → Providers**, confirme que **Email** está habilitado (padrão).

### 2. Criar o projeto no LiveKit Cloud

1. Crie um projeto em [cloud.livekit.io](https://cloud.livekit.io).
2. Em **Settings → Keys**, copie a `API Key`, `API Secret` e a `WebSocket URL` (formato `wss://<projeto>.livekit.cloud`).

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `.env.local` com os valores dos dois passos anteriores:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=wss://...
NEXT_PUBLIC_LIVEKIT_URL=wss://...
```

Nunca use a `service_role key` do Supabase nem o `LIVEKIT_API_SECRET` no frontend — ambos só existem no servidor.

### 4. Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Você será redirecionado para `/login`.

## Fluxo do MVP

1. Crie uma conta em `/register` (username + e-mail + senha).
2. Escolha uma sala na barra lateral (`geral`, `foco`, `pausa` — ver [`config/rooms.ts`](./config/rooms.ts)) e entre falando.
3. Abra duas janelas/navegadores logados com usuários diferentes na mesma sala para testar áudio e compartilhamento de tela.

## Estrutura

```
/app
  (auth)/login, (auth)/register  — telas de autenticação
  (app)/                         — shell autenticado (lista de salas)
  (app)/room/[roomId]            — palco de uma sala (áudio + tela)
  api/token                      — assina o AccessToken do LiveKit
  api/rooms                      — contagem de pessoas por sala (polling)
  actions/auth.ts                — server actions de login/signup/logout
/components
  auth/    — formulários de autenticação
  rooms/   — sidebar de salas, palco, avatares, compartilhamento de tela
/config
  rooms.ts — lista fixa de salas (versionada no Git)
/lib
  supabase/  — clientes Supabase (browser/server) e sessão
  livekit/   — RoomServiceClient (contagem de participantes)
/types
  database.ts — tipos das tabelas
/supabase
  schema.sql — schema + RLS + trigger (só `profiles`)
proxy.ts     — proteção de rotas (redireciona não autenticados)
```

## Próximos passos

Ver seção 10 de [LOOP_SIMPLES_audio_e_tela.md](./LOOP_SIMPLES_audio_e_tela.md): chat de texto, salas dinâmicas via tabela, permissões por cargo, cliente desktop.
