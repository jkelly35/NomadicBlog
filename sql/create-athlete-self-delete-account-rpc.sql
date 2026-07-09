-- Nomadic Performance - athlete self-delete account RPC
-- Run this in Supabase SQL Editor.

begin;

create or replace function public.athlete_delete_own_account()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_user_id uuid := auth.uid();
  deleted_auth_count integer := 0;
begin
  if target_user_id is null then
    raise exception 'not authenticated';
  end if;

  -- Remove athlete-owned rows first to avoid FK constraint issues where cascade is not configured.
  delete from public.athlete_onboarding_intake_assignments where athlete_user_id = target_user_id;
  delete from public.athlete_program_schedule where user_id = target_user_id;
  delete from public.user_training_programs where user_id = target_user_id;
  delete from public.athlete_goals_events where user_id = target_user_id;
  delete from public.athlete_nutrition_food_entries where user_id = target_user_id;
  delete from public.athlete_nutrition_logs where user_id = target_user_id;
  delete from public.athlete_nutrition_targets where user_id = target_user_id;
  delete from public.athlete_strava_daily_metrics where user_id = target_user_id;
  delete from public.athlete_strava_tokens where user_id = target_user_id;
  delete from public.athlete_strava_connections where user_id = target_user_id;
  delete from public.athlete_whoop_daily_metrics where user_id = target_user_id;
  delete from public.athlete_whoop_tokens where user_id = target_user_id;
  delete from public.athlete_whoop_connections where user_id = target_user_id;
  delete from public.coach_athlete_messages where athlete_user_id = target_user_id;
  delete from public.founding_member_legal_signatures where athlete_user_id = target_user_id;
  delete from public.founding_member_onboarding where athlete_user_id = target_user_id;
  delete from public.founding_member_subscriptions where user_id = target_user_id;
  delete from public.membership_inquiries where user_id = target_user_id;
  delete from public.athlete_metrics where user_id = target_user_id;
  delete from public.athlete_profiles where user_id = target_user_id;

  delete from auth.users where id = target_user_id;
  get diagnostics deleted_auth_count = row_count;

  return jsonb_build_object(
    'ok', deleted_auth_count > 0,
    'deleted_auth_rows', deleted_auth_count
  );
end;
$$;

revoke all on function public.athlete_delete_own_account() from public;
grant execute on function public.athlete_delete_own_account() to authenticated;

commit;

-- Verify:
-- select proname from pg_proc where proname = 'athlete_delete_own_account';
