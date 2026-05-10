(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var TEMPLATE_LIBRARY_KEY = "nomadic_training_program_templates_v1";
  var HIDDEN_ATHLETES_KEY = "nomadic_hidden_athletes_v1";
  var EXERCISE_LIBRARY_KEY = "nomadic_exercise_library_v1";
  var EXERCISE_LIBRARY_TABLE = "exercise_library";
  var TEMPLATE_MARKER = "__NOMADIC_TEMPLATE__";
  var METRIC_TEMPLATES_BY_SPORT = {
    running: [
      { name: "Vertical Jump", unit: "cm", category: "Strength" },
      { name: "Single Leg Squat Test", unit: "reps", category: "Strength", bilateral: true },
      { name: "Single Leg Heel Raise", unit: "reps", category: "Strength", bilateral: true },
      { name: "Side Plank with Hip Abduction", unit: "sec", category: "Strength", bilateral: true },
      { name: "Y Balance", unit: "%", category: "Mobility", bilateral: true }
    ],
    cycling: [
      { name: "20-min Power (FTP Estimate)", unit: "watts", category: "Performance" },
      { name: "Resting HR", unit: "bpm", category: "Cardio" },
      { name: "Max HR", unit: "bpm", category: "Cardio" },
      { name: "VO2 Max (estimated)", unit: "ml/kg/min", category: "Cardio" },
      { name: "Y Balance – Anterior", unit: "%", category: "Mobility", bilateral: true },
      { name: "Single Leg Squat", unit: "reps", category: "Strength", bilateral: true },
      { name: "Hip Flexor Flexibility", unit: "deg", category: "Mobility" }
    ],
    skiing: [
      { name: "Single Leg Sit to Stand", unit: "reps", category: "Strength" },
      { name: "Side Plank", unit: "sec", category: "Strength", bilateral: true },
      { name: "Nordic Hamstring", unit: "reps", category: "Strength" },
      { name: "Broad Jump", unit: "cm", category: "Strength" },
      { name: "Triple Hop", unit: "cm", category: "Performance" },
      { name: "Y Balance – Anterior", unit: "%", category: "Mobility", bilateral: true },
      { name: "Y Balance – PM", unit: "%", category: "Mobility", bilateral: true },
      { name: "Step Down", unit: "reps", category: "Mobility" },
      { name: "Resting HR", unit: "bpm", category: "Cardio" }
    ],
    snowboarding: [
      { name: "Single Leg Sit to Stand", unit: "reps", category: "Strength" },
      { name: "Side Plank", unit: "sec", category: "Strength", bilateral: true },
      { name: "Broad Jump", unit: "cm", category: "Performance" },
      { name: "Triple Hop", unit: "cm", category: "Performance" },
      { name: "Y Balance – Anterior", unit: "%", category: "Mobility", bilateral: true },
      { name: "Y Balance – PM", unit: "%", category: "Mobility", bilateral: true },
      { name: "Step Down", unit: "reps", category: "Mobility" },
      { name: "Resting HR", unit: "bpm", category: "Cardio" }
    ],
    climbing: [
      { name: "Countermovement Push-Up (CMPU)", unit: "reps", category: "Strength" },
      { name: "Closed Kinetic Chain Upper Extremity Stability Test (CKCUEST)", unit: "reps", category: "Strength" },
      { name: "20mm Edge Pull", unit: "kg", category: "Strength", bilateral: true },
      { name: "Max Pull Ups", unit: "reps", category: "Strength" },
      { name: "Max Hang", unit: "sec", category: "Performance" },
      { name: "90 Degree Bent Leg Hang", unit: "sec", category: "Strength" },
      { name: "Adapted Grant Foot Raise", unit: "deg", category: "Mobility", bilateral: true },
      { name: "Ape Index", unit: "cm", category: "Performance", apeIndex: true }
    ],
    hiking: [
      { name: "6-min Walk", unit: "m", category: "Cardio" },
      { name: "Step-down", unit: "reps", category: "Strength" },
      { name: "Single Leg Balance", unit: "sec", category: "Mobility" },
      { name: "Y Balance – Anterior", unit: "%", category: "Mobility", bilateral: true },
      { name: "Resting HR", unit: "bpm", category: "Cardio" },
      { name: "Grip Strength", unit: "kg", category: "Strength" },
      { name: "Loaded Carry (15kg)", unit: "min", category: "Performance" }
    ]
  };
  var BASELINE_TEMPLATES = {
    running: [
      { name: "Vertical Jump", unit: "cm", category: "Strength" },
      { name: "Single Leg Squat Test", unit: "reps", category: "Strength", bilateral: true },
      { name: "Single Leg Heel Raise", unit: "reps", category: "Strength", bilateral: true },
      { name: "Side Plank with Hip Abduction", unit: "sec", category: "Strength", bilateral: true },
      { name: "Y Balance", unit: "%", category: "Mobility", bilateral: true }
    ],
    cycling: [
      { name: "20-min Power (FTP Estimate)", unit: "watts", category: "Performance" },
      { name: "Resting HR", unit: "bpm", category: "Cardio" },
      { name: "Max HR", unit: "bpm", category: "Cardio" },
      { name: "VO2 Max (estimated)", unit: "ml/kg/min", category: "Cardio" },
      { name: "Y Balance – Anterior", unit: "%", category: "Mobility", bilateral: true },
      { name: "Single Leg Squat", unit: "reps", category: "Strength", bilateral: true },
      { name: "Hip Flexor Flexibility", unit: "deg", category: "Mobility" }
    ],
    skiing: [
      { name: "Single Leg Sit to Stand", unit: "reps", category: "Strength" },
      { name: "Side Plank", unit: "sec", category: "Strength", bilateral: true },
      { name: "Nordic Hamstring", unit: "reps", category: "Strength" },
      { name: "Broad Jump", unit: "cm", category: "Strength" },
      { name: "Triple Hop", unit: "cm", category: "Performance" },
      { name: "Y Balance – Anterior", unit: "%", category: "Mobility", bilateral: true },
      { name: "Y Balance – PM", unit: "%", category: "Mobility", bilateral: true },
      { name: "Step Down", unit: "reps", category: "Mobility" },
      { name: "Resting HR", unit: "bpm", category: "Cardio" }
    ],
    snowboarding: [
      { name: "Single Leg Sit to Stand", unit: "reps", category: "Strength" },
      { name: "Side Plank", unit: "sec", category: "Strength", bilateral: true },
      { name: "Broad Jump", unit: "cm", category: "Performance" },
      { name: "Triple Hop", unit: "cm", category: "Performance" },
      { name: "Y Balance – Anterior", unit: "%", category: "Mobility", bilateral: true },
      { name: "Y Balance – PM", unit: "%", category: "Mobility", bilateral: true },
      { name: "Step Down", unit: "reps", category: "Mobility" },
      { name: "Resting HR", unit: "bpm", category: "Cardio" }
    ],
    climbing: [
      { name: "Countermovement Push-Up (CMPU)", unit: "reps", category: "Strength" },
      { name: "Closed Kinetic Chain Upper Extremity Stability Test (CKCUEST)", unit: "reps", category: "Strength" },
      { name: "20mm Edge Pull", unit: "kg", category: "Strength", bilateral: true },
      { name: "Max Pull Ups", unit: "reps", category: "Strength" },
      { name: "Max Hang", unit: "sec", category: "Performance" },
      { name: "90 Degree Bent Leg Hang", unit: "sec", category: "Strength" },
      { name: "Adapted Grant Foot Raise", unit: "deg", category: "Mobility", bilateral: true },
      { name: "Ape Index", unit: "cm", category: "Performance", apeIndex: true }
    ],
    hiking: [
      { name: "6-min Walk", unit: "m", category: "Cardio" },
      { name: "Step-down", unit: "reps", category: "Strength" },
      { name: "Single Leg Balance", unit: "sec", category: "Mobility" },
      { name: "Y Balance – Anterior", unit: "%", category: "Mobility", bilateral: true },
      { name: "Resting HR", unit: "bpm", category: "Cardio" },
      { name: "Grip Strength", unit: "kg", category: "Strength" },
      { name: "Loaded Carry (15kg)", unit: "min", category: "Performance" }
    ],
    general: [
      { name: "Resting HR", unit: "bpm", category: "Cardio" },
      { name: "Push-up Max", unit: "reps", category: "Strength" },
      { name: "Pull-up Max", unit: "reps", category: "Strength" },
      { name: "Broad Jump", unit: "cm", category: "Strength" },
      { name: "Plank Hold", unit: "sec", category: "Strength" },
      { name: "Y Balance – Anterior", unit: "%", category: "Mobility", bilateral: true },
      { name: "Hip Flexion", unit: "deg", category: "Mobility" },
      { name: "1-Mile Run", unit: "mm:ss", category: "Cardio" }
    ]
  };
  var state = {
    client: null,
    user: null,
    guardElement: null,
    contentElement: null,
    athletes: [],
    currentAthlete: null,
    currentMetrics: [],
    templates: [],
    exerciseLibrary: [],
    assignmentTemplateId: null,
    templateFilter: "active",
    currentPage: 1,
    pageSize: 10,
    searchTerm: ""
  };

  document.addEventListener("DOMContentLoaded", function () {
    initializeAdmin();
  });

  function initializeAdmin() {
    state.guardElement = document.querySelector("[data-admin-guard]");
    state.contentElement = document.querySelector("[data-admin-content]");

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
    if (!state.user || state.user.email !== ADMIN_EMAIL) {
      showError("You do not have permission to access this page.");
      setTimeout(function () {
        redirectToHome();
      }, 2000);
      return;
    }

    hideGuard();
    showContent();
    setupEventHandlers();
    loadAthletes();
  }

  function setupEventHandlers() {
    var searchInput = document.querySelector("[data-admin-search]");
    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        state.searchTerm = e.target.value.toLowerCase();
        state.currentPage = 1;
        renderAthletesTable();
      });
    }

    var refreshBtn = document.querySelector("[data-admin-refresh]");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", function () {
        loadAthletes();
      });
    }

    var addAthleteBtn = document.querySelector("[data-admin-add-athlete]");
    if (addAthleteBtn) {
      addAthleteBtn.addEventListener("click", onAddAthleteAccount);
    }

    var addAthleteForm = document.querySelector("[data-admin-add-athlete-form]");
    if (addAthleteForm) {
      addAthleteForm.addEventListener("submit", onSubmitAddAthleteAccount);
    }

    var addAthleteGenerate = document.querySelector("[data-admin-add-athlete-generate-password]");
    if (addAthleteGenerate) {
      addAthleteGenerate.addEventListener("change", toggleAddAthletePasswordMode);
    }

    var addAthleteSport = document.querySelector("[data-admin-add-athlete-sport]");
    if (addAthleteSport) {
      addAthleteSport.addEventListener("change", function () {
        var sportToKey = {
          running: "running", cycling: "cycling",
          skiing: "skiing", snowboarding: "snowboarding",
          climbing: "climbing", hiking: "hiking"
        };
        var raw = String(this.value || "").trim().toLowerCase();
        var key = sportToKey[raw] || "general";
        var templateSelect = document.querySelector("[data-admin-add-athlete-template-select]");
        if (templateSelect) {
          templateSelect.value = key;
        }
        loadAddAthleteTemplate(key);
      });
    }

    document.querySelectorAll("[data-admin-add-athlete-close]").forEach(function (button) {
      button.addEventListener("click", closeAddAthleteModal);
    });

    var addAthleteCopyBtn = document.querySelector("[data-admin-add-athlete-copy]");
    if (addAthleteCopyBtn) {
      addAthleteCopyBtn.addEventListener("click", copyAddAthleteCredentials);
    }

    var addMetricRowBtn = document.querySelector("[data-admin-add-athlete-metric-row-add]");
    if (addMetricRowBtn) {
      addMetricRowBtn.addEventListener("click", function () {
        appendAddAthleteMetricRow({ name: "", value: "", unit: "", category: "Performance" });
      });
    }

    var loadTemplateBtn = document.querySelector("[data-admin-add-athlete-template-load]");
    if (loadTemplateBtn) {
      loadTemplateBtn.addEventListener("click", function () {
        var templateSelect = document.querySelector("[data-admin-add-athlete-template-select]");
        var key = templateSelect ? String(templateSelect.value || "").trim() : "";
        if (!key) {
          setAddAthleteStatus("Please choose a template from the dropdown first.", "error");
          return;
        }
        loadAddAthleteTemplate(key);
      });
    }

    var addAthleteMetricsList = document.querySelector("[data-admin-add-athlete-metrics]");
    if (addAthleteMetricsList) {
      addAthleteMetricsList.addEventListener("click", function (event) {
        var removeBtn = event.target && event.target.closest("[data-admin-add-athlete-metric-remove]");
        if (!removeBtn) {
          return;
        }

        var row = removeBtn.closest("[data-admin-add-athlete-metric-row]");
        if (row && row.parentNode) {
          row.parentNode.removeChild(row);
        }
      });
    }


    var modalBackdrop = document.querySelector("[data-admin-modal-close]");
    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", closeModal);
    }

    var modalCloseBtn = document.querySelector(".admin-modal-close");
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", closeModal);
    }

    var editBtn = document.querySelector("[data-admin-edit-athlete]");
    if (editBtn) {
      editBtn.addEventListener("click", onEditAthlete);
    }

    var resetBtn = document.querySelector("[data-admin-modal-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", onResetPassword);
    }

    var deleteBtn = document.querySelector("[data-admin-modal-delete]");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", onDeleteAthlete);
    }

    var customizeMetricsBtn = document.querySelector("[data-admin-customize-metrics]");
    if (customizeMetricsBtn) {
      customizeMetricsBtn.addEventListener("click", function () {
        if (!state.currentAthlete) {
          setModalStatus("No athlete selected.", "error");
          return;
        }
        var url = "metrics-editor.html?athleteId=" + encodeURIComponent(state.currentAthlete.user_id || "") +
                  "&athleteName=" + encodeURIComponent(state.currentAthlete.name || state.currentAthlete.email || "Athlete");
        window.location.href = url;
      });
    }

    var presetMetricSelect = document.querySelector('[data-admin-metric-preset]');
    if (presetMetricSelect) {
      // Preset metric picker is now handled in metrics-editor.html
    }

    var addMetricBtn = document.querySelector("[data-admin-metric-add]");
    if (addMetricBtn) {
      // Metric adding is now handled in metrics-editor.html
    }

    var metricRows = document.querySelector("[data-admin-metric-rows]");
    if (metricRows) {
      // Metric rows are no longer rendered in admin modal
    }

    var tableBody = document.querySelector("[data-admin-table-body]");
    if (tableBody) {
      tableBody.addEventListener("click", function (event) {
        var deleteBtn = event.target && event.target.closest("[data-admin-delete-athlete]");
        if (!deleteBtn) {
          return;
        }

        var athleteId = String(deleteBtn.getAttribute("data-athlete-id") || "").trim();
        if (!athleteId) {
          setStatus("Could not find athlete id.", "error");
          return;
        }

        var athlete = state.athletes.find(function (item) {
          return item.user_id === athleteId;
        });

        if (!athlete) {
          setStatus("Athlete not found.", "error");
          return;
        }

        executeAthleteDelete(athlete, false);
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeAddAthleteModal();
        closeModal();
        closeAssignModal();
        closeExerciseLibraryModal();
      }
    });
  }

  function loadExerciseLibrary() {
    if (!state.client) {
      state.exerciseLibrary = readExerciseLibrary();
      renderExerciseLibrary();
      return;
    }

    state.client
      .from(EXERCISE_LIBRARY_TABLE)
      .select("id,name,movement_pattern,equipment,primary_muscle,training_goal,sport_tags,custom_tags,description,coaching_cues,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          if (isMissingTableError(result.error)) {
            state.exerciseLibrary = readExerciseLibrary();
            renderExerciseLibrary();
            setStatus("Using local exercise library until Supabase exercise_library table is available.", "info");
            return;
          }

          state.exerciseLibrary = readExerciseLibrary();
          renderExerciseLibrary();
          setStatus(result.error.message, "error");
          return;
        }

        state.exerciseLibrary = (result.data || []).map(mapExerciseLibraryRow);

        if (!state.exerciseLibrary.length) {
          var localItems = readExerciseLibrary();
          if (localItems.length) {
            state.exerciseLibrary = localItems;
            renderExerciseLibrary();
            syncLocalExerciseLibraryToSupabase(localItems);
            return;
          }
        }

        renderExerciseLibrary();
      })
      .catch(function () {
        state.exerciseLibrary = readExerciseLibrary();
        renderExerciseLibrary();
      });
  }

  function showExerciseLibraryModal() {
    var modal = document.querySelector("[data-admin-library-modal]");
    if (!modal) {
      return;
    }

    modal.hidden = false;
    syncModalBodyState();
    clearExerciseLibraryForm();
    renderExerciseLibrary();
    setExerciseLibraryStatus("", "info");
  }

  function closeExerciseLibraryModal() {
    var modal = document.querySelector("[data-admin-library-modal]");
    if (!modal) {
      return;
    }

    modal.hidden = true;
    syncModalBodyState();
    setExerciseLibraryStatus("", "info");
  }

  function renderExerciseLibrary() {
    var list = document.querySelector("[data-admin-library-list]");
    if (!list) {
      return;
    }

    var query = String((document.querySelector("[data-admin-library-search]") || {}).value || "").trim().toLowerCase();
    var patternFilter = String((document.querySelector("[data-admin-library-filter-pattern]") || {}).value || "").trim().toLowerCase();
    var sportFilter = String((document.querySelector("[data-admin-library-filter-sport]") || {}).value || "").trim().toLowerCase();

    var filtered = state.exerciseLibrary
      .filter(function (item) {
        if (patternFilter && String(item.movement_pattern || "").toLowerCase() !== patternFilter) {
          return false;
        }

        if (sportFilter) {
          var sports = Array.isArray(item.sport_tags) ? item.sport_tags : [];
          if (sports.indexOf(sportFilter) === -1) {
            return false;
          }
        }

        if (!query) {
          return true;
        }

        var haystack = [
          item.name,
          item.movement_pattern,
          item.equipment,
          item.primary_muscle,
          item.training_goal,
          item.description,
          item.coaching_cues,
          (item.custom_tags || []).join(" "),
          (item.sport_tags || []).join(" ")
        ]
          .join(" ")
          .toLowerCase();

        return haystack.indexOf(query) > -1;
      })
      .sort(function (a, b) {
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      });

    if (!filtered.length) {
      list.innerHTML = '<p class="admin-loading">No exercises match this view yet.</p>';
      return;
    }

    list.innerHTML = filtered
      .map(function (item) {
        var tags = [
          item.movement_pattern,
          item.equipment,
          item.primary_muscle,
          item.training_goal
        ]
          .concat(Array.isArray(item.sport_tags) ? item.sport_tags : [])
          .concat(Array.isArray(item.custom_tags) ? item.custom_tags : [])
          .filter(function (tag) {
            return !!tag;
          });

        return (
          '<article class="admin-library-item">' +
          '<div class="admin-library-item-head">' +
          '<h4>' + escapeHtml(item.name || "Exercise") + '</h4>' +
          '<div class="admin-program-item-actions">' +
          '<button type="button" class="btn admin-btn-small" data-exercise-library-action="edit" data-exercise-id="' + escapeAttribute(item.id) + '">Edit</button>' +
          '<button type="button" class="btn admin-btn-delete-mini" data-exercise-library-action="delete" data-exercise-id="' + escapeAttribute(item.id) + '">Delete</button>' +
          '</div>' +
          '</div>' +
          '<p>' + escapeHtml(item.description || "No description yet.") + '</p>' +
          '<div class="admin-library-tags">' +
          tags
            .map(function (tag) {
              return '<span class="admin-library-tag">' + escapeHtml(tag) + '</span>';
            })
            .join("") +
          '</div>' +
          '</article>'
        );
      })
      .join("");
  }

  function onExerciseLibrarySave(event) {
    event.preventDefault();

    var id = String((document.querySelector("[data-admin-library-id]") || {}).value || "").trim();
    var name = String((document.querySelector("[data-admin-library-name]") || {}).value || "").trim();

    if (!name) {
      setExerciseLibraryStatus("Exercise name is required.", "error");
      return;
    }

    var now = new Date().toISOString();
    var existing = id
      ? state.exerciseLibrary.find(function (item) {
          return item.id === id;
        })
      : null;

    var item = {
      id: existing ? existing.id : "ex_" + String(Date.now()) + "_" + String(Math.floor(Math.random() * 10000)),
      name: name,
      movement_pattern: String((document.querySelector("[data-admin-library-pattern]") || {}).value || "").trim().toLowerCase(),
      equipment: String((document.querySelector("[data-admin-library-equipment]") || {}).value || "").trim().toLowerCase(),
      primary_muscle: String((document.querySelector("[data-admin-library-muscle]") || {}).value || "").trim().toLowerCase(),
      training_goal: String((document.querySelector("[data-admin-library-goal]") || {}).value || "").trim().toLowerCase(),
      sport_tags: Array.prototype.slice
        .call(document.querySelectorAll("[data-admin-library-sport]:checked"))
        .map(function (checkbox) {
          return String(checkbox.value || "").trim().toLowerCase();
        })
        .filter(function (value) {
          return !!value;
        }),
      custom_tags: String((document.querySelector("[data-admin-library-custom-tags]") || {}).value || "")
        .split(",")
        .map(function (part) {
          return String(part || "").trim().toLowerCase();
        })
        .filter(function (value) {
          return !!value;
        }),
      description: String((document.querySelector("[data-admin-library-description]") || {}).value || "").trim(),
      coaching_cues: String((document.querySelector("[data-admin-library-cues]") || {}).value || "").trim(),
      created_at: existing ? existing.created_at : now,
      updated_at: now
    };

    if (existing) {
      state.exerciseLibrary = state.exerciseLibrary.map(function (entry) {
        return entry.id === item.id ? item : entry;
      });
    } else {
      state.exerciseLibrary.push(item);
    }

    // Keep local cache current as fallback, regardless of cloud outcome.
    writeExerciseLibrary(state.exerciseLibrary);

    if (!state.client) {
      renderExerciseLibrary();
      clearExerciseLibraryForm();
      setExerciseLibraryStatus(existing ? "Exercise updated." : "Exercise added to library.", "success");
      return;
    }

    state.client
      .from(EXERCISE_LIBRARY_TABLE)
      .upsert(item)
      .then(function (result) {
        if (result.error) {
          if (isMissingTableError(result.error)) {
            renderExerciseLibrary();
            clearExerciseLibraryForm();
            setExerciseLibraryStatus(
              "Saved locally. Run sql/create-exercise-library-table.sql to enable cloud sync.",
              "info"
            );
            return;
          }

          setExerciseLibraryStatus(result.error.message, "error");
          return;
        }

        clearExerciseLibraryForm();
        setExerciseLibraryStatus(existing ? "Exercise updated." : "Exercise added to library.", "success");
        loadExerciseLibrary();
      })
      .catch(function (error) {
        setExerciseLibraryStatus(
          error && error.message ? error.message : "Saved locally, but cloud sync failed.",
          "info"
        );
      });
  }

  function clearExerciseLibraryForm() {
    var form = document.querySelector("[data-admin-library-form]");
    if (form) {
      form.reset();
    }

    var idField = document.querySelector("[data-admin-library-id]");
    if (idField) {
      idField.value = "";
    }

    var formTitle = document.querySelector("[data-admin-library-form-title]");
    if (formTitle) {
      formTitle.textContent = "Add Exercise";
    }
  }

  function populateExerciseLibraryForm(exerciseId) {
    var item = state.exerciseLibrary.find(function (entry) {
      return entry.id === exerciseId;
    });

    if (!item) {
      setExerciseLibraryStatus("Exercise not found.", "error");
      return;
    }

    var idField = document.querySelector("[data-admin-library-id]");
    var nameField = document.querySelector("[data-admin-library-name]");
    var patternField = document.querySelector("[data-admin-library-pattern]");
    var equipmentField = document.querySelector("[data-admin-library-equipment]");
    var muscleField = document.querySelector("[data-admin-library-muscle]");
    var goalField = document.querySelector("[data-admin-library-goal]");
    var tagsField = document.querySelector("[data-admin-library-custom-tags]");
    var descriptionField = document.querySelector("[data-admin-library-description]");
    var cuesField = document.querySelector("[data-admin-library-cues]");
    var formTitle = document.querySelector("[data-admin-library-form-title]");

    if (idField) idField.value = item.id || "";
    if (nameField) nameField.value = item.name || "";
    if (patternField) patternField.value = item.movement_pattern || "";
    if (equipmentField) equipmentField.value = item.equipment || "";
    if (muscleField) muscleField.value = item.primary_muscle || "";
    if (goalField) goalField.value = item.training_goal || "";
    if (tagsField) tagsField.value = Array.isArray(item.custom_tags) ? item.custom_tags.join(", ") : "";
    if (descriptionField) descriptionField.value = item.description || "";
    if (cuesField) cuesField.value = item.coaching_cues || "";
    if (formTitle) formTitle.textContent = "Edit Exercise";

    var selectedSports = Array.isArray(item.sport_tags) ? item.sport_tags : [];
    document.querySelectorAll("[data-admin-library-sport]").forEach(function (checkbox) {
      checkbox.checked = selectedSports.indexOf(String(checkbox.value || "").trim().toLowerCase()) > -1;
    });
  }

  function onDeleteExerciseLibraryItem(exerciseId) {
    var item = state.exerciseLibrary.find(function (entry) {
      return entry.id === exerciseId;
    });
    if (!item) {
      return;
    }

    if (!confirm("Delete exercise '" + (item.name || "Exercise") + "'?")) {
      return;
    }

    state.exerciseLibrary = state.exerciseLibrary.filter(function (entry) {
      return entry.id !== exerciseId;
    });
    writeExerciseLibrary(state.exerciseLibrary);

    if (!state.client) {
      renderExerciseLibrary();
      clearExerciseLibraryForm();
      setExerciseLibraryStatus("Exercise deleted.", "info");
      return;
    }

    state.client
      .from(EXERCISE_LIBRARY_TABLE)
      .delete()
      .eq("id", exerciseId)
      .then(function (result) {
        if (result.error) {
          if (isMissingTableError(result.error)) {
            renderExerciseLibrary();
            clearExerciseLibraryForm();
            setExerciseLibraryStatus("Exercise deleted locally.", "info");
            return;
          }

          setExerciseLibraryStatus(result.error.message, "error");
          return;
        }

        renderExerciseLibrary();
        clearExerciseLibraryForm();
        setExerciseLibraryStatus("Exercise deleted.", "info");
      })
      .catch(function (error) {
        setExerciseLibraryStatus(
          error && error.message ? error.message : "Exercise deleted locally, but cloud delete failed.",
          "info"
        );
      });
  }

  function setExerciseLibraryStatus(message, variant) {
    var statusEl = document.querySelector("[data-admin-library-status]");
    if (!statusEl) {
      return;
    }

    statusEl.textContent = message || "";
    statusEl.classList.remove("is-error", "is-success", "is-info");
    if (variant === "error") {
      statusEl.classList.add("is-error");
    } else if (variant === "success") {
      statusEl.classList.add("is-success");
    } else {
      statusEl.classList.add("is-info");
    }
  }

  function loadProgramTemplates() {
    if (!state.client) {
      state.templates = [];
      renderProgramTemplates();
      return;
    }

    state.client
      .from("training_programs")
      .select("id,name,description,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          if (isMissingTableError(result.error)) {
            state.templates = readTemplateLibrary();
            renderProgramTemplates();
            setStatus("Using local templates until Supabase training_programs is available.", "info");
            return;
          }

          setStatus(result.error.message, "error");
          return;
        }

        state.templates = (result.data || [])
          .map(parseTemplateRow)
          .filter(function (template) {
            return !!template;
          })
          .sort(function (a, b) {
            var aDate = new Date(a.updated_at || a.created_at || 0).getTime();
            var bDate = new Date(b.updated_at || b.created_at || 0).getTime();
            return bDate - aDate;
          });

        renderProgramTemplates();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to load templates.", "error");
      });
  }

  function renderProgramTemplates() {
    var list = document.querySelector("[data-admin-template-list]");
    if (!list) {
      return;
    }

    var visibleTemplates = state.templates.filter(function (template) {
      if (state.templateFilter === "all") {
        return true;
      }
      if (state.templateFilter === "archived") {
        return !!template.archived;
      }
      return !template.archived;
    });

    if (!visibleTemplates.length) {
      list.innerHTML =
        '<p class="admin-loading">No templates in this view yet.</p>';
      return;
    }

    list.innerHTML = visibleTemplates
      .map(function (template) {
        var archiveLabel = template.archived ? "Unarchive" : "Archive";
        return (
          '<article class="admin-program-item">' +
          '<div class="admin-program-item-main">' +
          '<h3>' + escapeHtml(template.name || "Untitled Template") + '</h3>' +
          '<p>Last updated: ' + escapeHtml(formatDate(template.updated_at || template.created_at)) + (template.archived ? " · Archived" : "") + '</p>' +
          '</div>' +
          '<div class="admin-program-item-actions">' +
          '<button type="button" class="btn admin-btn-small" data-template-action="edit" data-template-id="' + escapeAttribute(template.id) + '">Edit</button>' +
          '<button type="button" class="btn admin-btn-small" data-template-action="assign" data-template-id="' + escapeAttribute(template.id) + '">Assign</button>' +
          '<button type="button" class="btn admin-btn-small" data-template-action="duplicate" data-template-id="' + escapeAttribute(template.id) + '">Duplicate</button>' +
          '<button type="button" class="btn admin-btn-archive-mini" data-template-action="archive" data-template-id="' + escapeAttribute(template.id) + '">' + archiveLabel + '</button>' +
          '<button type="button" class="btn admin-btn-delete-mini" data-template-action="delete" data-template-id="' + escapeAttribute(template.id) + '">Delete</button>' +
          '</div>' +
          '</article>'
        );
      })
      .join("");
  }

  function onAssignTemplate(templateId) {
    if (!templateId) {
      return;
    }

    var template = getTemplateById(templateId);
    if (!template || !state.client) {
      setStatus("Template not found.", "error");
      return;
    }

    if (!state.athletes.length) {
      setStatus("Load athletes before assigning templates.", "error");
      return;
    }

    state.assignmentTemplateId = templateId;
    var titleEl = document.querySelector("[data-admin-assign-template-name]");
    if (titleEl) {
      titleEl.textContent = "Assign: " + (template.name || "Template");
    }

    var searchInput = document.querySelector("[data-admin-assign-search]");
    if (searchInput) {
      searchInput.value = "";
    }

    setAssignStatus("", "info");
    renderAssignAthleteList("");
    showAssignModal();
  }

  function renderAssignAthleteList(searchTerm) {
    var list = document.querySelector("[data-admin-assign-list]");
    if (!list) {
      return;
    }

    var query = String(searchTerm || "").trim().toLowerCase();
    var filtered = state.athletes.filter(function (athlete) {
      if (!query) {
        return true;
      }

      var email = String(athlete.email || "").toLowerCase();
      var name = String(athlete.name || "").toLowerCase();
      var sport = String(athlete.sport || "").toLowerCase();
      return email.indexOf(query) > -1 || name.indexOf(query) > -1 || sport.indexOf(query) > -1;
    });

    if (!filtered.length) {
      list.innerHTML = '<p class="admin-loading">No athletes match this search.</p>';
      return;
    }

    list.innerHTML = filtered
      .map(function (athlete) {
        return (
          '<label class="admin-assign-item">' +
          '<input type="checkbox" data-admin-assign-athlete data-athlete-id="' + escapeAttribute(athlete.user_id || "") + '" />' +
          '<span class="admin-assign-item-main">' +
          '<strong>' + escapeHtml(athlete.name || athlete.email || "Athlete") + '</strong>' +
          '<small>' + escapeHtml(athlete.email || "") + (athlete.sport ? " • " + escapeHtml(athlete.sport) : "") + '</small>' +
          '</span>' +
          '</label>'
        );
      })
      .join("");
  }

  function onConfirmAssignTemplate() {
    var template = getTemplateById(state.assignmentTemplateId);
    if (!template || !state.client) {
      setAssignStatus("Template not found.", "error");
      return;
    }

    var list = document.querySelector("[data-admin-assign-list]");
    if (!list) {
      return;
    }

    var selectedIds = Array.prototype.slice
      .call(list.querySelectorAll("[data-admin-assign-athlete]:checked"))
      .map(function (checkbox) {
        return String(checkbox.getAttribute("data-athlete-id") || "").trim();
      })
      .filter(function (id) {
        return !!id;
      });

    if (!selectedIds.length) {
      setAssignStatus("Select at least one athlete.", "error");
      return;
    }

    var now = new Date().toISOString();
    var rows = selectedIds.map(function (userId) {
      return {
        user_id: userId,
        program_id: template.id,
        program_name: template.name,
        is_active: true,
        assigned_at: now,
        assigned_by: state.user ? state.user.id : null
      };
    });

    setAssignStatus("Assigning template to " + selectedIds.length + " athlete(s)...", "info");

    state.client
      .from("user_training_programs")
      .update({ is_active: false })
      .in("user_id", selectedIds)
      .eq("is_active", true)
      .then(function (deactivateResult) {
        if (deactivateResult.error) {
          setAssignStatus(deactivateResult.error.message, "error");
          return;
        }

        state.client
          .from("user_training_programs")
          .insert(rows)
          .then(function (insertResult) {
            if (insertResult.error) {
              setAssignStatus(insertResult.error.message, "error");
              return;
            }

            setAssignStatus("Assigned template to " + selectedIds.length + " athlete(s).", "success");
            setStatus("Assigned '" + (template.name || "Template") + "' to " + selectedIds.length + " athlete(s).", "success");
            setTimeout(function () {
              closeAssignModal();
            }, 700);
          })
          .catch(function (error) {
            setAssignStatus(error && error.message ? error.message : "Failed to assign template.", "error");
          });
      })
      .catch(function (error) {
        setAssignStatus(error && error.message ? error.message : "Failed to assign template.", "error");
      });
  }

  function onDuplicateTemplate(templateId) {
    var template = getTemplateById(templateId);
    if (!template || !state.client) {
      setStatus("Template not found.", "error");
      return;
    }

    var payload = {
      archived: false,
      structure: template.structure || { weeks: 1, workoutsPerWeek: 3 },
      days: template.days || { "day-1": [], "day-2": [], "day-3": [] }
    };

    state.client
      .from("training_programs")
      .insert({
        name: (template.name || "Template") + " (Copy)",
        description: serializeTemplatePayload(payload)
      })
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        setStatus("Template duplicated.", "success");
        loadProgramTemplates();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to duplicate template.", "error");
      });
  }

  function onToggleArchiveTemplate(templateId) {
    var template = getTemplateById(templateId);
    if (!template || !state.client) {
      setStatus("Template not found.", "error");
      return;
    }

    var payload = {
      archived: !template.archived,
      structure: template.structure || { weeks: 1, workoutsPerWeek: 3 },
      days: template.days || { "day-1": [], "day-2": [], "day-3": [] }
    };

    state.client
      .from("training_programs")
      .update({ description: serializeTemplatePayload(payload) })
      .eq("id", template.id)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        setStatus(template.archived ? "Template unarchived." : "Template archived.", "info");
        loadProgramTemplates();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to update template.", "error");
      });
  }

  function onDeleteTemplate(templateId) {
    if (!templateId) {
      return;
    }

    var template = state.templates.find(function (item) {
      return item.id === templateId;
    });
    var templateName = template && template.name ? template.name : "this template";

    if (!confirm("Delete " + templateName + "?")) {
      return;
    }

    if (!state.client) {
      var nextTemplates = state.templates.filter(function (item) {
        return item.id !== templateId;
      });

      writeTemplateLibrary(nextTemplates);
      state.templates = nextTemplates;
      renderProgramTemplates();
      setStatus("Template deleted.", "info");
      return;
    }

    setStatus("Removing template from active athlete programs...", "info");

    state.client
      .from("user_training_programs")
      .update({ is_active: false })
      .eq("program_id", templateId)
      .eq("is_active", true)
      .then(function (deactivateResult) {
        if (deactivateResult.error) {
          setStatus(deactivateResult.error.message, "error");
          return;
        }

        state.client
      .from("training_programs")
      .delete()
      .eq("id", templateId)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        setStatus("Template deleted and removed from active athlete programs.", "success");
        loadProgramTemplates();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to delete template.", "error");
      });
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to remove template from athletes.", "error");
      });
  }

  function getTemplateById(templateId) {
    return state.templates.find(function (item) {
      return item.id === templateId;
    });
  }

  function parseTemplateRow(row) {
    if (!row || !row.id) {
      return null;
    }

    var payload = parseTemplatePayload(row.description);
    if (!payload) {
      return null;
    }

    return {
      id: row.id,
      name: row.name || "Untitled Template",
      created_at: row.created_at,
      updated_at: row.updated_at,
      archived: !!payload.archived,
      structure: payload.structure || { weeks: 1, workoutsPerWeek: 3 },
      days: payload.days || { "day-1": [], "day-2": [], "day-3": [] }
    };
  }

  function parseTemplatePayload(description) {
    var value = String(description || "");
    if (value.indexOf(TEMPLATE_MARKER) !== 0) {
      return null;
    }

    try {
      return JSON.parse(value.slice(TEMPLATE_MARKER.length));
    } catch (e) {
      return null;
    }
  }

  function serializeTemplatePayload(payload) {
    var safePayload = {
      archived: !!(payload && payload.archived),
      structure: payload && payload.structure ? payload.structure : { weeks: 1, workoutsPerWeek: 3 },
      days: payload && payload.days ? payload.days : { "day-1": [], "day-2": [], "day-3": [] }
    };
    return TEMPLATE_MARKER + JSON.stringify(safePayload);
  }

  function loadAthletes() {
    setStatus("Loading users...");

    state.client
      .from("admin_all_users")
      .select("*")
      .order("user_created_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        var hiddenAthleteIds = readHiddenAthleteIds();
        state.athletes = (result.data || []).filter(function (athlete) {
          return !hiddenAthleteIds[athlete.user_id];
        });
        state.currentPage = 1;
        renderAthletesTable();
        updateStats();
        setStatus("Users loaded successfully.", "success");
        setTimeout(function () {
          clearStatus();
        }, 1500);
      })
      .catch(function (error) {
        setStatus(
          error && error.message ? error.message : "Failed to load users.",
          "error"
        );
      });
  }

  function renderAthletesTable() {
    var tbody = document.querySelector("[data-admin-table-body]");
    if (!tbody) {
      return;
    }

    var filtered = state.athletes.filter(function (a) {
      if (!state.searchTerm) return true;
      return (
        (a.email && a.email.toLowerCase().includes(state.searchTerm)) ||
        (a.name && a.name.toLowerCase().includes(state.searchTerm)) ||
        (a.sport && a.sport.toLowerCase().includes(state.searchTerm))
      );
    });

    var start = (state.currentPage - 1) * state.pageSize;
    var end = start + state.pageSize;
    var paginated = filtered.slice(start, end);

    tbody.innerHTML = paginated
      .map(function (athlete) {
        var viewUrl =
          "profile.html?coachView=1&athleteId=" +
          encodeURIComponent(athlete.user_id || "");
        return (
          "<tr>" +
          "<td>" + escapeHtml(athlete.email || "N/A") + "</td>" +
          "<td>" + (athlete.name ? escapeHtml(athlete.name) : "—") + "</td>" +
          "<td>" + (athlete.sport ? escapeHtml(athlete.sport) : "—") + "</td>" +
          "<td>" + (athlete.level ? escapeHtml(athlete.level) : "—") + "</td>" +
          "<td>" + formatDate(athlete.user_created_at) + "</td>" +
          "<td><div class='admin-program-item-actions'><a class='btn admin-btn-small' href='" +
          viewUrl +
          "'>View</a><button type='button' class='btn admin-btn-delete-mini' data-admin-delete-athlete='1' data-athlete-id='" +
          escapeAttribute(athlete.user_id || "") +
          "'>Delete</button></div></td>" +
          "</tr>"
        );
      })
      .join("");

    renderPagination(filtered.length);
  }

  function renderPagination(totalItems) {
    var paginationDiv = document.querySelector("[data-admin-pagination]");
    if (!paginationDiv) {
      return;
    }

    var totalPages = Math.ceil(totalItems / state.pageSize);
    if (totalPages <= 1) {
      paginationDiv.innerHTML = "";
      return;
    }

    var html = '<div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 2rem;">';

    for (var i = 1; i <= totalPages; i++) {
      var isActive = i === state.currentPage;
      html +=
        '<button class="btn admin-pagination-btn ' +
        (isActive ? "active" : "") +
        '" data-page="' +
        i +
        '">' +
        i +
        "</button>";
    }

    html += "</div>";
    paginationDiv.innerHTML = html;

    document.querySelectorAll("[data-page]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.currentPage = parseInt(btn.getAttribute("data-page"), 10);
        renderAthletesTable();
      });
    });
  }

  function openAthleteModal(userId) {
    var athlete = state.athletes.find(function (a) {
      return a.user_id === userId;
    });

    if (!athlete) {
      setStatus("User not found.", "error");
      return;
    }

    state.currentAthlete = athlete;

    populateModal(athlete);
    loadAthleteMetrics(userId);
    showModal();
  }

  function populateModal(athlete) {
    document.querySelector("[data-admin-modal-email]").textContent =
      athlete.email || "N/A";
    document.querySelector("[data-admin-modal-created]").textContent = formatDate(
      athlete.user_created_at
    );
    document.querySelector("[data-admin-modal-last-signin]").textContent =
      athlete.last_sign_in_at ? formatDate(athlete.last_sign_in_at) : "N/A";

    document.querySelector("[data-admin-modal-info-name]").textContent =
      athlete.name || "—";
    document.querySelector("[data-admin-modal-info-sport]").textContent =
      athlete.sport || "—";
    document.querySelector("[data-admin-modal-info-level]").textContent =
      athlete.level || "—";
    document.querySelector("[data-admin-modal-info-bio]").textContent =
      athlete.bio || "—";
    document.querySelector("[data-admin-modal-info-age]").textContent =
      athlete.age ? athlete.age.toString() : "—";
    document.querySelector("[data-admin-modal-info-location]").textContent =
      athlete.location || "—";

    var metricRows = document.querySelector("[data-admin-metric-rows]");
    if (metricRows) {
      metricRows.innerHTML = '<p class="admin-loading">Loading metrics...</p>';
    }

    clearModalStatus();
  }

  function loadAthleteMetrics(userId) {
    var metricRows = document.querySelector("[data-admin-metric-rows]");
    if (!metricRows || !state.client || !userId) {
      return;
    }

    metricRows.innerHTML = '<p class="admin-loading">Loading metrics...</p>';

    state.client
      .from("athlete_metrics")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          if (isMissingTableError(result.error)) {
            state.currentMetrics = [];
            renderMetricRows([]);
            setModalStatus(
              "Metrics table not found yet. Create athlete_metrics in Supabase to enable coach metric editing.",
              "info"
            );
            return;
          }

          setModalStatus(result.error.message, "error");
          return;
        }

        state.currentMetrics = result.data || [];
        renderMetricRows(state.currentMetrics);
      })
      .catch(function (error) {
        setModalStatus(
          error && error.message ? error.message : "Failed to load metrics.",
          "error"
        );
      });
  }

  function renderMetricRows(metrics) {
    var metricRows = document.querySelector("[data-admin-metric-rows]");
    if (!metricRows) {
      return;
    }

    metricRows.innerHTML = "";


    if (!metrics || !metrics.length) {
      // Add default metrics for every account
      [
        { metric_name: "Resting HR", metric_value: "", metric_unit: "bpm", metric_category: "Cardio" },
        { metric_name: "Max HR", metric_value: "", metric_unit: "bpm", metric_category: "Cardio" },
        { metric_name: "Height", metric_value: "", metric_unit: "cm", metric_category: "Performance" },
        { metric_name: "Weight", metric_value: "", metric_unit: "kg", metric_category: "Performance" },
        { metric_name: "BMI", metric_value: "", metric_unit: "", metric_category: "Performance" },
        { metric_name: "Blood Pressure", metric_value: "", metric_unit: "mmHg", metric_category: "Cardio" },
        { metric_name: "VO2 Max", metric_value: "", metric_unit: "ml/kg/min", metric_category: "Cardio" }
      ].forEach(appendMetricRow);
      return;
    }

    metrics.forEach(function (metric) {
      appendMetricRow(metric);
    });
  }

  function appendMetricRow(metric) {
    var metricRows = document.querySelector("[data-admin-metric-rows]");
    if (!metricRows) return;

    // List of preset metric names
    var presetNames = [
      "Countermovement Push-Up (CMPU)",
      "Closed Kinetic Chain Upper Extremity Stability Test (CKCUEST)",
      "20mm Edge Pull Strength",
      "Max Pull Ups",
      "Max Hang Time",
      "90 Degree Bent Leg Hang",
      "Adapted Grant Foot Raise",
      "Ape Index",
      "Vertical Jump Height",
      "Single Leg Squat Test",
      "Single Leg Heel Raise Test",
      "Side Plank with Hip Abduction Hold (Max Time)",
      "Knee to Wall (Ankle DF Test)",
      "Y Balance (Anterior Reach)",
      "Broad Jump",
      "Tripple Hop",
      "Resting HR",
      "Max HR",
      "Height",
      "Weight",
      "BMI",
      "Blood Pressure",
      "VO2 Max"
    ];
    var isPreset = presetNames.includes(metric.metric_name);

    var row = document.createElement("div");
    row.className = "admin-metric-row metric-card-ui";
    row.innerHTML = `
      <div class="metric-card-fields">
        <div class="metric-field metric-name-field">
          <span class="metric-icon" title="Metric Name">🏷️</span>
          ${isPreset
            ? `<span class="metric-preset-label" title="Preset metric">${escapeHtml(metric.metric_name)}</span><input type="hidden" data-admin-metric-name value="${escapeAttribute(metric.metric_name || "")}" />`
            : `<input type="text" data-admin-metric-name placeholder="Metric name (e.g. Max HR)" value="${escapeAttribute(metric.metric_name || "")}" />`
          }
        </div>
        <div class="metric-field metric-value-field">
          <span class="metric-icon" title="Value">🔢</span>
          <input type="text" data-admin-metric-value placeholder="Value" value="${escapeAttribute(metric.metric_value || "")}" />
        </div>
        <div class="metric-field metric-unit-field">
          <span class="metric-icon" title="Unit">📏</span>
          <input type="text" data-admin-metric-unit placeholder="Unit (e.g. bpm, cm)" value="${escapeAttribute(metric.metric_unit || "")}" />
        </div>
        <div class="metric-field metric-category-field">
          <span class="metric-icon" title="Category">📂</span>
          <select data-admin-metric-category>
            <option value="Performance" ${metric.metric_category==="Performance"?"selected":""}>Performance</option>
            <option value="Cardio" ${metric.metric_category==="Cardio"?"selected":""}>Cardio</option>
            <option value="Strength" ${metric.metric_category==="Strength"?"selected":""}>Strength</option>
            <option value="Mobility" ${metric.metric_category==="Mobility"?"selected":""}>Mobility</option>
            <option value="Other" ${metric.metric_category==="Other"?"selected":""}>Other</option>
          </select>
        </div>
      </div>
      <button type="button" class="admin-metric-remove metric-row-remove" data-admin-metric-remove title="Remove metric">✖</button>
    `;
    metricRows.appendChild(row);
  }

  // Helper for HTML escaping
  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'})[c];
    });
  }

  function collectMetricsFromModal() {
    var rows = Array.prototype.slice.call(
      document.querySelectorAll(".admin-metric-row")
    );

    return rows
      .map(function (row) {
        var name = String((row.querySelector("[data-admin-metric-name]") || {}).value || "").trim();
        var value = String((row.querySelector("[data-admin-metric-value]") || {}).value || "").trim();
        var unit = String((row.querySelector("[data-admin-metric-unit]") || {}).value || "").trim();
        var category = String((row.querySelector("[data-admin-metric-category]") || {}).value || "").trim();

        return {
          metric_name: name,
          metric_value: value,
          metric_unit: unit,
          metric_category: category || "Performance"
        };
      })
      .filter(function (metric) {
        return metric.metric_name && metric.metric_value;
      });
  }

  function onSaveChanges() {
    if (!state.currentAthlete || !state.client) {
      setModalStatus("No athlete selected.", "error");
      return;
    }

    var updated = {
      name: document.querySelector("[data-admin-modal-input='name']").value,
      sport: document.querySelector("[data-admin-modal-input='sport']").value,
      level: document.querySelector("[data-admin-modal-input='level']").value,
      bio: document.querySelector("[data-admin-modal-input='bio']").value,
      age: parseInt(
        document.querySelector("[data-admin-modal-input='age']").value || 0,
        10
      ) || null,
      location: document.querySelector("[data-admin-modal-input='location']")
        .value,
      updated_at: new Date().toISOString()
    };

    var metricsPayload = collectMetricsFromModal().map(function (metric) {
      return Object.assign({}, metric, {
        user_id: state.currentAthlete.user_id,
        updated_at: new Date().toISOString()
      });
    });

    setModalStatus("Saving changes...", "info");

    state.client
      .from("athlete_profiles")
      .upsert(Object.assign({}, updated, { user_id: state.currentAthlete.user_id }))
      .then(function (result) {
        if (result.error) {
          setModalStatus(result.error.message, "error");
          return;
        }

        saveAthleteMetrics(metricsPayload, function (metricsSaved, metricsMessage) {
          state.currentAthlete = Object.assign({}, state.currentAthlete, updated);
          var statusMessage = metricsSaved
            ? "Profile and metrics updated successfully!"
            : "Profile updated. " + metricsMessage;
          setModalStatus(statusMessage, metricsSaved ? "success" : "info");
          setTimeout(function () {
            loadAthletes();
          }, 1000);
        });
      })
      .catch(function (error) {
        setModalStatus(
          error && error.message ? error.message : "Failed to save changes.",
          "error"
        );
      });
  }

  function saveAthleteMetrics(metricsPayload, done) {
    if (!state.currentAthlete || !state.client) {
      done(false, "No athlete selected for metric save.");
      return;
    }

    state.client
      .from("athlete_metrics")
      .delete()
      .eq("user_id", state.currentAthlete.user_id)
      .then(function (deleteResult) {
        if (deleteResult.error) {
          if (isMissingTableError(deleteResult.error)) {
            done(false, "Metrics table is not set up yet.");
            return;
          }

          done(false, deleteResult.error.message);
          return;
        }

        if (!metricsPayload.length) {
          done(true, "Metrics cleared.");
          return;
        }

        state.client
          .from("athlete_metrics")
          .insert(metricsPayload)
          .then(function (insertResult) {
            if (insertResult.error) {
              done(false, insertResult.error.message);
              return;
            }

            done(true, "Metrics saved.");
          })
          .catch(function (error) {
            done(false, error && error.message ? error.message : "Failed to save metrics.");
          });
      })
      .catch(function (error) {
        done(false, error && error.message ? error.message : "Failed to save metrics.");
      });
  }

  function onEditAthlete() {
    if (!state.currentAthlete) {
      setModalStatus("No athlete selected.", "error");
      return;
    }
    var url = "athlete-editor.html?athleteId=" + encodeURIComponent(state.currentAthlete.user_id || "") +
              "&athleteName=" + encodeURIComponent(state.currentAthlete.name || state.currentAthlete.email || "Athlete");
    window.location.href = url;
  }

  function onResetPassword() {
    if (!state.currentAthlete || !confirm("Send password reset email?")) {
      return;
    }

    setModalStatus("Sending password reset email...", "info");

    state.client.auth
      .resetPasswordForEmail(state.currentAthlete.email, {
        redirectTo: getPasswordResetRedirectUrl()
      })
      .then(function (result) {
        if (result.error) {
          setModalStatus(result.error.message, "error");
          return;
        }

        setModalStatus(
          "Password reset email sent to " +
            state.currentAthlete.email,
          "success"
        );
      })
      .catch(function (error) {
        setModalStatus(
          error && error.message
            ? error.message
            : "Failed to send password reset email.",
          "error"
        );
      });
  }

  function onDeleteAthlete() {
    if (!state.currentAthlete) {
      setModalStatus("No athlete selected.", "error");
      return;
    }

    executeAthleteDelete(state.currentAthlete, true);
  }

  function executeAthleteDelete(athlete, fromModal) {
    if (!athlete) {
      return;
    }

    var athleteLabel = athlete.email || athlete.name || "this athlete";
    if (!confirm("Permanently delete " + athleteLabel + " account?")) {
      return;
    }

    if (!confirm("This action cannot be undone. Continue?")) {
      return;
    }

    setDeleteStatus("Deleting account...", "info", fromModal);

    // Preferred path: server-side RPC that deletes profile/metrics/assignments and auth user.
    state.client
      .rpc("admin_delete_athlete_account", {
        target_user_id: athlete.user_id
      })
      .then(function (rpcResult) {
        if (rpcResult.error) {
          handleLegacyAthleteDelete(athlete, rpcResult.error, fromModal);
          return;
        }

        state.athletes = state.athletes.filter(function (item) {
          return item.user_id !== athlete.user_id;
        });
        renderAthletesTable();
        updateStats();

        setDeleteStatus("Athlete account deleted.", "success", fromModal);
        setTimeout(function () {
          if (fromModal) {
            closeModal();
          }
          setStatus("Athlete account deleted.", "success");
        }, 700);
      })
      .catch(function (error) {
        handleLegacyAthleteDelete(athlete, error, fromModal);
      });
  }

  function handleLegacyAthleteDelete(athlete, deleteError, fromModal) {
    state.client
      .from("athlete_profiles")
      .delete()
      .eq("user_id", athlete.user_id)
      .then(function (result) {
        if (result.error) {
          setDeleteStatus(result.error.message, "error", fromModal);
          return;
        }

        hideAthleteFromDashboard(athlete.user_id);
        state.athletes = state.athletes.filter(function (item) {
          return item.user_id !== athlete.user_id;
        });
        renderAthletesTable();
        updateStats();

        setDeleteStatus(
          "Profile removed from dashboard, but full auth-account delete is not configured yet.",
          "info",
          fromModal
        );
        setTimeout(function () {
          if (fromModal) {
            closeModal();
          }
          setStatus(
            "Profile removed. To fully delete athlete logins, run sql/admin-delete-athlete-account-rpc.sql in Supabase.",
            "info"
          );
        }, 1000);
      })
      .catch(function (error) {
        var baseMessage = error && error.message ? error.message : "Failed to delete account.";
        var priorMessage = deleteError && deleteError.message ? " " + deleteError.message : "";
        setDeleteStatus(
          baseMessage + priorMessage,
          "error",
          fromModal
        );
      });
  }

  function setDeleteStatus(message, variant, fromModal) {
    if (fromModal) {
      setModalStatus(message, variant);
      return;
    }
    setStatus(message, variant);
  }

  function onAddAthleteAccount() {
    openAddAthleteModal();
  }

  function onSubmitAddAthleteAccount(event) {
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault();
    }

    if (!state.client || !state.user) {
      setStatus("You must be logged in as coach to add athletes.", "error");
      return;
    }

    var emailField = document.querySelector("[data-admin-add-athlete-email]");
    var nameField = document.querySelector("[data-admin-add-athlete-name]");
    var sportField = document.querySelector("[data-admin-add-athlete-sport]");
    var levelField = document.querySelector("[data-admin-add-athlete-level]");
    var sexField = document.querySelector("[data-admin-add-athlete-sex]");
    var heightField = document.querySelector("[data-admin-add-athlete-height]");
    var autoPasswordField = document.querySelector("[data-admin-add-athlete-generate-password]");
    var customPasswordField = document.querySelector("[data-admin-add-athlete-password]");

    var email = String((emailField && emailField.value) || "").trim().toLowerCase();
    if (!email) {
      setAddAthleteStatus("Email is required.", "error");
      if (emailField) {
        emailField.focus();
      }
      return;
    }

    if (email.indexOf("@") < 1 || email.indexOf(".") < 3) {
      setAddAthleteStatus("Please enter a valid athlete email.", "error");
      return;
    }

    var emailExists = state.athletes.some(function (athlete) {
      return String(athlete && athlete.email || "").trim().toLowerCase() === email;
    });
    if (emailExists) {
      setAddAthleteStatus("An athlete account with this email already exists.", "info");
      return;
    }

    var name = String((nameField && nameField.value) || "").trim();
    var sport = String((sportField && sportField.value) || "").trim();
    var level = String((levelField && levelField.value) || "").trim();
    var sex = String((sexField && sexField.value) || "").trim() || null;
    var height = parseFloat((heightField && heightField.value) || "") || null;

    var useGeneratedPassword = !autoPasswordField || !!autoPasswordField.checked;
    var defaultPassword = useGeneratedPassword
      ? buildTemporaryPassword()
      : String((customPasswordField && customPasswordField.value) || "").trim();

    if (!defaultPassword || defaultPassword.length < 8) {
      setAddAthleteStatus("Temporary password must be at least 8 characters.", "error");
      return;
    }

    var isolatedAuthClient = createIsolatedAuthClient();

    if (!isolatedAuthClient) {
      setAddAthleteStatus("Could not create signup client.", "error");
      return;
    }

    setAddAthleteStatus("Creating athlete account...", "info");

    isolatedAuthClient.auth
      .signUp({
        email: email,
        password: defaultPassword,
        options: {
          data: {
            role: "athlete",
            full_name: name || null,
            must_change_password: true
          }
        }
      })
      .then(function (result) {
        if (result.error) {
          var errorMessage = String(result.error.message || "");
          if (errorMessage.toLowerCase().indexOf("already") > -1) {
            setAddAthleteStatus("Athlete already exists. No email was sent.", "info");
            return;
          }

          setAddAthleteStatus(result.error.message, "error");
          return;
        }

        var createdUserId = result.data && result.data.user && result.data.user.id;
        var initialMetrics = collectAddAthleteMetricRows();

        if (createdUserId) {
          upsertAthleteProfile(createdUserId, {
            name: name,
            sport: sport,
             level: level,
             sex: sex,
             height_cm: height
          });

          saveInitialAthleteMetrics(createdUserId, initialMetrics)
            .then(function () {
              if (initialMetrics.length) {
                setAddAthleteStatus(
                  "Athlete account created with " + initialMetrics.length + " baseline metric(s). Share login details below.",
                  "success"
                );
              } else {
                setAddAthleteStatus("Athlete account created. Share temporary login details below.", "success");
              }
            })
            .catch(function (metricsError) {
              setAddAthleteStatus(
                "Athlete account created, but baseline metrics were not saved: " +
                  (metricsError && metricsError.message ? metricsError.message : "Unknown error"),
                "info"
              );
            });
        } else {
          setAddAthleteStatus(
            "Athlete account created, but profile id was unavailable for baseline metrics.",
            "info"
          );
        }

        setAddAthleteCredentialPreview(email, defaultPassword, name);
        setStatus("Athlete account created for " + email + ".", "success");

        setTimeout(function () {
          loadAthletes();
        }, 600);
      })
      .catch(function (error) {
        setAddAthleteStatus(
          error && error.message ? error.message : "Failed to create athlete account.",
          "error"
        );
      });
  }

  function openAddAthleteModal() {
    var modal = document.querySelector("[data-admin-add-athlete-modal]");
    if (!modal) {
      return;
    }

    modal.hidden = false;
    syncModalBodyState();
    resetAddAthleteForm();

    var emailField = document.querySelector("[data-admin-add-athlete-email]");
    if (emailField) {
      emailField.focus();
    }
  }

  function closeAddAthleteModal() {
    var modal = document.querySelector("[data-admin-add-athlete-modal]");
    if (!modal || modal.hidden) {
      return;
    }

    modal.hidden = true;
    syncModalBodyState();
  }

  function toggleAddAthletePasswordMode() {
    var autoField = document.querySelector("[data-admin-add-athlete-generate-password]");
    var customRow = document.querySelector("[data-admin-add-athlete-custom-password-row]");
    var customField = document.querySelector("[data-admin-add-athlete-password]");
    var useAuto = !autoField || !!autoField.checked;

    if (customRow) {
      customRow.hidden = useAuto;
    }

    if (customField) {
      customField.required = !useAuto;
      if (useAuto) {
        customField.value = "";
      }
    }
  }

  function resetAddAthleteForm() {
    var form = document.querySelector("[data-admin-add-athlete-form]");
    if (form) {
      form.reset();
    }

    var autoField = document.querySelector("[data-admin-add-athlete-generate-password]");
    if (autoField) {
      autoField.checked = true;
    }

    toggleAddAthletePasswordMode();
    setAddAthleteStatus("", "info");

    var metricRows = document.querySelector("[data-admin-add-athlete-metrics]");
    if (metricRows) {
      metricRows.innerHTML = "";
    }

    loadAddAthleteTemplate("general");

    var templateSelect = document.querySelector("[data-admin-add-athlete-template-select]");
    if (templateSelect) {
      templateSelect.value = "general";
    }

    var credsPanel = document.querySelector("[data-admin-add-athlete-credentials]");
    if (credsPanel) {
      credsPanel.hidden = true;
    }

    var credsPreview = document.querySelector("[data-admin-add-athlete-credentials-preview]");
    if (credsPreview) {
      credsPreview.textContent = "";
    }
  }

  function setAddAthleteStatus(message, variant) {
    var statusEl = document.querySelector("[data-admin-add-athlete-status]");
    if (!statusEl) {
      return;
    }

    statusEl.textContent = message || "";
    statusEl.classList.remove("is-error", "is-success", "is-info");
    if (variant === "error") {
      statusEl.classList.add("is-error");
    } else if (variant === "success") {
      statusEl.classList.add("is-success");
    } else {
      statusEl.classList.add("is-info");
    }
  }

  function setAddAthleteCredentialPreview(email, password, name) {
    var panel = document.querySelector("[data-admin-add-athlete-credentials]");
    var preview = document.querySelector("[data-admin-add-athlete-credentials-preview]");
    if (!panel || !preview) {
      return;
    }

    var lines = [
      "Nomadic Performance Athlete Account",
      name ? "Name: " + name : null,
      "Email: " + email,
      "Temporary Password: " + password,
      "Login URL: " + window.location.origin + "/index.html",
      "Please change this password after first login."
    ].filter(function (line) {
      return !!line;
    });

    preview.textContent = lines.join("\n");
    panel.hidden = false;
  }

  function copyAddAthleteCredentials() {
    var preview = document.querySelector("[data-admin-add-athlete-credentials-preview]");
    var content = String((preview && preview.textContent) || "").trim();
    if (!content) {
      setAddAthleteStatus("No credentials to copy yet.", "info");
      return;
    }

    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      setAddAthleteStatus("Clipboard is unavailable in this browser.", "error");
      return;
    }

    navigator.clipboard
      .writeText(content)
      .then(function () {
        setAddAthleteStatus("Credentials copied to clipboard.", "success");
      })
      .catch(function () {
        setAddAthleteStatus("Could not copy credentials. Please copy manually.", "error");
      });
  }

  function buildTemporaryPassword() {
    var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%!";
    var length = 14;
    var result = "";

    for (var i = 0; i < length; i += 1) {
      var index = Math.floor(Math.random() * alphabet.length);
      result += alphabet.charAt(index);
    }

    return result;
  }

  function appendAddAthleteMetricRow(values) {
    var list = document.querySelector("[data-admin-add-athlete-metrics]");
    if (!list) {
      return;
    }

    var metric = values || {};
    var row = document.createElement("div");
    row.setAttribute("data-admin-add-athlete-metric-row", "1");

    if (metric.apeIndex) {
      row.className = "admin-add-athlete-metric-row admin-add-athlete-metric-row--ape";
      row.setAttribute("data-ape-index-row", "1");
      row.innerHTML =
        '<span class="admin-ape-label">Ape Index</span>' +
        '<input type="number" data-add-athlete-ape-height placeholder="Height (cm)" />' +
        '<input type="number" data-add-athlete-ape-wingspan placeholder="Wingspan (cm)" />' +
        '<input type="text" data-add-athlete-metric-value placeholder="= cm" readonly class="admin-ape-result" />' +
        '<button type="button" class="btn admin-btn-delete-mini" data-admin-add-athlete-metric-remove>Remove</button>';

      list.appendChild(row);

      var heightInput = row.querySelector("[data-add-athlete-ape-height]");
      var wingspanInput = row.querySelector("[data-add-athlete-ape-wingspan]");
      var valueInput = row.querySelector("[data-add-athlete-metric-value]");
      function calcApeIndex() {
        var h = parseFloat(heightInput.value);
        var w = parseFloat(wingspanInput.value);
        valueInput.value = (!isNaN(h) && !isNaN(w)) ? (w - h).toFixed(1) : "";
      }
      heightInput.addEventListener("input", calcApeIndex);
      wingspanInput.addEventListener("input", calcApeIndex);
    } else {
      row.className = "admin-add-athlete-metric-row";
      row.innerHTML =
        '<input type="text" data-add-athlete-metric-name placeholder="Metric" value="' + escapeAttribute(metric.name || "") + '" />' +
        '<input type="text" data-add-athlete-metric-value placeholder="Result" value="' + escapeAttribute(metric.value || "") + '" />' +
        '<input type="text" data-add-athlete-metric-unit placeholder="Unit" value="' + escapeAttribute(metric.unit || "") + '" />' +
        '<select data-add-athlete-metric-category>' +
        buildAddAthleteMetricCategoryOptions(metric.category || "Performance") +
        '</select>' +
        '<button type="button" class="btn admin-btn-delete-mini" data-admin-add-athlete-metric-remove>Remove</button>';

      list.appendChild(row);
    }
  }

  function buildAddAthleteMetricCategoryOptions(selectedCategory) {
    var categories = ["Strength", "Cardio", "Mobility", "Performance"];
    return categories
      .map(function (category) {
        var selected = category === selectedCategory ? " selected" : "";
        return '<option value="' + escapeAttribute(category) + '"' + selected + '>' + escapeHtml(category) + '</option>';
      })
      .join("");
  }

  function collectAddAthleteMetricRows() {
    var list = document.querySelector("[data-admin-add-athlete-metrics]");
    if (!list) {
      return [];
    }

    return Array.prototype.slice
      .call(list.querySelectorAll("[data-admin-add-athlete-metric-row]"))
      .map(function (row) {
        if (row.hasAttribute("data-ape-index-row")) {
          var apeValue = String((row.querySelector("[data-add-athlete-metric-value]") || {}).value || "").trim();
          return {
            metric_name: "Ape Index",
            metric_value: apeValue,
            metric_unit: "cm",
            metric_category: "Performance"
          };
        }

        var name = String((row.querySelector("[data-add-athlete-metric-name]") || {}).value || "").trim();
        var value = String((row.querySelector("[data-add-athlete-metric-value]") || {}).value || "").trim();
        var unit = String((row.querySelector("[data-add-athlete-metric-unit]") || {}).value || "").trim();
        var category = String((row.querySelector("[data-add-athlete-metric-category]") || {}).value || "").trim() || "Performance";

        return {
          metric_name: name,
          metric_value: value,
          metric_unit: unit,
          metric_category: category
        };
      })
      .filter(function (metric) {
        return !!metric.metric_name;
      });
  }

  function expandTemplateMetrics(templates) {
    var result = [];
    templates.forEach(function (t) {
      if (t.bilateral) {
        result.push({ name: t.name + " (Left)", unit: t.unit, category: t.category });
        result.push({ name: t.name + " (Right)", unit: t.unit, category: t.category });
      } else {
        result.push(t);
      }
    });
    return result;
  }

  function seedAddAthleteMetricRowsFromSport() {
    var sportField = document.querySelector("[data-admin-add-athlete-sport]");
    var sport = String((sportField && sportField.value) || "").trim().toLowerCase();
    var raw = METRIC_TEMPLATES_BY_SPORT[sport] || [
      { name: "Resting HR", unit: "bpm", category: "Cardio" },
      { name: "Weight", unit: "kg", category: "Performance" },
      { name: "Vertical Jump", unit: "cm", category: "Strength" }
    ];
    var templates = expandTemplateMetrics(raw);

    var list = document.querySelector("[data-admin-add-athlete-metrics]");
    if (!list) {
      return;
    }

    list.innerHTML = "";
    templates.forEach(function (template) {
      appendAddAthleteMetricRow({
        name: template.name,
        value: "",
        unit: template.unit,
        category: template.category
      });
    });

    setAddAthleteStatus("Loaded " + templates.length + " suggested baseline metrics.", "info");
  }

  function loadAddAthleteTemplate(key) {
    var templates = BASELINE_TEMPLATES[key];
    if (!templates || !templates.length) {
      setAddAthleteStatus("No template found for: " + key, "error");
      return;
    }

    var list = document.querySelector("[data-admin-add-athlete-metrics]");
    if (!list) {
      return;
    }

    list.innerHTML = "";
    expandTemplateMetrics(templates).forEach(function (template) {
      appendAddAthleteMetricRow({
        name: template.name,
        value: "",
        unit: template.unit,
        category: template.category,
        apeIndex: template.apeIndex || false
      });
    });

    var labelMap = {
      running: "Running Baseline",
      cycling: "Cycling Baseline",
      skiing: "Ski Fitness Baseline",
      snowboarding: "Snowboard Fitness Baseline",
      climbing: "Climbing Fitness Baseline",
      hiking: "Hiking Baseline",
      general: "General Fitness Baseline"
    };
    setAddAthleteStatus(
      "Loaded " + templates.length + " metrics from \"" + (labelMap[key] || key) + "\" template.",
      "info"
    );
  }

  function saveInitialAthleteMetrics(userId, metrics) {
    if (!state.client || !userId || !metrics || !metrics.length) {
      return Promise.resolve();
    }

    var nowIso = new Date().toISOString();
    var rows = metrics.map(function (metric) {
      return {
        user_id: userId,
        metric_name: metric.metric_name,
        metric_value: metric.metric_value || "",
        metric_unit: metric.metric_unit || "",
        metric_category: metric.metric_category || "Performance",
        updated_at: nowIso
      };
    });

    return state.client
      .from("athlete_metrics")
      .insert(rows)
      .then(function (result) {
        if (result.error) {
          throw result.error;
        }
      });
  }

  function upsertAthleteProfile(userId, profile) {
    if (!state.client || !userId) {
      return;
    }

    var payload = {
      user_id: userId,
      name: profile && profile.name ? profile.name : null,
      sport: profile && profile.sport ? profile.sport : null,
      level: profile && profile.level ? profile.level : null,
       sex: profile && profile.sex ? profile.sex : null,
       height_cm: profile && profile.height_cm ? profile.height_cm : null,
      updated_at: new Date().toISOString()
    };

    state.client
      .from("athlete_profiles")
      .upsert(payload)
      .then(function () {
        // Ignore profile upsert errors here so account creation flow stays simple.
      })
      .catch(function () {
        // Intentionally noop.
      });
  }

  function createIsolatedAuthClient() {
    if (!window.supabase || !window.supabase.createClient) {
      return null;
    }

    var url = window.NOMADIC_SUPABASE_URL;
    var key = window.NOMADIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return null;
    }

    return window.supabase.createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }

  function showModal() {
    var modal = document.querySelector("[data-admin-modal]");
    if (modal) {
      modal.hidden = false;
      syncModalBodyState();
    }
  }

  function closeModal() {
    var modal = document.querySelector("[data-admin-modal]");
    if (modal) {
      modal.hidden = true;
      syncModalBodyState();
    }

    state.currentAthlete = null;
    state.currentMetrics = [];
  }

  function showAssignModal() {
    var modal = document.querySelector("[data-admin-assign-modal]");
    if (modal) {
      modal.hidden = false;
      syncModalBodyState();
    }
  }

  function closeAssignModal() {
    var modal = document.querySelector("[data-admin-assign-modal]");
    if (modal) {
      modal.hidden = true;
      syncModalBodyState();
    }
    state.assignmentTemplateId = null;
    setAssignStatus("", "info");
  }

  function syncModalBodyState() {
    var addAthleteModal = document.querySelector("[data-admin-add-athlete-modal]");
    var athleteModal = document.querySelector("[data-admin-modal]");
    var assignModal = document.querySelector("[data-admin-assign-modal]");
    var libraryModal = document.querySelector("[data-admin-library-modal]");
    var anyOpen =
      (addAthleteModal && !addAthleteModal.hidden) ||
      (athleteModal && !athleteModal.hidden) ||
      (assignModal && !assignModal.hidden) ||
      (libraryModal && !libraryModal.hidden);
    if (anyOpen) {
      document.body.classList.add("admin-modal-open");
    } else {
      document.body.classList.remove("admin-modal-open");
    }
  }

  function setAssignStatus(message, variant) {
    var statusEl = document.querySelector("[data-admin-assign-status]");
    if (!statusEl) {
      return;
    }

    statusEl.textContent = message || "";
    statusEl.classList.remove("is-error", "is-success", "is-info");
    if (variant === "error") {
      statusEl.classList.add("is-error");
    } else if (variant === "success") {
      statusEl.classList.add("is-success");
    } else {
      statusEl.classList.add("is-info");
    }
  }

  function updateStats() {
    var totalEl = document.querySelector("[data-stat-total-athletes]");
    var profilesEl = document.querySelector("[data-stat-profiles]");

    if (totalEl) {
      totalEl.textContent = state.athletes.length;
    }

    var withProfiles = state.athletes.filter(function (a) {
      return a.name || a.sport || a.bio;
    }).length;

    if (profilesEl) {
      profilesEl.textContent = withProfiles;
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
          id: item.id,
          name: item.name || "Untitled Template",
          created_at: item.created_at,
          updated_at: item.updated_at,
          archived: !!item.archived,
          structure: item.structure || { weeks: 1, workoutsPerWeek: 3 },
          days: item.days || {}
        };
      });
    } catch (e) {
      return [];
    }
  }

  function readHiddenAthleteIds() {
    try {
      var raw = window.localStorage.getItem(HIDDEN_ATHLETES_KEY);
      if (!raw) {
        return {};
      }

      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return {};
      }

      return parsed;
    } catch (e) {
      return {};
    }
  }

  function readExerciseLibrary() {
    try {
      var raw = window.localStorage.getItem(EXERCISE_LIBRARY_KEY);
      if (!raw) {
        return [];
      }

      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map(function (item) {
        return {
          id: item.id,
          name: item.name || "",
          movement_pattern: item.movement_pattern || "",
          equipment: item.equipment || "",
          primary_muscle: item.primary_muscle || "",
          training_goal: item.training_goal || "",
          sport_tags: Array.isArray(item.sport_tags) ? item.sport_tags : [],
          custom_tags: Array.isArray(item.custom_tags) ? item.custom_tags : [],
          description: item.description || "",
          coaching_cues: item.coaching_cues || "",
          created_at: item.created_at,
          updated_at: item.updated_at
        };
      });
    } catch (e) {
      return [];
    }
  }

  function mapExerciseLibraryRow(item) {
    return {
      id: item && item.id,
      name: item && item.name ? item.name : "",
      movement_pattern: item && item.movement_pattern ? item.movement_pattern : "",
      equipment: item && item.equipment ? item.equipment : "",
      primary_muscle: item && item.primary_muscle ? item.primary_muscle : "",
      training_goal: item && item.training_goal ? item.training_goal : "",
      sport_tags: item && Array.isArray(item.sport_tags) ? item.sport_tags : [],
      custom_tags: item && Array.isArray(item.custom_tags) ? item.custom_tags : [],
      description: item && item.description ? item.description : "",
      coaching_cues: item && item.coaching_cues ? item.coaching_cues : "",
      created_at: item && item.created_at,
      updated_at: item && item.updated_at
    };
  }

  function syncLocalExerciseLibraryToSupabase(localItems) {
    if (!state.client || !localItems || !localItems.length) {
      return;
    }

    state.client
      .from(EXERCISE_LIBRARY_TABLE)
      .upsert(localItems)
      .then(function (result) {
        if (result.error) {
          return;
        }

        setStatus("Exercise library synced from local cache to Supabase.", "success");
        setTimeout(function () {
          clearStatus();
        }, 1800);
      })
      .catch(function () {
        // Keep local fallback if sync fails.
      });
  }

  function writeExerciseLibrary(items) {
    try {
      window.localStorage.setItem(EXERCISE_LIBRARY_KEY, JSON.stringify(items || []));
    } catch (e) {
      setExerciseLibraryStatus("Could not save exercise library in this browser.", "error");
    }
  }

  function hideAthleteFromDashboard(userId) {
    if (!userId) {
      return;
    }

    try {
      var hiddenIds = readHiddenAthleteIds();
      hiddenIds[userId] = true;
      window.localStorage.setItem(HIDDEN_ATHLETES_KEY, JSON.stringify(hiddenIds));
    } catch (e) {
      setStatus("Account deleted, but could not persist dashboard hide list.", "info");
    }
  }

  function writeTemplateLibrary(templates) {
    try {
      window.localStorage.setItem(TEMPLATE_LIBRARY_KEY, JSON.stringify(templates || []));
    } catch (e) {
      setStatus("Could not update template library in this browser.", "error");
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

  function showError(message) {
    if (state.guardElement) {
      state.guardElement.innerHTML =
        "<div style=\"padding: 2rem; text-align: center; color: #9f2d20;\">" +
        "<p style=\"font-size: 1.1rem; font-weight: 700;\">" +
        message +
        "</p>" +
        "<p><a href=\"index.html\" class=\"btn\" style=\"display: inline-block; margin-top: 1rem;\">Return Home</a></p>" +
        "</div>";
    }
  }

  function redirectToHome() {
    window.location.href = "index.html";
  }

  function setStatus(message, variant) {
    var statusEl = document.querySelector(".admin-status");
    if (!statusEl) {
      return;
    }

    statusEl.textContent = message || "";
    statusEl.classList.remove("is-error", "is-success", "is-info");

    if (variant === "error") {
      statusEl.classList.add("is-error");
    } else if (variant === "success") {
      statusEl.classList.add("is-success");
    } else {
      statusEl.classList.add("is-info");
    }
  }

  function clearStatus() {
    var statusEl = document.querySelector(".admin-status");
    if (statusEl) {
      statusEl.textContent = "";
      statusEl.classList.remove("is-error", "is-success", "is-info");
    }
  }

  function setModalStatus(message, variant) {
    var statusEl = document.querySelector("[data-admin-modal-status]");
    if (!statusEl) {
      return;
    }

    statusEl.textContent = message || "";
    statusEl.classList.remove("is-error", "is-success", "is-info");

    if (variant === "error") {
      statusEl.classList.add("is-error");
    } else if (variant === "success") {
      statusEl.classList.add("is-success");
    } else {
      statusEl.classList.add("is-info");
    }
  }

  function clearModalStatus() {
    var statusEl = document.querySelector("[data-admin-modal-status]");
    if (statusEl) {
      statusEl.textContent = "";
      statusEl.classList.remove("is-error", "is-success", "is-info");
    }
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
      return dateString || "N/A";
    }
  }

  function escapeHtml(text) {
    if (!text) return "";
    var map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return text.replace(/[&<>"']/g, function (m) {
      return map[m];
    });
  }

  function escapeAttribute(text) {
    return escapeHtml(String(text || "")).replace(/`/g, "");
  }

  function isMissingTableError(error) {
    var msg = error && error.message ? error.message.toLowerCase() : "";
    return error && error.code === "42P01" || msg.indexOf("does not exist") > -1;
  }

  function getPasswordResetRedirectUrl() {
    return window.location.origin + "/update-password.html";
  }
})();
