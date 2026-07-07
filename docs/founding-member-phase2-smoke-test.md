# Founding Member Phase 2 Smoke Test

## Pre-flight
- Deploy updated edge functions:
  - `stripe-create-checkout`
  - `stripe-webhook`
- Ensure SQL migrations are applied:
  - `sql/create-founding-member-payments.sql`
  - `sql/create-founding-member-onboarding-phase1.sql`

## Athlete Flow
1. Sign in as test founding athlete.
2. Open `founding-member.html`.
3. Confirm checkout is blocked if stage is `first_login_pending_docs`.
4. Complete legal docs on `founding-onboarding.html`.
5. Confirm stage becomes `docs_signed_pending_payment`.
6. Return to `founding-member.html` and complete Stripe checkout.
7. Confirm redirect to `founding-payment-success.html`.
8. Click continue to profile and verify onboarding prompt appears in `#profile-onboarding-section`.

## Coach Flow
1. Open `admin.html` as coach.
2. Check Founding Onboarding card shows updated stage and timestamps.
3. Validate controls:
   - Advance
   - Move Back
   - Save Stage override

## Intake Auto-Advance
1. Set test athlete to `welcome_pending_intakes`.
2. Assign two active intake forms.
3. Submit first form as athlete: stage should remain unchanged.
4. Submit second form: stage should auto-advance to `intakes_completed_assessment_pending`.

## Database Verification
- Run `sql/founding-member-phase2-verification.sql` in Supabase SQL editor.
- Validate:
  - legal signatures exist
  - Stripe subscription row exists
  - `payment_completed_at` populated
  - stage progression values are correct
  - athlete account is active after payment
