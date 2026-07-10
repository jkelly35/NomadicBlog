create or replace function public.complete_founding_member_payment(p_athlete_user_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := coalesce(p_athlete_user_id, auth.uid());
  v_now timestamptz := now();
  v_payment_completed_at timestamptz := v_now;
begin
  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if p_athlete_user_id is not null and auth.uid() is not null and p_athlete_user_id <> auth.uid() then
    raise exception 'User mismatch.';
  end if;

  update public.athlete_profiles
  set is_active = true,
      updated_at = v_now
  where user_id = v_user_id;

  update public.founding_member_onboarding
  set payment_completed_at = v_payment_completed_at,
      stage = case
        when stage in ('invited', 'first_login_pending_docs', 'docs_signed_pending_payment', 'payment_pending')
          then 'welcome_pending_intakes'
        else stage
      end,
      updated_at = v_now
  where athlete_user_id = v_user_id
    and is_founding_member = true;

  update public.athlete_onboarding_intake_assignments
  set status = 'submitted',
      submitted_at = v_now,
      updated_at = v_now
  where athlete_user_id = v_user_id
    and status <> 'archived'
    and (
      form_id = 'membership-payment-task-v1'
      or lower(form_name) like '%membership%payment%'
      or lower(coalesce(form_schema ->> 'action_url', '')) like '%founding-member.html%checkout=start%'
    );

  return jsonb_build_object(
    'ok', true,
    'user_id', v_user_id,
    'payment_completed_at', v_payment_completed_at
  );
end;
$$;

grant execute on function public.complete_founding_member_payment(uuid) to authenticated;