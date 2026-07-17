export interface PdfBrand {
  name: string;
  tagline?: string;
}

export interface PdfAthlete {
  id?: string;
  name?: string;
  email?: string;
}

export interface PdfGoal {
  label: string;
  type?: "primary" | "secondary" | "event" | "custom";
  activityId?: string;
  notes?: string;
}

export interface PdfActivity {
  id: string;
  name: string;
  role?: "primary" | "supporting" | "optional";
}

export interface PdfExercise {
  name: string;
  sets?: string | number;
  reps?: string | number;
  duration?: string;
  distance?: string;
  intensity?: string;
  load?: string;
  tempo?: string;
  rest?: string;
  rpe?: string;
  rir?: string;
  notes?: string[];
  prescriptionText?: string;
}

export interface PdfSessionSection {
  title: string;
  exercises: PdfExercise[];
}

export interface PdfSession {
  id: string;
  title: string;
  type: string;
  purpose?: string;
  duration?: string;
  targetRpe?: string;
  targetRir?: string;
  sections: PdfSessionSection[];
  coachingNotes?: string[];
  progressionRules?: string[];
}

export interface PdfWeeklyScheduleRow {
  day: string;
  session: string;
  activity?: string;
  intensity?: string;
  duration?: string;
  notes?: string;
  optional?: boolean;
}

export interface PdfWeeklySchedule {
  id: string;
  label: string;
  rows: PdfWeeklyScheduleRow[];
}

export interface PdfAssessment {
  title: string;
  dateLabel?: string;
  benchmark?: string;
  notes?: string[];
}

export interface PdfWorksheet {
  title: string;
  description?: string;
}

export interface PdfMonitoringMetric {
  metric: string;
  target?: string;
  frequency?: string;
  notes?: string;
}

export interface PdfAdjustmentRule {
  category: "progress" | "reduce" | "stop";
  rule: string;
}

export interface PdfActivityEmphasis {
  activityId: string;
  status:
    | "primary"
    | "develop"
    | "maintain"
    | "introduce"
    | "peak"
    | "taper"
    | "recover"
    | "optional";
  frequency?: string;
  notes?: string;
}

export interface PdfActivityPlan {
  activityId: string;
  purpose?: string;
  frequency?: string;
  intensityGuidance?: string;
  volumeGuidance?: string;
  technicalPriorities?: string[];
  progressionByWeek?: string[];
  restrictions?: string[];
  recoveryRules?: string[];
  advancementCriteria?: string[];
}

export interface PdfPhase {
  id: string;
  order: number;
  name: string;
  dateLabel?: string;
  durationWeeks?: number;
  primaryObjective?: string;
  rationale?: string;
  activityEmphasis?: PdfActivityEmphasis[];
  objectives?: string[];
  priorities?: string[];
  qualitiesDeveloped?: string[];
  qualitiesMaintained?: string[];
  weeklySchedules?: PdfWeeklySchedule[];
  sessions?: PdfSession[];
  activityPlans?: PdfActivityPlan[];
  monitoring?: PdfMonitoringMetric[];
  adjustmentRules?: PdfAdjustmentRule[];
  exitCriteria?: string[];
  assessments?: PdfAssessment[];
}

export interface PdfProgram {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  version?: string;
  brand: PdfBrand;
  athlete?: PdfAthlete;
  dates?: {
    startDate?: string;
    endDate?: string;
    displayLabel?: string;
  };
  goals: PdfGoal[];
  activities: PdfActivity[];
  phases: PdfPhase[];
  principles?: string[];
  assessments?: PdfAssessment[];
  worksheets?: PdfWorksheet[];
  disclaimers?: string[];
  coachNotes?: string[];
  summary?: {
    durationWeeks?: number;
    totalSessions?: number;
    totalPhases?: number;
    totalActivities?: number;
  };
}

export interface PdfNormalizationResult {
  program: PdfProgram;
  warnings: string[];
}

export declare function normalizeProgramForPdf(rawProgram: unknown): PdfNormalizationResult;
