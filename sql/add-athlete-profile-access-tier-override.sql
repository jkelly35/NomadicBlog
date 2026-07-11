-- Nomadic Performance - coach access tier override on athlete profiles
-- Allows coach/admin to explicitly set athlete dashboard access tier.
-- Run in Supabase SQL editor.

begin;

alter table public.athlete_profiles
  add column if not exists coach_access_tier_override text,
  add column if not exists coach_access_tier_override_updated_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'athlete_profiles_coach_access_tier_override_chk'
      and conrelid = 'public.athlete_profiles'::regclass
  ) then
    alter table public.athlete_profiles
      add constraint athlete_profiles_coach_access_tier_override_chk
      check (
        coach_access_tier_override is null
        or coach_access_tier_override in ('athlete', 'active_member', 'active_program', 'individualized')
      );
  end if;
end;
$$;

create index if not exists athlete_profiles_coach_access_tier_override_idx
  on public.athlete_profiles (coach_access_tier_override);

commit;
