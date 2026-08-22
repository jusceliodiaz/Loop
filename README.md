# LOOP — Stay in the Loop.

MVP web de comunidade em tempo real, para até 5 pessoas. Ver [LOOP_MASTER_SPEC.md](./LOOP_MASTER_SPEC.md) para a especificação completa de produto e arquitetura.

Stack: **Next.js (App Router) + TypeScript + Tailwind + Supabase (Auth/Postgres/Realtime)**, deploy na **Vercel**.

## Setup

### 1. Criar o projeto no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** e rode o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql). Isso cria as tabelas (`profiles`, `servers`, `server_members`, `channels`, `messages`), as políticas de RLS e os triggers (perfil automático no signup, canal `general` automático ao criar um Space).
3. Em **Project Settings → Data API**, copie a `Project URL` e a `anon public key`.
4. Em **Authentication → Providers**, confirme que **Email** está habilitado (padrão).

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `.env.local` com os valores copiados do passo anterior:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Nunca use a `service_role key` no frontend.

### 3. Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Você será redirecionado para `/login`.

## Fluxo do MVP

1. Crie uma conta em `/register` (username + e-mail + senha).
2. Ao entrar sem nenhum Space, você verá a tela para criar seu primeiro Space — isso já cria o canal `#general` automaticamente.
3. Convide os outros 4 usuários adicionando-os manualmente à tabela `server_members` pelo painel do Supabase (não há convite por link ainda — está fora do escopo do MVP, ver seção 11 da spec).
4. Abra duas janelas/navegadores logados com usuários diferentes no mesmo Space e envie mensagens — elas devem aparecer em tempo real via Supabase Realtime.

## Estrutura

```
/app
  (auth)/login, (auth)/register     — telas de autenticação
  (app)/                            — shell autenticado (rail de Spaces)
  (app)/space/[serverId]/[channelId] — Room com chat em tempo real
  actions/                          — server actions (auth, criação de Space)
/components
  auth/, space/, chat/
/lib/supabase
  client.ts, server.ts, middleware.ts — clientes Supabase (browser/server) e sessão
/types
  database.ts                       — tipos das tabelas
/supabase
  schema.sql                        — schema + RLS + triggers
proxy.ts                            — proteção de rotas (redireciona não autenticados)
```

## Próximos passos

Ver seção "FASE 2 — Depois da aprovação do MVP" em [LOOP_MASTER_SPEC.md](./LOOP_MASTER_SPEC.md): convites por link, cargos/permissões, DMs, reactions, reply, upload de arquivos, presença, voz/vídeo.
