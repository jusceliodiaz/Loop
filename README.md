# LOOP — Stay in the Loop.

Salas de voz sempre abertas com compartilhamento de tela (planos Basic/Pro), mais salas de texto sempre grátis. Novos cadastros esperam aprovação de um admin. Ver [LOOP.md](./LOOP.md) para a especificação completa.

Stack: **Next.js (App Router) + TypeScript + Tailwind + LiveKit Cloud (áudio/tela) + Supabase (Auth, Postgres, Realtime) + Stripe (billing)**, deploy na **Vercel**.

## Setup

### 1. Criar o projeto no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** e rode o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql). Cria `profiles`, `rooms`, `messages`, `room_events`, `subscriptions`, `processed_events`, `room_sessions`, `voice_presence`, `room_reads`, RLS e triggers.
3. Em **Database → Replication**, ligue Realtime para `messages` e `voice_presence`.
4. Em **Project Settings → Data API**, copie a `Project URL` e a `anon public key`.
5. Em **Project Settings → API**, copie a `service_role key` (só vai pro `.env.local`, nunca pro frontend).
6. Em **Authentication → Providers**, confirme que **Email** está habilitado e que a confirmação de e-mail está ligada.

### 2. Criar o projeto no LiveKit Cloud

1. Crie um projeto em [cloud.livekit.io](https://cloud.livekit.io).
2. Em **Settings → Keys**, copie a `API Key`, `API Secret` e a `WebSocket URL` (formato `wss://<projeto>.livekit.cloud`).
3. Em **Settings → Webhooks**, adicione `https://<seu-domínio>/api/livekit/webhook` — sem segredo extra, ele assina com a mesma API key/secret.

### 3. Criar os produtos no Stripe (billing de Basic/Pro)

1. Em **Product catalog**, crie **dois** produtos com price recorrente mensal — copie os dois `price_...`.
2. Em **Developers → API keys**, copie a `Secret key`.
3. Em **Developers → Webhooks**, crie um endpoint para `/api/stripe/webhook` escutando `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` e `invoice.payment_failed`, e copie o `Signing secret`. Em desenvolvimento, use `stripe listen --forward-to localhost:3000/api/stripe/webhook` em vez de cadastrar um endpoint.

### 4. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `.env.local` com os valores dos passos anteriores:

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

Nunca use a `service_role key` do Supabase, o `LIVEKIT_API_SECRET` nem o `STRIPE_SECRET_KEY` no frontend — todos só existem no servidor.

### 5. GitHub Actions (opcional, mas recomendado antes de deixar o app parado por semanas)

`.github/workflows/keep-alive.yml` e `backup.yml` precisam de secrets no repositório: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_DB_URL` (connection string direta do Postgres, em Project Settings → Database — essa é sensível).

### 6. Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Você será redirecionado para `/login`.

## Fluxo do MVP

1. Crie uma conta em `/register`. A primeira conta criada no banco vira admin automaticamente; todas as próximas ficam numa tela de espera até um admin aprovar (lista de membros → "Aguardando aprovação").
2. Sem plano pago, só as salas de texto abrem — salas de voz aparecem cadeadas na sidebar; clicar abre o comparativo de planos.
3. Assine Basic ou Pro (Stripe Checkout, modo teste aceita o cartão `4242 4242 4242 4242`) para liberar voz e compartilhamento de tela, dentro dos limites do plano.
4. Escolha uma sala na barra lateral, ou crie uma nova pelo botão "Criar sala".
5. Dê uma olhada em `/demo` para ver o app com dados fictícios, sem gastar cota de LiveKit/Supabase/Stripe.

## Estrutura

```
/app
  (auth)/login, (auth)/register
  (app)/                         — shell autenticado; tela de espera se a conta não foi aprovada
  (app)/room/[roomId]            — voz+tela (LiveKit) ou chat (texto), conforme a sala
  (app)/demo                     — prévia com dados fictícios
  api/token                      — plano, cota de tela, TTL do token, canPublishSources
  api/livekit/webhook            — presença + duração de sessão + minutos de tela
  api/rooms/[roomId]/kick, api/activity, api/members, api/conversations
  api/stripe/checkout, api/stripe/portal, api/stripe/webhook
  actions/auth.ts, actions/rooms.ts
  actions/admin.ts               — aprovar membro, promover/rebaixar, comp de plano
/components
  auth/    — formulários de autenticação
  rooms/   — sidebar, palco de voz, chat, membros, planos, upgrade card, demo
/config
  plans.ts   — fonte única de free/basic/pro
  limits.ts  — só o aviso visual de "tempo acabando"
/lib
  supabase/  — clientes Supabase (browser/server/middleware/admin)
  livekit/   — RoomServiceClient (usado só pelo kick agora)
  rooms.ts, getPlan.ts, roomSessions.ts, roomReads.ts
  useVoicePresence.ts, useCallTimer.ts, appUser.tsx, stripe.ts
/types
  database.ts — tipos das tabelas
/supabase
  schema.sql — schema completo + RLS + triggers
  tests/rls_checks.sql — asserções de RLS (não rodadas neste ambiente — exige Supabase CLI local)
/.github/workflows
  keep-alive.yml, backup.yml
```

## Próximos passos

Ver seção 16 de [LOOP.md](./LOOP.md): editar/apagar sala, e-mail de aviso de falha de pagamento, deafen. Seção 17 registra um pivô multi-empresa deliberadamente adiado.
