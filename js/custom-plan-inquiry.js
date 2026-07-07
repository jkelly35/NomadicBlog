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
    state.formEl = document.querySelector("[data-custom-plan-inquiry-form]");
    state.statusEl = document.querySelector("[data-custom-plan-inquiry-status]");
    state.submitButtonEl = document.querySelector("[data-custom-plan-inquiry-submit]");
    state.createAccountPromptEl = document.querySelector("[data-custom-plan-create-account-prompt]");
    state.createAccountButtonEl = document.querySelector("[data-custom-plan-create-account-button]");

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
    var durationWeeks = String(formData.get("duration_weeks") || "").trim();
    var daysPerWeek = String(formData.get("days_per_week") || "").trim();
    var notes = String(formData.get("notes") || "").trim();

    if (!name || !email || !sports || !goal) {
      setStatus("Please complete all required fields.", "error");
      return;
    }

    setBusy(true);
    setStatus("Submitting your inquiry...", "info");

    saveInquiry({
      name: name,
      email: email,
      sports: sports,
      goal: goal,
      durationWeeks: durationWeeks,
      daysPerWeek: daysPerWeek,
      notes: notes
    })
      .then(function () {
        state.formEl.reset();
        prefillUserFields();
        setStatus("Inquiry submitted. We will follow up with custom plan options.", "success");
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

  function saveInquiry(payload) {
    if (!state.client) {
      openMailtoFallback(payload);
      return Promise.resolve();
    }

    return state.client
      .from("custom_plan_inquiries")
      .insert({
        user_id: state.user && state.user.id ? state.user.id : null,
        full_name: payload.name,
        email: payload.email,
        primary_sports: payload.sports,
        primary_goal: payload.goal,
        desired_duration_weeks: payload.durationWeeks ? Number(payload.durationWeeks) : null,
        desired_days_per_week: payload.daysPerWeek ? Number(payload.daysPerWeek) : null,
        notes: payload.notes,
        status: "new"
      })
      .then(function (result) {
        if (!result || !result.error) {
          return;
        }

        var message = String(result.error.message || "").toLowerCase();
        if (result.error.code === "42P01" || message.indexOf("does not exist") > -1) {
          openMailtoFallback(payload);
          return;
        }

        throw result.error;
      });
  }

  function openMailtoFallback(payload) {
    var body = [
      "Name: " + payload.name,
      "Email: " + payload.email,
      "Primary sport(s): " + payload.sports,
      "Primary goal: " + payload.goal,
      "Desired duration (weeks): " + (payload.durationWeeks || ""),
      "Training days/week: " + (payload.daysPerWeek || ""),
      "Notes: " + (payload.notes || "")
    ].join("\n");

    var href =
      "mailto:joe@nomadicperformance.com" +
      "?subject=" + encodeURIComponent("Custom Plan Inquiry") +
      "&body=" + encodeURIComponent(body);

    window.location.href = href;
  }
})();
