import {
  appendStatusQuery,
  createServiceClient,
  exchangeAuthorizationCode,
  sanitizeRedirectUrl,
  verifyState
} from "../_shared/whoop.ts";

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = String(url.searchParams.get("code") || "").trim();
    const state = String(url.searchParams.get("state") || "").trim();
    const error = String(url.searchParams.get("error") || "").trim();

    const defaultRedirect =
      sanitizeRedirectUrl(Deno.env.get("WHOOP_POST_CONNECT_REDIRECT")) ||
      "https://nomadicperformance.com/profile.html";

    if (error) {
      return Response.redirect(
        appendStatusQuery(defaultRedirect, "error", `Whoop authorization was not completed (${error}).`),
        302
      );
    }

    if (!code || !state) {
      return Response.redirect(
        appendStatusQuery(defaultRedirect, "error", "Missing Whoop callback parameters."),
        302
      );
    }

    const statePayload = await verifyState(state);
    const postConnectRedirect = sanitizeRedirectUrl(statePayload.redirectTo) || defaultRedirect;

    const exchanged = await exchangeAuthorizationCode(code);
    const admin = createServiceClient();

    const tokenRow = {
      ...exchanged.tokenRow,
      user_id: statePayload.uid
    };

    const connectionRow = {
      ...exchanged.connectionRow,
      user_id: statePayload.uid,
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

    return Response.redirect(
      appendStatusQuery(postConnectRedirect, "connected", "Whoop account connected successfully."),
      302
    );
  } catch (error) {
    const defaultRedirect =
      sanitizeRedirectUrl(Deno.env.get("WHOOP_POST_CONNECT_REDIRECT")) ||
      "https://nomadicperformance.com/profile.html";

    return Response.redirect(
      appendStatusQuery(
        defaultRedirect,
        "error",
        error instanceof Error ? error.message : "Failed to finalize Whoop connection."
      ),
      302
    );
  }
});
