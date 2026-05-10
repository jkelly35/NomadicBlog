-- Strava integration tables for athlete dashboard sync.
-- Run this in Supabase SQL editor before enabling frontend Strava connect/sync actions.

create table if not exists public.athlete_strava_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  strava_athlete_id bigint not null,
  athlete_username text,
  athlete_name text,
  scopes text[] not null default '{}',
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  sync_status text not null default 'connected',
  updated_at timestamptz not null default now()
);

create table if not exists public.athlete_strava_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  strava_athlete_id bigint not null,
  access_token text not null,
  refresh_token text not null,
  token_expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.athlete_strava_daily_metrics (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  metric_date date not null,
  activity_count integer not null default 0,
  distance_m numeric,
  moving_time_sec integer,
  elevation_gain_m numeric,
  training_load numeric,
  resting_hr numeric,
  hrv_ms numeric,
  sleep_hours numeric,
  recovery_score numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, metric_date)
);

create index if not exists athlete_strava_daily_metrics_user_date_idx
  on public.athlete_strava_daily_metrics (user_id, metric_date desc);

create or replace function public.nomadic_strava_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_athlete_strava_connections_updated_at on public.athlete_strava_connections;
create trigger trg_athlete_strava_connections_updated_at
before update on public.athlete_strava_connections
for each row
execute function public.nomadic_strava_set_updated_at();

drop trigger if exists trg_athlete_strava_tokens_updated_at on public.athlete_strava_tokens;
create trigger trg_athlete_strava_tokens_updated_at
before update on public.athlete_strava_tokens
for each row
execute function public.nomadic_strava_set_updated_at();

drop trigger if exists trg_athlete_strava_daily_metrics_updated_at on public.athlete_strava_daily_metrics;
create trigger trg_athlete_strava_daily_metrics_updated_at
before update on public.athlete_strava_daily_metrics
for each row
execute function public.nomadic_strava_set_updated_at();

alter table public.athlete_strava_connections enable row level security;
alter table public.athlete_strava_tokens enable row level security;
alter table public.athlete_strava_daily_metrics enable row level security;

-- Athlete and coach can read connection + metrics.
drop policy if exists "strava_connections_read_own_or_coach" on public.athlete_strava_connections;
create policy "strava_connections_read_own_or_coach"
on public.athlete_strava_connections
for select
using (
  auth.uid() = user_id
  or (auth.jwt() ->> 'email') = 'joe@nomadicperformance.com'
);

drop policy if exists "strava_daily_metrics_read_own_or_coach" on public.athlete_strava_daily_metrics;
create policy "strava_daily_metrics_read_own_or_coach"
on public.athlete_strava_daily_metrics
for select
using (
  auth.uid() = user_id
  or (auth.jwt() ->> 'email') = 'joe@nomadicperformance.com'
);

-- Tokens should never be readable by client users.
drop policy if exists "strava_tokens_deny_client_reads" on public.athlete_strava_tokens;
create policy "strava_tokens_deny_client_reads"
on public.athlete_strava_tokens
for select
using (false);

-- Service role (edge functions) manages all writes.
drop policy if exists "strava_connections_service_manage" on public.athlete_strava_connections;
create policy "strava_connections_service_manage"
on public.athlete_strava_connections
for all
to service_role
using (true)
with check (true);

drop policy if exists "strava_tokens_service_manage" on public.athlete_strava_tokens;
create policy "strava_tokens_service_manage"
on public.athlete_strava_tokens
for all
to service_role
using (true)
with check (true);

drop policy if exists "strava_daily_metrics_service_manage" on public.athlete_strava_daily_metrics;
create policy "strava_daily_metrics_service_manage"
on public.athlete_strava_daily_metrics
for all
to service_role
using (true)
with check (true);

-- Required edge functions (to implement in Supabase Functions):
-- 1) strava-connect-start: returns Strava OAuth URL.
-- 2) strava-connect-callback: handles OAuth callback + token exchange and stores connection.
-- 3) strava-disconnect: revokes token and deletes connection/tokens.
-- 4) strava-sync-latest: refreshes token and upserts daily metrics rows.
