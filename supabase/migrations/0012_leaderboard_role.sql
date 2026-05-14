-- ─────────────────────────────────────────────────────────────
-- 0012_leaderboard_role.sql — expose role on leaderboard so
-- employee-facing surfaces can hide admin accounts without
-- needing a service-role lookup or extra round-trip.
--
-- Postgres' CREATE OR REPLACE VIEW only allows appending columns;
-- adding `role` mid-list would be interpreted as a rename. Drop
-- the view first so column order can change cleanly.
-- ─────────────────────────────────────────────────────────────

drop view if exists public.leaderboard;

create view public.leaderboard as
select
  u.id as user_id,
  u.full_name,
  u.avatar_url,
  u.department,
  u.role,
  pb.balance,
  pb.bonus_total
from public.users u
left join public.points_balance pb on pb.user_id = u.id
order by pb.balance desc nulls last;
