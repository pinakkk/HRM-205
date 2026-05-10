-- ─────────────────────────────────────────────────────────────
-- 0007_admin_intent.sql — server-side admin signup intent tokens
-- ─────────────────────────────────────────────────────────────
-- Google OAuth strips out custom user_metadata.role on first sign-in (the
-- provider only forwards what it controls), so we cannot rely on the client
-- saying "I want to be an admin" through the auth payload. Instead, a click
-- on the admin Google button mints a single-use server-issued token here.
-- The auth callback validates the token before promoting the freshly-created
-- profile to role='admin'. Tokens are short-lived and consumed on use.

create table public.admin_intent_tokens (
  token uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  consumed_at timestamptz,
  consumed_by uuid references public.users(id)
);

create index admin_intent_tokens_unconsumed_idx
  on public.admin_intent_tokens (created_at)
  where consumed_at is null;

alter table public.admin_intent_tokens enable row level security;

-- No anon / authenticated policies — only the service-role client may touch
-- this table. RLS is enabled with no policies so RLS-bound clients see zero
-- rows and cannot insert/update.
