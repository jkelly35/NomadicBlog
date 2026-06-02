-- Nomadic Performance - athlete workout calendar schedule
-- Coach assigns template workouts to specific calendar dates per athlete.
-- Run in Supabase SQL editor.

begin;

create or replace function public.is_nomadic_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.email(), '')) = 'joe@nomadicperformance.com';
$$;

create table if not exists public.athlete_program_schedule (
  id uuid primary key default gen_random_uuid(),
  athlete_user_id uuid not null references auth.users(id) on delete cascade,
  user_training_program_id uuid not null references public.user_training_programs(id) on delete cascade,
  program_id uuid references public.training_programs(id) on delete set null,
  slot_key text not null,
  session_label text,
  scheduled_for date not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'missed', 'skipped')),
  notes text,
  scheduled_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_training_program_id, slot_key, scheduled_for)
);

create index if not exists athlete_program_schedule_athlete_date_idx
  on public.athlete_program_schedule (athlete_user_id, scheduled_for asc);

create index if not exists athlete_program_schedule_assignment_idx
  on public.athlete_program_schedule (user_training_program_id, scheduled_for asc);

alter table public.athlete_program_schedule enable row level security;

drop policy if exists "athlete_program_schedule_select_own_or_admin" on public.athlete_program_schedule;
create policy "athlete_program_schedule_select_own_or_admin"
on public.athlete_program_schedule
for select
to authenticated
using (
  auth.uid() = athlete_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_program_schedule_insert_admin_only" on public.athlete_program_schedule;
create policy "athlete_program_schedule_insert_admin_only"
on public.athlete_program_schedule
for insert
to authenticated
with check (
  public.is_nomadic_admin()
);

drop policy if exists "athlete_program_schedule_update_admin_or_athlete" on public.athlete_program_schedule;
create policy "athlete_program_schedule_update_admin_or_athlete"
on public.athlete_program_schedule
for update
to authenticated
using (
  auth.uid() = athlete_user_id
  or public.is_nomadic_admin()
)
with check (
  auth.uid() = athlete_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_program_schedule_delete_admin_only" on public.athlete_program_schedule;
create policy "athlete_program_schedule_delete_admin_only"
on public.athlete_program_schedule
for delete
to authenticated
using (
  public.is_nomadic_admin()
);

create or replace function public.athlete_program_schedule_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_athlete_program_schedule_updated_at on public.athlete_program_schedule;
create trigger trg_athlete_program_schedule_updated_at
before update on public.athlete_program_schedule
for each row
execute function public.athlete_program_schedule_set_updated_at();

commit;
