-- Nomadic Performance - foundational analytics tables for performance intelligence
-- Purpose: collect recovery, programming context, cognitive output, and confounders
-- to correlate training decisions with human performance outcomes.
-- Run in Supabase SQL editor.

begin;

create or replace function public.is_nomadic_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.email(), '')) = 'joe@nomadicperformance.com';
$$;

create or replace function public.nomadic_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Daily recovery + readiness (internal state)
create table if not exists public.athlete_recovery_daily (
  id uuid primary key default gen_random_uuid(),
  athlete_user_id uuid not null references auth.users(id) on delete cascade,
  coach_user_id uuid references auth.users(id) on delete set null,
  recovery_date date not null,
  sleep_hours numeric,
  sleep_efficiency numeric,
  bedtime_regular boolean,
  hrv_ms numeric,
  resting_hr numeric,
  recovery_score numeric,
  soreness_score numeric,
  fatigue_score numeric,
  readiness_note text,
  source text default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (athlete_user_id, recovery_date)
);

create index if not exists athlete_recovery_daily_user_date_idx
  on public.athlete_recovery_daily (athlete_user_id, recovery_date desc);

create index if not exists athlete_recovery_daily_coach_date_idx
  on public.athlete_recovery_daily (coach_user_id, recovery_date desc);

alter table public.athlete_recovery_daily enable row level security;

drop policy if exists "athlete_recovery_daily_select_own_coach_or_admin" on public.athlete_recovery_daily;
create policy "athlete_recovery_daily_select_own_coach_or_admin"
on public.athlete_recovery_daily
for select
to authenticated
using (
  auth.uid() = athlete_user_id
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_recovery_daily_insert_own_or_admin" on public.athlete_recovery_daily;
create policy "athlete_recovery_daily_insert_own_or_admin"
on public.athlete_recovery_daily
for insert
to authenticated
with check (
  auth.uid() = athlete_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_recovery_daily_update_own_coach_or_admin" on public.athlete_recovery_daily;
create policy "athlete_recovery_daily_update_own_coach_or_admin"
on public.athlete_recovery_daily
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

drop policy if exists "athlete_recovery_daily_delete_admin_only" on public.athlete_recovery_daily;
create policy "athlete_recovery_daily_delete_admin_only"
on public.athlete_recovery_daily
for delete
to authenticated
using (
  public.is_nomadic_admin()
);

drop trigger if exists trg_athlete_recovery_daily_updated_at on public.athlete_recovery_daily;
create trigger trg_athlete_recovery_daily_updated_at
before update on public.athlete_recovery_daily
for each row
execute function public.nomadic_set_updated_at();

-- Per-session programming metadata (program design choices)
create table if not exists public.athlete_programming_sessions (
  id uuid primary key default gen_random_uuid(),
  athlete_user_id uuid not null references auth.users(id) on delete cascade,
  coach_user_id uuid references auth.users(id) on delete set null,
  user_training_program_id uuid references public.user_training_programs(id) on delete set null,
  program_schedule_id uuid references public.athlete_program_schedule(id) on delete set null,
  session_date date not null,
  block_name text,
  mesocycle text,
  microcycle_week int,
  phase text,
  progression_strategy text,
  deload_week boolean not null default false,
  session_intent text,
  constraints text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists athlete_programming_sessions_user_date_idx
  on public.athlete_programming_sessions (athlete_user_id, session_date desc);

create index if not exists athlete_programming_sessions_program_idx
  on public.athlete_programming_sessions (user_training_program_id, session_date desc);

create unique index if not exists athlete_programming_sessions_unique_session_idx
  on public.athlete_programming_sessions (
    athlete_user_id,
    session_date,
    coalesce(user_training_program_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

alter table public.athlete_programming_sessions enable row level security;

drop policy if exists "athlete_programming_sessions_select_own_coach_or_admin" on public.athlete_programming_sessions;
create policy "athlete_programming_sessions_select_own_coach_or_admin"
on public.athlete_programming_sessions
for select
to authenticated
using (
  auth.uid() = athlete_user_id
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_programming_sessions_insert_coach_or_admin" on public.athlete_programming_sessions;
create policy "athlete_programming_sessions_insert_coach_or_admin"
on public.athlete_programming_sessions
for insert
to authenticated
with check (
  auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_programming_sessions_update_coach_or_admin" on public.athlete_programming_sessions;
create policy "athlete_programming_sessions_update_coach_or_admin"
on public.athlete_programming_sessions
for update
to authenticated
using (
  auth.uid() = coach_user_id
  or public.is_nomadic_admin()
)
with check (
  auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_programming_sessions_delete_admin_only" on public.athlete_programming_sessions;
create policy "athlete_programming_sessions_delete_admin_only"
on public.athlete_programming_sessions
for delete
to authenticated
using (
  public.is_nomadic_admin()
);

drop trigger if exists trg_athlete_programming_sessions_updated_at on public.athlete_programming_sessions;
create trigger trg_athlete_programming_sessions_updated_at
before update on public.athlete_programming_sessions
for each row
execute function public.nomadic_set_updated_at();

-- Daily cognitive / software output (work performance outcomes)
create table if not exists public.athlete_cognitive_daily (
  id uuid primary key default gen_random_uuid(),
  athlete_user_id uuid not null references auth.users(id) on delete cascade,
  cognitive_date date not null,
  deep_work_hours numeric,
  focus_score numeric,
  cognitive_sharpness_score numeric,
  commits_count int,
  prs_merged_count int,
  bug_count int,
  cycle_time_hours numeric,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (athlete_user_id, cognitive_date)
);

create index if not exists athlete_cognitive_daily_user_date_idx
  on public.athlete_cognitive_daily (athlete_user_id, cognitive_date desc);

alter table public.athlete_cognitive_daily enable row level security;

drop policy if exists "athlete_cognitive_daily_select_own_or_admin" on public.athlete_cognitive_daily;
create policy "athlete_cognitive_daily_select_own_or_admin"
on public.athlete_cognitive_daily
for select
to authenticated
using (
  auth.uid() = athlete_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_cognitive_daily_insert_own_or_admin" on public.athlete_cognitive_daily;
create policy "athlete_cognitive_daily_insert_own_or_admin"
on public.athlete_cognitive_daily
for insert
to authenticated
with check (
  auth.uid() = athlete_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_cognitive_daily_update_own_or_admin" on public.athlete_cognitive_daily;
create policy "athlete_cognitive_daily_update_own_or_admin"
on public.athlete_cognitive_daily
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

drop policy if exists "athlete_cognitive_daily_delete_admin_only" on public.athlete_cognitive_daily;
create policy "athlete_cognitive_daily_delete_admin_only"
on public.athlete_cognitive_daily
for delete
to authenticated
using (
  public.is_nomadic_admin()
);

drop trigger if exists trg_athlete_cognitive_daily_updated_at on public.athlete_cognitive_daily;
create trigger trg_athlete_cognitive_daily_updated_at
before update on public.athlete_cognitive_daily
for each row
execute function public.nomadic_set_updated_at();

-- Confounders / context flags (helps prevent fake correlations)
create table if not exists public.athlete_context_daily (
  id uuid primary key default gen_random_uuid(),
  athlete_user_id uuid not null references auth.users(id) on delete cascade,
  context_date date not null,
  stress_score numeric,
  travel_day boolean not null default false,
  timezone_shift_hours numeric,
  illness_flag boolean not null default false,
  caffeine_mg numeric,
  alcohol_units numeric,
  bodyweight_kg numeric,
  hydration_score numeric,
  menstrual_phase text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (athlete_user_id, context_date)
);

create index if not exists athlete_context_daily_user_date_idx
  on public.athlete_context_daily (athlete_user_id, context_date desc);

alter table public.athlete_context_daily enable row level security;

drop policy if exists "athlete_context_daily_select_own_or_admin" on public.athlete_context_daily;
create policy "athlete_context_daily_select_own_or_admin"
on public.athlete_context_daily
for select
to authenticated
using (
  auth.uid() = athlete_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_context_daily_insert_own_or_admin" on public.athlete_context_daily;
create policy "athlete_context_daily_insert_own_or_admin"
on public.athlete_context_daily
for insert
to authenticated
with check (
  auth.uid() = athlete_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_context_daily_update_own_or_admin" on public.athlete_context_daily;
create policy "athlete_context_daily_update_own_or_admin"
on public.athlete_context_daily
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

drop policy if exists "athlete_context_daily_delete_admin_only" on public.athlete_context_daily;
create policy "athlete_context_daily_delete_admin_only"
on public.athlete_context_daily
for delete
to authenticated
using (
  public.is_nomadic_admin()
);

drop trigger if exists trg_athlete_context_daily_updated_at on public.athlete_context_daily;
create trigger trg_athlete_context_daily_updated_at
before update on public.athlete_context_daily
for each row
execute function public.nomadic_set_updated_at();

commit;
