-- Nomadic Performance - Stripe founding member subscription records
-- Run in Supabase SQL editor.

begin;

create or replace function public.nomadic_user_id_by_email(target_email text)
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select u.id
  from auth.users u
  where lower(coalesce(u.email, '')) = lower(coalesce(target_email, ''))
  order by u.created_at asc
  limit 1;
$$;

create table if not exists public.founding_member_subscriptions (
  id uuid primary key default gen_random_uuid(),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_checkout_session_id text unique,
  customer_email text,
  user_id uuid references auth.users(id) on delete set null,
  status text,
  price_id text,
  amount_cents integer,
  currency text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  last_event_type text,
  last_event_id text,
  last_event_created_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  raw_event jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists founding_member_subscriptions_email_idx
  on public.founding_member_subscriptions (lower(customer_email));

create index if not exists founding_member_subscriptions_user_idx
  on public.founding_member_subscriptions (user_id);

create index if not exists founding_member_subscriptions_status_idx
  on public.founding_member_subscriptions (status);

create index if not exists founding_member_subscriptions_customer_idx
  on public.founding_member_subscriptions (stripe_customer_id);

create index if not exists founding_member_subscriptions_last_event_idx
  on public.founding_member_subscriptions (last_event_created_at desc);

create or replace function public.set_founding_member_subscriptions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_founding_member_subscriptions_updated_at
  on public.founding_member_subscriptions;

create trigger trg_founding_member_subscriptions_updated_at
before update on public.founding_member_subscriptions
for each row
execute function public.set_founding_member_subscriptions_updated_at();

alter table public.founding_member_subscriptions enable row level security;

drop policy if exists "founding_member_subscriptions_admin_select" on public.founding_member_subscriptions;
create policy "founding_member_subscriptions_admin_select"
on public.founding_member_subscriptions
for select
to authenticated
using (public.is_nomadic_admin());

commit;
