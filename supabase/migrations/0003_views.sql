-- ─────────────────────────────────────────────────────────────
-- 0003_views.sql — materialised views & helper views
-- ─────────────────────────────────────────────────────────────

-- points_balance per user
create materialized view if not exists public.points_balance as
select
  u.id as user_id,
  coalesce(sum(case when l.kind in ('points','kudos') then l.amount else 0 end), 0) as balance,
  coalesce(sum(case when l.kind = 'bonus' then l.amount else 0 end), 0) as bonus_total,
  coalesce(sum(l.amount), 0) as lifetime_total
from public.users u
left join public.rewards_ledger l on l.user_id = u.id
group by u.id;

create unique index if not exists points_balance_user_id_idx
  on public.points_balance (user_id);

-- helper: refresh balance view (called after ledger writes)
create or replace function public.refresh_points_balance()
returns void
language sql
security definer
set search_path = public
as $$
  refresh materialized view concurrently public.points_balance;
$$;

-- leaderboard view (non-materialised; cached in Redis)
create or replace view public.leaderboard as
select
  u.id as user_id,
  u.full_name,
  u.avatar_url,
  u.department,
  pb.balance,
  pb.bonus_total
from public.users u
left join public.points_balance pb on pb.user_id = u.id
order by pb.balance desc nulls last;
