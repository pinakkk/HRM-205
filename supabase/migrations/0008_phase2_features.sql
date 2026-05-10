-- ─────────────────────────────────────────────────────────────
-- 0008_phase2_features.sql — Phase 7 spec-alignment features
--   profile fields · notifications · announcements · leaves
--   reward_rules · employee_of_month
-- ─────────────────────────────────────────────────────────────

-- ─── users: profile + notification prefs ──────────────
alter table public.users
  add column if not exists phone text,
  add column if not exists bio text,
  add column if not exists notification_prefs jsonb not null default
    '{"in_app":true,"email_digest":true}'::jsonb;

-- ─── notifications ────────────────────────────────────
create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('reward','bonus','feedback','badge','announcement','system')),
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_user_unread_idx
  on public.notifications (user_id) where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists notifications_self_read on public.notifications;
create policy notifications_self_read on public.notifications
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists notifications_self_update on public.notifications;
create policy notifications_self_update on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists notifications_admin_write on public.notifications;
create policy notifications_admin_write on public.notifications
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── announcements ────────────────────────────────────
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id),
  title text not null,
  body text not null,
  audience text not null default 'all'
    check (audience in ('all','engineering','sales','marketing','hr','finance')),
  pinned boolean not null default false,
  published_at timestamptz not null default now()
);

create index if not exists announcements_published_idx
  on public.announcements (published_at desc);

alter table public.announcements enable row level security;

drop policy if exists announcements_read on public.announcements;
create policy announcements_read on public.announcements
  for select using (auth.uid() is not null);

drop policy if exists announcements_admin_write on public.announcements;
create policy announcements_admin_write on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── leaves ───────────────────────────────────────────
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

create index if not exists leaves_user_start_idx
  on public.leaves (user_id, start_date desc);
create index if not exists leaves_status_pending_idx
  on public.leaves (status) where status = 'pending';

alter table public.leaves enable row level security;

drop policy if exists leaves_self_read on public.leaves;
create policy leaves_self_read on public.leaves
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists leaves_self_insert on public.leaves;
create policy leaves_self_insert on public.leaves
  for insert with check (user_id = auth.uid() and status = 'pending');

drop policy if exists leaves_admin_decide on public.leaves;
create policy leaves_admin_decide on public.leaves
  for update using (public.is_admin()) with check (public.is_admin());

-- ─── reward_rules ─────────────────────────────────────
create table if not exists public.reward_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trigger text not null,
  points int not null,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.reward_rules enable row level security;

drop policy if exists reward_rules_read on public.reward_rules;
create policy reward_rules_read on public.reward_rules
  for select using (auth.uid() is not null);

drop policy if exists reward_rules_admin_write on public.reward_rules;
create policy reward_rules_admin_write on public.reward_rules
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── employee_of_month ────────────────────────────────
create table if not exists public.employee_of_month (
  year int not null,
  month int not null check (month between 1 and 12),
  user_id uuid not null references public.users(id),
  score numeric,
  reason text,
  selected_by uuid references public.users(id),
  selected_at timestamptz not null default now(),
  primary key (year, month)
);

alter table public.employee_of_month enable row level security;

drop policy if exists eotm_read on public.employee_of_month;
create policy eotm_read on public.employee_of_month
  for select using (auth.uid() is not null);

drop policy if exists eotm_admin_write on public.employee_of_month;
create policy eotm_admin_write on public.employee_of_month
  for all using (public.is_admin()) with check (public.is_admin());
