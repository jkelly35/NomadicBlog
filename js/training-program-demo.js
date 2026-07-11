(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";

  var state = {
    exercises: [],
    day: "w1d1",
    storagePrefix: "nomadic_training_program_demo_",
    isTemplateBuilder: false,
    templateId: null,
    templatePresetKey: null,
    templateName: "",
    client: null,
    assignedTemplateId: null,
    assignedProgramInstanceId: null,
    assignedTemplateDays: null,
    isCoachAssignedProgramEdit: false,
    legacyStoragePrefix: null,
    athleteName: "",
    isAthleteLockedView: false,
    isProgramReadOnly: false,
    coachUserId: null,
    builderStep: 1,
    dailyProgrammingViewMode: "week",
    dailyProgrammingPhaseIndex: 0,
    dailyProgrammingWeekInPhase: 1,
    dailyProgrammingDayInPhase: 1,
    targetAthleteId: null,
    structure: {
      weeks: 1,
      workoutsPerWeek: 3
    },
    templateFocus: "strength",
    programMeta: null,
    programPhases: [],
    weeklyStructure: [],
    sessionPlans: {},
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
    lastIsAthleteMobileUi: false,
    workoutWalkthroughActive: false,
    workoutWalkthroughStepIndex: 0,
    workoutWalkthroughSteps: [],
    workoutWalkthroughStartedAt: null,
    workoutCompletionSummary: null
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

  var EXERCISE_LIBRARY_SEED = [
    {
      id: "seed_back_squat",
      name: "Back Squat",
      movement_pattern: "squat",
      equipment: "barbell",
      primary_muscle: "quads",
      training_goal: "strength",
      sport_tags: ["mixed", "skiing", "climbing"],
      custom_tags: ["compound", "lower-body"],
      description: "Primary lower-body strength lift.",
      coaching_cues: "Brace trunk, control descent, drive evenly through full foot.",
      video_demo_url: "",
      default_section: "A Block",
      default_mode: "reps",
      default_set_count: 4,
      default_rep_value: "5",
      default_secondary_value: "",
      default_intensity_value: "RPE 7",
      default_rest_value: "120s",
      default_show_weight: true,
      default_show_rpe: true,
      default_show_rest: true
    },
    {
      id: "seed_weighted_pull_up",
      name: "Weighted Pull-Up",
      movement_pattern: "pull",
      equipment: "other",
      primary_muscle: "back",
      training_goal: "strength",
      sport_tags: ["climbing", "mixed"],
      custom_tags: ["upper-body", "vertical-pull"],
      description: "Vertical pulling strength and scapular control.",
      coaching_cues: "Start from dead hang, pull chest tall, avoid kipping.",
      video_demo_url: "",
      default_section: "A Block",
      default_mode: "reps",
      default_set_count: 4,
      default_rep_value: "4",
      default_secondary_value: "",
      default_intensity_value: "RPE 8",
      default_rest_value: "120s",
      default_show_weight: true,
      default_show_rpe: true,
      default_show_rest: true
    },
    {
      id: "seed_split_squat",
      name: "Rear Foot Elevated Split Squat",
      movement_pattern: "squat",
      equipment: "dumbbell",
      primary_muscle: "glutes",
      training_goal: "strength",
      sport_tags: ["trail-running", "skiing", "mixed"],
      custom_tags: ["unilateral", "knee-control"],
      description: "Unilateral leg strength for durability and symmetry.",
      coaching_cues: "Stay tall, front knee tracks over mid-foot, control tempo.",
      video_demo_url: "",
      default_section: "B Block",
      default_mode: "reps",
      default_set_count: 3,
      default_rep_value: "8 / side",
      default_secondary_value: "",
      default_intensity_value: "RPE 7",
      default_rest_value: "90s",
      default_show_weight: true,
      default_show_rpe: true,
      default_show_rest: true
    },
    {
      id: "seed_deadlift",
      name: "Trap Bar Deadlift",
      movement_pattern: "hinge",
      equipment: "barbell",
      primary_muscle: "hamstrings",
      training_goal: "strength",
      sport_tags: ["mixed", "skiing", "snowboarding"],
      custom_tags: ["posterior-chain", "power"],
      description: "Posterior-chain strength with reduced spinal loading.",
      coaching_cues: "Neutral spine, push floor away, lockout with glutes.",
      video_demo_url: "",
      default_section: "A Block",
      default_mode: "reps",
      default_set_count: 4,
      default_rep_value: "3",
      default_secondary_value: "",
      default_intensity_value: "RPE 8",
      default_rest_value: "150s",
      default_show_weight: true,
      default_show_rpe: true,
      default_show_rest: true
    },
    {
      id: "seed_box_jump",
      name: "Box Jump",
      movement_pattern: "plyometric",
      equipment: "other",
      primary_muscle: "full-body",
      training_goal: "power",
      sport_tags: ["climbing", "skiing", "mixed"],
      custom_tags: ["explosive", "low-volume"],
      description: "Explosive intent and landing mechanics.",
      coaching_cues: "Max intent on jump, quiet landing, full reset each rep.",
      video_demo_url: "",
      default_section: "B Block",
      default_mode: "reps",
      default_set_count: 4,
      default_rep_value: "3",
      default_secondary_value: "",
      default_intensity_value: "Fast",
      default_rest_value: "90s",
      default_show_weight: false,
      default_show_rpe: true,
      default_show_rest: true
    },
    {
      id: "seed_plank",
      name: "RKC Plank",
      movement_pattern: "core",
      equipment: "bodyweight",
      primary_muscle: "core",
      training_goal: "stability",
      sport_tags: ["mixed", "trail-running", "climbing"],
      custom_tags: ["trunk-stability"],
      description: "High-tension anti-extension core drill.",
      coaching_cues: "Posterior pelvic tilt, ribs down, breathe behind brace.",
      video_demo_url: "",
      default_section: "C Block",
      default_mode: "time",
      default_set_count: 3,
      default_rep_value: "30s",
      default_secondary_value: "BW",
      default_intensity_value: "RPE 7",
      default_rest_value: "45s",
      default_show_weight: true,
      default_show_rpe: true,
      default_show_rest: true
    },
    {
      id: "seed_zone2_run",
      name: "Zone 2 Run",
      movement_pattern: "locomotion",
      equipment: "bodyweight",
      primary_muscle: "full-body",
      training_goal: "endurance",
      sport_tags: ["trail-running", "mixed", "skiing"],
      custom_tags: ["aerobic-base"],
      description: "Steady aerobic conditioning session.",
      coaching_cues: "Nasal breathing as possible, conversational pace.",
      video_demo_url: "",
      default_section: "A Block",
      default_mode: "endurance",
      default_set_count: 1,
      default_rep_value: "45:00",
      default_secondary_value: "Zone 2",
      default_intensity_value: "Z2",
      default_rest_value: "",
      default_show_weight: true,
      default_show_rpe: true,
      default_show_rest: false
    },
    {
      id: "seed_hangboard_repeaters",
      name: "Hangboard Repeaters",
      movement_pattern: "pull",
      equipment: "other",
      primary_muscle: "back",
      training_goal: "strength",
      sport_tags: ["climbing"],
      custom_tags: ["fingers", "forearm"],
      description: "Finger strength repeaters on edge protocol.",
      coaching_cues: "Strict shoulder position, stop before form breakdown.",
      video_demo_url: "",
      default_section: "A Block",
      default_mode: "time",
      default_set_count: 6,
      default_rep_value: "10s",
      default_secondary_value: "20mm edge",
      default_intensity_value: "Submax",
      default_rest_value: "50s",
      default_show_weight: true,
      default_show_rpe: true,
      default_show_rest: true
    },
    {
      id: "seed_mobility_flow",
      name: "Mobility Flow",
      movement_pattern: "core",
      equipment: "bodyweight",
      primary_muscle: "full-body",
      training_goal: "mobility",
      sport_tags: ["mixed", "climbing", "skiing", "trail-running"],
      custom_tags: ["recovery"],
      description: "Low-intensity mobility sequence for recovery days.",
      coaching_cues: "Move slowly through full range, keep nasal breathing.",
      video_demo_url: "",
      default_section: "Cool Down",
      default_mode: "time",
      default_set_count: 1,
      default_rep_value: "10:00",
      default_secondary_value: "",
      default_intensity_value: "Easy",
      default_rest_value: "",
      default_show_weight: false,
      default_show_rpe: true,
      default_show_rest: false
    }
  ];

  var PROGRAM_TYPE_OPTIONS = [
    "hybrid",
    "strength",
    "endurance",
    "return_to_sport",
    "premade",
    "group",
    "individualized"
  ];

  var WEEKLY_SESSION_TYPE_OPTIONS = [
    { value: "strength_lower", label: "Strength Lower" },
    { value: "strength_upper", label: "Strength Upper" },
    { value: "strength_full", label: "Strength Full Body" },
    { value: "zone2", label: "Zone 2 Endurance" },
    { value: "threshold", label: "Threshold / Tempo" },
    { value: "vo2", label: "VO2 / High Intensity" },
    { value: "uphill", label: "Uphill / Vertical" },
    { value: "long_endurance", label: "Long Endurance / Mountain Day" },
    { value: "mobility", label: "Mobility / Recovery" },
    { value: "assessment", label: "Testing / Assessment" },
    { value: "rest", label: "Rest / Off" }
  ];

  var PHASE_PRESETS_BY_PROGRAM_TYPE = {
    hybrid: [
      { name: "Base", focus: "Aerobic volume and strength foundation", strength_rule: "Moderate loads, control work", endurance_rule: "Mostly Zone 2" },
      { name: "Build", focus: "Strength progression and threshold build", strength_rule: "Heavier primary lifts", endurance_rule: "Add threshold intervals" },
      { name: "Specific", focus: "Mountain-specific conditioning", strength_rule: "Unilateral and durability emphasis", endurance_rule: "Uphill / terrain specificity" },
      { name: "Taper", focus: "Reduce fatigue and maintain sharpness", strength_rule: "Reduce volume, keep intent", endurance_rule: "Short intensity, reduced duration" }
    ],
    strength: [
      { name: "Foundation", focus: "Movement quality and base strength", strength_rule: "Moderate volume, technique priority", endurance_rule: "Optional recovery aerobic" },
      { name: "Build", focus: "Load progression and accessory development", strength_rule: "Heavier main lifts", endurance_rule: "Low-impact support only" },
      { name: "Realization", focus: "Peak strength and reduce fatigue", strength_rule: "Lower volume, maintain intensity", endurance_rule: "Minimal interference" }
    ],
    endurance: [
      { name: "Base", focus: "Aerobic development", strength_rule: "Maintenance strength", endurance_rule: "Zone 2 volume progression" },
      { name: "Build", focus: "Threshold and event capacity", strength_rule: "Low-volume support", endurance_rule: "Threshold / uphill work" },
      { name: "Taper", focus: "Freshness before event", strength_rule: "Maintenance only", endurance_rule: "Reduce volume, keep touch points" }
    ],
    return_to_sport: [
      { name: "Protection", focus: "Pain monitoring and tissue tolerance", strength_rule: "Isometrics / low irritability", endurance_rule: "Low-impact aerobic support" },
      { name: "Reload", focus: "Progressive strength and volume", strength_rule: "Eccentric to dynamic progression", endurance_rule: "Gradual duration increase" },
      { name: "Return", focus: "Specific return-to-sport demands", strength_rule: "Introduce impact / power as tolerated", endurance_rule: "Restore specific capacity" }
    ]
  };

  var SESSION_BLOCK_TYPE_OPTIONS = [
    { value: "warmup", label: "Warm-Up" },
    { value: "activation", label: "Activation / Prep" },
    { value: "power", label: "Power" },
    { value: "main_strength", label: "Main Strength" },
    { value: "secondary_strength", label: "Secondary Strength" },
    { value: "hangboarding", label: "Hangboarding" },
    { value: "accessory", label: "Accessory / Durability" },
    { value: "zone2", label: "Zone 2" },
    { value: "threshold", label: "Threshold" },
    { value: "intervals", label: "Intervals" },
    { value: "emom", label: "EMOM" },
    { value: "amrap", label: "AMRAP" },
    { value: "long_day", label: "Long Mountain Day" },
    { value: "mobility", label: "Mobility / Recovery" },
    { value: "cooldown", label: "Cooldown" },
    { value: "assessment", label: "Assessment / Testing" }
  ];

  var SESSION_BLOCK_PRESETS = {
    warmup: { type: "warmup", title: "Warm-Up", prescription: "10 min progressive warm-up", notes: "Prepare tissues, joints, and key movement patterns." },
    activation: { type: "activation", title: "Activation / Prep", prescription: "2-3 activation drills x 2 rounds", notes: "Target weak links or injury-management priorities." },
    main_strength: { type: "main_strength", title: "Main Strength", prescription: "4 x 5 @ RPE 7", notes: "Primary strength stimulus for the day." },
    secondary_strength: { type: "secondary_strength", title: "Secondary Strength", prescription: "3 x 8", notes: "Secondary lift or unilateral progression." },
    hangboarding: { type: "hangboarding", title: "Hangboarding", prescription: "6 rounds of 10s hang / 50s rest", notes: "Select grip type and maintain strict form." },
    intervals: { type: "intervals", title: "Intervals", prescription: "4 x 5 min @ threshold with 3 min easy", notes: "Use terrain and sport context where relevant." },
    emom: { type: "emom", title: "EMOM", prescription: "12-minute EMOM", notes: "Assign a repeatable minute-by-minute task with clean execution." },
    amrap: { type: "amrap", title: "AMRAP", prescription: "15-minute AMRAP", notes: "Sustainable quality pace while accumulating rounds." },
    zone2: { type: "zone2", title: "Zone 2", prescription: "60-90 min Zone 2", notes: "Can include terrain / vertical targets." },
    long_day: { type: "long_day", title: "Long Mountain Day", prescription: "2-4 hr aerobic mountain session", notes: "Prescribe terrain, vertical gain, and fueling." },
    cooldown: { type: "cooldown", title: "Cooldown", prescription: "8-10 min easy cooldown", notes: "Restore range and downregulate." }
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
    var startWorkoutBtn = document.querySelector("[data-start-workout]");
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
      stopWorkoutWalkthrough(true);
      state.workoutCompletionSummary = null;

      if (state.isTemplateBuilder) {
        saveExercisesForDay(true);
      }

      if (shouldUsePhaseDailyNavigator()) {
        applyDailyNavigatorSelectionFromAxisValue(daySelect.value);
      } else {
        state.day = daySelect.value;
      }
      loadExercisesForDay();
      renderRows();
      renderDailyProgrammingDesigner();
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
    bindTemplatePlannerEvents();
    bindDailyProgrammingDesignerEvents();
    bindDailyProgrammingNavigationEvents();
    bindTemplateProgramOverviewEvents();
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
        saveExercisesForDay(true);
        if (state.isTemplateBuilder) {
          openTemplateProgramOverviewPage();
          return;
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

        if (state.isCoachAssignedProgramEdit) {
          saveExercisesForDay();
          renderDailyProgrammingDesigner();
          return;
        }

        saveExercisesForDay();
        syncScheduledSessionStatusForCurrentDay();
        updateStats();
      });
    }

    if (startWorkoutBtn) {
      wireStartWorkoutButton(startWorkoutBtn);
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
        stopWorkoutWalkthrough(true);
        state.workoutCompletionSummary = null;
        saveExercisesForDay();
        renderRows();
        setStatus(state.isTemplateBuilder ? "Template day cleared." : "Workout log cleared for this day.", "info");
        updateStats();
      });
    }

    loadExercisesForDay();
    renderRows();
    renderDailyProgrammingDesigner();
    updateDayInfo();
    refreshTemplateDayTools();
    updateStats();
  }

  function bindDailyProgrammingDesignerEvents() {
    document.addEventListener("click", function (event) {
      var addAxisBlockBtn = event.target && event.target.closest("[data-axis-plan-add-block]");
      if (addAxisBlockBtn) {
        var addBlockSlot = String(addAxisBlockBtn.getAttribute("data-axis-plan-add-block") || "").trim();
        if (addBlockSlot) {
          var addBlockPlan = getSessionPlanForSlot(addBlockSlot);
          addBlockPlan.blocks.push(createEmptySessionBlock(addBlockPlan.session_type, addBlockPlan.blocks.length));
          state.sessionPlans[addBlockSlot] = addBlockPlan;
          saveExercisesForDay(true);
          renderDailyAxisEditorCards();
          if (addBlockSlot === state.day) {
            renderSessionPlanBlocks(addBlockPlan);
            renderDailyProgrammingSummary(addBlockPlan);
          }
        }
        return;
      }

      var removeAxisBlockBtn = event.target && event.target.closest("[data-axis-plan-remove-block]");
      if (removeAxisBlockBtn) {
        var removeBlockSlot = String(removeAxisBlockBtn.getAttribute("data-axis-slot") || "").trim();
        var removeBlockIndex = parseInt(String(removeAxisBlockBtn.getAttribute("data-axis-plan-remove-block") || "-1"), 10);
        if (removeBlockSlot && Number.isFinite(removeBlockIndex)) {
          var removeBlockPlan = getSessionPlanForSlot(removeBlockSlot);
          if (removeBlockIndex >= 0 && removeBlockIndex < removeBlockPlan.blocks.length) {
            removeBlockPlan.blocks.splice(removeBlockIndex, 1);
            state.sessionPlans[removeBlockSlot] = removeBlockPlan;
            saveExercisesForDay(true);
            renderDailyAxisEditorCards();
            if (removeBlockSlot === state.day) {
              renderSessionPlanBlocks(removeBlockPlan);
              renderDailyProgrammingSummary(removeBlockPlan);
            }
          }
        }
        return;
      }

      var addAxisExerciseBtn = event.target && event.target.closest("[data-axis-add-exercise]");
      if (addAxisExerciseBtn) {
        var addExerciseSlot = String(addAxisExerciseBtn.getAttribute("data-axis-slot") || "").trim();
        var addExerciseBlockIndex = parseInt(String(addAxisExerciseBtn.getAttribute("data-axis-block-index") || "-1"), 10);
        if (addExerciseSlot && Number.isFinite(addExerciseBlockIndex)) {
          var addExercisePlan = getSessionPlanForSlot(addExerciseSlot);
          if (addExerciseBlockIndex >= 0 && addExerciseBlockIndex < addExercisePlan.blocks.length) {
            var addExerciseBlock = addExercisePlan.blocks[addExerciseBlockIndex];
            var exerciseCount = clampNumber(parseInt(addExerciseBlock.exercise_count, 10), 1, 20, 1);
            if (exerciseCount >= 20) {
              setStatus("Max 20 exercises per block.", "info");
              return;
            }

            var nextExerciseCount = exerciseCount + 1;
            var exerciseNames = normalizeExerciseNames(addExerciseBlock.exercise_names, exerciseCount);
            var exerciseSets = normalizeExerciseValues(addExerciseBlock.exercise_sets, exerciseCount, 3);
            var exerciseIntensityTypes = normalizeExerciseValues(addExerciseBlock.exercise_intensity_types, exerciseCount, "rpe");
            exerciseNames.push("");
            exerciseSets.push("3");
            exerciseIntensityTypes.push("rpe");

            addExerciseBlock.exercise_count = nextExerciseCount;
            addExerciseBlock.exercise_names = normalizeExerciseNames(exerciseNames, nextExerciseCount);
            addExerciseBlock.exercise_sets = normalizeExerciseValues(exerciseSets, nextExerciseCount, 3);
            addExerciseBlock.exercise_intensity_types = normalizeExerciseValues(exerciseIntensityTypes, nextExerciseCount, "rpe").map(normalizeIntensityTypeValue);
            addExerciseBlock.exercise_set_reps = normalizeExerciseNestedValues(addExerciseBlock.exercise_set_reps, nextExerciseCount, "5", addExerciseBlock.exercise_sets);
            addExerciseBlock.exercise_set_intensities = normalizeExerciseNestedValues(addExerciseBlock.exercise_set_intensities, nextExerciseCount, "7", addExerciseBlock.exercise_sets);
            addExerciseBlock.exercise_set_rests = normalizeExerciseNestedValues(addExerciseBlock.exercise_set_rests, nextExerciseCount, "", addExerciseBlock.exercise_sets);
            addExerciseBlock.exercise_set_rep_types = normalizeExerciseSetRepTypes(
              addExerciseBlock.exercise_set_rep_types,
              nextExerciseCount,
              addExerciseBlock.exercise_sets,
              addExerciseBlock.exercise_rep_types
            );
            addExerciseBlock.exercise_set_intensity_types = normalizeExerciseSetIntensityTypes(
              addExerciseBlock.exercise_set_intensity_types,
              nextExerciseCount,
              addExerciseBlock.exercise_sets,
              addExerciseBlock.exercise_intensity_types
            );

            state.sessionPlans[addExerciseSlot] = addExercisePlan;
            saveExercisesForDay(true);
            renderDailyAxisEditorCards();
            if (addExerciseSlot === state.day) {
              renderSessionPlanBlocks(addExercisePlan);
              renderDailyProgrammingSummary(addExercisePlan);
            }
          }
        }
        return;
      }

      var removeAxisExerciseBtn = event.target && event.target.closest("[data-axis-remove-exercise]");
      if (removeAxisExerciseBtn) {
        var removeExerciseSlot = String(removeAxisExerciseBtn.getAttribute("data-axis-slot") || "").trim();
        var removeExerciseBlockIndex = parseInt(String(removeAxisExerciseBtn.getAttribute("data-axis-block-index") || "-1"), 10);
        var removeExerciseIndex = parseInt(String(removeAxisExerciseBtn.getAttribute("data-axis-remove-exercise") || "-1"), 10);
        if (removeExerciseSlot && Number.isFinite(removeExerciseBlockIndex) && Number.isFinite(removeExerciseIndex)) {
          var removeExercisePlan = getSessionPlanForSlot(removeExerciseSlot);
          if (removeExerciseBlockIndex >= 0 && removeExerciseBlockIndex < removeExercisePlan.blocks.length) {
            var removeExerciseBlock = removeExercisePlan.blocks[removeExerciseBlockIndex];
            var removeExerciseCount = clampNumber(parseInt(removeExerciseBlock.exercise_count, 10), 1, 20, 1);
            if (removeExerciseCount <= 1) {
              setStatus("At least one exercise is required in a block.", "info");
              return;
            }

            var removeNames = normalizeExerciseNames(removeExerciseBlock.exercise_names, removeExerciseCount);
            var removeSets = normalizeExerciseValues(removeExerciseBlock.exercise_sets, removeExerciseCount, 3);
            var removeIntensityTypes = normalizeExerciseValues(removeExerciseBlock.exercise_intensity_types, removeExerciseCount, "rpe");
            var removeSetReps = normalizeExerciseNestedValues(removeExerciseBlock.exercise_set_reps, removeExerciseCount, "5", removeSets);
            var removeSetIntensities = normalizeExerciseNestedValues(removeExerciseBlock.exercise_set_intensities, removeExerciseCount, "7", removeSets);
            var removeSetRests = normalizeExerciseNestedValues(removeExerciseBlock.exercise_set_rests, removeExerciseCount, "", removeSets);

            if (removeExerciseIndex >= 0 && removeExerciseIndex < removeNames.length) {
              removeNames.splice(removeExerciseIndex, 1);
              removeSets.splice(removeExerciseIndex, 1);
              removeIntensityTypes.splice(removeExerciseIndex, 1);
              removeSetReps.splice(removeExerciseIndex, 1);
              removeSetIntensities.splice(removeExerciseIndex, 1);
              removeSetRests.splice(removeExerciseIndex, 1);

              var trimmedExerciseCount = removeExerciseCount - 1;
              removeExerciseBlock.exercise_count = trimmedExerciseCount;
              removeExerciseBlock.exercise_names = normalizeExerciseNames(removeNames, trimmedExerciseCount);
              removeExerciseBlock.exercise_sets = normalizeExerciseValues(removeSets, trimmedExerciseCount, 3);
              removeExerciseBlock.exercise_intensity_types = normalizeExerciseValues(removeIntensityTypes, trimmedExerciseCount, "rpe").map(normalizeIntensityTypeValue);
              removeExerciseBlock.exercise_set_reps = normalizeExerciseNestedValues(removeSetReps, trimmedExerciseCount, "5", removeExerciseBlock.exercise_sets);
              removeExerciseBlock.exercise_set_intensities = normalizeExerciseNestedValues(removeSetIntensities, trimmedExerciseCount, "7", removeExerciseBlock.exercise_sets);
              removeExerciseBlock.exercise_set_rests = normalizeExerciseNestedValues(removeSetRests, trimmedExerciseCount, "", removeExerciseBlock.exercise_sets);
              removeExerciseBlock.exercise_set_rep_types = normalizeExerciseSetRepTypes(
                removeExerciseBlock.exercise_set_rep_types,
                trimmedExerciseCount,
                removeExerciseBlock.exercise_sets,
                removeExerciseBlock.exercise_rep_types
              );
              removeExerciseBlock.exercise_set_intensity_types = normalizeExerciseSetIntensityTypes(
                removeExerciseBlock.exercise_set_intensity_types,
                trimmedExerciseCount,
                removeExerciseBlock.exercise_sets,
                removeExerciseBlock.exercise_intensity_types
              );

              state.sessionPlans[removeExerciseSlot] = removeExercisePlan;
              saveExercisesForDay(true);
              renderDailyAxisEditorCards();
              if (removeExerciseSlot === state.day) {
                renderSessionPlanBlocks(removeExercisePlan);
                renderDailyProgrammingSummary(removeExercisePlan);
              }
            }
          }
        }
        return;
      }

      var addAxisSetBtn = event.target && event.target.closest("[data-axis-add-set]");
      if (addAxisSetBtn) {
        var addSetSlot = String(addAxisSetBtn.getAttribute("data-axis-slot") || "").trim();
        var addSetBlockIndex = parseInt(String(addAxisSetBtn.getAttribute("data-axis-block-index") || "-1"), 10);
        var addSetExerciseIndex = parseInt(String(addAxisSetBtn.getAttribute("data-axis-exercise-index") || "-1"), 10);
        if (addSetSlot && Number.isFinite(addSetBlockIndex) && Number.isFinite(addSetExerciseIndex)) {
          var addSetPlan = getSessionPlanForSlot(addSetSlot);
          if (addSetBlockIndex >= 0 && addSetBlockIndex < addSetPlan.blocks.length) {
            var addSetBlock = addSetPlan.blocks[addSetBlockIndex];
            var addSetExerciseCount = clampNumber(parseInt(addSetBlock.exercise_count, 10), 1, 20, 1);
            var addSetCounts = normalizeExerciseValues(addSetBlock.exercise_sets, addSetExerciseCount, 3);
            if (addSetExerciseIndex >= 0 && addSetExerciseIndex < addSetCounts.length) {
              var currentSetCount = clampNumber(parseInt(addSetCounts[addSetExerciseIndex], 10), 1, 20, 1);
              if (currentSetCount >= 20) {
                setStatus("Max 20 sets per exercise.", "info");
                return;
              }

              var existingSetReps = normalizeExerciseNestedValues(addSetBlock.exercise_set_reps, addSetExerciseCount, "5", addSetCounts);
              var existingSetIntensities = normalizeExerciseNestedValues(addSetBlock.exercise_set_intensities, addSetExerciseCount, "7", addSetCounts);
              var existingSetRests = normalizeExerciseNestedValues(addSetBlock.exercise_set_rests, addSetExerciseCount, "", addSetCounts);
              var existingSetRepTypes = normalizeExerciseSetRepTypes(
                addSetBlock.exercise_set_rep_types,
                addSetExerciseCount,
                addSetCounts,
                addSetBlock.exercise_rep_types
              );
              var existingSetIntensityTypes = normalizeExerciseSetIntensityTypes(
                addSetBlock.exercise_set_intensity_types,
                addSetExerciseCount,
                addSetCounts,
                addSetBlock.exercise_intensity_types
              );

              addSetCounts[addSetExerciseIndex] = String(currentSetCount + 1);
              addSetBlock.exercise_sets = addSetCounts;
              addSetBlock.exercise_set_reps = normalizeExerciseNestedValues(addSetBlock.exercise_set_reps, addSetExerciseCount, "5", addSetCounts);
              addSetBlock.exercise_set_intensities = normalizeExerciseNestedValues(addSetBlock.exercise_set_intensities, addSetExerciseCount, "7", addSetCounts);
              addSetBlock.exercise_set_rests = normalizeExerciseNestedValues(addSetBlock.exercise_set_rests, addSetExerciseCount, "", addSetCounts);
              addSetBlock.exercise_set_rep_types = normalizeExerciseSetRepTypes(
                addSetBlock.exercise_set_rep_types,
                addSetExerciseCount,
                addSetCounts,
                addSetBlock.exercise_rep_types
              );
              addSetBlock.exercise_set_intensity_types = normalizeExerciseSetIntensityTypes(
                addSetBlock.exercise_set_intensity_types,
                addSetExerciseCount,
                addSetCounts,
                addSetBlock.exercise_intensity_types
              );

              var lastSetIndex = Math.max(0, currentSetCount - 1);
              addSetBlock.exercise_set_reps[addSetExerciseIndex][currentSetCount] = existingSetReps[addSetExerciseIndex][lastSetIndex] || "5";
              addSetBlock.exercise_set_intensities[addSetExerciseIndex][currentSetCount] = existingSetIntensities[addSetExerciseIndex][lastSetIndex] || "7";
              addSetBlock.exercise_set_rests[addSetExerciseIndex][currentSetCount] = existingSetRests[addSetExerciseIndex][lastSetIndex] || "";
              addSetBlock.exercise_set_rep_types[addSetExerciseIndex][currentSetCount] = existingSetRepTypes[addSetExerciseIndex][lastSetIndex] || "reps";
              addSetBlock.exercise_set_intensity_types[addSetExerciseIndex][currentSetCount] = existingSetIntensityTypes[addSetExerciseIndex][lastSetIndex] || "rpe";

              state.sessionPlans[addSetSlot] = addSetPlan;
              saveExercisesForDay(true);
              renderDailyAxisEditorCards();
              if (addSetSlot === state.day) {
                renderSessionPlanBlocks(addSetPlan);
                renderDailyProgrammingSummary(addSetPlan);
              }
            }
          }
        }
        return;
      }

      var removeAxisSetBtn = event.target && event.target.closest("[data-axis-remove-set]");
      if (removeAxisSetBtn) {
        var removeSetSlot = String(removeAxisSetBtn.getAttribute("data-axis-slot") || "").trim();
        var removeSetBlockIndex = parseInt(String(removeAxisSetBtn.getAttribute("data-axis-block-index") || "-1"), 10);
        var removeSetExerciseIndex = parseInt(String(removeAxisSetBtn.getAttribute("data-axis-exercise-index") || "-1"), 10);
        var removeSetIndex = parseInt(String(removeAxisSetBtn.getAttribute("data-axis-remove-set") || "-1"), 10);
        if (removeSetSlot && Number.isFinite(removeSetBlockIndex) && Number.isFinite(removeSetExerciseIndex) && Number.isFinite(removeSetIndex)) {
          var removeSetPlan = getSessionPlanForSlot(removeSetSlot);
          if (removeSetBlockIndex >= 0 && removeSetBlockIndex < removeSetPlan.blocks.length) {
            var removeSetBlock = removeSetPlan.blocks[removeSetBlockIndex];
            var removeSetExerciseCount = clampNumber(parseInt(removeSetBlock.exercise_count, 10), 1, 20, 1);
            var removeSetCounts = normalizeExerciseValues(removeSetBlock.exercise_sets, removeSetExerciseCount, 3);
            if (removeSetExerciseIndex >= 0 && removeSetExerciseIndex < removeSetCounts.length) {
              var totalSets = clampNumber(parseInt(removeSetCounts[removeSetExerciseIndex], 10), 1, 20, 1);
              if (totalSets <= 1) {
                setStatus("Each exercise needs at least one set.", "info");
                return;
              }

              var removeReps = normalizeExerciseNestedValues(removeSetBlock.exercise_set_reps, removeSetExerciseCount, "5", removeSetCounts);
              var removeIntensities = normalizeExerciseNestedValues(removeSetBlock.exercise_set_intensities, removeSetExerciseCount, "7", removeSetCounts);
              var removeRests = normalizeExerciseNestedValues(removeSetBlock.exercise_set_rests, removeSetExerciseCount, "", removeSetCounts);

              if (removeSetIndex >= 0 && removeSetIndex < removeReps[removeSetExerciseIndex].length) {
                removeReps[removeSetExerciseIndex].splice(removeSetIndex, 1);
              }
              if (removeSetIndex >= 0 && removeSetIndex < removeIntensities[removeSetExerciseIndex].length) {
                removeIntensities[removeSetExerciseIndex].splice(removeSetIndex, 1);
              }
              if (removeSetIndex >= 0 && removeSetIndex < removeRests[removeSetExerciseIndex].length) {
                removeRests[removeSetExerciseIndex].splice(removeSetIndex, 1);
              }

              removeSetCounts[removeSetExerciseIndex] = String(totalSets - 1);
              removeSetBlock.exercise_sets = removeSetCounts;
              removeSetBlock.exercise_set_reps = normalizeExerciseNestedValues(removeReps, removeSetExerciseCount, "5", removeSetCounts);
              removeSetBlock.exercise_set_intensities = normalizeExerciseNestedValues(removeIntensities, removeSetExerciseCount, "7", removeSetCounts);
              removeSetBlock.exercise_set_rests = normalizeExerciseNestedValues(removeRests, removeSetExerciseCount, "", removeSetCounts);
              removeSetBlock.exercise_set_rep_types = normalizeExerciseSetRepTypes(
                removeSetBlock.exercise_set_rep_types,
                removeSetExerciseCount,
                removeSetCounts,
                removeSetBlock.exercise_rep_types
              );
              removeSetBlock.exercise_set_intensity_types = normalizeExerciseSetIntensityTypes(
                removeSetBlock.exercise_set_intensity_types,
                removeSetExerciseCount,
                removeSetCounts,
                removeSetBlock.exercise_intensity_types
              );

              state.sessionPlans[removeSetSlot] = removeSetPlan;
              saveExercisesForDay(true);
              renderDailyAxisEditorCards();
              if (removeSetSlot === state.day) {
                renderSessionPlanBlocks(removeSetPlan);
                renderDailyProgrammingSummary(removeSetPlan);
              }
            }
          }
        }
        return;
      }

      var addBlockBtn = event.target && event.target.closest("[data-session-plan-add-block]");
      if (addBlockBtn) {
        var plan = getCurrentSessionPlan();
        plan.blocks.push(createEmptySessionBlock(plan.session_type, plan.blocks.length));
        state.sessionPlans[state.day] = plan;
        renderDailyProgrammingDesigner();
        return;
      }

      var quickBlockBtn = event.target && event.target.closest("[data-session-quick-block]");
      if (quickBlockBtn) {
        addQuickSessionBlock(String(quickBlockBtn.getAttribute("data-session-quick-block") || "").trim());
        return;
      }

      var removeBlockBtn = event.target && event.target.closest("[data-session-plan-remove-block]");
      if (removeBlockBtn) {
        var blockIndex = parseInt(String(removeBlockBtn.getAttribute("data-session-plan-remove-block") || "-1"), 10);
        var currentPlan = getCurrentSessionPlan();
        if (Number.isFinite(blockIndex) && blockIndex >= 0 && blockIndex < currentPlan.blocks.length) {
          currentPlan.blocks.splice(blockIndex, 1);
          state.sessionPlans[state.day] = currentPlan;
          renderDailyProgrammingDesigner();
        }
        return;
      }

      var resetBtn = event.target && event.target.closest("[data-session-plan-reset]");
      if (resetBtn) {
        state.sessionPlans[state.day] = buildDefaultSessionPlan(state.day);
        saveExercisesForDay(true);
        renderDailyProgrammingDesigner();
        setStatus("Daily session reset to defaults.", "info");
      }
    });

    document.addEventListener("input", function (event) {
      syncDailyProgrammingInput(event.target);
    });

    document.addEventListener("change", function (event) {
      syncDailyProgrammingInput(event.target);
    });
  }

  function bindDailyProgrammingNavigationEvents() {
    document.addEventListener("change", function (event) {
      var target = event.target;
      if (!target || !target.getAttribute) {
        return;
      }
      if (!shouldUsePhaseDailyNavigator()) {
        return;
      }

      var navField = target.hasAttribute("data-daily-nav-mode")
        ? "mode"
        : target.hasAttribute("data-daily-nav-phase")
          ? "phase"
          : target.hasAttribute("data-daily-nav-week")
            ? "week"
            : target.hasAttribute("data-daily-nav-day")
              ? "day"
              : "";

      if (!navField) {
        return;
      }

      saveExercisesForDay(true);
      syncDailyNavigatorStateFromControls();
      var daySelect = document.querySelector("[data-workout-day]");
      if (daySelect) {
        refreshWorkoutDaySelect(daySelect);
      }
      loadExercisesForDay();
      renderRows();
      renderDailyProgrammingDesigner();
      updateDayInfo();
      refreshTemplateDayTools();
      setStatus("");
    });
  }

  function shouldUsePhaseDailyNavigator() {
    return !!((state.isTemplateBuilder || state.isCoachAssignedProgramEdit) && state.builderStep === 3);
  }

  function getDailyNavigatorPhases() {
    return Array.isArray(state.programPhases) ? state.programPhases : [];
  }

  function getSelectedDailyNavigatorPhase() {
    var phases = getDailyNavigatorPhases();
    if (!phases.length) {
      return null;
    }
    var phaseIndex = clampNumber(parseInt(state.dailyProgrammingPhaseIndex, 10), 0, phases.length - 1, 0);
    state.dailyProgrammingPhaseIndex = phaseIndex;
    return phases[phaseIndex] || null;
  }

  function getEffectivePhaseTrainingDays(phase) {
    var configured = clampNumber(parseInt(phase && phase.training_days_per_week, 10), 1, 14, state.structure.workoutsPerWeek || 1);
    return Math.max(1, Math.min(configured, state.structure.workoutsPerWeek || configured));
  }

  function ensureDailyNavigatorState() {
    var phases = getDailyNavigatorPhases();
    if (!phases.length) {
      return;
    }

    var parsed = parseSlotKey(state.day) || { week: 1, workout: 1 };
    var matchedPhaseIndex = phases.findIndex(function (phase) {
      return parsed.week >= Number(phase && phase.start_week || 0) && parsed.week <= Number(phase && phase.end_week || 0);
    });

    if (!Number.isFinite(state.dailyProgrammingPhaseIndex) || state.dailyProgrammingPhaseIndex < 0 || state.dailyProgrammingPhaseIndex >= phases.length) {
      state.dailyProgrammingPhaseIndex = matchedPhaseIndex > -1 ? matchedPhaseIndex : 0;
    }

    if (state.dailyProgrammingViewMode !== "day" && state.dailyProgrammingViewMode !== "week" && state.dailyProgrammingViewMode !== "phase") {
      state.dailyProgrammingViewMode = state.isCoachAssignedProgramEdit ? "day" : "week";
    }

    var phase = getSelectedDailyNavigatorPhase();
    if (!phase) {
      return;
    }

    var phaseWeeks = getPhaseLengthWeeks(phase);
    var effectiveDays = getEffectivePhaseTrainingDays(phase);
    var weekInPhaseFromDay = clampNumber(parsed.week - Number(phase.start_week || 1) + 1, 1, phaseWeeks, 1);
    state.dailyProgrammingWeekInPhase = clampNumber(parseInt(state.dailyProgrammingWeekInPhase, 10), 1, phaseWeeks, weekInPhaseFromDay);
    state.dailyProgrammingDayInPhase = clampNumber(parseInt(state.dailyProgrammingDayInPhase, 10), 1, effectiveDays, parsed.workout);
    state.day = buildSlotKeyFromDailyNavigator();
  }

  function buildSlotKeyFromDailyNavigator() {
    var phase = getSelectedDailyNavigatorPhase();
    if (!phase) {
      return state.day || "w1d1";
    }
    var phaseWeeks = getPhaseLengthWeeks(phase);
    var effectiveDays = getEffectivePhaseTrainingDays(phase);
    var weekInPhase = clampNumber(parseInt(state.dailyProgrammingWeekInPhase, 10), 1, phaseWeeks, 1);
    var dayInPhase = clampNumber(parseInt(state.dailyProgrammingDayInPhase, 10), 1, effectiveDays, 1);
    var globalWeek = clampNumber(Number(phase.start_week || 1) + weekInPhase - 1, Number(phase.start_week || 1), Number(phase.end_week || phase.start_week || 1), Number(phase.start_week || 1));
    return "w" + String(globalWeek) + "d" + String(dayInPhase);
  }

  function renderDailyNavigatorControls() {
    if (!shouldUsePhaseDailyNavigator()) {
      return;
    }

    ensureDailyNavigatorState();

    var modeSelect = document.querySelector("[data-daily-nav-mode]");
    var phaseSelect = document.querySelector("[data-daily-nav-phase]");
    var weekSelect = document.querySelector("[data-daily-nav-week]");
    var daySelect = document.querySelector("[data-daily-nav-day]");
    var weekWrap = document.querySelector("[data-daily-nav-week-wrap]");
    var dayWrap = document.querySelector("[data-daily-nav-day-wrap]");
    var phase = getSelectedDailyNavigatorPhase();
    var phases = getDailyNavigatorPhases();

    if (modeSelect) {
      if (!modeSelect.querySelector('option[value="day"]')) {
        modeSelect.insertAdjacentHTML("afterbegin", '<option value="day">Day View</option>');
      }
      modeSelect.value = state.dailyProgrammingViewMode;
    }

    if (phaseSelect) {
      phaseSelect.innerHTML = phases.map(function (item, index) {
        return '<option value="' + String(index) + '">' + escapeHtml(String(item && item.name || ("Phase " + String(index + 1)))) + '</option>';
      }).join("");
      phaseSelect.value = String(state.dailyProgrammingPhaseIndex);
    }

    if (!phase) {
      if (weekWrap) {
        weekWrap.hidden = true;
      }
      if (dayWrap) {
        dayWrap.hidden = true;
      }
      return;
    }

    var phaseWeeks = getPhaseLengthWeeks(phase);
    var effectiveDays = getEffectivePhaseTrainingDays(phase);

    if (weekSelect) {
      weekSelect.innerHTML = new Array(phaseWeeks).fill("").map(function (_, index) {
        var value = index + 1;
        return '<option value="' + String(value) + '">Week ' + String(value) + '</option>';
      }).join("");
      weekSelect.value = String(state.dailyProgrammingWeekInPhase);
    }

    if (daySelect) {
      daySelect.innerHTML = new Array(effectiveDays).fill("").map(function (_, index) {
        var value = index + 1;
        return '<option value="' + String(value) + '">Day ' + String(value) + '</option>';
      }).join("");
      daySelect.value = String(state.dailyProgrammingDayInPhase);
    }

    if (weekWrap) {
      weekWrap.hidden = state.dailyProgrammingViewMode === "phase";
    }

    if (dayWrap) {
      dayWrap.hidden = state.dailyProgrammingViewMode === "week";
    }
  }

  function syncDailyNavigatorStateFromControls() {
    ensureDailyNavigatorState();
    var modeSelect = document.querySelector("[data-daily-nav-mode]");
    var phaseSelect = document.querySelector("[data-daily-nav-phase]");
    var weekSelect = document.querySelector("[data-daily-nav-week]");
    var daySelect = document.querySelector("[data-daily-nav-day]");

    if (modeSelect) {
      var nextMode = String(modeSelect.value || (state.isCoachAssignedProgramEdit ? "day" : "week")).trim().toLowerCase();
      state.dailyProgrammingViewMode = nextMode === "phase"
        ? "phase"
        : nextMode === "day"
          ? "day"
          : "week";
    }

    var phases = getDailyNavigatorPhases();
    if (phases.length && phaseSelect) {
      state.dailyProgrammingPhaseIndex = clampNumber(parseInt(phaseSelect.value, 10), 0, phases.length - 1, state.dailyProgrammingPhaseIndex || 0);
    }

    var phase = getSelectedDailyNavigatorPhase();
    if (phase) {
      var phaseWeeks = getPhaseLengthWeeks(phase);
      var effectiveDays = getEffectivePhaseTrainingDays(phase);
      if (weekSelect) {
        state.dailyProgrammingWeekInPhase = clampNumber(parseInt(weekSelect.value, 10), 1, phaseWeeks, state.dailyProgrammingWeekInPhase || 1);
      }
      if (daySelect) {
        state.dailyProgrammingDayInPhase = clampNumber(parseInt(daySelect.value, 10), 1, effectiveDays, state.dailyProgrammingDayInPhase || 1);
      }
    }

    state.day = buildSlotKeyFromDailyNavigator();
    renderDailyNavigatorControls();
  }

  function applyDailyNavigatorSelectionFromAxisValue(axisValue) {
    ensureDailyNavigatorState();
    var phase = getSelectedDailyNavigatorPhase();
    if (!phase) {
      return;
    }

    var axis = parseInt(axisValue, 10);
    var phaseWeeks = getPhaseLengthWeeks(phase);
    var effectiveDays = getEffectivePhaseTrainingDays(phase);
    if (state.dailyProgrammingViewMode === "day") {
      var parsed = parseSlotKey(axisValue);
      if (!parsed) {
        return;
      }
      state.dailyProgrammingWeekInPhase = clampNumber(parsed.week - Number(phase.start_week || 1) + 1, 1, phaseWeeks, state.dailyProgrammingWeekInPhase || 1);
      state.dailyProgrammingDayInPhase = clampNumber(parsed.workout, 1, effectiveDays, state.dailyProgrammingDayInPhase || 1);
    } else if (state.dailyProgrammingViewMode === "week") {
      state.dailyProgrammingDayInPhase = clampNumber(axis, 1, effectiveDays, state.dailyProgrammingDayInPhase || 1);
    } else {
      state.dailyProgrammingWeekInPhase = clampNumber(axis, 1, phaseWeeks, state.dailyProgrammingWeekInPhase || 1);
    }

    state.day = buildSlotKeyFromDailyNavigator();
    renderDailyNavigatorControls();
  }

  function renderDailyProgrammingDesigner() {
    if ((!state.isTemplateBuilder && !state.isCoachAssignedProgramEdit) || state.builderStep !== 3) {
      return;
    }

    var plan = getCurrentSessionPlan();
    state.sessionPlans[state.day] = plan;

    setInputValue("[data-session-plan-field='title']", plan.title);
    populateSelectOptions("[data-session-plan-field='session_type']", buildSessionTypeSelectOptions(plan.session_type), plan.session_type);
    populateSelectOptions("[data-session-plan-field='phase_name']", buildPhaseSelectOptions(plan.phase_name), plan.phase_name);
    populateSelectOptions("[data-session-plan-field='objective_label']", buildObjectiveSelectOptions(plan.objective_label), plan.objective_label);
    setInputValue("[data-session-plan-field='session_goal']", plan.session_goal);
    setInputValue("[data-session-plan-field='sport_focus']", plan.sport_focus);
    setInputValue("[data-session-plan-field='duration_minutes']", plan.duration_minutes ? String(plan.duration_minutes) : "");
    setInputValue("[data-session-plan-field='terrain']", plan.terrain);
    setInputValue("[data-session-plan-field='vertical_gain']", plan.vertical_gain);
    setInputValue("[data-session-plan-field='intensity_target']", plan.intensity_target);
    setInputValue("[data-session-plan-field='coach_notes']", plan.coach_notes);
    renderDailyAxisEditorCards();
    renderSessionPlanBlocks(plan);
    renderDailyProgrammingSummary(plan);
  }

  function getCurrentAxisSlotKeys() {
    if (!shouldUsePhaseDailyNavigator()) {
      return state.day ? [state.day] : [];
    }

    ensureDailyNavigatorState();
    var phase = getSelectedDailyNavigatorPhase();
    if (!phase) {
      return [];
    }

    var phaseStart = clampNumber(parseInt(phase.start_week, 10), 1, state.structure.weeks, 1);
    var phaseWeeks = getPhaseLengthWeeks(phase);
    var effectiveDays = getEffectivePhaseTrainingDays(phase);

    if (state.dailyProgrammingViewMode === "day") {
      return [buildSlotKeyFromDailyNavigator()];
    }

    if (state.dailyProgrammingViewMode === "week") {
      var globalWeek = clampNumber(phaseStart + state.dailyProgrammingWeekInPhase - 1, phaseStart, phaseStart + phaseWeeks - 1, phaseStart);
      return new Array(effectiveDays).fill("").map(function (_, index) {
        return "w" + String(globalWeek) + "d" + String(index + 1);
      });
    }

    var selectedDay = clampNumber(parseInt(state.dailyProgrammingDayInPhase, 10), 1, effectiveDays, 1);
    return new Array(phaseWeeks).fill("").map(function (_, index) {
      var weekNumber = phaseStart + index;
      return "w" + String(weekNumber) + "d" + String(selectedDay);
    });
  }

  function renderDailyAxisEditorCards() {
    var container = document.querySelector("[data-daily-axis-grid]");
    if (!container) {
      return;
    }

    if (!shouldUsePhaseDailyNavigator()) {
      container.innerHTML = "";
      return;
    }

    var slotKeys = getCurrentAxisSlotKeys();
    if (!slotKeys.length) {
      container.innerHTML = '<p class="admin-loading">No day axis available for this phase yet.</p>';
      return;
    }

    container.innerHTML = buildDailyAxisEditorCardsHtml(slotKeys, true);
    applyDailyAxisSelectValues(container, slotKeys);
  }

  function buildDailyAxisEditorCardsHtml(slotKeys, useNavigatorLabels) {
    return (Array.isArray(slotKeys) ? slotKeys : []).map(function (slotKey, index) {
      var parsed = parseSlotKey(slotKey) || { week: 1, workout: 1 };
      var plan = getSessionPlanForSlot(slotKey);
      var axisTitle = useNavigatorLabels
        ? (state.dailyProgrammingViewMode === "day"
          ? "Scheduled Day"
          : state.dailyProgrammingViewMode === "week"
          ? "Day " + String(index + 1)
          : "Week " + String(index + 1))
        : "Scheduled Day";
      var axisSubtitle = useNavigatorLabels
        ? "Week " + String(parsed.week) + " • Day " + String(parsed.workout)
        : String(labelForSlot(slotKey) || ("Week " + String(parsed.week) + " • Day " + String(parsed.workout)));
      return [
        '<article class="program-builder-axis-card">',
        '<div class="program-builder-axis-card-head">',
        '<h3>' + escapeHtml(axisTitle) + '</h3>',
        '<p>' + escapeHtml(axisSubtitle) + '</p>',
        '</div>',
        '<label class="program-builder-structure-field">',
        '<span>Session Title</span>',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-field="title" value="' + escapeAttribute(plan.title || "") + '" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Session Type</span>',
        '<select data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-field="session_type">',
        buildSessionTypeSelectOptions(plan.session_type),
        '</select>',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Session Goal</span>',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-field="session_goal" value="' + escapeAttribute(plan.session_goal || "") + '" />',
        '</label>',
        '<div class="program-builder-phase-grid">',
        '<label class="program-builder-structure-field">',
        '<span>Duration (min)</span>',
        '<input type="number" min="0" max="1440" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-field="duration_minutes" value="' + escapeAttribute(String(plan.duration_minutes || 0)) + '" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Intensity Target</span>',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-field="intensity_target" value="' + escapeAttribute(plan.intensity_target || "") + '" />',
        '</label>',
        '</div>',
        '<label class="program-builder-structure-field">',
        '<span>Coach Notes</span>',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-field="coach_notes" value="' + escapeAttribute(plan.coach_notes || "") + '" />',
        '</label>',
        '<div class="program-builder-axis-blocks">',
        '<div class="program-builder-axis-card-head">',
        '<h3>Session Blocks</h3>',
        '<p>Add and edit blocks directly here. The session type determines the block preset sequence.</p>',
        '</div>',
        renderAxisSessionPlanBlocks(slotKey, plan),
        '<button type="button" class="btn admin-btn-small" data-axis-plan-add-block="' + escapeAttribute(slotKey) + '">Add Block</button>',
        '</div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function applyDailyAxisSelectValues(container, slotKeys) {
    if (!container) {
      return;
    }

    (Array.isArray(slotKeys) ? slotKeys : []).forEach(function (slotKey) {
      var select = container.querySelector('[data-axis-slot="' + slotKey + '"][data-axis-field="session_type"]');
      if (!select) {
        return;
      }
      var plan = getSessionPlanForSlot(slotKey);
      select.value = normalizeWeeklySessionType(plan.session_type);
    });
  }

  function renderAxisSessionPlanBlocks(slotKey, plan) {
    if (!plan || !Array.isArray(plan.blocks) || !plan.blocks.length) {
      return '<p class="admin-loading">No blocks yet.</p>';
    }

    return plan.blocks.map(function (block, index) {
      var flowMeta = getExerciseFlowMeta(block);
      return [
        '<div class="program-builder-axis-block' + (flowMeta.className ? ' ' + flowMeta.className : '') + '">',
        flowMeta.badge,
        '<div class="program-builder-axis-block-head">',
        '<label class="program-builder-structure-field">',
        '<span>Type</span>',
        '<select data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="type">',
        buildSessionBlockTypeOptions(block.type),
        '</select>',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Title</span>',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="title" value="' + escapeAttribute(block.title || '') + '" />',
        '</label>',
        '</div>',
        renderAxisBlockDetails(slotKey, block, index),
        '<div class="program-builder-phase-actions">',
        '<button type="button" class="btn admin-btn-small" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-plan-remove-block="' + index + '">Remove Block</button>',
        '</div>',
        '</div>'
      ].join('');
    }).join('');
  }

  function getExerciseFlowMeta(block) {
    var blockType = normalizeSessionBlockType(block && block.type);
    var isStrengthBlock = isExerciseConfiguredBlockType(blockType);
    if (!isStrengthBlock) {
      return { badge: '', className: '' };
    }

    var flow = normalizeExerciseFlow(block && block.exercise_flow);
    var className = flow === 'superset'
      ? 'is-flow-superset'
      : flow === 'circuit'
        ? 'is-flow-circuit'
        : 'is-flow-straight';
    var label = flow === 'superset'
      ? 'Superset'
      : flow === 'circuit'
        ? 'Circuit'
        : 'Straight Sets';

    return {
      badge: '<div class="program-builder-axis-flow-badge ' + className + '">' + escapeHtml(label) + '</div>',
      className: className
    };
  }

  function renderAxisBlockDetails(slotKey, block, index) {
    var type = normalizeSessionBlockType(block && block.type);
    var detailMarkup = '';

    if (isExerciseConfiguredBlockType(type)) {
      detailMarkup = renderAxisExerciseRows(slotKey, block, index);
    } else if (type === 'hangboarding') {
      detailMarkup = [
        '<div class="program-builder-axis-detail-grid">',
        '<label class="program-builder-structure-field">',
        '<span>Protocol Name</span>',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="hang_protocol_name" value="' + escapeAttribute(String(block && block.hang_protocol_name || '')) + '" placeholder="e.g. Repeaters" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Grip Type</span>',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="hang_grip_type" value="' + escapeAttribute(String(block && block.hang_grip_type || '')) + '" placeholder="e.g. 20mm edge, half crimp" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Rounds</span>',
        '<input type="number" min="1" max="20" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="hang_rounds" value="' + escapeAttribute(String(block && block.hang_rounds || 6)) + '" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Hang (sec)</span>',
        '<input type="number" min="3" max="60" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="hang_hang_seconds" value="' + escapeAttribute(String(block && block.hang_hang_seconds || 10)) + '" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Rest (sec)</span>',
        '<input type="number" min="5" max="180" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="hang_rest_seconds" value="' + escapeAttribute(String(block && block.hang_rest_seconds || 50)) + '" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Effort</span>',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="hang_effort" value="' + escapeAttribute(String(block && block.hang_effort || 'RPE 8')) + '" placeholder="e.g. RPE 8, +10lb" />',
        '</label>',
        '</div>'
      ].join('');
    } else if (type === 'intervals') {
      var intervalExerciseMode = normalizeIntervalExerciseMode(block && block.interval_exercise_mode);
      var intervalWorkIntensityType = normalizeIntervalIntensityType(block && block.interval_work_intensity_type, false);
      var intervalRestIntensityType = normalizeIntervalIntensityType(block && block.interval_rest_intensity_type, true);
      var workIntensityPlaceholder = intervalIntensityPlaceholderForType(intervalWorkIntensityType, false);
      var restIntensityPlaceholder = intervalIntensityPlaceholderForType(intervalRestIntensityType, true);
      var isCompleteRest = intervalRestIntensityType === 'complete_rest';
      detailMarkup = [
        '<div class="program-builder-axis-detail-grid">',
        '<label class="program-builder-structure-field">',
        '<span>Exercise</span>',
        '<select data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="interval_exercise_mode">',
        buildIntervalExerciseModeOptions(intervalExerciseMode),
        '</select>',
        (intervalExerciseMode === 'free_text'
          ? '<span>Exercise Name</span><input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="interval_exercise_name" value="' + escapeAttribute(String(block && block.interval_exercise_name || '')) + '" placeholder="e.g. Rower, Assault Bike, Shuttle Runs" />'
          : ''),
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Rounds</span>',
        '<input type="number" min="1" max="50" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="interval_rounds" value="' + escapeAttribute(String(block && block.interval_rounds || 1)) + '" />',
        '</label>',
        '</div>'
      ].join('') + [
        '<label class="program-builder-structure-field program-builder-interval-row">',
        '<span>Work Segment</span>',
        '<div class="program-builder-interval-controls">',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="interval_work_time" value="' + escapeAttribute(String(block && block.interval_work_time || '60s')) + '" placeholder="work time" />',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="interval_work_intensity" value="' + escapeAttribute(String(block && block.interval_work_intensity || workIntensityPlaceholder)) + '" placeholder="work intensity" />',
        '<select data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="interval_work_intensity_type">',
        buildIntervalIntensityTypeOptions(intervalWorkIntensityType, false),
        '</select>',
        '</div>',
        '</label>',
        '<label class="program-builder-structure-field program-builder-interval-row">',
        '<span>Rest Segment</span>',
        '<div class="program-builder-interval-controls">',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="interval_rest_time" value="' + escapeAttribute(String(block && block.interval_rest_time || '60s')) + '" placeholder="rest time" />',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="interval_rest_intensity" value="' + escapeAttribute(String(block && block.interval_rest_intensity || (isCompleteRest ? '' : restIntensityPlaceholder))) + '" placeholder="rest intensity"' + (isCompleteRest ? ' disabled' : '') + ' />',
        '<select data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="interval_rest_intensity_type">',
        buildIntervalIntensityTypeOptions(intervalRestIntensityType, true),
        '</select>',
        '</div>',
        '</label>'
      ].join('');
    } else if (type === 'emom') {
      var emomIntensityType = normalizeIntervalIntensityType(block && block.emom_intensity_type, false);
      var emomIntensityPlaceholder = intervalIntensityPlaceholderForType(emomIntensityType, false);
      detailMarkup = [
        '<div class="program-builder-axis-detail-grid">',
        '<label class="program-builder-structure-field">',
        '<span>Exercise</span>',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="emom_exercise" value="' + escapeAttribute(String(block && block.emom_exercise || '')) + '" placeholder="e.g. 8 KB swings + 6 burpees" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Total Minutes</span>',
        '<input type="number" min="1" max="60" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="emom_minutes" value="' + escapeAttribute(String(block && block.emom_minutes || 12)) + '" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Intensity Type</span>',
        '<select data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="emom_intensity_type">',
        buildIntervalIntensityTypeOptions(emomIntensityType, false),
        '</select>',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Intensity</span>',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="emom_intensity" value="' + escapeAttribute(String(block && block.emom_intensity || emomIntensityPlaceholder)) + '" placeholder="' + escapeAttribute(emomIntensityPlaceholder) + '" />',
        '</label>',
        '</div>'
      ].join('');
    } else if (type === 'amrap') {
      var amrapIntensityType = normalizeIntervalIntensityType(block && block.amrap_intensity_type, false);
      var amrapIntensityPlaceholder = intervalIntensityPlaceholderForType(amrapIntensityType, false);
      detailMarkup = [
        '<div class="program-builder-axis-detail-grid">',
        '<label class="program-builder-structure-field">',
        '<span>Exercise / Circuit</span>',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="amrap_exercise" value="' + escapeAttribute(String(block && block.amrap_exercise || '')) + '" placeholder="e.g. 5 pull-ups, 10 push-ups, 15 air squats" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Duration (min)</span>',
        '<input type="number" min="1" max="60" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="amrap_minutes" value="' + escapeAttribute(String(block && block.amrap_minutes || 15)) + '" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Intensity Type</span>',
        '<select data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="amrap_intensity_type">',
        buildIntervalIntensityTypeOptions(amrapIntensityType, false),
        '</select>',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Intensity</span>',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="amrap_intensity" value="' + escapeAttribute(String(block && block.amrap_intensity || amrapIntensityPlaceholder)) + '" placeholder="' + escapeAttribute(amrapIntensityPlaceholder) + '" />',
        '</label>',
        '</div>'
      ].join('');
    } else if (type === 'zone2' || type === 'long_endurance' || type === 'threshold' || type === 'vo2' || type === 'uphill') {
      detailMarkup = [
        '<div class="program-builder-axis-detail-grid">',
        '<label class="program-builder-structure-field">',
        '<span>Form</span>',
        '<select data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="exercise_form">',
        buildSessionFormOptions(block.exercise_form),
        '</select>',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Duration (min)</span>',
        '<input type="number" min="5" max="360" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="duration_minutes" value="' + escapeAttribute(String(block.duration_minutes || 0)) + '" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Target Intensity</span>',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="target_intensity" value="' + escapeAttribute(block.target_intensity || '') + '" placeholder="e.g. Zone 2" />',
        '</label>',
        '</div>'
      ].join('');
    } else if (type === 'mobility' || type === 'cooldown' || type === 'warmup' || type === 'activation' || type === 'assessment') {
      detailMarkup = [
        '<div class="program-builder-axis-detail-grid">',
        '<label class="program-builder-structure-field">',
        '<span>Duration (min)</span>',
        '<input type="number" min="5" max="180" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="duration_minutes" value="' + escapeAttribute(String(block.duration_minutes || 0)) + '" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Focus</span>',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="target_intensity" value="' + escapeAttribute(block.target_intensity || '') + '" placeholder="e.g. Mobility, reset, assessment" />',
        '</label>',
        '</div>'
      ].join('');
    } else {
      detailMarkup = [
        '<label class="program-builder-structure-field">',
        '<span>Prescription</span>',
        '<textarea rows="2" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="prescription">' + escapeHtml(block.prescription || '') + '</textarea>',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Notes</span>',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="notes" value="' + escapeAttribute(block.notes || '') + '" />',
        '</label>'
      ].join('');
    }

    return detailMarkup;
  }

  function renderAxisExerciseRows(slotKey, block, index) {
    var sourceNames = Array.isArray(block && block.exercise_names) ? block.exercise_names : [];
    var sourceSets = Array.isArray(block && block.exercise_sets) ? block.exercise_sets : [];
    var sourceIntensityTypes = Array.isArray(block && block.exercise_intensity_types) ? block.exercise_intensity_types : [];
    var inferredCount = Math.max(
      clampNumber(parseInt(block && block.exercise_count, 10), 1, 20, 1),
      sourceNames.length,
      sourceSets.length,
      sourceIntensityTypes.length,
      1
    );
    var count = clampNumber(inferredCount, 1, 20, 1);
    var names = normalizeExerciseNames(block && block.exercise_names, count);
    var sets = normalizeExerciseValues(block && block.exercise_sets, count, 3);
    var intensityTypes = normalizeExerciseValues(block && block.exercise_intensity_types, count, "rpe").map(normalizeIntensityTypeValue);
    var setReps = normalizeExerciseNestedValues(block && block.exercise_set_reps, count, '5', sets);
    var setIntensities = normalizeExerciseNestedValues(block && block.exercise_set_intensities, count, '7', sets);
    var setRests = normalizeExerciseNestedValues(block && block.exercise_set_rests, count, '', sets);
    var setRepTypes = normalizeExerciseSetRepTypes(block && block.exercise_set_rep_types, count, sets, block && block.exercise_rep_types);
    var setIntensityTypes = normalizeExerciseSetIntensityTypes(block && block.exercise_set_intensity_types, count, sets, intensityTypes);
    var flow = normalizeExerciseFlow(block && block.exercise_flow);
    var restStrategy = normalizeExerciseRestStrategy(block && block.exercise_rest_strategy);
    var restLabel = restStrategyLabel(flow, restStrategy);
    var restPlaceholder = restPlaceholderForStrategy(flow, restStrategy);
    var fields = [
      '<div class="program-builder-axis-exercises">',
      '<label class="program-builder-structure-field">',
      '<span>Execution Style</span>',
      '<select data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="exercise_flow">',
      buildExerciseFlowOptions(block && block.exercise_flow),
      '</select>',
      '</label>'
    ];

    if (flow !== 'straight') {
      fields.push(
        '<div class="program-builder-axis-detail-grid">',
        '<label class="program-builder-structure-field">',
        '<span>Rest Focus</span>',
        '<select data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="exercise_rest_strategy">',
        buildExerciseRestStrategyOptions(restStrategy),
        '</select>',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>' + escapeHtml(restLabel) + '</span>',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="exercise_rest_interval" value="' + escapeAttribute(String(block && block.exercise_rest_interval || '')) + '" placeholder="' + escapeAttribute(restPlaceholder) + '" />',
        '</label>',
        '</div>'
      );
    }

    for (var i = 0; i < count; i++) {
      fields.push('<div class="program-builder-axis-exercise-row">');
      fields.push(
        '<div class="program-builder-axis-exercise-head">',
        '<div class="program-builder-axis-exercise-row-title">Exercise ' + String(i + 1) + '</div>',
        '<button type="button" class="btn admin-btn-delete-mini axis-btn-ghost" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-remove-exercise="' + i + '">Remove Exercise</button>',
        '</div>',
        '<label class="program-builder-structure-field">',
        '<span>Exercise Name ' + String(i + 1) + '</span>',
        '<input type="text" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-block-field="exercise_names" data-axis-exercise-index="' + i + '" value="' + escapeAttribute(names[i] || '') + '" placeholder="e.g. Back Squat" />',
        '</label>',
        renderAxisExerciseSetRows(slotKey, block, index, i, sets[i] || 3, setReps[i] || [], setIntensities[i] || [], setRests[i] || [], setRepTypes[i] || [], setIntensityTypes[i] || [], flow),
        '<div class="program-builder-axis-exercise-actions">',
        '<button type="button" class="btn admin-btn-small axis-btn-compact" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-exercise-index="' + i + '" data-axis-add-set="1">+ Set</button>',
        '</div>',
        '</div>'
      );
    }

    fields.push('<div class="program-builder-axis-exercise-actions"><button type="button" class="btn admin-btn-small axis-btn-compact" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + index + '" data-axis-add-exercise="1">+ Exercise</button></div>');
    fields.push('</div>');
    return fields.join('');
  }

  function renderAxisExerciseSetRows(slotKey, block, blockIndex, exerciseIndex, setCount, setReps, setIntensities, setRests, setRepTypes, setIntensityTypes, flow) {
    var totalSets = clampNumber(parseInt(setCount, 10), 1, 20, 1);
    var isStraight = normalizeExerciseFlow(flow) === 'straight';
    var repTypeRows = Array.isArray(setRepTypes) ? setRepTypes : [];
    var typeRows = Array.isArray(setIntensityTypes) ? setIntensityTypes : [];
    var restRows = Array.isArray(setRests) ? setRests : [];
    var fields = ['<div class="program-builder-axis-set-list">'];

    for (var i = 0; i < totalSets; i++) {
      var selectedRepType = normalizeRepTypeValue(repTypeRows[i]);
      var repsPlaceholder = repsPlaceholderForType(selectedRepType);
      var selectedType = normalizeIntensityTypeValue(typeRows[i]);
      var intensityPlaceholder = intensityPlaceholderForType(selectedType);
      fields.push(
        '<div class="program-builder-axis-set-row">',
        '<label class="program-builder-axis-inline-set' + (isStraight ? ' has-rest' : '') + '">',
        '<span class="program-builder-axis-set-label">Set ' + String(i + 1) + ':</span>',
        '<input type="text" class="program-builder-axis-inline-input" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + blockIndex + '" data-axis-block-field="exercise_set_reps" data-axis-exercise-index="' + exerciseIndex + '" data-axis-set-index="' + i + '" value="' + escapeAttribute(setReps[i] || repsPlaceholder) + '" placeholder="' + escapeAttribute(repsPlaceholder) + '" />',
        '<select class="program-builder-axis-inline-type" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + blockIndex + '" data-axis-block-field="exercise_set_rep_types" data-axis-exercise-index="' + exerciseIndex + '" data-axis-set-index="' + i + '">',
        buildRepTypeOptions(selectedRepType),
        '</select>',
        '<input type="text" class="program-builder-axis-inline-input" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + blockIndex + '" data-axis-block-field="exercise_set_intensities" data-axis-exercise-index="' + exerciseIndex + '" data-axis-set-index="' + i + '" value="' + escapeAttribute(setIntensities[i] || intensityPlaceholder) + '" placeholder="' + escapeAttribute(intensityPlaceholder) + '" />',
        '<select class="program-builder-axis-inline-type" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + blockIndex + '" data-axis-block-field="exercise_set_intensity_types" data-axis-exercise-index="' + exerciseIndex + '" data-axis-set-index="' + i + '">',
        buildIntensityTypeOptions(selectedType),
        '</select>',
        (isStraight
          ? '<input type="text" class="program-builder-axis-inline-input program-builder-axis-rest-inline" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + blockIndex + '" data-axis-block-field="exercise_set_rests" data-axis-exercise-index="' + exerciseIndex + '" data-axis-set-index="' + i + '" value="' + escapeAttribute(restRows[i] || '') + '" placeholder="rest" />'
          : ''),
        '</label>',
        '<button type="button" class="btn admin-btn-delete-mini axis-btn-ghost axis-btn-set-remove" aria-label="Remove set" title="Remove set" data-axis-slot="' + escapeAttribute(slotKey) + '" data-axis-block-index="' + blockIndex + '" data-axis-exercise-index="' + exerciseIndex + '" data-axis-remove-set="' + i + '">-</button>',
        '</div>'
      );
    }

    fields.push('</div>');
    return fields.join('');
  }

  function buildSessionFormOptions(selectedValue) {
    var selected = String(selectedValue || '').trim().toLowerCase();
    var forms = [
      { value: 'running', label: 'Running' },
      { value: 'biking', label: 'Biking' },
      { value: 'ski', label: 'Ski / Snow' },
      { value: 'strength', label: 'Strength' },
      { value: 'mixed', label: 'Mixed / Combo' }
    ];

    return forms.map(function (option) {
      var isSelected = option.value === selected ? ' selected' : '';
      return '<option value="' + escapeAttribute(option.value) + '"' + isSelected + '>' + escapeHtml(option.label) + '</option>';
    }).join('');
  }

  function normalizeIntervalExerciseMode(value) {
    var normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'running' || normalized === 'biking' || normalized === 'free_text') {
      return normalized;
    }
    return 'running';
  }

  function buildIntervalExerciseModeOptions(selectedValue) {
    var selected = normalizeIntervalExerciseMode(selectedValue);
    var options = [
      { value: 'running', label: 'Running' },
      { value: 'biking', label: 'Biking' },
      { value: 'free_text', label: 'Free Text' }
    ];

    return options.map(function (option) {
      var isSelected = option.value === selected ? ' selected' : '';
      return '<option value="' + escapeAttribute(option.value) + '"' + isSelected + '>' + escapeHtml(option.label) + '</option>';
    }).join('');
  }

  function normalizeIntervalIntensityType(value, allowCompleteRest) {
    var normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'rpe' || normalized === 'hr' || normalized === 'zone' || normalized === 'pace' || normalized === 'power' || normalized === 'custom') {
      return normalized;
    }
    if (allowCompleteRest && normalized === 'complete_rest') {
      return 'complete_rest';
    }
    return allowCompleteRest ? 'zone' : 'rpe';
  }

  function buildIntervalIntensityTypeOptions(selectedValue, allowCompleteRest) {
    var selected = normalizeIntervalIntensityType(selectedValue, allowCompleteRest);
    var options = [
      { value: 'rpe', label: 'RPE' },
      { value: 'hr', label: 'HR' },
      { value: 'zone', label: 'Zone' },
      { value: 'pace', label: 'Pace' },
      { value: 'power', label: 'Power' },
      { value: 'custom', label: 'Free Text' }
    ];

    if (allowCompleteRest) {
      options.push({ value: 'complete_rest', label: 'Complete Rest' });
    }

    return options.map(function (option) {
      var isSelected = option.value === selected ? ' selected' : '';
      return '<option value="' + escapeAttribute(option.value) + '"' + isSelected + '>' + escapeHtml(option.label) + '</option>';
    }).join('');
  }

  function intervalIntensityPlaceholderForType(type, isRest) {
    var normalized = normalizeIntervalIntensityType(type, isRest);
    if (normalized === 'rpe') {
      return isRest ? 'e.g. RPE 2-3' : 'e.g. RPE 8';
    }
    if (normalized === 'hr') {
      return isRest ? 'e.g. <140 bpm' : 'e.g. 170-180 bpm';
    }
    if (normalized === 'zone') {
      return isRest ? 'e.g. Zone 1-2' : 'e.g. Zone 4-5';
    }
    if (normalized === 'pace') {
      return isRest ? 'e.g. easy jog' : 'e.g. 5k pace';
    }
    if (normalized === 'power') {
      return isRest ? 'e.g. 50% FTP' : 'e.g. 110% FTP';
    }
    if (normalized === 'complete_rest') {
      return 'Complete rest';
    }
    return isRest ? 'e.g. easy spin or walk' : 'e.g. hard effort';
  }

  function normalizeIntensityTypeValue(value) {
    var normalized = String(value || "").trim().toLowerCase();
    if (normalized === "percent_rm" || normalized === "%rm" || normalized === "rm") {
      return "%rm";
    }
    if (normalized === "rir") {
      return "rir";
    }
    return "rpe";
  }

  function normalizeRepTypeValue(value) {
    var normalized = String(value || "").trim().toLowerCase();
    if (normalized === "sec" || normalized === "seconds" || normalized === "time") {
      return "sec";
    }
    return "reps";
  }

  function repsPlaceholderForType(type) {
    return normalizeRepTypeValue(type) === "sec" ? "45" : "5";
  }

  function buildRepTypeOptions(selectedType) {
    var selected = normalizeRepTypeValue(selectedType);
    var options = [
      { value: "reps", label: "Reps" },
      { value: "sec", label: "Sec" }
    ];

    return options.map(function (option) {
      var isSelected = option.value === selected ? " selected" : "";
      return '<option value="' + escapeAttribute(option.value) + '"' + isSelected + '>' + escapeHtml(option.label) + '</option>';
    }).join("");
  }

  function intensityPlaceholderForType(type) {
    var normalized = normalizeIntensityTypeValue(type);
    if (normalized === "%rm") {
      return "80";
    }
    if (normalized === "rir") {
      return "2";
    }
    return "7";
  }

  function buildIntensityTypeOptions(selectedType) {
    var selected = normalizeIntensityTypeValue(selectedType);
    var options = [
      { value: "%rm", label: "%RM" },
      { value: "rpe", label: "RPE" },
      { value: "rir", label: "RIR" }
    ];

    return options.map(function (option) {
      var isSelected = option.value === selected ? " selected" : "";
      return '<option value="' + escapeAttribute(option.value) + '"' + isSelected + '>' + escapeHtml(option.label) + '</option>';
    }).join("");
  }

  function normalizeExerciseFlow(value) {
    var normalized = String(value || "").trim().toLowerCase();
    if (normalized === "superset") {
      return "superset";
    }
    if (normalized === "circuit") {
      return "circuit";
    }
    return "straight";
  }

  function isExerciseConfiguredBlockType(blockType) {
    var normalized = normalizeSessionBlockType(blockType);
    return normalized === 'strength_lower'
      || normalized === 'strength_upper'
      || normalized === 'strength_full'
      || normalized === 'main_strength'
      || normalized === 'secondary_strength'
      || normalized === 'power';
  }

  function buildExerciseFlowOptions(selectedValue) {
    var selected = normalizeExerciseFlow(selectedValue);
    var options = [
      { value: "straight", label: "Straight Sets" },
      { value: "superset", label: "Superset" },
      { value: "circuit", label: "Circuit" }
    ];

    return options.map(function (option) {
      var isSelected = option.value === selected ? " selected" : "";
      return '<option value="' + escapeAttribute(option.value) + '"' + isSelected + '>' + escapeHtml(option.label) + '</option>';
    }).join("");
  }

  function normalizeExerciseRestStrategy(value) {
    var normalized = String(value || "").trim().toLowerCase();
    if (normalized === 'between_rounds') {
      return 'between_rounds';
    }
    return 'between_exercises';
  }

  function buildExerciseRestStrategyOptions(selectedValue) {
    var selected = normalizeExerciseRestStrategy(selectedValue);
    var options = [
      { value: 'between_exercises', label: 'Between Exercises' },
      { value: 'between_rounds', label: 'Between Rounds' }
    ];

    return options.map(function (option) {
      var isSelected = option.value === selected ? ' selected' : '';
      return '<option value="' + escapeAttribute(option.value) + '"' + isSelected + '>' + escapeHtml(option.label) + '</option>';
    }).join('');
  }

  function restStrategyLabel(flow, strategy) {
    if (normalizeExerciseFlow(flow) === 'straight') {
      return 'Rest Between Sets';
    }
    return normalizeExerciseRestStrategy(strategy) === 'between_rounds'
      ? 'Rest Between Rounds'
      : 'Rest Between Exercises';
  }

  function restPlaceholderForStrategy(flow, strategy) {
    if (normalizeExerciseFlow(flow) === 'straight') {
      return 'e.g. 90 sec';
    }
    return normalizeExerciseRestStrategy(strategy) === 'between_rounds'
      ? 'e.g. 90 sec between rounds'
      : 'e.g. 20 sec between movements';
  }

  function getSessionTypeBlockSequence(sessionType) {
    var type = normalizeWeeklySessionType(sessionType);
    var sequences = {
      strength_lower: ['warmup', 'main_strength', 'secondary_strength', 'cooldown'],
      strength_upper: ['warmup', 'main_strength', 'secondary_strength', 'cooldown'],
      strength_full: ['warmup', 'activation', 'main_strength', 'cooldown'],
      zone2: ['warmup', 'zone2', 'cooldown'],
      threshold: ['warmup', 'activation', 'intervals', 'cooldown'],
      vo2: ['warmup', 'activation', 'intervals', 'cooldown'],
      uphill: ['warmup', 'activation', 'intervals', 'cooldown'],
      long_endurance: ['warmup', 'zone2', 'long_day', 'cooldown'],
      mobility: ['warmup', 'mobility', 'cooldown'],
      assessment: ['warmup', 'assessment', 'cooldown'],
      rest: ['cooldown']
    };

    return sequences[type] || ['warmup', 'main_strength', 'cooldown'];
  }

  function renderSessionPlanBlocks(plan) {
    var container = document.querySelector("[data-session-plan-block-list]");
    if (!container) {
      return;
    }

    if (!plan.blocks.length) {
      container.innerHTML = '<p class="admin-loading">No session blocks yet.</p>';
      return;
    }

    container.innerHTML = plan.blocks.map(function (block, index) {
      return [
        '<div class="program-builder-phase-item">',
        '<div class="program-builder-phase-grid">',
        '<label class="program-builder-structure-field">',
        '<span>Block Type</span>',
        '<select data-session-block-field="type" data-session-block-index="' + index + '">',
        buildSessionBlockTypeOptions(block.type),
        '</select>',
        '</label>',
        '<label class="program-builder-structure-field program-builder-structure-field-wide">',
        '<span>Block Title</span>',
        '<input type="text" data-session-block-field="title" data-session-block-index="' + index + '" value="' + escapeAttribute(block.title || '') + '" placeholder="e.g. Uphill Threshold Set" />',
        '</label>',
        '</div>',
        '<label class="program-builder-structure-field">',
        '<span>Prescription</span>',
        '<textarea rows="2" data-session-block-field="prescription" data-session-block-index="' + index + '" placeholder="e.g. 4 x 5 min @ Z4 with 3 min easy">' + escapeHtml(block.prescription || '') + '</textarea>',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Notes</span>',
        '<input type="text" data-session-block-field="notes" data-session-block-index="' + index + '" value="' + escapeAttribute(block.notes || '') + '" placeholder="Pain rules, substitutions, equipment notes" />',
        '</label>',
        '<div class="program-builder-phase-actions">',
        '<button type="button" class="btn admin-btn-small" data-session-plan-remove-block="' + index + '">Remove Block</button>',
        '</div>',
        '</div>'
      ].join('');
    }).join('');
  }

  function renderDailyProgrammingSummary(plan) {
    setTextContent("[data-session-summary-phase]", plan.phase_name || "Phase not selected yet.");
    setTextContent("[data-session-summary-objective]", plan.objective_label || "No objective selected for this workout.");
    setTextContent("[data-session-summary-type]", prettySessionTypeLabel(plan.session_type));
  }

  function syncDailyProgrammingInput(target) {
    if ((!state.isTemplateBuilder && !state.isCoachAssignedProgramEdit) || state.builderStep !== 3 || !target || !target.getAttribute) {
      return;
    }

    var axisField = String(target.getAttribute("data-axis-field") || "").trim();
    var axisSlot = String(target.getAttribute("data-axis-slot") || "").trim();
    if (axisField && axisSlot) {
      var axisPlan = getSessionPlanForSlot(axisSlot);
      axisPlan[axisField] = axisField === "duration_minutes"
        ? clampNumber(parseInt(target.value, 10), 0, 1440, axisPlan.duration_minutes || 0)
        : String(target.value || '').trim();
      state.sessionPlans[axisSlot] = axisPlan;
      saveExercisesForDay(true);
      if (axisSlot === state.day) {
        renderDailyProgrammingSummary(axisPlan);
      }
      return;
    }

    var axisBlockField = String(target.getAttribute("data-axis-block-field") || "").trim();
    if (axisBlockField && axisSlot) {
      var axisBlockIndex = parseInt(String(target.getAttribute("data-axis-block-index") || "-1"), 10);
      var axisBlockPlan = getSessionPlanForSlot(axisSlot);
      if (!Number.isFinite(axisBlockIndex) || axisBlockIndex < 0 || axisBlockIndex >= axisBlockPlan.blocks.length) {
        return;
      }
      var axisBlock = axisBlockPlan.blocks[axisBlockIndex];
      if (axisBlockField === 'exercise_names') {
        var exerciseNameIndex = parseInt(String(target.getAttribute("data-axis-exercise-index") || "-1"), 10);
        var currentNames = normalizeExerciseNames(axisBlock.exercise_names, axisBlock.exercise_count);
        if (Number.isFinite(exerciseNameIndex) && exerciseNameIndex >= 0 && exerciseNameIndex < currentNames.length) {
          currentNames[exerciseNameIndex] = String(target.value || '').trim();
          axisBlock.exercise_names = currentNames;
        }
      } else if (axisBlockField === 'exercise_sets') {
        var exerciseIndex = parseInt(String(target.getAttribute("data-axis-exercise-index") || "-1"), 10);
        var nextCountForArrays = clampNumber(parseInt(axisBlock.exercise_count, 10), 1, 20, 1);
        var currentValues = normalizeExerciseValues(axisBlock.exercise_sets, nextCountForArrays, 3);
        if (Number.isFinite(exerciseIndex) && exerciseIndex >= 0 && exerciseIndex < currentValues.length) {
          currentValues[exerciseIndex] = String(target.value || '').trim();
          axisBlock.exercise_sets = currentValues;
          axisBlock.exercise_set_reps = normalizeExerciseNestedValues(axisBlock.exercise_set_reps, axisBlock.exercise_count, '5', currentValues);
          axisBlock.exercise_set_intensities = normalizeExerciseNestedValues(axisBlock.exercise_set_intensities, axisBlock.exercise_count, '7', currentValues);
          axisBlock.exercise_set_rests = normalizeExerciseNestedValues(axisBlock.exercise_set_rests, axisBlock.exercise_count, '', currentValues);
          axisBlock.exercise_set_rep_types = normalizeExerciseSetRepTypes(
            axisBlock.exercise_set_rep_types,
            axisBlock.exercise_count,
            axisBlock.exercise_sets,
            axisBlock.exercise_rep_types
          );
          axisBlock.exercise_set_intensity_types = normalizeExerciseSetIntensityTypes(
            axisBlock.exercise_set_intensity_types,
            axisBlock.exercise_count,
            axisBlock.exercise_sets,
            axisBlock.exercise_intensity_types
          );
        }
      } else if (axisBlockField === 'interval_rounds') {
        axisBlock.interval_rounds = clampNumber(parseInt(target.value, 10), 1, 50, axisBlock.interval_rounds || 1);
      } else if (axisBlockField === 'interval_exercise_mode') {
        axisBlock.interval_exercise_mode = normalizeIntervalExerciseMode(target.value);
      } else if (axisBlockField === 'hang_rounds') {
        axisBlock.hang_rounds = clampNumber(parseInt(target.value, 10), 1, 20, axisBlock.hang_rounds || 6);
      } else if (axisBlockField === 'hang_hang_seconds') {
        axisBlock.hang_hang_seconds = clampNumber(parseInt(target.value, 10), 3, 60, axisBlock.hang_hang_seconds || 10);
      } else if (axisBlockField === 'hang_rest_seconds') {
        axisBlock.hang_rest_seconds = clampNumber(parseInt(target.value, 10), 5, 180, axisBlock.hang_rest_seconds || 50);
      } else if (axisBlockField === 'emom_minutes') {
        axisBlock.emom_minutes = clampNumber(parseInt(target.value, 10), 1, 60, axisBlock.emom_minutes || 12);
      } else if (axisBlockField === 'amrap_minutes') {
        axisBlock.amrap_minutes = clampNumber(parseInt(target.value, 10), 1, 60, axisBlock.amrap_minutes || 15);
      } else if (axisBlockField === 'interval_work_intensity_type') {
        axisBlock.interval_work_intensity_type = normalizeIntervalIntensityType(target.value, false);
      } else if (axisBlockField === 'interval_rest_intensity_type') {
        axisBlock.interval_rest_intensity_type = normalizeIntervalIntensityType(target.value, true);
        if (axisBlock.interval_rest_intensity_type === 'complete_rest') {
          axisBlock.interval_rest_intensity = '';
        }
      } else if (axisBlockField === 'emom_intensity_type') {
        axisBlock.emom_intensity_type = normalizeIntervalIntensityType(target.value, false);
      } else if (axisBlockField === 'amrap_intensity_type') {
        axisBlock.amrap_intensity_type = normalizeIntervalIntensityType(target.value, false);
      } else if (axisBlockField === 'exercise_set_reps' || axisBlockField === 'exercise_set_intensities' || axisBlockField === 'exercise_set_rests' || axisBlockField === 'exercise_set_intensity_types' || axisBlockField === 'exercise_set_rep_types') {
        var exerciseSetIndex = parseInt(String(target.getAttribute("data-axis-exercise-index") || "-1"), 10);
        var setIndex = parseInt(String(target.getAttribute("data-axis-set-index") || "-1"), 10);
        var setTotals = normalizeExerciseValues(axisBlock.exercise_sets, axisBlock.exercise_count, 3).map(function (value) {
          return clampNumber(parseInt(value, 10), 1, 20, 1);
        });
        var nestedValues = axisBlockField === 'exercise_set_intensity_types'
          ? normalizeExerciseSetIntensityTypes(axisBlock.exercise_set_intensity_types, axisBlock.exercise_count, setTotals, axisBlock.exercise_intensity_types)
          : axisBlockField === 'exercise_set_rep_types'
            ? normalizeExerciseSetRepTypes(axisBlock.exercise_set_rep_types, axisBlock.exercise_count, setTotals, axisBlock.exercise_rep_types)
            : axisBlockField === 'exercise_set_rests'
              ? normalizeExerciseNestedValues(axisBlock.exercise_set_rests, axisBlock.exercise_count, '', setTotals)
            : normalizeExerciseNestedValues(axisBlock[axisBlockField], axisBlock.exercise_count, axisBlockField === 'exercise_set_reps' ? '5' : '7', setTotals);
        if (Number.isFinite(exerciseSetIndex) && exerciseSetIndex >= 0 && exerciseSetIndex < nestedValues.length) {
          if (Number.isFinite(setIndex) && setIndex >= 0 && setIndex < nestedValues[exerciseSetIndex].length) {
            nestedValues[exerciseSetIndex][setIndex] = axisBlockField === 'exercise_set_intensity_types'
              ? normalizeIntensityTypeValue(target.value)
              : axisBlockField === 'exercise_set_rep_types'
                ? normalizeRepTypeValue(target.value)
              : String(target.value || '').trim();
            if (axisBlockField === 'exercise_set_intensity_types') {
              axisBlock.exercise_set_intensity_types = nestedValues;
            } else if (axisBlockField === 'exercise_set_rep_types') {
              axisBlock.exercise_set_rep_types = nestedValues;
            } else if (axisBlockField === 'exercise_set_rests') {
              axisBlock.exercise_set_rests = nestedValues;
            } else {
              axisBlock[axisBlockField] = nestedValues;
            }
          }
        }
      } else {
        axisBlock[axisBlockField] = String(target.value || '').trim();
      }

      if (axisBlockField === 'exercise_count') {
        var nextCount = clampNumber(parseInt(target.value, 10), 1, 20, axisBlock.exercise_count || 1);
        axisBlock.exercise_count = nextCount;
        axisBlock.exercise_names = normalizeExerciseNames(axisBlock.exercise_names, nextCount);
        axisBlock.exercise_sets = normalizeExerciseValues(axisBlock.exercise_sets, nextCount, 3);
        axisBlock.exercise_intensity_types = normalizeExerciseValues(axisBlock.exercise_intensity_types, nextCount, 'rpe').map(normalizeIntensityTypeValue);
        axisBlock.exercise_set_reps = normalizeExerciseNestedValues(axisBlock.exercise_set_reps, nextCount, '5', axisBlock.exercise_sets);
        axisBlock.exercise_set_intensities = normalizeExerciseNestedValues(axisBlock.exercise_set_intensities, nextCount, '7', axisBlock.exercise_sets);
        axisBlock.exercise_set_rests = normalizeExerciseNestedValues(axisBlock.exercise_set_rests, nextCount, '', axisBlock.exercise_sets);
        axisBlock.exercise_set_rep_types = normalizeExerciseSetRepTypes(
          axisBlock.exercise_set_rep_types,
          nextCount,
          axisBlock.exercise_sets,
          axisBlock.exercise_rep_types
        );
        axisBlock.exercise_set_intensity_types = normalizeExerciseSetIntensityTypes(
          axisBlock.exercise_set_intensity_types,
          nextCount,
          axisBlock.exercise_sets,
          axisBlock.exercise_intensity_types
        );
      }

      if (axisBlockField === 'exercise_rest_strategy') {
        axisBlock.exercise_rest_strategy = normalizeExerciseRestStrategy(axisBlock.exercise_rest_strategy);
      }

      if (axisBlockField === 'type') {
        var nextType = normalizeSessionBlockType(axisBlock.type);
        var existingTitle = String(axisBlock.title || '').trim();
        var refreshedBlock = createEmptySessionBlock(nextType, axisBlockIndex);
        axisBlockPlan.blocks[axisBlockIndex] = Object.assign({}, refreshedBlock, {
          type: nextType,
          title: existingTitle && existingTitle !== 'New Block' ? existingTitle : prettySessionBlockLabel(nextType)
        });
      }
      state.sessionPlans[axisSlot] = axisBlockPlan;
      saveExercisesForDay(true);
      renderDailyAxisEditorCards();
      return;
    }

    var planField = String(target.getAttribute("data-session-plan-field") || "").trim();
    if (planField) {
      var plan = getCurrentSessionPlan();
      plan[planField] = planField === "duration_minutes"
        ? clampNumber(parseInt(target.value, 10), 0, 1440, plan.duration_minutes || 0)
        : String(target.value || '').trim();
      state.sessionPlans[state.day] = plan;
      saveExercisesForDay(true);
      renderDailyProgrammingSummary(plan);
      return;
    }

    var blockField = String(target.getAttribute("data-session-block-field") || "").trim();
    if (blockField) {
      var blockIndex = parseInt(String(target.getAttribute("data-session-block-index") || "-1"), 10);
      var currentPlan = getCurrentSessionPlan();
      if (!Number.isFinite(blockIndex) || blockIndex < 0 || blockIndex >= currentPlan.blocks.length) {
        return;
      }
      currentPlan.blocks[blockIndex][blockField] = String(target.value || '').trim();
      if (blockField === 'type' && (!currentPlan.blocks[blockIndex].title || currentPlan.blocks[blockIndex].title === 'New Block')) {
        currentPlan.blocks[blockIndex].title = prettySessionBlockLabel(currentPlan.blocks[blockIndex].type);
      }
      state.sessionPlans[state.day] = currentPlan;
      saveExercisesForDay(true);
    }
  }

  function getSessionPlanForSlot(slotKey) {
    var key = String(slotKey || "").trim();
    if (!key) {
      return buildDefaultSessionPlan(state.day || "w1d1");
    }
    var existing = state.sessionPlans && state.sessionPlans[key];
    if (existing) {
      return normalizeSessionPlan(existing, key);
    }
    return buildDefaultSessionPlan(key);
  }

  function getCurrentSessionPlan() {
    return getSessionPlanForSlot(state.day);
  }

  function buildDefaultSessionPlan(slotKey) {
    var parsed = parseSlotKey(slotKey) || { week: 1, workout: 1 };
    var weeklyEntry = Array.isArray(state.weeklyStructure) ? state.weeklyStructure[parsed.workout - 1] : null;
    var objective = resolveObjectiveForWeek(parsed.week);
    var phase = resolvePhaseForWeek(parsed.week);
    return normalizeSessionPlan({
      title: weeklyEntry && weeklyEntry.name ? weeklyEntry.name : labelForSlot(slotKey),
      session_type: weeklyEntry && weeklyEntry.session_type ? weeklyEntry.session_type : 'strength_full',
      phase_name: phase ? phase.name : '',
      objective_label: objective ? objective.label : '',
      session_goal: objective ? objective.primary_goal || '' : '',
      sport_focus: objective ? objective.sport_focus || String(state.programMeta && state.programMeta.sport_focus || '') : String(state.programMeta && state.programMeta.sport_focus || ''),
      duration_minutes: 0,
      terrain: '',
      vertical_gain: '',
      intensity_target: weeklyEntry && weeklyEntry.note ? weeklyEntry.note : '',
      coach_notes: '',
      blocks: []
    }, slotKey);
  }

  function normalizeSessionPlan(plan, slotKey) {
    var source = plan && typeof plan === 'object' ? plan : {};
    var fallback = buildSessionPlanFallback(slotKey);
    return {
      title: String(source.title || fallback.title).trim(),
      session_type: normalizeWeeklySessionType(source.session_type || fallback.session_type),
      phase_name: String(source.phase_name || fallback.phase_name).trim(),
      objective_label: String(source.objective_label || fallback.objective_label).trim(),
      session_goal: String(source.session_goal || fallback.session_goal).trim(),
      sport_focus: String(source.sport_focus || fallback.sport_focus).trim(),
      duration_minutes: clampNumber(parseInt(source.duration_minutes, 10), 0, 1440, fallback.duration_minutes),
      terrain: String(source.terrain || fallback.terrain).trim(),
      vertical_gain: String(source.vertical_gain || fallback.vertical_gain).trim(),
      intensity_target: String(source.intensity_target || fallback.intensity_target).trim(),
      coach_notes: String(source.coach_notes || fallback.coach_notes).trim(),
      blocks: normalizeSessionBlocks(source.blocks)
    };
  }

  function buildSessionPlanFallback(slotKey) {
    var parsed = parseSlotKey(slotKey) || { week: 1, workout: 1 };
    var weeklyEntry = Array.isArray(state.weeklyStructure) ? state.weeklyStructure[parsed.workout - 1] : null;
    var objective = resolveObjectiveForWeek(parsed.week);
    var phase = resolvePhaseForWeek(parsed.week);
    return {
      title: weeklyEntry && weeklyEntry.name ? weeklyEntry.name : labelForSlot(slotKey),
      session_type: weeklyEntry && weeklyEntry.session_type ? weeklyEntry.session_type : 'strength_full',
      phase_name: phase ? phase.name : '',
      objective_label: objective ? objective.label : '',
      session_goal: objective ? objective.primary_goal || '' : '',
      sport_focus: objective ? objective.sport_focus || '' : String(state.programMeta && state.programMeta.sport_focus || ''),
      duration_minutes: 0,
      terrain: '',
      vertical_gain: '',
      intensity_target: weeklyEntry && weeklyEntry.note ? weeklyEntry.note : '',
      coach_notes: ''
    };
  }

  function normalizeSessionBlocks(blocks) {
    return (Array.isArray(blocks) ? blocks : []).map(function (block) {
      var source = block && typeof block === 'object' ? block : {};
      var type = normalizeSessionBlockType(source.type);
      var defaults = getDefaultBlockFieldsForType(type);
      var exerciseCount = clampNumber(parseInt(source.exercise_count, 10), 1, 20, defaults.exercise_count || 1);
      var legacyRatio = String(source.interval_work_rest_ratio || defaults.interval_work_rest_ratio || '').trim();
      var ratioParts = legacyRatio.indexOf(':') > -1 ? legacyRatio.split(':') : [];
      var normalizedWorkTime = String(source.interval_work_time || defaults.interval_work_time || '').trim();
      var normalizedRestTime = String(source.interval_rest_time || defaults.interval_rest_time || '').trim();
      if (!normalizedWorkTime && ratioParts[0]) {
        normalizedWorkTime = String(ratioParts[0]).trim() + ' part';
      }
      if (!normalizedRestTime && ratioParts[1]) {
        normalizedRestTime = String(ratioParts[1]).trim() + ' part';
      }
      return {
        type: type,
        title: String(source.title || prettySessionBlockLabel(source.type)).trim(),
        prescription: String(source.prescription || defaults.prescription || '').trim(),
        notes: String(source.notes || defaults.notes || '').trim(),
        interval_exercise_mode: normalizeIntervalExerciseMode(source.interval_exercise_mode || defaults.interval_exercise_mode),
        interval_exercise_name: String(source.interval_exercise_name || defaults.interval_exercise_name || '').trim(),
        interval_rounds: clampNumber(parseInt(source.interval_rounds, 10), 1, 50, defaults.interval_rounds || 1),
        interval_work_time: normalizedWorkTime,
        interval_rest_time: normalizedRestTime,
        interval_work_rest_ratio: String(source.interval_work_rest_ratio || defaults.interval_work_rest_ratio || '').trim(),
        interval_work_intensity_type: normalizeIntervalIntensityType(source.interval_work_intensity_type || defaults.interval_work_intensity_type, false),
        interval_rest_intensity_type: normalizeIntervalIntensityType(source.interval_rest_intensity_type || defaults.interval_rest_intensity_type, true),
        interval_work_intensity: String(source.interval_work_intensity || defaults.interval_work_intensity || '').trim(),
        interval_rest_intensity: String(source.interval_rest_intensity || defaults.interval_rest_intensity || '').trim(),
        hang_protocol_name: String(source.hang_protocol_name || defaults.hang_protocol_name || '').trim(),
        hang_grip_type: String(source.hang_grip_type || defaults.hang_grip_type || '').trim(),
        hang_rounds: clampNumber(parseInt(source.hang_rounds, 10), 1, 20, defaults.hang_rounds || 6),
        hang_hang_seconds: clampNumber(parseInt(source.hang_hang_seconds, 10), 3, 60, defaults.hang_hang_seconds || 10),
        hang_rest_seconds: clampNumber(parseInt(source.hang_rest_seconds, 10), 5, 180, defaults.hang_rest_seconds || 50),
        hang_effort: String(source.hang_effort || defaults.hang_effort || '').trim(),
        emom_exercise: String(source.emom_exercise || defaults.emom_exercise || '').trim(),
        emom_minutes: clampNumber(parseInt(source.emom_minutes, 10), 1, 60, defaults.emom_minutes || 12),
        emom_intensity_type: normalizeIntervalIntensityType(source.emom_intensity_type || defaults.emom_intensity_type, false),
        emom_intensity: String(source.emom_intensity || defaults.emom_intensity || '').trim(),
        amrap_exercise: String(source.amrap_exercise || defaults.amrap_exercise || '').trim(),
        amrap_minutes: clampNumber(parseInt(source.amrap_minutes, 10), 1, 60, defaults.amrap_minutes || 15),
        amrap_intensity_type: normalizeIntervalIntensityType(source.amrap_intensity_type || defaults.amrap_intensity_type, false),
        amrap_intensity: String(source.amrap_intensity || defaults.amrap_intensity || '').trim(),
        exercise_flow: normalizeExerciseFlow(source.exercise_flow || defaults.exercise_flow),
        exercise_rest_strategy: normalizeExerciseRestStrategy(source.exercise_rest_strategy || defaults.exercise_rest_strategy),
        exercise_rest_interval: String(source.exercise_rest_interval || defaults.exercise_rest_interval || '').trim(),
        exercise_count: exerciseCount,
        exercise_names: normalizeExerciseNames(source.exercise_names, exerciseCount),
        exercise_sets: normalizeExerciseValues(source.exercise_sets || source.sets_per_exercise, exerciseCount, defaults.sets_per_exercise || 1),
        exercise_intensity_types: normalizeExerciseValues(source.exercise_intensity_types, exerciseCount, defaults.exercise_intensity_type || 'rpe').map(normalizeIntensityTypeValue),
        exercise_set_reps: normalizeExerciseNestedValues(source.exercise_set_reps || source.exercise_reps || source.reps_per_exercise, exerciseCount, defaults.reps_per_exercise || '5', source.exercise_sets || source.sets_per_exercise),
        exercise_set_intensities: normalizeExerciseNestedValues(source.exercise_set_intensities || source.exercise_intensities || source.target_intensity, exerciseCount, defaults.target_intensity || '7', source.exercise_sets || source.sets_per_exercise),
        exercise_set_rests: normalizeExerciseNestedValues(source.exercise_set_rests, exerciseCount, '', source.exercise_sets || source.sets_per_exercise),
        exercise_set_rep_types: normalizeExerciseSetRepTypes(
          source.exercise_set_rep_types,
          exerciseCount,
          source.exercise_sets || source.sets_per_exercise,
          source.exercise_rep_types || defaults.exercise_rep_type || 'reps'
        ),
        exercise_set_intensity_types: normalizeExerciseSetIntensityTypes(
          source.exercise_set_intensity_types,
          exerciseCount,
          source.exercise_sets || source.sets_per_exercise,
          source.exercise_intensity_types || defaults.exercise_intensity_type || 'rpe'
        ),
        exercise_form: String(source.exercise_form || defaults.exercise_form || '').trim(),
        duration_minutes: clampNumber(parseInt(source.duration_minutes, 10), 0, 1440, defaults.duration_minutes || 0),
      };
    }).filter(function (block) {
      return !!block.title || !!block.prescription || !!block.notes;
    });
  }

  function normalizeExerciseNames(sourceNames, count) {
    var total = Math.max(1, parseInt(count, 10) || 1);
    var names = Array.isArray(sourceNames) ? sourceNames.slice() : [];

    while (names.length < total) {
      names.push('');
    }

    if (names.length > total) {
      names = names.slice(0, total);
    }

    return names.map(function (name) {
      return String(name || '').trim();
    });
  }

  function normalizeExerciseValues(sourceValues, count, fallbackValue) {
    var total = Math.max(1, parseInt(count, 10) || 1);
    var values = Array.isArray(sourceValues) ? sourceValues.slice() : [];

    while (values.length < total) {
      values.push(fallbackValue);
    }

    if (values.length > total) {
      values = values.slice(0, total);
    }

    return values.map(function (value) {
      return String(value || '').trim();
    });
  }

  function normalizeExerciseNestedValues(sourceValues, exerciseCount, fallbackValue, sourceSetCounts) {
    var totalExercises = Math.max(1, parseInt(exerciseCount, 10) || 1);
    var setCounts = normalizeExerciseValues(sourceSetCounts, totalExercises, 1).map(function (value) {
      return clampNumber(parseInt(value, 10), 1, 20, 1);
    });
    var rows = Array.isArray(sourceValues) ? sourceValues.slice() : [];
    var normalized = [];

    for (var i = 0; i < totalExercises; i++) {
      var setTotal = setCounts[i] || 1;
      var row = Array.isArray(rows[i]) ? rows[i].slice() : [];
      while (row.length < setTotal) {
        row.push(fallbackValue);
      }
      if (row.length > setTotal) {
        row = row.slice(0, setTotal);
      }
      normalized.push(row.map(function (value) {
        return String(value || '').trim();
      }));
    }

    return normalized;
  }

  function normalizeExerciseSetIntensityTypes(sourceValues, exerciseCount, sourceSetCounts, fallbackTypes) {
    var totalExercises = Math.max(1, parseInt(exerciseCount, 10) || 1);
    var setCounts = normalizeExerciseValues(sourceSetCounts, totalExercises, 1).map(function (value) {
      return clampNumber(parseInt(value, 10), 1, 20, 1);
    });
    var perExerciseFallback = normalizeExerciseValues(fallbackTypes, totalExercises, 'rpe').map(normalizeIntensityTypeValue);
    var rows = Array.isArray(sourceValues) ? sourceValues.slice() : [];
    var normalized = [];

    for (var i = 0; i < totalExercises; i++) {
      var setTotal = setCounts[i] || 1;
      var row = Array.isArray(rows[i]) ? rows[i].slice() : [];
      if (!row.length && rows[i] != null && !Array.isArray(rows[i])) {
        row = [rows[i]];
      }
      while (row.length < setTotal) {
        row.push(perExerciseFallback[i]);
      }
      if (row.length > setTotal) {
        row = row.slice(0, setTotal);
      }
      normalized.push(row.map(function (value) {
        return normalizeIntensityTypeValue(value);
      }));
    }

    return normalized;
  }

  function normalizeExerciseSetRepTypes(sourceValues, exerciseCount, sourceSetCounts, fallbackTypes) {
    var totalExercises = Math.max(1, parseInt(exerciseCount, 10) || 1);
    var setCounts = normalizeExerciseValues(sourceSetCounts, totalExercises, 1).map(function (value) {
      return clampNumber(parseInt(value, 10), 1, 20, 1);
    });
    var perExerciseFallback = normalizeExerciseValues(fallbackTypes, totalExercises, 'reps').map(normalizeRepTypeValue);
    var rows = Array.isArray(sourceValues) ? sourceValues.slice() : [];
    var normalized = [];

    for (var i = 0; i < totalExercises; i++) {
      var setTotal = setCounts[i] || 1;
      var row = Array.isArray(rows[i]) ? rows[i].slice() : [];
      if (!row.length && rows[i] != null && !Array.isArray(rows[i])) {
        row = [rows[i]];
      }
      while (row.length < setTotal) {
        row.push(perExerciseFallback[i]);
      }
      if (row.length > setTotal) {
        row = row.slice(0, setTotal);
      }
      normalized.push(row.map(function (value) {
        return normalizeRepTypeValue(value);
      }));
    }

    return normalized;
  }

  function normalizeSessionPlans(sessionPlans) {
    var source = sessionPlans && typeof sessionPlans === 'object' ? sessionPlans : {};
    var normalized = {};
    Object.keys(source).forEach(function (slotKey) {
      if (!/^w\d+d\d+$/i.test(slotKey)) {
        return;
      }
      normalized[slotKey] = normalizeSessionPlan(source[slotKey], slotKey);
    });
    return normalized;
  }

  function convertSessionPlanToExercises(plan) {
    var sessionPlan = normalizeSessionPlan(plan, state.day);
    var blocks = Array.isArray(sessionPlan.blocks) ? sessionPlan.blocks : [];
    if (!blocks.length) {
      return [];
    }

    return blocks.map(function (block) {
      var section = mapSessionBlockToSection(block.type);
      var mode = mapSessionBlockToMode(block.type);
      var flow = normalizeExerciseFlow(block.exercise_flow);
      var flowNote = flow === 'superset' ? 'Execution: Superset' : flow === 'circuit' ? 'Execution: Circuit' : '';
      var restStrategy = normalizeExerciseRestStrategy(block.exercise_rest_strategy);
      var restInterval = String(block && block.exercise_rest_interval || '').trim();
      var restLabel = restStrategyLabel(flow, restStrategy);
      var restNote = restInterval ? (restLabel + ': ' + restInterval) : '';
      var intervalNote = '';
      if (normalizeSessionBlockType(block.type) === 'intervals') {
        var intervalMode = normalizeIntervalExerciseMode(block.interval_exercise_mode);
        var intervalWorkType = normalizeIntervalIntensityType(block.interval_work_intensity_type, false);
        var intervalRestType = normalizeIntervalIntensityType(block.interval_rest_intensity_type, true);
        var intervalExercise = intervalMode === 'free_text'
          ? String(block.interval_exercise_name || '').trim()
          : (intervalMode === 'biking' ? 'Biking' : 'Running');
        intervalNote = [
          intervalExercise ? ('Exercise: ' + intervalExercise) : '',
          block.interval_rounds ? ('Rounds: ' + String(block.interval_rounds)) : '',
          block.interval_work_time ? ('Work Time: ' + String(block.interval_work_time)) : '',
          block.interval_rest_time ? ('Rest Time: ' + String(block.interval_rest_time)) : '',
          block.interval_work_intensity ? ('Work Intensity (' + intervalWorkType.toUpperCase() + '): ' + String(block.interval_work_intensity)) : '',
          intervalRestType === 'complete_rest'
            ? 'Rest Intensity: Complete Rest'
            : (block.interval_rest_intensity ? ('Rest Intensity (' + intervalRestType.toUpperCase() + '): ' + String(block.interval_rest_intensity)) : '')
        ].filter(Boolean).join(' • ');
      } else if (normalizeSessionBlockType(block.type) === 'hangboarding') {
        intervalNote = [
          block.hang_protocol_name ? ('Protocol: ' + String(block.hang_protocol_name)) : '',
          block.hang_grip_type ? ('Grip: ' + String(block.hang_grip_type)) : '',
          block.hang_rounds ? ('Rounds: ' + String(block.hang_rounds)) : '',
          block.hang_hang_seconds ? ('Hang: ' + String(block.hang_hang_seconds) + 's') : '',
          block.hang_rest_seconds ? ('Rest: ' + String(block.hang_rest_seconds) + 's') : '',
          block.hang_effort ? ('Effort: ' + String(block.hang_effort)) : ''
        ].filter(Boolean).join(' • ');
      } else if (normalizeSessionBlockType(block.type) === 'emom') {
        var emomIntensityType = normalizeIntervalIntensityType(block.emom_intensity_type, false);
        intervalNote = [
          block.emom_exercise ? ('Exercise: ' + String(block.emom_exercise)) : '',
          block.emom_minutes ? ('Duration: ' + String(block.emom_minutes) + ' min') : '',
          block.emom_intensity ? ('Intensity (' + emomIntensityType.toUpperCase() + '): ' + String(block.emom_intensity)) : ''
        ].filter(Boolean).join(' • ');
      } else if (normalizeSessionBlockType(block.type) === 'amrap') {
        var amrapIntensityType = normalizeIntervalIntensityType(block.amrap_intensity_type, false);
        intervalNote = [
          block.amrap_exercise ? ('Circuit: ' + String(block.amrap_exercise)) : '',
          block.amrap_minutes ? ('Duration: ' + String(block.amrap_minutes) + ' min') : '',
          block.amrap_intensity ? ('Intensity (' + amrapIntensityType.toUpperCase() + '): ' + String(block.amrap_intensity)) : ''
        ].filter(Boolean).join(' • ');
      }
      var setData = {
        reps: mode === 'endurance' ? (block.prescription || sessionPlan.duration_minutes || '') : (block.prescription || ''),
        weight: mode === 'endurance' ? (sessionPlan.vertical_gain || sessionPlan.terrain || '') : '',
        rpe: mode === 'endurance' ? (sessionPlan.intensity_target || '') : '',
        rest: '',
        notes: [sessionPlan.session_goal, flowNote, restNote, intervalNote, block.notes, sessionPlan.coach_notes].filter(Boolean).join(' • '),
        done: false
      };

      return {
        name: block.title || prettySessionBlockLabel(block.type),
        section: section,
        mode: mode,
        superset_group: null,
        field_toggles: normalizeExerciseFieldToggles(null, mode),
        notes: [sessionPlan.phase_name, sessionPlan.objective_label, sessionPlan.sport_focus].filter(Boolean).join(' • '),
        sets: [setData]
      };
    });
  }

  function mapSessionBlockToSection(blockType) {
    var type = normalizeSessionBlockType(blockType);
    if (type === 'warmup' || type === 'activation') {
      return 'Warm Up';
    }
    if (type === 'cooldown' || type === 'mobility') {
      return 'Cool Down';
    }
    if (type === 'main_strength' || type === 'power') {
      return 'A Block';
    }
    if (type === 'hangboarding') {
      return 'B Block';
    }
    if (type === 'secondary_strength' || type === 'intervals' || type === 'emom' || type === 'amrap' || type === 'threshold' || type === 'zone2') {
      return 'B Block';
    }
    return 'C Block';
  }

  function mapSessionBlockToMode(blockType) {
    var type = normalizeSessionBlockType(blockType);
    if (type === 'zone2' || type === 'threshold' || type === 'intervals' || type === 'emom' || type === 'amrap' || type === 'long_day') {
      return 'endurance';
    }
    if (type === 'warmup' || type === 'cooldown' || type === 'mobility') {
      return 'time';
    }
    if (type === 'hangboarding') {
      return 'time';
    }
    return 'reps';
  }

  function createEmptySessionBlock(sessionType, blockIndex) {
    var sequence = getSessionTypeBlockSequence(sessionType);
    var presetKey = sequence[Math.max(0, parseInt(blockIndex, 10) || 0)] || sequence[sequence.length - 1] || 'main_strength';
    var preset = SESSION_BLOCK_PRESETS[presetKey];
    if (preset) {
      return Object.assign({ type: preset.type, title: preset.title, prescription: preset.prescription, notes: preset.notes }, getDefaultBlockFieldsForType(preset.type));
    }

    return Object.assign({ type: presetKey, title: prettySessionBlockLabel(presetKey), prescription: '', notes: '' }, getDefaultBlockFieldsForType(presetKey));
  }

  function getDefaultBlockFieldsForType(blockType) {
    var type = normalizeSessionBlockType(blockType);
    if (isExerciseConfiguredBlockType(type)) {
      return {
        exercise_flow: 'straight',
        exercise_rest_strategy: 'between_exercises',
        exercise_rest_interval: '',
        exercise_count: 1,
        exercise_names: [''],
        exercise_sets: ['3'],
        exercise_rep_type: 'reps',
        exercise_intensity_type: 'rpe',
        exercise_reps: ['5'],
        exercise_intensities: ['7']
      };
    }
    if (type === 'intervals') {
      return {
        interval_exercise_mode: 'running',
        interval_exercise_name: '',
        interval_rounds: 6,
        interval_work_time: '60s',
        interval_rest_time: '60s',
        interval_work_intensity_type: 'rpe',
        interval_rest_intensity_type: 'zone',
        interval_work_intensity: 'RPE 8',
        interval_rest_intensity: 'Easy'
      };
    }
    if (type === 'hangboarding') {
      return {
        hang_protocol_name: 'Repeaters',
        hang_grip_type: '20mm edge, half crimp',
        hang_rounds: 6,
        hang_hang_seconds: 10,
        hang_rest_seconds: 50,
        hang_effort: 'RPE 8'
      };
    }
    if (type === 'emom') {
      return {
        emom_exercise: '5 burpees + 10 KB swings',
        emom_minutes: 12,
        emom_intensity_type: 'rpe',
        emom_intensity: 'RPE 8'
      };
    }
    if (type === 'amrap') {
      return {
        amrap_exercise: '5 pull-ups, 10 push-ups, 15 air squats',
        amrap_minutes: 15,
        amrap_intensity_type: 'rpe',
        amrap_intensity: 'RPE 7'
      };
    }
    if (type === 'zone2' || type === 'long_endurance' || type === 'threshold' || type === 'vo2' || type === 'uphill') {
      return { exercise_form: 'running', duration_minutes: 60, target_intensity: 'Zone 2' };
    }
    if (type === 'mobility' || type === 'cooldown' || type === 'warmup' || type === 'activation' || type === 'assessment') {
      return { duration_minutes: 15, target_intensity: '' };
    }
    return { prescription: '', notes: '' };
  }

  function addQuickSessionBlock(presetKey) {
    var preset = SESSION_BLOCK_PRESETS[presetKey];
    if (!preset) {
      return;
    }
    var plan = getCurrentSessionPlan();
    plan.blocks.push(Object.assign({ type: preset.type, title: preset.title, prescription: preset.prescription, notes: preset.notes }, getDefaultBlockFieldsForType(preset.type)));
    state.sessionPlans[state.day] = plan;
    renderDailyProgrammingDesigner();
    saveExercisesForDay(true);
  }

  function buildSessionTypeSelectOptions(selectedValue) {
    var selected = normalizeWeeklySessionType(selectedValue);
    return WEEKLY_SESSION_TYPE_OPTIONS.map(function (option) {
      var isSelected = option.value === selected ? ' selected' : '';
      return '<option value="' + escapeAttribute(option.value) + '"' + isSelected + '>' + escapeHtml(option.label) + '</option>';
    }).join('');
  }

  function buildPhaseSelectOptions(selectedValue) {
    var selected = String(selectedValue || '').trim();
    var options = ['<option value="">No phase selected</option>'];
    (Array.isArray(state.programPhases) ? state.programPhases : []).forEach(function (phase) {
      var label = String(phase && phase.name || '').trim();
      if (!label) return;
      var isSelected = label === selected ? ' selected' : '';
      options.push('<option value="' + escapeAttribute(label) + '"' + isSelected + '>' + escapeHtml(label) + '</option>');
    });
    return options.join('');
  }

  function buildObjectiveSelectOptions(selectedValue) {
    var selected = String(selectedValue || '').trim();
    var options = ['<option value="">No objective selected</option>'];
    var objectives = Array.isArray(state.programMeta && state.programMeta.season_objectives) ? state.programMeta.season_objectives : [];
    objectives.forEach(function (objective) {
      var label = String(objective && objective.label || '').trim();
      if (!label) return;
      var isSelected = label === selected ? ' selected' : '';
      options.push('<option value="' + escapeAttribute(label) + '"' + isSelected + '>' + escapeHtml(label) + '</option>');
    });
    return options.join('');
  }

  function buildSessionBlockTypeOptions(selectedValue) {
    var selected = normalizeSessionBlockType(selectedValue);
    return SESSION_BLOCK_TYPE_OPTIONS.map(function (option) {
      var isSelected = option.value === selected ? ' selected' : '';
      return '<option value="' + escapeAttribute(option.value) + '"' + isSelected + '>' + escapeHtml(option.label) + '</option>';
    }).join('');
  }

  function normalizeSessionBlockType(value) {
    var target = String(value || 'main_strength').trim().toLowerCase();
    var found = SESSION_BLOCK_TYPE_OPTIONS.some(function (option) { return option.value === target; });
    return found ? target : 'main_strength';
  }

  function prettySessionBlockLabel(value) {
    var normalized = normalizeSessionBlockType(value);
    var match = SESSION_BLOCK_TYPE_OPTIONS.find(function (option) { return option.value === normalized; });
    return match ? match.label : 'Block';
  }

  function prettySessionTypeLabel(value) {
    var normalized = normalizeWeeklySessionType(value);
    var match = WEEKLY_SESSION_TYPE_OPTIONS.find(function (option) { return option.value === normalized; });
    return match ? match.label : 'Session';
  }

  function resolvePhaseForWeek(weekNumber) {
    var week = parseInt(weekNumber, 10);
    if (!Number.isFinite(week)) {
      return null;
    }
    return (Array.isArray(state.programPhases) ? state.programPhases : []).find(function (phase) {
      return week >= Number(phase.start_week || 0) && week <= Number(phase.end_week || 0);
    }) || null;
  }

  function resolveObjectiveForWeek(weekNumber) {
    var week = parseInt(weekNumber, 10);
    if (!Number.isFinite(week)) {
      return null;
    }
    return (Array.isArray(state.programMeta && state.programMeta.season_objectives) ? state.programMeta.season_objectives : []).find(function (objective) {
      return week >= Number(objective.phase_start_week || 0) && week <= Number(objective.phase_end_week || 0);
    }) || null;
  }

  function populateSelectOptions(selector, optionsHtml, value) {
    var select = document.querySelector(selector);
    if (!select) {
      return;
    }
    select.innerHTML = optionsHtml;
    if (value != null) {
      select.value = value;
    }
  }

  function setTextContent(selector, value) {
    var node = document.querySelector(selector);
    if (node) {
      node.textContent = value || '';
    }
  }

  function bindPress(target, handler) {
    if (!target || typeof handler !== "function") {
      return;
    }

    target.addEventListener("click", handler);
    target.addEventListener("touchend", function (event) {
      event.preventDefault();
      handler(event);
    }, { passive: false });
  }

  function wireStartWorkoutButton(button) {
    if (!button || button.getAttribute("data-start-workout-wired") === "1") {
      return;
    }

    button.setAttribute("data-start-workout-wired", "1");
    bindPress(button, function () {
      startWorkoutWalkthrough();
    });
  }

  function configureBuilderMode() {
    try {
      var params = new URLSearchParams(window.location.search);
      var wantsTemplateBuilder = params.get("builder") === "1";
      state.templateId = params.get("templateId") || null;
      state.templatePresetKey = String(params.get("preset") || "").trim() || null;
      var builderAthleteId = String(params.get("athleteId") || "").trim();
      state.targetAthleteId = isUuid(builderAthleteId) ? builderAthleteId : null;

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
        }
            var phases = getDailyNavigatorPhases();
            if (!phases.length) {
              state.dailyProgrammingViewMode = "week"; // Default to week if no phases
              return;
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

  function getDefaultProgramMeta() {
    return {
      program_type: "hybrid",
      sport_focus: "",
      athlete_level: "intermediate",
      primary_goal: "",
      secondary_goal: "",
      training_days_per_week: state && state.structure ? state.structure.workoutsPerWeek : 3,
      strength_days_per_week: 2,
      endurance_days_per_week: 1,
      mobility_days_per_week: 1,
      deload_frequency: "every_4",
      peak_date: "",
      tags: []
    };
  }

  function bindTemplatePlannerEvents() {
    document.addEventListener("click", function (event) {
      var addObjectiveBtn = event.target && event.target.closest("[data-template-add-objective]");
      if (addObjectiveBtn) {
        var seasonObjectives = Array.isArray(state.programMeta && state.programMeta.season_objectives)
          ? state.programMeta.season_objectives.slice()
          : [];
        seasonObjectives.push(createDefaultSeasonObjective(seasonObjectives.length));
        state.programMeta = normalizeProgramMeta(Object.assign({}, state.programMeta, {
          season_objectives: seasonObjectives
        }), state.structure);
        renderSeasonObjectives();
        renderProgramBuilderAlerts();
        return;
      }

      var removeObjectiveBtn = event.target && event.target.closest("[data-template-objective-remove]");
      if (removeObjectiveBtn) {
        var objectiveIndex = parseInt(String(removeObjectiveBtn.getAttribute("data-template-objective-remove") || "-1"), 10);
        var currentObjectives = Array.isArray(state.programMeta && state.programMeta.season_objectives)
          ? state.programMeta.season_objectives.slice()
          : [];
        if (Number.isFinite(objectiveIndex) && objectiveIndex >= 0 && objectiveIndex < currentObjectives.length) {
          currentObjectives.splice(objectiveIndex, 1);
          state.programMeta = normalizeProgramMeta(Object.assign({}, state.programMeta, {
            season_objectives: currentObjectives
          }), state.structure);
          renderSeasonObjectives();
          renderProgramBuilderAlerts();
        }
        return;
      }

      var addPhaseBtn = event.target && event.target.closest("[data-template-add-phase]");
      if (addPhaseBtn) {
        state.programPhases.push(createDefaultPhase(state.programPhases.length, state.structure.weeks, state.programMeta && state.programMeta.program_type));
        state.programPhases = normalizeProgramPhases(state.programPhases, state.structure.weeks, state.programMeta && state.programMeta.program_type);
        renderProgramPhases();
        renderProgramBuilderAlerts();
        return;
      }

      var applyPhaseCountBtn = event.target && event.target.closest("[data-template-phase-count-apply]");
      if (applyPhaseCountBtn) {
        var phaseCountInput = document.querySelector("[data-template-phase-count]");
        var targetPhaseCount = parseInt(String(phaseCountInput && phaseCountInput.value || ""), 10);
        resizeProgramPhases(targetPhaseCount);
        return;
      }

      var removePhaseBtn = event.target && event.target.closest("[data-template-phase-remove]");
      if (removePhaseBtn) {
        var phaseIndex = parseInt(String(removePhaseBtn.getAttribute("data-template-phase-remove") || "-1"), 10);
        if (Number.isFinite(phaseIndex) && phaseIndex >= 0 && phaseIndex < state.programPhases.length) {
          state.programPhases.splice(phaseIndex, 1);
          renderProgramPhases();
          renderProgramBuilderAlerts();
        }
      }
    });

    document.addEventListener("input", function (event) {
      var target = event.target;
      if (!target || !target.getAttribute) {
        return;
      }

      var metaField = String(target.getAttribute("data-template-meta-field") || "").trim();
      if (metaField) {
        syncProgramMetaField(metaField, target.value);
        renderProgramBuilderAlerts();
        return;
      }

      var objectiveField = String(target.getAttribute("data-template-objective-field") || "").trim();
      if (objectiveField) {
        var objectiveIndex = parseInt(String(target.getAttribute("data-template-objective-index") || "-1"), 10);
        if (Number.isFinite(objectiveIndex)) {
          syncSeasonObjectiveField(objectiveIndex, objectiveField, target.value);
          renderProgramBuilderAlerts();
        }
        return;
      }

      var phaseField = String(target.getAttribute("data-template-phase-field") || "").trim();
      if (phaseField) {
        var phaseIndex = parseInt(String(target.getAttribute("data-template-phase-index") || "-1"), 10);
        if (Number.isFinite(phaseIndex) && phaseIndex >= 0 && phaseIndex < state.programPhases.length) {
          syncProgramPhaseField(phaseIndex, phaseField, target.value);
          renderProgramPhaseWeeksWarning();
          renderProgramBuilderAlerts();
        }
        return;
      }

      var weeklyField = String(target.getAttribute("data-template-week-field") || "").trim();
      if (weeklyField) {
        var weeklyIndex = parseInt(String(target.getAttribute("data-template-week-index") || "-1"), 10);
        if (Number.isFinite(weeklyIndex) && weeklyIndex >= 0 && weeklyIndex < state.weeklyStructure.length) {
          syncWeeklyStructureField(weeklyIndex, weeklyField, target.value);
          renderProgramBuilderAlerts();
          refreshWorkoutDaySelect(document.querySelector("[data-workout-day]"));
          updateDayInfo();
          refreshTemplateDayTools();
        }
      }
    });

    document.addEventListener("change", function (event) {
      var target = event.target;
      if (!target || !target.getAttribute) {
        return;
      }

      var metaField = String(target.getAttribute("data-template-meta-field") || "").trim();
      if (metaField) {
        syncProgramMetaField(metaField, target.value);
        if (metaField === "program_type") {
          state.programPhases = normalizeProgramPhases(state.programPhases, state.structure.weeks, state.programMeta.program_type);
          state.weeklyStructure = normalizeWeeklyStructure(state.weeklyStructure, state.structure.workoutsPerWeek, state.templateFocus, state.programMeta.program_type);
          renderProgramPhases();
          renderWeeklyStructure();
        }
        renderProgramBuilderAlerts();
      }
    });
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
    state.builderStep = 1;
    state.storagePrefix = TEMPLATE_DRAFT_PREFIX;
    state.programMeta = normalizeProgramMeta(state.programMeta, state.structure);
    state.programPhases = normalizeProgramPhases(state.programPhases, state.structure.weeks, state.programMeta.program_type);
    state.weeklyStructure = normalizeWeeklyStructure(state.weeklyStructure, state.structure.workoutsPerWeek, state.templateFocus, state.programMeta.program_type);
    clearBuilderDrafts();

    if (state.templateId) {
      hydrateDraftFromTemplate(state.templateId);
    } else if (state.templatePresetKey) {
      hydrateDraftFromPreset(state.templatePresetKey);
    } else {
      maybeRunPendingTemplateAutoSave();
    }

    applyBuilderModeUi();
    loadSavedWorkoutBlocksFromCloud();
    ensureDaySessionTypesForStructure();
    refreshTemplateDayTools();
    updateDayInfo();
  }

  function shouldAutoSaveTemplateToLibrary() {
    try {
      var params = new URLSearchParams(window.location.search || "");
      return params.get("autosaveTemplate") === "1";
    } catch (e) {
      return false;
    }
  }

  function shouldRedirectToLibraryAfterSave() {
    try {
      var params = new URLSearchParams(window.location.search || "");
      return params.get("redirectToLibrary") === "1";
    } catch (e) {
      return false;
    }
  }

  function maybeRunPendingTemplateAutoSave() {
    if (!state.isTemplateBuilder || !shouldAutoSaveTemplateToLibrary() || state.templateAutoSaveTriggered) {
      return;
    }
    state.templateAutoSaveTriggered = true;
    saveTemplateProgram();
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
      state.isCoachAssignedProgramEdit = params.get("coachEdit") === "1";
      state.isProgramReadOnly = params.get("view") === "1";
      var assignmentId = String(params.get("assignmentId") || "").trim();
      var templateId = params.get("templateId");
      if (!templateId && !assignmentId) {
        return;
      }

      if (!state.client) {
        state.client = createSupabaseClient();
      }

      if (templateId) {
        activateAssignedTemplateMode(templateId, assignmentId);
        return;
      }

      resolveAssignedTemplateIdFromAssignment(assignmentId)
        .then(function (resolvedTemplateId) {
          if (!resolvedTemplateId) {
            setStatus("This scheduled workout is missing its template link, so the editor could not open.", "error");
            return;
          }

          activateAssignedTemplateMode(resolvedTemplateId, assignmentId);
        })
        .catch(function () {
          setStatus("Could not load the scheduled workout editor for this assignment.", "error");
        });
    } catch (e) {
      // Ignore malformed query parameters.
    }
  }

  function activateAssignedTemplateMode(templateId, assignmentId) {
    var normalizedTemplateId = String(templateId || "").trim();
    if (!normalizedTemplateId) {
      return;
    }

    state.assignedTemplateId = normalizedTemplateId;
    state.assignedProgramInstanceId = assignmentId || null;
    state.legacyStoragePrefix = "nomadic_training_program_log_" + normalizedTemplateId + "_";
    state.storagePrefix = state.assignedProgramInstanceId
      ? "nomadic_training_program_assignment_log_" + state.assignedProgramInstanceId + "_"
      : state.legacyStoragePrefix;
    state.isAthleteLockedView = !state.isCoachAssignedProgramEdit;

    if (state.isCoachAssignedProgramEdit) {
      applyCoachAssignedProgramEditUi();
    } else {
      applyAthleteLockedUi();
    }

    hydrateAssignedTemplate(normalizedTemplateId);
  }

  function resolveAssignedTemplateIdFromAssignment(assignmentId) {
    var normalizedAssignmentId = String(assignmentId || "").trim();
    if (!state.client || !normalizedAssignmentId) {
      return Promise.resolve("");
    }

    return state.client
      .from("user_training_programs")
      .select("program_id")
      .eq("id", normalizedAssignmentId)
      .single()
      .then(function (result) {
        if (result.error) {
          return "";
        }

        return String(result.data && result.data.program_id || "").trim();
      })
      .catch(function () {
        return "";
      });
  }

  function applyCoachAssignedProgramEditUi() {
    stopWorkoutWalkthrough(true);

    var addExerciseBtn = document.querySelector("[data-add-exercise]");
    var printBtn = document.querySelector("[data-print-workout]");
    var fullPlanPrintBtn = document.querySelector("[data-print-full-plan]");
    var clearBtn = document.querySelector("[data-clear-workout]");
    var saveBtn = document.querySelector("[data-save-workout]");
    var startWorkoutBtn = document.querySelector("[data-start-workout]");
    var backLink = document.querySelector("[data-program-back-link]");
    var subtitle = document.querySelector(".program-demo-subtitle");
    var prevDailyBtn = document.querySelector("[data-template-prev-step-daily]");
    var dailyNavGrid = document.querySelector(".program-builder-daily-nav-grid");
    var daySelectorTitle = document.querySelector(".day-selector-title");

    state.builderStep = 3;
    state.isProgramReadOnly = false;
    state.isAthleteLockedView = false;

    if (document.body) {
      document.body.classList.remove("athlete-locked-view");
      document.body.classList.add("template-builder-mode");
    }

    if (addExerciseBtn) {
      addExerciseBtn.style.display = "none";
    }
    if (printBtn) {
      printBtn.style.display = "none";
    }
    if (fullPlanPrintBtn) {
      fullPlanPrintBtn.style.display = "none";
    }
    if (clearBtn) {
      clearBtn.style.display = "none";
    }
    if (saveBtn) {
      saveBtn.style.display = "inline-flex";
      saveBtn.innerHTML = "<span>💾</span> Save Program Day";
    }
    if (startWorkoutBtn) {
      startWorkoutBtn.style.display = "none";
    }
    if (backLink) {
      backLink.href = buildCoachAssignedProgramReturnUrl();
      backLink.textContent = "← Back to Training Calendar Manager";
    }
    if (subtitle) {
      subtitle.textContent = "Coach edit mode: review and adjust this athlete's assigned workout day.";
    }
    if (prevDailyBtn) {
      prevDailyBtn.style.display = "none";
    }
    if (dailyNavGrid) {
      dailyNavGrid.style.display = "grid";
    }
    if (daySelectorTitle) {
      daySelectorTitle.textContent = "Edit Scheduled Workout";
    }

    state.dailyProgrammingViewMode = "day";
    ensureDailyNavigatorState();
    renderDailyNavigatorControls();

    setBuilderStep(3);
  }

  function buildCoachAssignedProgramReturnUrl() {
    if (state.targetAthleteId) {
      return "athlete-insight.html?athleteId=" + encodeURIComponent(state.targetAthleteId) + "&tab=training&trainingTab=current";
    }

    return "admin.html#admin-athletes";
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
    stopWorkoutWalkthrough(true);

    var addExerciseBtn = document.querySelector("[data-add-exercise]");
    var printBtn = document.querySelector("[data-print-workout]");
    var fullPlanPrintBtn = document.querySelector("[data-print-full-plan]");
    var clearBtn = document.querySelector("[data-clear-workout]");
    var saveBtn = document.querySelector("[data-save-workout]");
    var startWorkoutBtn = document.querySelector("[data-start-workout]");
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

    if (startWorkoutBtn) {
      startWorkoutBtn.style.display = state.isProgramReadOnly ? "none" : "inline-flex";
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
    stopWorkoutWalkthrough(true);

    var panel = document.querySelector("[data-template-builder-panel]");
    var nextOverviewBtn = document.querySelector("[data-template-next-step-overview]");
    var prevPhasesBtn = document.querySelector("[data-template-prev-step-phases]");
    var nextPhasesBtn = document.querySelector("[data-template-next-step-phases]");
    var prevDailyBtn = document.querySelector("[data-template-prev-step-daily]");
    var nameInput = document.querySelector("[data-template-name]");
    var weeksInput = document.querySelector("[data-template-weeks]");
    var workoutsInput = document.querySelector("[data-template-workouts-per-week]");
    var applyStructureBtn = document.querySelector("[data-template-structure-apply]");
    var seedSkeletonBtn = document.querySelector("[data-template-seed-skeleton]");
    var dayTypeControls = document.querySelector("[data-template-day-type-controls]");
    var dayTools = document.querySelector("[data-template-day-tools]");
    var addExerciseBtn = document.querySelector("[data-add-exercise]");
    var printBtn = document.querySelector("[data-print-workout]");
    var fullPlanPrintBtn = document.querySelector("[data-print-full-plan]");
    var saveBtn = document.querySelector("[data-save-workout]");
    var clearBtn = document.querySelector("[data-clear-workout]");
    var startWorkoutBtn = document.querySelector("[data-start-workout]");
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
      fullPlanPrintBtn.style.display = "inline-flex";
      fullPlanPrintBtn.innerHTML = "<span>👁️</span> View Workout Program";
    }

    if (saveBtn) {
      saveBtn.style.display = "inline-flex";
      saveBtn.innerHTML = "<span>💾</span> Save Template";
    }

    if (clearBtn) {
      clearBtn.style.display = "inline-flex";
      clearBtn.innerHTML = "<span>🧹</span> Clear Day";
    }

    if (startWorkoutBtn) {
      startWorkoutBtn.style.display = "none";
    }

    if (backLink) {
      backLink.href = "admin.html";
      backLink.textContent = "← Back to Coaching Dashboard";
    }

    if (subtitle) {
      subtitle.textContent = "Build the annual, monthly, and weekly program blueprint before moving into daily programming.";
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

    state.programMeta = normalizeProgramMeta(state.programMeta, state.structure);
    state.templateFocus = deriveTemplateFocusFromMeta(state.programMeta, state.templateFocus);
    state.programPhases = normalizeProgramPhases(state.programPhases, state.structure.weeks, state.programMeta.program_type);
    state.weeklyStructure = normalizeWeeklyStructure(state.weeklyStructure, state.structure.workoutsPerWeek, state.templateFocus, state.programMeta.program_type);
    refreshBuilderPlannerUi();

    if (weeksInput) {
      weeksInput.addEventListener("change", function () {
        var nextWeeks = parseInt((weeksInput && weeksInput.value) || "1", 10);
        var nextWorkouts = parseInt((workoutsInput && workoutsInput.value) || "3", 10);
        updateTemplateStructure(nextWeeks, nextWorkouts);
      });
    }

    if (workoutsInput) {
      workoutsInput.addEventListener("change", function () {
        var nextWeeks = parseInt((weeksInput && weeksInput.value) || "1", 10);
        var nextWorkouts = parseInt((workoutsInput && workoutsInput.value) || "3", 10);
        updateTemplateStructure(nextWeeks, nextWorkouts);
      });
    }

    if (nextOverviewBtn) {
      nextOverviewBtn.addEventListener("click", function () {
        var nextWeeks = parseInt((weeksInput && weeksInput.value) || "1", 10);
        var nextWorkouts = parseInt((workoutsInput && workoutsInput.value) || "3", 10);
        updateTemplateStructure(nextWeeks, nextWorkouts);
        setBuilderStep(2);
      });
    }

    if (prevPhasesBtn) {
      prevPhasesBtn.addEventListener("click", function () {
        setBuilderStep(1);
      });
    }

    if (nextPhasesBtn) {
      nextPhasesBtn.addEventListener("click", function () {
        if (!canProceedToDailyProgramming()) {
          renderProgramPhaseWeeksWarning();
          setStatus("Phase lengths must add up to total plan weeks before moving forward.", "info");
          return;
        }
        setBuilderStep(3);
      });
    }

    if (prevDailyBtn) {
      prevDailyBtn.addEventListener("click", function () {
        setBuilderStep(2);
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

    setBuilderStep(state.builderStep || 1);
  }

  function setBuilderStep(step) {
    var nextStep = step === 3 ? 3 : (step === 2 ? 2 : 1);
    state.builderStep = nextStep;

    var panel = document.querySelector("[data-template-builder-panel]");
    var overviewSection = document.querySelector("[data-template-step='overview']");
    var phasesSection = document.querySelector("[data-template-step='phases']");
    var dailyBanner = document.querySelector("[data-template-daily-step-banner]");
    var dailyAreas = document.querySelectorAll("[data-template-daily-programming]");
    var dayTools = document.querySelector("[data-template-day-tools]");
    var dayTypeControls = document.querySelector("[data-template-day-type-controls]");
    var subtitle = document.querySelector(".program-demo-subtitle");

    if (panel) {
      panel.hidden = nextStep === 3;
    }

    if (overviewSection) {
      overviewSection.hidden = nextStep !== 1;
    }

    if (phasesSection) {
      phasesSection.hidden = nextStep !== 2;
    }

    if (dailyBanner) {
      dailyBanner.hidden = nextStep !== 3;
    }

    dailyAreas.forEach(function (element) {
      element.hidden = nextStep !== 3;
    });

    var overviewPanel = document.querySelector("[data-template-program-overview]");
    if (overviewPanel && nextStep !== 3) {
      overviewPanel.hidden = true;
    }

    if (dayTools) {
      dayTools.hidden = nextStep !== 3;
    }

    if (dayTypeControls) {
      dayTypeControls.hidden = nextStep !== 3;
    }

    if (subtitle) {
      subtitle.textContent = nextStep === 1
        ? "Set the high-level program overview, training frequency, and key peak dates first."
        : (nextStep === 2
          ? "Define phase count, phase lengths, training days per phase, and each phase goal before daily programming."
          : "Program the exact daily sessions, sets, endurance blocks, and workout details for each workout slot.");
    }

    var daySelect = document.querySelector("[data-workout-day]");
    if (daySelect) {
      refreshWorkoutDaySelect(daySelect);
    }
  }

  function bindTemplateProgramOverviewEvents() {
    document.addEventListener("click", function (event) {
      var closeBtn = event.target && event.target.closest("[data-template-program-overview-close]");
      if (closeBtn) {
        closeTemplateProgramOverview();
      }
    });

    function handleOverviewInput(target) {
      if (!target || !target.closest) {
        return;
      }
      var row = target.closest("[data-overview-slot]");
      if (!row) {
        return;
      }
      var slotKey = String(row.getAttribute("data-overview-slot") || "").trim();
      if (!slotKey) {
        return;
      }

      var field = String(target.getAttribute("data-overview-field") || "").trim();
      var blockField = String(target.getAttribute("data-overview-block-field") || "").trim();
      var plan = getSessionPlanForSlot(slotKey);

      if (field) {
        plan[field] = field === "duration_minutes"
          ? clampNumber(parseInt(target.value, 10), 0, 1440, plan.duration_minutes || 0)
          : String(target.value || "").trim();
      }

      if (blockField) {
        var blockIndex = parseInt(String(target.getAttribute("data-overview-block-index") || "-1"), 10);
        if (Number.isFinite(blockIndex) && blockIndex >= 0 && blockIndex < plan.blocks.length) {
          if (blockField === "type") {
            var nextType = normalizeSessionBlockType(target.value);
            var existingTitle = String(plan.blocks[blockIndex].title || "").trim();
            var refreshedBlock = createEmptySessionBlock(nextType, blockIndex);
            plan.blocks[blockIndex] = Object.assign({}, refreshedBlock, {
              type: nextType,
              title: existingTitle && existingTitle !== "New Block" ? existingTitle : prettySessionBlockLabel(nextType)
            });
          } else {
            plan.blocks[blockIndex][blockField] = String(target.value || "").trim();
          }
        }
      }

      state.sessionPlans[slotKey] = normalizeSessionPlan(plan, slotKey);
      persistSessionPlanForSlot(slotKey, state.sessionPlans[slotKey]);

      if (slotKey === state.day) {
        renderDailyProgrammingDesigner();
        renderDailyProgrammingSummary(state.sessionPlans[slotKey]);
      }

      renderTemplateProgramOverview();
    }

    document.addEventListener("input", function (event) {
      handleOverviewInput(event.target);
    });

    document.addEventListener("change", function (event) {
      handleOverviewInput(event.target);
    });
  }

  function persistSessionPlanForSlot(slotKey, plan) {
    var key = String(slotKey || "").trim();
    if (!key) {
      return;
    }

    var storageKey = state.storagePrefix + key;
    var existing = readFromStorage(storageKey) || {};
    existing.session_plan = normalizeSessionPlan(plan, key);
    existing.saved_at = new Date().toISOString();
    writeToStorage(storageKey, existing);
  }

  function openTemplateProgramOverview() {
    if (!state.isTemplateBuilder) {
      return;
    }

    var panel = document.querySelector("[data-template-program-overview]");
    if (!panel) {
      return;
    }

    saveExercisesForDay(true);
    renderTemplateProgramOverview();
    panel.hidden = false;
  }

  function closeTemplateProgramOverview() {
    var panel = document.querySelector("[data-template-program-overview]");
    if (panel) {
      panel.hidden = true;
    }
  }

  function renderTemplateProgramOverview() {
    var panel = document.querySelector("[data-template-program-overview]");
    var list = document.querySelector("[data-template-program-overview-list]");
    if (!panel || panel.hidden || !list) {
      return;
    }

    var slotKeys = getAllSlotKeys();
    if (!slotKeys.length) {
      list.innerHTML = '<p class="admin-loading">No workout days yet.</p>';
      return;
    }

    list.innerHTML = slotKeys.map(function (slotKey) {
      var plan = getSessionPlanForSlot(slotKey);
      var blockRows = (Array.isArray(plan.blocks) ? plan.blocks : []).map(function (block, index) {
        return [
          '<div class="program-builder-overview-block-row">',
          '<select data-overview-slot="' + escapeAttribute(slotKey) + '" data-overview-block-index="' + index + '" data-overview-block-field="type">',
          buildSessionBlockTypeOptions(block && block.type),
          '</select>',
          '<input type="text" data-overview-slot="' + escapeAttribute(slotKey) + '" data-overview-block-index="' + index + '" data-overview-block-field="title" value="' + escapeAttribute(String(block && block.title || "")) + '" placeholder="Block title" />',
          '</div>'
        ].join("");
      }).join("");

      return [
        '<article class="program-builder-overview-card" data-overview-slot="' + escapeAttribute(slotKey) + '">',
        '<div class="program-builder-overview-card-head">',
        '<h4>' + escapeHtml(labelForSlot(slotKey)) + '</h4>',
        '<span>' + String((plan.blocks && plan.blocks.length) || 0) + ' block' + (((plan.blocks && plan.blocks.length) || 0) === 1 ? '' : 's') + '</span>',
        '</div>',
        '<div class="program-builder-overview-fields">',
        '<label class="program-builder-structure-field">',
        '<span>Session Title</span>',
        '<input type="text" data-overview-slot="' + escapeAttribute(slotKey) + '" data-overview-field="title" value="' + escapeAttribute(plan.title || "") + '" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Session Type</span>',
        '<select data-overview-slot="' + escapeAttribute(slotKey) + '" data-overview-field="session_type">',
        buildSessionTypeSelectOptions(plan.session_type),
        '</select>',
        '</label>',
        '<label class="program-builder-structure-field program-builder-structure-field-wide">',
        '<span>Coach Notes</span>',
        '<input type="text" data-overview-slot="' + escapeAttribute(slotKey) + '" data-overview-field="coach_notes" value="' + escapeAttribute(plan.coach_notes || "") + '" />',
        '</label>',
        '</div>',
        '<div class="program-builder-overview-block-list">',
        (blockRows || '<p class="admin-loading">No blocks yet.</p>'),
        '</div>',
        '</article>'
      ].join("");
    }).join("");
  }

  function openTemplateProgramOverviewPage() {
    if (!state.isTemplateBuilder) {
      return;
    }

    var returnUrl = String(window.location.href || "training-program-example.html");
    var previewWindow = window.open("", "_self");

    previewWindow.document.open();
    previewWindow.document.write(buildTemplateProgramOverviewDocument(returnUrl));
    previewWindow.document.close();
    previewWindow.focus();
  }

  function buildTemplateProgramOverviewDocument(returnUrl) {
    var slotKeys = getAllSlotKeys();
    var totalWeeks = Math.max(1, parseInt(state.structure && state.structure.weeks, 10) || 1);
    var workoutsPerWeek = Math.max(1, parseInt(state.structure && state.structure.workoutsPerWeek, 10) || 1);
    var phases = Array.isArray(state.programPhases) ? state.programPhases : [];
    var phaseCards = phases.map(function (phase) {
      return buildTemplateOverviewPhaseCard(phase, slotKeys);
    }).join('');
    var calendarData = buildTemplateOverviewCalendarData(slotKeys, totalWeeks);
    var serializedCalendarData = JSON.stringify(calendarData).replace(/</g, "\\u003c");
    var safeReturnUrl = String(returnUrl || "training-program-example.html").replace(/"/g, "&quot;");

    return [
      "</main>",
      '<script>window.__OVERVIEW_DATA__ = ' + serializedCalendarData + ';window.__RETURN_URL__ = "' + safeReturnUrl + '";<\/script>',
      "<script>",
      "(function () {",
      "  var data = window.__OVERVIEW_DATA__ || { weeks: [] };",
      "  var returnUrl = window.__RETURN_URL__ || 'training-program-example.html';",
      "  var overviewPanel = document.getElementById('overviewPanel');",
      "  var calendarPanel = document.getElementById('calendarPanel');",
      "  var saveTemplateFromOverviewBtn = document.getElementById('saveTemplateFromOverviewBtn');",
      "  var viewCalendarBtn = document.getElementById('viewCalendarBtn');",
      "  var backToOverviewBtn = document.getElementById('backToOverviewBtn');",
      "  var backToBuilderBtn = document.getElementById('backToBuilderBtn');",
      "  var calendarWeeks = document.getElementById('calendarWeeks');",
      "  var weekdays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];",
      "  var sessionTypeOptions = Array.isArray(data.sessionTypeOptions) ? data.sessionTypeOptions : [];",
      "  var defaultWeekdays = [1,3,5,2,4,6,7];",
      "  var draggedSlotKey = '';",
      "  var storageKey = data.layoutKey || 'nomadic_template_calendar_layout_draft';",
      "  var draftStoragePrefix = data.storagePrefix || 'nomadic_training_program_template_builder_draft_';",
      "  var layout = {};",
      "  try { layout = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch (e) { layout = {}; }",
      "  function saveLayout() { try { localStorage.setItem(storageKey, JSON.stringify(layout)); } catch (e) {} }",
      "  function getAssignedDay(slotKey, index) {",
      "    var raw = parseInt(layout[slotKey], 10);",
      "    if (raw >= 1 && raw <= 7) { return raw; }",
      "    return defaultWeekdays[index % defaultWeekdays.length];",
      "  }",
      "  function persistWorkoutPlanMeta(slotKey, nextTitle, nextSessionType) {",
      "    if (!slotKey) { return; }",
      "    try {",
      "      var draftKey = draftStoragePrefix + slotKey;",
      "      var raw = localStorage.getItem(draftKey);",
      "      var parsed = raw ? JSON.parse(raw) : {};",
      "      parsed = parsed && typeof parsed === 'object' ? parsed : {};",
      "      parsed.session_plan = parsed.session_plan && typeof parsed.session_plan === 'object' ? parsed.session_plan : {};",
      "      parsed.session_plan.title = String(nextTitle || '').trim();",
      "      if (nextSessionType) { parsed.session_plan.session_type = String(nextSessionType || '').trim(); }",
      "      parsed.saved_at = new Date().toISOString();",
      "      localStorage.setItem(draftKey, JSON.stringify(parsed));",
      "    } catch (e) {}",
      "  }",
      "  function renderCalendar() {",
      "    if (!calendarWeeks) { return; }",
      "    var weekCards = (Array.isArray(data.weeks) ? data.weeks : []).map(function (week) {",
      "      var controls = (Array.isArray(week.workouts) ? week.workouts : []).map(function (workout, idx) {",
      "        var currentDay = getAssignedDay(workout.slotKey, idx);",
      "        var options = weekdays.map(function (label, i) {",
      "          var dayNum = i + 1;",
      "          var selected = dayNum === currentDay ? ' selected' : '';",
      "          return '<option value=\"' + String(dayNum) + '\"' + selected + '>' + label + '</option>';",
      "        }).join('');",
      "        return '<div class=\"calendar-control-row\"><label>' + workout.label + '</label><select data-slot-key=\"' + workout.slotKey + '\">' + options + '</select></div>';",
      "      }).join('');",
      "      var byDay = {};",
      "      weekdays.forEach(function (_, i) { byDay[i + 1] = []; });",
      "      (Array.isArray(week.workouts) ? week.workouts : []).forEach(function (workout, idx) {",
      "        var assigned = getAssignedDay(workout.slotKey, idx);",
      "        byDay[assigned].push(workout);",
      "      });",
      "      var cells = weekdays.map(function (label, i) {",
      "        var dayNum = i + 1;",
      "        var workouts = byDay[dayNum] || [];",
      "        var items = workouts.length ? workouts.map(function (w) { return '<div class=\"calendar-workout\" draggable=\"true\" data-slot-key=\"' + w.slotKey + '\"><div>' + w.title + '</div><div class=\"calendar-workout-meta\">' + (w.sessionTypeLabel || '') + '</div></div>'; }).join('') : '<div class=\"calendar-empty\">No workout</div>';",
      "        return '<article class=\"calendar-day\" data-day-num=\"' + String(dayNum) + '\"><h4>' + label + '</h4>' + items + '</article>';",
      "      }).join('');",
      "      return '<section class=\"calendar-week-card\"><h3>Week ' + String(week.week) + '</h3><p class=\"calendar-meta\">' + String((week.workouts || []).length) + ' planned workout' + (((week.workouts || []).length === 1) ? '' : 's') + '</p><div class=\"calendar-controls\">' + (controls || '<p class=\"calendar-empty\">No workouts in this week.</p>') + '</div><div class=\"calendar-week-grid\">' + cells + '</div></section>';",
      "    }).join('');",
      "    calendarWeeks.innerHTML = weekCards || '<p class=\"calendar-empty\">No weeks available.</p>';",
      "    var selects = calendarWeeks.querySelectorAll('select[data-slot-key]');",
      "    selects.forEach(function (selectEl) {",
      "      selectEl.addEventListener('change', function () {",
      "        var slotKey = String(selectEl.getAttribute('data-slot-key') || '');",
      "        var dayNum = parseInt(selectEl.value, 10);",
      "        if (!slotKey || !(dayNum >= 1 && dayNum <= 7)) { return; }",
      "        layout[slotKey] = dayNum;",
      "        saveLayout();",
      "        renderCalendar();",
      "      });",
      "    });",
      "    var workoutCards = calendarWeeks.querySelectorAll('.calendar-workout[data-slot-key]');",
      "    var dayCells = calendarWeeks.querySelectorAll('.calendar-day[data-day-num]');",
      "    workoutCards.forEach(function (card) {",
      "      card.addEventListener('dragstart', function () {",
      "        draggedSlotKey = String(card.getAttribute('data-slot-key') || '');",
      "        card.classList.add('is-dragging');",
      "      });",
      "      card.addEventListener('dragend', function () {",
      "        draggedSlotKey = '';",
      "        card.classList.remove('is-dragging');",
      "        dayCells.forEach(function (cell) { cell.classList.remove('is-drop-target'); });",
      "      });",
      "      card.addEventListener('dblclick', function () {",
      "        var slotKey = String(card.getAttribute('data-slot-key') || '');",
      "        var currentWorkout = null;",
      "        (Array.isArray(data.weeks) ? data.weeks : []).forEach(function (week) {",
      "          (Array.isArray(week.workouts) ? week.workouts : []).forEach(function (workout) {",
      "            if (String(workout.slotKey || '') === slotKey) { currentWorkout = workout; }",
      "          });",
      "        });",
      "        var currentTitle = currentWorkout && currentWorkout.title ? currentWorkout.title : '';",
      "        var currentSessionType = currentWorkout && currentWorkout.sessionType ? currentWorkout.sessionType : '';",
      "        var nextTitle = window.prompt('Edit workout title:', currentTitle);",
      "        if (nextTitle == null) { return; }",
      "        var typeHelp = sessionTypeOptions.map(function (opt) { return opt.value + ' (' + opt.label + ')'; }).join(', ');",
      "        var nextSessionType = window.prompt('Edit session type value (' + typeHelp + '):', currentSessionType);",
      "        if (nextSessionType == null) { return; }",
      "        nextTitle = String(nextTitle || '').trim() || currentTitle;",
      "        nextSessionType = String(nextSessionType || '').trim() || currentSessionType;",
      "        (Array.isArray(data.weeks) ? data.weeks : []).forEach(function (week) {",
      "          (Array.isArray(week.workouts) ? week.workouts : []).forEach(function (workout) {",
      "            if (String(workout.slotKey || '') === slotKey) {",
      "              workout.title = nextTitle;",
      "              workout.sessionType = nextSessionType;",
      "              var match = sessionTypeOptions.find(function (opt) { return opt.value === nextSessionType; });",
      "              workout.sessionTypeLabel = match ? match.label : nextSessionType;",
      "            }",
      "          });",
      "        });",
      "        persistWorkoutPlanMeta(slotKey, nextTitle, nextSessionType);",
      "        renderCalendar();",
      "      });",
      "    });",
      "    dayCells.forEach(function (cell) {",
      "      cell.addEventListener('dragover', function (event) { event.preventDefault(); cell.classList.add('is-drop-target'); });",
      "      cell.addEventListener('dragleave', function () { cell.classList.remove('is-drop-target'); });",
      "      cell.addEventListener('drop', function (event) {",
      "        event.preventDefault();",
      "        cell.classList.remove('is-drop-target');",
      "        var dayNum = parseInt(String(cell.getAttribute('data-day-num') || ''), 10);",
      "        if (!draggedSlotKey || !(dayNum >= 1 && dayNum <= 7)) { return; }",
      "        layout[draggedSlotKey] = dayNum;",
      "        saveLayout();",
      "        renderCalendar();",
      "      });",
      "    });",
      "  }",
      "  if (viewCalendarBtn) {",
      "    viewCalendarBtn.addEventListener('click', function () {",
      "      if (overviewPanel) { overviewPanel.hidden = true; }",
      "      if (calendarPanel) { calendarPanel.hidden = false; }",
      "      viewCalendarBtn.hidden = true;",
      "      if (backToOverviewBtn) { backToOverviewBtn.hidden = false; }",
      "      renderCalendar();",
      "    });",
      "  }",
      "  if (backToOverviewBtn) {",
      "    backToOverviewBtn.addEventListener('click', function () {",
      "      if (overviewPanel) { overviewPanel.hidden = false; }",
      "      if (calendarPanel) { calendarPanel.hidden = true; }",
      "      backToOverviewBtn.hidden = true;",
      "      if (viewCalendarBtn) { viewCalendarBtn.hidden = false; }",
      "    });",
      "  }",
      "  if (backToBuilderBtn) {",
      "    backToBuilderBtn.addEventListener('click', function () {",
      "      window.location.href = returnUrl;",
      "    });",
      "  }",
      "  if (saveTemplateFromOverviewBtn) {",
      "    saveTemplateFromOverviewBtn.addEventListener('click', function () {",
      "      var nextUrl = new URL(returnUrl, window.location.origin);",
      "      nextUrl.searchParams.set('autosaveTemplate', '1');",
      "      nextUrl.searchParams.set('redirectToLibrary', '1');",
      "      window.location.href = nextUrl.toString();",
      "    });",
      "  }",
      "})();",
      "<\/script>",
      "</body>",
      "</html>"
    ].join("\n");
  }

  function buildTemplateOverviewCalendarData(slotKeys, totalWeeks) {
    var weeks = [];
    for (var week = 1; week <= totalWeeks; week++) {
      weeks.push({ week: week, workouts: [] });
    }

    slotKeys.forEach(function (slotKey) {
      var parsed = parseSlotKey(slotKey);
      if (!parsed || parsed.week < 1 || parsed.week > totalWeeks) {
        return;
      }
      var plan = getSessionPlanForSlot(slotKey);
      weeks[parsed.week - 1].workouts.push({
        slotKey: slotKey,
        label: labelForSlot(slotKey),
        title: String(plan && plan.title || labelForSlot(slotKey)).trim() || labelForSlot(slotKey),
        sessionType: normalizeWeeklySessionType(plan && plan.session_type),
        sessionTypeLabel: prettySessionTypeLabel(plan && plan.session_type)
      });
    });

    weeks.forEach(function (week) {
      week.workouts.sort(function (a, b) {
        var aParsed = parseSlotKey(a.slotKey) || { workout: 0 };
        var bParsed = parseSlotKey(b.slotKey) || { workout: 0 };
        return aParsed.workout - bParsed.workout;
      });
    });

    return {
      weeks: weeks,
      layoutKey: getTemplateCalendarLayoutKey(),
      storagePrefix: TEMPLATE_DRAFT_PREFIX,
      sessionTypeOptions: WEEKLY_SESSION_TYPE_OPTIONS
    };
  }

  function buildTemplateOverviewPhaseCard(phase, slotKeys) {
    var name = String(phase && phase.name || "Phase").trim() || "Phase";
    var startWeek = clampNumber(parseInt(phase && phase.start_week, 10), 1, state.structure && state.structure.weeks || 1, 1);
    var endWeek = clampNumber(parseInt(phase && phase.end_week, 10), startWeek, state.structure && state.structure.weeks || startWeek, startWeek);
    var trainingDays = clampNumber(parseInt(phase && phase.training_days_per_week, 10), 1, 14, state.structure && state.structure.workoutsPerWeek || 1);
    var phaseSlots = slotKeys.filter(function (slotKey) {
      var parsed = parseSlotKey(slotKey);
      if (!parsed) {
        return false;
      }
      return parsed.week >= startWeek && parsed.week <= endWeek;
    });

    var sessionTypeCounts = {};
    var blockTypeCounts = {};

    phaseSlots.forEach(function (slotKey) {
      var plan = getSessionPlanForSlot(slotKey);
      var sessionType = normalizeWeeklySessionType(plan && plan.session_type);
      sessionTypeCounts[sessionType] = (sessionTypeCounts[sessionType] || 0) + 1;

      (Array.isArray(plan && plan.blocks) ? plan.blocks : []).forEach(function (block) {
        var blockType = normalizeSessionBlockType(block && block.type);
        blockTypeCounts[blockType] = (blockTypeCounts[blockType] || 0) + 1;
      });
    });

    var sessionChips = Object.keys(sessionTypeCounts).sort().map(function (key) {
      return '<span class="overview-chip">' + escapeHtml(prettySessionTypeLabel(key)) + ': ' + String(sessionTypeCounts[key]) + '</span>';
    }).join('');

    var blockChips = Object.keys(blockTypeCounts).sort().map(function (key) {
      return '<span class="overview-chip">' + escapeHtml(prettySessionBlockLabel(key)) + ': ' + String(blockTypeCounts[key]) + '</span>';
    }).join('');

    return [
      '<article class="overview-phase-card">',
      '<h3>' + escapeHtml(name) + '</h3>',
      '<p class="overview-phase-meta">Weeks ' + String(startWeek) + '-' + String(endWeek) + ' • ' + String(trainingDays) + ' training day' + (trainingDays === 1 ? '' : 's') + ' / week</p>',
      '<div>',
      '<p class="overview-section-title">Session Types In This Phase</p>',
      '<div class="overview-chip-row">' + (sessionChips || '<span class="overview-chip">No session types yet</span>') + '</div>',
      '</div>',
      '<div>',
      '<p class="overview-section-title">Block Type Distribution</p>',
      '<div class="overview-chip-row">' + (blockChips || '<span class="overview-chip">No blocks yet</span>') + '</div>',
      '</div>',
      '</article>'
    ].join('');
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

    if (shouldUsePhaseDailyNavigator()) {
      ensureDailyNavigatorState();
      var phase = getSelectedDailyNavigatorPhase();
      var phaseName = phase && phase.name ? String(phase.name) : "Phase";
      if (state.dailyProgrammingViewMode === "day") {
        dayInfo.textContent = "Day View • " + phaseName + " • Editing " + String(labelForSlot(state.day) || state.day) + ".";
      } else if (state.dailyProgrammingViewMode === "week") {
        dayInfo.textContent = "Week View • " + phaseName + " • Week " + String(state.dailyProgrammingWeekInPhase) + " • Editing day variations within this week.";
      } else {
        dayInfo.textContent = "Phase View • " + phaseName + " • Day " + String(state.dailyProgrammingDayInPhase) + " • Editing progression across phase weeks.";
      }
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
    var librarySelect = document.querySelector("[data-exercise-library-select]");
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

    if (librarySelect) {
      librarySelect.addEventListener("change", function () {
        var libraryId = String(librarySelect.value || "").trim();
        if (!libraryId) {
          return;
        }
        applyExerciseLibrarySelection(libraryId);
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
    var librarySelect = document.querySelector("[data-exercise-library-select]");

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
    if (librarySelect) {
      librarySelect.value = "";
    }
    renderExerciseLibrarySelectOptions("");
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
      renderExerciseLibrarySelectOptions(String(exercise.library_id || ""));
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
          reps: libraryItem && libraryItem.default_rep_value ? String(libraryItem.default_rep_value) : "",
          weight: libraryItem && libraryItem.default_secondary_value ? String(libraryItem.default_secondary_value) : "",
          rpe: libraryItem && libraryItem.default_intensity_value ? String(libraryItem.default_intensity_value) : "",
          rest: libraryItem && libraryItem.default_rest_value ? String(libraryItem.default_rest_value) : "",
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
      ensureSeedExerciseLibrary();
      renderExerciseLibrarySelectOptions("");
      return;
    }

    state.client
      .from(EXERCISE_LIBRARY_TABLE)
      .select("id,name,movement_pattern,equipment,primary_muscle,training_goal,sport_tags,custom_tags,description,coaching_cues,video_demo_url,default_section,default_mode,default_set_count,default_rep_value,default_secondary_value,default_intensity_value,default_rest_value,default_show_weight,default_show_rpe,default_show_rest,updated_at")
      .order("name", { ascending: true })
      .then(function (result) {
        if (result.error) {
          state.exerciseLibrary = readExerciseLibraryFromStorage();
          ensureSeedExerciseLibrary();
          renderExerciseLibrarySelectOptions("");
          return;
        }

        state.exerciseLibrary = (result.data || []).map(normalizeExerciseLibraryItem);
        if (!state.exerciseLibrary.length) {
          state.exerciseLibrary = readExerciseLibraryFromStorage();
        }
        ensureSeedExerciseLibrary();
        renderExerciseLibrarySelectOptions("");
      })
      .catch(function () {
        state.exerciseLibrary = readExerciseLibraryFromStorage();
        ensureSeedExerciseLibrary();
        renderExerciseLibrarySelectOptions("");
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
      video_demo_url: item && item.video_demo_url ? String(item.video_demo_url) : "",
      default_section: item && item.default_section ? String(item.default_section) : "A Block",
      default_mode: item && item.default_mode ? String(item.default_mode) : "reps",
      default_set_count: item && item.default_set_count != null ? clampNumber(parseInt(item.default_set_count, 10), 1, 10, 3) : 3,
      default_rep_value: item && item.default_rep_value ? String(item.default_rep_value) : "",
      default_secondary_value: item && item.default_secondary_value ? String(item.default_secondary_value) : "",
      default_intensity_value: item && item.default_intensity_value ? String(item.default_intensity_value) : "",
      default_rest_value: item && item.default_rest_value ? String(item.default_rest_value) : "",
      default_show_weight: item && item.default_show_weight != null ? !!item.default_show_weight : true,
      default_show_rpe: item && item.default_show_rpe != null ? !!item.default_show_rpe : true,
      default_show_rest: item && item.default_show_rest != null ? !!item.default_show_rest : false
    };
  }

  function writeExerciseLibraryToStorage(items) {
    try {
      window.localStorage.setItem(EXERCISE_LIBRARY_KEY, JSON.stringify(Array.isArray(items) ? items : []));
    } catch (e) {
      // Ignore storage write errors.
    }
  }

  function ensureSeedExerciseLibrary() {
    if (Array.isArray(state.exerciseLibrary) && state.exerciseLibrary.length) {
      return;
    }
    state.exerciseLibrary = EXERCISE_LIBRARY_SEED.map(normalizeExerciseLibraryItem);
    writeExerciseLibraryToStorage(state.exerciseLibrary);
  }

  function renderExerciseLibrarySelectOptions(selectedId) {
    var select = document.querySelector("[data-exercise-library-select]");
    if (!select) {
      return;
    }

    var selected = String(selectedId || "").trim();
    var options = ['<option value="">Choose from exercise library...</option>'];
    (Array.isArray(state.exerciseLibrary) ? state.exerciseLibrary : []).forEach(function (item) {
      var id = String(item && item.id || "").trim();
      var name = String(item && item.name || "").trim();
      if (!id || !name) {
        return;
      }
      options.push('<option value="' + escapeAttribute(id) + '"' + (selected === id ? ' selected' : '') + '>' + escapeHtml(name) + '</option>');
    });

    select.innerHTML = options.join("");
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
    var sectionSelect = document.querySelector("[data-exercise-section-select]");
    var modeSelect = document.querySelector("[data-exercise-mode-select]");
    var setsInput = document.querySelector("[data-exercise-sets-input]");
    var weightToggle = document.querySelector("[data-exercise-toggle-weight]");
    var rpeToggle = document.querySelector("[data-exercise-toggle-rpe]");
    var restToggle = document.querySelector("[data-exercise-toggle-rest]");
    var librarySelect = document.querySelector("[data-exercise-library-select]");
    var notesInput = document.querySelector("[data-exercise-notes-input]");
    var libraryIdInput = document.querySelector("[data-exercise-library-id]");

    if (!item || !nameInput) {
      return;
    }

    nameInput.value = item.name || "";
    if (libraryIdInput) {
      libraryIdInput.value = item.id || "";
    }
    if (librarySelect) {
      librarySelect.value = item.id || "";
    }

    if (sectionSelect && item.default_section) {
      sectionSelect.value = item.default_section;
    }
    if (modeSelect && item.default_mode) {
      modeSelect.value = item.default_mode;
    }
    if (setsInput && item.default_set_count) {
      setsInput.value = String(item.default_set_count);
    }
    if (weightToggle && item.default_show_weight != null) {
      weightToggle.checked = !!item.default_show_weight;
    }
    if (rpeToggle && item.default_show_rpe != null) {
      rpeToggle.checked = !!item.default_show_rpe;
    }
    if (restToggle && item.default_show_rest != null) {
      restToggle.checked = !!item.default_show_rest;
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
    state.programMeta = normalizeProgramMeta(state.programMeta, state.structure);
    state.programPhases = normalizeProgramPhases(state.programPhases, state.structure.weeks, state.programMeta.program_type);
    state.weeklyStructure = normalizeWeeklyStructure(state.weeklyStructure, state.structure.workoutsPerWeek, state.templateFocus, state.programMeta.program_type);
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
    refreshBuilderPlannerUi();
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
    if (state.isTemplateBuilder || state.isCoachAssignedProgramEdit) {
      if (stored && stored.session_plan) {
        state.sessionPlans[state.day] = normalizeSessionPlan(stored.session_plan, state.day);
      } else if (!state.sessionPlans[state.day]) {
        state.sessionPlans[state.day] = buildDefaultSessionPlan(state.day);
      }
    }

    var assignedExercises = null;
    if (stored && stored.session_plan && (state.isAthleteLockedView || state.isCoachAssignedProgramEdit)) {
      assignedExercises = convertSessionPlanToExercises(normalizeSessionPlan(stored.session_plan, state.day));
    } else {
      assignedExercises = state.assignedTemplateDays && Array.isArray(state.assignedTemplateDays[state.day])
        ? cloneExercises(state.assignedTemplateDays[state.day])
        : null;
    }

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

    if (state.isTemplateBuilder || state.isCoachAssignedProgramEdit) {
      var currentPlan = getCurrentSessionPlan();
      state.exercises = convertSessionPlanToExercises(currentPlan);
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
    var slotSessionPlan = null;
    if (state.isTemplateBuilder || state.isCoachAssignedProgramEdit) {
      slotSessionPlan = getCurrentSessionPlan();
      state.sessionPlans[state.day] = slotSessionPlan;
      state.exercises = convertSessionPlanToExercises(slotSessionPlan);
    }

    if (state.isTemplateBuilder) {
      syncTemplateTargetsFromPlannerValues(state.exercises);
    }

    state.exercises = normalizeExercisesArray(state.exercises);
    var existingStored = readWorkoutLogForDay() || {};
    var payload = {
      exercises: state.isCoachAssignedProgramEdit
        ? (Array.isArray(existingStored.exercises) ? existingStored.exercises : [])
        : state.exercises,
      session_plan: slotSessionPlan,
      saved_at: new Date().toISOString()
    };

    writeToStorage(storageKeyForDay(), payload);
    if (!silent) {
      setStatus(state.isTemplateBuilder ? "Draft day saved." : state.isCoachAssignedProgramEdit ? "Program day saved." : "✓ Workout log saved successfully.", "success");
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
        setStatus("Template saved.", "success");

        if (shouldRedirectToLibraryAfterSave()) {
          window.location.href = "coach-training-programs.html";
          return;
        }

        if (state.templateId) {
          try {
            var nextParams = new URLSearchParams(window.location.search || "");
            nextParams.set("builder", "1");
            nextParams.set("templateId", state.templateId);
            nextParams.delete("autosaveTemplate");
            nextParams.delete("redirectToLibrary");
            var nextUrl = window.location.pathname + "?" + nextParams.toString();
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
      program_meta: normalizeProgramMeta(state.programMeta, state.structure),
      program_phases: normalizeProgramPhases(state.programPhases, state.structure.weeks, state.programMeta && state.programMeta.program_type),
      weekly_structure: normalizeWeeklyStructure(state.weeklyStructure, state.structure.workoutsPerWeek, state.templateFocus, state.programMeta && state.programMeta.program_type),
      day_session_types: state.daySessionTypes || {},
      custom_day_names: state.customDayNames || {},
      custom_day_name_mode: state.customDayNameMode,
      structure: state.structure,
      session_plans: {},
      days: {}
    };

    getAllSlotKeys().forEach(function (slotKey) {
      var slotPayload = readFromStorage(state.storagePrefix + slotKey) || {};
      var slotPlan = slotPayload.session_plan || state.sessionPlans[slotKey] || buildDefaultSessionPlan(slotKey);
      payload.session_plans[slotKey] = normalizeSessionPlan(slotPlan, slotKey);
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
      return {
        templateId: state.templateId,
        templateName: saveData.templateName,
        isEditingExistingTemplate: isEditingExistingTemplate
      };
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
        var layoutMap = readTemplateCalendarLayout();
        var scheduledDatesBySlot = generateScheduledDatesFromBlueprint(startDate, blueprint, layoutMap);
        if (!scheduledDatesBySlot || !Object.keys(scheduledDatesBySlot).length) {
          throw new Error("Could not generate scheduled dates.");
        }

        var rows = blueprint.map(function (slot, index) {
          return {
            user_training_program_id: result.assignment.id,
            scheduled_for: scheduledDatesBySlot[slot.slotKey] || scheduledDatesBySlot[slot.slotKey.toLowerCase()] || formatDateInputValue(new Date()),
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

  function getTemplateCalendarLayoutKey() {
    return "nomadic_template_calendar_layout_" + String(state.templateId || state.templateName || "draft");
  }

  function readTemplateCalendarLayout() {
    try {
      var raw = window.localStorage.getItem(getTemplateCalendarLayoutKey());
      if (!raw) {
        return {};
      }
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function defaultWeekdayForWorkout(workoutIndex) {
    var idx = clampNumber(parseInt(workoutIndex, 10), 1, 14, 1);
    var defaults = [1, 3, 5, 2, 4, 6, 7, 1, 2, 3, 4, 5, 6, 7];
    return defaults[idx - 1] || 1;
  }

  function generateScheduledDatesFromBlueprint(startDate, blueprint, layoutMap) {
    var slots = Array.isArray(blueprint) ? blueprint : [];
    if (!slots.length) {
      return {};
    }

    var parts = String(startDate || "").split("-");
    if (parts.length !== 3) {
      return {};
    }

    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var day = parseInt(parts[2], 10);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
      return {};
    }

    var anchor = new Date(year, month - 1, day);
    if (isNaN(anchor.getTime())) {
      return {};
    }

    var assignments = {};
    slots.forEach(function (slot) {
      var slotKey = String(slot && slot.slotKey || "").trim();
      var parsed = parseSlotKey(slotKey);
      if (!parsed) {
        return;
      }

      var weekdayRaw = parseInt(String(layoutMap && layoutMap[slotKey] != null ? layoutMap[slotKey] : layoutMap && layoutMap[slotKey.toLowerCase()]), 10);
      var weekday = weekdayRaw >= 1 && weekdayRaw <= 7 ? weekdayRaw : defaultWeekdayForWorkout(parsed.workout);
      var scheduledDate = new Date(anchor.getTime());
      scheduledDate.setDate(scheduledDate.getDate() + ((parsed.week - 1) * 7) + (weekday - 1));
      assignments[slotKey] = formatDateInputValue(scheduledDate);
    });

    return assignments;
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

  function isIsoDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
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
        loadTemplatePayloadIntoBuilder(row.name || "", payload);
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to load template.", "error");
      });
  }

  function hydrateDraftFromPreset(presetKey) {
    var preset = getBuiltInTemplatePreset(presetKey);
    if (!preset || !preset.payload) {
      setStatus("Built-in template preset not found.", "error");
      return;
    }

    loadTemplatePayloadIntoBuilder(preset.name || "Starter Template", preset.payload);
    setStatus("Loaded built-in template starter.", "success");
  }

  function loadTemplatePayloadIntoBuilder(templateName, payload) {
    state.structure = normalizeStructure(payload.structure || deriveStructureFromDays(payload.days));
    state.templateFocus = normalizeTemplateFocus(payload.focus);
    state.programMeta = normalizeProgramMeta(payload.program_meta, state.structure);
    state.programPhases = normalizeProgramPhases(payload.program_phases, state.structure.weeks, state.programMeta.program_type);
    state.weeklyStructure = normalizeWeeklyStructure(payload.weekly_structure, state.structure.workoutsPerWeek, state.templateFocus, state.programMeta.program_type);
    state.sessionPlans = normalizeSessionPlans(payload.session_plans);
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

    state.templateName = templateName || "";
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

    refreshBuilderPlannerUi();
    setProgramTitleFromQuery();

    getAllSlotKeys().forEach(function (slotKey) {
      var exercises = normalizedDays[slotKey] || convertSessionPlanToExercises(state.sessionPlans[slotKey] || buildDefaultSessionPlan(slotKey));
      writeToStorage(TEMPLATE_DRAFT_PREFIX + slotKey, {
        session_plan: state.sessionPlans[slotKey] || buildDefaultSessionPlan(slotKey),
        exercises: Array.isArray(exercises) ? exercises : [],
        saved_at: new Date().toISOString()
      });
    });

    loadExercisesForDay();
    renderRows();
    updateDayInfo();
    refreshTemplateDayTools();
    maybeRunPendingTemplateAutoSave();
  }

  function getBuiltInTemplatePreset(presetKey) {
    var key = String(presetKey || "").trim().toLowerCase();
    if (key === "climbing-12-week") {
      return {
        key: key,
        name: "12-Week Climbing Performance Build",
        payload: buildClimbing12WeekTemplatePayload()
      };
    }
    return null;
  }

  function buildClimbing12WeekTemplatePayload() {
    var structure = { weeks: 12, workoutsPerWeek: 4 };
    var programMeta = normalizeProgramMeta({
      program_type: "individualized",
      sport_focus: "Climbing",
      athlete_level: "intermediate",
      primary_goal: "Improve finger strength, pulling power, and power endurance for climbing.",
      secondary_goal: "Maintain shoulder resilience and aerobic support.",
      training_days_per_week: 4,
      strength_days_per_week: 2,
      endurance_days_per_week: 1,
      mobility_days_per_week: 1,
      deload_frequency: "every_4",
      tags: ["climbing", "hangboarding", "power-endurance", "pull-strength"],
      season_objectives: [
        {
          label: "Climbing Peak",
          sport_focus: "Performance phase",
          primary_goal: "Peak finger strength and route power-endurance by weeks 10-12.",
          secondary_goal: "Maintain tissue health.",
          phase_start_week: 10,
          phase_end_week: 12,
          priority: "primary",
          notes: "Final 3-week peak block."
        }
      ]
    }, structure);

    var programPhases = normalizeProgramPhases([
      { name: "Foundation", start_week: 1, end_week: 3, focus: "Movement quality, shoulder integrity, and base finger loading.", training_days_per_week: 4, strength_days_per_week: 2, cardio_days_per_week: 1, skill_days_per_week: 1, multi_focus_days_per_week: 0, endurance_days_per_week: 1, mobility_days_per_week: 1 },
      { name: "Finger Strength Build", start_week: 4, end_week: 6, focus: "Progressive hangboarding and heavier pulling strength.", training_days_per_week: 4, strength_days_per_week: 2, cardio_days_per_week: 1, skill_days_per_week: 1, multi_focus_days_per_week: 0, endurance_days_per_week: 1, mobility_days_per_week: 1 },
      { name: "Power Endurance", start_week: 7, end_week: 9, focus: "Convert strength to repeated hard climbing efforts.", training_days_per_week: 4, strength_days_per_week: 1, cardio_days_per_week: 1, skill_days_per_week: 1, multi_focus_days_per_week: 1, endurance_days_per_week: 1, mobility_days_per_week: 1 },
      { name: "Peak + Taper", start_week: 10, end_week: 12, focus: "Maintain strength, sharpen power, and reduce fatigue.", training_days_per_week: 4, strength_days_per_week: 1, cardio_days_per_week: 1, skill_days_per_week: 1, multi_focus_days_per_week: 1, endurance_days_per_week: 1, mobility_days_per_week: 1 }
    ], structure.weeks, programMeta.program_type);

    var weeklyStructure = normalizeWeeklyStructure([
      { workout: 1, name: "Finger Strength + Lower Body", session_type: "strength_full", note: "Primary max-strength and finger loading day." },
      { workout: 2, name: "Aerobic Recovery + Mobility", session_type: "zone2", note: "Easy recovery support and mobility." },
      { workout: 3, name: "Upper Pull Power", session_type: "strength_upper", note: "Explosive pulling and antagonist support." },
      { workout: 4, name: "Climbing Capacity", session_type: "threshold", note: "Intervals, EMOM, or AMRAP depending on the phase." }
    ], structure.workoutsPerWeek, "hybrid", programMeta.program_type);

    var sessionPlans = {};
    var daySessionTypes = {};
    var customDayNames = {};

    for (var week = 1; week <= 12; week++) {
      var phaseKey = week <= 3 ? "foundation" : week <= 6 ? "strength" : week <= 9 ? "capacity" : "peak";
      var wk = "w" + week;
      sessionPlans[wk + "d1"] = buildClimbingPresetDayOne(week, phaseKey);
      sessionPlans[wk + "d2"] = buildClimbingPresetDayTwo(week, phaseKey);
      sessionPlans[wk + "d3"] = buildClimbingPresetDayThree(week, phaseKey);
      sessionPlans[wk + "d4"] = buildClimbingPresetDayFour(week, phaseKey);
      daySessionTypes[wk + "d1"] = "strength_full";
      daySessionTypes[wk + "d2"] = phaseKey === "peak" ? "mobility" : "zone2";
      daySessionTypes[wk + "d3"] = "strength_upper";
      daySessionTypes[wk + "d4"] = phaseKey === "peak" && week === 12 ? "assessment" : "threshold";
      customDayNames[wk + "d1"] = "Finger Strength + Lower Body";
      customDayNames[wk + "d2"] = "Aerobic Recovery + Mobility";
      customDayNames[wk + "d3"] = "Upper Pull Power";
      customDayNames[wk + "d4"] = "Climbing Capacity";
    }

    return {
      archived: false,
      focus: "hybrid",
      program_meta: programMeta,
      program_phases: programPhases,
      weekly_structure: weeklyStructure,
      day_session_types: daySessionTypes,
      custom_day_names: customDayNames,
      custom_day_name_mode: "full-label",
      structure: structure,
      session_plans: sessionPlans,
      days: buildTemplateDaysFromSessionPlans(sessionPlans)
    };
  }

  function buildTemplateDaysFromSessionPlans(sessionPlans) {
    var plans = sessionPlans && typeof sessionPlans === "object" ? sessionPlans : {};
    var days = {};
    Object.keys(plans).forEach(function (slotKey) {
      days[slotKey] = convertSessionPlanToExercises(normalizeSessionPlan(plans[slotKey], slotKey));
    });
    return days;
  }

  function buildClimbingPresetExerciseBlock(type, title, flow, restInterval, exercises, options) {
    var list = Array.isArray(exercises) ? exercises : [];
    var config = options && typeof options === "object" ? options : {};
    return {
      type: type,
      title: title,
      exercise_flow: flow || "straight",
      exercise_rest_strategy: config.restStrategy || "between_exercises",
      exercise_rest_interval: restInterval || "",
      notes: config.notes || "",
      exercise_count: list.length,
      exercise_names: list.map(function (exercise) { return exercise.name; }),
      exercise_sets: list.map(function (exercise) { return String((exercise.reps || []).length || 1); }),
      exercise_intensity_types: list.map(function (exercise) { return exercise.defaultIntensityType || "rpe"; }),
      exercise_set_reps: list.map(function (exercise) { return (exercise.reps || [""]).slice(); }),
      exercise_set_intensities: list.map(function (exercise) { return (exercise.intensities || [""]).slice(); }),
      exercise_set_rests: list.map(function (exercise) { return (exercise.rests || [""]).slice(); }),
      exercise_set_rep_types: list.map(function (exercise) { return (exercise.reps || [""]).map(function () { return exercise.repType || "reps"; }); }),
      exercise_set_intensity_types: list.map(function (exercise) { return (exercise.reps || [""]).map(function () { return exercise.defaultIntensityType || "rpe"; }); })
    };
  }

  function buildClimbingPresetDayOne(week, phaseKey) {
    var hangboard = phaseKey === "foundation"
      ? { protocol: "Repeaters", grip: "20mm edge, half crimp", rounds: 6, hang: 7, rest: 53, effort: "RPE 7" }
      : phaseKey === "strength"
        ? { protocol: "Max Hangs", grip: "18-20mm edge", rounds: 6, hang: 10, rest: 110, effort: "RPE 8-9" }
        : phaseKey === "capacity"
          ? { protocol: "Density Hangs", grip: "20mm edge", rounds: 8, hang: 10, rest: 50, effort: "RPE 8" }
          : { protocol: "Taper Hangs", grip: "20mm edge", rounds: 4, hang: 8, rest: 70, effort: "RPE 6-7" };
    return normalizeSessionPlan({
      title: "Finger Strength + Lower Body",
      session_type: "strength_full",
      session_goal: phaseKey === "peak" ? "Maintain finger recruitment and full-body strength with low fatigue." : "Build foundational full-body strength and finger force for climbing.",
      coach_notes: "Stop finger work early if skin, elbows, or pulleys feel off.",
      blocks: [
        { type: "warmup", title: "Warm-Up", duration_minutes: 12, target_intensity: "Scap, hips, wrists, and finger prep" },
        buildClimbingPresetExerciseBlock("main_strength", "Lower + Pull Strength", "straight", "120s", [
          { name: "Front Squat", reps: phaseKey === "peak" ? ["3", "3", "3"] : ["5", "5", "5"], intensities: phaseKey === "strength" ? ["8", "8", "8.5"] : ["7", "7", "7.5"], rests: ["120s", "120s", "120s"], defaultIntensityType: "rpe" },
          { name: "Weighted Pull-Up", reps: phaseKey === "peak" ? ["3", "3", "3"] : ["5", "5", "5"], intensities: phaseKey === "strength" ? ["8", "8", "8.5"] : ["7", "7", "7.5"], rests: ["120s", "120s", "120s"], defaultIntensityType: "rpe" }
        ], { notes: "Primary strength pair." }),
        { type: "hangboarding", title: "Hangboarding", hang_protocol_name: hangboard.protocol, hang_grip_type: hangboard.grip, hang_rounds: hangboard.rounds, hang_hang_seconds: hangboard.hang, hang_rest_seconds: hangboard.rest, hang_effort: hangboard.effort },
        { type: "cooldown", title: "Cooldown", duration_minutes: 8, target_intensity: "Forearms, shoulders, hips" }
      ]
    }, "w" + week + "d1");
  }

  function buildClimbingPresetDayTwo(week, phaseKey) {
    return normalizeSessionPlan({
      title: "Aerobic Recovery + Mobility",
      session_type: phaseKey === "peak" ? "mobility" : "zone2",
      session_goal: "Support recovery and maintain aerobic base without adding finger fatigue.",
      coach_notes: phaseKey === "peak" ? "Keep easy and restorative." : "Stay conversational and move well.",
      blocks: phaseKey === "peak"
        ? [
            { type: "warmup", title: "Breathing Reset", duration_minutes: 6, target_intensity: "Downregulate" },
            { type: "mobility", title: "Mobility Flow", duration_minutes: 25, target_intensity: "T-spine, shoulders, hips, wrists" },
            { type: "cooldown", title: "Walk + Stretch", duration_minutes: 10, target_intensity: "Easy" }
          ]
        : [
            { type: "warmup", title: "Easy Warm-Up", duration_minutes: 8, target_intensity: "Gradual ramp" },
            { type: "zone2", title: "Zone 2 Aerobic", exercise_form: "running", duration_minutes: phaseKey === "foundation" ? 35 : phaseKey === "strength" ? 40 : 45, target_intensity: "Zone 2" },
            { type: "mobility", title: "Mobility / Recovery", duration_minutes: 15, target_intensity: "Forearms, shoulders, hips" }
          ]
    }, "w" + week + "d2");
  }

  function buildClimbingPresetDayThree(week, phaseKey) {
    return normalizeSessionPlan({
      title: "Upper Pull Power",
      session_type: "strength_upper",
      session_goal: "Develop explosive pulling power and antagonist balance for climbing.",
      coach_notes: "Keep explosive work fast and low-fatigue.",
      blocks: [
        { type: "warmup", title: "Upper Prep", duration_minutes: 10, target_intensity: "Scap, cuff, trunk" },
        buildClimbingPresetExerciseBlock("power", "Explosive Pull + Coordination", phaseKey === "capacity" ? "circuit" : "straight", phaseKey === "capacity" ? "75s" : "90s", [
          { name: "Explosive Pull-Up", reps: ["3", "3", "3"], intensities: [phaseKey === "peak" ? "RPE 7" : "RPE 8", phaseKey === "peak" ? "RPE 7" : "RPE 8", phaseKey === "peak" ? "RPE 7" : "RPE 8"], rests: ["90s", "90s", "90s"], defaultIntensityType: "custom" },
          { name: phaseKey === "capacity" ? "Box Jump" : "Medicine Ball Slam", reps: ["4", "4", "4"], intensities: ["Fast", "Fast", "Fast"], rests: ["90s", "90s", "90s"], defaultIntensityType: "custom" }
        ], { restStrategy: phaseKey === "capacity" ? "between_rounds" : "between_exercises" }),
        buildClimbingPresetExerciseBlock("secondary_strength", "Antagonist + Scap Strength", "superset", "60s", [
          { name: "Ring Push-Up", reps: ["8", "8", "8"], intensities: ["7", "7", "7"], rests: ["", "", ""], defaultIntensityType: "rpe" },
          { name: "Prone Y/T Raise", reps: ["10", "10", "10"], intensities: ["Easy", "Easy", "Easy"], rests: ["", "", ""], defaultIntensityType: "custom" }
        ], { restStrategy: "between_rounds" }),
        { type: "cooldown", title: "Cooldown", duration_minutes: 8, target_intensity: "Forearms + shoulders" }
      ]
    }, "w" + week + "d3");
  }

  function buildClimbingPresetDayFour(week, phaseKey) {
    var blocks;
    if (phaseKey === "foundation") {
      blocks = [
        { type: "warmup", title: "Warm-Up", duration_minutes: 10, target_intensity: "Progressive" },
        { type: "intervals", title: "Climbing Capacity Intervals", interval_exercise_mode: "free_text", interval_exercise_name: "Treadwall / bike / uphill treadmill", interval_rounds: 6, interval_work_time: "2:00", interval_rest_time: "2:00", interval_work_intensity_type: "rpe", interval_rest_intensity_type: "zone", interval_work_intensity: "RPE 7", interval_rest_intensity: "Zone 1-2" },
        { type: "cooldown", title: "Cooldown", duration_minutes: 8, target_intensity: "Easy" }
      ];
    } else if (phaseKey === "strength") {
      blocks = [
        { type: "warmup", title: "Warm-Up", duration_minutes: 10, target_intensity: "Prep" },
        { type: "emom", title: "Grip + Trunk EMOM", emom_exercise: "Minute 1: 20s hollow hold / Minute 2: 8 KB swings / Minute 3: 20s towel dead hang", emom_minutes: 12, emom_intensity_type: "rpe", emom_intensity: "RPE 7" },
        { type: "cooldown", title: "Cooldown", duration_minutes: 8, target_intensity: "Easy" }
      ];
    } else if (phaseKey === "capacity") {
      blocks = [
        { type: "warmup", title: "Warm-Up", duration_minutes: 10, target_intensity: "Prep" },
        { type: "amrap", title: "Power Endurance AMRAP", amrap_exercise: "6 pull-ups, 8 push-ups, 10 step-ups, 30s plank", amrap_minutes: 16, amrap_intensity_type: "rpe", amrap_intensity: "RPE 8" },
        { type: "cooldown", title: "Cooldown", duration_minutes: 8, target_intensity: "Easy" }
      ];
    } else {
      blocks = [
        { type: "warmup", title: "Warm-Up", duration_minutes: 8, target_intensity: "Prep" },
        week === 12
          ? { type: "assessment", title: "Climbing Readiness Check", prescription: "Short quality movement and performance check", notes: "Keep volume low and confidence high." }
          : { type: "intervals", title: "Sharpness Intervals", interval_exercise_mode: "free_text", interval_exercise_name: "Short route or treadwall efforts", interval_rounds: 4, interval_work_time: "90s", interval_rest_time: "2:30", interval_work_intensity_type: "rpe", interval_rest_intensity_type: "complete_rest", interval_work_intensity: "RPE 8" },
        { type: "cooldown", title: "Cooldown", duration_minutes: 8, target_intensity: "Easy" }
      ];
    }

    return normalizeSessionPlan({
      title: "Climbing Capacity",
      session_type: phaseKey === "peak" && week === 12 ? "assessment" : "threshold",
      session_goal: phaseKey === "capacity" ? "Sustain high output across repeated efforts." : "Build or sharpen energy-system support for climbing.",
      coach_notes: phaseKey === "peak" ? "Finish feeling fresh." : "Stay technical under fatigue.",
      blocks: blocks
    }, "w" + week + "d4");
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
        state.programMeta = normalizeProgramMeta(payload.program_meta, state.structure);
        state.programPhases = normalizeProgramPhases(payload.program_phases, state.structure.weeks, state.programMeta.program_type);
        state.weeklyStructure = normalizeWeeklyStructure(payload.weekly_structure, state.structure.workoutsPerWeek, state.templateFocus, state.programMeta.program_type);
        state.sessionPlans = normalizeSessionPlans(payload.session_plans);
        state.daySessionTypes = normalizeDaySessionTypes(payload.day_session_types);
        state.customDayNames = normalizeCustomDayNames(payload.custom_day_names);
        state.customDayNameMode = normalizeCustomDayNameMode(payload.custom_day_name_mode);
        ensureDaySessionTypesForStructure();
        var daySelect = document.querySelector("[data-workout-day]");
        if (daySelect) {
          refreshWorkoutDaySelect(daySelect);
          var preferredDay = getPreferredDayFromQuery();
          if (preferredDay && daySelect.querySelector('option[value="' + preferredDay + '"]')) {
            daySelect.value = preferredDay;
          } else if (state.day && daySelect.querySelector('option[value="' + state.day + '"]')) {
            daySelect.value = state.day;
          }
          state.day = daySelect.value || getAllSlotKeys()[0] || "w1d1";
        }

        if (state.isCoachAssignedProgramEdit) {
          state.dailyProgrammingViewMode = "day";
          applyDailyNavigatorSelectionFromAxisValue(state.day);
          renderDailyNavigatorControls();
        }

        state.assignedTemplateDays = normalizeAssignedTemplateDays(payload.days);
        if (!new URLSearchParams(window.location.search).get("program") && row.name) {
          state.templateName = row.name;
        }

        loadExercisesForDay();
        renderRows();
        renderDailyProgrammingDesigner();
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
      program_meta: normalizeProgramMeta(payload && payload.program_meta, payload && payload.structure),
      program_phases: normalizeProgramPhases(payload && payload.program_phases, normalizeStructure(payload && payload.structure).weeks, payload && payload.program_meta && payload.program_meta.program_type),
      weekly_structure: normalizeWeeklyStructure(payload && payload.weekly_structure, normalizeStructure(payload && payload.structure).workoutsPerWeek, payload && payload.focus, payload && payload.program_meta && payload.program_meta.program_type),
      day_session_types: normalizeDaySessionTypes(payload && payload.day_session_types),
      custom_day_names: normalizeCustomDayNames(payload && payload.custom_day_names),
      custom_day_name_mode: normalizeCustomDayNameMode(payload && payload.custom_day_name_mode),
      structure: normalizeStructure(payload && payload.structure),
      session_plans: normalizeSessionPlans(payload && payload.session_plans),
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

  function renderProgramMetaInputs() {
    var meta = normalizeProgramMeta(state.programMeta, state.structure);
    state.programMeta = meta;
    setInputValue("[data-template-program-type]", meta.program_type);
    setInputValue("[data-template-sport-focus]", meta.sport_focus);
    setInputValue("[data-template-athlete-level]", meta.athlete_level);
    setInputValue("[data-template-peak-date]", meta.peak_date);
    setInputValue("[data-template-primary-goal]", meta.primary_goal);
    setInputValue("[data-template-secondary-goal]", meta.secondary_goal);
    setInputValue("[data-template-training-days]", String(meta.training_days_per_week));
    setInputValue("[data-template-strength-days]", String(meta.strength_days_per_week));
    setInputValue("[data-template-endurance-days]", String(meta.endurance_days_per_week));
    setInputValue("[data-template-mobility-days]", String(meta.mobility_days_per_week));
    setInputValue("[data-template-deload-frequency]", meta.deload_frequency);
    setInputValue("[data-template-tags]", (meta.tags || []).join(", "));
  }

  function refreshBuilderPlannerUi() {
    try {
      renderProgramMetaInputs();
      renderSeasonObjectives();
      renderProgramPhases();
      renderWeeklyStructure();
      renderProgramBuilderAlerts();
    } catch (error) {
      console.error("Builder planner UI failed to render", error);
      setStatus("Planner tools could not fully render: " + (error && error.message ? error.message : "unknown error") + ".", "info");
    }
  }

  function renderSeasonObjectives() {
    var container = document.querySelector("[data-template-objective-list]");
    if (!container) {
      return;
    }

    var objectives = Array.isArray(state.programMeta && state.programMeta.season_objectives)
      ? state.programMeta.season_objectives
      : [];

    if (!objectives.length) {
      container.innerHTML = '<p class="admin-loading">No season objectives added yet.</p>';
      return;
    }

    container.innerHTML = objectives.map(function (objective, index) {
      return [
        '<div class="program-builder-phase-item">',
        '<div class="program-builder-phase-grid">',
        '<label class="program-builder-structure-field">',
        '<span>Peak / Event</span>',
        '<input type="text" data-template-objective-field="label" data-template-objective-index="' + index + '" value="' + escapeAttribute(objective.label || '') + '" placeholder="e.g. MTB race, climbing trip, snowboard season opener" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Sport Focus</span>',
        '<input type="text" data-template-objective-field="sport_focus" data-template-objective-index="' + index + '" value="' + escapeAttribute(objective.sport_focus || '') + '" placeholder="e.g. Ski touring" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Peak Date</span>',
        '<input type="date" data-template-objective-field="peak_date" data-template-objective-index="' + index + '" value="' + escapeAttribute(objective.peak_date || '') + '" />',
        '</label>',
        '</div>',
        '<label class="program-builder-structure-field">',
        '<span>What Is This Peak For?</span>',
        '<input type="text" data-template-objective-field="primary_goal" data-template-objective-index="' + index + '" value="' + escapeAttribute(objective.primary_goal || objective.notes || '') + '" placeholder="e.g. Spring marathon, Whistler trip, enduro race block" />',
        '</label>',
        '<div class="program-builder-phase-actions">',
        '<button type="button" class="btn admin-btn-small" data-template-objective-remove="' + index + '">Remove Objective</button>',
        '</div>',
        '</div>'
      ].join('');
    }).join('');
  }

  function renderProgramPhases() {
    var container = document.querySelector("[data-template-phase-list]");
    var phaseCountInput = document.querySelector("[data-template-phase-count]");
    if (phaseCountInput) {
      phaseCountInput.max = String(Math.max(1, state.structure.weeks));
      phaseCountInput.value = String(Array.isArray(state.programPhases) && state.programPhases.length ? state.programPhases.length : 1);
    }

    if (!container) {
      return;
    }

    if (!state.programPhases.length) {
      container.innerHTML = '<p class="admin-loading">No phases added yet.</p>';
      renderProgramPhaseWeeksWarning();
      return;
    }

    container.innerHTML = state.programPhases.map(function (phase, index) {
      return [
        '<div class="program-builder-phase-item">',
        '<div class="program-builder-phase-grid">',
        '<label class="program-builder-structure-field">',
        '<span>Phase Name</span>',
        '<input type="text" data-template-phase-field="name" data-template-phase-index="' + index + '" value="' + escapeAttribute(phase.name || '') + '" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Length (Weeks)</span>',
        '<input type="number" min="1" max="' + escapeAttribute(String(state.structure.weeks)) + '" data-template-phase-field="length_weeks" data-template-phase-index="' + index + '" value="' + escapeAttribute(String(getPhaseLengthWeeks(phase))) + '" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Training Days / Week</span>',
        '<input type="number" min="1" max="14" data-template-phase-field="training_days_per_week" data-template-phase-index="' + index + '" value="' + escapeAttribute(String(phase.training_days_per_week || 1)) + '" />',
        '</label>',
        '</div>',
        '<label class="program-builder-structure-field">',
        '<span>Phase Goal</span>',
        '<input type="text" data-template-phase-field="focus" data-template-phase-index="' + index + '" value="' + escapeAttribute(phase.focus || '') + '" placeholder="What this phase is trying to build" />',
        '</label>',
        '<div class="program-builder-phase-grid">',
        '<label class="program-builder-structure-field">',
        '<span>Strength Days</span>',
        '<input type="number" min="0" max="14" data-template-phase-field="strength_days_per_week" data-template-phase-index="' + index + '" value="' + escapeAttribute(String(phase.strength_days_per_week || 0)) + '" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Cardio Days</span>',
        '<input type="number" min="0" max="14" data-template-phase-field="cardio_days_per_week" data-template-phase-index="' + index + '" value="' + escapeAttribute(String(phase.cardio_days_per_week || 0)) + '" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Skill Days</span>',
        '<input type="number" min="0" max="14" data-template-phase-field="skill_days_per_week" data-template-phase-index="' + index + '" value="' + escapeAttribute(String(phase.skill_days_per_week || 0)) + '" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Multi-Focus Days</span>',
        '<input type="number" min="0" max="14" data-template-phase-field="multi_focus_days_per_week" data-template-phase-index="' + index + '" value="' + escapeAttribute(String(phase.multi_focus_days_per_week || 0)) + '" />',
        '</label>',
        '</div>',
        '<div class="program-builder-phase-actions">',
        '<button type="button" class="btn admin-btn-small" data-template-phase-remove="' + index + '">Remove Phase</button>',
        '</div>',
        '</div>'
      ].join('');
    }).join('');

    renderProgramPhaseWeeksWarning();
  }

  function getProgramPhaseWeekSummary() {
    var plannedWeeks = Math.max(1, parseInt(state.structure && state.structure.weeks, 10) || 1);
    var totalPhaseWeeks = (Array.isArray(state.programPhases) ? state.programPhases : []).reduce(function (accumulator, phase) {
      return accumulator + getPhaseLengthWeeks(phase);
    }, 0);
    return {
      plannedWeeks: plannedWeeks,
      totalPhaseWeeks: totalPhaseWeeks,
      delta: totalPhaseWeeks - plannedWeeks,
      isMatch: totalPhaseWeeks === plannedWeeks
    };
  }

  function canProceedToDailyProgramming() {
    return getProgramPhaseWeekSummary().isMatch;
  }

  function renderProgramPhaseWeeksWarning() {
    var warning = document.querySelector("[data-template-phase-warning]");
    if (!warning) {
      return;
    }

    var summary = getProgramPhaseWeekSummary();
    warning.classList.remove("is-warning", "is-ok");
    warning.hidden = false;

    if (summary.isMatch) {
      warning.classList.add("is-ok");
      warning.textContent = "Phase weeks match plan weeks (" + summary.totalPhaseWeeks + " / " + summary.plannedWeeks + ").";
      return;
    }

    warning.classList.add("is-warning");
    if (summary.delta > 0) {
      warning.textContent = "Phase weeks exceed plan weeks by " + summary.delta + ". Adjust phase lengths before continuing.";
    } else {
      warning.textContent = "Phase weeks are short by " + Math.abs(summary.delta) + ". Add phase weeks before continuing.";
    }
  }

  function renderWeeklyStructure() {
    var container = document.querySelector("[data-template-week-structure-list]");
    if (!container) {
      return;
    }

    if (!state.weeklyStructure.length) {
      container.innerHTML = '<p class="admin-loading">Weekly structure unavailable.</p>';
      return;
    }

    container.innerHTML = state.weeklyStructure.map(function (entry, index) {
      return [
        '<div class="program-builder-week-item">',
        '<p class="program-builder-week-kicker">Workout ' + escapeHtml(String(entry.workout || (index + 1))) + '</p>',
        '<label class="program-builder-structure-field">',
        '<span>Session Title</span>',
        '<input type="text" data-template-week-field="name" data-template-week-index="' + index + '" value="' + escapeAttribute(entry.name || '') + '" />',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Session Type</span>',
        '<select data-template-week-field="session_type" data-template-week-index="' + index + '">',
        buildWeeklySessionTypeOptions(entry.session_type),
        '</select>',
        '</label>',
        '<label class="program-builder-structure-field">',
        '<span>Coach Note</span>',
        '<input type="text" data-template-week-field="note" data-template-week-index="' + index + '" value="' + escapeAttribute(entry.note || '') + '" placeholder="Recovery, terrain, injury notes" />',
        '</label>',
        '</div>'
      ].join('');
    }).join('');
  }

  function renderProgramBuilderAlerts() {
    var container = document.querySelector("[data-template-builder-alerts]");
    if (!container) {
      return;
    }

    var alerts = computeProgramBuilderAlerts();
    if (!alerts.length) {
      container.innerHTML = '<p class="admin-loading">No immediate programming alerts.</p>';
      return;
    }

    container.innerHTML = alerts.map(function (alert) {
      return '<p class="program-builder-alert-item">' + escapeHtml(alert) + '</p>';
    }).join('');
  }

  function computeProgramBuilderAlerts() {
    var alerts = [];
    var weekly = Array.isArray(state.weeklyStructure) ? state.weeklyStructure : [];
    var phases = Array.isArray(state.programPhases) ? state.programPhases : [];
    var seasonObjectives = deriveSeasonObjectiveWindows(Array.isArray(meta.season_objectives) ? meta.season_objectives : []);
    var hardTypes = { threshold: true, vo2: true, uphill: true, strength_lower: true, strength_full: true, assessment: true };
    var hasRestLikeDay = weekly.some(function (entry) {
      return entry && (entry.session_type === 'rest' || entry.session_type === 'mobility');
    });

    for (var i = 1; i < weekly.length; i++) {
      var previous = weekly[i - 1] || {};
      var current = weekly[i] || {};
      if (hardTypes[previous.session_type] && hardTypes[current.session_type]) {
        alerts.push('High intensity stacked: Workout ' + String(i) + ' and Workout ' + String(i + 1) + ' are both demanding sessions.');
      }
    }

    if (!hasRestLikeDay && weekly.length >= 5) {
      alerts.push('No recovery day: consider at least one mobility or rest session in the default week.');
    }

    phases.forEach(function (phase) {
      if (!phase || typeof phase !== 'object') {
        return;
      }
      var label = String(phase.name || 'Unnamed phase').trim() || 'Unnamed phase';
      var trainingDays = clampNumber(parseInt(phase.training_days_per_week, 10), 1, 14, 1);
      var strengthDays = clampNumber(parseInt(phase.strength_days_per_week, 10), 0, 14, 0);
      var cardioDays = clampNumber(parseInt(phase.cardio_days_per_week != null ? phase.cardio_days_per_week : phase.endurance_days_per_week, 10), 0, 14, 0);
      var skillDays = clampNumber(parseInt(phase.skill_days_per_week != null ? phase.skill_days_per_week : phase.mobility_days_per_week, 10), 0, 14, 0);
      var multiFocusDays = clampNumber(parseInt(phase.multi_focus_days_per_week, 10), 0, 14, 0);

      if (trainingDays >= 6 && skillDays === 0) {
        alerts.push(label + ': high training frequency with no mobility day.');
      }

      if (strengthDays + cardioDays + skillDays + multiFocusDays > trainingDays) {
        alerts.push(label + ': strength/cardio/skill/multi-focus days exceed total training days.');
      }
    });

    if (state.structure.weeks >= 24 && seasonObjectives.length < 2) {
      alerts.push('Long-range plan detected: add multiple season objectives if this program is intended to have more than one peak.');
    }

    if (seasonObjectives.length > 1) {
      for (var objectiveIndex = 1; objectiveIndex < seasonObjectives.length; objectiveIndex++) {
        var previousObjective = seasonObjectives[objectiveIndex - 1];
        var currentObjective = seasonObjectives[objectiveIndex];
        if (previousObjective && currentObjective && currentObjective.phase_start_week <= previousObjective.phase_start_week) {
          alerts.push('Objective overlap: season objectives should move forward through the calendar rather than starting on the same or an earlier week.');
          break;
        }
      }
    }

    if (!state.programPhases.length) {
      alerts.push('No phases defined: add base/build/specific/taper structure for progression clarity.');
    }

    return alerts;
  }

  function buildWeeklySessionTypeOptions(selectedValue) {
    var selected = normalizeWeeklySessionType(selectedValue);
    return WEEKLY_SESSION_TYPE_OPTIONS.map(function (option) {
      var isSelected = option.value === selected ? ' selected' : '';
      return '<option value="' + escapeAttribute(option.value) + '"' + isSelected + '>' + escapeHtml(option.label) + '</option>';
    }).join('');
  }

  function syncProgramMetaField(field, value) {
    var meta = normalizeProgramMeta(state.programMeta, state.structure);
    if (field === 'tags') {
      meta.tags = normalizeProgramTags(String(value || '').split(','));
    } else if (field === 'training_days_per_week' || field === 'strength_days_per_week' || field === 'endurance_days_per_week' || field === 'mobility_days_per_week') {
      meta[field] = clampNumber(parseInt(value, 10), 0, 14, meta[field]);
      if (field === 'training_days_per_week') {
        meta.training_days_per_week = clampNumber(parseInt(value, 10), 1, 14, state.structure.workoutsPerWeek);
      }
    } else {
      meta[field] = String(value || '').trim();
    }

    state.programMeta = normalizeProgramMeta(meta, state.structure);
    if (field === 'program_type' || field === 'sport_focus') {
      state.templateFocus = deriveTemplateFocusFromMeta(state.programMeta, state.templateFocus);
      state.programPhases = normalizeProgramPhases(state.programPhases, state.structure.weeks, state.programMeta.program_type);
      state.weeklyStructure = normalizeWeeklyStructure(state.weeklyStructure, state.structure.workoutsPerWeek, state.templateFocus, state.programMeta.program_type);
      ensureDaySessionTypesForStructure();
      renderWeeklyStructure();
      renderProgramPhases();
    }
  }

  function syncProgramPhaseField(index, field, value) {
    var phase = state.programPhases[index] || createDefaultPhase(index, state.structure.weeks, state.programMeta && state.programMeta.program_type);
    var phaseLength = getPhaseLengthWeeks(phase);
    if (field === 'start_week' || field === 'end_week') {
      phase[field] = clampNumber(parseInt(value, 10), 1, state.structure.weeks, phase[field]);
    } else if (field === 'length_weeks') {
      phaseLength = clampNumber(parseInt(value, 10), 1, state.structure.weeks, phaseLength);
      phase.end_week = clampNumber((phase.start_week || 1) + phaseLength - 1, 1, state.structure.weeks, phase.end_week || phase.start_week || 1);
    } else if (field === 'training_days_per_week') {
      phase.training_days_per_week = clampNumber(parseInt(value, 10), 1, 14, phase.training_days_per_week || state.structure.workoutsPerWeek);
    } else if (
      field === 'strength_days_per_week' ||
      field === 'cardio_days_per_week' ||
      field === 'skill_days_per_week' ||
      field === 'multi_focus_days_per_week' ||
      field === 'endurance_days_per_week' ||
      field === 'mobility_days_per_week'
    ) {
      phase[field] = clampNumber(parseInt(value, 10), 0, 14, phase[field] || 0);
    } else {
      phase[field] = String(value || '').trim();
    }
    state.programPhases[index] = phase;
  }

  function getPhaseLengthWeeks(phase) {
    var startWeek = clampNumber(parseInt(phase && phase.start_week, 10), 1, state.structure.weeks, 1);
    var endWeek = clampNumber(parseInt(phase && phase.end_week, 10), startWeek, state.structure.weeks, startWeek);
    return Math.max(1, endWeek - startWeek + 1);
  }

  function resizeProgramPhases(targetCount) {
    var nextCount = clampNumber(parseInt(targetCount, 10), 1, Math.max(1, state.structure.weeks), state.programPhases.length || 1);
    var phases = Array.isArray(state.programPhases) ? state.programPhases.slice() : [];

    while (phases.length < nextCount) {
      phases.push(createDefaultPhase(phases.length, state.structure.weeks, state.programMeta && state.programMeta.program_type));
    }

    if (phases.length > nextCount) {
      phases = phases.slice(0, nextCount);
    }

    state.programPhases = normalizeProgramPhases(phases, state.structure.weeks, state.programMeta && state.programMeta.program_type);
    renderProgramPhases();
    renderProgramBuilderAlerts();
  }

  function syncSeasonObjectiveField(index, field, value) {
    var currentObjectives = Array.isArray(state.programMeta && state.programMeta.season_objectives)
      ? state.programMeta.season_objectives.slice()
      : [];
    if (index < 0 || index >= currentObjectives.length) {
      return;
    }

    var objective = currentObjectives[index] || createDefaultSeasonObjective(index);
    if (field === 'phase_start_week' || field === 'phase_end_week') {
      objective[field] = clampNumber(parseInt(value, 10), 1, 52, objective[field]);
    } else {
      objective[field] = String(value || '').trim();
      if (field === 'primary_goal') {
        objective.notes = objective.primary_goal;
      }
    }

    currentObjectives[index] = objective;
    state.programMeta = normalizeProgramMeta(Object.assign({}, state.programMeta, {
      season_objectives: currentObjectives
    }), state.structure);
  }

  function syncWeeklyStructureField(index, field, value) {
    var item = state.weeklyStructure[index] || buildDefaultWeeklyStructure(state.structure.workoutsPerWeek, state.templateFocus, state.programMeta && state.programMeta.program_type)[index] || {};
    if (field === 'session_type') {
      item[field] = normalizeWeeklySessionType(value);
    } else {
      item[field] = String(value || '').trim();
    }
    state.weeklyStructure[index] = item;
    if (field === 'name') {
      propagateWeeklyStructureNameToCustomDayNames(index, item.name);
    }
  }

  function propagateWeeklyStructureNameToCustomDayNames(index, name) {
    if (!state.customDayNames) {
      state.customDayNames = {};
    }
    var cleaned = String(name || '').trim();
    for (var week = 1; week <= state.structure.weeks; week++) {
      var slotKey = 'w' + week + 'd' + String(index + 1);
      if (cleaned) {
        state.customDayNameMode = 'full-label';
        state.customDayNames[slotKey] = cleaned;
      } else {
        delete state.customDayNames[slotKey];
      }
    }
  }

  function createDefaultPhase(index, totalWeeks, programType) {
    var defaults = buildDefaultProgramPhases(totalWeeks, programType);
    var defaultTrainingDays = state && state.structure ? state.structure.workoutsPerWeek : 3;
    return defaults[index] || {
      name: 'Phase ' + String(index + 1),
      start_week: Math.min(index + 1, totalWeeks),
      end_week: Math.min(index + 1, totalWeeks),
      focus: '',
      strength_rule: '',
      endurance_rule: '',
      training_days_per_week: defaultTrainingDays,
      strength_days_per_week: Math.min(2, defaultTrainingDays),
      cardio_days_per_week: Math.min(1, defaultTrainingDays),
      skill_days_per_week: 1,
      multi_focus_days_per_week: 0,
      endurance_days_per_week: Math.min(1, defaultTrainingDays),
      mobility_days_per_week: 1
    };
  }

  function createDefaultSeasonObjective(index) {
    return {
      label: 'Peak ' + String(index + 1),
      sport_focus: '',
      primary_goal: '',
      secondary_goal: '',
      peak_date: '',
      phase_start_week: Math.max(1, index + 1),
      phase_end_week: Math.max(1, state.structure && state.structure.weeks ? state.structure.weeks : 1),
      priority: 'primary',
      notes: ''
    };
  }

  function deriveSeasonObjectiveWindows(objectives) {
    var source = Array.isArray(objectives) ? objectives.slice() : [];
    var totalWeeks = Math.max(1, state.structure && state.structure.weeks ? state.structure.weeks : 1);
    var ordered = source.slice().sort(function (a, b) {
      var aPeak = String(a && a.peak_date || '');
      var bPeak = String(b && b.peak_date || '');
      if (aPeak && bPeak) {
        return aPeak.localeCompare(bPeak);
      }
      if (aPeak) return -1;
      if (bPeak) return 1;
      return String(a && a.label || '').localeCompare(String(b && b.label || ''));
    });

    var span = Math.max(1, Math.floor(totalWeeks / Math.max(1, ordered.length)));
    return ordered.map(function (objective, index) {
      var item = objective && typeof objective === 'object' ? Object.assign({}, objective) : createDefaultSeasonObjective(index);
      var fallbackStart = index === 0 ? 1 : Math.min(totalWeeks, (index * span) + 1);
      var fallbackEnd = index === ordered.length - 1 ? totalWeeks : Math.min(totalWeeks, (index + 1) * span);
      var explicitStart = parseInt(item.phase_start_week, 10);
      var explicitEnd = parseInt(item.phase_end_week, 10);

      if (!item.peak_date && explicitStart === 1 && explicitEnd === totalWeeks && ordered.length > 1) {
        item.phase_start_week = fallbackStart;
        item.phase_end_week = Math.max(fallbackStart, fallbackEnd);
        return item;
      }

      item.phase_start_week = clampNumber(explicitStart, 1, totalWeeks, fallbackStart);
      item.phase_end_week = clampNumber(explicitEnd, item.phase_start_week, totalWeeks, fallbackEnd);
      return item;
    });
  }

  function autoGenerateProgramPhasesFromObjectives() {
    var objectives = Array.isArray(state.programMeta && state.programMeta.season_objectives)
      ? state.programMeta.season_objectives.slice()
      : [];

    if (!objectives.length) {
      setStatus("Add at least one season objective before auto-generating phases.", "info");
      return;
    }

    objectives = deriveSeasonObjectiveWindows(objectives);

    var generated = [];
    objectives.forEach(function (objective, index) {
      generated = generated.concat(buildPhasesForSeasonObjective(objective, index));
    });

    state.programPhases = normalizeProgramPhases(generated, state.structure.weeks, state.programMeta && state.programMeta.program_type);
    renderProgramPhases();
    renderProgramBuilderAlerts();
    setStatus("Program phases generated from season objectives.", "success");
  }

  function buildPhasesForSeasonObjective(objective, objectiveIndex) {
    var startWeek = clampNumber(parseInt(objective && objective.phase_start_week, 10), 1, state.structure.weeks, 1);
    var endWeek = clampNumber(parseInt(objective && objective.phase_end_week, 10), startWeek, state.structure.weeks, startWeek);
    var totalWeeks = Math.max(1, endWeek - startWeek + 1);
    var goal = String(objective && objective.primary_goal || "").trim();
    var sport = String(objective && objective.sport_focus || "").trim();
    var prefix = String(objective && objective.label || ("Objective " + String(objectiveIndex + 1))).trim();

    if (totalWeeks <= 3) {
      return [
        buildObjectivePhase(prefix + " Specific", startWeek, endWeek, goal, sport, "Maintain key lifts and movement quality", "Specific intensity with minimal extra volume")
      ];
    }

    if (totalWeeks <= 6) {
      return [
        buildObjectivePhase(prefix + " Build", startWeek, Math.max(startWeek, endWeek - 1), goal, sport, "Build usable strength with low wasted volume", "Progress event-specific intensity"),
        buildObjectivePhase(prefix + " Taper", endWeek, endWeek, goal, sport, "Reduce fatigue, avoid soreness", "Keep short sharp exposures, reduce overall duration")
      ];
    }

    var taperWeeks = totalWeeks >= 10 ? 1 : 1;
    var specificWeeks = totalWeeks >= 10 ? 2 : 1;
    var baseWeeks = Math.max(2, Math.floor((totalWeeks - taperWeeks - specificWeeks) * 0.45));
    var buildWeeks = Math.max(2, totalWeeks - taperWeeks - specificWeeks - baseWeeks);

    var baseStart = startWeek;
    var baseEnd = Math.min(endWeek, baseStart + baseWeeks - 1);
    var buildStart = baseEnd + 1;
    var buildEnd = Math.min(endWeek, buildStart + buildWeeks - 1);
    var specificStart = Math.min(endWeek, buildEnd + 1);
    var specificEnd = Math.min(endWeek, Math.max(specificStart, endWeek - taperWeeks));
    var taperStart = Math.min(endWeek, specificEnd + 1);

    var phases = [
      buildObjectivePhase(prefix + " Base", baseStart, baseEnd, goal, sport, "Moderate loads and control work", "Mostly Zone 2 / aerobic base"),
      buildObjectivePhase(prefix + " Build", buildStart, buildEnd, goal, sport, "Heavier or denser strength progressions", "Add threshold / uphill workload"),
      buildObjectivePhase(prefix + " Specific", specificStart, specificEnd, goal, sport, "Unilateral, event-specific durability", "Terrain / vertical / event-specific emphasis")
    ];

    if (taperStart <= endWeek) {
      phases.push(buildObjectivePhase(prefix + " Taper", taperStart, endWeek, goal, sport, "Reduce volume, keep movement sharp", "Lower total work, maintain touch points"));
    }

    return phases.filter(function (phase) {
      return phase.start_week <= phase.end_week;
    });
  }

  function buildObjectivePhase(name, startWeek, endWeek, goal, sport, strengthRule, enduranceRule) {
    var focusParts = [];
    if (sport) {
      focusParts.push(sport);
    }
    if (goal) {
      focusParts.push(goal);
    }

    return {
      name: name,
      start_week: startWeek,
      end_week: endWeek,
      focus: focusParts.join(' • '),
      strength_rule: strengthRule,
      endurance_rule: enduranceRule,
      training_days_per_week: state && state.structure ? state.structure.workoutsPerWeek : 3,
      strength_days_per_week: 2,
      cardio_days_per_week: 1,
      skill_days_per_week: 1,
      multi_focus_days_per_week: 0,
      endurance_days_per_week: 1,
      mobility_days_per_week: 1
    };
  }

  function normalizeProgramType(value) {
    var type = String(value || 'hybrid').trim().toLowerCase();
    return PROGRAM_TYPE_OPTIONS.indexOf(type) > -1 ? type : 'hybrid';
  }

  function deriveTemplateFocusFromMeta(meta, fallbackFocus) {
    var programMeta = meta && typeof meta === 'object' ? meta : {};
    var programType = normalizeProgramType(programMeta.program_type);
    var sport = String(programMeta.sport_focus || '').trim().toLowerCase();

    if (programType === 'strength') {
      return 'strength';
    }

    if (programType === 'endurance') {
      if (sport.indexOf('bike') > -1 || sport.indexOf('cycling') > -1 || sport.indexOf('mtb') > -1) {
        return 'biking';
      }
      return 'running';
    }

    if (programType === 'hybrid' || programType === 'return_to_sport' || programType === 'individualized') {
      return 'hybrid';
    }

    return normalizeTemplateFocus(fallbackFocus);
  }

  function normalizeAthleteLevel(value) {
    var level = String(value || 'intermediate').trim().toLowerCase();
    return ['beginner', 'intermediate', 'advanced', 'elite'].indexOf(level) > -1 ? level : 'intermediate';
  }

  function normalizeDeloadFrequency(value) {
    var frequency = String(value || 'every_4').trim().toLowerCase();
    return ['every_3', 'every_4', 'reactive', 'taper_only'].indexOf(frequency) > -1 ? frequency : 'every_4';
  }

  function normalizeObjectivePriority(value) {
    var priority = String(value || 'primary').trim().toLowerCase();
    return ['primary', 'secondary', 'support'].indexOf(priority) > -1 ? priority : 'primary';
  }

  function buildObjectivePriorityOptions(selectedValue) {
    var selected = normalizeObjectivePriority(selectedValue);
    var options = [
      { value: 'primary', label: 'Primary Peak' },
      { value: 'secondary', label: 'Secondary Peak' },
      { value: 'support', label: 'Support Objective' }
    ];
    return options.map(function (option) {
      var isSelected = option.value === selected ? ' selected' : '';
      return '<option value="' + escapeAttribute(option.value) + '"' + isSelected + '>' + escapeHtml(option.label) + '</option>';
    }).join('');
  }

  function normalizeProgramTags(values) {
    var source = Array.isArray(values) ? values : [];
    var seen = {};
    return source.map(function (entry) {
      return String(entry || '').trim().toLowerCase();
    }).filter(function (entry) {
      if (!entry || seen[entry]) {
        return false;
      }
      seen[entry] = true;
      return true;
    }).slice(0, 16);
  }

  function normalizeWeeklySessionType(value) {
    var target = String(value || 'strength_full').trim().toLowerCase();
    var found = WEEKLY_SESSION_TYPE_OPTIONS.some(function (option) {
      return option.value === target;
    });
    return found ? target : 'strength_full';
  }

  function setInputValue(selector, value) {
    var input = document.querySelector(selector);
    if (input) {
      input.value = value;
    }
  }

  function clampNumber(value, min, max, fallback) {
    var num = parseInt(value, 10);
    if (!Number.isFinite(num)) {
      return fallback;
    }
    return Math.max(min, Math.min(max, num));
  }

  function normalizeProgramMeta(meta, structure) {
    var source = meta && typeof meta === "object" ? meta : {};
    var normalizedStructure = normalizeStructure(structure || state.structure);
    var trainingDays = parseInt(source.training_days_per_week, 10);
    var strengthDays = parseInt(source.strength_days_per_week, 10);
    var enduranceDays = parseInt(source.endurance_days_per_week, 10);
    var mobilityDays = parseInt(source.mobility_days_per_week, 10);
    var tags = Array.isArray(source.tags)
      ? source.tags
      : String(source.tags || "").split(",");

    return {
      program_type: normalizeProgramType(source.program_type),
      sport_focus: String(source.sport_focus || "").trim(),
      athlete_level: normalizeAthleteLevel(source.athlete_level),
      primary_goal: String(source.primary_goal || "").trim(),
      secondary_goal: String(source.secondary_goal || "").trim(),
      training_days_per_week: clampNumber(trainingDays, 1, 14, normalizedStructure.workoutsPerWeek),
      strength_days_per_week: clampNumber(strengthDays, 0, 14, Math.min(2, normalizedStructure.workoutsPerWeek)),
      endurance_days_per_week: clampNumber(enduranceDays, 0, 14, normalizedStructure.workoutsPerWeek > 3 ? 2 : 1),
      mobility_days_per_week: clampNumber(mobilityDays, 0, 14, 1),
      deload_frequency: normalizeDeloadFrequency(source.deload_frequency),
      peak_date: isIsoDate(source.peak_date) ? String(source.peak_date) : "",
      tags: normalizeProgramTags(tags),
      season_objectives: normalizeSeasonObjectives(source.season_objectives)
    };
  }

  function normalizeSeasonObjectives(objectives) {
    var source = Array.isArray(objectives) ? objectives : [];
    return source.map(function (objective, index) {
      var item = objective && typeof objective === "object" ? objective : {};
      var startWeek = clampNumber(parseInt(item.phase_start_week, 10), 1, 52, 1);
      var endWeek = clampNumber(parseInt(item.phase_end_week, 10), 1, 52, startWeek);
      return {
        label: String(item.label || ("Peak " + String(index + 1))).trim(),
        sport_focus: String(item.sport_focus || "").trim(),
        primary_goal: String(item.primary_goal || item.notes || "").trim(),
        secondary_goal: String(item.secondary_goal || "").trim(),
        peak_date: isIsoDate(item.peak_date) ? String(item.peak_date) : "",
        phase_start_week: startWeek,
        phase_end_week: Math.max(startWeek, endWeek),
        priority: normalizeObjectivePriority(item.priority),
        notes: String(item.notes || item.primary_goal || "").trim()
      };
    });
  }

  function normalizeProgramPhases(phases, totalWeeks, programType) {
    var weeks = Math.max(1, parseInt(totalWeeks, 10) || 1);
    var source = Array.isArray(phases) ? phases : [];
    var normalized = source.map(function (phase, index) {
      var item = phase && typeof phase === "object" ? phase : {};
      var fallbackTraining = Math.max(1, parseInt(item.training_days_per_week, 10) || state.structure.workoutsPerWeek || 3);
      var normalizedTraining = clampNumber(parseInt(item.training_days_per_week, 10), 1, 14, fallbackTraining);
      var normalizedStrength = clampNumber(parseInt(item.strength_days_per_week, 10), 0, 14, Math.min(2, normalizedTraining));
      var normalizedCardio = clampNumber(
        parseInt(item.cardio_days_per_week != null ? item.cardio_days_per_week : item.endurance_days_per_week, 10),
        0,
        14,
        Math.min(1, normalizedTraining)
      );
      var normalizedSkill = clampNumber(
        parseInt(item.skill_days_per_week != null ? item.skill_days_per_week : item.mobility_days_per_week, 10),
        0,
        14,
        1
      );
      var normalizedMultiFocus = clampNumber(parseInt(item.multi_focus_days_per_week, 10), 0, 14, 0);
      return {
        name: String(item.name || ("Phase " + String(index + 1))).trim(),
        start_week: clampNumber(parseInt(item.start_week, 10), 1, weeks, Math.min(index + 1, weeks)),
        end_week: clampNumber(parseInt(item.end_week, 10), 1, weeks, Math.min(index + 1, weeks)),
        focus: String(item.focus || "").trim(),
        strength_rule: String(item.strength_rule || "").trim(),
        endurance_rule: String(item.endurance_rule || "").trim(),
        training_days_per_week: normalizedTraining,
        strength_days_per_week: normalizedStrength,
        cardio_days_per_week: normalizedCardio,
        skill_days_per_week: normalizedSkill,
        multi_focus_days_per_week: normalizedMultiFocus,
        endurance_days_per_week: normalizedCardio,
        mobility_days_per_week: normalizedSkill
      };
    }).filter(function (phase) {
      return !!phase.name;
    });

    normalized.forEach(function (phase) {
      if (phase.end_week < phase.start_week) {
        phase.end_week = phase.start_week;
      }
      phase.endurance_days_per_week = phase.cardio_days_per_week;
      phase.mobility_days_per_week = phase.skill_days_per_week;
    });

    if (!normalized.length) {
      return buildDefaultProgramPhases(weeks, normalizeProgramType(programType));
    }

    return normalized;
  }

  function normalizeWeeklyStructure(weeklyStructure, workoutsPerWeek, focus, programType) {
    var total = Math.max(1, parseInt(workoutsPerWeek, 10) || 1);
    var source = Array.isArray(weeklyStructure) ? weeklyStructure : [];
    var defaults = buildDefaultWeeklyStructure(total, normalizeTemplateFocus(focus), normalizeProgramType(programType));
    var normalized = [];

    for (var i = 0; i < total; i++) {
      var item = source[i] && typeof source[i] === "object" ? source[i] : {};
      var fallback = defaults[i] || defaults[defaults.length - 1] || { name: "Workout " + String(i + 1), session_type: "strength_full", note: "" };
      normalized.push({
        workout: i + 1,
        name: String(item.name || fallback.name || ("Workout " + String(i + 1))).trim(),
        session_type: normalizeWeeklySessionType(item.session_type || fallback.session_type),
        note: String(item.note || fallback.note || "").trim()
      });
    }

    return normalized;
  }

  function buildDefaultProgramPhases(totalWeeks, programType) {
    var presets = PHASE_PRESETS_BY_PROGRAM_TYPE[normalizeProgramType(programType)] || PHASE_PRESETS_BY_PROGRAM_TYPE.hybrid;
    var weeks = Math.max(1, parseInt(totalWeeks, 10) || 1);
    var count = presets.length;
    var currentWeek = 1;
    var defaultTrainingDays = state && state.structure ? state.structure.workoutsPerWeek : 3;

    return presets.map(function (preset, index) {
      var remainingWeeks = weeks - currentWeek + 1;
      var remainingPhases = count - index;
      var span = Math.max(1, Math.floor(remainingWeeks / remainingPhases));
      var endWeek = index === count - 1 ? weeks : Math.min(weeks, currentWeek + span - 1);
      var phase = {
        name: preset.name,
        start_week: currentWeek,
        end_week: endWeek,
        focus: preset.focus,
        strength_rule: preset.strength_rule,
        endurance_rule: preset.endurance_rule,
        training_days_per_week: defaultTrainingDays,
        strength_days_per_week: Math.min(2, defaultTrainingDays),
        cardio_days_per_week: Math.min(1, defaultTrainingDays),
        skill_days_per_week: 1,
        multi_focus_days_per_week: 0,
        endurance_days_per_week: Math.min(1, defaultTrainingDays),
        mobility_days_per_week: 1
      };
      currentWeek = endWeek + 1;
      return phase;
    });
  }

  function buildDefaultWeeklyStructure(workoutsPerWeek, focus, programType) {
    var total = Math.max(1, parseInt(workoutsPerWeek, 10) || 1);
    var type = normalizeProgramType(programType);
    var library = {
      hybrid: [
        { name: "Strength Lower Body", session_type: "strength_lower", note: "Avoid stacking with long uphill work next day." },
        { name: "Zone 2 Endurance", session_type: "zone2", note: "Aerobic support / base development." },
        { name: "Mobility / Recovery", session_type: "mobility", note: "Low-stress movement quality day." },
        { name: "Uphill Intervals", session_type: "uphill", note: "Hard day, keep controlled intensity." },
        { name: "Strength Full Body", session_type: "strength_full", note: "Durability / strength maintenance." },
        { name: "Long Endurance", session_type: "long_endurance", note: "Mountain-specific long day." },
        { name: "Rest Day", session_type: "rest", note: "Protect recovery before next build." }
      ],
      strength: [
        { name: "Lower Body Strength", session_type: "strength_lower", note: "Primary heavy lower session." },
        { name: "Upper Body Strength", session_type: "strength_upper", note: "Pull, push, trunk." },
        { name: "Mobility / Recovery", session_type: "mobility", note: "Restore tissue quality." },
        { name: "Full Body Strength", session_type: "strength_full", note: "Secondary strength exposure." },
        { name: "Assessment / Power", session_type: "assessment", note: "Testing, power, or accessory emphasis." },
        { name: "Rest Day", session_type: "rest", note: "Optional off day." }
      ],
      endurance: [
        { name: "Zone 2 Base", session_type: "zone2", note: "Base aerobic development." },
        { name: "Threshold Work", session_type: "threshold", note: "Tempo or threshold session." },
        { name: "Mobility / Recovery", session_type: "mobility", note: "Low load recovery." },
        { name: "VO2 Session", session_type: "vo2", note: "High intensity exposure." },
        { name: "Long Endurance", session_type: "long_endurance", note: "Long easy mountain day." },
        { name: "Rest Day", session_type: "rest", note: "Protect recovery." }
      ],
      return_to_sport: [
        { name: "Strength / Tissue Tolerance", session_type: "strength_lower", note: "Pain <= 3/10 rule." },
        { name: "Low-Impact Endurance", session_type: "zone2", note: "Bike / hike / incline options." },
        { name: "Mobility / Rehab", session_type: "mobility", note: "Restore range and control." },
        { name: "Return-to-Impact Progression", session_type: "assessment", note: "Use reactive progression criteria." },
        { name: "Rest Day", session_type: "rest", note: "Monitor symptoms." }
      ]
    };

    var preset = library[type] || library[focus === "hybrid" ? "hybrid" : (focus === "running" || focus === "biking" ? "endurance" : "strength")];
    var result = [];
    for (var i = 0; i < total; i++) {
      var entry = preset[i] || preset[preset.length - 1] || { name: "Workout " + String(i + 1), session_type: "strength_full", note: "" };
      result.push({
        workout: i + 1,
        name: entry.name,
        session_type: entry.session_type,
        note: entry.note
      });
    }
    return result;
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

    if (shouldUsePhaseDailyNavigator()) {
      ensureDailyNavigatorState();
      renderDailyNavigatorControls();
      var phase = getSelectedDailyNavigatorPhase();
      if (!phase) {
        daySelect.innerHTML = "";
        return;
      }

      var phaseWeeks = getPhaseLengthWeeks(phase);
      var effectiveDays = getEffectivePhaseTrainingDays(phase);
      var axisOptions = [];

      if (state.dailyProgrammingViewMode === "day") {
        axisOptions = [];
        for (var weekIndex = 0; weekIndex < phaseWeeks; weekIndex++) {
          for (var dayIndex = 0; dayIndex < effectiveDays; dayIndex++) {
            var slotKey = "w" + String(Number(phase.start_week || 1) + weekIndex) + "d" + String(dayIndex + 1);
            axisOptions.push({
              value: slotKey,
              label: labelForSlot(slotKey)
            });
          }
        }
      } else if (state.dailyProgrammingViewMode === "week") {
        axisOptions = new Array(effectiveDays).fill("").map(function (_, index) {
          var dayNumber = index + 1;
          var slotKey = "w" + String(Number(phase.start_week || 1) + state.dailyProgrammingWeekInPhase - 1) + "d" + String(dayNumber);
          return {
            value: String(dayNumber),
            label: "Day " + String(dayNumber) + " - " + labelForSlot(slotKey)
          };
        });
      } else {
        axisOptions = new Array(phaseWeeks).fill("").map(function (_, index) {
          var weekNumber = index + 1;
          var slotKey = "w" + String(Number(phase.start_week || 1) + weekNumber - 1) + "d" + String(state.dailyProgrammingDayInPhase);
          return {
            value: String(weekNumber),
            label: "Week " + String(weekNumber) + " - " + labelForSlot(slotKey)
          };
        });
      }

      daySelect.innerHTML = axisOptions.map(function (option) {
        return '<option value="' + escapeAttribute(option.value) + '">' + escapeHtml(option.label) + '</option>';
      }).join("");

      if (state.dailyProgrammingViewMode === "day") {
        daySelect.value = buildSlotKeyFromDailyNavigator();
      } else if (state.dailyProgrammingViewMode === "week") {
        daySelect.value = String(state.dailyProgrammingDayInPhase);
      } else {
        daySelect.value = String(state.dailyProgrammingWeekInPhase);
      }

      state.day = buildSlotKeyFromDailyNavigator();
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
    var weeklyEntry = Array.isArray(state.weeklyStructure) ? state.weeklyStructure[parsed.workout - 1] : null;
    var weeklyLabel = weeklyEntry && weeklyEntry.name ? String(weeklyEntry.name).trim() : "";
    if (customLabel) {
      if (state.customDayNameMode === "full-label") {
        return customLabel;
      }
      return base + " - " + customLabel;
    }
    if (weeklyLabel) {
      return base + " - " + weeklyLabel;
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
      renderWorkoutCompletionSummary();
      renderWorkoutWalkthrough();
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
      renderWorkoutCompletionSummary();
      renderWorkoutWalkthrough();
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
    renderWorkoutCompletionSummary();
  }

  function shouldShowStartWorkoutButton() {
    return state.isAthleteLockedView && !state.isProgramReadOnly && !state.isTemplateBuilder;
  }

  function syncStartWorkoutButtonState() {
    var startBtn = document.querySelector("[data-start-workout]");
    var hasExercises = Array.isArray(state.exercises) && state.exercises.length > 0;
    var shouldShow = shouldShowStartWorkoutButton() && !state.workoutWalkthroughActive;

    if (!startBtn) {
      return;
    }

    startBtn.hidden = !shouldShow;
    startBtn.style.display = shouldShow ? "inline-flex" : "none";
    startBtn.disabled = !hasExercises;
    startBtn.setAttribute("aria-disabled", startBtn.disabled ? "true" : "false");
  }

  function startWorkoutWalkthrough() {
    if (!shouldShowStartWorkoutButton()) {
      return;
    }

    var steps = buildWorkoutWalkthroughSteps();
    if (!steps.length) {
      loadExercisesForDay();
      steps = buildWorkoutWalkthroughSteps();
    }

    if (!steps.length) {
      setStatus("No exercises found for this day. Add a workout first.", "info");
      return;
    }

    state.workoutWalkthroughSteps = steps;
    state.workoutWalkthroughStepIndex = 0;
    state.workoutWalkthroughActive = true;
    state.workoutWalkthroughStartedAt = Date.now();
    state.workoutCompletionSummary = null;
    renderRows();
    setStatus("Workout walkthrough started.", "info");
  }

  function stopWorkoutWalkthrough(silent) {
    state.workoutWalkthroughActive = false;
    state.workoutWalkthroughStepIndex = 0;
    state.workoutWalkthroughSteps = [];
    state.workoutWalkthroughStartedAt = null;
    renderWorkoutWalkthrough();
    renderRows();

    if (!silent) {
      setStatus("Returned to Workout Overview.", "info");
    }
  }

  function onWorkoutWalkthroughPrev() {
    if (!state.workoutWalkthroughActive) {
      return;
    }

    saveExercisesForDay(true);
    if (state.workoutWalkthroughStepIndex <= 0) {
      return;
    }

    state.workoutWalkthroughStepIndex -= 1;
    renderWorkoutWalkthrough();
  }

  function onWorkoutWalkthroughNext() {
    if (!state.workoutWalkthroughActive) {
      return;
    }

    saveExercisesForDay(true);

    var total = Array.isArray(state.workoutWalkthroughSteps) ? state.workoutWalkthroughSteps.length : 0;
    if (!total) {
      stopWorkoutWalkthrough(true);
      return;
    }

    if (state.workoutWalkthroughStepIndex >= total - 1) {
      completeWorkoutFromWalkthrough();
      return;
    }

    state.workoutWalkthroughStepIndex += 1;
    renderWorkoutWalkthrough();
  }

  function completeWorkoutFromWalkthrough() {
    var startedAt = state.workoutWalkthroughStartedAt;
    var finishedAt = Date.now();

    saveExercisesForDay(true);

    state.workoutCompletionSummary = buildWorkoutCompletionSummary(startedAt, finishedAt);
    renderWorkoutCompletionSummary();

    syncScheduledSessionStatusForCurrentDay();
    updateStats();
    stopWorkoutWalkthrough(true);
    setStatus("Workout completed. Progress has been saved.", "success");
  }

  function buildWorkoutCompletionSummary(startedAt, finishedAt) {
    var snapshot = getWorkoutCompletionSnapshot(state.exercises || []);
    var elapsedMs = Math.max(0, (parseInt(finishedAt, 10) || 0) - (parseInt(startedAt, 10) || 0));
    var elapsedLabel = formatDurationLabel(elapsedMs);
    var currentBest = collectBestExerciseWeights(state.exercises || []);
    var priorBest = collectHistoricalBestExerciseWeightsForCurrentAthlete();
    var prItems = [];

    Object.keys(currentBest).forEach(function (exerciseNameKey) {
      var current = currentBest[exerciseNameKey];
      if (!current || typeof current.maxWeight !== "number") {
        return;
      }

      var previous = priorBest[exerciseNameKey];
      if (!previous || typeof previous.maxWeight !== "number") {
        prItems.push({
          exerciseName: current.exerciseName,
          currentWeight: current.maxWeight,
          previousWeight: null
        });
        return;
      }

      if (current.maxWeight > previous.maxWeight) {
        prItems.push({
          exerciseName: current.exerciseName,
          currentWeight: current.maxWeight,
          previousWeight: previous.maxWeight
        });
      }
    });

    var completionPercent = snapshot.totalSets > 0
      ? Math.round((snapshot.doneSets / snapshot.totalSets) * 100)
      : 0;

    return {
      elapsedLabel: elapsedLabel,
      doneSets: snapshot.doneSets,
      totalSets: snapshot.totalSets,
      completionPercent: completionPercent,
      prItems: prItems,
      comments: buildWorkoutCompletionComments(completionPercent, prItems.length)
    };
  }

  function buildWorkoutCompletionComments(completionPercent, prCount) {
    if (completionPercent >= 95 && prCount > 0) {
      return "Excellent session. You completed nearly every set and hit new strength PRs.";
    }

    if (completionPercent >= 95) {
      return "Great consistency. You completed the full session and kept your workload on track.";
    }

    if (completionPercent >= 70 && prCount > 0) {
      return "Solid work. Session completion was strong and you still pushed to new top weights.";
    }

    if (completionPercent >= 70) {
      return "Solid effort. Keep building consistency to turn this into repeatable progress.";
    }

    if (prCount > 0) {
      return "You still found progress today with new PRs. Aim to complete more sets next session.";
    }

    return "Good work showing up. Focus on completing more sets next time to build momentum.";
  }

  function collectBestExerciseWeights(exercises) {
    var bestByName = {};

    (Array.isArray(exercises) ? exercises : []).forEach(function (exercise) {
      var name = String(exercise && exercise.name || "").trim();
      if (!name) {
        return;
      }

      var key = name.toLowerCase();
      var sets = Array.isArray(exercise && exercise.sets) ? exercise.sets : [];

      sets.forEach(function (set) {
        var numericWeight = parseNumericWeight(set && set.weight);
        if (numericWeight == null) {
          return;
        }

        if (!bestByName[key] || numericWeight > bestByName[key].maxWeight) {
          bestByName[key] = {
            exerciseName: name,
            maxWeight: numericWeight
          };
        }
      });
    });

    return bestByName;
  }

  function collectHistoricalBestExerciseWeightsForCurrentAthlete() {
    var bestByName = {};
    var currentDayKey = storageKeyForDay();

    getAllSlotKeys().forEach(function (slotKey) {
      var key = state.storagePrefix + slotKey;
      if (key === currentDayKey) {
        return;
      }

      var payload = readFromStorage(key);
      if (!payload || !Array.isArray(payload.exercises)) {
        return;
      }

      var localBest = collectBestExerciseWeights(payload.exercises);
      Object.keys(localBest).forEach(function (exerciseNameKey) {
        var item = localBest[exerciseNameKey];
        if (!item) {
          return;
        }

        if (!bestByName[exerciseNameKey] || item.maxWeight > bestByName[exerciseNameKey].maxWeight) {
          bestByName[exerciseNameKey] = item;
        }
      });
    });

    return bestByName;
  }

  function parseNumericWeight(value) {
    var text = String(value == null ? "" : value).replace(/,/g, "").trim();
    if (!text) {
      return null;
    }

    var match = text.match(/-?\d+(?:\.\d+)?/);
    if (!match) {
      return null;
    }

    var numeric = parseFloat(match[0]);
    return isNaN(numeric) ? null : numeric;
  }

  function formatDurationLabel(milliseconds) {
    var totalMinutes = Math.max(0, Math.round((Number(milliseconds) || 0) / 60000));
    if (totalMinutes < 1) {
      return "< 1 min";
    }

    var hours = Math.floor(totalMinutes / 60);
    var minutes = totalMinutes % 60;

    if (!hours) {
      return String(minutes) + " min";
    }

    if (!minutes) {
      return String(hours) + "h";
    }

    return String(hours) + "h " + String(minutes) + "m";
  }

  function renderWorkoutCompletionSummary() {
    var summaryContainer = document.querySelector("[data-workout-summary]");
    var summary = state.workoutCompletionSummary;

    if (!summaryContainer) {
      return;
    }

    if (!summary || !shouldShowStartWorkoutButton()) {
      summaryContainer.hidden = true;
      summaryContainer.innerHTML = "";
      return;
    }

    summaryContainer.hidden = false;
    summaryContainer.innerHTML =
      '<article class="workout-summary-card">' +
        '<h3 class="workout-summary-title">Workout Summary</h3>' +
        '<ul class="workout-summary-stats">' +
          '<li class="workout-summary-stat"><span class="workout-summary-stat-label">Time Spent</span><span class="workout-summary-stat-value">' + escapeHtml(summary.elapsedLabel) + '</span></li>' +
          '<li class="workout-summary-stat"><span class="workout-summary-stat-label">Sets Completed</span><span class="workout-summary-stat-value">' + escapeHtml(String(summary.doneSets) + ' / ' + String(summary.totalSets)) + '</span></li>' +
          '<li class="workout-summary-stat"><span class="workout-summary-stat-label">Completion</span><span class="workout-summary-stat-value">' + escapeHtml(String(summary.completionPercent) + '%') + '</span></li>' +
        '</ul>' +
        '<p class="workout-summary-comments">' + escapeHtml(summary.comments || '') + '</p>' +
        (Array.isArray(summary.prItems) && summary.prItems.length
          ? '<ul class="workout-summary-pr-list">' + summary.prItems.map(function (item) {
              var prText = item.previousWeight == null
                ? item.exerciseName + ': first logged top weight at ' + item.currentWeight
                : item.exerciseName + ': ' + item.previousWeight + ' -> ' + item.currentWeight;
              return '<li>' + escapeHtml(prText) + '</li>';
            }).join('') + '</ul>'
          : '<p class="workout-summary-pr-empty">No new weight PRs this session yet. Keep stacking quality reps.</p>') +
      '</article>';
  }

  function buildWorkoutWalkthroughSteps() {
    var steps = [];
    var exercises = Array.isArray(state.exercises) ? state.exercises : [];

    var exercisesBySection = {};
    var orderedSections = Array.isArray(defaultSections) ? defaultSections.slice() : [];

    exercises.forEach(function (exercise, exerciseIdx) {
      var safeExercise = exercise || {};
      var section = String(safeExercise.section || "A Block");

      if (!exercisesBySection[section]) {
        exercisesBySection[section] = [];
        if (orderedSections.indexOf(section) === -1) {
          orderedSections.push(section);
        }
      }

      exercisesBySection[section].push({
        exerciseIdx: exerciseIdx,
        exercise: safeExercise
      });
    });

    orderedSections.forEach(function (section) {
      var sectionItems = exercisesBySection[section] || [];
      var seenSectionSupersets = {};

      sectionItems.forEach(function (item) {
        var exercise = item.exercise || {};
        var sets = Array.isArray(exercise.sets) ? exercise.sets : [];
        var supersetId = String(exercise.superset_group || "").trim();

        if (!sets.length) {
          return;
        }

        if (!supersetId) {
          for (var setIdx = 0; setIdx < sets.length; setIdx++) {
            steps.push({
              exerciseIdx: item.exerciseIdx,
              setIdx: setIdx,
              isSuperset: false,
              supersetRound: 0,
              supersetRounds: 0,
              supersetPosition: 0,
              supersetSize: 0
            });
          }
          return;
        }

        if (seenSectionSupersets[supersetId]) {
          return;
        }

        seenSectionSupersets[supersetId] = true;

        var members = sectionItems.filter(function (sectionItem) {
          return String(sectionItem.exercise && sectionItem.exercise.superset_group || "").trim() === supersetId;
        });

        if (!members.length) {
          return;
        }

        var maxSets = 0;
        members.forEach(function (member) {
          var memberSets = Array.isArray(member.exercise && member.exercise.sets) ? member.exercise.sets : [];
          maxSets = Math.max(maxSets, memberSets.length);
        });

        for (var round = 0; round < maxSets; round++) {
          members.forEach(function (member, memberIdx) {
            var memberSets = Array.isArray(member.exercise && member.exercise.sets) ? member.exercise.sets : [];
            if (!memberSets[round]) {
              return;
            }

            steps.push({
              exerciseIdx: member.exerciseIdx,
              setIdx: round,
              isSuperset: true,
              supersetRound: round + 1,
              supersetRounds: maxSets,
              supersetPosition: memberIdx + 1,
              supersetSize: members.length
            });
          });
        }
      });
    });

    return steps;
  }

  function resolveWorkoutWalkthroughDemoUrl(exercise) {
    var direct = String(exercise && exercise.video_demo_url || "").trim();
    if (direct) {
      return direct;
    }

    var byId = exercise && exercise.library_id ? findExerciseLibraryItemById(exercise.library_id) : null;
    if (byId && byId.video_demo_url) {
      return String(byId.video_demo_url);
    }

    var byName = findExerciseLibraryItemByName(exercise && exercise.name || "");
    if (byName && byName.video_demo_url) {
      return String(byName.video_demo_url);
    }

    return "";
  }

  function renderWorkoutWalkthrough() {
    var section = document.querySelector(".program-demo-section");
    var container = document.querySelector("[data-workout-walkthrough]");
    var tableWrap = document.querySelector(".program-demo-table-wrap");
    var mobileLog = document.querySelector("[data-athlete-mobile-log]");
    var emptyState = document.querySelector("[data-empty-state]");

    if (!container) {
      return;
    }

    if (!state.workoutWalkthroughActive) {
      container.hidden = true;
      container.innerHTML = "";
      if (section) {
        section.classList.remove("is-walkthrough-active");
      }
      syncStartWorkoutButtonState();
      return;
    }

    var steps = Array.isArray(state.workoutWalkthroughSteps) && state.workoutWalkthroughSteps.length
      ? state.workoutWalkthroughSteps
      : buildWorkoutWalkthroughSteps();

    if (!steps.length) {
      stopWorkoutWalkthrough(true);
      return;
    }

    state.workoutWalkthroughSteps = steps;
    state.workoutWalkthroughStepIndex = Math.min(state.workoutWalkthroughStepIndex, steps.length - 1);

    var step = steps[state.workoutWalkthroughStepIndex];
    var exercise = state.exercises[step.exerciseIdx];
    var set = exercise && Array.isArray(exercise.sets) ? exercise.sets[step.setIdx] : null;

    if (!exercise || !set) {
      state.workoutWalkthroughSteps = buildWorkoutWalkthroughSteps();
      if (!state.workoutWalkthroughSteps.length) {
        stopWorkoutWalkthrough(true);
        return;
      }
      state.workoutWalkthroughStepIndex = Math.min(state.workoutWalkthroughStepIndex, state.workoutWalkthroughSteps.length - 1);
      step = state.workoutWalkthroughSteps[state.workoutWalkthroughStepIndex];
      exercise = state.exercises[step.exerciseIdx];
      set = exercise && Array.isArray(exercise.sets) ? exercise.sets[step.setIdx] : null;
      if (!exercise || !set) {
        stopWorkoutWalkthrough(true);
        return;
      }
    }

    var fieldToggles = normalizeExerciseFieldToggles(exercise.field_toggles, exercise.mode);
    var demoUrl = resolveWorkoutWalkthroughDemoUrl(exercise);
    var progressLabel = "Step " + (state.workoutWalkthroughStepIndex + 1) + " of " + state.workoutWalkthroughSteps.length;
    var supersetMeta = step.isSuperset
      ? "Superset " + step.supersetPosition + " of " + step.supersetSize + " • Round " + step.supersetRound + " of " + step.supersetRounds
      : "Set " + (step.setIdx + 1) + " of " + ((exercise.sets && exercise.sets.length) || 1);

    if (section) {
      section.classList.add("is-walkthrough-active");
    }

    syncStartWorkoutButtonState();

    if (tableWrap) {
      tableWrap.style.display = "none";
    }

    if (mobileLog) {
      mobileLog.style.display = "none";
    }

    if (emptyState) {
      emptyState.style.display = "none";
    }

    container.hidden = false;
    container.innerHTML =
      '<div class="workout-walkthrough-card">' +
        '<div class="workout-walkthrough-top">' +
          '<p class="workout-walkthrough-step">' + escapeHtml(progressLabel) + '</p>' +
          '<button type="button" class="btn btn-secondary workout-walkthrough-exit" data-workout-walkthrough-exit>Return to Workout Overview</button>' +
        '</div>' +
        '<p class="workout-walkthrough-meta">' + escapeHtml((exercise.section || "A Block") + " • " + supersetMeta) + '</p>' +
        '<h3 class="workout-walkthrough-title">' + escapeHtml(exercise.name || "Exercise") + '</h3>' +
        '<p class="workout-walkthrough-mode">' + escapeHtml(modeLabel(exercise.mode)) + '</p>' +
        (demoUrl
          ? '<a class="workout-walkthrough-demo" href="' + escapeAttribute(demoUrl) + '" target="_blank" rel="noopener"><span class="workout-walkthrough-demo-thumb">▶</span><span>View Exercise Demo</span></a>'
          : '<p class="workout-walkthrough-demo-none">No demo available for this exercise.</p>') +
        '<div class="workout-walkthrough-fields">' +
          '<label class="athlete-mobile-input"><span>' + escapeHtml(exercise.mode === "endurance" ? "Duration" : "Reps") + '</span><input type="text" data-field="reps" data-exercise="' + step.exerciseIdx + '" data-set="' + step.setIdx + '" value="' + escapeAttribute(displayAthleteInputValue(set.reps, set.target_reps, set.done)) + '" placeholder="' + escapeAttribute(set.target_reps || modePrimaryPlaceholder(exercise.mode)) + '" /></label>' +
          (fieldToggles.showWeight
            ? '<label class="athlete-mobile-input"><span>' + escapeHtml(exercise.mode === "endurance" ? "Weight / Time / Distance" : "Weight / Time") + '</span><input type="text" data-field="weight" data-exercise="' + step.exerciseIdx + '" data-set="' + step.setIdx + '" value="' + escapeAttribute(displayAthleteInputValue(set.weight, set.target_weight, set.done)) + '" placeholder="' + escapeAttribute(set.target_weight || modeSecondaryPlaceholder(exercise.mode, fieldToggles.secondaryMetric)) + '" /></label>'
            : '<div class="athlete-mobile-input athlete-mobile-input-off"><span>Weight / Time</span><em>Off</em></div>') +
          (fieldToggles.showRpe
            ? '<label class="athlete-mobile-input"><span>' + escapeHtml(exercise.mode === "endurance" ? "RPE / Zone / Effort" : "RPE / Zone") + '</span><input type="text" data-field="rpe" data-exercise="' + step.exerciseIdx + '" data-set="' + step.setIdx + '" value="' + escapeAttribute(displayAthleteInputValue(set.rpe, set.target_rpe, set.done)) + '" placeholder="' + escapeAttribute(set.target_rpe || modeTertiaryPlaceholder(exercise.mode)) + '" /></label>'
            : '<div class="athlete-mobile-input athlete-mobile-input-off"><span>RPE / Zone</span><em>Off</em></div>') +
          (fieldToggles.showRest
            ? '<label class="athlete-mobile-input"><span>Rest</span><input type="text" data-field="rest" data-exercise="' + step.exerciseIdx + '" data-set="' + step.setIdx + '" value="' + escapeAttribute(displayAthleteInputValue(set.rest, set.target_rest, set.done)) + '" placeholder="' + escapeAttribute(set.target_rest || "e.g. 90s") + '" /></label>'
            : '<div class="athlete-mobile-input athlete-mobile-input-off"><span>Rest</span><em>Off</em></div>') +
          '<label class="athlete-mobile-input athlete-mobile-input-notes"><span>Notes</span><input type="text" data-field="notes" data-exercise="' + step.exerciseIdx + '" data-set="' + step.setIdx + '" value="' + escapeAttribute(displayAthleteInputValue(set.notes, set.target_notes, set.done)) + '" placeholder="' + escapeAttribute(set.target_notes || "Notes") + '" /></label>' +
          '<label class="athlete-mobile-done-toggle workout-walkthrough-done"><input type="checkbox" data-field="done" data-exercise="' + step.exerciseIdx + '" data-set="' + step.setIdx + '" ' + (set.done ? "checked" : "") + ' /> Mark Set Done</label>' +
        '</div>' +
        '<div class="workout-walkthrough-actions">' +
          '<button type="button" class="btn btn-secondary" data-workout-walkthrough-prev ' + (state.workoutWalkthroughStepIndex === 0 ? "disabled" : "") + '>Previous</button>' +
          (state.workoutWalkthroughStepIndex === state.workoutWalkthroughSteps.length - 1
            ? '<button type="button" class="btn btn-primary" data-workout-walkthrough-complete>Complete Workout</button>'
            : '<button type="button" class="btn btn-primary" data-workout-walkthrough-next>Next</button>') +
        '</div>' +
      '</div>';

    bindWorkoutWalkthroughListeners(container);
  }

  function bindWorkoutWalkthroughListeners(container) {
    if (!container) {
      return;
    }

    bindSetInputListeners(container);

    container.querySelectorAll("[data-workout-walkthrough-prev]").forEach(function (btn) {
      bindPress(btn, onWorkoutWalkthroughPrev);
    });

    container.querySelectorAll("[data-workout-walkthrough-next]").forEach(function (btn) {
      bindPress(btn, onWorkoutWalkthroughNext);
    });

    container.querySelectorAll("[data-workout-walkthrough-complete]").forEach(function (btn) {
      bindPress(btn, completeWorkoutFromWalkthrough);
    });

    container.querySelectorAll("[data-workout-walkthrough-exit]").forEach(function (btn) {
      bindPress(btn, function () {
        stopWorkoutWalkthrough();
      });
    });
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
    renderWorkoutWalkthrough();
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
    var parsed = parseSlotKey(slotKey) || { workout: 1 };
    var weeklyEntry = Array.isArray(state.weeklyStructure) ? state.weeklyStructure[parsed.workout - 1] : null;
    var sessionType = weeklyEntry && weeklyEntry.session_type ? String(weeklyEntry.session_type) : "";

    if (sessionType === "zone2" || sessionType === "threshold" || sessionType === "vo2" || sessionType === "uphill" || sessionType === "long_endurance") {
      return state.templateFocus === "biking" ? "biking" : "running";
    }

    if (state.templateFocus === "running") {
      return "running";
    }
    if (state.templateFocus === "biking") {
      return "biking";
    }
    if (state.templateFocus === "hybrid") {
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
