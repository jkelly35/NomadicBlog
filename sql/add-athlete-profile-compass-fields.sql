-- Nomadic Performance - add coach editable Compass fields to athlete profiles
-- Enables coaches to push Nomadic Performance Compass copy to athlete dashboard.
-- Run in Supabase SQL editor.

begin;

alter table public.athlete_profiles
  add column if not exists compass_training_status text,
  add column if not exists compass_current_phase text,
  add column if not exists compass_next_objective text,
  add column if not exists compass_coach_note text;

commit;
