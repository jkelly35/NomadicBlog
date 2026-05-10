import {
  aggregateDailyMetrics,
  corsHeaders,
  createServiceClient,
  ensureFreshToken,
  fetchActivities,
  getAuthedUserId,
  jsonResponse
} from "../_shared/strava.ts";

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
    const activities = await fetchActivities(token.access_token, days);
    const dailyRows = aggregateDailyMetrics(userId, activities);

    if (dailyRows.length) {
      const { error: upsertError } = await admin
        .from("athlete_strava_daily_metrics")
        .upsert(dailyRows, { onConflict: "user_id,metric_date" });

      if (upsertError) {
        throw new Error(upsertError.message);
      }
    }

    const { error: connectionError } = await admin
      .from("athlete_strava_connections")
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
      activities_fetched: activities.length,
      metric_days_upserted: dailyRows.length
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Failed to sync Strava metrics." },
      400
    );
  }
});
