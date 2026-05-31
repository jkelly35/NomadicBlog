-- Nomadic Performance - coach/athlete messaging
-- Supports direct, group, and all-athlete coach messages.
-- Run in Supabase SQL editor.

begin;

create or replace function public.is_nomadic_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.email(), '')) = 'joe@nomadicperformance.com';
$$;

create or replace function public.nomadic_admin_user_id()
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select u.id
  from auth.users u
  where lower(coalesce(u.email, '')) = 'joe@nomadicperformance.com'
  order by u.created_at asc
  limit 1;
$$;

create table if not exists public.coach_athlete_messages (
  id uuid primary key default gen_random_uuid(),
  coach_user_id uuid not null references auth.users(id) on delete cascade,
  athlete_user_id uuid not null references auth.users(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('coach', 'athlete')),
  delivery_scope text not null default 'direct' check (delivery_scope in ('direct', 'group', 'all')),
  delivery_label text,
  body text not null check (length(trim(body)) > 0),
  read_by_coach_at timestamptz,
  read_by_athlete_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coach_athlete_messages_coach_idx
  on public.coach_athlete_messages (coach_user_id, created_at desc);

create index if not exists coach_athlete_messages_athlete_idx
  on public.coach_athlete_messages (athlete_user_id, created_at desc);

create index if not exists coach_athlete_messages_thread_idx
  on public.coach_athlete_messages (coach_user_id, athlete_user_id, created_at desc);

alter table public.coach_athlete_messages enable row level security;

drop policy if exists "coach_athlete_messages_select_own_or_admin" on public.coach_athlete_messages;
create policy "coach_athlete_messages_select_own_or_admin"
on public.coach_athlete_messages
for select
to authenticated
using (
  auth.uid() = coach_user_id
  or auth.uid() = athlete_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "coach_athlete_messages_insert_sender_only" on public.coach_athlete_messages;
create policy "coach_athlete_messages_insert_sender_only"
on public.coach_athlete_messages
for insert
to authenticated
with check (
  sender_user_id = auth.uid()
  and (
    (sender_role = 'coach' and auth.uid() = coach_user_id and public.is_nomadic_admin())
    or (sender_role = 'athlete' and auth.uid() = athlete_user_id)
  )
);

drop policy if exists "coach_athlete_messages_update_read_state" on public.coach_athlete_messages;
create policy "coach_athlete_messages_update_read_state"
on public.coach_athlete_messages
for update
to authenticated
using (
  auth.uid() = coach_user_id
  or auth.uid() = athlete_user_id
  or public.is_nomadic_admin()
)
with check (
  auth.uid() = coach_user_id
  or auth.uid() = athlete_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "coach_athlete_messages_delete_admin_only" on public.coach_athlete_messages;
create policy "coach_athlete_messages_delete_admin_only"
on public.coach_athlete_messages
for delete
to authenticated
using (public.is_nomadic_admin());

create or replace function public.coach_athlete_messages_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.coach_send_message(
  p_athlete_user_id uuid,
  p_body text,
  p_delivery_scope text default 'direct',
  p_delivery_label text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_message_id uuid;
  v_scope text;
begin
  if not public.is_nomadic_admin() then
    raise exception 'Only coach/admin can send coach messages.';
  end if;

  if p_athlete_user_id is null then
    raise exception 'Athlete recipient is required.';
  end if;

  if p_body is null or length(trim(p_body)) = 0 then
    raise exception 'Message body is required.';
  end if;

  v_scope := lower(coalesce(trim(p_delivery_scope), 'direct'));
  if v_scope not in ('direct', 'group', 'all') then
    v_scope := 'direct';
  end if;

  insert into public.coach_athlete_messages (
    coach_user_id,
    athlete_user_id,
    sender_user_id,
    sender_role,
    delivery_scope,
    delivery_label,
    body,
    read_by_coach_at,
    read_by_athlete_at
  )
  values (
    auth.uid(),
    p_athlete_user_id,
    auth.uid(),
    'coach',
    v_scope,
    p_delivery_label,
    trim(p_body),
    now(),
    null
  )
  returning id into v_message_id;

  return v_message_id;
end;
$$;

create or replace function public.athlete_send_message(
  p_body text,
  p_coach_user_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_message_id uuid;
  v_coach_user_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if p_body is null or length(trim(p_body)) = 0 then
    raise exception 'Message body is required.';
  end if;

  v_coach_user_id := p_coach_user_id;

  if v_coach_user_id is null then
    select ap.coach_user_id
      into v_coach_user_id
      from public.athlete_profiles ap
      where ap.user_id = auth.uid()
      limit 1;
  end if;

  if v_coach_user_id is null then
    select m.coach_user_id
      into v_coach_user_id
      from public.coach_athlete_messages m
      where m.athlete_user_id = auth.uid()
      order by m.created_at desc
      limit 1;
  end if;

  if v_coach_user_id is null then
    v_coach_user_id := public.nomadic_admin_user_id();
  end if;

  if v_coach_user_id is null then
    raise exception 'No coach account available for this athlete.';
  end if;

  insert into public.coach_athlete_messages (
    coach_user_id,
    athlete_user_id,
    sender_user_id,
    sender_role,
    delivery_scope,
    body,
    read_by_coach_at,
    read_by_athlete_at
  )
  values (
    v_coach_user_id,
    auth.uid(),
    auth.uid(),
    'athlete',
    'direct',
    trim(p_body),
    null,
    now()
  )
  returning id into v_message_id;

  return v_message_id;
end;
$$;

drop trigger if exists trg_coach_athlete_messages_updated_at on public.coach_athlete_messages;
create trigger trg_coach_athlete_messages_updated_at
before update on public.coach_athlete_messages
for each row
execute function public.coach_athlete_messages_set_updated_at();

grant execute on function public.nomadic_admin_user_id() to authenticated;
grant execute on function public.coach_send_message(uuid, text, text, text) to authenticated;
grant execute on function public.athlete_send_message(text, uuid) to authenticated;

commit;
