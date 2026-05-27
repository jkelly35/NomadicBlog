-- Nomadic Performance - athlete goals, milestones, races/events/trips
-- Run this in Supabase SQL editor.

begin;

create or replace function public.is_nomadic_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.email(), '')) = 'joe@nomadicperformance.com';
$$;

create table if not exists public.athlete_goals_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  goal_type text not null default 'goal',
  target_date date,
  details text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint athlete_goals_events_goal_type_chk
    check (goal_type in ('goal', 'specific_goal', 'race', 'event', 'trip', 'milestone')),
  constraint athlete_goals_events_status_chk
    check (status in ('active', 'completed', 'archived'))
);

create index if not exists athlete_goals_events_user_id_idx
  on public.athlete_goals_events (user_id, created_at desc);

create index if not exists athlete_goals_events_target_date_idx
  on public.athlete_goals_events (target_date, status);

alter table public.athlete_goals_events enable row level security;

drop policy if exists "athlete_goals_events_select_own_or_admin" on public.athlete_goals_events;
create policy "athlete_goals_events_select_own_or_admin"
on public.athlete_goals_events
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_goals_events_insert_own_or_admin" on public.athlete_goals_events;
create policy "athlete_goals_events_insert_own_or_admin"
on public.athlete_goals_events
for insert
to authenticated
with check (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_goals_events_update_own_or_admin" on public.athlete_goals_events;
create policy "athlete_goals_events_update_own_or_admin"
on public.athlete_goals_events
for update
to authenticated
using (
  auth.uid() = user_id
  or public.is_nomadic_admin()
)
with check (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_goals_events_delete_own_or_admin" on public.athlete_goals_events;
create policy "athlete_goals_events_delete_own_or_admin"
on public.athlete_goals_events
for delete
to authenticated
using (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

create or replace function public.athlete_goals_events_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_athlete_goals_events_updated_at on public.athlete_goals_events;
create trigger trg_athlete_goals_events_updated_at
before update on public.athlete_goals_events
for each row
execute function public.athlete_goals_events_set_updated_at();

commit;
