-- LOOP MVP schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).

-- ══════════════════════════════════════════════════════════════════════════
-- TABLES (created first, so later RLS policies can reference any of them)
-- ══════════════════════════════════════════════════════════════════════════

-- ── profiles ────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ── servers ─────────────────────────────────────────────────────────────
create table if not exists servers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ── server_members ──────────────────────────────────────────────────────
create table if not exists server_members (
  server_id uuid not null references servers(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (server_id, user_id)
);

-- ── channels ────────────────────────────────────────────────────────────
create table if not exists channels (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references servers(id) on delete cascade,
  name text not null,
  type text not null default 'text' check (type = 'text'),
  created_at timestamptz not null default now()
);

-- ── messages ────────────────────────────────────────────────────────────
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 4000),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create index if not exists messages_channel_idx on messages (channel_id, created_at);

-- ══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════════

alter table profiles enable row level security;
alter table servers enable row level security;
alter table server_members enable row level security;
alter table channels enable row level security;
alter table messages enable row level security;

-- ── profiles ────────────────────────────────────────────────────────────
create policy "profiles are viewable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

create policy "users can insert their own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "users can update their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- ── servers ─────────────────────────────────────────────────────────────
create policy "members can view their servers"
  on servers for select
  to authenticated
  using (
    exists (
      select 1 from server_members
      where server_members.server_id = servers.id
        and server_members.user_id = auth.uid()
    )
  );

create policy "authenticated users can create a server"
  on servers for insert
  to authenticated
  with check (auth.uid() = owner_id);

-- ── server_members ──────────────────────────────────────────────────────
create policy "members can view membership of their servers"
  on server_members for select
  to authenticated
  using (
    exists (
      select 1 from server_members sm
      where sm.server_id = server_members.server_id
        and sm.user_id = auth.uid()
    )
  );

create policy "server owner can add members"
  on server_members for insert
  to authenticated
  with check (
    exists (
      select 1 from servers
      where servers.id = server_members.server_id
        and servers.owner_id = auth.uid()
    )
    or auth.uid() = user_id -- allow self-join via invite, MVP only
  );

-- ── channels ────────────────────────────────────────────────────────────
create policy "members can view channels of their servers"
  on channels for select
  to authenticated
  using (
    exists (
      select 1 from server_members
      where server_members.server_id = channels.server_id
        and server_members.user_id = auth.uid()
    )
  );

-- ── messages ────────────────────────────────────────────────────────────
create policy "members can view messages of their servers"
  on messages for select
  to authenticated
  using (
    exists (
      select 1 from channels
      join server_members on server_members.server_id = channels.server_id
      where channels.id = messages.channel_id
        and server_members.user_id = auth.uid()
    )
  );

create policy "members can send messages"
  on messages for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from channels
      join server_members on server_members.server_id = channels.server_id
      where channels.id = messages.channel_id
        and server_members.user_id = auth.uid()
    )
  );

create policy "users can edit their own messages"
  on messages for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete their own messages"
  on messages for delete
  to authenticated
  using (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════════════════
-- TRIGGERS / FUNCTIONS
-- ══════════════════════════════════════════════════════════════════════════

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

-- add the owner as a member automatically when a server is created
create or replace function public.handle_new_server()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.server_members (server_id, user_id, role)
  values (new.id, new.owner_id, 'owner');

  insert into public.channels (server_id, name, type)
  values (new.id, 'general', 'text');

  return new;
end;
$$;

drop trigger if exists on_server_created on servers;
create trigger on_server_created
  after insert on servers
  for each row execute function public.handle_new_server();

-- ══════════════════════════════════════════════════════════════════════════
-- REALTIME
-- ══════════════════════════════════════════════════════════════════════════

alter publication supabase_realtime add table messages;
