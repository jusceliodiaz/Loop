# LOOP — Stay in the Loop.

MVP web de comunidade em tempo real, para até 5 pessoas. Ver [LOOP_MASTER_SPEC.md](./LOOP_MASTER_SPEC.md) para a especificação completa de produto e arquitetura.

Stack: **Next.js (App Router) + TypeScript + Tailwind + Supabase (Auth/Postgres/Realtime) + LiveKit (voz/tela)**, deploy na **Vercel**.

## Setup

### 1. Criar o projeto no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** e rode o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql). Isso cria as tabelas (`profiles`, `servers`, `server_members`, `channels`, `messages`), as políticas de RLS e os triggers (perfil automático no signup, canal `general` automático ao criar um Space).
3. Em **Project Settings → Data API**, copie a `Project URL` e a `anon public key`.
4. Em **Authentication → Providers**, confirme que **Email** está habilitado (padrão).

### 2. Criar o projeto no LiveKit Cloud (voz + compartilhamento de tela)

1. Crie uma conta e um projeto em [cloud.livekit.io](https://cloud.livekit.io) (tier gratuito "Build" é suficiente para poucos usuários).
2. No dashboard do projeto, copie a **WebSocket URL** (`wss://SEU-PROJETO.livekit.cloud`), a **API Key** e o **API Secret**.

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `.env.local` com os valores copiados dos passos anteriores:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_LIVEKIT_URL=...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
```

Nunca use a `service_role key` do Supabase nem o `LIVEKIT_API_SECRET` no frontend — este último só é lido em server actions.

### 4. Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Você será redirecionado para `/login`.

## Fluxo do MVP

1. Crie uma conta em `/register` (username + e-mail + senha).
2. Ao entrar sem nenhum Space, você verá a tela para criar seu primeiro Space — isso já cria o canal `#general` automaticamente.
3. Como dono do Space, use o campo **"Adicionar pessoa"** (na coluna PEOPLE) para convidar os outros usuários pelo username deles — eles precisam ter uma conta criada primeiro em `/register`.
4. Use o formulário embaixo de **ROOMS** (só visível para o dono) para criar novas Rooms de texto ou de voz.
5. Abra duas janelas/navegadores logados com usuários diferentes no mesmo Space e envie mensagens no `#general` — elas devem aparecer em tempo real via Supabase Realtime.
6. Entre numa Room de voz (🔊) para testar áudio e compartilhamento de tela via LiveKit.

## Estrutura

```
/app
  (auth)/login, (auth)/register     — telas de autenticação
  (app)/                            — shell autenticado (rail de Spaces)
  (app)/space/[serverId]/[channelId] — Room de texto (chat) ou de voz (LiveKit)
  actions/                          — server actions (auth, Space, Room, membros, token LiveKit)
/components
  auth/, space/, chat/, live/
/lib/supabase
  client.ts, server.ts, middleware.ts — clientes Supabase (browser/server) e sessão
/types
  database.ts                       — tipos das tabelas
/supabase
  schema.sql                        — schema + RLS + triggers
proxy.ts                            — proteção de rotas (redireciona não autenticados)
```

## Próximos passos

Ver seção "FASE 2 — Depois da aprovação do MVP" em [LOOP_MASTER_SPEC.md](./LOOP_MASTER_SPEC.md): convites por link, cargos/permissões, DMs, reactions, reply, upload de arquivos, presença, câmera nas Live Rooms.
