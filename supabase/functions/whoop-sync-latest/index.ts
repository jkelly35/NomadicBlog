import {
  corsHeaders,
  createServiceClient,
  ensureFreshToken,
  fetchWhoopDailyMetrics,
  getAuthedUserId,
  jsonResponse
} from "../_shared/whoop.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const userId = await getAuthedUserId(req);
    const admin = createServiceClient();

    let days = 30;
    try {
      const body = await req.json();
      if (body?.days != null) {
        days = Number(body.days);
      }
    } catch (_error) {
      days = 30;
    }

    const token = await ensureFreshToken(admin, userId);
    const dailyRows = await fetchWhoopDailyMetrics(token.access_token, days);
    const upsertRows = dailyRows.map((row) => ({ ...row, user_id: userId }));

    if (upsertRows.length) {
      const { error: upsertError } = await admin
        .from("athlete_whoop_daily_metrics")
        .upsert(upsertRows, { onConflict: "user_id,metric_date" });

      if (upsertError) {
        throw new Error(upsertError.message);
      }
    }

    const { error: connectionError } = await admin
      .from("athlete_whoop_connections")
      .update({
        last_sync_at: new Date().toISOString(),
        sync_status: "connected"
      })
      .eq("user_id", userId);

    if (connectionError) {
      throw new Error(connectionError.message);
    }

    return jsonResponse({
      ok: true,
      user_id: userId,
      metric_days_upserted: upsertRows.length
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Failed to sync Whoop metrics." },
      400
    );
  }
});
