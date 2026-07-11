-- Create shared exercise library table for coach dashboard
-- Run this in Supabase SQL editor before using cloud-synced exercise library

create table if not exists public.exercise_library (
  id text primary key,
  name text not null,
  movement_pattern text,
  equipment text,
  primary_muscle text,
  training_goal text,
  sport_tags text[] not null default '{}',
  custom_tags text[] not null default '{}',
  description text,
  coaching_cues text,
  video_demo_url text,
  default_section text,
  default_mode text,
  default_set_count int,
  default_rep_value text,
  default_secondary_value text,
  default_intensity_value text,
  default_rest_value text,
  default_show_weight boolean,
  default_show_rpe boolean,
  default_show_rest boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.exercise_library
  add column if not exists video_demo_url text;

alter table public.exercise_library
  add column if not exists default_section text,
  add column if not exists default_mode text,
  add column if not exists default_set_count int,
  add column if not exists default_rep_value text,
  add column if not exists default_secondary_value text,
  add column if not exists default_intensity_value text,
  add column if not exists default_rest_value text,
  add column if not exists default_show_weight boolean,
  add column if not exists default_show_rpe boolean,
  add column if not exists default_show_rest boolean;

create index if not exists exercise_library_updated_at_idx
  on public.exercise_library (updated_at desc);

create index if not exists exercise_library_name_idx
  on public.exercise_library (name);

alter table public.exercise_library enable row level security;

-- NOTE: tighten these policies later if you add role claims.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'exercise_library'
      and policyname = 'exercise_library_select_auth'
  ) then
    create policy exercise_library_select_auth
      on public.exercise_library
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'exercise_library'
      and policyname = 'exercise_library_insert_auth'
  ) then
    create policy exercise_library_insert_auth
      on public.exercise_library
      for insert
      to authenticated
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'exercise_library'
      and policyname = 'exercise_library_update_auth'
  ) then
    create policy exercise_library_update_auth
      on public.exercise_library
      for update
      to authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'exercise_library'
      and policyname = 'exercise_library_delete_auth'
  ) then
    create policy exercise_library_delete_auth
      on public.exercise_library
      for delete
      to authenticated
      using (true);
  end if;
end $$;

create or replace function public.set_exercise_library_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_exercise_library_updated_at on public.exercise_library;
create trigger trg_exercise_library_updated_at
before update on public.exercise_library
for each row execute function public.set_exercise_library_updated_at();
