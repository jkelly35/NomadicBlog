-- Nomadic Performance - Add Ape Index support
-- Run this in Supabase SQL editor.
-- This script is safe to re-run and will not overwrite existing arm_span values.

begin;

-- Add arm_span_cm column if it does not exist
alter table public.athlete_profiles
	add column if not exists arm_span_cm numeric;

-- Create an index for faster queries
create index if not exists idx_athlete_profiles_arm_span
	on public.athlete_profiles (arm_span_cm);

-- Ensure non-null defaults for cleaner app behavior
alter table public.athlete_profiles
	alter column arm_span_cm drop default;

commit;

-- Verification query:
-- select user_id, height_cm, arm_span_cm, 
--   case 
--     when arm_span_cm is not null and height_cm is not null 
--     then arm_span_cm - height_cm 
--     else null 
--   end as ape_index_difference
-- from public.athlete_profiles
-- where arm_span_cm is not null or height_cm is not null
-- order by updated_at desc nulls last
-- limit 20;
