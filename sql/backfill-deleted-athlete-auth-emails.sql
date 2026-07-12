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

  return original_email;
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
