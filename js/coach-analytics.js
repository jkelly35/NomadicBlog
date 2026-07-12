(function () {
  "use strict";

  var ADMIN_EMAIL = "joe@nomadicperformance.com";

  var state = {
    client: null,
    coachUser: null,
    athletes: [],
    visibleAthletes: [],
    athleteAccountFilter: "active",
    selectedAthleteId: "",
    windowDays: 30,
    recoveryRows: [],
    exerciseRows: [],
    stravaRows: [],
    cognitiveRows: [],
    contextRows: [],
    programmingRows: [],
    populationMetricRows: [],
    populationAssessmentRows: [],
    populationDerivedRows: [],
    populationLoaded: false,
    populationMetricName: "20mm Edge Hang Strength",
    populationSportFilter: "climbing",
    populationTarget: "climbing_level",
    populationLeaderboardMode: "research",
    metricCatalogRows: [],
    researchQuestionsRows: []
  };

  document.addEventListener("DOMContentLoaded", function () {
    initialize();
  });

  function initialize() {
    if (!window.supabase || !window.supabase.createClient) {
      showGuardError("Supabase client library failed to load.");
      return;
    }

    var url = window.NOMADIC_SUPABASE_URL;
    var key = window.NOMADIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      showGuardError("Supabase configuration is incomplete.");
      return;
    }

    state.client = window.supabase.createClient(url, key);

    state.client.auth.getSession().then(function (result) {
      var session = result && result.data && result.data.session;
      if (!session || !session.user) {
        window.location.replace("index.html");
        return;
      }

      state.coachUser = session.user;
      if (!isCoachUser(session.user)) {
        showGuardError("Coach access is required.");
        setTimeout(function () {
          window.location.replace("index.html");
        }, 1200);
        return;
      }

      showContent();
      bindEvents();
      setAssessmentDefaults();
      loadAnalyticsCatalog();
      loadAthletes();
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      if (!session) {
        window.location.replace("index.html");
      }
    });
  }

  function isCoachUser(user) {
    return String(user && user.email || "").trim().toLowerCase() === ADMIN_EMAIL;
  }

  function bindEvents() {
    var athleteSelect = document.querySelector("[data-analytics-athlete-select]");
    if (athleteSelect) {
      athleteSelect.addEventListener("change", function (event) {
        state.selectedAthleteId = String(event && event.target && event.target.value || "").trim();
        loadAnalytics();
      });
    }

    var windowSelect = document.querySelector("[data-analytics-window-select]");
    if (windowSelect) {
      windowSelect.addEventListener("change", function (event) {
        var days = parseInt(String(event && event.target && event.target.value || "30"), 10);
        state.windowDays = Number.isFinite(days) && days > 0 ? days : 30;
        renderAll();
      });
    }

    var athleteStatusFilter = document.querySelector("[data-analytics-athlete-status-filter]");
    if (athleteStatusFilter) {
      athleteStatusFilter.addEventListener("change", function (event) {
        state.athleteAccountFilter = String(event && event.target && event.target.value || "active").trim().toLowerCase() || "active";
        renderAthleteOptions();
        loadAnalytics();
      });
    }

    var refreshButton = document.querySelector("[data-analytics-refresh]");
    if (refreshButton) {
      refreshButton.addEventListener("click", function () {
        loadAnalytics();
      });
    }

    var csvExportButton = document.querySelector("[data-analytics-csv-export]");
    if (csvExportButton) {
      csvExportButton.addEventListener("click", function () {
        exportAllDataAsCsv();
      });
    }

    var populationMetricSelect = document.querySelector("[data-population-metric-select]");
    if (populationMetricSelect) {
      populationMetricSelect.addEventListener("change", function (event) {
        state.populationMetricName = String(event && event.target && event.target.value || "").trim() || state.populationMetricName;
        renderPopulationAnalytics();
      });
    }

    var populationSportFilterSelect = document.querySelector("[data-population-sport-filter]");
    if (populationSportFilterSelect) {
      populationSportFilterSelect.addEventListener("change", function (event) {
        state.populationSportFilter = String(event && event.target && event.target.value || "all").trim() || "all";
        renderPopulationAnalytics();
      });
    }

    var populationTargetSelect = document.querySelector("[data-population-target-select]");
    if (populationTargetSelect) {
      populationTargetSelect.addEventListener("change", function (event) {
        state.populationTarget = String(event && event.target && event.target.value || "climbing_level").trim() || "climbing_level";
        renderPopulationAnalytics();
      });
    }

    var populationModeSelect = document.querySelector("[data-population-mode-select]");
    if (populationModeSelect) {
      populationModeSelect.addEventListener("change", function (event) {
        state.populationLeaderboardMode = String(event && event.target && event.target.value || "research").trim() || "research";
        renderPopulationAnalytics();
      });
    }

    var populationRefresh = document.querySelector("[data-population-refresh]");
    if (populationRefresh) {
      populationRefresh.addEventListener("click", function () {
        setStatus("Refreshing population dataset...", "info");
        loadPopulationData()
          .then(function () {
            renderPopulationAnalytics();
            setStatus("Population analytics updated.", "success");
          })
          .catch(function (error) {
            setStatus(error && error.message ? error.message : "Failed to refresh population analytics.", "error");
          });
      });
    }

    var assessmentSave = document.querySelector("[data-assessment-save]");
    if (assessmentSave) {
      assessmentSave.addEventListener("click", function () {
        saveAssessmentEvent();
      });
    }
  }

  function setAssessmentDefaults() {
    var dateInput = document.querySelector("[data-assessment-date-input]");
    if (dateInput && !dateInput.value) {
      dateInput.value = getTodayDateInputValue();
    }
  }

  function exportAllDataAsCsv() {
    if (!state.client) {
      setStatus("Supabase client is not ready.", "error");
      return;
    }

    setStatus("Preparing CSV export...", "info");

    Promise.all([
      fetchAllRowsForExport("athlete_profiles"),
      fetchAllRowsForExport("athlete_metrics"),
      fetchAllRowsForExport("athlete_assessment_events"),
      fetchAllRowsForExport("athlete_outcome_events"),
      fetchAllRowsForExport("athlete_derived_metrics_latest"),
      fetchAllRowsForExport("athlete_derived_metric_events"),
      fetchAllRowsForExport("analytics_feature_observations"),
      fetchAllRowsForExport("analytics_feature_observations_latest"),
      fetchAllRowsForExport("athlete_recovery_daily"),
      fetchAllRowsForExport("athlete_exercise_history"),
      fetchAllRowsForExport("athlete_strava_daily_metrics"),
      fetchAllRowsForExport("athlete_cognitive_daily"),
      fetchAllRowsForExport("athlete_context_daily"),
      fetchAllRowsForExport("athlete_programming_sessions"),
      fetchAllRowsForExport("analytics_categories"),
      fetchAllRowsForExport("analytics_metric_catalog"),
      fetchAllRowsForExport("analytics_research_questions")
    ]).then(function (results) {
      var tables = {
        athlete_profiles: results[0] || [],
        athlete_metrics: results[1] || [],
        athlete_assessment_events: results[2] || [],
        athlete_outcome_events: results[3] || [],
        athlete_derived_metrics_latest: results[4] || [],
        athlete_derived_metric_events: results[5] || [],
        analytics_feature_observations: results[6] || [],
        analytics_feature_observations_latest: results[7] || [],
        athlete_recovery_daily: results[8] || [],
        athlete_exercise_history: results[9] || [],
        athlete_strava_daily_metrics: results[10] || [],
        athlete_cognitive_daily: results[11] || [],
        athlete_context_daily: results[12] || [],
        athlete_programming_sessions: results[13] || [],
        analytics_categories: results[14] || [],
        analytics_metric_catalog: results[15] || [],
        analytics_research_questions: results[16] || []
      };

      var csv = buildCombinedCsvFromTables(tables);
      downloadCsv(csv, "nomadic-analytics-export-" + getTodayDateInputValue() + ".csv");

      var rowCount = Object.keys(tables).reduce(function (sum, key) {
        return sum + (Array.isArray(tables[key]) ? tables[key].length : 0);
      }, 0);

      setStatus("CSV export complete. Rows exported: " + String(rowCount) + ".", "success");
    }).catch(function (error) {
      setStatus(error && error.message ? error.message : "Failed to export CSV.", "error");
    });
  }

  function buildCombinedCsvFromTables(tables) {
    var combinedRows = [];
    var keyMap = {
      source_table: true,
      exported_at: true
    };
    var exportedAt = new Date().toISOString();

    Object.keys(tables || {}).forEach(function (tableName) {
      var rows = Array.isArray(tables[tableName]) ? tables[tableName] : [];
      rows.forEach(function (row) {
        var normalizedRow = {
          source_table: tableName,
          exported_at: exportedAt
        };

        Object.keys(row || {}).forEach(function (key) {
          keyMap[key] = true;
          normalizedRow[key] = normalizeCsvValue(row[key]);
        });

        combinedRows.push(normalizedRow);
      });
    });

    var headers = Object.keys(keyMap);
    var lines = [];
    lines.push(headers.map(csvEscape).join(","));

    combinedRows.forEach(function (row) {
      var values = headers.map(function (header) {
        return csvEscape(row && row[header] != null ? row[header] : "");
      });
      lines.push(values.join(","));
    });

    return lines.join("\n");
  }

  function normalizeCsvValue(value) {
    if (value == null) {
      return "";
    }

    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch (_error) {
        return "";
      }
    }

    return String(value);
  }

  function csvEscape(value) {
    var text = String(value == null ? "" : value);
    if (/[",\n\r]/.test(text)) {
      return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
  }

  function downloadCsv(csvText, fileName) {
    var blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    var url = window.URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = fileName || "analytics-export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  function fetchAllRowsForExport(tableName) {
    var rows = [];
    var pageSize = 1000;

    function loadPage(start) {
      var end = start + pageSize - 1;
      return state.client
        .from(tableName)
        .select("*")
        .range(start, end)
        .then(function (result) {
          if (result && result.error) {
            if (isMissingRelationError(result.error)) {
              return rows;
            }
            throw result.error;
          }

          var page = Array.isArray(result && result.data) ? result.data : [];
          rows = rows.concat(page);
          if (page.length < pageSize) {
            return rows;
          }

          return loadPage(start + pageSize);
        });
    }

    return loadPage(0);
  }


  function loadAthletes() {
    var athleteSelect = document.querySelector("[data-analytics-athlete-select]");
    if (!athleteSelect) {
      return;
    }

    athleteSelect.innerHTML = '<option value="">Loading athletes...</option>';

    fetchAthleteProfileRows()
      .then(function (rows) {
        state.athletes = (Array.isArray(rows) ? rows : [])
          .map(function (row) {
            return {
              user_id: String(row && row.user_id || "").trim(),
              name: String(row && row.name || "").trim() || "Unnamed Athlete",
              is_active: row && row.is_active !== false,
              deleted_at: row && row.deleted_at ? String(row.deleted_at) : "",
              is_deleted: !!(row && row.deleted_at),
              sport: String(row && row.sport || "").trim(),
              level: String(row && row.level || "").trim(),
              sports: Array.isArray(row && row.sports) ? row.sports : [],
              sport_overview: row && row.sport_overview && typeof row.sport_overview === "object" ? row.sport_overview : null
            };
          })
          .filter(function (row) {
            return !!row.user_id;
          });

        renderAthleteOptions();

        if (!state.selectedAthleteId && state.visibleAthletes.length) {
          state.selectedAthleteId = state.visibleAthletes[0].user_id;
        }

        athleteSelect.value = state.selectedAthleteId;
        loadAnalytics();
      })
      .catch(function (error) {
        athleteSelect.innerHTML = '<option value="">No athletes available</option>';
        setStatus(error && error.message ? error.message : "Failed to load athletes.", "error");
      });
  }

  function fetchAthleteProfileRows() {
    return state.client
      .from("athlete_profiles")
      .select("user_id,name,is_active,deleted_at,sport,level,sports,sport_overview")
      .order("name", { ascending: true })
      .then(function (result) {
        if (!result || !result.error) {
          return (result && result.data) || [];
        }

        if (!isMissingColumnError(result.error)) {
          throw result.error;
        }

        return state.client
          .from("athlete_profiles")
          .select("user_id,name,is_active,sport,level,sports,sport_overview")
          .order("name", { ascending: true })
          .then(function (fallbackResult) {
            if (fallbackResult && fallbackResult.error) {
              throw fallbackResult.error;
            }

            return (fallbackResult && fallbackResult.data) || [];
          });
      });
  }

  function renderAthleteOptions() {
    var athleteSelect = document.querySelector("[data-analytics-athlete-select]");
    if (!athleteSelect) {
      return;
    }

    state.visibleAthletes = (state.athletes || []).filter(matchesAthleteAccountFilter);

    if (!state.visibleAthletes.length) {
      state.selectedAthleteId = "";
      athleteSelect.innerHTML = '<option value="">No athletes found</option>';
      return;
    }

    athleteSelect.innerHTML = state.visibleAthletes.map(function (athlete) {
      var suffix = "";
      if (athlete.is_deleted) {
        suffix = " (deleted)";
      } else if (!athlete.is_active) {
        suffix = " (inactive)";
      }
      return '<option value="' + escapeAttribute(athlete.user_id) + '">' + escapeHtml(athlete.name + suffix) + '</option>';
    }).join("");

    if (!state.selectedAthleteId || !state.visibleAthletes.some(function (athlete) { return athlete.user_id === state.selectedAthleteId; })) {
      state.selectedAthleteId = state.visibleAthletes[0].user_id;
    }

    athleteSelect.value = state.selectedAthleteId;
  }

  function matchesAthleteAccountFilter(athlete) {
    var mode = String(state.athleteAccountFilter || "active").trim().toLowerCase();
    var isDeleted = !!(athlete && athlete.is_deleted);
    var isActive = athlete && athlete.is_active !== false;

    if (mode === "deleted") {
      return isDeleted;
    }

    if (mode === "inactive") {
      return !isDeleted && !isActive;
    }

    if (mode === "all") {
      return true;
    }

    return !isDeleted && isActive;
  }

  function loadAnalytics() {
    if (!state.selectedAthleteId) {
      renderEmptyState("Select an athlete to load analytics.");
      loadPopulationData().then(function () {
        renderPopulationAnalytics();
      });
      return;
    }

    setStatus("Loading analytics...", "info");

    Promise.all([
      fetchRecoveryRows(),
      fetchExerciseRows(),
      fetchStravaRows(),
      fetchCognitiveRows(),
      fetchContextRows(),
      fetchProgrammingRows(),
      loadPopulationData()
    ]).then(function (results) {
      state.recoveryRows = results[0] || [];
      state.exerciseRows = results[1] || [];
      state.stravaRows = results[2] || [];
      state.cognitiveRows = results[3] || [];
      state.contextRows = results[4] || [];
      state.programmingRows = results[5] || [];
      state.populationMetricRows = results[6] || [];

      renderAll();
      setStatus("Analytics updated.", "success");
    }).catch(function (error) {
      setStatus(error && error.message ? error.message : "Failed to load analytics.", "error");
    });
  }

  function fetchRecoveryRows() {
    return fetchRows("athlete_recovery_daily", "recovery_date,sleep_hours,hrv_ms,resting_hr,recovery_score,soreness_score,fatigue_score", "athlete_user_id", 1200);
  }

  function fetchExerciseRows() {
    return fetchRows("athlete_exercise_history", "workout_completed_at,volume_load,movement_pattern,exercise_name,total_sets,completed_sets", "athlete_user_id", 3000);
  }

  function fetchStravaRows() {
    return fetchRows("athlete_strava_daily_metrics", "metric_date,activity_count,distance_m,training_load,sleep_hours,hrv_ms,recovery_score", "user_id", 1200);
  }

  function fetchCognitiveRows() {
    return fetchRows("athlete_cognitive_daily", "cognitive_date,deep_work_hours,focus_score,cognitive_sharpness_score,commits_count,prs_merged_count,bug_count,cycle_time_hours", "athlete_user_id", 1200);
  }

  function fetchContextRows() {
    return fetchRows("athlete_context_daily", "context_date,stress_score,travel_day,illness_flag,caffeine_mg,alcohol_units,hydration_score,bodyweight_kg", "athlete_user_id", 1200);
  }

  function fetchProgrammingRows() {
    return fetchRows("athlete_programming_sessions", "session_date,block_name,mesocycle,microcycle_week,phase,progression_strategy,deload_week,session_intent,constraints", "athlete_user_id", 500);
  }

  function loadAnalyticsCatalog() {
    return Promise.all([
      state.client
        .from("analytics_metric_catalog")
        .select("metric_key,metric_name,category_id,cadence,data_type,unit,source_type,active")
        .eq("active", true)
        .order("metric_name", { ascending: true })
        .then(function (result) {
          if (result && result.error) {
            if (isMissingRelationError(result.error)) {
              return [];
            }
            throw result.error;
          }
          return Array.isArray(result && result.data) ? result.data : [];
        }),
      state.client
        .from("analytics_research_questions")
        .select("question_text,category_id,priority,status")
        .in("priority", ["high", "medium"])
        .neq("status", "archived")
        .order("priority", { ascending: true })
        .order("question_text", { ascending: true })
        .then(function (result) {
          if (result && result.error) {
            if (isMissingRelationError(result.error)) {
              return [];
            }
            throw result.error;
          }
          return Array.isArray(result && result.data) ? result.data : [];
        })
    ]).then(function (results) {
      state.metricCatalogRows = results[0] || [];
      state.researchQuestionsRows = results[1] || [];
      renderAssessmentMetricOptions();
      updatePopulationMetricOptions(state.populationMetricRows || []);
    }).catch(function (error) {
      renderAssessmentMetricOptions();
      updatePopulationMetricOptions(state.populationMetricRows || []);
      setStatus(error && error.message ? error.message : "Analytics catalog unavailable. Using fallback metrics.", "info");
    });
  }

  function renderAssessmentMetricOptions() {
    var metricSelect = document.querySelector("[data-assessment-metric-select]");
    if (!metricSelect) {
      return;
    }

    var options = (Array.isArray(state.metricCatalogRows) ? state.metricCatalogRows : [])
      .filter(function (row) {
        var category = String(row && row.category_id || "").trim();
        return category === "performance_testing" || category === "movement_mobility" || category === "outcomes";
      })
      .map(function (row) {
        return {
          key: String(row && row.metric_key || "").trim(),
          name: String(row && row.metric_name || "").trim(),
          unit: String(row && row.unit || "").trim()
        };
      })
      .filter(function (row) {
        return !!row.key && !!row.name;
      });

    if (!options.length) {
      metricSelect.innerHTML = '<option value="">No catalog metrics available</option>';
      return;
    }

    metricSelect.innerHTML = options.map(function (item) {
      var suffix = item.unit ? " (" + item.unit + ")" : "";
      return '<option value="' + escapeAttribute(item.key) + '" data-metric-name="' + escapeAttribute(item.name) + '" data-metric-unit="' + escapeAttribute(item.unit) + '">' + escapeHtml(item.name + suffix) + '</option>';
    }).join("");

    var unitInput = document.querySelector("[data-assessment-unit-input]");
    if (unitInput && !unitInput.value) {
      unitInput.value = options[0].unit || "";
    }

    metricSelect.addEventListener("change", function (event) {
      var selectedKey = String(event && event.target && event.target.value || "").trim();
      if (!selectedKey || !unitInput) {
        return;
      }
      var selected = options.find(function (item) { return item.key === selectedKey; });
      unitInput.value = selected ? (selected.unit || "") : "";
    });
  }

  function loadPopulationData() {
    var metricsRequest = state.client
      .from("athlete_metrics")
      .select("user_id,metric_name,metric_value,metric_unit,updated_at")
      .order("updated_at", { ascending: false })
      .limit(25000)
      .then(function (result) {
        if (result && result.error) {
          if (isMissingRelationError(result.error)) {
            return [];
          }
          throw result.error;
        }
        return Array.isArray(result && result.data) ? result.data : [];
      })
      .catch(function (error) {
        if (isMissingRelationError(error)) {
          return [];
        }
        throw error;
      });

    var assessmentsRequest = state.client
      .from("athlete_assessment_events")
      .select("athlete_user_id,test_name,result_value,result_unit,updated_at")
      .order("updated_at", { ascending: false })
      .limit(25000)
      .then(function (result) {
        if (result && result.error) {
          if (isMissingRelationError(result.error)) {
            return [];
          }
          throw result.error;
        }
        return Array.isArray(result && result.data) ? result.data : [];
      })
      .catch(function (error) {
        if (isMissingRelationError(error)) {
          return [];
        }
        throw error;
      });

    var derivedRequest = state.client
      .from("athlete_derived_metric_events")
      .select("user_id,metric_name,metric_value,metric_unit,computed_at")
      .order("computed_at", { ascending: false })
      .limit(50000)
      .then(function (result) {
        if (result && result.error) {
          if (isMissingRelationError(result.error)) {
            return [];
          }
          throw result.error;
        }
        return Array.isArray(result && result.data) ? result.data : [];
      })
      .catch(function (error) {
        if (isMissingRelationError(error)) {
          return [];
        }
        throw error;
      });

    return Promise.all([metricsRequest, assessmentsRequest, derivedRequest]).then(function (results) {
      var metricRows = results[0] || [];
      var assessmentRows = (results[1] || []).map(function (row) {
        return {
          user_id: String(row && row.athlete_user_id || "").trim(),
          metric_name: String(row && row.test_name || "").trim(),
          metric_value: String(row && row.result_value || "").trim(),
          metric_unit: String(row && row.result_unit || "").trim(),
          updated_at: row && row.updated_at
        };
      }).filter(function (row) {
        return !!row.user_id && !!row.metric_name;
      });

      var derivedRows = (results[2] || []).map(function (row) {
        return {
          user_id: String(row && row.user_id || "").trim(),
          metric_name: String(row && row.metric_name || "").trim(),
          metric_value: String(row && row.metric_value || "").trim(),
          metric_unit: String(row && row.metric_unit || "").trim(),
          updated_at: row && row.computed_at
        };
      }).filter(function (row) {
        return !!row.user_id && !!row.metric_name;
      });

      state.populationLoaded = true;
      state.populationMetricRows = metricRows;
      state.populationAssessmentRows = assessmentRows;
      state.populationDerivedRows = derivedRows;
      updatePopulationMetricOptions(metricRows.concat(assessmentRows).concat(derivedRows));
      return metricRows.concat(derivedRows);
    });
  }

  function updatePopulationMetricOptions(rows) {
    var metricSelect = document.querySelector("[data-population-metric-select]");
    if (!metricSelect) {
      return;
    }

    var preferred = [
      "20mm Edge Hang Strength",
      "20mm Edge Hang",
      "Pull Up Max",
      "Climbing Grades",
      "Ape Index"
    ];

    var nameSet = {};
    preferred.forEach(function (name) {
      nameSet[name] = true;
    });

    (Array.isArray(state.metricCatalogRows) ? state.metricCatalogRows : []).forEach(function (row) {
      var dataType = String(row && row.data_type || "").trim().toLowerCase();
      var category = String(row && row.category_id || "").trim().toLowerCase();
      var metricName = String(row && row.metric_name || "").trim();
      if (!metricName) {
        return;
      }
      if (dataType !== "numeric" && dataType !== "text" && dataType !== "enum") {
        return;
      }
      if (category === "membership_business") {
        return;
      }
      nameSet[metricName] = true;
    });

    (Array.isArray(rows) ? rows : []).forEach(function (row) {
      var name = String(row && row.metric_name || "").trim();
      if (name) {
        nameSet[name] = true;
      }
    });

    var options = Object.keys(nameSet).sort(function (a, b) {
      return String(a).localeCompare(String(b));
    });

    metricSelect.innerHTML = options.map(function (name) {
      return '<option value="' + escapeAttribute(name) + '">' + escapeHtml(name) + '</option>';
    }).join("");

    if (!nameSet[state.populationMetricName]) {
      state.populationMetricName = options.length ? options[0] : "20mm Edge Hang Strength";
    }

    metricSelect.value = state.populationMetricName;
  }

  function fetchRows(table, fields, athleteField, limit) {
    return state.client
      .from(table)
      .select(fields)
      .eq(athleteField, state.selectedAthleteId)
      .order(getDateFieldForTable(table), { ascending: false })
      .limit(limit)
      .then(function (result) {
        if (result && result.error) {
          if (isMissingRelationError(result.error)) {
            return [];
          }
          throw result.error;
        }
        return Array.isArray(result && result.data) ? result.data : [];
      })
      .catch(function (error) {
        if (isMissingRelationError(error)) {
          return [];
        }
        throw error;
      });
  }

  function getDateFieldForTable(table) {
    if (table === "athlete_recovery_daily") return "recovery_date";
    if (table === "athlete_exercise_history") return "workout_completed_at";
    if (table === "athlete_strava_daily_metrics") return "metric_date";
    if (table === "athlete_cognitive_daily") return "cognitive_date";
    if (table === "athlete_context_daily") return "context_date";
    if (table === "athlete_programming_sessions") return "session_date";
    return "updated_at";
  }

  function renderAll() {
    renderSummaryCards();
    renderMovementPatternLoad();
    renderCorrelationInsights();
    renderDailySignalsTable();
    renderProgrammingContext();
    renderPopulationAnalytics();
  }

  function renderSummaryCards() {
    var cardsEl = document.querySelector("[data-analytics-summary-cards]");
    if (!cardsEl) {
      return;
    }

    var recoveryRows = filterRowsByWindow(state.recoveryRows, "recovery_date", state.windowDays);
    var exerciseRows = filterRowsByWindow(state.exerciseRows, "workout_completed_at", state.windowDays);
    var stravaRows = filterRowsByWindow(state.stravaRows, "metric_date", state.windowDays);
    var cognitiveRows = filterRowsByWindow(state.cognitiveRows, "cognitive_date", state.windowDays);
    var contextRows = filterRowsByWindow(state.contextRows, "context_date", state.windowDays);

    var strengthVolume = sumNumeric(exerciseRows, "volume_load");
    var completedSets = sumNumeric(exerciseRows, "completed_sets");
    var totalSets = sumNumeric(exerciseRows, "total_sets");
    var completionPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

    var distanceKm = sumNumeric(stravaRows, "distance_m") / 1000;
    var enduranceLoad = sumNumeric(stravaRows, "training_load");

    var avgSleep = averageOfDefined(recoveryRows, "sleep_hours", findLatestDefined(stravaRows, "sleep_hours"));
    var latestHRV = findLatestDefined(recoveryRows, "hrv_ms");
    if (latestHRV == null) {
      latestHRV = findLatestDefined(stravaRows, "hrv_ms");
    }

    var avgRecovery = averageOfDefined(recoveryRows, "recovery_score", findLatestDefined(stravaRows, "recovery_score"));
    var avgFocus = averageOfDefined(cognitiveRows, "focus_score", null);
    var deepWork = sumNumeric(cognitiveRows, "deep_work_hours");
    var bugCount = sumNumeric(cognitiveRows, "bug_count");
    var stressAvg = averageOfDefined(contextRows, "stress_score", null);
    var travelDays = countTrue(contextRows, "travel_day");

    var cards = [
      {
        label: "Recovery Score",
        value: formatNullable(avgRecovery),
        note: "Avg over " + state.windowDays + " days"
      },
      {
        label: "Sleep / HRV",
        value: formatNullable(avgSleep, " h") + " | " + formatNullable(latestHRV, " ms"),
        note: "Average sleep and latest HRV"
      },
      {
        label: "Strength Volume",
        value: formatInteger(strengthVolume),
        note: formatInteger(completionPct) + "% set completion"
      },
      {
        label: "Endurance",
        value: formatDecimal(distanceKm, 1) + " km",
        note: "Training load " + formatInteger(enduranceLoad)
      },
      {
        label: "Cognitive Output",
        value: formatDecimal(deepWork, 1) + " h",
        note: "Focus " + formatNullable(avgFocus) + " | Bugs " + formatInteger(bugCount)
      },
      {
        label: "Context Load",
        value: "Stress " + formatNullable(stressAvg),
        note: "Travel days: " + formatInteger(travelDays)
      }
    ];

    cardsEl.innerHTML = cards.map(function (card) {
      return [
        '<article class="admin-insight-card">',
        '<span class="admin-insight-card-label">' + escapeHtml(card.label) + '</span>',
        '<strong class="admin-insight-card-value">' + escapeHtml(card.value) + '</strong>',
        '<span class="admin-insight-card-note">' + escapeHtml(card.note) + '</span>',
        '</article>'
      ].join("");
    }).join("");
  }

  function renderMovementPatternLoad() {
    var list = document.querySelector("[data-analytics-movement-list]");
    if (!list) {
      return;
    }

    var exerciseRows = filterRowsByWindow(state.exerciseRows, "workout_completed_at", state.windowDays);
    var totals = {};

    exerciseRows.forEach(function (row) {
      var label = String(row && row.movement_pattern || "").trim() || "Unlabeled";
      var key = label.toLowerCase();
      var volume = Number(row && row.volume_load || 0);
      if (!totals[key]) {
        totals[key] = { label: label, volume: 0, sessions: 0 };
      }
      totals[key].volume += Number.isFinite(volume) ? volume : 0;
      totals[key].sessions += 1;
    });

    var items = Object.keys(totals)
      .map(function (key) { return totals[key]; })
      .sort(function (a, b) { return b.volume - a.volume; })
      .slice(0, 10);

    if (!items.length) {
      list.innerHTML = '<p class="admin-empty-copy">No movement pattern load available yet.</p>';
      return;
    }

    list.innerHTML = items.map(function (item) {
      return [
        '<div class="admin-insight-row">',
        '<div>',
        '<strong>' + escapeHtml(item.label) + '</strong>',
        '<span>' + escapeHtml(String(item.sessions) + ' logged exercises') + '</span>',
        '</div>',
        '<div>',
        '<strong>' + escapeHtml(formatInteger(item.volume)) + '</strong>',
        '<span>volume load</span>',
        '</div>',
        '</div>'
      ].join("");
    }).join("");
  }

  function renderCorrelationInsights() {
    var list = document.querySelector("[data-analytics-correlation-list]");
    if (!list) {
      return;
    }

    var daily = buildDailyMergedSignals();
    var tests = [
      { key: "sleep_focus", label: "Sleep vs Focus", x: "sleep_hours", y: "focus_score" },
      { key: "hrv_focus", label: "HRV vs Focus", x: "hrv_ms", y: "focus_score" },
      { key: "load_fatigue", label: "Training Load vs Fatigue", x: "training_load", y: "fatigue_score" },
      { key: "stress_focus", label: "Stress vs Focus", x: "stress_score", y: "focus_score" },
      { key: "recovery_deepwork", label: "Recovery Score vs Deep Work", x: "recovery_score", y: "deep_work_hours" }
    ];

    var items = tests.map(function (test) {
      var pair = collectPairs(daily, test.x, test.y);
      var r = pair.length >= 5 ? computePearson(pair) : null;
      return {
        label: test.label,
        r: r,
        n: pair.length
      };
    }).filter(function (item) {
      return item.r != null;
    }).sort(function (a, b) {
      return Math.abs(b.r) - Math.abs(a.r);
    });

    if (!items.length) {
      list.innerHTML = '<p class="admin-empty-copy">Collect at least 5 overlapping daily data points to surface correlation insights.</p>';
      return;
    }

    list.innerHTML = items.map(function (item) {
      var strength = Math.abs(item.r) >= 0.6 ? "Strong" : (Math.abs(item.r) >= 0.35 ? "Moderate" : "Weak");
      var direction = item.r > 0 ? "positive" : "negative";
      return [
        '<div class="admin-insight-row">',
        '<div>',
        '<strong>' + escapeHtml(item.label) + '</strong>',
        '<span>' + escapeHtml(String(item.n) + ' overlapping days') + '</span>',
        '</div>',
        '<div>',
        '<strong>r = ' + escapeHtml(formatDecimal(item.r, 2)) + '</strong>',
        '<span>' + escapeHtml(strength + ' ' + direction + ' association') + '</span>',
        '</div>',
        '</div>'
      ].join("");
    }).join("");
  }

  function renderDailySignalsTable() {
    var table = document.querySelector("[data-analytics-daily-table]");
    if (!table) {
      return;
    }

    var tbody = table.querySelector("tbody");
    if (!tbody) {
      return;
    }

    var daily = buildDailyMergedSignals();
    if (!daily.length) {
      tbody.innerHTML = '<tr><td colspan="6">No daily analytics rows yet.</td></tr>';
      return;
    }

    tbody.innerHTML = daily.slice(0, 12).map(function (row) {
      return [
        '<tr>',
        '<td>' + escapeHtml(row.date) + '</td>',
        '<td>' + escapeHtml(formatNullable(row.sleep_hours, ' h')) + '</td>',
        '<td>' + escapeHtml(formatNullable(row.hrv_ms, ' ms')) + '</td>',
        '<td>' + escapeHtml(formatInteger(row.training_load)) + '</td>',
        '<td>' + escapeHtml(formatNullable(row.focus_score)) + '</td>',
        '<td>' + escapeHtml(formatNullable(row.stress_score)) + '</td>',
        '</tr>'
      ].join("");
    }).join("");
  }

  function renderProgrammingContext() {
    var el = document.querySelector("[data-analytics-programming-context]");
    if (!el) {
      return;
    }

    var rows = filterRowsByWindow(state.programmingRows, "session_date", state.windowDays);
    if (!rows.length) {
      el.innerHTML = '<p class="admin-empty-copy">No programming session metadata logged yet.</p>';
      return;
    }

    el.innerHTML = rows.slice(0, 8).map(function (row) {
      var constraints = Array.isArray(row && row.constraints) ? row.constraints.filter(Boolean) : [];
      var meta = [
        row && row.phase ? "Phase: " + String(row.phase) : "",
        row && row.block_name ? "Block: " + String(row.block_name) : "",
        row && row.progression_strategy ? "Progression: " + String(row.progression_strategy) : "",
        row && row.deload_week ? "Deload week" : "",
        constraints.length ? "Constraints: " + constraints.join(", ") : ""
      ].filter(Boolean).join(" | ");

      return [
        '<div class="admin-insight-row">',
        '<div>',
        '<strong>' + escapeHtml(String(row && row.session_date || "")) + '</strong>',
        '<span>' + escapeHtml(meta || "Programming context entry") + '</span>',
        '</div>',
        '<div>',
        '<strong>' + escapeHtml(String(row && row.session_intent || "-") ) + '</strong>',
        '<span>Session intent</span>',
        '</div>',
        '</div>'
      ].join("");
    }).join("");
  }

  function renderPopulationAnalytics() {
    var summaryEl = document.querySelector("[data-population-summary-cards]");
    var correlationEl = document.querySelector("[data-population-correlation-list]");
    var bucketEl = document.querySelector("[data-population-bucket-list]");
    var metricSelect = document.querySelector("[data-population-metric-select]");
    var sportFilterSelect = document.querySelector("[data-population-sport-filter]");
    var targetSelect = document.querySelector("[data-population-target-select]");
    var modeSelect = document.querySelector("[data-population-mode-select]");

    if (!summaryEl || !correlationEl || !bucketEl) {
      return;
    }

    if (metricSelect) {
      metricSelect.value = state.populationMetricName;
    }
    if (sportFilterSelect) {
      sportFilterSelect.value = state.populationSportFilter;
    }
    if (targetSelect) {
      targetSelect.value = state.populationTarget;
    }
    if (modeSelect) {
      modeSelect.value = state.populationLeaderboardMode;
    }

    if (!state.populationLoaded) {
      summaryEl.innerHTML = '<article class="admin-insight-card is-loading">Loading population dataset...</article>';
      correlationEl.innerHTML = '<p class="admin-empty-copy">Loading population correlation analysis...</p>';
      bucketEl.innerHTML = '<p class="admin-empty-copy">Loading bucket breakdown...</p>';
      return;
    }

    var combinedPopulationRows = (state.populationMetricRows || [])
      .concat(state.populationAssessmentRows || [])
      .concat(state.populationDerivedRows || []);
    var latestByUserMetric = buildLatestMetricByUserMetric(combinedPopulationRows);
    var targetMetricName = String(state.populationMetricName || "").trim();
    var targetMetricKey = normalizeMetricName(targetMetricName);
    var sportFilter = String(state.populationSportFilter || "all").trim().toLowerCase();
    var targetKey = String(state.populationTarget || "climbing_level").trim();

    var points = [];
    (Array.isArray(state.athletes) ? state.athletes : []).forEach(function (athlete) {
      var athleteId = String(athlete && athlete.user_id || "").trim();
      if (!athleteId) {
        return;
      }

      if (!athleteMatchesSportFilter(athlete, sportFilter)) {
        return;
      }

      var metricRow = latestByUserMetric[athleteId] && latestByUserMetric[athleteId][targetMetricKey]
        ? latestByUserMetric[athleteId][targetMetricKey]
        : null;
      var metricValue = parseNumericMetricValue(metricRow && metricRow.metric_value);
      if (!Number.isFinite(metricValue)) {
        return;
      }

      var targetInfo = resolvePopulationTargetInfo(athlete, targetKey, latestByUserMetric[athleteId] || {});
      if (!targetInfo || !Number.isFinite(targetInfo.value)) {
        return;
      }

      points.push({
        user_id: athleteId,
        metricValue: metricValue,
        targetValue: targetInfo.value,
        targetLabel: targetInfo.label || "Unknown"
      });
    });

    var pairs = points.map(function (item) {
      return [item.metricValue, item.targetValue];
    });
    var correlation = pairs.length >= 5 ? computePearson(pairs) : null;
    var metricMean = pairs.length ? (pairs.reduce(function (sum, pair) { return sum + pair[0]; }, 0) / pairs.length) : null;
    var targetMean = pairs.length ? (pairs.reduce(function (sum, pair) { return sum + pair[1]; }, 0) / pairs.length) : null;

    summaryEl.innerHTML = [
      buildPopulationSummaryCard("Population Size", formatInteger(points.length), "Athletes matched in selected filter"),
      buildPopulationSummaryCard("Metric", targetMetricName || "--", "Current assessment variable"),
      buildPopulationSummaryCard("Mean Metric", formatNullable(metricMean), "Across matched athletes"),
      buildPopulationSummaryCard("Mean Outcome", formatNullable(targetMean), "Average encoded outcome value"),
      buildPopulationSummaryCard("Correlation r", correlation == null ? "--" : formatDecimal(correlation, 2), pairs.length >= 5 ? "Pearson association strength" : "Need at least 5 matched athletes"),
      buildPopulationSummaryCard("Comparison", resolvePopulationTargetLabel(targetKey), "Selected outcome variable")
    ].join("");

    if (!points.length) {
      correlationEl.innerHTML = '<p class="admin-empty-copy">No matched population rows for this metric/filter combination.</p>';
      bucketEl.innerHTML = '<p class="admin-empty-copy">No outcome buckets available for this combination.</p>';
      renderPopulationTopCorrelations(latestByUserMetric, sportFilter, targetKey, targetMetricKey);
      return;
    }

    var correlationStrength = correlation == null
      ? "Insufficient sample"
      : (Math.abs(correlation) >= 0.6 ? "Strong" : (Math.abs(correlation) >= 0.35 ? "Moderate" : "Weak"));
    var direction = correlation == null
      ? ""
      : (correlation > 0 ? "positive" : (correlation < 0 ? "negative" : "neutral"));

    correlationEl.innerHTML = [
      '<div class="admin-insight-row">',
      '<div>',
      '<strong>' + escapeHtml(targetMetricName + " vs " + resolvePopulationTargetLabel(targetKey)) + '</strong>',
      '<span>' + escapeHtml(String(points.length) + ' athletes included') + '</span>',
      '</div>',
      '<div>',
      '<strong>' + escapeHtml(correlation == null ? 'r = --' : ('r = ' + formatDecimal(correlation, 2))) + '</strong>',
      '<span>' + escapeHtml(correlation == null ? 'Collect more matched values' : (correlationStrength + ' ' + direction + ' association')) + '</span>',
      '</div>',
      '</div>'
    ].join("");

    var byBucket = {};
    points.forEach(function (item) {
      var key = String(item.targetLabel || "Unknown").trim() || "Unknown";
      if (!byBucket[key]) {
        byBucket[key] = { label: key, count: 0, metricSum: 0 };
      }
      byBucket[key].count += 1;
      byBucket[key].metricSum += item.metricValue;
    });

    var buckets = Object.keys(byBucket)
      .map(function (key) {
        var bucket = byBucket[key];
        return {
          label: bucket.label,
          count: bucket.count,
          averageMetric: bucket.count ? bucket.metricSum / bucket.count : null
        };
      })
      .sort(function (a, b) {
        return (b.averageMetric || -Infinity) - (a.averageMetric || -Infinity);
      });

    bucketEl.innerHTML = buckets.map(function (bucket) {
      return [
        '<div class="admin-insight-row">',
        '<div>',
        '<strong>' + escapeHtml(bucket.label) + '</strong>',
        '<span>' + escapeHtml(String(bucket.count) + ' athletes') + '</span>',
        '</div>',
        '<div>',
        '<strong>' + escapeHtml(formatNullable(bucket.averageMetric)) + '</strong>',
        '<span>' + escapeHtml('Avg ' + targetMetricName) + '</span>',
        '</div>',
        '</div>'
      ].join("");
    }).join("");

    renderPopulationTopCorrelations(latestByUserMetric, sportFilter, targetKey, targetMetricKey);
  }

  function buildPopulationSummaryCard(label, value, note) {
    return [
      '<article class="admin-insight-card">',
      '<span class="admin-insight-card-label">' + escapeHtml(label) + '</span>',
      '<strong class="admin-insight-card-value">' + escapeHtml(value) + '</strong>',
      '<span class="admin-insight-card-note">' + escapeHtml(note) + '</span>',
      '</article>'
    ].join("");
  }

  function buildLatestMetricByUserMetric(rows) {
    var result = {};
    (Array.isArray(rows) ? rows : []).forEach(function (row) {
      var userId = String(row && row.user_id || "").trim();
      var metricName = String(row && row.metric_name || "").trim();
      if (!userId || !metricName) {
        return;
      }

      var metricKey = normalizeMetricName(metricName);
      if (!result[userId]) {
        result[userId] = {};
      }

      if (!result[userId][metricKey]) {
        result[userId][metricKey] = row;
      }
    });
    return result;
  }

  function normalizeMetricName(name) {
    return String(name || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function athleteMatchesSportFilter(athlete, sportFilter) {
    var filter = String(sportFilter || "all").trim().toLowerCase();
    if (!filter || filter === "all") {
      return true;
    }

    var primary = String(athlete && athlete.sport || "").trim().toLowerCase();
    if (primary === filter) {
      return true;
    }

    var sports = Array.isArray(athlete && athlete.sports) ? athlete.sports : [];
    return sports.some(function (sport) {
      return String(sport || "").trim().toLowerCase() === filter;
    });
  }

  function resolvePopulationTargetLabel(targetKey) {
    var key = String(targetKey || "climbing_level").trim();
    if (key === "profile_level") {
      return "Profile Level";
    }
    return "Climbing Level";
  }

  function resolvePopulationTargetInfo(athlete, targetKey, userMetricLookup) {
    var key = String(targetKey || "climbing_level").trim();
    if (key === "profile_level") {
      return resolveProfileLevelTarget(athlete);
    }
    return resolveClimbingLevelTarget(athlete, userMetricLookup);
  }

  function resolveProfileLevelTarget(athlete) {
    var raw = String(athlete && athlete.level || "").trim();
    if (!raw) {
      return null;
    }

    var mapped = mapGeneralLevelToNumeric(raw);
    if (!Number.isFinite(mapped)) {
      return null;
    }

    return {
      value: mapped,
      label: raw
    };
  }

  function resolveClimbingLevelTarget(athlete, userMetricLookup) {
    var overview = athlete && athlete.sport_overview && typeof athlete.sport_overview === "object"
      ? athlete.sport_overview
      : null;

    var overviewGrade = overview ? String(overview.climbing_grade || "").trim() : "";
    var levelGrade = String(athlete && athlete.level || "").trim();

    var metricCandidates = [
      userMetricLookup[normalizeMetricName("Climbing Grades")],
      userMetricLookup[normalizeMetricName("Climbing Grade")],
      userMetricLookup[normalizeMetricName("Current Climbing Level")]
    ].filter(Boolean).map(function (row) {
      return String(row && row.metric_value || "").trim();
    });

    var candidates = [overviewGrade, levelGrade].concat(metricCandidates).filter(function (value) {
      return !!String(value || "").trim();
    });

    for (var index = 0; index < candidates.length; index += 1) {
      var text = candidates[index];
      var parsed = parseClimbingGradeToNumeric(text);
      if (Number.isFinite(parsed)) {
        return {
          value: parsed,
          label: String(text)
        };
      }
    }

    return null;
  }

  function mapGeneralLevelToNumeric(levelText) {
    var text = String(levelText || "").trim().toLowerCase();
    if (!text) {
      return null;
    }
    if (text.indexOf("beginner") > -1) return 1;
    if (text.indexOf("intermediate") > -1) return 2;
    if (text.indexOf("advanced") > -1) return 3;
    if (text.indexOf("elite") > -1) return 4;
    return null;
  }

  function parseClimbingGradeToNumeric(text) {
    var raw = String(text || "").trim();
    if (!raw) {
      return null;
    }

    var vMatches = raw.match(/v\s?\d{1,2}/ig);
    if (vMatches && vMatches.length) {
      var vValues = vMatches.map(function (entry) {
        var parsed = parseInt(String(entry).replace(/[^0-9]/g, ""), 10);
        return Number.isFinite(parsed) ? parsed : null;
      }).filter(function (value) {
        return value != null;
      });

      if (vValues.length) {
        return vValues.reduce(function (sum, value) { return sum + value; }, 0) / vValues.length;
      }
    }

    var ydsMatches = raw.match(/5\.\d{1,2}[abcd]?/ig);
    if (ydsMatches && ydsMatches.length) {
      var ydsValues = ydsMatches.map(function (entry) {
        var matched = String(entry || "").toLowerCase().match(/5\.(\d{1,2})([abcd])?/);
        if (!matched) {
          return null;
        }
        var base = parseInt(matched[1], 10);
        if (!Number.isFinite(base)) {
          return null;
        }
        var letter = matched[2] || "";
        var increment = letter === "a" ? 0 : letter === "b" ? 0.25 : letter === "c" ? 0.5 : letter === "d" ? 0.75 : 0;
        return base + increment;
      }).filter(function (value) {
        return value != null;
      });

      if (ydsValues.length) {
        return ydsValues.reduce(function (sum, value) { return sum + value; }, 0) / ydsValues.length;
      }
    }

    return mapGeneralLevelToNumeric(raw);
  }

  function parseNumericMetricValue(value) {
    if (Number.isFinite(Number(value))) {
      return Number(value);
    }

    var raw = String(value == null ? "" : value).trim();
    if (!raw) {
      return null;
    }

    var matched = raw.match(/-?\d+(\.\d+)?/);
    if (!matched) {
      return null;
    }

    var parsed = Number(matched[0]);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function saveAssessmentEvent() {
    if (!state.client || !state.selectedAthleteId || !state.coachUser || !state.coachUser.id) {
      setStatus("Select an athlete before saving assessment data.", "error");
      return;
    }

    var metricSelect = document.querySelector("[data-assessment-metric-select]");
    var dateInput = document.querySelector("[data-assessment-date-input]");
    var valueInput = document.querySelector("[data-assessment-value-input]");
    var unitInput = document.querySelector("[data-assessment-unit-input]");
    var notesInput = document.querySelector("[data-assessment-notes-input]");

    if (!metricSelect || !dateInput || !valueInput || !unitInput || !notesInput) {
      setStatus("Assessment form is unavailable.", "error");
      return;
    }

    var metricKey = String(metricSelect.value || "").trim();
    var selectedOption = metricSelect.options && metricSelect.selectedIndex > -1
      ? metricSelect.options[metricSelect.selectedIndex]
      : null;
    var testName = selectedOption
      ? String(selectedOption.getAttribute("data-metric-name") || selectedOption.textContent || "").trim()
      : "";
    var assessmentDate = String(dateInput.value || "").trim() || getTodayDateInputValue();
    var resultValue = String(valueInput.value || "").trim();
    var resultUnit = String(unitInput.value || "").trim();
    var notes = String(notesInput.value || "").trim();
    var resultNumeric = parseNumericMetricValue(resultValue);

    if (!metricKey || !testName) {
      setStatus("Choose an assessment metric from catalog.", "error");
      return;
    }
    if (!resultValue) {
      setStatus("Enter an assessment result value.", "error");
      return;
    }

    setStatus("Saving assessment...", "info");

    state.client
      .from("athlete_assessment_events")
      .insert({
        athlete_user_id: state.selectedAthleteId,
        coach_user_id: state.coachUser.id,
        assessment_date: assessmentDate,
        metric_key: metricKey,
        test_name: testName,
        result_value: resultValue,
        result_numeric: Number.isFinite(resultNumeric) ? resultNumeric : null,
        result_unit: resultUnit || null,
        notes: notes || null,
        device_source: "manual",
        method: "coach_entry"
      })
      .then(function (result) {
        if (result && result.error) {
          if (isMissingRelationError(result.error)) {
            setStatus("Assessment tables are not installed yet. Run sql/create-analytics-catalog-and-assessment-outcomes.sql.", "error");
            return;
          }
          setStatus(result.error.message || "Failed to save assessment.", "error");
          return;
        }

        valueInput.value = "";
        notesInput.value = "";

        loadPopulationData()
          .then(function () {
            renderPopulationAnalytics();
            setStatus("Assessment saved and population analytics refreshed.", "success");
          })
          .catch(function (error) {
            setStatus(error && error.message ? error.message : "Assessment saved but refresh failed.", "info");
          });
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to save assessment.", "error");
      });
  }

  function renderPopulationTopCorrelations(latestByUserMetric, sportFilter, targetKey, selectedMetricKey) {
    var el = document.querySelector("[data-population-top-correlations-list]");
    if (!el) {
      return;
    }

    var metricKeys = collectLeaderboardMetricKeys(latestByUserMetric, selectedMetricKey);
    var metricNamesByKey = buildMetricNameByKeyMap(latestByUserMetric);
    var questionHints = buildQuestionHintsByMetric(state.researchQuestionsRows || []);
    var researchMetricKeys = buildResearchMetricKeySet(metricKeys, questionHints);

    if (state.populationLeaderboardMode === "research") {
      metricKeys = metricKeys.filter(function (metricKey) {
        return !!researchMetricKeys[metricKey];
      });
    }

    var rows = metricKeys.map(function (metricKey) {
      var pairs = [];

      (Array.isArray(state.athletes) ? state.athletes : []).forEach(function (athlete) {
        var athleteId = String(athlete && athlete.user_id || "").trim();
        if (!athleteId || !athleteMatchesSportFilter(athlete, sportFilter)) {
          return;
        }

        var metricRow = latestByUserMetric[athleteId] && latestByUserMetric[athleteId][metricKey]
          ? latestByUserMetric[athleteId][metricKey]
          : null;
        var metricValue = parseNumericMetricValue(metricRow && metricRow.metric_value);
        if (!Number.isFinite(metricValue)) {
          return;
        }

        var targetInfo = resolvePopulationTargetInfo(athlete, targetKey, latestByUserMetric[athleteId] || {});
        if (!targetInfo || !Number.isFinite(targetInfo.value)) {
          return;
        }

        pairs.push([metricValue, targetInfo.value]);
      });

      var r = pairs.length >= 5 ? computePearson(pairs) : null;
      return {
        metricKey: metricKey,
        metricName: metricNamesByKey[metricKey] || metricKey,
        correlation: r,
        sampleSize: pairs.length,
        hint: questionHints[metricKey] || ""
      };
    }).filter(function (row) {
      return row.correlation != null;
    }).sort(function (a, b) {
      return Math.abs(b.correlation) - Math.abs(a.correlation);
    }).slice(0, 8);

    if (!rows.length) {
      el.innerHTML = state.populationLeaderboardMode === "research"
        ? '<p class="admin-empty-copy">Research mode found no matched metrics for the selected sport filter. Try "All Metrics" or broaden sport filter.</p>'
        : '<p class="admin-empty-copy">No leaderboard data yet. Add more numeric assessment metrics or broaden sport filter.</p>';
      return;
    }

    el.innerHTML = rows.map(function (row, index) {
      var strength = Math.abs(row.correlation) >= 0.6 ? "Strong" : (Math.abs(row.correlation) >= 0.35 ? "Moderate" : "Weak");
      var direction = row.correlation > 0 ? "positive" : "negative";
      var note = row.hint
        ? row.hint
        : (strength + " " + direction + " association with " + resolvePopulationTargetLabel(targetKey));

      return [
        '<div class="admin-insight-row">',
        '<div>',
        '<strong>#' + escapeHtml(String(index + 1)) + ' ' + escapeHtml(row.metricName) + '</strong>',
        '<span>' + escapeHtml(note) + '</span>',
        '</div>',
        '<div>',
        '<strong>r = ' + escapeHtml(formatDecimal(row.correlation, 2)) + '</strong>',
        '<span>' + escapeHtml(String(row.sampleSize) + ' athletes') + '</span>',
        '</div>',
        '</div>'
      ].join("");
    }).join("");
  }

  function buildResearchMetricKeySet(metricKeys, questionHints) {
    var set = {};

    Object.keys(questionHints || {}).forEach(function (metricKey) {
      set[metricKey] = true;
    });

    var namesByKey = {};
    (Array.isArray(state.metricCatalogRows) ? state.metricCatalogRows : []).forEach(function (row) {
      var name = String(row && row.metric_name || "").trim();
      if (!name) {
        return;
      }
      namesByKey[normalizeMetricName(name)] = name;
    });

    (Array.isArray(metricKeys) ? metricKeys : []).forEach(function (metricKey) {
      var metricName = String(namesByKey[metricKey] || metricKey || "").toLowerCase();

      if (
        metricName.indexOf("20mm") > -1 ||
        metricName.indexOf("edge") > -1 ||
        metricName.indexOf("climbing") > -1 ||
        metricName.indexOf("calf") > -1 ||
        metricName.indexOf("single leg") > -1 ||
        metricName.indexOf("single-leg") > -1 ||
        metricName.indexOf("hrv") > -1 ||
        metricName.indexOf("sleep") > -1 ||
        metricName.indexOf("training load") > -1 ||
        metricName.indexOf("session rpe") > -1 ||
        metricName.indexOf("consistency") > -1 ||
        metricName.indexOf("check-in") > -1 ||
        metricName.indexOf("checkin") > -1 ||
        metricName.indexOf("renewal") > -1
      ) {
        set[metricKey] = true;
      }
    });

    return set;
  }

  function collectLeaderboardMetricKeys(latestByUserMetric, selectedMetricKey) {
    var keyMap = {};
    Object.keys(latestByUserMetric || {}).forEach(function (userId) {
      var metrics = latestByUserMetric[userId] || {};
      Object.keys(metrics).forEach(function (metricKey) {
        keyMap[metricKey] = true;
      });
    });

    if (selectedMetricKey) {
      delete keyMap[selectedMetricKey];
    }

    var keys = Object.keys(keyMap);
    if (!keys.length) {
      return [];
    }

    var catalogNameByKey = {};
    (Array.isArray(state.metricCatalogRows) ? state.metricCatalogRows : []).forEach(function (row) {
      var name = String(row && row.metric_name || "").trim();
      var key = normalizeMetricName(name);
      var dataType = String(row && row.data_type || "").trim().toLowerCase();
      if (name && dataType === "numeric") {
        catalogNameByKey[key] = true;
      }
    });

    var numericPreferred = keys.filter(function (key) {
      return !!catalogNameByKey[key];
    });

    return (numericPreferred.length ? numericPreferred : keys).slice(0, 80);
  }

  function buildMetricNameByKeyMap(latestByUserMetric) {
    var map = {};

    (Array.isArray(state.metricCatalogRows) ? state.metricCatalogRows : []).forEach(function (row) {
      var name = String(row && row.metric_name || "").trim();
      if (!name) {
        return;
      }
      map[normalizeMetricName(name)] = name;
    });

    Object.keys(latestByUserMetric || {}).forEach(function (userId) {
      var metrics = latestByUserMetric[userId] || {};
      Object.keys(metrics).forEach(function (key) {
        if (map[key]) {
          return;
        }
        var row = metrics[key];
        var name = String(row && row.metric_name || "").trim();
        if (name) {
          map[key] = name;
        }
      });
    });

    return map;
  }

  function buildQuestionHintsByMetric(questions) {
    var hints = {};
    (Array.isArray(questions) ? questions : []).forEach(function (row) {
      var question = String(row && row.question_text || "").trim();
      if (!question) {
        return;
      }

      var normalizedQuestion = normalizeMetricName(question);
      (Array.isArray(state.metricCatalogRows) ? state.metricCatalogRows : []).forEach(function (metricRow) {
        var metricName = String(metricRow && metricRow.metric_name || "").trim();
        if (!metricName) {
          return;
        }

        var metricKey = normalizeMetricName(metricName);
        var normalizedMetric = normalizeMetricName(metricName);
        var softMatch = normalizedQuestion.indexOf(normalizedMetric) > -1
          || (
            normalizedMetric.indexOf("20mm") > -1 &&
            normalizedQuestion.indexOf("20 mm") > -1 &&
            normalizedQuestion.indexOf("edge") > -1
          )
          || (
            normalizedMetric.indexOf("checkin") > -1 &&
            (normalizedQuestion.indexOf("check-in") > -1 || normalizedQuestion.indexOf("check in") > -1)
          );

        if (!softMatch) {
          return;
        }

        if (!hints[metricKey]) {
          hints[metricKey] = question;
        }
      });
    });
    return hints;
  }

  function renderEmptyState(message) {
    var cardsEl = document.querySelector("[data-analytics-summary-cards]");
    if (cardsEl) {
      cardsEl.innerHTML = '<article class="admin-insight-card is-loading">' + escapeHtml(message || "Select an athlete to load analytics.") + '</article>';
    }
  }

  function buildDailyMergedSignals() {
    var recoveryRows = filterRowsByWindow(state.recoveryRows, "recovery_date", state.windowDays);
    var exerciseRows = filterRowsByWindow(state.exerciseRows, "workout_completed_at", state.windowDays);
    var stravaRows = filterRowsByWindow(state.stravaRows, "metric_date", state.windowDays);
    var cognitiveRows = filterRowsByWindow(state.cognitiveRows, "cognitive_date", state.windowDays);
    var contextRows = filterRowsByWindow(state.contextRows, "context_date", state.windowDays);

    var byDate = {};

    recoveryRows.forEach(function (row) {
      var dateKey = extractDateKey(row && row.recovery_date);
      if (!dateKey) return;
      byDate[dateKey] = byDate[dateKey] || { date: dateKey, training_load: 0 };
      assignIfFinite(byDate[dateKey], "sleep_hours", row && row.sleep_hours);
      assignIfFinite(byDate[dateKey], "hrv_ms", row && row.hrv_ms);
      assignIfFinite(byDate[dateKey], "recovery_score", row && row.recovery_score);
      assignIfFinite(byDate[dateKey], "fatigue_score", row && row.fatigue_score);
    });

    stravaRows.forEach(function (row) {
      var dateKey = extractDateKey(row && row.metric_date);
      if (!dateKey) return;
      byDate[dateKey] = byDate[dateKey] || { date: dateKey, training_load: 0 };
      if (!isFiniteNumber(byDate[dateKey].sleep_hours)) {
        assignIfFinite(byDate[dateKey], "sleep_hours", row && row.sleep_hours);
      }
      if (!isFiniteNumber(byDate[dateKey].hrv_ms)) {
        assignIfFinite(byDate[dateKey], "hrv_ms", row && row.hrv_ms);
      }
      if (!isFiniteNumber(byDate[dateKey].recovery_score)) {
        assignIfFinite(byDate[dateKey], "recovery_score", row && row.recovery_score);
      }
      byDate[dateKey].training_load += toFiniteNumber(row && row.training_load);
    });

    exerciseRows.forEach(function (row) {
      var dateKey = extractDateKey(row && row.workout_completed_at);
      if (!dateKey) return;
      byDate[dateKey] = byDate[dateKey] || { date: dateKey, training_load: 0 };
      byDate[dateKey].training_load += toFiniteNumber(row && row.volume_load);
    });

    cognitiveRows.forEach(function (row) {
      var dateKey = extractDateKey(row && row.cognitive_date);
      if (!dateKey) return;
      byDate[dateKey] = byDate[dateKey] || { date: dateKey, training_load: 0 };
      assignIfFinite(byDate[dateKey], "deep_work_hours", row && row.deep_work_hours);
      assignIfFinite(byDate[dateKey], "focus_score", row && row.focus_score);
      assignIfFinite(byDate[dateKey], "bug_count", row && row.bug_count);
    });

    contextRows.forEach(function (row) {
      var dateKey = extractDateKey(row && row.context_date);
      if (!dateKey) return;
      byDate[dateKey] = byDate[dateKey] || { date: dateKey, training_load: 0 };
      assignIfFinite(byDate[dateKey], "stress_score", row && row.stress_score);
    });

    return Object.keys(byDate)
      .map(function (key) { return byDate[key]; })
      .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  }

  function collectPairs(rows, xKey, yKey) {
    var pairs = [];
    (Array.isArray(rows) ? rows : []).forEach(function (row) {
      var x = Number(row && row[xKey]);
      var y = Number(row && row[yKey]);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        pairs.push([x, y]);
      }
    });
    return pairs;
  }

  function computePearson(pairs) {
    var n = pairs.length;
    if (!n) {
      return null;
    }

    var sumX = 0;
    var sumY = 0;
    var sumXY = 0;
    var sumXX = 0;
    var sumYY = 0;

    pairs.forEach(function (pair) {
      var x = pair[0];
      var y = pair[1];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
      sumYY += y * y;
    });

    var numerator = (n * sumXY) - (sumX * sumY);
    var denominator = Math.sqrt(((n * sumXX) - (sumX * sumX)) * ((n * sumYY) - (sumY * sumY)));
    if (!denominator) {
      return null;
    }

    return numerator / denominator;
  }

  function filterRowsByWindow(rows, dateField, windowDays) {
    var safeRows = Array.isArray(rows) ? rows : [];
    var days = Math.max(1, parseInt(windowDays, 10) || 1);
    var end = getTodayDateInputValue();
    var start = formatDateInputFromDate(addDaysToDateInput(end, -(days - 1)));

    return safeRows.filter(function (row) {
      var dateKey = extractDateKey(row && row[dateField]);
      return !!dateKey && dateKey >= start && dateKey <= end;
    });
  }

  function extractDateKey(value) {
    var raw = String(value || "").trim();
    if (!raw) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return raw;
    }

    var parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return formatDateInputFromDate(parsed);
  }

  function getTodayDateInputValue() {
    return formatDateInputFromDate(new Date());
  }

  function addDaysToDateInput(dateInput, daysToAdd) {
    var base = new Date(String(dateInput || ""));
    if (Number.isNaN(base.getTime())) {
      base = new Date();
    }
    base.setHours(0, 0, 0, 0);
    base.setDate(base.getDate() + (parseInt(daysToAdd, 10) || 0));
    return base;
  }

  function formatDateInputFromDate(date) {
    var d = date instanceof Date ? new Date(date.getTime()) : new Date(date);
    if (Number.isNaN(d.getTime())) {
      d = new Date();
    }

    var year = String(d.getFullYear());
    var month = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function averageOfDefined(rows, field, fallbackValue) {
    var values = (Array.isArray(rows) ? rows : [])
      .map(function (row) { return Number(row && row[field]); })
      .filter(Number.isFinite);

    if (!values.length) {
      return Number.isFinite(Number(fallbackValue)) ? Number(fallbackValue) : null;
    }

    var sum = values.reduce(function (acc, value) { return acc + value; }, 0);
    return sum / values.length;
  }

  function findLatestDefined(rows, field) {
    var safeRows = Array.isArray(rows) ? rows : [];
    for (var index = 0; index < safeRows.length; index += 1) {
      var value = Number(safeRows[index] && safeRows[index][field]);
      if (Number.isFinite(value)) {
        return value;
      }
    }
    return null;
  }

  function sumNumeric(rows, field) {
    return (Array.isArray(rows) ? rows : []).reduce(function (sum, row) {
      return sum + toFiniteNumber(row && row[field]);
    }, 0);
  }

  function countTrue(rows, field) {
    return (Array.isArray(rows) ? rows : []).reduce(function (sum, row) {
      return sum + ((row && row[field] === true) ? 1 : 0);
    }, 0);
  }

  function assignIfFinite(target, key, value) {
    var n = Number(value);
    if (Number.isFinite(n)) {
      target[key] = n;
    }
  }

  function toFiniteNumber(value) {
    var n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function isFiniteNumber(value) {
    return Number.isFinite(Number(value));
  }

  function isMissingRelationError(error) {
    var message = String(error && error.message || "").toLowerCase();
    var details = String(error && error.details || "").toLowerCase();
    return (
      message.indexOf("relation") > -1 && message.indexOf("does not exist") > -1
      || details.indexOf("relation") > -1 && details.indexOf("does not exist") > -1
    );
  }

  function isMissingColumnError(error) {
    var message = String(error && error.message || "").toLowerCase();
    var details = String(error && error.details || "").toLowerCase();
    return (
      message.indexOf("column") > -1 && message.indexOf("does not exist") > -1
      || details.indexOf("column") > -1 && details.indexOf("does not exist") > -1
      || String(error && error.code || "") === "42703"
    );
  }

  function showGuardError(message) {
    var guard = document.querySelector("[data-coach-analytics-guard]");
    if (guard) {
      guard.innerHTML = '<p class="admin-loading">' + escapeHtml(message || "Unable to verify coach access.") + '</p>';
    }
  }

  function showContent() {
    var guard = document.querySelector("[data-coach-analytics-guard]");
    var content = document.querySelector("[data-coach-analytics-content]");
    if (guard) {
      guard.hidden = true;
    }
    if (content) {
      content.hidden = false;
    }
  }

  function setStatus(message, variant) {
    var status = document.querySelector("[data-coach-analytics-status]");
    if (!status) {
      return;
    }

    status.textContent = message || "";
    status.className = "admin-status" + (variant ? " is-" + variant : "");
  }

  function formatInteger(value) {
    var n = Number(value);
    return Number.isFinite(n) ? String(Math.round(n)) : "--";
  }

  function formatDecimal(value, decimals) {
    var n = Number(value);
    if (!Number.isFinite(n)) {
      return "--";
    }
    return n.toFixed(Number.isFinite(Number(decimals)) ? Number(decimals) : 1);
  }

  function formatNullable(value, suffix) {
    var n = Number(value);
    if (!Number.isFinite(n)) {
      return "--";
    }
    return formatDecimal(n, 1) + String(suffix || "");
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>\"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function escapeAttribute(str) {
    return escapeHtml(str).replace(/`/g, "&#096;");
  }
})();
