-- Diagnose why a membership payment task shows "Invoice Unavailable"
-- Run in Supabase SQL Editor.

with payment_tasks as (
  select
    aoia.id,
    aoia.athlete_user_id,
    u.email as athlete_email,
    aoia.form_id,
    aoia.form_name,
    aoia.status,
    aoia.assigned_at,
    aoia.submitted_at,
    aoia.updated_at,
    aoia.response_data,
    coalesce(
      nullif(trim(coalesce(aoia.response_data ->> 'invoice_url', '')), ''),
      nullif(trim(coalesce(aoia.response_data ->> 'hosted_invoice_url', '')), ''),
      nullif(trim(coalesce(aoia.response_data ->> 'invoice_pdf', '')), ''),
      nullif(trim(coalesce(aoia.response_data #>> '{payment,invoice_url}', '')), ''),
      nullif(trim(coalesce(aoia.response_data #>> '{payment,hosted_invoice_url}', '')), ''),
      nullif(trim(coalesce(aoia.response_data #>> '{payment,invoice_pdf}', '')), '')
    ) as response_invoice_url,
    coalesce(
      nullif(trim(coalesce(aoia.response_data ->> 'invoice_id', '')), ''),
      nullif(trim(coalesce(aoia.response_data ->> 'latest_invoice_id', '')), ''),
      nullif(trim(coalesce(aoia.response_data ->> 'stripe_invoice_id', '')), ''),
      nullif(trim(coalesce(aoia.response_data #>> '{payment,invoice_id}', '')), ''),
      nullif(trim(coalesce(aoia.response_data #>> '{payment,latest_invoice_id}', '')), ''),
      nullif(trim(coalesce(aoia.response_data #>> '{payment,stripe_invoice_id}', '')), '')
    ) as response_invoice_id,
    nullif(trim(coalesce(aoia.response_data ->> 'stripe_checkout_session_id', '')), '') as response_checkout_session_id
  from public.athlete_onboarding_intake_assignments aoia
  join auth.users u on u.id = aoia.athlete_user_id
  where aoia.status in ('submitted', 'archived')
    and (
      aoia.form_id = 'membership-payment-task-v1'
      or lower(coalesce(aoia.form_name, '')) like '%membership%payment%'
      or lower(coalesce(aoia.form_schema ->> 'action_url', '')) like '%founding-member.html%checkout=start%'
    )
),
latest_subscriptions as (
  select distinct on (coalesce(fms.user_id::text, lower(coalesce(fms.customer_email, ''))))
    fms.id,
    fms.user_id,
    lower(coalesce(fms.customer_email, '')) as customer_email_lower,
    fms.stripe_checkout_session_id,
    fms.stripe_subscription_id,
    coalesce(
      nullif(trim(coalesce(fms.metadata ->> 'invoice_url', '')), ''),
      nullif(trim(coalesce(fms.metadata ->> 'hosted_invoice_url', '')), ''),
      nullif(trim(coalesce(fms.metadata ->> 'latest_invoice_url', '')), ''),
      nullif(trim(coalesce(fms.metadata ->> 'receipt_url', '')), ''),
      nullif(trim(coalesce(fms.metadata #>> '{invoice_history,0,hosted_invoice_url}', '')), ''),
      nullif(trim(coalesce(fms.raw_event #>> '{data,object,hosted_invoice_url}', '')), ''),
      nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice_url}', '')), ''),
      nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice,hosted_invoice_url}', '')), ''),
      nullif(trim(coalesce(fms.raw_event #>> '{data,object,latest_invoice,hosted_invoice_url}', '')), '')
    ) as subscription_invoice_url,
    coalesce(
      nullif(trim(coalesce(fms.metadata ->> 'invoice_id', '')), ''),
      nullif(trim(coalesce(fms.metadata ->> 'latest_invoice_id', '')), ''),
      nullif(trim(coalesce(fms.metadata ->> 'stripe_invoice_id', '')), ''),
      nullif(trim(coalesce(fms.metadata #>> '{invoice_history,0,invoice_id}', '')), ''),
      nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice}', '')), ''),
      nullif(trim(coalesce(fms.raw_event #>> '{data,object,latest_invoice}', '')), ''),
      nullif(trim(coalesce(fms.raw_event #>> '{data,object,invoice,id}', '')), ''),
      nullif(trim(coalesce(fms.raw_event #>> '{data,object,latest_invoice,id}', '')), ''),
      nullif(trim(coalesce(fms.raw_event #>> '{data,object,id}', '')), '')
    ) as subscription_invoice_id,
    fms.last_event_type,
    fms.last_event_created_at,
    fms.updated_at
  from public.founding_member_subscriptions fms
  order by coalesce(fms.user_id::text, lower(coalesce(fms.customer_email, ''))),
           coalesce(fms.last_event_created_at, fms.updated_at, fms.created_at) desc
)
select
  pt.id as assignment_id,
  pt.athlete_user_id,
  pt.athlete_email,
  pt.status,
  pt.assigned_at,
  pt.submitted_at,
  pt.response_invoice_url,
  pt.response_invoice_id,
  pt.response_checkout_session_id,
  ls.subscription_invoice_url,
  ls.subscription_invoice_id,
  ls.stripe_checkout_session_id as subscription_checkout_session_id,
  ls.stripe_subscription_id,
  ls.last_event_type,
  ls.last_event_created_at,
  case
    when pt.response_invoice_url is not null then 'response_data has invoice url'
    when pt.response_invoice_id is not null and pt.response_invoice_id like 'in_%' then 'response_data has invoice id only'
    when ls.subscription_invoice_url is not null then 'subscription row has invoice url'
    when ls.subscription_invoice_id is not null and ls.subscription_invoice_id like 'in_%' then 'subscription row has invoice id only'
    when ls.id is null then 'no subscription row matched athlete'
    else 'no invoice fields found in response_data or subscription row'
  end as diagnosis
from payment_tasks pt
left join latest_subscriptions ls
  on ls.user_id = pt.athlete_user_id
  or (ls.customer_email_lower <> '' and ls.customer_email_lower = lower(coalesce(pt.athlete_email, '')))
order by pt.updated_at desc;