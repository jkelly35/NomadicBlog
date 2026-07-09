-- Nomadic Performance - athlete self-delete account RPC
-- Run this in Supabase SQL Editor or apply via Supabase migrations.

begin;

drop function if exists public.delete_rows_if_table_exists(text, text, uuid);

create or replace function public.delete_rows_if_table_exists(
  p_table_name text,
  p_column_name text,
  p_target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if to_regclass(p_table_name) is not null
    and exists (
      select 1
      from information_schema.columns c
      where c.table_schema = 'public'
        and c.table_name = split_part(p_table_name, '.', 2)
        and c.column_name = p_column_name
    ) then
    execute format('delete from %s where %I = $1', p_table_name, p_column_name) using p_target_user_id;
  end if;
end;
$$;

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
  perform public.delete_rows_if_table_exists(
    'public.athlete_onboarding_intake_assignments',
    'athlete_user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.athlete_program_schedule',
    'athlete_user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.user_training_programs',
    'user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.athlete_goals_events',
    'user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.athlete_nutrition_food_entries',
    'user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.athlete_nutrition_logs',
    'user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.athlete_nutrition_targets',
    'user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.athlete_strava_daily_metrics',
    'user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.athlete_strava_tokens',
    'user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.athlete_strava_connections',
    'user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.athlete_whoop_daily_metrics',
    'user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.athlete_whoop_tokens',
    'user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.athlete_whoop_connections',
    'user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.coach_athlete_messages',
    'athlete_user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.founding_member_legal_signatures',
    'athlete_user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.founding_member_onboarding',
    'athlete_user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.founding_member_subscriptions',
    'user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.membership_inquiries',
    'user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.athlete_metrics',
    'user_id',
    target_user_id
  );
  perform public.delete_rows_if_table_exists(
    'public.athlete_profiles',
    'user_id',
    target_user_id
  );

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
