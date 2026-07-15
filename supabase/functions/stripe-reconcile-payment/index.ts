import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

type ReconcileBody = {
  athlete_user_id?: string;
  session_id?: string;
  athlete_email?: string;
};

type InvoiceSnapshot = {
  invoiceId: string | null;
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
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

function getOptionalEnv(name: string): string | null {
  const value = String(Deno.env.get(name) || "").trim();
  return value || null;
}

function getOptionalString(value: unknown): string | null {
  const text = String(value == null ? "" : value).trim();
  return text || null;
}

function getMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function isAdminEmail(email: string | null): boolean {
  const configured = getOptionalEnv("NOMADIC_ADMIN_EMAIL") || "joe@nomadicperformance.com";
  return String(email || "").trim().toLowerCase() === String(configured || "").trim().toLowerCase();
}

function createServiceClient() {
  const supabaseUrl = getRequiredEnv("SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

async function getAuthedUser(req: Request): Promise<{ id: string; email: string | null }> {
  const supabaseUrl = getRequiredEnv("SUPABASE_URL");
  const anonKey = getRequiredEnv("SUPABASE_ANON_KEY");
  const authHeader = req.headers.get("Authorization") || "";

  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("Missing Authorization bearer token.");
  }

  const client = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: {
      headers: { Authorization: authHeader }
    }
  });

  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    throw new Error(error?.message || "Unable to authenticate user.");
  }

  return {
    id: String(data.user.id || "").trim(),
    email: getOptionalString(data.user.email)
  };
}

async function fetchUserEmailById(admin: ReturnType<typeof createServiceClient>, userId: string): Promise<string | null> {
  const cleanedUserId = getOptionalString(userId);
  if (!cleanedUserId) {
    return null;
  }

  try {
    const result = await admin.auth.admin.getUserById(cleanedUserId);
    if (result.error) {
      return null;
    }
    return getOptionalString(result.data && result.data.user ? result.data.user.email : null);
  } catch (_error) {
    return null;
  }
}

async function stripeGet(stripeSecretKey: string, path: string, searchParams?: URLSearchParams) {
  const url = `https://api.stripe.com${path}${searchParams ? `?${searchParams.toString()}` : ""}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`
    }
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = getOptionalString(payload?.error?.message) || `Stripe request failed (${response.status}).`;
    throw new Error(message);
  }

  return payload as Record<string, unknown>;
}

function parseInvoiceFromStripeObject(value: unknown): InvoiceSnapshot {
  const empty: InvoiceSnapshot = {
    invoiceId: null,
    hostedInvoiceUrl: null,
    invoicePdfUrl: null
  };

  if (!value) {
    return empty;
  }

  if (typeof value === "string") {
    return {
      ...empty,
      invoiceId: getOptionalString(value)
    };
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return empty;
  }

  const invoice = value as Record<string, unknown>;
  return {
    invoiceId: getOptionalString(invoice.id),
    hostedInvoiceUrl: getOptionalString(invoice.hosted_invoice_url),
    invoicePdfUrl: getOptionalString(invoice.invoice_pdf)
  };
}

async function fetchStripeInvoiceById(stripeSecretKey: string, invoiceId: string | null): Promise<InvoiceSnapshot> {
  const cleanedInvoiceId = getOptionalString(invoiceId);
  if (!cleanedInvoiceId) {
    return {
      invoiceId: null,
      hostedInvoiceUrl: null,
      invoicePdfUrl: null
    };
  }

  const invoice = await stripeGet(stripeSecretKey, `/v1/invoices/${encodeURIComponent(cleanedInvoiceId)}`);
  return {
    invoiceId: cleanedInvoiceId,
    hostedInvoiceUrl: getOptionalString(invoice.hosted_invoice_url),
    invoicePdfUrl: getOptionalString(invoice.invoice_pdf)
  };
}

async function searchLatestSubscriptionByMetadata(
  stripeSecretKey: string,
  query: string
): Promise<Record<string, unknown> | null> {
  const params = new URLSearchParams();
  params.set("query", query);
  params.set("limit", "1");
  params.append("expand[]", "data.latest_invoice");

  const result = await stripeGet(stripeSecretKey, "/v1/subscriptions/search", params);
  const data = Array.isArray(result.data) ? result.data : [];
  if (!data.length) {
    return null;
  }

  const first = data[0];
  if (!first || typeof first !== "object" || Array.isArray(first)) {
    return null;
  }

  return first as Record<string, unknown>;
}

async function searchStripeCustomerIdsByEmail(
  stripeSecretKey: string,
  email: string | null
): Promise<string[]> {
  const targetEmail = getOptionalString(email);
  if (!targetEmail) {
    return [];
  }

  const params = new URLSearchParams();
  params.set("query", `email:'${targetEmail.replace(/'/g, "\\'")}'`);
  params.set("limit", "5");

  const result = await stripeGet(stripeSecretKey, "/v1/customers/search", params);
  const data = Array.isArray(result.data) ? result.data : [];

  return data
    .map((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return null;
      }
      return getOptionalString((entry as Record<string, unknown>).id);
    })
    .filter((id): id is string => !!id);
}

async function fetchLatestSubscriptionForCustomer(
  stripeSecretKey: string,
  customerId: string
): Promise<Record<string, unknown> | null> {
  const cleanedCustomerId = getOptionalString(customerId);
  if (!cleanedCustomerId) {
    return null;
  }

  const params = new URLSearchParams();
  params.set("customer", cleanedCustomerId);
  params.set("status", "all");
  params.set("limit", "5");
  params.append("expand[]", "data.latest_invoice");

  const result = await stripeGet(stripeSecretKey, "/v1/subscriptions", params);
  const rows = (Array.isArray(result.data) ? result.data : [])
    .filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry)) as Record<string, unknown>[];

  if (!rows.length) {
    return null;
  }

  rows.sort((a, b) => {
    const aCreated = Number((a as { created?: unknown }).created) || 0;
    const bCreated = Number((b as { created?: unknown }).created) || 0;
    return bCreated - aCreated;
  });

  return rows[0] || null;
}

async function getStripePaymentSnapshot(
  stripeSecretKey: string,
  userId: string,
  userEmail: string | null,
  sessionId: string | null
): Promise<{
  sessionId: string | null;
  customerId: string | null;
  customerEmail: string | null;
  subscriptionId: string | null;
  status: string | null;
  amountCents: number | null;
  currency: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  invoice: InvoiceSnapshot;
  metadata: Record<string, unknown>;
  rawSession: Record<string, unknown> | null;
  diagnostic: Record<string, unknown>;
}> {
  let normalizedSessionId = getOptionalString(sessionId);
  let customerId: string | null = null;
  let customerEmail: string | null = null;
  let subscriptionId: string | null = null;
  let status: string | null = null;
  let amountCents: number | null = null;
  let currency: string | null = null;
  let currentPeriodStart: string | null = null;
  let currentPeriodEnd: string | null = null;
  let metadata: Record<string, unknown> = {};
  let invoice: InvoiceSnapshot = {
    invoiceId: null,
    hostedInvoiceUrl: null,
    invoicePdfUrl: null
  };
  let rawSession: Record<string, unknown> | null = null;
  const diagnostic: Record<string, unknown> = {
    input_session_id_provided: !!normalizedSessionId,
    input_user_email: userEmail,
    session_lookup_succeeded: false,
    session_lookup_error: null,
    metadata_user_id_lookup_tried: false,
    metadata_user_email_lookup_tried: false,
    customer_email_lookup_tried: false,
    customer_email_matches_found: 0,
    subscription_lookup_source: null
  };

  if (normalizedSessionId) {
    try {
      const params = new URLSearchParams();
      params.append("expand[]", "subscription");
      params.append("expand[]", "invoice");
      const session = await stripeGet(stripeSecretKey, `/v1/checkout/sessions/${encodeURIComponent(normalizedSessionId)}`, params);
      rawSession = session;
      diagnostic.session_lookup_succeeded = true;

      customerId = getOptionalString(session.customer);
      const customerDetails = (session.customer_details && typeof session.customer_details === "object")
        ? session.customer_details as Record<string, unknown>
        : {};
      customerEmail = getOptionalString(customerDetails.email) || getOptionalString(session.customer_email);
      subscriptionId = getOptionalString(session.subscription);
      status = getOptionalString(session.payment_status) || getOptionalString(session.status);
      amountCents = Number.isFinite(Number(session.amount_total)) ? Number(session.amount_total) : null;
      currency = getOptionalString(session.currency);
      metadata = getMetadata(session.metadata);

      invoice = parseInvoiceFromStripeObject((session as { invoice?: unknown }).invoice);

      const expandedSubscription = (session.subscription && typeof session.subscription === "object")
        ? session.subscription as Record<string, unknown>
        : null;

      if (expandedSubscription) {
        subscriptionId = getOptionalString(expandedSubscription.id) || subscriptionId;
        status = getOptionalString(expandedSubscription.status) || status;
        const periodStartUnix = Number((expandedSubscription as { current_period_start?: unknown }).current_period_start);
        const periodEndUnix = Number((expandedSubscription as { current_period_end?: unknown }).current_period_end);
        currentPeriodStart = Number.isFinite(periodStartUnix) && periodStartUnix > 0
          ? new Date(periodStartUnix * 1000).toISOString()
          : null;
        currentPeriodEnd = Number.isFinite(periodEndUnix) && periodEndUnix > 0
          ? new Date(periodEndUnix * 1000).toISOString()
          : null;

        const subscriptionMetadata = getMetadata(expandedSubscription.metadata);
        metadata = {
          ...subscriptionMetadata,
          ...metadata
        };

        const fromLatestInvoice = parseInvoiceFromStripeObject((expandedSubscription as { latest_invoice?: unknown }).latest_invoice);
        invoice = {
          invoiceId: invoice.invoiceId || fromLatestInvoice.invoiceId,
          hostedInvoiceUrl: invoice.hostedInvoiceUrl || fromLatestInvoice.hostedInvoiceUrl,
          invoicePdfUrl: invoice.invoicePdfUrl || fromLatestInvoice.invoicePdfUrl
        };
      }
    } catch (error) {
      diagnostic.session_lookup_error = error instanceof Error ? error.message : "Session lookup failed.";
    }
  }

  let subscription: Record<string, unknown> | null = null;
  if (subscriptionId) {
    const params = new URLSearchParams();
    params.append("expand[]", "latest_invoice");
    subscription = await stripeGet(stripeSecretKey, `/v1/subscriptions/${encodeURIComponent(subscriptionId)}`, params);
  } else {
    try {
      diagnostic.metadata_user_id_lookup_tried = true;
      subscription = await searchLatestSubscriptionByMetadata(
        stripeSecretKey,
        `metadata['user_id']:'${userId.replace(/'/g, "\\'")}'`
      );
    } catch (_error) {
      subscription = null;
    }

    if (!subscription && userEmail) {
      try {
        diagnostic.metadata_user_email_lookup_tried = true;
        subscription = await searchLatestSubscriptionByMetadata(
          stripeSecretKey,
          `metadata['user_email']:'${userEmail.replace(/'/g, "\\'")}'`
        );
      } catch (_error) {
        subscription = null;
      }
    }

    if (!subscription && userEmail) {
      try {
        diagnostic.customer_email_lookup_tried = true;
        const customerIds = await searchStripeCustomerIdsByEmail(stripeSecretKey, userEmail);
        diagnostic.customer_email_matches_found = customerIds.length;
        for (const customerCandidate of customerIds) {
          const candidate = await fetchLatestSubscriptionForCustomer(stripeSecretKey, customerCandidate);
          if (candidate) {
            subscription = candidate;
            diagnostic.subscription_lookup_source = "customer_email";
            break;
          }
        }
      } catch (_error) {
        subscription = null;
      }
    }
  }

  if (subscription) {
    if (!diagnostic.subscription_lookup_source) {
      diagnostic.subscription_lookup_source = subscriptionId ? "subscription_id" : "metadata";
    }
    subscriptionId = getOptionalString(subscription.id) || subscriptionId;
    customerId = getOptionalString(subscription.customer) || customerId;
    status = getOptionalString(subscription.status) || status;
    const periodStartUnix = Number((subscription as { current_period_start?: unknown }).current_period_start);
    const periodEndUnix = Number((subscription as { current_period_end?: unknown }).current_period_end);
    currentPeriodStart = Number.isFinite(periodStartUnix) && periodStartUnix > 0
      ? new Date(periodStartUnix * 1000).toISOString()
      : currentPeriodStart;
    currentPeriodEnd = Number.isFinite(periodEndUnix) && periodEndUnix > 0
      ? new Date(periodEndUnix * 1000).toISOString()
      : currentPeriodEnd;

    const subscriptionMetadata = getMetadata(subscription.metadata);
    metadata = {
      ...subscriptionMetadata,
      ...metadata
    };

    const latestInvoice = parseInvoiceFromStripeObject((subscription as { latest_invoice?: unknown }).latest_invoice);
    invoice = {
      invoiceId: invoice.invoiceId || latestInvoice.invoiceId,
      hostedInvoiceUrl: invoice.hostedInvoiceUrl || latestInvoice.hostedInvoiceUrl,
      invoicePdfUrl: invoice.invoicePdfUrl || latestInvoice.invoicePdfUrl
    };
  }

  if (invoice.invoiceId && (!invoice.hostedInvoiceUrl || !invoice.invoicePdfUrl)) {
    const hydratedInvoice = await fetchStripeInvoiceById(stripeSecretKey, invoice.invoiceId);
    invoice = {
      invoiceId: hydratedInvoice.invoiceId || invoice.invoiceId,
      hostedInvoiceUrl: hydratedInvoice.hostedInvoiceUrl || invoice.hostedInvoiceUrl,
      invoicePdfUrl: hydratedInvoice.invoicePdfUrl || invoice.invoicePdfUrl
    };
  }

  if (!customerEmail && userEmail) {
    customerEmail = userEmail;
  }

  if (!subscriptionId && !normalizedSessionId) {
    throw new Error(
      "No Stripe subscription/session was found for this account. " +
      "Checked metadata user_id/user_email and customer email search."
    );
  }

  return {
    sessionId: normalizedSessionId,
    customerId,
    customerEmail,
    subscriptionId,
    status,
    amountCents,
    currency,
    currentPeriodStart,
    currentPeriodEnd,
    invoice,
    metadata,
    rawSession,
    diagnostic
  };
}

async function completeMembershipPaymentTasks(
  admin: ReturnType<typeof createServiceClient>,
  userId: string,
  completedAtIso: string,
  payment: {
    invoiceId: string | null;
    hostedInvoiceUrl: string | null;
    invoicePdfUrl: string | null;
    stripeCheckoutSessionId: string | null;
    stripeSubscriptionId: string | null;
  }
): Promise<number> {
  const { data, error: selectError } = await admin
    .from("athlete_onboarding_intake_assignments")
    .select("id,response_data")
    .eq("athlete_user_id", userId)
    .neq("status", "archived")
    .or("form_id.eq.membership-payment-task-v1,form_name.ilike.%membership%payment%");

  if (selectError) {
    throw new Error(selectError.message);
  }

  const rows = Array.isArray(data) ? data : [];
  let updates = 0;

  for (const row of rows) {
    const rowId = getOptionalString((row as { id?: unknown }).id);
    if (!rowId) {
      continue;
    }

    const existingResponse = ((row as { response_data?: unknown }).response_data && typeof (row as { response_data?: unknown }).response_data === "object")
      ? ((row as { response_data?: Record<string, unknown> }).response_data as Record<string, unknown>)
      : {};

    const nextResponse: Record<string, unknown> = {
      ...existingResponse,
      payment_completed_at: completedAtIso
    };

    if (payment.invoiceId) {
      nextResponse.invoice_id = payment.invoiceId;
    }
    if (payment.hostedInvoiceUrl) {
      nextResponse.invoice_url = payment.hostedInvoiceUrl;
      nextResponse.hosted_invoice_url = payment.hostedInvoiceUrl;
    }
    if (payment.invoicePdfUrl) {
      nextResponse.invoice_pdf = payment.invoicePdfUrl;
    }
    if (payment.stripeCheckoutSessionId) {
      nextResponse.stripe_checkout_session_id = payment.stripeCheckoutSessionId;
    }
    if (payment.stripeSubscriptionId) {
      nextResponse.stripe_subscription_id = payment.stripeSubscriptionId;
    }

    const { error: updateError } = await admin
      .from("athlete_onboarding_intake_assignments")
      .update({
        status: "submitted",
        submitted_at: completedAtIso,
        updated_at: completedAtIso,
        response_data: nextResponse
      })
      .eq("id", rowId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    updates += 1;
  }

  return updates;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const user = await getAuthedUser(req);
    const stripeSecretKey = getRequiredEnv("STRIPE_SECRET_KEY");
    const admin = createServiceClient();

    let body: ReconcileBody = {};
    try {
      body = (await req.json()) as ReconcileBody;
    } catch (_error) {
      body = {};
    }

    const requestedUserId = getOptionalString(body.athlete_user_id);
    const targetUserId = requestedUserId || user.id;
    const actingAsSelf = targetUserId === user.id;
    const actingAsAdmin = isAdminEmail(user.email);

    if (!actingAsSelf && !actingAsAdmin) {
      return jsonResponse({ error: "User mismatch." }, 403);
    }

    const requestedAthleteEmail = getOptionalString(body.athlete_email);
    const targetUserEmail = requestedAthleteEmail || (actingAsSelf
      ? user.email
      : await fetchUserEmailById(admin, targetUserId));

    const snapshot = await getStripePaymentSnapshot(
      stripeSecretKey,
      targetUserId,
      targetUserEmail,
      getOptionalString(body.session_id)
    );

    const nowIso = new Date().toISOString();

    if (snapshot.subscriptionId || snapshot.sessionId) {
      try {
        await admin
          .from("founding_member_subscriptions")
          .upsert({
            stripe_customer_id: snapshot.customerId,
            stripe_subscription_id: snapshot.subscriptionId,
            stripe_checkout_session_id: snapshot.sessionId,
            customer_email: snapshot.customerEmail,
            user_id: targetUserId,
            status: snapshot.status,
            amount_cents: snapshot.amountCents,
            currency: snapshot.currency,
            current_period_start: snapshot.currentPeriodStart,
            current_period_end: snapshot.currentPeriodEnd,
            last_event_type: "manual.reconcile",
            last_event_id: `manual_reconcile_${targetUserId}_${Date.now()}`,
            last_event_created_at: nowIso,
            metadata: {
              ...snapshot.metadata,
              invoice_id: snapshot.invoice.invoiceId,
              hosted_invoice_url: snapshot.invoice.hostedInvoiceUrl,
              invoice_url: snapshot.invoice.hostedInvoiceUrl,
              invoice_pdf: snapshot.invoice.invoicePdfUrl
            },
            raw_event: {
              type: "manual.reconcile",
              data: {
                object: snapshot.rawSession || {}
              }
            }
          }, {
            onConflict: snapshot.subscriptionId ? "stripe_subscription_id" : "stripe_checkout_session_id"
          });
      } catch (_error) {
        // Optional persistence path; task reconciliation still succeeds if this table is missing.
      }
    }

    const updatedAssignments = await completeMembershipPaymentTasks(admin, targetUserId, nowIso, {
      invoiceId: snapshot.invoice.invoiceId,
      hostedInvoiceUrl: snapshot.invoice.hostedInvoiceUrl,
      invoicePdfUrl: snapshot.invoice.invoicePdfUrl,
      stripeCheckoutSessionId: snapshot.sessionId,
      stripeSubscriptionId: snapshot.subscriptionId
    });

    await admin.rpc("complete_founding_member_payment", {
      p_athlete_user_id: targetUserId
    });

    return jsonResponse({
      ok: true,
      user_id: targetUserId,
      updated_assignments: updatedAssignments,
      stripe_checkout_session_id: snapshot.sessionId,
      stripe_subscription_id: snapshot.subscriptionId,
      invoice_id: snapshot.invoice.invoiceId,
      invoice_url: snapshot.invoice.hostedInvoiceUrl,
      invoice_pdf: snapshot.invoice.invoicePdfUrl,
      diagnostic: snapshot.diagnostic
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unable to reconcile Stripe payment." },
      400
    );
  }
});
