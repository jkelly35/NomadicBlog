-- Nomadic Performance - backfill invoice links onto completed membership payment tasks
-- Run in Supabase SQL Editor.

begin;

-- Ensure the payment completion RPC stores invoice fields for future completions.
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
  v_has_subscription_table boolean := to_regclass('public.founding_member_subscriptions') is not null;
  v_user_email text := '';
  v_invoice_url text := '';
  v_invoice_pdf text := '';
  v_invoice_id text := '';
  v_checkout_session_id text := '';
  v_subscription_id text := '';
begin
  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if p_athlete_user_id is not null and auth.uid() is not null and p_athlete_user_id <> auth.uid() then
    raise exception 'User mismatch.';
  end if;

  select lower(coalesce(u.email, ''))
  into v_user_email
  from auth.users u
  where u.id = v_user_id
  limit 1;

  if v_has_subscription_table then
    select
      coalesce(
        nullif(trim(coalesce(fms.metadata ->> 'invoice_url', '')), ''),
        nullif(trim(coalesce(fms.metadata ->> 'hosted_invoice_url', '')), ''),
        nullif(trim(coalesce(fms.metadata ->> 'latest_invoice_url', '')), ''),
        nullif(trim(coalesce(fms.metadata ->> 'receipt_url', '')), ''),
        nullif(trim(coalesce(fms.metadata #>> '{invoice_history,0,hosted_invoice_url}', '')), ''),
        nullif(trim(coalesce(fms.metadata #>> '{invoice_history,0,invoice_url}', '')), ''),
        nullif(trim(coalesce(fms.metadata #>> '{invoice_history,0,invoice_pdf}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,hosted_invoice_url}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice_url}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice_pdf}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,receipt_url}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice,hosted_invoice_url}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice,invoice_url}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice,invoice_pdf}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice,receipt_url}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,latest_invoice,hosted_invoice_url}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,latest_invoice,invoice_url}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,latest_invoice,invoice_pdf}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,latest_invoice,receipt_url}', '')), '')
      ),
      coalesce(
        nullif(trim(coalesce(fms.metadata ->> 'invoice_pdf', '')), ''),
        nullif(trim(coalesce(fms.metadata ->> 'latest_invoice_pdf', '')), ''),
        nullif(trim(coalesce(fms.metadata #>> '{invoice_history,0,invoice_pdf}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice_pdf}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice,invoice_pdf}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,latest_invoice,invoice_pdf}', '')), '')
      ),
      coalesce(
        nullif(trim(coalesce(fms.metadata ->> 'invoice_id', '')), ''),
        nullif(trim(coalesce(fms.metadata ->> 'latest_invoice_id', '')), ''),
        nullif(trim(coalesce(fms.metadata ->> 'stripe_invoice_id', '')), ''),
        nullif(trim(coalesce(fms.metadata #>> '{invoice_history,0,invoice_id}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice_id}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,latest_invoice}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice,id}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,latest_invoice,id}', '')), ''),
        nullif(trim(coalesce(fms.raw_event #>> '{data,object,id}', '')), '')
      ),
      nullif(trim(coalesce(fms.stripe_checkout_session_id, '')), ''),
      nullif(trim(coalesce(fms.stripe_subscription_id, '')), '')
    into v_invoice_url, v_invoice_pdf, v_invoice_id, v_checkout_session_id, v_subscription_id
    from public.founding_member_subscriptions fms
    where (
      fms.user_id = v_user_id
      or (
        v_user_email <> ''
        and lower(coalesce(fms.customer_email, '')) = v_user_email
      )
    )
    order by coalesce(fms.last_event_created_at, fms.updated_at, fms.created_at) desc
    limit 1;
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
      response_data = coalesce(response_data, '{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
        'payment_completed_at', v_payment_completed_at,
        'invoice_url', nullif(v_invoice_url, ''),
        'hosted_invoice_url', nullif(v_invoice_url, ''),
        'invoice_pdf', nullif(v_invoice_pdf, ''),
        'invoice_id', nullif(v_invoice_id, ''),
        'stripe_checkout_session_id', nullif(v_checkout_session_id, ''),
        'stripe_subscription_id', nullif(v_subscription_id, '')
      )),
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

-- Backfill existing completed membership payment assignments with invoice links.
do $$
begin
  if to_regclass('public.founding_member_subscriptions') is null then
    raise notice 'Skipping invoice backfill: public.founding_member_subscriptions does not exist.';
  else
    with latest_subscription as (
      select distinct on (coalesce(fms.user_id::text, lower(coalesce(fms.customer_email, ''))))
        fms.user_id,
        lower(coalesce(fms.customer_email, '')) as customer_email_lower,
        coalesce(
          nullif(trim(coalesce(fms.metadata ->> 'invoice_url', '')), ''),
          nullif(trim(coalesce(fms.metadata ->> 'hosted_invoice_url', '')), ''),
          nullif(trim(coalesce(fms.metadata ->> 'latest_invoice_url', '')), ''),
          nullif(trim(coalesce(fms.metadata ->> 'receipt_url', '')), ''),
          nullif(trim(coalesce(fms.metadata #>> '{invoice_history,0,hosted_invoice_url}', '')), ''),
          nullif(trim(coalesce(fms.metadata #>> '{invoice_history,0,invoice_url}', '')), ''),
          nullif(trim(coalesce(fms.metadata #>> '{invoice_history,0,invoice_pdf}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,hosted_invoice_url}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice_url}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice_pdf}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,receipt_url}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice,hosted_invoice_url}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice,invoice_url}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice,invoice_pdf}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice,receipt_url}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,latest_invoice,hosted_invoice_url}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,latest_invoice,invoice_url}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,latest_invoice,invoice_pdf}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,latest_invoice,receipt_url}', '')), '')
        ) as invoice_url,
        coalesce(
          nullif(trim(coalesce(fms.metadata ->> 'invoice_pdf', '')), ''),
          nullif(trim(coalesce(fms.metadata ->> 'latest_invoice_pdf', '')), ''),
          nullif(trim(coalesce(fms.metadata #>> '{invoice_history,0,invoice_pdf}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice_pdf}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice,invoice_pdf}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,latest_invoice,invoice_pdf}', '')), '')
        ) as invoice_pdf,
        coalesce(
          nullif(trim(coalesce(fms.metadata ->> 'invoice_id', '')), ''),
          nullif(trim(coalesce(fms.metadata ->> 'latest_invoice_id', '')), ''),
          nullif(trim(coalesce(fms.metadata ->> 'stripe_invoice_id', '')), ''),
          nullif(trim(coalesce(fms.metadata #>> '{invoice_history,0,invoice_id}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice_id}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,latest_invoice}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice,id}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,latest_invoice,id}', '')), ''),
          nullif(trim(coalesce(fms.raw_event #>> '{data,object,id}', '')), '')
        ) as invoice_id,
        nullif(trim(coalesce(fms.stripe_checkout_session_id, '')), '') as stripe_checkout_session_id,
        nullif(trim(coalesce(fms.stripe_subscription_id, '')), '') as stripe_subscription_id
      from public.founding_member_subscriptions fms
      order by coalesce(fms.user_id::text, lower(coalesce(fms.customer_email, ''))),
               coalesce(fms.last_event_created_at, fms.updated_at, fms.created_at) desc
    )
    update public.athlete_onboarding_intake_assignments aoia
    set response_data = coalesce(aoia.response_data, '{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
          'invoice_url', nullif(ls.invoice_url, ''),
          'hosted_invoice_url', nullif(ls.invoice_url, ''),
          'invoice_pdf', nullif(ls.invoice_pdf, ''),
          'invoice_id', nullif(ls.invoice_id, ''),
          'stripe_checkout_session_id', nullif(ls.stripe_checkout_session_id, ''),
          'stripe_subscription_id', nullif(ls.stripe_subscription_id, '')
        )),
        updated_at = now()
    from auth.users u
    left join lateral (
      select ls_pick.*
      from latest_subscription ls_pick
      where ls_pick.user_id = u.id
         or (
           ls_pick.customer_email_lower <> ''
           and ls_pick.customer_email_lower = lower(coalesce(u.email, ''))
         )
      order by case when ls_pick.user_id = u.id then 0 else 1 end
      limit 1
    ) ls on true
    where aoia.athlete_user_id = u.id
      and aoia.status in ('submitted', 'archived')
      and (
        aoia.form_id = 'membership-payment-task-v1'
        or lower(coalesce(aoia.form_name, '')) like '%membership%payment%'
        or lower(coalesce(aoia.form_schema ->> 'action_url', '')) like '%founding-member.html%checkout=start%'
      );
  end if;
end;
$$;

commit;
