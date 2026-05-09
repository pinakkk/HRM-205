-- pgTAP RLS test suite for FairReward AI.
-- Run via Supabase CLI:  supabase test db
--
-- Validates blueprint §9 — that an employee can read their own rows but not
-- another employee's, and that admin policies remain unchanged.
--
-- Requires: pgtap extension (Supabase preinstalls it in `supabase test db`).

begin;

select plan(8);

-- Set up two synthetic auth users.
insert into auth.users (id, email, instance_id)
values
  ('00000000-0000-0000-0000-0000000000a1', 'alice@example.com', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-0000000000a2', 'bob@example.com',   '00000000-0000-0000-0000-000000000000')
on conflict (id) do nothing;

insert into public.users (id, email, full_name, role)
values
  ('00000000-0000-0000-0000-0000000000a1', 'alice@example.com', 'Alice', 'employee'),
  ('00000000-0000-0000-0000-0000000000a2', 'bob@example.com',   'Bob',   'employee')
on conflict (id) do nothing;

-- Insert a ledger row for each.
insert into public.rewards_ledger (user_id, kind, amount, reason, source)
values
  ('00000000-0000-0000-0000-0000000000a1', 'points', 100, 'Welcome bonus',  'manual'),
  ('00000000-0000-0000-0000-0000000000a2', 'points', 200, 'Welcome bonus',  'manual');

-- ─── Alice's POV ───
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);

select results_eq(
  $$ select count(*) from public.rewards_ledger where user_id = '00000000-0000-0000-0000-0000000000a1' $$,
  $$ values (1::bigint) $$,
  'Alice can read her own ledger row'
);

select results_eq(
  $$ select count(*) from public.rewards_ledger where user_id = '00000000-0000-0000-0000-0000000000a2' $$,
  $$ values (0::bigint) $$,
  'Alice cannot read Bob''s ledger row'
);

-- Alice cannot insert a ledger row for someone else.
select throws_ok(
  $$ insert into public.rewards_ledger (user_id, kind, amount, reason, source)
     values ('00000000-0000-0000-0000-0000000000a2', 'points', 1000, 'Sneaky', 'peer') $$,
  '42501',
  'new row violates row-level security policy for table "rewards_ledger"',
  'Alice cannot ledger-insert for Bob'
);

-- Alice can submit feedback for Bob.
select lives_ok(
  $$ insert into public.feedback (from_user_id, to_user_id, body)
     values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', 'Great job') $$,
  'Alice can submit feedback to Bob'
);

-- Alice cannot submit feedback as someone else.
select throws_ok(
  $$ insert into public.feedback (from_user_id, to_user_id, body)
     values ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a1', 'Spoofed') $$,
  '42501',
  'new row violates row-level security policy for table "feedback"',
  'Alice cannot spoof Bob as the sender'
);

-- ─── Bob's POV ───
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a2', true);

select results_eq(
  $$ select count(*) from public.feedback where to_user_id = '00000000-0000-0000-0000-0000000000a2' $$,
  $$ values (1::bigint) $$,
  'Bob can read feedback addressed to him'
);

select results_eq(
  $$ select count(*) from public.users where id <> '00000000-0000-0000-0000-0000000000a2' $$,
  $$ values (0::bigint) $$,
  'Bob cannot list other users'
);

-- ─── Admin role ───
update public.users set role = 'admin' where id = '00000000-0000-0000-0000-0000000000a1';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);

select cmp_ok(
  (select count(*) from public.rewards_ledger),
  '>=',
  2::bigint,
  'Admin can read every ledger row'
);

select * from finish();
rollback;
