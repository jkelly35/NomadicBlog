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
    assignedTemplateDays: null,
    isAthleteLockedView: false,
    structure: {
      weeks: 1,
      workoutsPerWeek: 3
    },
    templateFocus: "strength",
    daySessionTypes: {},
    customDayNames: {},
    editingExerciseIdx: null,
    athleteMobileOpenByDay: {},
    lastViewportWidth: null,
    lastIsAthleteMobileUi: false
  };

  var TEMPLATE_DRAFT_PREFIX = "nomadic_training_program_template_builder_draft_";
  var TEMPLATE_MARKER = "__NOMADIC_TEMPLATE__";

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

  document.addEventListener("DOMContentLoaded", function () {
    initialize();
  });

  function initialize() {
    configureBuilderMode();
    configureAssignedTemplateMode();
    setProgramTitleFromQuery();

    var daySelect = document.querySelector("[data-workout-day]");
    var addExerciseBtn = document.querySelector("[data-add-exercise]");
    var saveBtn = document.querySelector("[data-save-workout]");
    var clearBtn = document.querySelector("[data-clear-workout]");
    var dayNameInput = document.querySelector("[data-template-day-name]");
    var dayRenameBtn = document.querySelector("[data-template-day-rename]");
    var dayCopyForwardBtn = document.querySelector("[data-template-day-copy-forward]");

    if (!daySelect) {
      return;
    }

    refreshWorkoutDaySelect(daySelect);
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

    if (addExerciseBtn) {
      addExerciseBtn.addEventListener("click", function () {
        openExerciseEditor(null);
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        if (state.isTemplateBuilder) {
          saveTemplateProgram();
          return;
        }

        saveExercisesForDay();
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
        setStatus("Template editing is coach-only and requires an authenticated session.", "info");
        return;
      }

      state.client.auth.getSession().then(function (result) {
        var session = result && result.data && result.data.session;
        var user = session && session.user;
        var email = String(user && user.email || "").toLowerCase();
        var isCoach = !!email && email === ADMIN_EMAIL;

        if (!isCoach) {
          state.isTemplateBuilder = false;
          refreshTemplateDayTools();
          setStatus("Template editing tools are available to coach accounts only.", "info");
          return;
        }

        state.isTemplateBuilder = true;
        state.storagePrefix = TEMPLATE_DRAFT_PREFIX;
        clearBuilderDrafts();

        if (state.templateId) {
          hydrateDraftFromTemplate(state.templateId);
        }

        applyBuilderModeUi();
        ensureDaySessionTypesForStructure();
        refreshTemplateDayTools();
        updateDayInfo();
      }).catch(function () {
        state.isTemplateBuilder = false;
        refreshTemplateDayTools();
        setStatus("Could not verify coach access. Template editing was disabled.", "info");
      });
    } catch (e) {
      // Ignore malformed query parameters.
    }
  }

  function configureAssignedTemplateMode() {
    if (state.isTemplateBuilder) {
      return;
    }

    try {
      var params = new URLSearchParams(window.location.search);
      var templateId = params.get("templateId");
      if (!templateId) {
        return;
      }

      state.assignedTemplateId = templateId;
      state.storagePrefix = "nomadic_training_program_log_" + String(templateId) + "_";
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

  function applyAthleteLockedUi() {
    var addExerciseBtn = document.querySelector("[data-add-exercise]");
    var clearBtn = document.querySelector("[data-clear-workout]");
    var saveBtn = document.querySelector("[data-save-workout]");
    var subtitle = document.querySelector(".program-demo-subtitle");
    var dayTools = document.querySelector("[data-template-day-tools]");
    var dayTypeControls = document.querySelector("[data-template-day-type-controls]");

    if (document.body) {
      document.body.classList.add("athlete-locked-view");
    }

    if (addExerciseBtn) {
      addExerciseBtn.style.display = "none";
    }

    if (clearBtn) {
      clearBtn.style.display = "none";
    }

    if (saveBtn) {
      saveBtn.innerHTML = "<span>💾</span> Save Workout Log";
    }

    if (subtitle) {
      subtitle.textContent = "Log reps performed, weights used, notes, and completed sets.";
    }

    if (dayTools) {
      dayTools.hidden = true;
      dayTools.style.display = "none";
    }

    if (dayTypeControls) {
      dayTypeControls.hidden = true;
      dayTypeControls.style.display = "none";
    }
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
    var saveBtn = document.querySelector("[data-save-workout]");
    var clearBtn = document.querySelector("[data-clear-workout]");
    var backLink = document.querySelector("[data-program-back-link]");
    var subtitle = document.querySelector(".program-demo-subtitle");
    var kicker = document.querySelector(".program-demo-kicker");

    if (panel) {
      panel.hidden = false;
    }

    if (dayTypeControls) {
      dayTypeControls.hidden = false;
    }

    if (dayTools) {
      dayTools.hidden = false;
    }

    if (saveBtn) {
      saveBtn.innerHTML = "<span>💾</span> Save Template";
    }

    if (clearBtn) {
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
  }

  function setProgramTitleFromQuery() {
    var heading = document.querySelector("[data-program-title]");
    if (!heading) {
      return;
    }

    try {
      var params = new URLSearchParams(window.location.search);
      var programName = params.get("program");
      if (programName) {
        heading.textContent = programName;
      } else if (state.isTemplateBuilder) {
        heading.textContent = state.templateName || "New Training Program Template";
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
    dayNameInput.value = String((state.customDayNames && state.customDayNames[state.day]) || "");
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

  function setupExerciseEditorModal() {
    var modal = document.querySelector("[data-exercise-editor-modal]");
    var overlay = document.querySelector(".exercise-editor-overlay[data-exercise-editor-close]");
    var closeBtn = document.querySelector(".exercise-editor-close-btn");
    var cancelBtn = document.querySelector("[data-exercise-editor-cancel]");
    var submitBtn = document.querySelector("[data-exercise-editor-submit]");

    if (!modal || !overlay || !closeBtn || !cancelBtn || !submitBtn) {
      console.warn("Exercise editor modal elements not found");
      return;
    }

    overlay.addEventListener("click", closeExerciseEditor);
    closeBtn.addEventListener("click", closeExerciseEditor);
    cancelBtn.addEventListener("click", closeExerciseEditor);
    submitBtn.addEventListener("click", submitExerciseEditor);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hasAttribute("hidden")) {
        closeExerciseEditor();
      }
    });
  }

  function openExerciseEditor(exerciseIdx) {
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
    state.editingExerciseIdx = null;
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
      // Keep existing sets, just update metadata

      setStatus("Updated " + name + ".", "success");
    } else {
      // Add new
      var newExercise = {
        name: name,
        section: section,
        mode: mode,
        superset_group: null,
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
    var stored = readFromStorage(storageKeyForDay());
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

    if (state.assignedTemplateDays && Array.isArray(state.assignedTemplateDays[state.day])) {
      state.exercises = cloneExercises(state.assignedTemplateDays[state.day]);
      state.exercises = normalizeExercisesArray(state.exercises);
      return;
    }

    state.exercises = defaultExercisesForDay(state.day);
    state.exercises = normalizeExercisesArray(state.exercises);
  }

  function saveExercisesForDay(silent) {
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

  function saveTemplateProgram() {
    saveExercisesForDay(true);

    var nameInput = document.querySelector("[data-template-name]");
    var templateName = String((nameInput && nameInput.value) || state.templateName || "").trim();
    if (!templateName) {
      templateName = prompt("Enter a template name:", state.templateName || "");
      templateName = String(templateName || "").trim();
    }

    if (!templateName) {
      setStatus("Template name is required before saving.", "error");
      return;
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
      structure: state.structure,
      days: {
        
      }
    };

    getAllSlotKeys().forEach(function (slotKey) {
      payload.days[slotKey] = readExercisesForDayFromStorage(slotKey);
    });

    if (!state.client) {
      setStatus("Supabase unavailable. Template could not be saved to shared library.", "error");
      return;
    }

    setStatus("Saving template...", "info");

    var templateIdForUpdate = state.templateId && isUuid(state.templateId) ? state.templateId : null;

    var saveOperation;
    var isEditingExistingTemplate = !!templateIdForUpdate;
    if (templateIdForUpdate) {
      saveOperation = state.client
        .from("training_programs")
        .update({
          name: templateName,
          description: serializeTemplatePayload(payload)
        })
        .eq("id", templateIdForUpdate)
        .select("id")
        .single();
    } else {
      saveOperation = state.client
        .from("training_programs")
        .insert({
          name: templateName,
          description: serializeTemplatePayload(payload)
        })
        .select("id")
        .single();
    }

    saveOperation
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        state.templateId = result.data && result.data.id ? result.data.id : state.templateId;

        // Keep active athlete assignment names aligned when a template is renamed.
        var syncPromise = Promise.resolve();
        if (isEditingExistingTemplate && state.templateId) {
          syncPromise = state.client
            .from("user_training_programs")
            .update({ program_name: templateName })
            .eq("program_id", state.templateId)
            .eq("is_active", true)
            .then(function () {
              return true;
            })
            .catch(function () {
              return false;
            });
        }

        syncPromise.then(function () {
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
        });
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to save template.", "error");
      });
  }

  function readExercisesForDayFromStorage(day) {
    var payload = readFromStorage(state.storagePrefix + day);
    if (payload && Array.isArray(payload.exercises)) {
      return payload.exercises;
    }
    return [];
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
      structure: normalizeStructure(payload && payload.structure),
      days: payload && payload.days
        ? Object.fromEntries(
            Object.entries(payload.days).map(([dayKey, dayData]) => [
              dayKey,
              {
                ...dayData,
                exercises: Array.isArray(dayData.exercises)
                  ? dayData.exercises.map((exercise) => ({
                      ...exercise,
                      sets: exercise.sets.map((set) => ({
                        ...set,
                        target_reps: set.reps || set.target_reps || "",
                        target_weight: set.weight || set.target_weight || "",
                        target_rpe: set.rpe || set.target_rpe || "",
                        target_rest: set.rest || set.target_rest || "",
                        target_notes: set.notes || set.target_notes || ""
                      }))
                    }))
                  : []
              }
            ])
          )
        : {}
    };
    return TEMPLATE_MARKER + JSON.stringify(safePayload);
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
    renderCompletionSummary();
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
              '" /></label>' +
              (fieldToggles.showWeight
                ? '<label class="athlete-mobile-input"><span>Weight / Time</span><input type="text" data-field="weight" data-exercise="' +
                  exerciseIdx +
                  '" data-set="' +
                  setIdx +
                  '" value="' +
                  escapeAttribute(displayAthleteInputValue(set.weight, set.target_weight, set.done)) +
                  '" placeholder="' +
                  escapeAttribute(set.target_weight || modeSecondaryPlaceholder(exercise.mode, fieldToggles.secondaryMetric)) +
                  '" /></label>'
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
                  '" /></label>'
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
                  '" /></label>'
                : '<div class="athlete-mobile-input athlete-mobile-input-off"><span>Rest</span><em>Off</em></div>') +
              '<label class="athlete-mobile-input athlete-mobile-input-notes"><span>Notes</span><input type="text" data-field="notes" data-exercise="' +
              exerciseIdx +
              '" data-set="' +
              setIdx +
              '" value="' +
              escapeAttribute(displayAthleteInputValue(set.notes, set.target_notes, set.done)) +
              '" placeholder="' +
              escapeAttribute(set.target_notes || "Notes") +
              '" /></label>' +
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
        '" /></td>' +
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
            '" />'
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
            '" placeholder="' + escapeAttribute(set.target_rpe || modeTertiaryPlaceholder(exercise.mode)) + '" />'
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
            '" placeholder="' + escapeAttribute(set.target_rest || "e.g. 90s") + '" />'
          : '<span class="program-field-off">Off</span>') +
        '</td>' +
        '<td data-mobile-label="Notes"><input type="text" data-field="notes" data-exercise="' +
        exerciseIdx +
        '" data-set="' +
        setIdx +
        '" value="' +
        escapeAttribute(displayAthleteInputValue(set.notes, set.target_notes, set.done)) +
        '" placeholder="' + escapeAttribute(set.target_notes || "Notes") + '" /></td>' +
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
            target_reps: source.target_reps != null ? source.target_reps : "",
            target_weight: source.target_weight != null ? source.target_weight : "",
            target_rpe: source.target_rpe != null ? source.target_rpe : "",
            target_rest: source.target_rest != null ? source.target_rest : "",
            target_notes: source.target_notes != null ? source.target_notes : ""
          };
        })
      };
    });
  }

  function storageKeyForDay() {
    return state.storagePrefix + state.day;
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
