import { buildWhoopAuthUrl, corsHeaders, getAuthedUserId, jsonResponse } from "../_shared/whoop.ts";

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

    const authUrl = await buildWhoopAuthUrl(userId, redirectTo);
    return jsonResponse({ auth_url: authUrl });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Failed to start Whoop OAuth." },
      400
    );
  }
});
