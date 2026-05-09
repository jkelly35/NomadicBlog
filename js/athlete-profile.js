(function () {
  var state = {
    client: null,
    user: null,
    profile: null,
    metrics: [],
    guardElement: null,
    contentElement: null,
    form: null,
    statusElement: null,
    metricsForm: null,
    metricsRows: null,
    metricsList: null,
    metricsStatus: null,
    editToggleButton: null,
    editorSection: null,
    metricTemplatesBySport: {
      climbing: ["20mm Edge Pull", "Max Pull Ups", "Weighted Pull Up", "Core Hold Time"],
      "trail-running": ["Resting HR", "Max HR", "Vertical Jump", "Anterior Reach", "5k Time"],
      skiing: ["Resting HR", "Max HR", "Countermovement Jump", "Single-Leg Balance"],
      snowboarding: ["Resting HR", "Max HR", "Countermovement Jump", "Lateral Bound"],
      mountainbiking: ["Resting HR", "Max HR", "FTP", "Grip Endurance"],
      mixed: ["Resting HR", "Max HR", "Vertical Jump", "Anaerobic Capacity"]
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    initializeProfile();
  });

  function initializeProfile() {
    state.guardElement = document.querySelector("[data-profile-guard]");
    state.contentElement = document.querySelector("[data-profile-content]");
    state.form = document.querySelector("[data-profile-form]");
    state.statusElement = document.querySelector("[data-profile-status]");
    state.metricsForm = document.querySelector("[data-metrics-form]");
    state.metricsRows = document.querySelector("[data-metric-rows]");
    state.metricsList = document.querySelector("[data-metrics-list]");
    state.metricsStatus = document.querySelector("[data-metrics-status]");
    state.editToggleButton = document.querySelector("[data-profile-edit-toggle]");
    state.editorSection = document.querySelector("[data-profile-editor]");

    if (!window.supabase || !window.supabase.createClient) {
      showError("Supabase client library failed to load.");
      return;
    }

    var url = window.NOMADIC_SUPABASE_URL;
    var key = window.NOMADIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      showError("Supabase configuration is incomplete.");
      return;
    }

    state.client = window.supabase.createClient(url, key);

    state.client.auth.getSession().then(function (result) {
      var session = result && result.data && result.data.session;
      if (!session) {
        redirectToHome();
        return;
      }

      state.user = session.user;
      loadDashboard();
      setupFormHandlers();
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      if (!session) {
        redirectToHome();
      }
    });
  }

  function loadDashboard() {
    if (!state.user) {
      return;
    }

    hideGuard();
    showContent();
    populateUserInfo();
    loadProfileData();
    loadMetricsData();
    loadCurrentTrainingProgram();
  }

  function populateUserInfo() {
    if (!state.user) {
      return;
    }

    var emailEl = document.querySelector("[data-profile-email]");
    var createdEl = document.querySelector("[data-profile-created]");
    var lastSigninEl = document.querySelector("[data-profile-last-signin]");

    if (emailEl) {
      emailEl.textContent = state.user.email || "—";
    }

    if (createdEl && state.user.created_at) {
      createdEl.textContent = formatDate(state.user.created_at);
    }

    if (lastSigninEl && state.user.last_sign_in_at) {
      lastSigninEl.textContent = formatDate(state.user.last_sign_in_at);
    }
  }

  function loadProfileData() {
    if (!state.user) {
      return;
    }

    setStatus("Loading athlete info...", "info");

    state.client
      .from("athlete_profiles")
      .select("*")
      .eq("user_id", state.user.id)
      .single()
      .then(function (result) {
        if (result.error && result.error.code !== "PGRST116") {
          setStatus(result.error.message, "error");
          return;
        }

        if (result.data) {
          state.profile = result.data;
          populateForm(result.data);
        } else {
          state.profile = null;
          updateHero(null);
        }

        clearStatus();
      })
      .catch(function () {
        clearStatus();
      });
  }

  function populateForm(profile) {
    if (!state.form) {
      return;
    }

    var nameField = state.form.querySelector("[name='name']");
    var emailField = state.form.querySelector("[name='email']");
    var sportField = state.form.querySelector("[name='sport']");
    var levelField = state.form.querySelector("[name='level']");
    var bioField = state.form.querySelector("[name='bio']");
    var ageField = state.form.querySelector("[name='age']");
    var locationField = state.form.querySelector("[name='location']");
    var heightField = state.form.querySelector("[name='height_cm']");
    var weightField = state.form.querySelector("[name='weight_kg']");

    if (emailField) emailField.value = (state.user && state.user.email) || "";
    if (nameField) nameField.value = profile && profile.name ? profile.name : "";
    if (sportField) sportField.value = profile && profile.sport ? profile.sport : "";
    if (levelField) levelField.value = profile && profile.level ? profile.level : "";
    if (bioField) bioField.value = profile && profile.bio ? profile.bio : "";
    if (ageField) ageField.value = profile && profile.age ? profile.age : "";
    if (locationField) locationField.value = profile && profile.location ? profile.location : "";
    if (heightField) heightField.value = profile && profile.height_cm ? profile.height_cm : "";
    if (weightField) weightField.value = profile && profile.weight_kg ? profile.weight_kg : "";

    updateHero(profile);
  }

  function updateHero(profile) {
    var sportEl = document.querySelector("[data-hero-sport]");
    var levelEl = document.querySelector("[data-hero-level]");
    var locationEl = document.querySelector("[data-hero-location]");

    if (sportEl) sportEl.textContent = normalizeDisplayValue(profile && profile.sport);
    if (levelEl) levelEl.textContent = normalizeDisplayValue(profile && profile.level);
    if (locationEl) locationEl.textContent = normalizeDisplayValue(profile && profile.location);
  }

  function loadMetricsData() {
    if (!state.user || !state.client || !state.metricsList) {
      return;
    }

    state.metricsList.innerHTML = '<p class="profile-loading">Loading metrics...</p>';

    state.client
      .from("athlete_metrics")
      .select("*")
      .eq("user_id", state.user.id)
      .order("updated_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          if (isMissingRelationError(result.error)) {
            state.metrics = [];
            renderMetricsCards();
            seedMetricRowsFromSport();
            setMetricsStatus(
              "Metrics table not found yet. Ask your coach/admin to create athlete_metrics to enable saving.",
              "info"
            );
            return;
          }

          setMetricsStatus(result.error.message, "error");
          return;
        }

        state.metrics = Array.isArray(result.data) ? result.data : [];
        renderMetricsCards();
        renderMetricRowsFromData(state.metrics);
      })
      .catch(function (error) {
        setMetricsStatus(error && error.message ? error.message : "Failed to load metrics.", "error");
      });
  }

  function renderMetricsCards() {
    if (!state.metricsList) {
      return;
    }

    if (!state.metrics.length) {
      state.metricsList.innerHTML =
        '<div class="metrics-empty">' +
        '<p>No metrics recorded yet.</p>' +
        '<p class="metrics-empty-sub">Add your first baseline metric below, or let your coach assign sport-specific tests.</p>' +
        "</div>";
      return;
    }

    var cards = state.metrics
      .map(function (metric) {
        var name = escapeHtml(metric.metric_name || "Metric");
        var value = escapeHtml(metric.metric_value || "—");
        var unit = escapeHtml(metric.metric_unit || "");
        var category = escapeHtml(metric.metric_category || "Performance");
        var updated = metric.updated_at ? formatDate(metric.updated_at) : "—";

        return (
          '<article class="metric-card">' +
          '<span class="metric-category">' + category + "</span>" +
          '<h3 class="metric-name">' + name + "</h3>" +
          '<p class="metric-value">' + value + (unit ? '<span class="metric-unit"> ' + unit + "</span>" : "") + "</p>" +
          '<p class="metric-updated">Updated ' + updated + "</p>" +
          "</article>"
        );
      })
      .join("");

    state.metricsList.innerHTML = '<div class="metrics-grid">' + cards + "</div>";
  }

  function renderMetricRowsFromData(metrics) {
    if (!state.metricsRows) {
      return;
    }

    state.metricsRows.innerHTML = "";

    if (metrics && metrics.length) {
      metrics.forEach(function (metric) {
        appendMetricRow({
          name: metric.metric_name || "",
          value: metric.metric_value || "",
          unit: metric.metric_unit || "",
          category: metric.metric_category || ""
        });
      });
      return;
    }

    seedMetricRowsFromSport();
  }

  function seedMetricRowsFromSport() {
    var sport = state.profile && state.profile.sport;
    var templates = state.metricTemplatesBySport[sport] || ["Resting HR", "Max HR", "Vertical Jump"];

    templates.slice(0, 3).forEach(function (name) {
      appendMetricRow({ name: name, value: "", unit: "", category: "Performance" });
    });
  }

  function appendMetricRow(values) {
    if (!state.metricsRows) {
      return;
    }

    var row = document.createElement("div");
    row.className = "metric-row";

    row.innerHTML =
      '<input type="text" data-metric-name placeholder="Metric name" value="' +
      escapeAttribute(values && values.name) +
      '" />' +
      '<input type="text" data-metric-value placeholder="Value" value="' +
      escapeAttribute(values && values.value) +
      '" />' +
      '<input type="text" data-metric-unit placeholder="Unit (bpm, kg, cm)" value="' +
      escapeAttribute(values && values.unit) +
      '" />' +
      '<input type="text" data-metric-category placeholder="Category" value="' +
      escapeAttribute(values && values.category) +
      '" />' +
      '<button type="button" class="metric-row-remove" data-metric-remove aria-label="Remove metric">Remove</button>';

    state.metricsRows.appendChild(row);
  }

  function setupFormHandlers() {
    if (state.editToggleButton) {
      state.editToggleButton.addEventListener("click", toggleEditorSection);
    }

    if (state.form) {
      state.form.addEventListener("submit", onProfileSubmit);
    }

    var cancelBtn = document.querySelector("[data-profile-cancel]");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", function (event) {
        event.preventDefault();
        loadProfileData();
        clearStatus();
      });
    }

    if (state.metricsForm) {
      state.metricsForm.addEventListener("submit", onMetricsSubmit);
    }

    var addMetricBtn = document.querySelector("[data-metric-add]");
    if (addMetricBtn) {
      addMetricBtn.addEventListener("click", function () {
        appendMetricRow({ name: "", value: "", unit: "", category: "Performance" });
      });
    }

    if (state.metricsRows) {
      state.metricsRows.addEventListener("click", function (event) {
        if (event.target && event.target.matches("[data-metric-remove]")) {
          var row = event.target.closest(".metric-row");
          if (row) {
            row.remove();
          }
        }
      });
    }

    var sportField = state.form ? state.form.querySelector("[name='sport']") : null;
    if (sportField) {
      sportField.addEventListener("change", function () {
        if (!state.metrics.length && state.metricsRows && !state.metricsRows.children.length) {
          seedMetricRowsFromSport();
        }
      });
    }

    var deleteBtn = document.querySelector("[data-profile-delete]");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", onDeleteAccount);
    }
  }

  function onProfileSubmit(event) {
    event.preventDefault();

    if (!state.user || !state.client || !state.form) {
      setStatus("Not authenticated.", "error");
      return;
    }

    var formData = new FormData(state.form);
    var desiredEmail = String(formData.get("email") || "").trim();
    var desiredHeight = parseFloat(formData.get("height_cm") || "") || null;
    var desiredWeight = parseFloat(formData.get("weight_kg") || "") || null;
    var profileData = {
      user_id: state.user.id,
      name: String(formData.get("name") || "").trim(),
      sport: String(formData.get("sport") || "").trim(),
      level: String(formData.get("level") || "").trim(),
      bio: String(formData.get("bio") || "").trim(),
      age: parseInt(formData.get("age") || 0, 10) || null,
      location: String(formData.get("location") || "").trim(),
      height_cm: desiredHeight,
      weight_kg: desiredWeight,
      updated_at: new Date().toISOString()
    };

    setStatus("Saving athlete info...", "info");

    saveProfileWithFallback(profileData)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        state.profile = result.data || profileData;
        updateHero(state.profile);

        maybeUpdateEmail(desiredEmail)
          .then(function (emailMessage) {
            setStatus(emailMessage ? "Athlete info saved. " + emailMessage : "Athlete info saved.", "success");
            setTimeout(function () {
              clearStatus();
            }, 2400);
          })
          .catch(function (emailError) {
            setStatus(
              "Athlete info saved, but email could not be updated: " +
                (emailError && emailError.message ? emailError.message : "Unknown error."),
              "info"
            );
          });
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to save athlete info.", "error");
      });
  }

  function saveProfileWithFallback(profileData) {
    var payload = Object.assign({}, profileData);
    var operation;

    if (state.profile && state.profile.id) {
      operation = state.client
        .from("athlete_profiles")
        .update(payload)
        .eq("user_id", state.user.id)
        .select()
        .single();
    } else {
      operation = state.client.from("athlete_profiles").insert([payload]).select().single();
    }

    return operation.then(function (result) {
      if (!result.error || !isMissingColumnError(result.error)) {
        return result;
      }

      var fallbackPayload = Object.assign({}, profileData);
      delete fallbackPayload.height_cm;
      delete fallbackPayload.weight_kg;

      if (state.profile && state.profile.id) {
        return state.client
          .from("athlete_profiles")
          .update(fallbackPayload)
          .eq("user_id", state.user.id)
          .select()
          .single();
      }

      return state.client.from("athlete_profiles").insert([fallbackPayload]).select().single();
    });
  }

  function maybeUpdateEmail(desiredEmail) {
    var existingEmail = (state.user && state.user.email) || "";

    if (!desiredEmail || desiredEmail.toLowerCase() === existingEmail.toLowerCase()) {
      return Promise.resolve("");
    }

    return state.client.auth.updateUser({ email: desiredEmail }).then(function (result) {
      if (result.error) {
        throw result.error;
      }

      return "Check your inbox to confirm your new email address.";
    });
  }

  function toggleEditorSection() {
    if (!state.editorSection || !state.editToggleButton) {
      return;
    }

    var isHidden = !!state.editorSection.hidden;
    state.editorSection.hidden = !isHidden;
    state.editToggleButton.setAttribute("aria-expanded", isHidden ? "true" : "false");
    state.editToggleButton.textContent = isHidden ? "Close Athlete Profile Editor" : "Edit Athlete Profile";
  }

  function onMetricsSubmit(event) {
    event.preventDefault();

    if (!state.user || !state.client || !state.metricsRows) {
      setMetricsStatus("Not authenticated.", "error");
      return;
    }

    var rowNodes = Array.prototype.slice.call(state.metricsRows.querySelectorAll(".metric-row"));
    var metricsToSave = rowNodes
      .map(function (row) {
        var name = String((row.querySelector("[data-metric-name]") || {}).value || "").trim();
        var value = String((row.querySelector("[data-metric-value]") || {}).value || "").trim();
        var unit = String((row.querySelector("[data-metric-unit]") || {}).value || "").trim();
        var category = String((row.querySelector("[data-metric-category]") || {}).value || "").trim();

        return {
          user_id: state.user.id,
          metric_name: name,
          metric_value: value,
          metric_unit: unit,
          metric_category: category || "Performance",
          updated_at: new Date().toISOString()
        };
      })
      .filter(function (metric) {
        return metric.metric_name && metric.metric_value;
      });

    setMetricsStatus("Saving metrics...", "info");

    state.client
      .from("athlete_metrics")
      .delete()
      .eq("user_id", state.user.id)
      .then(function (deleteResult) {
        if (deleteResult.error) {
          if (isMissingRelationError(deleteResult.error)) {
            setMetricsStatus(
              "Metrics table not found. Create athlete_metrics in Supabase before saving metrics.",
              "error"
            );
            return;
          }

          setMetricsStatus(deleteResult.error.message, "error");
          return;
        }

        if (!metricsToSave.length) {
          state.metrics = [];
          renderMetricsCards();
          setMetricsStatus("Metrics cleared.", "success");
          return;
        }

        state.client
          .from("athlete_metrics")
          .insert(metricsToSave)
          .select("*")
          .then(function (insertResult) {
            if (insertResult.error) {
              setMetricsStatus(insertResult.error.message, "error");
              return;
            }

            state.metrics = insertResult.data || [];
            renderMetricsCards();
            setMetricsStatus("Metrics saved.", "success");
          })
          .catch(function (error) {
            setMetricsStatus(error && error.message ? error.message : "Failed to save metrics.", "error");
          });
      })
      .catch(function (error) {
        setMetricsStatus(error && error.message ? error.message : "Failed to save metrics.", "error");
      });
  }

  function loadCurrentTrainingProgram() {
    var section = document.getElementById("profile-training-program-section");
    var content = document.getElementById("profile-training-program-content");
    if (!section || !content || !state.user || !state.client) {
      return;
    }

    content.innerHTML = '<p class="profile-training-loading">Loading your training program...</p>';

    state.client
      .from("user_training_programs")
      .select("*, training_program:program_id(name, description)")
      .eq("user_id", state.user.id)
      .eq("is_active", true)
      .order("assigned_at", { ascending: false })
      .limit(1)
      .then(function (result) {
        if (result.error) {
          if (isMissingRelationshipError(result.error)) {
            return loadCurrentTrainingProgramWithoutJoin(content);
          }

          content.innerHTML = '<p class="profile-training-error">' + escapeHtml(result.error.message) + "</p>";
          return;
        }

        renderTrainingProgram(content, result.data && result.data[0]);
      })
      .catch(function () {
        loadCurrentTrainingProgramWithoutJoin(content);
      });
  }

  function loadCurrentTrainingProgramWithoutJoin(contentElement) {
    state.client
      .from("user_training_programs")
      .select("*")
      .eq("user_id", state.user.id)
      .eq("is_active", true)
      .order("assigned_at", { ascending: false })
      .limit(1)
      .then(function (result) {
        if (result.error) {
          contentElement.innerHTML = '<p class="profile-training-error">' + escapeHtml(result.error.message) + "</p>";
          return;
        }

        renderTrainingProgram(contentElement, result.data && result.data[0]);
      })
      .catch(function (error) {
        contentElement.innerHTML =
          '<p class="profile-training-error">' +
          escapeHtml(error && error.message ? error.message : "Failed to load training program.") +
          "</p>";
      });
  }

  function renderTrainingProgram(contentElement, program) {
    if (!program) {
      // Demo preview for the coach account when no assignment exists yet.
      if (state.user && state.user.email === "joe@nomadicperformance.com") {
        program = {
          program_name: "8-Week Mountain Performance Block",
          assigned_at: new Date().toISOString(),
          is_demo: true
        };
      } else {
        contentElement.innerHTML = '<p class="profile-training-none">You have no active training program assigned yet.</p>';
        return;
      }
    }

    var programName =
      (program.training_program && program.training_program.name) ||
      program.program_name ||
      (program.program_id ? "Program " + String(program.program_id).slice(0, 8) : "Assigned Program");

    var startDate = program.assigned_at ? formatDate(program.assigned_at) : "—";
    var programUrl =
      "training-program-example.html?program=" + encodeURIComponent(programName);

    contentElement.innerHTML =
      '<div class="profile-training-details">' +
      '<div class="training-row"><span>Program</span><strong><a class="training-program-link" href="' +
      programUrl +
      '">' +
      escapeHtml(programName) +
      "</a></strong></div>" +
      '<div class="training-row"><span>Start Date</span><strong>' +
      escapeHtml(startDate) +
      "</strong></div>" +
      '<p class="training-note">' +
      (program.is_demo
        ? "Preview mode: this is a sample program shown for the coach account."
        : "Your coach assigns and updates this program from the Coaching Dashboard.") +
      "</p>" +
      '<a class="btn training-open-btn" href="' +
      programUrl +
      '">Open Program + Log Workout</a>' +
      "</div>";
  }

  function onDeleteAccount() {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      return;
    }

    if (!confirm("This will permanently delete your account and all data. Continue?")) {
      return;
    }

    if (!state.client || !state.user) {
      setStatus("Not authenticated.", "error");
      return;
    }

    setStatus("Deleting account...", "info");

    state.client.auth
      .admin.deleteUser(state.user.id)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        setStatus("Account deleted. Redirecting...", "success");
        setTimeout(function () {
          redirectToHome();
        }, 2000);
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to delete account.", "error");
      });
  }

  function hideGuard() {
    if (state.guardElement) {
      state.guardElement.hidden = true;
    }
  }

  function showContent() {
    if (state.contentElement) {
      state.contentElement.hidden = false;
    }
  }

  function showError(message) {
    if (state.guardElement) {
      state.guardElement.innerHTML =
        "<div style=\"padding: 2rem; text-align: center; color: #9f2d20;\">" +
        "<p style=\"font-size: 1.1rem; font-weight: 700;\">" +
        escapeHtml(message) +
        "</p>" +
        "<p><a href=\"index.html\" class=\"btn\" style=\"display: inline-block; margin-top: 1rem;\">Return Home</a></p>" +
        "</div>";
    }
  }

  function redirectToHome() {
    window.location.href = "index.html";
  }

  function setStatus(message, variant) {
    if (!state.statusElement) {
      return;
    }

    state.statusElement.textContent = message || "";
    state.statusElement.classList.remove("is-error", "is-success", "is-info");

    if (variant === "error") {
      state.statusElement.classList.add("is-error");
    } else if (variant === "success") {
      state.statusElement.classList.add("is-success");
    } else {
      state.statusElement.classList.add("is-info");
    }
  }

  function clearStatus() {
    if (!state.statusElement) {
      return;
    }

    state.statusElement.textContent = "";
    state.statusElement.classList.remove("is-error", "is-success", "is-info");
  }

  function setMetricsStatus(message, variant) {
    if (!state.metricsStatus) {
      return;
    }

    state.metricsStatus.textContent = message || "";
    state.metricsStatus.classList.remove("is-error", "is-success", "is-info");

    if (variant === "error") {
      state.metricsStatus.classList.add("is-error");
    } else if (variant === "success") {
      state.metricsStatus.classList.add("is-success");
    } else {
      state.metricsStatus.classList.add("is-info");
    }
  }

  function normalizeDisplayValue(value) {
    if (!value) {
      return "—";
    }

    var text = String(value);
    return text
      .split("-")
      .join(" ")
      .replace(/\b\w/g, function (c) {
        return c.toUpperCase();
      });
  }

  function isMissingRelationError(error) {
    var msg = error && error.message ? error.message.toLowerCase() : "";
    return error && error.code === "42P01" || msg.indexOf("does not exist") > -1;
  }

  function isMissingRelationshipError(error) {
    var msg = error && error.message ? error.message.toLowerCase() : "";
    return msg.indexOf("could not find a relationship") > -1;
  }

  function isMissingColumnError(error) {
    var msg = error && error.message ? error.message.toLowerCase() : "";
    return error && error.code === "42703" || msg.indexOf("column") > -1 && msg.indexOf("does not exist") > -1;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "");
  }

  function formatDate(dateString) {
    try {
      var date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (e) {
      return dateString;
    }
  }
})();
