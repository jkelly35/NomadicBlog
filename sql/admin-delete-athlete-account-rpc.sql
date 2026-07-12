-- Nomadic Performance - secure coach soft-delete athlete account RPC
-- Run this in Supabase SQL Editor.

begin;

alter table public.athlete_profiles
  add column if not exists is_active boolean not null default true,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid,
  add column if not exists deletion_reason text,
  add column if not exists deleted_login_email text;

create index if not exists idx_athlete_profiles_deleted_at
  on public.athlete_profiles (deleted_at);

create or replace function public.release_auth_email_for_deleted_account(p_target_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  original_email text := '';
  archived_email text := '';
begin
  if p_target_user_id is null then
    return '';
  end if;

  select lower(coalesce(u.email, ''))
  into original_email
  from auth.users u
  where u.id = p_target_user_id
  limit 1;

  if original_email = '' then
    return '';
  end if;

  archived_email := 'deleted+' || replace(p_target_user_id::text, '-', '') || '@archived.nomadic.local';

  update public.athlete_profiles
  set deleted_login_email = coalesce(nullif(trim(coalesce(deleted_login_email, '')), ''), original_email)
  where user_id = p_target_user_id;

  update auth.users
  set
    email = archived_email,
    raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
      'archived_original_email', original_email,
      'account_archived', true
    ),
    updated_at = now()
  where id = p_target_user_id;

  return original_email;
end;
$$;

create or replace function public.admin_delete_athlete_account(target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  updated_profile_count integer := 0;
  deactivated_programs_count integer := 0;
begin
  if target_user_id is null then
    raise exception 'target_user_id is required';
  end if;

  -- Restrict this function to your coach account.
  if auth.uid() is null or lower(coalesce(auth.email(), '')) <> 'joe@nomadicperformance.com' then
    raise exception 'not authorized';
  end if;

  if to_regclass('public.athlete_profiles') is null then
    raise exception 'athlete_profiles table is required';
  end if;

  if to_regclass('public.user_training_programs') is not null then
    update public.user_training_programs
    set is_active = false
    where user_id = target_user_id
      and is_active = true;
    get diagnostics deactivated_programs_count = row_count;
  end if;

  update public.athlete_profiles
  set
    is_active = false,
    deleted_at = coalesce(deleted_at, now()),
    deleted_by = auth.uid(),
    deletion_reason = coalesce(nullif(trim(coalesce(deletion_reason, '')), ''), 'coach_deleted')
  where user_id = target_user_id;
  get diagnostics updated_profile_count = row_count;

  perform public.release_auth_email_for_deleted_account(target_user_id);

  return jsonb_build_object(
    'ok', updated_profile_count > 0,
    'soft_deleted_profile_rows', updated_profile_count,
    'deactivated_program_rows', deactivated_programs_count
  );
end;
$$;

revoke all on function public.admin_delete_athlete_account(uuid) from public;
grant execute on function public.admin_delete_athlete_account(uuid) to authenticated;

commit;

-- Verify:
-- select proname from pg_proc where proname = 'admin_delete_athlete_account';
