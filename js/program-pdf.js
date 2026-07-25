(function (global) {
  "use strict";

  var PHASE_MATRIX_COLUMN_LIMIT = 6;
  var CLIMBING_SESSION_META = {
    technical_route: { adaptation: "Technical skill", recovery: "Low-Moderate", guidance: "Use before harder climbing days or on lower-load weeks." },
    aerobic_capacity: { adaptation: "Aerobic capacity", recovery: "Low-Moderate", guidance: "Keep pump controlled; pair well ahead of higher-intensity days." },
    short_strength_exposure: { adaptation: "Finger/pull strength", recovery: "Moderate", guidance: "Use as minimum-effective-dose on busy outdoor or ski weeks." },
    limit_bouldering: { adaptation: "Max strength/power", recovery: "High", guidance: "Place after a recovery day and avoid stacking with other high-CNS sessions." },
    climbing_power: { adaptation: "Explosive power", recovery: "Moderate-High", guidance: "Schedule with full rest before quality sets; stop when output drops." },
    route_power_endurance: { adaptation: "Power endurance", recovery: "High", guidance: "Place before a lower-load or rest day to absorb fatigue." },
    intensive_route: { adaptation: "Hard-route quality", recovery: "Moderate-High", guidance: "Use between technical volume and full project sessions." },
    redpoint_project: { adaptation: "Performance", recovery: "High", guidance: "Protect skin and tissues; keep long rest between key attempts." },
    outdoor_volume: { adaptation: "Outdoor volume/efficiency", recovery: "Moderate-High", guidance: "Control total route count and avoid converting into project intensity." },
    outdoor_performance: { adaptation: "Outdoor peak performance", recovery: "High", guidance: "Judge by quality of priority attempts, not total climbing volume." },
    outdoor_skills_exposure: { adaptation: "Outdoor systems skill", recovery: "Low-Moderate", guidance: "Prioritize safety and skill rehearsal over fatigue accumulation." },
    recovery_climbing: { adaptation: "Recovery movement", recovery: "Very Low", guidance: "Use between hard sessions; athlete should finish fresher." },
    fingerboard_only: { adaptation: "Finger strength", recovery: "Moderate", guidance: "Keep volume low and avoid layering onto already overloaded weeks." },
    mixed_maintenance: { adaptation: "Maintenance blend", recovery: "Moderate", guidance: "Keep total dose low while touching multiple qualities." }
  };
  var MOUNTAIN_BIKE_SESSION_META = {
    technical_skills: { adaptation: "Technical skill", recovery: "Low", guidance: "Use before hard physiological MTB sessions to improve movement economy." },
    cornering_braking: { adaptation: "Cornering and braking skill", recovery: "Low-Moderate", guidance: "Place early in the week or before higher-output work." },
    climbing_technique: { adaptation: "Climbing skill", recovery: "Moderate", guidance: "Prioritize traction and line quality over accumulating fatigue." },
    descending_skills: { adaptation: "Descending skill", recovery: "Moderate", guidance: "Pair with lower metabolic days when concentration quality is high." },
    recovery_ride: { adaptation: "Recovery", recovery: "Very Low", guidance: "Use between hard days to restore freshness without adding load." },
    aerobic_endurance: { adaptation: "Aerobic endurance", recovery: "Low-Moderate", guidance: "Keep effort conversational and avoid turning climbs into intervals." },
    long_trail_volume: { adaptation: "Durability", recovery: "Moderate-High", guidance: "Protect following day with easier load and strong fueling strategy." },
    steady_climbing_tempo: { adaptation: "Tempo climbing", recovery: "Moderate", guidance: "Use as a bridge between easy endurance and threshold sessions." },
    threshold_climbing: { adaptation: "Threshold power", recovery: "High", guidance: "Avoid stacking with another high-fatigue day immediately after." },
    vo2_aerobic_power: { adaptation: "Aerobic power", recovery: "High", guidance: "Schedule with sufficient recovery before and after interval day." },
    short_aerobic_power: { adaptation: "Repeatable surges", recovery: "High", guidance: "Best placed when neuromuscular freshness is available." },
    sprint_acceleration: { adaptation: "Sprint power", recovery: "Moderate-High", guidance: "Keep sprint quality maximal and total volume controlled." },
    technical_under_fatigue: { adaptation: "Skill under fatigue", recovery: "High", guidance: "Use on known terrain and follow with low-load recovery." },
    race_simulation: { adaptation: "Race specificity", recovery: "High", guidance: "Replace other weekly hardest MTB session with this day." },
    short_maintenance: { adaptation: "Maintenance", recovery: "Moderate", guidance: "Keep minimum-effective-dose so it does not compete with priority sport." },
    mixed_development: { adaptation: "Mixed development", recovery: "Moderate-High", guidance: "Keep one dominant priority for the day despite mixed content." }
  };
  var CYCLING_SESSION_META = {
    recovery_ride: { adaptation: "Restoration", recovery: "Very Low", guidance: "Keep truly easy and use between hard days to restore readiness." },
    easy_endurance: { adaptation: "Aerobic development", recovery: "Low", guidance: "Keep conversational and avoid drifting into tempo work." },
    long_endurance: { adaptation: "Durability and fueling", recovery: "Moderate-High", guidance: "Progress duration gradually and protect the next day." },
    cadence_endurance: { adaptation: "Pedaling coordination", recovery: "Low", guidance: "Treat as coordination work, not maximal force development." },
    steady_endurance: { adaptation: "Sustainable all-day pace", recovery: "Moderate", guidance: "Sustain controlled output below threshold for long sections." },
    tempo: { adaptation: "Muscular endurance", recovery: "Moderate", guidance: "Keep output purposeful but controlled without threshold surges." },
    subthreshold: { adaptation: "Near-threshold durability", recovery: "Moderate-High", guidance: "Increase interval duration before increasing intensity." },
    threshold: { adaptation: "Sustainable high power", recovery: "High", guidance: "Space from other high-intensity days by about 48 hours when possible." },
    over_unders: { adaptation: "Variable threshold tolerance", recovery: "High", guidance: "Keep overs controlled and regain breathing control in unders." },
    vo2max: { adaptation: "Peak aerobic power", recovery: "High", guidance: "Place when fresh and avoid uncontrolled sprint starts." },
    short_intervals: { adaptation: "Repeatable high power", recovery: "High", guidance: "Maintain repeatability and stop when output drops materially." },
    anaerobic_capacity: { adaptation: "Severe short-duration power", recovery: "Very High", guidance: "Keep rep count modest and preserve quality with long rests." },
    neuromuscular_sprints: { adaptation: "Peak acceleration", recovery: "Moderate", guidance: "Place early in session and end when sprint quality declines." },
    repeated_sprints: { adaptation: "Repeated acceleration", recovery: "High", guidance: "Use incomplete recoveries strategically, not maximal opening reps." },
    low_cadence_torque: { adaptation: "Cycling-specific force", recovery: "Moderate", guidance: "Avoid immediately after heavy lower-body lifting days." },
    climbing_session: { adaptation: "Sustained uphill performance", recovery: "Moderate-High", guidance: "Use conservative early pacing on long climbs." },
    time_trial: { adaptation: "Pacing and sustained race power", recovery: "Moderate-High", guidance: "Prioritize position quality and even pacing." },
    group_ride: { adaptation: "Positioning and variable pace", recovery: "Variable", guidance: "Classify post-ride by actual intensity and treat hard rides as interval days." },
    gravel_endurance: { adaptation: "Mixed-surface durability", recovery: "Moderate-High", guidance: "Practice fueling, handling, and pacing under terrain variability." },
    race_simulation: { adaptation: "Integrated performance", recovery: "High", guidance: "Replace the week’s hardest workout instead of adding on top." },
    short_maintenance: { adaptation: "Preserve cycling fitness", recovery: "Moderate", guidance: "Use minimum-effective-dose during non-cycling priority phases." },
    mixed_development: { adaptation: "Combined cycling qualities", recovery: "Moderate-High", guidance: "Keep one dominant purpose for the day despite mixed content." }
  };
  var RUN_SESSION_META = {
    recovery_run: { adaptation: "Restoration", recovery: "Very Low", guidance: "Keep easy enough to leave the athlete the same or better afterward." },
    easy_aerobic: { adaptation: "Aerobic development", recovery: "Low", guidance: "Use to support harder days rather than creeping into moderate effort." },
    easy_with_strides: { adaptation: "Aerobic + speed maintenance", recovery: "Low", guidance: "Place strides after easy running while mechanics are still crisp." },
    aerobic_endurance: { adaptation: "Sustained aerobic capacity", recovery: "Low-Moderate", guidance: "Stay controlled and avoid unintended fast finishes." },
    long_run: { adaptation: "Endurance and durability", recovery: "Moderate-High", guidance: "Follow with an easier day and progress only one load variable at a time." },
    long_run_steady_finish: { adaptation: "Late-run durability", recovery: "High", guidance: "Treat as a quality session and avoid stacking next to another hard day." },
    progression_run: { adaptation: "Pacing and aerobic strength", recovery: "Moderate", guidance: "Increase effort gradually without early surges." },
    steady_state: { adaptation: "Moderate aerobic capacity", recovery: "Moderate", guidance: "Keep clearly below threshold with stable breathing." },
    marathon_pace: { adaptation: "Marathon economy", recovery: "Moderate-High", guidance: "Use effort on terrain and avoid drift into threshold." },
    tempo_run: { adaptation: "Strong sustained aerobic work", recovery: "Moderate-High", guidance: "Start conservatively and keep rhythm controlled." },
    threshold_intervals: { adaptation: "Lactate-threshold performance", recovery: "High", guidance: "Keep reps consistent and separate from other hard days by about 48 hours when practical." },
    half_marathon_pace: { adaptation: "Sustained race-specific power", recovery: "High", guidance: "Control opening pace and avoid sprint finishes." },
    critical_velocity_10k: { adaptation: "High aerobic power", recovery: "High", guidance: "Prioritize even pacing across all repetitions." },
    vo2max_intervals: { adaptation: "Peak aerobic capacity", recovery: "High", guidance: "Avoid maximal starts and stop before form degrades." },
    fartlek: { adaptation: "Variable-speed endurance", recovery: "Moderate-High", guidance: "Use purposeful work/recovery structure, not random surging." },
    short_hill_sprints: { adaptation: "Running power", recovery: "Moderate", guidance: "Keep quality high with full recovery between reps." },
    long_hill_repeats: { adaptation: "Uphill aerobic power", recovery: "High", guidance: "Pace first reps conservatively and use effort over pace." },
    run_hike_climbing: { adaptation: "Steep-terrain economy", recovery: "Moderate", guidance: "Use intentional run-hike transitions based on grade." },
    downhill_technique: { adaptation: "Descending tolerance", recovery: "Moderate-High", guidance: "Introduce downhill loading progressively due to mechanical stress." },
    technical_trail: { adaptation: "Trail skill and coordination", recovery: "Low-Moderate", guidance: "Prioritize skill quality over metabolic fatigue." },
    trail_endurance: { adaptation: "Terrain-specific durability", recovery: "Moderate-High", guidance: "Track duration and elevation, not mileage alone." },
    race_simulation: { adaptation: "Integrated event performance", recovery: "High", guidance: "Replace the week’s hardest long run or workout rather than adding on." },
    run_walk_endurance: { adaptation: "Controlled durability", recovery: "Low-Moderate", guidance: "Use planned walk breaks as strategy, not failure." },
    short_maintenance: { adaptation: "Preserve running readiness", recovery: "Low-Moderate", guidance: "Use minimum-effective-dose during non-running priority blocks." },
    mixed_development: { adaptation: "Combined running qualities", recovery: "Moderate", guidance: "Keep one dominant adaptation despite mixed content." }
  };
  var HIKING_SESSION_META = {
    recovery_hike: { adaptation: "Restoration", recovery: "Very Low", guidance: "Keep truly easy and use for recovery support." },
    easy_aerobic_hike: { adaptation: "Aerobic development", recovery: "Low", guidance: "Build volume without pushing climbs hard." },
    brisk_fitness_hike: { adaptation: "Sustained aerobic work", recovery: "Moderate", guidance: "Keep controlled and avoid threshold-like surges." },
    long_endurance_hike: { adaptation: "Long-duration durability", recovery: "Moderate-High", guidance: "Track time and elevation, then protect the next day." },
    vertical_gain_hike: { adaptation: "Uphill aerobic capacity", recovery: "Moderate-High", guidance: "Use effort over speed and pace climbs conservatively." },
    steep_power_hiking: { adaptation: "Climbing strength-endurance", recovery: "High", guidance: "Use quality steep reps and avoid sprint starts." },
    run_hike_transition: { adaptation: "Terrain transition efficiency", recovery: "Moderate", guidance: "Practice decision points for run-hike changes." },
    loaded_pack_hike: { adaptation: "Load carriage tolerance", recovery: "Moderate-High", guidance: "Progress load gradually and monitor form under pack stress." },
    progressive_pack_hike: { adaptation: "Pack progression", recovery: "Moderate", guidance: "Increase one variable at a time (load, duration, elevation)." },
    technical_terrain_hike: { adaptation: "Technical footwork skill", recovery: "Low-Moderate", guidance: "Prioritize movement quality over speed." },
    downhill_tolerance_hike: { adaptation: "Descending tolerance", recovery: "Moderate-High", guidance: "Introduce downhill load progressively due to eccentric stress." },
    incline_stairs_treadmill: { adaptation: "Controlled vertical training", recovery: "Moderate", guidance: "Use for tightly controlled climbing dose." },
    hiking_tempo_intervals: { adaptation: "Sustained hard climbing", recovery: "High", guidance: "Separate from other hard days by about 48 hours when practical." },
    back_to_back_hiking: { adaptation: "Multi-day durability", recovery: "High", guidance: "Use as a key stressor and reduce adjacent weekly intensity." },
    adventure_simulation: { adaptation: "Objective simulation", recovery: "High", guidance: "Replace the week’s hardest session rather than adding on top." },
    short_maintenance: { adaptation: "Hiking readiness maintenance", recovery: "Low-Moderate", guidance: "Use minimum-effective-dose during other sport priorities." }
  };

  function normalizeProgramForPdf(rawProgram) {
    var warnings = [];
    var source = rawProgram && typeof rawProgram === "object" ? rawProgram : {};

    var structure = normalizeStructure(source.structure);
    var meta = source.program_meta && typeof source.program_meta === "object" ? source.program_meta : {};
    var rawPhases = Array.isArray(source.program_phases) ? source.program_phases : [];
    var rawWeeklyStructure = Array.isArray(source.weekly_structure) ? source.weekly_structure : [];
    var rawSessionPlans = source.session_plans && typeof source.session_plans === "object" ? source.session_plans : {};
    var rawDays = source.days && typeof source.days === "object" ? source.days : {};
    var customDayNames = source.custom_day_names && typeof source.custom_day_names === "object" ? source.custom_day_names : {};

    var phases = normalizePhases(rawPhases, structure.weeks, warnings);
    var activities = resolveActivities(meta, rawWeeklyStructure, rawSessionPlans, phases);
    var activityLookup = arrayToLookup(activities, "id");

    var normalizedPhases = phases.map(function (phase, idx) {
      return normalizePhaseForPdf({
        phase: phase,
        order: idx + 1,
        structure: structure,
        rawDays: rawDays,
        rawSessionPlans: rawSessionPlans,
        rawWeeklyStructure: rawWeeklyStructure,
        customDayNames: customDayNames,
        programStartDate: parseIsoDate(meta.estimated_start_date),
        activities: activities,
        activityLookup: activityLookup,
        warnings: warnings
      });
    });

    var goals = resolveGoals(meta);
    var globalAssessments = resolveGlobalAssessments(meta);
    var principles = resolvePrinciples(source, meta);
    var disclaimers = resolveDisclaimers(source);
    var coachNotes = resolveCoachNotes(normalizedPhases);

    var dates = buildProgramDates(meta, normalizedPhases);
    var version = resolveVersion(source, meta);
    var programTitle = textOrFallback(source.title || source.name, "Training Program");

    if (!normalizedPhases.length) {
      warnings.push("No phases were found. PDF includes only high-level sections.");
    }

    if (!activities.length) {
      warnings.push("No activities were inferred. Activity matrix was omitted.");
    }

    if (!goals.length) {
      warnings.push("Program goals are empty.");
    }

    var totalSessions = normalizedPhases.reduce(function (count, phase) {
      return count + (Array.isArray(phase.sessions) ? phase.sessions.length : 0);
    }, 0);

    return {
      warnings: dedupe(warnings),
      program: {
        id: textOrFallback(source.id, "program"),
        title: programTitle,
        subtitle: cleanText(source.subtitle || meta.program_subtitle || meta.program_type),
        templateKind: resolveTemplateKind(source, meta, programTitle),
        description: cleanText(source.description || meta.program_description || meta.primary_goal),
        version: version,
        brand: {
          name: textOrFallback(source.brand_name, "Nomadic Performance"),
          tagline: cleanText(source.brand_tagline || "Move Free, Thrive Wild"),
          logoUrl: resolvePdfLogoUrl(source, meta)
        },
        yearlyTemplate: resolveYearlyTemplateMeta(meta),
        framework: resolveFramework(meta),
        athlete: buildAthlete(source.athlete),
        dates: dates,
        goals: goals,
        activities: activities,
        phases: normalizedPhases,
        principles: principles.length ? principles : undefined,
        assessments: globalAssessments.length ? globalAssessments : undefined,
        worksheets: resolveWorksheets(source, meta),
        disclaimers: disclaimers.length ? disclaimers : undefined,
        coachNotes: coachNotes.length ? coachNotes : undefined,
        summary: {
          durationWeeks: dates.totalWeeks,
          totalSessions: totalSessions,
          totalPhases: normalizedPhases.length,
          totalActivities: activities.length
        }
      }
    };
  }

  function resolveTemplateKind(source, meta, title) {
    var explicit = cleanText(
      source && (source.template_kind || source.templateKind || source.pdf_template_kind || source.pdfTemplateKind)
    ).toLowerCase();

    if (explicit) {
      return explicit;
    }

    var programType = cleanText(meta && meta.program_type).toLowerCase();
    var joined = [
      cleanText(title),
      cleanText(source && source.subtitle),
      cleanText(meta && meta.program_subtitle)
    ].join(" ").toLowerCase();

    if (programType === "yearly" || programType === "annual") {
      return "yearly_template";
    }

    if (/yearly|annual|12[- ]?month|periodized training template/i.test(joined)) {
      return "yearly_template";
    }

    return "default";
  }

  function normalizePhaseForPdf(input) {
    var phase = input.phase;
    var parsedStartWeek = clampNumber(parseInt(phase.start_week, 10), 1, input.structure.weeks, 1);
    var parsedEndWeek = clampNumber(parseInt(phase.end_week, 10), parsedStartWeek, input.structure.weeks, parsedStartWeek);
    var phaseWeeks = range(parsedStartWeek, parsedEndWeek);
    var phaseLabelKey = normalizePhaseLabelKey(phase.name);

    if (phaseLabelKey) {
      var matchedWeeks = collectWeeksFromPhaseLabel(input.rawSessionPlans, phaseLabelKey);
      if (matchedWeeks.length) {
        phaseWeeks = dedupe(phaseWeeks.concat(matchedWeeks));
      }
    }

    var sessions = collectPhaseSessions({
      phase: phase,
      phaseWeeks: phaseWeeks,
      rawDays: input.rawDays,
      rawSessionPlans: input.rawSessionPlans,
      customDayNames: input.customDayNames,
      activityLookup: input.activityLookup,
      warnings: input.warnings
    });

    var weeklySchedules = buildWeeklySchedules({
      phase: phase,
      phaseWeeks: phaseWeeks,
      rawWeeklyStructure: input.rawWeeklyStructure,
      rawSessionPlans: input.rawSessionPlans,
      customDayNames: input.customDayNames,
      activityLookup: input.activityLookup
    });

    var weeklyPlacementOptions = buildWeeklyPlacementOptions({
      phaseWeeks: phaseWeeks,
      rawWeeklyStructure: input.rawWeeklyStructure,
      rawSessionPlans: input.rawSessionPlans,
      customDayNames: input.customDayNames
    });

    var activityEmphasis = buildPhaseActivityEmphasis(phase, input.activities, sessions);
    var activityPlans = buildPhaseActivityPlans(activityEmphasis, phaseWeeks);

    var objectives = compact([
      cleanText(phase.focus),
      cleanText(phase.strength_rule),
      cleanText(phase.endurance_rule)
    ]);

    var phaseAssessments = collectPhaseAssessments(phase, sessions);
    var monitoring = collectMonitoringSuggestions(phase);
    var adjustmentRules = collectAdjustmentRules(phase);

    return {
      id: "phase-" + String(input.order),
      order: input.order,
      name: normalizePhaseNameForPdf(phase.name, input.order),
      startWeek: parsedStartWeek,
      endWeek: parsedEndWeek,
      dateLabel: buildPhaseDateLabel(parsedStartWeek, parsedEndWeek, input.programStartDate),
      durationWeeks: parsedEndWeek - parsedStartWeek + 1,
      primaryObjective: objectives[0] || undefined,
      rationale: cleanText(phase.rationale),
      generalTrainingOverviewText: cleanText(phase.general_training_overview_text),
      generalWeeklyStructureText: cleanText(phase.general_weekly_structure_text),
      activityEmphasis: activityEmphasis.length ? activityEmphasis : undefined,
      objectives: objectives.length ? objectives : undefined,
      priorities: collectPhasePriorities(phase),
      qualitiesDeveloped: collectPhaseQualitiesDeveloped(phase),
      qualitiesMaintained: collectPhaseQualitiesMaintained(phase),
      weeklyPlacementOptions: weeklyPlacementOptions,
      weeklySchedules: weeklySchedules.length ? weeklySchedules : undefined,
      sessions: sessions,
      activityPlans: activityPlans.length ? activityPlans : undefined,
      monitoring: monitoring.length ? monitoring : undefined,
      adjustmentRules: adjustmentRules.length ? adjustmentRules : undefined,
      exitCriteria: collectExitCriteria(phase),
      assessments: phaseAssessments.length ? phaseAssessments : undefined
    };
  }

  function normalizePhaseLabelKey(value) {
    var text = cleanText(value).toLowerCase();
    if (!text) {
      return "";
    }

    return text
      .split(/[:\-]/)[0]
      .replace(/\s+/g, " ")
      .trim();
  }

  function collectWeeksFromPhaseLabel(rawSessionPlans, phaseLabelKey) {
    var weeks = [];
    var plans = rawSessionPlans && typeof rawSessionPlans === "object" ? rawSessionPlans : {};

    Object.keys(plans).forEach(function (slotKey) {
      var parsed = parseSlotKey(slotKey);
      if (!parsed) {
        return;
      }

      var plan = plans[slotKey] && typeof plans[slotKey] === "object" ? plans[slotKey] : {};
      var planPhaseKey = normalizePhaseLabelKey(plan.phase_name);
      if (planPhaseKey && planPhaseKey === phaseLabelKey) {
        weeks.push(parsed.week);
      }
    });

    return dedupe(weeks).sort(function (a, b) { return a - b; });
  }

  function collectPhaseSessions(input) {
    var slotKeys = Object.keys(input.rawDays || {}).filter(function (key) {
      return /^w\d+d\d+$/i.test(String(key || ""));
    });

    var scoped = slotKeys
      .map(function (slotKey) {
        var parsed = parseSlotKey(slotKey);
        if (!parsed) {
          return null;
        }
        if (input.phaseWeeks.indexOf(parsed.week) === -1) {
          return null;
        }

        var plan = input.rawSessionPlans[slotKey] && typeof input.rawSessionPlans[slotKey] === "object"
          ? input.rawSessionPlans[slotKey]
          : {};
        var exercises = Array.isArray(input.rawDays[slotKey]) ? input.rawDays[slotKey] : [];

        return normalizeSessionForPdf({
          slotKey: slotKey,
          plan: plan,
          exercises: exercises,
          customDayNames: input.customDayNames,
          activityLookup: input.activityLookup,
          warnings: input.warnings
        });
      })
      .filter(function (session) {
        return !!session;
      })
      .sort(function (a, b) {
        var parsedA = parseSlotKey(a.id.replace("session-", ""));
        var parsedB = parseSlotKey(b.id.replace("session-", ""));
        if (!parsedA || !parsedB) {
          return String(a.id).localeCompare(String(b.id));
        }
        if (parsedA.week !== parsedB.week) {
          return parsedA.week - parsedB.week;
        }
        return parsedA.workout - parsedB.workout;
      });

    return scoped;
  }

  function normalizeSessionForPdf(input) {
    var slotInfo = parseSlotKey(input.slotKey);
    if (!slotInfo) {
      return null;
    }

    var plan = input.plan && typeof input.plan === "object" ? input.plan : {};
    var exercises = Array.isArray(input.exercises) ? input.exercises : [];

    var sections = groupExercisesBySection(exercises);
    var normalizedSections = sections.map(function (group) {
      return {
        title: textOrFallback(group.section, "Session"),
        exercises: group.exercises.map(function (exercise) {
          return normalizeExerciseForPdf(exercise);
        })
      };
    }).filter(function (group) {
      return Array.isArray(group.exercises) && group.exercises.length;
    });

    var sessionTitle = resolveSessionTitle(input.slotKey, plan, input.customDayNames);
    var sessionType = cleanText(plan.session_type) || inferSessionTypeFromExercises(exercises) || "session";
    var hasSessionTitle = !!cleanText(sessionTitle);

    if (!normalizedSections.length && !hasSessionTitle && !cleanText(plan.session_goal) && !cleanText(plan.coach_notes)) {
      return null;
    }

    if (!normalizedSections.length) {
      input.warnings.push("Session '" + sessionTitle + "' has no exercises.");
    }

    var duration = parseDurationFromPlan(plan, exercises);

    return {
      id: "session-" + String(input.slotKey),
      title: sessionTitle,
      type: sessionType,
      purpose: cleanText(plan.session_goal) || cleanText(plan.objective_label) || undefined,
      duration: duration || undefined,
      targetRpe: extractRpe(cleanText(plan.intensity_target)),
      targetRir: extractRir(cleanText(plan.intensity_target)),
      sections: normalizedSections,
      coachingNotes: compact([
        cleanText(plan.coach_notes),
        cleanText(plan.terrain),
        cleanText(plan.vertical_gain)
      ]),
      progressionRules: compact([
        cleanText(plan.intensity_target)
      ])
    };
  }

  function normalizeExerciseForPdf(rawExercise) {
    var exercise = rawExercise && typeof rawExercise === "object" ? rawExercise : {};
    var sets = Array.isArray(exercise.sets) ? exercise.sets : [];
    var formatted = formatExercisePrescription(exercise, sets);

    return {
      name: textOrFallback(exercise.name, "Exercise"),
      sets: formatted.sets || undefined,
      reps: formatted.reps || undefined,
      duration: formatted.duration || undefined,
      distance: formatted.distance || undefined,
      intensity: formatted.intensity || undefined,
      load: formatted.load || undefined,
      tempo: formatted.tempo || undefined,
      rest: formatted.rest || undefined,
      rpe: formatted.rpe || undefined,
      rir: formatted.rir || undefined,
      notes: compact([
        cleanText(exercise.notes),
        cleanText(formatted.prescriptionText)
      ])
    };
  }

  function formatExercisePrescription(exercise, sets) {
    var safeSets = Array.isArray(sets) ? sets : [];
    var repValues = [];
    var durationValues = [];
    var distanceValues = [];
    var intensityValues = [];
    var restValues = [];
    var loadValues = [];
    var rpeValues = [];
    var rirValues = [];

    safeSets.forEach(function (set) {
      var source = set && typeof set === "object" ? set : {};
      var reps = firstNonEmpty(source.target_reps, source.reps);
      var load = firstNonEmpty(source.target_weight, source.weight);
      var intensity = firstNonEmpty(source.target_intensity, source.intensity);
      var rest = firstNonEmpty(source.target_rest, source.rest);
      var rpe = normalizeRpe(firstNonEmpty(source.target_rpe, source.rpe));
      var rir = normalizeRir(firstNonEmpty(source.target_rir, source.rir));

      if (reps) {
        if (looksLikeDuration(reps)) {
          durationValues.push(reps);
        } else if (looksLikeDistance(reps)) {
          distanceValues.push(reps);
        } else {
          repValues.push(reps);
        }
      }

      if (load) {
        loadValues.push(load);
      }
      if (intensity) {
        intensityValues.push(intensity);
      }
      if (rest) {
        restValues.push(rest);
      }
      if (rpe) {
        rpeValues.push(rpe);
      }
      if (rir) {
        rirValues.push(rir);
      }
    });

    var uniqueRep = summarizeSetValue(repValues);
    var uniqueDuration = summarizeSetValue(durationValues);
    var uniqueDistance = summarizeSetValue(distanceValues);
    var uniqueLoad = summarizeSetValue(loadValues);
    var uniqueIntensity = summarizeSetValue(intensityValues);
    var uniqueRest = summarizeSetValue(restValues);
    var uniqueRpe = summarizeSetValue(rpeValues);
    var uniqueRir = summarizeSetValue(rirValues);

    var setCount = safeSets.length || 0;
    var setLabel = setCount > 0 ? String(setCount) : "";

    var prescriptionParts = [];
    if (setCount > 0 && (uniqueRep || uniqueDuration || uniqueDistance)) {
      prescriptionParts.push(
        setLabel + " x " + (uniqueRep || uniqueDuration || uniqueDistance)
      );
    } else if (uniqueRep || uniqueDuration || uniqueDistance) {
      prescriptionParts.push(uniqueRep || uniqueDuration || uniqueDistance);
    }

    if (uniqueRpe) {
      prescriptionParts.push("RPE " + uniqueRpe);
    }

    return {
      sets: setLabel,
      reps: uniqueRep,
      duration: uniqueDuration,
      distance: uniqueDistance,
      intensity: uniqueIntensity,
      load: uniqueLoad,
      rest: uniqueRest,
      rpe: uniqueRpe,
      rir: uniqueRir,
      prescriptionText: prescriptionParts.join(" at ")
    };
  }

  function resolveActivities(meta, weeklyStructure, sessionPlans, phases) {
    var names = [];

    addIfText(names, cleanText(meta && meta.sport_focus));

    var objectives = Array.isArray(meta && meta.season_objectives) ? meta.season_objectives : [];
    objectives.forEach(function (objective) {
      addIfText(names, cleanText(objective && objective.sport_focus));
    });

    var normalized = dedupe(flattenSplit(names))
      .map(function (name) {
        return {
          id: toId(name),
          name: prettyActivityName(name)
        };
      })
      .filter(function (activity) {
        return !!activity.id;
      });

    return normalized;
  }

  function buildWeeklySchedules(input) {
    var schedules = [];
    var trainingDays = 7;

    input.phaseWeeks.forEach(function (week) {
      var rows = [];
      for (var day = 1; day <= trainingDays; day++) {
        var slotKey = "w" + String(week) + "d" + String(day);
        var plan = input.rawSessionPlans[slotKey] && typeof input.rawSessionPlans[slotKey] === "object"
          ? input.rawSessionPlans[slotKey]
          : {};
        var fallback = Array.isArray(input.rawWeeklyStructure) ? input.rawWeeklyStructure[day - 1] : null;
        var sessionType = cleanText(plan.session_type) || cleanText(fallback && fallback.session_type);

        rows.push({
          day: fallback && fallback.day_of_week ? toTitleCase(String(fallback.day_of_week)) : ("Day " + String(day)),
          session: resolveSessionTitle(slotKey, plan, input.customDayNames),
          activity: activityNameFromSessionType(sessionType) || inferActivityFromSportFocus(plan.sport_focus),
          intensity: cleanText(plan.intensity_target) || cleanText(fallback && fallback.note),
          duration: parseDurationFromPlan(plan, null),
          notes: compact([
            cleanText(plan.session_goal),
            cleanText(plan.coach_notes)
          ]).join(" • ") || undefined,
          optional: /optional/i.test(cleanText(sessionType) || "")
        });
      }

      if (rows.length) {
        schedules.push({
          id: "week-" + String(week),
          label: "Week " + String(week),
          rows: rows
        });
      }
    });

    return schedules;
  }

  function buildWeeklyPlacementOptions(input) {
    var phaseWeeks = Array.isArray(input.phaseWeeks) ? input.phaseWeeks : [];
    if (!phaseWeeks.length) {
      return undefined;
    }

    var sampleWeek = phaseWeeks[0];
    var rows = [];
    var specializedRows = [];

    for (var day = 1; day <= 7; day++) {
      var slotKey = "w" + String(sampleWeek) + "d" + String(day);
      var plan = input.rawSessionPlans[slotKey] && typeof input.rawSessionPlans[slotKey] === "object"
        ? input.rawSessionPlans[slotKey]
        : {};
      var fallback = Array.isArray(input.rawWeeklyStructure) ? input.rawWeeklyStructure[day - 1] : null;
      var sessionType = cleanText(plan.session_type) || cleanText(fallback && fallback.session_type);
      var sessionTitle = resolveSessionTitle(slotKey, plan, input.customDayNames);
      var sessionMeta = resolveSpecializedSessionMeta(plan, sessionType);

      var dayLabel = fallback && fallback.day_of_week
        ? toTitleCase(String(fallback.day_of_week))
        : dayNameFromIndex(day);

      var adaptation = sessionMeta
        ? sessionMeta.adaptation
        : (activityNameFromSessionType(sessionType) || "Session");

      var guidance = sessionMeta
        ? sessionMeta.guidance
        : defaultPlacementGuidance(sessionType);

      rows.push({
        day: dayLabel,
        session: sessionTitle || prettySessionTitleFromType(sessionType),
        adaptation: adaptation,
        guidance: guidance
      });

      if (sessionMeta) {
        specializedRows.push({
          day: dayLabel,
          recovery: sessionMeta.recovery,
          category: sessionMeta.category
        });
      }
    }

    if (!specializedRows.length) {
      return undefined;
    }

    return {
      weekLabel: "Template Week Placement",
      rows: rows,
      rule: buildPlacementRule(specializedRows)
    };
  }

  function resolveSpecializedSessionMeta(plan, sessionType) {
    var normalizedType = cleanText(sessionType).toLowerCase();
    if (normalizedType === "climbing") {
      var climbingType = cleanText(plan && plan.climbing_session_type).toLowerCase();
      var climbingMeta = resolveClimbingSessionMeta(climbingType);
      climbingMeta.category = "climbing";
      return climbingMeta;
    }
    if (normalizedType === "mountain_bike") {
      var mountainBikeType = cleanText(plan && plan.mountain_bike_session_type).toLowerCase();
      var mountainBikeMeta = resolveMountainBikeSessionMeta(mountainBikeType);
      mountainBikeMeta.category = "mountain_bike";
      return mountainBikeMeta;
    }
    if (normalizedType === "cycling") {
      var cyclingType = cleanText(plan && plan.cycling_session_type).toLowerCase();
      var cyclingMeta = resolveCyclingSessionMeta(cyclingType);
      cyclingMeta.category = "cycling";
      return cyclingMeta;
    }
    if (normalizedType === "run") {
      var runType = cleanText(plan && plan.run_session_type).toLowerCase();
      var runMeta = resolveRunSessionMeta(runType);
      runMeta.category = "run";
      return runMeta;
    }
    if (normalizedType === "hiking") {
      var hikingType = cleanText(plan && plan.hiking_session_type).toLowerCase();
      var hikingMeta = resolveHikingSessionMeta(hikingType);
      hikingMeta.category = "hiking";
      return hikingMeta;
    }
    return null;
  }

  function resolveClimbingSessionMeta(climbingType) {
    var key = cleanText(climbingType).toLowerCase();
    return CLIMBING_SESSION_META[key] || {
      adaptation: "Climbing-specific",
      recovery: "Moderate",
      guidance: "Place relative to fatigue cost and preserve quality movement." 
    };
  }

  function resolveMountainBikeSessionMeta(mountainBikeType) {
    var key = cleanText(mountainBikeType).toLowerCase();
    return MOUNTAIN_BIKE_SESSION_META[key] || {
      adaptation: "Mountain bike-specific",
      recovery: "Moderate",
      guidance: "Place relative to intensity and technical concentration demand." 
    };
  }

  function resolveCyclingSessionMeta(cyclingType) {
    var key = cleanText(cyclingType).toLowerCase();
    return CYCLING_SESSION_META[key] || {
      adaptation: "Cycling-specific",
      recovery: "Moderate",
      guidance: "Place relative to key adaptation and manage high-intensity spacing." 
    };
  }

  function resolveRunSessionMeta(runType) {
    var key = cleanText(runType).toLowerCase();
    return RUN_SESSION_META[key] || {
      adaptation: "Run-specific",
      recovery: "Moderate",
      guidance: "Place relative to primary adaptation and preserve movement quality." 
    };
  }

  function resolveHikingSessionMeta(hikingType) {
    var key = cleanText(hikingType).toLowerCase();
    return HIKING_SESSION_META[key] || {
      adaptation: "Hiking-specific",
      recovery: "Moderate",
      guidance: "Place by terrain, elevation, load, and session objective." 
    };
  }

  function dayNameFromIndex(dayNumber) {
    var names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return names[Math.max(1, Math.min(7, parseInt(dayNumber, 10) || 1)) - 1];
  }

  function prettySessionTitleFromType(sessionType) {
    var text = cleanText(sessionType);
    if (!text) {
      return "Session";
    }
    return toTitleCase(text.replace(/[_-]+/g, " "));
  }

  function defaultPlacementGuidance(sessionType) {
    var type = cleanText(sessionType).toLowerCase();
    if (type.indexOf("rest") > -1 || type.indexOf("mobility") > -1) {
      return "Use to improve recovery before key high-demand sessions.";
    }
    if (type.indexOf("strength") > -1 || type.indexOf("threshold") > -1 || type.indexOf("vo2") > -1) {
      return "Keep quality high and avoid stacking multiple high-fatigue days back-to-back.";
    }
    if (type.indexOf("zone") > -1 || type.indexOf("endurance") > -1) {
      return "Maintain aerobic quality without compromising the next priority session.";
    }
    return "Place relative to the week’s key performance objective.";
  }

  function buildPlacementRule(specializedRows) {
    var hasHigh = specializedRows.some(function (item) {
      return /high/i.test(String(item.recovery || ""));
    });
    var hasClimbing = specializedRows.some(function (item) {
      return item.category === "climbing";
    });
    var hasMountainBike = specializedRows.some(function (item) {
      return item.category === "mountain_bike";
    });
    var hasCycling = specializedRows.some(function (item) {
      return item.category === "cycling";
    });
    var hasRun = specializedRows.some(function (item) {
      return item.category === "run";
    });
    var hasHiking = specializedRows.some(function (item) {
      return item.category === "hiking";
    });

    if (hasClimbing && hasMountainBike && hasCycling && hasRun && hasHiking) {
      return hasHigh
        ? "Separate high-recovery climbing, mountain-bike, cycling, run, and hiking quality days with easier sessions between when practical, and protect 24-48 hours after maximal work."
        : "Place all specialized sessions by primary adaptation so adjacent stress remains complementary rather than competing.";
    }
    if (hasHiking && (hasClimbing || hasMountainBike || hasCycling || hasRun)) {
      return hasHigh
        ? "Separate high-load hiking days (steep intervals, loaded, back-to-back, simulation) from other high-demand sport days by about 48 hours when practical."
        : "Place hiking days by adaptation (aerobic, vertical, load, technical, downhill, durability) so neighboring stress is complementary.";
    }
    if (hasHiking) {
      return hasHigh
        ? "Separate steep intervals, heavy loaded hikes, back-to-back days, and adventure simulations by about 48 hours when practical; keep recovery hikes easy."
        : "Progress hiking through time, elevation, terrain, and pack load gradually without raising all variables at once.";
    }
    if (hasClimbing && hasMountainBike && hasCycling && hasRun) {
      return hasHigh
        ? "Separate high-recovery climbing, mountain-bike, cycling, and run quality days with easier sessions between when practical, and protect 24-48 hours after maximal work."
        : "Place climbing, mountain-bike, cycling, and run sessions by adaptation so adjacent stress remains complementary rather than competing.";
    }
    if (hasRun && (hasClimbing || hasMountainBike || hasCycling)) {
      return hasHigh
        ? "Separate threshold/VO2/hill/race-simulation run sessions from other high-load sport days by about 48 hours when practical."
        : "Place run sessions by primary adaptation and keep surrounding day stress complementary.";
    }
    if (hasRun) {
      return hasHigh
        ? "Separate threshold, VO2max, hard hill, and race-simulation run sessions by about 48 hours when practical, and keep recovery runs genuinely easy."
        : "Progress run load by gradually building volume, then intensity, while controlling elevation and technical demand.";
    }
    if (hasClimbing && hasMountainBike && hasCycling) {
      return hasHigh
        ? "Separate high-recovery climbing, mountain-bike, and cycling quality days with lower-load sessions when possible, and protect the next 24-48 hours after maximal work."
        : "Place climbing, mountain-bike, and cycling sessions by primary adaptation so adjacent day stress is complementary rather than competing.";
    }
    if (hasClimbing && hasMountainBike) {
      return hasHigh
        ? "Separate high-recovery climbing and mountain-bike days with lower-load sessions when possible, and protect the next 24-48 hours after maximal work."
        : "Place climbing and mountain-bike sessions by primary adaptation so adjacent day stress is complementary rather than competing.";
    }
    if (hasClimbing && hasCycling) {
      return hasHigh
        ? "Separate high-recovery climbing and cycling quality sessions by about 48 hours when practical, and use easier sessions between them."
        : "Place climbing and cycling days by adaptation so technical and metabolic stressors complement one another.";
    }
    if (hasMountainBike && hasCycling) {
      return hasHigh
        ? "Separate high-recovery mountain-bike and cycling interval days by about 48 hours when practical, and protect post-interval recovery windows."
        : "Place mountain-bike and cycling sessions by adaptation so adjacent stress is complementary rather than competitive.";
    }
    if (hasCycling) {
      return hasHigh
        ? "Separate threshold, VO2max, anaerobic, and hard group-ride cycling sessions by about 48 hours when practical, and keep recovery rides genuinely easy."
        : "Progress cycling load by building endurance volume and interval duration before adding more intensity.";
    }
    if (hasMountainBike) {
      return hasHigh
        ? "Place high-recovery-cost mountain-bike sessions after easier days when possible, and protect the following 24-48 hours with lower-load work or recovery rides."
        : "Place mountain-bike sessions by primary adaptation and keep adjacent day stress complementary rather than competitive.";
    }
    if (hasHigh) {
      return "Place high-recovery-cost climbing sessions after easier days when possible, and protect the following 24-48 hours with lower-load work or rest.";
    }
    return "Place climbing sessions by primary adaptation and keep adjacent day stress complementary rather than competitive.";
  }

  function buildPhaseActivityEmphasis(phase, activities, sessions) {
    var emphasis = [];
    var phaseFocus = cleanText(phase && phase.focus);
    var primaryActivityId = phaseFocus ? toId(phaseFocus) : "";

    var sessionTypeText = (Array.isArray(sessions) ? sessions : [])
      .map(function (session) { return String(session && session.type || ""); })
      .join(" ")
      .toLowerCase();

    (Array.isArray(activities) ? activities : []).forEach(function (activity) {
      var status = "optional";
      if (primaryActivityId && activity.id === primaryActivityId) {
        status = "primary";
      } else if (sessionTypeText.indexOf(activity.id) > -1) {
        status = "develop";
      }

      emphasis.push({
        activityId: activity.id,
        status: status,
        frequency: cleanFrequencyLabel(phase),
        notes: status === "primary" ? "Primary emphasis in this phase." : undefined
      });
    });

    return emphasis.filter(function (item) {
      return item.status !== "optional";
    }).length
      ? emphasis
      : [];
  }

  function buildPhaseActivityPlans(activityEmphasis, phaseWeeks) {
    return (Array.isArray(activityEmphasis) ? activityEmphasis : [])
      .filter(function (item) {
        return item.status !== "optional";
      })
      .map(function (item) {
        return {
          activityId: item.activityId,
          purpose: item.status === "primary" ? "Primary phase focus." : "Support primary phase focus.",
          frequency: item.frequency,
          intensityGuidance: item.status === "primary" ? "Progressive loading with quality execution." : "Moderate support load.",
          volumeGuidance: "Adjust by recovery markers and response.",
          technicalPriorities: ["Movement quality", "Positioning", "Pacing"],
          progressionByWeek: phaseWeeks.map(function (week, idx) {
            return "Week " + String(week) + ": " + (idx === phaseWeeks.length - 1 ? "Consolidate" : "Progress");
          }),
          restrictions: ["Modify when pain or fatigue is elevated."],
          recoveryRules: ["Preserve sleep and readiness before key sessions."],
          advancementCriteria: ["Consistent execution at target effort."]
        };
      });
  }

  function collectPhaseAssessments(phase, sessions) {
    var results = [];

    parseLines(cleanText(phase && phase.phase_assessments_text)).forEach(function (line) {
      var parts = String(line || "").split("|");
      var title = cleanText(parts[0]);
      if (!title) {
        return;
      }
      results.push({
        title: title,
        benchmark: cleanText(parts[1]),
        notes: compact([cleanText(parts.slice(2).join("|"))])
      });
    });

    if (cleanText(phase && phase.name).toLowerCase().indexOf("test") > -1) {
      results.push({ title: "Phase test block", notes: ["Verify readiness before progression."] });
    }

    (Array.isArray(sessions) ? sessions : []).forEach(function (session) {
      if (/assessment|test|benchmark/i.test(String(session && session.type || "") + " " + String(session && session.title || ""))) {
        results.push({
          title: textOrFallback(session.title, "Assessment Session"),
          benchmark: cleanText(session.purpose),
          notes: session.coachingNotes
        });
      }
    });

    return dedupeByTitle(results);
  }

  function collectMonitoringSuggestions(phase) {
    var custom = parseLines(cleanText(phase && phase.monitoring_metrics_text)).map(function (line) {
      var parts = String(line || "").split("|");
      return {
        metric: cleanText(parts[0]),
        frequency: cleanText(parts[1]) || cleanFrequencyLabel(phase) || "Daily or per session",
        target: cleanText(parts[2]),
        notes: cleanText(parts.slice(3).join("|")) || "Track trend over time and compare to training load."
      };
    }).filter(function (item) {
      return !!item.metric;
    });

    if (custom.length) {
      return custom;
    }

    var defaults = ["Fatigue", "Soreness", "Sleep", "Readiness", "Session RPE"];
    var frequency = cleanFrequencyLabel(phase) || "Daily or per session";

    return defaults.map(function (metric) {
      return {
        metric: metric,
        frequency: frequency,
        notes: "Track trend over time and compare to training load."
      };
    });
  }

  function collectAdjustmentRules(phase) {
    var customProgress = parseLines(cleanText(phase && phase.progress_rules_text));
    var customReduce = parseLines(cleanText(phase && phase.reduce_rules_text));
    var customStop = parseLines(cleanText(phase && phase.stop_rules_text));

    if (customProgress.length || customReduce.length || customStop.length) {
      return []
        .concat(customProgress.map(function (rule) { return { category: "progress", rule: rule }; }))
        .concat(customReduce.map(function (rule) { return { category: "reduce", rule: rule }; }))
        .concat(customStop.map(function (rule) { return { category: "stop", rule: rule }; }));
    }

    var strengthRule = cleanText(phase && phase.strength_rule);
    var enduranceRule = cleanText(phase && phase.endurance_rule);

    var rules = [];
    if (strengthRule) {
      rules.push({ category: "progress", rule: strengthRule });
    }
    if (enduranceRule) {
      rules.push({ category: "reduce", rule: enduranceRule });
    }

    if (!rules.length) {
      rules.push({ category: "progress", rule: "Progress when recovery and execution quality are strong." });
      rules.push({ category: "reduce", rule: "Reduce when fatigue, pain, or sleep disruption rises." });
      rules.push({ category: "stop", rule: "Stop and reassess when symptoms escalate." });
    }

    return rules;
  }

  function collectExitCriteria(phase) {
    var custom = parseLines(cleanText(phase && phase.exit_criteria_text));
    if (custom.length) {
      return custom;
    }

    var criteria = [];
    var focus = cleanText(phase && phase.focus);
    if (focus) {
      criteria.push("Consistent execution of " + focus + " goals.");
    }
    criteria.push("Targets met with manageable fatigue.");
    return criteria;
  }

  function collectPhasePriorities(phase) {
    var custom = parseLines(cleanText(phase && phase.priorities_text));
    return custom;
  }

  function collectPhaseQualitiesDeveloped(phase) {
    var values = [];
    if (parseInt(phase && phase.strength_days_per_week, 10) > 0) {
      values.push("Strength");
    }
    if (parseInt(phase && (phase.cardio_days_per_week != null ? phase.cardio_days_per_week : phase.endurance_days_per_week), 10) > 0) {
      values.push("Endurance");
    }
    if (parseInt(phase && (phase.skill_days_per_week != null ? phase.skill_days_per_week : phase.mobility_days_per_week), 10) > 0) {
      values.push("Skill / Mobility");
    }
    return values;
  }

  function collectPhaseQualitiesMaintained(phase) {
    if (!phase) {
      return [];
    }
    return ["Recovery", "Movement quality"];
  }

  function buildProgramDates(meta, normalizedPhases) {
    var startDate = parseIsoDate(meta && meta.estimated_start_date);
    var totalWeeks = normalizedPhases.reduce(function (maxWeek, phase) {
      var order = Number(phase && phase.durationWeeks || 0);
      return maxWeek + (order > 0 ? order : 0);
    }, 0);

    if (!totalWeeks && Array.isArray(normalizedPhases) && normalizedPhases.length) {
      totalWeeks = normalizedPhases.length;
    }

    var endDate = startDate && totalWeeks
      ? addDays(startDate, Math.max(0, totalWeeks * 7 - 1))
      : null;

    var display = "";
    if (startDate && endDate) {
      display = formatDate(startDate) + " - " + formatDate(endDate);
    } else if (startDate) {
      display = "Starts " + formatDate(startDate);
    }

    return {
      startDate: startDate ? formatIsoDate(startDate) : undefined,
      endDate: endDate ? formatIsoDate(endDate) : undefined,
      displayLabel: display || undefined,
      totalWeeks: totalWeeks || undefined
    };
  }

  function resolveGoals(meta) {
    var goals = [];

    addGoal(goals, cleanText(meta && meta.primary_goal), "primary");
    addGoal(goals, cleanText(meta && meta.secondary_goal), "secondary");

    var objectives = Array.isArray(meta && meta.season_objectives) ? meta.season_objectives : [];
    objectives.forEach(function (objective) {
      addGoal(goals, cleanText(objective && objective.primary_goal), "event", cleanText(objective && objective.sport_focus));
    });

    return goals;
  }

  function resolveGlobalAssessments(meta) {
    var objectives = Array.isArray(meta && meta.season_objectives) ? meta.season_objectives : [];
    return objectives
      .map(function (objective) {
        var title = cleanText(objective && objective.label);
        if (!title) {
          return null;
        }
        return {
          title: title,
          dateLabel: cleanText(objective && objective.peak_date),
          benchmark: cleanText(objective && objective.primary_goal),
          notes: compact([
            cleanText(objective && objective.notes),
            cleanText(objective && objective.sport_focus)
          ])
        };
      })
      .filter(function (assessment) {
        return !!assessment;
      });
  }

  function resolvePrinciples(source, meta) {
    var principles = [];

    addIfText(principles, cleanText(source && source.primary_principle));
    parseLines(cleanText(meta && meta.program_principles_text)).forEach(function (line) {
      addIfText(principles, line);
    });

    var tags = Array.isArray(meta && meta.tags) ? meta.tags : [];
    tags.forEach(function (tag) {
      addIfText(principles, toTitleCase(String(tag).replace(/[_-]+/g, " ")));
    });

    return dedupe(principles);
  }

  function resolveDisclaimers(source) {
    var disclaimers = [];
    var fromSource = source && Array.isArray(source.disclaimers) ? source.disclaimers : [];
    fromSource.forEach(function (item) {
      addIfText(disclaimers, cleanText(item));
    });

    var meta = source && source.program_meta && typeof source.program_meta === "object"
      ? source.program_meta
      : {};

    addIfText(disclaimers, cleanText(meta.program_assumption));
    parseLines(cleanText(meta.program_disclaimers_text)).forEach(function (line) {
      addIfText(disclaimers, line);
    });

    if (!disclaimers.length) {
      disclaimers.push("Assume normal recovery, nutrition, and sleep compliance unless noted otherwise.");
    }

    return dedupe(disclaimers);
  }

  function resolveCoachNotes(phases) {
    var notes = [];

    (Array.isArray(phases) ? phases : []).forEach(function (phase) {
      (Array.isArray(phase && phase.sessions) ? phase.sessions : []).forEach(function (session) {
        (Array.isArray(session && session.coachingNotes) ? session.coachingNotes : []).forEach(function (note) {
          addIfText(notes, cleanText(note));
        });
      });
    });

    return dedupe(notes).slice(0, 20);
  }

  function resolveWorksheets(source, meta) {
    var worksheets = source && Array.isArray(source.worksheets) ? source.worksheets : [];
    var normalized = worksheets
      .map(function (worksheet) {
        var item = worksheet && typeof worksheet === "object" ? worksheet : {};
        var title = cleanText(item.title || item.name);
        if (!title) {
          return null;
        }
        return {
          title: title,
          description: cleanText(item.description)
        };
      })
      .filter(function (worksheet) {
        return !!worksheet;
      });

    parseLines(cleanText(meta && meta.program_worksheets_text)).forEach(function (line) {
      var parts = String(line || "").split("|");
      var title = cleanText(parts[0]);
      if (!title) {
        return;
      }
      normalized.push({
        title: title,
        description: cleanText(parts.slice(1).join("|"))
      });
    });

    return normalized.length ? normalized : undefined;
  }

  function resolveVersion(source, meta) {
    if (cleanText(meta && meta.program_version)) {
      return cleanText(meta.program_version);
    }
    if (cleanText(source && source.version)) {
      return cleanText(source.version);
    }
    if (cleanText(source && source.updated_at)) {
      return "Updated " + cleanText(source.updated_at).slice(0, 10);
    }
    return "v1";
  }

  function resolveFramework(meta) {
    var source = meta && typeof meta === "object" ? meta : {};
    return {
      heading: cleanText(source.framework_heading),
      intro: cleanText(source.framework_intro),
      ruleTitle: cleanText(source.framework_rule_title),
      ruleBody: cleanText(source.framework_rule_body),
      priorities: parseLines(cleanText(source.framework_priorities_text)),
      variablesToIndividualize: parseLines(cleanText(source.framework_variables_text)),
      waveHeading: cleanText(source.framework_wave_heading),
      loadingWaveRows: parseWaveRows(source.framework_wave_rows_text),
      waveFooter: cleanText(source.framework_wave_footer)
    };
  }

  function resolveYearlyTemplateMeta(meta) {
    var source = meta && typeof meta === "object" ? meta : {};
    return {
      athleteName: cleanText(source.yearly_athlete_name),
      programYear: cleanText(source.yearly_program_year),
      primarySport: cleanText(source.yearly_primary_sport),
      secondarySports: cleanText(source.yearly_secondary_sports),
      coachProvider: cleanText(source.yearly_coach_provider),
      planStartDate: cleanText(source.yearly_plan_start_date),
      trainingAge: cleanText(source.yearly_training_age),
      currentWeeklyVolume: cleanText(source.yearly_current_weekly_volume),
      currentStrengthFrequency: cleanText(source.yearly_current_strength_frequency),
      currentEnduranceFrequency: cleanText(source.yearly_current_endurance_frequency),
      availableTrainingDays: cleanText(source.yearly_available_training_days),
      typicalSessionDuration: cleanText(source.yearly_typical_session_duration),
      relevantInjuryHistory: cleanText(source.yearly_relevant_injury_history),
      equipmentAccess: cleanText(source.yearly_equipment_access),
      travelWorkConstraints: cleanText(source.yearly_travel_work_constraints),
      preferredRecoveryDay: cleanText(source.yearly_preferred_recovery_day),
      description: cleanText(source.yearly_description),
      assumption: cleanText(source.yearly_assumption),
      tagline: cleanText(source.yearly_tagline),
      progressionRule: cleanText(source.yearly_progression_rule),
      concurrentRule: cleanText(source.yearly_concurrent_rule),
      annualGoalsRows: parsePipeRows(source.yearly_annual_goals_rows_text, ["goal", "target_window", "success_measure", "priority"]),
      programmingPhilosophy: cleanText(source.yearly_programming_philosophy),
      calendarRows: parsePipeRows(source.yearly_calendar_rows_text, ["month", "primary", "secondary", "event", "priority", "constraints", "notes"]),
      phaseMapRows: parsePipeRows(source.yearly_phase_map_rows_text, ["phase", "months", "purpose", "primary", "secondary", "entry", "exit"]),
      transitionRows: parsePipeRows(source.yearly_transition_rows_text, ["timing", "reason", "adjustment", "return"]),
      testingRows: parsePipeRows(source.yearly_testing_rows_text, ["metric", "baseline", "mid", "pre_peak", "post", "rule"]),
      monthOverviewRows: parsePipeRows(source.yearly_month_overview_rows_text, ["month", "phase", "emphasis", "dates", "primary", "secondary", "event", "access", "load"]),
      monthPriorityRows: parsePipeRows(source.yearly_month_priority_rows_text, ["month", "primary", "secondary", "maintain"]),
      monthTargetRows: parsePipeRows(source.yearly_month_target_rows_text, ["month", "volume_frequency", "intensity_density", "strength_power", "aerobic_conditioning", "sport_skill", "mobility_recovery", "testing_logistics", "adjustment_criteria"]),
      monthWeekRows: parsePipeRows(source.yearly_month_week_rows_text, ["month", "week", "primary_focus", "volume_target", "intensity_target", "key_sessions", "strength_secondary", "recovery_review"]),
      monthReviewRows: parsePipeRows(source.yearly_month_review_rows_text, ["month", "review"]),
      calendarInterpretation: cleanText(source.yearly_calendar_interpretation),
      halfYearReviewRows: parsePipeRows(source.yearly_half_year_review_rows_text, ["progress", "working", "modify", "decision"]),
      endYearReviewRows: parsePipeRows(source.yearly_end_year_review_rows_text, ["achievement", "best", "persistent", "next"]),
      capabilityMatrixRows: parsePipeRows(source.yearly_capability_matrix_rows_text, ["month", "strength", "power", "aerobic", "threshold", "anaerobic", "skill", "mobility", "recovery"]),
      monitoringRows: parsePipeRows(source.yearly_monitoring_rows_text, ["metric", "scale", "threshold"]),
      adjustmentOrder: cleanText(source.yearly_adjustment_order),
      defaultWeekRows: parsePipeRows(source.yearly_default_week_rows_text, ["day", "primary_session", "secondary_session", "target_load", "purpose", "modification_rule"]),
      strengthFrameworkRows: parsePipeRows(source.yearly_strength_framework_rows_text, ["quality", "build", "peak", "maintenance", "progression"]),
      annualReviewGoalRows: parsePipeRows(source.yearly_annual_review_goal_rows_text, ["goal", "outcome", "evidence", "influenced", "next_decision"]),
      annualReviewLessonRows: parsePipeRows(source.yearly_annual_review_lessons_rows_text, ["continue", "modify", "stop"]),
      nextYearStartRows: parsePipeRows(source.yearly_next_year_start_rows_text, ["category", "current", "next", "action"]),
      coachAthleteSummary: cleanText(source.yearly_coach_athlete_summary),
      planningNotesRows: parsePipeRows(source.yearly_planning_notes_rows_text, ["note"])
    };
  }

  function parsePipeRows(value, keys) {
    var columns = Array.isArray(keys) ? keys : [];
    if (!columns.length) {
      return [];
    }

    return parseLines(value).map(function (line) {
      var parts = String(line || "").split("|");
      var row = {};
      columns.forEach(function (key, index) {
        row[key] = cleanText(index === columns.length - 1 ? parts.slice(index).join("|") : parts[index]);
      });
      return row;
    }).filter(function (row) {
      return columns.some(function (key) {
        return !!cleanText(row[key]);
      });
    });
  }

  function renderYearlyValue(value, placeholder) {
    var text = cleanText(value);
    if (text) {
      return escapeHtml(text);
    }
    return '<span class="npdf-yearly-italic">[' + escapeHtml(placeholder) + ']</span>';
  }

  function findYearlyMonthOverviewRow(yearly, monthName) {
    var rows = Array.isArray(yearly && yearly.monthOverviewRows) ? yearly.monthOverviewRows : [];
    return findYearlyMonthRow(rows, monthName);
  }

  function findYearlyMonthRow(rows, monthName) {
    var source = Array.isArray(rows) ? rows : [];
    var target = cleanText(monthName).toLowerCase();
    if (!target) {
      return null;
    }

    return source.find(function (row) {
      var month = cleanText(row && row.month).toLowerCase();
      return month === target || month.indexOf(target) === 0;
    }) || null;
  }

  function findYearlyMonthRows(rows, monthName) {
    var source = Array.isArray(rows) ? rows : [];
    var target = cleanText(monthName).toLowerCase();
    if (!target) {
      return [];
    }

    return source.filter(function (row) {
      var month = cleanText(row && row.month).toLowerCase();
      return month === target || month.indexOf(target) === 0;
    });
  }

  function parseYearlyWeekNumber(value, fallback) {
    var text = cleanText(value);
    var match = text.match(/(\d+)/);
    if (match) {
      var num = parseInt(match[1], 10);
      if (Number.isFinite(num) && num > 0) {
        return num;
      }
    }
    return fallback;
  }

  function splitYearlyItems(value) {
    return String(value == null ? "" : value)
      .split(/\n|;/)
      .map(function (item) { return cleanText(item); })
      .filter(Boolean);
  }

  function deriveYearlyCalendarInterpretation(yearly) {
    var explicit = cleanText(yearly && yearly.calendarInterpretation);
    if (explicit) {
      return explicit;
    }

    var rows = Array.isArray(yearly && yearly.calendarRows) ? yearly.calendarRows : [];
    if (!rows.length) {
      return "";
    }

    var priorityMonths = [];
    var constrainedMonths = [];
    rows.forEach(function (row) {
      var month = cleanText(row && row.month);
      var priority = cleanText(row && row.priority).toLowerCase();
      var constraints = cleanText(row && row.constraints);
      if (month && /high|peak|event|race|priority/i.test(priority)) {
        priorityMonths.push(month);
      }
      if (month && constraints) {
        constrainedMonths.push(month);
      }
    });

    var parts = [];
    if (priorityMonths.length) {
      parts.push("Highest-priority windows: " + priorityMonths.join(", ") + ".");
    }
    if (constrainedMonths.length) {
      parts.push("Constraint-heavy months: " + constrainedMonths.join(", ") + ".");
    }
    if (!parts.length) {
      parts.push("Use the calendar rows to identify peak windows, constrained months, and where sports compete for available training time.");
    }
    return parts.join(" ");
  }

  function buildYearlyReviewRows(yearly, months, reviewCols, reviewKey) {
    var cols = Array.isArray(reviewCols) ? reviewCols : [];
    var sourceRows = [];
    if (reviewKey === "half") {
      sourceRows = Array.isArray(yearly && yearly.halfYearReviewRows) ? yearly.halfYearReviewRows : [];
    } else if (reviewKey === "end") {
      sourceRows = Array.isArray(yearly && yearly.endYearReviewRows) ? yearly.endYearReviewRows : [];
    }

    if (sourceRows.length) {
      var explicitRows = sourceRows.slice(0, 2).map(function (row) {
        return {
          cells: cols.map(function (_col, idx) {
            var values = Object.values(row || {}).map(function (value) {
              return cleanText(value);
            });
            return values[idx] || "";
          })
        };
      });

      while (explicitRows.length < 2) {
        explicitRows.push({ cells: cols.map(function () { return ""; }) });
      }
      return explicitRows;
    }

    var monthNames = Array.isArray(months) ? months : [];
    var reviews = monthNames.map(function (month) {
      var row = findYearlyMonthRow(yearly && yearly.monthReviewRows, month) || {};
      return {
        month: month,
        review: cleanText(row.review)
      };
    }).filter(function (item) {
      return !!item.review;
    });

    var rows = reviews.slice(0, 2).map(function (item) {
      var segments = splitYearlyItems(item.review);
      var cells = cols.map(function (_col, idx) {
        if (idx === 0) {
          return segments[0] || item.review;
        }
        return segments[idx] || "";
      });
      return { cells: cells };
    });

    while (rows.length < 2) {
      rows.push({
        cells: cols.map(function () { return ""; })
      });
    }

    return rows;
  }

  function buildYearlyCapabilityMatrixRows(yearly, months) {
    var explicitRows = Array.isArray(yearly && yearly.capabilityMatrixRows) ? yearly.capabilityMatrixRows : [];
    if (explicitRows.length) {
      var byMonth = {};
      explicitRows.forEach(function (row) {
        var key = cleanText(row && row.month).toLowerCase();
        if (key) {
          byMonth[key] = row;
        }
      });

      return (Array.isArray(months) ? months : []).map(function (month) {
        var row = byMonth[cleanText(month).toLowerCase()] || {};
        return {
          month: month,
          strength: cleanText(row.strength),
          power: cleanText(row.power),
          aerobic: cleanText(row.aerobic),
          threshold: cleanText(row.threshold),
          anaerobic: cleanText(row.anaerobic),
          skill: cleanText(row.skill),
          mobility: cleanText(row.mobility),
          recovery: cleanText(row.recovery)
        };
      });
    }

    return (Array.isArray(months) ? months : []).map(function (month) {
      var target = findYearlyMonthRow(yearly && yearly.monthTargetRows, month) || {};
      return {
        month: month,
        strength: cleanText(target.strength_power),
        power: cleanText(target.strength_power),
        aerobic: cleanText(target.aerobic_conditioning),
        threshold: cleanText(target.intensity_density),
        anaerobic: cleanText(target.intensity_density),
        skill: cleanText(target.sport_skill),
        mobility: cleanText(target.mobility_recovery),
        recovery: cleanText(target.adjustment_criteria)
      };
    });
  }

  function collectYearlyMonitoringRows(program) {
    var yearly = program && program.yearlyTemplate ? program.yearlyTemplate : {};
    var explicit = Array.isArray(yearly && yearly.monitoringRows) ? yearly.monitoringRows : [];
    if (explicit.length) {
      return explicit.map(function (row) {
        return {
          metric: cleanText(row.metric),
          scale: cleanText(row.scale),
          threshold: cleanText(row.threshold)
        };
      }).filter(function (row) {
        return row.metric || row.scale || row.threshold;
      }).slice(0, 8);
    }

    var rows = [];
    var seen = {};
    (Array.isArray(program && program.phases) ? program.phases : []).forEach(function (phase) {
      (Array.isArray(phase && phase.monitoring) ? phase.monitoring : []).forEach(function (item) {
        var metric = cleanText(item && item.metric);
        if (!metric) {
          return;
        }
        var key = metric.toLowerCase();
        if (seen[key]) {
          return;
        }
        seen[key] = true;
        rows.push({
          metric: metric,
          scale: cleanText(item && item.frequency),
          threshold: cleanText(item && item.target)
        });
      });
    });
    return rows.slice(0, 8);
  }

  function deriveYearlyAdjustmentOrder(program, yearly) {
    var explicit = cleanText(yearly && yearly.adjustmentOrder);
    if (explicit) {
      return explicit;
    }

    var rules = [];
    (Array.isArray(program && program.phases) ? program.phases : []).forEach(function (phase) {
      (Array.isArray(phase && phase.adjustmentRules) ? phase.adjustmentRules : []).forEach(function (item) {
        var ruleText = cleanText(item && item.rule);
        if (ruleText) {
          rules.push(ruleText);
        }
      });
    });

    rules = dedupe(rules);
    if (rules.length) {
      return rules.slice(0, 4).join(" | ");
    }

    return cleanText(yearly && yearly.progressionRule) || cleanText(yearly && yearly.concurrentRule);
  }

  function buildYearlyDefaultWeekRows(program) {
    var yearly = program && program.yearlyTemplate ? program.yearlyTemplate : {};
    var explicitRows = Array.isArray(yearly && yearly.defaultWeekRows) ? yearly.defaultWeekRows : [];
    if (explicitRows.length) {
      return explicitRows.map(function (row) {
        return {
          day: cleanText(row.day),
          primarySession: cleanText(row.primary_session),
          secondarySession: cleanText(row.secondary_session),
          targetLoad: cleanText(row.target_load),
          purpose: cleanText(row.purpose),
          modificationRule: cleanText(row.modification_rule)
        };
      });
    }

    var dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    var firstPhase = Array.isArray(program && program.phases) && program.phases.length ? program.phases[0] : null;
    var scheduleRows = firstPhase && Array.isArray(firstPhase.weeklySchedules) && firstPhase.weeklySchedules.length
      ? firstPhase.weeklySchedules[0].rows || []
      : [];

    var byDay = {};
    scheduleRows.forEach(function (row) {
      var key = cleanText(row && row.day).toLowerCase();
      if (key) {
        byDay[key] = row;
      }
    });

    return dayLabels.map(function (day) {
      var row = byDay[day.toLowerCase()] || {};
      return {
        day: day,
        primarySession: cleanText(row.session),
        secondarySession: cleanText(row.activity),
        targetLoad: cleanText(row.intensity),
        purpose: cleanText(row.notes),
        modificationRule: ""
      };
    });
  }

  function buildYearlyStrengthFrameworkRows(program, yearly) {
    var explicitRows = Array.isArray(yearly && yearly.strengthFrameworkRows) ? yearly.strengthFrameworkRows : [];
    if (explicitRows.length) {
      return explicitRows.map(function (row) {
        return {
          quality: cleanText(row.quality),
          build: cleanText(row.build),
          peak: cleanText(row.peak),
          maintain: cleanText(row.maintenance),
          progression: cleanText(row.progression)
        };
      });
    }

    var targetRows = Array.isArray(yearly && yearly.monthTargetRows) ? yearly.monthTargetRows : [];
    var firstTarget = targetRows.length ? targetRows[0] : {};
    var lastTarget = targetRows.length ? targetRows[targetRows.length - 1] : {};
    var maintainHint = (Array.isArray(yearly && yearly.monthPriorityRows) ? yearly.monthPriorityRows : []).map(function (row) {
      return cleanText(row && row.maintain);
    }).filter(Boolean)[0] || "";

    return [
      {
        quality: "Max strength",
        build: cleanText(firstTarget.strength_power),
        peak: cleanText(lastTarget.strength_power),
        maintain: maintainHint,
        progression: cleanText(yearly && yearly.progressionRule)
      },
      {
        quality: "Power / plyometrics",
        build: cleanText(firstTarget.intensity_density),
        peak: cleanText(lastTarget.intensity_density),
        maintain: maintainHint,
        progression: cleanText(yearly && yearly.progressionRule)
      },
      {
        quality: "Muscular endurance",
        build: cleanText(firstTarget.volume_frequency),
        peak: cleanText(lastTarget.volume_frequency),
        maintain: maintainHint,
        progression: cleanText(yearly && yearly.progressionRule)
      },
      {
        quality: "Aerobic conditioning",
        build: cleanText(firstTarget.aerobic_conditioning),
        peak: cleanText(lastTarget.aerobic_conditioning),
        maintain: maintainHint,
        progression: cleanText(yearly && yearly.progressionRule)
      },
      {
        quality: "Mobility / resilience",
        build: cleanText(firstTarget.mobility_recovery),
        peak: cleanText(lastTarget.mobility_recovery),
        maintain: maintainHint,
        progression: cleanText(yearly && yearly.progressionRule)
      }
    ];
  }

  function buildYearlyFallbackWeekRows(program) {
    var defaultRows = buildYearlyDefaultWeekRows(program);
    return [1, 2, 3, 4].map(function (weekNumber) {
      var row = defaultRows[Math.min(weekNumber - 1, defaultRows.length - 1)] || {};
      return {
        week: "Week " + String(weekNumber),
        primary_focus: cleanText(row.primarySession),
        volume_target: cleanText(row.purpose),
        intensity_target: cleanText(row.targetLoad),
        key_sessions: cleanText(row.primarySession),
        strength_secondary: cleanText(row.secondarySession),
        recovery_review: ""
      };
    });
  }

  function parseWaveRows(value) {
    return parseLines(value).map(function (line) {
      var parts = String(line || "").split("|");
      return {
        week: cleanText(parts[0]),
        target: cleanText(parts[1]),
        adjustment: cleanText(parts.slice(2).join("|"))
      };
    }).filter(function (row) {
      return !!row.week || !!row.target || !!row.adjustment;
    });
  }

  function buildAthlete(athlete) {
    var source = athlete && typeof athlete === "object" ? athlete : {};
    var name = cleanText(source.name);
    var email = cleanText(source.email);
    var id = cleanText(source.id);

    if (!name && !email && !id) {
      return undefined;
    }

    return {
      id: id || undefined,
      name: name || undefined,
      email: email || undefined
    };
  }

  function buildProgramPdfDocument(program, warnings) {
    var pages = [];

    if (String(program && program.templateKind || "").toLowerCase() === "yearly_template") {
      pages = buildYearlyTemplatePages(program);
    } else {
      pages.push(renderCoverPage(program));
      pages.push(renderHowToUsePage(program, warnings));
      pages.push(renderProgramAtGlancePage(program));

      (Array.isArray(program.phases) ? program.phases : []).forEach(function (phase) {
        pages.push(renderPhasePage(program, phase));
      });

      if (Array.isArray(program.assessments) && program.assessments.length) {
        pages.push(renderAssessmentsPage(program));
      }

      if (Array.isArray(program.worksheets) && program.worksheets.length) {
        pages.push(renderWorksheetsPage(program));
      }

      // Coach Notes and Final Summary pages intentionally omitted.
    }

    return [
      "<!DOCTYPE html>",
      "<html lang=\"en\">",
      "<head>",
      "<meta charset=\"UTF-8\" />",
      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />",
      "<title>" + escapeHtml(program.title + " - PDF Preview") + "</title>",
      renderPdfStyles(),
      "</head>",
      "<body>",
      "<div class=\"npdf-toolbar\">",
      "<div class=\"npdf-toolbar-title\">" + escapeHtml(program.title) + "</div>",
      "<div class=\"npdf-toolbar-actions\">",
      "<button type=\"button\" onclick=\"window.print()\">Print or Save PDF</button>",
      "<button type=\"button\" onclick=\"window.location.reload()\">Refresh</button>",
      "<button type=\"button\" onclick=\"window.close()\">Close</button>",
      "</div>",
      "</div>",
      "<main class=\"npdf-document\">",
      pages.join(""),
      "</main>",
      "</body>",
      "</html>"
    ].join("");
  }

  function buildYearlyTemplatePages(program) {
    var pages = [];
    var monthNames = [
      "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
      "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];

    pages.push(renderYearlyCoverPage(program, 1));
    pages.push(renderYearlyHowToUseTemplatePage(program, 2));
    pages.push(renderYearlyAthleteProfilePage(program, 3));
    pages.push(renderYearlyCalendarPage(program, 4));
    pages.push(renderYearlyAtAGlancePage(program, 5, "January through June", ["January", "February", "March", "April", "May", "June"], "Half-Year Review", ["Progress toward goals", "What is working", "What needs modification", "Second-half decision"], "half"));
    pages.push(renderYearlyAtAGlancePage(program, 6, "July through December", ["July", "August", "September", "October", "November", "December"], "End-of-Year Review", ["Goal achievement", "Best adaptations", "Persistent limitations", "Next-year priority"], "end"));
    pages.push(renderYearlyPhaseMapPage(program, 7));
    pages.push(renderYearlyCapabilityMatrixPage(program, 8));
    pages.push(renderYearlyTestingPage(program, 9));
    pages.push(renderYearlyDefaultWeekPage(program, 10));

    monthNames.forEach(function (monthName, index) {
      var pageNumber = 11 + (index * 2);
      pages.push(renderYearlyMonthPage(program, pageNumber, index + 1, monthName));
      if (index < monthNames.length - 1) {
        pages.push(renderYearlySpacerPage(program, pageNumber + 1));
      }
    });

    pages.push(renderYearlySpacerPage(program, 34));
    pages.push(renderYearlyAnnualReviewPage(program, 35));
    pages.push(renderYearlyPlanningNotesPage(program, 36));

    return pages;
  }

  function renderYearlyPage(program, pageNumber, bodyHtml) {
    return [
      "<section class=\"npdf-page npdf-yearly-page\">",
      "<div class=\"npdf-yearly-topline\">YEARLY PERIODIZED TRAINING PLAN | EDITABLE TEMPLATE</div>",
      bodyHtml,
      "<footer class=\"npdf-yearly-footer\">Nomadic Performance - Yearly Training Plan Template | " + String(pageNumber) + "</footer>",
      "</section>"
    ].join("");
  }

  function renderYearlyCoverPage(program, pageNumber) {
    var yearly = program && program.yearlyTemplate ? program.yearlyTemplate : {};
    return renderYearlyPage(program, pageNumber, [
      "<div class=\"npdf-yearly-hero\">",
      "<h1>YEARLY PERFORMANCE PLAN</h1>",
      "<h2>12-Month Periodized Training Template</h2>",
      "<p class=\"npdf-yearly-italic\">" + renderYearlyValue(yearly.description, "Enter a one- to two-sentence description of the athlete, sports, annual goals, and planning philosophy.") + "</p>",
      "<div class=\"npdf-yearly-markers\">/\\ /\\ /\\</div>",
      "</div>",
      "<div class=\"npdf-yearly-note\"><strong>Annual planning assumption</strong><br /><span class=\"npdf-yearly-italic\">" + renderYearlyValue(yearly.assumption, "Describe the athlete profile, current training base, sport participation, major constraints, and assumptions used to build the annual plan.") + "</span></div>",
      "<table class=\"npdf-table npdf-yearly-table\"><tbody>",
      "<tr><th>Athlete</th><th>Program year</th></tr>",
      "<tr><td>" + renderYearlyValue(yearly.athleteName, "Click or type here") + "</td><td>" + renderYearlyValue(yearly.programYear, "Click or type here") + "</td></tr>",
      "<tr><th>Primary sport / goal</th><th>Secondary sports</th></tr>",
      "<tr><td>" + renderYearlyValue(yearly.primarySport, "Click or type here") + "</td><td>" + renderYearlyValue(yearly.secondarySports, "Click or type here") + "</td></tr>",
      "<tr><th>Coach / provider</th><th>Plan start date</th></tr>",
      "<tr><td>" + renderYearlyValue(yearly.coachProvider, "Click or type here") + "</td><td>" + renderYearlyValue(yearly.planStartDate, "Click or type here") + "</td></tr>",
      "</tbody></table>",
      "<p class=\"npdf-yearly-center npdf-yearly-italic\">" + renderYearlyValue(yearly.tagline, "Enter annual program tagline or guiding principle") + "</p>"
    ].join(""));
  }

  function renderYearlyHowToUseTemplatePage(program, pageNumber) {
    var yearly = program && program.yearlyTemplate ? program.yearlyTemplate : {};
    return renderYearlyPage(program, pageNumber, [
      "<h1 class=\"npdf-yearly-title\">How to Use the Template</h1>",
      "<p class=\"npdf-yearly-subtitle\">Treat each month as a training block while preserving the logic of the full year.</p>",
      "<h2 class=\"npdf-yearly-section\">Monthly Block Hierarchy</h2>",
      "<ol class=\"npdf-yearly-tight-list\"><li><strong>Primary priorities:</strong> One to two capabilities or outcomes intentionally developed, expressed, or peaked.</li><li><strong>Secondary priorities:</strong> One to two qualities that support the primary goal but receive less training emphasis.</li><li><strong>Maintenance priorities:</strong> One to two qualities preserved with the minimum effective dose.</li><li><strong>Recovery and transition:</strong> Planned reduction, reassessment, or shift in emphasis before the next block.</li></ol>",
      "<h2 class=\"npdf-yearly-section\">Recommended Planning Sequence</h2>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr><th>Step</th><th>Planning decision</th><th>Editable output</th></tr></thead><tbody>" + [
        ["1", "Map events, trips, seasons, work, travel, and access constraints.", "Annual performance calendar"],
        ["2", "Identify performance windows and transition / recovery periods.", "Phase map"],
        ["3", "Assign primary, secondary, and maintenance priorities to each month.", "Annual plan at a glance"],
        ["4", "Set monthly volume, intensity, frequency, testing, and recovery targets.", "Monthly programming targets"],
        ["5", "Break each month into three to five weekly microcycles.", "Week-by-week progression"],
        ["6", "Review the athlete response and update the next block.", "Monthly review and decision"]
      ].map(function (row) { return "<tr><td>" + row[0] + "</td><td>" + row[1] + "</td><td>" + row[2] + "</td></tr>"; }).join("") + "</tbody></table>",
      "<div class=\"npdf-yearly-note\"><strong>Progression rule</strong><br /><span class=\"npdf-yearly-italic\">" + renderYearlyValue(yearly.progressionRule, "Define which variables may progress together and which should remain stable: training volume, intensity, frequency, technical difficulty, sport specificity, strength load, and recovery demand.") + "</span></div>",
      "<div class=\"npdf-yearly-note npdf-yearly-note-cream\"><strong>Template editing</strong><br /><span class=\"npdf-yearly-italic\">Replace gray bracketed text, rename sports and capabilities, add or delete rows, and adjust the month order when the training year does not begin in January.</span></div>"
    ].join(""));
  }

  function renderYearlyAthleteProfilePage(program, pageNumber) {
    var yearly = program && program.yearlyTemplate ? program.yearlyTemplate : {};
    var profileRows = [
      ["Primary sport(s)", "Secondary sport(s)", yearly.primarySport, yearly.secondarySports],
      ["Training age", "Current weekly volume", yearly.trainingAge, yearly.currentWeeklyVolume],
      ["Current strength frequency", "Current endurance frequency", yearly.currentStrengthFrequency, yearly.currentEnduranceFrequency],
      ["Available training days", "Typical session duration", yearly.availableTrainingDays, yearly.typicalSessionDuration],
      ["Relevant injury / medical history", "Equipment / facility access", yearly.relevantInjuryHistory, yearly.equipmentAccess],
      ["Travel / work constraints", "Preferred recovery day", yearly.travelWorkConstraints, yearly.preferredRecoveryDay]
    ];

    var annualGoalsRows = Array.isArray(yearly.annualGoalsRows) && yearly.annualGoalsRows.length
      ? yearly.annualGoalsRows.slice(0, 5)
      : new Array(5).fill({});

    return renderYearlyPage(program, pageNumber, [
      "<h1 class=\"npdf-yearly-title\">Athlete Profile and Annual Goals</h1>",
      "<p class=\"npdf-yearly-subtitle\">Define the athlete before defining the calendar.</p>",
      "<h2 class=\"npdf-yearly-section\">Athlete Profile</h2>",
      "<table class=\"npdf-table npdf-yearly-table\"><tbody>" + profileRows.map(function (row) {
        return "<tr><th>" + row[0] + "</th><th>" + row[1] + "</th></tr><tr><td>" + renderYearlyValue(row[2], "Click or type here") + "</td><td>" + renderYearlyValue(row[3], "Click or type here") + "</td></tr>";
      }).join("") + "</tbody></table>",
      "<h2 class=\"npdf-yearly-section\">Annual Performance Goals</h2>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr><th>Goal / outcome</th><th>Target date / window</th><th>Success measure</th><th>Priority</th></tr></thead><tbody>" + annualGoalsRows.map(function (row) {
        return "<tr><td>" + renderYearlyValue(row.goal, "Enter") + "</td><td>" + renderYearlyValue(row.target_window, "Enter") + "</td><td>" + renderYearlyValue(row.success_measure, "Enter") + "</td><td>" + renderYearlyValue(row.priority, "Enter") + "</td></tr>";
      }).join("") + "</tbody></table>",
      "<div class=\"npdf-yearly-note\"><strong>Programming philosophy</strong><br /><span class=\"npdf-yearly-italic\">" + renderYearlyValue(yearly.programmingPhilosophy, "Describe the principles that should guide the year: specificity, overload, recovery, consistency, minimum effective dose, multisport balance, and athlete preference.") + "</span></div>"
    ].join(""));
  }

  function renderYearlyCalendarPage(program, pageNumber) {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var yearly = program && program.yearlyTemplate ? program.yearlyTemplate : {};
    var calendarRows = Array.isArray(yearly.calendarRows) ? yearly.calendarRows : [];
    var byMonth = {};
    calendarRows.forEach(function (row) {
      var key = cleanText(row && row.month).toLowerCase();
      if (key) {
        byMonth[key] = row;
      }
    });

    return renderYearlyPage(program, pageNumber, [
      "<h1 class=\"npdf-yearly-title\">Annual Performance Calendar</h1>",
      "<p class=\"npdf-yearly-subtitle\">Map sport priority, events, travel, access, and life constraints before assigning training emphasis.</p>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr><th>Month</th><th>Primary sport</th><th>Secondary sport(s)</th><th>Key event / trip</th><th>Priority</th><th>Access / constraints</th><th>Notes</th></tr></thead><tbody>" + months.map(function (month) {
        var row = byMonth[month.toLowerCase()] || {};
        return "<tr><td>" + month + "</td><td>" + renderYearlyValue(row.primary, "Enter") + "</td><td>" + renderYearlyValue(row.secondary, "Enter") + "</td><td>" + renderYearlyValue(row.event, "Enter") + "</td><td>" + renderYearlyValue(row.priority, "Enter") + "</td><td>" + renderYearlyValue(row.constraints, "Enter") + "</td><td>" + renderYearlyValue(row.notes, "Enter") + "</td></tr>";
      }).join("") + "</tbody></table>",
      "<div class=\"npdf-yearly-note\"><strong>Calendar interpretation</strong><br /><span class=\"npdf-yearly-italic\">" + renderYearlyValue(deriveYearlyCalendarInterpretation(yearly), "Identify the highest-priority performance windows, months that require conservative loading, and periods where multiple sports compete for training time.") + "</span></div>"
    ].join(""));
  }

  function renderYearlyAtAGlancePage(program, pageNumber, subtitle, months, reviewTitle, reviewCols, reviewKey) {
    var yearly = program && program.yearlyTemplate ? program.yearlyTemplate : {};
    var reviewRows = buildYearlyReviewRows(yearly, months, reviewCols, reviewKey);
    return renderYearlyPage(program, pageNumber, [
      "<h1 class=\"npdf-yearly-title\">Annual Plan at a Glance</h1>",
      "<p class=\"npdf-yearly-subtitle\">" + escapeHtml(subtitle) + "</p>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr><th>Month</th><th>Phase / block</th><th>Primary priorities</th><th>Secondary priorities</th><th>Maintain</th><th>Volume</th><th>Intensity</th><th>Strength</th><th>Key outcome</th></tr></thead><tbody>" + months.map(function (month) {
        var row = findYearlyMonthOverviewRow(yearly, month) || {};
        var priorityRow = findYearlyMonthRow(yearly.monthPriorityRows, month) || {};
        var targetRow = findYearlyMonthRow(yearly.monthTargetRows, month) || {};
        return "<tr><td>" + month + "</td><td>" + renderYearlyValue(row.phase, "Enter") + "</td><td>" + renderYearlyValue(priorityRow.primary || row.emphasis, "Enter") + "</td><td>" + renderYearlyValue(priorityRow.secondary || row.secondary, "Enter") + "</td><td>" + renderYearlyValue(priorityRow.maintain, "Enter") + "</td><td>" + renderYearlyValue(targetRow.volume_frequency || row.load, "Enter") + "</td><td>" + renderYearlyValue(targetRow.intensity_density, "Enter") + "</td><td>" + renderYearlyValue(targetRow.strength_power, "Enter") + "</td><td>" + renderYearlyValue(row.event, "Enter") + "</td></tr>";
      }).join("") + "</tbody></table>",
      "<h2 class=\"npdf-yearly-section\">" + escapeHtml(reviewTitle) + "</h2>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr>" + reviewCols.map(function (col) { return "<th>" + escapeHtml(col) + "</th>"; }).join("") + "</tr></thead><tbody>" + reviewRows.map(function (row) {
        return "<tr>" + reviewCols.map(function (_col, idx) { return "<td>" + renderYearlyValue(row.cells[idx], "Enter") + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table>",
      "<div class=\"npdf-yearly-note\"><strong>Calendar interpretation</strong><br /><span class=\"npdf-yearly-italic\">" + renderYearlyValue(yearly.calendarInterpretation || deriveYearlyCalendarInterpretation(yearly), "Identify the highest-priority performance windows, months that require conservative loading, and periods where multiple sports compete for training time.") + "</span></div>"
    ].join(""));
  }

  function renderYearlyPhaseMapPage(program, pageNumber) {
    var yearly = program && program.yearlyTemplate ? program.yearlyTemplate : {};
    var phaseRows = Array.isArray(yearly.phaseMapRows) && yearly.phaseMapRows.length
      ? yearly.phaseMapRows
      : new Array(6).fill("").map(function (_, idx) {
          return { phase: "Phase " + String(idx + 1) };
        });
    var transitionRows = Array.isArray(yearly.transitionRows) && yearly.transitionRows.length
      ? yearly.transitionRows
      : new Array(4).fill("").map(function () { return {}; });

    return renderYearlyPage(program, pageNumber, [
      "<h1 class=\"npdf-yearly-title\">Annual Phase Map</h1>",
      "<p class=\"npdf-yearly-subtitle\">Group monthly blocks into larger periods with a common purpose.</p>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr><th>Phase</th><th>Months</th><th>Purpose</th><th>Primary adaptations</th><th>Secondary / maintain</th><th>Entry criteria</th><th>Exit criteria</th></tr></thead><tbody>" + phaseRows.map(function (row, idx) {
        return "<tr><td>" + renderYearlyValue(row.phase || ("Phase " + String(idx + 1)), "Phase") + "</td><td>" + renderYearlyValue(row.months, "Enter") + "</td><td>" + renderYearlyValue(row.purpose, "Enter") + "</td><td>" + renderYearlyValue(row.primary, "Enter") + "</td><td>" + renderYearlyValue(row.secondary, "Enter") + "</td><td>" + renderYearlyValue(row.entry, "Enter") + "</td><td>" + renderYearlyValue(row.exit, "Enter") + "</td></tr>";
      }).join("") + "</tbody></table>",
      "<h2 class=\"npdf-yearly-section\">Transition and Recovery Periods</h2>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr><th>Timing</th><th>Reason</th><th>Volume / intensity change</th><th>Return-to-build criteria</th></tr></thead><tbody>" + transitionRows.map(function (row) {
        return "<tr><td>" + renderYearlyValue(row.timing, "Enter") + "</td><td>" + renderYearlyValue(row.reason, "Enter") + "</td><td>" + renderYearlyValue(row.adjustment, "Enter") + "</td><td>" + renderYearlyValue(row.return, "Enter") + "</td></tr>";
      }).join("") + "</tbody></table>"
    ].join(""));
  }

  function renderYearlyCapabilityMatrixPage(program, pageNumber) {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var yearly = program && program.yearlyTemplate ? program.yearlyTemplate : {};
    var rows = buildYearlyCapabilityMatrixRows(yearly, months);
    return renderYearlyPage(program, pageNumber, [
      "<h1 class=\"npdf-yearly-title\">Annual Capability Emphasis Matrix</h1>",
      "<p class=\"npdf-yearly-subtitle\">Use low, moderate, high, peak, or maintain to show how each quality changes across the year.</p>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr><th>Month</th><th>Strength</th><th>Power</th><th>Aerobic base</th><th>Threshold / tempo</th><th>Anaerobic</th><th>Sport skill</th><th>Mobility</th><th>Recovery</th></tr></thead><tbody>" + rows.map(function (row) {
        return "<tr><td>" + row.month + "</td><td>" + renderYearlyValue(row.strength, "Enter") + "</td><td>" + renderYearlyValue(row.power, "Enter") + "</td><td>" + renderYearlyValue(row.aerobic, "Enter") + "</td><td>" + renderYearlyValue(row.threshold, "Enter") + "</td><td>" + renderYearlyValue(row.anaerobic, "Enter") + "</td><td>" + renderYearlyValue(row.skill, "Enter") + "</td><td>" + renderYearlyValue(row.mobility, "Enter") + "</td><td>" + renderYearlyValue(row.recovery, "Enter") + "</td></tr>";
      }).join("") + "</tbody></table>",
      "<div class=\"npdf-yearly-note\"><strong>Matrix rule</strong><br /><span class=\"npdf-yearly-italic\">" + renderYearlyValue(yearly.progressionRule, "A high emphasis should be supported by enough training frequency and recovery. Maintenance qualities should receive the minimum effective dose rather than disappearing from the plan.") + "</span></div>"
    ].join(""));
  }

  function renderYearlyTestingPage(program, pageNumber) {
    var yearly = program && program.yearlyTemplate ? program.yearlyTemplate : {};
    var testingRows = Array.isArray(yearly.testingRows) && yearly.testingRows.length
      ? yearly.testingRows
      : new Array(10).fill("").map(function () { return {}; });
    var monitoringRows = collectYearlyMonitoringRows(program);
    var adjustmentOrder = deriveYearlyAdjustmentOrder(program, yearly);

    return renderYearlyPage(program, pageNumber, [
      "<h1 class=\"npdf-yearly-title\">Testing, Monitoring, and Adjustment</h1>",
      "<p class=\"npdf-yearly-subtitle\">Schedule reassessment where the results can meaningfully change the next block.</p>",
      "<h2 class=\"npdf-yearly-section\">Annual Testing Schedule</h2>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr><th>Metric / test</th><th>Baseline</th><th>Mid-year</th><th>Pre-peak</th><th>Post-season</th><th>Decision rule</th></tr></thead><tbody>" + testingRows.map(function (row) {
        return "<tr><td>" + renderYearlyValue(row.metric, "Enter") + "</td><td>" + renderYearlyValue(row.baseline, "Enter") + "</td><td>" + renderYearlyValue(row.mid, "Enter") + "</td><td>" + renderYearlyValue(row.pre_peak, "Enter") + "</td><td>" + renderYearlyValue(row.post, "Enter") + "</td><td>" + renderYearlyValue(row.rule, "Enter") + "</td></tr>";
      }).join("") + "</tbody></table>",
      "<h2 class=\"npdf-yearly-section\">Monitoring Dashboard</h2>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr><th>Metric</th><th>Scale / method</th><th>Action threshold</th></tr></thead><tbody>" + (monitoringRows.length ? monitoringRows : [
        { metric: "Readiness / fatigue" },
        { metric: "Pain / symptoms" },
        { metric: "Sleep" },
        { metric: "Motivation" },
        { metric: "Session RPE x duration" },
        { metric: "Weekly volume / monotony" }
      ]).map(function (row) {
        return "<tr><td>" + renderYearlyValue(row.metric, "Enter") + "</td><td>" + renderYearlyValue(row.scale, "Enter") + "</td><td>" + renderYearlyValue(row.threshold, "Enter") + "</td></tr>";
      }).join("") + "</tbody></table>",
      "<div class=\"npdf-yearly-note\"><strong>Adjustment order</strong><br /><span class=\"npdf-yearly-italic\">" + renderYearlyValue(adjustmentOrder, "List the order in which optional work, secondary sports, accessory training, volume, intensity, and key sessions should be modified when recovery declines.") + "</span></div>"
    ].join(""));
  }

  function renderYearlyDefaultWeekPage(program, pageNumber) {
    var yearly = program && program.yearlyTemplate ? program.yearlyTemplate : {};
    var weeklyRows = buildYearlyDefaultWeekRows(program);
    var frameworkRows = buildYearlyStrengthFrameworkRows(program, yearly);
    var adjustmentOrder = deriveYearlyAdjustmentOrder(program, yearly);
    return renderYearlyPage(program, pageNumber, [
      "<h1 class=\"npdf-yearly-title\">Default Weekly Structure</h1>",
      "<p class=\"npdf-yearly-subtitle\">Create a reusable weekly framework, then adjust it inside each monthly block.</p>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr><th>Day</th><th>Primary session</th><th>Secondary session</th><th>Target load</th><th>Purpose</th><th>Modification rule</th></tr></thead><tbody>" + weeklyRows.map(function (row) {
        return "<tr><td>" + renderYearlyValue(row.day, "Day") + "</td><td>" + renderYearlyValue(row.primarySession, "Enter") + "</td><td>" + renderYearlyValue(row.secondarySession, "Enter") + "</td><td>" + renderYearlyValue(row.targetLoad, "Enter") + "</td><td>" + renderYearlyValue(row.purpose, "Enter") + "</td><td>" + renderYearlyValue(row.modificationRule || adjustmentOrder, "Enter") + "</td></tr>";
      }).join("") + "</tbody></table>",
      "<h2 class=\"npdf-yearly-section\">Strength and Conditioning Framework</h2>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr><th>Training quality</th><th>Build phase</th><th>Peak / in-season</th><th>Maintenance dose</th><th>Progression rule</th></tr></thead><tbody>" + frameworkRows.map(function (item) {
        return "<tr><td>" + item.quality + "</td><td>" + renderYearlyValue(item.build, "Enter") + "</td><td>" + renderYearlyValue(item.peak, "Enter") + "</td><td>" + renderYearlyValue(item.maintain, "Enter") + "</td><td>" + renderYearlyValue(item.progression, "Enter") + "</td></tr>";
      }).join("") + "</tbody></table>",
      "<div class=\"npdf-yearly-note\"><strong>Concurrent-training rule</strong><br /><span class=\"npdf-yearly-italic\">" + renderYearlyValue(yearly.concurrentRule, "Define how hard endurance, strength, power, climbing, cycling, or other sport sessions should be sequenced when multiple modalities share the week.") + "</span></div>"
    ].join(""));
  }

  function renderYearlyMonthPage(program, pageNumber, monthIndex, monthName) {
    var yearly = program && program.yearlyTemplate ? program.yearlyTemplate : {};
    var monthRow = findYearlyMonthOverviewRow(yearly, monthName) || {};
    var priorityRow = findYearlyMonthRow(yearly.monthPriorityRows, monthName) || {};
    var targetRow = findYearlyMonthRow(yearly.monthTargetRows, monthName) || {};
    var monthWeekRows = findYearlyMonthRows(yearly.monthWeekRows, monthName)
      .sort(function (a, b) {
        return parseYearlyWeekNumber(a && a.week, 999) - parseYearlyWeekNumber(b && b.week, 999);
      });
    var monthReviewRow = findYearlyMonthRow(yearly.monthReviewRows, monthName) || {};

    var primaryItems = splitYearlyItems(priorityRow.primary || monthRow.emphasis);
    var secondaryItems = splitYearlyItems(priorityRow.secondary || monthRow.secondary);
    var maintainItems = splitYearlyItems(priorityRow.maintain);

    var maxPriorityRows = Math.max(3, primaryItems.length, secondaryItems.length, maintainItems.length);
    var priorityRows = new Array(maxPriorityRows).fill("").map(function (_, idx) {
      return "<tr><td>" + renderYearlyValue(primaryItems[idx], "Enter capability, outcome, or behavior") + "</td><td>" + renderYearlyValue(secondaryItems[idx], "Enter capability, outcome, or behavior") + "</td><td>" + renderYearlyValue(maintainItems[idx], "Enter capability, outcome, or behavior") + "</td></tr>";
    }).join("");

    var weekRows = monthWeekRows.length
      ? monthWeekRows.map(function (row, idx) {
          var weekLabel = cleanText(row && row.week);
          if (!weekLabel) {
            weekLabel = "Week " + String(idx + 1);
          } else if (!/^week\s*/i.test(weekLabel)) {
            weekLabel = "Week " + weekLabel;
          }
          return "<tr><td>" + escapeHtml(weekLabel) + "</td><td>" + renderYearlyValue(row.primary_focus, "Enter") + "</td><td>" + renderYearlyValue(row.volume_target, "Enter") + "</td><td>" + renderYearlyValue(row.intensity_target, "Enter") + "</td><td>" + renderYearlyValue(row.key_sessions, "Enter") + "</td><td>" + renderYearlyValue(row.strength_secondary, "Enter") + "</td><td>" + renderYearlyValue(row.recovery_review, "Enter") + "</td></tr>";
        }).join("")
        : buildYearlyFallbackWeekRows(program).map(function (row) {
          return "<tr><td>" + escapeHtml(row.week) + "</td><td>" + renderYearlyValue(row.primary_focus, "Enter") + "</td><td>" + renderYearlyValue(row.volume_target, "Enter") + "</td><td>" + renderYearlyValue(row.intensity_target, "Enter") + "</td><td>" + renderYearlyValue(row.key_sessions, "Enter") + "</td><td>" + renderYearlyValue(row.strength_secondary, "Enter") + "</td><td>" + renderYearlyValue(row.recovery_review, "Enter") + "</td></tr>";
        }).join("");

    return renderYearlyPage(program, pageNumber, [
      "<div class=\"npdf-yearly-month-head\"><div class=\"npdf-yearly-month-pill\">MONTH " + String(monthIndex) + "</div><div><h1 class=\"npdf-yearly-month-title\">" + escapeHtml(monthName) + "</h1><p class=\"npdf-yearly-italic\">" + renderYearlyValue(monthRow.phase, "Phase / block") + " | " + renderYearlyValue(monthRow.emphasis, "Primary emphasis") + " | " + renderYearlyValue(monthRow.dates, "Dates") + "</p></div></div>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr><th>Primary sport</th><th>Secondary sport(s)</th><th>Key event / trip</th><th>Training access</th><th>Monthly load target</th></tr></thead><tbody><tr><td>" + renderYearlyValue(monthRow.primary, "Enter") + "</td><td>" + renderYearlyValue(monthRow.secondary, "Enter") + "</td><td>" + renderYearlyValue(monthRow.event, "Enter") + "</td><td>" + renderYearlyValue(monthRow.access, "Enter") + "</td><td>" + renderYearlyValue(monthRow.load, "Enter") + "</td></tr></tbody></table>",
      "<h2 class=\"npdf-yearly-section\">Monthly Priorities</h2>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr><th>PRIMARY: develop / peak</th><th>SECONDARY: support</th><th>MAINTAIN: preserve</th></tr></thead><tbody>" + priorityRows + "</tbody></table>",
      "<h2 class=\"npdf-yearly-section\">Monthly Programming Targets</h2>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr><th>Programming area</th><th>Target / prescription</th><th>Programming area</th><th>Target / prescription</th></tr></thead><tbody>" + [
        ["Volume / frequency", targetRow.volume_frequency, "Intensity / density", targetRow.intensity_density],
        ["Strength / power", targetRow.strength_power, "Aerobic / conditioning", targetRow.aerobic_conditioning],
        ["Sport skill / technique", targetRow.sport_skill, "Mobility / recovery", targetRow.mobility_recovery],
        ["Testing / nutrition / logistics", targetRow.testing_logistics, "Adjustment criteria", targetRow.adjustment_criteria]
      ].map(function (pair) {
        return "<tr><td>" + pair[0] + "</td><td>" + renderYearlyValue(pair[1], "Enter target") + "</td><td>" + pair[2] + "</td><td>" + renderYearlyValue(pair[3], "Enter target") + "</td></tr>";
      }).join("") + "</tbody></table>",
      "<h2 class=\"npdf-yearly-section\">Week-by-Week Progression</h2>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr><th>Week</th><th>Primary focus</th><th>Volume target</th><th>Intensity target</th><th>Key sessions</th><th>Strength / secondary sport</th><th>Recovery / review</th></tr></thead><tbody>" + weekRows + "</tbody></table>",
      "<div class=\"npdf-yearly-note\"><strong>Monthly review and next-block decision</strong><br /><span class=\"npdf-yearly-italic\">" + renderYearlyValue(monthReviewRow.review, "Summarize adherence, adaptation, symptoms, testing, athlete feedback, and the specific changes that should carry into the next month.") + "</span></div>"
    ].join(""));
  }

  function renderYearlySpacerPage(program, pageNumber) {
    return renderYearlyPage(program, pageNumber, "");
  }

  function renderYearlyAnnualReviewPage(program, pageNumber) {
    var yearly = program && program.yearlyTemplate ? program.yearlyTemplate : {};
    var annualGoals = Array.isArray(yearly.annualReviewGoalRows) && yearly.annualReviewGoalRows.length
      ? yearly.annualReviewGoalRows.slice(0, 6)
      : (Array.isArray(yearly.annualGoalsRows) ? yearly.annualGoalsRows.slice(0, 6) : []);
    while (annualGoals.length < 6) {
      annualGoals.push({});
    }

    var reviewRows = (Array.isArray(yearly.monthReviewRows) ? yearly.monthReviewRows : [])
      .map(function (row) {
        return cleanText(row && row.review);
      })
      .filter(Boolean);

    var keyLessons = Array.isArray(yearly.annualReviewLessonRows) && yearly.annualReviewLessonRows.length
      ? yearly.annualReviewLessonRows.slice(0, 3).map(function (row) {
          return {
            continueText: cleanText(row && row.continue),
            modifyText: cleanText(row && row.modify),
            stopText: cleanText(row && row.stop)
          };
        })
      : reviewRows.slice(0, 3).map(function (text) {
          var parts = splitYearlyItems(text);
          return {
            continueText: parts[0] || text,
            modifyText: parts[1] || "",
            stopText: parts[2] || ""
          };
        });
    while (keyLessons.length < 3) {
      keyLessons.push({ continueText: "", modifyText: "", stopText: "" });
    }

    var nextYearRows = Array.isArray(yearly.nextYearStartRows) && yearly.nextYearStartRows.length
      ? yearly.nextYearStartRows.slice(0, 6)
      : [
          { category: "Primary sport", current: yearly.primarySport, next: yearly.primarySport, action: yearly.progressionRule },
          { category: "Secondary sport(s)", current: yearly.secondarySports, next: yearly.secondarySports, action: yearly.concurrentRule },
          { category: "Training access", current: yearly.equipmentAccess, next: yearly.availableTrainingDays, action: yearly.travelWorkConstraints },
          { category: "Recovery focus", current: yearly.preferredRecoveryDay, next: yearly.preferredRecoveryDay, action: yearly.programmingPhilosophy }
        ];

    var summaryText = cleanText(yearly.coachAthleteSummary) || (reviewRows.length ? reviewRows.slice(0, 4).join(" | ") : "");

    return renderYearlyPage(program, pageNumber, [
      "<h1 class=\"npdf-yearly-title\">Annual Review and Next-Year Handoff</h1>",
      "<p class=\"npdf-yearly-subtitle\">Capture what happened, why it happened, and how the next yearly plan should change.</p>",
      "<h2 class=\"npdf-yearly-section\">Goal Review</h2>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr><th>Goal</th><th>Outcome</th><th>Evidence / testing</th><th>What influenced it</th><th>Next decision</th></tr></thead><tbody>" + annualGoals.map(function (row) {
        return "<tr><td>" + renderYearlyValue(row.goal, "Enter") + "</td><td>" + renderYearlyValue(row.outcome || row.success_measure, "Enter") + "</td><td>" + renderYearlyValue(row.evidence || row.success_measure, "Enter") + "</td><td>" + renderYearlyValue(row.influenced || row.target_window, "Enter") + "</td><td>" + renderYearlyValue(row.next_decision || row.priority, "Enter") + "</td></tr>";
      }).join("") + "</tbody></table>",
      "<h2 class=\"npdf-yearly-section\">Key Lessons</h2>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr><th>Continue</th><th>Modify</th><th>Stop / avoid</th></tr></thead><tbody>" + keyLessons.map(function (row) {
        return "<tr><td>" + renderYearlyValue(row.continueText, "Enter lesson") + "</td><td>" + renderYearlyValue(row.modifyText, "Enter lesson") + "</td><td>" + renderYearlyValue(row.stopText, "Enter lesson") + "</td></tr>";
      }).join("") + "</tbody></table>",
      "<h2 class=\"npdf-yearly-section\">Next-Year Starting Point</h2>",
      "<table class=\"npdf-table npdf-yearly-table\"><thead><tr><th>Category</th><th>Current status</th><th>Next-year priority</th><th>Immediate action</th></tr></thead><tbody>" + nextYearRows.map(function (row) {
        return "<tr><td>" + renderYearlyValue(row.category, "Category") + "</td><td>" + renderYearlyValue(row.current, "Enter") + "</td><td>" + renderYearlyValue(row.next, "Enter") + "</td><td>" + renderYearlyValue(row.action, "Enter") + "</td></tr>";
      }).join("") + "</tbody></table>",
      "<div class=\"npdf-yearly-note\"><strong>Coach / athlete summary</strong><br /><span class=\"npdf-yearly-italic\">" + renderYearlyValue(summaryText, "Write the concise narrative that should guide the next annual plan, including the athlete response, successful loading patterns, recurring constraints, and most important future opportunity.") + "</span></div>"
    ].join(""));
  }

  function renderYearlyPlanningNotesPage(program, pageNumber) {
    var yearly = program && program.yearlyTemplate ? program.yearlyTemplate : {};
    var notes = [];
    var explicitRows = Array.isArray(yearly.planningNotesRows) ? yearly.planningNotesRows : [];
    if (explicitRows.length) {
      explicitRows.forEach(function (row) {
        addIfText(notes, cleanText(row && row.note));
      });
    } else {
      addIfText(notes, cleanText(yearly.programmingPhilosophy));
      addIfText(notes, cleanText(yearly.assumption));
      addIfText(notes, cleanText(yearly.progressionRule));
      addIfText(notes, cleanText(yearly.concurrentRule));
      (Array.isArray(yearly.monthReviewRows) ? yearly.monthReviewRows : []).forEach(function (row) {
        addIfText(notes, cleanText(row && row.review));
      });
    }

    return renderYearlyPage(program, pageNumber, [
      "<h1 class=\"npdf-yearly-title\">Yearly Planning Notes</h1>",
      "<p class=\"npdf-yearly-subtitle\">Use this page for programming rationale, references, assumptions, or additional planning details.</p>",
      "<table class=\"npdf-table npdf-yearly-table\"><tbody>" + new Array(14).fill("").map(function (_item, idx) {
        return "<tr><td>" + renderYearlyValue(notes[idx], "Click or type here") + "</td></tr>";
      }).join("") + "</tbody></table>"
    ].join(""));
  }

  function renderPdfStyles() {
    return [
      "<style>",
      "@page { size: A4; margin: 14mm; }",
      ":root { --np-forest: #173f34; --np-moss: #2f6655; --np-sage: #dfe9df; --np-cream: #f7f3ea; --np-ink: #102722; --np-muted: #4f6e63; --np-accent: #b87b3a; }",
      "* { box-sizing: border-box; }",
      "html, body { margin: 0; padding: 0; }",
      "body { font-family: 'Avenir Next', 'Trebuchet MS', 'Segoe UI', Arial, sans-serif; background: radial-gradient(circle at 0 0, #eef3ea 0%, #e2e9e1 60%, #d8e0d8 100%); color: var(--np-ink); }",
      ".npdf-toolbar { position: sticky; top: 0; z-index: 5; background: linear-gradient(90deg, var(--np-forest) 0%, #0f2c24 100%); color: #f0f4ef; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid #284f43; }",
      ".npdf-toolbar-title { font-size: 14px; font-weight: 700; letter-spacing: 0.02em; }",
      ".npdf-toolbar-actions { display: flex; gap: 8px; flex-wrap: wrap; }",
      ".npdf-toolbar button { border: 1px solid #355c4f; background: #1c3a30; color: #ecf4ef; padding: 8px 10px; border-radius: 8px; font-size: 12px; cursor: pointer; transition: background 0.2s ease, transform 0.2s ease; }",
      ".npdf-toolbar button:hover { background: #275244; transform: translateY(-1px); }",
      ".npdf-document { width: 210mm; margin: 12px auto 28px; }",
      ".npdf-page { width: 210mm; min-height: 297mm; background: #fff; margin: 0 auto 10px; padding: 16mm 14mm 18mm; position: relative; box-shadow: 0 10px 26px rgba(18, 32, 27, 0.18); page-break-after: always; break-after: page; overflow: hidden; }",
      ".npdf-page::before { content: ''; position: absolute; left: 0; top: 0; right: 0; height: 7mm; background: linear-gradient(90deg, var(--np-forest) 0%, var(--np-moss) 45%, var(--np-accent) 100%); opacity: 0.96; }",
      ".npdf-page:last-child { page-break-after: auto; break-after: auto; }",
      ".npdf-page h1, .npdf-page h2, .npdf-page h3, .npdf-page h4 { margin: 0; color: var(--np-forest); }",
      ".npdf-page p { margin: 0; line-height: 1.45; }",
      ".npdf-kicker { font-size: 10px; text-transform: uppercase; letter-spacing: 0.11em; color: var(--np-moss); font-weight: 700; margin-top: 2mm; }",
      ".npdf-cover-brand { margin-top: 4mm; margin-bottom: 2mm; display: flex; align-items: center; }",
      ".npdf-cover-logo { display: block; max-width: 70mm; max-height: 18mm; width: auto; height: auto; object-fit: contain; }",
      ".npdf-cover-shell { margin-top: 6mm; border: 1px solid #d3dfd5; border-radius: 14px; padding: 12px 12px 10px; background: linear-gradient(145deg, #ffffff 0%, #f6fbf7 68%, #edf5ef 100%); position: relative; overflow: hidden; }",
      ".npdf-cover-shell::after { content: ''; position: absolute; right: -30mm; top: -28mm; width: 82mm; height: 82mm; border-radius: 50%; background: radial-gradient(circle, rgba(47,102,85,0.14) 0%, rgba(47,102,85,0) 72%); pointer-events: none; }",
      ".npdf-cover-hero { display: grid; grid-template-columns: minmax(26mm, 34mm) 1fr; gap: 10px; align-items: start; }",
      ".npdf-cover-brand-col { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }",
      ".npdf-cover-brand-col .npdf-kicker { margin-top: 0; font-size: 9px; letter-spacing: 0.12em; }",
      ".npdf-cover-title-wrap { position: relative; z-index: 1; }",
      ".npdf-cover-title-wrap .npdf-title { margin-top: 0; font-size: 51px; letter-spacing: -0.02em; line-height: 1.02; }",
      ".npdf-cover-title-wrap .npdf-subtitle { margin-top: 6px; font-size: 15px; color: #2c6755; font-weight: 600; }",
      ".npdf-cover-title-wrap .npdf-description { margin-top: 8px; max-width: 100%; font-size: 12.2px; color: #2c3f38; line-height: 1.5; }",
      ".npdf-cover-meta-wrap { margin-top: 10px; }",
      ".npdf-cover-meta-wrap .npdf-meta-grid { margin-top: 0; gap: 8px; }",
      ".npdf-cover-meta-wrap .npdf-meta-card { border-radius: 9px; border-color: #cddacf; background: linear-gradient(180deg, #f9fcfa 0%, #eff6f0 100%); }",
      ".npdf-cover-bottom { margin-top: 10px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 9px; }",
      ".npdf-cover-card { border: 1px solid #d3dfd4; border-radius: 11px; background: #fbfdfb; padding: 8px 10px; }",
      ".npdf-cover-card h2, .npdf-cover-card h3 { margin: 0; font-size: 14px; color: #1d4a3d; letter-spacing: -0.01em; }",
      ".npdf-cover-card .npdf-list { margin-top: 6px; }",
      ".npdf-cover-card .npdf-list li { margin: 3px 0; font-size: 11.2px; line-height: 1.35; }",
      ".npdf-cover-card .npdf-muted { margin-top: 6px; font-size: 11px; line-height: 1.4; color: #46665a; }",
      ".npdf-cover-snapshot { margin-top: 10px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }",
      ".npdf-cover-stat { border: 1px solid #d0ddd2; border-radius: 10px; background: #f9fcf9; padding: 7px 8px; }",
      ".npdf-cover-stat-label { font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.08em; color: #5a786d; font-weight: 700; }",
      ".npdf-cover-stat-value { margin-top: 4px; font-size: 16px; font-weight: 800; color: #173f34; line-height: 1.1; }",
      ".npdf-cover-phases { margin-top: 10px; border: 1px solid #d4dfd5; border-radius: 11px; background: #fbfdfb; padding: 8px 9px; }",
      ".npdf-cover-phases h3 { margin: 0; font-size: 14px; color: #1f4d40; }",
      ".npdf-cover-phase-grid { margin-top: 7px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }",
      ".npdf-cover-phase-item { border: 1px solid #d8e3da; border-radius: 9px; background: #ffffff; padding: 6px 7px; }",
      ".npdf-cover-phase-name { font-size: 11px; font-weight: 700; color: #1f4a3d; }",
      ".npdf-cover-phase-meta { margin-top: 2px; font-size: 10px; color: #567467; }",
      ".npdf-cover-activities { margin-top: 9px; display: flex; flex-wrap: wrap; gap: 6px; }",
      ".npdf-cover-activity-chip { display: inline-flex; align-items: center; border: 1px solid #cfe0d2; border-radius: 999px; background: #f3faf4; color: #2e5a4c; font-size: 10px; font-weight: 600; padding: 3px 8px; }",
      ".npdf-title { font-size: 30px; line-height: 1.1; margin-top: 8px; }",
      ".npdf-subtitle { font-size: 15px; margin-top: 8px; color: var(--np-moss); }",
      ".npdf-description { margin-top: 12px; font-size: 13px; color: #2f3f3a; max-width: 88%; }",
      ".npdf-meta-grid { margin-top: 18px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }",
      ".npdf-meta-card { border: 1px solid #d4ddd5; border-radius: 10px; padding: 10px; background: linear-gradient(180deg, #fbfdfb 0%, #f1f7f2 100%); }",
      ".npdf-meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--np-muted); font-weight: 700; }",
      ".npdf-meta-value { margin-top: 6px; font-size: 14px; color: #1a332c; font-weight: 700; }",
      ".npdf-list { margin: 10px 0 0; padding-left: 18px; }",
      ".npdf-list li { margin: 5px 0; font-size: 12px; color: #203a32; }",
      ".npdf-section { margin-top: 16px; }",
      ".npdf-table { width: 100%; border-collapse: collapse; margin-top: 8px; table-layout: fixed; }",
      ".npdf-table th, .npdf-table td { border: 1px solid #d7dfd8; padding: 6px 7px; vertical-align: top; font-size: 11px; line-height: 1.3; white-space: normal; overflow-wrap: anywhere; word-break: break-word; }",
      ".npdf-table th { background: var(--np-sage); color: #254b3f; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; }",
      ".npdf-table tbody tr:nth-child(even) { background: #fafcf9; }",
      ".npdf-muted { color: var(--np-muted); font-size: 11px; }",
      ".npdf-phase-banner { display: grid; grid-template-columns: 95px 1fr; margin-bottom: 10px; }",
      ".npdf-phase-idx { background: var(--np-forest); color: #f2f8f5; padding: 12px 10px; font-size: 16px; font-weight: 800; letter-spacing: 0.05em; }",
      ".npdf-phase-name { background: var(--np-sage); padding: 11px 12px; border-left: 0; }",
      ".npdf-phase-name h2 { font-size: 19px; margin-bottom: 4px; }",
      ".npdf-phase-meta { font-size: 12px; color: #355f50; }",
      ".npdf-sub-banner { margin-top: 12px; padding: 6px 8px; border-left: 4px solid var(--np-moss); background: #edf4ef; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: #2f5a4b; }",
      ".npdf-session { margin-top: 10px; border: 1px solid #d8e2db; border-radius: 8px; overflow: hidden; break-inside: avoid; page-break-inside: avoid; }",
      ".npdf-session-head { display: flex; justify-content: space-between; gap: 8px; background: linear-gradient(90deg, #f3f7f4 0%, #edf4ef 100%); padding: 8px 10px; }",
      ".npdf-session-title { font-size: 13px; font-weight: 700; color: #214237; }",
      ".npdf-session-meta { font-size: 11px; color: #4d6e61; }",
      ".npdf-session-body { padding: 8px 10px 10px; }",
      ".npdf-exercise-table th, .npdf-exercise-table td { font-size: 10.5px; }",
      ".npdf-exercise-table td:nth-child(2) { min-width: 34mm; }",
      ".npdf-note-chip { display: inline-block; border: 1px solid #cfddd4; border-radius: 999px; padding: 2px 8px; margin: 4px 5px 0 0; font-size: 10px; color: #2f5a4b; background: #f3faf5; }",
      ".npdf-footer { position: absolute; left: 14mm; right: 14mm; bottom: 9mm; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #5a766a; border-top: 1px solid #dbe4dd; padding-top: 5px; background: linear-gradient(90deg, rgba(237,244,239,0.7) 0%, rgba(255,255,255,0.2) 100%); }",
      ".npdf-page-number::before { content: counter(page); }",
      ".npdf-page-break { page-break-before: always; break-before: page; }",
      ".npdf-yearly-page { padding-bottom: 16mm; }",
      ".npdf-yearly-topline { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: #2c5f54; border-bottom: 1px solid #d6e2dc; padding-bottom: 6px; margin-bottom: 8px; }",
      ".npdf-yearly-footer { position: absolute; left: 14mm; right: 14mm; bottom: 8mm; text-align: center; font-size: 10px; color: #55746a; border-top: 1px solid #d6e2dc; padding-top: 5px; }",
      ".npdf-yearly-hero { text-align: center; margin-top: 8px; }",
      ".npdf-yearly-hero h1 { font-size: 34px; letter-spacing: 0.03em; color: #123c31; margin: 0; }",
      ".npdf-yearly-hero h2 { font-size: 18px; color: #2a5a4d; margin: 6px 0 0; }",
      ".npdf-yearly-markers { margin-top: 8px; color: #2f695b; font-weight: 700; letter-spacing: 0.2em; }",
      ".npdf-yearly-title { font-size: 24px; margin: 2px 0 0; color: #173f34; }",
      ".npdf-yearly-subtitle { margin: 5px 0 10px; font-size: 12px; color: #48675d; }",
      ".npdf-yearly-section { font-size: 14px; margin: 12px 0 6px; color: #1f4d40; }",
      ".npdf-yearly-italic { font-style: italic; color: #586f67; }",
      ".npdf-yearly-note { margin-top: 9px; border: 1px solid #d8e3dd; background: #f3f8f4; border-radius: 9px; padding: 8px 10px; font-size: 11px; line-height: 1.35; color: #294e43; }",
      ".npdf-yearly-note-cream { background: #f8f5ea; border-color: #e4dcc0; }",
      ".npdf-yearly-center { text-align: center; margin-top: 10px; }",
      ".npdf-yearly-table th, .npdf-yearly-table td { font-size: 10px; padding: 5px 6px; }",
      ".npdf-yearly-table th { background: #e7f0ea; }",
      ".npdf-yearly-tight-list { margin: 6px 0 0 18px; padding-left: 8px; }",
      ".npdf-yearly-tight-list li { margin: 4px 0; font-size: 11px; color: #26493f; }",
      ".npdf-yearly-month-head { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }",
      ".npdf-yearly-month-pill { background: #194e40; color: #f2f8f5; border-radius: 999px; padding: 5px 10px; font-size: 10px; letter-spacing: 0.06em; font-weight: 700; }",
      ".npdf-yearly-month-title { margin: 0; font-size: 22px; color: #173f34; line-height: 1.1; }",
      "@media print {",
      "  body { background: #fff; }",
      "  .npdf-toolbar { display: none !important; }",
      "  .npdf-document { width: auto; margin: 0; }",
      "  .npdf-page { box-shadow: none; margin: 0; }",
      "  .npdf-page::before { height: 6mm; }",
      "}",
      "</style>"
    ].join("");
  }

  function renderCoverPage(program) {
    var goals = Array.isArray(program.goals) ? program.goals.slice(0, 4) : [];
    var logoUrl = cleanText(program && program.brand && program.brand.logoUrl);
    var assumption = Array.isArray(program.disclaimers) && program.disclaimers.length
      ? cleanText(program.disclaimers[0])
      : "";
    var phases = Array.isArray(program.phases) ? program.phases.slice(0, 4) : [];
    var activities = Array.isArray(program.activities) ? program.activities.slice(0, 8) : [];
    var summary = program && program.summary ? program.summary : {};
    var durationWeeks = summary.durationWeeks != null ? String(summary.durationWeeks) : "";
    var totalSessions = summary.totalSessions != null ? String(summary.totalSessions) : "";
    var totalPhases = summary.totalPhases != null ? String(summary.totalPhases) : "";

    return [
      "<section class=\"npdf-page\">",
      "<div class=\"npdf-cover-shell\">",
      "<div class=\"npdf-cover-hero\">",
      "<div class=\"npdf-cover-brand-col\">",
      (logoUrl
        ? "<div class=\"npdf-cover-brand\"><img class=\"npdf-cover-logo\" src=\"" + escapeHtml(logoUrl) + "\" alt=\"" + escapeHtml((program.brand && program.brand.name) || "Logo") + "\" onerror=\"this.style.display='none'\" /></div>"
        : ""),
      "<p class=\"npdf-kicker\">" + escapeHtml(program.brand.name) + "</p>",
      "</div>",
      "<div class=\"npdf-cover-title-wrap\">",
      "<h1 class=\"npdf-title\">" + escapeHtml(program.title) + "</h1>",
      (program.subtitle ? "<p class=\"npdf-subtitle\">" + escapeHtml(program.subtitle) + "</p>" : ""),
      (program.description ? "<p class=\"npdf-description\">" + escapeHtml(program.description) + "</p>" : ""),
      "</div>",
      "</div>",
      "<div class=\"npdf-cover-meta-wrap\">",
      "<div class=\"npdf-meta-grid\">",
      renderMetaCard("Athlete", program.athlete && program.athlete.name ? program.athlete.name : "Unassigned"),
      renderMetaCard("Program Dates", program.dates && program.dates.displayLabel ? program.dates.displayLabel : "TBD"),
      renderMetaCard("Version", program.version || "v1"),
      renderMetaCard("Tagline", program.brand.tagline || ""),
      "</div>",
      "</div>",
      ((goals.length || assumption)
        ? "<div class=\"npdf-cover-bottom\">"
          + (goals.length
            ? "<section class=\"npdf-cover-card\"><h2>Primary Goals</h2><ul class=\"npdf-list\">" + goals.map(function (goal) {
                return "<li>" + escapeHtml(goal.label) + "</li>";
              }).join("") + "</ul></section>"
            : "")
          + (assumption
            ? "<section class=\"npdf-cover-card\"><h3>Important Assumption</h3><p class=\"npdf-muted\">" + escapeHtml(assumption) + "</p></section>"
            : "")
          + "</div>"
        : ""),
      "<div class=\"npdf-cover-snapshot\">",
      "<article class=\"npdf-cover-stat\"><div class=\"npdf-cover-stat-label\">Program Length</div><div class=\"npdf-cover-stat-value\">" + escapeHtml(durationWeeks ? (durationWeeks + " weeks") : "TBD") + "</div></article>",
      "<article class=\"npdf-cover-stat\"><div class=\"npdf-cover-stat-label\">Total Phases</div><div class=\"npdf-cover-stat-value\">" + escapeHtml(totalPhases || "-") + "</div></article>",
      "<article class=\"npdf-cover-stat\"><div class=\"npdf-cover-stat-label\">Planned Sessions</div><div class=\"npdf-cover-stat-value\">" + escapeHtml(totalSessions || "-") + "</div></article>",
      "</div>",
      (phases.length
        ? "<section class=\"npdf-cover-phases\"><h3>Phase Roadmap</h3><div class=\"npdf-cover-phase-grid\">" + phases.map(function (phase) {
            return "<article class=\"npdf-cover-phase-item\"><div class=\"npdf-cover-phase-name\">" + escapeHtml(phase.name || "Phase") + "</div><div class=\"npdf-cover-phase-meta\">" + escapeHtml(phase.dateLabel || "") + "</div></article>";
          }).join("") + "</div></section>"
        : ""),
      (activities.length
        ? "<div class=\"npdf-cover-activities\">" + activities.map(function (activity) {
            return "<span class=\"npdf-cover-activity-chip\">" + escapeHtml(activity && activity.name ? activity.name : "Activity") + "</span>";
          }).join("") + "</div>"
        : ""),
      "</div>",
      renderFooter(program),
      "</section>"
    ].join("");
  }

  function renderHowToUsePage(program, warnings) {
    var framework = program && program.framework ? program.framework : {};
    var priorities = Array.isArray(framework.priorities) ? framework.priorities : [];
    var variables = Array.isArray(framework.variablesToIndividualize) ? framework.variablesToIndividualize : [];
    var waveRows = Array.isArray(framework.loadingWaveRows) ? framework.loadingWaveRows : [];
    var warningItems = Array.isArray(warnings) && warnings.length
      ? "<section class=\"npdf-section\"><h3>Data Warnings</h3><ul class=\"npdf-list\">" + warnings.map(function (warning) {
          return "<li>" + escapeHtml(warning) + "</li>";
        }).join("") + "</ul></section>"
      : "";

    var frameworkIntro = framework.intro
      ? "<p class=\"npdf-description\" style=\"max-width:100%;\">" + escapeHtml(framework.intro) + "</p>"
      : "";

    var ruleBlock = framework.ruleBody
      ? [
          "<section class=\"npdf-section\">",
          "<div style=\"background:#edf3ef;border-left:4px solid #2f6655;padding:12px 14px;\">",
          (framework.ruleTitle ? "<h3 style=\"font-size:14px;margin-bottom:6px;\">" + escapeHtml(framework.ruleTitle) + "</h3>" : ""),
          "<p style=\"font-size:12px;\">" + escapeHtml(framework.ruleBody) + "</p>",
          "</div>",
          "</section>"
        ].join("")
      : "";

    var prioritiesBlock = priorities.length
      ? "<section class=\"npdf-section\"><h3>Annual Priorities</h3><ul class=\"npdf-list\">" + priorities.map(function (item) {
          return "<li>" + escapeHtml(item) + "</li>";
        }).join("") + "</ul></section>"
      : "";

    var variablesBlock = variables.length
      ? "<section class=\"npdf-section\"><h3>Program Variables To Individualize</h3><ul class=\"npdf-list\">" + variables.map(function (item) {
          return "<li>" + escapeHtml(item) + "</li>";
        }).join("") + "</ul></section>"
      : "";

    var waveBlock = waveRows.length
      ? "<section class=\"npdf-section\"><h3>" + escapeHtml(framework.waveHeading || "Default Loading Wave") + "</h3><table class=\"npdf-table\"><thead><tr><th>Week</th><th>Training Target</th><th>Typical Adjustment</th></tr></thead><tbody>" + waveRows.map(function (row) {
          return "<tr><td>" + escapeHtml(row.week || "") + "</td><td>" + escapeHtml(row.target || "") + "</td><td>" + escapeHtml(row.adjustment || "") + "</td></tr>";
        }).join("") + "</tbody></table>" + (framework.waveFooter ? "<p class=\"npdf-muted\" style=\"margin-top:8px;\">" + escapeHtml(framework.waveFooter) + "</p>" : "") + "</section>"
      : "";

    return [
      "<section class=\"npdf-page\">",
      "<p class=\"npdf-kicker\">Guide</p>",
      "<h1 class=\"npdf-title\" style=\"font-size:24px;\">" + escapeHtml(framework.heading || "How To Use This Program") + "</h1>",
      frameworkIntro,
      ruleBlock,
      prioritiesBlock,
      variablesBlock,
      waveBlock,
      (!frameworkIntro && !ruleBlock && !prioritiesBlock && !variablesBlock && !waveBlock
        ? "<ul class=\"npdf-list\"><li>Follow phase objectives first, then execute scheduled sessions.</li><li>Track effort, notes, and completion quality each session.</li><li>Progress only when adjustment rules and recovery markers allow.</li><li>Regenerate this PDF any time the program is updated.</li></ul>"
        : ""),
      warningItems,
      (Array.isArray(program.disclaimers) && program.disclaimers.length > 1
        ? "<section class=\"npdf-section\"><h3>Additional Notes</h3><ul class=\"npdf-list\">" + program.disclaimers.slice(1).map(function (item) {
            return "<li>" + escapeHtml(item) + "</li>";
          }).join("") + "</ul></section>"
        : ""),
      renderFooter(program),
      "</section>"
    ].join("");
  }

  function renderProgramAtGlancePage(program) {
    var rows = (Array.isArray(program.phases) ? program.phases : []).map(function (phase) {
      return [
        "<tr>",
        "<td>Phase " + String(phase.order) + " - " + escapeHtml(phase.name) + "</td>",
        "<td>" + escapeHtml(phase.dateLabel || "") + "</td>",
        "<td>" + escapeHtml(phase.durationWeeks ? String(phase.durationWeeks) + " weeks" : "") + "</td>",
        "<td>" + escapeHtml(phase.primaryObjective || "") + "</td>",
        "<td>" + escapeHtml(extractStrengthFrequency(phase)) + "</td>",
        "</tr>"
      ].join("");
    }).join("");

    return [
      "<section class=\"npdf-page\">",
      "<p class=\"npdf-kicker\">Overview</p>",
      "<h1 class=\"npdf-title\" style=\"font-size:24px;\">Program At A Glance</h1>",
      "<table class=\"npdf-table\">",
      "<thead><tr><th>Phase</th><th>Date Range</th><th>Duration</th><th>Primary Objective</th><th>Strength Frequency</th></tr></thead>",
      "<tbody>" + rows + "</tbody>",
      "</table>",
      renderFooter(program),
      "</section>"
    ].join("");
  }

  function renderActivityMatrixPages(program) {
    var activities = Array.isArray(program.activities) ? program.activities : [];
    if (!activities.length || !Array.isArray(program.phases) || !program.phases.length) {
      return [];
    }

    var headerCells = activities.map(function (activity) {
      return "<th>" + escapeHtml(activity.name) + "</th>";
    }).join("");

    var bodyRows = program.phases.map(function (phase) {
      var lookup = arrayToLookup(Array.isArray(phase.activityEmphasis) ? phase.activityEmphasis : [], "activityId");
      var cells = activities.map(function (activity) {
        var item = lookup[activity.id];
        var value = item && item.status ? item.status : "-";
        return "<td>" + escapeHtml(value) + "</td>";
      }).join("");

      return "<tr><td>Phase " + String(phase.order) + "</td>" + cells + "</tr>";
    }).join("");

    return [[
      "<section class=\"npdf-page\">",
      "<p class=\"npdf-kicker\">Overview</p>",
      "<h1 class=\"npdf-title\" style=\"font-size:24px;\">Activity Emphasis Matrix</h1>",
      "<table class=\"npdf-table\">",
      "<thead><tr><th>Phase</th>" + headerCells + "</tr></thead>",
      "<tbody>" + bodyRows + "</tbody>",
      "</table>",
      renderFooter(program),
      "</section>"
    ].join("")];
  }

  function renderPrinciplesPage(program) {
    var principles = Array.isArray(program.principles) ? program.principles : [];

    return [
      "<section class=\"npdf-page\">",
      "<p class=\"npdf-kicker\">Guidance</p>",
      "<h1 class=\"npdf-title\" style=\"font-size:24px;\">Global Programming Principles</h1>",
      "<ul class=\"npdf-list\">" + principles.map(function (item) {
        return "<li>" + escapeHtml(item) + "</li>";
      }).join("") + "</ul>",
      renderFooter(program),
      "</section>"
    ].join("");
  }

  function renderPhasePage(program, phase) {
    var overviewBlock = [
      "<section class=\"npdf-section\">",
      "<div class=\"npdf-sub-banner\">Phase Overview</div>",
      (phase.primaryObjective ? "<p style=\"margin-top:8px;font-size:12px;\"><strong>Objective:</strong> " + escapeHtml(phase.primaryObjective) + "</p>" : ""),
      (phase.rationale ? "<p style=\"margin-top:6px;font-size:12px;\"><strong>Rationale:</strong> " + escapeHtml(phase.rationale) + "</p>" : ""),
      renderListInline("Priorities", phase.priorities),
      renderListInline("Qualities Developed", phase.qualitiesDeveloped),
      renderListInline("Qualities Maintained", phase.qualitiesMaintained),
      "</section>"
    ].join("");

    var generalTrainingOverviewRows = buildGeneralTrainingOverviewRows(program, phase);
    var generalWeeklyStructureRows = buildGeneralWeeklyStructureRows(phase);

    var generalTrainingOverviewHtml = generalTrainingOverviewRows.length
      ? "<section class=\"npdf-section\"><div class=\"npdf-sub-banner\">General Training Overview</div><table class=\"npdf-table\"><thead><tr><th>Parameter</th><th>Guidance</th></tr></thead><tbody>" + generalTrainingOverviewRows.map(function (row) {
          return "<tr><td>" + escapeHtml(row.parameter || "") + "</td><td>" + escapeHtml(row.guidance || "") + "</td></tr>";
        }).join("") + "</tbody></table></section>"
      : "";

    var activityRoleRows = Array.isArray(phase.activityEmphasis) && phase.activityEmphasis.length
      ? "<section class=\"npdf-section\"><div class=\"npdf-sub-banner\">Activity Roles And Frequency</div><table class=\"npdf-table\"><thead><tr><th>Activity</th><th>Status</th><th>Frequency</th><th>Notes</th></tr></thead><tbody>" + phase.activityEmphasis.map(function (item) {
          return "<tr><td>" + escapeHtml(resolveActivityName(program.activities, item.activityId)) + "</td><td>" + escapeHtml(item.status) + "</td><td>" + escapeHtml(item.frequency || "") + "</td><td>" + escapeHtml(item.notes || "") + "</td></tr>";
        }).join("") + "</tbody></table></section>"
      : "";

    var placementHtml = generalWeeklyStructureRows.length
      ? "<section class=\"npdf-section\"><div class=\"npdf-sub-banner\">General Weekly Structure</div><table class=\"npdf-table\"><thead><tr><th>Day</th><th>Focus</th><th>Notes</th></tr></thead><tbody>" + generalWeeklyStructureRows.map(function (row) {
          return "<tr><td>" + escapeHtml(row.day || "") + "</td><td>" + escapeHtml(row.focus || "") + "</td><td>" + escapeHtml(row.notes || "") + "</td></tr>";
        }).join("") + "</tbody></table>" + (phase.weeklyPlacementOptions && phase.weeklyPlacementOptions.rule ? "<div class=\"npdf-warning\" style=\"margin-top:10px;\"><strong>Placement rule:</strong> " + escapeHtml(phase.weeklyPlacementOptions.rule) + "</div>" : "") + "</section>"
      : "";

    var sessionsHtml = renderCondensedPhaseSessions(phase);

    var activityPlansHtml = Array.isArray(phase.activityPlans) && phase.activityPlans.length
      ? "<section class=\"npdf-section\"><div class=\"npdf-sub-banner\">Activity-Specific Plans</div>" + phase.activityPlans.map(function (plan) {
          return renderActivityPlan(program, plan);
        }).join("") + "</section>"
      : "";

    var monitoringHtml = renderMonitoringAndAdjustments(phase);

    var assessmentsHtml = Array.isArray(phase.assessments) && phase.assessments.length
      ? "<section class=\"npdf-section\"><div class=\"npdf-sub-banner\">Assessments And Criteria For Advancing</div><table class=\"npdf-table\"><thead><tr><th>Assessment</th><th>Benchmark</th><th>Notes</th></tr></thead><tbody>" + phase.assessments.map(function (assessment) {
          return "<tr><td>" + escapeHtml(assessment.title) + "</td><td>" + escapeHtml(assessment.benchmark || "") + "</td><td>" + escapeHtml((assessment.notes || []).join(" • ")) + "</td></tr>";
        }).join("") + "</tbody></table>" + renderListInline("Exit Criteria", phase.exitCriteria) + "</section>"
      : "";

    return [
      "<section class=\"npdf-page\">",
      "<div class=\"npdf-phase-banner\">",
      "<div class=\"npdf-phase-idx\">PHASE " + String(phase.order) + "</div>",
      "<div class=\"npdf-phase-name\"><h2>" + escapeHtml(phase.name) + "</h2><div class=\"npdf-phase-meta\">" + escapeHtml(phase.dateLabel || "") + (phase.primaryObjective ? " | " + escapeHtml(phase.primaryObjective) : "") + "</div></div>",
      "</div>",
      overviewBlock,
      generalTrainingOverviewHtml,
      activityRoleRows,
      placementHtml,
      sessionsHtml,
      activityPlansHtml,
      monitoringHtml,
      assessmentsHtml,
      renderFooter(program),
      "</section>"
    ].join("");
  }

  function buildGeneralTrainingOverviewRows(program, phase) {
    var rows = [];
    var customRows = parseLines(cleanText(phase && phase.generalTrainingOverviewText));

    customRows.forEach(function (line) {
      var parts = String(line || "").split("|");
      var parameter = cleanText(parts[0]);
      var guidance = cleanText(parts.slice(1).join("|"));
      if (!parameter) {
        return;
      }
      rows.push({
        parameter: parameter,
        guidance: guidance || ""
      });
    });

    if (rows.length) {
      return rows;
    }

    var activityPlans = Array.isArray(phase && phase.activityPlans) ? phase.activityPlans : [];

    activityPlans.forEach(function (plan) {
      var activityName = resolveActivityName(program.activities, plan.activityId) || "Training";
      if (plan.frequency) {
        rows.push({ parameter: activityName + " frequency", guidance: plan.frequency });
      }
      if (plan.intensityGuidance) {
        rows.push({ parameter: activityName + " intensity", guidance: plan.intensityGuidance });
      }
      if (plan.volumeGuidance) {
        rows.push({ parameter: activityName + " volume", guidance: plan.volumeGuidance });
      }
    });

    if (!rows.length) {
      var priorities = Array.isArray(phase && phase.priorities) ? phase.priorities : [];
      priorities.slice(0, 6).forEach(function (item, index) {
        rows.push({
          parameter: index === 0 ? "Primary emphasis" : "Supporting emphasis",
          guidance: item
        });
      });
    }

    if (!rows.length) {
      rows.push({
        parameter: "Primary objective",
        guidance: cleanText(phase && phase.primaryObjective) || "Execute the phase objective with consistent quality."
      });
      rows.push({
        parameter: "Duration",
        guidance: (phase && phase.durationWeeks ? String(phase.durationWeeks) + " weeks" : "Planned phase duration")
      });
      rows.push({
        parameter: "Progression",
        guidance: "Progress when recovery and execution quality remain strong; reduce when fatigue markers rise."
      });
    }

    return rows;
  }

  function buildGeneralWeeklyStructureRows(phase) {
    var rows = [];
    var dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    var customRows = parseLines(cleanText(phase && phase.generalWeeklyStructureText));

    if (customRows.length) {
      var byDay = {};
      var extras = [];

      customRows.forEach(function (line) {
        var parts = String(line || "").split("|");
        var day = cleanText(parts[0]);
        var focus = cleanText(parts[1]);
        var notes = cleanText(parts.slice(2).join("|"));
        var normalized = {
          focus: focus || "",
          notes: notes || ""
        };
        var dayKey = day.toLowerCase();

        if (dayKey && dayLabels.some(function (label) { return label.toLowerCase() === dayKey; })) {
          if (!byDay[dayKey]) {
            byDay[dayKey] = normalized;
          }
          return;
        }

        extras.push(normalized);
      });

      var hasNamedWeekday = dayLabels.some(function (dayLabel) {
        return !!byDay[dayLabel.toLowerCase()];
      });

      return dayLabels.map(function (dayLabel) {
        var dayKey = dayLabel.toLowerCase();
        var sourceRow = byDay[dayKey] || (!hasNamedWeekday ? extras.shift() : null) || {};
        return {
          day: dayLabel,
          focus: cleanText(sourceRow.focus) || "",
          notes: cleanText(sourceRow.notes) || ""
        };
      });
    }

    var placementRows = phase && phase.weeklyPlacementOptions && Array.isArray(phase.weeklyPlacementOptions.rows)
      ? phase.weeklyPlacementOptions.rows
      : [];

    placementRows.forEach(function (row) {
      rows.push({
        day: row.day,
        focus: row.session || row.adaptation || "Session",
        notes: compact([row.adaptation, row.guidance]).join(" • ")
      });
    });

    if (!rows.length) {
      var schedules = Array.isArray(phase && phase.weeklySchedules) ? phase.weeklySchedules : [];
      var sampleWeek = schedules.length ? schedules[0] : null;
      var scheduleRows = sampleWeek && Array.isArray(sampleWeek.rows) ? sampleWeek.rows : [];
      scheduleRows.forEach(function (row) {
        rows.push({
          day: row.day,
          focus: row.session || row.activity || "Session",
          notes: compact([row.activity, row.intensity, row.duration, row.notes]).join(" • ")
        });
      });
    }

    return rows;
  }

  function renderCondensedPhaseSessions(phase) {
    var sessions = Array.isArray(phase && phase.sessions) ? phase.sessions : [];
    var schedules = Array.isArray(phase && phase.weeklySchedules) ? phase.weeklySchedules : [];
    if (!sessions.length && !schedules.length) {
      return "";
    }

    var startWeek = parseInt(phase && phase.startWeek, 10);
    var endWeek = parseInt(phase && phase.endWeek, 10);
    var weekList = Number.isFinite(startWeek) && Number.isFinite(endWeek) && endWeek >= startWeek
      ? range(startWeek, endWeek)
      : [];

    if (!weekList.length) {
      weekList = dedupe(
        schedules.map(function (schedule) {
          return parseWeekFromSchedule(schedule);
        }).filter(function (week) {
          return Number.isFinite(week);
        })
      );
    }

    if (!weekList.length) {
      weekList = dedupe(
        sessions.map(function (session) {
          var slot = parseSlotKey(String((session && session.id) || "").replace(/^session-/, ""));
          return slot ? slot.week : NaN;
        }).filter(function (week) {
          return Number.isFinite(week);
        })
      );
    }

    weekList.sort(function (a, b) { return a - b; });

    var dayNumbers = range(1, 7);
    var dayWeekMap = {};
    dayNumbers.forEach(function (day) {
      dayWeekMap[day] = {};
      weekList.forEach(function (week) {
        dayWeekMap[day][week] = {};
      });
    });

    schedules.forEach(function (schedule) {
      var week = parseWeekFromSchedule(schedule);
      if (!Number.isFinite(week)) {
        return;
      }
      if (!dayWeekMap[1][week]) {
        weekList.push(week);
        dayNumbers.forEach(function (day) {
          dayWeekMap[day][week] = {};
        });
      }

      var scheduleRows = Array.isArray(schedule && schedule.rows) ? schedule.rows : [];
      scheduleRows.forEach(function (row, rowIndex) {
        // Schedule rows are generated in slot order (day 1..7), which is more reliable
        // than legacy weekday labels that may have been seeded with a different week start.
        var day = clampNumber(rowIndex + 1, 1, 7, 1);
        var entry = dayWeekMap[day] && dayWeekMap[day][week] ? dayWeekMap[day][week] : null;
        if (!entry) {
          return;
        }
        entry.title = cleanText(row && row.session) || entry.title;
      });
    });

    sessions.forEach(function (session) {
      var slot = parseSlotKey(String((session && session.id) || "").replace(/^session-/, ""));
      if (!slot || !dayWeekMap[slot.workout]) {
        return;
      }

      if (!dayWeekMap[slot.workout][slot.week]) {
        weekList.push(slot.week);
        dayNumbers.forEach(function (day) {
          dayWeekMap[day][slot.week] = dayWeekMap[day][slot.week] || {};
        });
      }

      var entry = dayWeekMap[slot.workout][slot.week];
      entry.session = session;
      entry.title = cleanText(session && session.title) || entry.title;
    });

    weekList = dedupe(weekList).sort(function (a, b) { return a - b; });

    var cards = dayNumbers.map(function (dayNumber) {
      var entriesByWeek = {};
      weekList.forEach(function (week) {
        entriesByWeek[week] = (dayWeekMap[dayNumber] && dayWeekMap[dayNumber][week]) ? dayWeekMap[dayNumber][week] : {};
      });

      var rows = [];
      var rowLookup = {};

      weekList.forEach(function (week) {
        var entry = entriesByWeek[week] || {};
        var detailedSession = entry.session;
        if (!detailedSession) {
          return;
        }

        var sectionOccurrence = {};

        (Array.isArray(detailedSession.sections) ? detailedSession.sections : []).forEach(function (section) {
          var blockName = textOrFallback(section && section.title, "Block");
          (Array.isArray(section && section.exercises) ? section.exercises : []).forEach(function (exercise) {
            var exerciseName = textOrFallback(exercise && exercise.name, "Exercise");
            var occurrenceKey = blockName + "::" + exerciseName;
            sectionOccurrence[occurrenceKey] = (sectionOccurrence[occurrenceKey] || 0) + 1;
            var rowKey = occurrenceKey + "::" + String(sectionOccurrence[occurrenceKey]);

            if (!rowLookup[rowKey]) {
              rowLookup[rowKey] = {
                block: blockName,
                exercise: exerciseName,
                weekCells: {}
              };
              rows.push(rowLookup[rowKey]);
            }

            rowLookup[rowKey].weekCells[week] = summarizeExerciseDose(exercise);
          });
        });
      });

      if (!rows.length) {
        rows.push({
          block: "Session",
          exercise: "Session Title",
          weekCells: {}
        });
        weekList.forEach(function (week) {
          var entry = entriesByWeek[week] || {};
          var title = cleanText(entry.title);
          var purpose = cleanText(entry.session && entry.session.purpose);
          rows[0].weekCells[week] = title || purpose || "-";
        });
      }

      var firstDetailed = null;
      for (var i = 0; i < weekList.length; i += 1) {
        var candidate = entriesByWeek[weekList[i]];
        if (candidate && candidate.session) {
          firstDetailed = candidate.session;
          break;
        }
      }
      var firstWithTitle = null;
      for (var j = 0; j < weekList.length; j += 1) {
        var titled = entriesByWeek[weekList[j]];
        if (titled && cleanText(titled.title)) {
          firstWithTitle = titled;
          break;
        }
      }

      var headerTitle = cleanText(firstWithTitle && firstWithTitle.title) || cleanText(firstDetailed && firstDetailed.title) || ("Day " + String(dayNumber));
      var dayMeta = joinCompact([
        firstDetailed && firstDetailed.type,
        firstDetailed && firstDetailed.duration,
        firstDetailed && firstDetailed.targetRpe ? ("RPE " + firstDetailed.targetRpe) : ""
      ]);

      return [
        "<article class=\"npdf-session\">",
        "<div class=\"npdf-session-head\">",
        "<div><div class=\"npdf-session-title\">Day " + String(dayNumber) + " - " + escapeHtml(headerTitle) + "</div><div class=\"npdf-session-meta\">" + escapeHtml(dayMeta) + "</div></div>",
        "</div>",
        "<div class=\"npdf-session-body\">",
        "<table class=\"npdf-table npdf-exercise-table\">",
        "<thead><tr><th>Block</th><th>Exercise</th>" + weekList.map(function (week) {
          return "<th>Week " + String(week) + "</th>";
        }).join("") + "</tr></thead>",
        "<tbody>" + rows.map(function (row) {
          return "<tr><td>" + escapeHtml(row.block) + "</td><td>" + escapeHtml(row.exercise) + "</td>" + weekList.map(function (week) {
            return "<td>" + escapeHtml(row.weekCells[week] || "-") + "</td>";
          }).join("") + "</tr>";
        }).join("") + "</tbody>",
        "</table>",
        "</div>",
        "</article>"
      ].join("");
    }).join("");

    return cards
      ? "<section class=\"npdf-section\"><div class=\"npdf-sub-banner\">Complete Training Sessions</div>" + cards + "</section>"
      : "";
  }

  function summarizeExerciseDose(exercise) {
    var sets = Array.isArray(exercise && exercise.sets) ? exercise.sets : [];
    var firstSet = sets.length ? (sets[0] && typeof sets[0] === "object" ? sets[0] : {}) : {};
    var setCount = sets.length || parseInt(exercise && exercise.set_count, 10) || parseInt(exercise && exercise.sets, 10) || 0;
    var reps = firstNonEmpty(
      extractPrintableDoseText(firstSet.target_reps),
      extractPrintableDoseText(firstSet.reps),
      extractPrintableDoseText(exercise && exercise.target_reps),
      extractPrintableDoseText(exercise && exercise.reps),
      extractPrintableDoseText(exercise && exercise.duration),
      extractPrintableDoseText(exercise && exercise.distance)
    );
    var intensity = firstNonEmpty(
      extractPrintableDoseText(firstSet.target_rpe),
      extractPrintableDoseText(firstSet.rpe),
      extractPrintableDoseText(firstSet.target_intensity),
      extractPrintableDoseText(firstSet.intensity),
      extractPrintableDoseText(exercise && exercise.target_rpe),
      extractPrintableDoseText(exercise && exercise.rpe),
      extractPrintableDoseText(exercise && exercise.target_intensity),
      extractPrintableDoseText(exercise && exercise.intensity),
      extractPrintableDoseText(exercise && exercise.load),
      cleanText(exercise && exercise.rir) ? ("RIR " + String(exercise.rir)) : ""
    );
    var doseParts = [];

    if (setCount > 0 && reps) {
      doseParts.push(String(setCount) + " x " + reps);
    } else if (reps) {
      doseParts.push(reps);
    } else if (setCount > 0) {
      doseParts.push(String(setCount) + " sets");
    }

    if (intensity) {
      doseParts.push(intensity);
    }

    var details = doseParts.join(" | ");
    return details || "-";
  }

  function extractPrintableDoseText(value) {
    var text = cleanText(value);
    if (!text) {
      return "";
    }

    var patterns = [
      /^\d+\s*x\s*\d+(?:\s*[-–]\s*\d+)?(?:\s*(?:sec|secs|s|min|mins|minute|minutes|reps?|rounds?|km|m|yd|yards|meters|metres))?/i,
      /^\d+(?:\s*[-–]\s*\d+)?(?:\s*(?:sec|secs|s|min|mins|minute|minutes|reps?|rounds?|km|m|yd|yards|meters|metres))?/i,
      /^\d+\s*(?:sec|secs|s|min|mins|minute|minutes)/i
    ];

    for (var i = 0; i < patterns.length; i += 1) {
      var match = patterns[i].exec(text);
      if (match && match[0]) {
        return cleanText(match[0]);
      }
    }

    return text;
  }

  function parseWeekFromSchedule(schedule) {
    var id = cleanText(schedule && schedule.id);
    var fromId = id.match(/^week-(\d+)$/i);
    if (fromId) {
      return parseInt(fromId[1], 10);
    }

    var label = cleanText(schedule && schedule.label);
    var fromLabel = label.match(/week\s*(\d+)/i);
    if (fromLabel) {
      return parseInt(fromLabel[1], 10);
    }

    return NaN;
  }

  function resolveDayNumberFromLabel(dayLabel, fallbackDay) {
    var text = cleanText(dayLabel).toLowerCase();
    var byName = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 7
    };

    if (byName[text]) {
      return byName[text];
    }

    var match = text.match(/day\s*(\d+)/i);
    if (match) {
      return clampNumber(parseInt(match[1], 10), 1, 7, fallbackDay || 1);
    }

    return clampNumber(parseInt(fallbackDay, 10), 1, 7, 1);
  }

  function renderActivityPlan(program, plan) {
    return [
      "<article class=\"npdf-session\" style=\"margin-top:8px;\">",
      "<div class=\"npdf-session-head\"><div class=\"npdf-session-title\">" + escapeHtml(resolveActivityName(program.activities, plan.activityId)) + "</div></div>",
      "<div class=\"npdf-session-body\">",
      renderListInline("Purpose", compact([plan.purpose])),
      renderListInline("Frequency", compact([plan.frequency])),
      renderListInline("Intensity Guidance", compact([plan.intensityGuidance])),
      renderListInline("Volume Guidance", compact([plan.volumeGuidance])),
      renderListInline("Technical Priorities", plan.technicalPriorities),
      renderListInline("Week-by-Week Progression", plan.progressionByWeek),
      renderListInline("Restrictions", plan.restrictions),
      renderListInline("Recovery Rules", plan.recoveryRules),
      renderListInline("Advancement Criteria", plan.advancementCriteria),
      "</div>",
      "</article>"
    ].join("");
  }

  function renderMonitoringAndAdjustments(phase) {
    var monitoring = Array.isArray(phase.monitoring) ? phase.monitoring : [];
    var adjustmentRules = Array.isArray(phase.adjustmentRules) ? phase.adjustmentRules : [];

    if (!monitoring.length && !adjustmentRules.length) {
      return "";
    }

    var monitoringHtml = monitoring.length
      ? "<table class=\"npdf-table\"><thead><tr><th>Metric</th><th>Target</th><th>Frequency</th><th>Notes</th></tr></thead><tbody>" + monitoring.map(function (item) {
          return "<tr><td>" + escapeHtml(item.metric) + "</td><td>" + escapeHtml(item.target || "") + "</td><td>" + escapeHtml(item.frequency || "") + "</td><td>" + escapeHtml(item.notes || "") + "</td></tr>";
        }).join("") + "</tbody></table>"
      : "";

    var grouped = {
      progress: [],
      reduce: [],
      stop: []
    };

    adjustmentRules.forEach(function (rule) {
      var key = rule && rule.category ? rule.category : "reduce";
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(rule.rule);
    });

    var rulesHtml = [
      renderListInline("Progress training when", grouped.progress),
      renderListInline("Reduce or modify training when", grouped.reduce),
      renderListInline("Stop and reassess when", grouped.stop)
    ].join("");

    return [
      "<section class=\"npdf-section\">",
      "<div class=\"npdf-sub-banner\">Monitoring And Adjustment Rules</div>",
      monitoringHtml,
      rulesHtml,
      "</section>"
    ].join("");
  }

  function renderAssessmentsPage(program) {
    var rows = (Array.isArray(program.assessments) ? program.assessments : []).map(function (assessment) {
      return "<tr><td>" + escapeHtml(assessment.title) + "</td><td>" + escapeHtml(assessment.dateLabel || "") + "</td><td>" + escapeHtml(assessment.benchmark || "") + "</td><td>" + escapeHtml((assessment.notes || []).join(" • ")) + "</td></tr>";
    }).join("");

    return [
      "<section class=\"npdf-page\">",
      "<p class=\"npdf-kicker\">Benchmarks</p>",
      "<h1 class=\"npdf-title\" style=\"font-size:24px;\">Assessments And Benchmarks</h1>",
      "<table class=\"npdf-table\"><thead><tr><th>Assessment</th><th>Date</th><th>Benchmark</th><th>Notes</th></tr></thead><tbody>" + rows + "</tbody></table>",
      renderFooter(program),
      "</section>"
    ].join("");
  }

  function renderWorksheetsPage(program) {
    var cards = (Array.isArray(program.worksheets) ? program.worksheets : []).map(function (worksheet) {
      return "<article class=\"npdf-session\" style=\"margin-top:8px;\"><div class=\"npdf-session-head\"><div class=\"npdf-session-title\">" + escapeHtml(worksheet.title) + "</div></div><div class=\"npdf-session-body\"><p class=\"npdf-muted\">" + escapeHtml(worksheet.description || "Optional worksheet") + "</p></div></article>";
    }).join("");

    return [
      "<section class=\"npdf-page\">",
      "<p class=\"npdf-kicker\">Worksheets</p>",
      "<h1 class=\"npdf-title\" style=\"font-size:24px;\">Optional Worksheets</h1>",
      cards,
      renderFooter(program),
      "</section>"
    ].join("");
  }

  function renderCoachNotesPage(program) {
    return [
      "<section class=\"npdf-page\">",
      "<p class=\"npdf-kicker\">Coach</p>",
      "<h1 class=\"npdf-title\" style=\"font-size:24px;\">Coach Notes</h1>",
      "<ul class=\"npdf-list\">" + (program.coachNotes || []).map(function (item) {
        return "<li>" + escapeHtml(item) + "</li>";
      }).join("") + "</ul>",
      renderFooter(program),
      "</section>"
    ].join("");
  }

  function renderFinalSummaryPage(program, warnings) {
    var summary = program.summary || {};

    return [
      "<section class=\"npdf-page\">",
      "<p class=\"npdf-kicker\">Summary</p>",
      "<h1 class=\"npdf-title\" style=\"font-size:24px;\">Final Summary</h1>",
      "<div class=\"npdf-meta-grid\">",
      renderMetaCard("Total Phases", summary.totalPhases != null ? String(summary.totalPhases) : ""),
      renderMetaCard("Total Sessions", summary.totalSessions != null ? String(summary.totalSessions) : ""),
      renderMetaCard("Activities", summary.totalActivities != null ? String(summary.totalActivities) : ""),
      renderMetaCard("Program Duration", summary.durationWeeks != null ? String(summary.durationWeeks) + " weeks" : ""),
      "</div>",
      (Array.isArray(warnings) && warnings.length
        ? "<section class=\"npdf-section\"><h3>Review Items</h3><ul class=\"npdf-list\">" + warnings.map(function (item) {
            return "<li>" + escapeHtml(item) + "</li>";
          }).join("") + "</ul></section>"
        : ""),
      "<section class=\"npdf-section\"><p class=\"npdf-muted\">Regenerate this PDF any time program structure, phases, sessions, or activity emphasis changes.</p></section>",
      renderFooter(program),
      "</section>"
    ].join("");
  }

  function openProgramPdfPreview(rawProgram, options) {
    var normalizeResult = normalizeProgramForPdf(rawProgram);
    var program = normalizeResult.program;
    var warnings = normalizeResult.warnings;
    var config = options && typeof options === "object" ? options : {};

    var previewWindow = global.open("", "nomadic-program-pdf-preview", "width=1280,height=960");
    if (!previewWindow) {
      return {
        ok: false,
        warnings: warnings,
        error: "Please allow pop-ups to open the PDF preview."
      };
    }

    previewWindow.document.open();
    previewWindow.document.write(buildProgramPdfDocument(program, warnings));
    previewWindow.document.close();
    previewWindow.focus();

    if (config.autoPrint) {
      setTimeout(function () {
        try {
          previewWindow.print();
        } catch (_error) {
          // no-op
        }
      }, 120);
    }

    return {
      ok: true,
      warnings: warnings,
      program: program
    };
  }

  function renderFooter(program) {
    return [
      "<footer class=\"npdf-footer\">",
      "<span>" + escapeHtml(program.brand.name) + "</span>",
      "<span>Page <span class=\"npdf-page-number\"></span></span>",
      "</footer>"
    ].join("");
  }

  function renderMetaCard(label, value) {
    return [
      "<article class=\"npdf-meta-card\">",
      "<div class=\"npdf-meta-label\">" + escapeHtml(label) + "</div>",
      "<div class=\"npdf-meta-value\">" + escapeHtml(value || "") + "</div>",
      "</article>"
    ].join("");
  }

  function renderListInline(title, values) {
    var list = Array.isArray(values) ? values.filter(Boolean) : [];
    if (!list.length) {
      return "";
    }

    return "<section class=\"npdf-section\"><h4 style=\"font-size:12px; margin-bottom:6px;\">" + escapeHtml(title) + "</h4><ul class=\"npdf-list\" style=\"margin-top:0;\">" + list.map(function (item) {
      return "<li>" + escapeHtml(item) + "</li>";
    }).join("") + "</ul></section>";
  }

  function resolveExerciseColumns(exercises) {
    var rows = Array.isArray(exercises) ? exercises : [];

    var columnMap = [
      {
        key: "name",
        label: "Exercise",
        value: function (exercise) { return exercise.name; },
        enabled: true
      },
      {
        key: "sets",
        label: "Sets",
        value: function (exercise) { return exercise.sets != null ? String(exercise.sets) : ""; },
        enabled: hasAny(rows, function (exercise) { return exercise.sets != null && String(exercise.sets).trim() !== ""; })
      },
      {
        key: "repOrDuration",
        label: "Repetitions or Duration",
        value: function (exercise) { return firstNonEmpty(exercise.reps, exercise.duration, exercise.distance); },
        enabled: hasAny(rows, function (exercise) { return !!firstNonEmpty(exercise.reps, exercise.duration, exercise.distance); })
      },
      {
        key: "intensity",
        label: "Intensity",
        value: function (exercise) { return firstNonEmpty(exercise.intensity, exercise.rpe ? ("RPE " + exercise.rpe) : "", exercise.rir ? ("RIR " + exercise.rir) : "", exercise.load); },
        enabled: hasAny(rows, function (exercise) { return !!firstNonEmpty(exercise.intensity, exercise.rpe, exercise.rir, exercise.load); })
      },
      {
        key: "rest",
        label: "Rest",
        value: function (exercise) { return exercise.rest || ""; },
        enabled: hasAny(rows, function (exercise) { return !!exercise.rest; })
      },
      {
        key: "notes",
        label: "Coaching Notes",
        value: function (exercise) { return Array.isArray(exercise.notes) ? exercise.notes.join(" • ") : ""; },
        enabled: hasAny(rows, function (exercise) { return Array.isArray(exercise.notes) && exercise.notes.length; })
      }
    ];

    return columnMap.filter(function (column) {
      return column.enabled;
    });
  }

  function joinActivityLabels(activities, emphasisRows) {
    var lookup = arrayToLookup(Array.isArray(activities) ? activities : [], "id");
    return (Array.isArray(emphasisRows) ? emphasisRows : []).map(function (item) {
      var activity = lookup[item.activityId];
      return activity ? activity.name : item.activityId;
    }).join(", ");
  }

  function resolveActivityName(activities, activityId) {
    var lookup = arrayToLookup(Array.isArray(activities) ? activities : [], "id");
    return lookup[activityId] && lookup[activityId].name ? lookup[activityId].name : activityId;
  }

  function extractStrengthFrequency(phase) {
    var priorities = Array.isArray(phase && phase.priorities) ? phase.priorities : [];
    var item = priorities.find(function (entry) {
      return /strength/i.test(String(entry || ""));
    });
    return item || "";
  }

  function resolveSessionTitle(slotKey, plan, customDayNames) {
    var custom = customDayNames && customDayNames[slotKey] ? cleanText(customDayNames[slotKey]) : "";
    if (custom) {
      return custom;
    }

    if (cleanText(plan && plan.title)) {
      return cleanText(plan.title);
    }

    var parsed = parseSlotKey(slotKey);
    if (!parsed) {
      return "Session";
    }

    return "Week " + String(parsed.week) + " - Workout " + String(parsed.workout);
  }

  function parseDurationFromPlan(plan, exercises) {
    var minutes = parseInt(plan && plan.duration_minutes, 10);
    if (Number.isFinite(minutes) && minutes > 0) {
      return String(minutes) + " min";
    }

    var fallback = inferDurationFromExercises(exercises);
    return fallback;
  }

  function inferDurationFromExercises(exercises) {
    if (!Array.isArray(exercises)) {
      return "";
    }

    var durations = [];
    exercises.forEach(function (exercise) {
      var sets = Array.isArray(exercise && exercise.sets) ? exercise.sets : [];
      sets.forEach(function (set) {
        var repText = firstNonEmpty(set && set.target_reps, set && set.reps);
        if (repText && looksLikeDuration(repText)) {
          durations.push(repText);
        }
      });
    });

    return summarizeSetValue(durations);
  }

  function inferSessionTypeFromExercises(exercises) {
    var rows = Array.isArray(exercises) ? exercises : [];
    if (!rows.length) {
      return "session";
    }

    var enduranceCount = rows.filter(function (exercise) {
      return String(exercise && exercise.mode || "").toLowerCase() === "endurance";
    }).length;

    if (enduranceCount > 0 && enduranceCount >= Math.ceil(rows.length / 2)) {
      return "endurance";
    }

    return "strength";
  }

  function cleanFrequencyLabel(phase) {
    var total = parseInt(phase && phase.training_days_per_week, 10);
    if (!Number.isFinite(total) || total <= 0) {
      return "";
    }
    return String(total) + " sessions / week";
  }

  function normalizePhaseNameForPdf(rawName, order) {
    var fallback = "Phase " + String(order);
    var name = cleanText(rawName);
    if (!name) {
      return fallback;
    }

    var match = name.match(/^phase\s*\d+\s*(?:[:\-]\s*)?(.*)$/i);
    if (!match) {
      return name;
    }

    var descriptor = cleanText(match[1]);
    return descriptor ? (fallback + ": " + descriptor) : fallback;
  }

  function normalizePhases(rawPhases, totalWeeks, warnings) {
    var source = Array.isArray(rawPhases) ? rawPhases : [];
    var normalized = source
      .map(function (phase, index) {
        var item = phase && typeof phase === "object" ? phase : {};
        var explicitOrder = parsePhaseOrder(item);
        return {
          __sourceIndex: index,
          __explicitOrder: explicitOrder,
          name: cleanText(item.name) || ("Phase " + String(index + 1)),
          start_week: clampNumber(
            parseInt(item.start_week != null ? item.start_week : (item.phase_start_week != null ? item.phase_start_week : item.startWeek), 10),
            1,
            totalWeeks,
            Math.min(index + 1, totalWeeks)
          ),
          end_week: clampNumber(
            parseInt(item.end_week != null ? item.end_week : (item.phase_end_week != null ? item.phase_end_week : item.endWeek), 10),
            1,
            totalWeeks,
            Math.min(index + 1, totalWeeks)
          ),
          focus: cleanText(item.focus),
          rationale: cleanText(item.rationale),
          priorities_text: cleanText(item.priorities_text),
          general_training_overview_text: cleanText(item.general_training_overview_text),
          general_weekly_structure_text: cleanText(item.general_weekly_structure_text),
          strength_rule: cleanText(item.strength_rule),
          endurance_rule: cleanText(item.endurance_rule),
          monitoring_metrics_text: cleanText(item.monitoring_metrics_text),
          progress_rules_text: cleanText(item.progress_rules_text),
          reduce_rules_text: cleanText(item.reduce_rules_text),
          stop_rules_text: cleanText(item.stop_rules_text),
          phase_assessments_text: cleanText(item.phase_assessments_text),
          exit_criteria_text: cleanText(item.exit_criteria_text),
          training_days_per_week: 7,
          strength_days_per_week: clampNumber(parseInt(item.strength_days_per_week, 10), 0, 14, 0),
          cardio_days_per_week: clampNumber(parseInt(item.cardio_days_per_week != null ? item.cardio_days_per_week : item.endurance_days_per_week, 10), 0, 14, 0),
          skill_days_per_week: clampNumber(parseInt(item.skill_days_per_week != null ? item.skill_days_per_week : item.mobility_days_per_week, 10), 0, 14, 0)
        };
      })
      .sort(function (a, b) {
        var aHasExplicit = Number.isFinite(a.__explicitOrder);
        var bHasExplicit = Number.isFinite(b.__explicitOrder);
        if (aHasExplicit && bHasExplicit && a.__explicitOrder !== b.__explicitOrder) {
          return a.__explicitOrder - b.__explicitOrder;
        }
        if (a.start_week !== b.start_week) {
          return a.start_week - b.start_week;
        }
        if (a.end_week !== b.end_week) {
          return a.end_week - b.end_week;
        }
        return a.__sourceIndex - b.__sourceIndex;
      });

    normalized = realignPhaseWeeksIfNeeded(normalized, totalWeeks, warnings);

    normalized.forEach(function (phase) {
      if (phase.end_week < phase.start_week) {
        warnings.push("Phase '" + phase.name + "' end week was before start week and was corrected.");
        phase.end_week = phase.start_week;
      }
    });

    if (!normalized.length) {
      normalized.push({
        name: "Phase 1",
        start_week: 1,
        end_week: Math.max(1, totalWeeks),
        focus: "",
        rationale: "",
        strength_rule: "",
        endurance_rule: "",
        training_days_per_week: 7,
        strength_days_per_week: 1,
        cardio_days_per_week: 1,
        skill_days_per_week: 1
      });
      warnings.push("No explicit phases found, generated a default phase.");
    }

    return normalized;
  }

  function realignPhaseWeeksIfNeeded(phases, totalWeeks, warnings) {
    var source = Array.isArray(phases) ? phases : [];
    if (!source.length) {
      return source;
    }

    var overlapCount = 0;
    var repeatedStartWeekOne = 0;
    var previousEnd = 0;

    source.forEach(function (phase) {
      if (!phase || typeof phase !== "object") {
        return;
      }
      if (Number(phase.start_week) === 1) {
        repeatedStartWeekOne += 1;
      }
      if (Number(phase.start_week) <= previousEnd) {
        overlapCount += 1;
      }
      previousEnd = Math.max(previousEnd, Number(phase.end_week) || previousEnd);
    });

    var needsRealign = overlapCount > 1 || repeatedStartWeekOne > 1;
    if (!needsRealign) {
      return source;
    }

    warnings.push("Phase week ranges overlapped; PDF re-aligned phases sequentially from week 1.");

    var cursor = 1;
    return source.map(function (phase) {
      var copy = Object.assign({}, phase);
      var originalStart = clampNumber(parseInt(copy.start_week, 10), 1, totalWeeks, cursor);
      var originalEnd = clampNumber(parseInt(copy.end_week, 10), originalStart, totalWeeks, originalStart);
      var duration = Math.max(1, originalEnd - originalStart + 1);

      var nextStart = clampNumber(cursor, 1, totalWeeks, 1);
      var nextEnd = clampNumber(nextStart + duration - 1, nextStart, totalWeeks, nextStart);
      copy.start_week = nextStart;
      copy.end_week = nextEnd;
      cursor = nextEnd + 1;

      return copy;
    });
  }

  function parsePhaseOrder(phase) {
    var item = phase && typeof phase === "object" ? phase : {};
    var explicit = parseInt(
      item.order != null
        ? item.order
        : (item.phase_order != null ? item.phase_order : item.phaseOrder),
      10
    );
    if (Number.isFinite(explicit) && explicit > 0) {
      return explicit;
    }

    var name = cleanText(item.name);
    if (!name) {
      return NaN;
    }

    var match = name.match(/^phase\s*(\d+)/i);
    if (!match) {
      return NaN;
    }

    var fromName = parseInt(match[1], 10);
    return Number.isFinite(fromName) && fromName > 0 ? fromName : NaN;
  }

  function normalizeStructure(structure) {
    var item = structure && typeof structure === "object" ? structure : {};
    var weeks = clampNumber(parseInt(item.weeks, 10), 1, 156, 1);
    var workoutsPerWeek = clampNumber(parseInt(item.workoutsPerWeek, 10), 1, 14, 3);

    return {
      weeks: weeks,
      workoutsPerWeek: workoutsPerWeek
    };
  }

  function activityNameFromSessionType(sessionType) {
    var value = cleanText(sessionType).toLowerCase();
    if (!value) {
      return "";
    }

    if (value.indexOf("strength") > -1) {
      return "Strength";
    }
    if (value.indexOf("climbing") > -1) {
      return "Climbing";
    }
    if (value.indexOf("mountain_bike") > -1 || value.indexOf("mountain bike") > -1 || value.indexOf("mtb") > -1) {
      return "Mountain Bike";
    }
    if (value.indexOf("cycling") > -1 || value.indexOf("bike") > -1 || value.indexOf("velo") > -1) {
      return "Cycling";
    }
    if (value.indexOf("run") > -1 || value.indexOf("running") > -1 || value.indexOf("jog") > -1) {
      return "Run";
    }
    if (value.indexOf("hiking") > -1 || value.indexOf("hike") > -1 || value.indexOf("ruck") > -1 || value.indexOf("pack") > -1) {
      return "Hiking";
    }
    if (value.indexOf("zone") > -1 || value.indexOf("endurance") > -1 || value.indexOf("threshold") > -1 || value.indexOf("vo2") > -1 || value.indexOf("interval") > -1) {
      return "Endurance";
    }
    if (value.indexOf("skill") > -1 || value.indexOf("sport") > -1) {
      return "Sport Skill";
    }
    if (value.indexOf("mobility") > -1) {
      return "Mobility";
    }
    if (value.indexOf("recovery") > -1 || value.indexOf("rest") > -1) {
      return "Recovery";
    }
    if (value.indexOf("assessment") > -1 || value.indexOf("test") > -1) {
      return "Assessment";
    }
    if (value.indexOf("rehab") > -1 || value.indexOf("return") > -1) {
      return "Rehabilitation";
    }

    return toTitleCase(value.replace(/[_-]+/g, " "));
  }

  function inferActivityFromSportFocus(value) {
    var text = cleanText(value);
    if (!text) {
      return "";
    }
    return prettyActivityName(text);
  }

  function toId(value) {
    return cleanText(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function prettyActivityName(value) {
    return toTitleCase(cleanText(value).replace(/[_-]+/g, " "));
  }

  function normalizeRpe(value) {
    var text = cleanText(value);
    if (!text) {
      return "";
    }
    return text.replace(/^rpe\s*/i, "").trim();
  }

  function normalizeRir(value) {
    var text = cleanText(value);
    if (!text) {
      return "";
    }
    return text.replace(/^rir\s*/i, "").trim();
  }

  function extractRpe(value) {
    var text = cleanText(value);
    if (!text) {
      return "";
    }

    var match = /rpe\s*([0-9]+(?:\.[0-9]+)?)/i.exec(text);
    return match ? match[1] : "";
  }

  function extractRir(value) {
    var text = cleanText(value);
    if (!text) {
      return "";
    }

    var match = /rir\s*([0-9]+(?:\.[0-9]+)?)/i.exec(text);
    return match ? match[1] : "";
  }

  function flattenSplit(values) {
    var list = [];
    (Array.isArray(values) ? values : []).forEach(function (value) {
      String(value || "")
        .split(/[,/|]+/g)
        .forEach(function (part) {
          addIfText(list, cleanText(part));
        });
    });
    return list;
  }

  function groupExercisesBySection(exercises) {
    var groups = {};
    var order = [];

    (Array.isArray(exercises) ? exercises : []).forEach(function (exercise) {
      var item = exercise && typeof exercise === "object" ? exercise : {};
      var section = textOrFallback(item.section, "Session");

      if (!groups[section]) {
        groups[section] = [];
        order.push(section);
      }

      groups[section].push(item);
    });

    return order.map(function (section) {
      return {
        section: section,
        exercises: groups[section]
      };
    });
  }

  function firstNonEmpty() {
    for (var i = 0; i < arguments.length; i++) {
      var value = cleanText(arguments[i]);
      if (value) {
        return value;
      }
    }
    return "";
  }

  function summarizeSetValue(values) {
    var unique = dedupe((Array.isArray(values) ? values : []).map(function (value) {
      return cleanText(value);
    }).filter(Boolean));

    if (!unique.length) {
      return "";
    }

    if (unique.length === 1) {
      return unique[0];
    }

    return unique[0] + "-" + unique[unique.length - 1];
  }

  function looksLikeDuration(value) {
    var text = cleanText(value).toLowerCase();
    return /(sec|secs|second|seconds|min|mins|minute|minutes|hr|hours|:)/.test(text);
  }

  function looksLikeDistance(value) {
    var text = cleanText(value).toLowerCase();
    return /(km|kilometer|mile|m\b|yd|yards|meters|metres)/.test(text);
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

  function parseIsoDate(value) {
    var text = cleanText(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return null;
    }

    var date = new Date(text + "T00:00:00");
    return Number.isFinite(date.getTime()) ? date : null;
  }

  function formatIsoDate(date) {
    if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
      return "";
    }
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function formatDate(date) {
    if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function buildPhaseDateLabel(startWeek, endWeek, startDate) {
    if (!(startDate instanceof Date) || !Number.isFinite(startDate.getTime())) {
      return "Weeks " + String(startWeek) + "-" + String(endWeek);
    }

    var start = addDays(startDate, (startWeek - 1) * 7);
    var end = addDays(startDate, endWeek * 7 - 1);
    return formatDate(start) + " - " + formatDate(end);
  }

  function addDays(date, days) {
    var next = new Date(date.getTime());
    next.setDate(next.getDate() + days);
    return next;
  }

  function addGoal(goals, label, type, sportFocus) {
    var text = cleanText(label);
    if (!text) {
      return;
    }

    goals.push({
      label: text,
      type: type || "custom",
      activityId: sportFocus ? toId(sportFocus) : undefined
    });
  }

  function resolvePdfLogoUrl(source, meta) {
    var explicit = cleanText(
      (source && (
        source.brand_logo_url ||
        source.brandLogoUrl ||
        source.logo_url ||
        source.logoUrl
      )) ||
      (meta && (
        meta.brand_logo_url ||
        meta.brandLogoUrl ||
        meta.logo_url ||
        meta.logoUrl
      ))
    );

    if (explicit) {
      return explicit;
    }

    try {
      if (global && global.location && global.location.href) {
        return new URL("img/nomadicPerformanceLogo.png", global.location.href).href;
      }
    } catch (_error) {
      // Fall through to relative path fallback.
    }

    return "img/nomadicPerformanceLogo.png";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function cleanText(value) {
    return String(value == null ? "" : value).trim();
  }

  function parseLines(value) {
    return String(value == null ? "" : value)
      .split(/\r?\n/)
      .map(function (line) {
        return cleanText(line);
      })
      .filter(function (line) {
        return !!line;
      });
  }

  function textOrFallback(value, fallback) {
    var text = cleanText(value);
    return text || fallback;
  }

  function joinCompact(values) {
    return compact(values).join(" | ");
  }

  function compact(values) {
    return (Array.isArray(values) ? values : []).map(function (value) {
      return cleanText(value);
    }).filter(Boolean);
  }

  function dedupe(values) {
    var seen = {};
    var result = [];

    (Array.isArray(values) ? values : []).forEach(function (value) {
      var key = String(value || "").toLowerCase();
      if (!key || seen[key]) {
        return;
      }
      seen[key] = true;
      result.push(value);
    });

    return result;
  }

  function dedupeByTitle(values) {
    var seen = {};
    var result = [];

    (Array.isArray(values) ? values : []).forEach(function (item) {
      var title = cleanText(item && item.title).toLowerCase();
      if (!title || seen[title]) {
        return;
      }
      seen[title] = true;
      result.push(item);
    });

    return result;
  }

  function clampNumber(value, min, max, fallback) {
    var numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      numeric = Number(fallback);
    }
    if (!Number.isFinite(numeric)) {
      numeric = min;
    }
    return Math.max(min, Math.min(max, numeric));
  }

  function toTitleCase(value) {
    return cleanText(value).replace(/\b([a-z])/g, function (match) {
      return match.toUpperCase();
    });
  }

  function addIfText(list, value) {
    var text = cleanText(value);
    if (text) {
      list.push(text);
    }
  }

  function chunk(items, size) {
    var result = [];
    var source = Array.isArray(items) ? items : [];
    var chunkSize = Math.max(1, parseInt(size, 10) || 1);

    for (var i = 0; i < source.length; i += chunkSize) {
      result.push(source.slice(i, i + chunkSize));
    }

    return result;
  }

  function arrayToLookup(items, key) {
    var lookup = {};
    (Array.isArray(items) ? items : []).forEach(function (item) {
      var id = item && item[key] != null ? String(item[key]) : "";
      if (!id) {
        return;
      }
      lookup[id] = item;
    });
    return lookup;
  }

  function hasAny(items, checker) {
    return (Array.isArray(items) ? items : []).some(function (item) {
      return !!checker(item || {});
    });
  }

  function range(start, end) {
    var rows = [];
    for (var i = start; i <= end; i++) {
      rows.push(i);
    }
    return rows;
  }

  global.NomadicProgramPdf = {
    normalizeProgramForPdf: normalizeProgramForPdf,
    buildProgramPdfDocument: buildProgramPdfDocument,
    openProgramPdfPreview: openProgramPdfPreview,
    formatExercisePrescription: formatExercisePrescription
  };
})(window);
