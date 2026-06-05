(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";

  var state = {
    exercises: [],
    day: "w1d1",
    storagePrefix: "nomadic_training_program_demo_",
    isTemplateBuilder: false,
    templateId: null,
    templateName: "",
    client: null,
    assignedTemplateId: null,
    assignedProgramInstanceId: null,
    assignedTemplateDays: null,
    legacyStoragePrefix: null,
    athleteName: "",
    isAthleteLockedView: false,
    isProgramReadOnly: false,
    coachUserId: null,
    targetAthleteId: null,
    structure: {
      weeks: 1,
      workoutsPerWeek: 3
    },
    templateFocus: "strength",
    savedWorkoutBlocks: [],
    exerciseLibrary: [],
    daySessionTypes: {},
    customDayNames: {},
    customDayNameMode: "legacy-suffix",
    workoutBlockFilterTag: "all",
    editingWorkoutBlockId: null,
    draggingWorkoutBlockId: null,
    editingExerciseIdx: null,
    athleteMobileOpenByDay: {},
    lastViewportWidth: null,
    lastIsAthleteMobileUi: false
  };

  var TEMPLATE_DRAFT_PREFIX = "nomadic_training_program_template_builder_draft_";
  var TEMPLATE_MARKER = "__NOMADIC_TEMPLATE__";
  var WORKOUT_BLOCK_LIBRARY_KEY = "nomadic_template_workout_blocks_v1";
  var EXERCISE_LIBRARY_KEY = "nomadic_exercise_library_v1";
  var EXERCISE_LIBRARY_TABLE = "exercise_library";

  var dayLabels = {
    "w1d1": "Lower Body Power",
    "w1d2": "Upper Pull + Core",
    "w1d3": "Conditioning"
  };

  var defaultSections = [
    "Warm Up",
    "A Block",
    "B Block",
    "C Block",
    "Cool Down"
  ];

  var QUICK_EXERCISE_LIBRARY = {
    "warmup-flow": {
      name: "Warm-Up Flow",
      section: "Warm Up",
      mode: "time",
      sets: [{ reps: "8 min", weight: "BW", rpe: "", rest: "", notes: "Mobility + activation", done: false }]
    },
    "main-strength": {
      name: "Main Strength Lift",
      section: "A Block",
      mode: "reps",
      sets: [
        { reps: "5", weight: "", rpe: "7", rest: "120s", notes: "", done: false },
        { reps: "5", weight: "", rpe: "8", rest: "120s", notes: "", done: false },
        { reps: "5", weight: "", rpe: "8", rest: "120s", notes: "", done: false }
      ]
    },
    "power-plyo": {
      name: "Power / Plyometric Series",
      section: "B Block",
      mode: "reps",
      sets: [{ reps: "4 x 3", weight: "BW", rpe: "Fast", rest: "90s", notes: "Quality contacts", done: false }]
    },
    "endurance-intervals": {
      name: "Endurance Intervals",
      section: "A Block",
      mode: "endurance",
      sets: [{ reps: "5 x 3:00", weight: "", rpe: "Z4", rest: "90s", notes: "Steady pacing", done: false }]
    },
    "grip-climb": {
      name: "Grip / Climbing Strength",
      section: "B Block",
      mode: "time",
      sets: [{ reps: "6 x 10s", weight: "20mm edge", rpe: "", rest: "120s", notes: "Submax effort", done: false }]
    },
    "cooldown-reset": {
      name: "Cool Down Reset",
      section: "Cool Down",
      mode: "time",
      sets: [{ reps: "8 min", weight: "", rpe: "", rest: "", notes: "Breathing + mobility", done: false }]
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    initialize();
  });

  function initialize() {
    setTemplateBuilderChromeVisible(false);
    loadSavedWorkoutBlocks();
    configureBuilderMode();
    configureAssignedTemplateMode();
    setProgramTitleFromQuery();

    var daySelect = document.querySelector("[data-workout-day]");
    var addExerciseBtn = document.querySelector("[data-add-exercise]");
    var printBtn = document.querySelector("[data-print-workout]");
    var fullPlanPrintBtn = document.querySelector("[data-print-full-plan]");
    var saveBtn = document.querySelector("[data-save-workout]");
    var clearBtn = document.querySelector("[data-clear-workout]");
    var dayNameInput = document.querySelector("[data-template-day-name]");
    var dayRenameBtn = document.querySelector("[data-template-day-rename]");
    var dayCopyForwardBtn = document.querySelector("[data-template-day-copy-forward]");

    if (!daySelect) {
      return;
    }

    refreshWorkoutDaySelect(daySelect);
    var preferredDay = getPreferredDayFromQuery();
    if (preferredDay && daySelect.querySelector('option[value="' + preferredDay + '"]')) {
      daySelect.value = preferredDay;
    }
    state.day = daySelect.value || getAllSlotKeys()[0] || "w1d1";

    if (state.isTemplateBuilder) {
      ensureDaySessionTypesForStructure();
    }

    daySelect.addEventListener("change", function () {
      if (state.isTemplateBuilder) {
        saveExercisesForDay(true);
      }

      state.day = daySelect.value;
      loadExercisesForDay();
      renderRows();
      updateDayInfo();
      refreshTemplateDayTools();
      setStatus("");
    });

    if (dayRenameBtn) {
      dayRenameBtn.addEventListener("click", function () {
        renameCurrentDay(dayNameInput ? dayNameInput.value : "");
      });
    }

    if (dayCopyForwardBtn) {
      dayCopyForwardBtn.addEventListener("click", function () {
        copyCurrentDayForward();
      });
    }

    if (dayNameInput) {
      dayNameInput.addEventListener("keydown", function (event) {
        if (event && event.key === "Enter") {
          event.preventDefault();
          renameCurrentDay(dayNameInput.value);
        }
      });
    }

    setupExerciseEditorModal();
    loadExerciseLibraryForEditor();
    bindTemplateWorkspaceEvents();
    bindTemplateKeyboardShortcuts();

    if (addExerciseBtn) {
      addExerciseBtn.addEventListener("click", function () {
        openExerciseEditor(null);
      });
    }

    if (printBtn) {
      printBtn.addEventListener("click", function () {
        if (!state.isTemplateBuilder) {
          saveExercisesForDay(true);
        }
        openWorkoutPrintPreview();
      });
    }

    if (fullPlanPrintBtn) {
      fullPlanPrintBtn.addEventListener("click", function () {
        if (!state.isTemplateBuilder) {
          saveExercisesForDay(true);
        }
        openFullPlanPrintPreview();
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        if (state.isTemplateBuilder) {
          saveTemplateProgram();
          return;
        }

        saveExercisesForDay();
        syncScheduledSessionStatusForCurrentDay();
        updateStats();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        var confirmMessage = state.isTemplateBuilder
          ? "Clear all exercises for this template day?"
          : "Clear all logged exercises for this workout day?";
        if (!confirm(confirmMessage)) {
          return;
        }

        state.exercises = state.isTemplateBuilder ? [] : defaultExercisesForDay(state.day);
        saveExercisesForDay();
        renderRows();
        setStatus(state.isTemplateBuilder ? "Template day cleared." : "Workout log cleared for this day.", "info");
        updateStats();
      });
    }

    loadExercisesForDay();
    renderRows();
    updateDayInfo();
    refreshTemplateDayTools();
    updateStats();
  }

  function configureBuilderMode() {
    try {
      var params = new URLSearchParams(window.location.search);
      var wantsTemplateBuilder = params.get("builder") === "1";
      state.templateId = params.get("templateId") || null;
      var builderAthleteId = String(params.get("athleteId") || "").trim();
      state.targetAthleteId = isUuid(builderAthleteId) ? builderAthleteId : null;

      if (state.templateId && !isUuid(state.templateId)) {
        // Legacy local-storage template IDs (e.g. tpl_123) are not valid Supabase UUIDs.
        state.templateId = null;
      }

      if (!wantsTemplateBuilder) {
        return;
      }

      if (!state.client) {
        state.client = createSupabaseClient();
      }

      if (!state.client) {
        lockBuilderToReadOnly();
        setStatus("Template editing is coach-only and requires an authenticated session.", "info");
        return;
      }

      resolveTemplateBuilderCoachAccess().then(function (result) {
        var user = result && result.user ? result.user : null;
        if (!result || !result.allowed || !user) {
          state.isTemplateBuilder = false;
          lockBuilderToReadOnly();
          refreshTemplateDayTools();
          setStatus("Template editing tools are available to coach accounts only.", "info");
          return;
        }

        try {
          activateTemplateBuilder(user);
        } catch (error) {
          state.isTemplateBuilder = false;
          state.coachUserId = null;
          lockBuilderToReadOnly();
          refreshTemplateDayTools();
          setStatus("Template editor could not be initialized.", "error");
          console.error("Template builder initialization failed", error);
        }
      }).catch(function () {
        state.isTemplateBuilder = false;
        state.coachUserId = null;
        lockBuilderToReadOnly();
        refreshTemplateDayTools();
        setStatus("Could not verify coach access. Template editing was disabled.", "info");
      });
    } catch (e) {
      // Ignore malformed query parameters.
    }
  }

  function resolveTemplateBuilderCoachAccess() {
    if (!state.client || !state.client.auth) {
      return Promise.resolve({ allowed: false, user: null });
    }

    return resolveTemplateBuilderUser().then(function (user) {
      if (!user) {
        return { allowed: false, user: null };
      }

      return resolveCoachAdminAccessForUser(user).then(function (allowed) {
        return {
          allowed: !!allowed,
          user: user
        };
      });
    });
  }

  function resolveTemplateBuilderUser() {
    return state.client.auth.getSession()
      .then(function (result) {
        var session = result && result.data && result.data.session;
        if (session && session.user) {
          return session.user;
        }
        return resolveTemplateBuilderUserFallback();
      })
      .catch(function () {
        return resolveTemplateBuilderUserFallback();
      });
  }

  function resolveTemplateBuilderUserFallback() {
    if (!state.client || !state.client.auth || typeof state.client.auth.getUser !== "function") {
      return Promise.resolve(null);
    }

    return state.client.auth.getUser()
      .then(function (result) {
        return result && result.data && result.data.user ? result.data.user : null;
      })
      .catch(function () {
        return null;
      });
  }

  function resolveCoachAdminAccessForUser(user) {
    var email = String(user && user.email || "").toLowerCase();
    if (email && email === ADMIN_EMAIL) {
      return Promise.resolve(true);
    }

    if (!state.client || !state.client.rpc) {
      return Promise.resolve(false);
    }

    return state.client.rpc("is_nomadic_admin")
      .then(function (result) {
        if (result && result.error) {
          return false;
        }
        return !!(result && result.data === true);
      })
      .catch(function () {
        return false;
      });
  }

  function activateTemplateBuilder(user) {
    state.isTemplateBuilder = true;
    state.coachUserId = user && user.id ? String(user.id) : null;
    state.storagePrefix = TEMPLATE_DRAFT_PREFIX;
    clearBuilderDrafts();

    if (state.templateId) {
      hydrateDraftFromTemplate(state.templateId);
    }

    applyBuilderModeUi();
    loadSavedWorkoutBlocksFromCloud();
    ensureDaySessionTypesForStructure();
    refreshTemplateDayTools();
    updateDayInfo();
  }

  function configureAssignedTemplateMode() {
    if (state.isTemplateBuilder) {
      return;
    }

    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get("builder") === "1") {
        return;
      }
      state.isProgramReadOnly = params.get("view") === "1";
      var templateId = params.get("templateId");
      if (!templateId) {
        return;
      }

      var assignmentId = String(params.get("assignmentId") || "").trim();
      state.assignedTemplateId = templateId;
      state.assignedProgramInstanceId = assignmentId || null;
      state.legacyStoragePrefix = "nomadic_training_program_log_" + String(templateId) + "_";
      state.storagePrefix = state.assignedProgramInstanceId
        ? "nomadic_training_program_assignment_log_" + state.assignedProgramInstanceId + "_"
        : state.legacyStoragePrefix;
      state.isAthleteLockedView = true;
      if (!state.client) {
        state.client = createSupabaseClient();
      }

      applyAthleteLockedUi();
      hydrateAssignedTemplate(templateId);
    } catch (e) {
      // Ignore malformed query parameters.
    }
  }

  function getPreferredDayFromQuery() {
    try {
      var params = new URLSearchParams(window.location.search || "");
      var day = String(params.get("day") || "").trim();
      return /^w\d+d\d+$/i.test(day) ? day : "";
    } catch (e) {
      return "";
    }
  }

  function applyAthleteLockedUi() {
    var addExerciseBtn = document.querySelector("[data-add-exercise]");
    var printBtn = document.querySelector("[data-print-workout]");
    var fullPlanPrintBtn = document.querySelector("[data-print-full-plan]");
    var clearBtn = document.querySelector("[data-clear-workout]");
    var saveBtn = document.querySelector("[data-save-workout]");
    var subtitle = document.querySelector(".program-demo-subtitle");
    var dayTools = document.querySelector("[data-template-day-tools]");
    var dayTypeControls = document.querySelector("[data-template-day-type-controls]");
    var templateWorkspace = document.querySelector("[data-template-workspace]");
    var athleteScheduleRow = document.querySelector("[data-template-athlete-schedule]");
    var athleteScheduleName = document.querySelector("[data-template-athlete-name]");
    var athleteScheduleStartInput = document.querySelector("[data-template-schedule-start-date]");
    var athleteScheduleBtn = document.querySelector("[data-template-schedule-athlete]");

    if (document.body) {
      document.body.classList.add("athlete-locked-view");
    }

    if (addExerciseBtn) {
      addExerciseBtn.style.display = "none";
    }

    if (printBtn) {
      printBtn.style.display = "inline-flex";
    }

    if (fullPlanPrintBtn) {
      fullPlanPrintBtn.style.display = "inline-flex";
    }

    if (clearBtn) {
      clearBtn.style.display = "none";
    }

    if (saveBtn) {
      if (state.isProgramReadOnly) {
        saveBtn.style.display = "none";
      } else {
        saveBtn.style.display = "inline-flex";
        saveBtn.innerHTML = "<span>💾</span> Save Workout Log";
      }
    }

    if (subtitle) {
      subtitle.textContent = state.isProgramReadOnly
        ? "View this past program and your logged workout history (read-only)."
        : "Log reps performed, weights used, notes, and completed sets.";
    }

    if (dayTools) {
      dayTools.hidden = true;
      dayTools.style.display = "none";
    }

    if (dayTypeControls) {
      dayTypeControls.hidden = true;
      dayTypeControls.style.display = "none";
    }

    if (templateWorkspace) {
      templateWorkspace.hidden = true;
    }

    setTemplateBuilderChromeVisible(false);
  }

  function applyBuilderModeUi() {
    var panel = document.querySelector("[data-template-builder-panel]");
    var nameInput = document.querySelector("[data-template-name]");
    var weeksInput = document.querySelector("[data-template-weeks]");
    var workoutsInput = document.querySelector("[data-template-workouts-per-week]");
    var focusInput = document.querySelector("[data-template-focus]");
    var applyStructureBtn = document.querySelector("[data-template-structure-apply]");
    var seedSkeletonBtn = document.querySelector("[data-template-seed-skeleton]");
    var dayTypeControls = document.querySelector("[data-template-day-type-controls]");
    var dayTools = document.querySelector("[data-template-day-tools]");
    var addExerciseBtn = document.querySelector("[data-add-exercise]");
    var printBtn = document.querySelector("[data-print-workout]");
    var fullPlanPrintBtn = document.querySelector("[data-print-full-plan]");
    var saveBtn = document.querySelector("[data-save-workout]");
    var clearBtn = document.querySelector("[data-clear-workout]");
    var backLink = document.querySelector("[data-program-back-link]");
    var subtitle = document.querySelector(".program-demo-subtitle");
    var kicker = document.querySelector(".program-demo-kicker");
    var templateWorkspace = document.querySelector("[data-template-workspace]");
    var athleteScheduleRow = document.querySelector("[data-template-athlete-schedule]");
    var athleteScheduleName = document.querySelector("[data-template-athlete-name]");
    var athleteScheduleStartInput = document.querySelector("[data-template-schedule-start-date]");
    var athleteScheduleBtn = document.querySelector("[data-template-schedule-athlete]");

    state.isAthleteLockedView = false;
    if (document.body) {
      document.body.classList.remove("athlete-locked-view");
    }

    if (panel) {
      panel.hidden = false;
    }

    if (templateWorkspace) {
      templateWorkspace.hidden = false;
    }

    setTemplateBuilderChromeVisible(true);

    if (dayTypeControls) {
      dayTypeControls.hidden = false;
    }

    if (dayTools) {
      dayTools.hidden = false;
    }

    if (addExerciseBtn) {
      addExerciseBtn.style.display = "inline-flex";
    }

    if (printBtn) {
      printBtn.style.display = "none";
    }

    if (fullPlanPrintBtn) {
      fullPlanPrintBtn.style.display = "none";
    }

    if (saveBtn) {
      saveBtn.style.display = "inline-flex";
      saveBtn.innerHTML = "<span>💾</span> Save Template";
    }

    if (clearBtn) {
      clearBtn.style.display = "inline-flex";
      clearBtn.innerHTML = "<span>🧹</span> Clear Day";
    }

    if (backLink) {
      backLink.href = "admin.html";
      backLink.textContent = "← Back to Coaching Dashboard";
    }

    if (subtitle) {
      subtitle.textContent = "Build a reusable program template with sections, supersets, and exercise modes.";
    }

    if (kicker) {
      kicker.textContent = "Coaching Template";
    }

    renderSavedWorkoutBlocks();

    if (nameInput) {
      nameInput.value = state.templateName || "";
      nameInput.addEventListener("input", function () {
        state.templateName = String(nameInput.value || "").trim();
      });
    }

    if (weeksInput) {
      weeksInput.value = String(state.structure.weeks);
    }

    if (workoutsInput) {
      workoutsInput.value = String(state.structure.workoutsPerWeek);
    }

    if (focusInput) {
      focusInput.value = state.templateFocus || "strength";
      focusInput.addEventListener("change", function () {
        var nextFocus = String(focusInput.value || "strength").toLowerCase();
        state.templateFocus = normalizeTemplateFocus(nextFocus);
        ensureDaySessionTypesForStructure();
        updateDayInfo();
      });
    }

    if (applyStructureBtn) {
      applyStructureBtn.addEventListener("click", function () {
        var nextWeeks = parseInt((weeksInput && weeksInput.value) || "1", 10);
        var nextWorkouts = parseInt((workoutsInput && workoutsInput.value) || "3", 10);
        updateTemplateStructure(nextWeeks, nextWorkouts);
      });
    }

    if (seedSkeletonBtn) {
      seedSkeletonBtn.addEventListener("click", function () {
        seedTemplateSkeleton();
      });
    }

    var dayTypeButtons = document.querySelectorAll("[data-template-day-type]");
    dayTypeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var nextType = button.getAttribute("data-template-day-type");
        applyDayTypeToCurrentDay(nextType);
      });
    });

    if (athleteScheduleRow) {
      var canScheduleAthlete = !!state.targetAthleteId;
      athleteScheduleRow.hidden = !canScheduleAthlete;
      if (canScheduleAthlete) {
        if (athleteScheduleName) {
          athleteScheduleName.textContent = state.athleteName || "this athlete";
        }
        if (athleteScheduleStartInput && !athleteScheduleStartInput.value) {
          athleteScheduleStartInput.value = formatDateInputValue(new Date());
        }
      }
    }

    if (athleteScheduleBtn) {
      athleteScheduleBtn.addEventListener("click", function () {
        var startDate = athleteScheduleStartInput ? athleteScheduleStartInput.value : "";
        scheduleTemplateToAthleteCalendar(startDate);
      });
    }
  }

  function setProgramTitleFromQuery() {
    var heading = document.querySelector("[data-program-title]");
    if (!heading) {
      return;
    }

    try {
      var params = new URLSearchParams(window.location.search);
      var programName = params.get("program");
      var athleteName = String(params.get("athleteName") || "").trim();
      if (programName) {
        heading.textContent = programName;
      } else if (state.isTemplateBuilder) {
        heading.textContent = state.templateName || "New Training Program Template";
      }

      if (athleteName) {
        state.athleteName = athleteName;
      }
    } catch (e) {
      // Ignore malformed query parameters.
    }

      if (typeof window !== "undefined") {
        state.lastViewportWidth = window.innerWidth || null;
        state.lastIsAthleteMobileUi = isAthleteMobileUi();

        window.addEventListener("resize", function () {
          if (state.isAthleteLockedView) {
            var nextWidth = window.innerWidth || 0;
            var nextIsMobileUi = isAthleteMobileUi();
            var widthChanged =
              state.lastViewportWidth === null ||
              Math.abs(nextWidth - state.lastViewportWidth) >= 24;
            var modeChanged = nextIsMobileUi !== state.lastIsAthleteMobileUi;

            if (widthChanged || modeChanged) {
              state.lastViewportWidth = nextWidth;
              state.lastIsAthleteMobileUi = nextIsMobileUi;
              renderRows();
            }
          }
        });
      }
  }

  function updateDayInfo() {
    var dayInfo = document.querySelector("[data-day-info]");
    if (!dayInfo) {
      return;
    }

    var label = labelForSlot(state.day);
    var dayType = getDayTypeForSlot(state.day);
    var dayTypeLabel = dayType ? " • " + capitalize(dayType) + " Day" : "";
    dayInfo.textContent = "📅 " + label + dayTypeLabel;
  }

  function refreshTemplateDayTools() {
    var dayTools = document.querySelector("[data-template-day-tools]");
    var dayNameInput = document.querySelector("[data-template-day-name]");
    if (!dayTools || !dayNameInput) {
      return;
    }

    if (!state.isTemplateBuilder) {
      dayTools.hidden = true;
      return;
    }

    dayTools.hidden = false;
    dayNameInput.value = String(labelForSlot(state.day) || "");
  }

  function renameCurrentDay(nextName) {
    if (!state.isTemplateBuilder || !state.day) {
      return;
    }

    var cleaned = String(nextName || "").trim();
    if (!state.customDayNames) {
      state.customDayNames = {};
    }

    if (!cleaned) {
      delete state.customDayNames[state.day];
      setStatus("Day name reset to default label.", "info");
    } else {
      state.customDayNameMode = "full-label";
      state.customDayNames[state.day] = cleaned;
      setStatus("Renamed day to '" + cleaned + "'.", "success");
    }

    var daySelect = document.querySelector("[data-workout-day]");
    if (daySelect) {
      refreshWorkoutDaySelect(daySelect);
      daySelect.value = state.day;
    }

    updateDayInfo();
    refreshTemplateDayTools();
  }

  function copyCurrentDayForward() {
    if (!state.isTemplateBuilder || !state.day) {
      return;
    }

    saveExercisesForDay(true);

    var slotKeys = getAllSlotKeys();
    var currentIndex = slotKeys.indexOf(state.day);
    if (currentIndex === -1 || currentIndex >= slotKeys.length - 1) {
      setStatus("No later workout slots available to copy into.", "info");
      return;
    }

    var sourceExercises = cloneExercises(state.exercises);
    var copied = 0;

    for (var i = currentIndex + 1; i < slotKeys.length; i++) {
      var slotKey = slotKeys[i];
      writeToStorage(state.storagePrefix + slotKey, {
        exercises: cloneExercises(sourceExercises),
        saved_at: new Date().toISOString()
      });

      if (state.daySessionTypes && state.daySessionTypes[state.day]) {
        state.daySessionTypes[slotKey] = state.daySessionTypes[state.day];
      }

      if (state.customDayNames && state.customDayNames[state.day]) {
        state.customDayNames[slotKey] = state.customDayNames[state.day];
      }

      copied++;
    }

    var daySelect = document.querySelector("[data-workout-day]");
    if (daySelect) {
      refreshWorkoutDaySelect(daySelect);
      daySelect.value = state.day;
    }

    setStatus("Copied this day forward to " + copied + " future slot(s).", "success");
  }

  function bindTemplateWorkspaceEvents() {
    var workspace = document.querySelector("[data-template-workspace]");
    if (!workspace) {
      return;
    }

    var blockTitleInput = document.querySelector("[data-template-block-title]");
    var blockFilterInput = document.querySelector("[data-template-block-filter]");
    if (blockTitleInput) {
      blockTitleInput.addEventListener("keydown", function (event) {
        if (!event || event.key !== "Enter") {
          return;
        }
        event.preventDefault();
        saveWorkoutBlockFromCurrentDay();
      });
    }

    if (blockFilterInput) {
      blockFilterInput.addEventListener("change", function () {
        state.workoutBlockFilterTag = String(blockFilterInput.value || "all").trim() || "all";
        renderSavedWorkoutBlocks();
      });
    }

    workspace.addEventListener("click", function (event) {
      var quickBtn = event.target && event.target.closest("[data-template-quick-add]");
      if (quickBtn) {
        addQuickExerciseByKey(String(quickBtn.getAttribute("data-template-quick-add") || ""));
        return;
      }

      var quickSavedBtn = event.target && event.target.closest("[data-template-block-quick-add-selected]");
      if (quickSavedBtn) {
        addSelectedSavedWorkoutBlockFromPicker();
        return;
      }

      var blockSaveBtn = event.target && event.target.closest("[data-template-block-save]");
      if (blockSaveBtn) {
        saveWorkoutBlockFromCurrentDay();
        return;
      }

      var blockAddBtn = event.target && event.target.closest("[data-template-block-add]");
      if (blockAddBtn) {
        addSavedWorkoutBlockById(String(blockAddBtn.getAttribute("data-template-block-add") || ""));
        return;
      }

      var blockEditBtn = event.target && event.target.closest("[data-template-block-edit]");
      if (blockEditBtn) {
        startEditingSavedWorkoutBlockById(String(blockEditBtn.getAttribute("data-template-block-edit") || ""));
        return;
      }

      var blockDeleteBtn = event.target && event.target.closest("[data-template-block-delete]");
      if (blockDeleteBtn) {
        removeSavedWorkoutBlockById(String(blockDeleteBtn.getAttribute("data-template-block-delete") || ""));
        return;
      }

      var bulkBtn = event.target && event.target.closest("[data-template-bulk-action]");
      if (!bulkBtn) {
        return;
      }

      runTemplateBulkAction(String(bulkBtn.getAttribute("data-template-bulk-action") || ""));
    });

    workspace.addEventListener("dragstart", function (event) {
      var item = event.target && event.target.closest("[data-template-block-item]");
      if (!item || !event.dataTransfer) {
        return;
      }

      if (String(state.workoutBlockFilterTag || "all") !== "all") {
        event.preventDefault();
        setStatus("Clear tag filter before reordering saved blocks.", "info");
        return;
      }

      var blockId = String(item.getAttribute("data-template-block-item") || "").trim();
      if (!blockId) {
        return;
      }

      state.draggingWorkoutBlockId = blockId;
      item.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", blockId);
    });

    workspace.addEventListener("dragover", function (event) {
      var item = event.target && event.target.closest("[data-template-block-item]");
      if (!item) {
        return;
      }

      event.preventDefault();
      if (state.draggingWorkoutBlockId) {
        item.classList.add("is-drag-over");
      }
    });

    workspace.addEventListener("dragleave", function (event) {
      var item = event.target && event.target.closest("[data-template-block-item]");
      if (!item) {
        return;
      }
      item.classList.remove("is-drag-over");
    });

    workspace.addEventListener("drop", function (event) {
      var item = event.target && event.target.closest("[data-template-block-item]");
      if (!item) {
        return;
      }

      event.preventDefault();
      var targetId = String(item.getAttribute("data-template-block-item") || "").trim();
      var draggedId = String((event.dataTransfer && event.dataTransfer.getData("text/plain")) || state.draggingWorkoutBlockId || "").trim();

      clearSavedWorkoutBlockDragState();

      if (!draggedId || !targetId || draggedId === targetId) {
        return;
      }

      reorderSavedWorkoutBlocks(draggedId, targetId);
    });

    workspace.addEventListener("dragend", function () {
      clearSavedWorkoutBlockDragState();
    });
  }

  function bindTemplateKeyboardShortcuts() {
    document.addEventListener("keydown", function (event) {
      if (!state.isTemplateBuilder || !event) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      var key = String(event.key || "").toLowerCase();
      if (!key) {
        return;
      }

      if (key === "a") {
        event.preventDefault();
        openExerciseEditor(null);
        return;
      }

      if (key === "s") {
        event.preventDefault();
        saveTemplateProgram();
        return;
      }

      if (key === "d") {
        event.preventDefault();
        copyCurrentDayToNextSlot();
        return;
      }

      if (key === "n") {
        event.preventDefault();
        moveToAdjacentTemplateDay(1);
        return;
      }

      if (key === "p") {
        event.preventDefault();
        moveToAdjacentTemplateDay(-1);
        return;
      }

      if (key === "1") {
        event.preventDefault();
        applyDayTypeToCurrentDay("strength");
        return;
      }

      if (key === "2") {
        event.preventDefault();
        applyDayTypeToCurrentDay("running");
        return;
      }

      if (key === "3") {
        event.preventDefault();
        applyDayTypeToCurrentDay("biking");
      }
    });
  }

  function isEditableTarget(target) {
    if (!target) {
      return false;
    }

    var tagName = String(target.tagName || "").toLowerCase();
    if (tagName === "input" || tagName === "textarea" || tagName === "select") {
      return true;
    }

    if (target.isContentEditable) {
      return true;
    }

    return !!(target.closest && target.closest("input, textarea, select, [contenteditable='true']"));
  }

  function addQuickExerciseByKey(key) {
    if (!state.isTemplateBuilder) {
      return;
    }

    var template = QUICK_EXERCISE_LIBRARY[String(key || "")];
    if (!template) {
      setStatus("Unknown quick exercise block.", "error");
      return;
    }

    var exercise = cloneExercises([template])[0] || null;
    if (!exercise) {
      setStatus("Could not add quick exercise.", "error");
      return;
    }

    exercise.superset_group = null;
    exercise.field_toggles = normalizeExerciseFieldToggles(exercise.field_toggles, exercise.mode);

    state.exercises.push(exercise);
    saveExercisesForDay(true);
    renderRows();
    setStatus("Added quick block: " + exercise.name + ".", "success");
  }

  function runTemplateBulkAction(action) {
    if (!state.isTemplateBuilder) {
      return;
    }

    var normalizedAction = String(action || "").trim().toLowerCase();
    if (normalizedAction === "duplicate-day-next") {
      copyCurrentDayToNextSlot();
      return;
    }

    if (normalizedAction === "copy-week-forward") {
      copyCurrentWeekForward();
      return;
    }

    if (normalizedAction === "clear-current-week") {
      clearCurrentWeek();
      return;
    }

    if (normalizedAction === "apply-day-type-week") {
      applyCurrentDayTypeToWeek();
      return;
    }

    setStatus("Unknown bulk action.", "error");
  }

  function loadSavedWorkoutBlocks() {
    state.savedWorkoutBlocks = readSavedWorkoutBlocksFromStorage();
  }

  function loadSavedWorkoutBlocksFromCloud() {
    if (!state.client || !state.coachUserId) {
      return;
    }

    state.client
      .from("coach_workout_blocks")
      .select("id,title,source_section,tags,sort_order,exercises,created_at,updated_at")
      .eq("coach_user_id", state.coachUserId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          return;
        }

        var cloudBlocks = normalizeCloudWorkoutBlocks(result.data || []);
        mergeAndBackfillWorkoutBlocks(cloudBlocks).then(function (mergedBlocks) {
          state.savedWorkoutBlocks = mergedBlocks;
          writeSavedWorkoutBlocksToStorage(mergedBlocks);
          renderSavedWorkoutBlocks();
        });
      })
      .catch(function () {
        // Keep local fallback when cloud read fails.
      });
  }

  function mergeAndBackfillWorkoutBlocks(cloudBlocks) {
    var cloudList = Array.isArray(cloudBlocks) ? cloudBlocks : [];
    var localList = readSavedWorkoutBlocksFromStorage();
    if (!state.client || !state.coachUserId) {
      return Promise.resolve(cloudList.length ? cloudList : localList);
    }

    var cloudSignatures = {};
    cloudList.forEach(function (block) {
      cloudSignatures[workoutBlockSignature(block)] = true;
    });

    var unsyncedLocal = localList.filter(function (block) {
      return !cloudSignatures[workoutBlockSignature(block)];
    });

    if (!unsyncedLocal.length) {
      return Promise.resolve(cloudList);
    }

    var insertRows = unsyncedLocal.map(function (block) {
      return {
        coach_user_id: state.coachUserId,
        title: String(block.title || "Workout Block").trim() || "Workout Block",
        source_section: String(block.section || "Workout Block").trim() || "Workout Block",
        tags: normalizeWorkoutBlockTags(block.tags || []),
        sort_order: parseWorkoutBlockSortOrder(block.sort_order),
        exercises: normalizeExercisesArray(block.exercises || [])
      };
    });

    return state.client
      .from("coach_workout_blocks")
      .insert(insertRows)
      .select("id,title,source_section,tags,sort_order,exercises,created_at,updated_at")
      .then(function (insertResult) {
        if (insertResult.error) {
          return cloudList;
        }

        var inserted = normalizeCloudWorkoutBlocks(insertResult.data || []);
        return sortWorkoutBlocksByCreatedAtDesc(cloudList.concat(inserted));
      })
      .catch(function () {
        return cloudList;
      });
  }

  function renderSavedWorkoutBlocks() {
    var container = document.querySelector("[data-template-block-list]");
    var filterInput = document.querySelector("[data-template-block-filter]");
    var saveButton = document.querySelector("[data-template-block-save]");
    var allBlocks = Array.isArray(state.savedWorkoutBlocks) ? state.savedWorkoutBlocks : [];

    renderSavedWorkoutBlockQuickPicker(allBlocks);

    if (!container) {
      return;
    }

    var blocks = allBlocks;
    var availableTags = collectSavedWorkoutBlockTags(blocks);
    if (filterInput) {
      var currentValue = String(state.workoutBlockFilterTag || "all");
      var options = ['<option value="all">All tags</option>']
        .concat(availableTags.map(function (tag) {
          return '<option value="' + escapeAttribute(tag) + '">' + escapeHtml(tag) + '</option>';
        }))
        .join("");
      filterInput.innerHTML = options;

      if (currentValue !== "all" && availableTags.indexOf(currentValue) === -1) {
        currentValue = "all";
        state.workoutBlockFilterTag = "all";
      }

      filterInput.value = currentValue;
    }

    blocks = filterSavedWorkoutBlocksByTag(blocks, state.workoutBlockFilterTag);

    if (saveButton) {
      saveButton.textContent = state.editingWorkoutBlockId ? "Update Block" : "Save Block";
    }

    if (!blocks.length) {
      container.innerHTML = '<p class="admin-loading">No saved blocks yet.</p>';
      return;
    }

    container.innerHTML = blocks.map(function (block) {
      var exerciseCount = Array.isArray(block.exercises) ? block.exercises.length : 0;
      var scopeLabel = String(block.section || "Workout Block");
      var tags = normalizeWorkoutBlockTags(block.tags || []);
      var isEditing = String(state.editingWorkoutBlockId || "") === String(block.id || "");
      var tagsHtml = tags.length
        ? '<ul class="program-builder-block-tags-list">' + tags.map(function (tag) {
            return '<li>' + escapeHtml(tag) + '</li>';
          }).join("") + '</ul>'
        : '';

      return (
        '<article class="program-builder-block-item" draggable="true" data-template-block-item="' + escapeAttribute(block.id || "") + '">' +
          '<div class="program-builder-block-main">' +
            (isEditing ? '<p class="program-builder-block-item-editing">Editing</p>' : '') +
            '<p class="program-builder-block-name">' + escapeHtml(block.title || "Workout Block") + '</p>' +
            '<p class="program-builder-block-meta">' + escapeHtml(scopeLabel) + ' • ' + escapeHtml(String(exerciseCount)) + ' exercise' + (exerciseCount === 1 ? '' : 's') + '</p>' +
            tagsHtml +
          '</div>' +
          '<div class="program-builder-block-actions">' +
            '<button type="button" class="btn admin-btn-small" data-template-block-add="' + escapeAttribute(block.id || "") + '">Add</button>' +
            '<button type="button" class="btn admin-btn-small" data-template-block-edit="' + escapeAttribute(block.id || "") + '">Edit</button>' +
            '<button type="button" class="btn admin-btn-delete-mini" data-template-block-delete="' + escapeAttribute(block.id || "") + '">Delete</button>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }

  function renderSavedWorkoutBlockQuickPicker(blocks) {
    var picker = document.querySelector("[data-template-block-quick-select]");
    if (!picker) {
      return;
    }

    var sortedBlocks = sortWorkoutBlocksByCreatedAtDesc(Array.isArray(blocks) ? blocks : []);
    var previousValue = String(picker.value || "");
    var options = ['<option value="">Select a saved block</option>']
      .concat(sortedBlocks.map(function (block) {
        var title = String(block && block.title || "Workout Block");
        var section = String(block && block.section || "Workout Block");
        var tags = normalizeWorkoutBlockTags(block && block.tags || []);
        var tagSuffix = tags.length ? " [" + tags.join(", ") + "]" : "";
        var label = title + " - " + section + tagSuffix;
        return '<option value="' + escapeAttribute(String(block && block.id || "")) + '">' + escapeHtml(label) + '</option>';
      }))
      .join("");

    picker.innerHTML = options;

    var hasPrevious = sortedBlocks.some(function (block) {
      return String(block && block.id || "") === previousValue;
    });
    if (previousValue && hasPrevious) {
      picker.value = previousValue;
    }

    var addButton = document.querySelector("[data-template-block-quick-add-selected]");
    if (addButton) {
      addButton.disabled = sortedBlocks.length === 0;
    }
  }

  function addSelectedSavedWorkoutBlockFromPicker() {
    var picker = document.querySelector("[data-template-block-quick-select]");
    if (!picker) {
      return;
    }

    var blockId = String(picker.value || "").trim();
    if (!blockId) {
      setStatus("Select a saved block first.", "info");
      return;
    }

    addSavedWorkoutBlockById(blockId);
  }

  function saveWorkoutBlockFromCurrentDay() {
    if (!state.isTemplateBuilder) {
      return;
    }

    var titleInput = document.querySelector("[data-template-block-title]");
    var sectionInput = document.querySelector("[data-template-block-section]");
    var tagsInput = document.querySelector("[data-template-block-tags]");
    var title = String((titleInput && titleInput.value) || "").trim();
    var section = String((sectionInput && sectionInput.value) || "Warm Up").trim();
    var tags = parseWorkoutBlockTags((tagsInput && tagsInput.value) || "");

    if (!title) {
      setStatus("Please add a title before saving this workout block.", "error");
      if (titleInput) {
        titleInput.focus();
      }
      return;
    }

    var sourceExercises = Array.isArray(state.exercises) ? state.exercises : [];
    var selectedExercises = section === "__all__"
      ? cloneExercises(sourceExercises)
      : cloneExercises(sourceExercises.filter(function (exercise) {
          return String(exercise && exercise.section || "").trim() === section;
        }));

    if (!selectedExercises.length) {
      setStatus("No exercises found for that section on this day.", "info");
      return;
    }

    selectedExercises = normalizeExercisesArray(selectedExercises).map(function (exercise) {
      var nextExercise = Object.assign({}, exercise, { superset_group: null });
      nextExercise.sets = (Array.isArray(exercise.sets) ? exercise.sets : []).map(function (set) {
        return Object.assign({}, set, { done: false });
      });
      return nextExercise;
    });

    var block = {
      id: "block_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
      title: title,
      section: section === "__all__" ? "Entire Day" : section,
      tags: tags,
      sort_order: 0,
      exercises: selectedExercises,
      created_at: new Date().toISOString()
    };

    if (state.editingWorkoutBlockId) {
      updateSavedWorkoutBlock(state.editingWorkoutBlockId, block);
      return;
    }

    if (state.client && state.coachUserId) {
      state.client
        .from("coach_workout_blocks")
        .insert({
          coach_user_id: state.coachUserId,
          title: block.title,
          source_section: block.section,
          tags: block.tags,
          sort_order: 0,
          exercises: block.exercises
        })
        .select("id,title,source_section,tags,sort_order,exercises,created_at,updated_at")
        .single()
        .then(function (result) {
          if (result.error) {
            saveWorkoutBlockLocally(block);
            return;
          }

          var savedBlock = mapCloudWorkoutBlock(result.data || {});
          state.savedWorkoutBlocks.unshift(savedBlock);
          reindexSavedWorkoutBlocks();
          writeSavedWorkoutBlocksToStorage(state.savedWorkoutBlocks);
          renderSavedWorkoutBlocks();

          if (titleInput) {
            titleInput.value = "";
          }
          if (tagsInput) {
            tagsInput.value = "";
          }

          setStatus("Saved workout block: " + title + ".", "success");
          persistSavedWorkoutBlockOrderToCloud();
        })
        .catch(function () {
          saveWorkoutBlockLocally(block);
        });
      return;
    }

    saveWorkoutBlockLocally(block);
  }

  function addSavedWorkoutBlockById(blockId) {
    if (!state.isTemplateBuilder) {
      return;
    }

    var id = String(blockId || "").trim();
    if (!id) {
      return;
    }

    var blocks = Array.isArray(state.savedWorkoutBlocks) ? state.savedWorkoutBlocks : [];
    var block = blocks.find(function (entry) {
      return String(entry && entry.id || "") === id;
    });

    if (!block || !Array.isArray(block.exercises) || !block.exercises.length) {
      setStatus("Saved block not found.", "error");
      return;
    }

    var clonedExercises = cloneExercises(block.exercises);
    clonedExercises = normalizeExercisesArray(clonedExercises).map(function (exercise) {
      var nextExercise = Object.assign({}, exercise, { superset_group: null });
      nextExercise.sets = (Array.isArray(exercise.sets) ? exercise.sets : []).map(function (set) {
        return Object.assign({}, set, { done: false });
      });
      return nextExercise;
    });

    state.exercises = (Array.isArray(state.exercises) ? state.exercises : []).concat(clonedExercises);
    saveExercisesForDay(true);
    renderRows();
    setStatus("Added block: " + String(block.title || "Workout Block") + ".", "success");
  }

  function removeSavedWorkoutBlockById(blockId) {
    if (!state.isTemplateBuilder) {
      return;
    }

    var id = String(blockId || "").trim();
    if (!id) {
      return;
    }

    var blocks = Array.isArray(state.savedWorkoutBlocks) ? state.savedWorkoutBlocks : [];
    var block = blocks.find(function (entry) {
      return String(entry && entry.id || "") === id;
    });
    if (!block) {
      return;
    }

    if (!confirm("Delete saved block '" + String(block.title || "Workout Block") + "'?")) {
      return;
    }

    if (state.client && state.coachUserId && isUuid(id)) {
      state.client
        .from("coach_workout_blocks")
        .delete()
        .eq("id", id)
        .eq("coach_user_id", state.coachUserId)
        .then(function (result) {
          if (result.error) {
            setStatus(result.error.message || "Could not delete saved block.", "error");
            return;
          }

          state.savedWorkoutBlocks = blocks.filter(function (entry) {
            return String(entry && entry.id || "") !== id;
          });

          if (String(state.editingWorkoutBlockId || "") === id) {
            clearSavedWorkoutBlockEditState();
          }

          reindexSavedWorkoutBlocks();

          writeSavedWorkoutBlocksToStorage(state.savedWorkoutBlocks);
          renderSavedWorkoutBlocks();
          setStatus("Deleted saved block.", "info");
          persistSavedWorkoutBlockOrderToCloud();
        })
        .catch(function () {
          setStatus("Could not delete saved block.", "error");
        });
      return;
    }

    state.savedWorkoutBlocks = blocks.filter(function (entry) {
      return String(entry && entry.id || "") !== id;
    });

    if (String(state.editingWorkoutBlockId || "") === id) {
      clearSavedWorkoutBlockEditState();
    }

    reindexSavedWorkoutBlocks();

    writeSavedWorkoutBlocksToStorage(state.savedWorkoutBlocks);
    renderSavedWorkoutBlocks();
    setStatus("Deleted saved block.", "info");
  }

  function saveWorkoutBlockLocally(block) {
    state.savedWorkoutBlocks.unshift(block);
    reindexSavedWorkoutBlocks();
    writeSavedWorkoutBlocksToStorage(state.savedWorkoutBlocks);
    renderSavedWorkoutBlocks();

    var titleInput = document.querySelector("[data-template-block-title]");
    var tagsInput = document.querySelector("[data-template-block-tags]");
    if (titleInput) {
      titleInput.value = "";
    }
    if (tagsInput) {
      tagsInput.value = "";
    }

    setStatus("Saved workout block locally in this browser.", "info");
  }

  function normalizeCloudWorkoutBlocks(rows) {
    return (Array.isArray(rows) ? rows : [])
      .map(function (row) {
        return mapCloudWorkoutBlock(row);
      })
      .filter(function (row) {
        return !!row;
      });
  }

  function mapCloudWorkoutBlock(row) {
    var source = row && typeof row === "object" ? row : {};
    var id = String(source.id || "").trim();
    var title = String(source.title || "").trim();
    var section = String(source.source_section || source.section || "Workout Block").trim() || "Workout Block";
    var tags = normalizeWorkoutBlockTags(source.tags || []);
    var sortOrder = parseWorkoutBlockSortOrder(source.sort_order);
    var exercises = normalizeExercisesArray(source.exercises || []);

    if (!id || !title || !exercises.length) {
      return null;
    }

    return {
      id: id,
      title: title,
      section: section,
      tags: tags,
      sort_order: sortOrder,
      exercises: exercises,
      created_at: String(source.created_at || ""),
      updated_at: String(source.updated_at || "")
    };
  }

  function workoutBlockSignature(block) {
    var safeBlock = block && typeof block === "object" ? block : {};
    var title = String(safeBlock.title || "").trim().toLowerCase();
    var section = String(safeBlock.section || "").trim().toLowerCase();
    var tags = normalizeWorkoutBlockTags(safeBlock.tags || []);
    var exercises = normalizeExercisesArray(safeBlock.exercises || []);

    return title + "|" + section + "|" + JSON.stringify(tags) + "|" + JSON.stringify(exercises);
  }

  function sortWorkoutBlocksByCreatedAtDesc(blocks) {
    return (Array.isArray(blocks) ? blocks : []).slice().sort(function (a, b) {
      var aSort = parseWorkoutBlockSortOrder(a && a.sort_order);
      var bSort = parseWorkoutBlockSortOrder(b && b.sort_order);
      if (aSort !== bSort) {
        return aSort - bSort;
      }

      var aTime = Date.parse(String(a && a.created_at || ""));
      var bTime = Date.parse(String(b && b.created_at || ""));
      var safeATime = Number.isFinite(aTime) ? aTime : 0;
      var safeBTime = Number.isFinite(bTime) ? bTime : 0;
      return safeBTime - safeATime;
    });
  }

  function readSavedWorkoutBlocksFromStorage() {
    try {
      var raw = window.localStorage.getItem(WORKOUT_BLOCK_LIBRARY_KEY);
      if (!raw) {
        return [];
      }

      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map(function (item) {
          var block = item && typeof item === "object" ? item : {};
          var id = String(block.id || "").trim();
          var title = String(block.title || "").trim();
          var section = String(block.section || "Workout Block").trim() || "Workout Block";
          var exercises = normalizeExercisesArray(block.exercises || []);

          if (!id || !title || !exercises.length) {
            return null;
          }

          return {
            id: id,
            title: title,
            section: section,
            tags: normalizeWorkoutBlockTags(block.tags || []),
            sort_order: parseWorkoutBlockSortOrder(block.sort_order),
            exercises: exercises,
            created_at: String(block.created_at || "")
          };
        })
        .filter(function (item) {
          return !!item;
        });
    } catch (e) {
      return [];
    }
  }

  function writeSavedWorkoutBlocksToStorage(blocks) {
    try {
      var payload = Array.isArray(blocks) ? sortWorkoutBlocksByCreatedAtDesc(blocks).slice(0, 100) : [];
      window.localStorage.setItem(WORKOUT_BLOCK_LIBRARY_KEY, JSON.stringify(payload));
    } catch (e) {
      setStatus("Could not save workout blocks in this browser.", "info");
    }
  }

  function parseWorkoutBlockSortOrder(value) {
    var num = parseInt(value, 10);
    return Number.isFinite(num) ? num : 0;
  }

  function normalizeWorkoutBlockTags(tags) {
    var list = Array.isArray(tags) ? tags : [];
    var seen = {};

    return list
      .map(function (tag) {
        return String(tag || "").trim().toLowerCase();
      })
      .filter(function (tag) {
        if (!tag || seen[tag]) {
          return false;
        }
        seen[tag] = true;
        return true;
      })
      .slice(0, 12);
  }

  function parseWorkoutBlockTags(raw) {
    return normalizeWorkoutBlockTags(String(raw || "").split(","));
  }

  function collectSavedWorkoutBlockTags(blocks) {
    var seen = {};
    var tags = [];

    (Array.isArray(blocks) ? blocks : []).forEach(function (block) {
      normalizeWorkoutBlockTags(block && block.tags || []).forEach(function (tag) {
        if (seen[tag]) {
          return;
        }
        seen[tag] = true;
        tags.push(tag);
      });
    });

    return tags.sort();
  }

  function filterSavedWorkoutBlocksByTag(blocks, tag) {
    var targetTag = String(tag || "all").trim().toLowerCase();
    var list = sortWorkoutBlocksByCreatedAtDesc(blocks || []);
    if (targetTag === "all") {
      return list;
    }

    return list.filter(function (block) {
      return normalizeWorkoutBlockTags(block && block.tags || []).indexOf(targetTag) >= 0;
    });
  }

  function clearSavedWorkoutBlockDragState() {
    state.draggingWorkoutBlockId = null;
    var items = document.querySelectorAll("[data-template-block-item]");
    items.forEach(function (item) {
      item.classList.remove("is-dragging");
      item.classList.remove("is-drag-over");
    });
  }

  function reorderSavedWorkoutBlocks(draggedId, targetId) {
    var blocks = sortWorkoutBlocksByCreatedAtDesc(state.savedWorkoutBlocks || []);
    var draggedIndex = blocks.findIndex(function (entry) {
      return String(entry && entry.id || "") === String(draggedId || "");
    });
    var targetIndex = blocks.findIndex(function (entry) {
      return String(entry && entry.id || "") === String(targetId || "");
    });

    if (draggedIndex < 0 || targetIndex < 0 || draggedIndex === targetIndex) {
      return;
    }

    var moved = blocks.splice(draggedIndex, 1)[0];
    blocks.splice(targetIndex, 0, moved);

    state.savedWorkoutBlocks = blocks;
    reindexSavedWorkoutBlocks();
    writeSavedWorkoutBlocksToStorage(state.savedWorkoutBlocks);
    renderSavedWorkoutBlocks();
    setStatus("Saved block order updated.", "success");
    persistSavedWorkoutBlockOrderToCloud();
  }

  function reindexSavedWorkoutBlocks() {
    var blocks = sortWorkoutBlocksByCreatedAtDesc(state.savedWorkoutBlocks || []);
    blocks.forEach(function (block, index) {
      if (!block || typeof block !== "object") {
        return;
      }
      block.sort_order = index;
      block.tags = normalizeWorkoutBlockTags(block.tags || []);
    });
    state.savedWorkoutBlocks = blocks;
  }

  function persistSavedWorkoutBlockOrderToCloud() {
    if (!state.client || !state.coachUserId) {
      return;
    }

    var cloudBlocks = (Array.isArray(state.savedWorkoutBlocks) ? state.savedWorkoutBlocks : []).filter(function (block) {
      return block && isUuid(block.id);
    });
    if (!cloudBlocks.length) {
      return;
    }

    Promise.all(cloudBlocks.map(function (block) {
      return state.client
        .from("coach_workout_blocks")
        .update({ sort_order: parseWorkoutBlockSortOrder(block.sort_order) })
        .eq("id", block.id)
        .eq("coach_user_id", state.coachUserId)
        .then(function () {
          return true;
        })
        .catch(function () {
          return false;
        });
    }));
  }

  function startEditingSavedWorkoutBlockById(blockId) {
    var id = String(blockId || "").trim();
    if (!id) {
      return;
    }

    var block = (Array.isArray(state.savedWorkoutBlocks) ? state.savedWorkoutBlocks : []).find(function (entry) {
      return String(entry && entry.id || "") === id;
    });
    if (!block) {
      return;
    }

    var titleInput = document.querySelector("[data-template-block-title]");
    var sectionInput = document.querySelector("[data-template-block-section]");
    var tagsInput = document.querySelector("[data-template-block-tags]");

    if (titleInput) {
      titleInput.value = String(block.title || "");
    }
    if (sectionInput) {
      var sectionValue = String(block.section || "Warm Up");
      sectionInput.value = sectionValue === "Entire Day" ? "__all__" : sectionValue;
    }
    if (tagsInput) {
      tagsInput.value = normalizeWorkoutBlockTags(block.tags || []).join(", ");
    }

    state.editingWorkoutBlockId = id;
    renderSavedWorkoutBlocks();
    setStatus("Editing saved block: " + String(block.title || "Workout Block") + ".", "info");
  }

  function clearSavedWorkoutBlockEditState() {
    state.editingWorkoutBlockId = null;
    var titleInput = document.querySelector("[data-template-block-title]");
    var sectionInput = document.querySelector("[data-template-block-section]");
    var tagsInput = document.querySelector("[data-template-block-tags]");

    if (titleInput) {
      titleInput.value = "";
    }
    if (sectionInput) {
      sectionInput.value = "Warm Up";
    }
    if (tagsInput) {
      tagsInput.value = "";
    }

    renderSavedWorkoutBlocks();
  }

  function updateSavedWorkoutBlock(editingId, nextBlock) {
    var id = String(editingId || "").trim();
    if (!id) {
      return;
    }

    var blocks = Array.isArray(state.savedWorkoutBlocks) ? state.savedWorkoutBlocks.slice() : [];
    var index = blocks.findIndex(function (entry) {
      return String(entry && entry.id || "") === id;
    });
    if (index < 0) {
      state.editingWorkoutBlockId = null;
      renderSavedWorkoutBlocks();
      return;
    }

    var existing = blocks[index] || {};
    var updatedBlock = {
      id: id,
      title: String(nextBlock.title || "Workout Block").trim() || "Workout Block",
      section: String(nextBlock.section || "Workout Block").trim() || "Workout Block",
      tags: normalizeWorkoutBlockTags(nextBlock.tags || []),
      sort_order: parseWorkoutBlockSortOrder(existing.sort_order),
      exercises: normalizeExercisesArray(nextBlock.exercises || []),
      created_at: String(existing.created_at || new Date().toISOString()),
      updated_at: new Date().toISOString()
    };

    var applyLocalUpdate = function () {
      blocks[index] = updatedBlock;
      state.savedWorkoutBlocks = blocks;
      reindexSavedWorkoutBlocks();
      writeSavedWorkoutBlocksToStorage(state.savedWorkoutBlocks);
      clearSavedWorkoutBlockEditState();
      setStatus("Updated saved block: " + updatedBlock.title + ".", "success");
      persistSavedWorkoutBlockOrderToCloud();
    };

    if (state.client && state.coachUserId && isUuid(id)) {
      state.client
        .from("coach_workout_blocks")
        .update({
          title: updatedBlock.title,
          source_section: updatedBlock.section,
          tags: updatedBlock.tags,
          exercises: updatedBlock.exercises
        })
        .eq("id", id)
        .eq("coach_user_id", state.coachUserId)
        .then(function (result) {
          if (result.error) {
            setStatus(result.error.message || "Could not update saved block.", "error");
            return;
          }
          applyLocalUpdate();
        })
        .catch(function () {
          setStatus("Could not update saved block.", "error");
        });
      return;
    }

    applyLocalUpdate();
  }

  function moveToAdjacentTemplateDay(step) {
    if (!state.isTemplateBuilder) {
      return;
    }

    var offset = parseInt(step, 10);
    if (!Number.isFinite(offset) || !offset) {
      return;
    }

    var slotKeys = getAllSlotKeys();
    var currentIndex = slotKeys.indexOf(state.day);
    if (currentIndex === -1) {
      return;
    }

    var nextIndex = currentIndex + offset;
    if (nextIndex < 0 || nextIndex >= slotKeys.length) {
      return;
    }

    saveExercisesForDay(true);
    state.day = slotKeys[nextIndex];

    var daySelect = document.querySelector("[data-workout-day]");
    if (daySelect) {
      daySelect.value = state.day;
    }

    loadExercisesForDay();
    renderRows();
    updateDayInfo();
    refreshTemplateDayTools();
    setStatus("Switched to " + labelForSlot(state.day) + ".", "info");
  }

  function copyCurrentDayToNextSlot() {
    if (!state.isTemplateBuilder || !state.day) {
      return;
    }

    saveExercisesForDay(true);

    var slotKeys = getAllSlotKeys();
    var currentIndex = slotKeys.indexOf(state.day);
    if (currentIndex === -1 || currentIndex >= slotKeys.length - 1) {
      setStatus("No next workout slot available.", "info");
      return;
    }

    var nextKey = slotKeys[currentIndex + 1];
    writeToStorage(state.storagePrefix + nextKey, {
      exercises: cloneExercises(state.exercises),
      saved_at: new Date().toISOString()
    });

    if (state.daySessionTypes && state.daySessionTypes[state.day]) {
      state.daySessionTypes[nextKey] = state.daySessionTypes[state.day];
    }

    if (state.customDayNames && state.customDayNames[state.day]) {
      state.customDayNames[nextKey] = state.customDayNames[state.day];
    }

    setStatus("Duplicated this day into " + labelForSlot(nextKey) + ".", "success");
  }

  function copyCurrentWeekForward() {
    if (!state.isTemplateBuilder || !state.day) {
      return;
    }

    var parsed = parseSlotKey(state.day);
    if (!parsed) {
      return;
    }

    var sourceWeek = parsed.week;
    var targetWeek = sourceWeek + 1;
    if (targetWeek > state.structure.weeks) {
      setStatus("No following week available to copy into.", "info");
      return;
    }

    saveExercisesForDay(true);

    var copiedCount = 0;
    for (var workout = 1; workout <= state.structure.workoutsPerWeek; workout++) {
      var sourceKey = "w" + sourceWeek + "d" + workout;
      var targetKey = "w" + targetWeek + "d" + workout;
      var sourcePayload = readFromStorage(state.storagePrefix + sourceKey);
      var sourceExercises = sourcePayload && Array.isArray(sourcePayload.exercises)
        ? cloneExercises(sourcePayload.exercises)
        : [];

      writeToStorage(state.storagePrefix + targetKey, {
        exercises: sourceExercises,
        saved_at: new Date().toISOString()
      });

      if (state.daySessionTypes && state.daySessionTypes[sourceKey]) {
        state.daySessionTypes[targetKey] = state.daySessionTypes[sourceKey];
      }

      if (state.customDayNames && state.customDayNames[sourceKey]) {
        state.customDayNames[targetKey] = state.customDayNames[sourceKey];
      }

      copiedCount += 1;
    }

    setStatus("Copied Week " + sourceWeek + " into Week " + targetWeek + " (" + copiedCount + " workout slot(s)).", "success");
  }

  function clearCurrentWeek() {
    if (!state.isTemplateBuilder || !state.day) {
      return;
    }

    var parsed = parseSlotKey(state.day);
    if (!parsed) {
      return;
    }

    if (!confirm("Clear all workout slots in Week " + parsed.week + "?")) {
      return;
    }

    for (var workout = 1; workout <= state.structure.workoutsPerWeek; workout++) {
      var slotKey = "w" + parsed.week + "d" + workout;
      try {
        window.localStorage.removeItem(state.storagePrefix + slotKey);
      } catch (e) {
        // Continue clearing remaining keys.
      }
    }

    loadExercisesForDay();
    renderRows();
    updateDayInfo();
    setStatus("Cleared all workout slots in Week " + parsed.week + ".", "info");
  }

  function applyCurrentDayTypeToWeek() {
    if (!state.isTemplateBuilder || !state.day) {
      return;
    }

    var parsed = parseSlotKey(state.day);
    var currentDayType = getDayTypeForSlot(state.day);
    if (!parsed || !currentDayType) {
      setStatus("No day type found to apply.", "info");
      return;
    }

    for (var workout = 1; workout <= state.structure.workoutsPerWeek; workout++) {
      state.daySessionTypes["w" + parsed.week + "d" + workout] = currentDayType;
    }

    updateDayInfo();
    setStatus("Applied " + capitalize(currentDayType) + " day type across Week " + parsed.week + ".", "success");
  }

  function setupExerciseEditorModal() {
    var modal = document.querySelector("[data-exercise-editor-modal]");
    var overlay = document.querySelector(".exercise-editor-overlay[data-exercise-editor-close]");
    var closeBtn = document.querySelector(".exercise-editor-close-btn");
    var cancelBtn = document.querySelector("[data-exercise-editor-cancel]");
    var submitBtn = document.querySelector("[data-exercise-editor-submit]");
    var nameInput = document.querySelector("[data-exercise-name-input]");
    var suggestions = document.querySelector("[data-exercise-suggestions]");

    if (!modal || !overlay || !closeBtn || !cancelBtn || !submitBtn) {
      console.warn("Exercise editor modal elements not found");
      return;
    }

    overlay.addEventListener("click", closeExerciseEditor);
    closeBtn.addEventListener("click", closeExerciseEditor);
    cancelBtn.addEventListener("click", closeExerciseEditor);
    submitBtn.addEventListener("click", submitExerciseEditor);

    if (nameInput) {
      nameInput.addEventListener("input", function () {
        handleExerciseNameInput(nameInput.value || "");
      });
      nameInput.addEventListener("focus", function () {
        renderExerciseSuggestions(nameInput.value || "");
      });
    }

    if (suggestions) {
      suggestions.addEventListener("click", function (event) {
        var option = event.target && event.target.closest("[data-exercise-suggestion-id]");
        if (!option) {
          return;
        }

        applyExerciseLibrarySelection(option.getAttribute("data-exercise-suggestion-id"));
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hasAttribute("hidden")) {
        closeExerciseEditor();
      }
    });

    document.addEventListener("click", function (event) {
      if (!modal || modal.hasAttribute("hidden")) {
        return;
      }
      if (event.target && event.target.closest("[data-exercise-editor-form]")) {
        return;
      }
      hideExerciseSuggestions();
    });
  }

  function openExerciseEditor(exerciseIdx) {
    if (state.isProgramReadOnly && !state.isTemplateBuilder) {
      return;
    }

    var modal = document.querySelector("[data-exercise-editor-modal]");
    var title = document.querySelector("[data-exercise-editor-title]");
    var nameInput = document.querySelector("[data-exercise-name-input]");
    var sectionSelect = document.querySelector("[data-exercise-section-select]");
    var modeSelect = document.querySelector("[data-exercise-mode-select]");
    var setsInput = document.querySelector("[data-exercise-sets-input]");
    var weightToggle = document.querySelector("[data-exercise-toggle-weight]");
    var rpeToggle = document.querySelector("[data-exercise-toggle-rpe]");
    var restToggle = document.querySelector("[data-exercise-toggle-rest]");
    var notesInput = document.querySelector("[data-exercise-notes-input]");
    var libraryIdInput = document.querySelector("[data-exercise-library-id]");

    if (!modal) return;

    state.editingExerciseIdx = exerciseIdx;

    // Reset form
    nameInput.value = "";
    sectionSelect.value = "A Block";
    modeSelect.value = "reps";
    setsInput.value = "3";
    weightToggle.checked = true;
    rpeToggle.checked = true;
    restToggle.checked = false;
    notesInput.value = "";
    if (libraryIdInput) {
      libraryIdInput.value = "";
    }
    updateExerciseLibraryPreview(null);
    hideExerciseSuggestions();

    if (exerciseIdx !== null && state.exercises[exerciseIdx]) {
      // Edit mode
      var exercise = state.exercises[exerciseIdx];
      title.textContent = "Edit Exercise";
      nameInput.value = exercise.name || "";
      sectionSelect.value = exercise.section || "A Block";
      modeSelect.value = exercise.mode || "reps";
      setsInput.value = String((exercise.sets && exercise.sets.length) || 3);

      var toggles = normalizeExerciseFieldToggles(exercise.field_toggles, exercise.mode);
      weightToggle.checked = toggles.showWeight;
      rpeToggle.checked = toggles.showRpe;
      restToggle.checked = toggles.showRest;

      notesInput.value = exercise.notes || "";
      if (libraryIdInput) {
        libraryIdInput.value = String(exercise.library_id || "");
      }
      if (exercise.library_id) {
        updateExerciseLibraryPreview(findExerciseLibraryItemById(exercise.library_id));
      } else {
        updateExerciseLibraryPreview(findExerciseLibraryItemByName(exercise.name || ""));
      }
    } else {
      // Add mode
      title.textContent = "Add Exercise";
    }

    modal.style.display = "flex";
    nameInput.focus();
    modal.removeAttribute("hidden");
  }

  function closeExerciseEditor() {
    var modal = document.querySelector("[data-exercise-editor-modal]");
    if (modal) {
      modal.style.display = "none";
       modal.setAttribute("hidden", "");
    }
    hideExerciseSuggestions();
    state.editingExerciseIdx = null;
  }

  function lockBuilderToReadOnly() {
    state.isAthleteLockedView = true;
    state.isProgramReadOnly = true;
    applyAthleteLockedUi();
  }

  function setTemplateBuilderChromeVisible(isVisible) {
    var show = !!isVisible;
    var panel = document.querySelector("[data-template-builder-panel]");
    var workspace = document.querySelector("[data-template-workspace]");

    if (panel) {
      panel.hidden = !show;
      panel.setAttribute("aria-hidden", show ? "false" : "true");
    }

    if (workspace) {
      workspace.hidden = !show;
      workspace.setAttribute("aria-hidden", show ? "false" : "true");
    }

    if (document.body) {
      document.body.classList.toggle("template-builder-mode", show);
    }
  }

  function submitExerciseEditor(event) {
    event.preventDefault();

    var nameInput = document.querySelector("[data-exercise-name-input]");
    var sectionSelect = document.querySelector("[data-exercise-section-select]");
    var modeSelect = document.querySelector("[data-exercise-mode-select]");
    var setsInput = document.querySelector("[data-exercise-sets-input]");
    var weightToggle = document.querySelector("[data-exercise-toggle-weight]");
    var rpeToggle = document.querySelector("[data-exercise-toggle-rpe]");
    var restToggle = document.querySelector("[data-exercise-toggle-rest]");
    var notesInput = document.querySelector("[data-exercise-notes-input]");
    var libraryIdInput = document.querySelector("[data-exercise-library-id]");

    var name = String(nameInput.value || "").trim();
    if (!name) {
      setStatus("Exercise name is required.", "error");
      nameInput.focus();
      return;
    }

    var section = String(sectionSelect.value || "A Block");
    var mode = String(modeSelect.value || "reps");
    var numSets = Math.max(1, Math.min(10, parseInt(setsInput.value, 10) || 3));
    var notes = String(notesInput.value || "").trim();
    var libraryId = String(libraryIdInput && libraryIdInput.value || "").trim();
    var libraryItem = findExerciseLibraryItemById(libraryId) || findExerciseLibraryItemByName(name);

    var fieldToggles = {
      showWeight: !!weightToggle.checked,
      secondaryMetric: "weight",
      showRpe: !!rpeToggle.checked,
      showRest: !!restToggle.checked
    };

    if (state.editingExerciseIdx !== null && state.exercises[state.editingExerciseIdx]) {
      // Update existing
      var exercise = state.exercises[state.editingExerciseIdx];
      exercise.name = name;
      exercise.section = section;
      exercise.mode = mode;
      exercise.field_toggles = fieldToggles;
      exercise.notes = notes;
      exercise.library_id = libraryItem ? libraryItem.id : null;
      exercise.video_demo_url = libraryItem ? libraryItem.video_demo_url || "" : "";
      // Keep existing sets, just update metadata

      setStatus("Updated " + name + ".", "success");
    } else {
      // Add new
      var newExercise = {
        name: name,
        section: section,
        mode: mode,
        superset_group: null,
        library_id: libraryItem ? libraryItem.id : null,
        video_demo_url: libraryItem ? libraryItem.video_demo_url || "" : "",
        field_toggles: fieldToggles,
        notes: notes,
        sets: []
      };

      for (var i = 0; i < numSets; i++) {
        newExercise.sets.push({
          reps: "",
          weight: "",
          rpe: "",
          rest: "",
          notes: "",
          done: false
        });
      }

      state.exercises.push(newExercise);
      setStatus("Added " + name + ".", "success");
    }

    // CRITICAL: Save to storage immediately
    saveExercisesForDay(true);

    closeExerciseEditor();
    renderRows();
  }

  function loadExerciseLibraryForEditor() {
    if (!state.client) {
      state.exerciseLibrary = readExerciseLibraryFromStorage();
      return;
    }

    state.client
      .from(EXERCISE_LIBRARY_TABLE)
      .select("id,name,movement_pattern,equipment,primary_muscle,training_goal,sport_tags,custom_tags,description,coaching_cues,video_demo_url,updated_at")
      .order("name", { ascending: true })
      .then(function (result) {
        if (result.error) {
          state.exerciseLibrary = readExerciseLibraryFromStorage();
          return;
        }

        state.exerciseLibrary = (result.data || []).map(normalizeExerciseLibraryItem);
        if (!state.exerciseLibrary.length) {
          state.exerciseLibrary = readExerciseLibraryFromStorage();
        }
      })
      .catch(function () {
        state.exerciseLibrary = readExerciseLibraryFromStorage();
      });
  }

  function normalizeExerciseLibraryItem(item) {
    return {
      id: item && item.id ? String(item.id) : "",
      name: item && item.name ? String(item.name) : "",
      movement_pattern: item && item.movement_pattern ? String(item.movement_pattern) : "",
      equipment: item && item.equipment ? String(item.equipment) : "",
      primary_muscle: item && item.primary_muscle ? String(item.primary_muscle) : "",
      training_goal: item && item.training_goal ? String(item.training_goal) : "",
      sport_tags: item && Array.isArray(item.sport_tags) ? item.sport_tags : [],
      custom_tags: item && Array.isArray(item.custom_tags) ? item.custom_tags : [],
      description: item && item.description ? String(item.description) : "",
      coaching_cues: item && item.coaching_cues ? String(item.coaching_cues) : "",
      video_demo_url: item && item.video_demo_url ? String(item.video_demo_url) : ""
    };
  }

  function readExerciseLibraryFromStorage() {
    try {
      var raw = window.localStorage.getItem(EXERCISE_LIBRARY_KEY);
      if (!raw) {
        return [];
      }

      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizeExerciseLibraryItem) : [];
    } catch (e) {
      return [];
    }
  }

  function handleExerciseNameInput(rawValue) {
    var nameValue = String(rawValue || "").trim();
    var libraryIdInput = document.querySelector("[data-exercise-library-id]");
    var selectedItem = libraryIdInput ? findExerciseLibraryItemById(libraryIdInput.value) : null;

    if (selectedItem && selectedItem.name !== nameValue) {
      if (libraryIdInput) {
        libraryIdInput.value = "";
      }
      updateExerciseLibraryPreview(findExerciseLibraryItemByName(nameValue));
    }

    renderExerciseSuggestions(nameValue);
  }

  function renderExerciseSuggestions(rawValue) {
    var suggestions = document.querySelector("[data-exercise-suggestions]");
    if (!suggestions) {
      return;
    }

    var query = String(rawValue || "").trim().toLowerCase();
    if (!query) {
      suggestions.hidden = true;
      suggestions.innerHTML = "";
      return;
    }

    var matches = (Array.isArray(state.exerciseLibrary) ? state.exerciseLibrary : [])
      .filter(function (item) {
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
        ].join(" ").toLowerCase();

        return haystack.indexOf(query) >= 0;
      })
      .slice(0, 8);

    if (!matches.length) {
      suggestions.hidden = true;
      suggestions.innerHTML = "";
      return;
    }

    suggestions.hidden = false;
    suggestions.innerHTML = matches.map(function (item) {
      var meta = [item.movement_pattern, item.equipment, item.training_goal]
        .filter(function (value) { return !!value; })
        .join(" • ");
      return (
        '<button type="button" class="exercise-editor-suggestion" data-exercise-suggestion-id="' + escapeAttribute(item.id) + '">' +
        '<strong>' + escapeHtml(item.name) + '</strong>' +
        (meta ? '<span>' + escapeHtml(meta) + '</span>' : '') +
        '</button>'
      );
    }).join("");
  }

  function hideExerciseSuggestions() {
    var suggestions = document.querySelector("[data-exercise-suggestions]");
    if (!suggestions) {
      return;
    }
    suggestions.hidden = true;
    suggestions.innerHTML = "";
  }

  function applyExerciseLibrarySelection(libraryId) {
    var item = findExerciseLibraryItemById(libraryId);
    var nameInput = document.querySelector("[data-exercise-name-input]");
    var notesInput = document.querySelector("[data-exercise-notes-input]");
    var libraryIdInput = document.querySelector("[data-exercise-library-id]");

    if (!item || !nameInput) {
      return;
    }

    nameInput.value = item.name || "";
    if (libraryIdInput) {
      libraryIdInput.value = item.id || "";
    }

    if (notesInput && !String(notesInput.value || "").trim()) {
      notesInput.value = buildExerciseLibraryNotes(item);
    }

    updateExerciseLibraryPreview(item);
    hideExerciseSuggestions();
  }

  function buildExerciseLibraryNotes(item) {
    var parts = [];
    if (item && item.description) {
      parts.push(String(item.description).trim());
    }
    if (item && item.coaching_cues) {
      parts.push("Cues: " + String(item.coaching_cues).trim());
    }
    return parts.join("\n\n").trim();
  }

  function updateExerciseLibraryPreview(item) {
    var preview = document.querySelector("[data-exercise-library-preview]");
    var meta = document.querySelector("[data-exercise-library-meta]");
    var videoLink = document.querySelector("[data-exercise-library-video-link]");
    var entry = item && item.id ? item : null;

    if (!preview || !meta || !videoLink) {
      return;
    }

    if (!entry) {
      preview.hidden = true;
      meta.textContent = "";
      videoLink.hidden = true;
      videoLink.removeAttribute("href");
      return;
    }

    preview.hidden = false;
    meta.textContent = [entry.movement_pattern, entry.equipment, entry.primary_muscle, entry.training_goal]
      .filter(function (value) { return !!value; })
      .map(function (value) { return capitalize(String(value).replace(/-/g, " ")); })
      .join(" • ");

    if (entry.video_demo_url) {
      videoLink.hidden = false;
      videoLink.href = entry.video_demo_url;
    } else {
      videoLink.hidden = true;
      videoLink.removeAttribute("href");
    }
  }

  function findExerciseLibraryItemById(libraryId) {
    var id = String(libraryId || "").trim();
    if (!id) {
      return null;
    }
    return (Array.isArray(state.exerciseLibrary) ? state.exerciseLibrary : []).find(function (item) {
      return String(item && item.id || "") === id;
    }) || null;
  }

  function findExerciseLibraryItemByName(nameValue) {
    var target = String(nameValue || "").trim().toLowerCase();
    if (!target) {
      return null;
    }
    return (Array.isArray(state.exerciseLibrary) ? state.exerciseLibrary : []).find(function (item) {
      return String(item && item.name || "").trim().toLowerCase() === target;
    }) || null;
  }

  function updateTemplateStructure(weeks, workoutsPerWeek) {
    if (!state.isTemplateBuilder) {
      return;
    }

    saveExercisesForDay(true);

    state.structure = normalizeStructure({
      weeks: weeks,
      workoutsPerWeek: workoutsPerWeek
    });
    ensureDaySessionTypesForStructure();

    var daySelect = document.querySelector("[data-workout-day]");
    if (daySelect) {
      refreshWorkoutDaySelect(daySelect);
      if (state.day && daySelect.querySelector('option[value="' + state.day + '"]')) {
        daySelect.value = state.day;
      } else {
        daySelect.value = getAllSlotKeys()[0] || "w1d1";
      }
      state.day = daySelect.value;
    }

    loadExercisesForDay();
    renderRows();
    updateDayInfo();
    refreshTemplateDayTools();
    setStatus(
      "Template structure updated to " + state.structure.weeks + " week(s) with " + state.structure.workoutsPerWeek + " workout(s) per week.",
      "info"
    );
  }

  function seedTemplateSkeleton() {
    if (!state.isTemplateBuilder) {
      return;
    }

    saveExercisesForDay(true);
    ensureDaySessionTypesForStructure();

    var slotKeys = getAllSlotKeys();
    var seededCount = 0;
    var skippedCount = 0;

    slotKeys.forEach(function (slotKey) {
      var existing = readExercisesForDayFromStorage(slotKey);
      if (Array.isArray(existing) && existing.length > 0) {
        skippedCount++;
        return;
      }

      writeToStorage(state.storagePrefix + slotKey, {
        exercises: createStarterExercisesForSlot(slotKey),
        saved_at: new Date().toISOString()
      });
      seededCount++;
    });

    loadExercisesForDay();
    renderRows();
    updateDayInfo();
    refreshTemplateDayTools();

    if (seededCount === 0) {
      setStatus("No empty workout slots found. Existing slots were left untouched.", "info");
      return;
    }

    setStatus(
      "Seeded " + seededCount + " workout slot(s) with starter exercises. Skipped " + skippedCount + " existing slot(s).",
      "success"
    );
  }

  function createStarterExercisesForSlot(slotKey) {
    var parsed = parseSlotKey(slotKey) || { week: 1, workout: 1 };

    if (state.templateFocus === "running") {
      return createRunningStarterExercises(parsed);
    }

    if (state.templateFocus === "biking") {
      return createBikingStarterExercises(parsed);
    }

    if (state.templateFocus === "hybrid") {
      return createHybridStarterExercises(parsed);
    }

    return createStrengthStarterExercises(parsed);
  }

  function createStrengthStarterExercises(parsed) {
    return [
      {
        name: "Warm Up Flow (Week " + parsed.week + ")",
        section: "Warm Up",
        mode: "time",
        superset_group: null,
        sets: [{ reps: "8 min", weight: "BW", rpe: "", notes: "Mobility + activation", done: false }]
      },
      {
        name: "Primary Lift",
        section: "A Block",
        mode: "reps",
        superset_group: null,
        sets: [
          { reps: "5", weight: "", rpe: "", notes: "Main strength focus", done: false },
          { reps: "5", weight: "", rpe: "", notes: "", done: false },
          { reps: "5", weight: "", rpe: "", notes: "", done: false }
        ]
      },
      {
        name: "Secondary Strength",
        section: "B Block",
        mode: "reps",
        superset_group: null,
        sets: [{ reps: "8", weight: "", rpe: "", notes: "Accessory movement", done: false }]
      },
      {
        name: "Conditioning / Power",
        section: "C Block",
        mode: "time",
        superset_group: null,
        sets: [{ reps: "10 min", weight: "", rpe: "", notes: "Optional based on phase", done: false }]
      },
      {
        name: "Cool Down",
        section: "Cool Down",
        mode: "time",
        superset_group: null,
        sets: [{ reps: "6 min", weight: "BW", rpe: "", notes: "Breathing + mobility", done: false }]
      }
    ];
  }

  function createRunningStarterExercises(_parsed) {
    return [
      {
        name: "Dynamic Run Warm-Up",
        section: "Warm Up",
        mode: "time",
        superset_group: null,
        sets: [{ reps: "10 min", weight: "", rpe: "", notes: "Mobility + strides", done: false }]
      },
      {
        name: "Primary Interval Set",
        section: "A Block",
        mode: "endurance",
        superset_group: null,
        sets: [{ reps: "8 x 2:00", weight: "0.40 mi", rpe: "Z4", notes: "90s easy jog recoveries", done: false }]
      },
      {
        name: "Steady Aerobic Run",
        section: "B Block",
        mode: "endurance",
        superset_group: null,
        sets: [{ reps: "35 min", weight: "5.0 mi", rpe: "Z2", notes: "Conversational effort", done: false }]
      },
      {
        name: "Running Drill Circuit",
        section: "C Block",
        mode: "reps",
        superset_group: null,
        sets: [{ reps: "3 rounds", weight: "BW", rpe: "", notes: "A-skips, B-skips, bounds", done: false }]
      },
      {
        name: "Cool Down Walk + Mobility",
        section: "Cool Down",
        mode: "time",
        superset_group: null,
        sets: [{ reps: "8 min", weight: "", rpe: "", notes: "Nasal breathing", done: false }]
      }
    ];
  }

  function createBikingStarterExercises(_parsed) {
    return [
      {
        name: "Bike Warm-Up",
        section: "Warm Up",
        mode: "time",
        superset_group: null,
        sets: [{ reps: "12 min", weight: "", rpe: "", notes: "Progressive ramp", done: false }]
      },
      {
        name: "Threshold Intervals",
        section: "A Block",
        mode: "endurance",
        superset_group: null,
        sets: [{ reps: "4 x 8:00", weight: "", rpe: "Z4", notes: "4:00 easy spin between", done: false }]
      },
      {
        name: "Cadence Development",
        section: "B Block",
        mode: "endurance",
        superset_group: null,
        sets: [{ reps: "6 x 1:00", weight: "", rpe: "Z3", notes: "100+ rpm focus", done: false }]
      },
      {
        name: "Strength Accessory",
        section: "C Block",
        mode: "reps",
        superset_group: null,
        sets: [{ reps: "3 x 8", weight: "", rpe: "", notes: "Single-leg hinge + split squat", done: false }]
      },
      {
        name: "Cool Down Spin",
        section: "Cool Down",
        mode: "time",
        superset_group: null,
        sets: [{ reps: "10 min", weight: "", rpe: "", notes: "Easy zone 1", done: false }]
      }
    ];
  }

  function createHybridStarterExercises(parsed) {
    if (parsed.workout % 2 === 1) {
      return createRunningStarterExercises(parsed);
    }
    return createBikingStarterExercises(parsed);
  }

  function addNewExercise() {
    var exerciseName = prompt("Enter exercise name (e.g., Back Squat):");
    if (!exerciseName || !exerciseName.trim()) {
      return;
    }

    var numSets = prompt("How many sets?", "3");
    if (!numSets || isNaN(parseInt(numSets, 10))) {
      return;
    }

    numSets = Math.max(1, Math.min(10, parseInt(numSets, 10)));

    var modeInput = prompt("Track mode? Enter 'reps', 'time', or 'endurance'", "reps");
    var mode = String(modeInput || "reps").toLowerCase().trim();
    if (mode !== "time" && mode !== "endurance") {
      mode = "reps";
    }

    var sectionOptions = defaultSections.map(function(s, i) {
      return (i + 1) + ": " + s;
    }).join("\n");
    var sectionInput = prompt("Select section:\n" + sectionOptions, "1");
    var sectionIdx = parseInt(sectionInput, 10) - 1;
    var section = (sectionIdx >= 0 && sectionIdx < defaultSections.length) ? defaultSections[sectionIdx] : defaultSections[1];

    var newExercise = {
      name: exerciseName.trim(),
      section: section,
      mode: mode,
      superset_group: null,
      field_toggles: normalizeExerciseFieldToggles(null, mode),
      sets: []
    };

    for (var i = 0; i < numSets; i++) {
      newExercise.sets.push({
        reps: "",
        weight: "",
        rpe: "",
        rest: "",
        notes: "",
        done: false
      });
    }

    state.exercises.push(newExercise);
    renderRows();
    setStatus("Added " + exerciseName + " to " + section + " (" + mode + " based).", "success");
  }

  function loadExercisesForDay() {
    var stored = readWorkoutLogForDay();
    var assignedExercises = state.assignedTemplateDays && Array.isArray(state.assignedTemplateDays[state.day])
      ? cloneExercises(state.assignedTemplateDays[state.day])
      : null;

    if (state.isAthleteLockedView && assignedExercises) {
      state.exercises = assignedExercises;
      if (stored && Array.isArray(stored.exercises)) {
        state.exercises = mergeAthleteProgressIntoTemplate(state.exercises, stored.exercises);
      }
      state.exercises = normalizeExercisesArray(state.exercises);
      return;
    }

    if (stored && Array.isArray(stored.exercises)) {
      state.exercises = state.isAthleteLockedView
        ? normalizeAthleteLogExercises(stored.exercises)
        : stored.exercises;
      state.exercises = normalizeExercisesArray(state.exercises);
      return;
    }

    if (state.isTemplateBuilder) {
      state.exercises = [];
      state.exercises = normalizeExercisesArray(state.exercises);
      return;
    }

    if (assignedExercises) {
      state.exercises = normalizeExercisesArray(assignedExercises);
      return;
    }

    state.exercises = defaultExercisesForDay(state.day);
    state.exercises = normalizeExercisesArray(state.exercises);
  }

  function saveExercisesForDay(silent) {
    if (state.isTemplateBuilder) {
      syncTemplateTargetsFromPlannerValues(state.exercises);
    }

    state.exercises = normalizeExercisesArray(state.exercises);
    var payload = {
      exercises: state.exercises,
      saved_at: new Date().toISOString()
    };

    writeToStorage(storageKeyForDay(), payload);
    if (!silent) {
      setStatus(state.isTemplateBuilder ? "Draft day saved." : "✓ Workout log saved successfully.", "success");
    }
  }

  function syncScheduledSessionStatusForCurrentDay() {
    if (
      !state.client ||
      state.isTemplateBuilder ||
      !state.assignedProgramInstanceId ||
      state.isProgramReadOnly ||
      !state.day
    ) {
      return;
    }

    var snapshot = getWorkoutCompletionSnapshot(state.exercises || []);
    var nextStatus = snapshot.totalSets > 0 && snapshot.doneSets === snapshot.totalSets
      ? "completed"
      : "scheduled";

    state.client
      .from("athlete_program_schedule")
      .update({ status: nextStatus })
      .eq("user_training_program_id", state.assignedProgramInstanceId)
      .eq("slot_key", state.day)
      .then(function () {
        return true;
      })
      .catch(function () {
        return false;
      });
  }

  function getWorkoutCompletionSnapshot(exercises) {
    var safeExercises = Array.isArray(exercises) ? exercises : [];
    var totalSets = 0;
    var doneSets = 0;

    safeExercises.forEach(function (exercise) {
      var sets = Array.isArray(exercise && exercise.sets) ? exercise.sets : [];
      sets.forEach(function (set) {
        totalSets++;
        if (set && set.done) {
          doneSets++;
        }
      });
    });

    return {
      totalSets: totalSets,
      doneSets: doneSets
    };
  }

  function saveTemplateProgram() {
    var saveData = buildTemplateSaveData({
      promptForName: true,
      showErrors: true
    });
    if (!saveData) {
      return;
    }

    setStatus("Saving template...", "info");

    saveTemplateToLibrary(saveData)
      .then(function () {
        setProgramTitleFromQuery();
        setStatus("Template saved. Active athlete programs now use the latest template version.", "success");

        if (state.templateId) {
          try {
            var nextUrl =
              window.location.pathname +
              "?builder=1&templateId=" +
              encodeURIComponent(state.templateId);
            window.history.replaceState({}, "", nextUrl);
          } catch (e) {
            // Ignore history update errors.
          }
        }
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to save template.", "error");
      });
  }

  function buildTemplateSaveData(options) {
    var config = options || {};

    saveExercisesForDay(true);

    var nameInput = document.querySelector("[data-template-name]");
    var templateName = String((nameInput && nameInput.value) || state.templateName || "").trim();
    if (!templateName && config.promptForName !== false) {
      templateName = prompt("Enter a template name:", state.templateName || "");
      templateName = String(templateName || "").trim();
    }

    if (!templateName) {
      if (config.showErrors !== false) {
        setStatus("Template name is required before saving.", "error");
      }
      return null;
    }

    if (!state.client) {
      if (config.showErrors !== false) {
        setStatus("Supabase unavailable. Template could not be saved to shared library.", "error");
      }
      return null;
    }

    state.templateName = templateName;
    if (nameInput) {
      nameInput.value = templateName;
    }

    var payload = {
      archived: false,
      focus: state.templateFocus,
      day_session_types: state.daySessionTypes || {},
      custom_day_names: state.customDayNames || {},
      custom_day_name_mode: state.customDayNameMode,
      structure: state.structure,
      days: {}
    };

    getAllSlotKeys().forEach(function (slotKey) {
      payload.days[slotKey] = syncTemplateTargetsFromPlannerValues(readExercisesForDayFromStorage(slotKey));
    });

    return {
      templateName: templateName,
      payload: payload
    };
  }

  function saveTemplateToLibrary(saveData) {
    var templateIdForUpdate = state.templateId && isUuid(state.templateId) ? state.templateId : null;
    var isEditingExistingTemplate = !!templateIdForUpdate;
    var saveOperation;

    if (templateIdForUpdate) {
      saveOperation = state.client
        .from("training_programs")
        .update({
          name: saveData.templateName,
          description: serializeTemplatePayload(saveData.payload)
        })
        .eq("id", templateIdForUpdate)
        .select("id")
        .single();
    } else {
      saveOperation = state.client
        .from("training_programs")
        .insert({
          name: saveData.templateName,
          description: serializeTemplatePayload(saveData.payload)
        })
        .select("id")
        .single();
    }

    return saveOperation.then(function (result) {
      if (result.error) {
        throw new Error(result.error.message || "Failed to save template.");
      }

      state.templateId = result.data && result.data.id ? result.data.id : state.templateId;

      if (!isEditingExistingTemplate || !state.templateId) {
        return {
          templateId: state.templateId,
          templateName: saveData.templateName
        };
      }

      return state.client
        .from("user_training_programs")
        .update({ program_name: saveData.templateName })
        .eq("program_id", state.templateId)
        .eq("is_active", true)
        .then(function () {
          return {
            templateId: state.templateId,
            templateName: saveData.templateName
          };
        })
        .catch(function () {
          return {
            templateId: state.templateId,
            templateName: saveData.templateName
          };
        });
    });
  }

  function scheduleTemplateToAthleteCalendar(startDateInput) {
    if (!state.isTemplateBuilder || !state.targetAthleteId || !isUuid(state.targetAthleteId)) {
      setStatus("Open this editor from an athlete profile to schedule directly to their calendar.", "error");
      return;
    }

    var startDate = String(startDateInput || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      setStatus("Choose a valid start date before scheduling.", "error");
      return;
    }

    var saveData = buildTemplateSaveData({
      promptForName: true,
      showErrors: true
    });
    if (!saveData) {
      return;
    }

    var blueprint = buildTemplateScheduleBlueprint(saveData.payload);
    if (!blueprint.length) {
      setStatus("Add at least one workout day before scheduling this template.", "error");
      return;
    }

    setStatus("Saving template and scheduling to athlete calendar...", "info");

    saveTemplateToLibrary(saveData)
      .then(function (saveResult) {
        return ensureAthleteTemplateAssignment(state.targetAthleteId, saveResult.templateId, saveResult.templateName).then(
          function (assignment) {
            return {
              assignment: assignment,
              templateName: saveResult.templateName
            };
          }
        );
      })
      .then(function (result) {
        var scheduledDates = generateScheduledDates(startDate, blueprint.length);
        if (!scheduledDates.length) {
          throw new Error("Could not generate scheduled dates.");
        }

        var rows = blueprint.map(function (slot, index) {
          return {
            user_training_program_id: result.assignment.id,
            scheduled_for: scheduledDates[index],
            slot_key: slot.slotKey,
            session_label: slot.label,
            status: "scheduled",
            scheduled_by: state.coachUserId,
            notes: null
          };
        });

        return state.client
          .from("athlete_program_schedule")
          .upsert(rows, {
            onConflict: "user_training_program_id,slot_key,scheduled_for"
          })
          .then(function (insertResult) {
            if (insertResult.error) {
              throw new Error(insertResult.error.message || "Failed to schedule template to athlete calendar.");
            }

            return rows.length;
          });
      })
      .then(function (totalRows) {
        setStatus(
          "Template saved and " + String(totalRows) + " calendar session" + (totalRows === 1 ? "" : "s") + " scheduled.",
          "success"
        );

        setProgramTitleFromQuery();

        if (state.templateId) {
          try {
            var params = new URLSearchParams(window.location.search || "");
            params.set("builder", "1");
            params.set("templateId", state.templateId);
            if (state.targetAthleteId) {
              params.set("athleteId", state.targetAthleteId);
            }
            if (state.athleteName) {
              params.set("athleteName", state.athleteName);
            }
            window.history.replaceState({}, "", window.location.pathname + "?" + params.toString());
          } catch (e) {
            // Ignore history update errors.
          }
        }
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to schedule template.", "error");
      });
  }

  function buildTemplateScheduleBlueprint(payload) {
    var structure = normalizeStructure(payload && payload.structure);
    var customNames = normalizeCustomDayNames(payload && payload.custom_day_names);
    var dayTypes = normalizeDaySessionTypes(payload && payload.day_session_types);
    var days = normalizeTemplateDays(payload && payload.days);
    var slots = [];

    for (var week = 1; week <= structure.weeks; week++) {
      for (var workout = 1; workout <= structure.workoutsPerWeek; workout++) {
        var slotKey = "w" + week + "d" + workout;
        var exercises = Array.isArray(days[slotKey]) ? days[slotKey] : [];
        if (!exercises.length) {
          continue;
        }

        slots.push({
          slotKey: slotKey,
          label: resolveTemplateSlotLabel(slotKey, customNames, dayTypes)
        });
      }
    }

    return slots;
  }

  function resolveTemplateSlotLabel(slotKey, customNames, dayTypes) {
    var parsed = parseSlotKey(slotKey);
    var base = parsed ? "Week " + parsed.week + " - Workout " + parsed.workout : "Workout";
    var customLabel = customNames && customNames[slotKey] ? String(customNames[slotKey]).trim() : "";

    if (customLabel) {
      return customLabel;
    }

    if (dayLabels[slotKey]) {
      return dayLabels[slotKey];
    }

    var dayType = dayTypes && dayTypes[slotKey] ? String(dayTypes[slotKey]).trim() : "";
    if (dayType) {
      return base + " - " + capitalize(dayType) + " Day";
    }

    return base;
  }

  function generateScheduledDates(startDate, count) {
    var total = Math.max(0, parseInt(count, 10) || 0);
    if (!total) {
      return [];
    }

    var parts = String(startDate || "").split("-");
    if (parts.length !== 3) {
      return [];
    }

    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return [];
    }

    var cursor = new Date(year, month - 1, day);
    if (isNaN(cursor.getTime())) {
      return [];
    }

    var dates = [];
    for (var i = 0; i < total; i++) {
      dates.push(formatDateInputValue(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    return dates;
  }

  function formatDateInputValue(dateValue) {
    if (!(dateValue instanceof Date) || isNaN(dateValue.getTime())) {
      return "";
    }

    var year = dateValue.getFullYear();
    var month = String(dateValue.getMonth() + 1).padStart(2, "0");
    var day = String(dateValue.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function ensureAthleteTemplateAssignment(userId, programId, programName) {
    return state.client
      .from("user_training_programs")
      .select("id")
      .eq("user_id", userId)
      .eq("program_id", programId)
      .eq("is_active", true)
      .order("assigned_at", { ascending: false })
      .limit(1)
      .then(function (lookupResult) {
        if (lookupResult.error) {
          throw new Error(lookupResult.error.message || "Failed to lookup athlete template assignment.");
        }

        if (lookupResult.data && lookupResult.data.length && lookupResult.data[0].id) {
          return lookupResult.data[0];
        }

        return state.client
          .from("user_training_programs")
          .insert({
            user_id: userId,
            program_id: programId,
            program_name: programName,
            is_active: true,
            assigned_at: new Date().toISOString(),
            assigned_by: state.coachUserId
          })
          .select("id")
          .single()
          .then(function (insertResult) {
            if (insertResult.error || !insertResult.data || !insertResult.data.id) {
              throw new Error(
                insertResult && insertResult.error && insertResult.error.message
                  ? insertResult.error.message
                  : "Failed to assign template to athlete before scheduling."
              );
            }

            return insertResult.data;
          });
      });
  }

  function readExercisesForDayFromStorage(day) {
    var payload = readFromStorage(state.storagePrefix + day);
    if (payload && Array.isArray(payload.exercises)) {
      return payload.exercises;
    }
    return [];
  }

  function syncTemplateTargetsFromPlannerValues(exercises) {
    if (!Array.isArray(exercises)) {
      return [];
    }

    return exercises.map(function (exercise) {
      var safeExercise = exercise && typeof exercise === "object" ? exercise : {};
      var sets = Array.isArray(safeExercise.sets) ? safeExercise.sets : [];

      return {
        name: safeExercise.name || "Exercise",
        section: safeExercise.section || "A Block",
        mode: safeExercise.mode || "reps",
        superset_group: safeExercise.superset_group || null,
        field_toggles: normalizeExerciseFieldToggles(safeExercise.field_toggles, safeExercise.mode),
        sets: sets.map(function (set) {
          var source = set && typeof set === "object" ? set : {};
          var reps = source.reps != null ? source.reps : "";
          var weight = source.weight != null ? source.weight : "";
          var rpe = source.rpe != null ? source.rpe : "";
          var rest = source.rest != null ? source.rest : "";
          var notes = source.notes != null ? source.notes : "";

          return {
            reps: reps,
            weight: weight,
            rpe: rpe,
            rest: rest,
            notes: notes,
            done: !!source.done,
            target_reps: reps,
            target_weight: weight,
            target_rpe: rpe,
            target_rest: rest,
            target_notes: notes
          };
        })
      };
    });
  }

  function hydrateDraftFromTemplate(templateId) {
    if (!state.client || !templateId || !isUuid(templateId)) {
      return;
    }

    state.client
      .from("training_programs")
      .select("id,name,description")
      .eq("id", templateId)
      .single()
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        var row = result.data || {};
        var payload = parseTemplatePayload(row.description);
        if (!payload) {
          setStatus("Template content could not be parsed.", "error");
          return;
        }

        state.structure = normalizeStructure(payload.structure || deriveStructureFromDays(payload.days));
        state.templateFocus = normalizeTemplateFocus(payload.focus);
        state.daySessionTypes = normalizeDaySessionTypes(payload.day_session_types);
        state.customDayNames = normalizeCustomDayNames(payload.custom_day_names);
        state.customDayNameMode = normalizeCustomDayNameMode(payload.custom_day_name_mode);
        ensureDaySessionTypesForStructure();
        var normalizedDays = normalizeTemplateDays(payload.days);
        var daySelect = document.querySelector("[data-workout-day]");
        if (daySelect) {
          refreshWorkoutDaySelect(daySelect);
          state.day = daySelect.value || getAllSlotKeys()[0] || "w1d1";
        }

        state.templateName = row.name || "";
        var nameInput = document.querySelector("[data-template-name]");
        if (nameInput) {
          nameInput.value = state.templateName;
        }
        var weeksInput = document.querySelector("[data-template-weeks]");
        var workoutsInput = document.querySelector("[data-template-workouts-per-week]");
        if (weeksInput) {
          weeksInput.value = String(state.structure.weeks);
        }
        if (workoutsInput) {
          workoutsInput.value = String(state.structure.workoutsPerWeek);
        }
        var focusInput = document.querySelector("[data-template-focus]");
        if (focusInput) {
          focusInput.value = state.templateFocus;
        }
        setProgramTitleFromQuery();

        getAllSlotKeys().forEach(function (slotKey) {
          var exercises = normalizedDays[slotKey] || [];
          writeToStorage(TEMPLATE_DRAFT_PREFIX + slotKey, {
            exercises: Array.isArray(exercises) ? exercises : [],
            saved_at: new Date().toISOString()
          });
        });

        loadExercisesForDay();
        renderRows();
        updateDayInfo();
        refreshTemplateDayTools();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to load template.", "error");
      });
  }

  function clearBuilderDrafts() {
    try {
      var keysToDelete = [];
      for (var i = 0; i < window.localStorage.length; i++) {
        var key = window.localStorage.key(i);
        if (key && key.indexOf(TEMPLATE_DRAFT_PREFIX) === 0) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(function (key) {
        window.localStorage.removeItem(key);
      });
    } catch (e) {
      // Ignore localStorage cleanup errors.
    }
  }

  function hydrateAssignedTemplate(templateId) {
    if (!state.client || !templateId || !isUuid(templateId)) {
      return;
    }

    state.client
      .from("training_programs")
      .select("id,name,description")
      .eq("id", templateId)
      .single()
      .then(function (result) {
        if (result.error) {
          return;
        }

        var row = result.data || {};
        var payload = parseTemplatePayload(row.description);
        if (!payload || !payload.days) {
          return;
        }

        state.structure = normalizeStructure(payload.structure || deriveStructureFromDays(payload.days));
        state.templateFocus = normalizeTemplateFocus(payload.focus);
        state.daySessionTypes = normalizeDaySessionTypes(payload.day_session_types);
        state.customDayNames = normalizeCustomDayNames(payload.custom_day_names);
        state.customDayNameMode = normalizeCustomDayNameMode(payload.custom_day_name_mode);
        ensureDaySessionTypesForStructure();
        var daySelect = document.querySelector("[data-workout-day]");
        if (daySelect) {
          refreshWorkoutDaySelect(daySelect);
          state.day = daySelect.value || getAllSlotKeys()[0] || "w1d1";
        }

        state.assignedTemplateDays = normalizeAssignedTemplateDays(payload.days);
        if (!new URLSearchParams(window.location.search).get("program") && row.name) {
          state.templateName = row.name;
        }

        loadExercisesForDay();
        renderRows();
        updateDayInfo();
        refreshTemplateDayTools();
        updateStats();
      })
      .catch(function () {
        // Leave default fallback behavior intact.
      });
  }

  function cloneExercises(exercises) {
    try {
      return JSON.parse(JSON.stringify(exercises || []));
    } catch (e) {
      return Array.isArray(exercises) ? exercises.slice() : [];
    }
  }

  function normalizeAssignedTemplateDays(days) {
    var normalized = normalizeTemplateDays(days);
    var mapped = {};

    Object.keys(normalized).forEach(function (slotKey) {
      mapped[slotKey] = createAthleteLogExercises(normalized[slotKey]);
    });

    return mapped;
  }

  function createAthleteLogExercises(exercises) {
    var exercisesArray;
    
    // Handle both array and object-with-numeric-keys formats
    if (Array.isArray(exercises)) {
      exercisesArray = exercises;
    } else if (exercises && typeof exercises === "object") {
      // Convert object with numeric keys to array
      exercisesArray = [];
      for (var i = 0; i < 1000; i++) {
        if (exercises.hasOwnProperty(i)) {
          exercisesArray.push(exercises[i]);
        } else {
          break;
        }
      }
      // If no numeric keys found but has an exercises property, use that
      if (exercisesArray.length === 0 && Array.isArray(exercises.exercises)) {
        exercisesArray = exercises.exercises;
      }
    } else {
      return [];
    }

    if (!Array.isArray(exercisesArray)) {
      return [];
    }

    return exercisesArray.map(function (exercise) {
      var sets = Array.isArray(exercise && exercise.sets) ? exercise.sets : [];
      return {
        name: exercise && exercise.name ? exercise.name : "Exercise",
        section: exercise && exercise.section ? exercise.section : "A Block",
        mode: exercise && exercise.mode ? exercise.mode : "reps",
        superset_group: exercise ? exercise.superset_group || null : null,
        library_id: exercise ? exercise.library_id || null : null,
        video_demo_url: exercise ? exercise.video_demo_url || "" : "",
        field_toggles: normalizeExerciseFieldToggles(exercise && exercise.field_toggles, exercise && exercise.mode),
        sets: sets.map(function (set) {
          var source = set || {};
          return {
            reps: "",
            weight: "",
            rpe: "",
            rest: "",
            notes: "",
            done: false,
            target_reps: resolveTemplateTarget(source.target_reps, source.reps),
            target_weight: resolveTemplateTarget(source.target_weight, source.weight),
            target_rpe: resolveTemplateTarget(source.target_rpe, source.rpe),
            target_rest: resolveTemplateTarget(source.target_rest, source.rest),
            target_notes: resolveTemplateTarget(source.target_notes, source.notes)
          };
        })
      };
    });
  }

  function resolveTemplateTarget(explicitValue, fallbackValue) {
    if (explicitValue != null) {
      if (typeof explicitValue !== "string") {
        return explicitValue;
      }

      if (explicitValue.trim() !== "") {
        return explicitValue;
      }
    }

    if (fallbackValue == null) {
      return "";
    }

    return fallbackValue;
  }

  function mergeAthleteProgressIntoTemplate(templateExercises, storedExercises) {
    var templateList = Array.isArray(templateExercises) ? templateExercises : [];
    var storedList = Array.isArray(storedExercises) ? storedExercises : [];

    return templateList.map(function (templateExercise, exerciseIdx) {
      var storedExercise = storedList[exerciseIdx] && typeof storedList[exerciseIdx] === "object" ? storedList[exerciseIdx] : {};
      var templateSets = Array.isArray(templateExercise && templateExercise.sets) ? templateExercise.sets : [];
      var storedSets = Array.isArray(storedExercise.sets) ? storedExercise.sets : [];

      return {
        name: templateExercise && templateExercise.name ? templateExercise.name : "Exercise",
        section: templateExercise && templateExercise.section ? templateExercise.section : "A Block",
        mode: templateExercise && templateExercise.mode ? templateExercise.mode : "reps",
        superset_group: templateExercise ? templateExercise.superset_group || null : null,
        library_id: templateExercise ? templateExercise.library_id || null : null,
        video_demo_url: templateExercise ? templateExercise.video_demo_url || "" : "",
        field_toggles: normalizeExerciseFieldToggles(templateExercise && templateExercise.field_toggles, templateExercise && templateExercise.mode),
        sets: templateSets.map(function (templateSet, setIdx) {
          var storedSet = storedSets[setIdx] && typeof storedSets[setIdx] === "object" ? storedSets[setIdx] : {};
          var targetReps = resolveTemplateTarget(templateSet && templateSet.target_reps, templateSet && templateSet.reps);
          var targetWeight = resolveTemplateTarget(templateSet && templateSet.target_weight, templateSet && templateSet.weight);
          var targetRpe = resolveTemplateTarget(templateSet && templateSet.target_rpe, templateSet && templateSet.rpe);
          var targetRest = resolveTemplateTarget(templateSet && templateSet.target_rest, templateSet && templateSet.rest);
          var targetNotes = resolveTemplateTarget(templateSet && templateSet.target_notes, templateSet && templateSet.notes);

          return {
            reps: storedSet.reps != null ? storedSet.reps : "",
            weight: storedSet.weight != null ? storedSet.weight : "",
            rpe: storedSet.rpe != null ? storedSet.rpe : "",
            rest: storedSet.rest != null ? storedSet.rest : "",
            notes: storedSet.notes != null ? storedSet.notes : "",
            done: !!storedSet.done,
            target_reps: targetReps,
            target_weight: targetWeight,
            target_rpe: targetRpe,
            target_rest: targetRest,
            target_notes: targetNotes
          };
        })
      };
    });
  }

  function normalizeAthleteLogExercises(exercises) {
    if (!Array.isArray(exercises)) {
      return [];
    }

    return exercises.map(function (exercise) {
      var sets = Array.isArray(exercise && exercise.sets) ? exercise.sets : [];
      return {
        name: exercise && exercise.name ? exercise.name : "Exercise",
        section: exercise && exercise.section ? exercise.section : "A Block",
        mode: exercise && exercise.mode ? exercise.mode : "reps",
        superset_group: exercise ? exercise.superset_group || null : null,
        library_id: exercise ? exercise.library_id || null : null,
        video_demo_url: exercise ? exercise.video_demo_url || "" : "",
        field_toggles: normalizeExerciseFieldToggles(exercise && exercise.field_toggles, exercise && exercise.mode),
        sets: sets.map(function (set) {
          var source = set || {};
          return {
            reps: source.reps != null ? source.reps : "",
            weight: source.weight != null ? source.weight : "",
            rpe: source.rpe != null ? source.rpe : "",
            rest: source.rest != null ? source.rest : "",
            notes: source.notes != null ? source.notes : "",
            done: !!source.done,
            // Backfill targets from legacy template fields when explicit target_* fields are missing.
            target_reps: source.target_reps != null ? source.target_reps : source.reps || "",
            target_weight: source.target_weight != null ? source.target_weight : source.weight || "",
            target_rpe: source.target_rpe != null ? source.target_rpe : source.rpe || "",
            target_rest: source.target_rest != null ? source.target_rest : source.rest || "",
            target_notes: source.target_notes != null ? source.target_notes : source.notes || ""
          };
        })
      };
    });
  }

  function displayAthleteInputValue(value, target, done) {
    var current = String(value != null ? value : "");
    var planned = String(target != null ? target : "");

    if (state.isAthleteLockedView && !done && planned && current === planned) {
      return "";
    }

    return current;
  }

  function buildPrintTargetMarkup(target) {
    var text = String(target != null ? target : "").trim();
    if (!text) {
      return "";
    }

    return '<span class="program-print-target">' + escapeHtml(text) + '</span>';
  }

  function openWorkoutPrintPreview() {
    var previewWindow = window.open("", "nomadic-workout-print-preview", "width=1200,height=900");
    if (!previewWindow) {
      setStatus("Please allow pop-ups to open the print preview.", "error");
      return;
    }

    previewWindow.document.open();
    previewWindow.document.write(buildWorkoutPrintDocument());
    previewWindow.document.close();
    previewWindow.focus();
  }

  function openFullPlanPrintPreview() {
    var previewWindow = window.open("", "nomadic-full-plan-print-preview", "width=1400,height=960");
    if (!previewWindow) {
      setStatus("Please allow pop-ups to open the full-plan print preview.", "error");
      return;
    }

    previewWindow.document.open();
    previewWindow.document.write(buildFullPlanPrintDocument());
    previewWindow.document.close();
    previewWindow.focus();
  }

  function buildWorkoutPrintDocument() {
    var exercises = Array.isArray(state.exercises) ? state.exercises : [];
    var programTitle = resolvePrintProgramTitle("Workout Program");
    var dayTitle = String(labelForSlot(state.day) || "Workout Day").trim();
    var generatedAt = new Date().toLocaleDateString();
    var athleteLabel = resolvePrintAthleteLabel();

    var sectionOrder = [];
    defaultSections.forEach(function (section) {
      sectionOrder.push(section);
    });

    exercises.forEach(function (exercise) {
      var sectionName = String((exercise && exercise.section) || "Workout").trim() || "Workout";
      if (sectionOrder.indexOf(sectionName) === -1) {
        sectionOrder.push(sectionName);
      }
    });

    var groupedExercises = sectionOrder.reduce(function (accumulator, sectionName) {
      accumulator[sectionName] = [];
      return accumulator;
    }, {});

    exercises.forEach(function (exercise) {
      var sectionName = String((exercise && exercise.section) || "Workout").trim() || "Workout";
      if (!groupedExercises[sectionName]) {
        groupedExercises[sectionName] = [];
      }
      groupedExercises[sectionName].push(exercise);
    });

    var sectionEntries = sectionOrder
      .map(function (sectionName) {
        var exercisesInSection = groupedExercises[sectionName] || [];
        if (!exercisesInSection.length) {
          return null;
        }

        var sectionScore = 0;
        var cardsHtml = exercisesInSection
          .map(function (exerciseItem) {
            var fieldToggles = normalizeExerciseFieldToggles(exerciseItem && exerciseItem.field_toggles, exerciseItem && exerciseItem.mode);
            var sets = Array.isArray(exerciseItem && exerciseItem.sets) ? exerciseItem.sets : [];
            var columns = [{ key: "reps", label: "Reps", value: function (set) { return set.target_reps || set.reps || ""; } }];

            if (fieldToggles.showWeight) {
              columns.push({ key: "weight", label: fieldToggles.secondaryLabel || "Weight / Time", value: function (set) { return set.target_weight || set.weight || ""; } });
            }

            if (fieldToggles.showRpe) {
              columns.push({ key: "rpe", label: "RPE / Zone", value: function (set) { return set.target_rpe || set.rpe || ""; } });
            }

            if (fieldToggles.showRest) {
              columns.push({ key: "rest", label: "Rest", value: function (set) { return set.target_rest || set.rest || ""; } });
            }

            sectionScore += Math.max(1, sets.length) * Math.max(2, columns.length);

            var headerCells = ['<th class="print-col-set">Set</th>'];
            columns.forEach(function (column) {
              headerCells.push('<th>' + escapeHtml(column.label) + '</th>');
            });

            var rowsHtml = sets
              .map(function (set, setIdx) {
                var cells = ['<td class="print-col-set">' + (setIdx + 1) + '</td>'];
                columns.forEach(function (column) {
                  var value = column.value(set);
                  cells.push('<td>' + escapeHtml(String(value != null ? value : "").trim() || "—") + '</td>');
                });
                return '<tr>' + cells.join("") + '</tr>';
              })
              .join("");

            return [
              '<article class="print-card">',
              '<div class="print-card-head">',
              '<div>',
              '<h2 class="print-exercise-name">' + escapeHtml(exerciseItem.name || "Exercise") + '</h2>',
              '<div class="print-exercise-mode">' + escapeHtml(modeLabel(exerciseItem.mode)) + '</div>',
              '</div>',
              '</div>',
              '<table class="print-set-table">',
              '<thead><tr>' + headerCells.join("") + '</tr></thead>',
              '<tbody>' + rowsHtml + '</tbody>',
              '</table>',
              '</article>'
            ].join("");
          })
          .join("");

        return {
          sectionName: sectionName,
          cardsCount: exercisesInSection.length,
          score: Math.max(1, sectionScore),
          html: [
            '<section class="print-section-block">',
            '<div class="print-section-header">',
            '<div class="print-section-title">' + escapeHtml(sectionName) + '</div>',
            '<div class="print-section-count">' + exercisesInSection.length + ' exercise' + (exercisesInSection.length === 1 ? '' : 's') + '</div>',
            '</div>',
            '<div class="print-cards-grid">' + cardsHtml + '</div>',
            '</section>'
          ].join("")
        };
      })
      .filter(function (entry) {
        return !!entry;
      });

    var totalScore = sectionEntries.reduce(function (sum, entry) {
      return sum + entry.score;
    }, 0);

    var frontScore = 0;
    var backScore = 0;
    var frontCards = 0;
    var backCards = 0;
    var frontHtmlParts = [];
    var backHtmlParts = [];
    var splitTarget = Math.ceil(totalScore / 2);

    sectionEntries.forEach(function (entry, index) {
      var isLast = index === sectionEntries.length - 1;
      var shouldGoFront = frontScore < splitTarget || backHtmlParts.length === 0;

      if (shouldGoFront && !isLast) {
        frontHtmlParts.push(entry.html);
        frontScore += entry.score;
        frontCards += entry.cardsCount;
      } else {
        backHtmlParts.push(entry.html);
        backScore += entry.score;
        backCards += entry.cardsCount;
      }
    });

    if (!backHtmlParts.length && frontHtmlParts.length > 1) {
      var moved = frontHtmlParts.pop();
      backHtmlParts.push(moved);
      var movedEntry = sectionEntries[sectionEntries.length - 1];
      if (movedEntry) {
        frontScore -= movedEntry.score;
        frontCards -= movedEntry.cardsCount;
        backScore += movedEntry.score;
        backCards += movedEntry.cardsCount;
      }
    }

    function sideDensityClass(score, cards) {
      if (score > 185 || cards > 16) {
        return " print-side-ultra";
      }
      if (score > 130 || cards > 11) {
        return " print-side-dense";
      }
      return "";
    }

    var frontSideClass = "print-side print-front" + sideDensityClass(frontScore, frontCards);
    var backSideClass = "print-side print-back" + sideDensityClass(backScore, backCards);
    var frontSectionsHtml = frontHtmlParts.join("");
    var backSectionsHtml = backHtmlParts.join("");

    return [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '<meta charset="UTF-8" />',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      '<title>' + escapeHtml(programTitle + " - " + dayTitle + " Print") + '</title>',
      '<style>',
      '@page { size: landscape; margin: 0.3in; }',
      'html, body { margin: 0; padding: 0; }',
      'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif; color: #1f1f1f; background: #fff; }',
      '.sheet { padding: 0; }',
      '.sheet-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; margin-bottom: 0.14in; padding-bottom: 0.05in; border-bottom: 2px solid #c56a2c; }',
      '.sheet-title { font-size: 20px; font-weight: 800; line-height: 1.1; margin: 0; color: #0f2d2d; letter-spacing: -0.01em; }',
      '.sheet-meta { text-align: right; font-size: 8.5px; color: #6a5e52; line-height: 1.4; }',
      '.sheet-subtitle { font-size: 10px; color: #5a5048; margin-top: 3px; }',
      '.print-side + .print-side { break-before: page; page-break-before: always; }',
      '.print-side-label { font-size: 7px; text-transform: uppercase; letter-spacing: 0.14em; color: #c56a2c; margin-bottom: 0.05in; font-weight: 700; }',
      '.print-sections { display: block; }',
      '.print-section-block { border: 1px solid #ddd5c8; border-radius: 10px; padding: 0.1in 0.1in 0.09in; margin-bottom: 0.1in; background: #fffdfb; break-inside: avoid; page-break-inside: avoid; }',
      '.print-section-header { display: flex; justify-content: space-between; align-items: baseline; gap: 0.12in; margin-bottom: 0.07in; padding: 0.032in 0.07in; border-left: 3px solid #c56a2c; background: #fdf5ed; border-radius: 0 5px 5px 0; }',
      '.print-section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.09em; color: #0f2d2d; }',
      '.print-section-count { font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.1em; color: #8a7a6a; white-space: nowrap; }',
      '.print-cards-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.08in; }',
      '.print-card { border: 1px solid #e0d5ca; border-radius: 8px; padding: 0.07in 0.08in 0.08in; break-inside: avoid; page-break-inside: avoid; background: #fff; }',
      '.print-card-head { display: flex; justify-content: space-between; gap: 0.12in; align-items: flex-start; margin-bottom: 0.05in; padding-bottom: 0.03in; border-bottom: 1px solid #ede5db; }',
      '.print-exercise-name { margin: 0; font-size: 10.5px; font-weight: 700; line-height: 1.14; color: #0f2d2d; }',
      '.print-exercise-mode { font-size: 6.5px; color: #5a4a38; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.028in; background: #f5f0e8; border-radius: 3px; padding: 0.007in 0.018in; }',
      '.print-set-table { width: 100%; border-collapse: collapse; table-layout: fixed; }',
      '.print-set-table th, .print-set-table td { border: 1px solid #e0d5ca; padding: 0.04in 0.04in; font-size: 7px; line-height: 1.2; text-align: left; vertical-align: top; }',
      '.print-set-table th { background: #f5f0e8; color: #0f2d2d; font-size: 6.5px; text-transform: uppercase; letter-spacing: 0.09em; font-weight: 700; }',
      '.print-set-table td { min-height: 0.2in; }',
      '.print-col-set { width: 0.38in; text-align: center; font-weight: 700; color: #0f2d2d; }',
      '.print-col-empty { width: 0.4in; }',
      '.print-side-dense .print-cards-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.06in; }',
      '.print-side-dense .print-section-block { padding: 0.09in 0.09in 0.08in; margin-bottom: 0.075in; }',
      '.print-side-dense .print-exercise-name { font-size: 10px; }',
      '.print-side-dense .print-set-table th, .print-side-dense .print-set-table td { padding: 0.03in 0.034in; font-size: 6.6px; }',
      '.print-side-ultra .print-cards-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.045in; }',
      '.print-side-ultra .print-section-block { padding: 0.07in 0.07in 0.06in; margin-bottom: 0.055in; border-radius: 8px; }',
      '.print-side-ultra .print-section-header { margin-bottom: 0.04in; padding: 0.022in 0.055in; }',
      '.print-side-ultra .print-section-title { font-size: 9px; letter-spacing: 0.08em; }',
      '.print-side-ultra .print-section-count { font-size: 6.5px; }',
      '.print-side-ultra .print-card { padding: 0.05in 0.055in; border-radius: 7px; }',
      '.print-side-ultra .print-exercise-name { font-size: 8.5px; line-height: 1.08; }',
      '.print-side-ultra .print-exercise-mode { font-size: 5.6px; margin-top: 0.016in; padding: 0.005in 0.013in; }',
      '.print-side-ultra .print-set-table th, .print-side-ultra .print-set-table td { padding: 0.02in 0.025in; font-size: 5.6px; line-height: 1.05; }',
      '.print-side-ultra .print-col-set { width: 0.28in; }',
      '.print-signoff { margin-top: 0.09in; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.2in; font-size: 8px; color: #5a4a38; font-weight: 600; }',
      '.print-sign-line { border-top: 1.5px solid #c56a2c; padding-top: 0.025in; min-height: 0.18in; }',
      '.print-footer { margin-top: 0.07in; font-size: 7.5px; color: #6a5e52; display: flex; justify-content: space-between; gap: 0.2in; border-top: 1px solid #e0d5ca; padding-top: 0.035in; }',
      '</style>',
      '<script>',
      'window.addEventListener("load", function () {',
      '  window.focus();',
      '  setTimeout(function () { window.print(); }, 150);',
      '});',
      'window.addEventListener("afterprint", function () { window.close(); });',
      '</script>',
      '</head>',
      '<body>',
      '<div class="sheet">',
      '<div class="sheet-header">',
      '<div>',
      '<h1 class="sheet-title">' + escapeHtml(programTitle) + '</h1>',
      '<div class="sheet-subtitle">' + escapeHtml(dayTitle) + ' - exercises only</div>',
      '<div class="sheet-subtitle">Athlete: ' + escapeHtml(athleteLabel) + '</div>',
      '</div>',
      '<div class="sheet-meta">Printed ' + escapeHtml(generatedAt) + '<br />Target values shown for paper tracking</div>',
      '</div>',
      '<section class="' + frontSideClass + '">',
      '<div class="print-side-label">Front</div>',
      '<div class="print-sections">' + frontSectionsHtml + '</div>',
      '</section>',
      '<section class="' + backSideClass + '">',
      '<div class="print-side-label">Back</div>',
      '<div class="print-sections">' + backSectionsHtml + '</div>',
      '<div class="print-signoff">',
      '<div class="print-sign-line">Athlete Signature</div>',
      '<div class="print-sign-line">Date</div>',
      '</div>',
      '<div class="print-footer"><span>Use this sheet to track reps, loads, and notes by hand.</span><span>' + escapeHtml(dayTitle) + '</span></div>',
      '</div>',
      '</section>',
      '</body>',
      '</html>'
    ].join("");
  }

  function buildFullPlanPrintDocument() {
    var slotKeys = getAllSlotKeys();
    var programTitle = resolvePrintProgramTitle("Training Plan");
    var generatedAt = new Date().toLocaleDateString();
    var athleteLabel = resolvePrintAthleteLabel();
    var dayEntries = slotKeys
      .map(function (slotKey) {
        var exercises = getExercisesForPrintForDay(slotKey);
        if (!exercises.length) {
          return null;
        }

        return {
          trackingScore: Math.max(1, countFullPlanPrintRows(exercises)),
          trackingHtml: [
            '<article class="plan-day-card">',
            '<div class="plan-day-head">',
            '<div class="plan-day-label">' + escapeHtml(labelForSlot(slotKey)) + '</div>',
            '<div class="plan-day-count">' + exercises.length + ' exercise' + (exercises.length === 1 ? '' : 's') + '</div>',
            '</div>',
            '<table class="plan-day-table">',
            '<thead><tr><th>Exercise</th><th>Target</th><th>Tracking</th><th>Notes</th></tr></thead>',
            '<tbody>' + buildFullPlanDayRows(exercises) + '</tbody>',
            '</table>',
            '</article>'
          ].join("")
        };
      })
      .filter(function (entry) {
        return !!entry;
      });

    var backHtmlParts = dayEntries.map(function (entry) {
      return entry.trackingHtml;
    });
    var backScore = dayEntries.reduce(function (sum, entry) {
      return sum + entry.trackingScore;
    }, 0);

    function densityClass(score, count) {
      if (score > 72 || count > 6) {
        return ' plan-page-micro';
      }
      if (score > 42 || count > 5) {
        return ' plan-page-ultra';
      }
      if (score > 26 || count > 3) {
        return ' plan-page-dense';
      }
      return '';
    }

    var backPageClass = 'plan-page' + densityClass(backScore, backHtmlParts.length);

    return [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '<meta charset="UTF-8" />',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      '<title>' + escapeHtml(programTitle + ' - Full Plan Print') + '</title>',
      '<style>',
      '@page { size: landscape; margin: 0.18in; }',
      'html, body { margin: 0; padding: 0; }',
      'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif; color: #1f1f1f; background: #fff; }',
      '.plan-sheet { padding: 0; }',
      '.plan-page + .plan-page { break-before: page; page-break-before: always; }',
      '.plan-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 0.45rem; margin-bottom: 0.06in; padding-bottom: 0.04in; border-bottom: 2px solid #c56a2c; }',
      '.plan-title-wrap { display: flex; flex-direction: column; gap: 0.014in; }',
      '.plan-kicker { font-size: 5.5px; text-transform: uppercase; letter-spacing: 0.14em; color: #c56a2c; font-weight: 700; }',
      '.plan-title { margin: 0; font-size: 14px; font-weight: 800; line-height: 1.02; color: #0f2d2d; letter-spacing: -0.01em; }',
      '.plan-subtitle { margin-top: 0; font-size: 6.5px; color: #6a5e52; }',
      '.plan-meta { text-align: right; font-size: 6px; color: #6a5e52; line-height: 1.18; }',
      '.plan-side-label { font-size: 6px; text-transform: uppercase; letter-spacing: 0.14em; color: #c56a2c; margin-bottom: 0.03in; font-weight: 700; }',
      '.plan-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.042in; }',
      '.plan-page-dense .plan-grid, .plan-page-ultra .plan-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.04in; }',
      '.plan-page-micro .plan-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.03in; }',
      '.plan-overview-card { border: 1px solid #ddd5c8; border-radius: 8px; padding: 0.035in; background: #fffdfb; break-inside: avoid; page-break-inside: avoid; }',
      '.plan-overview-head { display: flex; justify-content: space-between; gap: 0.05in; align-items: baseline; margin-bottom: 0.022in; padding: 0.018in 0.04in; border-left: 2.5px solid #c56a2c; background: #fdf5ed; border-radius: 0 3px 3px 0; }',
      '.plan-overview-title { font-size: 7.5px; font-weight: 800; color: #0f2d2d; line-height: 1.08; }',
      '.plan-overview-meta { font-size: 5px; color: #8a7a6a; text-transform: uppercase; letter-spacing: 0.07em; white-space: nowrap; }',
      '.plan-overview-section { margin-top: 0.022in; }',
      '.plan-overview-section:first-child { margin-top: 0; }',
      '.plan-overview-section-label { font-size: 4.8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #5a4030; margin-bottom: 0.012in; }',
      '.plan-overview-list { margin: 0; padding: 0 0 0 0.08in; }',
      '.plan-overview-list li { margin: 0 0 0.01in; padding: 0; font-size: 5px; line-height: 1.08; color: #2f2b28; }',
      '.plan-overview-list li:last-child { margin-bottom: 0; }',
      '.plan-day-card { border: 1px solid #ddd5c8; border-radius: 8px; padding: 0.035in; background: #fffdfb; break-inside: avoid; page-break-inside: avoid; }',
      '.plan-day-head { display: flex; justify-content: space-between; gap: 0.05in; align-items: baseline; margin-bottom: 0.025in; padding: 0.018in 0.04in; border-left: 2.5px solid #c56a2c; background: #fdf5ed; border-radius: 0 3px 3px 0; }',
      '.plan-day-label { font-size: 7.6px; font-weight: 800; color: #0f2d2d; line-height: 1.1; }',
      '.plan-day-count { font-size: 5.4px; color: #8a7a6a; text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }',
      '.plan-day-table { width: 100%; border-collapse: collapse; table-layout: fixed; }',
      '.plan-day-table th, .plan-day-table td { border: 1px solid #e0d5ca; padding: 0.016in 0.018in; font-size: 5.25px; line-height: 1.01; vertical-align: top; text-align: left; }',
      '.plan-day-table th { background: #f5f0e8; font-size: 4.8px; text-transform: uppercase; letter-spacing: 0.05em; color: #0f2d2d; font-weight: 700; }',
      '.plan-day-table tbody tr:nth-child(even):not(.plan-section-row) td { background: rgba(245, 240, 232, 0.4); }',
      '.plan-section-row td { background: #f0e8de; font-size: 4.8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #3a2818; border-top: 1px solid #d8c8b4; border-bottom: 1px solid #d8c8b4; }',
      '.plan-exercise-col { width: 31%; }',
      '.plan-target-col { width: 33%; }',
      '.plan-track-col { width: 18%; min-height: 0.14in; }',
      '.plan-note-col { width: 18%; min-height: 0.14in; }',
      '.plan-track-boxes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.008in; min-height: 0.13in; }',
      '.plan-track-box { border: 1px solid #d8cfc5; border-radius: 4px; min-height: 0.13in; padding: 0.008in 0.01in; display: flex; flex-direction: column; justify-content: space-between; background: #fffdfb; }',
      '.plan-track-box-label { font-size: 3.9px; text-transform: uppercase; letter-spacing: 0.05em; color: #8a7a6a; line-height: 1; }',
      '.plan-track-box-line { border-top: 1px solid #cfc6b9; margin-top: 0.016in; flex: 1; }',
      '.plan-note-lines { min-height: 0.13in; background-image: repeating-linear-gradient(to bottom, transparent 0, transparent 0.038in, #cfc6b9 0.038in, #cfc6b9 0.04in); }',
      '.plan-page-dense .plan-day-card { padding: 0.032in; }',
      '.plan-page-dense .plan-overview-card { padding: 0.03in; }',
      '.plan-page-dense .plan-overview-title { font-size: 6.8px; }',
      '.plan-page-dense .plan-overview-meta { font-size: 4.5px; }',
      '.plan-page-dense .plan-overview-section-label { font-size: 4.3px; }',
      '.plan-page-dense .plan-overview-list li { font-size: 4.5px; margin-bottom: 0.008in; }',
      '.plan-page-dense .plan-day-label { font-size: 7.2px; }',
      '.plan-page-dense .plan-day-table th, .plan-page-dense .plan-day-table td { font-size: 5px; padding: 0.015in 0.017in; }',
      '.plan-page-dense .plan-track-boxes { gap: 0.008in; min-height: 0.11in; }',
      '.plan-page-dense .plan-track-box { min-height: 0.11in; padding: 0.007in 0.008in; }',
      '.plan-page-dense .plan-track-box-label { font-size: 3.8px; }',
      '.plan-page-dense .plan-track-box-line { margin-top: 0.014in; }',
      '.plan-page-dense .plan-note-lines { min-height: 0.11in; background-image: repeating-linear-gradient(to bottom, transparent 0, transparent 0.032in, #cfc6b9 0.032in, #cfc6b9 0.034in); }',
      '.plan-page-ultra .plan-day-card { padding: 0.026in; border-radius: 7px; }',
      '.plan-page-ultra .plan-overview-card { padding: 0.024in; border-radius: 7px; }',
      '.plan-page-ultra .plan-overview-title { font-size: 6.1px; }',
      '.plan-page-ultra .plan-overview-meta { font-size: 4.1px; }',
      '.plan-page-ultra .plan-overview-section-label { font-size: 3.9px; margin-bottom: 0.009in; }',
      '.plan-page-ultra .plan-overview-list { padding-left: 0.055in; }',
      '.plan-page-ultra .plan-overview-list li { font-size: 4px; margin-bottom: 0.006in; line-height: 1.02; }',
      '.plan-page-ultra .plan-day-head { margin-bottom: 0.024in; padding: 0.013in 0.034in; }',
      '.plan-page-ultra .plan-overview-head { padding: 0.013in 0.034in; }',
      '.plan-page-ultra .plan-day-label { font-size: 6.6px; }',
      '.plan-page-ultra .plan-day-count { font-size: 4.8px; }',
      '.plan-page-ultra .plan-day-table th, .plan-page-ultra .plan-day-table td { font-size: 4.6px; padding: 0.012in 0.013in; line-height: 1; }',
      '.plan-page-ultra .plan-track-boxes { gap: 0.006in; min-height: 0.09in; }',
      '.plan-page-ultra .plan-track-box { min-height: 0.09in; padding: 0.005in 0.006in; }',
      '.plan-page-ultra .plan-track-box-label { font-size: 3.4px; }',
      '.plan-page-ultra .plan-track-box-line { margin-top: 0.01in; }',
      '.plan-page-ultra .plan-note-lines { min-height: 0.09in; background-image: repeating-linear-gradient(to bottom, transparent 0, transparent 0.026in, #cfc6b9 0.026in, #cfc6b9 0.027in); }',
      '.plan-page-micro .plan-header { margin-bottom: 0.05in; }',
      '.plan-page-micro .plan-title { font-size: 12px; }',
      '.plan-page-micro .plan-subtitle { display: none; }',
      '.plan-page-micro .plan-meta { font-size: 5.5px; line-height: 1.1; }',
      '.plan-page-micro .plan-overview-card { padding: 0.018in; border-radius: 5px; }',
      '.plan-page-micro .plan-overview-head { margin-bottom: 0.014in; padding: 0.009in 0.022in; }',
      '.plan-page-micro .plan-overview-title { font-size: 5.2px; }',
      '.plan-page-micro .plan-overview-meta { font-size: 3.6px; }',
      '.plan-page-micro .plan-overview-section { margin-top: 0.014in; }',
      '.plan-page-micro .plan-overview-section-label { font-size: 3.4px; margin-bottom: 0.006in; }',
      '.plan-page-micro .plan-overview-list { padding-left: 0.045in; }',
      '.plan-page-micro .plan-overview-list li { font-size: 3.5px; margin-bottom: 0.004in; line-height: 1; }',
      '.plan-page-micro .plan-day-card { padding: 0.02in; border-radius: 6px; }',
      '.plan-page-micro .plan-day-head { margin-bottom: 0.018in; padding: 0.009in 0.022in; }',
      '.plan-page-micro .plan-day-label { font-size: 5.8px; line-height: 1; }',
      '.plan-page-micro .plan-day-count { font-size: 4.2px; }',
      '.plan-page-micro .plan-day-table th, .plan-page-micro .plan-day-table td { font-size: 4px; padding: 0.009in 0.01in; line-height: 0.98; }',
      '.plan-page-micro .plan-day-table th { font-size: 3.8px; }',
      '.plan-page-micro .plan-section-row td { font-size: 3.8px; }',
      '.plan-page-micro .plan-track-boxes { gap: 0.004in; min-height: 0.072in; }',
      '.plan-page-micro .plan-track-box { min-height: 0.072in; padding: 0.004in 0.005in; }',
      '.plan-page-micro .plan-track-box-label { font-size: 2.9px; }',
      '.plan-page-micro .plan-track-box-line { margin-top: 0.007in; }',
      '.plan-page-micro .plan-note-lines { min-height: 0.072in; background-image: repeating-linear-gradient(to bottom, transparent 0, transparent 0.02in, #a8c8c8 0.02in, #a8c8c8 0.021in); }',
      '.plan-page-micro .plan-footer { display: none; }',
      '.plan-footer { margin-top: 0.04in; font-size: 5.8px; color: #6a5e52; display: flex; justify-content: space-between; gap: 0.12in; border-top: 1px solid #e0d5ca; padding-top: 0.028in; }',
      '</style>',
      '<script>',
      'window.addEventListener("load", function () {',
      '  window.focus();',
      '  setTimeout(function () { window.print(); }, 150);',
      '});',
      'window.addEventListener("afterprint", function () { window.close(); });',
      '</script>',
      '</head>',
      '<body>',
      '<div class="plan-sheet">',
      '<section class="' + backPageClass + '">',
      '<div class="plan-header"><div class="plan-title-wrap"><div class="plan-kicker">Nomadic Performance</div><h1 class="plan-title">' + escapeHtml(programTitle) + '</h1><div class="plan-subtitle">Athlete: ' + escapeHtml(athleteLabel) + '</div></div><div class="plan-meta">Printed ' + escapeHtml(generatedAt) + '<br />Record loads, reps &amp; notes by hand</div></div>',
      '<div class="plan-grid">' + backHtmlParts.join('') + '</div>',
      '<div class="plan-footer"><span>Record actual loads, completed work, and progress notes by hand.</span><span>' + escapeHtml(programTitle) + '</span></div>',
      '</section>',
      '</div>',
      '</body>',
      '</html>'
    ].join('');
  }

  function resolvePrintAthleteLabel() {
    var label = String(state.athleteName || "").trim();
    if (label) {
      return label;
    }

    return "Athlete";
  }

  function resolvePrintProgramTitle(fallbackTitle) {
    var fallback = String(fallbackTitle || "Workout Program").trim() || "Workout Program";
    var heading = document.querySelector("[data-program-title]");
    var headingText = String(heading && heading.textContent || "").trim();

    if (headingText && headingText.toLowerCase() !== "loading...") {
      return headingText;
    }

    try {
      var params = new URLSearchParams(window.location.search || "");
      var programName = String(params.get("program") || "").trim();
      if (programName) {
        return programName;
      }
    } catch (e) {
      // Ignore malformed query parameters.
    }

    var templateName = String(state.templateName || "").trim();
    if (templateName) {
      return templateName;
    }

    return fallback;
  }

  function buildFullPlanOverviewCard(slotKey, exercises) {
    var grouped = groupExercisesForFullPlanPrint(exercises);
    var sectionsHtml = grouped
      .map(function (group) {
        var itemsHtml = group.exercises
          .map(function (exercise) {
            return '<li><strong>' + escapeHtml(exercise.name || 'Exercise') + '</strong> <span>' + escapeHtml(summarizeExerciseTargetsForPrint(exercise, exercise && exercise.sets)) + '</span></li>';
          })
          .join('');

        return [
          '<section class="plan-overview-section">',
          '<div class="plan-overview-section-label">' + escapeHtml(group.section) + '</div>',
          '<ul class="plan-overview-list">' + itemsHtml + '</ul>',
          '</section>'
        ].join('');
      })
      .join('');

    return [
      '<article class="plan-overview-card">',
      '<div class="plan-overview-head">',
      '<div class="plan-overview-title">' + escapeHtml(labelForSlot(slotKey)) + '</div>',
      '<div class="plan-overview-meta">' + exercises.length + ' exercise' + (exercises.length === 1 ? '' : 's') + '</div>',
      '</div>',
      sectionsHtml,
      '</article>'
    ].join('');
  }

  function countFullPlanOverviewRows(exercises) {
    return groupExercisesForFullPlanPrint(exercises).reduce(function (sum, group) {
      return sum + 1 + group.exercises.length;
    }, 0);
  }

  function getExercisesForPrintForDay(slotKey) {
    var payload = readFromStorage(state.storagePrefix + slotKey);
    var storedExercises = payload && Array.isArray(payload.exercises) ? cloneExercises(payload.exercises) : null;
    var assignedExercises = state.assignedTemplateDays && Array.isArray(state.assignedTemplateDays[slotKey])
      ? cloneExercises(state.assignedTemplateDays[slotKey])
      : null;

    if (state.isAthleteLockedView && assignedExercises) {
      var merged = storedExercises
        ? mergeAthleteProgressIntoTemplate(assignedExercises, storedExercises)
        : assignedExercises;
      return normalizeExercisesArray(merged);
    }

    if (storedExercises) {
      return normalizeExercisesArray(storedExercises);
    }

    if (assignedExercises) {
      return normalizeExercisesArray(assignedExercises);
    }

    return [];
  }

  function buildFullPlanDayRows(exercises) {
    var grouped = groupExercisesForFullPlanPrint(exercises);
    var rows = [];

    grouped.forEach(function (group) {
      rows.push('<tr class="plan-section-row"><td colspan="4">' + escapeHtml(group.section) + '</td></tr>');

      group.exercises.forEach(function (exercise) {
        rows.push([
          '<tr>',
          '<td class="plan-exercise-col"><strong>' + escapeHtml(exercise.name || 'Exercise') + '</strong></td>',
          '<td class="plan-target-col">' + escapeHtml(summarizeExerciseTargetsForPrint(exercise, exercise && exercise.sets)) + '</td>',
          '<td class="plan-track-col"><div class="plan-track-boxes"><div class="plan-track-box"><span class="plan-track-box-label">Load</span><span class="plan-track-box-line"></span></div><div class="plan-track-box"><span class="plan-track-box-label">Reps</span><span class="plan-track-box-line"></span></div></div></td>',
          '<td class="plan-note-col"><div class="plan-note-lines"></div></td>',
          '</tr>'
        ].join(''));
      });
    });

    return rows.join('');
  }

  function countFullPlanPrintRows(exercises) {
    return groupExercisesForFullPlanPrint(exercises).reduce(function (sum, group) {
      var exerciseRows = group.exercises.length;
      return sum + 1 + exerciseRows;
    }, 0);
  }

  function groupExercisesForFullPlanPrint(exercises) {
    var sectionOrder = defaultSections.slice();
    var grouped = {};

    sectionOrder.forEach(function (section) {
      grouped[section] = [];
    });

    (Array.isArray(exercises) ? exercises : []).forEach(function (exercise) {
      var section = String((exercise && exercise.section) || 'Workout').trim() || 'Workout';
      if (!grouped[section]) {
        grouped[section] = [];
        sectionOrder.push(section);
      }
      grouped[section].push(exercise);
    });

    return sectionOrder
      .map(function (section) {
        return {
          section: section,
          exercises: grouped[section] || []
        };
      })
      .filter(function (group) {
        return group.exercises.length > 0;
      });
  }

  function summarizeExerciseTargetsForPrint(exercise, sets) {
    var safeSets = Array.isArray(sets) ? sets : [];
    if (!safeSets.length) {
      return 'No sets assigned';
    }

    var first = safeSets[0] || {};
    var reps = resolveTemplateTarget(first.target_reps, first.reps) || modePrimaryPlaceholder(exercise && exercise.mode);
    var weight = resolveTemplateTarget(first.target_weight, first.weight);
    var rpe = resolveTemplateTarget(first.target_rpe, first.rpe);
    var summary = String(safeSets.length) + ' set' + (safeSets.length === 1 ? '' : 's') + ' x ' + String(reps || '');

    if (weight) {
      summary += ' @ ' + String(weight);
    }
    if (rpe) {
      summary += ' | ' + String(rpe);
    }

    return summary;
  }

  function isUuid(value) {
    var uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(String(value || ""));
  }

  function createSupabaseClient() {
    if (!window.supabase || !window.supabase.createClient) {
      return null;
    }

    var url = window.NOMADIC_SUPABASE_URL;
    var key = window.NOMADIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return null;
    }

    try {
      return window.supabase.createClient(url, key);
    } catch (e) {
      return null;
    }
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
      focus: normalizeTemplateFocus(payload && payload.focus),
      day_session_types: normalizeDaySessionTypes(payload && payload.day_session_types),
      custom_day_names: normalizeCustomDayNames(payload && payload.custom_day_names),
      custom_day_name_mode: normalizeCustomDayNameMode(payload && payload.custom_day_name_mode),
      structure: normalizeStructure(payload && payload.structure),
      days: payload && payload.days ? payload.days : {}
    };
    return TEMPLATE_MARKER + JSON.stringify(safePayload);
  }

  function normalizeCustomDayNameMode(mode) {
    return String(mode || "").toLowerCase() === "full-label" ? "full-label" : "legacy-suffix";
  }

  function normalizeStructure(structure) {
    var weeks = parseInt((structure && structure.weeks) || 1, 10);
    var workoutsPerWeek = parseInt((structure && structure.workoutsPerWeek) || 3, 10);

    return {
      weeks: Math.max(1, Math.min(24, isNaN(weeks) ? 1 : weeks)),
      workoutsPerWeek: Math.max(1, Math.min(14, isNaN(workoutsPerWeek) ? 3 : workoutsPerWeek))
    };
  }

  function getAllSlotKeys() {
    var slots = [];
    for (var week = 1; week <= state.structure.weeks; week++) {
      for (var workout = 1; workout <= state.structure.workoutsPerWeek; workout++) {
        slots.push("w" + week + "d" + workout);
      }
    }
    return slots;
  }

  function refreshWorkoutDaySelect(daySelect) {
    if (!daySelect) {
      return;
    }

    var current = state.day;
    var slots = getAllSlotKeys();
    daySelect.innerHTML = slots
      .map(function (slotKey) {
        return '<option value="' + slotKey + '">' + escapeHtml(labelForSlot(slotKey)) + '</option>';
      })
      .join("");

    if (current && daySelect.querySelector('option[value="' + current + '"]')) {
      daySelect.value = current;
    } else if (slots.length > 0) {
      daySelect.value = slots[0];
    }
  }

  function parseSlotKey(slotKey) {
    var match = /^w(\d+)d(\d+)$/i.exec(String(slotKey || ""));
    if (!match) {
      return null;
    }

    return {
      week: parseInt(match[1], 10),
      workout: parseInt(match[2], 10)
    };
  }

  function labelForSlot(slotKey) {
    var parsed = parseSlotKey(slotKey);
    if (!parsed) {
      return "Workout";
    }

    var base = "Week " + parsed.week + " - Workout " + parsed.workout;
    var customLabel = state.customDayNames && state.customDayNames[slotKey];
    if (customLabel) {
      if (state.customDayNameMode === "full-label") {
        return customLabel;
      }
      return base + " - " + customLabel;
    }
    if (dayLabels[slotKey]) {
      return base + " - " + dayLabels[slotKey];
    }
    return base;
  }

  function normalizeCustomDayNames(map) {
    var source = map && typeof map === "object" ? map : {};
    var normalized = {};

    Object.keys(source).forEach(function (slotKey) {
      if (!/^w\d+d\d+$/i.test(slotKey)) {
        return;
      }

      var label = String(source[slotKey] || "").trim();
      if (label) {
        normalized[slotKey] = label;
      }
    });

    return normalized;
  }

  function normalizeTemplateDays(days) {
    var source = days && typeof days === "object" ? days : {};
    var keys = Object.keys(source);
    var alreadyNormalized = keys.some(function (key) {
      return /^w\d+d\d+$/i.test(key);
    });

    if (alreadyNormalized) {
      return source;
    }

    var mapped = {};
    keys.forEach(function (key) {
      var legacyMatch = /^day-(\d+)$/i.exec(key);
      if (!legacyMatch) {
        return;
      }

      var workoutIndex = parseInt(legacyMatch[1], 10);
      if (isNaN(workoutIndex) || workoutIndex < 1) {
        return;
      }

      mapped["w1d" + workoutIndex] = source[key];
    });

    return mapped;
  }

  function deriveStructureFromDays(days) {
    var normalized = normalizeTemplateDays(days);
    var slotKeys = Object.keys(normalized);
    if (!slotKeys.length) {
      return null;
    }

    var maxWeek = 1;
    var maxWorkout = 1;

    slotKeys.forEach(function (slotKey) {
      var parsed = parseSlotKey(slotKey);
      if (!parsed) {
        return;
      }
      maxWeek = Math.max(maxWeek, parsed.week);
      maxWorkout = Math.max(maxWorkout, parsed.workout);
    });

    return {
      weeks: maxWeek,
      workoutsPerWeek: maxWorkout
    };
  }

  function renderRows() {
    var tbody = document.querySelector("[data-workout-rows]");
    var emptyState = document.querySelector("[data-empty-state]");
    var tableWrap = document.querySelector(".program-demo-table-wrap");
    var mobileLog = document.querySelector("[data-athlete-mobile-log]");
    
    if (!tbody) {
      return;
    }

    tbody.innerHTML = "";

    if (mobileLog && state.isAthleteLockedView) {
      persistAthleteMobileOpenState(mobileLog);
    }

    if (mobileLog) {
      mobileLog.innerHTML = "";
    }

    if (!state.exercises || state.exercises.length === 0) {
      updateTableHeaders();
      if (tableWrap) {
        tableWrap.style.display = "block";
      }
      if (mobileLog) {
        mobileLog.style.display = "none";
      }
      if (emptyState) {
        emptyState.style.display = "block";
      }
      return;
    }

    if (emptyState) {
      emptyState.style.display = "none";
    }

    if (isAthleteMobileUi()) {
      if (tableWrap) {
        tableWrap.style.display = "none";
      }
      if (mobileLog) {
        mobileLog.style.display = "grid";
      }

      renderAthleteMobileCards(mobileLog);
      attachEventListeners();
      renderCompletionSummary();
      return;
    }

    if (tableWrap) {
      tableWrap.style.display = "block";
    }
    if (mobileLog) {
      mobileLog.style.display = "none";
    }

    updateTableHeaders();

    // Group exercises by section
    var sections = {};
    defaultSections.forEach(function(section) {
      sections[section] = [];
    });

    state.exercises.forEach(function (exercise, idx) {
      var section = exercise.section || "A Block";
      if (!sections[section]) {
        sections[section] = [];
      }
      sections[section].push({ exercise: exercise, originalIdx: idx });
    });

    // Render each section
    defaultSections.forEach(function(section) {
      var exercisesInSection = sections[section] || [];
      if (exercisesInSection.length === 0) return;

      // Render section header
      renderSectionHeader(tbody, section);

      // Group by superset within section
      var supersets = {};
      var soloExercises = [];

      exercisesInSection.forEach(function(item) {
        if (item.exercise.superset_group) {
          if (!supersets[item.exercise.superset_group]) {
            supersets[item.exercise.superset_group] = [];
          }
          supersets[item.exercise.superset_group].push(item);
        } else {
          soloExercises.push(item);
        }
      });

      // Render supersets
      Object.keys(supersets).forEach(function (supersetId) {
        var items = supersets[supersetId];
        var supersetLabel = "Superset";

        items.forEach(function (item, itemIdx) {
          renderExerciseRow(item.exercise, item.originalIdx, items.length, itemIdx, supersetLabel);
        });
      });

      // Render solo exercises
      soloExercises.forEach(function (item) {
        renderExerciseRow(item.exercise, item.originalIdx, 1, 0, null);
      });
    });

    attachEventListeners();
    applyReadOnlyFieldState();
    renderCompletionSummary();
  }

  function applyReadOnlyFieldState() {
    if (!state.isProgramReadOnly) {
      return;
    }

    document.querySelectorAll('[data-workout-rows] input, [data-athlete-mobile-log] input').forEach(function (input) {
      input.disabled = true;
      input.readOnly = true;
    });
  }

  function isAthleteMobileUi() {
    return (
      state.isAthleteLockedView &&
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 768px)").matches
    );
  }

  function renderAthleteMobileCards(container) {
    if (!container) {
      return;
    }

    var firstOpenExerciseIdx = null;
    state.exercises.forEach(function (exercise, idx) {
      if (firstOpenExerciseIdx !== null) {
        return;
      }

      var sets = Array.isArray(exercise && exercise.sets) ? exercise.sets : [];
      var hasIncomplete = sets.some(function (set) {
        return !set.done;
      });

      if (hasIncomplete || !sets.length) {
        firstOpenExerciseIdx = idx;
      }
    });

    if (firstOpenExerciseIdx === null && state.exercises.length) {
      firstOpenExerciseIdx = 0;
    }

    var savedOpen = getAthleteMobileOpenForDay();

    var sections = {};
    defaultSections.forEach(function (section) {
      sections[section] = [];
    });

    state.exercises.forEach(function (exercise, idx) {
      var section = exercise.section || "A Block";
      if (!sections[section]) {
        sections[section] = [];
      }
      sections[section].push({ exercise: exercise, originalIdx: idx });
    });

    defaultSections.forEach(function (section) {
      var items = sections[section] || [];
      if (!items.length) {
        return;
      }

      var sectionEl = document.createElement("section");
      sectionEl.className = "athlete-mobile-section";
      sectionEl.innerHTML = '<h3 class="athlete-mobile-section-title">' + escapeHtml(section) + "</h3>";

      items.forEach(function (item, idx) {
        var exercise = item.exercise;
        var exerciseIdx = item.originalIdx;
        var sets = Array.isArray(exercise.sets) ? exercise.sets : [];
        var completed = sets.filter(function (set) {
          return !!set.done;
        }).length;
        var fieldToggles = normalizeExerciseFieldToggles(exercise && exercise.field_toggles, exercise && exercise.mode);
        var details = document.createElement("details");
        details.className = "athlete-mobile-exercise";
        details.setAttribute("data-exercise-idx", String(exerciseIdx));

        if (savedOpen.length) {
          details.open = savedOpen.indexOf(exerciseIdx) !== -1;
        } else if (exerciseIdx === firstOpenExerciseIdx) {
          details.open = true;
        }

        var setsHtml = sets
          .map(function (set, setIdx) {
            return (
              '<div class="athlete-mobile-set">' +
              '<div class="athlete-mobile-set-top">' +
              '<span class="athlete-mobile-set-badge">Set ' +
              (setIdx + 1) +
              '</span>' +
              '<label class="athlete-mobile-done-toggle">' +
              '<input type="checkbox" data-field="done" data-exercise="' +
              exerciseIdx +
              '" data-set="' +
              setIdx +
              '" ' +
              (set.done ? "checked" : "") +
              ' /> Done' +
              '</label>' +
              '</div>' +
              '<div class="athlete-mobile-grid">' +
              '<label class="athlete-mobile-input"><span>Reps</span><input type="text" data-field="reps" data-exercise="' +
              exerciseIdx +
              '" data-set="' +
              setIdx +
              '" value="' +
              escapeAttribute(displayAthleteInputValue(set.reps, set.target_reps, set.done)) +
              '" placeholder="' +
              escapeAttribute(set.target_reps || modePrimaryPlaceholder(exercise.mode)) +
              '" />' +
              buildPrintTargetMarkup(set.target_reps || modePrimaryPlaceholder(exercise.mode)) +
              '</label>' +
              (fieldToggles.showWeight
                ? '<label class="athlete-mobile-input"><span>Weight / Time</span><input type="text" data-field="weight" data-exercise="' +
                  exerciseIdx +
                  '" data-set="' +
                  setIdx +
                  '" value="' +
                  escapeAttribute(displayAthleteInputValue(set.weight, set.target_weight, set.done)) +
                  '" placeholder="' +
                  escapeAttribute(set.target_weight || modeSecondaryPlaceholder(exercise.mode, fieldToggles.secondaryMetric)) +
                  '" />' +
                  buildPrintTargetMarkup(set.target_weight || modeSecondaryPlaceholder(exercise.mode, fieldToggles.secondaryMetric)) +
                  '</label>'
                : '<div class="athlete-mobile-input athlete-mobile-input-off"><span>Weight / Time</span><em>Off</em></div>') +
              (fieldToggles.showRpe
                ? '<label class="athlete-mobile-input"><span>RPE / Zone</span><input type="text" data-field="rpe" data-exercise="' +
                  exerciseIdx +
                  '" data-set="' +
                  setIdx +
                  '" value="' +
                  escapeAttribute(displayAthleteInputValue(set.rpe, set.target_rpe, set.done)) +
                  '" placeholder="' +
                  escapeAttribute(set.target_rpe || modeTertiaryPlaceholder(exercise.mode)) +
                  '" />' +
                  buildPrintTargetMarkup(set.target_rpe || modeTertiaryPlaceholder(exercise.mode)) +
                  '</label>'
                : '<div class="athlete-mobile-input athlete-mobile-input-off"><span>RPE / Zone</span><em>Off</em></div>') +
              (fieldToggles.showRest
                ? '<label class="athlete-mobile-input"><span>Rest</span><input type="text" data-field="rest" data-exercise="' +
                  exerciseIdx +
                  '" data-set="' +
                  setIdx +
                  '" value="' +
                  escapeAttribute(displayAthleteInputValue(set.rest, set.target_rest, set.done)) +
                  '" placeholder="' +
                  escapeAttribute(set.target_rest || "e.g. 90s") +
                  '" />' +
                  buildPrintTargetMarkup(set.target_rest || "e.g. 90s") +
                  '</label>'
                : '<div class="athlete-mobile-input athlete-mobile-input-off"><span>Rest</span><em>Off</em></div>') +
              '<label class="athlete-mobile-input athlete-mobile-input-notes"><span>Notes</span><input type="text" data-field="notes" data-exercise="' +
              exerciseIdx +
              '" data-set="' +
              setIdx +
              '" value="' +
              escapeAttribute(displayAthleteInputValue(set.notes, set.target_notes, set.done)) +
              '" placeholder="' +
              escapeAttribute(set.target_notes || "Notes") +
              '" />' +
              buildPrintTargetMarkup(set.target_notes || "Notes") +
              '</label>' +
              '</div>' +
              '</div>'
            );
          })
          .join("");

        details.innerHTML =
          '<summary class="athlete-mobile-summary">' +
          '<div><div class="athlete-mobile-name">' +
          escapeHtml(exercise.name || "Exercise") +
          '</div><div class="athlete-mobile-mode">' +
          escapeHtml(modeLabel(exercise.mode)) +
          "</div></div>" +
          '<div class="athlete-mobile-progress">' +
          completed +
          " / " +
          sets.length +
          " done</div>" +
          "</summary>" +
          '<div class="athlete-mobile-sets">' +
          setsHtml +
          "</div>";

        sectionEl.appendChild(details);
      });

      container.appendChild(sectionEl);
    });
  }

  function renderSectionHeader(tbody, section) {
    var tr = document.createElement("tr");
    tr.className = "section-header-row";
    tr.innerHTML = '<td colspan="100" class="section-header">' + escapeHtml(section) + '</td>';
    tbody.appendChild(tr);
  }

  function renderExerciseRow(exercise, exerciseIdx, groupSize, groupPosition, supersetLabel) {
    var tbody = document.querySelector("[data-workout-rows]");
    if (!tbody) return;

    var fieldToggles = normalizeExerciseFieldToggles(exercise && exercise.field_toggles, exercise && exercise.mode);
    var useAthleteRowLayout =
      state.isAthleteLockedView &&
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 768px)").matches;

    exercise.sets.forEach(function (set, setIdx) {
      var tr = document.createElement("tr");
      var isFirstSet = setIdx === 0;
      var isFirstInSuperset = isFirstSet && groupPosition === 0;
      var cells = "";

      // Exercise name cell with rowspan on first set (or per-row in athlete locked view)
      if (isFirstSet || useAthleteRowLayout) {
        var rowspan = exercise.sets.length;
        var cellClass = supersetLabel ? "exercise-cell superset-member" : "exercise-cell";
        var actionsHtml = "";

        if (!state.isAthleteLockedView) {
          actionsHtml =
            '<div class="exercise-actions"><button type="button" class="exercise-add-set" data-exercise="' +
            exerciseIdx +
            '">+ Set</button><button type="button" class="exercise-edit" data-exercise="' +
            exerciseIdx +
            '">Edit</button><button type="button" class="exercise-toggle-mode" data-exercise="' +
            exerciseIdx +
            '">Toggle Mode</button><button type="button" class="exercise-change-section" data-exercise="' +
            exerciseIdx +
            '">Section</button><button type="button" class="exercise-field-toggles" data-exercise="' +
            exerciseIdx +
            '">Fields</button><button type="button" class="exercise-superset" data-exercise="' +
            exerciseIdx +
            '">' +
            (exercise.superset_group ? "Remove Superset" : "Superset") +
            '</button><button type="button" class="exercise-copy-next" data-exercise="' +
            exerciseIdx +
            '">Copy to Next</button><button type="button" class="exercise-remove" data-exercise="' +
            exerciseIdx +
            '">Remove</button></div>';
        }
        
        cells += '<td class="' + cellClass + '" data-mobile-label="Exercise"' + (useAthleteRowLayout ? "" : ' rowspan="' + rowspan + '"') + '><div class="exercise-header">';

        if (isFirstInSuperset && supersetLabel) {
          cells += '<div class="superset-label">' + supersetLabel + " - Set " + (groupPosition + 1) + '</div>';
        }

        cells +=
          '<div class="exercise-name">' +
          escapeHtml(exercise.name) +
          '</div><div class="exercise-mode-label">' + modeLabel(exercise.mode) + '</div>' +
          actionsHtml +
          '</div></td>';
      }

      cells +=
        '<td data-mobile-label="Set"><input type="number" min="1" class="set-number" data-exercise="' +
        exerciseIdx +
        '" data-set="' +
        setIdx +
        '" value="' +
        (setIdx + 1) +
        '" disabled /></td>' +
        '<td data-mobile-label="Reps"><input type="text" data-field="reps" data-exercise="' +
        exerciseIdx +
        '" data-set="' +
        setIdx +
        '" value="' +
        escapeAttribute(displayAthleteInputValue(set.reps, set.target_reps, set.done)) +
        '" placeholder="' +
        escapeAttribute(set.target_reps || modePrimaryPlaceholder(exercise.mode)) +
        '" />' +
        buildPrintTargetMarkup(set.target_reps || modePrimaryPlaceholder(exercise.mode)) +
        '</td>' +
        '<td data-mobile-label="Weight / Time">' +
        (fieldToggles.showWeight
          ? '<input type="text" data-field="weight" data-exercise="' +
            exerciseIdx +
            '" data-set="' +
            setIdx +
            '" value="' +
            escapeAttribute(displayAthleteInputValue(set.weight, set.target_weight, set.done)) +
            '" placeholder="' +
            escapeAttribute(set.target_weight || modeSecondaryPlaceholder(exercise.mode, fieldToggles.secondaryMetric)) +
            '" />' +
            buildPrintTargetMarkup(set.target_weight || modeSecondaryPlaceholder(exercise.mode, fieldToggles.secondaryMetric))
          : '<span class="program-field-off">Off</span>') +
        '</td>' +
        '<td data-mobile-label="RPE / Zone">' +
        (fieldToggles.showRpe
          ? '<input type="text" data-field="rpe" data-exercise="' +
            exerciseIdx +
            '" data-set="' +
            setIdx +
            '" value="' +
            escapeAttribute(displayAthleteInputValue(set.rpe, set.target_rpe, set.done)) +
            '" placeholder="' + escapeAttribute(set.target_rpe || modeTertiaryPlaceholder(exercise.mode)) + '" />' +
            buildPrintTargetMarkup(set.target_rpe || modeTertiaryPlaceholder(exercise.mode))
          : '<span class="program-field-off">Off</span>') +
        '</td>' +
        '<td data-mobile-label="Rest">' +
        (fieldToggles.showRest
          ? '<input type="text" data-field="rest" data-exercise="' +
            exerciseIdx +
            '" data-set="' +
            setIdx +
            '" value="' +
            escapeAttribute(displayAthleteInputValue(set.rest, set.target_rest, set.done)) +
            '" placeholder="' + escapeAttribute(set.target_rest || "e.g. 90s") + '" />' +
            buildPrintTargetMarkup(set.target_rest || "e.g. 90s")
          : '<span class="program-field-off">Off</span>') +
        '</td>' +
        '<td data-mobile-label="Notes"><input type="text" data-field="notes" data-exercise="' +
        exerciseIdx +
        '" data-set="' +
        setIdx +
        '" value="' +
        escapeAttribute(displayAthleteInputValue(set.notes, set.target_notes, set.done)) +
        '" placeholder="' + escapeAttribute(set.target_notes || "Notes") + '" />' +
        buildPrintTargetMarkup(set.target_notes || "Notes") +
        '</td>' +
        '<td data-mobile-label="Done"><input type="checkbox" data-field="done" data-exercise="' +
        exerciseIdx +
        '" data-set="' +
        setIdx +
        '" ' +
        (set.done ? "checked" : "") +
        ' /></td>';

      if (!state.isAthleteLockedView && (setIdx > 0 || exercise.sets.length > 1)) {
        cells +=
          '<td data-mobile-label="Actions"><button type="button" class="program-row-remove" data-exercise="' +
          exerciseIdx +
          '" data-set="' +
          setIdx +
          '">Remove</button></td>';
      } else {
        cells += '<td data-mobile-label="Actions"></td>';
      }

      tr.innerHTML = cells;
      if (supersetLabel && groupPosition === 0 && setIdx === 0) {
        tr.classList.add("superset-first");
      }
      tbody.appendChild(tr);
    });
  }

  function attachEventListeners() {
    var tbody = document.querySelector("[data-workout-rows]");
    var mobileLog = document.querySelector("[data-athlete-mobile-log]");

    if (tbody) {
      bindSetInputListeners(tbody);
    }

    if (mobileLog) {
      bindSetInputListeners(mobileLog);
      bindAthleteMobileDisclosureListeners(mobileLog);
    }

    if (!state.isAthleteLockedView && tbody) {
      tbody.querySelectorAll(".exercise-add-set").forEach(function (btn) {
        btn.addEventListener("click", onAddSetToExercise);
      });
      tbody.querySelectorAll(".exercise-edit").forEach(function (btn) {
        btn.addEventListener("click", onEditExercise);
      });
      tbody.querySelectorAll(".exercise-change-section").forEach(function (btn) {
        btn.addEventListener("click", onChangeExerciseSection);
      });
      tbody.querySelectorAll(".exercise-field-toggles").forEach(function (btn) {
        btn.addEventListener("click", onConfigureExerciseFields);
      });
      tbody.querySelectorAll(".exercise-copy-next").forEach(function (btn) {
        btn.addEventListener("click", onCopyExerciseToNextDay);
      });
      tbody.querySelectorAll(".exercise-superset").forEach(function (btn) {
        btn.addEventListener("click", onToggleSupersetMembership);
      });

      tbody.querySelectorAll(".exercise-toggle-mode").forEach(function (btn) {
        btn.addEventListener("click", onToggleExerciseMode);
      });

      tbody.querySelectorAll(".exercise-remove").forEach(function (btn) {
        btn.addEventListener("click", onRemoveExercise);
      });

      tbody.querySelectorAll(".program-row-remove").forEach(function (btn) {
        btn.addEventListener("click", onRemoveSet);
      });
    }
  }

  function bindSetInputListeners(container) {
    container.querySelectorAll('input[type="text"], input[type="number"]').forEach(function (input) {
      if (!input.disabled) {
        input.addEventListener("input", onSetInput);
        input.addEventListener("change", onSetInput);
      }
    });

    container.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
      input.addEventListener("change", onSetInput);
    });
  }

  function bindAthleteMobileDisclosureListeners(container) {
    if (!container) {
      return;
    }

    container.querySelectorAll("details.athlete-mobile-exercise").forEach(function (details) {
      details.addEventListener("toggle", function () {
        persistAthleteMobileOpenState(container);
      });
    });
  }

  function getAthleteMobileOpenForDay() {
    var dayKey = String(state.day || "");
    var saved = state.athleteMobileOpenByDay[dayKey];

    if (!Array.isArray(saved)) {
      return [];
    }

    return saved.slice();
  }

  function persistAthleteMobileOpenState(container) {
    if (!container) {
      return;
    }

    var openIndexes = [];

    container.querySelectorAll("details.athlete-mobile-exercise").forEach(function (details) {
      if (!details.open) {
        return;
      }

      var value = parseInt(details.getAttribute("data-exercise-idx"), 10);
      if (!isNaN(value)) {
        openIndexes.push(value);
      }
    });

    state.athleteMobileOpenByDay[String(state.day || "")] = openIndexes;
  }

  function onSetInput(event) {
    if (state.isProgramReadOnly) {
      return;
    }

    var input = event.target;
    var field = input.getAttribute("data-field");
    var exerciseIdx = parseInt(input.getAttribute("data-exercise"), 10);
    var setIdx = parseInt(input.getAttribute("data-set"), 10);

    if (!field || isNaN(exerciseIdx) || isNaN(setIdx)) {
      return;
    }

    if (!state.exercises[exerciseIdx] || !state.exercises[exerciseIdx].sets[setIdx]) {
      return;
    }

    if (state.isAthleteLockedView && !isAthleteLogField(field)) {
      return;
    }

    var set = state.exercises[exerciseIdx].sets[setIdx];

    if (field === "done") {
      set[field] = !!input.checked;
    } else {
      set[field] = input.value;

      if (state.isTemplateBuilder) {
        var targetFieldMap = {
          reps: "target_reps",
          weight: "target_weight",
          rpe: "target_rpe",
          rest: "target_rest",
          notes: "target_notes"
        };
        var targetField = targetFieldMap[field];
        if (targetField) {
          set[targetField] = input.value;
        }
      }
    }

    renderCompletionSummary();
  }

  function isAthleteLogField(field) {
    return field === "reps" || field === "weight" || field === "rpe" || field === "rest" || field === "notes" || field === "done";
  }

  function onConfigureExerciseFields(event) {
    var btn = event.target;
    var exerciseIdx = parseInt(btn.getAttribute("data-exercise"), 10);

    if (isNaN(exerciseIdx) || !state.exercises[exerciseIdx]) {
      return;
    }

    var exercise = state.exercises[exerciseIdx];
    var showWeight = confirm("Show Weight/Time field for " + exercise.name + "?\n(OK = Show, Cancel = Hide)");
    var secondaryMetric = "weight";
    if (showWeight) {
      secondaryMetric = confirm("Track the secondary field as TIME instead of WEIGHT?\n(OK = Time, Cancel = Weight)")
        ? "time"
        : "weight";
    }
    var showRpe = confirm("Show RPE/Zone field?\n(OK = Show, Cancel = Hide)");
    var showRest = confirm("Show Rest field?\n(OK = Show, Cancel = Hide)");

    exercise.field_toggles = {
      showWeight: showWeight,
      secondaryMetric: secondaryMetric,
      showRpe: showRpe,
      showRest: showRest
    };

    renderRows();
    setStatus("Updated tracking fields for " + exercise.name + ".", "success");
  }

  function onAddSetToExercise(event) {
    var btn = event.target;
    var exerciseIdx = parseInt(btn.getAttribute("data-exercise"), 10);

    if (isNaN(exerciseIdx) || !state.exercises[exerciseIdx]) {
      return;
    }

    state.exercises[exerciseIdx].sets.push({
      reps: "",
      weight: "",
      rpe: "",
      rest: "",
      notes: "",
      done: false
    });

    renderRows();
    setStatus("Added set to " + state.exercises[exerciseIdx].name, "info");
  }

  function onToggleSupersetMembership(event) {
    var btn = event.target;
    var exerciseIdx = parseInt(btn.getAttribute("data-exercise"), 10);

    if (isNaN(exerciseIdx) || !state.exercises[exerciseIdx]) {
      return;
    }

    var exercise = state.exercises[exerciseIdx];

    if (exercise.superset_group) {
      // Already in a superset - offer to manage it
      manageSupersetMembership(exerciseIdx);
    } else {
      // Create new superset
      createNewSuperset(exerciseIdx);
    }
  }

  function createNewSuperset(exerciseIdx) {
    var exercise = state.exercises[exerciseIdx];
    var supersetExercises = state.exercises
      .map(function (ex, idx) {
        return { name: ex.name, idx: idx };
      })
      .filter(function (ex) {
        return ex.idx !== exerciseIdx;
      });

    if (supersetExercises.length === 0) {
      setStatus("No other exercises available to group with.", "error");
      return;
    }

    var supersetSize = prompt(
      "How many exercises in this superset?\n(including " + exercise.name + ")\n\nEnter: 2, 3, 4, or 5",
      "2"
    );

    if (!supersetSize || isNaN(parseInt(supersetSize, 10))) {
      return;
    }

    var size = Math.max(2, Math.min(5, parseInt(supersetSize, 10)));
    var selectedExercises = [exerciseIdx];

    // Select exercises to add to superset
    for (var i = 1; i < size; i++) {
      var availableExercises = supersetExercises.filter(function (ex) {
        return !selectedExercises.includes(ex.idx);
      });

      if (availableExercises.length === 0) {
        setStatus(
          "Only " + selectedExercises.length + " exercises available. Creating superset with those.",
          "info"
        );
        break;
      }

      var choices = availableExercises
        .map(function (ex) {
          return ex.idx + ": " + ex.name;
        })
        .join("\n");

      var selected = prompt(
        "Exercise " +
          (i + 1) +
          " of " +
          size +
          " - Select exercise to add (enter the number):\n" +
          choices,
        availableExercises[0].idx.toString()
      );

      if (!selected) {
        break;
      }

      var pairIdx = parseInt(selected, 10);
      if (isNaN(pairIdx) || !state.exercises[pairIdx]) {
        setStatus("Invalid selection.", "error");
        return;
      }

      selectedExercises.push(pairIdx);
    }

    // Create superset with all selected exercises
    var supersetId = Date.now();
    var exerciseNames = selectedExercises
      .map(function (idx) {
        return state.exercises[idx].name;
      })
      .join(" + ");

    selectedExercises.forEach(function (idx) {
      state.exercises[idx].superset_group = supersetId;
    });

    setStatus("Created superset: " + exerciseNames, "success");
    renderRows();
  }

  function manageSupersetMembership(exerciseIdx) {
    var exercise = state.exercises[exerciseIdx];
    var supersetId = exercise.superset_group;

    // Get all exercises in this superset
    var supersetMembers = state.exercises
      .map(function (ex, idx) {
        return { idx: idx, name: ex.name, inSuperset: ex.superset_group === supersetId };
      })
      .filter(function (ex) {
        return ex.inSuperset;
      });

    var memberList = supersetMembers
      .map(function (m) {
        return "- " + m.name;
      })
      .join("\n");

    var action = prompt(
      "Superset has " +
        supersetMembers.length +
        " exercises:\n" +
        memberList +
        "\n\nEnter:\n'add' to add more exercises\n'remove' to remove this exercise\n'clear' to dissolve superset",
      "add"
    );

    if (!action) {
      return;
    }

    action = action.toLowerCase().trim();

    if (action === "add") {
      addToSuperset(exerciseIdx, supersetId);
    } else if (action === "remove") {
      removeFromSuperset(exerciseIdx, supersetId);
    } else if (action === "clear") {
      clearSuperset(supersetId);
    }
  }

  function addToSuperset(exerciseIdx, supersetId) {
    var availableExercises = state.exercises
      .map(function (ex, idx) {
        return { idx: idx, name: ex.name };
      })
      .filter(function (ex) {
        return ex.idx !== exerciseIdx && !state.exercises[ex.idx].superset_group;
      });

    if (availableExercises.length === 0) {
      setStatus("No other solo exercises available to add.", "error");
      return;
    }

    var choices = availableExercises
      .map(function (ex) {
        return ex.idx + ": " + ex.name;
      })
      .join("\n");

    var selected = prompt("Select exercise to add (enter the number):\n" + choices, availableExercises[0].idx.toString());

    if (!selected) {
      return;
    }

    var addIdx = parseInt(selected, 10);
    if (isNaN(addIdx) || !state.exercises[addIdx] || state.exercises[addIdx].superset_group) {
      setStatus("Invalid selection.", "error");
      return;
    }

    state.exercises[addIdx].superset_group = supersetId;
    setStatus("Added " + state.exercises[addIdx].name + " to superset.", "success");
    renderRows();
  }

  function removeFromSuperset(exerciseIdx, supersetId) {
    var exercise = state.exercises[exerciseIdx];

    // Get count of exercises in superset
    var supersetCount = state.exercises.filter(function (ex) {
      return ex.superset_group === supersetId;
    }).length;

    state.exercises[exerciseIdx].superset_group = null;

    if (supersetCount <= 2) {
      // If superset had only 2 exercises, dissolve it
      var otherMember = state.exercises.find(function (ex) {
        return ex.superset_group === supersetId;
      });

      if (otherMember) {
        otherMember.superset_group = null;
      }

      setStatus("Dissolved superset.", "info");
    } else {
      setStatus("Removed " + exercise.name + " from superset.", "info");
    }

    renderRows();
  }

  function clearSuperset(supersetId) {
    state.exercises.forEach(function (ex) {
      if (ex.superset_group === supersetId) {
        ex.superset_group = null;
      }
    });

    setStatus("Dissolved superset.", "info");
    renderRows();
  }

  function onToggleExerciseMode(event) {
    var btn = event.target;
    var exerciseIdx = parseInt(btn.getAttribute("data-exercise"), 10);

    if (isNaN(exerciseIdx) || !state.exercises[exerciseIdx]) {
      return;
    }

    var exercise = state.exercises[exerciseIdx];
    var newMode = nextExerciseMode(exercise.mode);
    exercise.mode = newMode;

    var modeText = modeDescription(newMode);
    setStatus(exercise.name + " switched to " + modeText + " tracking.", "success");
    renderRows();
  }

  function onChangeExerciseSection(event) {
    var btn = event.target;
    var exerciseIdx = parseInt(btn.getAttribute("data-exercise"), 10);

    if (isNaN(exerciseIdx) || !state.exercises[exerciseIdx]) {
      return;
    }

    var exercise = state.exercises[exerciseIdx];
    var sectionOptions = defaultSections.map(function(s, i) {
      return (i + 1) + ": " + s;
    }).join("\n");
    var currentIdx = defaultSections.indexOf(exercise.section) + 1;
    var sectionInput = prompt(
      "Select new section for " + exercise.name + ":\n" + sectionOptions,
      currentIdx.toString()
    );

    if (!sectionInput) {
      return;
    }

    var sectionIdx = parseInt(sectionInput, 10) - 1;
    if (sectionIdx >= 0 && sectionIdx < defaultSections.length) {
      var oldSection = exercise.section;
      exercise.section = defaultSections[sectionIdx];
      setStatus(exercise.name + " moved from " + oldSection + " to " + exercise.section + ".", "success");
      renderRows();
    } else {
      setStatus("Invalid section selection.", "error");
    }
  }

  function onEditExercise(event) {
    var btn = event.target;
    var exerciseIdx = parseInt(btn.getAttribute("data-exercise"), 10);

    if (isNaN(exerciseIdx) || !state.exercises[exerciseIdx]) {
      return;
    }

    openExerciseEditor(exerciseIdx);
  }

  function onCopyExerciseToNextDay(event) {
    var btn = event.target;
    var exerciseIdx = parseInt(btn.getAttribute("data-exercise"), 10);

    if (isNaN(exerciseIdx) || !state.exercises[exerciseIdx]) {
      return;
    }

    if (!state.isTemplateBuilder) {
      setStatus("Copy exercise is only available in template builder mode.", "info");
      return;
    }

    saveExercisesForDay(true);

    var slotKeys = getAllSlotKeys();
    var currentIndex = slotKeys.indexOf(state.day);
    if (currentIndex === -1 || currentIndex >= slotKeys.length - 1) {
      setStatus("No later workout slots available.", "info");
      return;
    }

    var exercise = cloneExercises([state.exercises[exerciseIdx]])[0];
    var nextDayKey = slotKeys[currentIndex + 1];

    var dayData = readFromStorage(state.storagePrefix + nextDayKey) || {
      exercises: [],
      saved_at: new Date().toISOString()
    };

    if (!Array.isArray(dayData.exercises)) {
      dayData.exercises = [];
    }

    dayData.exercises.push(exercise);

    writeToStorage(state.storagePrefix + nextDayKey, dayData);

    setStatus("Copied " + exercise.name + " to " + nextDayKey + ".", "success");
  }

  function onRemoveExercise(event) {
    var btn = event.target;
    var exerciseIdx = parseInt(btn.getAttribute("data-exercise"), 10);

    if (isNaN(exerciseIdx) || !state.exercises[exerciseIdx]) {
      return;
    }

    var exercise = state.exercises[exerciseIdx];
    var exerciseName = exercise.name;

    if (exercise.superset_group) {
      if (!confirm("Remove " + exerciseName + " from superset?")) {
        return;
      }
      
      var supersetId = exercise.superset_group;
      exercise.superset_group = null;
      
      var otherMember = state.exercises.find(function (ex) {
        return ex.superset_group === supersetId;
      });
      
      if (otherMember) {
        otherMember.superset_group = null;
      }

      setStatus("Removed " + exerciseName + " and dissolved superset.", "info");
    } else {
      if (!confirm("Remove " + exerciseName + " and all its sets?")) {
        return;
      }

      state.exercises.splice(exerciseIdx, 1);
      setStatus("Removed " + exerciseName, "info");
    }

    renderRows();
  }

  function onRemoveSet(event) {
    var btn = event.target;
    var exerciseIdx = parseInt(btn.getAttribute("data-exercise"), 10);
    var setIdx = parseInt(btn.getAttribute("data-set"), 10);

    if (isNaN(exerciseIdx) || isNaN(setIdx) || !state.exercises[exerciseIdx]) {
      return;
    }

    var exercise = state.exercises[exerciseIdx];
    if (setIdx >= exercise.sets.length) {
      return;
    }

    exercise.sets.splice(setIdx, 1);

    if (exercise.sets.length === 0) {
      state.exercises.splice(exerciseIdx, 1);
    }

    renderRows();
    setStatus("Removed set.", "info");
  }

  function renderCompletionSummary() {
    var summary = document.querySelector("[data-completion-summary]");
    if (!summary) {
      return;
    }

    var total = 0;
    var completed = 0;

    state.exercises.forEach(function (exercise) {
      total += exercise.sets.length;
      exercise.sets.forEach(function (set) {
        if (set.done) {
          completed++;
        }
      });
    });

    var percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    var progressText = completed + " / " + total + " sets marked done";
    summary.querySelector(".progress-text").textContent = "Completion: " + progressText + " (" + percentage + "%)";

    // Update progress bar if it exists
    var progressBar = summary.querySelector(".progress-bar");
    if (progressBar) {
      progressBar.style.width = percentage + "%";
    }
  }

  function updateStats() {
    var totalWorkoutsEl = document.querySelector("[data-total-workouts]");
    var totalSetsEl = document.querySelector("[data-total-sets]");
    var progressEl = document.querySelector("[data-program-progress]");

    if (!totalWorkoutsEl || !totalSetsEl || !progressEl) {
      return;
    }

    var workoutCount = 0;
    var totalSets = 0;
    var completedSets = 0;

    getAllSlotKeys().forEach(function (slotKey) {
      var key = state.storagePrefix + slotKey;
      var stored = readFromStorage(key);
      if (stored && Array.isArray(stored.exercises)) {
        stored.exercises.forEach(function (exercise) {
          if (exercise.sets && exercise.sets.length > 0) {
            workoutCount++;
            totalSets += exercise.sets.length;
            exercise.sets.forEach(function (set) {
              if (set.done) {
                completedSets++;
              }
            });
          }
        });
      }
    });

    totalWorkoutsEl.textContent = workoutCount;
    totalSetsEl.textContent = totalSets;

    var progress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
    progressEl.textContent = progress + "%";
  }

  function applyDayTypeToCurrentDay(dayType) {
    if (!state.isTemplateBuilder) {
      return;
    }

    var normalizedType = normalizeDayType(dayType);
    if (!normalizedType) {
      setStatus("Unsupported day type.", "error");
      return;
    }

    state.daySessionTypes[state.day] = normalizedType;

    if (!Array.isArray(state.exercises) || !state.exercises.length) {
      var parsed = parseSlotKey(state.day) || { week: 1, workout: 1 };
      if (normalizedType === "running") {
        state.exercises = createRunningStarterExercises(parsed);
      } else if (normalizedType === "biking") {
        state.exercises = createBikingStarterExercises(parsed);
      } else {
        state.exercises = createStrengthStarterExercises(parsed);
      }
    } else {
      state.exercises = convertExercisesForDayType(state.exercises, normalizedType);
    }

    renderRows();
    updateDayInfo();
    setStatus("Converted this day to " + capitalize(normalizedType) + " format.", "success");
  }

  function convertExercisesForDayType(exercises, dayType) {
    var normalizedType = normalizeDayType(dayType) || "strength";
    return (Array.isArray(exercises) ? exercises : []).map(function (exercise, idx) {
      var section = exercise && exercise.section ? exercise.section : defaultSections[1];
      var converted = {
        name: exercise && exercise.name ? exercise.name : "Exercise",
        section: section,
        mode: normalizeModeForDayType(exercise && exercise.mode, normalizedType, section),
        superset_group: exercise ? exercise.superset_group || null : null,
        field_toggles: normalizeExerciseFieldToggles(exercise && exercise.field_toggles, exercise && exercise.mode),
        sets: []
      };

      var sets = Array.isArray(exercise && exercise.sets) ? exercise.sets : [];
      if (!sets.length) {
        sets = [{ reps: "", weight: "", rpe: "", rest: "", notes: "", done: false }];
      }

      converted.sets = sets.map(function (set) {
        return convertSetForDayType(set, converted.mode, normalizedType);
      });

      return converted;
    });
  }

  function convertSetForDayType(set, mode, dayType) {
    var source = set || {};
    var converted = {
      reps: source.reps != null ? source.reps : "",
      weight: source.weight != null ? source.weight : "",
      rpe: source.rpe != null ? source.rpe : "",
      rest: source.rest != null ? source.rest : "",
      notes: source.notes != null ? source.notes : "",
      done: !!source.done
    };

    if (mode === "endurance") {
      converted.reps = converted.reps || "20:00";
      converted.weight = converted.weight || (dayType === "running" ? "3.0 mi" : "" );
      converted.rpe = converted.rpe || "Z2";
      return converted;
    }

    if (mode === "time") {
      converted.reps = converted.reps || "8 min";
      return converted;
    }

    converted.reps = converted.reps || "8";
    converted.weight = converted.weight || "";
    converted.rpe = converted.rpe || "7";
    return converted;
  }

  function normalizeModeForDayType(currentMode, dayType, section) {
    var normalizedDayType = normalizeDayType(dayType) || "strength";
    var normalizedSection = String(section || "").toLowerCase();
    var isBookendSection = normalizedSection.indexOf("warm") === 0 || normalizedSection.indexOf("cool") === 0;

    if (normalizedDayType === "running" || normalizedDayType === "biking") {
      return isBookendSection ? "time" : "endurance";
    }

    if (isBookendSection) {
      return "time";
    }

    if (currentMode === "endurance") {
      return "reps";
    }

    return currentMode === "time" ? "time" : "reps";
  }

  function normalizeDaySessionTypes(map) {
    var source = map && typeof map === "object" ? map : {};
    var normalized = {};

    Object.keys(source).forEach(function (slotKey) {
      if (!/^w\d+d\d+$/i.test(slotKey)) {
        return;
      }

      var dayType = normalizeDayType(source[slotKey]);
      if (dayType) {
        normalized[slotKey] = dayType;
      }
    });

    return normalized;
  }

  function ensureDaySessionTypesForStructure() {
    var existing = normalizeDaySessionTypes(state.daySessionTypes);
    var next = {};
    getAllSlotKeys().forEach(function (slotKey) {
      next[slotKey] = existing[slotKey] || inferDefaultDayType(slotKey);
    });
    state.daySessionTypes = next;
  }

  function inferDefaultDayType(slotKey) {
    if (state.templateFocus === "running") {
      return "running";
    }
    if (state.templateFocus === "biking") {
      return "biking";
    }
    if (state.templateFocus === "hybrid") {
      var parsed = parseSlotKey(slotKey) || { workout: 1 };
      return parsed.workout % 2 === 1 ? "running" : "biking";
    }
    return "strength";
  }

  function getDayTypeForSlot(slotKey) {
    if (!state.isTemplateBuilder) {
      return null;
    }
    var normalized = normalizeDayType(state.daySessionTypes && state.daySessionTypes[slotKey]);
    return normalized || inferDefaultDayType(slotKey);
  }

  function normalizeDayType(value) {
    var next = String(value || "").toLowerCase();
    if (next === "strength" || next === "running" || next === "biking") {
      return next;
    }
    return null;
  }

  function capitalize(value) {
    var text = String(value || "");
    if (!text) {
      return "";
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function defaultExercisesForDay(day) {
    if (day === "w1d2") {
      return [
        {
          name: "Band Pull-Aparts",
          section: "Warm Up",
          mode: "reps",
          superset_group: null,
          sets: [{ reps: "15", weight: "", rpe: "", notes: "", done: false }]
        },
        {
          name: "Weighted Pull-Up",
          section: "A Block",
          mode: "reps",
          superset_group: null,
          sets: [
            { reps: "5", weight: "", rpe: "", notes: "", done: false },
            { reps: "5", weight: "", rpe: "", notes: "", done: false }
          ]
        },
        {
          name: "20mm Edge Pull",
          section: "B Block",
          mode: "time",
          superset_group: null,
          sets: [{ reps: "10s", weight: "", rpe: "", notes: "", done: false }]
        },
        {
          name: "Hollow Hold",
          section: "B Block",
          mode: "time",
          superset_group: null,
          sets: [{ reps: "45s", weight: "BW", rpe: "", notes: "", done: false }]
        },
        {
          name: "Dead Hang Stretch",
          section: "Cool Down",
          mode: "time",
          superset_group: null,
          sets: [{ reps: "3 min", weight: "", rpe: "", notes: "", done: false }]
        }
      ];
    }

    if (day === "w1d3") {
      return [
        {
          name: "Rowing Machine",
          section: "Warm Up",
          mode: "time",
          superset_group: null,
          sets: [{ reps: "3 min", weight: "", rpe: "", notes: "Easy pace", done: false }]
        },
        {
          name: "Assault Bike Intervals",
          section: "A Block",
          mode: "time",
          superset_group: null,
          sets: [{ reps: "8 rounds", weight: "", rpe: "", notes: "20s on / 100s off", done: false }]
        },
        {
          name: "Sled Push",
          section: "B Block",
          mode: "reps",
          superset_group: null,
          sets: [{ reps: "6 x 20m", weight: "", rpe: "", notes: "", done: false }]
        },
        {
          name: "Mobility Cooldown",
          section: "Cool Down",
          mode: "time",
          superset_group: null,
          sets: [{ reps: "10 min", weight: "BW", rpe: "", notes: "", done: false }]
        }
      ];
    }

    if (day !== "w1d1") {
      return [];
    }

    return [
      {
        name: "Leg Swings",
        section: "Warm Up",
        mode: "reps",
        superset_group: null,
        sets: [{ reps: "10/leg", weight: "BW", rpe: "", notes: "", done: false }]
      },
      {
        name: "Back Squat",
        section: "A Block",
        mode: "reps",
        superset_group: null,
        sets: [
          { reps: "5", weight: "", rpe: "", notes: "", done: false },
          { reps: "5", weight: "", rpe: "", notes: "", done: false },
          { reps: "5", weight: "", rpe: "", notes: "", done: false }
        ]
      },
      {
        name: "Romanian Deadlift",
        section: "B Block",
        mode: "reps",
        superset_group: null,
        sets: [{ reps: "8", weight: "", rpe: "", notes: "", done: false }]
      },
      {
        name: "Box Jump",
        section: "B Block",
        mode: "reps",
        superset_group: null,
        sets: [{ reps: "5", weight: "BW", rpe: "", notes: "", done: false }]
      },
      {
        name: "Foam Roll",
        section: "Cool Down",
        mode: "time",
        superset_group: null,
        sets: [{ reps: "5 min", weight: "", rpe: "", notes: "", done: false }]
      }
    ];
  }

  function normalizeTemplateFocus(value) {
    var focus = String(value || "strength").toLowerCase();
    if (isSupportedTemplateFocus(focus)) {
      return focus;
    }
    return "strength";
  }

  function isSupportedTemplateFocus(value) {
    return value === "strength" || value === "running" || value === "biking" || value === "hybrid";
  }

  function nextExerciseMode(currentMode) {
    if (currentMode === "reps") {
      return "time";
    }
    if (currentMode === "time") {
      return "endurance";
    }
    return "reps";
  }

  function modeLabel(mode) {
    if (mode === "time") {
      return "⏱ Time";
    }
    if (mode === "endurance") {
      return "🏃 Endurance";
    }
    return "Reps";
  }

  function modeDescription(mode) {
    if (mode === "time") {
      return "time-based (e.g. 45s)";
    }
    if (mode === "endurance") {
      return "endurance-based (duration, distance, and zone/power)";
    }
    return "reps-based (e.g. 5, 8, 10)";
  }

  function modePrimaryPlaceholder(mode) {
    if (mode === "time") {
      return "e.g. 45s";
    }
    if (mode === "endurance") {
      return "e.g. 20:00";
    }
    return "e.g. 5";
  }

  function modeSecondaryPlaceholder(mode, secondaryMetric) {
    if (secondaryMetric === "time") {
      return "e.g. 60s";
    }
    if (mode === "endurance") {
      return "e.g. 3.0 mi / 25 km";
    }
    return "e.g. 185";
  }

  function modeTertiaryPlaceholder(mode) {
    if (mode === "endurance") {
      return "e.g. Z2 / 235W / 7";
    }
    return "1-10";
  }

  function updateTableHeaders() {
    var primary = document.querySelector("[data-workout-header-primary]");
    var secondary = document.querySelector("[data-workout-header-secondary]");
    var tertiary = document.querySelector("[data-workout-header-tertiary]");
    var rest = document.querySelector("[data-workout-header-rest]");

    if (!primary || !secondary || !tertiary || !rest) {
      return;
    }

    var hasEndurance = (state.exercises || []).some(function (exercise) {
      return exercise && exercise.mode === "endurance";
    });

    if (!hasEndurance && state.isTemplateBuilder) {
      var dayType = getDayTypeForSlot(state.day);
      hasEndurance = dayType === "running" || dayType === "biking";
    }

    if (hasEndurance) {
      primary.textContent = "Duration";
      secondary.textContent = "Weight / Time / Distance";
      tertiary.textContent = "RPE / Zone / Effort";
      rest.textContent = "Rest";
      return;
    }

    primary.textContent = "Reps";
    secondary.textContent = "Weight / Time";
    tertiary.textContent = "RPE";
    rest.textContent = "Rest";
  }

  function normalizeExerciseFieldToggles(toggles, mode) {
    var source = toggles && typeof toggles === "object" ? toggles : {};
    return {
      showWeight: source.showWeight !== false,
      secondaryMetric: normalizeSecondaryMetric(source.secondaryMetric || (mode === "time" ? "time" : "weight")),
      showRpe: source.showRpe !== false,
      showRest: !!source.showRest
    };
  }

  function normalizeSecondaryMetric(value) {
    return String(value || "").toLowerCase() === "time" ? "time" : "weight";
  }

  function normalizeExercisesArray(exercises) {
    return (Array.isArray(exercises) ? exercises : []).map(function (exercise) {
      var safeExercise = exercise && typeof exercise === "object" ? exercise : {};
      var sets = Array.isArray(safeExercise.sets) ? safeExercise.sets : [];

      return {
        name: safeExercise.name || "Exercise",
        section: safeExercise.section || "A Block",
        mode: safeExercise.mode || "reps",
        superset_group: safeExercise.superset_group || null,
        library_id: safeExercise.library_id || null,
        video_demo_url: safeExercise.video_demo_url || "",
        field_toggles: normalizeExerciseFieldToggles(safeExercise.field_toggles, safeExercise.mode),
        sets: sets.map(function (set) {
          var source = set && typeof set === "object" ? set : {};
          return {
            reps: source.reps != null ? source.reps : "",
            weight: source.weight != null ? source.weight : "",
            rpe: source.rpe != null ? source.rpe : "",
            rest: source.rest != null ? source.rest : "",
            notes: source.notes != null ? source.notes : "",
            done: !!source.done,
            target_reps: source.target_reps != null ? source.target_reps : source.reps || "",
            target_weight: source.target_weight != null ? source.target_weight : source.weight || "",
            target_rpe: source.target_rpe != null ? source.target_rpe : source.rpe || "",
            target_rest: source.target_rest != null ? source.target_rest : source.rest || "",
            target_notes: source.target_notes != null ? source.target_notes : source.notes || ""
          };
        })
      };
    });
  }

  function storageKeyForDay() {
    return state.storagePrefix + state.day;
  }

  function legacyStorageKeyForDay() {
    if (!state.legacyStoragePrefix) {
      return "";
    }
    return state.legacyStoragePrefix + state.day;
  }

  function readWorkoutLogForDay() {
    var currentKey = storageKeyForDay();
    var current = readFromStorage(currentKey);
    if (current) {
      return current;
    }

    if (!state.assignedProgramInstanceId) {
      return null;
    }

    var legacyKey = legacyStorageKeyForDay();
    if (!legacyKey || legacyKey === currentKey) {
      return null;
    }

    return readFromStorage(legacyKey);
  }

  function readFromStorage(key) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) {
        return null;
      }

      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function writeToStorage(key, data) {
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      setStatus("Could not persist log in this browser session.", "info");
    }
  }

  function setStatus(message, variant) {
    var status = document.querySelector("[data-workout-status]");
    if (!status) {
      return;
    }

    status.textContent = message || "";
    status.classList.remove("is-error", "is-success", "is-info");

    if (!message) {
      return;
    }

    if (variant === "error") {
      status.classList.add("is-error");
    } else if (variant === "success") {
      status.classList.add("is-success");
    } else {
      status.classList.add("is-info");
    }
  }

  function escapeAttribute(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeHtml(value) {
    return escapeAttribute(value);
  }
})();
