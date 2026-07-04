import {
  corsHeaders,
  createServiceClient,
  getAuthedUserId,
  jsonResponse
} from "../_shared/whoop.ts";

function toExpiryIso(expiresIn: unknown, expiresAt: unknown): string {
  const expiresAtNum = Number(expiresAt);
  if (Number.isFinite(expiresAtNum) && expiresAtNum > 0) {
    if (expiresAtNum > 10_000_000_000) {
      return new Date(expiresAtNum).toISOString();
    }
    return new Date(expiresAtNum * 1000).toISOString();
  }

  const expiresInNum = Number(expiresIn);
  if (Number.isFinite(expiresInNum) && expiresInNum > 0) {
    return new Date(Date.now() + expiresInNum * 1000).toISOString();
  }

  return new Date(Date.now() + 60 * 60 * 1000).toISOString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const userId = await getAuthedUserId(req);

    const body = await req.json();
    const accessToken = String(body?.access_token || "").trim();
    const refreshToken = String(body?.refresh_token || "").trim();
    const whoopUserId = body?.whoop_user_id == null ? null : String(body.whoop_user_id).trim() || null;
    const scopes = Array.isArray(body?.scopes)
      ? body.scopes.map((value: unknown) => String(value || "").trim()).filter(Boolean)
      : [];

    if (!accessToken || !refreshToken) {
      return jsonResponse({ error: "access_token and refresh_token are required." }, 400);
    }

    const tokenExpiresAt = toExpiryIso(body?.expires_in, body?.expires_at);
    const admin = createServiceClient();

    const tokenRow = {
      user_id: userId,
      whoop_user_id: whoopUserId,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: tokenExpiresAt
    };

    const connectionRow = {
      user_id: userId,
      whoop_user_id: whoopUserId,
      scopes,
      connected_at: new Date().toISOString(),
      last_sync_at: null,
      sync_status: "connected"
    };

    const [{ error: tokenError }, { error: connectionError }] = await Promise.all([
      admin.from("athlete_whoop_tokens").upsert(tokenRow, { onConflict: "user_id" }),
      admin.from("athlete_whoop_connections").upsert(connectionRow, { onConflict: "user_id" })
    ]);

    if (tokenError) {
      throw new Error(tokenError.message);
    }

    if (connectionError) {
      throw new Error(connectionError.message);
    }

    return jsonResponse({ ok: true, user_id: userId });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Failed to save Whoop credentials." },
      400
    );
  }
});
