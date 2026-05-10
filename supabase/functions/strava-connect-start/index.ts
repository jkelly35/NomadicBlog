import { buildStravaAuthUrl, corsHeaders, getAuthedUserId, jsonResponse } from "../_shared/strava.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const userId = await getAuthedUserId(req);

    let redirectTo: string | undefined;
    try {
      const body = await req.json();
      redirectTo = body?.redirectTo;
    } catch (_error) {
      redirectTo = undefined;
    }

    const authUrl = await buildStravaAuthUrl(userId, redirectTo);
    return jsonResponse({ auth_url: authUrl });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Failed to start Strava OAuth." },
      400
    );
  }
});
