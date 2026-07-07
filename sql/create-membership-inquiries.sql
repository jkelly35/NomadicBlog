-- Nomadic Performance - membership inquiry intake
-- Allows prospective members to submit an inquiry form.

begin;

create table if not exists public.membership_inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  primary_sports text not null,
  primary_goal text not null,
  notes text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'approved', 'declined', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint membership_inquiries_full_name_check check (length(trim(full_name)) > 0),
  constraint membership_inquiries_email_check check (length(trim(email)) > 3),
  constraint membership_inquiries_primary_sports_check check (length(trim(primary_sports)) > 0),
  constraint membership_inquiries_primary_goal_check check (length(trim(primary_goal)) > 0)
);

create index if not exists idx_membership_inquiries_created_at
  on public.membership_inquiries (created_at desc);

create index if not exists idx_membership_inquiries_status
  on public.membership_inquiries (status, created_at desc);

create or replace function public.set_membership_inquiries_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_membership_inquiries_updated_at
  on public.membership_inquiries;

create trigger trg_membership_inquiries_updated_at
before update on public.membership_inquiries
for each row
execute function public.set_membership_inquiries_updated_at();

alter table public.membership_inquiries enable row level security;

drop policy if exists "membership_inquiries_insert_public" on public.membership_inquiries;
create policy "membership_inquiries_insert_public"
on public.membership_inquiries
for insert
with check (true);

drop policy if exists "membership_inquiries_select_admin_only" on public.membership_inquiries;
create policy "membership_inquiries_select_admin_only"
on public.membership_inquiries
for select
to authenticated
using (public.is_nomadic_admin());

drop policy if exists "membership_inquiries_update_admin_only" on public.membership_inquiries;
create policy "membership_inquiries_update_admin_only"
on public.membership_inquiries
for update
to authenticated
using (public.is_nomadic_admin())
with check (public.is_nomadic_admin());

commit;
