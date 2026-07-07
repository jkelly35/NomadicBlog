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

  var state = {
    client: null,
    sessionUser: null,
    onboardingRow: null,
    canCheckout: false,
    checkoutBlockedReason: "",
    autoStartRequested: false,
    autoStartHandled: false,
    pendingCheckoutSource: "",
    statusEl: null,
    buttons: []
  };

  function setStatus(message, tone) {
    if (!state.statusEl) {
      return;
    }

    state.statusEl.textContent = String(message || "");
    state.statusEl.classList.remove("status-error", "status-info", "status-success");

    if (tone === "error") {
      state.statusEl.classList.add("status-error");
    } else if (tone === "success") {
      state.statusEl.classList.add("status-success");
    } else {
      state.statusEl.classList.add("status-info");
    }
  }

  function setBusy(isBusy) {
    state.buttons.forEach(function (button) {
      if (!button) {
        return;
      }
      button.disabled = !!isBusy;
      button.setAttribute("aria-busy", isBusy ? "true" : "false");
    });
  }

  function setCheckoutEnabled(isEnabled) {
    state.buttons.forEach(function (button) {
      if (!button) {
        return;
      }

      button.disabled = !isEnabled;
      button.setAttribute("aria-disabled", isEnabled ? "false" : "true");
    });
  }

  function setSessionUser(user) {
    state.sessionUser = user || null;
  }

  function isMissingTableError(error) {
    var msg = error && error.message ? String(error.message).toLowerCase() : "";
    return !!(error && (error.code === "42P01" || msg.indexOf("does not exist") > -1));
  }

  function evaluateCheckoutEligibility(row) {
    state.onboardingRow = row || null;
    state.canCheckout = false;
    state.checkoutBlockedReason = "";

    if (!row || row.is_founding_member !== true) {
      state.checkoutBlockedReason = "This account is not in the founding cohort yet.";
      return;
    }

    var stage = String(row.stage || "").trim();
    if (stage === "docs_signed_pending_payment" || stage === "payment_pending") {
      state.canCheckout = true;
      return;
    }

    if (stage === "first_login_pending_docs" || stage === "invited") {
      state.checkoutBlockedReason = "Complete legal signing before checkout.";
      return;
    }

    if (row.payment_completed_at) {
      state.checkoutBlockedReason = "Payment is already recorded for this member.";
      return;
    }

    state.checkoutBlockedReason = "Checkout is not available for your current onboarding stage.";
  }

  function refreshCheckoutAccess() {
    if (!state.client || !state.client.auth) {
      setCheckoutEnabled(false);
      setStatus("Checkout is not configured yet.", "error");
      return;
    }

    if (!state.sessionUser) {
      state.onboardingRow = null;
      state.canCheckout = false;
      state.checkoutBlockedReason = "";
      setCheckoutEnabled(true);
      setStatus("Sign in to verify your onboarding status before checkout.", "info");
      return;
    }

    setCheckoutEnabled(false);
    setStatus("Checking onboarding status...", "info");

    state.client
      .from("founding_member_onboarding")
      .select("athlete_user_id,is_founding_member,stage,payment_completed_at")
      .eq("athlete_user_id", state.sessionUser.id)
      .maybeSingle()
      .then(function (result) {
        if (result.error) {
          throw result.error;
        }

        evaluateCheckoutEligibility(result.data || null);

        if (state.canCheckout) {
          setCheckoutEnabled(true);
          setStatus("Eligible for checkout. Continue when ready.", "success");
          maybeAutoStartCheckout();
          return;
        }

        setCheckoutEnabled(true);
        setStatus(state.checkoutBlockedReason || "Checkout is not available yet.", "info");
        maybeAutoStartCheckout();
      })
      .catch(function (error) {
        if (isMissingTableError(error)) {
          setCheckoutEnabled(false);
          setStatus("Onboarding schema is not active yet. Run the founding onboarding migration.", "error");
          return;
        }

        setCheckoutEnabled(false);
        setStatus(error && error.message ? error.message : "Could not verify onboarding status.", "error");
      });
  }

  function openLoginPrompt() {
    var authTrigger = document.querySelector("[data-auth-trigger]");
    if (authTrigger && typeof authTrigger.click === "function") {
      authTrigger.click();
    }
  }

  function parseCheckoutStatusFromQuery() {
    var params = new URLSearchParams(window.location.search || "");
    var status = String(params.get("checkout") || "").trim().toLowerCase();

    if (status === "start") {
      state.autoStartRequested = true;
      setStatus("Checking eligibility for checkout...", "info");
      return;
    }

    if (status === "success") {
      setStatus("Payment received. Welcome to the Founding Member Cohort.", "success");
      return;
    }

    if (status === "cancelled") {
      setStatus("Checkout was cancelled. You can try again when ready.", "info");
    }
  }

  function consumeCheckoutStartQuery() {
    try {
      var params = new URLSearchParams(window.location.search || "");
      var status = String(params.get("checkout") || "").trim().toLowerCase();
      if (status !== "start") {
        return;
      }

      params.delete("checkout");
      if (window.history && window.history.replaceState) {
        var cleanQuery = params.toString();
        var cleanUrl = window.location.pathname + (cleanQuery ? "?" + cleanQuery : "") + window.location.hash;
        window.history.replaceState({}, "", cleanUrl);
      }
    } catch (_error) {
      // noop
    }
  }

  function maybeAutoStartCheckout() {
    if (!state.autoStartRequested || state.autoStartHandled) {
      return;
    }

    if (!state.sessionUser) {
      state.autoStartHandled = true;
      setStatus("Please sign in to continue to secure checkout.", "info");
      openLoginPrompt();
      return;
    }

    if (!state.canCheckout) {
      var stage = String(state.onboardingRow && state.onboardingRow.stage || "").trim();
      if (stage === "first_login_pending_docs" || stage === "invited") {
        state.autoStartHandled = true;
        setStatus("Finish legal signing first. Redirecting to onboarding...", "info");
        window.location.href = "founding-onboarding.html";
      }
      return;
    }

    state.autoStartHandled = true;
    consumeCheckoutStartQuery();
    startCheckout("founding_member_after_docs");
  }

  function extractInvokeErrorMessage(error) {
    var directMessage = String((error && error.message) || "").trim();
    if (directMessage && directMessage.toLowerCase().indexOf("non-2xx status code") === -1) {
      return directMessage;
    }

    var context = error && error.context;
    if (!context) {
      return directMessage;
    }

    if (typeof context === "string") {
      var text = String(context || "").trim();
      if (!text) {
        return directMessage;
      }

      try {
        var parsed = JSON.parse(text);
        var parsedMessage = String((parsed && (parsed.error || parsed.message || parsed.details)) || "").trim();
        return parsedMessage || text || directMessage;
      } catch (_error) {
        return text || directMessage;
      }
    }

    if (typeof context === "object") {
      var contextMessage = String(
        (context.error || context.message || context.details || "")
      ).trim();
      if (contextMessage) {
        return contextMessage;
      }
    }

    return directMessage;
  }

  function normalizeInvokeError(error, fallbackName) {
    var functionName = fallbackName || "stripe-create-checkout";
    var message = extractInvokeErrorMessage(error);
    var normalized = message.toLowerCase();

    if (
      normalized.indexOf("failed to send a request") !== -1 ||
      normalized.indexOf("requested function was not found") !== -1 ||
      normalized.indexOf("not_found") !== -1
    ) {
      return "Could not reach " + functionName + ". Deploy the Stripe function and verify secrets.";
    }

    if (
      normalized.indexOf("401") !== -1 ||
      normalized.indexOf("missing authorization") !== -1 ||
      normalized.indexOf("unable to authenticate") !== -1
    ) {
      return "Please create an account or log in before starting checkout.";
    }

    if (normalized.indexOf("missing required environment variable") !== -1) {
      if (normalized.indexOf("stripe_secret_key") !== -1) {
        return "Stripe is not fully configured yet: STRIPE_SECRET_KEY is missing in Supabase function secrets.";
      }
      if (normalized.indexOf("stripe_founding_member_price_id") !== -1) {
        return "Stripe is not fully configured yet: STRIPE_FOUNDING_MEMBER_PRICE_ID is missing in Supabase function secrets.";
      }
      return "Stripe function setup is incomplete. Add the missing environment variables in Supabase function secrets.";
    }

    if (
      normalized.indexOf("no such price") !== -1 ||
      normalized.indexOf("invalid price") !== -1
    ) {
      return "Stripe price configuration is invalid. Verify STRIPE_FOUNDING_MEMBER_PRICE_ID and that it belongs to the same Stripe mode (test/live) as your secret key.";
    }

    if (
      normalized.indexOf("invalid api key") !== -1 ||
      normalized.indexOf("api key") !== -1 && normalized.indexOf("invalid") !== -1
    ) {
      return "Stripe secret key is invalid. Check STRIPE_SECRET_KEY in Supabase function secrets.";
    }

    if (normalized.indexOf("non-2xx status code") !== -1) {
      return "Checkout request failed. Stripe may not be fully configured yet. Verify STRIPE_SECRET_KEY and STRIPE_FOUNDING_MEMBER_PRICE_ID in Supabase function secrets.";
    }

    if (!message) {
      return "Unable to start checkout right now. Please try again.";
    }

    return message;
  }

  function startCheckout(source) {
    if (!state.client || !state.client.functions) {
      setStatus("Checkout is not configured yet. Stripe function client is unavailable.", "error");
      return;
    }

    setBusy(true);
    setStatus("Redirecting to secure checkout...", "info");

    state.client.functions
      .invoke("stripe-create-checkout", {
        body: {
          plan: "founding_member",
          source: source || "founding_member_page",
          email: state.sessionUser && state.sessionUser.email ? state.sessionUser.email : null
        }
      })
      .then(function (result) {
        if (result.error) {
          throw result.error;
        }

        var data = result.data || {};
        var url = String(data.url || "").trim();

        if (!url) {
          throw new Error("Checkout URL was not returned.");
        }

        window.location.href = url;
      })
      .catch(function (error) {
        setBusy(false);
        setStatus(normalizeInvokeError(error, "stripe-create-checkout"), "error");
      });
  }

  function onCheckoutClick(event) {
    event.preventDefault();

    var button = event.currentTarget;
    if (!button || button.disabled) {
      return;
    }

    var source = String(button.getAttribute("data-checkout-source") || "founding_member_page");

    if (!state.sessionUser) {
      state.pendingCheckoutSource = source;
      setStatus("Please create an account or log in to continue to secure checkout.", "info");
      openLoginPrompt();
      return;
    }

    if (!state.canCheckout) {
      var stage = String(state.onboardingRow && state.onboardingRow.stage || "").trim();
      if (stage === "first_login_pending_docs" || stage === "invited") {
        setStatus("Finish legal signing first. Redirecting to onboarding...", "info");
        window.location.href = "founding-onboarding.html";
        return;
      }

      setStatus(state.checkoutBlockedReason || "Checkout is not available yet.", "info");
      return;
    }

    startCheckout(source);
  }

  function bindAuthState() {
    if (!state.client || !state.client.auth) {
      return;
    }

    state.client.auth.getSession().then(function (result) {
      var user = result && result.data && result.data.session ? result.data.session.user : null;
      setSessionUser(user);
      refreshCheckoutAccess();
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      var user = session ? session.user : null;
      var becameAuthenticated = !state.sessionUser && !!user;
      setSessionUser(user);

      refreshCheckoutAccess();

      if (becameAuthenticated && state.pendingCheckoutSource) {
        var source = state.pendingCheckoutSource;
        state.pendingCheckoutSource = "";
        if (state.canCheckout) {
          setStatus("Account verified. Launching checkout...", "success");
          startCheckout(source);
        }
      }
    });
  }

  function init() {
    state.client = createClient();
    state.statusEl = document.querySelector("[data-checkout-status]");
    state.buttons = Array.prototype.slice.call(
      document.querySelectorAll("[data-stripe-founding-checkout]")
    );

    state.buttons.forEach(function (button) {
      button.addEventListener("click", onCheckoutClick);
    });

    setCheckoutEnabled(false);

    parseCheckoutStatusFromQuery();
    bindAuthState();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
