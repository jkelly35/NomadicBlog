-- Nomadic Performance - analytics taxonomy and assessment/outcome foundation
-- Purpose: operationalize coach analytics categories, metric cataloging,
-- research questions, and standardized assessment/outcome events.
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

create table if not exists public.analytics_categories (
  id text primary key,
  name text not null,
  purpose text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_metric_catalog (
  id uuid primary key default gen_random_uuid(),
  metric_key text not null unique,
  category_id text not null references public.analytics_categories(id) on delete restrict,
  metric_name text not null,
  description text,
  cadence text not null default 'daily' check (cadence in ('onboarding', 'daily', 'session', 'weekly', 'assessment', 'outcome')),
  data_type text not null default 'numeric' check (data_type in ('numeric', 'boolean', 'enum', 'text', 'json')),
  unit text,
  source_type text not null default 'manual' check (source_type in ('wearable', 'self_report', 'coach_assessment', 'system', 'manual', 'derived')),
  sport_scope text[] not null default '{}',
  is_sensitive boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists analytics_metric_catalog_category_idx
  on public.analytics_metric_catalog (category_id, active, metric_name);

create index if not exists analytics_metric_catalog_source_idx
  on public.analytics_metric_catalog (source_type, cadence);

create table if not exists public.analytics_research_questions (
  id uuid primary key default gen_random_uuid(),
  question_order int not null default 0,
  question_text text not null,
  category_id text references public.analytics_categories(id) on delete set null,
  priority text not null default 'high' check (priority in ('high', 'medium', 'low')),
  status text not null default 'todo' check (status in ('todo', 'active', 'answered', 'archived')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists analytics_research_questions_order_idx
  on public.analytics_research_questions (priority, question_order);

create table if not exists public.athlete_assessment_events (
  id uuid primary key default gen_random_uuid(),
  athlete_user_id uuid not null references auth.users(id) on delete cascade,
  coach_user_id uuid references auth.users(id) on delete set null,
  assessment_date date not null,
  metric_key text references public.analytics_metric_catalog(metric_key) on delete set null,
  test_name text not null,
  result_value text not null,
  result_numeric numeric,
  result_unit text,
  side text,
  method text,
  device_source text,
  pain_present boolean,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists athlete_assessment_events_athlete_date_idx
  on public.athlete_assessment_events (athlete_user_id, assessment_date desc);

create index if not exists athlete_assessment_events_test_idx
  on public.athlete_assessment_events (test_name, assessment_date desc);

create table if not exists public.athlete_outcome_events (
  id uuid primary key default gen_random_uuid(),
  athlete_user_id uuid not null references auth.users(id) on delete cascade,
  coach_user_id uuid references auth.users(id) on delete set null,
  outcome_date date not null,
  sport text,
  outcome_type text not null,
  outcome_value text,
  outcome_numeric numeric,
  goal_progress_score numeric,
  injury_status text,
  satisfaction_score numeric,
  renewal_status text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists athlete_outcome_events_athlete_date_idx
  on public.athlete_outcome_events (athlete_user_id, outcome_date desc);

create index if not exists athlete_outcome_events_type_idx
  on public.athlete_outcome_events (outcome_type, outcome_date desc);

alter table public.analytics_categories enable row level security;
alter table public.analytics_metric_catalog enable row level security;
alter table public.analytics_research_questions enable row level security;
alter table public.athlete_assessment_events enable row level security;
alter table public.athlete_outcome_events enable row level security;

drop policy if exists "analytics_categories_read_authenticated" on public.analytics_categories;
create policy "analytics_categories_read_authenticated"
on public.analytics_categories
for select
to authenticated
using (true);

drop policy if exists "analytics_categories_write_admin_only" on public.analytics_categories;
create policy "analytics_categories_write_admin_only"
on public.analytics_categories
for all
to authenticated
using (public.is_nomadic_admin())
with check (public.is_nomadic_admin());

drop policy if exists "analytics_metric_catalog_read_authenticated" on public.analytics_metric_catalog;
create policy "analytics_metric_catalog_read_authenticated"
on public.analytics_metric_catalog
for select
to authenticated
using (true);

drop policy if exists "analytics_metric_catalog_write_admin_only" on public.analytics_metric_catalog;
create policy "analytics_metric_catalog_write_admin_only"
on public.analytics_metric_catalog
for all
to authenticated
using (public.is_nomadic_admin())
with check (public.is_nomadic_admin());

drop policy if exists "analytics_research_questions_read_authenticated" on public.analytics_research_questions;
create policy "analytics_research_questions_read_authenticated"
on public.analytics_research_questions
for select
to authenticated
using (true);

drop policy if exists "analytics_research_questions_write_admin_only" on public.analytics_research_questions;
create policy "analytics_research_questions_write_admin_only"
on public.analytics_research_questions
for all
to authenticated
using (public.is_nomadic_admin())
with check (public.is_nomadic_admin());

drop policy if exists "athlete_assessment_events_select_own_coach_or_admin" on public.athlete_assessment_events;
create policy "athlete_assessment_events_select_own_coach_or_admin"
on public.athlete_assessment_events
for select
to authenticated
using (
  auth.uid() = athlete_user_id
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_assessment_events_insert_own_coach_or_admin" on public.athlete_assessment_events;
create policy "athlete_assessment_events_insert_own_coach_or_admin"
on public.athlete_assessment_events
for insert
to authenticated
with check (
  auth.uid() = athlete_user_id
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_assessment_events_update_own_coach_or_admin" on public.athlete_assessment_events;
create policy "athlete_assessment_events_update_own_coach_or_admin"
on public.athlete_assessment_events
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

drop policy if exists "athlete_assessment_events_delete_admin_only" on public.athlete_assessment_events;
create policy "athlete_assessment_events_delete_admin_only"
on public.athlete_assessment_events
for delete
to authenticated
using (public.is_nomadic_admin());

drop policy if exists "athlete_outcome_events_select_own_coach_or_admin" on public.athlete_outcome_events;
create policy "athlete_outcome_events_select_own_coach_or_admin"
on public.athlete_outcome_events
for select
to authenticated
using (
  auth.uid() = athlete_user_id
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_outcome_events_insert_own_coach_or_admin" on public.athlete_outcome_events;
create policy "athlete_outcome_events_insert_own_coach_or_admin"
on public.athlete_outcome_events
for insert
to authenticated
with check (
  auth.uid() = athlete_user_id
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_outcome_events_update_own_coach_or_admin" on public.athlete_outcome_events;
create policy "athlete_outcome_events_update_own_coach_or_admin"
on public.athlete_outcome_events
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

drop policy if exists "athlete_outcome_events_delete_admin_only" on public.athlete_outcome_events;
create policy "athlete_outcome_events_delete_admin_only"
on public.athlete_outcome_events
for delete
to authenticated
using (public.is_nomadic_admin());

drop trigger if exists trg_analytics_categories_updated_at on public.analytics_categories;
create trigger trg_analytics_categories_updated_at
before update on public.analytics_categories
for each row
execute function public.nomadic_set_updated_at();

drop trigger if exists trg_analytics_metric_catalog_updated_at on public.analytics_metric_catalog;
create trigger trg_analytics_metric_catalog_updated_at
before update on public.analytics_metric_catalog
for each row
execute function public.nomadic_set_updated_at();

drop trigger if exists trg_analytics_research_questions_updated_at on public.analytics_research_questions;
create trigger trg_analytics_research_questions_updated_at
before update on public.analytics_research_questions
for each row
execute function public.nomadic_set_updated_at();

drop trigger if exists trg_athlete_assessment_events_updated_at on public.athlete_assessment_events;
create trigger trg_athlete_assessment_events_updated_at
before update on public.athlete_assessment_events
for each row
execute function public.nomadic_set_updated_at();

drop trigger if exists trg_athlete_outcome_events_updated_at on public.athlete_outcome_events;
create trigger trg_athlete_outcome_events_updated_at
before update on public.athlete_outcome_events
for each row
execute function public.nomadic_set_updated_at();

insert into public.analytics_categories (id, name, purpose, sort_order)
values
  ('athlete_profile', 'Athlete Profile', 'Who is this athlete?', 10),
  ('sport_profile', 'Sport Profile', 'What sports do they do and at what level?', 20),
  ('goal_profile', 'Goal Profile', 'What are they training for?', 30),
  ('training_load', 'Training Load', 'What are they doing?', 40),
  ('wearable_physiology', 'Wearable Physiology', 'How is their body responding?', 50),
  ('subjective_readiness', 'Subjective Readiness', 'How do they feel?', 60),
  ('performance_testing', 'Performance Testing', 'What can they physically do?', 70),
  ('movement_mobility', 'Movement and Mobility', 'How do they move?', 80),
  ('injury_pain', 'Injury and Pain', 'What limits them?', 90),
  ('recovery_lifestyle', 'Recovery and Lifestyle', 'What affects adaptation?', 100),
  ('program_adherence', 'Program Adherence', 'Are they doing the plan?', 110),
  ('outcomes', 'Outcomes', 'Did performance improve?', 120),
  ('membership_business', 'Membership and Business', 'What drives retention and sustainability?', 130)
on conflict (id) do update
set name = excluded.name,
    purpose = excluded.purpose,
    sort_order = excluded.sort_order,
    updated_at = now();

insert into public.analytics_research_questions (question_order, question_text, category_id, priority, status)
values
  (10, 'Does assessment score predict future performance improvement?', 'performance_testing', 'high', 'todo'),
  (20, 'Does consistency score predict goal progress?', 'program_adherence', 'high', 'todo'),
  (30, 'Does sleep quality predict readiness better than HRV?', 'wearable_physiology', 'high', 'todo'),
  (40, 'Does HRV predict next-day or next-week performance?', 'wearable_physiology', 'high', 'todo'),
  (50, 'Does training load spike predict pain flare-ups?', 'training_load', 'high', 'todo'),
  (60, 'Does strength training adherence predict sport performance improvement?', 'training_load', 'high', 'todo'),
  (70, 'Does sport-specific strength testing correlate with sport level?', 'performance_testing', 'high', 'todo'),
  (80, 'In climbers, does 20 mm edge strength correlate with climbing grade?', 'performance_testing', 'high', 'todo'),
  (90, 'In runners, does calf capacity correlate with pain-free mileage?', 'performance_testing', 'high', 'todo'),
  (100, 'In skiers, does single-leg strength correlate with ski-day tolerance?', 'performance_testing', 'high', 'todo'),
  (110, 'Does direct messaging and check-in completion improve retention?', 'membership_business', 'high', 'todo'),
  (120, 'Which variables best predict membership renewal?', 'membership_business', 'high', 'todo')
on conflict do nothing;

insert into public.analytics_metric_catalog (metric_key, category_id, metric_name, description, cadence, data_type, unit, source_type, sport_scope, is_sensitive)
values
  ('sleep_hours', 'wearable_physiology', 'Sleep Hours', 'Total sleep duration per day', 'daily', 'numeric', 'h', 'wearable', '{}', false),
  ('hrv_ms', 'wearable_physiology', 'HRV', 'Heart rate variability', 'daily', 'numeric', 'ms', 'wearable', '{}', false),
  ('resting_hr', 'wearable_physiology', 'Resting Heart Rate', 'Daily resting heart rate', 'daily', 'numeric', 'bpm', 'wearable', '{}', false),
  ('readiness_score_self', 'subjective_readiness', 'Self-Reported Readiness', 'Athlete self-rated readiness', 'daily', 'numeric', '1-10', 'self_report', '{}', false),
  ('stress_score', 'subjective_readiness', 'Stress Score', 'Athlete or context stress score', 'daily', 'numeric', '1-10', 'self_report', '{}', false),
  ('session_rpe_load', 'training_load', 'Session RPE Load', 'Session duration multiplied by RPE', 'session', 'numeric', 'au', 'manual', '{}', false),
  ('volume_load_strength', 'training_load', 'Strength Volume Load', 'Sets x reps x load', 'session', 'numeric', 'kg', 'system', '{}', false),
  ('edge_20mm_strength', 'performance_testing', '20mm Edge Hang Strength', 'Climbing specific finger strength test', 'assessment', 'numeric', 'kg', 'coach_assessment', '{climbing}', false),
  ('climbing_grade', 'outcomes', 'Climbing Grade', 'Boulder, redpoint, or onsight grade', 'outcome', 'text', 'grade', 'manual', '{climbing}', false),
  ('pain_score', 'injury_pain', 'Pain Score', 'Pain intensity per day or session', 'daily', 'numeric', '0-10', 'self_report', '{}', true),
  ('checkin_completion_rate', 'program_adherence', 'Check-In Completion Rate', 'Percentage of completed check-ins', 'weekly', 'numeric', '%', 'derived', '{}', false),
  ('membership_renewal_status', 'membership_business', 'Membership Renewal Status', 'Renewed, canceled, active', 'outcome', 'enum', '', 'system', '{}', false)
on conflict (metric_key) do update
set category_id = excluded.category_id,
    metric_name = excluded.metric_name,
    description = excluded.description,
    cadence = excluded.cadence,
    data_type = excluded.data_type,
    unit = excluded.unit,
    source_type = excluded.source_type,
    sport_scope = excluded.sport_scope,
    is_sensitive = excluded.is_sensitive,
    active = true,
    updated_at = now();

commit;
