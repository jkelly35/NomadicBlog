-- Nomadic Performance - Coach Notes
-- Private notes a coach writes about an athlete.
-- Athletes never have access to this table.
-- Run this in the Supabase SQL editor.

begin;

create table if not exists public.coach_notes (
  id          uuid        not null default gen_random_uuid() primary key,
  coach_id    uuid        not null references auth.users(id) on delete cascade,
  athlete_id  uuid        not null,
  note_text   text        not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for fast per-athlete lookups
create index if not exists coach_notes_athlete_id_idx
  on public.coach_notes (athlete_id, created_at desc);

-- Enable RLS
alter table public.coach_notes enable row level security;

-- Only the coach (admin) can read or write notes.
-- Athletes are never granted access.
drop policy if exists "coach_notes_admin_only" on public.coach_notes;
create policy "coach_notes_admin_only"
on public.coach_notes
for all
using  ( public.is_nomadic_admin() )
with check ( public.is_nomadic_admin() );

-- Automatically update updated_at on changes
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists coach_notes_updated_at on public.coach_notes;
create trigger coach_notes_updated_at
  before update on public.coach_notes
  for each row execute function public.set_updated_at();

commit;
