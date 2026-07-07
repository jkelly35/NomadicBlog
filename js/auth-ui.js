(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";

  var state = {
    client: null,
    user: null,
    authButton: null,
    modal: null,
    status: null,
    mode: "signin"
  };

  document.addEventListener("DOMContentLoaded", function () {
    state.authButton = mountLoginButton();
    mountAuthModal();
    initializeAuth();
  });
  function mountLoginButton() {
    var header = document.querySelector("header");
    if (!header) {
      return null;
    }

    var existingButton = header.querySelector("[data-auth-trigger]");
    if (existingButton) {
      return existingButton;
    }

    var button = document.createElement("button");
    button.type = "button";
    button.className = "auth-nav-button is-corner";
    button.dataset.authTrigger = "true";
    button.textContent = "Log In";
    button.setAttribute("aria-haspopup", "dialog");
    button.addEventListener("click", onAuthButtonClick);

    header.appendChild(button);
    return button;
  }



  function mountAuthModal() {
    var modal = document.createElement("div");
    modal.className = "auth-modal";
    modal.dataset.authModal = "true";
    modal.hidden = true;
    modal.innerHTML =
      "<div class=\"auth-modal-backdrop\" data-auth-close></div>" +
      "<div class=\"auth-modal-panel\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"auth-title\">" +
      "<button type=\"button\" class=\"auth-modal-close\" data-auth-close aria-label=\"Close login modal\">&times;</button>" +
      "<h2 id=\"auth-title\">Account Login</h2>" +
      "<p class=\"auth-modal-subtitle\" data-auth-subtitle>Sign in to access your account.</p>" +
      "<form class=\"auth-form\" data-auth-form>" +
      "<label for=\"auth-email\">Email</label>" +
      "<input id=\"auth-email\" name=\"email\" type=\"email\" autocomplete=\"email\" required />" +
      "<label for=\"auth-password\">Password</label>" +
      "<input id=\"auth-password\" name=\"password\" type=\"password\" autocomplete=\"current-password\" required minlength=\"6\" />" +
      "<button type=\"submit\" class=\"auth-primary-btn\" data-auth-submit>Sign In</button>" +
      "</form>" +
      "<p class=\"auth-or-divider\" data-auth-divider>or</p>" +
      "<button type=\"button\" class=\"auth-secondary-btn auth-github-btn\" data-auth-github>Continue with GitHub</button>" +
      "<button type=\"button\" class=\"auth-secondary-btn\" data-auth-toggle-mode>Create an account</button>" +
      "<button type=\"button\" class=\"auth-secondary-btn auth-logout-btn\" data-auth-logout hidden>Log out</button>" +
      "<p class=\"auth-status\" role=\"status\" aria-live=\"polite\" data-auth-status></p>" +
      "</div>";

    document.body.appendChild(modal);
    state.modal = modal;
    state.status = modal.querySelector("[data-auth-status]");

    modal.addEventListener("click", function (event) {
      if (event.target.matches("[data-auth-close]")) {
        closeModal();
      }
    });

    var authForm = modal.querySelector("[data-auth-form]");
    authForm.addEventListener("submit", onAuthFormSubmit);

    var modeToggle = modal.querySelector("[data-auth-toggle-mode]");
    modeToggle.addEventListener("click", function () {
      state.mode = state.mode === "signin" ? "signup" : "signin";
      syncModalMode();
    });

    var githubButton = modal.querySelector("[data-auth-github]");
    githubButton.addEventListener("click", onGithubLogin);

    var logoutButton = modal.querySelector("[data-auth-logout]");
    logoutButton.addEventListener("click", onLogout);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && state.modal && !state.modal.hidden) {
        closeModal();
      }
    });

    syncModalMode();
  }

  function initializeAuth() {
    if (!window.supabase || !window.supabase.createClient) {
      markUnavailable("Supabase client library failed to load.");
      return;
    }

    var url = window.NOMADIC_SUPABASE_URL;
    var key = window.NOMADIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      markUnavailable("Add your Supabase URL and anon key in js/supabase-config.js");
      return;
    }

    state.client = window.supabase.createClient(url, key);

    state.client.auth.getSession().then(function (result) {
      if (result && result.data && result.data.session) {
        setUser(result.data.session.user);
      } else {
        setUser(null);
      }
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      setUser(session ? session.user : null);
    });
  }

  function setUser(user) {
    state.user = user;
    var header = document.querySelector("header");
    var nav = document.querySelector("header nav");
    if (header && nav) {
      var btn = header.querySelector("[data-auth-trigger]");
      var profileLink = nav.querySelector("[data-profile-link]");

      if (!btn) {
        state.authButton = mountLoginButton();
        btn = header.querySelector("[data-auth-trigger]");
      }

      if (btn) {
        btn.textContent = user && user.email ? "Log Out" : "Log In";
        btn.setAttribute("aria-haspopup", user && user.email ? "false" : "dialog");
      }

      var isCoachUser = !!(user && user.email && String(user.email).toLowerCase() === ADMIN_EMAIL);
      var adminBtn = nav.querySelector("[data-admin-link]");

      // Remove profile link if present
      if (profileLink) profileLink.remove();

      if (adminBtn) {
        adminBtn.remove();
      }

      // Add Athlete Dashboard only for athlete users (not coach account)
      if (user && user.email && !isCoachUser) {
        if (!nav.querySelector("[data-profile-link]")) {
          var pBtn = document.createElement("a");
          pBtn.href = "profile.html";
          pBtn.textContent = "Athlete Dashboard";
          pBtn.className = "auth-nav-button";
          pBtn.dataset.profileLink = "true";
          nav.appendChild(pBtn);
        }
      }

      // Add Coaching Dashboard only for coach account
      if (user && user.email && isCoachUser && !nav.querySelector("[data-admin-link]")) {
        var aBtn = document.createElement("a");
        aBtn.href = "admin.html";
        aBtn.textContent = "Coaching Dashboard";
        aBtn.className = "auth-nav-button";
        aBtn.dataset.adminLink = "true";
        nav.appendChild(aBtn);
      }
    }

    if (shouldForcePasswordUpdate(user)) {
      var onUpdatePasswordPage = window.location.pathname.indexOf("update-password.html") > -1;
      if (!onUpdatePasswordPage) {
        window.location.href = "update-password.html?firstLogin=1";
        return;
      }
    }

    enforceFoundingOnboardingGate();

    syncModalMode();
  }



  function markUnavailable(message) {
    if (state.authButton) {
      state.authButton.disabled = true;
      state.authButton.classList.add("is-disabled");
      state.authButton.title = message;
    }

    setStatus(message, "error");
  }

  function onAuthButtonClick() {
    if (state.user) {
      onLogout();
      return;
    }

    if (!state.modal) {
      return;
    }

    var preferredMode = consumePreferredAuthMode();
    if (preferredMode === "signup") {
      state.mode = "signup";
    } else if (preferredMode === "signin") {
      state.mode = "signin";
    }

    state.modal.hidden = false;
    document.body.classList.add("auth-modal-open");
    syncModalMode();

    var emailInput = state.modal.querySelector("#auth-email");
    if (emailInput && !state.user) {
      emailInput.focus();
    }
  }

  function closeModal() {
    if (!state.modal) {
      return;
    }

    state.modal.hidden = true;
    document.body.classList.remove("auth-modal-open");
    clearStatus();
  }

  function syncModalMode() {
    if (!state.modal) {
      return;
    }

    var subtitle = state.modal.querySelector("[data-auth-subtitle]");
    var form = state.modal.querySelector("[data-auth-form]");
    var divider = state.modal.querySelector("[data-auth-divider]");
    var github = state.modal.querySelector("[data-auth-github]");
    var submit = state.modal.querySelector("[data-auth-submit]");
    var toggle = state.modal.querySelector("[data-auth-toggle-mode]");
    var password = state.modal.querySelector("#auth-password");
    var logout = state.modal.querySelector("[data-auth-logout]");

    if (state.user) {
      subtitle.textContent = "Logged in as " + state.user.email;
      form.hidden = true;
      divider.hidden = true;
      github.hidden = true;
      toggle.hidden = true;
      password.required = false;
      logout.hidden = false;
      return;
    }

    form.hidden = false;
    divider.hidden = false;
    github.hidden = false;
    submit.hidden = false;
    toggle.hidden = false;
    logout.hidden = true;
    password.required = true;

    if (state.mode === "signup") {
      subtitle.textContent = "Create an account using your email and password.";
      submit.textContent = "Create Account";
      toggle.textContent = "Already have an account? Sign in";
      password.setAttribute("autocomplete", "new-password");
      return;
    }

    subtitle.textContent = "Sign in to access your account.";
    submit.textContent = "Sign In";
    toggle.textContent = "Create an account";
    password.setAttribute("autocomplete", "current-password");
  }

  function onAuthFormSubmit(event) {
    event.preventDefault();

    if (!state.client) {
      setStatus("Supabase is not configured yet.", "error");
      return;
    }

    var formData = new FormData(event.currentTarget);
    var email = String(formData.get("email") || "").trim();
    var password = String(formData.get("password") || "");

    if (!email || !password) {
      setStatus("Enter both email and password.", "error");
      return;
    }

    var authRequest;
    if (state.mode === "signup") {
      authRequest = state.client.auth.signUp({ email: email, password: password });
    } else {
      authRequest = state.client.auth.signInWithPassword({ email: email, password: password });
    }

    setStatus("Submitting...", "info");
    authRequest
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        if (state.mode === "signup") {
          setStatus("Check your email for a confirmation link.", "success");
          return;
        }

        var signedInUser = result && result.data && result.data.user ? result.data.user : null;
        if (shouldForcePasswordUpdate(signedInUser)) {
          window.location.href = "update-password.html?firstLogin=1";
          return;
        }

        // On successful sign in, send coach to admin and athletes to dashboard.
        var userEmail = (result.data && result.data.user && result.data.user.email) || email;
        if (String(userEmail || "").toLowerCase() === ADMIN_EMAIL) {
          window.location.href = "admin.html";
        } else {
          window.location.href = "profile.html";
        }
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Authentication failed.", "error");
      });
  }

  function consumePostLoginRedirect() {
    try {
      var raw = sessionStorage.getItem("nomadic_post_login_redirect");
      if (!raw) {
        return "";
      }

      sessionStorage.removeItem("nomadic_post_login_redirect");
      var target = String(raw).trim();
      if (!target) {
        return "";
      }

      if (/^mailto:/i.test(target)) {
        return target;
      }

      if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(target)) {
        var parsed = new URL(target);
        if (parsed.protocol === "https:" || parsed.protocol === "http:") {
          return parsed.toString();
        }
        return "";
      }

      return target;
    } catch (_error) {
      return "";
    }
  }

  function consumePreferredAuthMode() {
    try {
      var raw = sessionStorage.getItem("nomadic_auth_preferred_mode");
      if (!raw) {
        return "";
      }

      sessionStorage.removeItem("nomadic_auth_preferred_mode");
      var mode = String(raw).trim().toLowerCase();
      if (mode === "signup" || mode === "signin") {
        return mode;
      }

      return "";
    } catch (_error) {
      return "";
    }
  }

  function enforceFoundingOnboardingGate() {
    if (!state.client || !state.user || !state.user.id) {
      return;
    }

    var email = String(state.user.email || "").toLowerCase();
    if (email === ADMIN_EMAIL) {
      return;
    }

    var onOnboardingPage = window.location.pathname.indexOf("founding-onboarding.html") > -1;
    var onUpdatePasswordPage = window.location.pathname.indexOf("update-password.html") > -1;
    if (onOnboardingPage || onUpdatePasswordPage) {
      return;
    }

    state.client
      .from("founding_member_onboarding")
      .select("stage,is_founding_member")
      .eq("athlete_user_id", state.user.id)
      .maybeSingle()
      .then(function (result) {
        if (result.error || !result.data) {
          return;
        }

        var row = result.data;
        if (row.is_founding_member !== true) {
          return;
        }

        var stage = String(row.stage || "").trim();
        if (stage === "first_login_pending_docs") {
          window.location.href = "founding-onboarding.html";
        }
      })
      .catch(function () {
        // Skip gating if onboarding schema is not applied yet.
      });
  }

  function onLogout() {
    if (!state.client) {
      return;
    }

    state.client.auth
      .signOut()
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        setStatus("You are now logged out.", "success");
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Could not log out.", "error");
      });
  }

  function onGithubLogin() {
    if (!state.client) {
      setStatus("Supabase is not configured yet.", "error");
      return;
    }

    var redirectTo = window.NOMADIC_SUPABASE_OAUTH_REDIRECT || window.location.href;

    setStatus("Redirecting to GitHub...", "info");
    state.client.auth
      .signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: redirectTo
        }
      })
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
        }
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "GitHub login failed.", "error");
      });
  }

  function setStatus(message, variant) {
    if (!state.status) {
      return;
    }

    state.status.textContent = message || "";
    state.status.classList.remove("is-error", "is-success", "is-info");
    if (variant === "error") {
      state.status.classList.add("is-error");
    } else if (variant === "success") {
      state.status.classList.add("is-success");
    } else {
      state.status.classList.add("is-info");
    }
  }

  function clearStatus() {
    if (!state.status) {
      return;
    }

    state.status.textContent = "";
    state.status.classList.remove("is-error", "is-success", "is-info");
  }

  function shouldForcePasswordUpdate(user) {
    if (!user || !user.user_metadata) {
      return false;
    }

    return user.user_metadata.must_change_password === true;
  }
})();
