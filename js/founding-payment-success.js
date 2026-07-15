(function () {
  function createClient() {
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      return null;
    }

    var url = String(window.NOMADIC_SUPABASE_URL || "").trim();
    var anonKey = String(window.NOMADIC_SUPABASE_ANON_KEY || "").trim();

    if (!url || !anonKey) {
      return null;
    }

    return window.supabase.createClient(url, anonKey);
  }

  function getDashboardRedirectUrl() {
    return "profile.html?founding_payment=success#profile-tasks-section";
  }

  function getExpectedUserIdFromQuery() {
    try {
      var params = new URLSearchParams(window.location.search || "");
      return String(params.get("expected_user_id") || "").trim();
    } catch (_error) {
      return "";
    }
  }

  function getCheckoutSessionIdFromQuery() {
    try {
      var params = new URLSearchParams(window.location.search || "");
      return String(params.get("checkout_session_id") || "").trim();
    } catch (_error) {
      return "";
    }
  }

  function setAutoRedirectMessage(message) {
    var statusEl = document.querySelector("[data-payment-success-auto-status]");
    if (!statusEl) {
      return;
    }

    statusEl.textContent = String(message || "");
  }

  function redirectToDashboard() {
    window.location.href = getDashboardRedirectUrl();
  }

  function finalizePaymentForSession(client, expectedUserId) {
    if (!client || !client.rpc) {
      return Promise.resolve(false);
    }

    return client
      .rpc("complete_founding_member_payment", {
        p_athlete_user_id: expectedUserId || null
      })
      .then(function (result) {
        if (result.error) {
          throw result.error;
        }

        return true;
      });
  }

  function reconcilePaymentFromStripe(client, expectedUserId, checkoutSessionId) {
    if (!client || !client.functions || !client.functions.invoke) {
      return Promise.resolve(false);
    }

    return client.functions
      .invoke("stripe-reconcile-payment", {
        body: {
          athlete_user_id: expectedUserId || null,
          session_id: checkoutSessionId || null
        }
      })
      .then(function (result) {
        if (result && result.error) {
          throw result.error;
        }
        return true;
      });
  }

  function init() {
    var client = createClient();
    if (!client || !client.auth) {
      return;
    }

    var expectedUserId = getExpectedUserIdFromQuery();
    var checkoutSessionId = getCheckoutSessionIdFromQuery();

    client.auth
      .getSession()
      .then(function (result) {
        var session = result && result.data && result.data.session;
        if (!session || !session.user) {
          setAutoRedirectMessage("Payment complete. Sign in, then continue to your athlete dashboard.");
          return;
        }

        var currentUserId = String(session.user.id || "").trim();
        if (expectedUserId && currentUserId && expectedUserId !== currentUserId) {
          setAutoRedirectMessage("Payment is complete for your athlete account, but this browser is currently signed in as a different user. Sign out and then sign in with the athlete account to continue.");
          return;
        }

        setAutoRedirectMessage("Payment complete. Updating your athlete account and redirecting to your dashboard...");
        reconcilePaymentFromStripe(client, expectedUserId || currentUserId, checkoutSessionId)
          .catch(function () {
            // Best-effort: fall back to standard completion path.
          })
          .then(function () {
            return finalizePaymentForSession(client, expectedUserId || currentUserId);
          })
          .catch(function () {
            // Best-effort: redirect even if the reconciliation RPC is temporarily unavailable.
          })
          .finally(function () {
            window.setTimeout(redirectToDashboard, 450);
          });
      })
      .catch(function () {
        // Do not block manual navigation on transient auth check failures.
      });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
