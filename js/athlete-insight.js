(function () {
  "use strict";

  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var TEMPLATE_LIBRARY_KEY = "nomadic_training_program_templates_v1";
  var TEMPLATE_MARKER = "__NOMADIC_TEMPLATE__";
  var MEMBERSHIP_PAYMENT_TASK_FORM_ID = "membership-payment-task-v1";
  var MEMBERSHIP_PAYMENT_TASK_NAME = "Complete Membership Payment";
  var MEMBERSHIP_PAYMENT_TASK_URL = "founding-member.html?checkout=start";

  var state = {
    client: null,
    athleteId: null,
    profile: null,
    authUser: null,
    metrics: [],
    programs: [],
    templates: [],
    onboardingAssignments: [],
    onboardingAssignmentsError: "",
    completedAssignmentLookup: {},
    athleteAccountEmail: "",
    onboardingTemplates: [],
    foundingSubscriptionRows: [],
    scheduleRows: [],
    stravaRows: [],
    trainingTab: "current",
    calendarDraftDate: "",
    inlineAddDate: "",
    assignTemplateId: "",
    pendingAssignTemplateId: "",
    pendingAssignTemplateName: "",
    selectedOnboardingTemplateId: "",
    isAssigningCoachTask: false,
    isAssigningQuickTask: false,
    calendarMonthKey: "",
    draggingScheduleId: null,
    selectedScheduleId: null
  };

  // ─── Sport overview field labels ─────────────────────────────────────────────
  var SPORT_OVERVIEW_LABELS = {
    climbing_type:          "Climbing Type",
    climbing_grade:         "Current Climbing Level",
    climbing_focus:         "Current Focus",
    arm_span:               "Arm Span (cm)",
    ski_discipline:         "Ski Discipline",
    ski_terrain:            "Preferred Terrain",
    snowboard_discipline:   "Snowboard Discipline",
    snowboard_stance:       "Stance",
    mtb_discipline:         "MTB Discipline",
    mtb_weekly_volume:      "Weekly Ride Volume",
    run_primary_distance:   "Primary Distance",
    run_elevation_goal:     "Elevation Focus",
    mixed_split:            "Training Split",
    goals:                  "Goals",
    upcoming_event:         "Upcoming Event / Race",
    notes:                  "Notes"
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
    "Health",
    "Other"
  ];

  var PRESET_METRICS = [
    { name: "Readiness", unit: "score", category: "Readiness" },
    { name: "HRV", unit: "ms", category: "Recovery" },
    { name: "Resting HR", unit: "bpm", category: "Recovery" },
    { name: "Sleep", unit: "h", category: "Recovery" },
    { name: "Fatigue", unit: "score", category: "Readiness" },
    { name: "Training Load", unit: "AU", category: "Load" },
    { name: "Recovery Score", unit: "score", category: "Recovery" },
    { name: "VO2 Max", unit: "ml/kg/min", category: "Cardio" },
    { name: "Grip Strength", unit: "kg", category: "Strength" },
    { name: "Countermovement Push-Up (CMPU)", unit: "reps", category: "Strength" },
    { name: "20mm Edge Pull Strength", unit: "kg", category: "Strength" },
    { name: "Max Pull Ups", unit: "reps", category: "Strength" },
    { name: "Max Hang Time", unit: "sec", category: "Strength" },
    { name: "Ape Index", unit: "cm", category: "Performance" },
    { name: "Vertical Jump Height", unit: "cm", category: "Power" },
    { name: "Broad Jump", unit: "cm", category: "Power" },
    { name: "Single Leg Squat Test", unit: "reps", category: "Strength" },
    { name: "Single Leg Heel Raise", unit: "reps", category: "Strength" },
    { name: "Side Plank with Hip Abduction Hold", unit: "sec", category: "Strength" },
    { name: "Y Balance (Anterior Reach)", unit: "cm", category: "Mobility" },
    { name: "Climbing Grades", unit: "grade", category: "Sport-Specific" }
  ];

  var ASSESSMENT_CLUSTERS = {
    climbing: [
      "Countermovement Push-Up (CMPU)",
      "20mm Edge Pull Strength",
      "Max Pull Ups",
      "Max Hang Time",
      "Ape Index",
      "Climbing Grades",
      "Grip Strength"
    ],
    running: [
      "Vertical Jump Height",
      "Single Leg Squat Test",
      "Single Leg Heel Raise",
      "Side Plank with Hip Abduction Hold",
      "Y Balance (Anterior Reach)",
      "VO2 Max"
    ],
    readiness: [
      "Readiness",
      "HRV",
      "Resting HR",
      "Sleep",
      "Fatigue",
      "Training Load",
      "Recovery Score"
    ]
  };

  var PRESET_DEFAULTS = buildPresetDefaults();

  function getDefaultOnboardingTemplates() {
    return [
      {
        id: MEMBERSHIP_PAYMENT_TASK_FORM_ID,
        name: MEMBERSHIP_PAYMENT_TASK_NAME,
        description: "Assign this when an athlete is approved for membership. Includes a direct checkout link.",
        task_type: "custom_task",
        action_label: "Open Payment",
        action_url: MEMBERSHIP_PAYMENT_TASK_URL,
        action_target: "_self",
        questions: []
      },
      {
        id: "founding-member-intake-v1",
        name: "Founding Member Intake",
        description: "Baseline onboarding form to align goals, history, equipment, and schedule.",
        questions: [
          { key: "primary_goal", label: "Primary Performance Goal", type: "text", required: true, placeholder: "What is your #1 goal for this cohort?" },
          { key: "event_date", label: "Key Event / Race Date", type: "date" },
          { key: "training_days", label: "Preferred Training Days", type: "text", required: true, placeholder: "e.g. Mon, Wed, Fri" },
          { key: "minutes_per_session", label: "Typical Session Length (minutes)", type: "number", min: 10, max: 240 },
          { key: "injury_history", label: "Recent Injury History", type: "textarea", rows: 3, placeholder: "Any injuries, pain, or limitations in the last 12 months?" },
          { key: "equipment_access", label: "Equipment Access", type: "textarea", rows: 3, placeholder: "Gym, home setup, trail access, wearables, etc." },
          { key: "experience_level", label: "Current Experience Level", type: "select", options: ["Beginner", "Intermediate", "Advanced"] },
          { key: "coaching_preferences", label: "Coaching Preferences", type: "textarea", rows: 3, placeholder: "How do you prefer feedback and accountability?" }
        ]
      },
      {
        id: "performance-readiness-screen-v1",
        name: "Performance Readiness Screen",
        description: "Quick readiness and lifestyle intake before plan build.",
        questions: [
          { key: "sleep_hours", label: "Average Sleep (hours/night)", type: "number", min: 0, max: 14, step: 0.5, required: true },
          { key: "stress_level", label: "Current Life Stress", type: "select", options: ["Low", "Moderate", "High"], required: true },
          { key: "work_schedule", label: "Work / School Schedule Constraints", type: "textarea", rows: 3 },
          { key: "nutrition_notes", label: "Nutrition Notes", type: "textarea", rows: 3, placeholder: "Allergies, restrictions, fueling challenges" },
          { key: "confidence_score", label: "Confidence Score (1-10)", type: "number", min: 1, max: 10 }
        ]
      }
    ];
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);
    state.athleteId = params.get("athleteId") || "";

    if (!state.athleteId) {
      showGuardError("No athlete ID provided. Return to the Coaching Dashboard.");
      return;
    }

    if (!window.supabase || !window.supabase.createClient) {
      showGuardError("Supabase failed to load.");
      return;
    }

    var url = window.NOMADIC_SUPABASE_URL;
    var key = window.NOMADIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      showGuardError("Supabase configuration incomplete.");
      return;
    }

    state.client = window.supabase.createClient(url, key);

    state.client.auth.getSession().then(function (result) {
      var session = result && result.data && result.data.session;
      if (!session) {
        window.location.href = "index.html";
        return;
      }

      state.authUser = session.user;
      if (!state.authUser || state.authUser.email !== ADMIN_EMAIL) {
        showGuardError("Access denied. This page is for coaches only.");
        return;
      }

      setupTabNavigation();
      wireActionLinks();
      state.onboardingTemplates = getDefaultOnboardingTemplates();
      loadAll();
    });
  });

  // ─── Tabs ──────────────────────────────────────────────────────────────────────
  var notesInitialised = false;

  function setupTabNavigation() {
    document.querySelectorAll("[data-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tab = btn.getAttribute("data-tab");
        activateTab(tab);
        if (tab === "notes" && !notesInitialised) {
          notesInitialised = true;
          initNotesPanel();
        }
      });
    });
  }

  function activateTab(tab) {
    document.querySelectorAll("[data-tab]").forEach(function (btn) {
      var isActive = btn.getAttribute("data-tab") === tab;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    document.querySelectorAll("[data-panel]").forEach(function (panel) {
      var isActive = panel.getAttribute("data-panel") === tab;
      panel.hidden = !isActive;
    });
  }

  // ─── Action links ─────────────────────────────────────────────────────────────
  function wireActionLinks() {
    var id = encodeURIComponent(state.athleteId);
    var reportUrl  = "profile.html?coachView=1&athleteId=" + id + "&printMetricReport=1#profile-metrics-section";
    setLink("[data-insight-metrics-report-link]", reportUrl);
  }

  function setLink(selector, href) {
    var el = document.querySelector(selector);
    if (el) {
      el.href = href;
    }
  }

  // ─── Data loading ─────────────────────────────────────────────────────────────
  function loadAll() {
    showContent();
    renderHeroLoading();

    Promise.all([
      fetchAuthUser(),
      fetchProfile(),
      fetchMetrics(),
      fetchPrograms(),
      fetchStrava(),
      fetchFormsAndTasks(),
      fetchTrainingTemplates()
    ]).then(function (results) {
      var authUser = results[0];
      var profile  = results[1];
      var formsPayload = results[5] || {};

      state.profile  = profile;
      state.athleteAccountEmail = String(authUser && authUser.email || "").trim().toLowerCase();
      state.metrics  = results[2] || [];
      state.programs = results[3] || [];
      state.stravaRows = results[4] || [];
      state.onboardingAssignments = Array.isArray(formsPayload.rows) ? formsPayload.rows : [];
      state.onboardingAssignmentsError = String(formsPayload.error || "");
      state.templates = Array.isArray(results[6]) ? results[6] : [];

      return Promise.all([
        fetchScheduleRows(state.programs),
        fetchFoundingSubscriptionPayments()
      ]).then(function (nextResults) {
        var scheduleRows = nextResults[0] || [];
        var subscriptionRows = nextResults[1] || [];
        state.scheduleRows = scheduleRows || [];
        state.foundingSubscriptionRows = Array.isArray(subscriptionRows) ? subscriptionRows : [];

        renderHero(authUser, profile);
        renderOverviewPanel(profile);
        renderMetricsPanel(state.metrics);
        renderTrainingPanel(state.programs, state.scheduleRows);
        renderFormsAndTasksPanel(state.onboardingAssignments, state.onboardingAssignmentsError);
        renderLoadPanel(state.stravaRows);
      });
    }).catch(function (err) {
      setStatus(err && err.message ? err.message : "Failed to load athlete data.", "error");
    });
  }

  function fetchAuthUser() {
    return state.client
      .from("admin_all_users")
      .select("*")
      .eq("user_id", state.athleteId)
      .single()
      .then(function (result) {
        return (result && !result.error && result.data) ? result.data : null;
      })
      .catch(function () { return null; });
  }

  function fetchProfile() {
    return state.client
      .from("athlete_profiles")
      .select("*")
      .eq("user_id", state.athleteId)
      .single()
      .then(function (result) {
        if (result && result.error && result.error.code !== "PGRST116") {
          return null;
        }
        return (result && result.data) ? result.data : null;
      })
      .catch(function () { return null; });
  }

  function fetchMetrics() {
    return state.client
      .from("athlete_metrics")
      .select("*")
      .eq("user_id", state.athleteId)
      .order("updated_at", { ascending: false })
      .then(function (result) {
        return (result && !result.error && Array.isArray(result.data)) ? result.data : [];
      })
      .catch(function () { return []; });
  }

  function fetchPrograms() {
    return state.client
      .from("user_training_programs")
      .select("*")
      .eq("user_id", state.athleteId)
      .order("assigned_at", { ascending: false })
      .then(function (result) {
        return (result && !result.error && Array.isArray(result.data)) ? result.data : [];
      })
      .catch(function () { return []; });
  }

  function fetchStrava() {
    return state.client
      .from("athlete_strava_daily_metrics")
      .select("metric_date,activity_count,distance_m,moving_time_sec,elevation_gain_m,training_load,resting_hr,hrv_ms,sleep_hours,recovery_score")
      .eq("user_id", state.athleteId)
      .order("metric_date", { ascending: false })
      .limit(30)
      .then(function (result) {
        return (result && !result.error && Array.isArray(result.data)) ? result.data : [];
      })
      .catch(function () { return []; });
  }

  function fetchFormsAndTasks() {
    return state.client
      .from("athlete_onboarding_intake_assignments")
      .select("id,form_id,form_name,form_schema,response_data,status,assigned_at,due_date,submitted_at,updated_at")
      .eq("athlete_user_id", state.athleteId)
      .order("assigned_at", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(80)
      .then(function (result) {
        if (result && result.error) {
          if (isMissingRelationError(result.error)) {
            return {
              rows: [],
              error: "Task assignment tables are not installed yet. Run sql/create-athlete-onboarding-intake.sql in Supabase."
            };
          }
          return {
            rows: [],
            error: String(result.error.message || "Unable to load forms and tasks.")
          };
        }

        return {
          rows: (result && Array.isArray(result.data) ? result.data : []).map(normalizeCompletedFormRow),
          error: ""
        };
      })
      .catch(function (error) {
        return {
          rows: [],
          error: error && error.message ? String(error.message) : "Unable to load forms and tasks."
        };
      });
  }

  function fetchFoundingSubscriptionPayments() {
    var selectFields = "user_id,customer_email,stripe_subscription_id,stripe_checkout_session_id,last_event_id,status,last_event_type,last_event_created_at,updated_at,metadata,raw_event";

    function normalizeRows(data) {
      return (Array.isArray(data) ? data : []).map(function (row) {
        return {
          user_id: String(row && row.user_id || ""),
          customer_email: String(row && row.customer_email || "").trim().toLowerCase(),
          stripe_subscription_id: String(row && row.stripe_subscription_id || ""),
          stripe_checkout_session_id: String(row && row.stripe_checkout_session_id || ""),
          last_event_id: String(row && row.last_event_id || ""),
          status: String(row && row.status || "").toLowerCase(),
          last_event_type: String(row && row.last_event_type || "").toLowerCase(),
          last_event_created_at: String(row && row.last_event_created_at || ""),
          updated_at: String(row && row.updated_at || ""),
          metadata: row && row.metadata && typeof row.metadata === "object" ? row.metadata : {},
          raw_event: row && row.raw_event && typeof row.raw_event === "object" ? row.raw_event : {}
        };
      });
    }

    function dedupeRows(rows) {
      var seen = {};
      return rows.filter(function (row) {
        var key = String(
          row && row.stripe_subscription_id ||
          row && row.stripe_checkout_session_id ||
          row && row.last_event_id ||
          row && row.updated_at ||
          ""
        ).trim();
        if (!key) {
          return true;
        }
        if (seen[key]) {
          return false;
        }
        seen[key] = true;
        return true;
      });
    }

    var byUserRequest = state.client
      .from("founding_member_subscriptions")
      .select(selectFields)
      .eq("user_id", state.athleteId)
      .order("updated_at", { ascending: false })
      .limit(30);

    return byUserRequest
      .then(function (userResult) {
        if (userResult && userResult.error) {
          if (isMissingRelationError(userResult.error)) {
            return [];
          }
          return [];
        }

        var byUserRows = normalizeRows(userResult && userResult.data);
        var athleteEmail = String(state.athleteAccountEmail || "").trim().toLowerCase();
        if (!athleteEmail) {
          return byUserRows;
        }

        return state.client
          .from("founding_member_subscriptions")
          .select(selectFields)
          .eq("customer_email", athleteEmail)
          .order("updated_at", { ascending: false })
          .limit(30)
          .then(function (emailResult) {
            if (emailResult && emailResult.error) {
              return byUserRows;
            }
            var byEmailRows = normalizeRows(emailResult && emailResult.data);
            return dedupeRows(byUserRows.concat(byEmailRows));
          })
          .catch(function () {
            return byUserRows;
          });
      })
      .catch(function () { return []; });
  }

  function fetchTrainingTemplates() {
    return state.client
      .from("training_programs")
      .select("id,name,description,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .then(function (result) {
        if (result && result.error) {
          if (isMissingRelationError(result.error)) {
            return readTemplateLibrary();
          }
          return [];
        }

        return (result && Array.isArray(result.data) ? result.data : [])
          .map(parseTrainingTemplateRow)
          .filter(function (template) {
            return !!template && !template.archived;
          });
      })
      .catch(function () {
        return readTemplateLibrary();
      });
  }

  function normalizeCompletedFormRow(row) {
    var schema = row && row.form_schema && typeof row.form_schema === "object" ? row.form_schema : {};
    var response = row && row.response_data && typeof row.response_data === "object" ? row.response_data : {};
    var status = String(row && row.status || "submitted").toLowerCase();
    return {
      id: String(row && row.id || ""),
      form_id: String(row && row.form_id || ""),
      form_name: String(row && row.form_name || "Task Form"),
      form_schema: schema,
      response_data: response,
      status: status,
      assigned_at: String(row && row.assigned_at || ""),
      due_date: String(row && row.due_date || ""),
      submitted_at: String(row && row.submitted_at || ""),
      updated_at: String(row && row.updated_at || "")
    };
  }

  function fetchScheduleRows(programs) {
    var assignmentIds = (Array.isArray(programs) ? programs : [])
      .map(function (program) { return program && program.id ? String(program.id) : ""; })
      .filter(function (id) { return !!id; });

    if (!assignmentIds.length) {
      return Promise.resolve([]);
    }

    return state.client
      .from("athlete_program_schedule")
      .select("id,athlete_user_id,user_training_program_id,program_id,slot_key,session_label,scheduled_for,status,notes")
      .eq("athlete_user_id", state.athleteId)
      .in("user_training_program_id", assignmentIds)
      .order("scheduled_for", { ascending: true })
      .then(function (result) {
        return (result && !result.error && Array.isArray(result.data)) ? result.data : [];
      })
      .catch(function () { return []; });
  }

  // ─── Hero ──────────────────────────────────────────────────────────────────────
  function renderHeroLoading() {
    setText("[data-insight-name]", "Loading…");
  }

  function renderHero(authUser, profile) {
    var name  = (profile && profile.name) || (authUser && authUser.name) || "Athlete";
    var email = (authUser && authUser.email) || (profile && profile.email) || "";
    var sport = getSportsDisplay(profile);
    var level = (profile && profile.level) || "";
    var age   = (profile && profile.age) ? profile.age + " yrs" : "";
    var sex   = formatSex(profile && profile.sex);
    var loc   = (profile && profile.location) || "";

    setText("[data-insight-name]",  name);
    setText("[data-insight-email]", email);

    var avatar = document.querySelector("[data-insight-avatar]");
    if (avatar) {
      avatar.textContent = name.charAt(0).toUpperCase();
    }

    setChip("[data-insight-sport]",   sport);
    setChip("[data-insight-level]",   level);
    setChip("[data-insight-age]",     age);
    setChip("[data-insight-sex]",     sex);
    setChip("[data-insight-location]",loc);

    // Summary stat cards
    var recentSeven = state.stravaRows.slice(0, 7);
    var weeklyLoad  = sumNumeric(recentSeven, "training_load");
    var activeProg  = state.programs.find(function (p) { return p.is_active; });
    var recovery    = findLatestDefined(state.stravaRows, "recovery_score");

    setText("[data-stat-metrics]",  state.metrics.length || "0");
    setText("[data-stat-program]",  activeProg ? shortName(activeProg.program_name || activeProg.name || "Active") : "None");
    setText("[data-stat-load]",     recentSeven.length ? formatInteger(weeklyLoad) : "—");
    setText("[data-stat-recovery]", recovery != null ? formatInteger(recovery) : "—");
  }

  // ─── Overview panel ───────────────────────────────────────────────────────────
  function renderOverviewPanel(profile) {
    var p = profile || {};
    var sport_overview = getSportOverview(p);

    setText("[data-ov-name]",    p.name      || "—");
    setText("[data-ov-email]",   p.email     || (state.profile && state.profile.email) || "—");
    setText("[data-ov-age]",     p.age       ? p.age + " years" : "—");
    setText("[data-ov-sex]",     formatSex(p.sex));
    setText("[data-ov-location]",p.location  || "—");
    setText("[data-ov-height]",  p.height_cm ? p.height_cm + " cm" : "—");
    setText("[data-ov-weight]",  p.weight_kg ? p.weight_kg + " kg" : "—");
    setText("[data-ov-armspan]", p.arm_span_cm ? p.arm_span_cm + " cm" : "—");

    // Bio
    var bioEl = document.querySelector("[data-ov-bio]");
    if (bioEl) {
      bioEl.textContent = p.bio || "No bio provided.";
    }

    // Sport overview
    var overviewEl = document.querySelector("[data-ov-sport-overview]");
    if (overviewEl) {
      if (!sport_overview || !Object.keys(sport_overview).length) {
        overviewEl.innerHTML = '<p class="insight-empty">No sport-specific details have been filled in yet. The athlete can add these from their profile.</p>';
      } else {
        var sports = getSports(p);
        overviewEl.innerHTML = buildSportOverviewHtml(sport_overview, sports);
      }
    }
  }

  function getSportOverview(profile) {
    if (!profile) return {};
    if (profile.sport_overview && typeof profile.sport_overview === "object") {
      return profile.sport_overview;
    }
    if (profile.sport_overview && typeof profile.sport_overview === "string") {
      try { return JSON.parse(profile.sport_overview); } catch (e) { return {}; }
    }
    return {};
  }

  function buildSportOverviewHtml(overview, sports) {
    var entries = Object.keys(overview).filter(function (key) {
      var val = overview[key];
      return val && String(val).trim().length > 0;
    });

    if (!entries.length) {
      return '<p class="insight-empty">No sport-specific details have been filled in yet.</p>';
    }

    // Group by sport if possible
    var rows = entries.map(function (key) {
      var label = SPORT_OVERVIEW_LABELS[key] || formatKey(key);
      var value = String(overview[key]).trim();
      return '<div class="insight-dl-row"><dt>' + escapeHtml(label) + '</dt><dd>' + escapeHtml(value) + '</dd></div>';
    }).join("");

    return '<dl class="insight-dl">' + rows + '</dl>';
  }

  function getSports(profile) {
    if (!profile) return [];
    if (Array.isArray(profile.sports)) return profile.sports;
    if (profile.sports && typeof profile.sports === "string") {
      try { return JSON.parse(profile.sports); } catch (e) { return [profile.sports]; }
    }
    if (profile.sport) return [profile.sport];
    return [];
  }

  function getSportsDisplay(profile) {
    var sports = getSports(profile);
    if (sports.length) return sports.map(formatSportLabel).join(", ");
    if (profile && profile.sport) return formatSportLabel(profile.sport);
    return "";
  }

  function formatSportLabel(s) {
    var map = {
      skiing: "Skiing", snowboarding: "Snowboarding", climbing: "Climbing",
      mountainbiking: "Mountain Biking", "trail-running": "Trail Running",
      mixed: "Mixed / Multi-Sport", running: "Running", cycling: "Cycling",
      hiking: "Hiking", other: "Other"
    };
    return map[String(s).toLowerCase()] || s;
  }

  // ─── Metrics panel ────────────────────────────────────────────────────────────
  function renderMetricsPanel(metrics) {
    var countEl = document.querySelector("[data-metrics-count]");
    var gridEl  = document.querySelector("[data-metrics-grid]");
    if (!gridEl) return;

    ensureMetricComposerWired();

    if (!metrics.length) {
      if (countEl) countEl.textContent = "No metrics recorded yet.";
      gridEl.innerHTML = '<p class="insight-empty">No metrics have been recorded for this athlete yet. Use the controls above to log baseline tests.</p>';
      return;
    }

    // Group by category
    var grouped = {};
    var categoryOrder = [
      "Readiness",
      "Recovery",
      "Load",
      "Strength",
      "Power",
      "Performance",
      "Cardio",
      "Mobility",
      "Sport-Specific",
      "Health",
      "Other"
    ];

    metrics.forEach(function (m) {
      var cat = m.metric_category || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(m);
    });

    // Build history map (by metric key, sorted newest-first)
    var historyMap = buildHistoryMap(metrics);

    if (countEl) countEl.textContent = metrics.length + " metric" + (metrics.length === 1 ? "" : "s") + " across " + Object.keys(grouped).length + " categories";

    var html = "";

    categoryOrder.concat(Object.keys(grouped).filter(function (k) { return categoryOrder.indexOf(k) === -1; })).forEach(function (cat) {
      var items = grouped[cat];
      if (!items || !items.length) return;

      // De-duplicate: show only most recent entry per metric name in the grid,
      // but show delta badge from history
      var seen = {};
      var unique = [];
      items.forEach(function (m) {
        var metricKey = getMetricHistoryKey(m);
        if (!seen[metricKey]) {
          seen[metricKey] = true;
          unique.push(m);
        }
      });

      html += '<section class="insight-metric-category">';
      html += '<h3 class="insight-metric-cat-label">' + escapeHtml(cat) + '</h3>';
      html += '<div class="insight-metric-cards">';

      unique.forEach(function (m) {
        var metricKey = getMetricHistoryKey(m);
        var history = historyMap[metricKey] || [];
        var latest = history[0] || m;
        var delta   = history.length > 1 ? computeDelta(history[0], history[1]) : null;
        var tested  = formatDate(latest.updated_at || latest.created_at || "");

        var benchmark = getMetricBenchmarkReference(latest);
        html += '<article class="insight-metric-card" data-metric-key="' + escapeAttribute(metricKey) + '">';
        html += '<div class="insight-metric-card-inner">';
        html += '<div class="insight-metric-face insight-metric-face-front">';
        html += '<div class="insight-metric-name">' + escapeHtml(latest.metric_name) + '</div>';
        html += '<div class="insight-metric-value-row">';
        html += '<strong class="insight-metric-value">' + escapeHtml(latest.metric_value || "—") + (latest.metric_unit ? ' <span class="insight-metric-unit">' + escapeHtml(latest.metric_unit) + '</span>' : '') + '</strong>';
        if (delta !== null) {
          var deltaClass = delta.direction === "up" ? "insight-delta-up" : (delta.direction === "down" ? "insight-delta-down" : "insight-delta-neutral");
          html += '<span class="insight-delta ' + deltaClass + '">' + escapeHtml(delta.label) + '</span>';
        }
        html += '</div>';
        html += '<div class="insight-metric-meta">Last tested ' + escapeHtml(tested) + '</div>';
        html += '<div class="insight-metric-actions">';
        html += '<button type="button" class="insight-metric-action-btn" data-metric-flip-log="' + escapeAttribute(metricKey) + '">Log Test</button>';
        if (history.length > 1) {
          html += '<button type="button" class="insight-metric-action-btn" data-metric-flip-history="' + escapeAttribute(metricKey) + '">History (' + history.length + ')</button>';
        }
        html += '</div>';
        html += '</div>';
        html += '<div class="insight-metric-face insight-metric-face-back">';
        html += '<p class="insight-metric-back-title" data-metric-back-title>Metric Details</p>';
        html += '<div class="insight-metric-back-info" data-metric-back-info>';
        html += '<p class="insight-metric-back-copy"><strong>Description:</strong> ' + escapeHtml(benchmark.description) + '</p>';
        html += '<p class="insight-metric-back-copy"><strong>Normative:</strong> ' + escapeHtml(benchmark.normative) + '</p>';
        html += '</div>';
        html += '<div class="insight-metric-back-history" data-metric-back-history hidden></div>';
        html += '<div class="insight-metric-back-form" data-metric-back-form hidden>';
        html += '<input type="text" class="insight-metric-input" data-metric-back-value placeholder="Enter latest test value" />';
        html += '<p class="insight-metric-back-copy">This creates a new test entry for trend tracking.</p>';
        html += '</div>';
        html += '<div class="insight-metric-actions">';
        html += '<button type="button" class="insight-metric-action-btn" data-metric-flip-close>Close</button>';
        html += '<button type="button" class="insight-metric-action-btn" data-metric-flip-save hidden>Submit Result</button>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</article>';
      });

      html += '</div></section>';
    });

    gridEl.innerHTML = html;

    gridEl.querySelectorAll("[data-metric-flip-log]").forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        if (event && typeof event.stopPropagation === "function") {
          event.stopPropagation();
        }

        var key = String(btn.getAttribute("data-metric-flip-log") || "").trim();
        var metric = getLatestMetricByHistoryKey(key);
        if (!metric) {
          setMetricComposerStatus("Metric details were not found.", "error");
          return;
        }
        var card = btn.closest(".insight-metric-card");
        openMetricCardBack(card, metric, "log");
      });
    });

    gridEl.querySelectorAll("[data-metric-flip-history]").forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        if (event && typeof event.stopPropagation === "function") {
          event.stopPropagation();
        }

        var key = String(btn.getAttribute("data-metric-flip-history") || "").trim();
        var metric = getLatestMetricByHistoryKey(key);
        if (!metric) {
          setMetricComposerStatus("Metric history was not found.", "error");
          return;
        }

        var card = btn.closest(".insight-metric-card");
        openMetricCardBack(card, metric, "history");
      });
    });

    gridEl.querySelectorAll("[data-metric-flip-close]").forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        if (event && typeof event.stopPropagation === "function") {
          event.stopPropagation();
        }
        closeMetricCardBack(btn.closest(".insight-metric-card"));
      });
    });

    gridEl.querySelectorAll("[data-metric-flip-save]").forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        if (event && typeof event.stopPropagation === "function") {
          event.stopPropagation();
        }
        saveMetricLogFromCard(btn.closest(".insight-metric-card"));
      });
    });

    gridEl.querySelectorAll(".insight-metric-card").forEach(function (card) {
      card.addEventListener("click", function (event) {
        var isInteractive = event && event.target && event.target.closest("button, input, select, textarea, a, label");
        if (isInteractive) {
          return;
        }

        var isFlipped = card.classList.contains("is-flipped");
        if (isFlipped) {
          closeMetricCardBack(card);
          return;
        }

        var key = String(card.getAttribute("data-metric-key") || "").trim();
        var metric = getLatestMetricByHistoryKey(key);
        if (!metric) {
          setMetricComposerStatus("Metric details were not found.", "error");
          return;
        }

        openMetricCardBack(card, metric, "benchmark");
      });
    });
  }

  function buildHistoryMap(metrics) {
    var map = {};
    metrics.forEach(function (m) {
      var key = getMetricHistoryKey(m);
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });
    Object.keys(map).forEach(function (key) {
      map[key].sort(function (a, b) {
        return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0);
      });
    });
    return map;
  }

  function getMetricHistoryKey(metric) {
    return [
      String(metric && metric.metric_name || "").trim().toLowerCase(),
      String(metric && metric.metric_unit || "").trim().toLowerCase(),
      String(metric && metric.metric_category || "").trim().toLowerCase()
    ].join("||");
  }

  function getMetricById(metricId) {
    return (state.metrics || []).find(function (metric) {
      return String(metric && metric.id || "") === String(metricId || "");
    }) || null;
  }

  function getLatestMetricByHistoryKey(metricKey) {
    var history = buildHistoryMap(state.metrics || []);
    var rows = history[String(metricKey || "")] || [];
    return rows.length ? rows[0] : null;
  }

  function openMetricCardBack(card, metric, mode) {
    if (!card || !metric) {
      return;
    }

    var nextMode = mode === "log" ? "log" : (mode === "history" ? "history" : "benchmark");
    var titleEl = card.querySelector("[data-metric-back-title]");
    var infoEl = card.querySelector("[data-metric-back-info]");
    var historyEl = card.querySelector("[data-metric-back-history]");
    var formEl = card.querySelector("[data-metric-back-form]");
    var saveBtn = card.querySelector("[data-metric-flip-save]");
    var valueInput = card.querySelector("[data-metric-back-value]");

    card.classList.add("is-flipped");
    card.setAttribute("data-metric-back-mode", nextMode);

    if (titleEl) {
      titleEl.textContent = nextMode === "log"
        ? "Log Updated Test"
        : (nextMode === "history" ? "Metric History" : "Metric Details");
    }

    if (infoEl) {
      infoEl.hidden = nextMode !== "benchmark";
    }

    if (historyEl) {
      historyEl.hidden = nextMode !== "history";
      if (nextMode === "history") {
        renderMetricHistoryForCard(card);
      }
    }

    if (formEl) {
      formEl.hidden = nextMode !== "log";
    }

    if (saveBtn) {
      saveBtn.hidden = nextMode !== "log";
      saveBtn.textContent = "Submit Result";
    }

    if (valueInput) {
      valueInput.value = "";
      if (nextMode === "log") {
        valueInput.focus();
      }
    }
  }

  function closeMetricCardBack(card) {
    if (!card) {
      return;
    }

    card.classList.remove("is-flipped");
    card.removeAttribute("data-metric-back-mode");
  }

  function renderMetricHistoryForCard(card) {
    if (!card) {
      return;
    }

    var historyEl = card.querySelector("[data-metric-back-history]");
    if (!historyEl) {
      return;
    }

    var metricKey = String(card.getAttribute("data-metric-key") || "").trim();
    var historyMap = buildHistoryMap(state.metrics || []);
    var rows = historyMap[metricKey] || [];

    if (!rows.length) {
      historyEl.innerHTML = '<p class="insight-empty">No history entries available.</p>';
      return;
    }

    historyEl.innerHTML = rows.map(function (entry) {
      var dateLabel = formatDate(entry.updated_at || entry.created_at || "");
      var valueLabel = String(entry.metric_value || "—") + (entry.metric_unit ? " " + String(entry.metric_unit) : "");
      return '<div class="insight-history-row"><span>' + escapeHtml(dateLabel) + '</span><span>' + escapeHtml(valueLabel) + '</span></div>';
    }).join("");
  }

  function saveMetricLogFromCard(card) {
    if (!card) {
      return;
    }

    var metricKey = String(card.getAttribute("data-metric-key") || "").trim();
    var metric = getLatestMetricByHistoryKey(metricKey);
    var valueInput = card.querySelector("[data-metric-back-value]");
    var nextValue = String(valueInput && valueInput.value || "").trim();

    if (!metric) {
      setMetricComposerStatus("Metric details were not found.", "error");
      return;
    }

    if (!nextValue) {
      setMetricComposerStatus("Enter a test value before saving.", "error");
      if (valueInput) {
        valueInput.focus();
      }
      return;
    }

    state.client
      .from("athlete_metrics")
      .insert({
        user_id: state.athleteId,
        metric_name: String(metric.metric_name || ""),
        metric_value: nextValue,
        metric_unit: String(metric.metric_unit || ""),
        metric_category: String(metric.metric_category || "Performance"),
        updated_at: new Date().toISOString()
      })
      .then(function (result) {
        if (result.error) {
          setMetricComposerStatus(result.error.message || "Failed to log test value.", "error");
          return;
        }

        setMetricComposerStatus("New test value logged.", "success");
        closeMetricCardBack(card);
        refreshMetricsPanelData();
      })
      .catch(function (error) {
        setMetricComposerStatus(error && error.message ? error.message : "Failed to log test value.", "error");
      });
  }

  function getMetricBenchmarkReference(metric) {
    var metricName = String(metric && metric.metric_name || "Metric");
    var references = [
      {
        match: /single\s*leg\s*squat/i,
        description: "Assesses unilateral lower-body control and movement quality under repeated reps.",
        normative: "General quality range is often 12-20 controlled reps per side; large asymmetry may indicate imbalance."
      },
      {
        match: /heel\s*raise/i,
        description: "Measures calf endurance and ankle-foot strength through full-range heel raises.",
        normative: "Many active adults fall around 20-30 reps per side; below ~15 can indicate reduced endurance."
      },
      {
        match: /side\s*plank/i,
        description: "Evaluates lateral core endurance and frontal-plane trunk/hip stability.",
        normative: "Many active adults hold 45-90 seconds; notable side-to-side differences can flag deficits."
      },
      {
        match: /vertical\s*jump|broad\s*jump|tripple\s*hop|triple\s*hop/i,
        description: "Captures lower-body power and elastic performance.",
        normative: "Use consistent setup and compare to personal baseline over time; absolute norms vary by sport and sex."
      },
      {
        match: /y\s*balance|anterior\s*reach/i,
        description: "Screens dynamic balance and single-leg control during reach tasks.",
        normative: "Prioritize left-right symmetry; asymmetry around 4 cm or more may indicate elevated risk."
      },
      {
        match: /vo2/i,
        description: "Estimates aerobic capacity and endurance potential.",
        normative: "General guide (ml/kg/min): recreational 35-45, trained 45-55, elite 55+."
      },
      {
        match: /resting\s*hr/i,
        description: "Tracks baseline cardiac recovery status.",
        normative: "Many healthy adults sit around 60-80 bpm, while endurance-trained athletes are often 40-60 bpm."
      },
      {
        match: /hrv/i,
        description: "Reflects autonomic nervous system recovery readiness.",
        normative: "HRV is highly individual; trend relative to personal baseline is more important than absolute values."
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

    return {
      description: "Use consistent testing conditions and movement standards so trend data remains reliable.",
      normative: "Compare this metric to the athlete's own baseline and sport-specific goals over time."
    };
  }

  function ensureMetricComposerWired() {
    var assessmentSelect = document.querySelector("[data-insight-metric-assessment]");
    var presetSelect = document.querySelector("[data-insight-metric-preset]");
    var customBtn = document.querySelector("[data-insight-metric-custom]");
    var saveBtn = document.querySelector("[data-insight-metric-save]");

    if (assessmentSelect && assessmentSelect.getAttribute("data-wired") !== "1") {
      assessmentSelect.setAttribute("data-wired", "1");
      assessmentSelect.innerHTML = [
        '<option value="">+ Add Assessment Set...</option>',
        '<option value="climbing">Climbing Assessment Set</option>',
        '<option value="running">Running Assessment Set</option>',
        '<option value="readiness">Readiness & Recovery Set</option>'
      ].join("");
      assessmentSelect.addEventListener("change", onMetricAssessmentSetSelected);
    }

    if (presetSelect && presetSelect.getAttribute("data-wired") !== "1") {
      presetSelect.setAttribute("data-wired", "1");
      var options = ['<option value="">+ Add Preset Metric...</option>'];
      PRESET_METRICS.forEach(function (metric) {
        options.push('<option value="' + escapeAttribute(metric.name) + '">' + escapeHtml(metric.name) + '</option>');
      });
      presetSelect.innerHTML = options.join("");
      presetSelect.addEventListener("change", onMetricPresetSelected);
    }

    if (customBtn && customBtn.getAttribute("data-wired") !== "1") {
      customBtn.setAttribute("data-wired", "1");
      customBtn.addEventListener("click", function () {
        clearMetricComposer();
        var nameInput = document.querySelector("[data-insight-metric-name]");
        if (nameInput) {
          nameInput.focus();
        }
      });
    }

    if (saveBtn && saveBtn.getAttribute("data-wired") !== "1") {
      saveBtn.setAttribute("data-wired", "1");
      saveBtn.addEventListener("click", onSaveMetricFromComposer);
    }
  }

  function onMetricAssessmentSetSelected(event) {
    var setKey = String(event && event.target && event.target.value || "").trim();
    if (!setKey) {
      return;
    }

    event.target.value = "";
    var metricNames = ASSESSMENT_CLUSTERS[setKey] || [];
    if (!metricNames.length) {
      setMetricComposerStatus("Unknown assessment set.", "error");
      return;
    }

    var rows = metricNames.map(function (name) {
      var preset = PRESET_DEFAULTS[name] || { unit: "", category: "Performance" };
      return {
        user_id: state.athleteId,
        metric_name: name,
        metric_value: "",
        metric_unit: preset.unit,
        metric_category: preset.category,
        updated_at: new Date().toISOString()
      };
    });

    state.client
      .from("athlete_metrics")
      .insert(rows)
      .then(function (result) {
        if (result.error) {
          setMetricComposerStatus(result.error.message || "Failed to add assessment set.", "error");
          return;
        }
        setMetricComposerStatus(String(rows.length) + " assessment metrics added.", "success");
        refreshMetricsPanelData();
      })
      .catch(function (error) {
        setMetricComposerStatus(error && error.message ? error.message : "Failed to add assessment set.", "error");
      });
  }

  function onMetricPresetSelected(event) {
    var metricName = String(event && event.target && event.target.value || "").trim();
    if (!metricName) {
      return;
    }

    event.target.value = "";
    var preset = PRESET_DEFAULTS[metricName] || { unit: "", category: "Performance" };
    prefillMetricComposer({
      metric_name: metricName,
      metric_value: "",
      metric_unit: preset.unit,
      metric_category: preset.category
    }, "insert");
  }

  function onSaveMetricFromComposer() {
    var nameInput = document.querySelector("[data-insight-metric-name]");
    var valueInput = document.querySelector("[data-insight-metric-value]");
    var unitInput = document.querySelector("[data-insight-metric-unit]");
    var categoryInput = document.querySelector("[data-insight-metric-category]");

    var metricName = String(nameInput && nameInput.value || "").trim();
    var metricValue = String(valueInput && valueInput.value || "").trim();
    var metricUnit = String(unitInput && unitInput.value || "").trim();
    var metricCategory = String(categoryInput && categoryInput.value || "Performance").trim() || "Performance";

    if (!metricName) {
      setMetricComposerStatus("Metric name is required.", "error");
      return;
    }

    var payload = {
      user_id: state.athleteId,
      metric_name: metricName,
      metric_value: metricValue,
      metric_unit: metricUnit,
      metric_category: metricCategory,
      updated_at: new Date().toISOString()
    };

    var editId = String(document.body.getAttribute("data-metric-composer-edit-id") || "").trim();
    var query = null;

    if (editId) {
      query = state.client
        .from("athlete_metrics")
        .update({
          metric_name: payload.metric_name,
          metric_value: payload.metric_value,
          metric_unit: payload.metric_unit,
          metric_category: payload.metric_category,
          updated_at: payload.updated_at
        })
        .eq("id", editId)
        .eq("user_id", state.athleteId);
    } else {
      query = state.client.from("athlete_metrics").insert(payload);
    }

    query.then(function (result) {
      if (result.error) {
        setMetricComposerStatus(result.error.message || "Failed to save metric.", "error");
        return;
      }

      setMetricComposerStatus(editId ? "Metric updated." : "Metric logged.", "success");
      clearMetricComposer();
      refreshMetricsPanelData();
    }).catch(function (error) {
      setMetricComposerStatus(error && error.message ? error.message : "Failed to save metric.", "error");
    });
  }

  function deleteMetricById(metricId) {
    if (!metricId) {
      return;
    }

    if (!window.confirm("Delete this latest metric entry?")) {
      return;
    }

    state.client
      .from("athlete_metrics")
      .delete()
      .eq("id", metricId)
      .eq("user_id", state.athleteId)
      .then(function (result) {
        if (result.error) {
          setMetricComposerStatus(result.error.message || "Failed to delete metric entry.", "error");
          return;
        }
        setMetricComposerStatus("Metric entry deleted.", "success");
        clearMetricComposer();
        refreshMetricsPanelData();
      })
      .catch(function (error) {
        setMetricComposerStatus(error && error.message ? error.message : "Failed to delete metric entry.", "error");
      });
  }

  function prefillMetricComposer(metric, mode) {
    var nameInput = document.querySelector("[data-insight-metric-name]");
    var valueInput = document.querySelector("[data-insight-metric-value]");
    var unitInput = document.querySelector("[data-insight-metric-unit]");
    var categoryInput = document.querySelector("[data-insight-metric-category]");
    var modeEl = document.querySelector("[data-insight-metric-form-mode]");

    if (nameInput) {
      nameInput.value = String(metric && metric.metric_name || "");
    }
    if (valueInput) {
      valueInput.value = mode === "insert" ? "" : String(metric && metric.metric_value || "");
      valueInput.focus();
    }
    if (unitInput) {
      unitInput.value = String(metric && metric.metric_unit || "");
    }
    if (categoryInput) {
      categoryInput.value = String(metric && metric.metric_category || "Performance");
    }

    var editId = mode === "update" ? String(metric && metric.id || "") : "";
    if (editId) {
      document.body.setAttribute("data-metric-composer-edit-id", editId);
      if (modeEl) {
        modeEl.textContent = "Editing latest metric entry.";
      }
    } else {
      document.body.removeAttribute("data-metric-composer-edit-id");
      if (modeEl) {
        modeEl.textContent = "Logging a new metric entry.";
      }
    }

    setMetricComposerStatus(mode === "update" ? "Editing latest entry." : "Log a new test value and save.", "info");
  }

  function clearMetricComposer() {
    var nameInput = document.querySelector("[data-insight-metric-name]");
    var valueInput = document.querySelector("[data-insight-metric-value]");
    var unitInput = document.querySelector("[data-insight-metric-unit]");
    var categoryInput = document.querySelector("[data-insight-metric-category]");
    var modeEl = document.querySelector("[data-insight-metric-form-mode]");

    if (nameInput) nameInput.value = "";
    if (valueInput) valueInput.value = "";
    if (unitInput) unitInput.value = "";
    if (categoryInput) categoryInput.value = "Performance";
    if (modeEl) modeEl.textContent = "Logging a new metric entry.";
    document.body.removeAttribute("data-metric-composer-edit-id");
  }

  function setMetricComposerStatus(message, variant) {
    var el = document.querySelector("[data-insight-metric-status]");
    if (!el) {
      return;
    }
    el.textContent = String(message || "");
    el.className = "insight-status" + (variant ? " is-" + variant : "");
  }

  function refreshMetricsPanelData() {
    fetchMetrics().then(function (rows) {
      state.metrics = rows || [];
      renderMetricsPanel(state.metrics);
      setText("[data-stat-metrics]", state.metrics.length || "0");
    }).catch(function (error) {
      setMetricComposerStatus(error && error.message ? error.message : "Failed to refresh metrics.", "error");
    });
  }

  function computeDelta(latest, previous) {
    var a = parseFloat(latest.metric_value);
    var b = parseFloat(previous.metric_value);
    if (!Number.isFinite(a) || !Number.isFinite(b) || a === b) return { label: "No change", direction: "neutral" };
    var diff  = a - b;
    var prefix = diff > 0 ? "+" : "";
    var unit  = String(latest.metric_unit || "").trim();
    var label = prefix + formatDecimal(diff, Math.abs(diff) < 10 ? 1 : 0) + (unit ? " " + unit : "");
    return { label: label, direction: diff > 0 ? "up" : "down" };
  }

  // ─── Training programs panel ──────────────────────────────────────────────────
  function renderTrainingPanel(programs, scheduleRows) {
    var activeEl  = document.querySelector("[data-training-active]");
    var historyEl = document.querySelector("[data-training-history]");
    var rows = Array.isArray(scheduleRows) ? scheduleRows : [];

    var active  = programs.filter(function (p) { return p.is_active; });
    var inactive = programs.filter(function (p) { return !p.is_active; });

    wireTrainingTabs();
    activateTrainingTab(state.trainingTab || "current");

    if (activeEl) {
      if (!active.length) {
        activeEl.innerHTML =
          '<p class="insight-empty">No current programs are marked active yet. You can still schedule sessions below from any assigned program.</p>' +
          buildCalendarManagerHtml(programs, rows);
      } else {
        activeEl.innerHTML = active.map(function (program) {
          return buildProgramCard(program, true);
        }).join("") + buildCalendarManagerHtml(programs, rows);
      }
    }

    if (historyEl) {
      if (!inactive.length) {
        historyEl.innerHTML = '<p class="insight-empty">No past programs on record.</p>';
      } else {
        historyEl.innerHTML = inactive.map(function (program) {
          return buildProgramCard(program, false);
        }).join("");
      }
    }

    wirePastProgramActions();
    wireCalendarManagerActions();
  }

  function buildCalendarManagerHtml(activePrograms, scheduleRows) {
    var programs = Array.isArray(activePrograms) ? activePrograms : [];
    var rows = Array.isArray(scheduleRows) ? scheduleRows : [];
    var activeIdMap = {};

    programs.forEach(function (program) {
      if (program && program.id) {
        activeIdMap[String(program.id)] = program;
      }
    });

    var scopedRows = rows
      .filter(function (row) {
        var assignmentId = String(row && row.user_training_program_id || "");
        return !!activeIdMap[assignmentId];
      })
      .sort(function (a, b) {
        var aDate = String(a && a.scheduled_for || "");
        var bDate = String(b && b.scheduled_for || "");
        if (aDate !== bDate) {
          return aDate.localeCompare(bDate);
        }
        return String(a && a.slot_key || "").localeCompare(String(b && b.slot_key || ""));
      });

    var assignmentOptions = programs.length
      ? programs.map(function (program) {
          var id = String(program && program.id || "");
          var label = String(program && (program.program_name || program.name) || "Assigned Program");
          var tone = program && program.is_active ? "Current" : "Past";
          return '<option value="' + escapeAttribute(id) + '">' + escapeHtml(label + ' (' + tone + ')') + '</option>';
        }).join("")
      : '<option value="" disabled selected>No assigned programs available</option>';

    if (!state.calendarDraftDate) {
      state.calendarDraftDate = getTodayDateInputValue();
    }

    if (!state.calendarMonthKey) {
      var firstDate = scopedRows.length ? String(scopedRows[0].scheduled_for || "") : "";
      state.calendarMonthKey = toMonthKey(firstDate) || toMonthKey(getTodayDateInputValue());
    }

    if (state.selectedScheduleId) {
      var selectedStillExists = scopedRows.some(function (row) {
        return String(row && row.id || "") === String(state.selectedScheduleId);
      });
      if (!selectedStillExists) {
        state.selectedScheduleId = null;
      }
    }

    if (!state.selectedScheduleId && scopedRows.length) {
      state.selectedScheduleId = String(scopedRows[0].id || "");
    }

    var monthLabel = formatMonthLabel(state.calendarMonthKey);
    var gridHtml = buildCalendarMonthGridHtml(
      state.calendarMonthKey,
      scopedRows,
      activeIdMap,
      state.selectedScheduleId,
      assignmentOptions,
      programs.length > 0
    );
    var editorHtml = buildCalendarEditorHtml(scopedRows, activeIdMap, state.selectedScheduleId);

    return [
      '<section class="insight-section insight-calendar-manager">',
      '<h2 class="insight-section-title">Training Calendar Manager</h2>',
      '<p class="insight-calendar-help">Adjust dates, labels, and statuses directly from insights. Changes save automatically.</p>',
      '<div class="insight-calendar-actions">',
      '<button type="button" class="btn insight-action-btn-sm" data-cal-assign-toggle>Assign Training Plan</button>',
      '<span class="insight-calendar-tip">Tip: use + Add inside any day cell to add extra workouts.</span>',
      '</div>',
      (state.pendingAssignTemplateId
        ? '<p class="insight-calendar-pick-start">Select a start day on the calendar for <strong>' + escapeHtml(state.pendingAssignTemplateName || 'selected plan') + '</strong>.</p>'
        : ''),
      '<div class="insight-calendar-nav">',
      '<button type="button" class="btn insight-back-btn" data-cal-month-prev>←</button>',
      '<strong class="insight-calendar-month-label" data-cal-month-label>' + escapeHtml(monthLabel) + '</strong>',
      '<button type="button" class="btn insight-back-btn" data-cal-month-next>→</button>',
      '<button type="button" class="btn insight-action-btn-sm" data-cal-month-today>Today</button>',
      '</div>',
      '<div class="insight-calendar-month-wrap">' + gridHtml + '</div>',
      editorHtml,
      '</section>'
    ].join("");
  }

  function buildTrainingTemplateOptions(templates, selectedId) {
    var rows = Array.isArray(templates) ? templates : [];
    if (!rows.length) {
      return '<option value="" selected disabled>No built training plans available</option>';
    }

    var chosen = String(selectedId || "").trim();
    var options = ['<option value="" disabled' + (chosen ? '' : ' selected') + '>Choose a training plan</option>'];
    rows.forEach(function (template) {
      var id = String(template && template.id || "").trim();
      if (!id) {
        return;
      }
      var label = String(template.name || "Training Plan");
      options.push('<option value="' + escapeAttribute(id) + '"' + (id === chosen ? ' selected' : '') + '>' + escapeHtml(label) + '</option>');
    });
    return options.join("");
  }

  function buildCalendarMonthGridHtml(monthKey, scopedRows, activeIdMap, selectedScheduleId, assignmentOptionsMarkup, hasPrograms) {
    var monthStart = parseMonthKey(monthKey);
    if (!monthStart) {
      return '<p class="insight-empty">Could not render calendar month.</p>';
    }

    var daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    var firstWeekday = monthStart.getDay();
    var weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var groupedByDate = {};

    (Array.isArray(scopedRows) ? scopedRows : []).forEach(function (row) {
      var key = String(row && row.scheduled_for || "");
      if (!groupedByDate[key]) {
        groupedByDate[key] = [];
      }
      groupedByDate[key].push(row);
    });

    var cells = [];
    for (var i = 0; i < firstWeekday; i++) {
      cells.push('<div class="insight-cal-day insight-cal-day-empty" aria-hidden="true"></div>');
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var dateValue = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
      var dateKey = formatDateInputFromDate(dateValue);
      var rows = groupedByDate[dateKey] || [];

      var cardsHtml = rows.map(function (row) {
        var assignmentId = String(row && row.user_training_program_id || "");
        var program = activeIdMap[assignmentId] || {};
        var programName = String(program.program_name || program.name || "Program");
        var rowId = String(row && row.id || "");
        var isSelected = String(selectedScheduleId || "") === rowId;
        var status = String(row && row.status || "scheduled");

        return [
          '<article class="insight-cal-session' + (isSelected ? ' is-selected' : '') + '" data-cal-select="' + escapeAttribute(rowId) + '">',
          '<div class="insight-cal-topline">',
          '<span class="insight-cal-drag-handle" draggable="true" data-cal-drag="' + escapeAttribute(rowId) + '" title="Drag to move this session">Move</span>',
          '<span class="insight-cal-status is-' + escapeAttribute(status) + '">' + escapeHtml(capitalize(status)) + '</span>',
          '</div>',
          '<p class="insight-cal-title">' + escapeHtml(String(row && row.slot_key || "")) + ' · ' + escapeHtml(String(row && row.session_label || 'Workout')) + '</p>',
          '<div class="insight-cal-bottomline">',
          '<span class="insight-cal-program">' + escapeHtml(shortName(programName)) + '</span>',
          '</div>',
          '</article>'
        ].join('');
      }).join("");

      cells.push(
        '<div class="insight-cal-day' + (rows.length ? ' has-session' : '') + (state.inlineAddDate === dateKey ? ' is-adding' : '') + (state.pendingAssignTemplateId ? ' is-pending-start' : '') + '" data-cal-day-date="' + escapeAttribute(dateKey) + '">' +
          '<div class="insight-cal-day-head">' +
            '<div class="insight-cal-day-number">' + day + '</div>' +
            '<button type="button" class="insight-cal-day-add-btn" data-cal-add-open="' + escapeAttribute(dateKey) + '"' + (hasPrograms ? '' : ' disabled title="Assign a program before adding workouts."') + '>+ Add</button>' +
          '</div>' +
          (state.inlineAddDate === dateKey
            ? buildInlineCalendarAddFormHtml(dateKey, assignmentOptionsMarkup, hasPrograms)
            : '') +
          '<div class="insight-cal-day-content">' + cardsHtml + '</div>' +
        '</div>'
      );
    }

    return [
      '<div class="insight-cal-weekdays">' + weekdayLabels.map(function (label) {
        return '<span>' + label + '</span>';
      }).join("") + '</div>',
      '<div class="insight-cal-grid" data-cal-grid>' + cells.join("") + '</div>'
    ].join("");
  }

  function buildInlineCalendarAddFormHtml(dateKey, assignmentOptionsMarkup, hasPrograms) {
    if (!hasPrograms) {
      return '<p class="insight-empty" style="margin:0.15rem 0 0;">No assigned programs available yet.</p>';
    }

    return [
      '<div class="insight-cal-inline-add" data-cal-inline-form="' + escapeAttribute(dateKey) + '">',
      '<select class="insight-calendar-input" data-cal-inline-assignment>',
      assignmentOptionsMarkup,
      '</select>',
      '<input type="text" class="insight-calendar-input" data-cal-inline-slot value="w1d1" placeholder="w1d1" />',
      '<input type="text" class="insight-calendar-input" data-cal-inline-label placeholder="Session label" />',
      '<div class="insight-cal-inline-actions">',
      '<button type="button" class="btn insight-action-btn-sm" data-cal-add-submit="' + escapeAttribute(dateKey) + '">Add</button>',
      '<button type="button" class="btn insight-back-btn" data-cal-add-cancel>Cancel</button>',
      '</div>',
      '</div>'
    ].join('');
  }

  function buildCalendarEditorHtml(scopedRows, activeIdMap, selectedScheduleId) {
    var selected = (Array.isArray(scopedRows) ? scopedRows : []).find(function (row) {
      return String(row && row.id || "") === String(selectedScheduleId || "");
    });

    if (!selected) {
      return [
        '<section class="insight-cal-editor insight-cal-editor-empty">',
        '<h3>Session Editor</h3>',
        '<p class="insight-empty">Select a session in the calendar to edit details.</p>',
        '</section>'
      ].join("");
    }

    var assignmentId = String(selected.user_training_program_id || "");
    var program = activeIdMap[assignmentId] || {};
    var programName = String(program.program_name || program.name || "Program");
    var rowId = String(selected.id || "");
    var dayUrl =
      'training-program-example.html?program=' + encodeURIComponent(programName) +
      (program.program_id ? '&templateId=' + encodeURIComponent(program.program_id) : '') +
      (assignmentId ? '&assignmentId=' + encodeURIComponent(assignmentId) : '') +
      '&athleteName=' + encodeURIComponent((state.profile && state.profile.name) || 'Athlete') +
      '&day=' + encodeURIComponent(String(selected.slot_key || ''));

    return [
      '<section class="insight-cal-editor" data-cal-editor-wrap>',
      '<h3>Session Editor</h3>',
      '<p class="insight-calendar-help">Selected: ' + escapeHtml(String(selected.slot_key || "")) + ' on ' + escapeHtml(formatDate(String(selected.scheduled_for || ""))) + '</p>',
      '<div class="insight-cal-editor-grid">',
      '<label><span>Date</span><input type="date" class="insight-calendar-input" data-cal-date="' + escapeAttribute(rowId) + '" value="' + escapeAttribute(String(selected.scheduled_for || '')) + '" /></label>',
      '<label><span>Slot</span><input type="text" class="insight-calendar-input" data-cal-slot="' + escapeAttribute(rowId) + '" value="' + escapeAttribute(String(selected.slot_key || '')) + '" /></label>',
      '<label><span>Session Label</span><input type="text" class="insight-calendar-input" data-cal-label="' + escapeAttribute(rowId) + '" value="' + escapeAttribute(String(selected.session_label || 'Workout')) + '" /></label>',
      '<label><span>Status</span><select class="insight-calendar-input" data-cal-status="' + escapeAttribute(rowId) + '">' +
        '<option value="scheduled"' + (selected.status === 'scheduled' ? ' selected' : '') + '>Scheduled</option>' +
        '<option value="completed"' + (selected.status === 'completed' ? ' selected' : '') + '>Completed</option>' +
        '<option value="missed"' + (selected.status === 'missed' ? ' selected' : '') + '>Missed</option>' +
        '<option value="skipped"' + (selected.status === 'skipped' ? ' selected' : '') + '>Skipped</option>' +
      '</select></label>',
      '</div>',
      '<div class="insight-cal-editor-actions">',
      '<span class="insight-cal-program">' + escapeHtml(programName) + '</span>',
      '<a class="btn insight-action-btn-sm" href="' + dayUrl + '">Open Workout</a>',
      '<button type="button" class="insight-program-delete-btn" data-cal-delete="' + escapeAttribute(rowId) + '">Delete Session</button>',
      '</div>',
      '</section>'
    ].join("");
  }

  function wireCalendarManagerActions() {
    var toggleAssignBtn = document.querySelector("[data-cal-assign-toggle]");
    if (toggleAssignBtn && toggleAssignBtn.getAttribute("data-cal-assign-toggle-wired") !== "1") {
      toggleAssignBtn.setAttribute("data-cal-assign-toggle-wired", "1");
      toggleAssignBtn.addEventListener("click", function () {
        openAssignTrainingPlanModal();
      });
    }

    wireAssignTrainingPlanModal();

    var prevBtn = document.querySelector("[data-cal-month-prev]");
    if (prevBtn && prevBtn.getAttribute("data-cal-month-prev-wired") !== "1") {
      prevBtn.setAttribute("data-cal-month-prev-wired", "1");
      prevBtn.addEventListener("click", function () {
        state.calendarMonthKey = shiftMonthKey(state.calendarMonthKey, -1);
        renderTrainingPanel(state.programs, state.scheduleRows);
      });
    }

    var nextBtn = document.querySelector("[data-cal-month-next]");
    if (nextBtn && nextBtn.getAttribute("data-cal-month-next-wired") !== "1") {
      nextBtn.setAttribute("data-cal-month-next-wired", "1");
      nextBtn.addEventListener("click", function () {
        state.calendarMonthKey = shiftMonthKey(state.calendarMonthKey, 1);
        renderTrainingPanel(state.programs, state.scheduleRows);
      });
    }

    var todayBtn = document.querySelector("[data-cal-month-today]");
    if (todayBtn && todayBtn.getAttribute("data-cal-month-today-wired") !== "1") {
      todayBtn.setAttribute("data-cal-month-today-wired", "1");
      todayBtn.addEventListener("click", function () {
        state.calendarMonthKey = toMonthKey(getTodayDateInputValue());
        renderTrainingPanel(state.programs, state.scheduleRows);
      });
    }

    document.querySelectorAll("[data-cal-select]").forEach(function (card) {
      if (card.getAttribute("data-cal-select-wired") === "1") {
        return;
      }
      card.setAttribute("data-cal-select-wired", "1");
      card.addEventListener("click", function (event) {
        if (event && event.target && event.target.closest("[data-cal-drag]")) {
          return;
        }
        var rowId = String(card.getAttribute("data-cal-select") || "").trim();
        if (!rowId || rowId === state.selectedScheduleId) {
          return;
        }
        state.selectedScheduleId = rowId;
        renderTrainingPanel(state.programs, state.scheduleRows);
      });
    });

    document.querySelectorAll("[data-cal-delete]").forEach(function (btn) {
      if (btn.getAttribute("data-cal-delete-wired") === "1") {
        return;
      }
      btn.setAttribute("data-cal-delete-wired", "1");
      btn.addEventListener("click", function () {
        var rowId = String(btn.getAttribute("data-cal-delete") || "").trim();
        if (!rowId) {
          return;
        }
        deleteCalendarSession(rowId);
      });
    });

    bindCalendarAutoSave("[data-cal-date]", "data-cal-date", "scheduled_for");
    bindCalendarAutoSave("[data-cal-slot]", "data-cal-slot", "slot_key");
    bindCalendarAutoSave("[data-cal-label]", "data-cal-label", "session_label");
    bindCalendarAutoSave("[data-cal-status]", "data-cal-status", "status");

    document.querySelectorAll("[data-cal-add-open]").forEach(function (btn) {
      if (btn.getAttribute("data-cal-add-open-wired") === "1") {
        return;
      }

      btn.setAttribute("data-cal-add-open-wired", "1");
      btn.addEventListener("click", function () {
        if (state.pendingAssignTemplateId) {
          setStatus("Pick a calendar start day for the selected plan before adding more sessions.", "info");
          return;
        }

        var dateValue = String(btn.getAttribute("data-cal-add-open") || "").trim();
        if (!dateValue) {
          return;
        }

        state.inlineAddDate = dateValue;
        renderTrainingPanel(state.programs, state.scheduleRows);
      });
    });

    document.querySelectorAll("[data-cal-add-cancel]").forEach(function (btn) {
      if (btn.getAttribute("data-cal-add-cancel-wired") === "1") {
        return;
      }

      btn.setAttribute("data-cal-add-cancel-wired", "1");
      btn.addEventListener("click", function () {
        state.inlineAddDate = "";
        renderTrainingPanel(state.programs, state.scheduleRows);
      });
    });

    document.querySelectorAll("[data-cal-add-submit]").forEach(function (btn) {
      if (btn.getAttribute("data-cal-add-submit-wired") === "1") {
        return;
      }

      btn.setAttribute("data-cal-add-submit-wired", "1");
      btn.addEventListener("click", function () {
        var dateValue = String(btn.getAttribute("data-cal-add-submit") || "").trim();
        if (!dateValue) {
          return;
        }

        onInlineAddCalendarSession(dateValue);
      });
    });

    document.querySelectorAll("[data-cal-day-date]").forEach(function (cell) {
      if (cell.getAttribute("data-cal-day-wired") === "1") {
        return;
      }

      cell.setAttribute("data-cal-day-wired", "1");
      cell.addEventListener("click", function (event) {
        if (!state.pendingAssignTemplateId) {
          return;
        }
        if (event && event.target && event.target.closest("[data-cal-session], [data-cal-day-add-btn], [data-cal-inline-add], [data-cal-drag]")) {
          return;
        }

        var startDate = String(cell.getAttribute("data-cal-day-date") || "").trim();
        if (!isIsoDate(startDate)) {
          return;
        }

        assignTrainingPlanToAthlete(state.pendingAssignTemplateId, startDate);
      });
    });

    bindCalendarDragAndDrop();
  }

  function wireAssignTrainingPlanModal() {
    var modal = document.querySelector("[data-cal-assign-modal]");
    if (!modal || modal.getAttribute("data-cal-assign-modal-wired") === "1") {
      return;
    }

    modal.setAttribute("data-cal-assign-modal-wired", "1");

    modal.querySelectorAll("[data-cal-assign-close]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        closeAssignTrainingPlanModal();
      });
    });

    var submitBtn = modal.querySelector("[data-cal-assign-submit]");
    if (submitBtn) {
      submitBtn.addEventListener("click", function () {
        beginAssignPlanStartSelection();
      });
    }

    var templateInput = modal.querySelector("[data-cal-assign-template]");
    if (templateInput) {
      templateInput.addEventListener("change", function () {
        state.assignTemplateId = String(templateInput.value || "").trim();
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal && !modal.hidden) {
        closeAssignTrainingPlanModal();
      }
    });
  }

  function openAssignTrainingPlanModal() {
    var modal = document.querySelector("[data-cal-assign-modal]");
    if (!modal) {
      return;
    }

    var templateInput = modal.querySelector("[data-cal-assign-template]");
    if (templateInput) {
      templateInput.innerHTML = buildTrainingTemplateOptions(state.templates, state.assignTemplateId);
    }

    var statusEl = modal.querySelector("[data-cal-assign-status]");
    if (statusEl) {
      statusEl.textContent = "";
      statusEl.classList.remove("is-error", "is-success", "is-info");
    }

    modal.hidden = false;
    document.body.classList.add("admin-modal-open");
  }

  function closeAssignTrainingPlanModal() {
    var modal = document.querySelector("[data-cal-assign-modal]");
    if (!modal) {
      return;
    }

    modal.hidden = true;
    document.body.classList.remove("admin-modal-open");
  }

  function setAssignPlanModalStatus(message, variant) {
    var statusEl = document.querySelector("[data-cal-assign-status]");
    if (!statusEl) {
      return;
    }

    statusEl.textContent = String(message || "");
    statusEl.classList.remove("is-error", "is-success", "is-info");

    if (variant === "error") {
      statusEl.classList.add("is-error");
    } else if (variant === "success") {
      statusEl.classList.add("is-success");
    } else {
      statusEl.classList.add("is-info");
    }
  }

  function beginAssignPlanStartSelection() {
    var templateId = String(state.assignTemplateId || "").trim();
    if (!templateId) {
      setAssignPlanModalStatus("Choose a training plan first.", "error");
      return;
    }

    var template = (state.templates || []).find(function (row) {
      return String(row && row.id || "") === templateId;
    });
    if (!template) {
      setAssignPlanModalStatus("The selected training plan could not be found.", "error");
      return;
    }

    state.pendingAssignTemplateId = templateId;
    state.pendingAssignTemplateName = String(template.name || "Training Plan");
    closeAssignTrainingPlanModal();
    setStatus("Click a day on the calendar to set the starting day for " + state.pendingAssignTemplateName + ".", "info");
    renderTrainingPanel(state.programs, state.scheduleRows);
  }

  function assignTrainingPlanToAthlete(templateId, startDate) {
    var chosenTemplateId = String(templateId || "").trim();
    var chosenStartDate = String(startDate || "").trim();
    if (!chosenTemplateId) {
      setStatus("Choose a training plan to assign.", "error");
      return;
    }
    if (!isIsoDate(chosenStartDate)) {
      setStatus("Choose a valid plan start date.", "error");
      return;
    }

    var template = (state.templates || []).find(function (row) {
      return String(row && row.id || "") === chosenTemplateId;
    });
    if (!template) {
      setStatus("The selected training plan could not be found.", "error");
      return;
    }

    var scheduleBlueprint = buildTemplateScheduleBlueprint(template);
    if (!scheduleBlueprint.length) {
      setStatus("This training plan does not include workout days yet.", "error");
      return;
    }

    var now = new Date().toISOString();
    var assignmentRow = {
      user_id: state.athleteId,
      program_id: template.id,
      program_name: template.name,
      is_active: true,
      assigned_at: now,
      assigned_by: state.authUser && state.authUser.id ? state.authUser.id : null
    };

    setStatus("Assigning training plan and building athlete calendar...", "info");

    state.client
      .from("user_training_programs")
      .insert(assignmentRow)
      .select("id,user_id,program_id")
      .single()
      .then(function (assignmentResult) {
        if (assignmentResult.error || !assignmentResult.data) {
          setStatus(
            assignmentResult && assignmentResult.error && assignmentResult.error.message
              ? assignmentResult.error.message
              : "Could not create athlete training assignment.",
            "error"
          );
          return;
        }

        var assignmentId = String(assignmentResult.data.id || "").trim();
        if (!assignmentId) {
          setStatus("Training assignment was created but no assignment id was returned.", "error");
          return;
        }

        var scheduleRows = scheduleBlueprint.map(function (entry) {
          return {
            athlete_user_id: state.athleteId,
            user_training_program_id: assignmentId,
            program_id: template.id,
            slot_key: entry.slot_key,
            session_label: entry.session_label,
            scheduled_for: computeSlotScheduledDate(chosenStartDate, entry.slot_key),
            status: "scheduled",
            scheduled_by: state.authUser && state.authUser.id ? state.authUser.id : null,
            notes: null
          };
        }).filter(function (row) {
          return isIsoDate(row.scheduled_for);
        });

        if (!scheduleRows.length) {
          setStatus("Plan assigned, but no calendar sessions could be generated.", "info");
          state.pendingAssignTemplateId = "";
          state.pendingAssignTemplateName = "";
          refreshPrograms();
          return;
        }

        state.client
          .from("athlete_program_schedule")
          .insert(scheduleRows)
          .then(function (scheduleResult) {
            if (scheduleResult.error) {
              setStatus("Plan assigned, but schedule save failed: " + scheduleResult.error.message, "error");
              refreshPrograms();
              return;
            }

            state.pendingAssignTemplateId = "";
            state.pendingAssignTemplateName = "";
            state.assignTemplateId = "";
            setStatus("Training plan assigned and workouts added to the athlete calendar.", "success");
            refreshPrograms();
          })
          .catch(function (error) {
            setStatus(error && error.message ? error.message : "Failed to save athlete calendar sessions.", "error");
            refreshPrograms();
          });
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to assign training plan.", "error");
      });
  }

  function onInlineAddCalendarSession(dateValue) {
    var form = document.querySelector('[data-cal-inline-form="' + dateValue + '"]');
    if (!form) {
      return;
    }

    var assignmentInput = form.querySelector("[data-cal-inline-assignment]");
    var slotInput = form.querySelector("[data-cal-inline-slot]");
    var labelInput = form.querySelector("[data-cal-inline-label]");

    var assignmentId = String(assignmentInput && assignmentInput.value || "").trim();
    var slotKey = String(slotInput && slotInput.value || "").trim();
    var sessionLabel = String(labelInput && labelInput.value || "").trim() || "Workout";

    if (!assignmentId) {
      setStatus("Choose a training assignment for this session.", "error");
      return;
    }
    if (!isIsoDate(dateValue)) {
      setStatus("Choose a valid workout date.", "error");
      return;
    }
    if (!slotKey) {
      setStatus("Enter a slot key (for example: w1d1).", "error");
      return;
    }

    var program = (state.programs || []).find(function (row) {
      return String(row && row.id || "") === assignmentId;
    }) || {};

    state.client
      .from("athlete_program_schedule")
      .insert({
        athlete_user_id: state.athleteId,
        user_training_program_id: assignmentId,
        program_id: program.program_id || null,
        slot_key: slotKey,
        session_label: sessionLabel,
        scheduled_for: dateValue,
        status: "scheduled",
        scheduled_by: state.authUser && state.authUser.id ? state.authUser.id : null,
        notes: null
      })
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        state.inlineAddDate = "";
        setStatus("Session added to training calendar.", "success");
        refreshPrograms();
      })
      .catch(function (err) {
        setStatus(err && err.message ? err.message : "Failed to add training session.", "error");
      });
  }

  function bindCalendarDragAndDrop() {
    var grid = document.querySelector("[data-cal-grid]");
    if (!grid) {
      return;
    }

    if (grid.getAttribute("data-cal-grid-wired") !== "1") {
      grid.setAttribute("data-cal-grid-wired", "1");

      grid.addEventListener("dragover", function (event) {
        var dayCell = event.target && event.target.closest("[data-cal-day-date]");
        if (!dayCell || !state.draggingScheduleId) {
          return;
        }

        event.preventDefault();
        dayCell.classList.add("is-drop-target");
      });

      grid.addEventListener("dragenter", function (event) {
        var dayCell = event.target && event.target.closest("[data-cal-day-date]");
        if (!dayCell || !state.draggingScheduleId) {
          return;
        }

        dayCell.classList.add("is-drop-target");
      });

      grid.addEventListener("dragleave", function (event) {
        var dayCell = event.target && event.target.closest("[data-cal-day-date]");
        if (!dayCell) {
          return;
        }

        dayCell.classList.remove("is-drop-target");
      });

      grid.addEventListener("drop", function (event) {
        var dayCell = event.target && event.target.closest("[data-cal-day-date]");
        if (!dayCell || !state.draggingScheduleId) {
          return;
        }

        event.preventDefault();
        dayCell.classList.remove("is-drop-target");

        var targetDate = String(dayCell.getAttribute("data-cal-day-date") || "").trim();
        if (!targetDate) {
          return;
        }

        moveCalendarSessionToDate(state.draggingScheduleId, targetDate);
      });
    }

    document.querySelectorAll("[data-cal-drag]").forEach(function (handle) {
      if (handle.getAttribute("data-cal-drag-wired") === "1") {
        return;
      }

      handle.setAttribute("data-cal-drag-wired", "1");
      handle.addEventListener("dragstart", function (event) {
        var rowId = String(handle.getAttribute("data-cal-drag") || "").trim();
        if (!rowId) {
          return;
        }

        state.draggingScheduleId = rowId;
        handle.classList.add("is-dragging");
        if (event && event.dataTransfer) {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", rowId);
        }
      });

      handle.addEventListener("dragend", function () {
        state.draggingScheduleId = null;
        handle.classList.remove("is-dragging");
        document.querySelectorAll("[data-cal-day-date].is-drop-target").forEach(function (dayCell) {
          dayCell.classList.remove("is-drop-target");
        });
      });
    });
  }

  function moveCalendarSessionToDate(rowId, targetDate) {
    var row = (state.scheduleRows || []).find(function (item) {
      return String(item && item.id || "") === String(rowId || "");
    });

    var currentDate = String(row && row.scheduled_for || "").trim();
    if (!targetDate || targetDate === currentDate) {
      return;
    }

    updateCalendarSession(rowId, { scheduled_for: targetDate });
  }

  function bindCalendarAutoSave(selector, attr, fieldName) {
    document.querySelectorAll(selector).forEach(function (input) {
      if (input.getAttribute(attr + "-wired") === "1") {
        return;
      }

      input.setAttribute(attr + "-wired", "1");
      input.addEventListener("change", function () {
        var rowId = String(input.getAttribute(attr) || "").trim();
        if (!rowId) {
          return;
        }

        var patch = {};
        patch[fieldName] = String(input.value || "").trim();
        updateCalendarSession(rowId, patch);
      });
    });
  }

  function onAddCalendarSession() {
    var assignmentInput = document.querySelector("[data-cal-new-assignment]");
    var dateInput = document.querySelector("[data-cal-new-date]");
    var slotInput = document.querySelector("[data-cal-new-slot]");
    var labelInput = document.querySelector("[data-cal-new-label]");

    var assignmentId = String(assignmentInput && assignmentInput.value || "").trim();
    var scheduledFor = String(dateInput && dateInput.value || "").trim();
    var slotKey = String(slotInput && slotInput.value || "").trim();
    var sessionLabel = String(labelInput && labelInput.value || "").trim() || "Workout";

    if (!assignmentId) {
      setStatus("Choose a training assignment for this session.", "error");
      return;
    }
    if (!scheduledFor) {
      setStatus("Choose a calendar date for the new session.", "error");
      return;
    }
    if (!slotKey) {
      setStatus("Enter a slot key (for example: w1d1).", "error");
      return;
    }

    state.calendarDraftDate = scheduledFor;

    var program = (state.programs || []).find(function (row) {
      return String(row && row.id || "") === assignmentId;
    }) || {};

    state.client
      .from("athlete_program_schedule")
      .insert({
        athlete_user_id: state.athleteId,
        user_training_program_id: assignmentId,
        program_id: program.program_id || null,
        slot_key: slotKey,
        session_label: sessionLabel,
        scheduled_for: scheduledFor,
        status: "scheduled",
        scheduled_by: state.authUser && state.authUser.id ? state.authUser.id : null,
        notes: null
      })
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        setStatus("Session added to training calendar.", "success");
        refreshPrograms();
      })
      .catch(function (err) {
        setStatus(err && err.message ? err.message : "Failed to add training session.", "error");
      });
  }

  function updateCalendarSession(rowId, patch) {
    var updates = patch || {};

    state.client
      .from("athlete_program_schedule")
      .update(updates)
      .eq("id", rowId)
      .eq("athlete_user_id", state.athleteId)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          refreshPrograms();
          return;
        }

        setStatus("Calendar session updated.", "success");
        refreshPrograms();
      })
      .catch(function (err) {
        setStatus(err && err.message ? err.message : "Failed to update training session.", "error");
        refreshPrograms();
      });
  }

  function deleteCalendarSession(rowId) {
    if (!window.confirm("Delete this scheduled session?")) {
      return;
    }

    state.client
      .from("athlete_program_schedule")
      .delete()
      .eq("id", rowId)
      .eq("athlete_user_id", state.athleteId)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        setStatus("Scheduled session deleted.", "success");
        refreshPrograms();
      })
      .catch(function (err) {
        setStatus(err && err.message ? err.message : "Failed to delete training session.", "error");
      });
  }

  function toMonthKey(dateString) {
    var parts = String(dateString || "").split("-");
    if (parts.length < 2) {
      return "";
    }
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    if (isNaN(year) || isNaN(month)) {
      return "";
    }
    return String(year) + "-" + String(month).padStart(2, "0");
  }

  function parseMonthKey(monthKey) {
    var parts = String(monthKey || "").split("-");
    if (parts.length !== 2) {
      return null;
    }
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    if (isNaN(year) || isNaN(month)) {
      return null;
    }
    var date = new Date(year, month - 1, 1);
    return isNaN(date.getTime()) ? null : date;
  }

  function shiftMonthKey(monthKey, offset) {
    var base = parseMonthKey(monthKey) || new Date();
    var next = new Date(base.getFullYear(), base.getMonth() + (parseInt(offset, 10) || 0), 1);
    return String(next.getFullYear()) + "-" + String(next.getMonth() + 1).padStart(2, "0");
  }

  function formatMonthLabel(monthKey) {
    var date = parseMonthKey(monthKey);
    if (!date) {
      return "Calendar";
    }
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  function formatDateInputFromDate(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return "";
    }
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function isIsoDate(value) {
    var text = String(value || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return false;
    }

    var parsed = new Date(text + "T00:00:00Z");
    return !isNaN(parsed.getTime());
  }

  function buildTemplateScheduleBlueprint(template) {
    return getOrderedTemplateSlotKeys(template).map(function (slotKey) {
      return {
        slot_key: slotKey,
        session_label: resolveTemplateSlotLabel(template, slotKey)
      };
    });
  }

  function getOrderedTemplateSlotKeys(template) {
    var days = template && template.days ? template.days : {};
    return Object.keys(days || {})
      .filter(function (key) {
        return /^w\d+d\d+$/i.test(String(key || ""));
      })
      .sort(function (a, b) {
        var parsedA = parseTemplateSlotKey(a);
        var parsedB = parseTemplateSlotKey(b);
        if (!parsedA || !parsedB) {
          return String(a || "").localeCompare(String(b || ""));
        }
        if (parsedA.week !== parsedB.week) {
          return parsedA.week - parsedB.week;
        }
        return parsedA.workout - parsedB.workout;
      });
  }

  function parseTemplateSlotKey(slotKey) {
    var match = /^w(\d+)d(\d+)$/i.exec(String(slotKey || ""));
    if (!match) {
      return null;
    }

    return {
      week: parseInt(match[1], 10),
      workout: parseInt(match[2], 10)
    };
  }

  function resolveTemplateSlotLabel(template, slotKey) {
    var customNames = template && template.custom_day_names && typeof template.custom_day_names === "object"
      ? template.custom_day_names
      : {};

    if (customNames[slotKey]) {
      return String(customNames[slotKey]);
    }

    var parsed = parseTemplateSlotKey(slotKey);
    if (!parsed) {
      return "Workout";
    }

    return "Week " + parsed.week + " - Workout " + parsed.workout;
  }

  function computeSlotScheduledDate(startDate, slotKey) {
    if (!isIsoDate(startDate)) {
      return "";
    }

    var parsed = parseTemplateSlotKey(slotKey);
    if (!parsed) {
      return "";
    }

    var base = new Date(startDate + "T00:00:00");
    if (isNaN(base.getTime())) {
      return "";
    }

    var offsetDays = Math.max(0, (parsed.week - 1) * 7 + (parsed.workout - 1));
    base.setDate(base.getDate() + offsetDays);
    return formatDateInputFromDate(base);
  }

  function parseTrainingTemplateRow(row) {
    if (!row || !row.id) {
      return null;
    }

    var payload = parseTemplatePayload(row.description);
    if (!payload) {
      return null;
    }

    return {
      id: String(row.id || ""),
      name: String(row.name || "Untitled Plan"),
      archived: !!payload.archived,
      days: payload.days && typeof payload.days === "object" ? payload.days : {},
      custom_day_names: payload.custom_day_names && typeof payload.custom_day_names === "object"
        ? payload.custom_day_names
        : {}
    };
  }

  function parseTemplatePayload(description) {
    var value = String(description || "");
    if (value.indexOf(TEMPLATE_MARKER) !== 0) {
      return null;
    }

    try {
      return JSON.parse(value.slice(TEMPLATE_MARKER.length));
    } catch (_error) {
      return null;
    }
  }

  function readTemplateLibrary() {
    try {
      var raw = window.localStorage.getItem(TEMPLATE_LIBRARY_KEY);
      if (!raw) {
        return [];
      }

      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map(function (item) {
        return {
          id: String(item && item.id || ""),
          name: String(item && item.name || "Untitled Plan"),
          archived: !!(item && item.archived),
          days: item && item.days && typeof item.days === "object" ? item.days : {},
          custom_day_names: item && item.custom_day_names && typeof item.custom_day_names === "object"
            ? item.custom_day_names
            : {}
        };
      }).filter(function (item) {
        return !!item.id && !item.archived;
      });
    } catch (_error) {
      return [];
    }
  }

  function buildProgramCard(program, isCurrent) {
    var name      = escapeHtml(program.program_name || program.name || "Unnamed Program");
    var assigned  = program.assigned_at ? formatDate(program.assigned_at) : "—";
    var statusBadge = isCurrent ? '<span class="insight-badge insight-badge-active">Current</span>' : '<span class="insight-badge insight-badge-inactive">Past</span>';

    // Try to parse and summarize the description / template payload
    var summary = "";
    if (program.description) {
      var parsed = tryParseJson(program.description);
      if (parsed && parsed.weeks) {
        summary = parsed.weeks + "-week program";
      } else if (parsed && parsed.days) {
        summary = "Custom " + Object.keys(parsed.days).length + "-day structure";
      } else if (typeof parsed === "object" && parsed !== null) {
        summary = "Custom program";
      } else {
        // plain text excerpt
        summary = String(program.description).slice(0, 100);
      }
    }

    return [
      '<article class="insight-program-card">',
      '<div class="insight-program-card-head">',
      '<strong class="insight-program-name">' + name + '</strong>',
      statusBadge,
      '</div>',
      summary ? '<p class="insight-program-summary">' + escapeHtml(summary) + '</p>' : '',
      '<div class="insight-program-meta">Assigned: ' + escapeHtml(assigned) + '</div>',
      !isCurrent
        ? '<div class="insight-program-past-actions"><button type="button" class="btn insight-action-btn-sm" data-training-make-current="' + escapeAttribute(program.id || "") + '">Make Current</button><button type="button" class="btn insight-program-delete-btn" data-training-delete="' + escapeAttribute(program.id || "") + '">Delete</button></div>'
        : '',
      '</article>'
    ].join("");
  }

  function wireTrainingTabs() {
    document.querySelectorAll("[data-training-tab]").forEach(function (btn) {
      if (btn.getAttribute("data-training-tab-wired") === "1") {
        return;
      }
      btn.setAttribute("data-training-tab-wired", "1");
      btn.addEventListener("click", function () {
        activateTrainingTab(btn.getAttribute("data-training-tab") || "current");
      });
    });
  }

  function activateTrainingTab(tab) {
    var nextTab = tab === "past" ? "past" : "current";
    state.trainingTab = nextTab;

    document.querySelectorAll("[data-training-tab]").forEach(function (btn) {
      var isActive = btn.getAttribute("data-training-tab") === nextTab;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    document.querySelectorAll("[data-training-panel]").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-training-panel") !== nextTab;
    });
  }

  function wirePastProgramActions() {
    document.querySelectorAll("[data-training-make-current]").forEach(function (btn) {
      if (btn.getAttribute("data-training-make-current-wired") === "1") {
        return;
      }
      btn.setAttribute("data-training-make-current-wired", "1");
      btn.addEventListener("click", function () {
        var programId = String(btn.getAttribute("data-training-make-current") || "").trim();
        if (!programId) return;
        makePastProgramCurrent(programId);
      });
    });

    document.querySelectorAll("[data-training-delete]").forEach(function (btn) {
      if (btn.getAttribute("data-training-delete-wired") === "1") {
        return;
      }
      btn.setAttribute("data-training-delete-wired", "1");
      btn.addEventListener("click", function () {
        var programId = String(btn.getAttribute("data-training-delete") || "").trim();
        if (!programId) return;
        deletePastProgram(programId);
      });
    });
  }

  function makePastProgramCurrent(programId) {
    state.client
      .from("user_training_programs")
      .update({ is_active: true })
      .eq("id", programId)
      .eq("user_id", state.athleteId)
      .eq("is_active", false)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        setStatus("Program moved to current.", "success");
        refreshPrograms();
      })
      .catch(function (err) {
        setStatus(err && err.message ? err.message : "Failed to make program current.", "error");
      });
  }

  function deletePastProgram(programId) {
    if (!window.confirm("Delete this past program assignment? This cannot be undone.")) {
      return;
    }

    state.client
      .from("user_training_programs")
      .delete()
      .eq("id", programId)
      .eq("user_id", state.athleteId)
      .eq("is_active", false)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        setStatus("Past program deleted.", "success");
        refreshPrograms();
      })
      .catch(function (err) {
        setStatus(err && err.message ? err.message : "Failed to delete past program.", "error");
      });
  }

  function refreshPrograms() {
    fetchPrograms().then(function (programs) {
      state.programs = programs || [];
      return fetchScheduleRows(state.programs).then(function (scheduleRows) {
        state.scheduleRows = scheduleRows || [];
        renderTrainingPanel(state.programs, state.scheduleRows);
      });
    }).catch(function (err) {
      setStatus(err && err.message ? err.message : "Failed to refresh training programs.", "error");
    });
  }

  // ─── Load & Activity panel ────────────────────────────────────────────────────
  function renderLoadPanel(rows) {
    var data = Array.isArray(rows) ? rows : [];
    renderLoadSummaryCards(data);
    renderLoadChart(data);
    renderRecoveryGrid(data);
  }

  // ─── Forms & tasks panel ────────────────────────────────────────────────────
  function renderFormsAndTasksPanel(forms, errorMessage) {
    var countEl = document.querySelector("[data-completed-forms-count]");
    var listEl = document.querySelector("[data-completed-forms-list]");
    if (!listEl) {
      return;
    }

    var rows = Array.isArray(forms) ? forms.slice() : [];
    rows.sort(function (a, b) {
      var aTime = new Date(a && (a.submitted_at || a.updated_at || a.assigned_at) || 0).getTime();
      var bTime = new Date(b && (b.submitted_at || b.updated_at || b.assigned_at) || 0).getTime();
      return bTime - aTime;
    });

    if (errorMessage) {
      if (countEl) {
        countEl.textContent = "Forms & Tasks";
      }
      listEl.innerHTML = '<p class="insight-error">' + escapeHtml(errorMessage) + '</p>';
      wireFormsAndTasksActions();
      return;
    }

    var activeRows = rows.filter(function (assignment) {
      return String(assignment && assignment.status || "").toLowerCase() === "assigned";
    });
    var completedRows = rows.filter(function (assignment) {
      var status = String(assignment && assignment.status || "").toLowerCase();
      return status === "submitted" || status === "archived";
    });
    state.completedAssignmentLookup = {};

    if (countEl) {
      countEl.textContent = String(activeRows.length) + " active • " + String(completedRows.length) + " completed";
    }

    listEl.innerHTML = [
      '<section class="insight-section">',
      '<h2 class="insight-section-title">Active Assignments</h2>',
      activeRows.length
        ? activeRows.map(function (assignment) {
            var dueLabel = assignment.due_date ? formatDate(assignment.due_date) : "No due date";
            var description = String(assignment.form_schema && assignment.form_schema.description || "").trim();
            return [
              '<article class="insight-form-card">',
              '<div class="insight-form-card-head">',
              '<div>',
              '<h3 class="insight-form-title">' + escapeHtml(assignment.form_name) + '</h3>',
              '<p class="insight-form-meta">Assigned ' + escapeHtml(formatDate(assignment.assigned_at)) + ' • Due ' + escapeHtml(dueLabel) + '</p>',
              '</div>',
              '<span class="insight-badge insight-badge-active">Assigned</span>',
              '</div>',
              (description ? '<p class="insight-form-meta" style="margin-top:0.25rem;">' + escapeHtml(description) + '</p>' : ''),
              '</article>'
            ].join('');
          }).join('')
        : '<p class="insight-empty">No active task forms are assigned right now.</p>',
      '</section>',
      '<section class="insight-section">',
      '<h2 class="insight-section-title">Completed History</h2>',
      completedRows.length
        ? completedRows.map(function (assignment, index) {
            var statusLabel = assignment.status === "archived" ? "Archived" : "Submitted";
            var submittedLabel = assignment.submitted_at
              ? formatDate(assignment.submitted_at)
              : (assignment.updated_at ? formatDate(assignment.updated_at) : "Not submitted");
            var dueLabel = assignment.due_date ? formatDate(assignment.due_date) : "No due date";
            var key = getCompletedAssignmentKey(assignment, index);
            var isPayment = isMembershipPaymentAssignment(assignment);
            var invoiceUrl = isPayment ? getInvoiceUrlForAssignment(assignment) : "";

            state.completedAssignmentLookup[key] = assignment;

            return [
              '<article class="insight-form-card">',
              '<div class="insight-form-card-head">',
              '<div>',
              '<h3 class="insight-form-title">' + escapeHtml(assignment.form_name) + '</h3>',
              '<p class="insight-form-meta">Assigned ' + escapeHtml(formatDate(assignment.assigned_at)) + ' • Due ' + escapeHtml(dueLabel) + '</p>',
              '<p class="insight-form-meta"><strong>Submitted:</strong> ' + escapeHtml(submittedLabel) + '</p>',
              '</div>',
              '<span class="insight-badge ' + (assignment.status === "archived" ? "insight-badge-inactive" : "insight-badge-active") + '">' + escapeHtml(statusLabel) + '</span>',
              '</div>',
              '<div class="insight-form-actions">',
              '<button type="button" class="btn insight-action-btn-sm" data-form-view-details="' + escapeAttribute(key) + '">View Details</button>',
              (isPayment
                ? '<button type="button" class="btn insight-action-btn-sm insight-invoice-btn" data-form-view-invoice="' + escapeAttribute(key) + '">' + (invoiceUrl ? 'View Invoice' : 'Invoice Unavailable') + '</button>'
                : ''),
              '</div>',
              '</article>'
            ].join("");
          }).join("")
        : '<p class="insight-empty">Completed and archived task forms will appear here once athletes submit them.</p>',
      '</section>'
    ].join('');

    wireFormsAndTasksActions();
  }

  function wireFormsAndTasksActions() {
    var openTemplateBtn = document.querySelector("[data-forms-assign-template]");
    if (openTemplateBtn && openTemplateBtn.getAttribute("data-forms-assign-template-wired") !== "1") {
      openTemplateBtn.setAttribute("data-forms-assign-template-wired", "1");
      openTemplateBtn.addEventListener("click", openFormsAssignModal);
    }

    var modal = document.querySelector("[data-forms-assign-modal]");
    if (!modal || modal.getAttribute("data-forms-assign-modal-wired") === "1") {
      return;
    }

    modal.setAttribute("data-forms-assign-modal-wired", "1");
    modal.querySelectorAll("[data-forms-assign-close]").forEach(function (btn) {
      btn.addEventListener("click", closeFormsAssignModal);
    });

    var searchInput = modal.querySelector("[data-forms-assign-search]");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        renderFormsAssignTemplateList(String(searchInput.value || ""));
      });
    }

    var assignBtn = modal.querySelector("[data-forms-assign-submit]");
    if (assignBtn) {
      assignBtn.addEventListener("click", onAssignTaskToAthlete);
    }

    wireCompletedFormsListActions();
    wireCompletedDetailsModal();
  }

  function wireCompletedFormsListActions() {
    var list = document.querySelector("[data-completed-forms-list]");
    if (!list || list.getAttribute("data-completed-list-wired") === "1") {
      return;
    }

    list.setAttribute("data-completed-list-wired", "1");
    list.addEventListener("click", function (event) {
      var detailsBtn = event.target && event.target.closest("[data-form-view-details]");
      if (detailsBtn) {
        var detailKey = String(detailsBtn.getAttribute("data-form-view-details") || "").trim();
        if (detailKey) {
          openCompletedFormDetails(detailKey);
        }
        return;
      }

      var invoiceBtn = event.target && event.target.closest("[data-form-view-invoice]");
      if (invoiceBtn) {
        var invoiceKey = String(invoiceBtn.getAttribute("data-form-view-invoice") || "").trim();
        if (invoiceKey) {
          openCompletedPaymentInvoice(invoiceKey);
        }
      }
    });
  }

  function wireCompletedDetailsModal() {
    var modal = document.querySelector("[data-completed-form-modal]");
    if (!modal || modal.getAttribute("data-completed-form-modal-wired") === "1") {
      return;
    }

    modal.setAttribute("data-completed-form-modal-wired", "1");
    modal.querySelectorAll("[data-completed-form-close]").forEach(function (btn) {
      btn.addEventListener("click", closeCompletedFormDetails);
    });
  }

  function openCompletedFormDetails(assignmentKey) {
    var assignment = state.completedAssignmentLookup[assignmentKey];
    var modal = document.querySelector("[data-completed-form-modal]");
    var titleEl = modal ? modal.querySelector("[data-completed-form-title]") : null;
    var metaEl = modal ? modal.querySelector("[data-completed-form-meta]") : null;
    var bodyEl = modal ? modal.querySelector("[data-completed-form-body]") : null;

    if (!assignment || !modal || !titleEl || !metaEl || !bodyEl) {
      return;
    }

    var submittedLabel = assignment.submitted_at
      ? formatDate(assignment.submitted_at)
      : (assignment.updated_at ? formatDate(assignment.updated_at) : "Not submitted");
    var assignedLabel = assignment.assigned_at ? formatDate(assignment.assigned_at) : "Unknown";
    var dueLabel = assignment.due_date ? formatDate(assignment.due_date) : "No due date";

    titleEl.textContent = assignment.form_name || "Completed Form";
    metaEl.textContent = "Assigned " + assignedLabel + " • Due " + dueLabel + " • Submitted " + submittedLabel;
    bodyEl.innerHTML = buildFormResponseDetailsHtml(assignment);

    modal.hidden = false;
    document.body.classList.add("admin-modal-open");
  }

  function closeCompletedFormDetails() {
    var modal = document.querySelector("[data-completed-form-modal]");
    if (!modal || modal.hidden) {
      return;
    }

    modal.hidden = true;
    document.body.classList.remove("admin-modal-open");
  }

  function openCompletedPaymentInvoice(assignmentKey) {
    var assignment = state.completedAssignmentLookup[assignmentKey];
    var invoiceUrl = getInvoiceUrlForAssignment(assignment);

    if (!invoiceUrl) {
      setStatus("No invoice link is available for this completed payment yet.", "info");
      return;
    }

    window.open(invoiceUrl, "_blank", "noopener");
  }

  function getCompletedAssignmentKey(assignment, index) {
    var id = String(assignment && assignment.id || "").trim();
    if (id) {
      return id;
    }

    return [
      String(assignment && assignment.form_id || ""),
      String(assignment && assignment.submitted_at || assignment && assignment.updated_at || ""),
      String(index)
    ].join(":");
  }

  function isMembershipPaymentAssignment(assignment) {
    var formId = String(assignment && assignment.form_id || "").trim().toLowerCase();
    var name = String(assignment && assignment.form_name || "").trim().toLowerCase();
    return formId === MEMBERSHIP_PAYMENT_TASK_FORM_ID || name.indexOf("membership payment") > -1;
  }

  function getInvoiceUrlForAssignment(assignment) {
    if (!assignment || !isMembershipPaymentAssignment(assignment)) {
      return "";
    }

    var response = assignment && assignment.response_data && typeof assignment.response_data === "object"
      ? assignment.response_data
      : {};

    var responseUrl = firstValidUrl([
      response.invoice_url,
      response.hosted_invoice_url,
      response.invoice_pdf,
      response.stripe_invoice_url,
      response.payment_invoice_url
    ]);
    if (responseUrl) {
      return responseUrl;
    }

    var rows = Array.isArray(state.foundingSubscriptionRows) ? state.foundingSubscriptionRows : [];
    for (var i = 0; i < rows.length; i += 1) {
      var url = extractInvoiceUrlFromSubscriptionRow(rows[i]);
      if (url) {
        return url;
      }
    }

    return "";
  }

  function extractInvoiceUrlFromSubscriptionRow(row) {
    var metadata = row && row.metadata && typeof row.metadata === "object" ? row.metadata : {};
    var rawEvent = row && row.raw_event && typeof row.raw_event === "object" ? row.raw_event : {};
    var invoiceHistory = Array.isArray(metadata.invoice_history) ? metadata.invoice_history : [];
    var latestInvoiceHistory = invoiceHistory.length && invoiceHistory[0] && typeof invoiceHistory[0] === "object"
      ? invoiceHistory[0]
      : {};
    var eventObject = rawEvent && rawEvent.data && rawEvent.data.object && typeof rawEvent.data.object === "object"
      ? rawEvent.data.object
      : {};
    var nestedInvoice = eventObject && eventObject.invoice && typeof eventObject.invoice === "object"
      ? eventObject.invoice
      : {};
    var metadataInvoiceId = String(metadata.invoice_id || "").trim();
    var eventInvoiceId = String(eventObject.id || nestedInvoice.id || "").trim();
    var invoiceId = metadataInvoiceId || eventInvoiceId;
    var livemode = row && row.raw_event && typeof row.raw_event === "object"
      ? row.raw_event.livemode
      : null;

    var directUrl = firstValidUrl([
      metadata.hosted_invoice_url,
      metadata.invoice_url,
      metadata.invoice_pdf,
      metadata.latest_invoice_url,
      latestInvoiceHistory.hosted_invoice_url,
      latestInvoiceHistory.invoice_url,
      latestInvoiceHistory.invoice_pdf,
      eventObject.hosted_invoice_url,
      eventObject.invoice_url,
      eventObject.invoice_pdf,
      nestedInvoice.hosted_invoice_url,
      nestedInvoice.invoice_pdf
    ]);

    if (directUrl) {
      return directUrl;
    }

    if (invoiceId) {
      return buildStripeDashboardInvoiceUrl(invoiceId, livemode);
    }

    return "";
  }

  function buildStripeDashboardInvoiceUrl(invoiceId, livemode) {
    var cleanId = String(invoiceId || "").trim();
    if (!cleanId) {
      return "";
    }

    var modeSegment = livemode === false ? "/test" : "";
    return "https://dashboard.stripe.com" + modeSegment + "/invoices/" + encodeURIComponent(cleanId);
  }

  function firstValidUrl(candidates) {
    var values = Array.isArray(candidates) ? candidates : [];
    for (var i = 0; i < values.length; i += 1) {
      var value = String(values[i] || "").trim();
      if (!value) {
        continue;
      }
      if (value.indexOf("http://") === 0 || value.indexOf("https://") === 0) {
        return value;
      }
    }
    return "";
  }

  function openFormsAssignModal() {
    var modal = document.querySelector("[data-forms-assign-modal]");
    if (!modal) {
      return;
    }

    var athleteLabel = modal.querySelector("[data-forms-assign-athlete-label]");
    if (athleteLabel) {
      athleteLabel.textContent = "Athlete: " + (((state.profile && state.profile.name) || "Selected athlete"));
    }

    var searchInput = modal.querySelector("[data-forms-assign-search]");
    var dueDateInput = modal.querySelector("[data-forms-assign-due-date]");
    var titleInput = modal.querySelector("[data-forms-quick-task-title]");
    var descriptionInput = modal.querySelector("[data-forms-quick-task-description]");
    if (searchInput) searchInput.value = "";
    if (dueDateInput) dueDateInput.value = "";
    if (titleInput) titleInput.value = "";
    if (descriptionInput) descriptionInput.value = "";

    state.selectedOnboardingTemplateId = "";
    setFormsAssignButtonsDisabled(false);
    setFormsAssignStatus("", "info");
    renderFormsAssignTemplateList("");
    modal.hidden = false;
    document.body.classList.add("admin-modal-open");
  }

  function closeFormsAssignModal() {
    var modal = document.querySelector("[data-forms-assign-modal]");
    if (!modal || modal.hidden) {
      return;
    }

    modal.hidden = true;
    document.body.classList.remove("admin-modal-open");
    state.selectedOnboardingTemplateId = "";
    setFormsAssignStatus("", "info");
  }

  function renderFormsAssignTemplateList(searchTerm) {
    var list = document.querySelector("[data-forms-assign-list]");
    if (!list) {
      return;
    }

    var query = String(searchTerm || "").trim().toLowerCase();
    var filtered = (state.onboardingTemplates || []).filter(function (template) {
      return !query || String(template && template.name || "").toLowerCase().indexOf(query) > -1;
    });

    if (!filtered.length) {
      list.innerHTML = '<p class="admin-loading">No task forms match this search.</p>';
      return;
    }

    list.innerHTML = filtered.map(function (template) {
      var checked = state.selectedOnboardingTemplateId === template.id ? ' checked' : '';
      return (
        '<label class="admin-assign-item">' +
        '<input type="radio" name="forms-assign-template" data-forms-assign-template-option value="' + escapeAttribute(template.id) + '"' + checked + ' />' +
        '<span class="admin-assign-item-main">' +
        '<strong>' + escapeHtml(template.name || 'Task Form') + '</strong>' +
        '<small>' + escapeHtml(template.description || '') + '</small>' +
        '</span>' +
        '</label>'
      );
    }).join('');

    list.querySelectorAll("[data-forms-assign-template-option]").forEach(function (radio) {
      radio.addEventListener("change", function () {
        state.selectedOnboardingTemplateId = String(radio.value || "");
      });
    });
  }

  function onAssignTaskToAthlete() {
    var titleInput = document.querySelector("[data-forms-quick-task-title]");
    var quickTaskTitle = String(titleInput && titleInput.value || "").trim();

    if (quickTaskTitle) {
      onAssignQuickTaskToAthlete();
      return;
    }

    if (state.selectedOnboardingTemplateId) {
      onAssignFormTemplateToAthlete();
      return;
    }

    setFormsAssignStatus("Select a task form or enter a quick task title.", "error");
  }

  function onAssignFormTemplateToAthlete() {
    if (!state.client || !state.athleteId) {
      setFormsAssignStatus("Unable to assign task form right now.", "error");
      return;
    }
    if (!state.selectedOnboardingTemplateId) {
      setFormsAssignStatus("Select a task form to assign.", "error");
      return;
    }
    if (state.isAssigningCoachTask) {
      return;
    }

    var template = (state.onboardingTemplates || []).find(function (item) {
      return item.id === state.selectedOnboardingTemplateId;
    });
    if (!template) {
      setFormsAssignStatus("Task form not found.", "error");
      return;
    }

    var dueDateInput = document.querySelector("[data-forms-assign-due-date]");
    var dueDate = String(dueDateInput && dueDateInput.value || "").trim();
    var nowIso = new Date().toISOString();

    state.isAssigningCoachTask = true;
    setFormsAssignButtonsDisabled(true);
    setFormsAssignStatus("Assigning task form...", "info");

    state.client
      .from("athlete_onboarding_intake_assignments")
      .select("id")
      .eq("athlete_user_id", state.athleteId)
      .eq("form_id", template.id)
      .eq("status", "assigned")
      .order("assigned_at", { ascending: false })
      .limit(1)
      .then(function (existingResult) {
        if (existingResult.error) {
          throw existingResult.error;
        }

        if (Array.isArray(existingResult.data) && existingResult.data.length) {
          setFormsAssignStatus("This task is already assigned to the athlete.", "info");
          setStatus("Task already assigned to athlete.", "info");
          return null;
        }

        return state.client
          .from("athlete_onboarding_intake_assignments")
          .insert({
            athlete_user_id: state.athleteId,
            form_id: template.id,
            form_name: template.name,
            form_schema: buildCoachTemplateAssignmentSchema(template),
            response_data: {},
            status: "assigned",
            assigned_at: nowIso,
            assigned_by: state.authUser && state.authUser.id ? state.authUser.id : null,
            due_date: dueDate || null,
            updated_at: nowIso
          });
      })
      .then(function (result) {
        if (!result) {
          return;
        }
        if (result.error) {
          throw result.error;
        }
        setFormsAssignStatus("Task form assigned.", "success");
        setStatus("Task form assigned to athlete.", "success");
        setTimeout(function () {
          closeFormsAssignModal();
          refreshFormsAndTasks();
        }, 350);
      })
      .catch(function (error) {
        setFormsAssignStatus(error && error.message ? error.message : "Failed to assign task form.", "error");
      })
      .finally(function () {
        state.isAssigningCoachTask = false;
        setFormsAssignButtonsDisabled(false);
      });
  }

  function onAssignQuickTaskToAthlete() {
    if (!state.client || !state.athleteId) {
      setFormsAssignStatus("Unable to assign quick task right now.", "error");
      return;
    }

    var titleInput = document.querySelector("[data-forms-quick-task-title]");
    var descriptionInput = document.querySelector("[data-forms-quick-task-description]");
    var dueDateInput = document.querySelector("[data-forms-assign-due-date]");
    var taskTitle = String(titleInput && titleInput.value || "").trim();
    var taskDescription = String(descriptionInput && descriptionInput.value || "").trim();
    var dueDate = String(dueDateInput && dueDateInput.value || "").trim();

    if (!taskTitle) {
      setFormsAssignStatus("Enter a quick task title.", "error");
      return;
    }
    if (state.isAssigningQuickTask) {
      return;
    }

    state.isAssigningQuickTask = true;
    setFormsAssignButtonsDisabled(true);
    setFormsAssignStatus("Assigning quick task...", "info");

    state.client
      .from("athlete_onboarding_intake_assignments")
      .insert({
        athlete_user_id: state.athleteId,
        form_id: "coach-task-" + Date.now(),
        form_name: taskTitle,
        form_schema: {
          task_type: "custom_task",
          description: taskDescription,
          questions: []
        },
        response_data: {},
        status: "assigned",
        assigned_at: new Date().toISOString(),
        assigned_by: state.authUser && state.authUser.id ? state.authUser.id : null,
        due_date: dueDate || null,
        updated_at: new Date().toISOString()
      })
      .then(function (result) {
        if (result.error) {
          setFormsAssignStatus(result.error.message, "error");
          return;
        }
        setFormsAssignStatus("Quick task assigned.", "success");
        setStatus("Quick coach task assigned to athlete.", "success");
        setTimeout(function () {
          closeFormsAssignModal();
          refreshFormsAndTasks();
        }, 350);
      })
      .catch(function (error) {
        setFormsAssignStatus(error && error.message ? error.message : "Failed to assign quick task.", "error");
      })
      .finally(function () {
        state.isAssigningQuickTask = false;
        setFormsAssignButtonsDisabled(false);
      });
  }

  function buildCoachTemplateAssignmentSchema(template) {
    var source = template && typeof template === "object" ? template : {};
    var schema = {
      description: String(source.description || ""),
      questions: Array.isArray(source.questions) ? source.questions : []
    };
    if (source.task_type) schema.task_type = String(source.task_type);
    if (source.action_label) schema.action_label = String(source.action_label);
    if (source.action_url) schema.action_url = String(source.action_url);
    if (source.action_target) schema.action_target = String(source.action_target);
    return schema;
  }

  function setFormsAssignButtonsDisabled(disabled) {
    var isDisabled = !!disabled;
    var assignBtn = document.querySelector("[data-forms-assign-submit]");
    if (assignBtn) assignBtn.disabled = isDisabled;
  }

  function setFormsAssignStatus(message, variant) {
    var statusEl = document.querySelector("[data-forms-assign-status]");
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

  function refreshFormsAndTasks() {
    Promise.all([
      fetchFormsAndTasks(),
      fetchFoundingSubscriptionPayments()
    ]).then(function (results) {
      var payload = results[0] || {};
      state.onboardingAssignments = Array.isArray(payload.rows) ? payload.rows : [];
      state.onboardingAssignmentsError = String(payload.error || "");
      state.foundingSubscriptionRows = Array.isArray(results[1]) ? results[1] : [];
      renderFormsAndTasksPanel(state.onboardingAssignments, state.onboardingAssignmentsError);
    }).catch(function (error) {
      setStatus(error && error.message ? error.message : "Failed to refresh forms and tasks.", "error");
    });
  }

  function buildFormResponsePreviewHtml(responseData) {
    var response = responseData && typeof responseData === "object" ? responseData : {};
    var keys = Object.keys(response).filter(function (key) {
      var value = response[key];
      if (value == null) {
        return false;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return String(value).trim().length > 0;
    });

    if (!keys.length) {
      return '<p class="insight-empty">No response details captured for this form.</p>';
    }

    return [
      '<div class="insight-form-response-grid">',
      keys.slice(0, 10).map(function (key) {
        return (
          '<div class="insight-form-response-row">' +
            '<strong>' + escapeHtml(formatQuestionKeyLabel(key)) + '</strong>' +
            '<span>' + escapeHtml(formatFormResponseValue(response[key])) + '</span>' +
          '</div>'
        );
      }).join(""),
      keys.length > 10 ? '<p class="insight-form-more">+' + String(keys.length - 10) + ' more response field' + (keys.length - 10 === 1 ? '' : 's') + ' recorded.</p>' : '',
      '</div>'
    ].join("");
  }

  function buildFormResponseDetailsHtml(assignment) {
    var schema = assignment && assignment.form_schema && typeof assignment.form_schema === "object"
      ? assignment.form_schema
      : {};
    var description = String(schema.description || "").trim();

    return [
      description ? '<p class="insight-form-detail-description">' + escapeHtml(description) + '</p>' : '',
      buildFormResponsePreviewHtml(assignment && assignment.response_data),
      isMembershipPaymentAssignment(assignment)
        ? buildPaymentDetailActionHtml(assignment)
        : ''
    ].join("");
  }

  function buildPaymentDetailActionHtml(assignment) {
    var invoiceUrl = getInvoiceUrlForAssignment(assignment);
    if (!invoiceUrl) {
      return '<p class="insight-empty">Invoice link is not available yet for this payment.</p>';
    }

    return '<p class="insight-form-detail-actions"><a class="btn insight-action-btn-sm insight-invoice-btn" href="' + escapeAttribute(invoiceUrl) + '" target="_blank" rel="noopener">Open Stripe Invoice</a></p>';
  }

  function formatFormResponseValue(value) {
    if (Array.isArray(value)) {
      return value.map(function (entry) { return String(entry || "").trim(); }).filter(Boolean).join(", ");
    }
    if (value && typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch (_error) {
        return "[complex response]";
      }
    }
    return String(value || "");
  }

  function formatQuestionKeyLabel(key) {
    return String(key || "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, function (char) { return char.toUpperCase(); });
  }

  function renderLoadSummaryCards(data) {
    var cardsEl = document.querySelector("[data-load-cards]");
    if (!cardsEl) return;

    if (!data.length) {
      cardsEl.innerHTML = '<p class="insight-empty">No Strava daily metrics synced yet. Connect and sync Strava from the athlete dashboard to unlock load tracking.</p>';
      return;
    }

    var seven  = data.slice(0, 7);
    var thirty = data.slice(0, 30);

    var cards = [
      { label: "7-Day Distance",      value: formatDecimal(sumNumeric(seven, "distance_m") / 1000, 1) + " km" },
      { label: "7-Day Moving Time",   value: formatDecimal(sumNumeric(seven, "moving_time_sec") / 3600, 1) + " h" },
      { label: "7-Day Elevation",     value: formatInteger(sumNumeric(seven, "elevation_gain_m")) + " m" },
      { label: "7-Day Activities",    value: formatInteger(sumNumeric(seven, "activity_count")) },
      { label: "7-Day Training Load", value: formatInteger(sumNumeric(seven, "training_load")) },
      { label: "30-Day Load",         value: formatInteger(sumNumeric(thirty, "training_load")) },
      { label: "Resting HR",          value: formatNullable(findLatestDefined(data, "resting_hr"), " bpm") },
      { label: "HRV",                 value: formatNullable(findLatestDefined(data, "hrv_ms"), " ms") }
    ];

    cardsEl.innerHTML = cards.map(function (c) {
      return [
        '<article class="insight-load-card">',
        '<span class="insight-load-label">' + escapeHtml(c.label) + '</span>',
        '<strong class="insight-load-value">' + escapeHtml(c.value) + '</strong>',
        '</article>'
      ].join("");
    }).join("");
  }

  function renderLoadChart(data) {
    var chartEl = document.querySelector("[data-load-chart]");
    if (!chartEl) return;

    var withLoad = data.filter(function (d) { return d.training_load != null && Number(d.training_load) > 0; });
    if (!withLoad.length) {
      chartEl.innerHTML = '<p class="insight-empty">No training load data available for charting.</p>';
      return;
    }

    var reversed = withLoad.slice().reverse(); // oldest first
    var maxLoad = reversed.reduce(function (max, d) { return Math.max(max, Number(d.training_load) || 0); }, 0) || 1;

    var bars = reversed.map(function (d) {
      var load = Number(d.training_load) || 0;
      var pct  = Math.round((load / maxLoad) * 100);
      var date = (d.metric_date || "").slice(5); // MM-DD
      return [
        '<div class="insight-bar-wrap" title="' + escapeHtml(d.metric_date || "") + ': load ' + load + '">',
        '<div class="insight-bar" style="height:' + pct + '%"></div>',
        '<span class="insight-bar-label">' + escapeHtml(date) + '</span>',
        '</div>'
      ].join("");
    }).join("");

    chartEl.innerHTML = '<div class="insight-bar-chart">' + bars + '</div><p class="insight-chart-note">Daily training load — bars scaled to peak. Hover for date and load value.</p>';
  }

  function renderRecoveryGrid(data) {
    var gridEl = document.querySelector("[data-recovery-grid]");
    if (!gridEl) return;

    var recoveryRows = data.filter(function (d) {
      return d.recovery_score != null || d.resting_hr != null || d.hrv_ms != null || d.sleep_hours != null;
    }).slice(0, 7);

    if (!recoveryRows.length) {
      gridEl.innerHTML = '<p class="insight-empty">No recovery or wellness data synced yet.</p>';
      return;
    }

    var header = '<div class="insight-recovery-row insight-recovery-header"><span>Date</span><span>Recovery</span><span>Resting HR</span><span>HRV</span><span>Sleep</span></div>';
    var rows = recoveryRows.map(function (d) {
      return [
        '<div class="insight-recovery-row">',
        '<span>' + escapeHtml(d.metric_date ? d.metric_date.slice(5) : "—") + '</span>',
        '<span>' + formatNullable(d.recovery_score) + '</span>',
        '<span>' + formatNullable(d.resting_hr, " bpm") + '</span>',
        '<span>' + formatNullable(d.hrv_ms, " ms") + '</span>',
        '<span>' + formatNullable(d.sleep_hours, " h") + '</span>',
        '</div>'
      ].join("");
    }).join("");

    gridEl.innerHTML = '<div class="insight-recovery-table">' + header + rows + '</div>';
  }

  // ─── DOM helpers ──────────────────────────────────────────────────────────────
  function showContent() {
    var guard   = document.querySelector("[data-insight-guard]");
    var content = document.querySelector("[data-insight-content]");
    if (guard)   guard.hidden   = true;
    if (content) content.hidden = false;
  }

  function showGuardError(msg) {
    var guard = document.querySelector("[data-insight-guard]");
    if (guard) {
      guard.innerHTML = '<p class="insight-error">' + escapeHtml(msg) + '</p><p><a href="admin.html" class="btn">← Back to Coaching Dashboard</a></p>';
    }
  }

  function setText(selector, value) {
    var el = document.querySelector(selector);
    if (el) el.textContent = value || "";
  }

  function setChip(selector, value) {
    var el = document.querySelector(selector);
    if (!el) return;
    if (value && String(value).trim()) {
      el.textContent = String(value).trim();
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  }

  function setStatus(msg, variant) {
    var el = document.querySelector("[data-insight-status]");
    if (!el) return;
    el.textContent = msg || "";
    el.className = "insight-status" + (variant ? " is-" + variant : "");
  }

  // ─── Format helpers ───────────────────────────────────────────────────────────
  function formatSex(sex) {
    var map = { male: "Male", female: "Female", other: "Other", "prefer-not-to-say": "Prefer not to say" };
    return (sex && map[sex]) ? map[sex] : (sex ? sex : "");
  }

  function formatKey(key) {
    return String(key).replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function capitalize(value) {
    var text = String(value || "").trim();
    if (!text) {
      return "";
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
      var d = new Date(dateString);
      if (Number.isNaN(d.getTime())) return String(dateString);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch (e) { return String(dateString); }
  }

  function getTodayDateInputValue() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function formatInteger(value) {
    var n = Number(value);
    return Number.isFinite(n) ? Math.round(n).toString() : "—";
  }

  function formatDecimal(value, digits) {
    var n = Number(value);
    return Number.isFinite(n) ? n.toFixed(typeof digits === "number" ? digits : 1) : "—";
  }

  function formatNullable(value, suffix) {
    var n = Number(value);
    return Number.isFinite(n) ? formatInteger(n) + String(suffix || "") : "—";
  }

  function sumNumeric(rows, field) {
    return (Array.isArray(rows) ? rows : []).reduce(function (sum, row) {
      var v = Number(row && row[field]);
      return Number.isFinite(v) ? sum + v : sum;
    }, 0);
  }

  function findLatestDefined(rows, field) {
    var match = (Array.isArray(rows) ? rows : []).find(function (r) { return r && r[field] != null; });
    return match ? match[field] : null;
  }

  function shortName(str) {
    return str.length > 22 ? str.slice(0, 20) + "…" : str;
  }

  function tryParseJson(str) {
    if (typeof str !== "string") return str;
    try { return JSON.parse(str); } catch (e) { return null; }
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

  function isMissingRelationError(error) {
    if (!error) {
      return false;
    }

    var message = String(error.message || "").toLowerCase();
    var details = String(error.details || "").toLowerCase();
    var hint = String(error.hint || "").toLowerCase();
    return (
      message.indexOf("does not exist") > -1 ||
      message.indexOf("relation") > -1 ||
      details.indexOf("does not exist") > -1 ||
      hint.indexOf("does not exist") > -1
    );
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c];
    });
  }

  function escapeAttribute(str) {
    return escapeHtml(str).replace(/`/g, "");
  }

  // ─── Coach Notes ───────────────────────────────────────────────────────────────

  function initNotesPanel() {
    var form      = document.querySelector("[data-notes-form]");
    var textarea  = document.querySelector("[data-notes-textarea]");
    var charCount = document.querySelector("[data-notes-char-count]");

    if (textarea && charCount) {
      textarea.addEventListener("input", function () {
        charCount.textContent = textarea.value.length + " / 4000";
      });
    }

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        submitNote();
      });
    }

    fetchNotes();
  }

  function fetchNotes() {
    var listEl = document.querySelector("[data-notes-list]");
    var countEl = document.querySelector("[data-notes-count]");
    if (listEl) listEl.innerHTML = '<p class="insight-loading">Loading notes…</p>';

    state.client
      .from("coach_notes")
      .select("id, note_text, created_at, updated_at")
      .eq("athlete_id", state.athleteId)
      .order("created_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          if (listEl) listEl.innerHTML = '<p class="insight-error">Could not load notes: ' + escapeHtml(result.error.message) + '</p>';
          return;
        }
        var notes = result.data || [];
        if (countEl) countEl.textContent = notes.length ? "(" + notes.length + ")" : "";
        renderNotesList(notes);
      })
      .catch(function (err) {
        if (listEl) listEl.innerHTML = '<p class="insight-error">Could not load notes.</p>';
      });
  }

  function renderNotesList(notes) {
    var listEl = document.querySelector("[data-notes-list]");
    if (!listEl) return;

    if (!notes.length) {
      listEl.innerHTML = '<p class="insight-empty">No notes yet. Add your first note above.</p>';
      return;
    }

    listEl.innerHTML = notes.map(function (note) {
      var date = formatDate(note.created_at);
      var wasEdited = note.updated_at && note.updated_at !== note.created_at;
      return [
        '<article class="insight-note-card" data-note-id="' + escapeAttribute(note.id) + '">',
        '<div class="insight-note-body" data-note-body>' + escapeHtml(note.note_text) + '</div>',
        '<div class="insight-note-footer">',
        '<span class="insight-note-meta">' + escapeHtml(date) + (wasEdited ? ' · edited' : '') + '</span>',
        '<div class="insight-note-actions">',
        '<button type="button" class="insight-note-btn insight-note-edit-btn" data-note-edit="' + escapeAttribute(note.id) + '">Edit</button>',
        '<button type="button" class="insight-note-btn insight-note-delete-btn" data-note-delete="' + escapeAttribute(note.id) + '">Delete</button>',
        '</div>',
        '</div>',
        // Inline edit form (hidden by default)
        '<div class="insight-note-edit-area" data-note-edit-area="' + escapeAttribute(note.id) + '" hidden>',
        '<textarea class="insight-notes-textarea insight-note-edit-textarea" maxlength="4000" rows="4">' + escapeHtml(note.note_text) + '</textarea>',
        '<div class="insight-notes-form-footer">',
        '<button type="button" class="btn insight-action-btn" data-note-save="' + escapeAttribute(note.id) + '">Save</button>',
        '<button type="button" class="btn insight-back-btn" data-note-cancel="' + escapeAttribute(note.id) + '">Cancel</button>',
        '</div>',
        '</div>',
        '</article>'
      ].join("");
    }).join("");

    // Wire buttons
    listEl.querySelectorAll("[data-note-edit]").forEach(function (btn) {
      btn.addEventListener("click", function () { openNoteEdit(btn.getAttribute("data-note-edit")); });
    });
    listEl.querySelectorAll("[data-note-cancel]").forEach(function (btn) {
      btn.addEventListener("click", function () { closeNoteEdit(btn.getAttribute("data-note-cancel")); });
    });
    listEl.querySelectorAll("[data-note-save]").forEach(function (btn) {
      btn.addEventListener("click", function () { saveNoteEdit(btn.getAttribute("data-note-save")); });
    });
    listEl.querySelectorAll("[data-note-delete]").forEach(function (btn) {
      btn.addEventListener("click", function () { deleteNote(btn.getAttribute("data-note-delete")); });
    });
  }

  function submitNote() {
    var textarea   = document.querySelector("[data-notes-textarea]");
    var statusEl   = document.querySelector("[data-notes-form-status]");
    var submitBtn  = document.querySelector("[data-notes-submit]");

    var text = textarea ? textarea.value.trim() : "";
    if (!text) return;

    if (submitBtn) submitBtn.disabled = true;
    if (statusEl) { statusEl.textContent = "Saving…"; statusEl.className = "insight-notes-form-status"; }

    state.client
      .from("coach_notes")
      .insert({ coach_id: state.authUser.id, athlete_id: state.athleteId, note_text: text })
      .then(function (result) {
        if (result.error) {
          if (statusEl) { statusEl.textContent = "Error: " + result.error.message; statusEl.className = "insight-notes-form-status is-error"; }
        } else {
          if (textarea) { textarea.value = ""; }
          var charCount = document.querySelector("[data-notes-char-count]");
          if (charCount) charCount.textContent = "0 / 4000";
          if (statusEl) { statusEl.textContent = "Note saved."; statusEl.className = "insight-notes-form-status is-success"; }
          setTimeout(function () { if (statusEl) statusEl.textContent = ""; }, 2500);
          fetchNotes();
        }
      })
      .catch(function () {
        if (statusEl) { statusEl.textContent = "Failed to save note."; statusEl.className = "insight-notes-form-status is-error"; }
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  }

  function openNoteEdit(id) {
    var card    = document.querySelector('[data-note-id="' + id + '"]');
    if (!card) return;
    card.querySelector("[data-note-body]").hidden   = true;
    card.querySelector(".insight-note-footer").hidden = true;
    card.querySelector('[data-note-edit-area="' + id + '"]').hidden = false;
    var ta = card.querySelector("textarea");
    if (ta) { ta.focus(); ta.selectionStart = ta.selectionEnd = ta.value.length; }
  }

  function closeNoteEdit(id) {
    var card = document.querySelector('[data-note-id="' + id + '"]');
    if (!card) return;
    card.querySelector("[data-note-body]").hidden   = false;
    card.querySelector(".insight-note-footer").hidden = false;
    card.querySelector('[data-note-edit-area="' + id + '"]').hidden = true;
  }

  function saveNoteEdit(id) {
    var card = document.querySelector('[data-note-id="' + id + '"]');
    if (!card) return;
    var ta   = card.querySelector('[data-note-edit-area="' + id + '"] textarea');
    var text = ta ? ta.value.trim() : "";
    if (!text) return;

    var saveBtn = card.querySelector('[data-note-save="' + id + '"]');
    if (saveBtn) saveBtn.disabled = true;

    state.client
      .from("coach_notes")
      .update({ note_text: text })
      .eq("id", id)
      .then(function (result) {
        if (result.error) {
          alert("Could not save: " + result.error.message);
          if (saveBtn) saveBtn.disabled = false;
        } else {
          fetchNotes();
        }
      })
      .catch(function () {
        alert("Failed to save note.");
        if (saveBtn) saveBtn.disabled = false;
      });
  }

  function deleteNote(id) {
    if (!window.confirm("Delete this note? This cannot be undone.")) return;

    state.client
      .from("coach_notes")
      .delete()
      .eq("id", id)
      .then(function (result) {
        if (result.error) {
          alert("Could not delete: " + result.error.message);
        } else {
          fetchNotes();
        }
      })
      .catch(function () {
        alert("Failed to delete note.");
      });
  }

})();

