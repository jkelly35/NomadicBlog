-- Founding Member Phase 2 Verification Queries
-- Run these in Supabase SQL editor after legal signing + payment tests.

-- 1) Check onboarding stage/payment timestamps for founding members.
select
  fmo.athlete_user_id,
  au.email as athlete_email,
  fmo.stage,
  fmo.docs_signed_at,
  fmo.payment_completed_at,
  fmo.welcome_completed_at,
  fmo.updated_at
from public.founding_member_onboarding fmo
left join auth.users au on au.id = fmo.athlete_user_id
where fmo.is_founding_member = true
order by fmo.updated_at desc;

-- 2) Check legal signatures captured.
select
  fls.athlete_user_id,
  au.email as athlete_email,
  fls.document_slug,
  fls.document_version,
  fls.signed_name,
  fls.signed_email,
  fls.signed_at
from public.founding_member_legal_signatures fls
left join auth.users au on au.id = fls.athlete_user_id
order by fls.signed_at desc;

-- 3) Check Stripe subscription ingest (webhook writes).
select
  fms.user_id,
  au.email as athlete_email,
  fms.status,
  fms.amount_cents,
  fms.currency,
  fms.price_id,
  fms.stripe_subscription_id,
  fms.last_event_type,
  fms.last_event_created_at,
  fms.updated_at
from public.founding_member_subscriptions fms
left join auth.users au on au.id = fms.user_id
order by fms.updated_at desc;

-- 4) Ensure athlete account is active post-payment.
select
  ap.user_id,
  au.email as athlete_email,
  ap.is_active,
  ap.updated_at
from public.athlete_profiles ap
left join auth.users au on au.id = ap.user_id
where ap.user_id in (
  select athlete_user_id
  from public.founding_member_onboarding
  where is_founding_member = true
)
order by ap.updated_at desc;

-- 5) Intake completion summary to validate auto-advance trigger behavior.
select
  aoia.athlete_user_id,
  au.email as athlete_email,
  count(*) filter (where aoia.status <> 'archived') as active_forms,
  count(*) filter (where aoia.status = 'submitted') as submitted_forms,
  max(aoia.updated_at) as last_form_update
from public.athlete_onboarding_intake_assignments aoia
left join auth.users au on au.id = aoia.athlete_user_id
group by aoia.athlete_user_id, au.email
order by last_form_update desc;

-- 6) Stage distribution snapshot.
select
  stage,
  count(*) as members
from public.founding_member_onboarding
where is_founding_member = true
group by stage
order by members desc, stage asc;
