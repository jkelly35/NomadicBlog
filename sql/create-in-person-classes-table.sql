-- Create coach-managed in-person classes table
-- Stores class sessions, linked program, attendance roster, and notes.

create table if not exists public.in_person_classes (
  id text primary key,
  name text not null,
  class_date date not null,
  class_end_date date,
  description text,
  meeting_days jsonb not null default '[]'::jsonb,
  attendance_by_date jsonb not null default '{}'::jsonb,
  start_time text,
  location text,
  program_id text,
  program_name text,
  notes text,
  attendees jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists in_person_classes_class_date_idx
  on public.in_person_classes (class_date desc);

create index if not exists in_person_classes_updated_at_idx
  on public.in_person_classes (updated_at desc);

alter table public.in_person_classes enable row level security;

-- Coach admin can read/write class sessions.
drop policy if exists "in_person_classes_admin_manage" on public.in_person_classes;
create policy "in_person_classes_admin_manage"
on public.in_person_classes
for all
to authenticated
using ((auth.jwt() ->> 'email') = 'joe@nomadicperformance.com')
with check ((auth.jwt() ->> 'email') = 'joe@nomadicperformance.com');

create or replace function public.in_person_classes_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_in_person_classes_updated_at on public.in_person_classes;
create trigger trg_in_person_classes_updated_at
before update on public.in_person_classes
for each row
execute function public.in_person_classes_set_updated_at();


-- Table for per-week, per-member attendance tracking
create table if not exists public.in_person_class_attendance (
  id uuid primary key default gen_random_uuid(),
  class_id text not null references public.in_person_classes(id) on delete cascade,
  athlete_id text not null,
  week_number integer not null,
  attended boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, athlete_id, week_number)
);

create index if not exists in_person_class_attendance_class_id_idx
  on public.in_person_class_attendance (class_id);

create index if not exists in_person_class_attendance_athlete_id_idx
  on public.in_person_class_attendance (athlete_id);

alter table public.in_person_class_attendance enable row level security;

-- Coach admin can read/write attendance
drop policy if exists "in_person_class_attendance_admin_manage" on public.in_person_class_attendance;
create policy "in_person_class_attendance_admin_manage"
on public.in_person_class_attendance
for all
to authenticated
using ((auth.jwt() ->> 'email') = 'joe@nomadicperformance.com')
with check ((auth.jwt() ->> 'email') = 'joe@nomadicperformance.com');

create or replace function public.in_person_class_attendance_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_in_person_class_attendance_updated_at on public.in_person_class_attendance;
create trigger trg_in_person_class_attendance_updated_at
before update on public.in_person_class_attendance
for each row
execute function public.in_person_class_attendance_set_updated_at();
