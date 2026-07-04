-- Whoop integration tables for athlete dashboard sync.
-- Run this in Supabase SQL editor before enabling frontend Whoop connect/sync actions.

begin;

create table if not exists public.athlete_whoop_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  whoop_user_id text,
  scopes text[] not null default '{}',
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  sync_status text not null default 'connected',
  updated_at timestamptz not null default now()
);

create table if not exists public.athlete_whoop_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  whoop_user_id text,
  access_token text not null,
  refresh_token text not null,
  token_expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.athlete_whoop_daily_metrics (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  metric_date date not null,
  recovery_score numeric,
  resting_hr numeric,
  hrv_ms numeric,
  sleep_hours numeric,
  day_strain numeric,
  workout_count integer not null default 0,
  workout_duration_sec integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, metric_date)
);

create index if not exists athlete_whoop_daily_metrics_user_date_idx
  on public.athlete_whoop_daily_metrics (user_id, metric_date desc);

create or replace function public.nomadic_whoop_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_athlete_whoop_connections_updated_at on public.athlete_whoop_connections;
create trigger trg_athlete_whoop_connections_updated_at
before update on public.athlete_whoop_connections
for each row
execute function public.nomadic_whoop_set_updated_at();

drop trigger if exists trg_athlete_whoop_tokens_updated_at on public.athlete_whoop_tokens;
create trigger trg_athlete_whoop_tokens_updated_at
before update on public.athlete_whoop_tokens
for each row
execute function public.nomadic_whoop_set_updated_at();

drop trigger if exists trg_athlete_whoop_daily_metrics_updated_at on public.athlete_whoop_daily_metrics;
create trigger trg_athlete_whoop_daily_metrics_updated_at
before update on public.athlete_whoop_daily_metrics
for each row
execute function public.nomadic_whoop_set_updated_at();

alter table public.athlete_whoop_connections enable row level security;
alter table public.athlete_whoop_tokens enable row level security;
alter table public.athlete_whoop_daily_metrics enable row level security;

-- Athlete and coach can read connection + metrics.
drop policy if exists "whoop_connections_read_own_or_coach" on public.athlete_whoop_connections;
create policy "whoop_connections_read_own_or_coach"
on public.athlete_whoop_connections
for select
using (
  auth.uid() = user_id
  or (auth.jwt() ->> 'email') = 'joe@nomadicperformance.com'
);

drop policy if exists "whoop_daily_metrics_read_own_or_coach" on public.athlete_whoop_daily_metrics;
create policy "whoop_daily_metrics_read_own_or_coach"
on public.athlete_whoop_daily_metrics
for select
using (
  auth.uid() = user_id
  or (auth.jwt() ->> 'email') = 'joe@nomadicperformance.com'
);

-- Tokens should never be readable by client users.
drop policy if exists "whoop_tokens_deny_client_reads" on public.athlete_whoop_tokens;
create policy "whoop_tokens_deny_client_reads"
on public.athlete_whoop_tokens
for select
using (false);

-- Service role (edge functions) manages all writes.
drop policy if exists "whoop_connections_service_manage" on public.athlete_whoop_connections;
create policy "whoop_connections_service_manage"
on public.athlete_whoop_connections
for all
to service_role
using (true)
with check (true);

drop policy if exists "whoop_tokens_service_manage" on public.athlete_whoop_tokens;
create policy "whoop_tokens_service_manage"
on public.athlete_whoop_tokens
for all
to service_role
using (true)
with check (true);

drop policy if exists "whoop_daily_metrics_service_manage" on public.athlete_whoop_daily_metrics;
create policy "whoop_daily_metrics_service_manage"
on public.athlete_whoop_daily_metrics
for all
to service_role
using (true)
with check (true);

commit;

-- Required edge functions:
-- 1) whoop-connect-start: returns Whoop OAuth URL.
-- 2) whoop-connect-callback: handles OAuth callback + token exchange and stores connection.
-- 3) whoop-sync-latest: refreshes token if needed, fetches recent Whoop metrics, and upserts daily rows.
-- 4) whoop-disconnect: revokes access (best effort) and deletes local Whoop rows.
