-- Ensure PostgREST schema cache can see `public.leaves`.
-- In Supabase, PostgREST typically connects with the publishable (anon) key and
-- switches roles based on the JWT. If `anon` cannot see the table metadata,
-- queries may fail with:
--   "Could not find the table 'public.leaves' in the schema cache"
-- RLS policies still enforce access.

begin;

-- Schema usage (usually already granted, but keep idempotent).
grant usage on schema public to anon, authenticated;

grant select on table public.leaves to anon;
grant select, insert, update on table public.leaves to authenticated;

-- Needed for bigserial inserts (authenticated only).
grant usage, select on sequence public.leaves_id_seq to authenticated;

commit;
