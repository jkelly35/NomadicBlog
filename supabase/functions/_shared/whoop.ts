import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

const WHOOP_DEFAULT_AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
const WHOOP_DEFAULT_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";
const WHOOP_DEFAULT_API_BASE = "https://api.prod.whoop.com/developer/v1";
const WHOOP_STATE_MAX_AGE_MS = 15 * 60 * 1000;
const WHOOP_REFRESH_BUFFER_SEC = 5 * 60;

type WhoopTokenRow = {
  user_id: string;
  whoop_user_id: string | null;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
};

type WhoopConnectionRow = {
  user_id: string;
  whoop_user_id: string | null;
  scopes: string[];
  connected_at?: string;
  sync_status: string;
  last_sync_at?: string | null;
};

type WhoopDailyMetricRow = {
  user_id: string;
  metric_date: string;
  recovery_score: number | null;
  resting_hr: number | null;
  hrv_ms: number | null;
  sleep_hours: number | null;
  day_strain: number | null;
  workout_count: number;
  workout_duration_sec: number | null;
};

export type WhoopStatePayload = {
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

export async function buildWhoopAuthUrl(userId: string, redirectTo?: string): Promise<string> {
  const clientId = getRequiredEnv("WHOOP_CLIENT_ID");
  const callbackUrl = getRequiredEnv("WHOOP_CALLBACK_URL");
  const authUrl = Deno.env.get("WHOOP_AUTH_URL") || WHOOP_DEFAULT_AUTH_URL;
  const scopes = Deno.env.get("WHOOP_OAUTH_SCOPES") || "read:recovery read:sleep read:workout";

  const statePayload: WhoopStatePayload = {
    uid: userId,
    ts: Date.now(),
    nonce: crypto.randomUUID(),
    redirectTo: sanitizeRedirectUrl(redirectTo)
  };

  const state = await signState(statePayload);
  const url = new URL(authUrl);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", callbackUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scopes);
  url.searchParams.set("state", state);

  return url.toString();
}

export async function verifyState(state: string): Promise<WhoopStatePayload> {
  const [payloadPart, signaturePart] = String(state || "").split(".");
  if (!payloadPart || !signaturePart) {
    throw new Error("Invalid Whoop state payload.");
  }

  const expectedSig = await signRaw(payloadPart);
  if (expectedSig !== signaturePart) {
    throw new Error("Whoop state signature mismatch.");
  }

  const payloadRaw = decodeBase64Url(payloadPart);
  const payload = JSON.parse(payloadRaw) as WhoopStatePayload;

  if (!payload || !payload.uid || !payload.ts) {
    throw new Error("Whoop state is missing required fields.");
  }

  if (Math.abs(Date.now() - payload.ts) > WHOOP_STATE_MAX_AGE_MS) {
    throw new Error("Whoop state is expired.");
  }

  return payload;
}

export async function exchangeAuthorizationCode(code: string): Promise<{
  tokenRow: WhoopTokenRow;
  connectionRow: WhoopConnectionRow;
}> {
  const clientId = getRequiredEnv("WHOOP_CLIENT_ID");
  const clientSecret = getRequiredEnv("WHOOP_CLIENT_SECRET");
  const callbackUrl = getRequiredEnv("WHOOP_CALLBACK_URL");
  const tokenUrl = Deno.env.get("WHOOP_TOKEN_URL") || WHOOP_DEFAULT_TOKEN_URL;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: callbackUrl
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.message || "Failed to exchange Whoop authorization code.");
  }

  const accessToken = String(json?.access_token || "").trim();
  const refreshToken = String(json?.refresh_token || "").trim();
  if (!accessToken || !refreshToken) {
    throw new Error("Whoop token response is missing access_token or refresh_token.");
  }

  const whoopUserId = extractWhoopUserId(json);
  const expiresAt = computeTokenExpiryIso(json?.expires_at, json?.expires_in);

  return {
    tokenRow: {
      user_id: "",
      whoop_user_id: whoopUserId,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: expiresAt
    },
    connectionRow: {
      user_id: "",
      whoop_user_id: whoopUserId,
      scopes: normalizeScopes(json?.scope),
      sync_status: "connected"
    }
  };
}

export async function revokeWhoopAccess(accessToken: string): Promise<void> {
  const revokeUrl = String(Deno.env.get("WHOOP_REVOKE_URL") || "").trim();
  if (!accessToken || !revokeUrl) {
    return;
  }

  const response = await fetch(revokeUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token: accessToken })
  });

  if (!response.ok) {
    // Best-effort revoke; upstream revoke shape can vary by tenant/app setup.
    return;
  }
}

export async function ensureFreshToken(admin: SupabaseClient, userId: string): Promise<WhoopTokenRow> {
  const { data, error } = await admin
    .from("athlete_whoop_tokens")
    .select("user_id,whoop_user_id,access_token,refresh_token,token_expires_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("No Whoop token is stored for this athlete.");
  }

  const expiryEpoch = Math.floor(new Date(data.token_expires_at).getTime() / 1000);
  const nowEpoch = Math.floor(Date.now() / 1000);

  if (expiryEpoch > nowEpoch + WHOOP_REFRESH_BUFFER_SEC) {
    return data as WhoopTokenRow;
  }

  const refreshed = await refreshToken(data.refresh_token);

  const updatedToken: WhoopTokenRow = {
    user_id: userId,
    whoop_user_id: extractWhoopUserId(refreshed) || data.whoop_user_id || null,
    access_token: String(refreshed.access_token || ""),
    refresh_token: String(refreshed.refresh_token || ""),
    token_expires_at: computeTokenExpiryIso(refreshed.expires_at, refreshed.expires_in)
  };

  if (!updatedToken.access_token || !updatedToken.refresh_token) {
    throw new Error("Whoop refresh token response is missing token values.");
  }

  const { error: upsertError } = await admin
    .from("athlete_whoop_tokens")
    .upsert(updatedToken, { onConflict: "user_id" });

  if (upsertError) {
    throw new Error(upsertError.message);
  }

  return updatedToken;
}

async function refreshToken(refreshToken: string): Promise<Record<string, unknown>> {
  const clientId = getRequiredEnv("WHOOP_CLIENT_ID");
  const clientSecret = getRequiredEnv("WHOOP_CLIENT_SECRET");
  const tokenUrl = Deno.env.get("WHOOP_TOKEN_URL") || WHOOP_DEFAULT_TOKEN_URL;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.message || "Failed to refresh Whoop token.");
  }

  return json;
}

export async function fetchWhoopDailyMetrics(accessToken: string, days: number): Promise<WhoopDailyMetricRow[]> {
  const safeDays = Math.min(Math.max(Number(days) || 30, 1), 60);
  const end = new Date();
  const start = new Date(end.getTime() - safeDays * 24 * 60 * 60 * 1000);
  const startDate = formatDateOnly(start);
  const endDate = formatDateOnly(end);

  const recoveryRows = await fetchEndpointRows(accessToken, Deno.env.get("WHOOP_RECOVERY_PATH") || "/recovery", startDate, endDate);
  const sleepRows = await fetchEndpointRows(accessToken, Deno.env.get("WHOOP_SLEEP_PATH") || "/sleep", startDate, endDate);
  const workoutRows = await fetchEndpointRows(accessToken, Deno.env.get("WHOOP_WORKOUT_PATH") || "/workout", startDate, endDate);

  return aggregateDailyMetrics(recoveryRows, sleepRows, workoutRows).sort((a, b) => (a.metric_date < b.metric_date ? -1 : 1));
}

function aggregateDailyMetrics(
  recoveryRows: Record<string, unknown>[],
  sleepRows: Record<string, unknown>[],
  workoutRows: Record<string, unknown>[]
): WhoopDailyMetricRow[] {
  const map = new Map<string, WhoopDailyMetricRow>();

  function ensureRow(metricDate: string): WhoopDailyMetricRow {
    if (!map.has(metricDate)) {
      map.set(metricDate, {
        user_id: "",
        metric_date: metricDate,
        recovery_score: null,
        resting_hr: null,
        hrv_ms: null,
        sleep_hours: null,
        day_strain: null,
        workout_count: 0,
        workout_duration_sec: null
      });
    }

    return map.get(metricDate)!;
  }

  recoveryRows.forEach((row) => {
    const date = resolveMetricDate(row);
    if (!date) {
      return;
    }

    const target = ensureRow(date);
    target.recovery_score = pickNumeric(row, [
      ["score", "recovery_score"],
      ["recovery_score"],
      ["score"]
    ], target.recovery_score);
    target.resting_hr = pickNumeric(row, [
      ["score", "resting_heart_rate"],
      ["resting_heart_rate"],
      ["resting_hr"]
    ], target.resting_hr);
    target.hrv_ms = pickNumeric(row, [
      ["score", "hrv_rmssd_milli"],
      ["score", "hrv_ms"],
      ["hrv_rmssd_milli"],
      ["hrv_ms"]
    ], target.hrv_ms);
  });

  sleepRows.forEach((row) => {
    const date = resolveMetricDate(row);
    if (!date) {
      return;
    }

    const target = ensureRow(date);
    const sleepMs = pickNumeric(row, [
      ["score", "stage_summary", "total_in_bed_time_milli"],
      ["score", "stage_summary", "total_sleep_time_milli"],
      ["score", "sleep_duration_ms"],
      ["sleep_duration_ms"],
      ["total_sleep_time_milli"],
      ["duration_ms"]
    ], null);

    if (sleepMs != null && Number.isFinite(sleepMs)) {
      target.sleep_hours = Number((sleepMs / (1000 * 60 * 60)).toFixed(2));
    }
  });

  workoutRows.forEach((row) => {
    const date = resolveMetricDate(row);
    if (!date) {
      return;
    }

    const target = ensureRow(date);
    const strain = pickNumeric(row, [
      ["score", "strain"],
      ["strain"],
      ["day_strain"]
    ], null);

    if (strain != null) {
      target.day_strain = strain;
    }

    const durationMs = pickNumeric(row, [
      ["duration_ms"],
      ["duration_milli"],
      ["score", "duration_ms"]
    ], null);

    if (durationMs != null && Number.isFinite(durationMs)) {
      const durationSec = Math.round(durationMs / 1000);
      target.workout_duration_sec = (target.workout_duration_sec || 0) + durationSec;
    }

    target.workout_count += 1;
  });

  return Array.from(map.values());
}

async function fetchEndpointRows(
  accessToken: string,
  pathOrUrl: string,
  startDate: string,
  endDate: string
): Promise<Record<string, unknown>[]> {
  const value = String(pathOrUrl || "").trim();
  if (!value) {
    return [];
  }

  const url = makeWhoopUrl(value);
  const startParam = Deno.env.get("WHOOP_START_PARAM") || "start_date";
  const endParam = Deno.env.get("WHOOP_END_PARAM") || "end_date";

  url.searchParams.set(startParam, startDate);
  url.searchParams.set(endParam, endDate);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.message || `Whoop API request failed for ${url.pathname}.`);
  }

  return toRecordArray(json);
}

function makeWhoopUrl(pathOrUrl: string): URL {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return new URL(pathOrUrl);
  }

  const base = Deno.env.get("WHOOP_API_BASE") || WHOOP_DEFAULT_API_BASE;
  return new URL(pathOrUrl, ensureTrailingSlash(base));
}

function ensureTrailingSlash(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

function toRecordArray(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter((item) => item && typeof item === "object") as Record<string, unknown>[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const obj = payload as Record<string, unknown>;
  const candidate = obj.records || obj.items || obj.data || obj.results;
  if (Array.isArray(candidate)) {
    return candidate.filter((item) => item && typeof item === "object") as Record<string, unknown>[];
  }

  return [];
}

function resolveMetricDate(row: Record<string, unknown>): string | null {
  const candidates = [
    readString(row, ["score", "updated_at"]),
    readString(row, ["created_at"]),
    readString(row, ["updated_at"]),
    readString(row, ["date"]),
    readString(row, ["day"]),
    readString(row, ["start"]),
    readString(row, ["start_time"]),
    readString(row, ["start_time_ms"])
  ].filter(Boolean) as string[];

  for (const value of candidates) {
    const date = toDateOnly(value);
    if (date) {
      return date;
    }
  }

  return null;
}

function pickNumeric(
  source: Record<string, unknown>,
  paths: string[][],
  fallback: number | null
): number | null {
  for (const path of paths) {
    const value = readUnknown(source, path);
    const numeric = toNumber(value);
    if (numeric != null) {
      return numeric;
    }
  }

  return fallback;
}

function readUnknown(source: Record<string, unknown>, path: string[]): unknown {
  let current: unknown = source;
  for (const segment of path) {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

function readString(source: Record<string, unknown>, path: string[]): string {
  const value = readUnknown(source, path);
  if (value == null) {
    return "";
  }
  return String(value).trim();
}

function toNumber(value: unknown): number | null {
  if (value == null || value === "") {
    return null;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return numeric;
}

function toDateOnly(value: string): string | null {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return formatDateOnly(parsed);
}

function formatDateOnly(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  url.searchParams.set("whoop_status", status);
  if (message) {
    url.searchParams.set("whoop_message", message);
  }
  return url.toString();
}

function normalizeScopes(scopeValue: unknown): string[] {
  if (!scopeValue) {
    return [];
  }

  if (Array.isArray(scopeValue)) {
    return scopeValue.map((value) => String(value)).filter(Boolean);
  }

  return String(scopeValue)
    .split(/[\s,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function extractWhoopUserId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const obj = payload as Record<string, unknown>;
  const direct = obj.whoop_user_id || obj.user_id || obj.id;
  if (direct != null && String(direct).trim()) {
    return String(direct).trim();
  }

  const userObj = obj.user;
  if (userObj && typeof userObj === "object") {
    const userId = (userObj as Record<string, unknown>).id;
    if (userId != null && String(userId).trim()) {
      return String(userId).trim();
    }
  }

  return null;
}

function computeTokenExpiryIso(expiresAtValue: unknown, expiresInValue: unknown): string {
  const expiresAt = Number(expiresAtValue);
  if (Number.isFinite(expiresAt) && expiresAt > 0) {
    if (expiresAt > 10_000_000_000) {
      return new Date(expiresAt).toISOString();
    }
    return new Date(expiresAt * 1000).toISOString();
  }

  const expiresIn = Number(expiresInValue);
  if (Number.isFinite(expiresIn) && expiresIn > 0) {
    return new Date(Date.now() + expiresIn * 1000).toISOString();
  }

  return new Date(Date.now() + 60 * 60 * 1000).toISOString();
}

async function signState(payload: WhoopStatePayload): Promise<string> {
  const payloadBase64 = encodeBase64Url(JSON.stringify(payload));
  const signature = await signRaw(payloadBase64);
  return `${payloadBase64}.${signature}`;
}

async function signRaw(payloadBase64: string): Promise<string> {
  const secret = getRequiredEnv("WHOOP_STATE_SECRET");
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
