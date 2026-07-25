-- Nomadic Performance - onboarding intake assignment + athlete responses

begin;

create table if not exists public.athlete_onboarding_intake_assignments (
  id uuid primary key default gen_random_uuid(),
  athlete_user_id uuid not null references auth.users(id) on delete cascade,
  form_id text not null,
  form_name text not null,
  form_schema jsonb not null default '{}'::jsonb,
  response_data jsonb not null default '{}'::jsonb,
  status text not null default 'assigned' check (status in ('assigned', 'submitted', 'archived')),
  assigned_at timestamptz not null default now(),
  assigned_by uuid references auth.users(id) on delete set null,
  due_date date,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists onboarding_intake_athlete_idx
  on public.athlete_onboarding_intake_assignments (athlete_user_id, assigned_at desc);

create index if not exists onboarding_intake_status_idx
  on public.athlete_onboarding_intake_assignments (status);

create or replace function public.nomadic_onboarding_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_onboarding_intake_updated_at on public.athlete_onboarding_intake_assignments;
create trigger trg_onboarding_intake_updated_at
before update on public.athlete_onboarding_intake_assignments
for each row
execute function public.nomadic_onboarding_set_updated_at();

alter table public.athlete_onboarding_intake_assignments enable row level security;

drop policy if exists "onboarding_intake_select_own_or_coach" on public.athlete_onboarding_intake_assignments;
create policy "onboarding_intake_select_own_or_coach"
on public.athlete_onboarding_intake_assignments
for select
using (
  auth.uid() = athlete_user_id
  or (auth.jwt() ->> 'email') = 'joe@nomadicperformance.com'
);

drop policy if exists "onboarding_intake_insert_coach_only" on public.athlete_onboarding_intake_assignments;
create policy "onboarding_intake_insert_coach_only"
on public.athlete_onboarding_intake_assignments
for insert
with check (
  (auth.jwt() ->> 'email') = 'joe@nomadicperformance.com'
);

drop policy if exists "onboarding_intake_update_athlete_or_coach" on public.athlete_onboarding_intake_assignments;
create policy "onboarding_intake_update_athlete_or_coach"
on public.athlete_onboarding_intake_assignments
for update
using (
  auth.uid() = athlete_user_id
  and (
    form_id = 'default-liability-waiver-v1'
    or public.nomadic_athlete_account_is_accessible(athlete_user_id)
  )
  or (auth.jwt() ->> 'email') = 'joe@nomadicperformance.com'
)
with check (
  auth.uid() = athlete_user_id
  and (
    form_id = 'default-liability-waiver-v1'
    or public.nomadic_athlete_account_is_accessible(athlete_user_id)
  )
  or (auth.jwt() ->> 'email') = 'joe@nomadicperformance.com'
);

drop policy if exists "onboarding_intake_delete_coach_only" on public.athlete_onboarding_intake_assignments;
create policy "onboarding_intake_delete_coach_only"
on public.athlete_onboarding_intake_assignments
for delete
using (
  (auth.jwt() ->> 'email') = 'joe@nomadicperformance.com'
);

commit;
