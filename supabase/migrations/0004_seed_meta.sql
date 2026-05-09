-- ─────────────────────────────────────────────────────────────
-- 0004_seed_meta.sql — seed reference/metadata rows (badges, catalog)
-- ─────────────────────────────────────────────────────────────

insert into public.badges (code, name, description, rarity)
values
  ('first_check_in',  'First Steps',     'Checked in for the first time.',         'bronze'),
  ('streak_7',        'Week Warrior',    'Checked in 7 days in a row.',            'silver'),
  ('streak_30',       'Iron Streak',     'Checked in 30 days in a row.',           'gold'),
  ('peer_favorite',   'Peer Favorite',   'Received 10+ kudos.',                    'silver'),
  ('top_performer',   'Top Performer',   'Ranked top 5% in a quarterly cycle.',    'platinum')
on conflict (code) do nothing;

insert into public.catalog_items (name, description, cost_points)
values
  ('Amazon Voucher ₹500',      'Redeemable voucher.',                500),
  ('Extra Half-Day Off',       'Approved by HR; one half-day off.', 800),
  ('Branded T-Shirt',          'Company swag.',                     400),
  ('Lunch on the Company',     'Meal voucher up to ₹600.',          600)
on conflict do nothing;
