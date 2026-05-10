-- Nomadic Performance - athlete_profiles sports + sport_overview migration
-- Run this in Supabase SQL Editor.

begin;

-- 1) Add columns if they do not exist.
alter table public.athlete_profiles
  add column if not exists sports text[],
  add column if not exists sport_overview jsonb;

-- 2) Backfill sports from legacy single-sport column when possible.
update public.athlete_profiles
set sports = case
  when sport is null or btrim(sport) = '' then coalesce(sports, array[]::text[])
  when sports is null or cardinality(sports) = 0 then array[sport]
  else sports
end;

-- 3) Ensure non-null defaults for cleaner app behavior.
alter table public.athlete_profiles
  alter column sports set default array[]::text[],
  alter column sport_overview set default '{}'::jsonb;

update public.athlete_profiles
set sports = coalesce(sports, array[]::text[]),
    sport_overview = coalesce(sport_overview, '{}'::jsonb)
where sports is null or sport_overview is null;

-- 4) Optional indexes for faster filtering/searching by sports and sport_overview.
create index if not exists idx_athlete_profiles_sports_gin
  on public.athlete_profiles using gin (sports);

create index if not exists idx_athlete_profiles_sport_overview_gin
  on public.athlete_profiles using gin (sport_overview);

commit;

-- Verification queries:
-- select column_name, data_type from information_schema.columns
-- where table_schema = 'public' and table_name = 'athlete_profiles'
--   and column_name in ('sport', 'sports', 'sport_overview');
--
-- select user_id, sport, sports, sport_overview
-- from public.athlete_profiles
-- order by updated_at desc nulls last
-- limit 20;
