-- RLS assertions for LOOP. RLS is the entire authorization model here —
-- there's no second layer — so a policy edited by accident should fail
-- loudly, not silently open the database.
--
-- How to run:
--   1. `supabase start` (Supabase CLI, local Docker stack) against a copy
--      of schema.sql already applied.
--   2. `psql "$(supabase status -o json | jq -r .DB_URL)" -f supabase/tests/rls_checks.sql`
--   3. No output = every assertion passed. Any `RAISE EXCEPTION` aborts the
--      script and prints which check failed.
--
-- This has NOT been run in this environment (no local Postgres/Supabase CLI
-- available here) — run it yourself before trusting it, and before relying
-- on any RLS policy change going forward.
--
-- Simulates three identities the way Supabase's own PostgREST layer does:
-- `set local role` picks the Postgres role (authenticated/anon), and
-- `request.jwt.claims` is what auth.uid() reads `sub` from.

begin;

-- Fixture users. `on conflict do nothing` so this is safe to re-run.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'member@test.local'),
  ('00000000-0000-0000-0000-000000000002', 'pending@test.local')
on conflict (id) do nothing;

insert into public.profiles (id, username, display_name, approved, role) values
  ('00000000-0000-0000-0000-000000000001', 'member_test', 'Member Test', true, 'member'),
  ('00000000-0000-0000-0000-000000000002', 'pending_test', 'Pending Test', false, 'member')
on conflict (id) do update set approved = excluded.approved, role = excluded.role;

insert into public.messages (id, room_id, user_id, content) values
  ('00000000-0000-0000-0000-0000000000f1', 'geral', '00000000-0000-0000-0000-000000000001', 'seed message')
on conflict (id) do nothing;

-- 1. Anonymous (no session at all) sees nothing.
set local role anon;
reset "request.jwt.claims";
do $$
begin
  if (select count(*) from public.messages) <> 0 then
    raise exception 'FAIL: anon can read messages';
  end if;
  if (select count(*) from public.profiles) <> 0 then
    raise exception 'FAIL: anon can read profiles';
  end if;
  if (select count(*) from public.rooms) <> 0 then
    raise exception 'FAIL: anon can read rooms';
  end if;
end $$;
reset role;

-- 2. An authenticated-but-not-approved user (signed up, nobody approved
--    them yet) can see their OWN profile row, but nothing shared.
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "00000000-0000-0000-0000-000000000002"}';
do $$
begin
  if (select count(*) from public.profiles where id = '00000000-0000-0000-0000-000000000002') <> 1 then
    raise exception 'FAIL: unapproved user cannot read their own profile row';
  end if;
  if (select count(*) from public.profiles where id <> '00000000-0000-0000-0000-000000000002') <> 0 then
    raise exception 'FAIL: unapproved user can read OTHER profiles';
  end if;
  if (select count(*) from public.messages) <> 0 then
    raise exception 'FAIL: unapproved user can read messages';
  end if;
  if (select count(*) from public.rooms) <> 0 then
    raise exception 'FAIL: unapproved user can read rooms';
  end if;
end $$;

-- ...and cannot approve themselves.
update public.profiles set approved = true where id = '00000000-0000-0000-0000-000000000002';
do $$
begin
  if (select approved from public.profiles where id = '00000000-0000-0000-0000-000000000002') then
    raise exception 'FAIL: unapproved user was able to self-approve';
  end if;
end $$;
reset role;
reset "request.jwt.claims";

-- 3. An approved member sees shared data, and can send a message as
--    themselves but not impersonate someone else.
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "00000000-0000-0000-0000-000000000001"}';
do $$
begin
  if (select count(*) from public.messages where room_id = 'geral') = 0 then
    raise exception 'FAIL: approved member cannot read messages';
  end if;
  if (select count(*) from public.rooms) = 0 then
    raise exception 'FAIL: approved member cannot read rooms';
  end if;
end $$;

insert into public.messages (room_id, user_id, content) values ('geral', '00000000-0000-0000-0000-000000000001', 'own message ok');

do $$
begin
  begin
    insert into public.messages (room_id, user_id, content)
    values ('geral', '00000000-0000-0000-0000-000000000002', 'impersonation attempt');
    raise exception 'FAIL: member inserted a message as a different user_id';
  exception
    when insufficient_privilege or others then
      null; -- expected: RLS with_check rejects this
  end;
end $$;

-- ...and cannot grant themselves admin.
update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-000000000001';
do $$
begin
  if (select role from public.profiles where id = '00000000-0000-0000-0000-000000000001') = 'admin' then
    raise exception 'FAIL: member was able to self-promote to admin';
  end if;
end $$;

-- ...and cannot write to subscriptions at all (service-role-only table).
do $$
begin
  begin
    insert into public.subscriptions (user_id, plan) values ('00000000-0000-0000-0000-000000000001', 'pro');
    raise exception 'FAIL: authenticated user inserted into subscriptions';
  exception
    when insufficient_privilege or others then
      null; -- expected
  end;
end $$;

reset role;
reset "request.jwt.claims";

do $$
begin
  raise notice 'All RLS checks passed.';
end $$;

rollback; -- never commit the fixtures
