-- Nomadic Performance - secure coach delete athlete account RPC
-- Run this in Supabase SQL Editor.

begin;

create or replace function public.admin_delete_athlete_account(target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  deleted_profile_count integer := 0;
  deleted_metrics_count integer := 0;
  deleted_programs_count integer := 0;
  deleted_auth_count integer := 0;
begin
  if target_user_id is null then
    raise exception 'target_user_id is required';
  end if;

  -- Restrict this function to your coach account.
  if auth.uid() is null or lower(coalesce(auth.email(), '')) <> 'joe@nomadicperformance.com' then
    raise exception 'not authorized';
  end if;

  delete from public.user_training_programs where user_id = target_user_id;
  get diagnostics deleted_programs_count = row_count;

  delete from public.athlete_metrics where user_id = target_user_id;
  get diagnostics deleted_metrics_count = row_count;

  delete from public.athlete_profiles where user_id = target_user_id;
  get diagnostics deleted_profile_count = row_count;

  delete from auth.users where id = target_user_id;
  get diagnostics deleted_auth_count = row_count;

  return jsonb_build_object(
    'ok', true,
    'deleted_program_rows', deleted_programs_count,
    'deleted_metric_rows', deleted_metrics_count,
    'deleted_profile_rows', deleted_profile_count,
    'deleted_auth_rows', deleted_auth_count
  );
end;
$$;

revoke all on function public.admin_delete_athlete_account(uuid) from public;
grant execute on function public.admin_delete_athlete_account(uuid) to authenticated;

commit;

-- Verify:
-- select proname from pg_proc where proname = 'admin_delete_athlete_account';
