(function () {
  var state = {
    client: null,
    form: null,
    statusEl: null,
    sessionReady: false,
    user: null
  };

  document.addEventListener("DOMContentLoaded", function () {
    state.form = document.querySelector("[data-password-reset-form]");
    state.statusEl = document.querySelector("[data-password-reset-status]");

    if (!window.supabase || !window.supabase.createClient) {
      setStatus("Supabase client library failed to load.", "error");
      disableForm();
      return;
    }

    var url = window.NOMADIC_SUPABASE_URL;
    var key = window.NOMADIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setStatus("Supabase configuration is incomplete.", "error");
      disableForm();
      return;
    }

    state.client = window.supabase.createClient(url, key);

    if (state.form) {
      state.form.addEventListener("submit", onSubmit);
    }

    initializeRecoverySession();
  });

  function initializeRecoverySession() {
    state.client.auth
      .getSession()
      .then(function (result) {
        var session = result && result.data && result.data.session ? result.data.session : null;
        if (session && session.user) {
          state.user = session.user;
          state.sessionReady = true;
          setStatus("Ready to update your password.", "info");
          return;
        }

        setStatus(
          "Open this page from your password reset email link, then submit your new password.",
          "error"
        );
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to initialize recovery session.", "error");
      });

    state.client.auth.onAuthStateChange(function (event, session) {
      if (event === "PASSWORD_RECOVERY" || (session && session.user)) {
        state.user = session && session.user ? session.user : state.user;
        state.sessionReady = true;
        setStatus("Ready to update your password.", "info");
      }
    });
  }

  function onSubmit(event) {
    event.preventDefault();

    if (!state.client || !state.sessionReady) {
      setStatus("Password reset session is not ready yet. Open this page from your email link.", "error");
      return;
    }

    var formData = new FormData(event.currentTarget);
    var newPassword = String(formData.get("newPassword") || "");
    var confirmPassword = String(formData.get("confirmPassword") || "");

    if (!newPassword || !confirmPassword) {
      setStatus("Enter and confirm your new password.", "error");
      return;
    }

    if (newPassword.length < 8) {
      setStatus("Password must be at least 8 characters.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus("Passwords do not match.", "error");
      return;
    }

    setStatus("Updating password...", "info");

    state.client.auth
      .updateUser({
        password: newPassword,
        data: {
          must_change_password: false
        }
      })
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        setStatus("Password updated successfully. Redirecting...", "success");
        setTimeout(function () {
          var userEmail = result.data && result.data.user && result.data.user.email
            ? String(result.data.user.email).toLowerCase()
            : "";
          if (userEmail === "joe@nomadicperformance.com") {
            window.location.href = "admin.html";
            return;
          }
          window.location.href = "profile.html";
        }, 900);
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to update password.", "error");
      });
  }

  function disableForm() {
    if (!state.form) {
      return;
    }

    Array.prototype.slice.call(state.form.elements || []).forEach(function (el) {
      el.disabled = true;
    });
  }

  function setStatus(message, variant) {
    if (!state.statusEl) {
      return;
    }

    state.statusEl.textContent = message || "";
    state.statusEl.classList.remove("is-error", "is-success", "is-info");

    if (variant === "error") {
      state.statusEl.classList.add("is-error");
    } else if (variant === "success") {
      state.statusEl.classList.add("is-success");
    } else {
      state.statusEl.classList.add("is-info");
    }
  }
})();
