(function () {
  "use strict";

  var ADMIN_EMAIL = "joe@nomadicperformance.com";

  var state = {
    client: null,
    athleteId: null,
    profile: null,
    authUser: null,
    metrics: [],
    programs: [],
    scheduleRows: [],
    stravaRows: [],
    trainingTab: "current",
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
    var editUrl    = "profile.html?coachView=1&athleteId=" + id;
    var metricsUrl = "metrics-editor.html?athleteId=" + id;
    var reportUrl  = "profile.html?coachView=1&athleteId=" + id + "&printMetricReport=1#profile-metrics-section";
    var programUrl = "profile.html?coachView=1&athleteId=" + id + "#profile-training-program-section";

    setLink("[data-insight-edit-link]",     editUrl);
    setLink("[data-insight-metrics-link]",  metricsUrl);
    setLink("[data-insight-metrics-link2]", metricsUrl);
    setLink("[data-insight-metrics-report-link]", reportUrl);
    setLink("[data-insight-programs-link]", programUrl);
    setLink("[data-insight-programs-link2]",programUrl);
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
      fetchStrava()
    ]).then(function (results) {
      var authUser = results[0];
      var profile  = results[1];

      state.profile  = profile;
      state.metrics  = results[2] || [];
      state.programs = results[3] || [];
      state.stravaRows = results[4] || [];

      return fetchScheduleRows(state.programs).then(function (scheduleRows) {
        state.scheduleRows = scheduleRows || [];

        renderHero(authUser, profile);
        renderOverviewPanel(profile);
        renderMetricsPanel(state.metrics);
        renderTrainingPanel(state.programs, state.scheduleRows);
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

    if (!metrics.length) {
      if (countEl) countEl.textContent = "No metrics recorded yet.";
      gridEl.innerHTML = '<p class="insight-empty">No metrics have been recorded for this athlete. Use the Metrics Editor to add baseline tests.</p>';
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

    // Build history map (by metric name, sorted newest-first)
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
        if (!seen[m.metric_name]) {
          seen[m.metric_name] = true;
          unique.push(m);
        }
      });

      html += '<section class="insight-metric-category">';
      html += '<h3 class="insight-metric-cat-label">' + escapeHtml(cat) + '</h3>';
      html += '<div class="insight-metric-cards">';

      unique.forEach(function (m) {
        var history = historyMap[m.metric_name] || [];
        var delta   = history.length > 1 ? computeDelta(history[0], history[1]) : null;
        var tested  = formatDate(m.updated_at || m.created_at || "");

        html += '<article class="insight-metric-card">';
        html += '<div class="insight-metric-name">' + escapeHtml(m.metric_name) + '</div>';
        html += '<div class="insight-metric-value-row">';
        html += '<strong class="insight-metric-value">' + escapeHtml(m.metric_value || "—") + (m.metric_unit ? ' <span class="insight-metric-unit">' + escapeHtml(m.metric_unit) + '</span>' : '') + '</strong>';
        if (delta !== null) {
          var deltaClass = delta.direction === "up" ? "insight-delta-up" : (delta.direction === "down" ? "insight-delta-down" : "insight-delta-neutral");
          html += '<span class="insight-delta ' + deltaClass + '">' + escapeHtml(delta.label) + '</span>';
        }
        html += '</div>';
        html += '<div class="insight-metric-meta">Last tested ' + escapeHtml(tested) + '</div>';
        if (history.length > 1) {
          html += '<button type="button" class="insight-metric-history-btn" data-metric-history="' + escapeAttribute(m.metric_name) + '">History (' + history.length + ')</button>';
          html += '<div class="insight-metric-history-list" data-history-for="' + escapeAttribute(m.metric_name) + '" hidden>';
          history.slice(1).forEach(function (entry) {
            html += '<div class="insight-history-row"><span>' + escapeHtml(formatDate(entry.updated_at || entry.created_at || "")) + '</span><span>' + escapeHtml(entry.metric_value || "—") + (entry.metric_unit ? " " + escapeHtml(entry.metric_unit) : "") + '</span></div>';
          });
          html += '</div>';
        }
        html += '</article>';
      });

      html += '</div></section>';
    });

    gridEl.innerHTML = html;

    // Wire history toggles
    gridEl.querySelectorAll("[data-metric-history]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var name    = btn.getAttribute("data-metric-history");
        var listEl  = gridEl.querySelector('[data-history-for="' + name + '"]');
        if (!listEl) return;
        var visible = !listEl.hidden;
        listEl.hidden = visible;
        btn.textContent = visible ? ("History (" + (historyMap[name] || []).length + ")") : "Hide History";
      });
    });
  }

  function buildHistoryMap(metrics) {
    var map = {};
    metrics.forEach(function (m) {
      if (!map[m.metric_name]) map[m.metric_name] = [];
      map[m.metric_name].push(m);
    });
    Object.keys(map).forEach(function (name) {
      map[name].sort(function (a, b) {
        return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0);
      });
    });
    return map;
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
          '<p class="insight-empty">No current training programs assigned. Use "Assign / Manage Programs" to add one.</p>' +
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

    var assignmentOptions = programs.map(function (program) {
      var id = String(program && program.id || "");
      var label = String(program && (program.program_name || program.name) || "Assigned Program");
      return '<option value="' + escapeAttribute(id) + '">' + escapeHtml(label) + '</option>';
    }).join("");

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
    var gridHtml = buildCalendarMonthGridHtml(state.calendarMonthKey, scopedRows, activeIdMap, state.selectedScheduleId);
    var editorHtml = buildCalendarEditorHtml(scopedRows, activeIdMap, state.selectedScheduleId);

    return [
      '<section class="insight-section insight-calendar-manager">',
      '<h2 class="insight-section-title">Training Calendar Manager</h2>',
      '<p class="insight-calendar-help">Adjust dates, labels, and statuses directly from insights. Changes save automatically.</p>',
      '<div class="insight-calendar-add-row">',
      '<select class="insight-calendar-input" data-cal-new-assignment>' + assignmentOptions + '</select>',
      '<input type="date" class="insight-calendar-input" data-cal-new-date value="' + escapeAttribute(getTodayDateInputValue()) + '" />',
      '<input type="text" class="insight-calendar-input" data-cal-new-slot placeholder="w1d1" value="w1d1" />',
      '<input type="text" class="insight-calendar-input" data-cal-new-label placeholder="Session label" />',
      '<button type="button" class="btn insight-action-btn" data-cal-add>Add Session</button>',
      '</div>',
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

  function buildCalendarMonthGridHtml(monthKey, scopedRows, activeIdMap, selectedScheduleId) {
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
        '<div class="insight-cal-day' + (rows.length ? ' has-session' : '') + '" data-cal-day-date="' + escapeAttribute(dateKey) + '">' +
          '<div class="insight-cal-day-number">' + day + '</div>' +
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
    var addBtn = document.querySelector("[data-cal-add]");
    if (addBtn && addBtn.getAttribute("data-cal-add-wired") !== "1") {
      addBtn.setAttribute("data-cal-add-wired", "1");
      addBtn.addEventListener("click", onAddCalendarSession);
    }

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
    bindCalendarDragAndDrop();
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
      setStatus("Choose an active program for this session.", "error");
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

    var viewUrl = "profile.html?coachView=1&athleteId=" + encodeURIComponent(state.athleteId) + "#profile-training-program-section";

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
      '<a href="' + viewUrl + '" class="btn insight-action-btn-sm" style="margin-top:0.6rem;">View &amp; Manage</a>',
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

