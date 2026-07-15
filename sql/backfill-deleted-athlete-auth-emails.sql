-- Nomadic Performance - backfill archived auth emails for previously deleted athletes
-- Purpose: free original login emails for already soft-deleted athletes so they can sign up again.
-- Run this once in Supabase SQL Editor after add-athlete-deleted-flag.sql.

begin;

alter table public.athlete_profiles
  add column if not exists deleted_login_email text;

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

do $$
declare
  athlete_row record;
  current_auth_email text;
begin
  for athlete_row in
    select ap.user_id, ap.deleted_login_email
    from public.athlete_profiles ap
    where ap.deleted_at is not null
  loop
    select lower(coalesce(u.email, ''))
    into current_auth_email
    from auth.users u
    where u.id = athlete_row.user_id
    limit 1;

    if current_auth_email = '' then
      continue;
    end if;

    if current_auth_email like 'deleted+%@archived.nomadic.local' then
      continue;
    end if;

    perform public.release_auth_email_for_deleted_account(athlete_row.user_id);
  end loop;
end;
$$;

commit;
