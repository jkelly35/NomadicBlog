-- Nomadic Performance - enforce soft-delete restrictions in athlete-facing RLS
-- Deleted/inactive athlete accounts keep data for compliance and analytics,
-- but lose self-service read/write access even if they still hold a valid auth session.

begin;

create or replace function public.is_nomadic_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.email(), '')) = 'joe@nomadicperformance.com';
$$;

create or replace function public.nomadic_athlete_account_is_accessible(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(
    (
      select ap.is_active is not false and ap.deleted_at is null
      from public.athlete_profiles ap
      where ap.user_id = target_user_id
      limit 1
    ),
    true
  );
$$;

create or replace function public.get_my_account_access_state()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  target_user_id uuid := auth.uid();
  actor_email text := lower(coalesce(auth.email(), ''));
  accessible boolean := true;
begin
  if target_user_id is null then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'not_authenticated',
      'message', 'You must be signed in.'
    );
  end if;

  if actor_email = 'joe@nomadicperformance.com' then
    return jsonb_build_object(
      'allowed', true,
      'reason', 'admin'
    );
  end if;

  accessible := public.nomadic_athlete_account_is_accessible(target_user_id);
  if accessible then
    return jsonb_build_object(
      'allowed', true,
      'reason', 'active'
    );
  end if;

  if exists (
    select 1
    from public.athlete_profiles ap
    where ap.user_id = target_user_id
      and ap.deleted_at is not null
  ) then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'deleted',
      'message', 'This account has been deleted. Historical records remain on file, but sign-in access has been removed.'
    );
  end if;

  return jsonb_build_object(
    'allowed', false,
    'reason', 'inactive',
    'message', 'This account is inactive. Contact your coach if you believe this is a mistake.'
  );
end;
$$;

revoke all on function public.nomadic_athlete_account_is_accessible(uuid) from public;
revoke all on function public.get_my_account_access_state() from public;
grant execute on function public.nomadic_athlete_account_is_accessible(uuid) to authenticated, service_role;
grant execute on function public.get_my_account_access_state() to authenticated, service_role;

alter table public.athlete_profiles enable row level security;
drop policy if exists "athlete_profiles_select_own_or_admin" on public.athlete_profiles;
create policy "athlete_profiles_select_own_or_admin"
on public.athlete_profiles
for select
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_profiles_insert_own_or_admin" on public.athlete_profiles;
create policy "athlete_profiles_insert_own_or_admin"
on public.athlete_profiles
for insert
with check (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_profiles_update_own_or_admin" on public.athlete_profiles;
create policy "athlete_profiles_update_own_or_admin"
on public.athlete_profiles
for update
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
)
with check (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_profiles_delete_own_or_admin" on public.athlete_profiles;
create policy "athlete_profiles_delete_own_or_admin"
on public.athlete_profiles
for delete
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

alter table public.athlete_goals_events enable row level security;
drop policy if exists "athlete_goals_events_select_own_or_admin" on public.athlete_goals_events;
create policy "athlete_goals_events_select_own_or_admin"
on public.athlete_goals_events
for select
to authenticated
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_goals_events_insert_own_or_admin" on public.athlete_goals_events;
create policy "athlete_goals_events_insert_own_or_admin"
on public.athlete_goals_events
for insert
to authenticated
with check (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_goals_events_update_own_or_admin" on public.athlete_goals_events;
create policy "athlete_goals_events_update_own_or_admin"
on public.athlete_goals_events
for update
to authenticated
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
)
with check (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_goals_events_delete_own_or_admin" on public.athlete_goals_events;
create policy "athlete_goals_events_delete_own_or_admin"
on public.athlete_goals_events
for delete
to authenticated
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

alter table public.athlete_nutrition_targets enable row level security;
drop policy if exists "athlete_nutrition_targets_select_own_or_admin" on public.athlete_nutrition_targets;
create policy "athlete_nutrition_targets_select_own_or_admin"
on public.athlete_nutrition_targets
for select
to authenticated
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_targets_insert_own_or_admin" on public.athlete_nutrition_targets;
create policy "athlete_nutrition_targets_insert_own_or_admin"
on public.athlete_nutrition_targets
for insert
to authenticated
with check (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_targets_update_own_or_admin" on public.athlete_nutrition_targets;
create policy "athlete_nutrition_targets_update_own_or_admin"
on public.athlete_nutrition_targets
for update
to authenticated
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
)
with check (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_targets_delete_own_or_admin" on public.athlete_nutrition_targets;
create policy "athlete_nutrition_targets_delete_own_or_admin"
on public.athlete_nutrition_targets
for delete
to authenticated
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

alter table public.athlete_nutrition_logs enable row level security;
drop policy if exists "athlete_nutrition_logs_select_own_or_admin" on public.athlete_nutrition_logs;
create policy "athlete_nutrition_logs_select_own_or_admin"
on public.athlete_nutrition_logs
for select
to authenticated
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_logs_insert_own_or_admin" on public.athlete_nutrition_logs;
create policy "athlete_nutrition_logs_insert_own_or_admin"
on public.athlete_nutrition_logs
for insert
to authenticated
with check (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_logs_update_own_or_admin" on public.athlete_nutrition_logs;
create policy "athlete_nutrition_logs_update_own_or_admin"
on public.athlete_nutrition_logs
for update
to authenticated
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
)
with check (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_logs_delete_own_or_admin" on public.athlete_nutrition_logs;
create policy "athlete_nutrition_logs_delete_own_or_admin"
on public.athlete_nutrition_logs
for delete
to authenticated
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

alter table public.athlete_nutrition_food_entries enable row level security;
drop policy if exists "athlete_nutrition_food_entries_select_own_or_admin" on public.athlete_nutrition_food_entries;
create policy "athlete_nutrition_food_entries_select_own_or_admin"
on public.athlete_nutrition_food_entries
for select
to authenticated
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_food_entries_insert_own_or_admin" on public.athlete_nutrition_food_entries;
create policy "athlete_nutrition_food_entries_insert_own_or_admin"
on public.athlete_nutrition_food_entries
for insert
to authenticated
with check (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_food_entries_update_own_or_admin" on public.athlete_nutrition_food_entries;
create policy "athlete_nutrition_food_entries_update_own_or_admin"
on public.athlete_nutrition_food_entries
for update
to authenticated
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
)
with check (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_food_entries_delete_own_or_admin" on public.athlete_nutrition_food_entries;
create policy "athlete_nutrition_food_entries_delete_own_or_admin"
on public.athlete_nutrition_food_entries
for delete
to authenticated
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

alter table public.athlete_onboarding_intake_assignments enable row level security;
drop policy if exists "onboarding_intake_select_own_or_coach" on public.athlete_onboarding_intake_assignments;
create policy "onboarding_intake_select_own_or_coach"
on public.athlete_onboarding_intake_assignments
for select
using (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "onboarding_intake_update_athlete_or_coach" on public.athlete_onboarding_intake_assignments;
create policy "onboarding_intake_update_athlete_or_coach"
on public.athlete_onboarding_intake_assignments
for update
using (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
)
with check (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
);

alter table public.athlete_program_schedule enable row level security;
drop policy if exists "athlete_program_schedule_select_own_or_admin" on public.athlete_program_schedule;
create policy "athlete_program_schedule_select_own_or_admin"
on public.athlete_program_schedule
for select
to authenticated
using (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_program_schedule_update_admin_or_athlete" on public.athlete_program_schedule;
create policy "athlete_program_schedule_update_admin_or_athlete"
on public.athlete_program_schedule
for update
to authenticated
using (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
)
with check (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
);

alter table public.athlete_exercise_history enable row level security;
drop policy if exists "athlete_exercise_history_select_own_coach_or_admin" on public.athlete_exercise_history;
create policy "athlete_exercise_history_select_own_coach_or_admin"
on public.athlete_exercise_history
for select
to authenticated
using (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_exercise_history_insert_own_or_admin" on public.athlete_exercise_history;
create policy "athlete_exercise_history_insert_own_or_admin"
on public.athlete_exercise_history
for insert
to authenticated
with check (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_exercise_history_update_own_coach_or_admin" on public.athlete_exercise_history;
create policy "athlete_exercise_history_update_own_coach_or_admin"
on public.athlete_exercise_history
for update
to authenticated
using (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
)
with check (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

alter table public.athlete_recovery_daily enable row level security;
drop policy if exists "athlete_recovery_daily_select_own_coach_or_admin" on public.athlete_recovery_daily;
create policy "athlete_recovery_daily_select_own_coach_or_admin"
on public.athlete_recovery_daily
for select
to authenticated
using (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_recovery_daily_insert_own_or_admin" on public.athlete_recovery_daily;
create policy "athlete_recovery_daily_insert_own_or_admin"
on public.athlete_recovery_daily
for insert
to authenticated
with check (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_recovery_daily_update_own_coach_or_admin" on public.athlete_recovery_daily;
create policy "athlete_recovery_daily_update_own_coach_or_admin"
on public.athlete_recovery_daily
for update
to authenticated
using (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
)
with check (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

alter table public.athlete_programming_sessions enable row level security;
drop policy if exists "athlete_programming_sessions_select_own_coach_or_admin" on public.athlete_programming_sessions;
create policy "athlete_programming_sessions_select_own_coach_or_admin"
on public.athlete_programming_sessions
for select
to authenticated
using (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

alter table public.athlete_cognitive_daily enable row level security;
drop policy if exists "athlete_cognitive_daily_select_own_or_admin" on public.athlete_cognitive_daily;
create policy "athlete_cognitive_daily_select_own_or_admin"
on public.athlete_cognitive_daily
for select
to authenticated
using (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_cognitive_daily_insert_own_or_admin" on public.athlete_cognitive_daily;
create policy "athlete_cognitive_daily_insert_own_or_admin"
on public.athlete_cognitive_daily
for insert
to authenticated
with check (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_cognitive_daily_update_own_or_admin" on public.athlete_cognitive_daily;
create policy "athlete_cognitive_daily_update_own_or_admin"
on public.athlete_cognitive_daily
for update
to authenticated
using (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
)
with check (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
);

alter table public.athlete_context_daily enable row level security;
drop policy if exists "athlete_context_daily_select_own_or_admin" on public.athlete_context_daily;
create policy "athlete_context_daily_select_own_or_admin"
on public.athlete_context_daily
for select
to authenticated
using (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_context_daily_insert_own_or_admin" on public.athlete_context_daily;
create policy "athlete_context_daily_insert_own_or_admin"
on public.athlete_context_daily
for insert
to authenticated
with check (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_context_daily_update_own_or_admin" on public.athlete_context_daily;
create policy "athlete_context_daily_update_own_or_admin"
on public.athlete_context_daily
for update
to authenticated
using (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
)
with check (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
);

alter table public.athlete_assessment_events enable row level security;
drop policy if exists "athlete_assessment_events_select_own_coach_or_admin" on public.athlete_assessment_events;
create policy "athlete_assessment_events_select_own_coach_or_admin"
on public.athlete_assessment_events
for select
to authenticated
using (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_assessment_events_insert_own_coach_or_admin" on public.athlete_assessment_events;
create policy "athlete_assessment_events_insert_own_coach_or_admin"
on public.athlete_assessment_events
for insert
to authenticated
with check (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_assessment_events_update_own_coach_or_admin" on public.athlete_assessment_events;
create policy "athlete_assessment_events_update_own_coach_or_admin"
on public.athlete_assessment_events
for update
to authenticated
using (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
)
with check (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

alter table public.athlete_outcome_events enable row level security;
drop policy if exists "athlete_outcome_events_select_own_coach_or_admin" on public.athlete_outcome_events;
create policy "athlete_outcome_events_select_own_coach_or_admin"
on public.athlete_outcome_events
for select
to authenticated
using (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_outcome_events_insert_own_coach_or_admin" on public.athlete_outcome_events;
create policy "athlete_outcome_events_insert_own_coach_or_admin"
on public.athlete_outcome_events
for insert
to authenticated
with check (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_outcome_events_update_own_coach_or_admin" on public.athlete_outcome_events;
create policy "athlete_outcome_events_update_own_coach_or_admin"
on public.athlete_outcome_events
for update
to authenticated
using (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
)
with check (
  (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or auth.uid() = coach_user_id
  or public.is_nomadic_admin()
);

alter table public.coach_athlete_messages enable row level security;
drop policy if exists "coach_athlete_messages_select_own_or_admin" on public.coach_athlete_messages;
create policy "coach_athlete_messages_select_own_or_admin"
on public.coach_athlete_messages
for select
to authenticated
using (
  auth.uid() = coach_user_id
  or (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
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
    or (sender_role = 'athlete' and auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  )
);

drop policy if exists "coach_athlete_messages_update_read_state" on public.coach_athlete_messages;
create policy "coach_athlete_messages_update_read_state"
on public.coach_athlete_messages
for update
to authenticated
using (
  auth.uid() = coach_user_id
  or (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
)
with check (
  auth.uid() = coach_user_id
  or (auth.uid() = athlete_user_id and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
);

alter table public.founding_member_onboarding enable row level security;
drop policy if exists "founding_member_onboarding_select_self_or_admin" on public.founding_member_onboarding;
create policy "founding_member_onboarding_select_self_or_admin"
on public.founding_member_onboarding
for select
to authenticated
using (
  (athlete_user_id = auth.uid() and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "founding_member_onboarding_update_self_or_admin" on public.founding_member_onboarding;
create policy "founding_member_onboarding_update_self_or_admin"
on public.founding_member_onboarding
for update
to authenticated
using (
  (athlete_user_id = auth.uid() and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
)
with check (
  (athlete_user_id = auth.uid() and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
);

alter table public.founding_member_legal_signatures enable row level security;
drop policy if exists "founding_member_legal_signatures_select_self_or_admin" on public.founding_member_legal_signatures;
create policy "founding_member_legal_signatures_select_self_or_admin"
on public.founding_member_legal_signatures
for select
to authenticated
using (
  (athlete_user_id = auth.uid() and public.nomadic_athlete_account_is_accessible(athlete_user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "founding_member_legal_signatures_insert_self" on public.founding_member_legal_signatures;
create policy "founding_member_legal_signatures_insert_self"
on public.founding_member_legal_signatures
for insert
to authenticated
with check (
  athlete_user_id = auth.uid()
  and public.nomadic_athlete_account_is_accessible(athlete_user_id)
);

alter table public.athlete_strava_connections enable row level security;
alter table public.athlete_strava_daily_metrics enable row level security;
drop policy if exists "strava_connections_read_own_or_coach" on public.athlete_strava_connections;
create policy "strava_connections_read_own_or_coach"
on public.athlete_strava_connections
for select
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "strava_daily_metrics_read_own_or_coach" on public.athlete_strava_daily_metrics;
create policy "strava_daily_metrics_read_own_or_coach"
on public.athlete_strava_daily_metrics
for select
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

alter table public.athlete_whoop_connections enable row level security;
alter table public.athlete_whoop_daily_metrics enable row level security;
drop policy if exists "whoop_connections_read_own_or_coach" on public.athlete_whoop_connections;
create policy "whoop_connections_read_own_or_coach"
on public.athlete_whoop_connections
for select
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

drop policy if exists "whoop_daily_metrics_read_own_or_coach" on public.athlete_whoop_daily_metrics;
create policy "whoop_daily_metrics_read_own_or_coach"
on public.athlete_whoop_daily_metrics
for select
using (
  (auth.uid() = user_id and public.nomadic_athlete_account_is_accessible(user_id))
  or public.is_nomadic_admin()
);

commit;
