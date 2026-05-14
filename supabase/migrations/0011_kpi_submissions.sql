-- KPI achievement submissions: employees submit progress, admins approve/reject.
-- On approval, the corresponding kpi_assignments.achieved is updated.

begin;

create table if not exists public.kpi_submissions (
  id bigserial primary key,
  assignment_id bigint not null references public.kpi_assignments(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  achieved numeric not null,
  note text,
  evidence_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  decided_by uuid references public.users(id),
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz not null default now()
);

create index if not exists kpi_submissions_user_idx on public.kpi_submissions (user_id, created_at desc);
create index if not exists kpi_submissions_status_idx on public.kpi_submissions (status, created_at desc);
create index if not exists kpi_submissions_assignment_idx on public.kpi_submissions (assignment_id);

alter table public.kpi_submissions enable row level security;

-- Employees see their own submissions; admins see all.
create policy kpi_submissions_self_read on public.kpi_submissions
  for select using (user_id = auth.uid() or public.is_admin());

-- Employees can insert submissions only for themselves, and only against
-- an assignment that belongs to them.
create policy kpi_submissions_self_insert on public.kpi_submissions
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.kpi_assignments a
      where a.id = assignment_id and a.user_id = auth.uid()
    )
  );

-- Only admins may update (approve/reject); employees cannot modify after submit.
create policy kpi_submissions_admin_update on public.kpi_submissions
  for update using (public.is_admin()) with check (public.is_admin());

create policy kpi_submissions_admin_delete on public.kpi_submissions
  for delete using (public.is_admin());

-- PostgREST grants — match the pattern used for `leaves`.
grant usage on schema public to anon, authenticated;
grant select on table public.kpi_submissions to anon;
grant select, insert on table public.kpi_submissions to authenticated;
grant usage, select on sequence public.kpi_submissions_id_seq to authenticated;

commit;
