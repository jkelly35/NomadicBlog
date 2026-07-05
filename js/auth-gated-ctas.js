(function () {
  var state = {
    client: null,
    user: null,
    statusEl: null,
    links: []
  };

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

  function openAuthModal() {
    var authTrigger = document.querySelector("[data-auth-trigger]");
    if (authTrigger && typeof authTrigger.click === "function") {
      authTrigger.click();
    }
  }

  function savePostLoginRedirect(target) {
    try {
      sessionStorage.setItem("nomadic_post_login_redirect", String(target || ""));
    } catch (_error) {
      // Best-effort only.
    }
  }

  function onCtaClick(event) {
    var link = event.currentTarget;
    if (!link) {
      return;
    }

    var targetHref = String(link.getAttribute("href") || "").trim();
    if (!targetHref) {
      return;
    }

    if (state.user) {
      return;
    }

    event.preventDefault();
    savePostLoginRedirect(targetHref);
    setStatus("Create an account or log in to continue.", "info");
    openAuthModal();
  }

  function bindAuthState() {
    if (!state.client || !state.client.auth) {
      return;
    }

    state.client.auth.getSession().then(function (result) {
      var user = result && result.data && result.data.session ? result.data.session.user : null;
      state.user = user || null;
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      var user = session ? session.user : null;
      state.user = user || null;
      if (state.user) {
        setStatus("", "info");
      }
    });
  }

  function init() {
    state.client = createClient();
    state.statusEl = document.querySelector("[data-auth-gate-status]");
    state.links = Array.prototype.slice.call(document.querySelectorAll("[data-auth-gated-href]"));

    if (!state.links.length) {
      return;
    }

    state.links.forEach(function (link) {
      link.addEventListener("click", onCtaClick);
    });

    bindAuthState();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
