import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

type JsonRecord = Record<string, unknown>;

type PhaseRow = {
  name: string;
  start_week: number;
  end_week: number;
  focus: string;
  rationale: string;
  priorities_text: string;
  general_training_overview_text: string;
  general_weekly_structure_text: string;
  strength_rule: string;
  endurance_rule: string;
  monitoring_metrics_text: string;
  progress_rules_text: string;
  reduce_rules_text: string;
  stop_rules_text: string;
  phase_assessments_text: string;
  exit_criteria_text: string;
  training_days_per_week: number;
  strength_days_per_week: number;
  cardio_days_per_week: number;
  skill_days_per_week: number;
  multi_focus_days_per_week: number;
  endurance_days_per_week: number;
  mobility_days_per_week: number;
};

type WeeklyRow = {
  workout: number;
  name: string;
  day_of_week: string;
  session_type: string;
  note: string;
};

type DayExerciseSet = {
  reps: string;
  weight: string;
  rpe: string;
  rest: string;
  notes: string;
  done: boolean;
  target_reps: string;
  target_weight: string;
  target_rpe: string;
  target_rest: string;
  target_notes: string;
};

type DayExercise = {
  name: string;
  section: string;
  mode: string;
  superset_group: string | null;
  library_id: string | null;
  video_demo_url: string;
  field_toggles: {
    showWeight: boolean;
    secondaryMetric: string;
    showRpe: boolean;
    showRest: boolean;
  };
  sets: DayExerciseSet[];
};

type SessionBlock = JsonRecord;

function isCardioStyleSessionType(value: string): boolean {
  const normalized = normalizeSessionType(value);
  return (
    normalized === "run" ||
    normalized === "cycling" ||
    normalized === "mountain_bike" ||
    normalized === "zone2" ||
    normalized === "threshold" ||
    normalized === "vo2" ||
    normalized === "uphill" ||
    normalized === "long_endurance" ||
    normalized === "hiking"
  );
}

function focusSuggestsRunning(focus: unknown, sportFocus: unknown): boolean {
  const text = `${cleanText(focus)} ${cleanText(sportFocus)}`.toLowerCase();
  return /run|running|marathon|half marathon|5k|10k|trail/i.test(text);
}

function focusSuggestsCycling(focus: unknown, sportFocus: unknown): boolean {
  const text = `${cleanText(focus)} ${cleanText(sportFocus)}`.toLowerCase();
  return /bike|biking|cycling|mtb|mountain bike|gravel|road bike/i.test(text);
}

function inferSpecificRunningSessionType(session: JsonRecord, weeklyRow: WeeklyRow | undefined, phase: PhaseRow | null): string {
  const joined = [
    cleanText(session.title),
    cleanText(session.session_goal),
    cleanText(session.intensity_target),
    cleanText(session.coach_notes),
    cleanText(weeklyRow?.note),
    cleanText(phase?.focus)
  ].join(" ").toLowerCase();

  if (/vo2|aerobic power|short intervals|interval/i.test(joined)) {
    return "vo2max_intervals";
  }
  if (/threshold|tempo|cruise|cv|subthreshold/i.test(joined)) {
    return "threshold_intervals";
  }
  if (/hill|uphill|climb/i.test(joined)) {
    return "long_hill_repeats";
  }
  if (/trail|technical/i.test(joined)) {
    return "technical_trail";
  }
  if (/long|endurance|duration|aerobic/i.test(joined)) {
    return "long_run";
  }
  if (/recovery|easy|zone 2|z2/i.test(joined)) {
    return "easy_aerobic";
  }
  return "easy_with_strides";
}

function inferSpecificCyclingSessionType(session: JsonRecord, weeklyRow: WeeklyRow | undefined, phase: PhaseRow | null): string {
  const joined = [
    cleanText(session.title),
    cleanText(session.session_goal),
    cleanText(session.intensity_target),
    cleanText(session.coach_notes),
    cleanText(weeklyRow?.note),
    cleanText(phase?.focus)
  ].join(" ").toLowerCase();

  if (/vo2|aerobic power|short intervals|interval/i.test(joined)) {
    return "vo2max";
  }
  if (/threshold|tempo|subthreshold|over-under/i.test(joined)) {
    return "threshold";
  }
  if (/sprint|anaerobic|acceleration/i.test(joined)) {
    return "neuromuscular_sprints";
  }
  if (/long|endurance|duration|aerobic/i.test(joined)) {
    return "long_endurance";
  }
  if (/recovery|easy|zone 2|z2/i.test(joined)) {
    return "easy_endurance";
  }
  return "mixed_development";
}

function summarizeSetsForPrescription(sets: DayExerciseSet[]): string {
  if (!Array.isArray(sets) || !sets.length) {
    return "";
  }

  const first = sets[0];
  const rep = cleanText(first.reps || first.target_reps);
  const weight = cleanText(first.weight || first.target_weight);
  const rpe = cleanText(first.rpe || first.target_rpe);
  const rest = cleanText(first.rest || first.target_rest);
  return [rep, weight, rpe ? `RPE ${rpe}` : "", rest ? `Rest ${rest}` : ""].filter(Boolean).join(" • ");
}

function buildBlockFromExercise(exercise: DayExercise, blockType: string, sessionType: string): SessionBlock {
  const sets = Array.isArray(exercise.sets) ? exercise.sets : [];
  const setCount = Math.max(1, sets.length || 1);
  const reps = sets.map((set) => cleanText(set.reps || set.target_reps) || (exercise.mode === "time" || exercise.mode === "endurance" ? "10 min" : "5"));
  const intensities = sets.map((set) => cleanText(set.rpe || set.target_rpe) || "7");
  const rests = sets.map((set) => cleanText(set.rest || set.target_rest));

  return {
    type: blockType,
    title: cleanText(exercise.name) || prettySessionBlockLabel(blockType),
    prescription: summarizeSetsForPrescription(sets),
    notes: cleanText(sets[0] && sets[0].notes) || cleanText(exercise.section),
    exercise_flow: "straight",
    exercise_rest_strategy: "between_exercises",
    exercise_rest_interval: cleanText(sets[0] && sets[0].rest),
    exercise_count: 1,
    exercise_names: [cleanText(exercise.name) || prettySessionBlockLabel(blockType)],
    exercise_sets: [String(setCount)],
    exercise_intensity_types: [exercise.mode === "time" || exercise.mode === "endurance" || isCardioStyleSessionType(sessionType) ? "time" : "rpe"],
    exercise_set_reps: [reps],
    exercise_set_intensities: [intensities],
    exercise_set_rests: [rests],
    exercise_set_rep_types: [reps.map(() => exercise.mode === "time" || exercise.mode === "endurance" || isCardioStyleSessionType(sessionType) ? "time" : "reps")],
    exercise_set_intensity_types: [intensities.map(() => exercise.mode === "time" || exercise.mode === "endurance" || isCardioStyleSessionType(sessionType) ? "time" : "rpe")],
    exercise_form: cleanText(exercise.video_demo_url),
    duration_minutes: 0
  };
}

function buildBlocksFromExercises(exercises: DayExercise[], sessionType: string): SessionBlock[] {
  const source = Array.isArray(exercises) ? exercises : [];
  return source.map((exercise, index) => {
    const section = cleanText(exercise.section).toLowerCase();
    const blockType = section === "warm up"
      ? "warmup"
      : section === "cool down"
        ? "cooldown"
        : index === 0 && isCardioStyleSessionType(sessionType)
          ? "zone2"
          : index === 0
            ? "main_strength"
            : "secondary_strength";

    return buildBlockFromExercise(exercise, blockType, sessionType);
  });
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

function getEnv(name: string, required = true): string {
  const value = Deno.env.get(name) || "";
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function cleanText(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function cleanMultiline(value: unknown): string {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => cleanText(line))
    .filter(Boolean)
    .join("\n");
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = Number(value);
  const numeric = Number.isFinite(parsed) ? parsed : fallback;
  return Math.max(min, Math.min(max, Math.round(numeric)));
}

function parseJsonFromText(raw: string): JsonRecord | null {
  const text = cleanText(raw);
  if (!text) {
    return null;
  }

  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? (parsed as JsonRecord) : null;
  } catch {
    // Try fenced json fallback.
  }

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (!fenced || !fenced[1]) {
    return null;
  }

  try {
    const parsed = JSON.parse(fenced[1]);
    return parsed && typeof parsed === "object" ? (parsed as JsonRecord) : null;
  } catch {
    return null;
  }
}

async function getAuthedUserId(req: Request): Promise<string> {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const anonKey = getEnv("SUPABASE_ANON_KEY");
  const authHeader = req.headers.get("Authorization") || "";

  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("Missing Authorization bearer token.");
  }

  const client = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: {
      headers: { Authorization: authHeader }
    }
  });

  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    throw new Error(error?.message || "Unable to authenticate user.");
  }

  return data.user.id;
}

function normalizeProgramType(value: unknown): string {
  const allowed = new Set([
    "hybrid",
    "strength",
    "endurance",
    "return_to_sport",
    "premade",
    "group",
    "individualized"
  ]);
  const normalized = cleanText(value).toLowerCase();
  return allowed.has(normalized) ? normalized : "hybrid";
}

function normalizeSessionType(value: unknown): string {
  const allowed = new Set([
    "strength_lower",
    "strength_upper",
    "strength_full",
    "climbing",
    "mountain_bike",
    "cycling",
    "run",
    "hiking",
    "zone2",
    "threshold",
    "vo2",
    "uphill",
    "long_endurance",
    "mobility",
    "assessment",
    "rest"
  ]);
  const normalized = cleanText(value).toLowerCase();
  return allowed.has(normalized) ? normalized : "strength_full";
}

function defaultDayOfWeek(index: number): string {
  const values = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  return values[index % values.length] || "monday";
}

function normalizeStructure(input: JsonRecord | null | undefined): { weeks: number; workoutsPerWeek: number } {
  const row = input && typeof input === "object" ? input : {};
  const weeks = clampNumber((row as JsonRecord).weeks, 1, 52, 12);
  const workouts = clampNumber((row as JsonRecord).workoutsPerWeek, 1, 14, 7);
  return {
    weeks,
    workoutsPerWeek: workouts
  };
}

function normalizeWeeklyStructure(raw: unknown, workoutsPerWeek: number): WeeklyRow[] {
  const source = Array.isArray(raw) ? raw : [];
  const rows: WeeklyRow[] = [];

  for (let index = 0; index < workoutsPerWeek; index += 1) {
    const input = source[index] && typeof source[index] === "object" ? (source[index] as JsonRecord) : {};
    rows.push({
      workout: index + 1,
      name: cleanText(input.name) || `Workout ${index + 1}`,
      day_of_week: cleanText(input.day_of_week).toLowerCase() || defaultDayOfWeek(index),
      session_type: normalizeSessionType(input.session_type),
      note: cleanText(input.note)
    });
  }

  return rows;
}

function normalizeMeta(raw: unknown, structure: { weeks: number; workoutsPerWeek: number }): JsonRecord {
  const source = raw && typeof raw === "object" ? (raw as JsonRecord) : {};

  return {
    program_type: normalizeProgramType(source.program_type),
    sport_focus: cleanText(source.sport_focus),
    athlete_level: cleanText(source.athlete_level) || "intermediate",
    program_subtitle: cleanText(source.program_subtitle),
    program_description: cleanText(source.program_description),
    program_version: cleanText(source.program_version) || "AI v1",
    program_assumption: cleanText(source.program_assumption),
    program_principles_text: cleanMultiline(source.program_principles_text),
    program_disclaimers_text: cleanMultiline(source.program_disclaimers_text),
    program_worksheets_text: cleanMultiline(source.program_worksheets_text),
    framework_heading: cleanText(source.framework_heading),
    framework_intro: cleanMultiline(source.framework_intro),
    framework_rule_title: cleanText(source.framework_rule_title),
    framework_rule_body: cleanMultiline(source.framework_rule_body),
    framework_priorities_text: cleanMultiline(source.framework_priorities_text),
    framework_variables_text: cleanMultiline(source.framework_variables_text),
    framework_wave_heading: cleanText(source.framework_wave_heading),
    framework_wave_rows_text: cleanMultiline(source.framework_wave_rows_text),
    framework_wave_footer: cleanMultiline(source.framework_wave_footer),
    estimated_start_date: cleanText(source.estimated_start_date),
    primary_goal: cleanText(source.primary_goal),
    secondary_goal: cleanText(source.secondary_goal),
    training_days_per_week: clampNumber(source.training_days_per_week, 1, 14, structure.workoutsPerWeek),
    strength_days_per_week: clampNumber(source.strength_days_per_week, 0, 14, 2),
    endurance_days_per_week: clampNumber(source.endurance_days_per_week, 0, 14, 1),
    mobility_days_per_week: clampNumber(source.mobility_days_per_week, 0, 14, 1),
    deload_frequency: cleanText(source.deload_frequency) || "every_4",
    peak_date: cleanText(source.peak_date),
    tags: Array.isArray(source.tags)
      ? source.tags.map((item) => cleanText(item)).filter(Boolean).slice(0, 20)
      : cleanText(source.tags)
          .split(",")
          .map((item) => cleanText(item))
          .filter(Boolean)
          .slice(0, 20)
  };
}

function normalizePhases(raw: unknown, totalWeeks: number): PhaseRow[] {
  const source = Array.isArray(raw) ? raw : [];
  const rows = source
    .map((item, index) => {
      const phase = item && typeof item === "object" ? (item as JsonRecord) : {};
      const fallbackStart = Math.min(index + 1, totalWeeks);
      const start = clampNumber(phase.start_week, 1, totalWeeks, fallbackStart);
      const end = clampNumber(phase.end_week, start, totalWeeks, start);
      return {
        name: cleanText(phase.name) || `Phase ${index + 1}`,
        start_week: start,
        end_week: end,
        focus: cleanText(phase.focus),
        rationale: cleanMultiline(phase.rationale),
        priorities_text: cleanMultiline(phase.priorities_text),
        general_training_overview_text: cleanMultiline(phase.general_training_overview_text),
        general_weekly_structure_text: cleanMultiline(phase.general_weekly_structure_text),
        strength_rule: cleanMultiline(phase.strength_rule),
        endurance_rule: cleanMultiline(phase.endurance_rule),
        monitoring_metrics_text: cleanMultiline(phase.monitoring_metrics_text),
        progress_rules_text: cleanMultiline(phase.progress_rules_text),
        reduce_rules_text: cleanMultiline(phase.reduce_rules_text),
        stop_rules_text: cleanMultiline(phase.stop_rules_text),
        phase_assessments_text: cleanMultiline(phase.phase_assessments_text),
        exit_criteria_text: cleanMultiline(phase.exit_criteria_text),
        training_days_per_week: 7,
        strength_days_per_week: clampNumber(phase.strength_days_per_week, 0, 14, 2),
        cardio_days_per_week: clampNumber(phase.cardio_days_per_week ?? phase.endurance_days_per_week, 0, 14, 1),
        skill_days_per_week: clampNumber(phase.skill_days_per_week ?? phase.mobility_days_per_week, 0, 14, 1),
        multi_focus_days_per_week: clampNumber(phase.multi_focus_days_per_week, 0, 14, 0),
        endurance_days_per_week: clampNumber(phase.endurance_days_per_week ?? phase.cardio_days_per_week, 0, 14, 1),
        mobility_days_per_week: clampNumber(phase.mobility_days_per_week ?? phase.skill_days_per_week, 0, 14, 1)
      };
    })
    .filter((phase) => !!phase.name);

  if (!rows.length) {
    rows.push({
      name: "Phase 1",
      start_week: 1,
      end_week: totalWeeks,
      focus: "",
      rationale: "",
      priorities_text: "",
      general_training_overview_text: "",
      general_weekly_structure_text: "",
      strength_rule: "",
      endurance_rule: "",
      monitoring_metrics_text: "",
      progress_rules_text: "",
      reduce_rules_text: "",
      stop_rules_text: "",
      phase_assessments_text: "",
      exit_criteria_text: "",
      training_days_per_week: 7,
      strength_days_per_week: 2,
      cardio_days_per_week: 1,
      skill_days_per_week: 1,
      multi_focus_days_per_week: 0,
      endurance_days_per_week: 1,
      mobility_days_per_week: 1
    });
  }

  rows.sort((a, b) => a.start_week - b.start_week || a.end_week - b.end_week);

  let cursor = 1;
  return rows.map((phase) => {
    const duration = Math.max(1, phase.end_week - phase.start_week + 1);
    const start = clampNumber(cursor, 1, totalWeeks, 1);
    const end = clampNumber(start + duration - 1, start, totalWeeks, start);
    cursor = end + 1;
    return {
      ...phase,
      start_week: start,
      end_week: end
    };
  });
}

function resolvePhaseForWeek(week: number, phases: PhaseRow[]): PhaseRow | null {
  for (const phase of phases) {
    if (week >= phase.start_week && week <= phase.end_week) {
      return phase;
    }
  }
  return null;
}

function buildSessionPlans(
  structure: { weeks: number; workoutsPerWeek: number },
  weekly: WeeklyRow[],
  phases: PhaseRow[],
  rawPlans: unknown,
  templateFocus: string,
  sportFocus: string
): JsonRecord {
  const output: JsonRecord = {};
  const source = rawPlans && typeof rawPlans === "object" ? (rawPlans as JsonRecord) : {};

  for (let week = 1; week <= structure.weeks; week += 1) {
    for (let day = 1; day <= structure.workoutsPerWeek; day += 1) {
      const slotKey = `w${week}d${day}`;
      const existing = source[slotKey] && typeof source[slotKey] === "object" ? (source[slotKey] as JsonRecord) : {};
      const weeklyRow = weekly[day - 1] || weekly[weekly.length - 1];
      const phase = resolvePhaseForWeek(week, phases);
      const focusLooksRunning = focusSuggestsRunning(templateFocus, sportFocus);
      const focusLooksCycling = focusSuggestsCycling(templateFocus, sportFocus);
      let sessionType = normalizeSessionType(existing.session_type ?? weeklyRow?.session_type);

      if (focusLooksRunning && isCardioStyleSessionType(sessionType)) {
        sessionType = "run";
      } else if (focusLooksCycling && isCardioStyleSessionType(sessionType)) {
        sessionType = "cycling";
      }

      const session = {
        title: cleanText(existing.title) || cleanText(weeklyRow?.name) || `Week ${week} - Workout ${day}`,
        session_type: sessionType,
        climbing_session_type: cleanText(existing.climbing_session_type),
        mountain_bike_session_type: cleanText(existing.mountain_bike_session_type),
        cycling_session_type: cleanText(existing.cycling_session_type),
        run_session_type: cleanText(existing.run_session_type),
        hiking_session_type: cleanText(existing.hiking_session_type),
        phase_name: cleanText(existing.phase_name) || cleanText(phase?.name),
        objective_label: cleanText(existing.objective_label),
        session_goal: cleanText(existing.session_goal) || cleanText(phase?.focus) || cleanText(weeklyRow?.note),
        sport_focus: cleanText(existing.sport_focus) || cleanText(sportFocus),
        duration_minutes: clampNumber(existing.duration_minutes, 0, 1440, 0),
        terrain: cleanText(existing.terrain),
        vertical_gain: cleanText(existing.vertical_gain),
        intensity_target: cleanText(existing.intensity_target) || cleanText(weeklyRow?.note),
        coach_notes: cleanText(existing.coach_notes),
        blocks: [] as SessionBlock[]
      };

      let generatedBlocks: SessionBlock[] = [];

      if (Array.isArray(existing.blocks) && existing.blocks.length) {
        generatedBlocks = existing.blocks as SessionBlock[];
      } else if (sessionType === "run") {
        const runSubtype = inferSpecificRunningSessionType(session, weeklyRow, phase);
        session.run_session_type = runSubtype;

        if (runSubtype === "easy_aerobic" || runSubtype === "long_run" || runSubtype === "easy_with_strides") {
          generatedBlocks = buildBlocksFromExercises(
            [
              makeExercise(
                {
                  name: runSubtype === "long_run" ? "Long Run" : "Easy Run",
                  section: "A Block",
                  mode: "endurance",
                  sets: [
                    {
                      reps: cleanText(session.duration_minutes) ? `${cleanText(session.duration_minutes)} min` : runSubtype === "long_run" ? "75-120 min" : "45-60 min",
                      rpe: runSubtype === "long_run" ? "Zone 2-3" : "Zone 2",
                      notes: session.session_goal
                    }
                  ],
                  field_toggles: { showWeight: false, secondaryMetric: "time", showRpe: true, showRest: false }
                },
                runSubtype === "long_run" ? "Long Run" : "Easy Run",
                "A Block"
              )
            ].concat(runSubtype === "easy_with_strides" ? [
              makeExercise(
                {
                  name: "Strides",
                  section: "B Block",
                  mode: "time",
                  sets: [{ reps: "6 x 20s", rpe: "Fast-relaxed", rest: "60-90s" }],
                  field_toggles: { showWeight: false, secondaryMetric: "time", showRpe: true, showRest: true }
                },
                "Strides",
                "B Block"
              )
            ] : []),
            "run"
          );
        } else {
          const primaryName = runSubtype === "vo2max_intervals" ? "VO2 Intervals" : runSubtype === "threshold_intervals" ? "Threshold Intervals" : runSubtype === "long_hill_repeats" ? "Hill Repeats" : "Progression Run";
          generatedBlocks = buildBlocksFromExercises(
            [
              makeExercise(
                {
                  name: primaryName,
                  section: "A Block",
                  mode: "time",
                  sets: [{ reps: runSubtype === "vo2max_intervals" ? "5 x 4 min" : runSubtype === "long_hill_repeats" ? "6 x 2-3 min" : "3 x 8-10 min", rpe: "7-9", rest: "2-4 min", notes: session.session_goal }],
                  field_toggles: { showWeight: false, secondaryMetric: "time", showRpe: true, showRest: true }
                },
                primaryName,
                "A Block"
              ),
              makeExercise(
                {
                  name: "Easy Jog Recovery",
                  section: "B Block",
                  mode: "time",
                  sets: [{ reps: "10-15 min", rpe: "Easy", notes: "Recover between efforts" }],
                  field_toggles: { showWeight: false, secondaryMetric: "time", showRpe: true, showRest: false }
                },
                "Easy Jog Recovery",
                "B Block"
              )
            ],
            "run"
          );
        }
      } else if (sessionType === "cycling" || sessionType === "mountain_bike") {
        const bikeSubtype = inferSpecificCyclingSessionType(session, weeklyRow, phase);
        session.cycling_session_type = bikeSubtype;
        session.mountain_bike_session_type = bikeSubtype;

        if (bikeSubtype === "easy_endurance" || bikeSubtype === "long_endurance" || bikeSubtype === "recovery_ride") {
          generatedBlocks = buildBlocksFromExercises(
            [
              makeExercise(
                {
                  name: bikeSubtype === "recovery_ride" ? "Recovery Ride" : "Endurance Ride",
                  section: "A Block",
                  mode: "endurance",
                  sets: [{ reps: cleanText(session.duration_minutes) ? `${cleanText(session.duration_minutes)} min` : "60-120 min", rpe: cleanText(session.intensity_target) || "Zone 2", notes: session.session_goal }],
                  field_toggles: { showWeight: false, secondaryMetric: "time", showRpe: true, showRest: false }
                },
                bikeSubtype === "recovery_ride" ? "Recovery Ride" : "Endurance Ride",
                "A Block"
              )
            ],
            sessionType
          );
        } else {
          generatedBlocks = buildBlocksFromExercises(
            [
              makeExercise(
                {
                  name: bikeSubtype === "vo2max" ? "VO2 Bike Intervals" : bikeSubtype === "threshold" ? "Threshold Climb Repeats" : "Mixed Development Ride",
                  section: "A Block",
                  mode: "time",
                  sets: [{ reps: "4-6 reps", rpe: "7-9", rest: "2-4 min", notes: session.session_goal }],
                  field_toggles: { showWeight: false, secondaryMetric: "time", showRpe: true, showRest: true }
                },
                bikeSubtype === "vo2max" ? "VO2 Bike Intervals" : bikeSubtype === "threshold" ? "Threshold Climb Repeats" : "Mixed Development Ride",
                "A Block"
              )
            ],
            sessionType
          );
        }
      } else {
        generatedBlocks = Array.isArray(existing.blocks) && existing.blocks.length
          ? (existing.blocks as SessionBlock[])
          : buildBlocksFromExercises(buildFallbackProfessionalDay(session, weeklyRow), sessionType);
      }

      output[slotKey] = {
        ...session,
        blocks: generatedBlocks
      };
    }
  }

  return output;
}

function normalizeExerciseMode(value: unknown): string {
  const mode = cleanText(value).toLowerCase();
  if (mode === "time" || mode === "endurance") {
    return mode;
  }
  return "reps";
}

function normalizeSection(value: unknown): string {
  const section = cleanText(value);
  return section || "A Block";
}

function makeSet(input: unknown): DayExerciseSet {
  const row = input && typeof input === "object" ? (input as JsonRecord) : {};
  const reps = cleanText(row.target_reps ?? row.reps);
  const weight = cleanText(row.target_weight ?? row.weight);
  const rpe = cleanText(row.target_rpe ?? row.rpe);
  const rest = cleanText(row.target_rest ?? row.rest);
  const notes = cleanText(row.target_notes ?? row.notes);

  return {
    reps,
    weight,
    rpe,
    rest,
    notes,
    done: false,
    target_reps: reps,
    target_weight: weight,
    target_rpe: rpe,
    target_rest: rest,
    target_notes: notes
  };
}

function makeExercise(row: unknown, fallbackName: string, fallbackSection: string): DayExercise {
  const source = row && typeof row === "object" ? (row as JsonRecord) : {};
  const mode = normalizeExerciseMode(source.mode);
  const secondaryMetric = cleanText((source.field_toggles as JsonRecord)?.secondaryMetric).toLowerCase() === "time" || mode === "time"
    ? "time"
    : "weight";

  const setsRaw = Array.isArray(source.sets) ? source.sets : [];
  const sets = setsRaw.length ? setsRaw.map((item) => makeSet(item)) : [makeSet({ reps: mode === "time" ? "10 min" : "8" })];

  return {
    name: cleanText(source.name) || fallbackName,
    section: normalizeSection(source.section ?? fallbackSection),
    mode,
    superset_group: cleanText(source.superset_group) || null,
    library_id: cleanText(source.library_id) || null,
    video_demo_url: cleanText(source.video_demo_url),
    field_toggles: {
      showWeight: (source.field_toggles as JsonRecord)?.showWeight !== false,
      secondaryMetric,
      showRpe: (source.field_toggles as JsonRecord)?.showRpe !== false,
      showRest: !!(source.field_toggles as JsonRecord)?.showRest
    },
    sets
  };
}

function isPlaceholderExerciseName(value: unknown): boolean {
  const text = cleanText(value).toLowerCase();
  if (!text) {
    return true;
  }

  return (
    /^exercise\s*\d+$/i.test(text) ||
    /^block\s*\d+$/i.test(text) ||
    text === "block" ||
    text === "a block" ||
    text === "b block" ||
    text === "c block" ||
    text === "main strength" ||
    text === "secondary strength" ||
    text === "warm-up" ||
    text === "warm up" ||
    text === "cool-down" ||
    text === "cool down" ||
    text === "intervals" ||
    text === "session"
  );
}

function buildSetTemplate(source: JsonRecord, mode: string): DayExerciseSet[] {
  const baseReps = cleanText(source.exercise_rep_target) || cleanText(source.prescription) || (mode === "time" || mode === "endurance" ? "8-12 min" : "6-10");
  const baseWeight = cleanText(source.exercise_load_target) || cleanText(source.exercise_weight_target) || "";
  const baseRpe = cleanText(source.exercise_intensity_target) || cleanText(source.intensity_target);
  const baseRest = cleanText(source.exercise_rest_interval);
  const baseNotes = cleanText(source.notes);

  const inferredSetCount = mode === "time" || mode === "endurance" ? 1 : 3;
  const setCount = clampNumber(source.exercise_set_count, 1, 8, inferredSetCount);

  return Array.from({ length: setCount }, () =>
    makeSet({
      reps: baseReps,
      weight: baseWeight,
      rpe: baseRpe,
      rest: baseRest,
      notes: baseNotes
    })
  );
}

function getDefaultNamedExercises(sessionType: string, blockType: string, section: string): string[] {
  const normalizedType = normalizeSessionType(sessionType);
  const normalizedBlock = cleanText(blockType).toLowerCase();
  const normalizedSection = cleanText(section).toLowerCase();

  if (normalizedSection === "warm up") {
    return ["90/90 Breathing", "Dynamic Mobility Flow", "Activation Circuit"];
  }

  if (normalizedSection === "cool down") {
    return ["Easy Aerobic Downregulation", "Hip Flexor + T-Spine Mobility", "Parasympathetic Breathwork"];
  }

  if (normalizedType === "strength_lower") {
    if (normalizedBlock === "main_strength") {
      return ["Back Squat", "Romanian Deadlift"];
    }
    return ["Rear-Foot Elevated Split Squat", "Hamstring Curl", "Standing Calf Raise"];
  }

  if (normalizedType === "strength_upper") {
    if (normalizedBlock === "main_strength") {
      return ["Barbell Bench Press", "Weighted Pull-Up"];
    }
    return ["Single-Arm Dumbbell Row", "Half-Kneeling Landmine Press", "Face Pull"];
  }

  if (normalizedType === "climbing") {
    if (normalizedBlock === "hangboarding") {
      return ["Half-Crimp Max Hangs", "Open-Hand Repeaters"];
    }
    if (normalizedBlock === "intervals") {
      return ["4x4 Boulder Intervals", "Route Power-Endurance Repeats"];
    }
    return ["Scap Pull-Up", "Lock-Off Holds", "Core Tension Drill"];
  }

  if (normalizedType === "run" || normalizedType === "threshold" || normalizedType === "vo2" || normalizedType === "uphill") {
    if (normalizedBlock === "intervals") {
      return ["Uphill Run Intervals", "Easy Jog Recovery"];
    }
    return ["Steady Aerobic Run", "Stride Mechanics"];
  }

  if (normalizedType === "cycling" || normalizedType === "mountain_bike") {
    if (normalizedBlock === "intervals") {
      return ["Threshold Climb Repeats", "Easy Spin Recovery"];
    }
    return ["Zone 2 Endurance Ride", "High-Cadence Technique Spins"];
  }

  if (normalizedType === "hiking" || normalizedType === "long_endurance") {
    return ["Sustained Uphill Hike", "Loaded Carry Strides"];
  }

  return ["Trap-Bar Deadlift", "Push Press", "Single-Leg RDL"];
}

function inferModeFromSessionType(sessionType: string, currentMode: string): string {
  if (currentMode === "time" || currentMode === "endurance") {
    return currentMode;
  }

  const normalizedType = normalizeSessionType(sessionType);
  if (
    normalizedType === "run" ||
    normalizedType === "cycling" ||
    normalizedType === "mountain_bike" ||
    normalizedType === "zone2" ||
    normalizedType === "threshold" ||
    normalizedType === "vo2" ||
    normalizedType === "uphill" ||
    normalizedType === "long_endurance" ||
    normalizedType === "hiking"
  ) {
    return "time";
  }

  return "reps";
}

function mapBlockTypeToSection(type: string): string {
  const key = cleanText(type).toLowerCase();
  if (key === "warmup" || key === "activation") {
    return "Warm Up";
  }
  if (key === "cooldown") {
    return "Cool Down";
  }
  if (key === "main_strength" || key === "intervals" || key === "hangboarding") {
    return "A Block";
  }
  if (key === "secondary_strength" || key === "emom" || key === "amrap") {
    return "B Block";
  }
  return "B Block";
}

function buildExercisesFromSessionPlan(session: JsonRecord): DayExercise[] {
  const blocks = Array.isArray(session.blocks) ? session.blocks : [];
  const exercises: DayExercise[] = [];
  const sessionType = normalizeSessionType(session.session_type);

  blocks.forEach((block, blockIndex) => {
    const source = block && typeof block === "object" ? (block as JsonRecord) : {};
    const blockType = cleanText(source.type);
    const blockTitle = cleanText(source.title) || `Block ${blockIndex + 1}`;
    const section = mapBlockTypeToSection(blockType);
    const mode = inferModeFromSessionType(sessionType, normalizeExerciseMode(source.exercise_mode));

    const named = Array.isArray(source.exercise_names)
      ? source.exercise_names.map((value) => cleanText(value)).filter(Boolean)
      : [];

    const filteredNamed = named.filter((name) => !isPlaceholderExerciseName(name));

    const defaultNames = getDefaultNamedExercises(sessionType, blockType, section);
    const chosenNames = filteredNamed.length ? filteredNamed : defaultNames;
    const setTemplate = buildSetTemplate(source, mode);

    if (!chosenNames.length) {
      chosenNames.push(blockTitle);
    }

    chosenNames.forEach((name, index) => {
      const fallbackName = defaultNames[index] || defaultNames[0] || blockTitle || `Exercise ${index + 1}`;
      exercises.push(
        makeExercise(
          {
            name,
            section,
            mode,
            sets: setTemplate,
            field_toggles: {
              showWeight: mode !== "time" && mode !== "endurance",
              secondaryMetric: mode === "time" || mode === "endurance" ? "time" : "weight",
              showRpe: true,
              showRest: true
            }
          },
          fallbackName,
          section
        )
      );
    });
  });

  return exercises;
}

function getSectionBasedFallbackName(section: string, sessionType: string, index: number): string {
  const defaults = getDefaultNamedExercises(sessionType, "", section);
  return defaults[index] || defaults[0] || `Exercise ${index + 1}`;
}

function ensureDetailedExerciseNames(exercises: DayExercise[], session: JsonRecord, weekly: WeeklyRow | undefined): DayExercise[] {
  const sessionType = normalizeSessionType(session.session_type ?? weekly?.session_type);

  return exercises.map((exercise, index) => {
    const currentName = cleanText(exercise.name);
    if (!isPlaceholderExerciseName(currentName)) {
      return exercise;
    }

    return {
      ...exercise,
      name: getSectionBasedFallbackName(exercise.section, sessionType, index)
    };
  });
}

function buildFallbackProfessionalDay(session: JsonRecord, weekly: WeeklyRow | undefined): DayExercise[] {
  const type = normalizeSessionType(session.session_type ?? weekly?.session_type);
  const goal = cleanText(session.session_goal || weekly?.note);
  const title = cleanText(session.title || weekly?.name || "Session");

  if (type === "rest" || type === "mobility") {
    return [
      makeExercise(
        {
          name: type === "rest" ? "Recovery Walk / Breathwork" : "Mobility Flow",
          section: "Cool Down",
          mode: "time",
          sets: [{ reps: "15-25 min", rpe: "Easy", notes: goal || title }],
          field_toggles: { showWeight: false, secondaryMetric: "time", showRpe: true, showRest: false }
        },
        "Mobility Flow",
        "Cool Down"
      )
    ];
  }

  if (type === "zone2" || type === "long_endurance" || type === "run" || type === "cycling" || type === "mountain_bike" || type === "hiking") {
    const runningTitle = type === "run"
      ? (cleanText(session.run_session_type) || (cleanText(session.session_goal).toLowerCase().includes("interval") ? "Run Intervals" : "Easy Aerobic Run"))
      : title;
    const cyclingTitle = type === "cycling" || type === "mountain_bike"
      ? (cleanText(session.cycling_session_type) || cleanText(session.mountain_bike_session_type) || title)
      : title;
    return [
      makeExercise(
        {
          name: type === "run" ? runningTitle : cyclingTitle,
          section: "A Block",
          mode: "endurance",
          sets: [{ reps: cleanText(session.duration_minutes) ? `${cleanText(session.duration_minutes)} min` : type === "run" ? "45-75 min" : "60-120 min", rpe: cleanText(session.intensity_target) || (type === "run" ? "Easy" : "Zone 2"), notes: goal }],
          field_toggles: { showWeight: false, secondaryMetric: "time", showRpe: true, showRest: false }
        },
        type === "run" ? runningTitle : cyclingTitle,
        "A Block"
      )
    ];
  }

  return [
    makeExercise(
      {
        name: "Warm-Up",
        section: "Warm Up",
        mode: "time",
        sets: [{ reps: "10-15 min", notes: "Progressive movement prep" }],
        field_toggles: { showWeight: false, secondaryMetric: "time", showRpe: false, showRest: false }
      },
      "Warm-Up",
      "Warm Up"
    ),
    makeExercise(
      {
        name: cleanText(title) || "Primary Lift",
        section: "A Block",
        mode: "reps",
        sets: [{ reps: "4-6", weight: "Working load", rpe: "7-8", rest: "120s", notes: goal }],
        field_toggles: { showWeight: true, secondaryMetric: "weight", showRpe: true, showRest: true }
      },
      "Primary Lift",
      "A Block"
    ),
    makeExercise(
      {
        name: "Accessory Strength",
        section: "B Block",
        mode: "reps",
        sets: [{ reps: "6-10", weight: "Moderate", rpe: "7", rest: "75-90s" }],
        field_toggles: { showWeight: true, secondaryMetric: "weight", showRpe: true, showRest: true }
      },
      "Accessory Strength",
      "B Block"
    ),
    makeExercise(
      {
        name: "Cool Down",
        section: "Cool Down",
        mode: "time",
        sets: [{ reps: "8-10 min", notes: "Breathing + mobility" }],
        field_toggles: { showWeight: false, secondaryMetric: "time", showRpe: false, showRest: false }
      },
      "Cool Down",
      "Cool Down"
    )
  ];
}

function normalizeDays(rawDays: unknown, structure: { weeks: number; workoutsPerWeek: number }, sessionPlans: JsonRecord, weekly: WeeklyRow[]): JsonRecord {
  const source = rawDays && typeof rawDays === "object" ? (rawDays as JsonRecord) : {};
  const output: JsonRecord = {};

  for (let week = 1; week <= structure.weeks; week += 1) {
    for (let day = 1; day <= structure.workoutsPerWeek; day += 1) {
      const slotKey = `w${week}d${day}`;
      const session = sessionPlans[slotKey] && typeof sessionPlans[slotKey] === "object" ? (sessionPlans[slotKey] as JsonRecord) : {};
      const weeklyRow = weekly[day - 1] || weekly[weekly.length - 1];
      const raw = source[slotKey];

      let exercises: DayExercise[] = [];
      if (Array.isArray(raw)) {
        exercises = raw.map((item, index) => makeExercise(item, `Exercise ${index + 1}`, "A Block"));
      }

      if (!exercises.length) {
        exercises = buildExercisesFromSessionPlan(session);
      }

      if (!exercises.length) {
        exercises = buildFallbackProfessionalDay(session, weeklyRow);
      }

      output[slotKey] = ensureDetailedExerciseNames(exercises, session, weeklyRow);
    }
  }

  return output;
}

function deriveDaySessionTypes(structure: { weeks: number; workoutsPerWeek: number }, sessionPlans: JsonRecord, weekly: WeeklyRow[]): JsonRecord {
  const output: JsonRecord = {};
  for (let week = 1; week <= structure.weeks; week += 1) {
    for (let day = 1; day <= structure.workoutsPerWeek; day += 1) {
      const slotKey = `w${week}d${day}`;
      const session = sessionPlans[slotKey] && typeof sessionPlans[slotKey] === "object" ? (sessionPlans[slotKey] as JsonRecord) : {};
      const weeklyRow = weekly[day - 1] || weekly[weekly.length - 1];
      output[slotKey] = normalizeSessionType(session.session_type ?? weeklyRow?.session_type);
    }
  }
  return output;
}

function deriveCustomDayNames(structure: { weeks: number; workoutsPerWeek: number }, sessionPlans: JsonRecord, weekly: WeeklyRow[]): JsonRecord {
  const output: JsonRecord = {};
  for (let week = 1; week <= structure.weeks; week += 1) {
    for (let day = 1; day <= structure.workoutsPerWeek; day += 1) {
      const slotKey = `w${week}d${day}`;
      const session = sessionPlans[slotKey] && typeof sessionPlans[slotKey] === "object" ? (sessionPlans[slotKey] as JsonRecord) : {};
      const weeklyRow = weekly[day - 1] || weekly[weekly.length - 1];
      const title = cleanText(session.title) || cleanText(weeklyRow?.name);
      if (title) {
        output[slotKey] = title;
      }
    }
  }
  return output;
}

async function callOpenAi(prompt: string, context: JsonRecord): Promise<JsonRecord> {
  const apiKey = getEnv("OPENAI_API_KEY");
  const model = getEnv("OPENAI_MODEL", false) || "gpt-4o-mini";

  const systemPrompt = [
    "You generate JSON payloads for a training-program template builder.",
    "Return valid JSON only. No markdown.",
    "Fill all sections needed for professional PDF output and daily programming.",
    "Output keys:",
    "- template_name: string",
    "- focus: one of strength|running|biking|hybrid",
    "- structure: { weeks: number, workoutsPerWeek: number }",
    "- program_meta: object with program_type,sport_focus,athlete_level,program_subtitle,program_description,program_version,primary_goal,secondary_goal,tags,program_assumption,program_principles_text,program_disclaimers_text,program_worksheets_text,framework_heading,framework_intro,framework_rule_title,framework_rule_body,framework_priorities_text,framework_variables_text,framework_wave_heading,framework_wave_rows_text,framework_wave_footer",
    "- program_phases: array with name,start_week,end_week,focus,rationale,priorities_text,general_training_overview_text,general_weekly_structure_text,strength_rule,endurance_rule,monitoring_metrics_text,progress_rules_text,reduce_rules_text,stop_rules_text,phase_assessments_text,exit_criteria_text",
    "- weekly_structure: array of rows with name,day_of_week,session_type,note",
    "- session_plans: object keyed by w{week}d{day}; each entry includes title,session_type,session_goal,intensity_target,duration_minutes,coach_notes and blocks",
    "- days: object keyed by w{week}d{day}; each value is an array of exercises with section, name, mode, and sets[] where each set includes reps, weight, rpe, rest, notes",
    "Every exercise name must be a concrete movement (for example: Back Squat, Romanian Deadlift, Threshold Climb Repeat), never a placeholder like Block 1, A Block, Main Strength, or Intervals.",
    "For running-focused plans, include at least one explicit run day with a run-specific session_type such as easy_aerobic, tempo_run, threshold_intervals, vo2max_intervals, long_run, or trail-based work; do not label the day only as zone2.",
    "For strength sessions include warm-up, primary strength, secondary/accessory, and cooldown work with realistic sets/reps/intensity.",
    "For endurance sessions include duration/intensity progression.",
    "Prefer concise, coach-ready copy. Use realistic progressions and phase-specific changes across weeks."
  ].join("\n");

  const userPrompt = {
    request: prompt,
    context
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(userPrompt) }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${text.slice(0, 240)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  const parsed = parseJsonFromText(String(content || ""));

  if (!parsed) {
    throw new Error("AI response could not be parsed as JSON.");
  }

  return parsed;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    await getAuthedUserId(req);

    const body = await req.json().catch(() => ({}));
    const prompt = cleanText(body?.prompt);
    const context = body?.context && typeof body.context === "object" ? (body.context as JsonRecord) : {};

    if (!prompt) {
      return jsonResponse({ error: "Prompt is required." }, 400);
    }

    const ai = await callOpenAi(prompt, context);

    const structure = normalizeStructure(ai.structure as JsonRecord);
    const meta = normalizeMeta(ai.program_meta, structure);
    const phases = normalizePhases(ai.program_phases, structure.weeks);
    const weekly = normalizeWeeklyStructure(ai.weekly_structure, structure.workoutsPerWeek);
    const sessionPlans = buildSessionPlans(structure, weekly, phases, ai.session_plans, cleanText(ai.focus), cleanText(meta.sport_focus));
    const days = normalizeDays(ai.days, structure, sessionPlans, weekly);
    const daySessionTypes = deriveDaySessionTypes(structure, sessionPlans, weekly);
    const customDayNames = deriveCustomDayNames(structure, sessionPlans, weekly);

    const payload = {
      archived: false,
      focus: cleanText(ai.focus) || cleanText(context.focus) || "hybrid",
      program_meta: meta,
      program_phases: phases,
      weekly_structure: weekly,
      day_session_types: daySessionTypes,
      custom_day_names: customDayNames,
      custom_day_name_mode: "full-label",
      structure,
      session_plans: sessionPlans,
      days
    };

    return jsonResponse({
      ok: true,
      templateName: cleanText(ai.template_name) || cleanText(context.template_name) || "AI Generated Template",
      payload,
      warnings: []
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return jsonResponse({ error: message }, 400);
  }
});
