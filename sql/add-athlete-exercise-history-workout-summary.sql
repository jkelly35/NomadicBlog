-- Nomadic Performance - add workout summary payload to athlete exercise history
-- Stores end-of-workout athlete summary, comments/questions, badges, and PR highlights.
-- Run in Supabase SQL editor.

begin;

alter table public.athlete_exercise_history
  add column if not exists workout_summary jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'athlete_exercise_history_workout_summary_object_chk'
      and conrelid = 'public.athlete_exercise_history'::regclass
  ) then
    alter table public.athlete_exercise_history
      add constraint athlete_exercise_history_workout_summary_object_chk
      check (
        workout_summary is null
        or jsonb_typeof(workout_summary) = 'object'
      );
  end if;
end;
$$;

create index if not exists athlete_exercise_history_completed_slot_idx
  on public.athlete_exercise_history (athlete_user_id, slot_key, workout_completed_at desc);

commit;
