-- ─────────────────────────────────────────────────────────────
-- 0005_oauth_metadata.sql — handle Google/OAuth metadata fields
-- ─────────────────────────────────────────────────────────────
-- Google OAuth populates raw_user_meta_data with `name` and `picture`,
-- not `full_name` / `avatar_url`. Update the new-user trigger to read
-- whichever the provider supplied.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data->>'role', 'employee'),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
