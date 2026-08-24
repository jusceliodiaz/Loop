-- LOOP schema — voz/tela + chat de texto por sala, com planos pagos
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).
--
-- Não há tabelas de servers/channels: as salas vivem na tabela `rooms`
-- e o estado ao vivo (quem fala, quem compartilha) vive no LiveKit —
-- webhooks dele alimentam `voice_presence` e `room_sessions` aqui.
-- Papéis são só admin/member — sem cargos customizados nem bitfield.
-- Planos (free/basic/pro) vivem em `subscriptions`, separada de `profiles`,
-- e só o webhook da Stripe (ou uma admin action de comp) escreve nela.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  created_at timestamptz not null default now()
);

-- Role: 'admin' can manage other members' role/approval and remove
-- someone from a live voice room. Everyone else is 'member'.
alter table profiles add column if not exists role text not null default 'member' check (role in ('admin', 'member'));

-- Approval gate: Supabase Auth's Email provider is open signup by default,
-- so "authenticated" alone doesn't mean "part of this group". A brand new
-- signup is unapproved until an admin flips this — RLS below requires it
-- everywhere. Only fires the grandfather backfill the first time the column
-- is added, so re-running this script never re-approves someone an admin
-- deliberately revoked later.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'approved'
  ) then
    alter table profiles add column approved boolean not null default false;
    update profiles set approved = true; -- grandfather everyone who already had a profile
  end if;
end $$;

-- Drop the old single-tier supporter flag and its Stripe linkage — both
-- move to `subscriptions` below, which supports three plans instead of a
-- boolean, and is locked to service-role writes only (no admin escape hatch
-- via direct profile edits).
alter table profiles drop column if exists is_supporter;
alter table profiles drop column if exists stripe_customer_id;
alter table profiles drop column if exists stripe_subscription_id;

-- Denormalized copy of `subscriptions.plan`, kept in sync by whatever
-- writes there (the Stripe webhook, the admin comp action) — purely so
-- other members can see someone's "PRO" badge on their name/messages
-- without `subscriptions` (which also holds Stripe customer/period data)
-- needing to be readable by anyone but its own owner. `subscriptions`
-- stays the source of truth for anything billing-enforcement related
-- (/api/token reads it directly); this column is display-only.
alter table profiles add column if not exists plan text not null default 'free' check (plan in ('free', 'basic', 'pro'));

-- Belt and suspenders: a non-admin editing their OWN row (allowed, e.g. to
-- change display_name) must not also be able to flip their own role or
-- approve themselves in that same request.
--
-- This has to be (re)created BEFORE the bootstrap update below — a trigger
-- from a previous run of this script is still attached to the table at
-- this point, and if its old body references a column just dropped above
-- (is_supporter, in an earlier version of this schema), that update would
-- fail with "record old has no field ...". Redefining the function and
-- reattaching the trigger here, ahead of any UPDATE, guarantees whatever
-- fires next runs the current version.
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Trusted callers this guard doesn't apply to: the service-role client
  -- (auth.role() = 'service_role'), and anything running straight against
  -- Postgres with no Supabase Auth session at all — the SQL Editor, a
  -- migration, `psql` — which never has a JWT, so auth.uid() is null. A
  -- real `authenticated` request always carries a `sub` claim; the only way
  -- to reach this trigger with auth.uid() null is already a direct,
  -- privileged database connection.
  if auth.role() = 'service_role' or auth.uid() is null then
    return new;
  end if;

  if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    new.role := old.role;
    new.approved := old.approved;
  end if;

  new.plan := old.plan;

  return new;
end;
$$;

drop trigger if exists protect_profile_privileges on profiles;
create trigger protect_profile_privileges
  before update on profiles
  for each row execute function public.protect_profile_privileges();

-- Bootstrap: whoever signed up first is admin + approved, so there's always
-- at least one admin able to approve everyone else. Safe to re-run.
update profiles set role = 'admin', approved = true
where id = (select id from profiles order by created_at asc limit 1);

alter table profiles enable row level security;

-- is_member(): the gate every other table's RLS is built on. security definer
-- so it can read `profiles` regardless of the caller's own row visibility
-- (avoids recursive-RLS surprises), and stable so Postgres can cache it
-- within a statement.
create or replace function public.is_member()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select approved from profiles where id = auth.uid()), false);
$$;

drop policy if exists "profiles are viewable by authenticated users" on profiles;
create policy "profiles are viewable by members"
  on profiles for select
  to authenticated
  using (public.is_member());

-- A brand new, not-yet-approved signup still needs to read its OWN row —
-- to render its name and see its own pending status — even though it can't
-- see anyone else's yet. SELECT policies are OR'd, so this only ever widens
-- what the members policy above already allows.
drop policy if exists "users can read their own profile" on profiles;
create policy "users can read their own profile"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "users can insert their own profile" on profiles;
create policy "users can insert their own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "users can update their own profile" on profiles;
create policy "users can update their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- Admins can update any profile (needed to approve new members and
-- grant/revoke role on someone else's row — the policy above only covers your own).
drop policy if exists "admins can update any profile" on profiles;
create policy "admins can update any profile"
  on profiles for update
  to authenticated
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Rooms live in a table so anyone approved can create one from the UI.
-- Voice rooms are LiveKit room names; text rooms are just a room_id for `messages`.
create table if not exists rooms (
  id text primary key,
  name text not null,
  type text not null check (type in ('voice', 'text')),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table rooms enable row level security;

drop policy if exists "rooms are viewable by authenticated users" on rooms;
create policy "rooms are viewable by members"
  on rooms for select
  to authenticated
  using (public.is_member());

drop policy if exists "authenticated users can create rooms" on rooms;
create policy "members can create rooms"
  on rooms for insert
  to authenticated
  with check (public.is_member() and auth.uid() = created_by);

-- Seed: the original fixed set, so existing links keep working.
insert into rooms (id, name, type) values
  ('geral', 'geral', 'voice'),
  ('foco', 'foco', 'voice'),
  ('pausa', 'pausa', 'voice'),
  ('avisos', 'avisos', 'text'),
  ('duvidas', 'dúvidas', 'text'),
  ('random', 'random', 'text')
on conflict (id) do nothing;

-- Plan/billing state. One row per user; a missing row means "free" (the
-- app defaults to that in code, no need to insert one per signup). Only the
-- service-role client writes here — no insert/update/delete policy for
-- `authenticated` at all. That's deliberate: the Stripe webhook is the only
-- thing that should ever change someone's plan, plus a narrow admin server
-- action (app/actions/admin.ts) that also uses the service-role client for
-- comped accounts, gated by checking the caller's own role first in trusted
-- server code — never by an RLS policy a client could exercise directly.
create table if not exists subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'basic', 'pro')),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table subscriptions enable row level security;

drop policy if exists "users can read their own subscription" on subscriptions;
create policy "users can read their own subscription"
  on subscriptions for select
  to authenticated
  using (user_id = auth.uid());

-- Stripe event ids already processed, so a retried webhook delivery is a
-- no-op instead of reprocessing (Stripe resends on anything but a fast 200).
create table if not exists processed_events (
  id text primary key,
  created_at timestamptz not null default now()
);

-- One row per "entered a room" event, logged by /api/token on each join.
create table if not exists room_events (
  id bigint generated always as identity primary key,
  room_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists room_events_created_at_idx on room_events (created_at desc);

alter table room_events enable row level security;

drop policy if exists "room_events are viewable by authenticated users" on room_events;
create policy "room_events are viewable by members"
  on room_events for select
  to authenticated
  using (public.is_member());

drop policy if exists "users can log their own room events" on room_events;
create policy "users can log their own room events"
  on room_events for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Voice session history, filled in by the LiveKit webhook (service-role
-- only — no client write policy). started_at/ended_at give the weekly recap
-- real hours instead of a join count; share_seconds (accumulated from
-- track_published/unpublished on the screen_share source) is what the plan
-- quota in /api/token checks against. share_started_at is a scratch column:
-- set while a share is in progress, folded into share_seconds and cleared
-- when it stops (or when the participant leaves mid-share).
create table if not exists room_sessions (
  id bigint generated always as identity primary key,
  room_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  share_seconds int not null default 0,
  share_started_at timestamptz
);

create index if not exists room_sessions_user_period_idx on room_sessions (user_id, started_at desc);
create index if not exists room_sessions_open_idx on room_sessions (room_id, user_id) where ended_at is null;

alter table room_sessions enable row level security;

drop policy if exists "room_sessions are viewable by members" on room_sessions;
create policy "room_sessions are viewable by members"
  on room_sessions for select
  to authenticated
  using (public.is_member());

-- Live "who's in this voice room" — replaces polling LiveKit's
-- RoomServiceClient from the browser. Filled in by the webhook; read via
-- Supabase Realtime (enable it below, same as `messages`).
create table if not exists voice_presence (
  room_id text not null references rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

alter table voice_presence enable row level security;

drop policy if exists "voice_presence is viewable by members" on voice_presence;
create policy "voice_presence is viewable by members"
  on voice_presence for select
  to authenticated
  using (public.is_member());

-- Unread tracking for text rooms: last time each user looked at each room.
-- No trigger needed — the client upserts its own row on open/focus, and RLS
-- only lets it touch its own.
create table if not exists room_reads (
  user_id uuid not null references auth.users(id) on delete cascade,
  room_id text not null references rooms(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (user_id, room_id)
);

alter table room_reads enable row level security;

drop policy if exists "users manage their own reads" on room_reads;
create policy "users manage their own reads"
  on room_reads for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- One-time cleanup: an older `messages` table from the abandoned
-- servers/channels model (channel_id-based) may still exist. Replace it —
-- this only fires once; a room_id-shaped table has no channel_id, so the
-- condition is false on every later run.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'messages' and column_name = 'channel_id'
  ) then
    drop table if exists messages cascade;
  end if;
end $$;

-- Text chat, scoped to a room_id. No channels, no threads, no tombstones —
-- just messages, editable/deletable by their author.
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  user_id uuid not null references profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 4000),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create index if not exists messages_room_idx on messages (room_id, created_at);

alter table messages enable row level security;

drop policy if exists "messages are viewable by authenticated users" on messages;
create policy "messages are viewable by members"
  on messages for select
  to authenticated
  using (public.is_member());

drop policy if exists "users can send messages" on messages;
create policy "users can send messages"
  on messages for insert
  to authenticated
  with check (public.is_member() and auth.uid() = user_id);

drop policy if exists "users can edit their own messages" on messages;
create policy "users can edit their own messages"
  on messages for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users can delete their own messages" on messages;
create policy "users can delete their own messages"
  on messages for delete
  to authenticated
  using (auth.uid() = user_id);

-- Realtime is NOT enabled here for `messages` or `voice_presence` —
-- `alter publication` in the SQL editor can deadlock against Supabase's own
-- realtime worker. Enable both manually via Dashboard → Database →
-- Replication → toggle "messages" and "voice_presence" on.
