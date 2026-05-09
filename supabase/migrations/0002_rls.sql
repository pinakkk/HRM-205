-- ─────────────────────────────────────────────────────────────
-- 0002_rls.sql — row-level security policies
-- ─────────────────────────────────────────────────────────────

alter table public.users           enable row level security;
alter table public.attendance      enable row level security;
alter table public.kpis            enable row level security;
alter table public.kpi_assignments enable row level security;
alter table public.feedback        enable row level security;
alter table public.badges          enable row level security;
alter table public.user_badges     enable row level security;
alter table public.allocation_cycles enable row level security;
alter table public.rewards_ledger  enable row level security;
alter table public.catalog_items   enable row level security;
alter table public.redemptions     enable row level security;
alter table public.audit_log       enable row level security;
alter table public.audit_findings  enable row level security;

-- ─── helper: is_admin() ───────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ─── users ────────────────────────────────────────────
create policy users_self_read on public.users
  for select using (id = auth.uid() or public.is_admin());

create policy users_self_update on public.users
  for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.users where id = auth.uid()));

create policy users_admin_all on public.users
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── attendance ───────────────────────────────────────
create policy attendance_self_read on public.attendance
  for select using (user_id = auth.uid() or public.is_admin());

create policy attendance_self_insert on public.attendance
  for insert with check (user_id = auth.uid());

-- ─── kpis (catalog) ───────────────────────────────────
create policy kpis_read_all on public.kpis
  for select using (auth.uid() is not null);

create policy kpis_admin_write on public.kpis
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── kpi_assignments ──────────────────────────────────
create policy kpi_assignments_self_read on public.kpi_assignments
  for select using (user_id = auth.uid() or public.is_admin());

create policy kpi_assignments_self_progress on public.kpi_assignments
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy kpi_assignments_admin_write on public.kpi_assignments
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── feedback ─────────────────────────────────────────
create policy feedback_visible on public.feedback
  for select using (
    to_user_id = auth.uid() or from_user_id = auth.uid() or public.is_admin()
  );

create policy feedback_insert_own on public.feedback
  for insert with check (from_user_id = auth.uid());

-- ─── badges (catalog) ─────────────────────────────────
create policy badges_read_all on public.badges
  for select using (auth.uid() is not null);

create policy badges_admin_write on public.badges
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── user_badges ──────────────────────────────────────
create policy user_badges_self_read on public.user_badges
  for select using (user_id = auth.uid() or public.is_admin());

create policy user_badges_admin_write on public.user_badges
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── allocation_cycles ────────────────────────────────
create policy allocation_cycles_read on public.allocation_cycles
  for select using (auth.uid() is not null);

create policy allocation_cycles_admin_write on public.allocation_cycles
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── rewards_ledger (append-only) ─────────────────────
create policy ledger_self_read on public.rewards_ledger
  for select using (user_id = auth.uid() or public.is_admin());

-- peers can insert kudos referencing their own from-id; admins everything else
create policy ledger_admin_insert on public.rewards_ledger
  for insert with check (
    public.is_admin()
    or (source = 'peer' and awarded_by = auth.uid())
  );

-- no updates/deletes — append-only

-- ─── catalog_items ────────────────────────────────────
create policy catalog_items_read on public.catalog_items
  for select using (auth.uid() is not null);

create policy catalog_items_admin_write on public.catalog_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── redemptions ──────────────────────────────────────
create policy redemption_self_read on public.redemptions
  for select using (user_id = auth.uid() or public.is_admin());

create policy redemption_create_self on public.redemptions
  for insert with check (user_id = auth.uid());

create policy redemption_admin_decide on public.redemptions
  for update using (public.is_admin()) with check (public.is_admin());

-- ─── audit_log ────────────────────────────────────────
create policy audit_log_admin_read on public.audit_log
  for select using (public.is_admin());

create policy audit_log_admin_insert on public.audit_log
  for insert with check (public.is_admin());

-- ─── audit_findings ───────────────────────────────────
create policy audit_findings_admin_read on public.audit_findings
  for select using (public.is_admin());

create policy audit_findings_admin_write on public.audit_findings
  for all using (public.is_admin()) with check (public.is_admin());
