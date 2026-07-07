(function () {
  var state = {
    client: null,
    user: null,
    formEl: null,
    statusEl: null,
    submitButtonEl: null,
    createAccountPromptEl: null,
    createAccountButtonEl: null
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    state.formEl = document.querySelector("[data-membership-inquiry-form]");
    state.statusEl = document.querySelector("[data-membership-inquiry-status]");
    state.submitButtonEl = document.querySelector("[data-membership-inquiry-submit]");
    state.createAccountPromptEl = document.querySelector("[data-membership-create-account-prompt]");
    state.createAccountButtonEl = document.querySelector("[data-membership-create-account-button]");

    if (!state.formEl) {
      return;
    }

    state.formEl.addEventListener("submit", onSubmit);
    if (state.createAccountButtonEl) {
      state.createAccountButtonEl.addEventListener("click", onCreateAccountClick);
    }

    if (window.supabase && typeof window.supabase.createClient === "function") {
      var url = String(window.NOMADIC_SUPABASE_URL || "").trim();
      var key = String(window.NOMADIC_SUPABASE_ANON_KEY || "").trim();
      if (url && key) {
        state.client = window.supabase.createClient(url, key);
        state.client.auth.getSession().then(function (result) {
          var session = result && result.data && result.data.session;
          state.user = session && session.user ? session.user : null;
          prefillUserFields();
        });
      }
    }

    prefillUserFields();
  }

  function prefillUserFields() {
    if (!state.formEl) {
      return;
    }

    var emailField = state.formEl.querySelector("[name='email']");
    var nameField = state.formEl.querySelector("[name='name']");

    if (emailField && !emailField.value && state.user && state.user.email) {
      emailField.value = String(state.user.email || "").trim();
    }

    if (nameField && !nameField.value && state.user && state.user.user_metadata && state.user.user_metadata.full_name) {
      nameField.value = String(state.user.user_metadata.full_name || "").trim();
    }
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

  function setBusy(isBusy) {
    if (!state.submitButtonEl) {
      return;
    }

    state.submitButtonEl.disabled = !!isBusy;
    state.submitButtonEl.setAttribute("aria-busy", isBusy ? "true" : "false");
  }

  function onSubmit(event) {
    event.preventDefault();

    if (!state.formEl) {
      return;
    }

    var formData = new FormData(state.formEl);
    var name = String(formData.get("name") || "").trim();
    var email = String(formData.get("email") || "").trim();
    var sports = String(formData.get("sports") || "").trim();
    var goal = String(formData.get("goal") || "").trim();
    var notes = String(formData.get("notes") || "").trim();

    if (!name || !email || !sports || !goal) {
      setStatus("Please complete all required fields.", "error");
      return;
    }

    setBusy(true);
    setStatus("Submitting your inquiry...", "info");

    saveInquiry(name, email, sports, goal, notes)
      .then(function () {
        state.formEl.reset();
        prefillUserFields();
        setStatus("Inquiry submitted. We will reach out soon with next steps.", "success");
        showCreateAccountPrompt();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Could not submit inquiry.", "error");
      })
      .finally(function () {
        setBusy(false);
      });
  }

  function showCreateAccountPrompt() {
    if (!state.createAccountPromptEl) {
      return;
    }

    if (state.user) {
      state.createAccountPromptEl.hidden = true;
      return;
    }

    state.createAccountPromptEl.hidden = false;
  }

  function onCreateAccountClick() {
    try {
      sessionStorage.setItem("nomadic_post_login_redirect", "profile.html");
      sessionStorage.setItem("nomadic_auth_preferred_mode", "signup");
    } catch (_error) {
      // Best-effort only.
    }

    var authTrigger = document.querySelector("[data-auth-trigger]");
    if (authTrigger && typeof authTrigger.click === "function") {
      authTrigger.click();
      return;
    }

    window.location.href = "index.html";
  }

  function saveInquiry(name, email, sports, goal, notes) {
    if (!state.client) {
      openMailtoFallback(name, email, sports, goal, notes);
      return Promise.resolve();
    }

    return state.client
      .from("membership_inquiries")
      .insert({
        user_id: state.user && state.user.id ? state.user.id : null,
        full_name: name,
        email: email,
        primary_sports: sports,
        primary_goal: goal,
        notes: notes,
        status: "new"
      })
      .then(function (result) {
        if (!result || !result.error) {
          return;
        }

        var message = String(result.error.message || "").toLowerCase();
        if (result.error.code === "42P01" || message.indexOf("does not exist") > -1) {
          openMailtoFallback(name, email, sports, goal, notes);
          return;
        }

        throw result.error;
      });
  }

  function openMailtoFallback(name, email, sports, goal, notes) {
    var body = [
      "Name: " + name,
      "Email: " + email,
      "Primary sport(s): " + sports,
      "Primary goal: " + goal,
      "Notes: " + (notes || "")
    ].join("\n");

    var href =
      "mailto:joe@nomadicperformance.com" +
      "?subject=" + encodeURIComponent("Membership Inquiry") +
      "&body=" + encodeURIComponent(body);

    window.location.href = href;
  }
})();
