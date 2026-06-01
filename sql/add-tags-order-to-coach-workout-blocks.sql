-- Add tags and sort ordering to existing coach_workout_blocks table.
-- Run this if coach_workout_blocks already exists from an earlier migration.

begin;

alter table if exists public.coach_workout_blocks
  add column if not exists tags text[] not null default '{}';

alter table if exists public.coach_workout_blocks
  add column if not exists sort_order integer not null default 0;

with ranked as (
  select id, row_number() over (order by created_at desc, id desc) - 1 as next_sort_order
  from public.coach_workout_blocks
)
update public.coach_workout_blocks b
set sort_order = ranked.next_sort_order
from ranked
where b.id = ranked.id
  and coalesce(b.sort_order, 0) = 0;

commit;
