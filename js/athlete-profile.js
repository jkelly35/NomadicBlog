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
        { key: "climbing_focus", label: "Current Focus", placeholder: "Power endurance, technique, projecting", type: "text" }
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
    var weightField = state.form.querySelector("[name='weight_kg']");

    if (emailField) emailField.value = (state.viewUser && state.viewUser.email) || "";
    if (nameField) nameField.value = profile && profile.name ? profile.name : "";
    if (bioField) bioField.value = profile && profile.bio ? profile.bio : "";
    if (ageField) ageField.value = profile && profile.age ? profile.age : "";
    if (locationField) locationField.value = profile && profile.location ? profile.location : "";
    if (heightField) heightField.value = profile && profile.height_cm ? profile.height_cm : "";
    if (weightField) weightField.value = profile && profile.weight_kg ? profile.weight_kg : "";

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
          '<input type="text" data-metric-edit="unit" placeholder="Unit" value="' + escapeAttribute(metric.metric_unit || "") + '" />' +
          '<input type="text" data-metric-edit="category" placeholder="Category" value="' + escapeAttribute(metric.metric_category || "Performance") + '" />' +
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
    var desiredWeight = parseFloat(formData.get("weight_kg") || "") || null;
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
      "height_cm",
      "weight_kg",
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

    return Object.keys(groups)
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
          setStravaStatus(formatStravaEdgeError(result.error, "strava-connect-start"), "error");
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
        setStravaStatus(formatStravaEdgeError(error, "strava-connect-start"), "error");
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
          setStravaStatus(formatStravaEdgeError(result.error, "strava-sync-latest"), "error");
          return;
        }

        setStravaStatus("Strava sync complete.", "success");
        loadStravaOverview();
      })
      .catch(function (error) {
        setStravaStatus(formatStravaEdgeError(error, "strava-sync-latest"), "error");
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
          setStravaStatus(formatStravaEdgeError(result.error, "strava-disconnect"), "error");
          return;
        }

        state.stravaConnection = null;
        state.stravaDailyMetrics = [];
        renderStravaConnection(null, false);
        renderStravaMetrics([]);
        setStravaStatus("Strava disconnected.", "success");
      })
      .catch(function (error) {
        setStravaStatus(formatStravaEdgeError(error, "strava-disconnect"), "error");
      });
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
        return true;
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
    var unitInput = card.querySelector('[data-metric-edit="unit"]');
    var categoryInput = card.querySelector('[data-metric-edit="category"]');
    var isYBalance = isYBalanceMetricName(metric.metric_name || "");

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

    if (yBalanceGrid) {
      yBalanceGrid.hidden = !isYBalance;
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
        keys: ["pull up", "pull-up", "max hang", "20mm edge pull", "edge pull"],
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

  function buildMetricFrontValueHtml(metric) {
    var metricName = String(metric.metric_name || "");
    var metricUnit = String(metric.metric_unit || "").trim();
    var metricValue = String(metric.metric_value || "").trim();
    var normalizedName = normalizeMetricValue(metricName);
    var isYBalanceAnterior =
      normalizedName.indexOf("y balance") !== -1 ||
      normalizedName.indexOf("anterior reach") !== -1;

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

    if (unit) {
      state.client
        .from("athlete_metrics")
        .delete()
        .eq("user_id", viewedUserId)
        .eq("metric_name", name)
        .eq("metric_unit", unit)
        .then(function (result) {
          if (result.error) {
            setMetricsStatus(result.error.message, "error");
            return;
          }

          loadMetricsData();
          setMetricsStatus("Metric deleted.", "success");
        })
        .catch(function (error) {
          setMetricsStatus(error && error.message ? error.message : "Failed to delete metric.", "error");
        });
      return;
    }

    state.client
      .from("athlete_metrics")
      .delete()
      .eq("user_id", viewedUserId)
      .eq("metric_name", name)
      .eq("metric_unit", "")
      .then(function (resultEmptyUnit) {
        if (resultEmptyUnit.error) {
          setMetricsStatus(resultEmptyUnit.error.message, "error");
          return;
        }

        state.client
          .from("athlete_metrics")
          .delete()
          .eq("user_id", viewedUserId)
          .eq("metric_name", name)
          .is("metric_unit", null)
          .then(function (resultNullUnit) {
            if (resultNullUnit.error) {
              setMetricsStatus(resultNullUnit.error.message, "error");
              return;
            }

            loadMetricsData();
            setMetricsStatus("Metric deleted.", "success");
          })
          .catch(function (error) {
            setMetricsStatus(error && error.message ? error.message : "Failed to delete metric.", "error");
          });
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
      var detailEntries = Object.keys(details || {}).map(function (key) {
        return '<li><strong>' + escapeHtml(prettifyOverviewKey(key)) + ':</strong> ' + escapeHtml(details[key]) + "</li>";
      }).join("");

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
