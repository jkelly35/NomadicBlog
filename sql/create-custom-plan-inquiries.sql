-- Nomadic Performance - custom plan inquiry intake
-- Allows prospective athletes to inquire about one-time custom plans.

begin;

create table if not exists public.custom_plan_inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  primary_sports text not null,
  primary_goal text not null,
  desired_duration_weeks integer,
  desired_days_per_week integer,
  notes text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'approved', 'declined', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint custom_plan_inquiries_full_name_check check (length(trim(full_name)) > 0),
  constraint custom_plan_inquiries_email_check check (length(trim(email)) > 3),
  constraint custom_plan_inquiries_primary_sports_check check (length(trim(primary_sports)) > 0),
  constraint custom_plan_inquiries_primary_goal_check check (length(trim(primary_goal)) > 0),
  constraint custom_plan_inquiries_duration_check check (desired_duration_weeks is null or desired_duration_weeks between 2 and 52),
  constraint custom_plan_inquiries_days_check check (desired_days_per_week is null or desired_days_per_week between 1 and 7)
);

create index if not exists idx_custom_plan_inquiries_created_at
  on public.custom_plan_inquiries (created_at desc);

create index if not exists idx_custom_plan_inquiries_status
  on public.custom_plan_inquiries (status, created_at desc);

create or replace function public.set_custom_plan_inquiries_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_custom_plan_inquiries_updated_at
  on public.custom_plan_inquiries;

create trigger trg_custom_plan_inquiries_updated_at
before update on public.custom_plan_inquiries
for each row
execute function public.set_custom_plan_inquiries_updated_at();

alter table public.custom_plan_inquiries enable row level security;

drop policy if exists "custom_plan_inquiries_insert_public" on public.custom_plan_inquiries;
create policy "custom_plan_inquiries_insert_public"
on public.custom_plan_inquiries
for insert
with check (true);

drop policy if exists "custom_plan_inquiries_select_admin_only" on public.custom_plan_inquiries;
create policy "custom_plan_inquiries_select_admin_only"
on public.custom_plan_inquiries
for select
to authenticated
using (public.is_nomadic_admin());

drop policy if exists "custom_plan_inquiries_update_admin_only" on public.custom_plan_inquiries;
create policy "custom_plan_inquiries_update_admin_only"
on public.custom_plan_inquiries
for update
to authenticated
using (public.is_nomadic_admin())
with check (public.is_nomadic_admin());

commit;
