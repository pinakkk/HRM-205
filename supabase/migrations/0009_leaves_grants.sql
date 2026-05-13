-- Ensure PostgREST (Supabase) roles can see and use the leaves table.
-- Without explicit GRANTs, PostgREST may report:
--   "Could not find the table 'public.leaves' in the schema cache"

begin;

-- Table may already exist from prior migrations.
create table if not exists public.leaves (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  type text not null check (type in ('casual','sick','earned','unpaid')),
  reason text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  approver_id uuid references public.users(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.leaves enable row level security;

-- Idempotent: re-create policies if missing.
drop policy if exists leaves_self_read on public.leaves;
create policy leaves_self_read on public.leaves
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists leaves_self_insert on public.leaves;
create policy leaves_self_insert on public.leaves
  for insert with check (user_id = auth.uid() and status = 'pending');

drop policy if exists leaves_admin_decide on public.leaves;
create policy leaves_admin_decide on public.leaves
  for update using (public.is_admin()) with check (public.is_admin());

-- PostgREST needs privileges to expose the table.
-- Keep access restricted via RLS policies.
grant select, insert, update on table public.leaves to authenticated;

-- Needed for bigserial/identity inserts.
grant usage, select on sequence public.leaves_id_seq to authenticated;

commit;
