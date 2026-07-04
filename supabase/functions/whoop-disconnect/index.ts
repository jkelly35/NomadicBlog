import {
  corsHeaders,
  createServiceClient,
  getAuthedUserId,
  jsonResponse,
  revokeWhoopAccess
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

    const { data: tokenRow, error: tokenError } = await admin
      .from("athlete_whoop_tokens")
      .select("access_token")
      .eq("user_id", userId)
      .maybeSingle();

    if (tokenError) {
      throw new Error(tokenError.message);
    }

    if (tokenRow?.access_token) {
      await revokeWhoopAccess(tokenRow.access_token);
    }

    const [{ error: deleteMetricsError }, { error: deleteTokenError }, { error: deleteConnError }] =
      await Promise.all([
        admin.from("athlete_whoop_daily_metrics").delete().eq("user_id", userId),
        admin.from("athlete_whoop_tokens").delete().eq("user_id", userId),
        admin.from("athlete_whoop_connections").delete().eq("user_id", userId)
      ]);

    if (deleteMetricsError) {
      throw new Error(deleteMetricsError.message);
    }
    if (deleteTokenError) {
      throw new Error(deleteTokenError.message);
    }
    if (deleteConnError) {
      throw new Error(deleteConnError.message);
    }

    return jsonResponse({ ok: true, user_id: userId });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Failed to disconnect Whoop." },
      400
    );
  }
});
