-- Nomadic Performance - add active/inactive member flag for athlete accounts

begin;

alter table public.athlete_profiles
  add column if not exists is_active boolean not null default true;

create index if not exists idx_athlete_profiles_is_active
  on public.athlete_profiles (is_active);

-- Ensure legacy rows default to active if null from old schema states.
update public.athlete_profiles
set is_active = true
where is_active is null;

commit;
