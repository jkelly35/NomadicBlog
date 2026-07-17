(function (global) {
  "use strict";

  var PHASE_MATRIX_COLUMN_LIMIT = 6;

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
        description: cleanText(source.description || meta.program_description || meta.primary_goal),
        version: version,
        brand: {
          name: textOrFallback(source.brand_name, "Nomadic Performance"),
          tagline: cleanText(source.brand_tagline || "Move Free, Thrive Wild")
        },
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

  function normalizePhaseForPdf(input) {
    var phase = input.phase;
    var parsedStartWeek = clampNumber(parseInt(phase.start_week, 10), 1, input.structure.weeks, 1);
    var parsedEndWeek = clampNumber(parseInt(phase.end_week, 10), parsedStartWeek, input.structure.weeks, parsedStartWeek);
    var phaseWeeks = range(parsedStartWeek, parsedEndWeek);

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
      name: textOrFallback(phase.name, "Phase " + String(input.order)),
      dateLabel: buildPhaseDateLabel(parsedStartWeek, parsedEndWeek, input.programStartDate),
      durationWeeks: parsedEndWeek - parsedStartWeek + 1,
      primaryObjective: objectives[0] || undefined,
      rationale: cleanText(phase.rationale),
      activityEmphasis: activityEmphasis.length ? activityEmphasis : undefined,
      objectives: objectives.length ? objectives : undefined,
      priorities: collectPhasePriorities(phase),
      qualitiesDeveloped: collectPhaseQualitiesDeveloped(phase),
      qualitiesMaintained: collectPhaseQualitiesMaintained(phase),
      weeklySchedules: weeklySchedules.length ? weeklySchedules : undefined,
      sessions: sessions,
      activityPlans: activityPlans.length ? activityPlans : undefined,
      monitoring: monitoring.length ? monitoring : undefined,
      adjustmentRules: adjustmentRules.length ? adjustmentRules : undefined,
      exitCriteria: collectExitCriteria(phase),
      assessments: phaseAssessments.length ? phaseAssessments : undefined
    };
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

    if (!normalizedSections.length && !cleanText(plan.session_goal) && !cleanText(plan.coach_notes)) {
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
    var trainingDays = clampNumber(parseInt(input.phase && input.phase.training_days_per_week, 10), 1, 14, 3);

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
    var list = [];
    var custom = parseLines(cleanText(phase && phase.priorities_text));
    if (custom.length) {
      list = list.concat(custom);
    }

    var trainingDays = parseInt(phase && phase.training_days_per_week, 10);
    var strengthDays = parseInt(phase && phase.strength_days_per_week, 10);
    var cardioDays = parseInt(phase && (phase.cardio_days_per_week != null ? phase.cardio_days_per_week : phase.endurance_days_per_week), 10);
    var skillDays = parseInt(phase && (phase.skill_days_per_week != null ? phase.skill_days_per_week : phase.mobility_days_per_week), 10);

    if (Number.isFinite(trainingDays)) {
      list.push(String(trainingDays) + " total sessions/week");
    }
    if (Number.isFinite(strengthDays)) {
      list.push(String(strengthDays) + " strength sessions/week");
    }
    if (Number.isFinite(cardioDays)) {
      list.push(String(cardioDays) + " endurance sessions/week");
    }
    if (Number.isFinite(skillDays)) {
      list.push(String(skillDays) + " skill/mobility sessions/week");
    }

    return list;
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

    pages.push(renderCoverPage(program));
    pages.push(renderHowToUsePage(program, warnings));
    pages.push(renderProgramAtGlancePage(program));

    var matrixPages = renderActivityMatrixPages(program);
    matrixPages.forEach(function (page) {
      pages.push(page);
    });

    if (Array.isArray(program.principles) && program.principles.length) {
      pages.push(renderPrinciplesPage(program));
    }

    (Array.isArray(program.phases) ? program.phases : []).forEach(function (phase) {
      pages.push(renderPhasePage(program, phase));
    });

    if (Array.isArray(program.assessments) && program.assessments.length) {
      pages.push(renderAssessmentsPage(program));
    }

    if (Array.isArray(program.worksheets) && program.worksheets.length) {
      pages.push(renderWorksheetsPage(program));
    }

    if (Array.isArray(program.coachNotes) && program.coachNotes.length) {
      pages.push(renderCoachNotesPage(program));
    }

    pages.push(renderFinalSummaryPage(program, warnings));

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
      ".npdf-table th, .npdf-table td { border: 1px solid #d7dfd8; padding: 6px 7px; vertical-align: top; font-size: 11px; line-height: 1.3; }",
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
      ".npdf-note-chip { display: inline-block; border: 1px solid #cfddd4; border-radius: 999px; padding: 2px 8px; margin: 4px 5px 0 0; font-size: 10px; color: #2f5a4b; background: #f3faf5; }",
      ".npdf-footer { position: absolute; left: 14mm; right: 14mm; bottom: 9mm; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #5a766a; border-top: 1px solid #dbe4dd; padding-top: 5px; background: linear-gradient(90deg, rgba(237,244,239,0.7) 0%, rgba(255,255,255,0.2) 100%); }",
      ".npdf-page-number::before { content: counter(page); }",
      ".npdf-page-break { page-break-before: always; break-before: page; }",
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

    return [
      "<section class=\"npdf-page\">",
      "<p class=\"npdf-kicker\">" + escapeHtml(program.brand.name) + "</p>",
      "<h1 class=\"npdf-title\">" + escapeHtml(program.title) + "</h1>",
      (program.subtitle ? "<p class=\"npdf-subtitle\">" + escapeHtml(program.subtitle) + "</p>" : ""),
      (program.description ? "<p class=\"npdf-description\">" + escapeHtml(program.description) + "</p>" : ""),
      "<div class=\"npdf-meta-grid\">",
      renderMetaCard("Athlete", program.athlete && program.athlete.name ? program.athlete.name : "Unassigned"),
      renderMetaCard("Program Dates", program.dates && program.dates.displayLabel ? program.dates.displayLabel : "TBD"),
      renderMetaCard("Version", program.version || "v1"),
      renderMetaCard("Tagline", program.brand.tagline || ""),
      "</div>",
      (goals.length
        ? "<section class=\"npdf-section\"><h2>Primary Goals</h2><ul class=\"npdf-list\">" + goals.map(function (goal) {
            return "<li>" + escapeHtml(goal.label) + "</li>";
          }).join("") + "</ul></section>"
        : ""),
      (Array.isArray(program.disclaimers) && program.disclaimers.length
        ? "<section class=\"npdf-section\"><h3>Important Assumption</h3><p class=\"npdf-muted\">" + escapeHtml(program.disclaimers[0]) + "</p></section>"
        : ""),
      renderFooter(program),
      "</section>"
    ].join("");
  }

  function renderHowToUsePage(program, warnings) {
    var warningItems = Array.isArray(warnings) && warnings.length
      ? "<section class=\"npdf-section\"><h3>Data Warnings</h3><ul class=\"npdf-list\">" + warnings.map(function (warning) {
          return "<li>" + escapeHtml(warning) + "</li>";
        }).join("") + "</ul></section>"
      : "";

    return [
      "<section class=\"npdf-page\">",
      "<p class=\"npdf-kicker\">Guide</p>",
      "<h1 class=\"npdf-title\" style=\"font-size:24px;\">How To Use This Program</h1>",
      "<ul class=\"npdf-list\">",
      "<li>Follow phase objectives first, then execute scheduled sessions.</li>",
      "<li>Track effort, notes, and completion quality each session.</li>",
      "<li>Progress only when adjustment rules and recovery markers allow.</li>",
      "<li>Regenerate this PDF any time the program is updated.</li>",
      "</ul>",
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
      var emphasis = Array.isArray(phase.activityEmphasis)
        ? phase.activityEmphasis.filter(function (item) { return item.status === "primary"; })
        : [];
      var supporting = Array.isArray(phase.activityEmphasis)
        ? phase.activityEmphasis.filter(function (item) { return item.status !== "primary" && item.status !== "optional"; })
        : [];

      return [
        "<tr>",
        "<td>Phase " + String(phase.order) + " - " + escapeHtml(phase.name) + "</td>",
        "<td>" + escapeHtml(phase.dateLabel || "") + "</td>",
        "<td>" + escapeHtml(phase.durationWeeks ? String(phase.durationWeeks) + " weeks" : "") + "</td>",
        "<td>" + escapeHtml(phase.primaryObjective || "") + "</td>",
        "<td>" + escapeHtml(joinActivityLabels(program.activities, emphasis)) + "</td>",
        "<td>" + escapeHtml(joinActivityLabels(program.activities, supporting)) + "</td>",
        "<td>" + escapeHtml(extractStrengthFrequency(phase)) + "</td>",
        "</tr>"
      ].join("");
    }).join("");

    return [
      "<section class=\"npdf-page\">",
      "<p class=\"npdf-kicker\">Overview</p>",
      "<h1 class=\"npdf-title\" style=\"font-size:24px;\">Program At A Glance</h1>",
      "<table class=\"npdf-table\">",
      "<thead><tr><th>Phase</th><th>Date Range</th><th>Duration</th><th>Primary Objective</th><th>Primary Activity</th><th>Supporting Activities</th><th>Strength Frequency</th></tr></thead>",
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

    var activityRoleRows = Array.isArray(phase.activityEmphasis) && phase.activityEmphasis.length
      ? "<section class=\"npdf-section\"><div class=\"npdf-sub-banner\">Activity Roles And Frequency</div><table class=\"npdf-table\"><thead><tr><th>Activity</th><th>Status</th><th>Frequency</th><th>Notes</th></tr></thead><tbody>" + phase.activityEmphasis.map(function (item) {
          return "<tr><td>" + escapeHtml(resolveActivityName(program.activities, item.activityId)) + "</td><td>" + escapeHtml(item.status) + "</td><td>" + escapeHtml(item.frequency || "") + "</td><td>" + escapeHtml(item.notes || "") + "</td></tr>";
        }).join("") + "</tbody></table></section>"
      : "";

    var scheduleHtml = Array.isArray(phase.weeklySchedules) && phase.weeklySchedules.length
      ? "<section class=\"npdf-section\"><div class=\"npdf-sub-banner\">Weekly Schedule</div>" + phase.weeklySchedules.map(function (schedule) {
          return "<h4 style=\"margin-top:8px;font-size:13px;\">" + escapeHtml(schedule.label) + "</h4><table class=\"npdf-table\"><thead><tr><th>Day</th><th>Session</th><th>Activity</th><th>Intensity</th><th>Duration</th><th>Notes</th></tr></thead><tbody>" + schedule.rows.map(function (row) {
            return "<tr><td>" + escapeHtml(row.day) + "</td><td>" + escapeHtml(row.session) + "</td><td>" + escapeHtml(row.activity || "") + "</td><td>" + escapeHtml(row.intensity || "") + "</td><td>" + escapeHtml(row.duration || "") + "</td><td>" + escapeHtml(row.notes || "") + "</td></tr>";
          }).join("") + "</tbody></table>";
        }).join("") + "</section>"
      : "";

    var sessionsHtml = Array.isArray(phase.sessions) && phase.sessions.length
      ? "<section class=\"npdf-section\"><div class=\"npdf-sub-banner\">Complete Training Sessions</div>" + phase.sessions.map(function (session) {
          return renderSessionCard(session);
        }).join("") + "</section>"
      : "";

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
      activityRoleRows,
      scheduleHtml,
      sessionsHtml,
      activityPlansHtml,
      monitoringHtml,
      assessmentsHtml,
      renderFooter(program),
      "</section>"
    ].join("");
  }

  function renderSessionCard(session) {
    var sections = Array.isArray(session.sections) ? session.sections : [];

    var exercisesHtml = sections.map(function (section) {
      var rows = Array.isArray(section.exercises) ? section.exercises : [];
      var columns = resolveExerciseColumns(rows);

      var header = columns.map(function (col) {
        return "<th>" + escapeHtml(col.label) + "</th>";
      }).join("");

      var body = rows.map(function (exercise) {
        return "<tr>" + columns.map(function (col) {
          var value = col.value(exercise);
          return "<td>" + escapeHtml(value || "") + "</td>";
        }).join("") + "</tr>";
      }).join("");

      return [
        "<h4 style=\"margin-top:8px;font-size:12px;\">" + escapeHtml(section.title) + "</h4>",
        "<table class=\"npdf-table npdf-exercise-table\">",
        "<thead><tr>" + header + "</tr></thead>",
        "<tbody>" + body + "</tbody>",
        "</table>"
      ].join("");
    }).join("");

    var notesHtml = Array.isArray(session.coachingNotes) && session.coachingNotes.length
      ? "<div style=\"margin-top:8px;\">" + session.coachingNotes.map(function (note) {
          return "<span class=\"npdf-note-chip\">" + escapeHtml(note) + "</span>";
        }).join("") + "</div>"
      : "";

    var progressionHtml = Array.isArray(session.progressionRules) && session.progressionRules.length
      ? "<div style=\"margin-top:8px;\"><strong style=\"font-size:11px;\">Progression Rules:</strong> " + escapeHtml(session.progressionRules.join(" • ")) + "</div>"
      : "";

    return [
      "<article class=\"npdf-session\">",
      "<div class=\"npdf-session-head\">",
      "<div><div class=\"npdf-session-title\">" + escapeHtml(session.title) + "</div><div class=\"npdf-session-meta\">" + escapeHtml(session.type) + (session.purpose ? " | " + escapeHtml(session.purpose) : "") + "</div></div>",
      "<div class=\"npdf-session-meta\">" + escapeHtml(joinCompact([session.duration, session.targetRpe ? ("RPE " + session.targetRpe) : "", session.targetRir ? ("RIR " + session.targetRir) : ""])) + "</div>",
      "</div>",
      "<div class=\"npdf-session-body\">",
      exercisesHtml,
      notesHtml,
      progressionHtml,
      "</div>",
      "</article>"
    ].join("");
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
        label: "Coaching Focus",
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

  function normalizePhases(rawPhases, totalWeeks, warnings) {
    var source = Array.isArray(rawPhases) ? rawPhases : [];
    var normalized = source
      .map(function (phase, index) {
        var item = phase && typeof phase === "object" ? phase : {};
        return {
          name: cleanText(item.name) || ("Phase " + String(index + 1)),
          start_week: clampNumber(parseInt(item.start_week, 10), 1, totalWeeks, Math.min(index + 1, totalWeeks)),
          end_week: clampNumber(parseInt(item.end_week, 10), 1, totalWeeks, Math.min(index + 1, totalWeeks)),
          focus: cleanText(item.focus),
          rationale: cleanText(item.rationale),
          strength_rule: cleanText(item.strength_rule),
          endurance_rule: cleanText(item.endurance_rule),
          training_days_per_week: clampNumber(parseInt(item.training_days_per_week, 10), 1, 14, 3),
          strength_days_per_week: clampNumber(parseInt(item.strength_days_per_week, 10), 0, 14, 0),
          cardio_days_per_week: clampNumber(parseInt(item.cardio_days_per_week != null ? item.cardio_days_per_week : item.endurance_days_per_week, 10), 0, 14, 0),
          skill_days_per_week: clampNumber(parseInt(item.skill_days_per_week != null ? item.skill_days_per_week : item.mobility_days_per_week, 10), 0, 14, 0)
        };
      })
      .sort(function (a, b) {
        if (a.start_week !== b.start_week) {
          return a.start_week - b.start_week;
        }
        return a.end_week - b.end_week;
      });

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
        training_days_per_week: 3,
        strength_days_per_week: 1,
        cardio_days_per_week: 1,
        skill_days_per_week: 1
      });
      warnings.push("No explicit phases found, generated a default phase.");
    }

    return normalized;
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
