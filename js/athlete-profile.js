(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var METRICS_COLLAPSE_KEY = "nomadic.metricsSectionCollapsed";
  var STRAVA_REDIRECT_STATUS_PARAM = "strava_status";
  var STRAVA_REDIRECT_MESSAGE_PARAM = "strava_message";
  var state = {
    client: null,
    user: null,
    viewUser: null,
    isCoachView: false,
    viewedAthleteId: null,
    profile: null,
    metrics: [],
    metricsLatest: [],
    stravaConnection: null,
    stravaDailyMetrics: [],
    guardElement: null,
    contentElement: null,
    form: null,
    statusElement: null,
    metricsForm: null,
    metricsRows: null,
    metricsList: null,
    metricsStatus: null,
    metricsEditor: null,
    metricsEditorToggle: null,
    metricsContent: null,
    metricsCollapseToggle: null,
    metricsSummaryBtn: null,
    stravaConnectBtn: null,
    stravaSyncBtn: null,
    stravaDisconnectBtn: null,
    stravaConnectionMeta: null,
    stravaMetricsGrid: null,
    stravaStatusElement: null,
    passwordStatus: null,
    editToggleButton: null,
    editorSection: null,
    sportOverviewEditor: null,
    sportOverviewSummary: null,
    metricTemplatesBySport: {
      climbing: ["20mm Edge Pull", "Max Pull Ups", "Weighted Pull Up", "Core Hold Time"],
      "trail-running": ["Resting HR", "Max HR", "Vertical Jump", "Anterior Reach", "5k Time"],
      skiing: ["Resting HR", "Max HR", "Countermovement Jump", "Single-Leg Balance"],
      snowboarding: ["Resting HR", "Max HR", "Countermovement Jump", "Lateral Bound"],
      mountainbiking: ["Resting HR", "Max HR", "FTP", "Grip Endurance"],
      mixed: ["Resting HR", "Max HR", "Vertical Jump", "Anaerobic Capacity"]
    },
    sportOverviewTemplates: {
      climbing: [
        { key: "climbing_type", label: "Climbing Type", placeholder: "Bouldering, Sport, Trad, Ice", type: "text" },
        { key: "climbing_grade", label: "Current Climbing Level", placeholder: "5.11a, V4", type: "text" },
        { key: "climbing_focus", label: "Current Focus", placeholder: "Power endurance, technique, projecting", type: "text" },
        { key: "arm_span", label: "Arm Span (cm)", placeholder: "For ape index calculation", type: "text" }
      ],
      skiing: [
        { key: "ski_discipline", label: "Ski Discipline", placeholder: "Alpine, Touring, Freeride, Nordic", type: "text" },
        { key: "ski_terrain", label: "Preferred Terrain", placeholder: "Groomers, steeps, park, backcountry", type: "text" }
      ],
      snowboarding: [
        { key: "snowboard_discipline", label: "Snowboard Discipline", placeholder: "Freeride, park, splitboarding", type: "text" },
        { key: "snowboard_stance", label: "Stance", placeholder: "Regular or Goofy", type: "text" }
      ],
      mountainbiking: [
        { key: "mtb_discipline", label: "MTB Discipline", placeholder: "XC, Enduro, DH, Trail", type: "text" },
        { key: "mtb_weekly_volume", label: "Weekly Ride Volume", placeholder: "e.g. 6 hrs", type: "text" }
      ],
      "trail-running": [
        { key: "run_primary_distance", label: "Primary Distance", placeholder: "10k, half marathon, ultra", type: "text" },
        { key: "run_elevation_goal", label: "Elevation Focus", placeholder: "e.g. 3000 ft/week", type: "text" }
      ],
      mixed: [
        { key: "mixed_split", label: "Training Split", placeholder: "e.g. Climb 2x, Run 2x, Strength 2x", type: "text" }
      ]
    },
    trainingTemplates: [],
    selectedTrainingTemplateId: ""
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
    state.metricsEditor = document.querySelector("[data-metrics-editor]");
    state.metricsEditorToggle = null;
    state.metricsContent = document.querySelector("[data-metrics-content]");
    state.metricsCollapseToggle = document.querySelector("[data-metrics-collapse-toggle]");
    state.metricsSummaryBtn = document.querySelector("[data-metrics-summary-pdf]");
    state.stravaConnectBtn = document.querySelector("[data-strava-connect]");
    state.stravaSyncBtn = document.querySelector("[data-strava-sync]");
    state.stravaDisconnectBtn = document.querySelector("[data-strava-disconnect]");
    state.stravaConnectionMeta = document.querySelector("[data-strava-connection-meta]");
    state.stravaMetricsGrid = document.querySelector("[data-strava-metrics-grid]");
    state.stravaStatusElement = document.querySelector("[data-strava-status]");
    state.passwordStatus = document.querySelector("[data-password-status]");
    state.editToggleButton = document.querySelector("[data-profile-edit-toggle]");
    state.editorSection = document.querySelector("[data-profile-editor]");
    state.sportOverviewEditor = document.querySelector("[data-sport-overview-editor]");
    state.sportOverviewSummary = document.querySelector("[data-sport-overview-summary]");

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

      configureCoachView()
        .then(function (ok) {
          if (ok === false) {
            return;
          }

          loadDashboard();
          setupFormHandlers();
        })
        .catch(function (error) {
          showError(error && error.message ? error.message : "Could not load athlete view.");
        });
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      if (!session) {
        redirectToHome();
      }
    });
  }

  function configureCoachView() {
    if (!state.user) {
      return Promise.resolve(false);
    }

    state.viewUser = state.user;

    var params;
    try {
      params = new URLSearchParams(window.location.search || "");
    } catch (e) {
      return Promise.resolve(true);
    }

    var wantsCoachView = params.get("coachView") === "1";
    var athleteId = String(params.get("athleteId") || "").trim();
    var isAdminUser =
      !!state.user.email && String(state.user.email).toLowerCase() === ADMIN_EMAIL;

    if (!wantsCoachView || !athleteId) {
      return Promise.resolve(true);
    }

    if (!isAdminUser) {
      return Promise.reject(new Error("Coach view is only available to admin accounts."));
    }

    state.isCoachView = true;
    state.viewedAthleteId = athleteId;

    return state.client
      .from("admin_all_users")
      .select("user_id,email,user_created_at,last_sign_in_at")
      .eq("user_id", athleteId)
      .single()
      .then(function (result) {
        if (result.error || !result.data) {
          throw new Error("Athlete was not found for this coach view link.");
        }

        state.viewUser = {
          id: result.data.user_id,
          email: result.data.email,
          created_at: result.data.user_created_at,
          last_sign_in_at: result.data.last_sign_in_at
        };

        return true;
      });
  }

  function loadDashboard() {
    if (!state.viewUser) {
      return;
    }

    hideGuard();
    showContent();
    applyCoachViewUi();
    populateUserInfo();
    loadProfileData();
    loadMetricsData();
    loadStravaOverview();
    maybeShowStravaRedirectStatus();
    loadCurrentTrainingProgram();
  }

  function applyCoachViewUi() {
    if (!state.isCoachView) {
      return;
    }

    var heading = document.querySelector(".section-heading");
    var subtitle = document.querySelector(".profile-dashboard-subtitle");
    var headingRow = document.querySelector(".profile-dashboard-heading-row");
    var resetBtn = document.querySelector("[data-profile-reset-password]");
    var deleteSection = document.querySelector(".profile-section-danger");
    var emailField = state.form ? state.form.querySelector("[name='email']") : null;

    if (heading) {
      heading.textContent = "Athlete Profile";
    }

    if (subtitle) {
      subtitle.textContent = "Coach view: review and edit this athlete's profile and metrics.";
    }

    var stravaCopy = document.querySelector("#profile-strava-section .profile-section-copy");
    if (stravaCopy) {
      stravaCopy.textContent = "Coach view: monitor this athlete's latest Strava sync and summary metrics.";
    }

    if (headingRow && !headingRow.querySelector("[data-coach-back-link]")) {
      var backLink = document.createElement("a");
      backLink.className = "btn profile-btn-cancel";
      backLink.href = "admin.html";
      backLink.textContent = "Back to Coaching Dashboard";
      backLink.setAttribute("data-coach-back-link", "1");
      headingRow.appendChild(backLink);
    }

    if (resetBtn) {
      resetBtn.style.display = "none";
    }

    if (deleteSection) {
      deleteSection.style.display = "none";
    }

    if (emailField) {
      emailField.disabled = true;
      emailField.title = "Email changes are disabled in coach view.";
    }
  }

  function populateUserInfo() {
    if (!state.viewUser) {
      return;
    }

    var emailEl = document.querySelector("[data-profile-email]");
    var createdEl = document.querySelector("[data-profile-created]");
    var lastSigninEl = document.querySelector("[data-profile-last-signin]");

    if (emailEl) {
      emailEl.textContent = state.viewUser.email || "—";
    }

    if (createdEl && state.viewUser.created_at) {
      createdEl.textContent = formatDate(state.viewUser.created_at);
    }

    if (lastSigninEl && state.viewUser.last_sign_in_at) {
      lastSigninEl.textContent = formatDate(state.viewUser.last_sign_in_at);
    }
  }

  function loadProfileData() {
    var viewedUserId = getViewedUserId();
    if (!viewedUserId) {
      return;
    }

    setStatus("Loading athlete info...", "info");

    state.client
      .from("athlete_profiles")
      .select("*")
      .eq("user_id", viewedUserId)
      .single()
      .then(function (result) {
        if (result.error && result.error.code !== "PGRST116") {
          setStatus(result.error.message, "error");
          return;
        }

        if (result.data) {
          state.profile = mergeLocalSportProfile(result.data);
          populateForm(state.profile);
        } else {
          state.profile = mergeLocalSportProfile(null);
          if (state.profile) {
            populateForm(state.profile);
          } else {
            updateHero(null);
          }
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
    var bioField = state.form.querySelector("[name='bio']");
    var ageField = state.form.querySelector("[name='age']");
    var locationField = state.form.querySelector("[name='location']");
    var heightField = state.form.querySelector("[name='height_cm']");
    var armSpanField = state.form.querySelector("[name='arm_span_cm']");
    var weightField = state.form.querySelector("[name='weight_kg']");
    var sexField = state.form.querySelector("[name='sex']");

    if (emailField) emailField.value = (state.viewUser && state.viewUser.email) || "";
    if (nameField) nameField.value = profile && profile.name ? profile.name : "";
    if (bioField) bioField.value = profile && profile.bio ? profile.bio : "";
    if (ageField) ageField.value = profile && profile.age ? profile.age : "";
    if (locationField) locationField.value = profile && profile.location ? profile.location : "";
    if (heightField) heightField.value = profile && profile.height_cm ? profile.height_cm : "";
    if (armSpanField) armSpanField.value = profile && profile.arm_span_cm ? profile.arm_span_cm : "";
    if (weightField) weightField.value = profile && profile.weight_kg ? profile.weight_kg : "";
    if (sexField) sexField.value = getProfileSexForFormValue(profile);

    var sports = getProfileSports(profile);
    setSelectedSportsInForm(sports);
    renderSportOverviewEditor(sports, getProfileSportOverview(profile));

    updateHero(profile);
  }

  function updateHero(profile) {
    var sportEl = document.querySelector("[data-hero-sport]");
    var locationEl = document.querySelector("[data-hero-location]");
    var dobAgeEl = document.querySelector("[data-profile-dob-age]");

    var sports = getProfileSports(profile);
    if (sportEl) sportEl.textContent = formatSportsDisplay(sports);
    if (locationEl) locationEl.textContent = normalizeDisplayValue(profile && profile.location);
    if (dobAgeEl) dobAgeEl.textContent = formatDobAgeDisplay(profile);

    renderSportOverviewSummary(profile);
  }

  function formatDobAgeDisplay(profile) {
    if (!profile) {
      return "—";
    }

    var dob = getProfileDobValue(profile);
    var age = calculateAgeFromDob(dob);
    if (age == null) {
      age = parseInt(profile.age || 0, 10) || null;
    }

    if (dob && age != null) {
      return "DOB: " + dob + " | Age: " + age;
    }

    if (dob) {
      return "DOB: " + dob;
    }

    if (age != null) {
      return "Age: " + age;
    }

    return "—";
  }

  function getProfileDobValue(profile) {
    var overview = getProfileSportOverview(profile);
    var general = overview && overview.general && typeof overview.general === "object"
      ? overview.general
      : {};
    var raw = profile && (
      profile.dob ||
      profile.date_of_birth ||
      profile.birth_date ||
      general.date_of_birth ||
      general.dob
    );
    if (!raw) {
      return "";
    }

    var value = String(raw).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    var parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      return "";
    }

    var yyyy = parsed.getFullYear();
    var mm = String(parsed.getMonth() + 1).padStart(2, "0");
    var dd = String(parsed.getDate()).padStart(2, "0");
    return yyyy + "-" + mm + "-" + dd;
  }

  function calculateAgeFromDob(dobText) {
    var dob = String(dobText || "").trim();
    if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      return null;
    }

    var birth = new Date(dob + "T00:00:00");
    if (isNaN(birth.getTime())) {
      return null;
    }

    var today = new Date();
    var age = today.getFullYear() - birth.getFullYear();
    var hasBirthdayPassed =
      today.getMonth() > birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());

    if (!hasBirthdayPassed) {
      age -= 1;
    }

    if (age < 0 || age > 120) {
      return null;
    }

    return age;
  }

  function loadMetricsData() {
    var viewedUserId = getViewedUserId();
    if (!viewedUserId || !state.client || !state.metricsList) {
      return;
    }

    state.metricsList.innerHTML = '<p class="profile-loading">Loading metrics...</p>';

    state.client
      .from("athlete_metrics")
      .select("*")
      .eq("user_id", viewedUserId)
      .order("updated_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          if (isMissingRelationError(result.error)) {
            state.metrics = [];
            state.metricsLatest = [];
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
        state.metricsLatest = getLatestMetrics(state.metrics);
        renderMetricsCards();
        renderMetricRowsFromData(state.metricsLatest);
      })
      .catch(function (error) {
        setMetricsStatus(error && error.message ? error.message : "Failed to load metrics.", "error");
      });
  }

  function renderMetricsCards() {
    if (!state.metricsList) {
      return;
    }

    if (!state.metricsLatest.length) {
      state.metricsList.innerHTML =
        '<div class="metrics-empty">' +
        '<p>No metrics recorded yet.</p>' +
        '<p class="metrics-empty-sub">Add your first baseline metric below, or let your coach assign sport-specific tests.</p>' +
        "</div>";
      return;
    }

    var cards = state.metricsLatest
      .map(function (metric) {
        var metricKey = getMetricKey(metric);
        var name = escapeHtml(metric.metric_name || "Metric");
        var frontValueHtml = buildMetricFrontValueHtml(metric);
        var category = escapeHtml(metric.metric_category || "Performance");
        var updated = metric.updated_at ? formatDate(metric.updated_at) : "—";
        var trend = getMetricTrend(metric);
        var trendClass = trend && trend.delta > 0 ? "is-up" : trend && trend.delta < 0 ? "is-down" : "is-neutral";
        var trendText = trend
          ? (trend.delta > 0 ? "Up " : trend.delta < 0 ? "Down " : "No change ") +
            trend.deltaLabel +
            " vs last test"
          : "Baseline recorded";
        var historyPoints = (metric._history || [])
          .slice(0, 4)
          .reverse()
          .map(function (entry) {
            var entryValue = escapeHtml(entry.metric_value || "—");
            var entryDate = escapeAttribute(formatDate(entry.updated_at || ""));
            return '<span class="metric-history-point" title="' + entryDate + '">' + entryValue + "</span>";
          })
          .join("");

        return (
          '<article class="metric-card" data-metric-key="' + escapeAttribute(metricKey) + '">' +
          '<div class="metric-card-inner">' +
          '<div class="metric-card-face metric-card-front">' +
          '<div class="metric-card-body">' +
          '<span class="metric-category">' + category + "</span>" +
          '<h3 class="metric-name">' + name + "</h3>" +
          '<p class="metric-value">' + frontValueHtml + "</p>" +
          '<p class="metric-trend ' + trendClass + '">' + trendText + "</p>" +
          (historyPoints ? '<div class="metric-history-row">' + historyPoints + "</div>" : "") +
          '</div>' +
          '<div class="metric-card-footer">' +
          '<p class="metric-updated">Updated ' + updated + "</p>" +
          '<div class="metric-card-actions">' +
          '<button type="button" class="metric-card-btn" data-metric-action="benchmark" data-metric-name="' +
          escapeAttribute(metric.metric_name || "") +
          '" data-metric-unit="' +
          escapeAttribute(metric.metric_unit || "") +
          '">Benchmarks</button>' +
          '<button type="button" class="metric-card-btn" data-metric-action="edit" data-metric-name="' +
          escapeAttribute(metric.metric_name || "") +
          '" data-metric-unit="' +
          escapeAttribute(metric.metric_unit || "") +
          '">Edit</button>' +
          '<button type="button" class="metric-card-btn" data-metric-action="test" data-metric-name="' +
          escapeAttribute(metric.metric_name || "") +
          '" data-metric-unit="' +
          escapeAttribute(metric.metric_unit || "") +
          '">+ Test</button>' +
          "</div>" +
          "</div>" +
          "</div>" +
          '<div class="metric-card-face metric-card-back">' +
          '<div class="metric-flip-label" data-metric-flip-label>Edit Metric</div>' +
          '<div class="metric-benchmark" data-metric-benchmark>' +
          '<p class="metric-benchmark-value" data-benchmark-value></p>' +
          '<p class="metric-benchmark-rating" data-benchmark-rating></p>' +
          '<p class="metric-benchmark-range" data-benchmark-range></p>' +
          '<p class="metric-benchmark-meaning" data-benchmark-meaning></p>' +
          '<p class="metric-benchmark-note">Benchmarks are general guideposts and should be interpreted with sport context, injury history, and coaching judgment.</p>' +
          '</div>' +
          '<div class="metric-flip-grid">' +
          '<input type="text" data-metric-edit="name" placeholder="Metric name" value="' + escapeAttribute(metric.metric_name || "") + '" />' +
          '<input type="text" data-metric-edit="value" placeholder="Test value" value="' + escapeAttribute(metric.metric_value || "") + '" />' +
          '<div class="metric-ybalance-grid" data-metric-ybalance-grid hidden>' +
          '<input type="text" data-metric-edit="left" placeholder="L Leg" />' +
          '<input type="text" data-metric-edit="right" placeholder="R Leg" />' +
          '<input type="text" data-metric-edit="symmetry" placeholder="Symmetry" readonly />' +
          '</div>' +
           '<div class="metric-grant-grid" data-metric-grant-grid hidden>' +
           '<input type="text" data-metric-edit="left" placeholder="L Leg" />' +
           '<input type="text" data-metric-edit="right" placeholder="R Leg" />' +
           '</div>' +
          '<input type="text" data-metric-edit="unit" placeholder="Unit" value="' + escapeAttribute(metric.metric_unit || "") + '" />' +
          '<input type="text" data-metric-edit="category" placeholder="Category" value="' + escapeAttribute(metric.metric_category || "Performance") + '" />' +
          '<p class="metric-input-note" data-leglength-estimate-note hidden>Norm note: For Y Balance and Adapted Grant Foot Raise, leg length is estimated as height x 0.53 when direct leg length is not provided.</p>' +
          "</div>" +
          '<div class="metric-card-actions metric-card-actions-back metric-card-actions-benchmark">' +
          '<button type="button" class="metric-card-btn" data-metric-flip-close>Close</button>' +
          '</div>' +
          '<div class="metric-card-actions metric-card-actions-back">' +
          '<button type="button" class="metric-card-btn metric-card-btn-danger" data-metric-flip-delete>Delete Metric</button>' +
          '<button type="button" class="metric-card-btn" data-metric-flip-cancel>Cancel</button>' +
          '<button type="button" class="metric-card-btn metric-card-btn-primary" data-metric-flip-save>Save</button>' +
          "</div>" +
          "</div>" +
          "</div>" +
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
    var sports = getSelectedSportsFromForm();
    if (!sports.length) {
      sports = getProfileSports(state.profile);
    }

    var sport = sports[0] || (state.profile && state.profile.sport);
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
      state.editToggleButton.addEventListener("click", onEditProfileClick);
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

    if (state.metricsCollapseToggle) {
      state.metricsCollapseToggle.addEventListener("click", function () {
        toggleMetricsSection();
      });
    }

    if (state.metricsSummaryBtn) {
      state.metricsSummaryBtn.addEventListener("click", onGenerateMetricSummaryPdf);
    }

    if (state.stravaConnectBtn) {
      state.stravaConnectBtn.addEventListener("click", onStravaConnect);
    }

    if (state.stravaSyncBtn) {
      state.stravaSyncBtn.addEventListener("click", onStravaSync);
    }

    if (state.stravaDisconnectBtn) {
      state.stravaDisconnectBtn.addEventListener("click", onStravaDisconnect);
    }

    var manageMetricsBtn = document.querySelector("[data-metric-manage]");
    if (manageMetricsBtn) {
      manageMetricsBtn.addEventListener("click", function () {
        var viewedUserId = getViewedUserId();
        if (!viewedUserId) {
          alert("No athlete selected.");
          return;
        }

        var athleteName =
          (state.profile && state.profile.name) ||
          (state.viewUser && state.viewUser.email) ||
          "Athlete";

        var url = "metrics-editor.html?athleteId=" + encodeURIComponent(viewedUserId) +
                  "&athleteName=" + encodeURIComponent(athleteName);

        if (!state.isCoachView) {
          url += "&personal=true";
        }

        window.location.href = url;
      });
    }

    var cancelMetricsBtn = document.querySelector("[data-metrics-cancel]");
    if (cancelMetricsBtn) {
      cancelMetricsBtn.addEventListener("click", function (event) {
        event.preventDefault();
        renderMetricRowsFromData(state.metricsLatest);
        setMetricsStatus("", "info");
        if (state.metricsEditor && !state.metricsEditor.hidden) {
          toggleMetricsEditor();
        }
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

    if (state.metricsList) {
      state.metricsList.addEventListener("click", function (event) {
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

        var actionBtn = event.target && event.target.closest("[data-metric-action]");
        if (!actionBtn) {
          return;
        }

        var action = actionBtn.getAttribute("data-metric-action");
        var metricName = String(actionBtn.getAttribute("data-metric-name") || "");
        var metricUnit = String(actionBtn.getAttribute("data-metric-unit") || "");
        var metric = findLatestMetricByNameUnit(metricName, metricUnit);
        if (!metric) {
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
        }
      });

      state.metricsList.addEventListener("input", function (event) {
        var target = event && event.target;
        if (!target) {
          return;
        }

        var field = String(target.getAttribute("data-metric-edit") || "");
        if (field !== "left" && field !== "right" && field !== "unit" && field !== "name") {
          return;
        }

        var card = target.closest(".metric-card");
        if (!card) {
          return;
        }

         updateYBalanceDraftValue(card);
         updateSingleLegSquatDraftValue(card);
         updateEdgePullDraftValue(card);
         updateGrantDraftValue(card);
        updateLegLengthEstimateNote(card);
      });
    }

    if (state.form) {
      state.form.addEventListener("change", function (event) {
        var target = event && event.target;
        if (!target || target.name !== "sports[]") {
          return;
        }

        var selectedSports = getSelectedSportsFromForm();
        var currentOverview = collectSportOverviewFromForm();
        renderSportOverviewEditor(selectedSports, currentOverview);

        if (!state.metrics.length && state.metricsRows && !state.metricsRows.children.length) {
          seedMetricRowsFromSport();
        }
      });
    }

    var deleteBtn = document.querySelector("[data-profile-delete]");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", onDeleteAccount);
    }

    applyMetricsSectionPreference();

    var resetPasswordBtn = document.querySelector("[data-profile-reset-password]");
    if (resetPasswordBtn) {
      resetPasswordBtn.addEventListener("click", onResetMyPassword);
    }

    var logoutBtn = document.querySelector("[data-profile-logout]");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", onLogout);
    }

    var trainingProgramContent = document.getElementById("profile-training-program-content");
    if (trainingProgramContent) {
      trainingProgramContent.addEventListener("click", function (event) {
        var removeBtn = event.target && event.target.closest("[data-remove-active-program]");
        var changeBtn = event.target && event.target.closest("[data-change-active-program]");
        var assignBtn = event.target && event.target.closest("[data-assign-active-program]");

        if (changeBtn) {
          onCustomizeProgramForAthlete();
          return;
        }

        if (assignBtn) {
          openCoachProgramModal();
          return;
        }

        if (!removeBtn) {
          return;
        }

        onRemoveActiveProgram();
      });
    }

    var coachProgramCloseButtons = document.querySelectorAll("[data-coach-program-close]");
    coachProgramCloseButtons.forEach(function (btn) {
      btn.addEventListener("click", closeCoachProgramModal);
    });

    var coachProgramSearch = document.querySelector("[data-coach-program-search]");
    if (coachProgramSearch) {
      coachProgramSearch.addEventListener("input", function () {
        renderCoachProgramTemplateList(String(coachProgramSearch.value || ""));
      });
    }

    var coachProgramAssignBtn = document.querySelector("[data-coach-program-assign]");
    if (coachProgramAssignBtn) {
      coachProgramAssignBtn.addEventListener("click", onAssignTemplateToCurrentAthlete);
    }

    document.addEventListener("keydown", function (event) {
      if (event && event.key === "Escape") {
        closeCoachProgramModal();
      }
    });
  }

  function onEditProfileClick(event) {
    if (event) {
      event.preventDefault();
    }

    var viewedUserId = getViewedUserId();
    if (!viewedUserId) {
      setStatus("No athlete selected.", "error");
      return;
    }

    var athleteName =
      (state.profile && state.profile.name) ||
      (state.viewUser && state.viewUser.email) ||
      (state.user && state.user.email) ||
      "Athlete";

    var url =
      "athlete-editor.html?athleteId=" +
      encodeURIComponent(viewedUserId) +
      "&athleteName=" +
      encodeURIComponent(athleteName);

    if (!state.isCoachView) {
      url += "&personal=true";
    }

    window.location.href = url;
  }

  function onProfileSubmit(event) {
    event.preventDefault();

    var viewedUserId = getViewedUserId();
    if (!viewedUserId || !state.client || !state.form) {
      setStatus("Not authenticated.", "error");
      return;
    }

    var formData = new FormData(state.form);
    var selectedSports = getSelectedSportsFromForm();
    if (!selectedSports.length) {
      setStatus("Select at least one sport.", "error");
      return;
    }

    var sportOverview = collectSportOverviewFromForm();
    var desiredEmail = String(formData.get("email") || "").trim();
    var desiredHeight = parseFloat(formData.get("height_cm") || "") || null;
    var desiredArmSpan = parseFloat(formData.get("arm_span_cm") || "") || null;
    var desiredWeight = parseFloat(formData.get("weight_kg") || "") || null;
    var desiredSex = String(formData.get("sex") || "").trim() || null;
    var profileData = {
      user_id: viewedUserId,
      name: String(formData.get("name") || "").trim(),
      sport: selectedSports[0],
      sports: selectedSports,
      sport_overview: sportOverview,
      bio: String(formData.get("bio") || "").trim(),
      age: parseInt(formData.get("age") || 0, 10) || null,
      location: String(formData.get("location") || "").trim(),
      height_cm: desiredHeight,
      arm_span_cm: desiredArmSpan,
      weight_kg: desiredWeight,
      sex: desiredSex,
      updated_at: new Date().toISOString()
    };

    setStatus("Saving athlete info...", "info");

    saveProfileWithFallback(profileData)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        state.profile = Object.assign({}, state.profile || {}, result.data || profileData);
        updateHero(state.profile);
        persistLocalSportProfile(profileData);

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
    var viewedUserId = getViewedUserId();
    var droppedColumns = {};
    var optionalColumnsFallbackOrder = [
      "sport_overview",
      "sports",
      "arm_span_cm",
      "height_cm",
      "weight_kg",
      "sex",
      "bio",
      "age",
      "location",
      "level",
      "sport",
      "name"
    ];

    function runSave(nextPayload, attemptsRemaining) {
      var operation;
      if (state.profile && state.profile.id) {
        operation = state.client
          .from("athlete_profiles")
          .update(nextPayload)
          .eq("user_id", viewedUserId)
          .select()
          .single();
      } else {
        operation = state.client.from("athlete_profiles").insert([nextPayload]).select().single();
      }

      return operation.then(function (result) {
        if (!result.error || !isMissingColumnError(result.error) || attemptsRemaining <= 0) {
          return result;
        }

        var missingColumn = getMissingColumnName(result.error);
        if (!missingColumn) {
          missingColumn = optionalColumnsFallbackOrder.find(function (column) {
            return Object.prototype.hasOwnProperty.call(nextPayload, column) && !droppedColumns[column];
          }) || null;
        }

        if (!missingColumn || droppedColumns[missingColumn]) {
          return result;
        }

        droppedColumns[missingColumn] = true;
        var retryPayload = Object.assign({}, nextPayload);
        delete retryPayload[missingColumn];
        return runSave(retryPayload, attemptsRemaining - 1);
      });
    }

    return runSave(payload, 6);
  }

  function maybeUpdateEmail(desiredEmail) {
    var existingEmail = (state.viewUser && state.viewUser.email) || "";

    if (state.isCoachView) {
      return Promise.resolve("");
    }

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

    var viewedUserId = getViewedUserId();
    if (!viewedUserId || !state.client || !state.metricsRows) {
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
          user_id: viewedUserId,
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

    var latestLookup = buildLatestMetricsLookup(state.metrics || []);
    var metricsToInsert = metricsToSave.filter(function (metric) {
      var key = getMetricKey(metric);
      var latest = latestLookup[key];
      if (!latest) {
        return true;
      }

      return (
        normalizeMetricValue(metric.metric_value) !== normalizeMetricValue(latest.metric_value) ||
        normalizeMetricValue(metric.metric_unit) !== normalizeMetricValue(latest.metric_unit) ||
        normalizeMetricValue(metric.metric_category) !== normalizeMetricValue(latest.metric_category)
      );
    });

    if (!metricsToInsert.length) {
      setMetricsStatus("No metric changes detected. Update a value to log a new test.", "info");
      return;
    }

    setMetricsStatus("Saving new metric test entries...", "info");

    state.client
      .from("athlete_metrics")
      .insert(metricsToInsert)
      .select("*")
      .then(function (insertResult) {
        if (insertResult.error) {
          if (isMissingRelationError(insertResult.error)) {
            setMetricsStatus(
              "Metrics table not found. Create athlete_metrics in Supabase before saving metrics.",
              "error"
            );
            return;
          }

          if (isRlsError(insertResult.error)) {
            setMetricsStatus(
              "Permission denied by database policy while saving metrics. Ask admin to update athlete_metrics RLS policy for coach edits.",
              "error"
            );
            return;
          }

          setMetricsStatus(insertResult.error.message, "error");
          return;
        }

        var insertedRows = Array.isArray(insertResult.data) ? insertResult.data : metricsToInsert;
        state.metrics = insertedRows.concat(state.metrics || []);
        state.metricsLatest = getLatestMetrics(state.metrics);
        renderMetricsCards();
        renderMetricRowsFromData(state.metricsLatest);
        setMetricsStatus("Metrics saved as new test entries.", "success");

        if (state.metricsEditor && !state.metricsEditor.hidden) {
          toggleMetricsEditor();
        }
      })
      .catch(function (error) {
        setMetricsStatus(error && error.message ? error.message : "Failed to save metrics.", "error");
      });
  }

  function applyMetricsSectionPreference() {
    if (!state.metricsContent || !state.metricsCollapseToggle) {
      return;
    }

    var collapsed = false;
    try {
      collapsed = window.localStorage.getItem(METRICS_COLLAPSE_KEY) === "1";
    } catch (_error) {
      collapsed = false;
    }

    setMetricsSectionCollapsed(collapsed);
  }

  function toggleMetricsSection() {
    if (!state.metricsContent) {
      return;
    }

    setMetricsSectionCollapsed(!state.metricsContent.hidden);
  }

  function setMetricsSectionCollapsed(collapsed) {
    if (!state.metricsContent || !state.metricsCollapseToggle) {
      return;
    }

    state.metricsContent.hidden = !!collapsed;
    state.metricsCollapseToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    state.metricsCollapseToggle.textContent = collapsed ? "Show Metrics" : "Hide Metrics";

    try {
      window.localStorage.setItem(METRICS_COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch (_error) {
      /* localStorage may be disabled by browser privacy settings */
    }
  }

  function getMetricKey(metric) {
    var name = normalizeMetricValue(metric && metric.metric_name);
    var unit = normalizeMetricValue(metric && metric.metric_unit);
    return name + "|" + unit;
  }

  function normalizeMetricValue(value) {
    return String(value || "").trim().toLowerCase();
  }

  function parseSideVariantMetricName(rawName) {
    var name = String(rawName || "").trim();
    var sideMatch = name.match(/^(.*)\((left|right)\)\s*$/i);
    if (!sideMatch) {
      return null;
    }

    return {
      baseName: String(sideMatch[1] || "").trim(),
      side: String(sideMatch[2] || "").toLowerCase()
    };
  }

  function isPairedSideVariantMetric(metric) {
    var parsed = parseSideVariantMetricName(metric && metric.metric_name);
    if (!parsed) {
      return null;
    }

    if (isSingleLegSquatMetricName(parsed.baseName)) {
      parsed.group = "single-leg-squat";
      return parsed;
    }

    if (isSingleLegHeelRaiseMetricName(parsed.baseName)) {
      parsed.group = "single-leg-heel-raise";
      return parsed;
    }

    if (isSidePlankMetricName(parsed.baseName)) {
      parsed.group = "side-plank-hip-abduction";
      return parsed;
    }

    if (isYBalanceMetricName(parsed.baseName)) {
      parsed.group = "y-balance";
      return parsed;
    }

    if (isEdgePullMetricName(parsed.baseName)) {
      parsed.group = "edge-pull";
      return parsed;
    }

    return null;
  }

  function parseSingleLegSquatLegValues(metricValue) {
    var text = String(metricValue || "").replace(/,/g, " ").trim();
    if (!text) {
      return { left: null, right: null };
    }

    var leftMatch = text.match(/(?:\bL\b|\bleft\b|\bl leg\b)[^\d-]*(-?\d+(?:\.\d+)?)/i);
    var rightMatch = text.match(/(?:\bR\b|\bright\b|\br leg\b)[^\d-]*(-?\d+(?:\.\d+)?)/i);
    var left = leftMatch ? Number(leftMatch[1]) : null;
    var right = rightMatch ? Number(rightMatch[1]) : null;

    if (Number.isFinite(left) && Number.isFinite(right)) {
      return { left: left, right: right };
    }

    var numbers = text.match(/-?\d+(?:\.\d+)?/g) || [];
    if (numbers.length >= 2) {
      var first = Number(numbers[0]);
      var second = Number(numbers[1]);
      if (Number.isFinite(first) && Number.isFinite(second)) {
        return { left: first, right: second };
      }
    }

    return { left: null, right: null };
  }

  function buildLatestMetricsLookup(metrics) {
    var map = {};
    (metrics || []).forEach(function (metric) {
      var key = getMetricKey(metric);
      if (!key || map[key]) {
        return;
      }
      map[key] = metric;
    });
    return map;
  }

  function getLatestMetrics(metrics) {
    var groups = {};

    (metrics || []).forEach(function (metric) {
      var key = getMetricKey(metric);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(metric);
    });

    var latestMetrics = Object.keys(groups)
      .map(function (key) {
        var history = groups[key]
          .slice()
          .sort(function (a, b) {
            return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
          });

        var latest = Object.assign({}, history[0]);
        latest._history = history;
        latest._previous = history.length > 1 ? history[1] : null;
        return latest;
      })
      .sort(function (a, b) {
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      });

    var pairedBaseKeys = {};
    latestMetrics.forEach(function (metric) {
      var parsed = isPairedSideVariantMetric(metric);
      if (!parsed) {
        return;
      }
      var baseKey = normalizeMetricValue(parsed.baseName) + "|" + normalizeMetricValue(metric.metric_unit);
      pairedBaseKeys[baseKey] = true;
    });

    var displayMap = {};
    latestMetrics.forEach(function (metric) {
      var parsed = isPairedSideVariantMetric(metric);
      if (!parsed) {
        var metricKey = getMetricKey(metric);
        if (pairedBaseKeys[metricKey]) {
          return;
        }
        displayMap[getMetricKey(metric)] = metric;
        return;
      }

      var exactBaseKey = normalizeMetricValue(parsed.baseName) + "|" + normalizeMetricValue(metric.metric_unit);
      var combinedKey = exactBaseKey + "|" + parsed.group;
      if (!displayMap[combinedKey]) {
        displayMap[combinedKey] = {
          user_id: metric.user_id,
          metric_name: parsed.baseName,
          metric_value: "",
          metric_unit: metric.metric_unit,
          metric_category: metric.metric_category,
          updated_at: metric.updated_at,
          _history: [],
          _previous: null,
          _pairedSideMetrics: { left: null, right: null }
        };
      }

      var combinedMetric = displayMap[combinedKey];
      combinedMetric._pairedSideMetrics[parsed.side] = metric;
      combinedMetric.updated_at = [combinedMetric.updated_at, metric.updated_at]
        .filter(function (value) { return !!value; })
        .sort()
        .slice(-1)[0] || combinedMetric.updated_at;
      combinedMetric.metric_category = combinedMetric.metric_category || metric.metric_category;
      combinedMetric._history = (combinedMetric._history || []).concat(metric);

      if (combinedMetric._pairedSideMetrics.left && combinedMetric._pairedSideMetrics.right) {
        var leftMetric = combinedMetric._pairedSideMetrics.left;
        var rightMetric = combinedMetric._pairedSideMetrics.right;
        combinedMetric.metric_value =
          "L " + String(leftMetric.metric_value || "").trim() +
          " | R " + String(rightMetric.metric_value || "").trim();
      }
    });

    return Object.keys(displayMap)
      .map(function (key) {
        var metric = displayMap[key];
        if (metric && metric._pairedSideMetrics) {
          if (!metric._pairedSideMetrics.left || !metric._pairedSideMetrics.right) {
            return metric._pairedSideMetrics.left || metric._pairedSideMetrics.right || metric;
          }
        }
        return metric;
      })
      .sort(function (a, b) {
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      });
  }

  function getMetricTrend(metric) {
    if (!metric || !metric._previous) {
      return null;
    }

    var current = parseFloat(metric.metric_value);
    var previous = parseFloat(metric._previous.metric_value);
    if (isNaN(current) || isNaN(previous)) {
      return null;
    }

    var delta = current - previous;
    return {
      delta: delta,
      deltaLabel: formatMetricDelta(delta)
    };
  }

  function formatMetricDelta(delta) {
    var rounded = Math.round(delta * 100) / 100;
    if (rounded > 0) {
      return "+" + String(rounded);
    }
    return String(rounded);
  }

  function loadCurrentTrainingProgram() {
    var section = document.getElementById("profile-training-program-section");
    var content = document.getElementById("profile-training-program-content");
    if (!section || !content || !getViewedUserId() || !state.client) {
      return;
    }

    content.innerHTML = '<p class="profile-training-loading">Loading your training program...</p>';

    // Always use the non-join version to avoid ambiguous relationship embeds.
    loadCurrentTrainingProgramWithoutJoin(content);
  }

  function loadStravaOverview() {
    if (!state.client || !getViewedUserId()) {
      return;
    }

    renderStravaConnection(null, true);

    state.client
      .from("athlete_strava_connections")
      .select("user_id,strava_athlete_id,athlete_name,athlete_username,connected_at,last_sync_at,sync_status,updated_at")
      .eq("user_id", getViewedUserId())
      .maybeSingle()
      .then(function (result) {
        if (result.error) {
          if (isMissingRelationError(result.error)) {
            setStravaStatus(
              "Strava tables are not set up yet. Run sql/create-strava-integration.sql in Supabase first.",
              "error"
            );
            renderStravaConnection(null, false);
            renderStravaMetrics([]);
            return;
          }

          if (isRlsError(result.error)) {
            setStravaStatus(
              "Strava data is blocked by row-level security policy. Ask your admin to enable access.",
              "error"
            );
            renderStravaConnection(null, false);
            renderStravaMetrics([]);
            return;
          }

          setStravaStatus(result.error.message, "error");
          renderStravaConnection(null, false);
          renderStravaMetrics([]);
          return;
        }

        state.stravaConnection = result.data || null;
        renderStravaConnection(state.stravaConnection, false);
        loadStravaDailyMetrics();
      })
      .catch(function (error) {
        setStravaStatus(error && error.message ? error.message : "Failed to load Strava connection.", "error");
        renderStravaConnection(null, false);
        renderStravaMetrics([]);
      });
  }

  function loadStravaDailyMetrics() {
    if (!state.client || !getViewedUserId()) {
      return;
    }

    state.client
      .from("athlete_strava_daily_metrics")
      .select("metric_date,activity_count,distance_m,moving_time_sec,elevation_gain_m,training_load,resting_hr,hrv_ms,sleep_hours,recovery_score")
      .eq("user_id", getViewedUserId())
      .order("metric_date", { ascending: false })
      .limit(30)
      .then(function (result) {
        if (result.error) {
          if (isMissingRelationError(result.error)) {
            renderStravaMetrics([]);
            return;
          }

          if (isRlsError(result.error)) {
            setStravaStatus(
              "Cannot read Strava metrics due to row-level security policy.",
              "error"
            );
            renderStravaMetrics([]);
            return;
          }

          setStravaStatus(result.error.message, "error");
          renderStravaMetrics([]);
          return;
        }

        state.stravaDailyMetrics = Array.isArray(result.data) ? result.data : [];
        renderStravaMetrics(state.stravaDailyMetrics);
      })
      .catch(function (error) {
        setStravaStatus(error && error.message ? error.message : "Failed to load Strava metrics.", "error");
        renderStravaMetrics([]);
      });
  }

  function renderStravaConnection(connection, isLoading) {
    if (!state.stravaConnectionMeta) {
      return;
    }

    if (isLoading) {
      state.stravaConnectionMeta.innerHTML = '<p class="profile-loading">Checking Strava connection...</p>';
      return;
    }

    var canManage = canManageStravaConnection();
    var isConnected = !!connection;

    if (state.stravaConnectBtn) {
      state.stravaConnectBtn.hidden = !canManage || isConnected;
      state.stravaConnectBtn.disabled = !canManage;
    }
    if (state.stravaSyncBtn) {
      state.stravaSyncBtn.hidden = !isConnected;
      state.stravaSyncBtn.disabled = !isConnected;
    }
    if (state.stravaDisconnectBtn) {
      state.stravaDisconnectBtn.hidden = !canManage || !isConnected;
      state.stravaDisconnectBtn.disabled = !canManage || !isConnected;
    }

    if (!isConnected) {
      var coachHint = state.isCoachView
        ? "This athlete has not connected Strava yet."
        : "Connect your Strava account to pull activity and recovery metrics into this dashboard.";
      state.stravaConnectionMeta.innerHTML =
        '<p class="strava-connection-empty">' + escapeHtml(coachHint) + "</p>";
      return;
    }

    var athleteLabel = connection.athlete_name || connection.athlete_username || "Connected athlete";
    var syncLabel = connection.last_sync_at ? formatDate(connection.last_sync_at) : "Not synced yet";
    var statusText = connection.sync_status || "connected";

    state.stravaConnectionMeta.innerHTML =
      '<div class="strava-connection-grid">' +
      '<div class="strava-connection-item"><span>Account</span><strong>' + escapeHtml(athleteLabel) + "</strong></div>" +
      '<div class="strava-connection-item"><span>Connection Status</span><strong>' + escapeHtml(statusText) + "</strong></div>" +
      '<div class="strava-connection-item"><span>Last Sync</span><strong>' + escapeHtml(syncLabel) + "</strong></div>" +
      "</div>";
  }

  function renderStravaMetrics(rows) {
    if (!state.stravaMetricsGrid) {
      return;
    }

    var data = Array.isArray(rows) ? rows : [];
    if (!data.length) {
      state.stravaMetricsGrid.innerHTML =
        '<p class="strava-empty">No Strava metrics synced yet. Sync after connecting to populate this section.</p>';
      return;
    }

    var recentSeven = data.slice(0, 7);
    var latestWithRecovery = data.find(function (row) {
      return row && (row.recovery_score != null || row.resting_hr != null || row.hrv_ms != null);
    }) || data[0];

    var totalDistanceMeters = sumNumeric(recentSeven, "distance_m");
    var totalMovingTime = sumNumeric(recentSeven, "moving_time_sec");
    var totalElevation = sumNumeric(recentSeven, "elevation_gain_m");
    var totalActivities = sumNumeric(recentSeven, "activity_count");
    var totalLoad = sumNumeric(recentSeven, "training_load");

    var cards = [
      { label: "7-Day Distance", value: formatDecimal(totalDistanceMeters / 1000, 1) + " km" },
      { label: "7-Day Moving Time", value: formatDecimal(totalMovingTime / 3600, 1) + " h" },
      { label: "7-Day Elevation", value: formatInteger(totalElevation) + " m" },
      { label: "7-Day Activities", value: formatInteger(totalActivities) },
      { label: "7-Day Training Load", value: formatInteger(totalLoad) },
      { label: "Recovery Score", value: formatNullableNumber(latestWithRecovery && latestWithRecovery.recovery_score) },
      { label: "Resting HR", value: formatNullableNumber(latestWithRecovery && latestWithRecovery.resting_hr, " bpm") },
      { label: "HRV", value: formatNullableNumber(latestWithRecovery && latestWithRecovery.hrv_ms, " ms") }
    ];

    state.stravaMetricsGrid.innerHTML = cards
      .map(function (item) {
        return (
          '<article class="strava-metric-card">' +
          '<span class="strava-metric-label">' + escapeHtml(item.label) + "</span>" +
          '<strong class="strava-metric-value">' + escapeHtml(item.value) + "</strong>" +
          "</article>"
        );
      })
      .join("");
  }

  function onStravaConnect() {
    if (!canManageStravaConnection()) {
      setStravaStatus("Only the athlete can connect a Strava account from this view.", "info");
      return;
    }

    if (!state.client || !state.client.functions) {
      setStravaStatus("Supabase Functions are not available in this build.", "error");
      return;
    }

    setStravaStatus("Generating Strava authorization link...", "info");

    state.client.functions
      .invoke("strava-connect-start", {
        body: {
          redirectTo: getStravaRedirectUrl()
        }
      })
      .then(function (result) {
        if (result.error) {
          handleStravaEdgeError(result.error, "strava-connect-start");
          return;
        }

        var data = result.data || {};
        var authUrl = data.auth_url || data.authUrl || data.url || "";
        if (!authUrl) {
          setStravaStatus("Strava auth URL was not returned by strava-connect-start.", "error");
          return;
        }

        window.location.href = authUrl;
      })
      .catch(function (error) {
        handleStravaEdgeError(error, "strava-connect-start");
      });
  }

  function onStravaSync() {
    if (!state.client || !state.client.functions) {
      setStravaStatus("Supabase Functions are not available in this build.", "error");
      return;
    }

    if (!state.stravaConnection) {
      setStravaStatus("Connect Strava before requesting a sync.", "info");
      return;
    }

    setStravaStatus("Syncing latest Strava metrics...", "info");

    state.client.functions
      .invoke("strava-sync-latest", {
        body: {
          days: 30
        }
      })
      .then(function (result) {
        if (result.error) {
          handleStravaEdgeError(result.error, "strava-sync-latest");
          return;
        }

        setStravaStatus("Strava sync complete.", "success");
        loadStravaOverview();
      })
      .catch(function (error) {
        handleStravaEdgeError(error, "strava-sync-latest");
      });
  }

  function onStravaDisconnect() {
    if (!canManageStravaConnection()) {
      setStravaStatus("Only the athlete can disconnect a Strava account from this view.", "info");
      return;
    }

    if (!state.client || !state.client.functions) {
      setStravaStatus("Supabase Functions are not available in this build.", "error");
      return;
    }

    if (!state.stravaConnection) {
      setStravaStatus("No Strava account is currently connected.", "info");
      return;
    }

    if (!confirm("Disconnect Strava from this athlete profile?")) {
      return;
    }

    setStravaStatus("Disconnecting Strava account...", "info");

    state.client.functions
      .invoke("strava-disconnect", { body: {} })
      .then(function (result) {
        if (result.error) {
          handleStravaEdgeError(result.error, "strava-disconnect");
          return;
        }

        state.stravaConnection = null;
        state.stravaDailyMetrics = [];
        renderStravaConnection(null, false);
        renderStravaMetrics([]);
        setStravaStatus("Strava disconnected.", "success");
      })
      .catch(function (error) {
        handleStravaEdgeError(error, "strava-disconnect");
      });
  }

  function handleStravaEdgeError(error, functionName) {
    resolveStravaEdgeError(error, functionName)
      .then(function (message) {
        setStravaStatus(message, "error");
      })
      .catch(function () {
        setStravaStatus(formatStravaEdgeError(error, functionName), "error");
      });
  }

  function resolveStravaEdgeError(error, functionName) {
    var baseMessage = formatStravaEdgeError(error, functionName);
    var context = error && error.context;

    if (!context || typeof context.clone !== "function") {
      return Promise.resolve(baseMessage);
    }

    return context
      .clone()
      .json()
      .then(function (payload) {
        var detail = "";
        if (payload && typeof payload.error === "string") {
          detail = payload.error;
        } else if (payload && typeof payload.message === "string") {
          detail = payload.message;
        } else if (payload && typeof payload.code === "string") {
          detail = payload.code;
        }

        if (!detail) {
          return buildStravaStatusMessageFromHttp(context.status, baseMessage, functionName);
        }

        return buildStravaStatusMessageFromDetail(detail, context.status, functionName, baseMessage);
      })
      .catch(function () {
        return buildStravaStatusMessageFromHttp(context.status, baseMessage, functionName);
      });
  }

  function buildStravaStatusMessageFromHttp(status, fallbackMessage, functionName) {
    if (status === 401) {
      return "You are not authenticated. Sign in again and retry " + functionName + ".";
    }

    if (status === 404) {
      return (
        "Could not reach " +
        functionName +
        ". Deploy Supabase Edge Functions and confirm project secrets are set. See supabase/functions/README.md."
      );
    }

    return fallbackMessage;
  }

  function buildStravaStatusMessageFromDetail(detail, status, functionName, fallbackMessage) {
    var cleanDetail = String(detail || "").trim();
    var normalized = cleanDetail.toLowerCase();

    if (
      normalized.indexOf("missing authorization header") !== -1 ||
      normalized.indexOf("missing authorization bearer token") !== -1 ||
      normalized.indexOf("unable to authenticate user") !== -1
    ) {
      return "Your login session is missing or expired. Sign in again and retry " + functionName + ".";
    }

    if (normalized.indexOf("missing required environment variable") !== -1) {
      return functionName + " is missing a required secret: " + cleanDetail;
    }

    if (status === 401) {
      return "You are not authenticated. Sign in again and retry " + functionName + ".";
    }

    return functionName + " error: " + cleanDetail;
  }

  function formatStravaEdgeError(error, functionName) {
    var message = String((error && error.message) || "").trim();
    var normalized = message.toLowerCase();

    if (
      normalized.indexOf("failed to send a request to the edge function") !== -1 ||
      normalized.indexOf("requested function was not found") !== -1 ||
      normalized.indexOf("not_found") !== -1
    ) {
      return (
        "Could not reach " +
        functionName +
        ". Deploy Supabase Edge Functions and confirm project secrets are set. See supabase/functions/README.md."
      );
    }

    if (normalized.indexOf("non-2xx") !== -1) {
      return (
        functionName +
        " returned an error response. Check function logs in Supabase and verify STRAVA_* secrets are configured."
      );
    }

    return message || ("Failed calling " + functionName + ".");
  }

  function maybeShowStravaRedirectStatus() {
    var params;
    try {
      params = new URLSearchParams(window.location.search || "");
    } catch (e) {
      return;
    }

    var status = String(params.get(STRAVA_REDIRECT_STATUS_PARAM) || "").trim();
    if (!status) {
      return;
    }

    var message = String(params.get(STRAVA_REDIRECT_MESSAGE_PARAM) || "").trim();
    if (!message) {
      if (status === "connected") {
        message = "Strava account connected. Run a sync to pull your latest metrics.";
      } else if (status === "synced") {
        message = "Strava metrics synced successfully.";
      } else {
        message = "There was an issue completing Strava connection.";
      }
    }

    setStravaStatus(message, status === "error" ? "error" : "success");
    params.delete(STRAVA_REDIRECT_STATUS_PARAM);
    params.delete(STRAVA_REDIRECT_MESSAGE_PARAM);
    if (window.history && window.history.replaceState) {
      var cleanQuery = params.toString();
      var cleanUrl = window.location.pathname + (cleanQuery ? "?" + cleanQuery : "") + window.location.hash;
      window.history.replaceState({}, "", cleanUrl);
    }
  }

  function setStravaStatus(message, variant) {
    if (!state.stravaStatusElement) {
      return;
    }

    state.stravaStatusElement.textContent = message || "";
    state.stravaStatusElement.classList.remove("is-error", "is-success", "is-info");

    if (!message) {
      return;
    }

    if (variant === "error") {
      state.stravaStatusElement.classList.add("is-error");
    } else if (variant === "success") {
      state.stravaStatusElement.classList.add("is-success");
    } else {
      state.stravaStatusElement.classList.add("is-info");
    }
  }

  function canManageStravaConnection() {
    if (state.isCoachView) {
      return false;
    }
    if (!state.user || !state.viewUser) {
      return false;
    }
    return String(state.user.id || "") === String(state.viewUser.id || "");
  }

  function getStravaRedirectUrl() {
    return window.location.origin + "/profile.html";
  }

  function sumNumeric(rows, key) {
    return (rows || []).reduce(function (total, row) {
      var value = Number(row && row[key]);
      if (!Number.isFinite(value)) {
        return total;
      }
      return total + value;
    }, 0);
  }

  function formatInteger(value) {
    if (!Number.isFinite(value)) {
      return "—";
    }
    return String(Math.round(value));
  }

  function formatDecimal(value, places) {
    if (!Number.isFinite(value)) {
      return "—";
    }
    return value.toFixed(places);
  }

  function formatNullableNumber(value, suffix) {
    var numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
      return "—";
    }
    var formatted = Math.abs(numberValue - Math.round(numberValue)) < 0.01
      ? String(Math.round(numberValue))
      : numberValue.toFixed(1);
    return formatted + (suffix || "");
  }

  function loadCurrentTrainingProgramWithoutJoin(contentElement) {
    state.client
      .from("user_training_programs")
      .select("*")
      .eq("user_id", getViewedUserId())
      .eq("is_active", true)
      .order("assigned_at", { ascending: false })
      .limit(1)
      .then(function (result) {
        if (result.error) {
          contentElement.innerHTML = '<p class="profile-training-error">' + escapeHtml(result.error.message) + "</p>";
          return;
        }

        var program = result.data && result.data[0];
        if (!program) {
          renderTrainingProgram(contentElement, null);
          return;
        }

        if (program.program_name || !program.program_id) {
          renderTrainingProgram(contentElement, program);
          return;
        }

        state.client
          .from("training_programs")
          .select("name,description")
          .eq("id", program.program_id)
          .single()
          .then(function (programResult) {
            if (!programResult.error && programResult.data) {
              program.training_program = {
                name: programResult.data.name,
                description: programResult.data.description
              };
            }

            renderTrainingProgram(contentElement, program);
          })
          .catch(function () {
            renderTrainingProgram(contentElement, program);
          });
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
      contentElement.innerHTML =
        '<p class="profile-training-none">You have no active training program assigned yet.</p>' +
        (state.isCoachView
          ? '<div class="training-coach-actions"><button type="button" class="btn profile-btn-edit-profile training-change-btn" data-assign-active-program>Assign Program to Athlete</button></div>' +
            '<p class="profile-status training-program-status" role="status" aria-live="polite" data-training-program-status></p>'
          : "");
      return;
    }

    var programName =
      (program.training_program && program.training_program.name) ||
      program.program_name ||
      (program.program_id ? "Program " + String(program.program_id).slice(0, 8) : "Assigned Program");

    var startDate = program.assigned_at ? formatDate(program.assigned_at) : "—";
    var programUrl =
      "training-program-example.html?program=" + encodeURIComponent(programName) +
      (program.program_id ? "&templateId=" + encodeURIComponent(program.program_id) : "");

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
      '<p class="training-note">Your coach assigns and updates this program from the Coaching Dashboard.</p>' +
      '<a class="btn training-open-btn" href="' +
      programUrl +
      '">Open Program + Log Workout</a>' +
      (state.isCoachView
        ? '<div class="training-coach-actions">' +
          '<button type="button" class="btn profile-btn-edit-profile training-change-btn" data-change-active-program>Edit Program for Athlete</button>' +
          '<button type="button" class="btn profile-btn-edit-profile training-change-btn" data-assign-active-program>Assign Different Template</button>' +
          '<button type="button" class="btn profile-btn-delete training-remove-btn" data-remove-active-program>Remove Program from Athlete</button>' +
          "</div>"
        : "") +
      '<p class="profile-status training-program-status" role="status" aria-live="polite" data-training-program-status></p>' +
      "</div>";
  }

  function onCustomizeProgramForAthlete() {
    var viewedUserId = getViewedUserId();
    if (!state.isCoachView || !viewedUserId || !state.client) {
      setTrainingProgramStatus("Unable to edit athlete program right now.", "error");
      return;
    }

    setTrainingProgramStatus("Preparing athlete-specific editable program...", "info");

    state.client
      .from("user_training_programs")
      .select("*")
      .eq("user_id", viewedUserId)
      .eq("is_active", true)
      .order("assigned_at", { ascending: false })
      .limit(1)
      .then(function (assignmentResult) {
        if (assignmentResult.error) {
          setTrainingProgramStatus(assignmentResult.error.message, "error");
          return;
        }

        var activeAssignment = assignmentResult.data && assignmentResult.data[0];
        if (!activeAssignment || !activeAssignment.program_id) {
          setTrainingProgramStatus("Assign a template first, then you can customize it for this athlete.", "info");
          return;
        }

        state.client
          .from("training_programs")
          .select("id,name,description")
          .eq("id", activeAssignment.program_id)
          .single()
          .then(function (programResult) {
            if (programResult.error || !programResult.data) {
              setTrainingProgramStatus(
                programResult.error ? programResult.error.message : "Program could not be loaded.",
                "error"
              );
              return;
            }

            var sourceProgram = programResult.data;
            var sourcePayload = parseTemplatePayload(sourceProgram.description);
            if (!sourcePayload) {
              setTrainingProgramStatus("This program cannot be customized because its template data is invalid.", "error");
              return;
            }

            var athleteLabel =
              (state.profile && state.profile.name) ||
              (state.viewUser && state.viewUser.email) ||
              "Athlete";

            var customPayload = {
              archived: true,
              structure: normalizeTemplateStructure(sourcePayload.structure),
              days: sourcePayload.days || {}
            };

            var customProgramName =
              (sourceProgram.name || activeAssignment.program_name || "Training Program") +
              " - " +
              athleteLabel +
              " (Custom)";

            state.client
              .from("training_programs")
              .insert({
                name: customProgramName,
                description: serializeTemplatePayload(customPayload)
              })
              .select("id,name")
              .single()
              .then(function (insertProgramResult) {
                if (insertProgramResult.error || !insertProgramResult.data) {
                  setTrainingProgramStatus(
                    insertProgramResult.error ? insertProgramResult.error.message : "Failed to create custom program.",
                    "error"
                  );
                  return;
                }

                var customProgram = insertProgramResult.data;
                var now = new Date().toISOString();

                state.client
                  .from("user_training_programs")
                  .update({ is_active: false })
                  .eq("user_id", viewedUserId)
                  .eq("is_active", true)
                  .then(function (deactivateResult) {
                    if (deactivateResult.error) {
                      setTrainingProgramStatus(deactivateResult.error.message, "error");
                      return;
                    }

                    state.client
                      .from("user_training_programs")
                      .insert({
                        user_id: viewedUserId,
                        program_id: customProgram.id,
                        program_name: customProgram.name,
                        is_active: true,
                        assigned_at: now,
                        assigned_by: state.user ? state.user.id : null
                      })
                      .then(function (assignResult) {
                        if (assignResult.error) {
                          setTrainingProgramStatus(assignResult.error.message, "error");
                          return;
                        }

                        setTrainingProgramStatus("Opened athlete-specific program editor.", "success");
                        window.location.href =
                          "training-program-example.html?builder=1&templateId=" +
                          encodeURIComponent(customProgram.id);
                      })
                      .catch(function (error) {
                        setTrainingProgramStatus(
                          error && error.message ? error.message : "Failed to assign custom program.",
                          "error"
                        );
                      });
                  })
                  .catch(function (error) {
                    setTrainingProgramStatus(
                      error && error.message ? error.message : "Failed to update active assignment.",
                      "error"
                    );
                  });
              })
              .catch(function (error) {
                setTrainingProgramStatus(
                  error && error.message ? error.message : "Failed to create custom program.",
                  "error"
                );
              });
          })
          .catch(function (error) {
            setTrainingProgramStatus(
              error && error.message ? error.message : "Failed to load source program.",
              "error"
            );
          });
      })
      .catch(function (error) {
        setTrainingProgramStatus(
          error && error.message ? error.message : "Failed to prepare athlete program editor.",
          "error"
        );
      });
  }

  function openCoachProgramModal() {
    if (!state.isCoachView) {
      return;
    }

    if (!state.client || !getViewedUserId()) {
      setTrainingProgramStatus("Unable to manage athlete program right now.", "error");
      return;
    }

    var modal = document.querySelector("[data-coach-program-modal]");
    if (!modal) {
      return;
    }

    var athleteLabel = document.querySelector("[data-coach-program-athlete-label]");
    if (athleteLabel) {
      athleteLabel.textContent =
        "Athlete: " +
        ((state.profile && state.profile.name) || (state.viewUser && state.viewUser.email) || "Selected athlete");
    }

    var searchInput = document.querySelector("[data-coach-program-search]");
    if (searchInput) {
      searchInput.value = "";
    }

    state.selectedTrainingTemplateId = "";
    setCoachProgramStatus("", "info");
    modal.hidden = false;
    document.body.classList.add("admin-modal-open");
    loadCoachProgramTemplates();
  }

  function closeCoachProgramModal() {
    var modal = document.querySelector("[data-coach-program-modal]");
    if (!modal || modal.hidden) {
      return;
    }

    modal.hidden = true;
    document.body.classList.remove("admin-modal-open");
    state.selectedTrainingTemplateId = "";
    setCoachProgramStatus("", "info");
  }

  function loadCoachProgramTemplates() {
    if (!state.client) {
      return;
    }

    var list = document.querySelector("[data-coach-program-list]");
    if (list) {
      list.innerHTML = '<p class="admin-loading">Loading templates...</p>';
    }

    state.client
      .from("training_programs")
      .select("id,name,description,updated_at,created_at")
      .order("updated_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          setCoachProgramStatus(result.error.message, "error");
          return;
        }

        state.trainingTemplates = (result.data || [])
          .map(function (row) {
            var payload = parseTemplatePayload(String(row.description || ""));
            if (!payload || payload.archived) {
              return null;
            }
            return {
              id: row.id,
              name: row.name || "Untitled Template",
              updated_at: row.updated_at || row.created_at || ""
            };
          })
          .filter(function (item) {
            return !!item;
          });

        renderCoachProgramTemplateList("");
      })
      .catch(function (error) {
        setCoachProgramStatus(
          error && error.message ? error.message : "Failed to load templates.",
          "error"
        );
      });
  }

  function renderCoachProgramTemplateList(searchTerm) {
    var list = document.querySelector("[data-coach-program-list]");
    if (!list) {
      return;
    }

    var query = String(searchTerm || "").trim().toLowerCase();
    var filtered = state.trainingTemplates.filter(function (template) {
      if (!query) {
   var isGrant = isAdaptedGrantFootRaiseMetricName(metric.metric_name || "");
   var grantGrid = card.querySelector("[data-metric-grant-grid]");

   if (grantGrid) {
     grantGrid.hidden = !isGrant;
   }

   if (isGrant) {
     card.setAttribute("data-metric-grant", "true");

     var parsedGrant = parseGrantLegValues(metric.metric_value || "");
     var shouldBlankForTestGrant = modeValue === "test";
     if (leftInput) {
       leftInput.value = shouldBlankForTestGrant
         ? ""
         : (parsedGrant.left === null ? "" : formatMetricNumber(parsedGrant.left));
     }
     if (rightInput) {
       rightInput.value = shouldBlankForTestGrant
         ? ""
         : (parsedGrant.right === null ? "" : formatMetricNumber(parsedGrant.right));
     }

     updateGrantDraftValue(card);

     if (leftInput) {
       leftInput.focus();
     }
     return;
   }

   card.removeAttribute("data-metric-grant");
      }
      return String(template.name || "").toLowerCase().indexOf(query) > -1;
    });

    if (!filtered.length) {
      list.innerHTML = '<p class="admin-loading">No templates match this search.</p>';
      return;
    }

    list.innerHTML = filtered
      .map(function (template) {
        var checked = state.selectedTrainingTemplateId === template.id ? " checked" : "";
        return (
          '<label class="admin-assign-item">' +
          '<input type="radio" name="coach-program-template" data-coach-program-template value="' +
          escapeAttribute(template.id) +
          '"' +
          checked +
          ' />' +
          '<span class="admin-assign-item-main">' +
          '<strong>' +
          escapeHtml(template.name) +
          "</strong>" +
          '<small>Updated ' +
          escapeHtml(formatDate(template.updated_at)) +
          "</small>" +
          "</span>" +
          "</label>"
        );
      })
      .join("");

    list.querySelectorAll("[data-coach-program-template]").forEach(function (radio) {
      radio.addEventListener("change", function () {
        state.selectedTrainingTemplateId = String(radio.value || "");
      });
    });
  }

  function onAssignTemplateToCurrentAthlete() {
    var viewedUserId = getViewedUserId();
    if (!state.isCoachView || !viewedUserId || !state.client) {
      setCoachProgramStatus("Unable to assign template right now.", "error");
      return;
    }

    if (!state.selectedTrainingTemplateId) {
      setCoachProgramStatus("Select a template to assign.", "error");
      return;
    }

    var template = state.trainingTemplates.find(function (item) {
      return item.id === state.selectedTrainingTemplateId;
    });

    if (!template) {
      setCoachProgramStatus("Template not found.", "error");
      return;
    }

    var now = new Date().toISOString();
    setCoachProgramStatus("Assigning template to athlete...", "info");

    state.client
      .from("user_training_programs")
      .update({ is_active: false })
      .eq("user_id", viewedUserId)
      .eq("is_active", true)
      .then(function (deactivateResult) {
        if (deactivateResult.error) {
          setCoachProgramStatus(deactivateResult.error.message, "error");
          return;
        }

        state.client
          .from("user_training_programs")
          .insert({
            user_id: viewedUserId,
            program_id: template.id,
            program_name: template.name,
            is_active: true,
            assigned_at: now,
            assigned_by: state.user ? state.user.id : null
          })
          .then(function (insertResult) {
            if (insertResult.error) {
              setCoachProgramStatus(insertResult.error.message, "error");
              return;
            }

            setCoachProgramStatus("Template assigned to this athlete.", "success");
            setTrainingProgramStatus("Program updated for this athlete only.", "success");
            setTimeout(function () {
              closeCoachProgramModal();
              loadCurrentTrainingProgram();
            }, 500);
          })
          .catch(function (error) {
            setCoachProgramStatus(error && error.message ? error.message : "Failed to assign template.", "error");
          });
      })
      .catch(function (error) {
        setCoachProgramStatus(error && error.message ? error.message : "Failed to assign template.", "error");
      });
  }

  function parseTemplatePayload(description) {
    var marker = "__NOMADIC_TEMPLATE__";
    var value = String(description || "");
    if (value.indexOf(marker) !== 0) {
      return null;
    }

    try {
      return JSON.parse(value.slice(marker.length));
    } catch (e) {
      return null;
    }
  }

  function serializeTemplatePayload(payload) {
    var marker = "__NOMADIC_TEMPLATE__";
    var safePayload = {
      archived: !!(payload && payload.archived),
      structure: normalizeTemplateStructure(payload && payload.structure),
      days: payload && payload.days ? payload.days : {}
    };
    return marker + JSON.stringify(safePayload);
  }

  function normalizeTemplateStructure(structure) {
    var weeks = parseInt((structure && structure.weeks) || 1, 10);
    var workoutsPerWeek = parseInt((structure && structure.workoutsPerWeek) || 3, 10);
    return {
      weeks: Math.max(1, Math.min(24, isNaN(weeks) ? 1 : weeks)),
      workoutsPerWeek: Math.max(1, Math.min(14, isNaN(workoutsPerWeek) ? 3 : workoutsPerWeek))
    };
  }

  function setCoachProgramStatus(message, variant) {
    var statusEl = document.querySelector("[data-coach-program-status]");
    if (!statusEl) {
      return;
    }

    statusEl.textContent = message || "";
    statusEl.classList.remove("is-error", "is-success", "is-info");

    if (!message) {
      return;
    }

    if (variant === "error") {
      statusEl.classList.add("is-error");
    } else if (variant === "success") {
      statusEl.classList.add("is-success");
    } else {
      statusEl.classList.add("is-info");
    }
  }

  function onRemoveActiveProgram() {
    var viewedUserId = getViewedUserId();
    if (!state.isCoachView) {
      return;
    }

    if (!viewedUserId || !state.client) {
      setTrainingProgramStatus("Unable to remove program right now.", "error");
      return;
    }

    if (!confirm("Remove the active training program from this athlete?")) {
      return;
    }

    setTrainingProgramStatus("Removing active program...", "info");

    state.client
      .from("user_training_programs")
      .update({ is_active: false })
      .eq("user_id", viewedUserId)
      .eq("is_active", true)
      .then(function (result) {
        if (result.error) {
          setTrainingProgramStatus(result.error.message, "error");
          return;
        }

        setTrainingProgramStatus("Program removed from athlete.", "success");
        setTimeout(function () {
          loadCurrentTrainingProgram();
        }, 350);
      })
      .catch(function (error) {
        setTrainingProgramStatus(
          error && error.message ? error.message : "Failed to remove active program.",
          "error"
        );
      });
  }

  function setTrainingProgramStatus(message, variant) {
    var statusEl = document.querySelector("[data-training-program-status]");
    if (!statusEl) {
      return;
    }

    statusEl.textContent = message || "";
    statusEl.classList.remove("is-error", "is-success", "is-info");

    if (!message) {
      return;
    }

    if (variant === "error") {
      statusEl.classList.add("is-error");
    } else if (variant === "success") {
      statusEl.classList.add("is-success");
    } else {
      statusEl.classList.add("is-info");
    }
  }

  function onDeleteAccount() {
    if (state.isCoachView) {
      setStatus("Delete athletes from the Coaching Dashboard.", "info");
      return;
    }

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

  function onResetMyPassword() {
    if (state.isCoachView) {
      setPasswordStatus("Password reset is disabled in coach view.", "info");
      return;
    }

    if (!state.client || !state.user || !state.user.email) {
      setPasswordStatus("Not authenticated.", "error");
      return;
    }

    var cooldownMs = getResetCooldownRemainingMs();
    if (cooldownMs > 0) {
      var seconds = Math.ceil(cooldownMs / 1000);
      setPasswordStatus(
        "Please wait " + seconds + " seconds before requesting another reset email.",
        "info"
      );
      return;
    }

    setPasswordStatus("Sending password reset email...", "info");

    state.client.auth
      .resetPasswordForEmail(state.user.email, {
        redirectTo: getPasswordResetRedirectUrl()
      })
      .then(function (result) {
        if (result.error) {
          if (isRateLimitError(result.error)) {
            markResetCooldown();
            setPasswordStatus(
              "Email rate limit reached. Please wait about a minute, then try again.",
              "error"
            );
            return;
          }

          setPasswordStatus(result.error.message, "error");
          return;
        }

        markResetCooldown();

        setPasswordStatus(
          "Password reset email sent. Check your inbox.",
          "success"
        );
      })
      .catch(function (error) {
        setPasswordStatus(
          error && error.message
            ? error.message
            : "Failed to send password reset email.",
          "error"
        );
      });
  }

  function onLogout() {
    if (!state.client) {
      setPasswordStatus("Not authenticated.", "error");
      return;
    }

    setPasswordStatus("Logging out...", "info");

    state.client.auth
      .signOut()
      .then(function (result) {
        if (result.error) {
          setPasswordStatus(result.error.message, "error");
          return;
        }

        window.location.href = "index.html";
      })
      .catch(function (error) {
        setPasswordStatus(
          error && error.message ? error.message : "Failed to log out.",
          "error"
        );
      });
  }

  function getResetCooldownRemainingMs() {
    try {
      var key = getResetCooldownKey();
      var expiresAt = parseInt(window.localStorage.getItem(key) || "0", 10);
      if (!expiresAt) {
        return 0;
      }

      var remaining = expiresAt - Date.now();
      return remaining > 0 ? remaining : 0;
    } catch (e) {
      return 0;
    }
  }

  function markResetCooldown() {
    try {
      var key = getResetCooldownKey();
      // 60-second client cooldown helps avoid repeated Supabase throttle hits.
      var expiresAt = Date.now() + 60 * 1000;
      window.localStorage.setItem(key, String(expiresAt));
    } catch (e) {
      // Ignore storage errors.
    }
  }

  function getResetCooldownKey() {
    var email = state.user && state.user.email ? state.user.email.toLowerCase() : "unknown";
    return "nomadic_reset_password_cooldown_" + email;
  }

  function getPasswordResetRedirectUrl() {
    return window.location.origin + "/update-password.html";
  }

  function getViewedUserId() {
    return state.viewUser && state.viewUser.id ? state.viewUser.id : null;
  }

  function isRateLimitError(error) {
    var message = error && error.message ? error.message.toLowerCase() : "";
    return message.indexOf("rate limit") > -1 || message.indexOf("too many") > -1;
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

  function toggleMetricsEditor() {
    if (!state.metricsEditor) {
      return;
    }

    var isHidden = !!state.metricsEditor.hidden;
    state.metricsEditor.hidden = !isHidden;
  }

  function openMetricsEditorWithRows(rows) {
    if (!state.metricsEditor || !state.metricsRows) {
      return;
    }

    if (state.metricsEditor.hidden) {
      toggleMetricsEditor();
    }

    state.metricsRows.innerHTML = "";
    (rows || []).forEach(function (row) {
      appendMetricRow(row || {});
    });
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

  function findLatestMetricByKey(key) {
    var metricKey = String(key || "");
    return (state.metricsLatest || []).find(function (metric) {
      return getMetricKey(metric) === metricKey;
    }) || null;
  }

  function openMetricCardEditor(card, metric, mode) {
    if (!card || !metric) {
      return;
    }

    closeAllMetricCardEditors();

    var modeValue = mode === "test" ? "test" : "edit";
    card.classList.add("is-flipped");
    card.setAttribute("data-metric-mode", modeValue);

    var label = card.querySelector("[data-metric-flip-label]");
    var nameInput = card.querySelector('[data-metric-edit="name"]');
    var valueInput = card.querySelector('[data-metric-edit="value"]');
    var leftInput = card.querySelector('[data-metric-edit="left"]');
    var rightInput = card.querySelector('[data-metric-edit="right"]');
    var symmetryInput = card.querySelector('[data-metric-edit="symmetry"]');
    var yBalanceGrid = card.querySelector("[data-metric-ybalance-grid]");
    var grantGrid = card.querySelector("[data-metric-grant-grid]");
    var unitInput = card.querySelector('[data-metric-edit="unit"]');
    var categoryInput = card.querySelector('[data-metric-edit="category"]');
    var legLengthNote = card.querySelector("[data-leglength-estimate-note]");
    var isYBalance = isYBalanceMetricName(metric.metric_name || "");
    var isSingleLegSquat = isSingleLegSquatMetricName(metric.metric_name || "");
    var isEdgePull = isEdgePullMetricName(metric.metric_name || "");
    var isGrant = isAdaptedGrantFootRaiseMetricName(metric.metric_name || "");

    if (label) {
      label.textContent = modeValue === "test" ? "Log New Test" : "Edit Metric";
    }

    if (nameInput) {
      nameInput.value = metric.metric_name || "";
    }
    if (unitInput) {
      unitInput.value = metric.metric_unit || "";
    }
    if (categoryInput) {
      categoryInput.value = metric.metric_category || "Performance";
    }

    if (leftInput) {
      leftInput.placeholder = isEdgePull ? "L Hand" : "L Leg";
    }
    if (rightInput) {
      rightInput.placeholder = isEdgePull ? "R Hand" : "R Leg";
    }

    if (legLengthNote) {
      var metricName = String(metric.metric_name || "");
      var showNote =
        isYBalanceMetricName(metricName) ||
        isAdaptedGrantFootRaiseMetricName(metricName);
      legLengthNote.hidden = !showNote;
    }

    if (yBalanceGrid) {
      yBalanceGrid.hidden = !(isYBalance || isEdgePull || isSingleLegSquat);
    }

    if (grantGrid) {
      grantGrid.hidden = !isGrant;
    }

    if (isYBalance) {
      card.setAttribute("data-metric-ybalance", "true");

      var parsed = parseYBalanceLegValues(metric.metric_value || "");
      var shouldBlankForTest = modeValue === "test";
      if (leftInput) {
        leftInput.value = shouldBlankForTest
          ? ""
          : (parsed.left === null ? "" : formatMetricNumber(parsed.left));
      }
      if (rightInput) {
        rightInput.value = shouldBlankForTest
          ? ""
          : (parsed.right === null ? "" : formatMetricNumber(parsed.right));
      }
      if (symmetryInput) {
        symmetryInput.value = "";
      }

      updateYBalanceDraftValue(card);

      if (leftInput) {
        leftInput.focus();
      }
      return;
    }

    card.removeAttribute("data-metric-ybalance");

    if (isSingleLegSquat) {
      card.setAttribute("data-metric-squat", "true");

      var leftSquatMetric = metric._pairedSideMetrics && metric._pairedSideMetrics.left;
      var rightSquatMetric = metric._pairedSideMetrics && metric._pairedSideMetrics.right;
      var leftSquatParsed = parseNumericMetricValue(leftSquatMetric && leftSquatMetric.metric_value);
      var rightSquatParsed = parseNumericMetricValue(rightSquatMetric && rightSquatMetric.metric_value);
      var shouldBlankForTestSquat = modeValue === "test";

      if (leftInput) {
        leftInput.value = shouldBlankForTestSquat
          ? ""
          : (Number.isFinite(leftSquatParsed) ? formatMetricNumber(leftSquatParsed) : "");
      }
      if (rightInput) {
        rightInput.value = shouldBlankForTestSquat
          ? ""
          : (Number.isFinite(rightSquatParsed) ? formatMetricNumber(rightSquatParsed) : "");
      }
      if (symmetryInput) {
        symmetryInput.value = "";
      }

      updateSingleLegSquatDraftValue(card);

      if (leftInput) {
        leftInput.focus();
      }
      return;
    }

    card.removeAttribute("data-metric-squat");

    if (isEdgePull) {
      card.setAttribute("data-metric-edgepull", "true");

      var leftPairedMetric = metric._pairedSideMetrics && metric._pairedSideMetrics.left;
      var rightPairedMetric = metric._pairedSideMetrics && metric._pairedSideMetrics.right;
      var parsedEdgeValue = parseYBalanceLegValues(metric.metric_value || "");
      var leftParsed = parseNumericMetricValue(leftPairedMetric && leftPairedMetric.metric_value);
      var rightParsed = parseNumericMetricValue(rightPairedMetric && rightPairedMetric.metric_value);
      var shouldBlankForTestEdge = modeValue === "test";

      if (leftInput) {
        leftInput.value = shouldBlankForTestEdge
          ? ""
          : (Number.isFinite(leftParsed)
            ? formatMetricNumber(leftParsed)
            : (parsedEdgeValue.left === null ? "" : formatMetricNumber(parsedEdgeValue.left)));
      }
      if (rightInput) {
        rightInput.value = shouldBlankForTestEdge
          ? ""
          : (Number.isFinite(rightParsed)
            ? formatMetricNumber(rightParsed)
            : (parsedEdgeValue.right === null ? "" : formatMetricNumber(parsedEdgeValue.right)));
      }
      if (symmetryInput) {
        symmetryInput.value = "";
      }

      updateEdgePullDraftValue(card);

      if (leftInput) {
        leftInput.focus();
      }
      return;
    }

    card.removeAttribute("data-metric-edgepull");

    if (isGrant) {
      card.setAttribute("data-metric-grant", "true");

      var parsedGrant = parseGrantLegValues(metric.metric_value || "");
      var shouldBlankForTestGrant = modeValue === "test";
      if (leftInput) {
        leftInput.value = shouldBlankForTestGrant
          ? ""
          : (parsedGrant.left === null ? "" : formatMetricNumber(parsedGrant.left));
      }
      if (rightInput) {
        rightInput.value = shouldBlankForTestGrant
          ? ""
          : (parsedGrant.right === null ? "" : formatMetricNumber(parsedGrant.right));
      }

      updateGrantDraftValue(card);

      if (leftInput) {
        leftInput.focus();
      }
      return;
    }

    card.removeAttribute("data-metric-grant");

    if (valueInput) {
      valueInput.value = modeValue === "test" ? "" : (metric.metric_value || "");
      valueInput.focus();
    }
  }

  function openMetricCardBenchmark(card, metric) {
    if (!card || !metric) {
      return;
    }

    closeAllMetricCardEditors();

    var summary = buildMetricBenchmarkSummary(metric);
    card.classList.add("is-flipped");
    card.setAttribute("data-metric-mode", "benchmark");

    var label = card.querySelector("[data-metric-flip-label]");
    var valueEl = card.querySelector("[data-benchmark-value]");
    var ratingEl = card.querySelector("[data-benchmark-rating]");
    var rangeEl = card.querySelector("[data-benchmark-range]");
    var meaningEl = card.querySelector("[data-benchmark-meaning]");

    if (label) {
      label.textContent = "Benchmarks";
    }
    if (valueEl) {
      valueEl.textContent = summary.currentValue;
    }
    if (ratingEl) {
      ratingEl.textContent = summary.rating;
    }
    if (rangeEl) {
      rangeEl.textContent = summary.range;
    }
    if (meaningEl) {
      meaningEl.textContent = summary.meaning;
    }
  }

  function buildMetricBenchmarkSummary(metric) {
    var metricName = String(metric.metric_name || "");
    var metricUnit = String(metric.metric_unit || "");
    var metricValue = String(metric.metric_value || "").trim();
    var numericValue = parseNumericMetricValue(metricValue);
    var readableValue = metricValue || "Not recorded";
    var valueWithUnit = metricUnit ? readableValue + " " + metricUnit : readableValue;
    var normalizedName = normalizeMetricValue(metricName);

    if (isVerticalJumpMetricName(normalizedName)) {
      return buildVerticalJumpBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (metric && metric._pairedSideMetrics) {
      if (isSingleLegSquatMetricName(normalizedName)) {
        return buildSingleLegSquatPairedBenchmarkSummary(metric, valueWithUnit);
      }
      if (isSingleLegHeelRaiseMetricName(normalizedName)) {
        return buildSingleLegHeelRaisePairedBenchmarkSummary(metric, valueWithUnit);
      }
      if (isSidePlankMetricName(normalizedName)) {
        return buildSidePlankPairedBenchmarkSummary(metric, valueWithUnit);
      }
      if (isYBalanceMetricName(normalizedName)) {
        return buildYBalancePairedBenchmarkSummary(metric, valueWithUnit);
      }
      if (isEdgePullMetricName(normalizedName)) {
        return buildEdgePullPairedBenchmarkSummary(metric, valueWithUnit);
      }
    }

    if (isEdgePullMetricName(normalizedName)) {
      return buildEdgePullBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (isSingleLegSquatMetricName(normalizedName)) {
      return buildSingleLegSquatBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (isSidePlankMetricName(normalizedName)) {
      return buildSidePlankBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (isYBalanceMetricName(normalizedName)) {
      return buildYBalanceReachBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (isMaxHangMetricName(normalizedName)) {
      return buildMaxHangBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (isMaxPullUpMetricName(normalizedName)) {
      return buildMaxPullUpBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (isHanging90DegreeHoldMetricName(normalizedName)) {
      return buildHanging90DegreeHoldBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (isCountermovementPushUpMetricName(normalizedName)) {
      return buildCountermovementPushUpBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (isCkcuestMetricName(normalizedName)) {
      return buildCkcuestBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (isAdaptedGrantFootRaiseMetricName(normalizedName)) {
      return buildAdaptedGrantFootRaiseBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    var definitions = [
      {
        keys: ["vertical jump", "countermovement jump", "cmj"],
        range: "Typical adult field-guide range: <30 developing, 30-45 solid, 45-55 strong, 55+ advanced (cm).",
        classify: function (value) {
          return classifyHigherBetter(value, [30, 45, 55], ["Developing", "Solid", "Strong", "Advanced"]);
        },
        meaning: {
          Developing: "Explosive lower-body power is a limiter. Prioritize jump mechanics, force production, and landing control.",
          Solid: "Baseline power is functional. Continue progressing with plyometrics and unilateral strength.",
          Strong: "Good power profile for most mountain and field sports. Maintain with quality speed-strength work.",
          Advanced: "High explosive profile. Focus on transfer to sport-specific speed and fatigue resistance."
        }
      },
      {
        keys: ["single leg heel raise", "single-leg heel raise", "heel raise"],
        range: "Single-leg heel raise guide: <20 developing, 20-30 functional, 31-40 strong, 40+ advanced (reps).",
        classify: function (value) {
          return classifyHigherBetter(value, [20, 31, 40], ["Developing", "Functional", "Strong", "Advanced"]);
        },
        meaning: {
          Developing: "Calf endurance may limit climbing, running economy, or downhill tolerance.",
          Functional: "Adequate endurance for general training. Build capacity for longer sessions.",
          Strong: "Good lower-leg endurance for repeated loading and terrain variation.",
          Advanced: "Excellent local endurance. Emphasize stiffness and reactive power transfer."
        }
      },
      {
        keys: ["side plank", "hip abduction hold", "plank"],
        range: "Side plank hold guide: <30 developing, 30-45 functional, 46-75 strong, 75+ advanced (seconds).",
        classify: function (value) {
          return classifyHigherBetter(value, [30, 46, 75], ["Developing", "Functional", "Strong", "Advanced"]);
        },
        meaning: {
          Developing: "Lateral trunk endurance is likely limiting. Build anti-rotation and hip control capacity.",
          Functional: "Core endurance supports general movement demands but can improve under fatigue.",
          Strong: "Good trunk endurance for force transfer and frontal-plane control.",
          Advanced: "Excellent trunk stability reserve. Keep quality and progress sport-specific complexity."
        }
      },
      {
        keys: ["y balance", "anterior reach"],
        range: "Anterior reach guide (as % leg length): <65 developing, 65-74 functional, 75-84 strong, 85+ advanced.",
        classify: function (value) {
          return classifyHigherBetter(value, [65, 75, 85], ["Developing", "Functional", "Strong", "Advanced"]);
        },
        meaning: {
          Developing: "Dynamic balance/control may increase compensations under load or fatigue.",
          Functional: "Movement control is serviceable. Build single-leg strength and reach quality.",
          Strong: "Good single-leg control and mobility integration for multi-planar tasks.",
          Advanced: "High dynamic control. Focus on maintaining symmetry and sport transfer."
        }
      },
      {
        keys: ["pull up", "pull-up", "20mm edge pull", "edge pull"],
        range: "Upper-pull benchmark guide: <5 developing, 5-10 functional, 11-15 strong, 16+ advanced (strict reps).",
        classify: function (value) {
          return classifyHigherBetter(value, [5, 11, 16], ["Developing", "Functional", "Strong", "Advanced"]);
        },
        meaning: {
          Developing: "Pulling strength-endurance is likely a bottleneck. Progress with strict volume and hangs.",
          Functional: "Useful baseline pulling capacity. Progress strength with targeted overload.",
          Strong: "Good pulling profile for climbing and upper-body force tasks.",
          Advanced: "High pulling capacity. Keep quality and monitor tendon load tolerance."
        }
      },
      {
        keys: ["resting hr", "resting heart rate"],
        range: "Resting HR guide: >70 elevated, 60-70 average, 50-59 good, <50 highly trained (bpm).",
        classify: function (value) {
          return classifyLowerBetter(value, [70, 60, 50], ["Elevated", "Average", "Good", "Highly Trained"]);
        },
        meaning: {
          Elevated: "Recovery capacity may be limited currently. Review sleep, stress, and aerobic base.",
          Average: "General population range. Consistent aerobic training can improve economy.",
          Good: "Efficient baseline for endurance and recovery demands.",
          "Highly Trained": "Strong aerobic adaptation. Continue balancing intensity and recovery."
        }
      }
    ];

    var definition = definitions.find(function (item) {
      return (item.keys || []).some(function (key) {
        return normalizedName.indexOf(normalizeMetricValue(key)) !== -1;
      });
    });

    var isYBalanceAnterior =
      normalizedName.indexOf("y balance") !== -1 ||
      normalizedName.indexOf("anterior reach") !== -1;

    if (definition && isYBalanceAnterior) {
      return buildYBalanceBenchmarkSummary(metric, definition);
    }

    if (!definition || numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: numericValue === null
          ? "Rating: Add a numeric score to unlock benchmark comparison."
          : "Rating: No direct benchmark mapped yet.",
        range: definition
          ? "Reference: " + definition.range
          : "Reference: Coach-defined metric. Compare against your previous tests and sport demands.",
        meaning: "Meaning: Use trend over time, left/right symmetry, and sport context to judge whether this metric is moving in the right direction."
      };
    }

    var rating = definition.classify(numericValue);
    var meaningText = definition.meaning[rating] || "Use this score with training context and trend direction.";

    return {
      currentValue: "Current score: " + valueWithUnit,
      rating: "Rating: " + rating,
      range: "Reference: " + definition.range,
      meaning: "Meaning: " + meaningText
    };
  }

  function onGenerateMetricSummaryPdf() {
    if (!state.metricsLatest || !state.metricsLatest.length) {
      setMetricsStatus("No metrics available yet. Add test results first.", "info");
      return;
    }

    var JsPdfCtor =
      (window.jspdf && window.jspdf.jsPDF) ||
      window.jsPDF ||
      null;

    if (!JsPdfCtor) {
      setMetricsStatus("PDF library did not load. Refresh and try again.", "error");
      return;
    }

    try {
      var doc = new JsPdfCtor({ unit: "pt", format: "letter" });
      var report = buildMetricSummaryReport(state.metricsLatest);
      var pageWidth = doc.internal.pageSize.getWidth();
      var pageHeight = doc.internal.pageSize.getHeight();
      var margin = 40;
      var maxWidth = pageWidth - margin * 2;
      var y = 48;
      var lineHeight = 14;
      var athleteLabel =
        (state.profile && state.profile.name) ||
        (state.viewUser && state.viewUser.email) ||
        "Athlete";

      function ensureSpace(requiredHeight) {
        if (y + requiredHeight <= pageHeight - margin) {
          return;
        }
        doc.addPage();
        y = margin;
      }

      function writeWrapped(text, fontSize, color) {
        var safeText = String(text || "");
        doc.setFontSize(fontSize || 10);
        if (Array.isArray(color) && color.length === 3) {
          doc.setTextColor(color[0], color[1], color[2]);
        } else {
          doc.setTextColor(33, 33, 33);
        }
        var lines = doc.splitTextToSize(safeText, maxWidth);
        ensureSpace(lines.length * lineHeight + 2);
        doc.text(lines, margin, y);
        y += lines.length * lineHeight;
      }

      doc.setFontSize(18);
      doc.setTextColor(20, 20, 20);
      doc.text("Athlete Testing Summary", margin, y);
      y += 20;

      writeWrapped("Athlete: " + athleteLabel, 11);
      writeWrapped("Generated: " + formatDate(new Date().toISOString()), 11);
      writeWrapped("Metrics Included: " + String(report.rows.length), 11);
      y += 4;

      y += 8;
      writeWrapped("Metric-by-Metric Normative Comparison", 13);

      report.rows.forEach(function (row, index) {
        ensureSpace(120);
        writeWrapped(String(index + 1) + ". " + row.name, 12);
        writeWrapped("Result: " + row.result, 10);
        writeWrapped("Rating: " + row.rating, 10);
        writeWrapped("Normative Reference: " + row.reference, 10);
        writeWrapped("Interpretation: " + row.meaning, 10);
        y += 4;
      });

      y += 8;
      writeWrapped(
        "Note: Normative values are guideposts and should be interpreted with sport demands, injury history, and coaching judgment.",
        9,
        [85, 85, 85]
      );

      var safeAthlete = String(athleteLabel || "athlete")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "athlete";
      var fileName = "metric-summary-" + safeAthlete + ".pdf";
      doc.save(fileName);
      setMetricsStatus("Metric summary PDF generated.", "success");
    } catch (error) {
      setMetricsStatus(
        error && error.message ? error.message : "Failed to generate metric summary PDF.",
        "error"
      );
    }
  }

  function buildMetricSummaryReport(metrics) {
    var rows = (metrics || []).map(function (metric) {
      try {
        var summary = buildMetricBenchmarkSummary(metric);
        var rating = extractBenchmarkLabel(summary && summary.rating, "Rating:");
        var reference = extractBenchmarkLabel(summary && summary.range, "Reference:");
        var meaning = extractBenchmarkLabel(summary && summary.meaning, "Meaning:");
        var result = buildMetricResultLabel(metric);

        return {
          name: String(metric && metric.metric_name || "Metric"),
          result: result,
          rating: rating,
          reference: reference,
          meaning: meaning
        };
      } catch (error) {
        return {
          name: String(metric && metric.metric_name || "Metric"),
          result: buildMetricResultLabel(metric),
          rating: "Unable to classify",
          reference: "Metric-specific benchmark mapping failed.",
          meaning: error && error.message ? error.message : "Unexpected metric processing error."
        };
      }
    });

    return {
      rows: rows
    };
  }

  function extractBenchmarkLabel(text, prefix) {
    var value = String(text || "").trim();
    var labelPrefix = String(prefix || "").trim();
    if (!labelPrefix) {
      return value;
    }
    if (value.indexOf(labelPrefix) === 0) {
      return value.slice(labelPrefix.length).trim();
    }
    return value;
  }

  function buildMetricResultLabel(metric) {
    var value = String(metric && metric.metric_value || "").trim();
    var unit = String(metric && metric.metric_unit || "").trim();
    if (!value) {
      return "Not recorded";
    }
    return unit ? value + " " + unit : value;
  }

  function deriveMetricFlag(metric, rating, resultText) {
    var cleanRating = String(rating || "").trim().toLowerCase();
    if (!resultText || String(resultText).toLowerCase() === "not recorded") {
      return "Missing result";
    }
    if (cleanRating.indexOf("add a numeric") !== -1) {
      return "Result format needs numeric value for normative comparison";
    }
    if (
      cleanRating === "developing" ||
      cleanRating === "elevated" ||
      cleanRating === "below average" ||
      cleanRating === "below beginner"
    ) {
      return "Below normative target";
    }

    var metricName = String(metric && metric.metric_name || "");
    if (isYBalanceMetricName(metricName)) {
      var parsed = parseYBalanceLegValues(String(metric && metric.metric_value || ""));
      if (parsed && parsed.left !== null && parsed.right !== null) {
        var symmetry = calculateSymmetryPercent(parsed.left, parsed.right);
        if (symmetry !== null && symmetry < 95) {
          return "Y Balance asymmetry flagged (" + formatMetricNumber(symmetry) + "% symmetry)";
        }
      }
    }

    return "";
  }

  function isVerticalJumpMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("vertical jump") !== -1 ||
      name.indexOf("countermovement jump") !== -1 ||
      name === "cmj" ||
      name.indexOf(" cmj") !== -1 ||
      name.indexOf("cmj ") !== -1
    );
  }

  function isEdgePullMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("20mm edge pull") !== -1 || 
      name.indexOf("20mm edge hang") !== -1 ||
      name.indexOf("edge pull") !== -1 ||
      name.indexOf("edge hang") !== -1
    );
  }

  function isSingleLegSquatMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("single leg squat") !== -1 ||
      name.indexOf("single-leg squat") !== -1 ||
      name.indexOf("sl squat") !== -1
    );
  }

  function isSingleLegHeelRaiseMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("single leg heel raise") !== -1 ||
      name.indexOf("single-leg heel raise") !== -1 ||
      name.indexOf("heel raise") !== -1
    );
  }

  function isSidePlankMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      (name.indexOf("side plank") !== -1 && name.indexOf("hip abduction") !== -1) ||
      name.indexOf("side plank hip abduction") !== -1 ||
      name.indexOf("plank hold") !== -1
    );
  }

  function isMaxPullUpMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("max pull up") !== -1 ||
      name.indexOf("pull up") !== -1 ||
      name.indexOf("pullup") !== -1 ||
      name.indexOf("pull-up") !== -1
    );
  }

  function isMaxHangMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("max hang") !== -1 ||
      name.indexOf("dead hang") !== -1 ||
      name.indexOf("bar hang") !== -1
    );
  }

  function isHanging90DegreeHoldMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("90 degree hold") !== -1 ||
      name.indexOf("90 degree") !== -1 ||
      name.indexOf("90 degree bent leg") !== -1 ||
      name.indexOf("hanging 90") !== -1 ||
      name.indexOf("hip flexion hold") !== -1
    );
  }

  function isCountermovementPushUpMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("countermovement push-up") !== -1 ||
      name.indexOf("countermovement push up") !== -1 ||
      name.indexOf("cmpu") !== -1 ||
      name.indexOf("power push up") !== -1
    );
  }

  function isCkcuestMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("closed kinetic chain upper extremity stability test") !== -1 ||
      name.indexOf("ckcuest") !== -1 ||
      name.indexOf("shoulder tap test") !== -1 ||
      name.indexOf("shoulder tap") !== -1
    );
  }

  function isAdaptedGrantFootRaiseMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("grant foot raise") !== -1 ||
      name.indexOf("adapted grant") !== -1 ||
      name.indexOf("foot raise") !== -1 ||
      name.indexOf("grant reach") !== -1
    );
  }

  function buildSingleLegSquatBenchmarkSummary(metric, numericValue, valueWithUnit) {
    var sex = resolveAthleteSexForBenchmarks();
    var bands = getSingleLegSquatNormBandForSex(sex);

    if (numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to unlock benchmark comparison.",
        range:
          "Reference: 30-second Single-Leg Squat uses sex-specific rep bands for Developing to Elite.",
        meaning:
          "Meaning: Enter numeric reps from a standardized 30-second test (controlled reps, no hand support, full extension)."
      };
    }

    if (!bands) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men: Developing <12, Recreational 12-16, Trained 17-21, Advanced 22-26, Elite 27+. " +
          "Women: Developing <10, Recreational 10-14, Trained 15-19, Advanced 20-24, Elite 25+.",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply Single-Leg Squat normative values."
      };
    }

    var rating = classifySingleLegSquatReps(numericValue, bands);
    var meaningByRating = {
      Developing: "Single-leg capacity is currently a limiter. Prioritize unilateral strength, control, and tempo quality.",
      Recreational: "Foundational single-leg control is present. Continue progressing depth quality and endurance.",
      Trained: "Solid single-leg strength-endurance profile for most field and mountain demands.",
      Advanced: "High unilateral control and endurance. Emphasize transfer to high-load and reactive tasks.",
      Elite: "Exceptional 30-second single-leg squat capacity. Maintain quality while progressing sport-specific complexity."
    };

    return {
      currentValue: "Current score: " + valueWithUnit,
      rating: "Rating: " + rating,
      range:
        "Reference: " +
        (bands.sex === "male" ? "Men" : "Women") +
        " 30s norms - Developing <" +
        bands.recreationalLow +
        ", Recreational " +
        bands.recreationalLow +
        "-" +
        bands.recreationalHigh +
        ", Trained " +
        bands.trainedLow +
        "-" +
        bands.trainedHigh +
        ", Advanced " +
        bands.advancedLow +
        "-" +
        bands.advancedHigh +
        ", Elite " +
        bands.eliteLow +
        "+ reps.",
      meaning: "Meaning: " + (meaningByRating[rating] || "Interpret with training context and trend direction.")
    };
  }

  function buildSingleLegSquatPairedBenchmarkSummary(metric, valueWithUnit) {
    var pair = metric && metric._pairedSideMetrics ? metric._pairedSideMetrics : null;
    if (!pair || !pair.left || !pair.right) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add both left and right values to unlock benchmark comparison.",
        range:
          "Reference: 30-second Single-Leg Squat uses sex-specific rep bands for Developing to Elite.",
        meaning:
          "Meaning: Enter both left and right rep counts so the card can compare each side against the normative table."
      };
    }

    var left = parseSingleLegSquatLegValues(pair.left.metric_value || "").left;
    var right = parseSingleLegSquatLegValues(pair.right.metric_value || "").right;
    var sex = resolveAthleteSexForBenchmarks();
    var bands = getSingleLegSquatNormBandForSex(sex);

    if (left === null || right === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add both left and right values to unlock benchmark comparison.",
        range:
          "Reference: 30-second Single-Leg Squat uses sex-specific rep bands for Developing to Elite.",
        meaning:
          "Meaning: Enter both left and right rep counts so the card can compare each side against the normative table."
      };
    }

    if (!bands) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men: Developing <12, Recreational 12-16, Trained 17-21, Advanced 22-26, Elite 27+. " +
          "Women: Developing <10, Recreational 10-14, Trained 15-19, Advanced 20-24, Elite 25+.",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply Single-Leg Squat normative values."
      };
    }

    var leftRating = classifySingleLegSquatReps(left, bands);
    var rightRating = classifySingleLegSquatReps(right, bands);
    var lowerLegScore = Math.min(left, right);
    var combinedRating = classifySingleLegSquatReps(lowerLegScore, bands);
    var symmetry = calculateSymmetryPercent(left, right);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";

    return {
      currentValue:
        "Current score: L Leg " +
        formatMetricDisplayValue(left, metric && metric.metric_unit) +
        " | R Leg " +
        formatMetricDisplayValue(right, metric && metric.metric_unit) +
        " | Symmetry " + symmetryText,
      rating: "Rating: " + combinedRating + " (Left: " + leftRating + ", Right: " + rightRating + ")",
      range:
        "Reference: Men: Developing <12, Recreational 12-16, Trained 17-21, Advanced 22-26, Elite 27+. " +
        "Women: Developing <10, Recreational 10-14, Trained 15-19, Advanced 20-24, Elite 25+.",
      meaning:
        "Meaning: Compare left and right squat capacity, then use the lower score for classification. " +
        (symmetry !== null ? (symmetry >= 95 ? "Symmetry is strong." : "Monitor side-to-side asymmetry.") : "")
    };
  }

  function buildSingleLegHeelRaisePairedBenchmarkSummary(metric, valueWithUnit) {
    var pair = metric && metric._pairedSideMetrics ? metric._pairedSideMetrics : null;
    if (!pair || !pair.left || !pair.right) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add both left and right values to unlock benchmark comparison.",
        range:
          "Reference: Single-leg heel raise uses sex-specific rep bands for Developing to Elite.",
        meaning:
          "Meaning: Enter both left and right rep counts so the card can compare each side against the normative table."
      };
    }

    var left = parseSingleLegSquatLegValues(pair.left.metric_value || "").left;
    var right = parseSingleLegSquatLegValues(pair.right.metric_value || "").right;
    var sex = resolveAthleteSexForBenchmarks();
    var bands = getSingleLegHeelRaiseNormBandForSex(sex);

    if (left === null || right === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add both left and right values to unlock benchmark comparison.",
        range:
          "Reference: Single-leg heel raise uses sex-specific rep bands for Developing to Elite.",
        meaning:
          "Meaning: Enter both left and right rep counts so the card can compare each side against the normative table."
      };
    }

    if (!bands) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men: Developing <20, Recreational 20-30, Trained 31-40, Advanced 41-50, Elite 51+. " +
          "Women: Developing <18, Recreational 18-28, Trained 29-38, Advanced 39-48, Elite 49+.",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply Single-Leg Heel Raise normative values."
      };
    }

    var leftRating = classifySingleLegHeelRaiseReps(left, bands);
    var rightRating = classifySingleLegHeelRaiseReps(right, bands);
    var lowerLegScore = Math.min(left, right);
    var combinedRating = classifySingleLegHeelRaiseReps(lowerLegScore, bands);
    var symmetry = calculateSymmetryPercent(left, right);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";

    return {
      currentValue:
        "Current score: L Leg " +
        formatMetricDisplayValue(left, metric && metric.metric_unit) +
        " | R Leg " +
        formatMetricDisplayValue(right, metric && metric.metric_unit) +
        " | Symmetry " + symmetryText,
      rating: "Rating: " + combinedRating + " (Left: " + leftRating + ", Right: " + rightRating + ")",
      range:
        "Reference: Men: Developing <20, Recreational 20-30, Trained 31-40, Advanced 41-50, Elite 51+. " +
        "Women: Developing <18, Recreational 18-28, Trained 29-38, Advanced 39-48, Elite 49+.",
      meaning:
        "Meaning: Compare left and right heel raise capacity, then use the lower score for classification. " +
        (symmetry !== null ? (symmetry >= 95 ? "Symmetry is strong." : "Monitor side-to-side asymmetry.") : "")
    };
  }

  function buildSidePlankPairedBenchmarkSummary(metric, valueWithUnit) {
    var pair = metric && metric._pairedSideMetrics ? metric._pairedSideMetrics : null;
    if (!pair || !pair.left || !pair.right) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add both left and right values to unlock benchmark comparison.",
        range:
          "Reference: Side plank with hip abduction uses sex-specific hold-time bands for Developing to Elite.",
        meaning:
          "Meaning: Enter both left and right hold times so the card can compare each side against the normative table."
      };
    }

    var left = parseNumericMetricValue(pair.left.metric_value || "");
    var right = parseNumericMetricValue(pair.right.metric_value || "");
    var sex = resolveAthleteSexForBenchmarks();
    var bands = getSidePlankNormBandForSex(sex);

    if (left === null || right === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add both left and right values to unlock benchmark comparison.",
        range:
          "Reference: Side plank with hip abduction uses sex-specific hold-time bands for Developing to Elite.",
        meaning:
          "Meaning: Enter both left and right hold times so the card can compare each side against the normative table."
      };
    }

    if (!bands) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men: Developing <20, Recreational 20-35, Trained 35-50, Advanced 50-70, Elite 70+. " +
          "Women: Developing <15, Recreational 15-30, Trained 30-45, Advanced 45-60, Elite 60+.",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply Side Plank + Hip Abduction normative values."
      };
    }

    var leftRating = classifySidePlankHoldTime(left, bands);
    var rightRating = classifySidePlankHoldTime(right, bands);
    var lowerHoldTime = Math.min(left, right);
    var combinedRating = classifySidePlankHoldTime(lowerHoldTime, bands);
    var symmetry = calculateSymmetryPercent(left, right);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";

    return {
      currentValue:
        "Current score: L Leg " +
        formatMetricDisplayValue(left, metric && metric.metric_unit) +
        " | R Leg " +
        formatMetricDisplayValue(right, metric && metric.metric_unit) +
        " | Symmetry " + symmetryText,
      rating: "Rating: " + combinedRating + " (Left: " + leftRating + ", Right: " + rightRating + ")",
      range:
        "Reference: Men: Developing <20, Recreational 20-35, Trained 35-50, Advanced 50-70, Elite 70+. " +
        "Women: Developing <15, Recreational 15-30, Trained 30-45, Advanced 45-60, Elite 60+.",
      meaning:
        "Meaning: Compare left and right side plank hold capacity, then use the lower hold time for classification. " +
        (symmetry !== null ? (symmetry >= 95 ? "Symmetry is strong." : "Monitor side-to-side asymmetry.") : "")
    };
  }

  function buildYBalancePairedBenchmarkSummary(metric, valueWithUnit) {
    var pair = metric && metric._pairedSideMetrics ? metric._pairedSideMetrics : null;
    if (!pair || !pair.left || !pair.right) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add both left and right values to unlock benchmark comparison.",
        range:
          "Reference: Y Balance anterior reach uses sex-specific normalized reach categories (% leg length) for Developing to Elite Control.",
        meaning:
          "Meaning: Enter both left and right values to evaluate side-to-side balance and normative level."
      };
    }

    var leftRaw = parseNumericMetricValue(pair.left.metric_value || "");
    var rightRaw = parseNumericMetricValue(pair.right.metric_value || "");
    var unit = normalizeMetricValue(metric && metric.metric_unit);
    var sex = resolveAthleteSexForBenchmarks();
    var band = getYBalanceNormBandForSex(sex);
    var heightCm = getAthleteHeightCmForBenchmarks();
    var legLengthCm = heightCm ? calculateLegLengthCm(heightCm) : null;

    function toNormalizedPercent(rawValue) {
      if (!Number.isFinite(rawValue)) {
        return null;
      }
      if (unit.indexOf("%") !== -1 || !unit) {
        return rawValue;
      }
      if (Number.isFinite(legLengthCm) && legLengthCm > 0) {
        var reachCm = convertLengthToCm(rawValue, unit);
        if (Number.isFinite(reachCm)) {
          return (reachCm / legLengthCm) * 100;
        }
      }
      return null;
    }

    var leftPercent = toNormalizedPercent(leftRaw);
    var rightPercent = toNormalizedPercent(rightRaw);
    if (leftPercent === null || rightPercent === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing data for leg-length normalization.",
        range:
          "Reference: Y Balance norms are based on normalized anterior reach (% leg length).",
        meaning:
          "Meaning: Enter athlete height so leg length can be estimated (height x 0.53), or store values directly as % leg length."
      };
    }

    if (!band) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men: Developing <60%, Recreational 60-65%, Trained 65-72%, Advanced 72-78%, Elite >78%. " +
          "Women: Developing <65%, Recreational 65-70%, Trained 70-77%, Advanced 77-83%, Elite >83%.",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply Y Balance normative values."
      };
    }

    var leftRating = classifyYBalanceReach(leftPercent, band);
    var rightRating = classifyYBalanceReach(rightPercent, band);
    var lowerReachPercent = Math.min(leftPercent, rightPercent);
    var combinedRating = classifyYBalanceReach(lowerReachPercent, band);
    var symmetry = calculateSymmetryPercent(leftPercent, rightPercent);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";

    return {
      currentValue:
        "Current score: L Leg " +
        formatMetricDisplayValue(leftRaw, metric && metric.metric_unit) +
        " | R Leg " +
        formatMetricDisplayValue(rightRaw, metric && metric.metric_unit) +
        " | Symmetry " + symmetryText,
      rating: "Rating: " + combinedRating + " (Left: " + leftRating + ", Right: " + rightRating + ")",
      range:
        "Reference: " +
        (band.sex === "male" ? "Men" : "Women") +
        " anterior reach norms - Developing <" +
        band.developingHigh +
        "%, Recreational " +
        band.recreationalLow +
        "-" +
        band.recreationalHigh +
        "%, Trained " +
        band.trainedLow +
        "-" +
        band.trainedHigh +
        "%, Advanced " +
        band.advancedLow +
        "-" +
        band.advancedHigh +
        "%, Elite >" +
        band.eliteLow +
        "%.",
      meaning:
        "Meaning: Compare left and right normalized reach, then use the lower side for classification. " +
        (symmetry !== null ? (symmetry >= 95 ? "Symmetry is strong." : "Monitor side-to-side asymmetry.") : "")
    };
  }

  function buildEdgePullPairedBenchmarkSummary(metric, valueWithUnit) {
    var pair = metric && metric._pairedSideMetrics ? metric._pairedSideMetrics : null;
    if (!pair || !pair.left || !pair.right) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add both left and right values to unlock benchmark comparison.",
        range:
          "Reference: 20mm Edge Pull (single-arm) uses sex-specific relative load ranges (% bodyweight).",
        meaning:
          "Meaning: Enter both left and right hand edge pull values so the card can compare each side against the normative table."
      };
    }

    var leftRaw = parseNumericMetricValue(pair.left.metric_value || "");
    var rightRaw = parseNumericMetricValue(pair.right.metric_value || "");
    var unit = normalizeMetricValue(metric && metric.metric_unit);
    var sex = resolveAthleteSexForBenchmarks();
    var band = getEdgePullNormBandForSex(sex);
    var weightKg = getAthleteWeightKgForBenchmarks();

    if (leftRaw === null || rightRaw === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add both left and right values to unlock benchmark comparison.",
        range:
          "Reference: 20mm Edge Pull (single-arm) uses sex-specific relative load ranges (% bodyweight).",
        meaning:
          "Meaning: Enter both left and right hand edge pull values so the card can compare each side against the normative table."
      };
    }

    if (!band) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men - Developing <0.6x BW, Recreational 0.6-0.75x, Trained 0.75-0.9x, Advanced 0.9-1.05x, Elite >1.05x. " +
          "Women - Developing <0.55x BW, Recreational 0.55-0.7x, Trained 0.7-0.85x, Advanced 0.85-1.0x, Elite >1.0x (single-arm hang).",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply the 20mm Edge Pull normative table."
      };
    }

    function toRelativeLoad(value) {
      if (!Number.isFinite(value)) {
        return null;
      }

      if (unit.indexOf("%") !== -1) {
        return value;
      }

      if (!Number.isFinite(weightKg) || weightKg <= 0) {
        return null;
      }

      var loadKg = convertMassToKg(value, unit);
      if (!Number.isFinite(loadKg)) {
        return null;
      }

      return (loadKg / weightKg) * 100;
    }

    var leftRelative = toRelativeLoad(leftRaw);
    var rightRelative = toRelativeLoad(rightRaw);

    if (leftRelative === null || rightRelative === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing bodyweight for relative-load comparison.",
        range:
          "Reference: Relative load is calculated as (edge pull load / bodyweight) x 100.",
        meaning:
          "Meaning: Enter athlete weight in profile and record edge pull in kg or lbs (or store values directly as %BW)."
      };
    }

    var leftRating = classifyEdgePullRelativeLoad(leftRelative, band);
    var rightRating = classifyEdgePullRelativeLoad(rightRelative, band);
    var lowerSideRelative = Math.min(leftRelative, rightRelative);
    var combinedRating = classifyEdgePullRelativeLoad(lowerSideRelative, band);
    var symmetry = calculateSymmetryPercent(leftRelative, rightRelative);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";

    return {
      currentValue:
        "Current score: L Hand " +
        formatMetricDisplayValue(leftRaw, metric && metric.metric_unit) +
        " | R Hand " +
        formatMetricDisplayValue(rightRaw, metric && metric.metric_unit) +
        " | Symmetry " + symmetryText,
      rating: "Rating: " + combinedRating + " (Left: " + leftRating + ", Right: " + rightRating + ")",
      range:
        "Reference: " +
        (band.sex === "male"
          ? "Men"
          : "Women") +
        " Developing <" + band.developingHigh + "% (" + formatMetricNumber(band.developingHigh / 100) + "x BW) | Recreational " +
        band.recreationalLow + "-" + band.recreationalHigh + "% (" + formatMetricNumber(band.recreationalLow / 100) + "-" + formatMetricNumber(band.recreationalHigh / 100) + "x) | Trained " +
        band.trainedLow + "-" + band.trainedHigh + "% (" + formatMetricNumber(band.trainedLow / 100) + "-" + formatMetricNumber(band.trainedHigh / 100) + "x) | Advanced " +
        band.advancedLow + "-" + band.advancedHigh + "% (" + formatMetricNumber(band.advancedLow / 100) + "-" + formatMetricNumber(band.advancedHigh / 100) + "x) | Elite >" + band.eliteLow + "% (" + formatMetricNumber(band.eliteLow / 100) + "x).",
      meaning:
        "Meaning: Compare left and right hand relative edge-force output, then use the lower side for classification. " +
        (symmetry !== null ? (symmetry >= 95 ? "Symmetry is strong." : "Monitor side-to-side asymmetry.") : "")
    };
  }

  function classifySingleLegSquatReps(reps, bands) {
    if (!Number.isFinite(reps) || !bands) {
      return "Needs Data";
    }
    if (reps < bands.recreationalLow) {
      return "Developing";
    }
    if (reps <= bands.recreationalHigh) {
      return "Recreational";
    }
    if (reps <= bands.trainedHigh) {
      return "Trained";
    }
    if (reps <= bands.advancedHigh) {
      return "Advanced";
    }
    return "Elite";
  }

  function getSingleLegSquatNormBandForSex(sex) {
    if (!sex) {
      return null;
    }

    var table = {
      male: {
        sex: "male",
        recreationalLow: 12,
        recreationalHigh: 16,
        trainedLow: 17,
        trainedHigh: 21,
        advancedLow: 22,
        advancedHigh: 26,
        eliteLow: 27
      },
      female: {
        sex: "female",
        recreationalLow: 10,
        recreationalHigh: 14,
        trainedLow: 15,
        trainedHigh: 19,
        advancedLow: 20,
        advancedHigh: 24,
        eliteLow: 25
      }
    };

    return table[sex] || null;
  }

  function classifySingleLegHeelRaiseReps(reps, bands) {
    if (!Number.isFinite(reps) || !bands) {
      return "Needs Data";
    }
    if (reps < bands.recreationalLow) {
      return "Developing";
    }
    if (reps <= bands.recreationalHigh) {
      return "Recreational";
    }
    if (reps <= bands.trainedHigh) {
      return "Trained";
    }
    if (reps <= bands.advancedHigh) {
      return "Advanced";
    }
    return "Elite";
  }

  function getSingleLegHeelRaiseNormBandForSex(sex) {
    if (!sex) {
      return null;
    }

    var table = {
      male: {
        sex: "male",
        recreationalLow: 20,
        recreationalHigh: 30,
        trainedLow: 31,
        trainedHigh: 40,
        advancedLow: 41,
        advancedHigh: 50,
        eliteLow: 51
      },
      female: {
        sex: "female",
        recreationalLow: 18,
        recreationalHigh: 28,
        trainedLow: 29,
        trainedHigh: 38,
        advancedLow: 39,
        advancedHigh: 48,
        eliteLow: 49
      }
    };

    return table[sex] || null;
  }

  function classifySidePlankHoldTime(seconds, band) {
    if (!Number.isFinite(seconds) || !band) {
      return "Needs Data";
    }
    if (seconds < band.developingHigh) {
      return "Developing";
    }
    if (seconds <= band.recreationalHigh) {
      return "Recreational";
    }
    if (seconds <= band.trainedHigh) {
      return "Trained";
    }
    if (seconds <= band.advancedHigh) {
      return "Advanced";
    }
    return "Elite";
  }

  function getSidePlankNormBandForSex(sex) {
    if (!sex) {
      return null;
    }

    var table = {
      male: {
        sex: "male",
        developingHigh: 20,
        recreationalLow: 20,
        recreationalHigh: 35,
        trainedLow: 35,
        trainedHigh: 50,
        advancedLow: 50,
        advancedHigh: 70,
        eliteLow: 70
      },
      female: {
        sex: "female",
        developingHigh: 15,
        recreationalLow: 15,
        recreationalHigh: 30,
        trainedLow: 30,
        trainedHigh: 45,
        advancedLow: 45,
        advancedHigh: 60,
        eliteLow: 60
      }
    };

    return table[sex] || null;
  }

  function classifyMaxPullUpReps(reps, band) {
    if (!Number.isFinite(reps) || !band) {
      return "Needs Data";
    }
    if (reps < band.recreationalLow) {
      return "Developing";
    }
    if (reps <= band.recreationalHigh) {
      return "Recreational";
    }
    if (reps <= band.trainedHigh) {
      return band.trainedLabel || "Trained";
    }
    if (reps <= band.advancedHigh) {
      return "Advanced";
    }
    return "Elite";
  }

  function getMaxPullUpNormBandForSex(sex) {
    if (!sex) {
      return null;
    }

    var isClimber = isAthleteClimber();

    if (isClimber) {
      var climberTable = {
        male: {
          sex: "male",
          sport: "climber",
          recreationalLow: 8,
          recreationalHigh: 12,
          trainedLow: 12,
          trainedHigh: 18,
          trainedLabel: "Strong Intermediate",
          advancedLow: 18,
          advancedHigh: 25,
          eliteLow: 25
        },
        female: {
          sex: "female",
          sport: "climber",
          recreationalLow: 3,
          recreationalHigh: 6,
          trainedLow: 6,
          trainedHigh: 10,
          trainedLabel: "Strong Intermediate",
          advancedLow: 10,
          advancedHigh: 15,
          eliteLow: 15
        }
      };
      return climberTable[sex] || null;
    }

    var generalTable = {
      male: {
        sex: "male",
        sport: "general",
        recreationalLow: 4,
        recreationalHigh: 7,
        trainedLow: 8,
        trainedHigh: 12,
        trainedLabel: "Trained",
        advancedLow: 13,
        advancedHigh: 18,
        eliteLow: 19
      },
      female: {
        sex: "female",
        sport: "general",
        recreationalLow: 1,
        recreationalHigh: 3,
        trainedLow: 4,
        trainedHigh: 7,
        trainedLabel: "Trained",
        advancedLow: 8,
        advancedHigh: 12,
        eliteLow: 13
      }
    };

    return generalTable[sex] || null;
  }

  function isAthleteClimber() {
    var profile = state.profile || {};
    var sport = String(profile.sport || "").toLowerCase();
    if (sport.indexOf("climb") !== -1) {
      return true;
    }

    var sports = profile.sports || [];
    if (Array.isArray(sports)) {
      for (var i = 0; i < sports.length; i++) {
        if (String(sports[i] || "").toLowerCase().indexOf("climb") !== -1) {
          return true;
        }
      }
    }

    var overview = getProfileSportOverview(profile);
    if (overview && overview.climbing) {
      return true;
    }

    return false;
  }

  function buildMaxPullUpBenchmarkSummary(metric, numericValue, valueWithUnit) {
    var sex = resolveAthleteSexForBenchmarks();
    var band = getMaxPullUpNormBandForSex(sex);

    if (numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to unlock benchmark comparison.",
        range:
          "Reference: Max Pull Up uses sex-specific rep bands for Developing to Elite (general or climbing-specific norms).",
        meaning:
          "Meaning: Enter max reps from a standardized pull-up test. Climbing athletes will see climbing-specific benchmarks if sport is set to climbing."
      };
    }

    if (!band) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men General: Developing 0-3, Recreational 4-7, Trained 8-12, Advanced 13-18, Elite 19+. " +
          "Women General: Developing 0, Recreational 1-3, Trained 4-7, Advanced 8-12, Elite 13+. " +
          "(Climbing norms available if sport includes climbing.)",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply Max Pull Up normative values."
      };
    }

    var rating = classifyMaxPullUpReps(numericValue, band);
    var isClimber = band.sport === "climber";
    var sportLabel = isClimber ? "Climber" : "General Athlete";
    var meaningByRating = {
      Developing: "Pull-up capacity is limited. Build foundational upper-body strength and scapular stability with assisted progressions.",
      Recreational: "Foundational pull-up strength is present. Continue gradual load increases with quality form focus.",
      "Trained": "Solid pull-up capacity for general fitness. Progress with added load or volume variation.",
      "Strong Intermediate": "Strong intermediate climbing pull-up profile. Emphasize power endurance and dynamic lock-off strength.",
      Advanced: "High pull-up strength baseline. Continue progressive overload while maintaining movement quality.",
      Elite: "Exceptional pull-up performance. Focus on sport-specific transfer and maintaining quality under fatigue."
    };

    var minReps = band.recreationalLow;
    var maxReps = band.advancedHigh;

    return {
      currentValue: "Current score: " + valueWithUnit,
      rating: "Rating: " + rating,
      range:
        "Reference: " +
        sportLabel +
        " (" +
        (band.sex === "male" ? "Men" : "Women") +
        ") - Developing <" +
        minReps +
        ", Recreational " +
        band.recreationalLow +
        "-" +
        band.recreationalHigh +
        ", " +
        (band.trainedLabel || "Trained") +
        " " +
        band.trainedLow +
        "-" +
        band.trainedHigh +
        ", Advanced " +
        band.advancedLow +
        "-" +
        band.advancedHigh +
        ", Elite " +
        band.eliteLow +
        "+ reps.",
      meaning: "Meaning: " + (meaningByRating[rating] || "Interpret with training context and trend direction.")
    };
  }

  function buildMaxHangBenchmarkSummary(metric, numericValue, valueWithUnit) {
    if (numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to unlock benchmark comparison.",
        range:
          "Reference: Bodyweight Dead Hang norms - Beginner 10-30s, Intermediate 30-90s, Advanced 90-150s, Elite 3-5 minutes.",
        meaning:
          "Meaning: Enter max dead-hang time in seconds from a standardized bodyweight test on a straight bar."
      };
    }

    var rating = classifyMaxHangTime(numericValue);
    var meaningByRating = {
      "Below Beginner": "Foundational hang capacity is limited. Build grip endurance and tendon tolerance progressively.",
      Beginner: "Baseline hang endurance is present. Continue progressive dead-hang exposure and recovery management.",
      Intermediate: "Solid hang endurance profile. Progress toward longer isometric tolerance and climbing-specific transfer.",
      Advanced: "High dead-hang endurance. Emphasize quality under fatigue and route-specific grip demands.",
      Elite: "Exceptional dead-hang endurance. Focus on performance transfer, resilience, and maintaining tissue health."
    };

    return {
      currentValue: "Current score: " + valueWithUnit,
      rating: "Rating: " + rating,
      range:
        "Reference: Bodyweight Dead Hang norms - Beginner 10-30s, Intermediate 30-90s, Advanced 90-150s, Elite 180-300s (3-5 min).",
      meaning: "Meaning: " + (meaningByRating[rating] || "Interpret with training context and trend direction.")
    };
  }

  function classifyMaxHangTime(seconds) {
    if (!Number.isFinite(seconds)) {
      return "Needs Data";
    }
    if (seconds < 10) {
      return "Below Beginner";
    }
    if (seconds <= 30) {
      return "Beginner";
    }
    if (seconds <= 90) {
      return "Intermediate";
    }
    if (seconds <= 150) {
      return "Advanced";
    }
    return "Elite";
  }

  function classifyHanging90DegreeHoldTime(seconds, band) {
    if (!Number.isFinite(seconds) || !band) {
      return "Needs Data";
    }
    if (seconds < band.developingHigh) {
      return "Developing";
    }
    if (seconds <= band.recreationalHigh) {
      return "Recreational";
    }
    if (seconds <= band.trainedHigh) {
      return "Trained";
    }
    if (seconds <= band.advancedHigh) {
      return "Advanced";
    }
    return "Elite";
  }

  function getHanging90DegreeNormBandForSex(sex) {
    if (!sex) {
      return null;
    }

    var table = {
      male: {
        sex: "male",
        developingHigh: 15,
        recreationalLow: 15,
        recreationalHigh: 30,
        trainedLow: 30,
        trainedHigh: 50,
        advancedLow: 50,
        advancedHigh: 75,
        eliteLow: 75
      },
      female: {
        sex: "female",
        developingHigh: 10,
        recreationalLow: 10,
        recreationalHigh: 25,
        trainedLow: 25,
        trainedHigh: 40,
        advancedLow: 40,
        advancedHigh: 60,
        eliteLow: 60
      }
    };

    return table[sex] || null;
  }

  function buildHanging90DegreeHoldBenchmarkSummary(metric, numericValue, valueWithUnit) {
    var sex = resolveAthleteSexForBenchmarks();
    var band = getHanging90DegreeNormBandForSex(sex);

    if (numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to unlock benchmark comparison.",
        range:
          "Reference: Hanging 90° Hip-Flexion Hold uses sex-specific hold-time bands (seconds) for Developing to Elite.",
        meaning:
          "Meaning: Enter hold time in seconds from a standardized Hanging 90° test (hips flexed to 90°, core engaged until form breakdown)."
      };
    }

    if (!band) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men: Developing <15, Recreational 15-30, Trained 30-50, Advanced 50-75, Elite 75+. " +
          "Women: Developing <10, Recreational 10-25, Trained 25-40, Advanced 40-60, Elite 60+ (all in seconds).",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply Hanging 90° Hip-Flexion Hold normative values."
      };
    }

    var rating = classifyHanging90DegreeHoldTime(numericValue, band);
    var meaningByRating = {
      Developing: "Hip flexor and core endurance is limited. Build abdominal strength and hip flexor stamina with progressive holds and variations.",
      Recreational: "Foundational core and hip flexor endurance is present. Continue progressing hold time with controlled movement.",
      Trained: "Solid core-hip integration and endurance. Progress with added challenge (leg raises, tempo variation).",
      Advanced: "High hip flexor endurance and core stability. Emphasize quality and transfer to sport-specific demands.",
      Elite: "Exceptional Hanging 90° hold capacity. Maintain quality while progressing sport-specific core integration."
    };

    return {
      currentValue: "Current score: " + valueWithUnit,
      rating: "Rating: " + rating,
      range:
        "Reference: " +
        (band.sex === "male" ? "Men" : "Women") +
        " hold-time norms - Developing <" +
        band.developingHigh +
        "s, Recreational " +
        band.recreationalLow +
        "-" +
        band.recreationalHigh +
        "s, Trained " +
        band.trainedLow +
        "-" +
        band.trainedHigh +
        "s, Advanced " +
        band.advancedLow +
        "-" +
        band.advancedHigh +
        "s, Elite " +
        band.eliteLow +
        "+ seconds.",
      meaning: "Meaning: " + (meaningByRating[rating] || "Interpret with training context and trend direction.")
    };
  }

  function buildCountermovementPushUpBenchmarkSummary(metric, numericValue, valueWithUnit) {
    if (numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to log CMPU performance.",
        range:
          "Reference: CMPU is primarily an explosive power assessment using stretch-shortening cycle mechanics; use consistent setup and compare trend over time.",
        meaning:
          "Meaning: The Countermovement Push-Up (CMPU) is a plyometric upper-extremity power test. Perform a rapid, controlled descent from plank, then immediately reverse into a maximal-effort explosive push (often with hand lift-off) to maximize vertical velocity."
      };
    }

    return {
      currentValue: "Current score: " + valueWithUnit,
      rating: "Rating: Performance recorded. Track repeated-test trend and output quality.",
      range:
        "Reference: CMPU assesses upper-limb neuromuscular force-time qualities (peak force, velocity, and power output) under plyometric SSC demand.",
      meaning:
        "Meaning: Use this as an explosive upper-extremity power marker: rapid controlled lowering followed by immediate maximal push. Keep technique and testing setup standardized to make sessions comparable."
    };
  }

  function buildCkcuestBenchmarkSummary(metric, numericValue, valueWithUnit) {
    var sex = resolveAthleteSexForBenchmarks();
    var rating = "Needs Data";

    if (Number.isFinite(numericValue)) {
      if (numericValue < 21) {
        rating = "Below Passing";
      } else if (numericValue < 26) {
        rating = "Passing";
      } else {
        rating = "Strong";
      }
    }

    var sexNormLine =
      sex === "male"
        ? "Sex-specific context: men in some athletic cohorts average around 26 touches."
        : sex === "female"
        ? "Sex-specific context: women in some athletic cohorts average around 22 touches."
        : "Sex-specific context: reported athletic averages are ~26 touches (men) and ~22 touches (women).";

    if (numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score (average touches across trials) to benchmark CKCUEST.",
        range:
          "Reference: CKCUEST is a 15-second shoulder stability/endurance test; >=21 touches is commonly used as a pass threshold in many contexts.",
        meaning:
          "Meaning: Closed Kinetic Chain Upper Extremity Stability Test (CKCUEST): from push-up/plank position with hands on two tape marks 36 inches (91 cm) apart, alternate opposite-hand taps for max touches in 15 seconds. Use one warm-up then three 15-second trials with 45-60 seconds rest; score is average touches."
      };
    }

    return {
      currentValue: "Current score: " + valueWithUnit,
      rating: "Rating: " + rating,
      range:
        "Reference: CKCUEST protocol uses 3 scored 15-second trials (after warm-up), 45-60s rest, hands 36 in / 91 cm apart. " +
        "Common pass benchmark is >=21 touches. " +
        sexNormLine,
      meaning:
        "Meaning: CKCUEST measures shoulder stability, strength, and endurance for return-to-sport decision-making (especially overhead athletes). Consider averaging three trials and optionally normalizing by athlete height or deriving power from bodyweight."
    };
  }

  function classifyAdaptedGrantFootRaise(normalizedScore) {
    if (!Number.isFinite(normalizedScore)) {
      return "Needs Data";
    }
    if (normalizedScore < 0.90) {
      return "Novice";
    }
    if (normalizedScore < 0.97) {
      return "Intermediate";
    }
    if (normalizedScore < 1.00) {
      return "Advanced";
    }
    return "Elite";
  }

  function getAdaptedGrantFootRaiseNormBand() {
    return {
      noviceCm: 103.7,
      intermediateLow: 108,
      intermediateHigh: 110,
      advancedLow: 111,
      advancedHigh: 113,
      eliteCm: 114,
      noviceNormalized: 0.90,
      intermediateNormalized: 0.97,
      advancedNormalized: 1.00,
      eliteNormalized: 1.01
    };
  }

  function calculateLegLengthCm(heightCm) {
    if (!Number.isFinite(heightCm) || heightCm <= 0) {
      return null;
    }
    return heightCm * 0.53;
  }

  function buildAdaptedGrantFootRaiseBenchmarkSummary(metric, numericValue, valueWithUnit) {
    var heightCm = getAthleteHeightCmForBenchmarks();
    var legLengthCm = heightCm ? calculateLegLengthCm(heightCm) : null;
    var unit = normalizeMetricValue(metric && metric.metric_unit);
    var reachCm = numericValue === null ? null : convertLengthToCm(numericValue, unit);
    var normalizedScore = null;

     var metricValue = String(metric && metric.metric_value || "").trim();
     var isBilateral = metricValue.indexOf("|") !== -1;
     var parsedGrant = isBilateral ? parseGrantLegValues(metricValue) : { left: null, right: null };

     if (isBilateral && (parsedGrant.left !== null || parsedGrant.right !== null)) {
       // Handle bilateral leg values
       var leftReachCm = parsedGrant.left !== null ? convertLengthToCm(parsedGrant.left, unit) : null;
       var rightReachCm = parsedGrant.right !== null ? convertLengthToCm(parsedGrant.right, unit) : null;

       if (legLengthCm === null) {
         return {
           currentValue: "Current score: " + valueWithUnit,
           rating: "Rating: Missing athlete height for normalization.",
           range:
             "Reference: Climbing norms (normalized): Novice ~104cm, Intermediate ~108-110cm, Advanced ~111-113cm, Elite ~114cm. " +
             "Normalized using leg length (height × 0.53).",
           meaning:
             "Meaning: Set athlete height (height_cm) in profile. Normalized score = Foot Raise Height ÷ Leg Length. Taller athletes naturally reach higher but normalized values compare fairly."
         };
       }

       var leftNormalized = leftReachCm !== null ? leftReachCm / legLengthCm : null;
       var rightNormalized = rightReachCm !== null ? rightReachCm / legLengthCm : null;
       var leftRating = leftNormalized !== null ? classifyAdaptedGrantFootRaise(leftNormalized) : "—";
       var rightRating = rightNormalized !== null ? classifyAdaptedGrantFootRaise(rightNormalized) : "—";

       return {
         currentValue:
           "Current score: " +
           valueWithUnit +
           " | L Normalized: " +
           (leftNormalized ? formatMetricNumber(leftNormalized) : "—") +
           " | R Normalized: " +
           (rightNormalized ? formatMetricNumber(rightNormalized) : "—"),
         rating: "Ratings - Left: " + leftRating + ", Right: " + rightRating,
         range:
           "Reference: Climbing norms (normalized by leg length) - Novice <0.90, Intermediate 0.90-0.97, Advanced 0.97-1.00, Elite 1.00+. " +
           "Raw norms: Novice ~104cm, Intermediate ~108-110cm, Advanced ~111-113cm, Elite 114cm.",
         meaning:
           "Meaning: Bilateral tracking reveals leg asymmetry. Compare L vs R normalized scores to identify imbalances. " +
           "Use trend over time and asymmetry data to guide training."
       };
     }

     if (reachCm !== null && legLengthCm !== null) {
       normalizedScore = reachCm / legLengthCm;
    }

    if (reachCm === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to unlock benchmark comparison.",
        range:
          "Reference: Adapted Grant Foot Raise uses leg-length normalized climbing norms (Novice to Elite). " +
          "Normalization formula: Reach Height ÷ Leg Length.",
        meaning:
          "Meaning: Enter foot raise height in cm or inches. Athlete height is required for normalization. Climbing-specific norms will apply."
      };
    }

    if (!legLengthCm) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete height for normalization.",
        range:
          "Reference: Climbing norms (normalized): Novice ~104cm, Intermediate ~108-110cm, Advanced ~111-113cm, Elite ~114cm. " +
          "Normalized using leg length (height × 0.53).",
        meaning:
          "Meaning: Set athlete height (height_cm) in profile. Normalized score = Foot Raise Height ÷ Leg Length. Taller athletes naturally reach higher but normalized values compare fairly."
      };
    }

    var band = getAdaptedGrantFootRaiseNormBand();
    var rating = classifyAdaptedGrantFootRaise(normalizedScore);
    var meaningByRating = {
      Novice: "Reaching baseline for climbing. Build leg length awareness and work on reach mechanics with flexibility training.",
      Intermediate: "Solid reaching capacity for intermediate climbing demands. Progress with targeted hip mobility and reach-specific strength.",
      Advanced: "High reaching capacity for advanced climbing movement. Emphasize locked-off reach and dynamic positioning.",
      Elite: "Exceptional leg reach for elite climbing. Maintain quality and refine micro-adjustments for maximal reach utilization."
    };

    return {
      currentValue:
        "Current score: " +
        valueWithUnit +
        " | Normalized: " +
        (normalizedScore ? formatMetricNumber(normalizedScore) : "—"),
      rating: "Rating: " + rating,
      range:
        "Reference: Climbing norms (normalized by leg length) - Novice <0.90, Intermediate 0.90-0.97, Advanced 0.97-1.00, Elite 1.00+. " +
        "Raw norms: Novice ~104cm, Intermediate ~108-110cm, Advanced ~111-113cm, Elite 114cm.",
      meaning:
        "Meaning: " +
        (meaningByRating[rating] || "Interpret with training context and trend direction.") +
        " Normalized scoring accounts for natural height variation."
    };
  }

  function buildSidePlankBenchmarkSummary(metric, numericValue, valueWithUnit) {
    var sex = resolveAthleteSexForBenchmarks();
    var band = getSidePlankNormBandForSex(sex);

    if (numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to unlock benchmark comparison.",
        range:
          "Reference: Side Plank + Hip Abduction uses sex-specific hold-time bands (seconds) for Developing to Elite.",
        meaning:
          "Meaning: Enter hold time in seconds from a standardized Side Plank with Hip Abduction test (seconds until form breakdown)."
      };
    }

    if (!band) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men: Developing <20, Recreational 20-35, Trained 35-50, Advanced 50-70, Elite 70+. " +
          "Women: Developing <15, Recreational 15-30, Trained 30-45, Advanced 45-60, Elite 60+ (all in seconds).",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply Side Plank + Hip Abduction normative values."
      };
    }

    var rating = classifySidePlankHoldTime(numericValue, band);
    var meaningByRating = {
      Developing: "Lateral trunk endurance with hip control is limited. Build core anti-rotation strength and hip stabilizer capacity.",
      Recreational: "Foundational lateral stability is present. Continue progressing hold time and adding dynamic hip movements.",
      Trained: "Solid lateral core endurance for most mountain and field demands. Progress load or complexity.",
      Advanced: "High lateral stability and hip control endurance. Emphasize reactive transfer and fatigue resistance.",
      Elite: "Exceptional Side Plank + Hip Abduction capacity. Maintain quality while progressing sport-specific integration."
    };

    return {
      currentValue: "Current score: " + valueWithUnit,
      rating: "Rating: " + rating,
      range:
        "Reference: " +
        (band.sex === "male" ? "Men" : "Women") +
        " hold-time norms - Developing <" +
        band.developingHigh +
        "s, Recreational " +
        band.recreationalLow +
        "-" +
        band.recreationalHigh +
        "s, Trained " +
        band.trainedLow +
        "-" +
        band.trainedHigh +
        "s, Advanced " +
        band.advancedLow +
        "-" +
        band.advancedHigh +
        "s, Elite " +
        band.eliteLow +
        "+ seconds.",
      meaning: "Meaning: " + (meaningByRating[rating] || "Interpret with training context and trend direction.")
    };
  }

  function classifyYBalanceReach(percentageReach, band) {
    if (!Number.isFinite(percentageReach) || !band) {
      return "Needs Data";
    }
    if (percentageReach < band.developingHigh) {
      return "Developing";
    }
    if (percentageReach <= band.recreationalHigh) {
      return "Recreational";
    }
    if (percentageReach <= band.trainedHigh) {
      return "Trained";
    }
    if (percentageReach <= band.advancedHigh) {
      return "Advanced";
    }
    return "Elite Control";
  }

  function getYBalanceNormBandForSex(sex) {
    if (!sex) {
      return null;
    }

    var table = {
      male: {
        sex: "male",
        developingHigh: 60,
        recreationalLow: 60,
        recreationalHigh: 65,
        trainedLow: 65,
        trainedHigh: 72,
        advancedLow: 72,
        advancedHigh: 78,
        eliteLow: 78
      },
      female: {
        sex: "female",
        developingHigh: 65,
        recreationalLow: 65,
        recreationalHigh: 70,
        trainedLow: 70,
        trainedHigh: 77,
        advancedLow: 77,
        advancedHigh: 83,
        eliteLow: 83
      }
    };

    return table[sex] || null;
  }

  function buildYBalanceReachBenchmarkSummary(metric, numericValue, valueWithUnit) {
    var sex = resolveAthleteSexForBenchmarks();
    var band = getYBalanceNormBandForSex(sex);
    var unit = normalizeMetricValue(metric && metric.metric_unit);
    var heightCm = getAthleteHeightCmForBenchmarks();
    var legLengthCm = heightCm ? calculateLegLengthCm(heightCm) : null;
    var normalizedReachPercent = null;

    if (numericValue !== null) {
      if (unit.indexOf("%") !== -1) {
        normalizedReachPercent = numericValue;
      } else if (Number.isFinite(legLengthCm) && legLengthCm > 0) {
        var reachCm = convertLengthToCm(numericValue, unit);
        if (Number.isFinite(reachCm)) {
          normalizedReachPercent = (reachCm / legLengthCm) * 100;
        }
      } else if (!unit) {
        // Backward compatibility: if no unit is stored, assume value may already be normalized %.
        normalizedReachPercent = numericValue;
      }
    }

    if (numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to unlock benchmark comparison.",
        range:
          "Reference: Y Balance anterior reach uses sex-specific normalized reach categories (% leg length) for Developing to Elite Control.",
        meaning:
          "Meaning: Enter normalized anterior reach as % leg length, or enter reach distance (cm/in) with athlete height to auto-estimate leg length (height x 0.53). Clinical note: anterior reach asymmetry >4cm indicates elevated lower-extremity injury risk."
      };
    }

    if (!band) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men: Developing <60%, Recreational 60-65%, Trained 65-72%, Advanced 72-78%, Elite >78%. " +
          "Women: Developing <65%, Recreational 65-70%, Trained 70-77%, Advanced 77-83%, Elite >83% (all normalized to leg length).",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply Y Balance normative values."
      };
    }

    if (!Number.isFinite(normalizedReachPercent)) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing data for leg-length normalization.",
        range:
          "Reference: Y Balance norms are based on normalized anterior reach (% leg length).",
        meaning:
          "Meaning: Enter athlete height in profile so leg length can be estimated (height x 0.53), or enter the Y Balance result directly as %."
      };
    }

    var rating = classifyYBalanceReach(normalizedReachPercent, band);
    var meaningByRating = {
      Developing: "Anterior reach capacity is limited. Prioritize hip mobility, ankle dorsiflexion, and balance control in standing loads.",
      Recreational: "Foundational mobility and balance present. Continue progressing reach distance with controlled tempo.",
      Trained: "Solid anterior mobility and dynamic balance control. Maintain with sport-specific movement complexity.",
      Advanced: "High reach capacity and balance poise. Continue progressive loading while monitoring asymmetry (>4cm indicates injury risk).",
      "Elite Control": "Exceptional anterior reach and balance. Emphasize bilateral symmetry (<4cm asymmetry) and sport-specific transfer under fatigue."
    };

    return {
      currentValue:
        "Current score: " +
        valueWithUnit +
        " | Normalized reach: " +
        formatMetricNumber(normalizedReachPercent) +
        "%",
      rating: "Rating: " + rating,
      range:
        "Reference: " +
        (band.sex === "male" ? "Men" : "Women") +
        " anterior reach norms - Developing <" +
        band.developingHigh +
        "%, Recreational " +
        band.recreationalLow +
        "-" +
        band.recreationalHigh +
        "%, Trained " +
        band.trainedLow +
        "-" +
        band.trainedHigh +
        "%, Advanced " +
        band.advancedLow +
        "-" +
        band.advancedHigh +
        "%, Elite >" +
        band.eliteLow +
        "% (normalized to leg length).",
      meaning: "Meaning: " + (meaningByRating[rating] || "Interpret with training context and trend direction.")
    };
  }

  function buildEdgePullBenchmarkSummary(metric, numericValue, valueWithUnit) {
    var sex = resolveAthleteSexForBenchmarks();
    var band = getEdgePullNormBandForSex(sex);
    var unit = normalizeMetricValue(metric && metric.metric_unit);
    var weightKg = getAthleteWeightKgForBenchmarks();
    var pullLoadKg = numericValue === null ? null : convertMassToKg(numericValue, unit);
    var relativeLoad = null;

    if (numericValue !== null) {
      if (unit.indexOf("%") !== -1) {
        relativeLoad = numericValue;
      } else if (Number.isFinite(weightKg) && weightKg > 0 && Number.isFinite(pullLoadKg)) {
        relativeLoad = (pullLoadKg / weightKg) * 100;
      }
    }

    if (numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to unlock benchmark comparison.",
        range:
          "Reference: 20mm Edge Pull (single-arm) uses sex-specific relative load ranges (% bodyweight).",
        meaning:
          "Meaning: Enter a numeric hang score. If score is in kg, athlete weight is required to calculate % bodyweight."
      };
    }

    if (!band) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men - Developing <0.6x BW, Recreational 0.6-0.75x, Trained 0.75-0.9x, Advanced 0.9-1.05x, Elite >1.05x. " +
          "Women - Developing <0.55x BW, Recreational 0.55-0.7x, Trained 0.7-0.85x, Advanced 0.85-1.0x, Elite >1.0x (single-arm hang).",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply the 20mm Edge Pull normative table."
      };
    }

    if (relativeLoad === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing bodyweight for relative-load comparison.",
        range:
          "Reference: Relative load is calculated as (edge pull load / bodyweight) x 100.",
        meaning:
          "Meaning: Enter athlete weight in profile and record edge pull in kg or lbs (or enter metric directly as %BW)."
      };
    }

    var rating = classifyEdgePullRelativeLoad(relativeLoad, band);
    var meaningByRating = {
      Developing: "Developing relative finger-force output. Build tendon tolerance and progressive max-strength capacity.",
      Recreational: "Recreational climbing force baseline. Continue steady finger-strength progression and recovery management.",
      Trained: "Trained relative force profile with solid climbing transfer potential.",
      Advanced: "Advanced relative edge-force output suited to higher climbing performance demands.",
      Elite: "Elite relative edge-force output. Prioritize precision, resilience, and sport-specific transfer under fatigue."
    };

    return {
      currentValue:
        "Current score: " +
        valueWithUnit +
        " | Relative load: " +
        formatMetricNumber(relativeLoad) +
        "% BW",
      rating: "Rating: " + rating,
      range:
        "Reference: " +
        (band.sex === "male"
          ? "Men"
          : "Women") +
        " Developing <" + band.developingHigh + "% (" + formatMetricNumber(band.developingHigh / 100) + "x BW) | Recreational " +
        band.recreationalLow + "-" + band.recreationalHigh + "% (" + formatMetricNumber(band.recreationalLow / 100) + "-" + formatMetricNumber(band.recreationalHigh / 100) + "x) | Trained " +
        band.trainedLow + "-" + band.trainedHigh + "% (" + formatMetricNumber(band.trainedLow / 100) + "-" + formatMetricNumber(band.trainedHigh / 100) + "x) | Advanced " +
        band.advancedLow + "-" + band.advancedHigh + "% (" + formatMetricNumber(band.advancedLow / 100) + "-" + formatMetricNumber(band.advancedHigh / 100) + "x) | Elite >" + band.eliteLow + "% (" + formatMetricNumber(band.eliteLow / 100) + "x).",
      meaning: "Meaning: " + (meaningByRating[rating] || "Interpret with training context and trend direction.")
    };
  }

  function classifyEdgePullRelativeLoad(valuePercent, band) {
    if (!Number.isFinite(valuePercent) || !band) {
      return "Needs Data";
    }
    if (valuePercent < band.developingHigh) {
      return "Developing";
    }
    if (valuePercent < band.trainedLow) {
      return "Recreational";
    }
    if (valuePercent < band.advancedLow) {
      return "Trained";
    }
    if (valuePercent < band.eliteLow) {
      return "Advanced";
    }
    return "Elite";
  }

  function getAthleteWeightKgForBenchmarks() {
    var profile = state.profile || {};
    var weightUnit = resolveAthleteWeightUnitForBenchmarks();
    var profileWeight = parseFloat(profile.weight_kg);
    if (Number.isFinite(profileWeight) && profileWeight > 0) {
      return convertMassToKg(profileWeight, weightUnit);
    }

    if (state.form) {
      var weightField = state.form.querySelector("[name='weight_kg']");
      var fieldWeight = parseFloat((weightField && weightField.value) || "");
      if (Number.isFinite(fieldWeight) && fieldWeight > 0) {
        return convertMassToKg(fieldWeight, weightUnit);
      }
    }

    return null;
  }

  function resolveAthleteWeightUnitForBenchmarks() {
    var profile = state.profile || {};
    var overview = getProfileSportOverview(profile);
    var general = overview && overview.general && typeof overview.general === "object"
      ? overview.general
      : {};

    var rawCandidates = [
      profile.weight_unit,
      overview && overview.weight_unit,
      general.weight_unit
    ];

    var raw = rawCandidates.find(function (value) {
      return String(value || "").trim().length > 0;
    });

    var normalized = normalizeMetricValue(raw);
    if (/\b(lb|lbs|pound|pounds)\b/.test(normalized)) {
      return "lb";
    }
    return "kg";
  }

  function getAthleteHeightCmForBenchmarks() {
    var profile = state.profile || {};
    var profileHeight = parseFloat(profile.height_cm);
    if (Number.isFinite(profileHeight) && profileHeight > 0) {
      return profileHeight;
    }

    if (state.form) {
      var heightField = state.form.querySelector("[name='height_cm']");
      var fieldHeight = parseFloat((heightField && heightField.value) || "");
      if (Number.isFinite(fieldHeight) && fieldHeight > 0) {
        return fieldHeight;
      }
    }

    return null;
  }

  function getEdgePullNormBandForSex(sex) {
    if (!sex) {
      return null;
    }

    var table = {
      male: {
        sex: "male",
        developingHigh: 60,
        recreationalLow: 60,
        recreationalHigh: 75,
        trainedLow: 75,
        trainedHigh: 90,
        advancedLow: 90,
        advancedHigh: 105,
        eliteLow: 105
      },
      female: {
        sex: "female",
        developingHigh: 55,
        recreationalLow: 55,
        recreationalHigh: 70,
        trainedLow: 70,
        trainedHigh: 85,
        advancedLow: 85,
        advancedHigh: 100,
        eliteLow: 100
      }
    };

    return table[sex] || null;
  }

  function getProfileSportOverview(profile) {
    if (!profile || typeof profile.sport_overview !== "object") {
      return null;
    }
    return profile.sport_overview;
  }

  function buildVerticalJumpBenchmarkSummary(metric, numericValue, valueWithUnit) {
    var age = getAthleteAgeForBenchmarks();
    var sex = resolveAthleteSexForBenchmarks();
    var band = getVerticalJumpNormBand(age, sex);
    var unit = normalizeMetricValue(metric && metric.metric_unit);
    var valueCm = numericValue === null ? null : convertLengthToCm(numericValue, unit);
    var ageLabel = age == null ? "age unknown" : String(age);
    var sexLabel = sex === "male" ? "men" : sex === "female" ? "women" : "sex unknown";

    if (valueCm === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to unlock benchmark comparison.",
        range:
          "Reference: Vertical jump age/sex norms available (men and women, 20-29 to 50+). " +
          "Set profile age and sex for athlete-specific comparison.",
        meaning:
          "Meaning: Enter jump result as a number (cm or inches), and ensure athlete age/sex are set for precise normative interpretation."
      };
    }

    if (!band) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete context for age/sex-specific norming.",
        range:
          "Reference: Vertical Jump Norms use sex-specific age bands (20-29, 30-39, 40-49, 50+). " +
          "Current profile: age " + ageLabel + ", sex " + sexLabel + ".",
        meaning:
          "Meaning: Add athlete DOB/age and sex (male/female) in profile data to calculate vertical jump category from your normative table."
      };
    }

    var rating = classifyVerticalJumpByAverageBand(valueCm, band);
    var meaningByRating = {
      "Below Average": "Jump power is below age/sex average. Prioritize lower-body force production, landing mechanics, and progressive power work.",
      "Average": "Jump performance is in the expected range for this athlete's age/sex group.",
      "Above Average": "Jump performance is above expected age/sex average. Maintain power while progressing sport-specific transfer."
    };

    return {
      currentValue: "Current score: " + valueWithUnit,
      rating: "Rating: " + rating,
      range:
        "Reference: " +
        (band.sex === "male" ? "Men" : "Women") +
        " " +
        band.ageBandLabel +
        " average = " +
        band.inchesLabel +
        " (" +
        band.cmLabel +
        ").",
      meaning: "Meaning: " + (meaningByRating[rating] || "Interpret with training context and trend direction.")
    };
  }

  function classifyVerticalJumpByAverageBand(valueCm, band) {
    if (!band || !Number.isFinite(valueCm)) {
      return "Needs Data";
    }
    if (valueCm < band.cmLow) {
      return "Below Average";
    }
    if (valueCm > band.cmHigh) {
      return "Above Average";
    }
    return "Average";
  }

  function getAthleteAgeForBenchmarks() {
    var profile = state.profile || {};
    var dob = getProfileDobValue(profile);
    var dobAge = calculateAgeFromDob(dob);
    if (dobAge != null) {
      return dobAge;
    }

    var rawAge = parseInt(profile.age, 10);
    if (Number.isFinite(rawAge) && rawAge > 0 && rawAge < 121) {
      return rawAge;
    }

    return null;
  }

  function resolveAthleteSexForBenchmarks() {
    var profile = state.profile || {};
    var overview = getProfileSportOverview(profile);
    var general = overview && overview.general && typeof overview.general === "object"
      ? overview.general
      : {};

    var rawCandidates = [
      profile.sex,
      profile.gender,
      profile.biological_sex,
      general.sex,
      general.gender,
      general.biological_sex
    ];

    var raw = rawCandidates.find(function (value) {
      return String(value || "").trim().length > 0;
    });

    var normalized = normalizeMetricValue(raw);
    if (normalized === "male" || normalized === "m" || normalized === "man") {
      return "male";
    }
    if (normalized === "female" || normalized === "f" || normalized === "woman") {
      return "female";
    }
    return "";
  }

  function getProfileSexForFormValue(profile) {
    var overview = getProfileSportOverview(profile);
    var general = overview && overview.general && typeof overview.general === "object"
      ? overview.general
      : {};

    var rawCandidates = [
      profile && profile.sex,
      profile && profile.gender,
      profile && profile.biological_sex,
      overview && overview.sex,
      overview && overview.gender,
      overview && overview.biological_sex,
      general.sex,
      general.gender,
      general.biological_sex
    ];

    var raw = rawCandidates.find(function (value) {
      return String(value || "").trim().length > 0;
    });

    var normalized = normalizeMetricValue(raw);
    if (normalized === "male" || normalized === "m" || normalized === "man") {
      return "male";
    }
    if (normalized === "female" || normalized === "f" || normalized === "woman") {
      return "female";
    }
    if (
      normalized === "prefer-not-to-say" ||
      normalized === "prefer not to say" ||
      normalized === "undisclosed"
    ) {
      return "prefer-not-to-say";
    }
    if (normalized === "other" || normalized === "nonbinary" || normalized === "non-binary") {
      return "other";
    }
    return "";
  }

  function getVerticalJumpNormBand(age, sex) {
    if (!Number.isFinite(age) || !sex) {
      return null;
    }

    var ageBandLabel = "";
    if (age >= 20 && age <= 29) {
      ageBandLabel = "20-29";
    } else if (age >= 30 && age <= 39) {
      ageBandLabel = "30-39";
    } else if (age >= 40 && age <= 49) {
      ageBandLabel = "40-49";
    } else if (age >= 50) {
      ageBandLabel = "50+";
    } else {
      ageBandLabel = "20-29";
    }

    var tables = {
      male: {
        "20-29": { cmLow: 51, cmHigh: 56, inchesLabel: "20-22 in", cmLabel: "51-56 cm" },
        "30-39": { cmLow: 46, cmHigh: 51, inchesLabel: "18-20 in", cmLabel: "46-51 cm" },
        "40-49": { cmLow: 41, cmHigh: 46, inchesLabel: "16-18 in", cmLabel: "41-46 cm" },
        "50+": { cmLow: 33, cmHigh: 41, inchesLabel: "13-16 in", cmLabel: "33-41 cm" }
      },
      female: {
        "20-29": { cmLow: 41, cmHigh: 46, inchesLabel: "16-18 in", cmLabel: "41-46 cm" },
        "30-39": { cmLow: 36, cmHigh: 41, inchesLabel: "14-16 in", cmLabel: "36-41 cm" },
        "40-49": { cmLow: 31, cmHigh: 36, inchesLabel: "12-14 in", cmLabel: "31-36 cm" },
        "50+": { cmLow: 26, cmHigh: 31, inchesLabel: "10-12 in", cmLabel: "26-31 cm" }
      }
    };

    var sexTable = tables[sex];
    if (!sexTable || !sexTable[ageBandLabel]) {
      return null;
    }

    return {
      sex: sex,
      ageBandLabel: ageBandLabel,
      cmLow: sexTable[ageBandLabel].cmLow,
      cmHigh: sexTable[ageBandLabel].cmHigh,
      inchesLabel: sexTable[ageBandLabel].inchesLabel,
      cmLabel: sexTable[ageBandLabel].cmLabel
    };
  }

  function buildBilateralMetricFlags(metrics) {
    var groups = {};
    (metrics || []).forEach(function (metric) {
      var rawName = String(metric && metric.metric_name || "").trim();
      var sideMatch = rawName.match(/^(.*)\((left|right)\)\s*$/i);
      if (!sideMatch) {
        return;
      }

      var baseName = String(sideMatch[1] || "").trim();
      var side = String(sideMatch[2] || "").toLowerCase();
      var score = parseNumericMetricValue(metric.metric_value);
      if (!Number.isFinite(score)) {
        return;
      }

      if (!groups[baseName]) {
        groups[baseName] = {};
      }
      groups[baseName][side] = score;
    });

    return Object.keys(groups)
      .map(function (name) {
        var pair = groups[name] || {};
        if (!Number.isFinite(pair.left) || !Number.isFinite(pair.right)) {
          return "";
        }
        var symmetry = calculateSymmetryPercent(pair.left, pair.right);
        if (symmetry === null || symmetry >= 95) {
          return "";
        }
        return name + " side-to-side asymmetry flagged: " + formatMetricNumber(symmetry) + "% symmetry (<95%).";
      })
      .filter(function (line) {
        return !!line;
      });
  }

  function buildMetricFrontValueHtml(metric) {
    var metricName = String(metric.metric_name || "");
    var metricUnit = String(metric.metric_unit || "").trim();
    var metricValue = String(metric.metric_value || "").trim();
    var normalizedName = normalizeMetricValue(metricName);
    var pairedSideMetric =
      metric &&
      metric._pairedSideMetrics &&
      (isSingleLegSquatMetricName(metricName) ||
        isSingleLegHeelRaiseMetricName(metricName) ||
        isSidePlankMetricName(metricName) ||
        isYBalanceMetricName(metricName) ||
        isEdgePullMetricName(metricName));
    var isYBalanceAnterior =
      normalizedName.indexOf("y balance") !== -1 ||
      normalizedName.indexOf("anterior reach") !== -1;

    if (pairedSideMetric) {
      var leftMetric = metric._pairedSideMetrics.left;
      var rightMetric = metric._pairedSideMetrics.right;
      if (leftMetric && rightMetric) {
        var leftValue = parseNumericMetricValue(leftMetric.metric_value || "");
        var rightValue = parseNumericMetricValue(rightMetric.metric_value || "");
        var leftText = escapeHtml(formatMetricDisplayValue(leftValue, metricUnit));
        var rightText = escapeHtml(formatMetricDisplayValue(rightValue, metricUnit));
        var symmetry = calculateSymmetryPercent(leftValue, rightValue);
        var symmetryText = symmetry === null ? "—" : escapeHtml(formatMetricNumber(symmetry) + "%");
        var leftLabel = isEdgePullMetricName(metricName) ? "L Hand" : "L Leg";
        var rightLabel = isEdgePullMetricName(metricName) ? "R Hand" : "R Leg";

        return (
          '<span class="metric-value-split">' +
          '<span>' + leftLabel + ' ' + leftText + '</span>' +
          '<span>' + rightLabel + ' ' + rightText + '</span>' +
          '<span>Symmetry ' + symmetryText + '</span>' +
          "</span>"
        );
      }
    }

    if (!isYBalanceAnterior) {
      var safeValue = escapeHtml(metricValue || "—");
      var safeUnit = escapeHtml(metricUnit || "");
      return safeValue + (safeUnit ? '<span class="metric-unit"> ' + safeUnit + "</span>" : "");
    }

    var parsed = parseYBalanceLegValues(metricValue);
    if (!parsed || parsed.left === null || parsed.right === null) {
      var fallbackValue = escapeHtml(metricValue || "—");
      var fallbackUnit = escapeHtml(metricUnit || "");
      return fallbackValue + (fallbackUnit ? '<span class="metric-unit"> ' + fallbackUnit + "</span>" : "");
    }

    var leftText = escapeHtml(formatMetricDisplayValue(parsed.left, metricUnit));
    var rightText = escapeHtml(formatMetricDisplayValue(parsed.right, metricUnit));
    var symmetry = calculateSymmetryPercent(parsed.left, parsed.right);
    var symmetryText = symmetry === null ? "—" : escapeHtml(formatMetricNumber(symmetry) + "%");

    return (
      '<span class="metric-value-split">' +
      '<span>L Leg ' + leftText + '</span>' +
      '<span>R Leg ' + rightText + '</span>' +
      '<span>Symmetry ' + symmetryText + '</span>' +
      "</span>"
    );
  }

  function buildYBalanceBenchmarkSummary(metric, definition) {
    var metricUnit = String(metric.metric_unit || "").trim();
    var metricValue = String(metric.metric_value || "").trim();
    var parsed = parseYBalanceLegValues(metricValue);
    var left = parsed && parsed.left;
    var right = parsed && parsed.right;

    if (left === null || right === null) {
      return {
        currentValue:
          "Current score: L Leg — | R Leg — | Symmetry —",
        rating:
          "Rating: Add both leg values (example: L 74, R 71) to compare to Y Balance benchmarks.",
        range:
          "Reference: " + definition.range + " Symmetry target is typically >=95%.",
        meaning:
          "Meaning: Track both sides and symmetry over time. Large side-to-side gaps can indicate reduced single-leg control under fatigue."
      };
    }

    var lowerLegScore = Math.min(left, right);
    var rating = definition.classify(lowerLegScore);
    var baseMeaning = definition.meaning[rating] || "Use this score with training context and trend direction.";
    var symmetry = calculateSymmetryPercent(left, right);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";
    var symmetryMeaning = "";

    if (symmetry !== null) {
      if (symmetry >= 95) {
        symmetryMeaning = "Symmetry is strong.";
      } else if (symmetry >= 90) {
        symmetryMeaning = "Symmetry is moderate; monitor side-to-side control.";
      } else {
        symmetryMeaning = "Symmetry gap is notable; prioritize unilateral balance/control work.";
      }
    }

    var leftText = formatMetricDisplayValue(left, metricUnit);
    var rightText = formatMetricDisplayValue(right, metricUnit);

    return {
      currentValue:
        "Current score: L Leg " + leftText + " | R Leg " + rightText + " | Symmetry " + symmetryText,
      rating: "Rating: " + rating,
      range:
        "Reference: " + definition.range + " Symmetry target is typically >=95% (or <=4 cm side-to-side when measured in cm).",
      meaning:
        "Meaning: " + baseMeaning + (symmetryMeaning ? " " + symmetryMeaning : "")
    };
  }

  function classifyHigherBetter(value, thresholds, labels) {
    if (value < thresholds[0]) {
      return labels[0];
    }
    if (value < thresholds[1]) {
      return labels[1];
    }
    if (value < thresholds[2]) {
      return labels[2];
    }
    return labels[3];
  }

  function classifyLowerBetter(value, thresholds, labels) {
    if (value > thresholds[0]) {
      return labels[0];
    }
    if (value >= thresholds[1]) {
      return labels[1];
    }
    if (value >= thresholds[2]) {
      return labels[2];
    }
    return labels[3];
  }

  function parseNumericMetricValue(rawValue) {
    var text = String(rawValue || "").replace(/,/g, "").trim();
    if (!text) {
      return null;
    }

    var match = text.match(/-?\d+(?:\.\d+)?/);
    if (!match) {
      return null;
    }

    var parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function convertLengthToCm(value, unitText) {
    if (!Number.isFinite(value)) {
      return null;
    }

    var unit = normalizeMetricValue(unitText || "");
    if (!unit) {
      return value;
    }

    if (/\bcm\b/.test(unit) || /\bcentimet(er|re)s?\b/.test(unit)) {
      return value;
    }

    if (/\b(in|inch|inches)\b/.test(unit) || unit === '"') {
      return value * 2.54;
    }

    if (/\b(ft|foot|feet)\b/.test(unit)) {
      return value * 30.48;
    }

    if (/\bmm\b/.test(unit) || /\bmillimeters?\b/.test(unit)) {
      return value / 10;
    }

    if (/\bm\b/.test(unit) || /\bmeters?\b/.test(unit)) {
      return value * 100;
    }

    return value;
  }

  function convertMassToKg(value, unitText) {
    if (!Number.isFinite(value)) {
      return null;
    }

    var unit = normalizeMetricValue(unitText || "");
    if (!unit || /\b(kg|kilogram|kilograms)\b/.test(unit)) {
      return value;
    }

    if (/\b(lb|lbs|pound|pounds)\b/.test(unit)) {
      return value * 0.45359237;
    }

    return value;
  }

  function updateYBalanceDraftValue(card) {
    if (!card) {
      return;
    }

    var name = String((card.querySelector('[data-metric-edit="name"]') || {}).value || "").trim();
    if (!isYBalanceMetricName(name)) {
      card.removeAttribute("data-metric-ybalance");
      return;
    }

    card.setAttribute("data-metric-ybalance", "true");

    var leftRaw = String((card.querySelector('[data-metric-edit="left"]') || {}).value || "").trim();
    var rightRaw = String((card.querySelector('[data-metric-edit="right"]') || {}).value || "").trim();
    var unit = String((card.querySelector('[data-metric-edit="unit"]') || {}).value || "").trim();
    var symmetryInput = card.querySelector('[data-metric-edit="symmetry"]');
    var valueInput = card.querySelector('[data-metric-edit="value"]');

    var left = parseNumericMetricValue(leftRaw);
    var right = parseNumericMetricValue(rightRaw);

    if (left === null || right === null) {
      if (symmetryInput) {
        symmetryInput.value = "";
      }
      if (valueInput) {
        valueInput.value = "";
      }
      return;
    }

    var leftText = formatMetricDisplayValue(left, unit);
    var rightText = formatMetricDisplayValue(right, unit);
    var symmetry = calculateSymmetryPercent(left, right);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";

    if (symmetryInput) {
      symmetryInput.value = symmetryText;
    }
    if (valueInput) {
      valueInput.value = "L " + leftText + " | R " + rightText + " | Symmetry " + symmetryText;
    }
  }

  function updateSingleLegSquatDraftValue(card) {
    if (!card) {
      return;
    }

    var name = String((card.querySelector('[data-metric-edit="name"]') || {}).value || "").trim();
    if (!isSingleLegSquatMetricName(name)) {
      card.removeAttribute("data-metric-squat");
      return;
    }

    card.setAttribute("data-metric-squat", "true");

    var leftRaw = String((card.querySelector('[data-metric-edit="left"]') || {}).value || "").trim();
    var rightRaw = String((card.querySelector('[data-metric-edit="right"]') || {}).value || "").trim();
    var unit = String((card.querySelector('[data-metric-edit="unit"]') || {}).value || "").trim();
    var symmetryInput = card.querySelector('[data-metric-edit="symmetry"]');
    var valueInput = card.querySelector('[data-metric-edit="value"]');

    var left = parseNumericMetricValue(leftRaw);
    var right = parseNumericMetricValue(rightRaw);

    if (left === null || right === null) {
      if (symmetryInput) {
        symmetryInput.value = "";
      }
      if (valueInput) {
        valueInput.value = "";
      }
      return;
    }

    var leftText = formatMetricDisplayValue(left, unit);
    var rightText = formatMetricDisplayValue(right, unit);
    var symmetry = calculateSymmetryPercent(left, right);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";

    if (symmetryInput) {
      symmetryInput.value = symmetryText;
    }
    if (valueInput) {
      valueInput.value = "L Leg " + leftText + " | R Leg " + rightText + " | Symmetry " + symmetryText;
    }
  }

  function updateEdgePullDraftValue(card) {
    if (!card) {
      return;
    }

    var name = String((card.querySelector('[data-metric-edit="name"]') || {}).value || "").trim();
    if (!isEdgePullMetricName(name)) {
      card.removeAttribute("data-metric-edgepull");
      return;
    }

    card.setAttribute("data-metric-edgepull", "true");

    var leftRaw = String((card.querySelector('[data-metric-edit="left"]') || {}).value || "").trim();
    var rightRaw = String((card.querySelector('[data-metric-edit="right"]') || {}).value || "").trim();
    var unit = String((card.querySelector('[data-metric-edit="unit"]') || {}).value || "").trim();
    var symmetryInput = card.querySelector('[data-metric-edit="symmetry"]');
    var valueInput = card.querySelector('[data-metric-edit="value"]');

    var left = parseNumericMetricValue(leftRaw);
    var right = parseNumericMetricValue(rightRaw);

    if (left === null || right === null) {
      if (symmetryInput) {
        symmetryInput.value = "";
      }
      if (valueInput) {
        valueInput.value = "";
      }
      return;
    }

    var leftText = formatMetricDisplayValue(left, unit);
    var rightText = formatMetricDisplayValue(right, unit);
    var symmetry = calculateSymmetryPercent(left, right);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";

    if (symmetryInput) {
      symmetryInput.value = symmetryText;
    }
    if (valueInput) {
      valueInput.value = "L Hand " + leftText + " | R Hand " + rightText + " | Symmetry " + symmetryText;
    }
  }

    function updateGrantDraftValue(card) {
      if (!card) {
        return;
      }

      var name = String((card.querySelector('[data-metric-edit="name"]') || {}).value || "").trim();
      if (!isAdaptedGrantFootRaiseMetricName(name)) {
        card.removeAttribute("data-metric-grant");
        return;
      }

      card.setAttribute("data-metric-grant", "true");

      var leftRaw = String((card.querySelector('[data-metric-edit="left"]') || {}).value || "").trim();
      var rightRaw = String((card.querySelector('[data-metric-edit="right"]') || {}).value || "").trim();
      var unit = String((card.querySelector('[data-metric-edit="unit"]') || {}).value || "").trim();
      var valueInput = card.querySelector('[data-metric-edit="value"]');

      var left = parseNumericMetricValue(leftRaw);
      var right = parseNumericMetricValue(rightRaw);

      if (left === null || right === null) {
        if (valueInput) {
          valueInput.value = "";
        }
        return;
      }

      var leftText = formatMetricDisplayValue(left, unit);
      var rightText = formatMetricDisplayValue(right, unit);

      if (valueInput) {
        valueInput.value = "L " + leftText + " | R " + rightText;
      }
    }

  function updateLegLengthEstimateNote(card) {
    if (!card) {
      return;
    }

    var legLengthNote = card.querySelector("[data-leglength-estimate-note]");
    if (!legLengthNote) {
      return;
    }

    var name = String((card.querySelector('[data-metric-edit="name"]') || {}).value || "").trim();
    var showNote = isYBalanceMetricName(name) || isAdaptedGrantFootRaiseMetricName(name);
    legLengthNote.hidden = !showNote;
  }

  function isYBalanceMetricName(name) {
    var normalized = normalizeMetricValue(name);
    return normalized.indexOf("y balance") !== -1 || normalized.indexOf("anterior reach") !== -1;
  }

  function parseYBalanceLegValues(rawValue) {
    var text = String(rawValue || "").replace(/,/g, " ").trim();
    if (!text) {
      return { left: null, right: null };
    }

    var leftMatch = text.match(/(?:\bL\b|\bleft\b|\bl leg\b)[^\d-]*(-?\d+(?:\.\d+)?)/i);
    var rightMatch = text.match(/(?:\bR\b|\bright\b|\br leg\b)[^\d-]*(-?\d+(?:\.\d+)?)/i);
    var left = leftMatch ? Number(leftMatch[1]) : null;
    var right = rightMatch ? Number(rightMatch[1]) : null;

    if (Number.isFinite(left) && Number.isFinite(right)) {
      return { left: left, right: right };
    }

    var numbers = text.match(/-?\d+(?:\.\d+)?/g) || [];
    if (numbers.length >= 2) {
      var first = Number(numbers[0]);
      var second = Number(numbers[1]);
      if (Number.isFinite(first) && Number.isFinite(second)) {
        return { left: first, right: second };
      }
    }

    return { left: null, right: null };
  }

  function parseGrantLegValues(rawValue) {
    var text = String(rawValue || "").replace(/,/g, " ").trim();
    if (!text) {
      return { left: null, right: null };
    }

    var leftMatch = text.match(/(?:\bL\b|\bleft\b|\bl leg\b)[^\d-]*(-?\d+(?:\.\d+)?)/i);
    var rightMatch = text.match(/(?:\bR\b|\bright\b|\br leg\b)[^\d-]*(-?\d+(?:\.\d+)?)/i);
    var left = leftMatch ? Number(leftMatch[1]) : null;
    var right = rightMatch ? Number(rightMatch[1]) : null;

    if (Number.isFinite(left) && Number.isFinite(right)) {
      return { left: left, right: right };
    }

    var numbers = text.match(/-?\d+(?:\.\d+)?/g) || [];
    if (numbers.length >= 2) {
      var first = Number(numbers[0]);
      var second = Number(numbers[1]);
      if (Number.isFinite(first) && Number.isFinite(second)) {
        return { left: first, right: second };
      }
    }

    return { left: null, right: null };
  }

  function calculateSymmetryPercent(left, right) {
    if (!Number.isFinite(left) || !Number.isFinite(right)) {
      return null;
    }

    var larger = Math.max(Math.abs(left), Math.abs(right));
    var smaller = Math.min(Math.abs(left), Math.abs(right));
    if (larger <= 0) {
      return null;
    }

    return (smaller / larger) * 100;
  }

  function formatMetricDisplayValue(value, unit) {
    var numericText = formatMetricNumber(value);
    return unit ? numericText + " " + unit : numericText;
  }

  function formatMetricNumber(value) {
    if (!Number.isFinite(value)) {
      return "—";
    }

    var rounded = Math.round(value * 10) / 10;
    if (Math.abs(rounded - Math.round(rounded)) < 0.0001) {
      return String(Math.round(rounded));
    }
    return rounded.toFixed(1);
  }

  function closeMetricCardEditor(card) {
    if (!card) {
      return;
    }
    card.classList.remove("is-flipped");
    card.removeAttribute("data-metric-mode");
  }

  function closeAllMetricCardEditors() {
    if (!state.metricsList) {
      return;
    }

    state.metricsList.querySelectorAll(".metric-card.is-flipped").forEach(function (card) {
      closeMetricCardEditor(card);
    });
  }

  function deleteMetricFromFlippedCard(card) {
    var viewedUserId = getViewedUserId();
    if (!viewedUserId || !state.client || !card) {
      setMetricsStatus("Not authenticated.", "error");
      return;
    }

    var metricKey = String(card.getAttribute("data-metric-key") || "");
    var metric = findLatestMetricByKey(metricKey);
    if (!metric) {
      setMetricsStatus("Could not find this metric to delete.", "error");
      return;
    }

    if (!confirm("Delete this metric and all of its test history?")) {
      return;
    }

    setMetricsStatus("Deleting metric...", "info");

    var name = String(metric.metric_name || "");
    var unit = String(metric.metric_unit || "").trim();

    function deleteByNameAndUnit(targetName, targetUnit) {
      var safeName = String(targetName || "").trim();
      var safeUnit = String(targetUnit || "").trim();
      if (!safeName) {
        return Promise.resolve();
      }

      if (safeUnit) {
        return state.client
          .from("athlete_metrics")
          .delete()
          .eq("user_id", viewedUserId)
          .eq("metric_name", safeName)
          .eq("metric_unit", safeUnit)
          .then(function (result) {
            if (result.error) {
              throw result.error;
            }
          });
      }

      return state.client
        .from("athlete_metrics")
        .delete()
        .eq("user_id", viewedUserId)
        .eq("metric_name", safeName)
        .eq("metric_unit", "")
        .then(function (resultEmptyUnit) {
          if (resultEmptyUnit.error) {
            throw resultEmptyUnit.error;
          }

          return state.client
            .from("athlete_metrics")
            .delete()
            .eq("user_id", viewedUserId)
            .eq("metric_name", safeName)
            .is("metric_unit", null)
            .then(function (resultNullUnit) {
              if (resultNullUnit.error) {
                throw resultNullUnit.error;
              }
            });
        });
    }

    var pair = metric && metric._pairedSideMetrics ? metric._pairedSideMetrics : null;
    var deleteTargets = [];

    if (pair && (pair.left || pair.right)) {
      if (pair.left) {
        deleteTargets.push({
          name: String(pair.left.metric_name || "").trim(),
          unit: String(pair.left.metric_unit || "").trim()
        });
      }
      if (pair.right) {
        deleteTargets.push({
          name: String(pair.right.metric_name || "").trim(),
          unit: String(pair.right.metric_unit || "").trim()
        });
      }
    } else {
      deleteTargets.push({ name: name, unit: unit });
    }

    var dedupedTargets = [];
    var seen = {};
    deleteTargets.forEach(function (target) {
      var targetName = String(target && target.name || "").trim();
      var targetUnit = String(target && target.unit || "").trim();
      if (!targetName) {
        return;
      }
      var token = normalizeMetricValue(targetName) + "|" + normalizeMetricValue(targetUnit);
      if (seen[token]) {
        return;
      }
      seen[token] = true;
      dedupedTargets.push({ name: targetName, unit: targetUnit });
    });

    Promise.all(
      dedupedTargets.map(function (target) {
        return deleteByNameAndUnit(target.name, target.unit);
      })
    )
      .then(function () {
        loadMetricsData();
        setMetricsStatus("Metric deleted.", "success");
      })
      .catch(function (error) {
        setMetricsStatus(error && error.message ? error.message : "Failed to delete metric.", "error");
      });
  }
  function saveMetricFromFlippedCard(card) {
    var viewedUserId = getViewedUserId();
    if (!viewedUserId || !state.client || !card) {
      setMetricsStatus("Not authenticated.", "error");
      return;
    }

    var mode = card.getAttribute("data-metric-mode") || "edit";
    var name = String((card.querySelector('[data-metric-edit="name"]') || {}).value || "").trim();
    var value = String((card.querySelector('[data-metric-edit="value"]') || {}).value || "").trim();
    var unit = String((card.querySelector('[data-metric-edit="unit"]') || {}).value || "").trim();
    var category = String((card.querySelector('[data-metric-edit="category"]') || {}).value || "").trim() || "Performance";
    var isYBalance = isYBalanceMetricName(name);
    var isSingleLegSquat = isSingleLegSquatMetricName(name);
    var isEdgePull = isEdgePullMetricName(name);

    if (isSingleLegSquat) {
      updateSingleLegSquatDraftValue(card);

      var leftSquatInput = card.querySelector('[data-metric-edit="left"]');
      var rightSquatInput = card.querySelector('[data-metric-edit="right"]');
      var leftSquatRaw = String((leftSquatInput && leftSquatInput.value) || "").trim();
      var rightSquatRaw = String((rightSquatInput && rightSquatInput.value) || "").trim();
      var leftSquatValue = parseNumericMetricValue(leftSquatRaw);
      var rightSquatValue = parseNumericMetricValue(rightSquatRaw);

      if (!Number.isFinite(leftSquatValue) || !Number.isFinite(rightSquatValue)) {
        setMetricsStatus("Single Leg Squat requires both L Leg and R Leg values.", "error");
        return;
      }

      var squatBaseName = String(name || "")
        .replace(/\s*\((left|right)\)\s*$/i, "")
        .trim();
      var squatLeftName = squatBaseName + " (Left)";
      var squatRightName = squatBaseName + " (Right)";

      var squatPayloads = [
        {
          user_id: viewedUserId,
          metric_name: squatLeftName,
          metric_value: formatMetricNumber(leftSquatValue),
          metric_unit: unit,
          metric_category: category,
          updated_at: new Date().toISOString()
        },
        {
          user_id: viewedUserId,
          metric_name: squatRightName,
          metric_value: formatMetricNumber(rightSquatValue),
          metric_unit: unit,
          metric_category: category,
          updated_at: new Date().toISOString()
        }
      ];

      var squatMetricKey = String(card.getAttribute("data-metric-key") || "");
      var currentSquatMetric = findLatestMetricByKey(squatMetricKey);
      var currentSquatPair = currentSquatMetric && currentSquatMetric._pairedSideMetrics ? currentSquatMetric._pairedSideMetrics : null;
      var currentSquatLeft = parseNumericMetricValue(currentSquatPair && currentSquatPair.left && currentSquatPair.left.metric_value);
      var currentSquatRight = parseNumericMetricValue(currentSquatPair && currentSquatPair.right && currentSquatPair.right.metric_value);
      var hasSameSquatValues =
        Number.isFinite(currentSquatLeft) && Number.isFinite(currentSquatRight) &&
        currentSquatLeft === leftSquatValue &&
        currentSquatRight === rightSquatValue &&
        normalizeMetricValue(currentSquatMetric && currentSquatMetric.metric_unit) === normalizeMetricValue(unit) &&
        normalizeMetricValue(currentSquatMetric && currentSquatMetric.metric_category) === normalizeMetricValue(category) &&
        normalizeMetricValue(currentSquatMetric && currentSquatMetric.metric_name) === normalizeMetricValue(squatBaseName);

      if (hasSameSquatValues && mode !== "test") {
        setMetricsStatus("No metric changes detected.", "info");
        closeMetricCardEditor(card);
        return;
      }

      setMetricsStatus(mode === "test" ? "Logging new side-specific test score..." : "Saving side-specific metric update...", "info");

      state.client
        .from("athlete_metrics")
        .insert(squatPayloads)
        .select("*")
        .then(function (insertResult) {
          if (insertResult.error) {
            if (isMissingRelationError(insertResult.error)) {
              setMetricsStatus("Metrics table not found. Create athlete_metrics in Supabase before saving metrics.", "error");
              return;
            }

            if (isRlsError(insertResult.error)) {
              setMetricsStatus("Permission denied by database policy while saving metrics. Ask admin to update athlete_metrics RLS policy for coach edits.", "error");
              return;
            }

            setMetricsStatus(insertResult.error.message, "error");
            return;
          }

          var inserted = Array.isArray(insertResult.data) ? insertResult.data : squatPayloads;
          state.metrics = inserted.concat(state.metrics || []);
          state.metricsLatest = getLatestMetrics(state.metrics);
          renderMetricsCards();
          renderMetricRowsFromData(state.metricsLatest);
          setMetricsStatus(mode === "test" ? "New side-specific test score logged." : "Metric updated.", "success");
        })
        .catch(function (error) {
          setMetricsStatus(error && error.message ? error.message : "Failed to save metric.", "error");
        });
      return;
    }

    if (isEdgePull) {
      updateEdgePullDraftValue(card);

      var leftInput = card.querySelector('[data-metric-edit="left"]');
      var rightInput = card.querySelector('[data-metric-edit="right"]');
      var leftValueRaw = String((leftInput && leftInput.value) || "").trim();
      var rightValueRaw = String((rightInput && rightInput.value) || "").trim();
      var leftValue = parseNumericMetricValue(leftValueRaw);
      var rightValue = parseNumericMetricValue(rightValueRaw);

      if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) {
        setMetricsStatus("20mm Edge Pull requires both L Hand and R Hand values.", "error");
        return;
      }

      var baseName = String(name || "")
        .replace(/\s*\((left|right)\)\s*$/i, "")
        .trim();
      var leftName = baseName + " (Left)";
      var rightName = baseName + " (Right)";
      var leftText = formatMetricNumber(leftValue);
      var rightText = formatMetricNumber(rightValue);

      var payloads = [
        {
          user_id: viewedUserId,
          metric_name: leftName,
          metric_value: leftText,
          metric_unit: unit,
          metric_category: category,
          updated_at: new Date().toISOString()
        },
        {
          user_id: viewedUserId,
          metric_name: rightName,
          metric_value: rightText,
          metric_unit: unit,
          metric_category: category,
          updated_at: new Date().toISOString()
        }
      ];

      var metricKey = String(card.getAttribute("data-metric-key") || "");
      var currentMetric = findLatestMetricByKey(metricKey);
      var currentPair = currentMetric && currentMetric._pairedSideMetrics ? currentMetric._pairedSideMetrics : null;
      var currentLeft = parseNumericMetricValue(currentPair && currentPair.left && currentPair.left.metric_value);
      var currentRight = parseNumericMetricValue(currentPair && currentPair.right && currentPair.right.metric_value);
      var hasSameValues =
        Number.isFinite(currentLeft) && Number.isFinite(currentRight) &&
        currentLeft === leftValue &&
        currentRight === rightValue &&
        normalizeMetricValue(currentMetric && currentMetric.metric_unit) === normalizeMetricValue(unit) &&
        normalizeMetricValue(currentMetric && currentMetric.metric_category) === normalizeMetricValue(category) &&
        normalizeMetricValue(currentMetric && currentMetric.metric_name) === normalizeMetricValue(baseName);

      if (hasSameValues && mode !== "test") {
        setMetricsStatus("No metric changes detected.", "info");
        closeMetricCardEditor(card);
        return;
      }

      setMetricsStatus(mode === "test" ? "Logging new side-specific test score..." : "Saving side-specific metric update...", "info");

      state.client
        .from("athlete_metrics")
        .insert(payloads)
        .select("*")
        .then(function (insertResult) {
          if (insertResult.error) {
            if (isMissingRelationError(insertResult.error)) {
              setMetricsStatus("Metrics table not found. Create athlete_metrics in Supabase before saving metrics.", "error");
              return;
            }

            if (isRlsError(insertResult.error)) {
              setMetricsStatus("Permission denied by database policy while saving metrics. Ask admin to update athlete_metrics RLS policy for coach edits.", "error");
              return;
            }

            setMetricsStatus(insertResult.error.message, "error");
            return;
          }

          var inserted = Array.isArray(insertResult.data) ? insertResult.data : payloads;
          state.metrics = inserted.concat(state.metrics || []);
          state.metricsLatest = getLatestMetrics(state.metrics);
          renderMetricsCards();
          renderMetricRowsFromData(state.metricsLatest);
          setMetricsStatus(mode === "test" ? "New side-specific test score logged." : "Metric updated.", "success");
        })
        .catch(function (error) {
          setMetricsStatus(error && error.message ? error.message : "Failed to save metric.", "error");
        });
      return;
    }

    if (isYBalance) {
      updateYBalanceDraftValue(card);
      value = String((card.querySelector('[data-metric-edit="value"]') || {}).value || "").trim();
      if (!value) {
        setMetricsStatus("Y Balance requires L Leg and R Leg values.", "error");
        return;
      }
    }

    if (!name || !value) {
      setMetricsStatus("Metric name and value are required.", "error");
      return;
    }

    var payload = {
      user_id: viewedUserId,
      metric_name: name,
      metric_value: value,
      metric_unit: unit,
      metric_category: category,
      updated_at: new Date().toISOString()
    };

    var latestLookup = buildLatestMetricsLookup(state.metrics || []);
    var latest = latestLookup[getMetricKey(payload)];
    var isSameAsLatest = latest &&
      normalizeMetricValue(payload.metric_value) === normalizeMetricValue(latest.metric_value) &&
      normalizeMetricValue(payload.metric_unit) === normalizeMetricValue(latest.metric_unit) &&
      normalizeMetricValue(payload.metric_category) === normalizeMetricValue(latest.metric_category);

    if (isSameAsLatest && mode !== "test") {
      setMetricsStatus(
        "No metric changes detected.",
        "info"
      );
      closeMetricCardEditor(card);
      return;
    }

    setMetricsStatus(mode === "test" ? "Logging new test score..." : "Saving metric update...", "info");

    state.client
      .from("athlete_metrics")
      .insert([payload])
      .select("*")
      .then(function (insertResult) {
        if (insertResult.error) {
          if (isMissingRelationError(insertResult.error)) {
            setMetricsStatus("Metrics table not found. Create athlete_metrics in Supabase before saving metrics.", "error");
            return;
          }

          if (isRlsError(insertResult.error)) {
            setMetricsStatus("Permission denied by database policy while saving metrics. Ask admin to update athlete_metrics RLS policy for coach edits.", "error");
            return;
          }

          setMetricsStatus(insertResult.error.message, "error");
          return;
        }

        var inserted = Array.isArray(insertResult.data) ? insertResult.data : [payload];
        state.metrics = inserted.concat(state.metrics || []);
        state.metricsLatest = getLatestMetrics(state.metrics);
        renderMetricsCards();
        renderMetricRowsFromData(state.metricsLatest);
        setMetricsStatus(mode === "test" ? "New test score logged." : "Metric updated.", "success");
      })
      .catch(function (error) {
        setMetricsStatus(error && error.message ? error.message : "Failed to save metric.", "error");
      });
  }

  function setPasswordStatus(message, variant) {
    if (!state.passwordStatus) {
      return;
    }

    state.passwordStatus.textContent = message || "";
    state.passwordStatus.classList.remove("is-error", "is-success", "is-info");

    if (!message) {
      return;
    }

    if (variant === "error") {
      state.passwordStatus.classList.add("is-error");
    } else if (variant === "success") {
      state.passwordStatus.classList.add("is-success");
    } else {
      state.passwordStatus.classList.add("is-info");
    }
  }

  function getSelectedSportsFromForm() {
    if (!state.form) {
      return [];
    }

    var nodes = Array.prototype.slice.call(state.form.querySelectorAll('input[name="sports[]"]:checked'));
    var sports = nodes
      .map(function (node) {
        return String(node.value || "").trim();
      })
      .filter(function (value) {
        return !!value;
      });

    return Array.from(new Set(sports));
  }

  function setSelectedSportsInForm(sports) {
    if (!state.form) {
      return;
    }

    var selectedLookup = {};
    (sports || []).forEach(function (sport) {
      selectedLookup[String(sport)] = true;
    });

    state.form.querySelectorAll('input[name="sports[]"]').forEach(function (node) {
      node.checked = !!selectedLookup[String(node.value || "")];
    });
  }

  function getProfileSports(profile) {
    var local = loadLocalSportProfile();
    var sportsFromProfile = [];

    if (profile && Array.isArray(profile.sports)) {
      sportsFromProfile = profile.sports;
    } else if (profile && profile.sports) {
      sportsFromProfile = parseSportsValue(profile.sports);
    } else if (profile && profile.sport) {
      sportsFromProfile = parseSportsValue(profile.sport);
    }

    if (!sportsFromProfile.length && local && Array.isArray(local.sports)) {
      sportsFromProfile = local.sports;
    }

    return Array.from(new Set(
      (sportsFromProfile || [])
        .map(function (sport) {
          return String(sport || "").trim();
        })
        .filter(function (sport) {
          return !!sport;
        })
    ));
  }

  function parseSportsValue(value) {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    var text = String(value).trim();
    if (!text) {
      return [];
    }

    if (text[0] === "[") {
      var parsedArray = safeJsonParse(text);
      if (Array.isArray(parsedArray)) {
        return parsedArray;
      }
    }

    return text
      .split(",")
      .map(function (part) {
        return String(part || "").trim();
      })
      .filter(function (part) {
        return !!part;
      });
  }

  function getProfileSportOverview(profile) {
    var local = loadLocalSportProfile();
    var baseOverview = {};

    if (profile && profile.sport_overview && typeof profile.sport_overview === "object") {
      baseOverview = profile.sport_overview;
    } else if (profile && profile.sport_overview) {
      baseOverview = safeJsonParse(profile.sport_overview) || {};
    }

    if (local && local.sport_overview && typeof local.sport_overview === "object") {
      return Object.assign({}, local.sport_overview, baseOverview);
    }

    return baseOverview;
  }

  function renderSportOverviewEditor(selectedSports, existingOverview) {
    if (!state.sportOverviewEditor) {
      return;
    }

    var sports = (selectedSports || []).slice();
    var overview = existingOverview || {};
    if (!sports.length) {
      state.sportOverviewEditor.innerHTML =
        '<p class="sport-overview-empty">Select one or more sports to customize your overview details.</p>';
      return;
    }

    var cards = sports.map(function (sport) {
      var sportLabel = getSportLabel(sport);
      var fields = state.sportOverviewTemplates[sport] || [
        { key: "notes", label: "Sport Notes", placeholder: "Add sport-specific context", type: "text" }
      ];
      var sportValues = overview && overview[sport] && typeof overview[sport] === "object"
        ? overview[sport]
        : {};

      var fieldMarkup = fields.map(function (field) {
        var fieldValue = sportValues[field.key] == null ? "" : String(sportValues[field.key]);
        return (
          '<div class="sport-overview-field">' +
          '<label>' + escapeHtml(field.label) + "</label>" +
          '<input type="text" data-sport-overview-field data-overview-key="' +
          escapeAttribute(field.key) +
          '" value="' +
          escapeAttribute(fieldValue) +
          '" placeholder="' +
          escapeAttribute(field.placeholder || "") +
          '" />' +
          "</div>"
        );
      }).join("");

      return (
        '<section class="sport-overview-card" data-sport-overview-card data-sport-key="' +
        escapeAttribute(sport) +
        '">' +
        '<h4>' +
        escapeHtml(sportLabel) +
        " Overview</h4>" +
        '<div class="sport-overview-fields">' + fieldMarkup + "</div>" +
        "</section>"
      );
    });

    state.sportOverviewEditor.innerHTML = cards.join("");
  }

  function collectSportOverviewFromForm() {
    if (!state.sportOverviewEditor) {
      return {};
    }

    var overview = {};
    state.sportOverviewEditor.querySelectorAll("[data-sport-overview-card]").forEach(function (card) {
      var sport = String(card.getAttribute("data-sport-key") || "").trim();
      if (!sport) {
        return;
      }

      var sportValues = {};
      card.querySelectorAll("[data-sport-overview-field]").forEach(function (input) {
        var key = String(input.getAttribute("data-overview-key") || "").trim();
        if (!key) {
          return;
        }

        var value = String(input.value || "").trim();
        if (value) {
          sportValues[key] = value;
        }
      });

      if (Object.keys(sportValues).length) {
        overview[sport] = sportValues;
      }
    });

    return overview;
  }

  function formatSportsDisplay(sports) {
    if (!sports || !sports.length) {
      return "—";
    }

    return sports
      .slice(0, 3)
      .map(getSportLabel)
      .join(", ");
  }

  function renderSportOverviewSummary(profile) {
    if (!state.sportOverviewSummary) {
      return;
    }

    var sports = getProfileSports(profile);
    var overview = getProfileSportOverview(profile);
    if (!sports.length) {
      state.sportOverviewSummary.hidden = true;
      state.sportOverviewSummary.innerHTML = "";
      return;
    }

    var summaryCards = sports.map(function (sport) {
      var details = overview && overview[sport] && typeof overview[sport] === "object"
        ? overview[sport]
        : {};
      
      // Special handling for climbing to include ape index calculation
      var detailEntries;
      if (sport === "climbing") {
        detailEntries = buildClimbingDetailEntries(details, profile);
      } else {
        detailEntries = Object.keys(details || {}).map(function (key) {
          return '<li><strong>' + escapeHtml(prettifyOverviewKey(key)) + ':</strong> ' + escapeHtml(details[key]) + "</li>";
        }).join("");
      }

      return (
        '<article class="profile-sport-summary-card">' +
        '<h3>' + escapeHtml(getSportLabel(sport)) + "</h3>" +
        (detailEntries
          ? '<ul class="profile-sport-summary-list">' + detailEntries + "</ul>"
          : '<p class="profile-sport-summary-empty">No sport-specific details added yet.</p>') +
        "</article>"
      );
    }).join("");

    state.sportOverviewSummary.hidden = false;
    state.sportOverviewSummary.innerHTML = '<div class="profile-sport-summary-grid">' + summaryCards + "</div>";
  }

  function buildClimbingDetailEntries(details, profile) {
    var entries = [];
    
    // Add climbing-specific detail entries
    var climbingKeys = ["climbing_type", "climbing_grade", "climbing_focus"];
    climbingKeys.forEach(function (key) {
      if (details[key]) {
        entries.push(
          '<li><strong>' + escapeHtml(prettifyOverviewKey(key)) + ':</strong> ' + 
          escapeHtml(details[key]) + "</li>"
        );
      }
    });

    // Add ape index calculation if we have arm_span or height
    var armSpan = details.arm_span ? parseFloat(details.arm_span) : (profile && profile.arm_span_cm ? profile.arm_span_cm : null);
    var height = profile && profile.height_cm ? profile.height_cm : null;
    
    if (armSpan && height && typeof ApeIndexUtil !== "undefined") {
      var apeResult = ApeIndexUtil.calculateApeIndex(armSpan, height);
      if (apeResult.valid) {
        entries.push(
          '<li><strong>Ape Index:</strong> ' + 
          escapeHtml(ApeIndexUtil.formatForDisplay(apeResult, "short")) + 
          ' (' + escapeHtml(apeResult.classification) + ')</li>'
        );
      }
    }

    return entries.join("");
  }

  function prettifyOverviewKey(key) {
    return String(key || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, function (char) {
        return char.toUpperCase();
      });
  }

  function getSportLabel(sport) {
    var value = String(sport || "").trim();
    if (!value) {
      return "";
    }
    return normalizeDisplayValue(value);
  }

  function getSportProfileStorageKey(userId) {
    return "nomadic_sport_profile_" + String(userId || "unknown");
  }

  function persistLocalSportProfile(profileData) {
    var viewedUserId = getViewedUserId();
    if (!viewedUserId) {
      return;
    }

    try {
      window.localStorage.setItem(
        getSportProfileStorageKey(viewedUserId),
        JSON.stringify({
          sports: Array.isArray(profileData.sports) ? profileData.sports : [],
          sport_overview: profileData.sport_overview && typeof profileData.sport_overview === "object"
            ? profileData.sport_overview
            : {}
        })
      );
    } catch (e) {
      // Ignore storage errors.
    }
  }

  function mergeLocalSportProfile(profile) {
    var localData = loadLocalSportProfile();

    if (!profile && !localData) {
      return null;
    }

    var merged = Object.assign({}, profile || {});
    var localSports = localData && Array.isArray(localData.sports) ? localData.sports : [];
    var profileSports = [];
    if (profile && Array.isArray(profile.sports)) {
      profileSports = profile.sports;
    } else if (profile && profile.sports) {
      profileSports = parseSportsValue(profile.sports);
    } else if (profile && profile.sport) {
      profileSports = parseSportsValue(profile.sport);
    }

    profileSports = Array.from(new Set(profileSports.map(function (sport) {
      return String(sport || "").trim();
    }).filter(function (sport) {
      return !!sport;
    })));

    var finalSports = profileSports.length ? profileSports : localSports;
    if (finalSports.length) {
      merged.sports = finalSports;
      merged.sport = merged.sport || finalSports[0];
    }

    var profileOverview = {};
    if (profile && profile.sport_overview && typeof profile.sport_overview === "object") {
      profileOverview = profile.sport_overview;
    } else if (profile && profile.sport_overview) {
      profileOverview = safeJsonParse(profile.sport_overview) || {};
    }

    var localOverview = localData && localData.sport_overview && typeof localData.sport_overview === "object"
      ? localData.sport_overview
      : {};
    merged.sport_overview = Object.assign({}, localOverview, profileOverview);
    return merged;
  }

  function loadLocalSportProfile() {
    var viewedUserId = getViewedUserId();
    if (!viewedUserId) {
      return null;
    }

    try {
      return safeJsonParse(window.localStorage.getItem(getSportProfileStorageKey(viewedUserId)) || "") || null;
    } catch (e) {
      return null;
    }
  }

  function safeJsonParse(value) {
    try {
      return JSON.parse(String(value || ""));
    } catch (e) {
      return null;
    }
  }

  function getMissingColumnName(error) {
    var message = String((error && error.message) || "");
    var details = String((error && error.details) || "");
    var text = message + " " + details;

    // Pattern: "... the 'sport_overview' column of 'athlete_profiles' in the schema cache"
    var quotedBeforeColumn = text.match(/['\"]([a-zA-Z0-9_]+)['\"]\s+column/i);
    if (quotedBeforeColumn && quotedBeforeColumn[1]) {
      return quotedBeforeColumn[1];
    }

    // Pattern: "column 'height_cm' does not exist"
    var columnThenName = text.match(/column\s+['\"]?([a-zA-Z0-9_]+)['\"]?/i);
    if (columnThenName && columnThenName[1]) {
      return columnThenName[1];
    }

    // Pattern: "Could not find the sport_overview column"
    var findColumn = text.match(/find\s+the\s+['\"]?([a-zA-Z0-9_]+)['\"]?\s+column/i);
    if (findColumn && findColumn[1]) {
      return findColumn[1];
    }

    return null;
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
    var code = error && error.code ? String(error.code) : "";
    return code === "42703" ||
      code === "PGRST204" ||
      msg.indexOf("column") > -1 && msg.indexOf("does not exist") > -1 ||
      msg.indexOf("schema cache") > -1 && msg.indexOf("column") > -1;
  }

  function isRlsError(error) {
    var msg = error && error.message ? error.message.toLowerCase() : "";
    return error && error.code === "42501" || msg.indexOf("row-level security") > -1 || msg.indexOf("violates row-level security") > -1;
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
