-- Nomadic Performance - athlete exercise history
-- Stores reps/loads per completed session for coach analytics and athlete history.
-- Run in Supabase SQL editor.

begin;

create or replace function public.is_nomadic_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.email(), '')) = 'joe@nomadicperformance.com';
$$;

create table if not exists public.athlete_exercise_history (
  id uuid primary key default gen_random_uuid(),
  athlete_user_id uuid not null references auth.users(id) on delete cascade,
  coach_user_id uuid references auth.users(id) on delete set null,
  user_training_program_id uuid references public.user_training_programs(id) on delete set null,
  slot_key text,
  workout_started_at timestamptz,
  workout_completed_at timestamptz not null default now(),
  exercise_library_id text,
  exercise_name text not null,
  section text,
  movement_pattern text,
  primary_muscle text,
  training_goal text,
  total_sets int not null default 0,
  completed_sets int not null default 0,
  top_weight numeric,
  volume_load numeric not null default 0,
  set_logs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint athlete_exercise_history_sets_chk check (total_sets >= 0 and completed_sets >= 0 and completed_sets <= total_sets),
  constraint athlete_exercise_history_set_logs_array_chk check (jsonb_typeof(set_logs) = 'array')
);

create index if not exists athlete_exercise_history_athlete_exercise_idx
  on public.athlete_exercise_history (athlete_user_id, exercise_name, workout_completed_at desc);

create index if not exists athlete_exercise_history_athlete_library_idx
  on public.athlete_exercise_history (athlete_user_id, exercise_library_id, workout_completed_at desc);

create index if not exists athlete_exercise_history_coach_completed_idx
  on public.athlete_exercise_history (coach_user_id, workout_completed_at desc);

create index if not exists athlete_exercise_history_assignment_idx
  on public.athlete_exercise_history (user_training_program_id, slot_key, workout_completed_at desc);

create index if not exists athlete_exercise_history_pattern_idx
  on public.athlete_exercise_history (movement_pattern, primary_muscle, workout_completed_at desc);

alter table public.athlete_exercise_history enable row level security;

drop policy if exists "athlete_exercise_history_select_own_coach_or_admin" on public.athlete_exercise_history;
create policy "athlete_exercise_history_select_own_coach_or_admin"
on public.athlete_exercise_history
for select
to authenticated
using (
  auth.uid() = athlete_user_id
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_exercise_history_insert_own_or_admin" on public.athlete_exercise_history;
create policy "athlete_exercise_history_insert_own_or_admin"
on public.athlete_exercise_history
for insert
to authenticated
with check (
  auth.uid() = athlete_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_exercise_history_update_own_coach_or_admin" on public.athlete_exercise_history;
create policy "athlete_exercise_history_update_own_coach_or_admin"
on public.athlete_exercise_history
for update
to authenticated
using (
  auth.uid() = athlete_user_id
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
)
with check (
  auth.uid() = athlete_user_id
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_exercise_history_delete_admin_only" on public.athlete_exercise_history;
create policy "athlete_exercise_history_delete_admin_only"
on public.athlete_exercise_history
for delete
to authenticated
using (
  public.is_nomadic_admin()
);

create or replace function public.athlete_exercise_history_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_athlete_exercise_history_updated_at on public.athlete_exercise_history;
create trigger trg_athlete_exercise_history_updated_at
before update on public.athlete_exercise_history
for each row
execute function public.athlete_exercise_history_set_updated_at();

commit;
