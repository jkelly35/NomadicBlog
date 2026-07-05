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

  function setSessionUser(user) {
    state.sessionUser = user || null;
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

    if (status === "success") {
      setStatus("Payment received. Welcome to the Founding Member Cohort.", "success");
      return;
    }

    if (status === "cancelled") {
      setStatus("Checkout was cancelled. You can try again when ready.", "info");
    }
  }

  function normalizeInvokeError(error, fallbackName) {
    var functionName = fallbackName || "stripe-create-checkout";
    var message = String((error && error.message) || "").trim();
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

    startCheckout(source);
  }

  function bindAuthState() {
    if (!state.client || !state.client.auth) {
      return;
    }

    state.client.auth.getSession().then(function (result) {
      var user = result && result.data && result.data.session ? result.data.session.user : null;
      setSessionUser(user);
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      var user = session ? session.user : null;
      var becameAuthenticated = !state.sessionUser && !!user;
      setSessionUser(user);

      if (becameAuthenticated && state.pendingCheckoutSource) {
        var source = state.pendingCheckoutSource;
        state.pendingCheckoutSource = "";
        setStatus("Account verified. Launching checkout...", "success");
        startCheckout(source);
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

    parseCheckoutStatusFromQuery();
    bindAuthState();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
