-- Nomadic Performance - coach-saved workout blocks
-- Shared library for reusable warm-ups and workout portions.
-- Run in Supabase SQL editor.

begin;

create or replace function public.is_nomadic_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.email(), '')) = 'joe@nomadicperformance.com';
$$;

create table if not exists public.coach_workout_blocks (
  id uuid primary key default gen_random_uuid(),
  coach_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  source_section text not null default 'Workout Block',
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  exercises jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coach_workout_blocks_coach_idx
  on public.coach_workout_blocks (coach_user_id, created_at desc);

alter table public.coach_workout_blocks enable row level security;

drop policy if exists "coach_workout_blocks_select_coach_or_admin" on public.coach_workout_blocks;
create policy "coach_workout_blocks_select_coach_or_admin"
on public.coach_workout_blocks
for select
to authenticated
using (
  auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "coach_workout_blocks_insert_admin_only" on public.coach_workout_blocks;
create policy "coach_workout_blocks_insert_admin_only"
on public.coach_workout_blocks
for insert
to authenticated
with check (
  auth.uid() = coach_user_id
  and public.is_nomadic_admin()
);

drop policy if exists "coach_workout_blocks_update_admin_only" on public.coach_workout_blocks;
create policy "coach_workout_blocks_update_admin_only"
on public.coach_workout_blocks
for update
to authenticated
using (
  auth.uid() = coach_user_id
  and public.is_nomadic_admin()
)
with check (
  auth.uid() = coach_user_id
  and public.is_nomadic_admin()
);

drop policy if exists "coach_workout_blocks_delete_admin_only" on public.coach_workout_blocks;
create policy "coach_workout_blocks_delete_admin_only"
on public.coach_workout_blocks
for delete
to authenticated
using (
  auth.uid() = coach_user_id
  and public.is_nomadic_admin()
);

create or replace function public.coach_workout_blocks_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_coach_workout_blocks_updated_at on public.coach_workout_blocks;
create trigger trg_coach_workout_blocks_updated_at
before update on public.coach_workout_blocks
for each row
execute function public.coach_workout_blocks_set_updated_at();

commit;
