-- Nomadic Performance - athlete self-delete account RPC (soft delete)
-- Run this in Supabase SQL Editor.

begin;

alter table public.athlete_profiles
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

  if to_regclass('auth.identities') is not null then
    update auth.identities
    set
      identity_data = coalesce(identity_data, '{}'::jsonb) || jsonb_build_object(
        'email', archived_email,
        'archived_original_email', original_email,
        'account_archived', true
      ),
      provider_id = archived_email,
      updated_at = now()
    where user_id = p_target_user_id
      and provider = 'email';
  end if;

  return original_email;
end;
$$;

create or replace function public.release_deleted_account_email_for_signup(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  normalized_email text := lower(trim(coalesce(p_email, '')));
  target_user_id uuid := null;
begin
  if normalized_email = '' then
    return jsonb_build_object('ok', false, 'released', false);
  end if;

  select ap.user_id
  into target_user_id
  from public.athlete_profiles ap
  left join auth.users u on u.id = ap.user_id
  where ap.deleted_at is not null
    and (
      lower(coalesce(ap.deleted_login_email, '')) = normalized_email
      or lower(coalesce(u.email, '')) = normalized_email
    )
  order by ap.deleted_at desc nulls last
  limit 1;

  if target_user_id is null then
    return jsonb_build_object('ok', true, 'released', false);
  end if;

  perform public.release_auth_email_for_deleted_account(target_user_id);

  return jsonb_build_object('ok', true, 'released', true, 'user_id', target_user_id);
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
  updated_profile_count integer := 0;
begin
  if target_user_id is null then
    raise exception 'not authenticated';
  end if;

  -- Soft-delete account to retain legal/waiver and analytics history.
  update public.athlete_profiles
  set
    is_active = false,
    deleted_at = coalesce(deleted_at, now()),
    deleted_by = target_user_id,
    deletion_reason = coalesce(nullif(trim(coalesce(deletion_reason, '')), ''), 'athlete_self_delete')
  where user_id = target_user_id;
  get diagnostics updated_profile_count = row_count;

  perform public.release_auth_email_for_deleted_account(target_user_id);

  if to_regclass('public.user_training_programs') is not null then
    update public.user_training_programs
    set is_active = false
    where user_id = target_user_id
      and is_active = true;
  end if;

  return jsonb_build_object(
    'ok', updated_profile_count > 0,
    'soft_deleted_profile_rows', updated_profile_count
  );
end;
$$;

revoke all on function public.athlete_delete_own_account() from public;
grant execute on function public.athlete_delete_own_account() to authenticated;

commit;

-- Verify:
-- select proname from pg_proc where proname = 'athlete_delete_own_account';
