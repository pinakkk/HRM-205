-- ─────────────────────────────────────────────────────────────
-- 0006_consent.sql — DPDP Act 2023 opt-in consent for sensitive PII
-- ─────────────────────────────────────────────────────────────
-- The bias audit only consumes `gender` from rows where consent is
-- explicit. Adding a dedicated column keeps the consent state
-- auditable and lets users withdraw without nulling other PII.

alter table public.users
  add column if not exists consent_at timestamptz,
  add column if not exists consent_version text;

drop policy if exists users_self_update on public.users;
create policy users_self_update on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());
