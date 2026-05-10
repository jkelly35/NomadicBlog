-- Nomadic Performance - fix coach/admin access for athlete_profiles under RLS
-- Run this in the Supabase SQL editor.

begin;

alter table public.athlete_profiles enable row level security;

-- Helper used by RLS policies. Uses authenticated user's email claim.
create or replace function public.is_nomadic_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.email(), '')) = 'joe@nomadicperformance.com';
$$;

-- Athlete self-access + coach/admin access.
drop policy if exists "athlete_profiles_select_own_or_admin" on public.athlete_profiles;
create policy "athlete_profiles_select_own_or_admin"
on public.athlete_profiles
for select
using (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_profiles_insert_own_or_admin" on public.athlete_profiles;
create policy "athlete_profiles_insert_own_or_admin"
on public.athlete_profiles
for insert
with check (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_profiles_update_own_or_admin" on public.athlete_profiles;
create policy "athlete_profiles_update_own_or_admin"
on public.athlete_profiles
for update
using (
  auth.uid() = user_id
  or public.is_nomadic_admin()
)
with check (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_profiles_delete_own_or_admin" on public.athlete_profiles;
create policy "athlete_profiles_delete_own_or_admin"
on public.athlete_profiles
for delete
using (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

commit;

-- Optional cleanup (only if these exact old policy names exist):
-- drop policy if exists "Users can read own profile" on public.athlete_profiles;
-- drop policy if exists "Users can update own profile" on public.athlete_profiles;
-- drop policy if exists "Users can insert own profile" on public.athlete_profiles;
-- drop policy if exists "Users can delete own profile" on public.athlete_profiles;
