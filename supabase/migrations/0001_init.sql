-- ─────────────────────────────────────────────────────────────
-- 0001_init.sql — base schema for FairReward AI
-- ─────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- profiles complement Supabase auth.users
create table public.users (
  id uuid primary key references auth.users on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('employee','admin')) default 'employee',
  department text,
  gender text,
  joined_at date not null default current_date,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.attendance (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  check_in timestamptz not null default now(),
  check_out timestamptz,
  source text default 'web'
);

create table public.kpis (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  weight numeric not null default 1.0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.kpi_assignments (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  kpi_id uuid not null references public.kpis(id) on delete cascade,
  cycle text not null,
  target numeric,
  achieved numeric default 0,
  evidence_url text,
  created_at timestamptz not null default now(),
  unique (user_id, kpi_id, cycle)
);

create table public.feedback (
  id bigserial primary key,
  from_user_id uuid not null references public.users(id),
  to_user_id uuid not null references public.users(id),
  body text not null,
  sentiment text check (sentiment in ('positive','neutral','constructive','negative')),
  sentiment_score numeric,
  created_at timestamptz not null default now()
);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  rarity text check (rarity in ('bronze','silver','gold','platinum')),
  art_url text,
  rule_json jsonb,
  created_at timestamptz not null default now()
);

create table public.user_badges (
  user_id uuid references public.users(id) on delete cascade,
  badge_id uuid references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create table public.allocation_cycles (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  pool_amount numeric not null,
  status text not null default 'draft' check (status in ('draft','published','closed')),
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

-- append-only ledger
create table public.rewards_ledger (
  id bigserial primary key,
  user_id uuid not null references public.users(id),
  cycle_id uuid references public.allocation_cycles(id),
  kind text not null check (kind in ('points','bonus','badge','kudos')),
  amount numeric not null default 0,
  reason text not null,
  source text not null check (source in ('manual','ai_suggested','auto_rule','peer')),
  rationale_json jsonb,
  awarded_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cost_points int not null,
  stock int default -1,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.redemptions (
  id bigserial primary key,
  user_id uuid not null references public.users(id),
  item_id uuid not null references public.catalog_items(id),
  points_spent int not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','fulfilled')),
  decided_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigserial primary key,
  actor_id uuid references public.users(id),
  action text not null,
  target_table text,
  target_id text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table public.audit_findings (
  id bigserial primary key,
  metric text not null,
  group_label text,
  value numeric,
  threshold numeric,
  flagged boolean default false,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ─── Indexes ───────────────────────────────────────────
create index on public.rewards_ledger (user_id, created_at desc);
create index on public.rewards_ledger (cycle_id);
create index on public.attendance (user_id, check_in desc);
create index on public.feedback (to_user_id, created_at desc);
create index on public.audit_log (actor_id, created_at desc);
create index on public.kpi_assignments (user_id, cycle);
create index on public.redemptions (user_id, created_at desc);

-- ─── Auto-create profile on auth signup ───────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'employee')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
