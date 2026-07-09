-- Nomadic Performance - seed default liability waiver task for new athlete accounts
-- Run this in Supabase SQL editor or apply via Supabase migrations.

begin;

create or replace function public.ensure_default_liability_waiver_task(p_athlete_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_assignment_id uuid;
begin
  if p_athlete_user_id is null then
    raise exception 'athlete user id is required';
  end if;

  select aoia.id
    into v_assignment_id
    from public.athlete_onboarding_intake_assignments aoia
   where aoia.athlete_user_id = p_athlete_user_id
     and aoia.form_id = 'default-liability-waiver-v1'
   order by aoia.assigned_at desc
   limit 1;

  if v_assignment_id is not null then
    return v_assignment_id;
  end if;

  insert into public.athlete_onboarding_intake_assignments (
    athlete_user_id,
    form_id,
    form_name,
    form_schema,
    response_data,
    status,
    assigned_at,
    assigned_by
  )
  values (
    p_athlete_user_id,
    'default-liability-waiver-v1',
    'Liability Waiver',
    jsonb_build_object(
      'task_type', 'liability_waiver',
      'description', 'Complete this liability waiver first. Once submitted, Browse Programs unlocks in your dashboard.',
      'questions', jsonb_build_array(
        jsonb_build_object(
          'key', 'legal_name',
          'label', 'Full Legal Name',
          'type', 'text',
          'required', true,
          'placeholder', 'Enter your full name'
        ),
        jsonb_build_object(
          'key', 'emergency_contact_name',
          'label', 'Emergency Contact Name',
          'type', 'text',
          'required', true,
          'placeholder', 'Who should we contact in an emergency?'
        ),
        jsonb_build_object(
          'key', 'emergency_contact_phone',
          'label', 'Emergency Contact Phone',
          'type', 'text',
          'required', true,
          'placeholder', 'Best phone number for your emergency contact'
        ),
        jsonb_build_object(
          'key', 'medical_notes',
          'label', 'Relevant Medical Notes',
          'type', 'textarea',
          'rows', 3,
          'placeholder', 'List any medical considerations, allergies, or activity restrictions we should know about.'
        ),
        jsonb_build_object(
          'key', 'waiver_acknowledgement',
          'label', 'Liability Waiver Acknowledgement',
          'type', 'select',
          'required', true,
          'options', jsonb_build_array(
            'I have read and agree to the Nomadic Performance liability waiver.'
          )
        ),
        jsonb_build_object(
          'key', 'signature',
          'label', 'Electronic Signature',
          'type', 'text',
          'required', true,
          'placeholder', 'Type your full name to sign electronically'
        )
      )
    ),
    '{}'::jsonb,
    'assigned',
    now(),
    null
  )
  returning id into v_assignment_id;

  return v_assignment_id;
end;
$$;

create or replace function public.seed_default_liability_waiver_task_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if lower(coalesce(new.email, '')) = 'joe@nomadicperformance.com' then
    return new;
  end if;

  if lower(coalesce(new.raw_user_meta_data->>'role', 'athlete')) <> 'athlete' then
    return new;
  end if;

  perform public.ensure_default_liability_waiver_task(new.id);
  return new;
end;
$$;

create or replace function public.backfill_default_liability_waiver_tasks()
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user record;
  v_processed integer := 0;
begin
  for v_user in
    select u.id
      from auth.users u
     where lower(coalesce(u.email, '')) <> 'joe@nomadicperformance.com'
       and lower(coalesce(u.raw_user_meta_data->>'role', 'athlete')) = 'athlete'
  loop
    perform public.ensure_default_liability_waiver_task(v_user.id);
    v_processed := v_processed + 1;
  end loop;

  return v_processed;
end;
$$;

drop trigger if exists trg_seed_default_liability_waiver_task_on_signup on auth.users;
create trigger trg_seed_default_liability_waiver_task_on_signup
after insert on auth.users
for each row
execute function public.seed_default_liability_waiver_task_on_signup();

select public.backfill_default_liability_waiver_tasks();

grant execute on function public.ensure_default_liability_waiver_task(uuid) to authenticated;

commit;