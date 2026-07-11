(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var TEMPLATE_LIBRARY_KEY = "nomadic_training_program_templates_v1";
  var HIDDEN_ATHLETES_KEY = "nomadic_hidden_athletes_v1";
  var COACH_TODO_KEY = "nomadic_coach_todo_v1";
  var COACH_AUTOMATED_TODO_DISMISSED_KEY = "nomadic_coach_automated_todo_dismissed_v1";
  var COACH_FLAGS_KEY = "nomadic_coach_flags_v1";
  var MEMBERSHIP_PAYMENT_TASK_FORM_ID = "membership-payment-task-v1";
  var MEMBERSHIP_PAYMENT_TASK_NAME = "Complete Membership Payment";
  var MEMBERSHIP_PAYMENT_TASK_URL = "founding-member.html?checkout=start";
  var EXERCISE_LIBRARY_KEY = "nomadic_exercise_library_v1";
  var EXERCISE_LIBRARY_TABLE = "exercise_library";
  var TEMPLATE_MARKER = "__NOMADIC_TEMPLATE__";
  var METRIC_TEMPLATES_BY_SPORT = {
    running: [
      { name: "Vertical Jump", unit: "cm", category: "Strength" },
      { name: "Single Leg Squat Test", unit: "reps", category: "Strength", bilateral: false },
      { name: "Single Leg Heel Raise", unit: "reps", category: "Strength", bilateral: false },
      { name: "Side Plank with Hip Abduction", unit: "sec", category: "Strength", bilateral: false },
      { name: "Y Balance", unit: "%", category: "Mobility", bilateral: false }
    ],
    cycling: [
      { name: "20-min Power (FTP Estimate)", unit: "watts", category: "Performance" },
      { name: "Resting HR", unit: "bpm", category: "Cardio" },
      { name: "Max HR", unit: "bpm", category: "Cardio" },
      { name: "VO2 Max (estimated)", unit: "ml/kg/min", category: "Cardio" },
      { name: "Y Balance – Anterior", unit: "%", category: "Mobility", bilateral: false },
      { name: "Single Leg Squat", unit: "reps", category: "Strength", bilateral: false },
      { name: "Hip Flexor Flexibility", unit: "deg", category: "Mobility" }
    ],
    skiing: [
      { name: "Single Leg Sit to Stand", unit: "reps", category: "Strength" },
      { name: "Side Plank", unit: "sec", category: "Strength", bilateral: true },
      { name: "Nordic Hamstring", unit: "reps", category: "Strength" },
      { name: "Broad Jump", unit: "cm", category: "Strength" },
      { name: "Triple Hop", unit: "cm", category: "Performance" },
      { name: "Y Balance – Anterior", unit: "%", category: "Mobility", bilateral: false },
      { name: "Y Balance – PM", unit: "%", category: "Mobility", bilateral: false },
      { name: "Step Down", unit: "reps", category: "Mobility" },
      { name: "Resting HR", unit: "bpm", category: "Cardio" }
    ],
    snowboarding: [
      { name: "Single Leg Sit to Stand", unit: "reps", category: "Strength" },
      { name: "Side Plank", unit: "sec", category: "Strength", bilateral: true },
      { name: "Broad Jump", unit: "cm", category: "Performance" },
      { name: "Triple Hop", unit: "cm", category: "Performance" },
      { name: "Y Balance – Anterior", unit: "%", category: "Mobility", bilateral: false },
      { name: "Y Balance – PM", unit: "%", category: "Mobility", bilateral: false },
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
      { name: "Y Balance – Anterior", unit: "%", category: "Mobility", bilateral: false },
      { name: "Resting HR", unit: "bpm", category: "Cardio" },
      { name: "Grip Strength", unit: "kg", category: "Strength" },
      { name: "Loaded Carry (15kg)", unit: "min", category: "Performance" }
    ]
  };
  var BASELINE_TEMPLATES = {
    running: [
      { name: "Vertical Jump", unit: "cm", category: "Strength" },
      { name: "Single Leg Squat Test", unit: "reps", category: "Strength", bilateral: false },
      { name: "Single Leg Heel Raise", unit: "reps", category: "Strength", bilateral: false },
      { name: "Side Plank with Hip Abduction", unit: "sec", category: "Strength", bilateral: false },
      { name: "Y Balance", unit: "%", category: "Mobility", bilateral: false }
    ],
    cycling: [
      { name: "20-min Power (FTP Estimate)", unit: "watts", category: "Performance" },
      { name: "Resting HR", unit: "bpm", category: "Cardio" },
      { name: "Max HR", unit: "bpm", category: "Cardio" },
      { name: "VO2 Max (estimated)", unit: "ml/kg/min", category: "Cardio" },
      { name: "Y Balance – Anterior", unit: "%", category: "Mobility", bilateral: false },
      { name: "Single Leg Squat", unit: "reps", category: "Strength", bilateral: false },
      { name: "Hip Flexor Flexibility", unit: "deg", category: "Mobility" }
    ],
    skiing: [
      { name: "Single Leg Sit to Stand", unit: "reps", category: "Strength" },
      { name: "Side Plank", unit: "sec", category: "Strength", bilateral: true },
      { name: "Nordic Hamstring", unit: "reps", category: "Strength" },
      { name: "Broad Jump", unit: "cm", category: "Strength" },
      { name: "Triple Hop", unit: "cm", category: "Performance" },
      { name: "Y Balance – Anterior", unit: "%", category: "Mobility", bilateral: false },
      { name: "Y Balance – PM", unit: "%", category: "Mobility", bilateral: false },
      { name: "Step Down", unit: "reps", category: "Mobility" },
      { name: "Resting HR", unit: "bpm", category: "Cardio" }
    ],
    snowboarding: [
      { name: "Single Leg Sit to Stand", unit: "reps", category: "Strength" },
      { name: "Side Plank", unit: "sec", category: "Strength", bilateral: true },
      { name: "Broad Jump", unit: "cm", category: "Performance" },
      { name: "Triple Hop", unit: "cm", category: "Performance" },
      { name: "Y Balance – Anterior", unit: "%", category: "Mobility", bilateral: false },
      { name: "Y Balance – PM", unit: "%", category: "Mobility", bilateral: false },
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
      { name: "Y Balance – Anterior", unit: "%", category: "Mobility", bilateral: false },
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
      { name: "Y Balance – Anterior", unit: "%", category: "Mobility", bilateral: false },
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
    currentStravaDailyMetrics: [],
    templates: [],
    exerciseLibrary: [],
    assignmentTemplateId: null,
    templateFilter: "active",
    memberFilter: "all",
    programFilter: "all",
    purchaseFilter: "all",
    currentPage: 1,
    pageSize: 10,
    searchTerm: "",
    activePrograms: [],
    athleteGoalEvents: [],
    coachReadinessByAthlete: {},
    coachStravaRows: [],
    coachTodos: [],
    dismissedAutomatedTodoKeys: [],
    activeRequestPreviewKey: "",
    coachFlags: [],
    foundingOnboardingRows: [],
    membershipInquiries: [],
    customPlanInquiries: [],
    foundingSignatureSummaryByAthlete: {},
    foundingSubscriptionRows: [],
    foundingIntakeAssignmentRows: [],
    climbingComparisonRows: [],
    athleteProfilesById: {},
    latestMetricRowsByAthlete: {}
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
    state.coachTodos = readCoachTodos();
    state.dismissedAutomatedTodoKeys = readDismissedAutomatedTodoKeys();
    state.coachFlags = readCoachFlags();
    setupEventHandlers();
    loadAthletes();
    loadCoachOverviewData();
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

    var memberFilterInput = document.querySelector("[data-admin-member-filter]");
    if (memberFilterInput) {
      memberFilterInput.addEventListener("change", function (event) {
        state.memberFilter = String((event && event.target && event.target.value) || "all").trim() || "all";
        state.currentPage = 1;
        renderAthletesTable();
      });
    }

    var programFilterInput = document.querySelector("[data-admin-program-filter]");
    if (programFilterInput) {
      programFilterInput.addEventListener("change", function (event) {
        state.programFilter = String((event && event.target && event.target.value) || "all").trim() || "all";
        state.currentPage = 1;
        renderAthletesTable();
      });
    }

    var purchaseFilterInput = document.querySelector("[data-admin-purchase-filter]");
    if (purchaseFilterInput) {
      purchaseFilterInput.addEventListener("change", function (event) {
        state.purchaseFilter = String((event && event.target && event.target.value) || "all").trim() || "all";
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

    var todoForm = document.querySelector("[data-admin-todo-form]");
    if (todoForm) {
      todoForm.addEventListener("submit", onAddCoachTodo);
    }

    var todoList = document.querySelector("[data-admin-todo-list]");
    if (todoList) {
      todoList.addEventListener("click", onCoachTodoListClick);
      todoList.addEventListener("change", onCoachTodoListChange);
    }

    var automatedTodoList = document.querySelector("[data-admin-todo-automated-list]");
    if (automatedTodoList) {
      automatedTodoList.addEventListener("click", onDismissAutomatedTodoClick);
      automatedTodoList.addEventListener("click", onMembershipInquiryActionClick);
      automatedTodoList.addEventListener("click", onCustomPlanInquiryActionClick);
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

    var toggleActiveBtn = document.querySelector("[data-admin-modal-toggle-active]");
    if (toggleActiveBtn) {
      toggleActiveBtn.addEventListener("click", onToggleCurrentAthleteActive);
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
        var toggleBtn = event.target && event.target.closest("[data-admin-toggle-active]");
        if (toggleBtn) {
          var toggleAthleteId = String(toggleBtn.getAttribute("data-athlete-id") || "").trim();
          var toggleAthleteActive = String(toggleBtn.getAttribute("data-athlete-active") || "true") === "true";
          if (!toggleAthleteId) {
            setStatus("Could not find athlete id.", "error");
            return;
          }

          onToggleAthleteActive(toggleAthleteId, !toggleAthleteActive, false);
          return;
        }

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

        var athletes = result.data || [];
        var userIds = athletes
          .map(function (athlete) {
            return athlete && athlete.user_id ? String(athlete.user_id) : "";
          })
          .filter(Boolean);

        return hydrateAthleteActiveStates(athletes, userIds).then(function (athletesWithState) {
          var hiddenAthleteIds = readHiddenAthleteIds();
          state.athletes = athletesWithState.filter(function (athlete) {
            return !hiddenAthleteIds[athlete.user_id];
          });
          state.currentPage = 1;
          renderAthletesTable();
          loadCoachOverviewData();
          updateStats();
          setStatus("Users loaded successfully.", "success");
          setTimeout(function () {
            clearStatus();
          }, 1500);
        });
      })
      .catch(function (error) {
        setStatus(
          error && error.message ? error.message : "Failed to load users.",
          "error"
        );
      });
  }

  function hydrateAthleteActiveStates(athletes, userIds) {
    if (!state.client || !Array.isArray(athletes) || !userIds.length) {
      return Promise.resolve(Array.isArray(athletes) ? athletes : []);
    }

    return state.client
      .from("athlete_profiles")
      .select("user_id,is_active")
      .in("user_id", userIds)
      .then(function (profileResult) {
        if (profileResult.error) {
          return athletes.map(function (athlete) {
            return assignAthleteActiveState(athlete, true);
          });
        }

        var activeByUserId = {};
        (profileResult.data || []).forEach(function (profileRow) {
          if (!profileRow || !profileRow.user_id) {
            return;
          }

          activeByUserId[String(profileRow.user_id)] = profileRow.is_active !== false;
        });

        return athletes.map(function (athlete) {
          var athleteId = String((athlete && athlete.user_id) || "");
          var isActive = Object.prototype.hasOwnProperty.call(activeByUserId, athleteId)
            ? !!activeByUserId[athleteId]
            : true;
          return assignAthleteActiveState(athlete, isActive);
        });
      })
      .catch(function () {
        return athletes.map(function (athlete) {
          return assignAthleteActiveState(athlete, true);
        });
      });
  }

  function assignAthleteActiveState(athlete, isActive) {
    var copy = athlete || {};
    copy.is_active = isActive !== false;
    return copy;
  }

  function renderAthletesTable() {
    var tbody = document.querySelector("[data-admin-table-body]");
    var resultsSummary = document.querySelector("[data-admin-results-summary]");
    if (!tbody) {
      return;
    }

    var activeProgramByUserId = {};
    (state.activePrograms || []).forEach(function (row) {
      if (!row || row.is_active === false || !row.user_id) {
        return;
      }
      activeProgramByUserId[String(row.user_id)] = true;
    });

    var purchasedByUserId = {};
    (state.foundingSubscriptionRows || []).forEach(function (row) {
      var userId = String(row && row.user_id || "").trim();
      if (!userId) {
        return;
      }
      purchasedByUserId[userId] = true;
    });

    var filtered = state.athletes.filter(function (a) {
      if (state.memberFilter === "active" && a.is_active === false) {
        return false;
      }

      if (state.memberFilter === "inactive" && a.is_active !== false) {
        return false;
      }

      var athleteId = String(a && a.user_id || "");
      var hasIndividualizedProgram = !!activeProgramByUserId[athleteId];
      var hasPurchase = !!purchasedByUserId[athleteId];

      if (state.programFilter === "individualized" && !hasIndividualizedProgram) {
        return false;
      }

      if (state.programFilter === "no_individualized" && hasIndividualizedProgram) {
        return false;
      }

      if (state.purchaseFilter === "purchased" && !hasPurchase) {
        return false;
      }

      if (state.purchaseFilter === "no_purchases" && hasPurchase) {
        return false;
      }

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

    if (resultsSummary) {
      if (!filtered.length) {
        resultsSummary.textContent = "No athletes match your search.";
      } else {
        var pageStart = start + 1;
        var pageEnd = Math.min(end, filtered.length);
        var filteredPurchasedCount = filtered.filter(function (athlete) {
          return !!purchasedByUserId[String(athlete && athlete.user_id || "")];
        }).length;
        var filteredIndividualizedCount = filtered.filter(function (athlete) {
          return !!activeProgramByUserId[String(athlete && athlete.user_id || "")];
        }).length;
        resultsSummary.textContent =
          "Showing " +
          String(pageStart) +
          "-" +
          String(pageEnd) +
          " of " +
          String(filtered.length) +
          " athletes (" +
          String(getActiveAthleteCount()) +
          " active, " +
          String(getInactiveAthleteCount()) +
          " inactive, " +
          String(filteredIndividualizedCount) +
          " individualized, " +
          String(filteredPurchasedCount) +
          " purchased)";
      }
    }

    if (!paginated.length) {
      tbody.innerHTML =
        '<tr class="admin-table-loading"><td colspan="7" style="text-align: center; padding: 2rem;">No athletes found for this view.</td></tr>';
      renderPagination(filtered.length);
      return;
    }

    tbody.innerHTML = paginated
      .map(function (athlete) {
        var athleteId = String(athlete.user_id || "");
        var isActive = athlete.is_active !== false;
        var statusLabel = isActive ? "Active" : "Inactive";
        var insightsHref = "athlete-insight.html?athleteId=" + encodeURIComponent(athleteId);
        var sportLabel = athlete.sport ? escapeHtml(athlete.sport) : "Not set";
        var levelLabel = athlete.level ? escapeHtml(athlete.level) : "Not set";
        return (
          "<tr>" +
          "<td class='admin-cell-email'>" + escapeHtml(athlete.email || "N/A") + "</td>" +
          "<td class='admin-cell-name'>" + (athlete.name ? escapeHtml(athlete.name) : "—") + "</td>" +
          "<td><span class='admin-table-chip'>" + sportLabel + "</span></td>" +
          "<td><span class='admin-table-chip is-muted'>" + levelLabel + "</span></td>" +
          "<td><span class='admin-status-pill " + (isActive ? "is-active" : "is-inactive") + "'>" + escapeHtml(statusLabel) + "</span></td>" +
          "<td>" + formatDate(athlete.user_created_at) + "</td>" +
          "<td><div class='admin-table-actions'><a class='btn admin-btn-small admin-action-insights' href='" +
          insightsHref +
          "'>Insights</a><button type='button' class='btn admin-btn-small admin-action-toggle' data-admin-toggle-active='1' data-athlete-active='" +
          (isActive ? "true" : "false") +
          "' data-athlete-id='" +
          escapeAttribute(athleteId) +
          "'>" +
          (isActive ? "Deactivate" : "Activate") +
          "</button><button type='button' class='btn admin-btn-delete-mini admin-action-delete' data-admin-delete-athlete='1' data-athlete-id='" +
          escapeAttribute(athleteId) +
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
    state.currentMetrics = [];
    state.currentStravaDailyMetrics = [];

    populateModal(athlete);
    loadAthleteMetrics(userId);
    loadAthleteStravaProgress(userId);
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

    var coachViewLink = document.querySelector("[data-admin-coach-view-link]");
    if (coachViewLink) {
      coachViewLink.href = "athlete-insight.html?athleteId=" + encodeURIComponent(athlete.user_id || "");
    }

    var metricRows = document.querySelector("[data-admin-metric-rows]");
    if (metricRows) {
      metricRows.innerHTML = '<p class="admin-loading">Loading metrics...</p>';
    }

    renderCoachInsightsLoading();

    var toggleBtn = document.querySelector("[data-admin-modal-toggle-active]");
    if (toggleBtn) {
      var isActive = athlete.is_active !== false;
      toggleBtn.textContent = isActive ? "Deactivate Account" : "Activate Account";
      toggleBtn.setAttribute("data-athlete-active", isActive ? "true" : "false");
    }

    clearModalStatus();
  }

  function loadAthleteMetrics(userId) {
    var metricRows = document.querySelector("[data-admin-metric-rows]");
    if (!state.client || !userId) {
      return;
    }

    if (metricRows) {
      metricRows.innerHTML = '<p class="admin-loading">Loading metrics...</p>';
    }

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
            renderMetricProgressions([]);
            renderCoachInsightCards([], state.currentStravaDailyMetrics);
            setModalStatus(
              "Metrics table not found yet. Create athlete_metrics in Supabase to enable coach metric editing.",
              "info"
            );
            return;
          }

          renderMetricProgressions([]);
          renderCoachInsightCards([], state.currentStravaDailyMetrics);
          setModalStatus(result.error.message, "error");
          return;
        }

        state.currentMetrics = result.data || [];
        renderMetricRows(state.currentMetrics);
        renderMetricProgressions(state.currentMetrics);
      })
      .catch(function (error) {
        renderMetricProgressions([]);
        renderCoachInsightCards([], state.currentStravaDailyMetrics);
        setModalStatus(
          error && error.message ? error.message : "Failed to load metrics.",
          "error"
        );
      });
  }

  function loadAthleteStravaProgress(userId) {
    if (!state.client || !userId) {
      return;
    }

    state.client
      .from("athlete_strava_daily_metrics")
      .select("metric_date,activity_count,distance_m,moving_time_sec,elevation_gain_m,training_load,resting_hr,hrv_ms,sleep_hours,recovery_score")
      .eq("user_id", userId)
      .order("metric_date", { ascending: false })
      .limit(30)
      .then(function (result) {
        if (result.error) {
          state.currentStravaDailyMetrics = [];
          renderLoadSummary([]);
          renderCoachInsightCards(state.currentMetrics, []);
          return;
        }

        state.currentStravaDailyMetrics = Array.isArray(result.data) ? result.data : [];
        renderLoadSummary(state.currentStravaDailyMetrics);
        renderCoachInsightCards(state.currentMetrics, state.currentStravaDailyMetrics);
      })
      .catch(function () {
        state.currentStravaDailyMetrics = [];
        renderLoadSummary([]);
        renderCoachInsightCards(state.currentMetrics, []);
      });
  }

  function renderCoachInsightsLoading() {
    var cardsEl = document.querySelector("[data-admin-insight-cards]");
    var progressionsEl = document.querySelector("[data-admin-metric-progressions]");
    var loadEl = document.querySelector("[data-admin-load-summary]");

    if (cardsEl) {
      cardsEl.innerHTML = '<article class="admin-insight-card is-loading"><span>Loading athlete progress...</span></article>';
    }
    if (progressionsEl) {
      progressionsEl.innerHTML = '<p class="admin-loading">Loading metric progress...</p>';
    }
    if (loadEl) {
      loadEl.innerHTML = '<p class="admin-loading">Loading load summary...</p>';
    }
  }

  function renderCoachInsightCards(metrics, stravaRows) {
    var cardsEl = document.querySelector("[data-admin-insight-cards]");
    if (!cardsEl) {
      return;
    }

    var metricHistory = buildMetricHistoryMap(metrics);
    var trackedCount = Object.keys(metricHistory).length;
    var progressionCount = Object.keys(metricHistory).filter(function (key) {
      return metricHistory[key] && metricHistory[key].length > 1;
    }).length;
    var recentSeven = (Array.isArray(stravaRows) ? stravaRows : []).slice(0, 7);
    var recentThirty = Array.isArray(stravaRows) ? stravaRows : [];
    var weeklyLoad = sumNumeric(recentSeven, "training_load");
    var monthlyLoad = sumNumeric(recentThirty, "training_load");

    var cards = [
      {
        label: "Tracked Metrics",
        value: trackedCount ? String(trackedCount) : "0",
        note: progressionCount ? String(progressionCount) + " with history" : "No progression history yet"
      },
      {
        label: "7-Day Load",
        value: recentSeven.length ? formatInteger(weeklyLoad) : "—",
        note: recentSeven.length ? String(recentSeven.length) + " days synced" : "No recent Strava data"
      },
      {
        label: "30-Day Load",
        value: recentThirty.length ? formatInteger(monthlyLoad) : "—",
        note: recentThirty.length ? String(recentThirty.length) + " days synced" : "No 30-day dataset yet"
      },
      {
        label: "Latest Recovery",
        value: formatNullableValue(findLatestDefined(stravaRows, "recovery_score")),
        note: "Recovery score"
      }
    ];

    cardsEl.innerHTML = cards.map(function (card) {
      return '<article class="admin-insight-card"><span class="admin-insight-card-label">' + escapeHtml(card.label) + '</span><strong class="admin-insight-card-value">' + escapeHtml(card.value) + '</strong><span class="admin-insight-card-note">' + escapeHtml(card.note) + '</span></article>';
    }).join("");
  }

  function renderMetricProgressions(metrics) {
    var container = document.querySelector("[data-admin-metric-progressions]");
    if (!container) {
      return;
    }

    var historyMap = buildMetricHistoryMap(metrics);
    var items = Object.keys(historyMap)
      .map(function (metricName) {
        var history = historyMap[metricName] || [];
        if (!history.length) {
          return null;
        }

        var latest = history[0];
        var previous = history[1] || null;
        return {
          name: metricName,
          latest: formatMetricEntryValue(latest),
          delta: formatMetricDelta(latest, previous),
          updated: formatDate(latest.updated_at || latest.created_at || "")
        };
      })
      .filter(function (item) {
        return !!item;
      })
      .slice(0, 8);

    if (!items.length) {
      container.innerHTML = '<p class="admin-empty-copy">No metric history yet. Add repeated tests over time to unlock progression tracking.</p>';
      renderCoachInsightCards(metrics, state.currentStravaDailyMetrics);
      return;
    }

    container.innerHTML = items.map(function (item) {
      return '<article class="admin-insight-row"><div><strong>' + escapeHtml(item.name) + '</strong><span>' + escapeHtml(item.updated) + '</span></div><div><strong>' + escapeHtml(item.latest) + '</strong><span>' + escapeHtml(item.delta) + '</span></div></article>';
    }).join("");

    renderCoachInsightCards(metrics, state.currentStravaDailyMetrics);
  }

  function renderLoadSummary(rows) {
    var container = document.querySelector("[data-admin-load-summary]");
    if (!container) {
      return;
    }

    var data = Array.isArray(rows) ? rows : [];
    if (!data.length) {
      container.innerHTML = '<p class="admin-empty-copy">No Strava daily metrics synced yet. Connect and sync Strava from the athlete dashboard to unlock daily and weekly load tracking.</p>';
      return;
    }

    var recentSeven = data.slice(0, 7);
    var recentThirty = data.slice(0, 30);
    var items = [
      { label: "Today's Load", value: formatNullableValue(data[0] && data[0].training_load) },
      { label: "7-Day Distance", value: formatDecimal(sumNumeric(recentSeven, "distance_m") / 1000, 1) + " km" },
      { label: "7-Day Moving Time", value: formatDecimal(sumNumeric(recentSeven, "moving_time_sec") / 3600, 1) + " h" },
      { label: "7-Day Elevation", value: formatInteger(sumNumeric(recentSeven, "elevation_gain_m")) + " m" },
      { label: "7-Day Activities", value: formatInteger(sumNumeric(recentSeven, "activity_count")) },
      { label: "30-Day Load", value: formatInteger(sumNumeric(recentThirty, "training_load")) },
      { label: "Resting HR", value: formatNullableValue(findLatestDefined(data, "resting_hr"), " bpm") },
      { label: "HRV", value: formatNullableValue(findLatestDefined(data, "hrv_ms"), " ms") }
    ];

    container.innerHTML = items.map(function (item) {
      return '<article class="admin-insight-row"><div><strong>' + escapeHtml(item.label) + '</strong></div><div><strong>' + escapeHtml(item.value) + '</strong></div></article>';
    }).join("");
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
      "Single Leg Heel Raise",
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

  function onToggleCurrentAthleteActive() {
    if (!state.currentAthlete || !state.currentAthlete.user_id) {
      setModalStatus("No athlete selected.", "error");
      return;
    }

    var isCurrentlyActive = state.currentAthlete.is_active !== false;
    onToggleAthleteActive(String(state.currentAthlete.user_id), !isCurrentlyActive, true);
  }

  function onToggleAthleteActive(athleteId, shouldActivate, fromModal) {
    if (!state.client) {
      setDeleteStatus("Client not ready.", "error", fromModal);
      return;
    }

    setDeleteStatus(shouldActivate ? "Activating account..." : "Deactivating account...", "info", fromModal);

    state.client
      .from("athlete_profiles")
      .upsert({
        user_id: athleteId,
        is_active: !!shouldActivate,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" })
      .then(function (result) {
        if (result.error) {
          setDeleteStatus(result.error.message || "Could not update member status.", "error", fromModal);
          return;
        }

        state.athletes = state.athletes.map(function (athlete) {
          if (!athlete || String(athlete.user_id || "") !== athleteId) {
            return athlete;
          }
          athlete.is_active = !!shouldActivate;
          return athlete;
        });

        if (state.currentAthlete && String(state.currentAthlete.user_id || "") === athleteId) {
          state.currentAthlete.is_active = !!shouldActivate;
          populateModal(state.currentAthlete);
        }

        state.currentPage = 1;
        renderAthletesTable();
        renderCoachOverview();
        updateStats();

        setDeleteStatus(shouldActivate ? "Athlete marked active." : "Athlete marked inactive.", "success", fromModal);
      })
      .catch(function (error) {
        setDeleteStatus(
          error && error.message ? error.message : "Could not update member status.",
          "error",
          fromModal
        );
      });
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
    var foundingMemberField = document.querySelector("[data-admin-add-athlete-founding-member]");
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
    var enrollAsFoundingMember = !!(foundingMemberField && foundingMemberField.checked);

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

          Promise.allSettled([
            saveInitialAthleteMetrics(createdUserId, initialMetrics),
            upsertFoundingMemberOnboarding(createdUserId, enrollAsFoundingMember)
          ])
            .then(function (settled) {
              var metricsResult = settled[0];
              var foundingResult = settled[1];
              var statusParts = [];
              var hasWarning = false;

              if (metricsResult.status === "fulfilled") {
                if (initialMetrics.length) {
                  statusParts.push(initialMetrics.length + " baseline metric(s) saved");
                }
              } else {
                hasWarning = true;
                statusParts.push(
                  "baseline metrics were not saved: " +
                    (metricsResult.reason && metricsResult.reason.message
                      ? metricsResult.reason.message
                      : "Unknown error")
                );
              }

              if (enrollAsFoundingMember) {
                if (foundingResult.status === "fulfilled") {
                  var enrolled = foundingResult.value && foundingResult.value.enrolled;
                  if (enrolled) {
                    statusParts.push("founding onboarding enrolled");
                  } else {
                    statusParts.push("founding onboarding already exists");
                  }
                } else {
                  hasWarning = true;
                  statusParts.push(
                    "founding onboarding enrollment failed: " +
                      (foundingResult.reason && foundingResult.reason.message
                        ? foundingResult.reason.message
                        : "Unknown error")
                  );
                }
              }

              if (!statusParts.length) {
                setAddAthleteStatus("Athlete account created. Share temporary login details below.", "success");
                return;
              }

              var prefix = hasWarning
                ? "Athlete account created with warnings: "
                : "Athlete account created: ";

              setAddAthleteStatus(prefix + statusParts.join("; ") + ".", hasWarning ? "info" : "success");
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

    var foundingField = document.querySelector("[data-admin-add-athlete-founding-member]");
    if (foundingField) {
      foundingField.checked = true;
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
      is_active: profile && profile.is_active === false ? false : true,
      updated_at: new Date().toISOString()
    };

    state.client
      .from("athlete_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .then(function () {
        // Ignore profile upsert errors here so account creation flow stays simple.
      })
      .catch(function () {
        // Intentionally noop.
      });
  }

  function upsertFoundingMemberOnboarding(userId, shouldEnroll) {
    if (!state.client || !userId || !shouldEnroll) {
      return Promise.resolve({ enrolled: false });
    }

    var payload = {
      athlete_user_id: userId,
      coach_user_id: state.user && state.user.id ? state.user.id : null,
      is_founding_member: true,
      stage: "first_login_pending_docs",
      updated_at: new Date().toISOString()
    };

    return state.client
      .from("founding_member_onboarding")
      .upsert(payload, {
        onConflict: "athlete_user_id",
        ignoreDuplicates: true
      })
      .then(function (result) {
        if (result.error) {
          throw result.error;
        }

        return { enrolled: true };
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

  function loadCoachOverviewData() {
    renderCoachOverview();
    updateStats();

    if (!state.client) {
      state.activePrograms = [];
      state.athleteGoalEvents = [];
      state.coachReadinessByAthlete = {};
      state.coachStravaRows = [];
      state.foundingOnboardingRows = [];
      state.membershipInquiries = [];
      state.customPlanInquiries = [];
      state.foundingSignatureSummaryByAthlete = {};
      state.foundingSubscriptionRows = [];
      state.foundingIntakeAssignmentRows = [];
      state.climbingComparisonRows = [];
      state.athleteProfilesById = {};
      state.latestMetricRowsByAthlete = {};
      renderCoachOverview();
      updateStats();
      return;
    }

    var activeProgramsRequest = state.client
      .from("user_training_programs")
      .select("user_id,program_id,program_name,is_active,assigned_at")
      .eq("is_active", true)
      .order("assigned_at", { ascending: false })
      .limit(200);

    var goalEventsRequest = state.client
      .from("athlete_goals_events")
      .select("id,user_id,title,goal_type,target_date,details,status,created_at")
      .order("target_date", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(500);

    var stravaMetricsRequest = state.client
      .from("athlete_strava_daily_metrics")
      .select("user_id,metric_date,recovery_score")
      .order("metric_date", { ascending: false })
      .limit(5000);

    var athleteMetricsRequest = state.client
      .from("athlete_metrics")
      .select("user_id,metric_name,metric_value,updated_at,created_at")
      .order("updated_at", { ascending: false })
      .limit(12000);

    var athleteProfilesRequest = state.client
      .from("athlete_profiles")
      .select("user_id,name,sport,level,sports,sport_overview,height_cm,arm_span_cm,is_active");

    var foundingOnboardingRequest = state.client
      .from("founding_member_onboarding")
      .select("athlete_user_id,stage,is_founding_member,docs_signed_at,payment_completed_at,welcome_completed_at,created_at,updated_at")
      .eq("is_founding_member", true)
      .order("updated_at", { ascending: false })
      .limit(500);

    var foundingSignaturesRequest = state.client
      .from("founding_member_legal_signatures")
      .select("athlete_user_id,document_id,document_version,signed_at")
      .order("signed_at", { ascending: false })
      .limit(5000);

    var membershipInquiriesRequest = state.client
      .from("membership_inquiries")
      .select("id,user_id,full_name,email,primary_sports,primary_goal,notes,status,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(500);

    var customPlanInquiriesRequest = state.client
      .from("custom_plan_inquiries")
      .select("id,user_id,full_name,email,primary_sports,primary_goal,desired_duration_weeks,desired_days_per_week,notes,status,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(500);

    var foundingSubscriptionsRequest = state.client
      .from("founding_member_subscriptions")
      .select("user_id,status,last_event_type,last_event_created_at,updated_at")
      .order("updated_at", { ascending: false })
      .limit(1000);

    var foundingIntakeAssignmentsRequest = state.client
      .from("athlete_onboarding_intake_assignments")
      .select("athlete_user_id,form_id,form_name,form_schema,status,assigned_at,submitted_at,due_date,updated_at")
      .order("updated_at", { ascending: false })
      .limit(5000);

    Promise.all([
      activeProgramsRequest,
      goalEventsRequest,
      stravaMetricsRequest,
      athleteMetricsRequest,
      athleteProfilesRequest,
      foundingOnboardingRequest,
      foundingSignaturesRequest,
      membershipInquiriesRequest,
      customPlanInquiriesRequest,
      foundingSubscriptionsRequest,
      foundingIntakeAssignmentsRequest
    ])
      .then(function (results) {
        var programsResult = results[0];
        var goalsResult = results[1];
        var stravaResult = results[2];
        var metricsResult = results[3];
        var profilesResult = results[4];
        var foundingOnboardingResult = results[5];
        var foundingSignaturesResult = results[6];
        var membershipInquiriesResult = results[7];
        var customPlanInquiriesResult = results[8];
        var foundingSubscriptionsResult = results[9];
        var foundingIntakeAssignmentsResult = results[10];

        if (programsResult && !programsResult.error) {
          state.activePrograms = programsResult.data || [];
        } else {
          state.activePrograms = [];
        }

        if (goalsResult && !goalsResult.error) {
          state.athleteGoalEvents = (goalsResult.data || []).map(function (item) {
            return {
              id: String(item && item.id || ""),
              user_id: String(item && item.user_id || ""),
              title: String(item && item.title || "Goal"),
              goal_type: String(item && item.goal_type || "goal"),
              target_date: item && item.target_date ? String(item.target_date) : "",
              details: String(item && item.details || ""),
              status: String(item && item.status || "active"),
              created_at: item && item.created_at ? String(item.created_at) : ""
            };
          });
        } else {
          state.athleteGoalEvents = [];
        }

        var stravaRows = [];
        if (stravaResult && !stravaResult.error) {
          stravaRows = Array.isArray(stravaResult.data) ? stravaResult.data : [];
        } else if (stravaResult && stravaResult.error && !isMissingTableError(stravaResult.error)) {
          console.warn("Strava metrics load failed:", stravaResult.error);
        }

        var athleteMetrics = [];
        if (metricsResult && !metricsResult.error) {
          athleteMetrics = Array.isArray(metricsResult.data) ? metricsResult.data : [];
        } else if (metricsResult && metricsResult.error && !isMissingTableError(metricsResult.error)) {
          console.warn("Athlete metrics load failed:", metricsResult.error);
        }

        var athleteProfilesById = {};
        if (profilesResult && !profilesResult.error) {
          (profilesResult.data || []).forEach(function (profile) {
            var userId = String(profile && profile.user_id || "").trim();
            if (!userId) {
              return;
            }

            athleteProfilesById[userId] = {
              user_id: userId,
              name: profile && profile.name ? String(profile.name) : "",
              sport: profile && profile.sport ? String(profile.sport) : "",
              level: profile && profile.level ? String(profile.level) : "",
              sports: Array.isArray(profile && profile.sports) ? profile.sports.slice() : [],
              sport_overview: profile && profile.sport_overview ? profile.sport_overview : null,
              height_cm: profile && profile.height_cm != null ? profile.height_cm : null,
              arm_span_cm: profile && profile.arm_span_cm != null ? profile.arm_span_cm : null,
              is_active: !(profile && profile.is_active === false)
            };
          });
        } else if (profilesResult && profilesResult.error && !isMissingTableError(profilesResult.error)) {
          console.warn("Athlete profiles load failed:", profilesResult.error);
        }

        state.athleteProfilesById = athleteProfilesById;

        if (foundingOnboardingResult && !foundingOnboardingResult.error) {
          state.foundingOnboardingRows = Array.isArray(foundingOnboardingResult.data)
            ? foundingOnboardingResult.data.map(function (row) {
                return {
                  athlete_user_id: String(row && row.athlete_user_id || ""),
                  stage: String(row && row.stage || "invited"),
                  is_founding_member: row && row.is_founding_member === true,
                  docs_signed_at: row && row.docs_signed_at ? String(row.docs_signed_at) : "",
                  payment_completed_at: row && row.payment_completed_at ? String(row.payment_completed_at) : "",
                  welcome_completed_at: row && row.welcome_completed_at ? String(row.welcome_completed_at) : "",
                  created_at: row && row.created_at ? String(row.created_at) : "",
                  updated_at: row && row.updated_at ? String(row.updated_at) : ""
                };
              }).filter(function (row) {
                return !!row.athlete_user_id;
              })
            : [];
        } else {
          state.foundingOnboardingRows = [];
          if (foundingOnboardingResult && foundingOnboardingResult.error && !isMissingTableError(foundingOnboardingResult.error)) {
            console.warn("Founding onboarding load failed:", foundingOnboardingResult.error);
          }
        }

        if (foundingSignaturesResult && !foundingSignaturesResult.error) {
          state.foundingSignatureSummaryByAthlete = buildFoundingSignatureSummaryByAthlete(foundingSignaturesResult.data || []);
        } else {
          state.foundingSignatureSummaryByAthlete = {};
          if (foundingSignaturesResult && foundingSignaturesResult.error && !isMissingTableError(foundingSignaturesResult.error)) {
            console.warn("Founding legal signatures load failed:", foundingSignaturesResult.error);
          }
        }

        if (membershipInquiriesResult && !membershipInquiriesResult.error) {
          state.membershipInquiries = Array.isArray(membershipInquiriesResult.data)
            ? membershipInquiriesResult.data.map(function (row) {
                return {
                  id: String(row && row.id || ""),
                  user_id: String(row && row.user_id || ""),
                  full_name: String(row && row.full_name || ""),
                  email: String(row && row.email || ""),
                  primary_sports: String(row && row.primary_sports || ""),
                  primary_goal: String(row && row.primary_goal || ""),
                  notes: String(row && row.notes || ""),
                  status: String(row && row.status || "new").toLowerCase(),
                  created_at: String(row && row.created_at || ""),
                  updated_at: String(row && row.updated_at || "")
                };
              })
            : [];
        } else {
          state.membershipInquiries = [];
          if (membershipInquiriesResult && membershipInquiriesResult.error && !isMissingTableError(membershipInquiriesResult.error)) {
            console.warn("Membership inquiries load failed:", membershipInquiriesResult.error);
          }
        }

        if (customPlanInquiriesResult && !customPlanInquiriesResult.error) {
          state.customPlanInquiries = Array.isArray(customPlanInquiriesResult.data)
            ? customPlanInquiriesResult.data.map(function (row) {
                return {
                  id: String(row && row.id || ""),
                  user_id: String(row && row.user_id || ""),
                  full_name: String(row && row.full_name || ""),
                  email: String(row && row.email || ""),
                  primary_sports: String(row && row.primary_sports || ""),
                  primary_goal: String(row && row.primary_goal || ""),
                  desired_duration_weeks: row && row.desired_duration_weeks != null ? Number(row.desired_duration_weeks) : null,
                  desired_days_per_week: row && row.desired_days_per_week != null ? Number(row.desired_days_per_week) : null,
                  notes: String(row && row.notes || ""),
                  status: String(row && row.status || "new").toLowerCase(),
                  created_at: String(row && row.created_at || ""),
                  updated_at: String(row && row.updated_at || "")
                };
              })
            : [];
        } else {
          state.customPlanInquiries = [];
          if (customPlanInquiriesResult && customPlanInquiriesResult.error && !isMissingTableError(customPlanInquiriesResult.error)) {
            console.warn("Custom plan inquiries load failed:", customPlanInquiriesResult.error);
          }
        }

        if (foundingSubscriptionsResult && !foundingSubscriptionsResult.error) {
          state.foundingSubscriptionRows = Array.isArray(foundingSubscriptionsResult.data)
            ? foundingSubscriptionsResult.data.map(function (row) {
                return {
                  user_id: String(row && row.user_id || ""),
                  status: String(row && row.status || "").toLowerCase(),
                  last_event_type: String(row && row.last_event_type || ""),
                  last_event_created_at: String(row && row.last_event_created_at || ""),
                  updated_at: String(row && row.updated_at || "")
                };
              })
            : [];
        } else {
          state.foundingSubscriptionRows = [];
          if (foundingSubscriptionsResult && foundingSubscriptionsResult.error && !isMissingTableError(foundingSubscriptionsResult.error)) {
            console.warn("Founding subscriptions load failed:", foundingSubscriptionsResult.error);
          }
        }

        if (foundingIntakeAssignmentsResult && !foundingIntakeAssignmentsResult.error) {
          state.foundingIntakeAssignmentRows = Array.isArray(foundingIntakeAssignmentsResult.data)
            ? foundingIntakeAssignmentsResult.data.map(function (row) {
                var schema = row && row.form_schema;
                if (typeof schema === "string") {
                  try {
                    schema = JSON.parse(schema);
                  } catch (_error) {
                    schema = {};
                  }
                }

                return {
                  athlete_user_id: String(row && row.athlete_user_id || ""),
                  form_id: String(row && row.form_id || ""),
                  form_name: String(row && row.form_name || ""),
                  task_name: String(row && row.task_name || ""),
                  title: String(row && row.title || ""),
                  form_schema: schema && typeof schema === "object" ? schema : {},
                  status: String(row && row.status || "").toLowerCase(),
                  assigned_at: String(row && row.assigned_at || ""),
                  submitted_at: String(row && row.submitted_at || ""),
                  due_date: String(row && row.due_date || ""),
                  updated_at: String(row && row.updated_at || "")
                };
              }).filter(function (row) {
                return !!row.athlete_user_id;
              })
            : [];
        } else {
          state.foundingIntakeAssignmentRows = [];
          if (foundingIntakeAssignmentsResult && foundingIntakeAssignmentsResult.error && !isMissingTableError(foundingIntakeAssignmentsResult.error)) {
            console.warn("Founding intake assignments load failed:", foundingIntakeAssignmentsResult.error);
          }
        }

        state.coachReadinessByAthlete = buildCoachReadinessByAthlete(
          state.athletes,
          state.activePrograms,
          state.athleteGoalEvents,
          [],
          [],
          stravaRows
        );
        state.coachStravaRows = stravaRows;
        state.climbingComparisonRows = buildClimbingComparisonRows(state.athletes, athleteMetrics, athleteProfilesById);
        state.latestMetricRowsByAthlete = buildLatestMetricRowsByAthlete(athleteMetrics);

        renderAthletesTable();
        renderCoachOverview();
        updateStats();
      })
      .catch(function () {
        state.activePrograms = [];
        state.athleteGoalEvents = [];
        state.coachReadinessByAthlete = {};
        state.coachStravaRows = [];
        state.foundingOnboardingRows = [];
        state.membershipInquiries = [];
        state.customPlanInquiries = [];
        state.foundingSignatureSummaryByAthlete = {};
        state.foundingSubscriptionRows = [];
        state.foundingIntakeAssignmentRows = [];
        state.climbingComparisonRows = [];
        state.athleteProfilesById = {};
        state.latestMetricRowsByAthlete = {};
        renderAthletesTable();
        renderCoachOverview();
        updateStats();
      });
  }

  function renderCoachOverview() {
    renderUpcomingTimeline();
    renderCoachTodoList();
  }

  function renderMembershipInquiries() {
    var container = document.querySelector("[data-admin-todo-automated-list]");
    if (!container) {
      return;
    }

    var dismissedLookup = {};
    (state.dismissedAutomatedTodoKeys || []).forEach(function (key) {
      var value = String(key || "").trim();
      if (value) {
        dismissedLookup[value] = true;
      }
    });

    var inquiries = Array.isArray(state.membershipInquiries) ? state.membershipInquiries.slice() : [];
    var openInquiries = inquiries.filter(function (inquiry) {
      var status = String(inquiry && inquiry.status || "new").toLowerCase();
      var inquiryId = String(inquiry && inquiry.id || "").trim();
      var requestKey = "membership:" + inquiryId;
      return status !== "archived" && status !== "declined" && !dismissedLookup[requestKey];
    });
    var customPlanInquiries = Array.isArray(state.customPlanInquiries) ? state.customPlanInquiries.slice() : [];
    var openCustomPlanInquiries = customPlanInquiries.filter(function (inquiry) {
      var status = String(inquiry && inquiry.status || "new").toLowerCase();
      var inquiryId = String(inquiry && inquiry.id || "").trim();
      var requestKey = "custom:" + inquiryId;
      return status !== "archived" && status !== "declined" && !dismissedLookup[requestKey];
    });

    openInquiries.sort(sortInquiryRowsByPriority);
    openCustomPlanInquiries.sort(sortInquiryRowsByPriority);

    var recentCompletionNotifications = buildRecentCoachCompletionNotifications(dismissedLookup);

    var athleteByEmail = {};
    (state.athletes || []).forEach(function (athlete) {
      var email = String(athlete && athlete.email || "").trim().toLowerCase();
      if (!email) {
        return;
      }
      athleteByEmail[email] = athlete;
    });

    var recentAthleteAccountNotifications = (state.athletes || [])
      .map(function (athlete) {
        var athleteId = String(athlete && athlete.user_id || "").trim();
        var createdAt = String(athlete && athlete.user_created_at || "").trim();
        var createdMs = Date.parse(createdAt);
        return {
          athleteId: athleteId,
          createdAt: createdAt,
          createdMs: Number.isFinite(createdMs) ? createdMs : null,
          athlete: athlete
        };
      })
      .filter(function (item) {
        if (!item.athleteId || item.createdMs == null) {
          return false;
        }

        var daysSinceCreated = Math.floor((Date.now() - item.createdMs) / (24 * 60 * 60 * 1000));
        if (!Number.isFinite(daysSinceCreated) || daysSinceCreated < 0 || daysSinceCreated > 14) {
          return false;
        }

        var requestKey = "athlete_created:" + item.athleteId;
        return !dismissedLookup[requestKey];
      })
      .sort(function (a, b) {
        return (b.createdMs || 0) - (a.createdMs || 0);
      })
      .slice(0, 8);

    var accountNotificationMarkup = recentAthleteAccountNotifications
      .map(function (item) {
        var athlete = item.athlete || {};
        var athleteId = String(item.athleteId || "");
        var createdAt = String(item.createdAt || "");
        var accountName = String(athlete && athlete.name || "").trim() || String(athlete && athlete.email || "").trim() || "Athlete";
        var accountEmail = String(athlete && athlete.email || "").trim();
        var accountSport = String(athlete && athlete.sport || "").trim();
        var requestKey = "athlete_created:" + athleteId;
        var accountHref = "athlete-insight.html?athleteId=" + encodeURIComponent(athleteId);

        return (
          '<div class="admin-overview-item">' +
            '<div class="admin-overview-item-head">' +
              '<p class="admin-overview-item-title">' + escapeHtml(accountName) + '</p>' +
              '<span class="admin-request-type-chip">Account</span>' +
            '</div>' +
            '<div>' +
              '<p class="admin-overview-item-meta">' +
                escapeHtml(accountEmail || "No email provided") +
                (accountSport ? (' • ' + escapeHtml(accountSport)) : '') +
              '</p>' +
              '<p class="admin-overview-item-meta">New athlete account created • ' + escapeHtml(formatDate(createdAt)) + ' • ' + escapeHtml(formatRelativeDaysLabel(createdAt)) + '</p>' +
            '</div>' +
            '<div class="admin-request-side">' +
              '<span class="admin-risk-chip">new</span>' +
              '<div class="admin-request-actions">' +
                '<a class="btn admin-btn-refresh" href="' + escapeAttribute(accountHref) + '">View Account</a>' +
                '<button type="button" class="btn admin-btn-small" data-automated-todo-complete="' + escapeAttribute(requestKey) + '">Completed</button>' +
              '</div>' +
            '</div>' +
          '</div>'
        );
      })
      .join("");

    var membershipQueueMarkup = openInquiries
      .slice(0, 12)
      .map(function (inquiry) {
        var status = String(inquiry.status || "new").toLowerCase();
        var statusToneClass = status === "approved" ? "is-stable" : "";
        var matchedAthlete = athleteByEmail[String(inquiry.email || "").trim().toLowerCase()] || null;
        var athleteId = String(inquiry.user_id || (matchedAthlete && matchedAthlete.user_id) || "");
        var hasAthleteAccount = !!athleteId;
        var insightHref = hasAthleteAccount
          ? "athlete-insight.html?athleteId=" + encodeURIComponent(athleteId)
          : "";
        var submittedLabel = inquiry.created_at ? formatDate(inquiry.created_at) : "Unknown";
        var requestKey = "membership:" + String(inquiry.id || "");
        var previewOpen = state.activeRequestPreviewKey === requestKey;

        return (
          '<div class="admin-overview-item">' +
            '<div class="admin-overview-item-head">' +
              '<p class="admin-overview-item-title">' + escapeHtml(inquiry.full_name || inquiry.email || "Prospect") + '</p>' +
              '<span class="admin-request-type-chip">Membership</span>' +
            '</div>' +
            '<div>' +
              '<p class="admin-overview-item-meta">' +
                escapeHtml(inquiry.email || "") +
                ' • ' +
                escapeHtml(inquiry.primary_sports || "") +
                ' • Goal: ' +
                escapeHtml(inquiry.primary_goal || "") +
              '</p>' +
              '<p class="admin-overview-item-meta">Submitted ' + escapeHtml(submittedLabel) + ' • ' + escapeHtml(formatRelativeDaysLabel(inquiry.created_at)) + (inquiry.notes ? ' • Notes: ' + escapeHtml(inquiry.notes) : '') + '</p>' +
            '</div>' +
            '<div class="admin-request-side">' +
              '<span class="admin-risk-chip ' + statusToneClass + '">' + escapeHtml(status) + '</span>' +
              '<div class="admin-request-actions">' +
                '<button type="button" class="btn admin-btn-small" data-membership-inquiry-action="view" data-membership-inquiry-id="' + escapeAttribute(inquiry.id) + '">' + (previewOpen ? 'Hide Request' : 'Open Request') + '</button>' +
                (hasAthleteAccount
                  ? '<a class="btn admin-btn-refresh" href="' + escapeAttribute(insightHref) + '">Open Insights</a>'
                  : '<button type="button" class="btn admin-btn-refresh" disabled title="No athlete account found for this email yet.">Open Insights</button>') +
                '<button type="button" class="btn admin-btn-small" data-automated-todo-complete="' + escapeAttribute(requestKey) + '">Completed</button>' +
              '</div>' +
            '</div>' +
            (previewOpen
              ? '<div class="admin-request-detail">' +
                  '<p><strong>Sport:</strong> ' + escapeHtml(inquiry.primary_sports || 'Not provided') + '</p>' +
                  '<p><strong>Goal:</strong> ' + escapeHtml(inquiry.primary_goal || 'Not provided') + '</p>' +
                  '<p><strong>Notes:</strong> ' + escapeHtml(inquiry.notes || 'None') + '</p>' +
                '</div>'
              : '') +
          '</div>'
        );
      })
      .join("");

    var customPlanQueueMarkup = openCustomPlanInquiries
      .slice(0, 12)
      .map(function (inquiry) {
        var status = String(inquiry && inquiry.status || "new").toLowerCase();
        var statusToneClass = status === "approved" ? "is-stable" : "";
        var submittedLabel = inquiry.created_at ? formatDate(inquiry.created_at) : "Unknown";
        var durationLabel = inquiry.desired_duration_weeks == null ? "" : String(inquiry.desired_duration_weeks) + " weeks";
        var daysPerWeekLabel = inquiry.desired_days_per_week == null ? "" : String(inquiry.desired_days_per_week) + " days/week";
        var volumeLabel = [durationLabel, daysPerWeekLabel].filter(Boolean).join(" • ");
        var requestKey = "custom:" + String(inquiry.id || "");
        var previewOpen = state.activeRequestPreviewKey === requestKey;

        return (
          '<div class="admin-overview-item">' +
            '<div class="admin-overview-item-head">' +
              '<p class="admin-overview-item-title">' + escapeHtml(inquiry.full_name || inquiry.email || "Prospect") + '</p>' +
              '<span class="admin-request-type-chip is-individualized">Individualized</span>' +
            '</div>' +
            '<div>' +
              '<p class="admin-overview-item-meta">' +
                escapeHtml(inquiry.email || "") +
                ' • ' +
                escapeHtml(inquiry.primary_sports || "") +
                ' • Goal: ' +
                escapeHtml(inquiry.primary_goal || "") +
              '</p>' +
              '<p class="admin-overview-item-meta">Submitted ' + escapeHtml(submittedLabel) + ' • ' + escapeHtml(formatRelativeDaysLabel(inquiry.created_at)) + (volumeLabel ? ' • ' + escapeHtml(volumeLabel) : '') + (inquiry.notes ? ' • Notes: ' + escapeHtml(inquiry.notes) : '') + '</p>' +
            '</div>' +
            '<div class="admin-request-side">' +
              '<span class="admin-risk-chip ' + statusToneClass + '">' + escapeHtml(status) + '</span>' +
              '<div class="admin-request-actions">' +
                '<button type="button" class="btn admin-btn-small" data-custom-plan-inquiry-action="view" data-custom-plan-inquiry-id="' + escapeAttribute(inquiry.id) + '">' + (previewOpen ? 'Hide Request' : 'Open Request') + '</button>' +
                '<button type="button" class="btn admin-btn-small" data-automated-todo-complete="' + escapeAttribute(requestKey) + '">Completed</button>' +
              '</div>' +
            '</div>' +
            (previewOpen
              ? '<div class="admin-request-detail">' +
                  '<p><strong>Sport:</strong> ' + escapeHtml(inquiry.primary_sports || 'Not provided') + '</p>' +
                  '<p><strong>Goal:</strong> ' + escapeHtml(inquiry.primary_goal || 'Not provided') + '</p>' +
                  '<p><strong>Preferred Volume:</strong> ' + escapeHtml(volumeLabel || 'Not provided') + '</p>' +
                  '<p><strong>Notes:</strong> ' + escapeHtml(inquiry.notes || 'None') + '</p>' +
                '</div>'
              : '') +
          '</div>'
        );
      })
      .join("");

    container.innerHTML = recentCompletionNotifications + accountNotificationMarkup + membershipQueueMarkup + customPlanQueueMarkup;
  }

  function buildRecentCoachCompletionNotifications(dismissedLookup) {
    var athleteById = {};
    (state.athletes || []).forEach(function (athlete) {
      var athleteId = String(athlete && athlete.user_id || "").trim();
      if (!athleteId) {
        return;
      }

      athleteById[athleteId] = athlete;
    });

    var items = [];

    (state.foundingOnboardingRows || []).forEach(function (row) {
      var athleteId = String(row && row.athlete_user_id || "").trim();
      if (!athleteId || !athleteById[athleteId]) {
        return;
      }

      var athlete = athleteById[athleteId] || {};
      var athleteLabel = String(athlete.name || athlete.email || "Athlete").trim();

      if (row && row.docs_signed_at) {
        var waiverKey = "waiver:" + athleteId + ":" + String(row.docs_signed_at || "");
        var waiverMs = Date.parse(row.docs_signed_at);
        if (Number.isFinite(waiverMs) && !dismissedLookup[waiverKey]) {
          items.push({
            key: waiverKey,
            title: athleteLabel + " completed liability waiver",
            meta: "Signed " + formatDate(row.docs_signed_at) + " • " + formatRelativeDaysLabel(row.docs_signed_at),
            chip: "Waiver",
            href: "athlete-insight.html?athleteId=" + encodeURIComponent(athleteId),
            sortMs: waiverMs
          });
        }
      }

      if (row && row.payment_completed_at) {
        var paymentKey = "payment:" + athleteId + ":" + String(row.payment_completed_at || "");
        var paymentMs = Date.parse(row.payment_completed_at);
        if (Number.isFinite(paymentMs) && !dismissedLookup[paymentKey]) {
          items.push({
            key: paymentKey,
            title: athleteLabel + " completed payment",
            meta: "Completed " + formatDate(row.payment_completed_at) + " • " + formatRelativeDaysLabel(row.payment_completed_at),
            chip: "Payment",
            href: "athlete-insight.html?athleteId=" + encodeURIComponent(athleteId),
            sortMs: paymentMs
          });
        }
      }
    });

    (state.foundingIntakeAssignmentRows || []).forEach(function (row) {
      var athleteId = String(row && row.athlete_user_id || "").trim();
      if (!athleteId || !athleteById[athleteId]) {
        return;
      }

      var status = String(row && row.status || "").toLowerCase();
      if (status !== "submitted") {
        return;
      }

      var updatedAt = String(row && row.updated_at || row && row.submitted_at || row && row.assigned_at || "").trim();
      var updatedMs = Date.parse(updatedAt);
      if (!Number.isFinite(updatedMs)) {
        return;
      }

      var athlete = athleteById[athleteId] || {};
      var athleteLabel = String(athlete.name || athlete.email || "Athlete").trim();
      var formLabel = getCoachCompletionTaskLabel(row);
      var taskKey = "task:" + athleteId + ":" + String(row && row.form_id || row && row.form_name || row && row.task_name || updatedAt || "");
      if (dismissedLookup[taskKey]) {
        return;
      }

      items.push({
        key: taskKey,
        title: athleteLabel + " completed " + formLabel,
        meta: "Submitted " + formatDate(updatedAt) + " • " + formatRelativeDaysLabel(updatedAt),
        chip: "Task",
        href: "athlete-insight.html?athleteId=" + encodeURIComponent(athleteId),
        sortMs: updatedMs
      });
    });

    if (!items.length) {
      return (
        '<div class="admin-overview-item admin-widget-summary">' +
          '<p class="admin-overview-item-title">Open Coach Notifications</p>' +
          '<p class="admin-overview-item-meta">No open waiver, payment, or task notifications.</p>' +
        '</div>'
      );
    }

    items.sort(function (a, b) {
      return (Number(b && b.sortMs) || 0) - (Number(a && a.sortMs) || 0);
    });

    return (
      '<div class="admin-overview-item admin-widget-summary">' +
        '<p class="admin-overview-item-title">Open Coach Notifications</p>' +
      '</div>' +
      items.slice(0, 8).map(function (item) {
        return (
          '<div class="admin-overview-item admin-widget-row">' +
            '<div>' +
              '<p class="admin-overview-item-title">' + escapeHtml(item.title) + '</p>' +
              '<p class="admin-overview-item-meta">' + escapeHtml(item.meta) + '</p>' +
            '</div>' +
            '<div class="admin-request-side">' +
              '<span class="admin-request-type-chip">' + escapeHtml(item.chip) + '</span>' +
              '<div class="admin-request-actions">' +
                '<a class="btn admin-btn-refresh" href="' + escapeAttribute(item.href) + '">View Athlete</a>' +
                '<button type="button" class="btn admin-btn-small" data-automated-todo-complete="' + escapeAttribute(item.key) + '">Completed</button>' +
              '</div>' +
            '</div>' +
          '</div>'
        );
      }).join("")
    );
  }

  function getCoachCompletionTaskLabel(row) {
    var formId = String(row && row.form_id || "").trim();
    var schema = row && row.form_schema && typeof row.form_schema === "object" ? row.form_schema : {};
    var rawName = String(row && row.form_name || row && row.task_name || row && row.title || "").trim();
    var schemaName = String(schema.title || schema.task_name || schema.name || schema.label || "").trim();
    var schemaDescription = String(schema.description || "").trim();
    var schemaActionLabel = String(schema.action_label || "").trim();

    if (formId === "default-liability-waiver-v1") {
      return "Liability Waiver";
    }
    if (formId === MEMBERSHIP_PAYMENT_TASK_FORM_ID) {
      return MEMBERSHIP_PAYMENT_TASK_NAME;
    }

    if (rawName && !isGenericCoachTaskLabel(rawName)) {
      return rawName;
    }

    if (schemaName && !isGenericCoachTaskLabel(schemaName)) {
      return schemaName;
    }

    if (schemaActionLabel && !isGenericCoachTaskLabel(schemaActionLabel)) {
      return schemaActionLabel;
    }

    if (schemaDescription) {
      var loweredDescription = schemaDescription.toLowerCase();
      if (loweredDescription.indexOf("liability waiver") > -1) {
        return "Liability Waiver";
      }
      if (loweredDescription.indexOf("complete payment") > -1 || loweredDescription.indexOf("activate coaching access") > -1) {
        return MEMBERSHIP_PAYMENT_TASK_NAME;
      }
      return schemaDescription.length > 72 ? schemaDescription.slice(0, 69).trim() + "..." : schemaDescription;
    }

    return rawName || "Assigned task";
  }

  function isGenericCoachTaskLabel(label) {
    var value = String(label || "").trim().toLowerCase();
    return !value || value === "assigned task" || value === "assigned tasks" || value === "task form" || value === "task" || value.indexOf("untitled") === 0;
  }

  function onMembershipInquiryActionClick(event) {
    var actionBtn = event.target && event.target.closest("[data-membership-inquiry-action]");
    if (!actionBtn || !state.client) {
      return;
    }

    var action = String(actionBtn.getAttribute("data-membership-inquiry-action") || "").trim().toLowerCase();
    var inquiryId = String(actionBtn.getAttribute("data-membership-inquiry-id") || "").trim();
    if (!action || !inquiryId) {
      return;
    }

    if (action === "view") {
      toggleRequestPreview("membership:" + inquiryId);
    }
  }

  function onDismissAutomatedTodoClick(event) {
    var actionBtn = event.target && event.target.closest("[data-automated-todo-complete]");
    if (!actionBtn) {
      return;
    }

    var requestKey = String(actionBtn.getAttribute("data-automated-todo-complete") || "").trim();
    if (!requestKey) {
      return;
    }

    var next = Array.isArray(state.dismissedAutomatedTodoKeys)
      ? state.dismissedAutomatedTodoKeys.slice()
      : [];
    if (next.indexOf(requestKey) < 0) {
      next.push(requestKey);
    }

    state.dismissedAutomatedTodoKeys = next;
    writeDismissedAutomatedTodoKeys(next);
    if (state.activeRequestPreviewKey === requestKey) {
      state.activeRequestPreviewKey = "";
    }
    renderMembershipInquiries();
  }

  function onCustomPlanInquiryActionClick(event) {
    var actionBtn = event.target && event.target.closest("[data-custom-plan-inquiry-action]");
    if (!actionBtn || !state.client) {
      return;
    }

    var action = String(actionBtn.getAttribute("data-custom-plan-inquiry-action") || "").trim().toLowerCase();
    var inquiryId = String(actionBtn.getAttribute("data-custom-plan-inquiry-id") || "").trim();
    if (!action || !inquiryId) {
      return;
    }

    if (action === "view") {
      toggleRequestPreview("custom:" + inquiryId);
    }
  }

  function toggleRequestPreview(requestKey) {
    var key = String(requestKey || "");
    state.activeRequestPreviewKey = state.activeRequestPreviewKey === key ? "" : key;
    renderMembershipInquiries();
  }

  function sortInquiryRowsByPriority(a, b) {
    var rankA = getInquiryStatusRank(a && a.status);
    var rankB = getInquiryStatusRank(b && b.status);
    if (rankA !== rankB) {
      return rankA - rankB;
    }

    var timeA = Date.parse(a && a.created_at ? a.created_at : "") || 0;
    var timeB = Date.parse(b && b.created_at ? b.created_at : "") || 0;
    return timeB - timeA;
  }

  function getInquiryStatusRank(status) {
    var normalized = String(status || "new").toLowerCase();
    if (normalized === "approved") {
      return 0;
    }
    if (normalized === "pending" || normalized === "new") {
      return 1;
    }
    return 2;
  }

  function formatRelativeDaysLabel(dateString) {
    if (!dateString) {
      return "date unknown";
    }

    var time = Date.parse(dateString);
    if (!Number.isFinite(time)) {
      return "date unknown";
    }

    var days = Math.floor((Date.now() - time) / (24 * 60 * 60 * 1000));
    if (days <= 0) {
      return "today";
    }
    if (days === 1) {
      return "1 day ago";
    }
    return String(days) + " days ago";
  }

  function updateMembershipInquiryStatus(inquiryId, status, options) {
    var config = options && typeof options === "object" ? options : {};
    var silent = !!config.silent;

    if (!state.client || !inquiryId || !status) {
      return Promise.resolve(false);
    }

    if (!silent) {
      setStatus("Updating membership inquiry status...", "info");
    }

    return state.client
      .from("membership_inquiries")
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq("id", inquiryId)
      .then(function (result) {
        if (result.error) {
          if (!silent) {
            setStatus(result.error.message, "error");
          }
          return false;
        }

        state.membershipInquiries = (state.membershipInquiries || []).map(function (inquiry) {
          if (String(inquiry && inquiry.id || "") !== inquiryId) {
            return inquiry;
          }
          return Object.assign({}, inquiry, { status: status, updated_at: new Date().toISOString() });
        });

        renderMembershipInquiries();
        if (!silent) {
          setStatus("Membership inquiry updated.", "success");
        }
        return true;
      })
      .catch(function (error) {
        if (!silent) {
          setStatus(error && error.message ? error.message : "Failed to update inquiry.", "error");
        }
        return false;
      });
  }

  function buildMembershipPaymentTaskPayload(athleteUserId) {
    return {
      athlete_user_id: athleteUserId,
      form_id: MEMBERSHIP_PAYMENT_TASK_FORM_ID,
      form_name: MEMBERSHIP_PAYMENT_TASK_NAME,
      form_schema: {
        task_type: "custom_task",
        description: "You are approved for membership. Complete payment to activate coaching access.",
        action_label: "Open Payment",
        action_url: MEMBERSHIP_PAYMENT_TASK_URL,
        action_target: "_self",
        questions: []
      },
      response_data: {},
      status: "assigned",
      assigned_at: new Date().toISOString(),
      assigned_by: state.user ? state.user.id : null,
      due_date: null,
      updated_at: new Date().toISOString()
    };
  }

  function ensureMembershipPaymentTaskAssignment(athleteUserId) {
    if (!state.client || !athleteUserId) {
      return Promise.resolve({ created: false, existing: false, error: new Error("Missing athlete user id.") });
    }

    return state.client
      .from("athlete_onboarding_intake_assignments")
      .select("id,status,assigned_at")
      .eq("athlete_user_id", athleteUserId)
      .eq("form_id", MEMBERSHIP_PAYMENT_TASK_FORM_ID)
      .order("assigned_at", { ascending: false })
      .limit(1)
      .then(function (lookupResult) {
        if (lookupResult.error) {
          return { created: false, existing: false, error: lookupResult.error };
        }

        var existingRow = Array.isArray(lookupResult.data) && lookupResult.data.length
          ? lookupResult.data[0]
          : null;

        if (existingRow) {
          return {
            created: false,
            existing: true,
            assignmentId: String(existingRow.id || ""),
            status: String(existingRow.status || "")
          };
        }

        return state.client
          .from("athlete_onboarding_intake_assignments")
          .insert(buildMembershipPaymentTaskPayload(athleteUserId))
          .select("id,status")
          .single()
          .then(function (insertResult) {
            if (insertResult.error) {
              return { created: false, existing: false, error: insertResult.error };
            }
            return {
              created: true,
              existing: false,
              assignmentId: String(insertResult.data && insertResult.data.id || ""),
              status: String(insertResult.data && insertResult.data.status || "assigned")
            };
          });
      })
      .catch(function (error) {
        return { created: false, existing: false, error: error };
      });
  }

  function getAthleteLookupByEmail() {
    var lookup = {};
    (state.athletes || []).forEach(function (athlete) {
      var email = String(athlete && athlete.email || "").trim().toLowerCase();
      if (!email) {
        return;
      }
      lookup[email] = athlete;
    });
    return lookup;
  }

  function getMembershipInquiryAthleteId(inquiry, athleteByEmail) {
    var directUserId = String(inquiry && inquiry.user_id || "").trim();
    if (directUserId) {
      return directUserId;
    }

    var email = String(inquiry && inquiry.email || "").trim().toLowerCase();
    var matched = email && athleteByEmail ? athleteByEmail[email] : null;
    return String(matched && matched.user_id || "").trim();
  }

  function assignMembershipPaymentTask(inquiryId, athleteUserId) {
    if (!state.client || !athleteUserId) {
      setStatus("Cannot assign payment task: no athlete account found.", "error");
      return;
    }

    setStatus("Assigning membership payment task...", "info");

    ensureMembershipPaymentTaskAssignment(athleteUserId)
      .then(function (assignmentResult) {
        if (!assignmentResult || assignmentResult.error) {
          var assignmentError = assignmentResult && assignmentResult.error;
          setStatus(
            assignmentError && assignmentError.message ? assignmentError.message : "Failed to assign payment task.",
            "error"
          );
          return;
        }

        var updatePromise = inquiryId
          ? updateMembershipInquiryStatus(inquiryId, "approved", { silent: true })
          : Promise.resolve(true);

        updatePromise.finally(function () {
          if (assignmentResult.created) {
            setStatus("Payment task assigned to athlete dashboard.", "success");
          } else {
            setStatus("Athlete already has a membership payment task.", "info");
          }
          loadCoachOverviewData();
        });
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to assign payment task.", "error");
      });
  }

  function renderFoundingVerificationBoard() {
    var container = document.querySelector("[data-admin-founding-verification]");
    if (!container) {
      return;
    }

    var foundingRows = Array.isArray(state.foundingOnboardingRows) ? state.foundingOnboardingRows : [];
    if (!foundingRows.length) {
      container.innerHTML =
        '<div class="admin-empty-state">' +
          '<p class="admin-empty-state-title">No verification data yet</p>' +
          '<p class="admin-empty-state-copy">Add founding members and run the Phase 2 flow to populate verification checks.</p>' +
        '</div>';
      return;
    }

    var foundedIds = {};
    foundingRows.forEach(function (row) {
      var id = String(row && row.athlete_user_id || "").trim();
      if (id) {
        foundedIds[id] = true;
      }
    });

    var foundedIdList = Object.keys(foundedIds);
    var totalFounding = foundedIdList.length;

    var docsSignedCount = foundingRows.filter(function (row) {
      return !!(row && row.docs_signed_at);
    }).length;

    var paymentRecordedCount = foundingRows.filter(function (row) {
      return !!(row && row.payment_completed_at);
    }).length;

    var activeProfileCount = foundedIdList.filter(function (id) {
      var profile = state.athleteProfilesById[id];
      return !!(profile && profile.is_active !== false);
    }).length;

    var subscriptionsByUser = {};
    (state.foundingSubscriptionRows || []).forEach(function (row) {
      var userId = String(row && row.user_id || "").trim();
      if (!userId || !foundedIds[userId]) {
        return;
      }
      if (!subscriptionsByUser[userId]) {
        subscriptionsByUser[userId] = [];
      }
      subscriptionsByUser[userId].push(row);
    });

    var subscriptionCapturedCount = foundedIdList.filter(function (id) {
      return Array.isArray(subscriptionsByUser[id]) && subscriptionsByUser[id].length > 0;
    }).length;

    var paidLikeStatuses = { active: true, trialing: true, paid: true, past_due: true };
    var paymentStatusCount = foundedIdList.filter(function (id) {
      var rows = subscriptionsByUser[id] || [];
      return rows.some(function (row) {
        var status = String(row && row.status || "").toLowerCase();
        return !!paidLikeStatuses[status];
      });
    }).length;

    var recentPaymentNotifications = foundedIdList
      .map(function (id) {
        var rows = subscriptionsByUser[id] || [];
        var latest = rows
          .filter(function (row) {
            var status = String(row && row.status || "").toLowerCase();
            return !!paidLikeStatuses[status] || String(row && row.last_event_type || "") === "invoice.payment_succeeded";
          })
          .sort(function (a, b) {
            return String(b && (b.last_event_created_at || b.updated_at || "")).localeCompare(String(a && (a.last_event_created_at || a.updated_at || "")));
          })[0] || null;

        if (!latest) {
          return null;
        }

        return {
          user_id: id,
          row: latest
        };
      })
      .filter(function (item) {
        return !!item;
      })
      .sort(function (a, b) {
        return String(b && b.row && (b.row.last_event_created_at || b.row.updated_at || "")).localeCompare(String(a && a.row && (a.row.last_event_created_at || a.row.updated_at || "")));
      });

    var stageProgressRank = {
      invited: 1,
      first_login_pending_docs: 2,
      docs_signed_pending_payment: 3,
      payment_pending: 4,
      welcome_pending_intakes: 5,
      intakes_completed_assessment_pending: 6,
      assessment_in_progress: 7,
      assessment_published_pending_review: 8,
      review_scheduled: 9,
      active_training: 10
    };

    var assessmentPendingCount = foundingRows.filter(function (row) {
      var stage = String(row && row.stage || "").trim();
      var rank = stageProgressRank[stage] || 0;
      return rank >= stageProgressRank.intakes_completed_assessment_pending;
    }).length;

    var intakeByAthlete = {};
    (state.foundingIntakeAssignmentRows || []).forEach(function (row) {
      var athleteId = String(row && row.athlete_user_id || "").trim();
      if (!athleteId || !foundedIds[athleteId]) {
        return;
      }

      if (!intakeByAthlete[athleteId]) {
        intakeByAthlete[athleteId] = [];
      }

      intakeByAthlete[athleteId].push(row);
    });

    var intakeCompletedCount = 0;
    foundedIdList.forEach(function (id) {
      var rows = intakeByAthlete[id] || [];
      var activeRows = rows.filter(function (row) {
        return String(row && row.status || "") !== "archived";
      });

      if (!activeRows.length) {
        return;
      }

      var allSubmitted = activeRows.every(function (row) {
        return String(row && row.status || "") === "submitted";
      });

      if (allSubmitted) {
        intakeCompletedCount += 1;
      }
    });

    var checks = [
      { label: "Legal Docs Signed", value: docsSignedCount, total: totalFounding, target: totalFounding },
      { label: "Payment Recorded", value: paymentRecordedCount, total: totalFounding, target: totalFounding },
      { label: "Subscription Ingested", value: subscriptionCapturedCount, total: totalFounding, target: totalFounding },
      { label: "Paid-like Status", value: paymentStatusCount, total: totalFounding, target: totalFounding },
      { label: "Athlete Active", value: activeProfileCount, total: totalFounding, target: totalFounding },
      { label: "Intake Fully Submitted", value: intakeCompletedCount, total: totalFounding, target: totalFounding },
      { label: "Assessment Pending+", value: assessmentPendingCount, total: totalFounding, target: totalFounding }
    ];

    var html =
      '<div class="admin-overview-item admin-widget-summary">' +
        '<p class="admin-overview-item-title">Founding Verification Snapshot</p>' +
        '<p class="admin-overview-item-meta">Founding members tracked: ' + escapeHtml(String(totalFounding)) + '</p>' +
      '</div>';

    if (recentPaymentNotifications.length) {
      var latestPayment = recentPaymentNotifications[0];
      var latestSubscription = latestPayment.row || {};
      var latestAthlete = state.athletes.find(function (athlete) {
        return String(athlete && athlete.user_id || "") === String(latestPayment.user_id || "");
      }) || null;
      var latestLabel = latestAthlete && (latestAthlete.name || latestAthlete.email)
        ? String(latestAthlete.name || latestAthlete.email)
        : String(latestPayment.user_id || "Athlete").slice(0, 8);

      html +=
        '<div class="admin-overview-item admin-widget-row">' +
          '<div>' +
            '<p class="admin-overview-item-title">Payment Received</p>' +
            '<p class="admin-overview-item-meta">' +
              escapeHtml(latestLabel) +
              ' • ' +
              escapeHtml(String(latestSubscription.last_event_type || latestSubscription.status || "active")) +
              (latestSubscription.last_event_created_at || latestSubscription.updated_at ? ' • ' + escapeHtml(formatDate(latestSubscription.last_event_created_at || latestSubscription.updated_at)) : '') +
            '</p>' +
          '</div>' +
          '<span class="admin-risk-chip is-stable">Notify Coach</span>' +
        '</div>';
    }

    checks.forEach(function (check) {
      var isPass = check.total > 0 && check.value >= check.target;
      var toneClass = isPass ? "is-stable" : "is-watch";
      html +=
        '<div class="admin-overview-item admin-widget-row">' +
          '<div>' +
            '<p class="admin-overview-item-title">' + escapeHtml(check.label) + '</p>' +
            '<p class="admin-overview-item-meta">' + escapeHtml(String(check.value)) + ' / ' + escapeHtml(String(check.total)) + '</p>' +
          '</div>' +
          '<span class="admin-risk-chip ' + toneClass + '">' + (isPass ? 'PASS' : 'CHECK') + '</span>' +
        '</div>';
    });

    html +=
      '<div class="admin-overview-item">' +
        '<p class="admin-overview-item-meta">Detailed SQL checks: sql/founding-member-phase2-verification.sql</p>' +
      '</div>';

    container.innerHTML = html;
  }

  function renderFoundingOnboardingQueue() {
    var container = document.querySelector("[data-admin-founding-onboarding]");
    if (!container) {
      return;
    }

    var rows = Array.isArray(state.foundingOnboardingRows) ? state.foundingOnboardingRows.slice() : [];
    if (!rows.length) {
      container.innerHTML =
        '<div class="admin-empty-state">' +
          '<p class="admin-empty-state-title">No founding onboarding rows yet</p>' +
          '<p class="admin-empty-state-copy">Run the onboarding migration and add founding members to begin tracking this queue.</p>' +
        '</div>';
      return;
    }

    var athleteById = {};
    (state.athletes || []).forEach(function (athlete) {
      var id = String(athlete && athlete.user_id || "").trim();
      if (id) {
        athleteById[id] = athlete;
      }
    });

    rows.sort(function (a, b) {
      var aPriority = getFoundingOnboardingStagePriority(a && a.stage);
      var bPriority = getFoundingOnboardingStagePriority(b && b.stage);
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      var aUpdated = String(a && (a.updated_at || a.created_at) || "");
      var bUpdated = String(b && (b.updated_at || b.created_at) || "");
      return bUpdated.localeCompare(aUpdated);
    });

    var pendingDocs = rows.filter(function (row) {
      return String(row && row.stage || "") === "first_login_pending_docs";
    }).length;

    var docsSigned = rows.filter(function (row) {
      return !!(row && row.docs_signed_at);
    }).length;

    var html =
      '<div class="admin-overview-item admin-widget-summary">' +
        '<p class="admin-overview-item-title">Founding Cohort Snapshot</p>' +
        '<p class="admin-overview-item-meta">Total: ' + escapeHtml(String(rows.length)) + ' • Pending docs: ' + escapeHtml(String(pendingDocs)) + ' • Docs signed: ' + escapeHtml(String(docsSigned)) + '</p>' +
      '</div>';

    rows.slice(0, 12).forEach(function (row) {
      var athleteId = String(row && row.athlete_user_id || "").trim();
      var athlete = athleteById[athleteId] || null;
      var athleteLabel = athlete && (athlete.name || athlete.email)
        ? String(athlete.name || athlete.email)
        : athleteId.slice(0, 8);
      var currentStage = String(row && row.stage || "").trim();
      var stageText = formatFoundingOnboardingStage(currentStage);
      var nextStage = getNextFoundingOnboardingStage(currentStage);
      var previousStage = getPreviousFoundingOnboardingStage(currentStage);
      var stageOptions = getFoundingOnboardingStages().map(function (stageValue) {
        var selected = stageValue === currentStage ? ' selected' : '';
        return '<option value="' + escapeAttribute(stageValue) + '"' + selected + '>' + escapeHtml(formatFoundingOnboardingStage(stageValue)) + '</option>';
      }).join('');
      var signedAtText = row && row.docs_signed_at ? formatDate(row.docs_signed_at) : "Not signed";
      var signatureSummary = state.foundingSignatureSummaryByAthlete[athleteId] || { count: 0 };
      var signatureCountText = String(signatureSummary.count || 0) + " docs";
      var insightHref = "athlete-insight.html?athleteId=" + encodeURIComponent(athleteId);
      var actionHtml = "";
      var backHtml = "";
      var paymentTaskHtml = "";

      if (currentStage === "docs_signed_pending_payment" || currentStage === "payment_pending") {
        paymentTaskHtml =
          '<button type="button" class="btn admin-btn-refresh" data-founding-push-payment="1" data-athlete-id="' + escapeAttribute(athleteId) + '">Push Payment Task</button>';
      }

      if (nextStage) {
        actionHtml =
          '<button type="button" class="btn admin-btn-small" data-founding-advance="1" data-athlete-id="' + escapeAttribute(athleteId) + '" data-current-stage="' + escapeAttribute(currentStage) + '">Advance to ' + escapeHtml(formatFoundingOnboardingStage(nextStage)) + '</button>';
      } else {
        actionHtml = '<span class="admin-risk-chip is-stable">Final Stage</span>';
      }

      if (previousStage) {
        backHtml = '<button type="button" class="btn admin-btn-small" data-founding-back="1" data-athlete-id="' + escapeAttribute(athleteId) + '" data-current-stage="' + escapeAttribute(currentStage) + '">Move Back</button>';
      }

      html +=
        '<div class="admin-overview-item admin-widget-row">' +
          '<div>' +
            '<p class="admin-overview-item-title">' + escapeHtml(athleteLabel) + '</p>' +
            '<p class="admin-overview-item-meta">' + escapeHtml(stageText) + ' • ' + escapeHtml(signatureCountText) + ' • ' + escapeHtml(signedAtText) + '</p>' +
            '<div style="display:flex; gap:0.45rem; flex-wrap:wrap; align-items:center; margin-top:0.45rem;">' +
              '<select class="admin-search" style="min-width:210px; max-width:240px;" data-founding-stage-select="1" data-athlete-id="' + escapeAttribute(athleteId) + '">' +
                stageOptions +
              '</select>' +
              '<button type="button" class="btn admin-btn-small" data-founding-set-stage="1" data-athlete-id="' + escapeAttribute(athleteId) + '" data-current-stage="' + escapeAttribute(currentStage) + '">Save Stage</button>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex; gap:0.45rem; flex-wrap:wrap; justify-content:flex-end;">' +
            '<a class="btn admin-btn-small" href="' + escapeAttribute(insightHref) + '">Insights</a>' +
            paymentTaskHtml +
            backHtml +
            actionHtml +
          '</div>' +
        '</div>';
    });

    if (rows.length > 12) {
      html += '<div class="admin-overview-item"><p class="admin-overview-item-meta">Showing 12 of ' + escapeHtml(String(rows.length)) + ' founding members.</p></div>';
    }

    container.innerHTML = html;
  }

  function buildFoundingSignatureSummaryByAthlete(rows) {
    var source = Array.isArray(rows) ? rows : [];
    var summary = {};

    source.forEach(function (row) {
      var athleteId = String(row && row.athlete_user_id || "").trim();
      if (!athleteId) {
        return;
      }

      if (!summary[athleteId]) {
        summary[athleteId] = {
          count: 0,
          docs: {},
          latest_signed_at: ""
        };
      }

      var bucket = summary[athleteId];
      var docKey = String(row && row.document_id || "") + "::" + String(row && row.document_version || "");
      if (docKey !== "::" && !bucket.docs[docKey]) {
        bucket.docs[docKey] = true;
        bucket.count += 1;
      }

      var signedAt = String(row && row.signed_at || "");
      if (signedAt && (!bucket.latest_signed_at || signedAt > bucket.latest_signed_at)) {
        bucket.latest_signed_at = signedAt;
      }
    });

    return summary;
  }

  function getFoundingOnboardingStagePriority(stage) {
    var value = String(stage || "").trim();
    var lookup = {
      first_login_pending_docs: 1,
      docs_signed_pending_payment: 2,
      payment_pending: 3,
      welcome_pending_intakes: 4,
      intakes_completed_assessment_pending: 5,
      assessment_in_progress: 6,
      assessment_published_pending_review: 7,
      review_scheduled: 8,
      active_training: 9,
      invited: 10
    };
    if (Object.prototype.hasOwnProperty.call(lookup, value)) {
      return lookup[value];
    }
    return 99;
  }

  function getFoundingOnboardingStages() {
    return [
      "invited",
      "first_login_pending_docs",
      "docs_signed_pending_payment",
      "payment_pending",
      "welcome_pending_intakes",
      "intakes_completed_assessment_pending",
      "assessment_in_progress",
      "assessment_published_pending_review",
      "review_scheduled",
      "active_training"
    ];
  }

  function getNextFoundingOnboardingStage(stage) {
    var orderedStages = getFoundingOnboardingStages();

    var current = String(stage || "").trim();
    var index = orderedStages.indexOf(current);
    if (index < 0 || index >= orderedStages.length - 1) {
      return "";
    }

    return orderedStages[index + 1];
  }

  function getPreviousFoundingOnboardingStage(stage) {
    var orderedStages = getFoundingOnboardingStages();
    var current = String(stage || "").trim();
    var index = orderedStages.indexOf(current);
    if (index <= 0) {
      return "";
    }

    return orderedStages[index - 1];
  }

  function onFoundingOnboardingActionClick(event) {
    if (!state.client) {
      setStatus("Supabase client is unavailable.", "error");
      return;
    }

    var target = event.target;
    var advanceButton = target && target.closest("[data-founding-advance]");
    var backButton = target && target.closest("[data-founding-back]");
    var setStageButton = target && target.closest("[data-founding-set-stage]");
    var pushPaymentButton = target && target.closest("[data-founding-push-payment]");

    if (!advanceButton && !backButton && !setStageButton && !pushPaymentButton) {
      return;
    }

    if (pushPaymentButton) {
      var paymentAthleteId = String(pushPaymentButton.getAttribute("data-athlete-id") || "").trim();
      assignMembershipPaymentTask("", paymentAthleteId);
      return;
    }

    var actionButton = advanceButton || backButton || setStageButton;

    var athleteId = String(actionButton.getAttribute("data-athlete-id") || "").trim();
    var currentStage = String(actionButton.getAttribute("data-current-stage") || "").trim();
    var nextStage = "";

    if (advanceButton) {
      nextStage = getNextFoundingOnboardingStage(currentStage);
    } else if (backButton) {
      nextStage = getPreviousFoundingOnboardingStage(currentStage);
    } else if (setStageButton) {
      var stageSelect = document.querySelector('[data-founding-stage-select][data-athlete-id="' + athleteId + '"]');
      nextStage = String(stageSelect && stageSelect.value || "").trim();
      if (nextStage && getFoundingOnboardingStages().indexOf(nextStage) < 0) {
        nextStage = "";
      }
    }

    if (!athleteId || !nextStage) {
      setStatus("Could not determine next stage.", "error");
      return;
    }

    if (nextStage === currentStage) {
      setStatus("Stage is already set to that value.", "info");
      return;
    }

    var confirmed = window.confirm(
      "Update this athlete from " +
      formatFoundingOnboardingStage(currentStage) +
      " to " +
      formatFoundingOnboardingStage(nextStage) +
      "?"
    );

    if (!confirmed) {
      return;
    }

    actionButton.disabled = true;
    setStatus("Updating founding onboarding stage...", "info");

    state.client
      .from("founding_member_onboarding")
      .update({ stage: nextStage })
      .eq("athlete_user_id", athleteId)
      .then(function (result) {
        if (result && result.error) {
          throw result.error;
        }

        setStatus("Founding onboarding stage updated.", "success");
        loadCoachOverviewData();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Could not update founding onboarding stage.", "error");
      })
      .finally(function () {
        actionButton.disabled = false;
      });
  }

  function formatFoundingOnboardingStage(stage) {
    var value = String(stage || "").trim();
    if (!value) {
      return "Unknown";
    }

    return value
      .split("_")
      .map(function (part) {
        return part ? part.charAt(0).toUpperCase() + part.slice(1) : "";
      })
      .join(" ");
  }

  function renderUpcomingTimeline() {
    var container = document.querySelector("[data-admin-upcoming-list]");
    if (!container) {
      return;
    }

    var todayKey = formatDateKey(new Date());
    var athleteById = {};
    state.athletes.forEach(function (athlete) {
      athleteById[String(athlete.user_id || "")] = athlete;
    });

    var upcomingGoals = state.athleteGoalEvents
      .filter(function (goalItem) {
        var status = String(goalItem.status || "active").toLowerCase();
        if (status === "completed" || status === "archived") {
          return false;
        }
        if (!goalItem.target_date || goalItem.target_date < todayKey) {
          return false;
        }

        return isTimelineGoalEvent(goalItem);
      })
      .slice(0, 8)
      .map(function (goalItem) {
        var athlete = athleteById[String(goalItem.user_id || "")];
        var athleteName = athlete && (athlete.name || athlete.email) ? (athlete.name || athlete.email) : "Athlete";
        var daysUntil = getDaysUntilDateKey(goalItem.target_date);
        var countdownLabel = "";
        if (typeof daysUntil === "number") {
          if (daysUntil > 0) {
            countdownLabel = daysUntil + " days";
          } else if (daysUntil === 0) {
            countdownLabel = "Today";
          } else {
            countdownLabel = Math.abs(daysUntil) + " days ago";
          }
        }

        return {
          kind: "goal",
          athlete_user_id: String(goalItem.user_id || ""),
          sortKey: String(goalItem.target_date || ""),
          title: String(goalItem.title || "Upcoming Event"),
          subtitle: [
            athleteName,
            getGoalTypeLabel(goalItem.goal_type),
            goalItem.target_date,
            countdownLabel
          ].filter(Boolean).join(" • ")
        };
      });

    var upcomingBirthdays = buildUpcomingBirthdayTimelineItems(state.athletes, todayKey, 45, 8);
    var membershipAlerts = buildUpcomingMembershipAlertItems(state.foundingSubscriptionRows, state.athletes, todayKey, 14, 8);
    var individualizedPlanAlerts = buildUpcomingIndividualizedPlanExpiryItems(state.activePrograms, state.athletes, todayKey, 21, 8);

    var items = upcomingGoals.concat(upcomingBirthdays, membershipAlerts, individualizedPlanAlerts);
    items.sort(function (a, b) {
      return String(a.sortKey || "").localeCompare(String(b.sortKey || ""));
    });

    if (!items.length) {
      container.innerHTML =
        '<div class="admin-empty-state">' +
          '<p class="admin-empty-state-title">No upcoming timeline items</p>' +
          '<p class="admin-empty-state-copy">No birthdays, events, membership alerts, or plan expiries are currently due soon.</p>' +
        '</div>';
      return;
    }

    container.innerHTML = items
      .slice(0, 12)
      .map(function (item) {
        var athleteId = String(item && item.athlete_user_id || "").trim();
        var actionHtml = "";
        if (athleteId) {
          var insightHref = "athlete-insight.html?athleteId=" + encodeURIComponent(athleteId);
          actionHtml = '<a class="btn admin-btn-small" href="' + escapeAttribute(insightHref) + '">Open Insights</a>';
        }

        return (
          '<div class="admin-overview-item">' +
            '<p class="admin-overview-item-title">' + escapeHtml(item.title) + '</p>' +
            '<p class="admin-overview-item-meta">' + escapeHtml(item.subtitle) + '</p>' +
            actionHtml +
          '</div>'
        );
      })
      .join("");
  }

  function isTimelineGoalEvent(goalItem) {
    var goalType = String(goalItem && goalItem.goal_type || "").toLowerCase();
    if (goalType === "race" || goalType === "event" || goalType === "trip") {
      return true;
    }

    var title = String(goalItem && goalItem.title || "").toLowerCase();
    return /race|event|competition|meet|marathon|ultra|triathlon/.test(title);
  }

  function buildUpcomingBirthdayTimelineItems(athletes, todayKey, daysAhead, maxItems) {
    var source = Array.isArray(athletes) ? athletes : [];
    var horizon = Number(daysAhead) > 0 ? Number(daysAhead) : 45;
    var limit = Number(maxItems) > 0 ? Number(maxItems) : 8;
    var items = [];

    source.forEach(function (athlete) {
      var dobText = getAthleteDobValue(athlete);
      if (!dobText) {
        return;
      }

      var nextBirthday = getNextBirthdayDateKey(dobText, todayKey);
      if (!nextBirthday) {
        return;
      }

      var daysUntil = getDaysUntilDateKey(nextBirthday);
      if (typeof daysUntil !== "number" || daysUntil < 0 || daysUntil > horizon) {
        return;
      }

      var athleteName = String(athlete && (athlete.name || athlete.email) || "Athlete");
      var birthdayLabel = daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : daysUntil + " days";

      items.push({
        kind: "birthday",
        athlete_user_id: String(athlete && athlete.user_id || ""),
        sortKey: nextBirthday + " 00:00",
        title: athleteName + " birthday",
        subtitle: [nextBirthday, birthdayLabel].join(" • ")
      });
    });

    items.sort(function (a, b) {
      return String(a.sortKey || "").localeCompare(String(b.sortKey || ""));
    });

    return items.slice(0, limit);
  }

  function buildUpcomingMembershipAlertItems(subscriptions, athletes, todayKey, daysAhead, maxItems) {
    var rows = Array.isArray(subscriptions) ? subscriptions : [];
    var horizon = Number(daysAhead) > 0 ? Number(daysAhead) : 14;
    var limit = Number(maxItems) > 0 ? Number(maxItems) : 8;
    var athleteById = buildAthleteLookupById(athletes);
    var latestByUserId = {};

    rows.forEach(function (row) {
      var userId = String(row && row.user_id || "").trim();
      if (!userId) {
        return;
      }

      var existing = latestByUserId[userId];
      var rowTime = new Date(String(row && row.updated_at || row && row.last_event_created_at || 0)).getTime();
      var existingTime = existing
        ? new Date(String(existing.updated_at || existing.last_event_created_at || 0)).getTime()
        : -Infinity;

      if (!existing || rowTime >= existingTime) {
        latestByUserId[userId] = row;
      }
    });

    var items = [];
    Object.keys(latestByUserId).forEach(function (userId) {
      var row = latestByUserId[userId];
      var status = String(row && row.status || "").toLowerCase();
      var athlete = athleteById[userId] || null;
      var athleteName = String(athlete && (athlete.name || athlete.email) || "Athlete");

      if (status === "past_due" || status === "unpaid" || status === "incomplete" || status === "incomplete_expired" || status === "canceled") {
        items.push({
          kind: "membership_alert",
          athlete_user_id: userId,
          sortKey: todayKey + " 06:00",
          title: athleteName + " membership needs attention",
          subtitle: ["Status", status.replace(/_/g, " ")].join(" • ")
        });
        return;
      }

      if (status !== "active" && status !== "trialing") {
        return;
      }

      var eventDateText = String(row && row.last_event_created_at || "").slice(0, 10);
      var eventDate = parseDateOnly(eventDateText);
      if (!eventDate) {
        return;
      }

      var renewalDate = new Date(eventDate.getTime());
      renewalDate.setDate(renewalDate.getDate() + 30);
      var renewalDateKey = formatDateKey(renewalDate);
      var daysUntilRenewal = getDaysUntilDateKey(renewalDateKey);
      if (typeof daysUntilRenewal !== "number" || daysUntilRenewal < 0 || daysUntilRenewal > horizon) {
        return;
      }

      var dueLabel = daysUntilRenewal === 0 ? "Today" : daysUntilRenewal === 1 ? "Tomorrow" : daysUntilRenewal + " days";
      items.push({
        kind: "membership_renewal",
        athlete_user_id: userId,
        sortKey: renewalDateKey + " 06:30",
        title: athleteName + " membership renewal due",
        subtitle: [renewalDateKey, dueLabel, "Status", status].join(" • ")
      });
    });

    items.sort(function (a, b) {
      return String(a.sortKey || "").localeCompare(String(b.sortKey || ""));
    });
    return items.slice(0, limit);
  }

  function buildUpcomingIndividualizedPlanExpiryItems(programs, athletes, todayKey, daysAhead, maxItems) {
    var rows = Array.isArray(programs) ? programs : [];
    var horizon = Number(daysAhead) > 0 ? Number(daysAhead) : 21;
    var limit = Number(maxItems) > 0 ? Number(maxItems) : 8;
    var athleteById = buildAthleteLookupById(athletes);
    var items = [];

    rows.forEach(function (row) {
      if (!row || row.is_active === false || !isLikelyIndividualizedProgramName(row.program_name)) {
        return;
      }

      var assignedAt = parseIsoDateToDate(row.assigned_at);
      if (!assignedAt) {
        return;
      }

      var durationDays = deriveProgramDurationDays(row.program_name);
      var expiryDate = new Date(assignedAt.getTime());
      expiryDate.setDate(expiryDate.getDate() + durationDays);
      var expiryKey = formatDateKey(expiryDate);
      var daysUntilExpiry = getDaysUntilDateKey(expiryKey);
      if (typeof daysUntilExpiry !== "number" || daysUntilExpiry < 0 || daysUntilExpiry > horizon) {
        return;
      }

      var athleteId = String(row.user_id || "").trim();
      var athlete = athleteById[athleteId] || null;
      var athleteName = String(athlete && (athlete.name || athlete.email) || "Athlete");
      var dueLabel = daysUntilExpiry === 0 ? "Today" : daysUntilExpiry === 1 ? "Tomorrow" : daysUntilExpiry + " days";
      items.push({
        kind: "program_expiry",
        athlete_user_id: athleteId,
        sortKey: expiryKey + " 07:00",
        title: athleteName + " individualized plan expires soon",
        subtitle: [String(row.program_name || "Custom Program"), expiryKey, dueLabel].join(" • ")
      });
    });

    items.sort(function (a, b) {
      return String(a.sortKey || "").localeCompare(String(b.sortKey || ""));
    });
    return items.slice(0, limit);
  }

  function buildAthleteLookupById(athletes) {
    var lookup = {};
    (Array.isArray(athletes) ? athletes : []).forEach(function (athlete) {
      var athleteId = String(athlete && athlete.user_id || "").trim();
      if (!athleteId) {
        return;
      }
      lookup[athleteId] = athlete;
    });
    return lookup;
  }

  function parseIsoDateToDate(value) {
    var text = String(value || "").trim();
    if (!text) {
      return null;
    }

    var parsed = new Date(text);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  function deriveProgramDurationDays(programName) {
    var text = String(programName || "").toLowerCase();
    var match = text.match(/(\d+)\s*(week|wk|weeks|day|days|month|months)/i);
    if (!match) {
      return 84;
    }

    var amount = parseInt(match[1], 10);
    var unit = String(match[2] || "").toLowerCase();
    if (!amount || amount < 1) {
      return 84;
    }

    if (unit.indexOf("day") === 0) {
      return amount;
    }

    if (unit.indexOf("month") === 0) {
      return amount * 30;
    }

    return amount * 7;
  }

  function getAthleteDobValue(athlete) {
    if (!athlete || typeof athlete !== "object") {
      return "";
    }

    var directValue =
      athlete.dob ||
      athlete.date_of_birth ||
      athlete.birth_date ||
      athlete.birthday;

    var normalizedDirect = normalizeDobValue(directValue);
    if (normalizedDirect) {
      return normalizedDirect;
    }

    var possibleProfileObjects = [
      athlete.profile,
      athlete.profile_data,
      athlete.profile_json,
      athlete.general_profile,
      athlete.general
    ];

    for (var i = 0; i < possibleProfileObjects.length; i++) {
      var parsed = parseAthleteProfileObject(possibleProfileObjects[i]);
      if (!parsed) {
        continue;
      }

      var nestedValue =
        parsed.dob ||
        parsed.date_of_birth ||
        parsed.birth_date ||
        parsed.birthday;

      var normalizedNested = normalizeDobValue(nestedValue);
      if (normalizedNested) {
        return normalizedNested;
      }
    }

    return "";
  }

  function parseAthleteProfileObject(value) {
    if (!value) {
      return null;
    }

    if (typeof value === "object") {
      return value;
    }

    if (typeof value !== "string") {
      return null;
    }

    try {
      var parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function normalizeDobValue(value) {
    var text = String(value || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return "";
    }

    var parsed = parseDateOnly(text);
    return parsed ? text : "";
  }

  function getNextBirthdayDateKey(dobText, todayKey) {
    var dob = normalizeDobValue(dobText);
    if (!dob) {
      return "";
    }

    var birthDate = parseDateOnly(dob);
    if (!birthDate) {
      return "";
    }

    var todayDate = parseDateOnly(todayKey);
    if (!todayDate) {
      return "";
    }

    var nextBirthday = new Date(todayDate.getTime());
    nextBirthday.setMonth(birthDate.getMonth(), birthDate.getDate());

    if (formatDateKey(nextBirthday) < todayKey) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }

    return formatDateKey(nextBirthday);
  }

  function onAddCoachTodo(event) {
    event.preventDefault();
    var input = document.querySelector("[data-admin-todo-input]");
    var text = String(input && input.value || "").trim();
    if (!text) {
      return;
    }

    state.coachTodos.unshift({
      id: "todo_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      text: text,
      done: false,
      created_at: new Date().toISOString()
    });

    if (input) {
      input.value = "";
    }

    writeCoachTodos(state.coachTodos);
    renderCoachTodoList();
  }

  function onCoachTodoListChange(event) {
    var checkbox = event.target && event.target.closest("[data-todo-toggle]");
    if (!checkbox) {
      return;
    }

    var todoId = String(checkbox.getAttribute("data-todo-toggle") || "").trim();
    state.coachTodos = state.coachTodos.map(function (todo) {
      if (todo.id !== todoId) {
        return todo;
      }
      return {
        id: todo.id,
        text: todo.text,
        done: !!checkbox.checked,
        created_at: todo.created_at
      };
    });

    writeCoachTodos(state.coachTodos);
    renderCoachTodoList();
  }

  function onCoachTodoListClick(event) {
    var completeBtn = event.target && event.target.closest("[data-todo-complete]");
    if (completeBtn) {
      var completeTodoId = String(completeBtn.getAttribute("data-todo-complete") || "").trim();
      state.coachTodos = state.coachTodos.filter(function (todo) {
        return todo.id !== completeTodoId;
      });
      writeCoachTodos(state.coachTodos);
      renderCoachTodoList();
      return;
    }

    var removeBtn = event.target && event.target.closest("[data-todo-remove]");
    if (!removeBtn) {
      return;
    }

    var todoId = String(removeBtn.getAttribute("data-todo-remove") || "").trim();
    state.coachTodos = state.coachTodos.filter(function (todo) {
      return todo.id !== todoId;
    });
    writeCoachTodos(state.coachTodos);
    renderCoachTodoList();
  }

  function renderCoachTodoList() {
    var container = document.querySelector("[data-admin-todo-list]");
    if (!container) {
      renderMembershipInquiries();
      return;
    }

    if (!state.coachTodos.length) {
      container.innerHTML = "";
      renderMembershipInquiries();
      return;
    }

    container.innerHTML = state.coachTodos
      .map(function (todo) {
        return (
          '<div class="admin-overview-item admin-todo-item ' + (todo.done ? 'is-done' : '') + '">' +
            '<input type="checkbox" data-todo-toggle="' + escapeAttribute(todo.id) + '" ' + (todo.done ? 'checked' : '') + ' />' +
            '<p class="admin-overview-item-title">' + escapeHtml(todo.text) + '</p>' +
            '<button type="button" class="btn admin-btn-small" data-todo-complete="' + escapeAttribute(todo.id) + '">Completed</button>' +
            '<button type="button" class="btn admin-btn-delete-mini" data-todo-remove="' + escapeAttribute(todo.id) + '">Remove</button>' +
          '</div>'
        );
      })
      .join("");

    renderMembershipInquiries();
  }

  function renderCoachPerformanceWidgets() {
    renderReadinessTrendWidget();
    renderAcwrRiskWidget();
    renderInjuryAlertsWidget();
  }

  function renderReadinessTrendWidget() {
    var container = document.querySelector("[data-admin-readiness-trend]");
    if (!container) {
      return;
    }

    var readinessMap = state.coachReadinessByAthlete && typeof state.coachReadinessByAthlete === "object"
      ? state.coachReadinessByAthlete
      : {};
    var readinessScores = Object.keys(readinessMap)
      .map(function (key) {
        return Number(readinessMap[key] && readinessMap[key].score);
      })
      .filter(function (value) {
        return Number.isFinite(value);
      });

    var lowCount = readinessScores.filter(function (score) { return score < 60; }).length;
    var midCount = readinessScores.filter(function (score) { return score >= 60 && score < 75; }).length;
    var highCount = readinessScores.filter(function (score) { return score >= 75; }).length;
    var avgReadiness = readinessScores.length ? Math.round(readinessScores.reduce(function (sum, score) { return sum + score; }, 0) / readinessScores.length) : null;

    var trend = computeRecoveryTrendSnapshot(state.coachStravaRows);
    var trendClass = trend.delta > 1 ? "is-up" : (trend.delta < -1 ? "is-down" : "is-flat");
    var trendLabel = trend.delta > 1
      ? "up " + formatInteger(Math.abs(trend.delta))
      : (trend.delta < -1 ? "down " + formatInteger(Math.abs(trend.delta)) : "stable");

    container.innerHTML =
      '<div class="admin-overview-item admin-widget-summary">' +
        '<p class="admin-overview-item-title">Current Team Readiness</p>' +
        '<p class="admin-overview-item-meta">Avg readiness: ' + escapeHtml(avgReadiness == null ? "--" : formatInteger(avgReadiness)) + ' • Athletes scored: ' + escapeHtml(String(readinessScores.length)) + '</p>' +
      '</div>' +
      '<div class="admin-overview-item admin-widget-grid">' +
        '<span class="admin-widget-pill is-good">Ready ' + escapeHtml(String(highCount)) + '</span>' +
        '<span class="admin-widget-pill is-mid">Watch ' + escapeHtml(String(midCount)) + '</span>' +
        '<span class="admin-widget-pill is-low">Low ' + escapeHtml(String(lowCount)) + '</span>' +
      '</div>' +
      '<div class="admin-overview-item admin-widget-trend">' +
        '<p class="admin-overview-item-title">14-day recovery trend</p>' +
        '<p class="admin-overview-item-meta">Last 7-day avg: ' + escapeHtml(trend.recentLabel) + ' • Prior 7-day avg: ' + escapeHtml(trend.previousLabel) + '</p>' +
        '<span class="admin-widget-trend-badge ' + trendClass + '">Trend ' + escapeHtml(trendLabel) + '</span>' +
      '</div>';
  }

  function renderAcwrRiskWidget() {
    var container = document.querySelector("[data-admin-acwr-risk]");
    if (!container) {
      return;
    }

    var athleteMap = state.latestMetricRowsByAthlete && typeof state.latestMetricRowsByAthlete === "object"
      ? state.latestMetricRowsByAthlete
      : {};
    var athletes = Array.isArray(state.athletes) ? state.athletes : [];
    var nameByAthleteId = {};

    athletes.forEach(function (athlete) {
      var athleteId = String(athlete && athlete.user_id || "").trim();
      if (!athleteId) {
        return;
      }
      nameByAthleteId[athleteId] = String(athlete && (athlete.name || athlete.email) || "Athlete");
    });

    var athleteIds = Object.keys(athleteMap);
    var rows = [];
    var highRisk = 0;
    var watchRisk = 0;
    var optimal = 0;

    athleteIds.forEach(function (athleteId) {
      var acwrValue = resolveAcwrMetricValue(athleteMap[athleteId]);
      if (!Number.isFinite(acwrValue)) {
        return;
      }

      var band = classifyAcwrBand(acwrValue);
      if (band === "high") {
        highRisk += 1;
      } else if (band === "watch") {
        watchRisk += 1;
      } else {
        optimal += 1;
      }

      rows.push({
        athleteId: athleteId,
        name: nameByAthleteId[athleteId] || "Athlete",
        value: acwrValue,
        band: band
      });
    });

    rows.sort(function (a, b) {
      var severityWeight = { high: 3, watch: 2, optimal: 1 };
      var bySeverity = (severityWeight[b.band] || 0) - (severityWeight[a.band] || 0);
      if (bySeverity !== 0) {
        return bySeverity;
      }

      var deviationA = Math.abs(a.value - 1);
      var deviationB = Math.abs(b.value - 1);
      return deviationB - deviationA;
    });

    if (!rows.length) {
      container.innerHTML =
        '<div class="admin-empty-state">' +
          '<p class="admin-empty-state-title">No ACWR data yet</p>' +
          '<p class="admin-empty-state-copy">Track Acute:Chronic Workload Ratio in athlete metrics to populate this widget.</p>' +
        '</div>';
      return;
    }

    var summary =
      '<div class="admin-overview-item admin-widget-summary">' +
        '<p class="admin-overview-item-title">ACWR Distribution</p>' +
        '<p class="admin-overview-item-meta">Tracked: ' + escapeHtml(String(rows.length)) + ' • High: ' + escapeHtml(String(highRisk)) + ' • Watch: ' + escapeHtml(String(watchRisk)) + ' • Optimal: ' + escapeHtml(String(optimal)) + '</p>' +
      '</div>';

    var topRows = rows.slice(0, 6).map(function (row) {
      var bandLabel = row.band === "high" ? "High" : (row.band === "watch" ? "Watch" : "Optimal");
      return (
        '<div class="admin-overview-item admin-widget-row">' +
          '<div>' +
            '<p class="admin-overview-item-title">' + escapeHtml(row.name) + '</p>' +
            '<p class="admin-overview-item-meta">ACWR ' + escapeHtml(formatMetricNumber(row.value)) + '</p>' +
          '</div>' +
          '<span class="admin-widget-pill is-' + escapeAttribute(row.band) + '">' + escapeHtml(bandLabel) + '</span>' +
        '</div>'
      );
    }).join("");

    container.innerHTML = summary + topRows;
  }

  function renderInjuryAlertsWidget() {
    var container = document.querySelector("[data-admin-injury-alerts]");
    if (!container) {
      return;
    }

    var athleteMap = state.latestMetricRowsByAthlete && typeof state.latestMetricRowsByAthlete === "object"
      ? state.latestMetricRowsByAthlete
      : {};
    var openFlags = getOpenFlags();
    var highFlags = openFlags.filter(function (flag) {
      return String(flag && flag.severity || "").toLowerCase() === "high";
    }).length;

    var painRows = collectPainInjuryRows(athleteMap);
    if (!openFlags.length && !painRows.length) {
      container.innerHTML =
        '<div class="admin-empty-state">' +
          '<p class="admin-empty-state-title">No active injury alerts</p>' +
          '<p class="admin-empty-state-copy">Manual flags and pain/injury metrics will surface here automatically.</p>' +
        '</div>';
      return;
    }

    var summary =
      '<div class="admin-overview-item admin-widget-summary">' +
        '<p class="admin-overview-item-title">Alert Totals</p>' +
        '<p class="admin-overview-item-meta">Open flags: ' + escapeHtml(String(openFlags.length)) + ' • High severity: ' + escapeHtml(String(highFlags)) + ' • Pain/injury metric alerts: ' + escapeHtml(String(painRows.length)) + '</p>' +
      '</div>';

    var athleteNameById = {};
    (state.athletes || []).forEach(function (athlete) {
      var athleteId = String(athlete && athlete.user_id || "").trim();
      if (!athleteId) {
        return;
      }
      athleteNameById[athleteId] = String(athlete && (athlete.name || athlete.email) || "Athlete");
    });

    var metricAlerts = painRows.slice(0, 6).map(function (item) {
      var athleteName = athleteNameById[item.athleteId] || "Athlete";
      return (
        '<div class="admin-overview-item admin-widget-row">' +
          '<div>' +
            '<p class="admin-overview-item-title">' + escapeHtml(athleteName) + '</p>' +
            '<p class="admin-overview-item-meta">' + escapeHtml(item.metricLabel + ": " + item.valueLabel) + '</p>' +
          '</div>' +
          '<span class="admin-widget-pill is-high">Alert</span>' +
        '</div>'
      );
    }).join("");

    container.innerHTML = summary + metricAlerts;
  }

  function buildLatestMetricRowsByAthlete(metricRows) {
    var source = Array.isArray(metricRows) ? metricRows : [];
    var output = {};

    source.forEach(function (row) {
      var userId = String(row && row.user_id || "").trim();
      var metricName = normalizeMetricName(row && row.metric_name);
      var updatedAt = String((row && (row.updated_at || row.created_at)) || "");

      if (!userId || !metricName || !updatedAt) {
        return;
      }

      if (!output[userId]) {
        output[userId] = {};
      }

      var existing = output[userId][metricName];
      if (!existing || updatedAt > existing.updated_at) {
        output[userId][metricName] = {
          metric_name: String(row && row.metric_name || ""),
          metric_value: row && row.metric_value != null ? String(row.metric_value) : "",
          updated_at: updatedAt
        };
      }
    });

    return output;
  }

  function computeRecoveryTrendSnapshot(stravaRows) {
    var rows = Array.isArray(stravaRows) ? stravaRows : [];
    var recoveryByDate = {};

    rows.forEach(function (row) {
      var dateKey = String(row && row.metric_date || "").trim();
      var value = Number(row && row.recovery_score);
      if (!dateKey || !Number.isFinite(value)) {
        return;
      }

      if (!recoveryByDate[dateKey]) {
        recoveryByDate[dateKey] = [];
      }
      recoveryByDate[dateKey].push(value);
    });

    var dates = Object.keys(recoveryByDate).sort();
    if (!dates.length) {
      return { recent: null, previous: null, delta: 0, recentLabel: "--", previousLabel: "--" };
    }

    var recentDates = dates.slice(-7);
    var previousDates = dates.slice(Math.max(0, dates.length - 14), Math.max(0, dates.length - 7));
    var recentAvg = averageRecoveryForDates(recoveryByDate, recentDates);
    var previousAvg = averageRecoveryForDates(recoveryByDate, previousDates);
    var delta = Number.isFinite(recentAvg) && Number.isFinite(previousAvg) ? (recentAvg - previousAvg) : 0;

    return {
      recent: recentAvg,
      previous: previousAvg,
      delta: delta,
      recentLabel: Number.isFinite(recentAvg) ? formatInteger(recentAvg) : "--",
      previousLabel: Number.isFinite(previousAvg) ? formatInteger(previousAvg) : "--"
    };
  }

  function averageRecoveryForDates(recoveryByDate, dates) {
    var dateList = Array.isArray(dates) ? dates : [];
    var values = [];

    dateList.forEach(function (dateKey) {
      var dayValues = Array.isArray(recoveryByDate[dateKey]) ? recoveryByDate[dateKey] : [];
      dayValues.forEach(function (value) {
        if (Number.isFinite(value)) {
          values.push(value);
        }
      });
    });

    if (!values.length) {
      return null;
    }
    return values.reduce(function (sum, value) { return sum + value; }, 0) / values.length;
  }

  function resolveAcwrMetricValue(metricSnapshot) {
    var aliases = ["acute:chronic workload ratio", "acute chronic workload ratio", "acwr"];
    var entry = findMetricSnapshotByAliases(metricSnapshot, aliases);
    if (!entry) {
      return null;
    }

    return parseMetricNumericValue(entry.metric_value);
  }

  function classifyAcwrBand(acwrValue) {
    var value = Number(acwrValue);
    if (!Number.isFinite(value)) {
      return "optimal";
    }

    if (value > 1.5 || value < 0.7) {
      return "high";
    }
    if ((value >= 1.3 && value <= 1.5) || (value >= 0.7 && value < 0.8)) {
      return "watch";
    }
    return "optimal";
  }

  function collectPainInjuryRows(metricMapByAthlete) {
    var map = metricMapByAthlete && typeof metricMapByAthlete === "object" ? metricMapByAthlete : {};
    var athleteIds = Object.keys(map);
    var aliases = ["pain/injury flags", "pain injury flags", "injury flags", "pain flags"];
    var rows = [];

    athleteIds.forEach(function (athleteId) {
      var entry = findMetricSnapshotByAliases(map[athleteId], aliases);
      if (!entry) {
        return;
      }

      var rawValue = String(entry.metric_value || "").trim();
      if (!rawValue) {
        return;
      }

      var lower = rawValue.toLowerCase();
      var numeric = parseMetricNumericValue(rawValue);
      var flagged = false;

      if (Number.isFinite(numeric)) {
        flagged = numeric > 0;
      } else {
        flagged = /yes|pain|injury|flare|acute|moderate|high|true|present/.test(lower) && !/none|no|false|clear/.test(lower);
      }

      if (!flagged) {
        return;
      }

      rows.push({
        athleteId: athleteId,
        metricLabel: String(entry.metric_name || "Pain/Injury Flags"),
        valueLabel: rawValue,
        updatedAt: String(entry.updated_at || "")
      });
    });

    rows.sort(function (a, b) {
      return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
    });

    return rows;
  }

  function findMetricSnapshotByAliases(metricSnapshot, aliases) {
    var snapshot = metricSnapshot && typeof metricSnapshot === "object" ? metricSnapshot : {};
    var aliasList = Array.isArray(aliases) ? aliases : [];

    for (var i = 0; i < aliasList.length; i++) {
      var key = normalizeMetricName(aliasList[i]);
      if (!key) {
        continue;
      }

      if (Object.prototype.hasOwnProperty.call(snapshot, key)) {
        return snapshot[key];
      }
    }

    return null;
  }

  function renderClimbingComparison() {
    var container = document.querySelector("[data-admin-climbing-comparison]");
    if (!container) {
      return;
    }

    var rows = Array.isArray(state.climbingComparisonRows) ? state.climbingComparisonRows.slice() : [];
    if (!rows.length) {
      container.innerHTML =
        '<div class="admin-empty-state">' +
          '<p class="admin-empty-state-title">No climbing athlete data yet</p>' +
          '<p class="admin-empty-state-copy">Add climbers and record assessment metrics to unlock level comparison.</p>' +
        '</div>';
      return;
    }

    var strongMismatch = rows.filter(function (row) { return row.status === "assessment-below"; }).length;
    var underreported = rows.filter(function (row) { return row.status === "assessment-above"; }).length;
    var aligned = rows.filter(function (row) { return row.status === "aligned"; }).length;

    var summary =
      '<div class="admin-overview-item admin-climb-summary">' +
        '<p class="admin-overview-item-title">Comparison Snapshot</p>' +
        '<p class="admin-overview-item-meta">Aligned: ' + escapeHtml(String(aligned)) + ' • Assessment below profile: ' + escapeHtml(String(strongMismatch)) + ' • Assessment above profile: ' + escapeHtml(String(underreported)) + '</p>' +
      '</div>';

    var listHtml = rows.slice(0, 10).map(function (row) {
      var toneClass = row.status === "assessment-below"
        ? "is-warning"
        : (row.status === "assessment-above" ? "is-info" : "is-ok");
      var insightHref = "athlete-insight.html?athleteId=" + encodeURIComponent(row.user_id || "");

      return (
        '<div class="admin-overview-item admin-climb-row">' +
          '<div class="admin-climb-row-head">' +
            '<p class="admin-overview-item-title">' + escapeHtml(row.name || "Athlete") + '</p>' +
            '<span class="admin-climb-status ' + toneClass + '">' + escapeHtml(row.status_label) + '</span>' +
          '</div>' +
          '<p class="admin-overview-item-meta">Self-report: ' + escapeHtml(row.self_grade_label) + ' • Assessment: ' + escapeHtml(row.assessment_label) + ' • Signal: ' + escapeHtml(row.signal_label) + '</p>' +
          '<div class="admin-risk-actions">' +
            '<a class="btn admin-btn-small" href="' + escapeAttribute(insightHref) + '">Insights</a>' +
          '</div>' +
        '</div>'
      );
    }).join("");

    container.innerHTML = summary + listHtml;
  }

  function buildClimbingComparisonRows(athletes, metricRows, athleteProfilesById) {
    var athleteList = Array.isArray(athletes) ? athletes : [];
    var profilesById = athleteProfilesById && typeof athleteProfilesById === "object"
      ? athleteProfilesById
      : {};
    var metricsByAthlete = buildLatestMetricsByAthlete(metricRows);

    return athleteList
      .map(function (athlete) {
        var athleteId = String(athlete && athlete.user_id || "").trim();
        var profile = profilesById[athleteId] || {};
        var mergedAthlete = mergeAthleteAccountData(athlete, profile);

        if (!isClimbingAthlete(mergedAthlete)) {
          return null;
        }

        var athleteName = String(mergedAthlete && (mergedAthlete.name || mergedAthlete.email) || "Athlete");
        var selfGradeText = resolveSelfReportedClimbingGrade(mergedAthlete);
        var selfBand = classifyClimbingGradeBand(selfGradeText);
        var assessment = estimateClimbingAssessmentBand(mergedAthlete, metricsByAthlete[athleteId] || {});

        if (!selfBand && !assessment.band) {
          return null;
        }

        var status = "aligned";
        var statusLabel = "Aligned";

        if (selfBand && assessment.band) {
          if (assessment.band > selfBand) {
            status = "assessment-above";
            statusLabel = "Assessment above profile";
          } else if (assessment.band < selfBand) {
            status = "assessment-below";
            statusLabel = "Assessment below profile";
          }
        } else {
          status = "aligned";
          statusLabel = "Partial data";
        }

        return {
          user_id: athleteId,
          name: athleteName,
          self_grade_label: selfGradeText || "Not set",
          assessment_label: assessment.band_label || "Insufficient test data",
          signal_label: assessment.signal_label || "No usable climbing test metrics",
          status: status,
          status_label: statusLabel,
          sort_score: selfBand && assessment.band ? Math.abs(assessment.band - selfBand) : 0
        };
      })
      .filter(function (row) {
        return !!row;
      })
      .sort(function (a, b) {
        if (b.sort_score !== a.sort_score) {
          return b.sort_score - a.sort_score;
        }
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
  }

  function mergeAthleteAccountData(baseAthlete, profileAthlete) {
    var base = baseAthlete && typeof baseAthlete === "object" ? baseAthlete : {};
    var profile = profileAthlete && typeof profileAthlete === "object" ? profileAthlete : {};

    return {
      user_id: String(base.user_id || profile.user_id || "").trim(),
      email: String(base.email || profile.email || "").trim(),
      name: String(profile.name || base.name || "").trim(),
      sport: String(profile.sport || base.sport || "").trim(),
      level: String(profile.level || base.level || "").trim(),
      sports: Array.isArray(profile.sports)
        ? profile.sports.slice()
        : (Array.isArray(base.sports) ? base.sports.slice() : base.sports),
      sport_overview: profile.sport_overview != null ? profile.sport_overview : base.sport_overview,
      height_cm: profile.height_cm != null ? profile.height_cm : base.height_cm,
      arm_span_cm: profile.arm_span_cm != null ? profile.arm_span_cm : base.arm_span_cm
    };
  }

  function buildLatestMetricsByAthlete(metricRows) {
    var source = Array.isArray(metricRows) ? metricRows : [];
    var output = {};

    source.forEach(function (row) {
      var userId = String(row && row.user_id || "").trim();
      var metricName = normalizeMetricName(row && row.metric_name);
      var metricValue = parseMetricNumericValue(row && row.metric_value);
      var updatedAt = String((row && (row.updated_at || row.created_at)) || "");

      if (!userId || !metricName || metricValue == null || !updatedAt) {
        return;
      }

      if (!output[userId]) {
        output[userId] = {};
      }

      var existing = output[userId][metricName];
      if (!existing || updatedAt > existing.updated_at) {
        output[userId][metricName] = {
          value: metricValue,
          updated_at: updatedAt
        };
      }
    });

    return output;
  }

  function normalizeMetricName(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/\s+/g, " ");
  }

  function parseMetricNumericValue(value) {
    if (value == null) {
      return null;
    }

    var text = String(value).trim();
    if (!text) {
      return null;
    }

    var parsed = parseFloat(text.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  function isClimbingAthlete(athlete) {
    if (!athlete || typeof athlete !== "object") {
      return false;
    }

    var sportText = String(athlete.sport || "").toLowerCase();
    if (sportText.indexOf("climb") > -1 || sportText.indexOf("boulder") > -1) {
      return true;
    }

    var sports = athlete.sports;
    if (Array.isArray(sports)) {
      if (sports.some(function (sport) {
        var text = String(sport || "").toLowerCase();
        return text.indexOf("climb") > -1 || text.indexOf("boulder") > -1;
      })) {
        return true;
      }
    } else if (typeof sports === "string") {
      var sportsText = sports.toLowerCase();
      if (sportsText.indexOf("climb") > -1 || sportsText.indexOf("boulder") > -1) {
        return true;
      }
    }

    var climbingOverview = getClimbingOverviewObject(athlete);
    return !!climbingOverview;
  }

  function getClimbingOverviewObject(athlete) {
    var raw = athlete && (athlete.sport_overview || athlete.profile_overview || athlete.overview);
    var parsed = parseAthleteProfileObject(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (parsed.climbing && typeof parsed.climbing === "object") {
      return parsed.climbing;
    }

    if (
      parsed.climbing_grade ||
      parsed.goal_grade ||
      parsed.climbing_type ||
      parsed.climbing_focus ||
      parsed.arm_span
    ) {
      return parsed;
    }

    return null;
  }

  function resolveSelfReportedClimbingGrade(athlete) {
    var climbingOverview = getClimbingOverviewObject(athlete);
    var gradeCandidates = [
      climbingOverview && climbingOverview.climbing_grade,
      climbingOverview && climbingOverview.goal_grade,
      climbingOverview && climbingOverview.climbing_goal_grade,
      athlete && athlete.level
    ];

    for (var i = 0; i < gradeCandidates.length; i++) {
      var text = String(gradeCandidates[i] || "").trim();
      if (text) {
        return text;
      }
    }

    return "";
  }

  function classifyClimbingGradeBand(gradeText) {
    var text = String(gradeText || "").trim();
    if (!text) {
      return null;
    }

    var upper = text.toUpperCase();
    var boulderMatch = upper.match(/V\s*(\d{1,2})/);
    if (boulderMatch) {
      var vGrade = parseInt(boulderMatch[1], 10);
      if (vGrade <= 3) {
        return 1;
      }
      if (vGrade <= 6) {
        return 2;
      }
      return 3;
    }

    var sportMatch = text.match(/5\.(\d{2})/);
    if (sportMatch) {
      var yds = parseInt(sportMatch[1], 10);
      if (yds <= 10) {
        return 1;
      }
      if (yds <= 12) {
        return 2;
      }
      return 3;
    }

    var lower = text.toLowerCase();
    if (lower.indexOf("beginner") > -1 || lower.indexOf("novice") > -1) {
      return 1;
    }
    if (lower.indexOf("intermediate") > -1) {
      return 2;
    }
    if (lower.indexOf("advanced") > -1 || lower.indexOf("expert") > -1) {
      return 3;
    }

    return null;
  }

  function estimateClimbingAssessmentBand(athlete, metricsByName) {
    var metrics = metricsByName || {};
    var score = 0;
    var signalParts = [];

    var apeIndex = resolveApeIndexSignal(athlete, metrics);
    if (apeIndex != null) {
      signalParts.push("Ape Index " + formatMetricSigned(apeIndex));
      if (apeIndex >= 8) {
        score += 2;
      } else if (apeIndex >= 3) {
        score += 1;
      }
    }

    var pullUps = readMetricValue(metrics, ["pull-up max", "pull up max", "pullups", "pull ups"]);
    if (pullUps != null) {
      signalParts.push("Pull-up max " + formatMetricSigned(pullUps, false));
      if (pullUps >= 12) {
        score += 2;
      } else if (pullUps >= 8) {
        score += 1;
      }
    }

    var gripStrength = readMetricValue(metrics, ["grip strength"]);
    if (gripStrength != null) {
      signalParts.push("Grip " + formatMetricSigned(gripStrength, false));
      if (gripStrength >= 45) {
        score += 2;
      } else if (gripStrength >= 35) {
        score += 1;
      }
    }

    var hangTime = readMetricValue(metrics, ["edge hang", "dead hang", "hangboard hang"]);
    if (hangTime != null) {
      signalParts.push("Hang " + formatMetricSigned(hangTime, false));
      if (hangTime >= 20) {
        score += 2;
      } else if (hangTime >= 10) {
        score += 1;
      }
    }

    if (!signalParts.length) {
      return {
        band: null,
        band_label: "",
        signal_label: ""
      };
    }

    var band = 1;
    var bandLabel = "Beginner range";
    if (score >= 5) {
      band = 3;
      bandLabel = "Advanced signal";
    } else if (score >= 2) {
      band = 2;
      bandLabel = "Intermediate signal";
    }

    return {
      band: band,
      band_label: bandLabel,
      signal_label: signalParts.slice(0, 2).join(" • ")
    };
  }

  function resolveApeIndexSignal(athlete, metrics) {
    var metricApe = readMetricValue(metrics, ["ape index"]);
    if (metricApe != null) {
      return metricApe;
    }

    var climbingOverview = getClimbingOverviewObject(athlete);
    var armSpan = parseFloat((climbingOverview && climbingOverview.arm_span) || athlete.arm_span_cm || "");
    var height = parseFloat(athlete.height_cm || "");

    if (Number.isFinite(armSpan) && Number.isFinite(height) && height > 0) {
      return Math.round((armSpan - height) * 10) / 10;
    }

    return null;
  }

  function readMetricValue(metrics, metricNames) {
    var names = Array.isArray(metricNames) ? metricNames : [];
    for (var i = 0; i < names.length; i++) {
      var key = normalizeMetricName(names[i]);
      if (metrics[key] && Number.isFinite(metrics[key].value)) {
        return metrics[key].value;
      }
    }
    return null;
  }

  function formatMetricSigned(value, withPlus) {
    var numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return "--";
    }

    var text = formatMetricNumber(numeric);
    if (withPlus !== false && numeric > 0) {
      return "+" + text;
    }

    return text;
  }

  function formatMetricNumber(value) {
    var numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return "--";
    }

    if (Math.abs(numeric % 1) < 0.0001) {
      return String(Math.round(numeric));
    }

    return String(Math.round(numeric * 10) / 10);
  }

  function buildCoachReadinessByAthlete(athletes, activePrograms, goals, nutritionTargets, nutritionLogs, stravaRows) {
    var athleteList = Array.isArray(athletes) ? athletes : [];
    var activeList = Array.isArray(activePrograms) ? activePrograms : [];
    var goalList = Array.isArray(goals) ? goals : [];
    var targetList = Array.isArray(nutritionTargets) ? nutritionTargets : [];
    var logList = Array.isArray(nutritionLogs) ? nutritionLogs : [];
    var stravaList = Array.isArray(stravaRows) ? stravaRows : [];
    var todayKey = formatDateKey(new Date());

    var activeCountByAthlete = {};
    activeList.forEach(function (program) {
      var userId = String(program && program.user_id || "").trim();
      if (!userId) {
        return;
      }
      activeCountByAthlete[userId] = (activeCountByAthlete[userId] || 0) + 1;
    });

    var nextEventDaysByAthlete = {};
    goalList.forEach(function (goalItem) {
      var status = String(goalItem && goalItem.status || "active").toLowerCase();
      if (status === "completed" || status === "archived") {
        return;
      }
      if (!isTimelineGoalEvent(goalItem) || !goalItem.target_date || goalItem.target_date < todayKey) {
        return;
      }
      var athleteId = String(goalItem.user_id || "").trim();
      if (!athleteId) {
        return;
      }

      var days = getDaysUntilDateKey(goalItem.target_date);
      if (typeof days !== "number") {
        return;
      }

      if (!Object.prototype.hasOwnProperty.call(nextEventDaysByAthlete, athleteId) || days < nextEventDaysByAthlete[athleteId]) {
        nextEventDaysByAthlete[athleteId] = days;
      }
    });

    var targetsByAthlete = {};
    targetList.forEach(function (item) {
      var userId = String(item && item.user_id || "").trim();
      if (!userId || Object.prototype.hasOwnProperty.call(targetsByAthlete, userId)) {
        return;
      }
      targetsByAthlete[userId] = Number(item && item.target_calories);
    });

    var latestLogByAthlete = pickLatestByUser(logList, "logged_on");
    var latestStravaByAthlete = pickLatestByUser(stravaList, "metric_date");

    var output = {};
    athleteList.forEach(function (athlete) {
      var athleteId = String(athlete && athlete.user_id || "").trim();
      if (!athleteId) {
        return;
      }

      var readiness = 55;
      var reasons = [];
      var hasActiveProgram = Number(activeCountByAthlete[athleteId] || 0) > 0;
      var nextEventDays = Object.prototype.hasOwnProperty.call(nextEventDaysByAthlete, athleteId)
        ? Number(nextEventDaysByAthlete[athleteId])
        : null;
      var latestLog = latestLogByAthlete[athleteId] || null;
      var latestStrava = latestStravaByAthlete[athleteId] || null;

      if (hasActiveProgram) {
        readiness += 10;
      } else {
        readiness -= 10;
      }

      var targetCalories = Number(targetsByAthlete[athleteId]);
      if (latestLog && latestLog.logged_on) {
        var logAge = getDaysUntilDateKey(latestLog.logged_on);
        var calories = Number(latestLog.calories);
        if (typeof logAge === "number" && logAge <= 0 && logAge >= -3 && Number.isFinite(calories) && Number.isFinite(targetCalories) && targetCalories > 0) {
          var pct = (calories / targetCalories) * 100;
          if (pct >= 80 && pct <= 115) {
            readiness += 12;
            reasons.push("nutrition aligned");
          } else if (pct >= 60 && pct <= 130) {
            readiness += 6;
            reasons.push("nutrition partially aligned");
          } else {
            readiness -= 6;
            reasons.push("nutrition off target");
          }
        } else {
          readiness -= 2;
          reasons.push("nutrition baseline incomplete");
        }
      } else {
        readiness -= 6;
        reasons.push("no recent nutrition logs");
      }

      var recoveryScore = Number(latestStrava && latestStrava.recovery_score);
      if (Number.isFinite(recoveryScore)) {
        readiness += Math.max(-20, Math.min(20, (recoveryScore - 50) * 0.4));
        reasons.push("recovery " + formatInteger(recoveryScore));
      } else {
        readiness -= 5;
        reasons.push("limited recovery data");
      }

      if (Number.isFinite(nextEventDays)) {
        if (nextEventDays <= 2) {
          readiness -= 12;
        } else if (nextEventDays <= 7) {
          readiness -= 7;
        } else if (nextEventDays <= 14) {
          readiness -= 3;
        }
      }

      readiness = Math.max(1, Math.min(99, Math.round(readiness)));
      output[athleteId] = {
        score: readiness,
        reasons: reasons.slice(0, 2)
      };
    });

    return output;
  }

  function pickLatestByUser(rows, dateField) {
    var source = Array.isArray(rows) ? rows : [];
    var field = String(dateField || "");
    var map = {};

    source.forEach(function (row) {
      var userId = String(row && row.user_id || "").trim();
      var dateKey = String(row && row[field] || "").trim();
      if (!userId || !dateKey) {
        return;
      }

      if (!Object.prototype.hasOwnProperty.call(map, userId) || dateKey > String(map[userId] && map[userId][field] || "")) {
        map[userId] = row;
      }
    });

    return map;
  }

  function getOpenFlags() {
    var activeAthletes = getActiveAthletes();
    var activeAthleteById = {};
    activeAthletes.forEach(function (athlete) {
      var athleteId = String(athlete && athlete.user_id || "").trim();
      if (athleteId) {
        activeAthleteById[athleteId] = true;
      }
    });

    var manualFlags = (state.coachFlags || []).filter(function (flag) {
      if (!flag || flag.source !== "manual") {
        return false;
      }

      var athleteId = String(flag.athlete_user_id || "").trim();
      if (!athleteId) {
        return true;
      }

      return !!activeAthleteById[athleteId];
    });

    return buildAutoFlags().concat(manualFlags);
  }

  function buildAutoFlags() {
    var autoFlags = [];
    var now = Date.now();
    var athleteById = {};
    var activeAthletes = getActiveAthletes();

    activeAthletes.forEach(function (athlete) {
      athleteById[String(athlete.user_id || "")] = athlete;
      var athleteName = String(athlete && (athlete.name || athlete.email) || "Athlete");

      if (!athlete.last_sign_in_at) {
        autoFlags.push({
          id: "auto_signin_" + String(athlete.user_id || athleteName),
          text: athleteName + " has never signed in.",
          severity: "high",
          source: "auto"
        });
      } else {
        var lastSeen = new Date(athlete.last_sign_in_at).getTime();
        if (lastSeen && now - lastSeen > 1000 * 60 * 60 * 24 * 45) {
          autoFlags.push({
            id: "auto_inactive_" + String(athlete.user_id || athleteName),
            text: athleteName + " has not signed in for 45+ days.",
            severity: "high",
            source: "auto"
          });
        }
      }
    });

    state.athleteGoalEvents.forEach(function (goalItem) {
      var status = String(goalItem.status || "active").toLowerCase();
      if (status === "completed" || status === "archived") {
        return;
      }

      if (!goalItem.target_date) {
        return;
      }

      var daysUntil = getDaysUntilDateKey(goalItem.target_date);
      if (typeof daysUntil !== "number" || daysUntil < 0 || daysUntil > 14) {
        return;
      }

      var athlete = athleteById[String(goalItem.user_id || "")];
      if (!athlete) {
        return;
      }
      var athleteName = athlete && (athlete.name || athlete.email) ? (athlete.name || athlete.email) : "Athlete";

      autoFlags.push({
        id: "auto_goal_due_" + String(goalItem.id || goalItem.user_id || athleteName),
        text: athleteName + " has a " + getGoalTypeLabel(goalItem.goal_type).toLowerCase() + " in " + (daysUntil === 0 ? "0 days" : daysUntil + " days") + ".",
        severity: daysUntil <= 3 ? "high" : "medium",
        source: "auto"
      });
    });

    return autoFlags;
  }

  function getActiveAthletes() {
    var athletes = Array.isArray(state.athletes) ? state.athletes : [];
    return athletes.filter(function (athlete) {
      return athlete && athlete.is_active !== false;
    });
  }

  function readCoachTodos() {
    try {
      var raw = window.localStorage.getItem(COACH_TODO_KEY);
      if (!raw) {
        return [];
      }
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writeCoachTodos(todos) {
    try {
      window.localStorage.setItem(COACH_TODO_KEY, JSON.stringify(Array.isArray(todos) ? todos : []));
    } catch (e) {
      setStatus("Could not save coach to-do list in this browser.", "error");
    }
  }

  function readDismissedAutomatedTodoKeys() {
    try {
      var raw = window.localStorage.getItem(COACH_AUTOMATED_TODO_DISMISSED_KEY);
      if (!raw) {
        return [];
      }
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.map(function (key) {
        return String(key || "").trim();
      }).filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  function writeDismissedAutomatedTodoKeys(keys) {
    try {
      window.localStorage.setItem(
        COACH_AUTOMATED_TODO_DISMISSED_KEY,
        JSON.stringify(Array.isArray(keys) ? keys : [])
      );
    } catch (e) {
      setStatus("Could not save automated to-do dismissals in this browser.", "error");
    }
  }

  function readCoachFlags() {
    try {
      var raw = window.localStorage.getItem(COACH_FLAGS_KEY);
      if (!raw) {
        return [];
      }
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map(function (flag) {
        return {
          id: String(flag && flag.id || ""),
          text: String(flag && flag.text || "").trim(),
          severity: String(flag && flag.severity || "medium").toLowerCase(),
          source: flag && flag.source === "auto" ? "auto" : "manual",
          athlete_user_id: flag && flag.athlete_user_id ? String(flag.athlete_user_id) : null,
          athlete_name: flag && flag.athlete_name ? String(flag.athlete_name) : null,
          created_at: String(flag && flag.created_at || "")
        };
      }).filter(function (flag) {
        return !!flag.id && !!flag.text;
      });
    } catch (e) {
      return [];
    }
  }

  function writeCoachFlags(flags) {
    try {
      window.localStorage.setItem(COACH_FLAGS_KEY, JSON.stringify(Array.isArray(flags) ? flags : []));
    } catch (e) {
      setStatus("Could not save coach flags in this browser.", "error");
    }
  }

  function parseDateOnly(value) {
    if (!value) {
      return null;
    }
    var date = new Date(String(value) + "T00:00:00");
    return isNaN(date.getTime()) ? null : date;
  }

  function formatDateKey(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function getDaysUntilDateKey(dateKey) {
    if (!dateKey) {
      return null;
    }

    var target = parseDateOnly(String(dateKey));
    if (!target) {
      return null;
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  function getGoalTypeLabel(goalType) {
    var value = String(goalType || "goal").toLowerCase();
    if (value === "specific_goal") {
      return "Specific Goal";
    }
    if (value === "race") {
      return "Race";
    }
    if (value === "event") {
      return "Event";
    }
    if (value === "trip") {
      return "Trip";
    }
    if (value === "milestone") {
      return "Milestone";
    }
    return "Goal";
  }

  function hasCompletedMembershipPaymentFromOnboardingRow(row) {
    if (!row || row.is_founding_member !== true) {
      return false;
    }

    var stage = String(row.stage || "").trim();
    return !!(
      row.payment_completed_at ||
      stage === "welcome_pending_intakes" ||
      stage === "intakes_completed_assessment_pending" ||
      stage === "assessment_in_progress" ||
      stage === "assessment_published_pending_review" ||
      stage === "review_scheduled" ||
      stage === "active_training"
    );
  }

  function hasCompletedMembershipPaymentFromSubscriptionRow(row) {
    if (!row || !row.user_id) {
      return false;
    }

    var status = String(row.status || "").toLowerCase();
    if (
      status === "active" ||
      status === "trialing" ||
      status === "paid" ||
      status === "completed" ||
      status === "succeeded"
    ) {
      return true;
    }

    var lastEventType = String(row.last_event_type || "").toLowerCase();
    return (
      lastEventType === "invoice.payment_succeeded" ||
      lastEventType === "checkout.session.completed" ||
      lastEventType === "checkout.session.async_payment_succeeded"
    );
  }

  function isLikelyIndividualizedProgramName(programName) {
    var name = String(programName || "").toLowerCase();
    return (
      name.indexOf("custom") > -1 ||
      name.indexOf("individualized") > -1 ||
      name.indexOf("1:1") > -1 ||
      name.indexOf("1-1") > -1
    );
  }

  function getAthleteTierCounts() {
    var activeAthletes = (state.athletes || []).filter(function (athlete) {
      return athlete && athlete.is_active !== false;
    });

    var onboardingByAthlete = {};
    (state.foundingOnboardingRows || []).forEach(function (row) {
      var athleteId = String(row && row.athlete_user_id || "").trim();
      if (!athleteId) {
        return;
      }

      var existing = onboardingByAthlete[athleteId];
      var rowTime = new Date(String(row && row.updated_at || row && row.created_at || 0)).getTime();
      var existingTime = existing
        ? new Date(String(existing.updated_at || existing.created_at || 0)).getTime()
        : -Infinity;

      if (!existing || rowTime >= existingTime) {
        onboardingByAthlete[athleteId] = row;
      }
    });

    var subscriptionByAthlete = {};
    (state.foundingSubscriptionRows || []).forEach(function (row) {
      var athleteId = String(row && row.user_id || "").trim();
      if (!athleteId) {
        return;
      }

      var existing = subscriptionByAthlete[athleteId];
      var rowTime = new Date(String(row && row.updated_at || row && row.last_event_created_at || 0)).getTime();
      var existingTime = existing
        ? new Date(String(existing.updated_at || existing.last_event_created_at || 0)).getTime()
        : -Infinity;

      if (!existing || rowTime >= existingTime) {
        subscriptionByAthlete[athleteId] = row;
      }
    });

    var activeProgramsByAthlete = {};
    var individualizedProgramsByAthlete = {};
    (state.activePrograms || []).forEach(function (row) {
      var athleteId = String(row && row.user_id || "").trim();
      if (!athleteId || row.is_active === false) {
        return;
      }

      activeProgramsByAthlete[athleteId] = true;
      if (isLikelyIndividualizedProgramName(row.program_name)) {
        individualizedProgramsByAthlete[athleteId] = true;
      }
    });

    return activeAthletes.reduce(function (counts, athlete) {
      var athleteId = String(athlete && athlete.user_id || "").trim();
      if (!athleteId) {
        return counts;
      }

      var hasIndividualizedProgramming = !!individualizedProgramsByAthlete[athleteId];
      var hasActiveProgram = !!activeProgramsByAthlete[athleteId];
      var hasCompletedMembership =
        hasCompletedMembershipPaymentFromOnboardingRow(onboardingByAthlete[athleteId]) ||
        hasCompletedMembershipPaymentFromSubscriptionRow(subscriptionByAthlete[athleteId]);

      if (hasIndividualizedProgramming) {
        counts.individualizedProgramming += 1;
      } else if (hasActiveProgram) {
        counts.activeProgram += 1;
      } else if (hasCompletedMembership) {
        counts.activeMembership += 1;
      } else {
        counts.athleteAccount += 1;
      }

      return counts;
    }, {
      activeMembership: 0,
      individualizedProgramming: 0,
      activeProgram: 0,
      athleteAccount: 0
    });
  }

  function updateStats() {
    var athleteAccountEl = document.querySelector("[data-stat-athlete-account]");
    var totalAthletesEl = document.querySelector("[data-stat-total-athletes]");
    var activeMembershipEl = document.querySelector("[data-stat-active-membership]");
    var individualizedProgrammingEl = document.querySelector("[data-stat-individualized-programming]");
    var activeProgramEl = document.querySelector("[data-stat-active-program-tier]");
    var openFlagsEl = document.querySelector("[data-stat-open-flags]");
    var tierCounts = getAthleteTierCounts();

    if (athleteAccountEl) {
      athleteAccountEl.textContent = String(tierCounts.athleteAccount);
    }

    if (totalAthletesEl) {
      totalAthletesEl.textContent = String((state.athletes || []).length);
    }

    if (activeMembershipEl) {
      activeMembershipEl.textContent = String(tierCounts.activeMembership);
    }

    if (individualizedProgrammingEl) {
      individualizedProgrammingEl.textContent = String(tierCounts.individualizedProgramming);
    }

    if (activeProgramEl) {
      activeProgramEl.textContent = String(tierCounts.activeProgram);
    }

    if (openFlagsEl) {
      openFlagsEl.textContent = String(getOpenFlags().length);
    }
  }

  function getActiveAthleteCount() {
    return state.athletes.filter(function (athlete) {
      return athlete && athlete.is_active !== false;
    }).length;
  }

  function getInactiveAthleteCount() {
    return state.athletes.filter(function (athlete) {
      return athlete && athlete.is_active === false;
    }).length;
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

  function buildMetricHistoryMap(metrics) {
    var map = {};

    (Array.isArray(metrics) ? metrics : []).forEach(function (metric) {
      var name = String(metric && metric.metric_name || "").trim();
      if (!name) {
        return;
      }

      if (!map[name]) {
        map[name] = [];
      }

      map[name].push(metric);
    });

    Object.keys(map).forEach(function (name) {
      map[name].sort(function (left, right) {
        return new Date(right.updated_at || right.created_at || 0).getTime() - new Date(left.updated_at || left.created_at || 0).getTime();
      });
    });

    return map;
  }

  function formatMetricEntryValue(metric) {
    var value = String(metric && metric.metric_value || "").trim();
    var unit = String(metric && metric.metric_unit || "").trim();

    if (!value) {
      return "Not recorded";
    }

    return unit ? value + " " + unit : value;
  }

  function formatMetricDelta(latest, previous) {
    if (!latest || !previous) {
      return "First data point";
    }

    var latestValue = parseFloat(latest.metric_value);
    var previousValue = parseFloat(previous.metric_value);
    if (!Number.isFinite(latestValue) || !Number.isFinite(previousValue)) {
      return "Compare manually";
    }

    var delta = latestValue - previousValue;
    if (delta === 0) {
      return "No change";
    }

    var prefix = delta > 0 ? "+" : "";
    var unit = String(latest.metric_unit || previous.metric_unit || "").trim();
    return prefix + formatDecimal(delta, Math.abs(delta) < 10 ? 1 : 0) + (unit ? " " + unit : "");
  }

  function sumNumeric(rows, field) {
    return (Array.isArray(rows) ? rows : []).reduce(function (sum, row) {
      var value = Number(row && row[field]);
      return Number.isFinite(value) ? sum + value : sum;
    }, 0);
  }

  function findLatestDefined(rows, field) {
    var match = (Array.isArray(rows) ? rows : []).find(function (row) {
      return row && row[field] != null;
    });
    return match ? match[field] : null;
  }

  function formatInteger(value) {
    var numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return "—";
    }
    return Math.round(numeric).toString();
  }

  function formatDecimal(value, digits) {
    var numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return "—";
    }
    return numeric.toFixed(typeof digits === "number" ? digits : 1);
  }

  function formatNullableValue(value, suffix) {
    var numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return "—";
    }
    return formatInteger(numeric) + String(suffix || "");
  }

  function formatDate(dateString) {
    try {
      var date = new Date(dateString);
      if (Number.isNaN(date.getTime())) {
        return dateString || "N/A";
      }
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
    if (text === null || typeof text === "undefined") {
      return "";
    }
    var value = String(text);
    var map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return value.replace(/[&<>"']/g, function (m) {
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
