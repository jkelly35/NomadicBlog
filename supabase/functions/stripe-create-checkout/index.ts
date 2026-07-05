import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

type CheckoutBody = {
  plan?: string;
  source?: string;
  email?: string;
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
    email: String(data.user.email || "").trim() || null
  };
}

function sanitizeUrl(value: unknown): string | null {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }

  try {
    const parsed = new URL(text);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return parsed.toString();
  } catch (_error) {
    return null;
  }
}

function sanitizeEmail(value: unknown): string | null {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    return null;
  }
  return text;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const authedUser = await getAuthedUser(req);
    const stripeSecretKey = getRequiredEnv("STRIPE_SECRET_KEY");
    const foundingMemberPriceId = getRequiredEnv("STRIPE_FOUNDING_MEMBER_PRICE_ID");

    const defaultSuccessUrl =
      sanitizeUrl(Deno.env.get("STRIPE_SUCCESS_URL")) ||
      "https://nomadicperformance.com/founding-member.html?checkout=success";

    const defaultCancelUrl =
      sanitizeUrl(Deno.env.get("STRIPE_CANCEL_URL")) ||
      "https://nomadicperformance.com/founding-member.html?checkout=cancelled";

    let body: CheckoutBody = {};
    try {
      body = (await req.json()) as CheckoutBody;
    } catch (_error) {
      body = {};
    }

    const plan = String(body.plan || "founding_member").trim();
    if (plan !== "founding_member") {
      return jsonResponse({ error: "Unsupported plan requested." }, 400);
    }

    const source = String(body.source || "founding_member_page").trim().slice(0, 80);
    const customerEmail = sanitizeEmail(authedUser.email || body.email);

    const payload = new URLSearchParams();
    payload.set("mode", "subscription");
    payload.set("line_items[0][price]", foundingMemberPriceId);
    payload.set("line_items[0][quantity]", "1");
    payload.set("success_url", defaultSuccessUrl);
    payload.set("cancel_url", defaultCancelUrl);
    payload.set("allow_promotion_codes", "true");
    payload.set("metadata[plan]", "founding_member");
    payload.set("metadata[source]", source || "founding_member_page");
    payload.set("metadata[user_id]", authedUser.id);
    if (customerEmail) {
      payload.set("metadata[user_email]", customerEmail);
    }
    payload.set("subscription_data[metadata][plan]", "founding_member");
    payload.set("subscription_data[metadata][source]", source || "founding_member_page");
    payload.set("subscription_data[metadata][user_id]", authedUser.id);
    if (customerEmail) {
      payload.set("subscription_data[metadata][user_email]", customerEmail);
    }

    if (customerEmail) {
      payload.set("customer_email", customerEmail);
    }

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: payload.toString()
    });

    const stripeJson = await stripeResponse.json();

    if (!stripeResponse.ok) {
      const errorMessage =
        String(stripeJson?.error?.message || "").trim() ||
        "Stripe checkout session creation failed.";
      throw new Error(errorMessage);
    }

    const checkoutUrl = String(stripeJson?.url || "").trim();
    if (!checkoutUrl) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return jsonResponse({
      ok: true,
      url: checkoutUrl,
      session_id: String(stripeJson?.id || "")
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unable to create checkout session." },
      400
    );
  }
});
