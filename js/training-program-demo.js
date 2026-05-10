(function () {
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
    }
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

    if (!daySelect) {
      return;
    }

    refreshWorkoutDaySelect(daySelect);
    state.day = daySelect.value || getAllSlotKeys()[0] || "w1d1";

    daySelect.addEventListener("change", function () {
      if (state.isTemplateBuilder) {
        saveExercisesForDay(true);
      }

      state.day = daySelect.value;
      loadExercisesForDay();
      renderRows();
      updateDayInfo();
      setStatus("");
    });

    if (addExerciseBtn) {
      addExerciseBtn.addEventListener("click", function () {
        addNewExercise();
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
    updateStats();
  }

  function configureBuilderMode() {
    try {
      var params = new URLSearchParams(window.location.search);
      state.isTemplateBuilder = params.get("builder") === "1";
      state.templateId = params.get("templateId") || null;

      if (state.templateId && !isUuid(state.templateId)) {
        // Legacy local-storage template IDs (e.g. tpl_123) are not valid Supabase UUIDs.
        state.templateId = null;
      }

      if (!state.isTemplateBuilder) {
        return;
      }

      state.storagePrefix = TEMPLATE_DRAFT_PREFIX;
      state.client = createSupabaseClient();
      clearBuilderDrafts();

      if (state.templateId) {
        hydrateDraftFromTemplate(state.templateId);
      }

      applyBuilderModeUi();
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
  }

  function applyBuilderModeUi() {
    var panel = document.querySelector("[data-template-builder-panel]");
    var nameInput = document.querySelector("[data-template-name]");
    var weeksInput = document.querySelector("[data-template-weeks]");
    var workoutsInput = document.querySelector("[data-template-workouts-per-week]");
    var applyStructureBtn = document.querySelector("[data-template-structure-apply]");
    var seedSkeletonBtn = document.querySelector("[data-template-seed-skeleton]");
    var saveBtn = document.querySelector("[data-save-workout]");
    var clearBtn = document.querySelector("[data-clear-workout]");
    var backLink = document.querySelector("[data-program-back-link]");
    var subtitle = document.querySelector(".program-demo-subtitle");
    var kicker = document.querySelector(".program-demo-kicker");

    if (panel) {
      panel.hidden = false;
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
  }

  function updateDayInfo() {
    var dayInfo = document.querySelector("[data-day-info]");
    if (!dayInfo) {
      return;
    }

    var label = labelForSlot(state.day);
    dayInfo.textContent = "📅 " + label;
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

    var modeInput = prompt("Track by reps or time? (Enter 'reps' or 'time')", "reps");
    var mode = (modeInput && modeInput.toLowerCase().trim() === "time") ? "time" : "reps";

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
      sets: []
    };

    for (var i = 0; i < numSets; i++) {
      newExercise.sets.push({
        reps: "",
        weight: "",
        rpe: "",
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
      return;
    }

    if (state.isTemplateBuilder) {
      state.exercises = [];
      return;
    }

    if (state.assignedTemplateDays && Array.isArray(state.assignedTemplateDays[state.day])) {
      state.exercises = cloneExercises(state.assignedTemplateDays[state.day]);
      return;
    }

    state.exercises = defaultExercisesForDay(state.day);
  }

  function saveExercisesForDay(silent) {
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
        sets: sets.map(function (set) {
          var source = set || {};
          return {
            reps: "",
            weight: "",
            rpe: "",
            notes: "",
            done: false,
            target_reps: source.target_reps != null ? source.target_reps : source.reps || "",
            target_weight: source.target_weight != null ? source.target_weight : source.weight || "",
            target_rpe: source.target_rpe != null ? source.target_rpe : source.rpe || "",
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
        sets: sets.map(function (set) {
          var source = set || {};
          return {
            reps: source.reps != null ? source.reps : "",
            weight: source.weight != null ? source.weight : "",
            rpe: source.rpe != null ? source.rpe : "",
            notes: source.notes != null ? source.notes : "",
            done: !!source.done,
            target_reps: source.target_reps || "",
            target_weight: source.target_weight || "",
            target_rpe: source.target_rpe || "",
            target_notes: source.target_notes || ""
          };
        })
      };
    });
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
      structure: normalizeStructure(payload && payload.structure),
      days: payload && payload.days ? payload.days : {}
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
    if (dayLabels[slotKey]) {
      return base + " - " + dayLabels[slotKey];
    }
    return base;
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
    
    if (!tbody) {
      return;
    }

    tbody.innerHTML = "";

    if (!state.exercises || state.exercises.length === 0) {
      if (emptyState) {
        emptyState.style.display = "block";
      }
      return;
    }

    if (emptyState) {
      emptyState.style.display = "none";
    }

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

  function renderSectionHeader(tbody, section) {
    var tr = document.createElement("tr");
    tr.className = "section-header-row";
    tr.innerHTML = '<td colspan="100" class="section-header">' + escapeHtml(section) + '</td>';
    tbody.appendChild(tr);
  }

  function renderExerciseRow(exercise, exerciseIdx, groupSize, groupPosition, supersetLabel) {
    var tbody = document.querySelector("[data-workout-rows]");
    if (!tbody) return;

    exercise.sets.forEach(function (set, setIdx) {
      var tr = document.createElement("tr");
      var isFirstSet = setIdx === 0;
      var isFirstInSuperset = isFirstSet && groupPosition === 0;
      var cells = "";

      // Exercise name cell with rowspan on first set
      if (isFirstSet) {
        var rowspan = exercise.sets.length;
        var cellClass = supersetLabel ? "exercise-cell superset-member" : "exercise-cell";
        var actionsHtml = "";

        if (!state.isAthleteLockedView) {
          actionsHtml =
            '<div class="exercise-actions"><button type="button" class="exercise-add-set" data-exercise="' +
            exerciseIdx +
            '">+ Set</button><button type="button" class="exercise-toggle-mode" data-exercise="' +
            exerciseIdx +
            '">Toggle Mode</button><button type="button" class="exercise-change-section" data-exercise="' +
            exerciseIdx +
            '">Change Section</button><button type="button" class="exercise-superset" data-exercise="' +
            exerciseIdx +
            '">' +
            (exercise.superset_group ? "Remove from Superset" : "Make Superset") +
            '</button><button type="button" class="exercise-remove" data-exercise="' +
            exerciseIdx +
            '">Remove</button></div>';
        }
        
        cells +=
          '<td rowspan="' +
          rowspan +
          '" class="' +
          cellClass +
          '"><div class="exercise-header">';

        if (isFirstInSuperset && supersetLabel) {
          cells += '<div class="superset-label">' + supersetLabel + " - Set " + (groupPosition + 1) + '</div>';
        }

        cells +=
          '<div class="exercise-name">' +
          escapeHtml(exercise.name) +
          '</div><div class="exercise-mode-label">' + (exercise.mode === "time" ? "⏱ Time" : "Reps") + '</div>' +
          actionsHtml +
          '</div></td>';
      }

      cells +=
        '<td><input type="number" min="1" class="set-number" data-exercise="' +
        exerciseIdx +
        '" data-set="' +
        setIdx +
        '" value="' +
        (setIdx + 1) +
        '" disabled /></td>' +
        '<td><input type="text" data-field="reps" data-exercise="' +
        exerciseIdx +
        '" data-set="' +
        setIdx +
        '" value="' +
        escapeAttribute(set.reps) +
        '" placeholder="' +
        escapeAttribute(
          set.target_reps || (exercise.mode === "time" ? "e.g. 45s" : "e.g. 5")
        ) +
        '" /></td>' +
        '<td><input type="text" data-field="weight" data-exercise="' +
        exerciseIdx +
        '" data-set="' +
        setIdx +
        '" value="' +
        escapeAttribute(set.weight) +
        '" placeholder="' + escapeAttribute(set.target_weight || "e.g. 185") + '" /></td>' +
        '<td><input type="text" data-field="rpe" data-exercise="' +
        exerciseIdx +
        '" data-set="' +
        setIdx +
        '" value="' +
        escapeAttribute(set.rpe) +
        '" placeholder="' + escapeAttribute(set.target_rpe || "1-10") + '" /></td>' +
        '<td><input type="text" data-field="notes" data-exercise="' +
        exerciseIdx +
        '" data-set="' +
        setIdx +
        '" value="' +
        escapeAttribute(set.notes) +
        '" placeholder="' + escapeAttribute(set.target_notes || "Notes") + '" /></td>' +
        '<td><input type="checkbox" data-field="done" data-exercise="' +
        exerciseIdx +
        '" data-set="' +
        setIdx +
        '" ' +
        (set.done ? "checked" : "") +
        ' /></td>';

      if (!state.isAthleteLockedView && (setIdx > 0 || exercise.sets.length > 1)) {
        cells +=
          '<td><button type="button" class="program-row-remove" data-exercise="' +
          exerciseIdx +
          '" data-set="' +
          setIdx +
          '">Remove</button></td>';
      } else {
        cells += '<td></td>';
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
    if (!tbody) return;

    tbody.querySelectorAll('input[type="text"], input[type="number"]').forEach(function (input) {
      if (!input.disabled) {
        input.addEventListener("input", onSetInput);
        input.addEventListener("change", onSetInput);
      }
    });

    tbody.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
      input.addEventListener("change", onSetInput);
    });

    if (!state.isAthleteLockedView) {
      tbody.querySelectorAll(".exercise-add-set").forEach(function (btn) {
        btn.addEventListener("click", onAddSetToExercise);
      });
      tbody.querySelectorAll(".exercise-change-section").forEach(function (btn) {
        btn.addEventListener("click", onChangeExerciseSection);
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
    return field === "reps" || field === "weight" || field === "rpe" || field === "notes" || field === "done";
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
    var newMode = exercise.mode === "time" ? "reps" : "time";
    exercise.mode = newMode;

    var modeText = newMode === "time" ? "time-based (e.g. 45s)" : "reps-based (e.g. 5, 8, 10)";
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

    var progressText = completed + " / " + total + " sets marked done";
    summary.querySelector(".progress-text").textContent = "Completion: " + progressText;
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
