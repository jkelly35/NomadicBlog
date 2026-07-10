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
    metricsLatest: [],
    hasChanges: false,
    isPersonal: false
  };

  var METRIC_CATEGORIES = [
    "Readiness",
    "Recovery",
    "Load",
    "Strength",
    "Power",
    "Cardio",
    "Mobility",
    "Performance",
    "Sport-Specific",
    "Health"
  ];

  var PRESET_METRICS = [
    { name: "Readiness", unit: "score", category: "Readiness" },
    { name: "HRV", unit: "ms", category: "Recovery" },
    { name: "Resting HR", unit: "bpm", category: "Recovery" },
    { name: "Sleep", unit: "h", category: "Recovery" },
    { name: "Fatigue", unit: "score", category: "Readiness" },
    { name: "Training Load", unit: "AU", category: "Load" },
    { name: "Acute:Chronic Workload Ratio", unit: "ratio", category: "Load" },
    { name: "Recovery Score", unit: "score", category: "Recovery" },
    { name: "VO2 Max", unit: "ml/kg/min", category: "Cardio" },
    { name: "Strength Metrics", unit: "", category: "Strength" },
    { name: "Grip Strength", unit: "kg", category: "Strength" },
    { name: "Jump Metrics", unit: "cm", category: "Power" },
    { name: "Power Output", unit: "W", category: "Power" },
    { name: "Session Adherence", unit: "%", category: "Readiness" },
    { name: "Pain/Injury Flags", unit: "", category: "Health" },
    { name: "Altitude Exposure", unit: "m", category: "Load" },
    { name: "Ski Vertical Feet", unit: "ft", category: "Sport-Specific" },
    { name: "Trail Elevation Gain", unit: "ft", category: "Sport-Specific" },
    { name: "Climbing Grades", unit: "grade", category: "Sport-Specific" },
    { name: "MTB Ride Metrics", unit: "", category: "Sport-Specific" },
    { name: "Countermovement Push-Up (CMPU)", unit: "reps", category: "Strength" },
    { name: "Closed Kinetic Chain Upper Extremity Stability Test (CKCUEST)", unit: "reps", category: "Strength" },
    { name: "20mm Edge Pull Strength", unit: "kg", category: "Strength" },
    { name: "Max Pull Ups", unit: "reps", category: "Strength" },
    { name: "Max Hang Time", unit: "sec", category: "Strength" },
    { name: "90 Degree Bent Leg Hang", unit: "sec", category: "Strength" },
    { name: "Adapted Grant Foot Raise", unit: "reps", category: "Mobility" },
    { name: "Ape Index", unit: "cm", category: "Performance" },
    { name: "Vertical Jump Height", unit: "cm", category: "Power" },
    { name: "Single Leg Squat Test", unit: "reps", category: "Strength" },
    { name: "Single Leg Heel Raise", unit: "reps", category: "Strength" },
    { name: "Side Plank with Hip Abduction Hold (Max Time)", unit: "sec", category: "Strength" },
    { name: "Knee to Wall (Ankle DF Test)", unit: "cm", category: "Mobility" },
    { name: "Y Balance (Anterior Reach)", unit: "cm", category: "Mobility" },
    { name: "Broad Jump", unit: "cm", category: "Power" },
    { name: "Tripple Hop", unit: "cm", category: "Power" }
  ];

  var ASSESSMENT_CLUSTERS = {
    climbing: [
      "Countermovement Push-Up (CMPU)",
      "Closed Kinetic Chain Upper Extremity Stability Test (CKCUEST)",
      "20mm Edge Pull Strength",
      "Max Pull Ups",
      "Max Hang Time",
      "90 Degree Bent Leg Hang",
      "Adapted Grant Foot Raise",
      "Ape Index",
      "Climbing Grades",
      "Grip Strength"
    ],
    running: [
      "Vertical Jump Height",
      "Single Leg Squat Test",
      "Single Leg Heel Raise",
      "Side Plank with Hip Abduction Hold (Max Time)",
      "Y Balance (Anterior Reach)",
      "VO2 Max",
      "Trail Elevation Gain"
    ],
    readiness: [
      "Readiness",
      "HRV",
      "Resting HR",
      "Sleep",
      "Fatigue",
      "Training Load",
      "Acute:Chronic Workload Ratio",
      "Recovery Score",
      "Session Adherence",
      "Pain/Injury Flags"
    ],
    mountain: [
      "Altitude Exposure",
      "Ski Vertical Feet",
      "Trail Elevation Gain",
      "Climbing Grades",
      "MTB Ride Metrics",
      "Power Output"
    ]
  };

  var PRESET_DEFAULTS = buildPresetDefaults();

  var BENCHMARK_HINTS = [
    {
      match: /vo2\s*max/i,
      text: "General guide (ml/kg/min): recreational 35-45, trained 45-55, elite 55+."
    },
    {
      match: /resting\s*hr|resting\s*heart\s*rate/i,
      text: "General guide (bpm): many healthy adults 60-80, endurance-trained athletes often 40-60."
    },
    {
      match: /hrv/i,
      text: "HRV is individual. Use your 2-4 week average as baseline and watch trend direction over single readings."
    },
    {
      match: /vertical\s*jump|broad\s*jump|triple\s*hop|tripple\s*hop/i,
      text: "Power tests are most useful when compared to your own previous baseline under similar fatigue and surface conditions."
    },
    {
      match: /y\s*balance|single\s*leg\s*squat|single\s*leg\s*heel\s*raise|side\s*plank/i,
      text: "Symmetry and movement quality matter as much as raw score; compare left-right change over time."
    }
  ];

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
    populatePresetSelectors();

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

    var summaryPdfBtn = document.querySelector("[data-metrics-editor-summary-pdf]");
    if (summaryPdfBtn) {
      summaryPdfBtn.addEventListener("click", onPrintSummaryPdf);
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

    var cardsList = document.querySelector("[data-metrics-editor-cards]");
    if (cardsList) {
      cardsList.addEventListener("click", function (event) {
        var clickedCard = event.target && event.target.closest(".metric-card");

        var deleteFlipBtn = event.target && event.target.closest("[data-metric-flip-delete]");
        if (deleteFlipBtn) {
          var deleteCard = deleteFlipBtn.closest(".metric-card");
          if (deleteCard) {
            deleteMetricFromFlippedCard(deleteCard);
          }
          return;
        }

        var cancelFlipBtn = event.target && event.target.closest("[data-metric-flip-cancel]");
        if (cancelFlipBtn) {
          var cancelCard = cancelFlipBtn.closest(".metric-card");
          if (cancelCard) {
            closeMetricCardEditor(cancelCard);
          }
          return;
        }

        var closeFlipBtn = event.target && event.target.closest("[data-metric-flip-close]");
        if (closeFlipBtn) {
          var closeCard = closeFlipBtn.closest(".metric-card");
          if (closeCard) {
            closeMetricCardEditor(closeCard);
          }
          return;
        }

        var saveFlipBtn = event.target && event.target.closest("[data-metric-flip-save]");
        if (saveFlipBtn) {
          var saveCard = saveFlipBtn.closest(".metric-card");
          if (saveCard) {
            saveMetricFromFlippedCard(saveCard);
          }
          return;
        }

        // Toggle a flipped card closed when clicking the back face (except form controls/buttons).
        var clickedBackFace = event.target && event.target.closest(".metric-card-back");
        var interactiveTarget = event.target && event.target.closest("input, select, textarea, button, a, label");
        if (clickedCard && clickedBackFace && clickedCard.classList.contains("is-flipped") && !interactiveTarget) {
          closeMetricCardEditor(clickedCard);
          return;
        }

        var actionBtn = event.target && event.target.closest("[data-metric-action]");
        if (actionBtn) {
          var action = String(actionBtn.getAttribute("data-metric-action") || "");
          var metricName = String(actionBtn.getAttribute("data-metric-name") || "");
          var metricUnit = String(actionBtn.getAttribute("data-metric-unit") || "");
          var metric = findLatestMetricByNameUnit(metricName, metricUnit);
          if (!metric) {
            setStatus("Metric not found. Refresh and try again.", "error");
            return;
          }

          if (action === "edit") {
            openMetricCardEditor(actionBtn.closest(".metric-card"), metric, "edit");
            return;
          }

          if (action === "test") {
            openMetricCardEditor(actionBtn.closest(".metric-card"), metric, "test");
            return;
          }

          if (action === "benchmark") {
            openMetricCardBenchmark(actionBtn.closest(".metric-card"), metric);
            return;
          }
        }

        var frontFace = event.target && event.target.closest(".metric-card-front");
        if (!frontFace) {
          return;
        }

        var frontCard = frontFace.closest(".metric-card");
        if (!frontCard || frontCard.classList.contains("is-flipped")) {
          return;
        }

        var frontMetricName = String(frontCard.getAttribute("data-metric-name") || "");
        var frontMetricUnit = String(frontCard.getAttribute("data-metric-unit") || "");
        var frontMetric = findLatestMetricByNameUnit(frontMetricName, frontMetricUnit);
        if (!frontMetric) {
          setStatus("Metric details unavailable right now.", "error");
          return;
        }

        openMetricCardBenchmark(frontCard, frontMetric);
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

    var metricsCardsEl = document.querySelector("[data-metrics-editor-cards]");
    if (metricsCardsEl) {
      metricsCardsEl.innerHTML = '<p class="admin-loading">Loading metric cards...</p>';
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
        state.metricsLatest = getLatestMetrics(state.currentMetrics);
        renderMetricsCards();
        renderMetricsEditor();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to load metrics.", "error");
      });
  }

  function renderMetricsCards() {
    var cardsEl = document.querySelector("[data-metrics-editor-cards]");
    if (!cardsEl) {
      return;
    }

    if (!state.metricsLatest || !state.metricsLatest.length) {
      cardsEl.innerHTML =
        '<div class="profile-empty-state metrics-empty">' +
        '<p class="profile-empty-state-title">No metrics recorded yet</p>' +
        '<p class="profile-empty-state-copy">Add your first baseline metric below to start tracking progress.</p>' +
        "</div>";
      return;
    }

    var cards = state.metricsLatest
      .map(function (metric) {
        var metricKey = getMetricKey(metric);
        var name = escapeHtml(metric.metric_name || "Metric");
        var frontValueHtml = buildMetricFrontValueHtml(metric);
        var trend = getMetricTrend(metric);
        var trendClass = trend && trend.delta > 0 ? "is-up" : trend && trend.delta < 0 ? "is-down" : "is-neutral";
        var trendText = trend
          ? (trend.delta > 0 ? "Improving" : trend.delta < 0 ? "Declining" : "Maintaining") +
            " (" +
            (trend.delta > 0 ? "+" : "") +
            trend.deltaLabel +
            " vs last)"
          : "Maintaining (baseline)";

        return (
          '<article class="metric-card" data-metric-key="' + escapeAttribute(metricKey) + '" data-metric-id="' + escapeAttribute(metric.id || "") + '" data-metric-name="' + escapeAttribute(metric.metric_name || "") + '" data-metric-unit="' + escapeAttribute(metric.metric_unit || "") + '">' +
          '<div class="metric-card-inner">' +
          '<div class="metric-card-face metric-card-front">' +
          '<div class="metric-card-body">' +
          '<h3 class="metric-name">' + name + "</h3>" +
          '<p class="metric-value">' + frontValueHtml + "</p>" +
          '<p class="metric-trend ' + trendClass + '">' + trendText + "</p>" +
          "</div>" +
          '<div class="metric-card-footer">' +
          '<div class="metric-card-actions">' +
          '<button type="button" class="metric-card-btn metric-card-btn-compact" data-metric-action="edit" data-metric-name="' +
          escapeAttribute(metric.metric_name || "") +
          '" data-metric-unit="' +
          escapeAttribute(metric.metric_unit || "") +
          '">Edit</button>' +
          "</div>" +
          "</div>" +
          "</div>" +
          '<div class="metric-card-face metric-card-back">' +
          '<div class="metric-flip-label" data-metric-flip-label>Edit Metric</div>' +
          '<div class="metric-benchmark" data-metric-benchmark>' +
          '<p class="metric-benchmark-note">Description and Normative Values Coming Soon.</p>' +
          '</div>' +
          '<div class="metric-flip-grid">' +
          '<input type="text" data-metric-edit="name" placeholder="Metric name" value="' + escapeAttribute(metric.metric_name || "") + '" />' +
          '<input type="text" data-metric-edit="value" placeholder="Test value" value="' + escapeAttribute(metric.metric_value || "") + '" />' +
          '<input type="text" data-metric-edit="unit" placeholder="Unit" value="' + escapeAttribute(metric.metric_unit || "") + '" />' +
          '<input type="text" data-metric-edit="category" placeholder="Category" value="' + escapeAttribute(metric.metric_category || "Performance") + '" />' +
          "</div>" +
          '<div class="metric-card-actions metric-card-actions-back metric-card-actions-benchmark">' +
          '<button type="button" class="metric-card-btn" data-metric-flip-close>Close</button>' +
          '</div>' +
          '<div class="metric-card-actions metric-card-actions-back">' +
          '<button type="button" class="metric-card-btn metric-card-btn-danger metric-card-btn-mini" data-metric-flip-delete>Delete</button>' +
          '<button type="button" class="metric-card-btn" data-metric-flip-cancel>Cancel</button>' +
          '<button type="button" class="metric-card-btn metric-card-btn-primary" data-metric-flip-save>Save</button>' +
          "</div>" +
          "</div>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    cardsEl.innerHTML = '<div class="metrics-grid">' + cards + "</div>";
  }

  function openMetricCardEditor(card, metric, mode) {
    if (!card || !metric) {
      return;
    }

    var modeValue = mode === "test" ? "test" : "edit";
    card.classList.add("is-flipped");
    card.setAttribute("data-metric-mode", modeValue);

    var label = card.querySelector("[data-metric-flip-label]");
    var nameInput = card.querySelector('[data-metric-edit="name"]');
    var valueInput = card.querySelector('[data-metric-edit="value"]');
    var unitInput = card.querySelector('[data-metric-edit="unit"]');
    var categoryInput = card.querySelector('[data-metric-edit="category"]');

    if (label) {
      label.textContent = modeValue === "test" ? "Log New Test" : "Edit Metric";
    }

    if (nameInput) {
      nameInput.value = metric.metric_name || "";
    }
    if (valueInput) {
      valueInput.value = modeValue === "test" ? "" : (metric.metric_value || "");
      valueInput.focus();
      valueInput.select();
    }
    if (unitInput) {
      unitInput.value = metric.metric_unit || "";
    }
    if (categoryInput) {
      categoryInput.value = metric.metric_category || "Performance";
    }

    card.setAttribute("data-metric-original-key", getMetricKey(metric));
    card.setAttribute("data-metric-original-id", String(metric.id || ""));
  }

  function openMetricCardBenchmark(card, metric) {
    if (!card || !metric) {
      return;
    }

    card.classList.add("is-flipped");
    card.setAttribute("data-metric-mode", "benchmark");

    var label = card.querySelector("[data-metric-flip-label]");
    if (label) {
      label.textContent = "Metric Details";
    }
  }

  function closeMetricCardEditor(card) {
    if (!card) {
      return;
    }

    card.classList.remove("is-flipped");
    card.removeAttribute("data-metric-mode");
  }

  function closeAllMetricCardEditors() {
    document.querySelectorAll(".metric-card.is-flipped").forEach(function (card) {
      closeMetricCardEditor(card);
    });
  }

  function saveMetricFromFlippedCard(card) {
    if (!card) {
      return;
    }

    var mode = String(card.getAttribute("data-metric-mode") || "edit");
    var originalId = String(card.getAttribute("data-metric-original-id") || "");
    var originalKey = String(card.getAttribute("data-metric-original-key") || "");
    var nameInput = card.querySelector('[data-metric-edit="name"]');
    var valueInput = card.querySelector('[data-metric-edit="value"]');
    var unitInput = card.querySelector('[data-metric-edit="unit"]');
    var categoryInput = card.querySelector('[data-metric-edit="category"]');

    var nextName = String((nameInput && nameInput.value) || "").trim();
    var nextValue = String((valueInput && valueInput.value) || "").trim() || "-";
    var nextUnit = String((unitInput && unitInput.value) || "").trim();
    var nextCategory = String((categoryInput && categoryInput.value) || "Performance").trim() || "Performance";

    if (!nextName) {
      setStatus("Metric name is required.", "error");
      return;
    }

    if (mode === "test") {
      state.currentMetrics.push({
        metric_name: nextName,
        metric_value: nextValue,
        metric_unit: nextUnit,
        metric_category: nextCategory,
        updated_at: new Date().toISOString()
      });
      state.hasChanges = true;
      state.metricsLatest = getLatestMetrics(state.currentMetrics);
      renderMetricsCards();
      renderMetricsEditor();
      setStatus("New test entry saved.", "success");
      onSaveMetrics();
      return;
    }

    var targetIndex = findEditableMetricIndex(originalId, originalKey);
    if (targetIndex < 0) {
      setStatus("Could not find metric to update.", "error");
      return;
    }

    state.currentMetrics[targetIndex] = Object.assign({}, state.currentMetrics[targetIndex], {
      metric_name: nextName,
      metric_value: nextValue,
      metric_unit: nextUnit,
      metric_category: nextCategory,
      updated_at: new Date().toISOString()
    });

    state.hasChanges = true;
    state.metricsLatest = getLatestMetrics(state.currentMetrics);
    renderMetricsCards();
    renderMetricsEditor();
    setStatus("Metric updated.", "success");
    onSaveMetrics();
  }

  function deleteMetricFromFlippedCard(card) {
    if (!card) {
      return;
    }

    var originalId = String(card.getAttribute("data-metric-original-id") || card.getAttribute("data-metric-id") || "");
    var originalKey = String(card.getAttribute("data-metric-original-key") || card.getAttribute("data-metric-key") || "");
    var targetIndex = findEditableMetricIndex(originalId, originalKey);
    if (targetIndex < 0) {
      setStatus("Could not find metric to delete.", "error");
      return;
    }

    state.currentMetrics.splice(targetIndex, 1);
    state.hasChanges = true;
    state.metricsLatest = getLatestMetrics(state.currentMetrics);
    renderMetricsCards();
    renderMetricsEditor();
    setStatus("Metric removed. Click Save Changes to persist.", "info");
  }

  function findEditableMetricIndex(metricId, metricKey) {
    var index = -1;

    if (metricId) {
      index = state.currentMetrics.findIndex(function (metric) {
        return String(metric && metric.id || "") === metricId;
      });
      if (index >= 0) {
        return index;
      }
    }

    if (!metricKey) {
      return -1;
    }

    var latestTime = -1;
    state.currentMetrics.forEach(function (metric, idx) {
      if (getMetricKey(metric) !== metricKey) {
        return;
      }
      var updatedAt = new Date(metric.updated_at || 0).getTime();
      var timestamp = Number.isFinite(updatedAt) ? updatedAt : 0;
      if (timestamp >= latestTime) {
        latestTime = timestamp;
        index = idx;
      }
    });

    return index;
  }

  function focusMetricRow(metricName, metricUnit, preferNewest) {
    var metricIndex = findMetricRowIndex(metricName, metricUnit, preferNewest);
    if (metricIndex < 0) {
      return;
    }

    var valueInput = document.querySelector(
      '.metrics-editor-metric-value[data-metric-index="' + String(metricIndex) + '"]'
    );
    if (!valueInput) {
      return;
    }

    var row = valueInput.closest(".metrics-editor-row");
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      row.classList.add("is-focused");
      setTimeout(function () {
        row.classList.remove("is-focused");
      }, 1200);
    }

    valueInput.focus();
    valueInput.select();
  }

  function findMetricRowIndex(metricName, metricUnit, preferNewest) {
    var targetName = normalizeMetricValue(metricName);
    var targetUnit = normalizeMetricValue(metricUnit);
    var foundIndex = -1;

    state.currentMetrics.forEach(function (metric, index) {
      if (normalizeMetricValue(metric.metric_name) !== targetName) {
        return;
      }

      var sameUnit = normalizeMetricValue(metric.metric_unit) === targetUnit;
      if (!sameUnit && targetUnit) {
        return;
      }

      if (preferNewest) {
        foundIndex = index;
      } else if (foundIndex === -1) {
        foundIndex = index;
      }
    });

    return foundIndex;
  }

  function findLatestMetricByNameUnit(name, unit) {
    var targetName = normalizeMetricValue(name);
    var targetUnit = normalizeMetricValue(unit);

    return (state.metricsLatest || []).find(function (metric) {
      return (
        normalizeMetricValue(metric.metric_name) === targetName &&
        normalizeMetricValue(metric.metric_unit) === targetUnit
      );
    }) || null;
  }

  function getMetricBenchmarkReference(metric) {
    var metricName = String(metric && metric.metric_name || "Metric");
    var references = [
      {
        match: /single\s*leg\s*squat/i,
        description: "Assesses unilateral lower-body control, knee tracking, and movement quality under repeated reps.",
        normative: "General adult quality range is about 12-20 controlled reps per side; asymmetry over 3 reps may indicate imbalance."
      },
      {
        match: /heel\s*raise/i,
        description: "Measures calf endurance and ankle-foot strength with controlled full-range heel raises.",
        normative: "Typical recreational range is 20-30 reps per side; below ~15 may indicate reduced calf endurance."
      },
      {
        match: /side\s*plank/i,
        description: "Evaluates lateral core endurance and frontal-plane trunk/hip control.",
        normative: "Many active adults hold 45-90 seconds; large side-to-side differences can flag stability deficits."
      },
      {
        match: /vertical\s*jump/i,
        description: "Captures lower-body explosive power from a rapid stretch-shortening action.",
        normative: "Broad adult ranges are roughly 30-45 cm (women) and 40-60 cm (men), varying by sport and training age."
      },
      {
        match: /y\s*balance|anterior\s*reach/i,
        description: "Screens dynamic balance and single-leg control during reach tasks.",
        normative: "Aim for strong left-right symmetry; anterior reach asymmetry around 4 cm or more can indicate elevated risk."
      },
      {
        match: /vo2/i,
        description: "Estimates aerobic capacity and endurance performance potential.",
        normative: "General guide (ml/kg/min): recreational 35-45, trained 45-55, elite 55+."
      }
    ];

    var matched = references.find(function (entry) {
      return entry.match.test(metricName);
    });

    if (matched) {
      return {
        description: matched.description,
        normative: matched.normative
      };
    }

    var hint = BENCHMARK_HINTS.find(function (entry) {
      return entry.match.test(metricName);
    });

    return {
      description: "Use consistent test setup and movement standards so trend data stays reliable across sessions.",
      normative: hint
        ? hint.text
        : "Normative values are test-, sport-, and athlete-specific; compare against your own trend and coach targets."
    };
  }

  function renderMetricsEditor() {
    var metricsListEl = document.querySelector("[data-metrics-editor-list]");
    if (!metricsListEl) return;

    metricsListEl.innerHTML = "";

    if (!state.currentMetrics || !state.currentMetrics.length) {
      metricsListEl.innerHTML = '<p class="admin-loading">No metrics yet. Add one to get started.</p>';
      return;
    }

    var groupedMetrics = {};
    state.currentMetrics.forEach(function (metric, index) {
      var category = String(metric && metric.metric_category || "Performance").trim() || "Performance";
      if (!groupedMetrics[category]) {
        groupedMetrics[category] = [];
      }

      groupedMetrics[category].push({ metric: metric, index: index });
    });

    var categoryOrder = METRIC_CATEGORIES.filter(function (category) {
      return Array.isArray(groupedMetrics[category]) && groupedMetrics[category].length;
    });

    Object.keys(groupedMetrics)
      .filter(function (category) {
        return categoryOrder.indexOf(category) === -1;
      })
      .sort(function (a, b) {
        return a.localeCompare(b);
      })
      .forEach(function (category) {
        categoryOrder.push(category);
      });

    categoryOrder.forEach(function (category) {
      var section = document.createElement("section");
      section.className = "metrics-editor-category-group";
      section.innerHTML =
        '<div class="metrics-editor-category-header">' +
          '<h3 class="metrics-editor-category-title">' + escapeHtml(category) + '</h3>' +
          '<span class="metrics-editor-category-count">' + String(groupedMetrics[category].length) + '</span>' +
        '</div>';

      var categoryList = document.createElement("div");
      categoryList.className = "metrics-editor-category-list";

      groupedMetrics[category].forEach(function (entry) {
        var metric = entry.metric;
        var index = entry.index;
        var row = document.createElement("div");
        row.className = "metrics-editor-row";
        row.innerHTML = `
          <div class="metrics-editor-card-top">
            <div class="metrics-editor-row-name">${escapeHtml(metric.metric_name || "Untitled Metric")}</div>
            <button type="button" class="btn metrics-editor-delete-btn" data-metric-delete data-metric-id="${escapeAttribute(metric.id || "")}" data-metric-index="${index}">Delete</button>
          </div>
          <div class="metrics-editor-row-details metrics-editor-card-fields">
            <label class="metrics-editor-field">
              <span class="metrics-editor-field-label">Value</span>
              <input type="text" class="metrics-editor-metric-value" data-metric-index="${index}" placeholder="Value" value="${escapeAttribute(metric.metric_value || "")}" />
            </label>
            <label class="metrics-editor-field">
              <span class="metrics-editor-field-label">Unit</span>
              <input type="text" class="metrics-editor-metric-unit" data-metric-index="${index}" placeholder="Unit" value="${escapeAttribute(metric.metric_unit || "")}" />
            </label>
            <label class="metrics-editor-field">
              <span class="metrics-editor-field-label">Category</span>
              <select class="metrics-editor-metric-category" data-metric-index="${index}">${buildCategoryOptions(metric.metric_category)}</select>
            </label>
          </div>
        `;

        categoryList.appendChild(row);
      });

      section.appendChild(categoryList);
      metricsListEl.appendChild(section);
    });

    // Attach change listeners to input fields
    var valueInputs = metricsListEl.querySelectorAll("[data-metric-index]");
    valueInputs.forEach(function (input) {
      input.addEventListener("change", function () {
        var index = parseInt(this.getAttribute("data-metric-index"), 10);
        if (Number.isNaN(index) || !state.currentMetrics[index]) {
          return;
        }
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

    var cluster = ASSESSMENT_CLUSTERS[val];
    if (!cluster) {
      setStatus("Unknown assessment cluster.", "error");
      return;
    }

    cluster.forEach(function (metricName) {
      var metric = PRESET_DEFAULTS[metricName] || { unit: "", category: "Performance" };
      state.currentMetrics.push({
        metric_name: metricName,
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

    var def = PRESET_DEFAULTS[val] || {unit: "", category: "Performance"};

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
      metric_name: "New Metric",
      metric_value: "",
      metric_unit: "",
      metric_category: "Performance",
      updated_at: new Date().toISOString()
    });

    state.hasChanges = true;
    state.metricsLatest = getLatestMetrics(state.currentMetrics);
    renderMetricsCards();
    renderMetricsEditor();
    setStatus("Metric card added. Click Edit on the card, then Save Changes.", "info");
  }

  function onDeleteMetric(btn) {
    var metricId = btn.getAttribute("data-metric-id");
    var metricIndex = parseInt(btn.getAttribute("data-metric-index"), 10);

    if (metricId) {
      var idxById = state.currentMetrics.findIndex(function (m) {
        return String(m && m.id || "") === String(metricId);
      });
      if (idxById !== -1) {
        state.currentMetrics.splice(idxById, 1);
        state.hasChanges = true;
        renderMetricsEditor();
        setStatus("Metric removed. Save to apply.", "info");
      }
      return;
    }

    if (!Number.isNaN(metricIndex) && state.currentMetrics[metricIndex]) {
      state.currentMetrics.splice(metricIndex, 1);
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
          state.metricsLatest = [];
          renderMetricsCards();
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
            loadAthleteMetrics();
          })
          .catch(function (error) {
            setStatus(error && error.message ? error.message : "Failed to save metrics.", "error");
          });
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to delete old metrics.", "error");
      });
  }

  function onPrintSummaryPdf() {
    var jspdfApi = window.jspdf;
    var JsPdf = jspdfApi && jspdfApi.jsPDF;
    if (!JsPdf) {
      setStatus("PDF library unavailable. Refresh and try again.", "error");
      return;
    }

    var metrics = (state.currentMetrics || []).filter(function (metric) {
      return metric && String(metric.metric_name || "").trim();
    });

    if (!metrics.length) {
      setStatus("No metrics available to print.", "info");
      return;
    }

    var doc = new JsPdf({ unit: "pt", format: "letter" });
    var now = new Date();
    var athleteLabel = state.isPersonal ? "Athlete" : (state.athleteName || "Athlete");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Nomadic Performance - Metric Summary", 40, 48);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Athlete: " + athleteLabel, 40, 70);
    doc.text("Generated: " + now.toLocaleString(), 40, 86);

    var y = 112;
    doc.setFont("helvetica", "bold");
    doc.text("Metric", 40, y);
    doc.text("Value", 280, y);
    doc.text("Unit", 380, y);
    doc.text("Category", 450, y);

    y += 8;
    doc.setLineWidth(0.6);
    doc.line(40, y, 560, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    metrics.forEach(function (metric, index) {
      if (y > 740) {
        doc.addPage();
        y = 52;
      }

      var name = String(metric.metric_name || "");
      var value = String(metric.metric_value || "-");
      var unit = String(metric.metric_unit || "-");
      var category = String(metric.metric_category || "Performance");

      doc.text(name.slice(0, 36), 40, y);
      doc.text(value.slice(0, 14), 280, y);
      doc.text(unit.slice(0, 14), 380, y);
      doc.text(category.slice(0, 18), 450, y);

      y += 16;
      if (index < metrics.length - 1) {
        doc.setDrawColor(225, 225, 225);
        doc.line(40, y - 8, 560, y - 8);
      }
    });

    var safeName = athleteLabel.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "athlete";
    var dateStamp = now.toISOString().slice(0, 10);
    doc.save("metric-summary-" + safeName + "-" + dateStamp + ".pdf");
    setStatus("Metric summary PDF generated.", "success");
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

  function populatePresetSelectors() {
    var assessmentSelect = document.querySelector("[data-metrics-editor-assessment]");
    if (assessmentSelect) {
      assessmentSelect.innerHTML = [
        '<option value="">+ Add Assessment...</option>',
        '<option value="climbing">Climbing Performance Assessment</option>',
        '<option value="running">Running Performance Assessment</option>',
        '<option value="readiness">Readiness & Recovery Tracking Set</option>',
        '<option value="mountain">Mountain Sport Tracking Set</option>'
      ].join("");
    }

    var presetSelect = document.querySelector("[data-metrics-editor-preset]");
    if (presetSelect) {
      var options = ['<option value="">+ Add Preset Metric...</option>'];
      PRESET_METRICS.forEach(function (metric) {
        options.push(
          '<option value="' + escapeAttribute(metric.name) + '">' + escapeHtml(metric.name) + '</option>'
        );
      });
      presetSelect.innerHTML = options.join("");
    }
  }

  function buildCategoryOptions(currentCategory) {
    var selected = String(currentCategory || "Performance").trim();
    var categories = METRIC_CATEGORIES.slice();
    if (selected && categories.indexOf(selected) === -1) {
      categories.unshift(selected);
    }

    return categories
      .map(function (category) {
        return (
          '<option value="' +
          escapeAttribute(category) +
          '" ' +
          (category === selected ? "selected" : "") +
          ">" +
          escapeHtml(category) +
          "</option>"
        );
      })
      .join("");
  }

  function buildPresetDefaults() {
    var defaults = {};
    PRESET_METRICS.forEach(function (metric) {
      defaults[metric.name] = {
        unit: metric.unit,
        category: metric.category
      };
    });
    return defaults;
  }

  function getMetricKey(metric) {
    return [metric && metric.metric_name, metric && metric.metric_category, metric && metric.metric_unit]
      .map(function (value) {
        return String(value || "").trim().toLowerCase();
      })
      .join("||");
  }

  function getLatestMetrics(metrics) {
    if (!Array.isArray(metrics) || !metrics.length) {
      return [];
    }

    var grouped = {};
    metrics.forEach(function (metric) {
      var key = getMetricKey(metric);
      if (!key) {
        return;
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(metric);
    });

    var latest = Object.keys(grouped)
      .map(function (key) {
        var history = grouped[key].slice().sort(function (a, b) {
          return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
        });

        var current = Object.assign({}, history[0]);
        current._history = history;
        return current;
      })
      .sort(function (a, b) {
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      });

    return latest;
  }

  function buildMetricFrontValueHtml(metric) {
    var name = String(metric.metric_name || "").toLowerCase();
    var raw = String(metric.metric_value || "").trim();
    var unit = String(metric.metric_unit || "").trim();

    if (name.indexOf("y balance") !== -1 && raw) {
      var parts = raw.split("/").map(function (part) {
        return String(part || "").trim();
      });
      if (parts.length >= 2) {
        var left = parts[0] || "-";
        var right = parts[1] || "-";
        var asym = parts.length >= 3 && parts[2] ? parts[2] : "-";
        return (
          '<span class="metric-value-split">' +
          '<span>L ' + escapeHtml(left) + "</span>" +
          '<span>R ' + escapeHtml(right) + "</span>" +
          '<span>Sym ' + escapeHtml(asym) + "</span>" +
          "</span>"
        );
      }
    }

    var value = raw || "-";
    return escapeHtml(value + (unit ? " " + unit : ""));
  }

  function getMetricTrend(metric) {
    var history = Array.isArray(metric && metric._history) ? metric._history : [];
    if (history.length < 2) {
      return null;
    }

    var current = parseNumericMetricValue(history[0].metric_value);
    var previous = parseNumericMetricValue(history[1].metric_value);
    if (current === null || previous === null) {
      return null;
    }

    var delta = current - previous;
    var absDelta = Math.abs(delta);
    var decimals = absDelta % 1 === 0 ? 0 : absDelta < 10 ? 2 : 1;
    return {
      delta: delta,
      deltaLabel: absDelta.toFixed(decimals)
    };
  }

  function parseNumericMetricValue(value) {
    if (value === null || value === undefined) {
      return null;
    }

    var cleaned = String(value)
      .replace(/,/g, ".")
      .replace(/[^0-9.\-]/g, "")
      .trim();

    if (!cleaned) {
      return null;
    }

    var parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    var parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'})[c];
    });
  }

  function escapeAttribute(str) {
    return String(str || "").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function normalizeMetricValue(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }
})();
