-- LOOP schema — versão simples (áudio + tela) + chat de texto por sala
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).
--
-- Não há tabelas de servers/channels: as salas vivem em config/rooms.ts
-- (Git) e o estado de presença/fala vive no LiveKit. Mensagens ficam ao
-- lado, presas a um room_id de texto — sem hierarquia, sem cargos.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles are viewable by authenticated users" on profiles;
create policy "profiles are viewable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

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

-- One row per "entered a room" event, logged by /api/token on each join.
-- This is the only history LOOP keeps — enough to recap the week without
-- reintroducing chat, files, or any other persistent state.
create table if not exists room_events (
  id bigint generated always as identity primary key,
  room_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists room_events_created_at_idx on room_events (created_at desc);

alter table room_events enable row level security;

drop policy if exists "room_events are viewable by authenticated users" on room_events;
create policy "room_events are viewable by authenticated users"
  on room_events for select
  to authenticated
  using (true);

drop policy if exists "users can log their own room events" on room_events;
create policy "users can log their own room events"
  on room_events for insert
  to authenticated
  with check (auth.uid() = user_id);

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

-- Text chat, scoped to a room_id (matches config/rooms.ts). No channels,
-- no threads, no tombstones — just messages, editable/deletable by their author.
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
create policy "messages are viewable by authenticated users"
  on messages for select
  to authenticated
  using (true);

drop policy if exists "users can send messages" on messages;
create policy "users can send messages"
  on messages for insert
  to authenticated
  with check (auth.uid() = user_id);

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

-- Realtime for `messages` is NOT enabled here — `alter publication` in the
-- SQL editor can deadlock against Supabase's own realtime worker. Enable it
-- instead via Dashboard → Database → Replication → toggle "messages" on.
