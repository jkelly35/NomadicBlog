import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

type StripeEvent = {
  id?: string;
  type?: string;
  created?: number;
  data?: {
    object?: Record<string, unknown>;
  };
};

type NormalizedEvent = {
  eventId: string;
  eventType: string;
  eventCreatedAt: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeCheckoutSessionId: string | null;
  customerEmail: string | null;
  status: string | null;
  priceId: string | null;
  amountCents: number | null;
  currency: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  metadata: Record<string, unknown>;
  shouldActivateMember: boolean;
  foundingSignal: boolean;
  metadataUserId: string | null;
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

function getRequiredEnv(name: string): string {
  const value = String(Deno.env.get(name) || "").trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createServiceClient() {
  const supabaseUrl = getRequiredEnv("SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

function parseStripeSignatureHeader(header: string | null) {
  const raw = String(header || "").trim();
  if (!raw) {
    throw new Error("Missing Stripe signature header.");
  }

  const parts = raw.split(",").map((part) => part.trim()).filter(Boolean);
  const parsed: { timestamp: number | null; signatures: string[] } = {
    timestamp: null,
    signatures: []
  };

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (!key || !value) {
      continue;
    }

    if (key === "t") {
      const ts = Number(value);
      if (Number.isFinite(ts) && ts > 0) {
        parsed.timestamp = ts;
      }
      continue;
    }

    if (key === "v1") {
      parsed.signatures.push(value);
    }
  }

  if (!parsed.timestamp || !parsed.signatures.length) {
    throw new Error("Invalid Stripe signature header.");
  }

  return parsed;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

async function computeStripeSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(new Uint8Array(signatureBuffer));
}

async function verifyStripeSignature(rawBody: string, signatureHeader: string | null, webhookSecret: string) {
  const parsed = parseStripeSignatureHeader(signatureHeader);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const ageSeconds = Math.abs(nowSeconds - (parsed.timestamp || 0));

  if (ageSeconds > 300) {
    throw new Error("Stripe signature timestamp is outside the allowed tolerance.");
  }

  const signedPayload = `${parsed.timestamp}.${rawBody}`;
  const expectedSignature = await computeStripeSignature(signedPayload, webhookSecret);

  const isMatch = parsed.signatures.some((candidate) => timingSafeEqual(candidate, expectedSignature));
  if (!isMatch) {
    throw new Error("Stripe signature verification failed.");
  }
}

function toIsoFromUnix(value: unknown): string | null {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    return null;
  }
  return new Date(num * 1000).toISOString();
}

function getString(value: unknown): string | null {
  const text = String(value == null ? "" : value).trim();
  return text || null;
}

function getMetadata(object: Record<string, unknown>): Record<string, unknown> {
  const metadata = object.metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }
  return metadata as Record<string, unknown>;
}

function getSubscriptionPriceId(object: Record<string, unknown>): string | null {
  const items = object.items;
  if (!items || typeof items !== "object") {
    return null;
  }

  const itemsData = (items as { data?: unknown }).data;
  if (!Array.isArray(itemsData) || !itemsData.length) {
    return null;
  }

  const first = itemsData[0];
  if (!first || typeof first !== "object") {
    return null;
  }

  const price = (first as { price?: unknown }).price;
  if (!price || typeof price !== "object") {
    return null;
  }

  return getString((price as { id?: unknown }).id);
}

function getInvoicePriceId(object: Record<string, unknown>): string | null {
  const lines = object.lines;
  if (!lines || typeof lines !== "object") {
    return null;
  }

  const lineData = (lines as { data?: unknown }).data;
  if (!Array.isArray(lineData) || !lineData.length) {
    return null;
  }

  const firstLine = lineData[0];
  if (!firstLine || typeof firstLine !== "object") {
    return null;
  }

  const pricing = (firstLine as { pricing?: unknown }).pricing;
  if (pricing && typeof pricing === "object") {
    const priceDetails = (pricing as { price_details?: unknown }).price_details;
    if (priceDetails && typeof priceDetails === "object") {
      const fromDetails = getString((priceDetails as { price?: unknown }).price);
      if (fromDetails) {
        return fromDetails;
      }
    }
  }

  const price = (firstLine as { price?: unknown }).price;
  if (price && typeof price === "object") {
    return getString((price as { id?: unknown }).id);
  }

  return null;
}

function normalizeEvent(event: StripeEvent, foundingMemberPriceId: string): NormalizedEvent | null {
  const eventId = getString(event.id);
  const eventType = getString(event.type);
  const eventCreatedAt = toIsoFromUnix(event.created) || new Date().toISOString();
  const object = (event.data && event.data.object) || {};

  if (!eventId || !eventType || !object || typeof object !== "object") {
    return null;
  }

  const metadata = getMetadata(object);
  const plan = String(metadata.plan || "").trim().toLowerCase();
  const source = String(metadata.source || "").trim().toLowerCase();
  const metadataUserId = getString(metadata.user_id);

  let stripeCustomerId: string | null = null;
  let stripeSubscriptionId: string | null = null;
  let stripeCheckoutSessionId: string | null = null;
  let customerEmail: string | null = null;
  let status: string | null = null;
  let priceId: string | null = null;
  let amountCents: number | null = null;
  let currency: string | null = null;
  let currentPeriodStart: string | null = null;
  let currentPeriodEnd: string | null = null;
  let cancelAtPeriodEnd = false;
  let shouldActivateMember = false;

  if (eventType === "checkout.session.completed" || eventType === "checkout.session.async_payment_succeeded") {
    stripeCheckoutSessionId = getString(object.id);
    stripeCustomerId = getString(object.customer);
    stripeSubscriptionId = getString(object.subscription);
    customerEmail = getString((object.customer_details as { email?: unknown } | undefined)?.email) || getString(object.customer_email);
    status = getString(object.payment_status) || "completed";
    amountCents = Number.isFinite(Number(object.amount_total)) ? Number(object.amount_total) : null;
    currency = getString(object.currency);
    shouldActivateMember = status === "paid" || status === "no_payment_required";
  } else if (
    eventType === "customer.subscription.created" ||
    eventType === "customer.subscription.updated" ||
    eventType === "customer.subscription.deleted"
  ) {
    stripeSubscriptionId = getString(object.id);
    stripeCustomerId = getString(object.customer);
    status = getString(object.status);
    priceId = getSubscriptionPriceId(object);
    currentPeriodStart = toIsoFromUnix(object.current_period_start);
    currentPeriodEnd = toIsoFromUnix(object.current_period_end);
    cancelAtPeriodEnd = Boolean(object.cancel_at_period_end);
    shouldActivateMember = status === "active" || status === "trialing";
  } else if (eventType === "invoice.payment_succeeded" || eventType === "invoice.payment_failed") {
    stripeSubscriptionId = getString(object.subscription);
    stripeCustomerId = getString(object.customer);
    customerEmail = getString(object.customer_email);
    status = eventType === "invoice.payment_succeeded" ? "active" : "past_due";
    amountCents = Number.isFinite(Number(object.amount_paid)) ? Number(object.amount_paid) : null;
    currency = getString(object.currency);
    priceId = getInvoicePriceId(object);
    shouldActivateMember = eventType === "invoice.payment_succeeded";
  } else {
    return null;
  }

  const foundingSignal =
    plan === "founding_member" ||
    source.indexOf("founding") !== -1 ||
    (priceId ? priceId === foundingMemberPriceId : false);

  return {
    eventId,
    eventType,
    eventCreatedAt,
    stripeCustomerId,
    stripeSubscriptionId,
    stripeCheckoutSessionId,
    customerEmail,
    status,
    priceId,
    amountCents,
    currency,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    metadata,
    shouldActivateMember,
    foundingSignal,
    metadataUserId
  };
}

function getOnboardingStageRank(stage: string | null): number {
  const value = String(stage || "").trim();
  const lookup: Record<string, number> = {
    invited: 1,
    first_login_pending_docs: 2,
    docs_signed_pending_payment: 3,
    payment_pending: 4,
    welcome_pending_intakes: 5,
    intakes_completed_assessment_pending: 6,
    assessment_in_progress: 7,
    assessment_published_pending_review: 8,
    review_scheduled: 9,
    active_training: 10
  };

  return lookup[value] || 0;
}

async function completeMembershipPaymentTasks(
  admin: ReturnType<typeof createServiceClient>,
  userId: string,
  completedAtIso: string
): Promise<void> {
  const completionPayload = {
    status: "submitted",
    submitted_at: completedAtIso,
    updated_at: completedAtIso
  };

  const { error } = await admin
    .from("athlete_onboarding_intake_assignments")
    .update(completionPayload)
    .eq("athlete_user_id", userId)
    .eq("status", "assigned")
    .or("form_id.eq.membership-payment-task-v1,form_name.ilike.%membership%payment%");

  if (error) {
    throw new Error(error.message);
  }
}

async function advanceFoundingOnboardingAfterPayment(
  admin: ReturnType<typeof createServiceClient>,
  userId: string
): Promise<void> {
  const nowIso = new Date().toISOString();

  const { data: row, error: selectError } = await admin
    .from("founding_member_onboarding")
    .select("athlete_user_id,stage,payment_completed_at")
    .eq("athlete_user_id", userId)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (!row) {
    return;
  }

  const currentStage = getString((row as { stage?: unknown }).stage) || "";
  const currentRank = getOnboardingStageRank(currentStage);
  const welcomeRank = getOnboardingStageRank("welcome_pending_intakes");

  const updates: Record<string, unknown> = {
    payment_completed_at: nowIso
  };

  if (currentRank > 0 && currentRank < welcomeRank) {
    updates.stage = "welcome_pending_intakes";
  }

  const { error: updateError } = await admin
    .from("founding_member_onboarding")
    .update(updates)
    .eq("athlete_user_id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

async function lookupUserIdByEmail(admin: ReturnType<typeof createServiceClient>, email: string | null): Promise<string | null> {
  const targetEmail = getString(email);
  if (!targetEmail) {
    return null;
  }

  const { data, error } = await admin.rpc("nomadic_user_id_by_email", {
    target_email: targetEmail
  });

  if (error) {
    throw new Error(error.message);
  }

  const userId = getString(data);
  return userId;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const webhookSecret = getRequiredEnv("STRIPE_WEBHOOK_SECRET");
    const foundingMemberPriceId = getRequiredEnv("STRIPE_FOUNDING_MEMBER_PRICE_ID");

    const rawBody = await req.text();
    await verifyStripeSignature(rawBody, req.headers.get("stripe-signature"), webhookSecret);

    const event = JSON.parse(rawBody) as StripeEvent;
    const normalized = normalizeEvent(event, foundingMemberPriceId);

    if (!normalized) {
      return jsonResponse({ ok: true, ignored: true, reason: "unsupported_event_type" });
    }

    if (!normalized.foundingSignal && normalized.priceId !== foundingMemberPriceId) {
      return jsonResponse({ ok: true, ignored: true, reason: "not_founding_member_event" });
    }

    const admin = createServiceClient();
    const userId = getString(normalized.metadataUserId) || await lookupUserIdByEmail(admin, normalized.customerEmail);

    const upsertPayload = {
      stripe_customer_id: normalized.stripeCustomerId,
      stripe_subscription_id: normalized.stripeSubscriptionId,
      stripe_checkout_session_id: normalized.stripeCheckoutSessionId,
      customer_email: normalized.customerEmail,
      user_id: userId,
      status: normalized.status,
      price_id: normalized.priceId,
      amount_cents: normalized.amountCents,
      currency: normalized.currency,
      current_period_start: normalized.currentPeriodStart,
      current_period_end: normalized.currentPeriodEnd,
      cancel_at_period_end: normalized.cancelAtPeriodEnd,
      last_event_type: normalized.eventType,
      last_event_id: normalized.eventId,
      last_event_created_at: normalized.eventCreatedAt,
      metadata: normalized.metadata,
      raw_event: event
    };

    if (normalized.stripeSubscriptionId) {
      const { error } = await admin
        .from("founding_member_subscriptions")
        .upsert(upsertPayload, { onConflict: "stripe_subscription_id" });

      if (error) {
        throw new Error(error.message);
      }
    } else if (normalized.stripeCheckoutSessionId) {
      const { error } = await admin
        .from("founding_member_subscriptions")
        .upsert(upsertPayload, { onConflict: "stripe_checkout_session_id" });

      if (error) {
        throw new Error(error.message);
      }
    } else {
      return jsonResponse({ ok: true, ignored: true, reason: "missing_subscription_or_session_id" });
    }

    if (normalized.shouldActivateMember && userId) {
      const completionIso = new Date().toISOString();

      const { error: activationError } = await admin
        .from("athlete_profiles")
        .update({ is_active: true })
        .eq("user_id", userId);

      if (activationError) {
        throw new Error(activationError.message);
      }

      await advanceFoundingOnboardingAfterPayment(admin, userId);
      await completeMembershipPaymentTasks(admin, userId, completionIso);
    }

    return jsonResponse({
      ok: true,
      processed: true,
      event_id: normalized.eventId,
      event_type: normalized.eventType,
      user_id: userId
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Stripe webhook processing failed." },
      400
    );
  }
});
