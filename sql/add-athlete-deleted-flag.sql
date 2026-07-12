-- Nomadic Performance - add soft-delete tracking fields for athlete accounts

begin;

alter table public.athlete_profiles
  add column if not exists is_active boolean not null default true,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid,
  add column if not exists deletion_reason text,
  add column if not exists deleted_login_email text;

create index if not exists idx_athlete_profiles_deleted_at
  on public.athlete_profiles (deleted_at);

commit;
