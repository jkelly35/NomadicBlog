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

  function getLoginRedirectUrl() {
    return "index.html";
  }

  function getExpectedUserIdFromQuery() {
    try {
      var params = new URLSearchParams(window.location.search || "");
      return String(params.get("expected_user_id") || "").trim();
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

  function redirectToLogin() {
    window.location.href = getLoginRedirectUrl();
  }

  function init() {
    var client = createClient();
    if (!client || !client.auth) {
      return;
    }

    var expectedUserId = getExpectedUserIdFromQuery();

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
          setAutoRedirectMessage("Payment is complete, but this browser is signed in as a different account. Redirecting to login...");
          client.auth
            .signOut()
            .finally(function () {
              window.setTimeout(redirectToLogin, 550);
            });
          return;
        }

        setAutoRedirectMessage("Payment complete. Redirecting to your athlete dashboard...");
        window.setTimeout(redirectToDashboard, 450);
      })
      .catch(function () {
        // Do not block manual navigation on transient auth check failures.
      });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
