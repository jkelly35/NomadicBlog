(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var state = {
    client: null,
    user: null,
    guardElement: null,
    contentElement: null,
    athleteId: null,
    athleteName: null,
    currentMetrics: [],
    hasChanges: false,
    isPersonal: false
  };

  document.addEventListener("DOMContentLoaded", function () {
    initializeMetricsEditor();
  });

  function initializeMetricsEditor() {
    state.guardElement = document.querySelector("[data-metrics-editor-guard]");
    state.contentElement = document.querySelector("[data-metrics-editor-content]");

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
      verifyAdmin();
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      if (!session) {
        redirectToHome();
      }
    });
  }

  function verifyAdmin() {
    var params = new URLSearchParams(window.location.search);
    state.isPersonal = params.get("personal") === "true";

    if (state.isPersonal) {
      // Personal editing: user can only edit their own metrics
      if (!state.user) {
        showError("You must be logged in.");
        setTimeout(redirectToHome, 2000);
        return;
      }
    } else {
      // Admin editing: must be admin to edit other athletes' metrics
      if (!state.user || state.user.email !== ADMIN_EMAIL) {
        showError("You do not have permission to access this page.");
        setTimeout(redirectToHome, 2000);
        return;
      }
    }

    hideGuard();
    setupEventHandlers();
    loadMetricsEditor();
  }

  function setupEventHandlers() {
    var assessmentSelect = document.querySelector("[data-metrics-editor-assessment]");
    if (assessmentSelect) {
      assessmentSelect.addEventListener("change", onAssessmentSelected);
    }

    var presetSelect = document.querySelector("[data-metrics-editor-preset]");
    if (presetSelect) {
      presetSelect.addEventListener("change", onPresetMetricSelected);
    }

    var addCustomBtn = document.querySelector("[data-metrics-editor-add-custom]");
    if (addCustomBtn) {
      addCustomBtn.addEventListener("click", onAddCustomMetric);
    }

    var saveBtn = document.querySelector("[data-metrics-editor-save]");
    if (saveBtn) {
      saveBtn.addEventListener("click", onSaveMetrics);
    }

    var backBtns = document.querySelectorAll("[data-metrics-editor-back]");
    backBtns.forEach(function (btn) {
      btn.addEventListener("click", goBackToDashboard);
    });

    var metricsList = document.querySelector("[data-metrics-editor-list]");
    if (metricsList) {
      metricsList.addEventListener("click", function (event) {
        var deleteBtn = event.target.closest("[data-metric-delete]");
        if (deleteBtn) {
          onDeleteMetric(deleteBtn);
        }
      });
    }
  }

  function loadMetricsEditor() {
    var params = new URLSearchParams(window.location.search);
    state.athleteId = params.get("athleteId");
    state.athleteName = params.get("athleteName");

    var nameEl = document.querySelector("[data-metrics-editor-athlete-name]");
    if (nameEl) {
      if (state.isPersonal) {
        nameEl.textContent = "Manage Your Metrics";
      } else {
        nameEl.textContent = state.athleteName ? "Editing metrics for " + state.athleteName : "Loading...";
      }
    }

    var backBtn = document.querySelector("[data-metrics-editor-back]");
    if (backBtn) {
      if (state.isPersonal) {
        backBtn.textContent = "← Back to Profile";
      } else {
        backBtn.textContent = "← Back to Coaching Dashboard";
      }
    }

    if (!state.athleteId) {
      setStatus("No athlete selected.", "error");
      return;
    }

    loadAthleteMetrics();
    showContent();
  }

  function loadAthleteMetrics() {
    var metricsListEl = document.querySelector("[data-metrics-editor-list]");
    if (metricsListEl) {
      metricsListEl.innerHTML = '<p class="admin-loading">Loading metrics...</p>';
    }

    state.client
      .from("athlete_metrics")
      .select("*")
      .eq("user_id", state.athleteId)
      .order("updated_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          if (isMissingTableError(result.error)) {
            state.currentMetrics = [];
            renderMetricsEditor();
            setStatus("Metrics table not found yet.", "info");
            return;
          }
          setStatus(result.error.message, "error");
          return;
        }

        state.currentMetrics = result.data || [];
        renderMetricsEditor();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to load metrics.", "error");
      });
  }

  function renderMetricsEditor() {
    var metricsListEl = document.querySelector("[data-metrics-editor-list]");
    if (!metricsListEl) return;

    metricsListEl.innerHTML = "";

    if (!state.currentMetrics || !state.currentMetrics.length) {
      metricsListEl.innerHTML = '<p class="admin-loading">No metrics yet. Add one to get started.</p>';
      return;
    }

    state.currentMetrics.forEach(function (metric, index) {
      var row = document.createElement("div");
      row.className = "metrics-editor-row";
      row.innerHTML = `
        <div class="metrics-editor-row-content">
          <div class="metrics-editor-row-name">${escapeHtml(metric.metric_name || "")}</div>
          <div class="metrics-editor-row-details">
            <input type="text" class="metrics-editor-metric-value" data-metric-index="${index}" placeholder="Value" value="${escapeAttribute(metric.metric_value || "")}" />
            <input type="text" class="metrics-editor-metric-unit" data-metric-index="${index}" placeholder="Unit" value="${escapeAttribute(metric.metric_unit || "")}" />
            <select class="metrics-editor-metric-category" data-metric-index="${index}">
              <option value="Strength" ${metric.metric_category === "Strength" ? "selected" : ""}>Strength</option>
              <option value="Cardio" ${metric.metric_category === "Cardio" ? "selected" : ""}>Cardio</option>
              <option value="Mobility" ${metric.metric_category === "Mobility" ? "selected" : ""}>Mobility</option>
              <option value="Performance" ${metric.metric_category === "Performance" ? "selected" : ""}>Performance</option>
            </select>
          </div>
        </div>
        <button type="button" class="btn metrics-editor-delete-btn" data-metric-delete data-metric-id="${escapeAttribute(metric.id || "")}">Delete</button>
      `;
      metricsListEl.appendChild(row);
    });

    // Attach change listeners to input fields
    var valueInputs = document.querySelectorAll("[data-metric-index]");
    valueInputs.forEach(function (input) {
      input.addEventListener("change", function () {
        var index = parseInt(this.getAttribute("data-metric-index"), 10);
        if (this.classList.contains("metrics-editor-metric-value")) {
          state.currentMetrics[index].metric_value = this.value;
        } else if (this.classList.contains("metrics-editor-metric-unit")) {
          state.currentMetrics[index].metric_unit = this.value;
        } else if (this.classList.contains("metrics-editor-metric-category")) {
          state.currentMetrics[index].metric_category = this.value;
        }
        state.hasChanges = true;
      });
    });
  }

  function onAssessmentSelected(event) {
    var val = event.target.value;
    if (!val) return;

    var assessmentClusters = {
      climbing: [
        { name: "Countermovement Push-Up (CMPU)", unit: "reps", category: "Strength" },
        { name: "Closed Kinetic Chain Upper Extremity Stability Test (CKCUEST)", unit: "reps", category: "Strength" },
        { name: "20mm Edge Pull Strength", unit: "kg", category: "Strength" },
        { name: "Max Pull Ups", unit: "reps", category: "Strength" },
        { name: "Max Hang Time", unit: "sec", category: "Strength" },
        { name: "90 Degree Bent Leg Hang", unit: "sec", category: "Strength" },
        { name: "Adapted Grant Foot Raise", unit: "reps", category: "Mobility" },
        { name: "Ape Index", unit: "cm", category: "Performance" }
      ],
      running: [
        { name: "Vertical Jump Height", unit: "cm", category: "Performance" },
        { name: "Single Leg Squat Test", unit: "reps", category: "Strength" },
        { name: "Single Leg Heel Raise", unit: "reps", category: "Strength" },
        { name: "Side Plank with Hip Abduction Hold (Max Time)", unit: "sec", category: "Strength" },
        { name: "Y Balance (Anterior Reach)", unit: "cm", category: "Mobility" }
      ]
    };

    var cluster = assessmentClusters[val];
    if (!cluster) {
      setStatus("Unknown assessment cluster.", "error");
      return;
    }

    cluster.forEach(function (metric) {
      state.currentMetrics.push({
        metric_name: metric.name,
        metric_value: "",
        metric_unit: metric.unit,
        metric_category: metric.category
      });
    });
    state.hasChanges = true;

    event.target.value = "";
    renderMetricsEditor();
    setStatus(cluster.length + " metrics added. Don't forget to save!", "success");
  }

  function onPresetMetricSelected(event) {
    var val = event.target.value;
    if (!val) return;

    var presetDefaults = {
      "Countermovement Push-Up (CMPU)": {unit: "reps", category: "Strength"},
      "Closed Kinetic Chain Upper Extremity Stability Test (CKCUEST)": {unit: "reps", category: "Strength"},
      "20mm Edge Pull Strength": {unit: "kg", category: "Strength"},
      "Max Pull Ups": {unit: "reps", category: "Strength"},
      "Max Hang Time": {unit: "sec", category: "Strength"},
      "90 Degree Bent Leg Hang": {unit: "sec", category: "Strength"},
      "Adapted Grant Foot Raise": {unit: "reps", category: "Mobility"},
      "Ape Index": {unit: "cm", category: "Performance"},
      "Vertical Jump Height": {unit: "cm", category: "Performance"},
      "Single Leg Squat Test": {unit: "reps", category: "Strength"},
      "Single Leg Heel Raise": {unit: "reps", category: "Strength"},
      "Side Plank with Hip Abduction Hold (Max Time)": {unit: "sec", category: "Strength"},
      "Knee to Wall (Ankle DF Test)": {unit: "cm", category: "Mobility"},
      "Y Balance (Anterior Reach)": {unit: "cm", category: "Mobility"},
      "Broad Jump": {unit: "cm", category: "Performance"},
      "Tripple Hop": {unit: "cm", category: "Performance"}
    };
    var def = presetDefaults[val] || {unit: "", category: "Performance"};

    state.currentMetrics.push({
      metric_name: val,
      metric_value: "",
      metric_unit: def.unit,
      metric_category: def.category
    });
    state.hasChanges = true;

    event.target.value = "";
    renderMetricsEditor();
    setStatus("Metric added. Don't forget to save!", "info");
  }

  function onAddCustomMetric() {
    state.currentMetrics.push({
      metric_name: "",
      metric_value: "",
      metric_unit: "",
      metric_category: "Performance"
    });
    state.hasChanges = true;
    renderMetricsEditor();
  }

  function onDeleteMetric(btn) {
    var metricId = btn.getAttribute("data-metric-id");
    if (!metricId) return;

    var idx = state.currentMetrics.findIndex(function (m) {
      return m.id === metricId;
    });
    if (idx !== -1) {
      state.currentMetrics.splice(idx, 1);
      state.hasChanges = true;
      renderMetricsEditor();
      setStatus("Metric removed. Save to apply.", "info");
    }
  }

  function onSaveMetrics() {
    if (!state.athleteId || !state.client) {
      setStatus("No athlete selected.", "error");
      return;
    }

    setStatus("Saving metrics...", "info");

    state.client
      .from("athlete_metrics")
      .delete()
      .eq("user_id", state.athleteId)
      .then(function (deleteResult) {
        if (deleteResult.error) {
          if (isMissingTableError(deleteResult.error)) {
            setStatus("Metrics table not set up yet.", "error");
            return;
          }
          setStatus(deleteResult.error.message, "error");
          return;
        }

        var metricsToSave = state.currentMetrics
          .filter(function (m) {
            return m.metric_name && m.metric_name.trim();
          })
          .map(function (m) {
            return {
              user_id: state.athleteId,
              metric_name: m.metric_name,
              metric_value: m.metric_value || "",
              metric_unit: m.metric_unit || "",
              metric_category: m.metric_category || "Performance",
              updated_at: new Date().toISOString()
            };
          });

        if (!metricsToSave.length) {
          setStatus("No metrics to save.", "success");
          state.hasChanges = false;
          return;
        }

        state.client
          .from("athlete_metrics")
          .insert(metricsToSave)
          .then(function (insertResult) {
            if (insertResult.error) {
              setStatus(insertResult.error.message, "error");
              return;
            }
            setStatus("Metrics saved successfully!", "success");
            state.hasChanges = false;
            setTimeout(goBackToDashboard, 1500);
          })
          .catch(function (error) {
            setStatus(error && error.message ? error.message : "Failed to save metrics.", "error");
          });
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to delete old metrics.", "error");
      });
  }

  function goBackToDashboard() {
    if (state.isPersonal) {
      window.location.href = "profile.html";
    } else {
      window.location.href = "admin.html";
    }
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

  function showError(msg) {
    if (state.guardElement) {
      state.guardElement.innerHTML = '<p style="color: #9f2d20; font-weight: 700;">' + escapeHtml(msg) + '</p>';
    }
  }

  function setStatus(msg, type) {
    var statusEl = document.querySelector("[data-metrics-editor-status]");
    if (!statusEl) return;

    statusEl.textContent = msg;
    statusEl.className = "admin-modal-status is-" + (type || "info");
    if (type === "success") {
      setTimeout(function () {
        statusEl.textContent = "";
        statusEl.className = "admin-modal-status";
      }, 3000);
    }
  }

  function redirectToHome() {
    window.location.href = "index.html";
  }

  function isMissingTableError(error) {
    return error && error.message && error.message.toLowerCase().includes("does not exist");
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'})[c];
    });
  }

  function escapeAttribute(str) {
    return String(str || "").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
})();
