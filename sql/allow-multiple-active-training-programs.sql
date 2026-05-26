-- Allow multiple active training programs per athlete by removing the one-active uniqueness guard.
-- Run this in Supabase SQL editor.

begin;

-- Drop as table constraint when present.
alter table if exists public.user_training_programs
  drop constraint if exists uq_user_training_programs_one_active;

-- Drop as index when present (common for partial unique indexes).
drop index if exists public.uq_user_training_programs_one_active;

commit;
