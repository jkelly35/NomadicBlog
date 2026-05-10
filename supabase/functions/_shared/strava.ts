import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

const STRAVA_AUTH_BASE = "https://www.strava.com/oauth";
const STRAVA_API_BASE = "https://www.strava.com/api/v3";
const STRAVA_STATE_MAX_AGE_MS = 15 * 60 * 1000;
const STRAVA_REFRESH_BUFFER_SEC = 5 * 60;

type StravaTokenRow = {
  user_id: string;
  strava_athlete_id: number;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
};

type StravaConnectionRow = {
  user_id: string;
  strava_athlete_id: number;
  athlete_username: string | null;
  athlete_name: string | null;
  scopes: string[];
  connected_at?: string;
  sync_status: string;
  last_sync_at?: string | null;
};

type StravaActivity = {
  start_date_local?: string;
  distance?: number;
  moving_time?: number;
  total_elevation_gain?: number;
  average_heartrate?: number;
};

export type StravaStatePayload = {
  uid: string;
  ts: number;
  nonce: string;
  redirectTo?: string;
};

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

export function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function createServiceClient(): SupabaseClient {
  const supabaseUrl = getRequiredEnv("SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

export async function getAuthedUserId(req: Request): Promise<string> {
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

  return data.user.id;
}

export async function buildStravaAuthUrl(userId: string, redirectTo?: string): Promise<string> {
  const clientId = getRequiredEnv("STRAVA_CLIENT_ID");
  const callbackUrl = getRequiredEnv("STRAVA_CALLBACK_URL");
  const scopes = Deno.env.get("STRAVA_OAUTH_SCOPES") || "read,activity:read_all,profile:read_all";
  const prompt = Deno.env.get("STRAVA_OAUTH_PROMPT") || "auto";

  const statePayload: StravaStatePayload = {
    uid: userId,
    ts: Date.now(),
    nonce: crypto.randomUUID(),
    redirectTo: sanitizeRedirectUrl(redirectTo)
  };

  const state = await signState(statePayload);
  const url = new URL(`${STRAVA_AUTH_BASE}/authorize`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", callbackUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("approval_prompt", prompt);
  url.searchParams.set("scope", scopes);
  url.searchParams.set("state", state);

  return url.toString();
}

export async function verifyState(state: string): Promise<StravaStatePayload> {
  const [payloadPart, signaturePart] = String(state || "").split(".");
  if (!payloadPart || !signaturePart) {
    throw new Error("Invalid Strava state payload.");
  }

  const expectedSig = await signRaw(payloadPart);
  if (expectedSig !== signaturePart) {
    throw new Error("Strava state signature mismatch.");
  }

  const payloadRaw = decodeBase64Url(payloadPart);
  const payload = JSON.parse(payloadRaw) as StravaStatePayload;

  if (!payload || !payload.uid || !payload.ts) {
    throw new Error("Strava state is missing required fields.");
  }

  if (Math.abs(Date.now() - payload.ts) > STRAVA_STATE_MAX_AGE_MS) {
    throw new Error("Strava state is expired.");
  }

  return payload;
}

export async function exchangeAuthorizationCode(code: string): Promise<{
  tokenRow: StravaTokenRow;
  connectionRow: StravaConnectionRow;
}> {
  const clientId = getRequiredEnv("STRAVA_CLIENT_ID");
  const clientSecret = getRequiredEnv("STRAVA_CLIENT_SECRET");

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code"
  });

  const response = await fetch(`${STRAVA_AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.message || "Failed to exchange Strava authorization code.");
  }

  const athlete = json?.athlete || {};
  const athleteId = Number(athlete?.id);
  if (!Number.isFinite(athleteId)) {
    throw new Error("Strava token response missing athlete id.");
  }

  const fullName = [athlete?.firstname, athlete?.lastname].filter(Boolean).join(" ").trim();

  return {
    tokenRow: {
      user_id: "",
      strava_athlete_id: athleteId,
      access_token: String(json.access_token || ""),
      refresh_token: String(json.refresh_token || ""),
      token_expires_at: toIsoFromEpochSeconds(Number(json.expires_at))
    },
    connectionRow: {
      user_id: "",
      strava_athlete_id: athleteId,
      athlete_username: athlete?.username || null,
      athlete_name: fullName || null,
      scopes: normalizeScopes(json?.scope),
      sync_status: "connected"
    }
  };
}

export async function revokeStravaAccess(accessToken: string): Promise<void> {
  if (!accessToken) {
    return;
  }

  const body = new URLSearchParams({ access_token: accessToken });
  await fetch(`${STRAVA_AUTH_BASE}/deauthorize`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });
}

export async function ensureFreshToken(
  admin: SupabaseClient,
  userId: string
): Promise<StravaTokenRow> {
  const { data, error } = await admin
    .from("athlete_strava_tokens")
    .select("user_id,strava_athlete_id,access_token,refresh_token,token_expires_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("No Strava token is stored for this athlete.");
  }

  const expiryEpoch = Math.floor(new Date(data.token_expires_at).getTime() / 1000);
  const nowEpoch = Math.floor(Date.now() / 1000);

  if (expiryEpoch > nowEpoch + STRAVA_REFRESH_BUFFER_SEC) {
    return data as StravaTokenRow;
  }

  const refreshed = await refreshToken(data.refresh_token);

  const updatedToken: StravaTokenRow = {
    user_id: userId,
    strava_athlete_id: Number(refreshed.athlete_id || data.strava_athlete_id),
    access_token: String(refreshed.access_token || ""),
    refresh_token: String(refreshed.refresh_token || ""),
    token_expires_at: toIsoFromEpochSeconds(Number(refreshed.expires_at))
  };

  const { error: upsertError } = await admin
    .from("athlete_strava_tokens")
    .upsert(updatedToken, { onConflict: "user_id" });

  if (upsertError) {
    throw new Error(upsertError.message);
  }

  return updatedToken;
}

async function refreshToken(refreshToken: string): Promise<Record<string, unknown>> {
  const clientId = getRequiredEnv("STRAVA_CLIENT_ID");
  const clientSecret = getRequiredEnv("STRAVA_CLIENT_SECRET");

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });

  const response = await fetch(`${STRAVA_AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.message || "Failed to refresh Strava token.");
  }

  return json;
}

export async function fetchActivities(accessToken: string, days: number): Promise<StravaActivity[]> {
  const safeDays = Math.min(Math.max(Number(days) || 30, 1), 90);
  const afterEpoch = Math.floor(Date.now() / 1000) - safeDays * 24 * 60 * 60;

  const activities: StravaActivity[] = [];
  let page = 1;

  while (page <= 10) {
    const url = new URL(`${STRAVA_API_BASE}/athlete/activities`);
    url.searchParams.set("after", String(afterEpoch));
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", "200");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json?.message || "Failed to fetch Strava activities.");
    }

    const pageRows = Array.isArray(json) ? json : [];
    if (!pageRows.length) {
      break;
    }

    pageRows.forEach((row) => {
      activities.push({
        start_date_local: row?.start_date_local,
        distance: Number(row?.distance || 0),
        moving_time: Number(row?.moving_time || 0),
        total_elevation_gain: Number(row?.total_elevation_gain || 0),
        average_heartrate: row?.average_heartrate == null ? undefined : Number(row.average_heartrate)
      });
    });

    if (pageRows.length < 200) {
      break;
    }
    page += 1;
  }

  return activities;
}

export function aggregateDailyMetrics(userId: string, activities: StravaActivity[]) {
  const map = new Map<string, {
    user_id: string;
    metric_date: string;
    activity_count: number;
    distance_m: number;
    moving_time_sec: number;
    elevation_gain_m: number;
    training_load: number;
    resting_hr: null;
    hrv_ms: null;
    sleep_hours: null;
    recovery_score: null;
  }>();

  activities.forEach((activity) => {
    const date = String(activity.start_date_local || "").slice(0, 10);
    if (!date) {
      return;
    }

    if (!map.has(date)) {
      map.set(date, {
        user_id: userId,
        metric_date: date,
        activity_count: 0,
        distance_m: 0,
        moving_time_sec: 0,
        elevation_gain_m: 0,
        training_load: 0,
        resting_hr: null,
        hrv_ms: null,
        sleep_hours: null,
        recovery_score: null
      });
    }

    const row = map.get(date)!;
    const distance = Number(activity.distance || 0);
    const moving = Number(activity.moving_time || 0);
    const elevation = Number(activity.total_elevation_gain || 0);
    const avgHr = activity.average_heartrate == null ? null : Number(activity.average_heartrate);

    row.activity_count += 1;
    row.distance_m += Number.isFinite(distance) ? distance : 0;
    row.moving_time_sec += Number.isFinite(moving) ? moving : 0;
    row.elevation_gain_m += Number.isFinite(elevation) ? elevation : 0;

    const baseLoad = moving > 0 ? moving / 60 : 0;
    const hrMultiplier = avgHr && avgHr > 0 ? avgHr / 130 : 1;
    row.training_load += baseLoad * hrMultiplier;
  });

  return Array.from(map.values()).sort((a, b) => (a.metric_date < b.metric_date ? -1 : 1));
}

export function sanitizeRedirectUrl(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch (_error) {
    return undefined;
  }
}

export function appendStatusQuery(baseUrl: string, status: string, message?: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set("strava_status", status);
  if (message) {
    url.searchParams.set("strava_message", message);
  }
  return url.toString();
}

async function signState(payload: StravaStatePayload): Promise<string> {
  const payloadBase64 = encodeBase64Url(JSON.stringify(payload));
  const signature = await signRaw(payloadBase64);
  return `${payloadBase64}.${signature}`;
}

async function signRaw(payloadBase64: string): Promise<string> {
  const secret = getRequiredEnv("STRAVA_STATE_SECRET");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadBase64)
  );

  return encodeBufferBase64Url(signatureBuffer);
}

function normalizeScopes(scopeValue: unknown): string[] {
  if (!scopeValue) {
    return [];
  }

  if (Array.isArray(scopeValue)) {
    return scopeValue.map((value) => String(value)).filter(Boolean);
  }

  return String(scopeValue)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function toIsoFromEpochSeconds(epochSeconds: number): string {
  if (!Number.isFinite(epochSeconds)) {
    return new Date(Date.now() + 60 * 60 * 1000).toISOString();
  }
  return new Date(epochSeconds * 1000).toISOString();
}

function encodeBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  return encodeBufferBase64Url(bytes.buffer);
}

function encodeBufferBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodeBase64Url(base64url: string): string {
  const base64 = base64url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(base64url.length / 4) * 4, "=");

  return atob(base64);
}
