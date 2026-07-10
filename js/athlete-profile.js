// Climbing metrics and level estimation
const climbingMetrics = [
  {
    name: "Max Hang Str: Wt., 20mm, 10sec",
    levels: {
      "≤ V3": [1.06, 1.32],
      "V4": [1.09, 1.31],
      "V5": [1.19, 1.44],
      "V6": [1.27, 1.48],
      "V7": [1.24, 1.57],
      "V8": [1.27, 1.60],
      "V9": [1.32, 1.61],
      "V10": [1.41, 1.74]
    }
  },
  {
    name: "Weighted Pull-Up Str:Wt, 1 Rep Max",
    levels: {
      "≤ V3": [1.14, 1.42],
      "V4": [1.32, 1.53],
      "V5": [1.37, 1.64],
      "V6": [1.35, 1.64],
      "V7": [1.37, 1.63],
      "V9": [1.39, 1.73],
      "V10": [1.51, 1.80]
    }
  },
  {
    name: "Campus Max Reach, inches",
    levels: {
      "≤ V3": [20, 31],
      "V4": [27, 32],
      "V5": [27, 32],
      "V6": [28, 36],
      "V7": [28, 37],
      "V8": [31, 38],
      "V9": [30, 40],
      "V10": [31, 40]
    }
  },
  {
    name: "7:3 Repeaters at Bodyweight, 20mm, sec",
    levels: {
      "≤ V3": [54, 106],
      "V4": [43, 124],
      "V5": [52, 141],
      "V6": [65, 151],
      "V7": [73, 178],
      "V8": [83, 178],
      "V9": [76, 183],
      "V10": [85, 194]
    }
  },
  {
    name: "Continuous Hang Time, 20mm, sec",
    levels: {
      "≤ V3": [13, 41],
      "V4": [15, 43],
      "V5": [23, 51],
      "V6": [28, 54],
      "V7": [24, 65],
      "V8": [33, 64],
      "V9": [34, 67],
      "V10": [36, 76]
    }
  },
  {
    name: "Max Pull-Ups, reps",
    levels: {
      "≤ V3": [6, 15],
      "V4": [10, 18],
      "V5": [11, 20],
      "V6": [11, 20],
      "V7": [12, 20],
      "V8": [12, 21],
      "V9": [11, 22],
      "V10": [14, 24]
    }
  },
  {
    name: "Max Push-Ups, reps",
    levels: {
      "≤ V3": [14, 38],
      "V4": [20, 45],
      "V5": [21, 45],
      "V6": [22, 39],
      "V7": [21, 42],
      "V8": [20, 49],
      "V9": [20, 40],
      "V10": [22, 42]
    }
  }
];

const climbingMetricsMale = [
  {
    name: "Max Hang Str: Wt., 20mm, 10sec",
    levels: {
      "5.11a/b": [1.10, 1.38],
      "5.11c/d": [1.09, 1.42],
      "5.12a/b": [1.19, 1.54],
      "5.12c/d": [1.25, 1.58],
      "5.13a/b": [1.27, 1.60],
      "5.13c/d": [1.33, 1.68]
    }
  },
  {
    name: "Weighted Pull-Up Str:Wt, 1 Rep Max",
    levels: {
      "5.11a/b": [1.19, 1.61],
      "5.11c/d": [1.30, 1.58],
      "5.12a/b": [1.33, 1.64],
      "5.12c/d": [1.37, 1.67],
      "5.13a/b": [1.42, 1.73],
      "5.13c/d": [1.47, 1.78]
    }
  },
  {
    name: "Campus Max Reach, inches",
    levels: {
      "5.11a/b": [20, 38],
      "5.11c/d": [19, 37],
      "5.12a/b": [27, 37],
      "5.12c/d": [28, 37],
      "5.13a/b": [30, 38],
      "5.13c/d": [28, 40]
    }
  },
  {
    name: "Long Reach Foot-On Campus Time, sec",
    levels: {
      "5.11a/b": [26, 57],
      "5.11c/d": [22, 98],
      "5.12a/b": [41, 109],
      "5.12c/d": [51, 141],
      "5.13a/b": [61, 141],
      "5.13c/d": [52, 139]
    }
  },
  {
    name: "Short Reach Foot-On Campus Time, sec",
    levels: {
      "5.11a/b": [40, 83],
      "5.11c/d": [51, 138],
      "5.12a/b": [41, 183],
      "5.12c/d": [70, 254],
      "5.13a/b": [84, 275],
      "5.13c/d": [126, 316]
    }
  },
  {
    name: "7:3 Repeaters at Bodyweight, 20mm, sec",
    levels: {
      "5.11a/b": [40, 123],
      "5.11c/d": [47, 130],
      "5.12a/b": [59, 161],
      "5.12c/d": [86, 183],
      "5.13a/b": [100, 209],
      "5.13c/d": [107, 214]
    }
  },
  {
    name: "Continuous Hang Time, 20mm, sec",
    levels: {
      "5.11a/b": [16, 40],
      "5.11c/d": [16, 48],
      "5.12a/b": [25, 57],
      "5.12c/d": [29, 69],
      "5.13a/b": [32, 64],
      "5.13c/d": [46, 74]
    }
  },
  {
    name: "Max Pull-Ups, reps",
    levels: {
      "5.11a/b": [7, 18],
      "5.11c/d": [10, 19],
      "5.12a/b": [10, 20],
      "5.12c/d": [12, 20],
      "5.13a/b": [12, 23],
      "5.13c/d": [14, 26]
    }
  },
  {
    name: "Max Push-Ups, reps",
    levels: {
      "5.11a/b": [14, 46],
      "5.11c/d": [19, 46],
      "5.12a/b": [20, 42],
      "5.12c/d": [21, 37],
      "5.13a/b": [20, 51],
      "5.13c/d": [20, 46]
    }
  }
];

const climbingMetricsFemale = [
  {
    name: "Max Hang Str: Wt., 20mm, 10sec",
    levels: {
      "≤ V3": [1.00, 1.19],
      "V4": [1.07, 1.31],
      "V5": [1.09, 1.42],
      "V6": [1.11, 1.46],
      "V7": [1.19, 1.52],
      "V8": [1.20, 1.50],
      "V9": [1.31, 1.69],
      "V10": [1.44, 1.83]
    }
  },
  {
    name: "Weighted Pull-Up Str:Wt, 1 Rep Max",
    levels: {
      "≤ V3": [1.01, 1.22],
      "V4": [1.06, 1.38],
      "V5": [1.14, 1.40],
      "V6": [1.15, 1.39],
      "V7": [1.25, 1.48],
      "V8": [1.25, 1.54],
      "V9": [1.35, 1.63],
      "V10": [1.40, 1.63]
    }
  },
  {
    name: "Campus Max Reach, inches",
    levels: {
      "≤ V3": [8, 23],
      "V4": [15, 28],
      "V5": [17, 32],
      "V6": [24, 31],
      "V7": [25, 33],
      "V8": [23, 31],
      "V9": [27, 32],
      "V10": [27, 32]
    }
  },
  {
    name: "7:3 Repeaters at Bodyweight, 20mm, sec",
    levels: {
      "≤ V3": [18, 75],
      "V4": [30, 99],
      "V5": [47, 132],
      "V6": [55, 138],
      "V7": [69, 170],
      "V8": [52, 173],
      "V9": [66, 198],
      "V10": [73, 220]
    }
  },
  {
    name: "Continuous Hang Time, 20mm, sec",
    levels: {
      "≤ V3": [8, 27],
      "V4": [14, 45],
      "V5": [17, 53],
      "V6": [22, 52],
      "V7": [31, 60],
      "V8": [31, 62],
      "V9": [35, 76],
      "V10": [50, 71]
    }
  },
  {
    name: "Max Pull-Ups, reps",
    levels: {
      "≤ V3": [1, 8],
      "V4": [2, 12],
      "V5": [6, 12],
      "V6": [6, 12],
      "V7": [8, 16],
      "V8": [8, 14],
      "V9": [9, 18],
      "V10": [13, 18]
    }
  },
  {
    name: "Max Push-Ups, reps",
    levels: {
      "≤ V3": [9, 18],
      "V4": [5, 28],
      "V5": [13, 30],
      "V6": [10, 30],
      "V7": [12, 32],
      "V8": [9, 30],
      "V9": [14, 40],
      "V10": [21, 33]
    }
  }
];

const sportClimbingMetricsFemale = [
  {
    name: "Max Hang Str: Wt., 20mm, 10sec",
    levels: {
      "5.11a/b": [0.99, 1.37],
      "5.11c/d": [1.00, 1.35],
      "5.12a/b": [1.14, 1.49],
      "5.12c/d": [1.07, 1.63],
      "5.13a/b": [1.17, 1.59],
      "5.13c/d": [1.24, 1.58]
    }
  },
  {
    name: "Weighted Pull-Up Str:Wt, 1 Rep Max",
    levels: {
      "5.11a/b": [1.05, 1.42],
      "5.11c/d": [1.05, 1.36],
      "5.12a/b": [1.14, 1.45],
      "5.12c/d": [1.16, 1.50],
      "5.13a/b": [1.24, 1.47],
      "5.13c/d": [1.41, 1.66]
    }
  },
  {
    name: "Campus Max Reach, inches",
    levels: {
      "5.11a/b": [18, 32],
      "5.11c/d": [13, 26],
      "5.12a/b": [16, 35],
      "5.12c/d": [20, 28],
      "5.13a/b": [24, 33],
      "5.13c/d": [30, 35]
    }
  },
  {
    name: "Long Reach Foot-On Campus Time, sec",
    levels: {
      "5.11a/b": [27, 73],
      "5.11c/d": [33, 87],
      "5.12a/b": [57, 103],
      "5.12c/d": [57, 146],
      "5.13a/b": [51, 164],
      "5.13c/d": [47, 194]
    }
  },
  {
    name: "Short Reach Foot-On Campus Time, sec",
    levels: {
      "5.11a/b": [31, 121],
      "5.11c/d": [40, 126],
      "5.12a/b": [79, 169],
      "5.12c/d": [60, 223],
      "5.13a/b": [69, 249],
      "5.13c/d": [89, 417]
    }
  },
  {
    name: "7:3 Repeaters at Bodyweight, 20mm, sec",
    levels: {
      "5.11a/b": [34, 115],
      "5.11c/d": [25, 91],
      "5.12a/b": [41, 151],
      "5.12c/d": [59, 195],
      "5.13a/b": [58, 195],
      "5.13c/d": [50, 185]
    }
  },
  {
    name: "Continuous Hang Time, 20mm, sec",
    levels: {
      "5.11a/b": [11, 38],
      "5.11c/d": [7, 37],
      "5.12a/b": [22, 54],
      "5.12c/d": [19, 62],
      "5.13a/b": [31, 63],
      "5.13c/d": [33, 73]
    }
  },
  {
    name: "Max Pull-Ups, reps",
    levels: {
      "5.11a/b": [2, 12],
      "5.11c/d": [2, 11],
      "5.12a/b": [5, 14],
      "5.12c/d": [6, 15],
      "5.13a/b": [8, 14],
      "5.13c/d": [12, 24]
    }
  },
  {
    name: "Max Push-Ups, reps",
    levels: {
      "5.11a/b": [6, 30],
      "5.11c/d": [7, 27],
      "5.12a/b": [12, 28],
      "5.12c/d": [12, 34],
      "5.13a/b": [10, 27],
      "5.13c/d": [18, 51]
    }
  }
];

// Sport climbing metrics for males (structure matches sportClimbingMetricsFemale)
const sportClimbingMetricsMale = [
  {
    name: "Max Hang Str: Wt., 20mm, 10sec",
    levels: {
      "5.11a/b": [1.10, 1.38],
      "5.11c/d": [1.09, 1.42],
      "5.12a/b": [1.19, 1.54],
      "5.12c/d": [1.25, 1.58],
      "5.13a/b": [1.27, 1.60],
      "5.13c/d": [1.33, 1.68]
    }
  },
  {
    name: "Weighted Pull-Up Str:Wt, 1 Rep Max",
    levels: {
      "5.11a/b": [1.19, 1.61],
      "5.11c/d": [1.30, 1.58],
      "5.12a/b": [1.33, 1.64],
      "5.12c/d": [1.37, 1.67],
      "5.13a/b": [1.42, 1.73],
      "5.13c/d": [1.47, 1.78]
    }
  },
  {
    name: "Campus Max Reach, inches",
    levels: {
      "5.11a/b": [20, 38],
      "5.11c/d": [19, 37],
      "5.12a/b": [27, 37],
      "5.12c/d": [28, 37],
      "5.13a/b": [30, 38],
      "5.13c/d": [28, 40]
    }
  },
  {
    name: "Long Reach Foot-On Campus Time, sec",
    levels: {
      "5.11a/b": [26, 57],
      "5.11c/d": [22, 98],
      "5.12a/b": [41, 109],
      "5.12c/d": [51, 141],
      "5.13a/b": [61, 141],
      "5.13c/d": [52, 139]
    }
  },
  {
    name: "Short Reach Foot-On Campus Time, sec",
    levels: {
      "5.11a/b": [40, 83],
      "5.11c/d": [51, 138],
      "5.12a/b": [41, 183],
      "5.12c/d": [70, 254],
      "5.13a/b": [84, 275],
      "5.13c/d": [126, 316]
    }
  },
  {
    name: "7:3 Repeaters at Bodyweight, 20mm, sec",
    levels: {
      "5.11a/b": [40, 123],
      "5.11c/d": [47, 130],
      "5.12a/b": [59, 161],
      "5.12c/d": [86, 183],
      "5.13a/b": [100, 209],
      "5.13c/d": [107, 214]
    }
  },
  {
    name: "Continuous Hang Time, 20mm, sec",
    levels: {
      "5.11a/b": [16, 40],
      "5.11c/d": [16, 48],
      "5.12a/b": [25, 57],
      "5.12c/d": [29, 69],
      "5.13a/b": [32, 64],
      "5.13c/d": [46, 74]
    }
  },
  {
    name: "Max Pull-Ups, reps",
    levels: {
      "5.11a/b": [7, 18],
      "5.11c/d": [10, 19],
      "5.12a/b": [10, 20],
      "5.12c/d": [12, 20],
      "5.13a/b": [12, 23],
      "5.13c/d": [14, 26]
    }
  },
  {
    name: "Max Push-Ups, reps",
    levels: {
      "5.11a/b": [14, 46],
      "5.11c/d": [19, 46],
      "5.12a/b": [20, 42],
      "5.12c/d": [21, 37],
      "5.13a/b": [20, 51],
      "5.13c/d": [20, 46]
    }
  }
];

function estimateClimbingLevel(metricName, result) {
  var metric = climbingMetrics.find(function (m) {
    return m.name === metricName;
  });

  if (!metric || result === "Not recorded") {
    return "Unknown";
  }

  var levels = metric.levels;
  for (var level in levels) {
    var range = levels[level];
    if (result >= range[0] && result <= range[1]) {
      return level;
    }
  }

  return "Unknown";
}

// Estimate sport climbing level based on scores and gender
function estimateSportClimbingLevel(scores, gender) {
  const metrics = gender === "male" ? sportClimbingMetricsMale : sportClimbingMetricsFemale;
  const levelScores = {};

  metrics.forEach((metric) => {
    const score = scores[metric.name];
    if (score !== undefined) {
      for (const [level, range] of Object.entries(metric.levels)) {
        if (score >= range[0] && score <= range[1]) {
          levelScores[level] = (levelScores[level] || 0) + 1;
          break;
        }
      }
    }
  });

  // Determine the most frequent level
  let estimatedLevel = null;
  let maxCount = 0;
  for (const [level, count] of Object.entries(levelScores)) {
    if (count > maxCount) {
      maxCount = count;
      estimatedLevel = level;
    }
  }

  return estimatedLevel || "No level estimated";
}

function estimateClimbingLevelForGender(metricName, result, gender) {
  var metrics = gender === "female" ? climbingMetricsFemale : climbingMetrics;
  var metric = metrics.find(function (m) {
    return m.name === metricName;
  });

  if (!metric || result === "Not recorded") {
    return "Unknown";
  }

  var levels = metric.levels;
  for (var level in levels) {
    var range = levels[level];
    if (result >= range[0] && result <= range[1]) {
      return level;
    }
  }

  return "Unknown";
}

(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var MEMBERSHIP_PAYMENT_TASK_FORM_ID = "membership-payment-task-v1";
  var MEMBERSHIP_PAYMENT_TASK_NAME = "Complete Membership Payment";
  var MEMBERSHIP_PAYMENT_TASK_URL = "founding-member.html?checkout=start";
  var METRICS_COLLAPSE_KEY = "nomadic.metricsSectionCollapsed";
  var METRICS_COMPACT_KEY = "nomadic.metricsCompactMode";
  var STRAVA_COLLAPSE_KEY = "nomadic.stravaSectionCollapsed";
  var DANGER_COLLAPSE_KEY = "nomadic.dangerSectionCollapsed";
  var GOALS_VIEW_ALL_KEY = "nomadic.goalsViewAll";
  var GOALS_FALLBACK_KEY = "nomadic_athlete_goals_events_v1";
  var NUTRITION_LOGS_FALLBACK_KEY = "nomadic_athlete_nutrition_logs_v1";
  var NUTRITION_TARGETS_FALLBACK_KEY = "nomadic_athlete_nutrition_targets_v1";
  var STRAVA_REDIRECT_STATUS_PARAM = "strava_status";
  var STRAVA_REDIRECT_MESSAGE_PARAM = "strava_message";
  var WHOOP_REDIRECT_STATUS_PARAM = "whoop_status";
  var WHOOP_REDIRECT_MESSAGE_PARAM = "whoop_message";
  var FOUNDING_PAYMENT_STATUS_PARAM = "founding_payment";
  var FOUNDING_PAYMENT_MESSAGE_PARAM = "founding_payment_message";
  var state = {
    client: null,
    user: null,
    viewUser: null,
    isCoachView: false,
    viewedAthleteId: null,
    profile: null,
    metrics: [],
    metricsLatest: [],
    stravaConnection: null,
    stravaDailyMetrics: [],
    whoopConnection: null,
    whoopDailyMetrics: [],
    guardElement: null,
    contentElement: null,
    form: null,
    statusElement: null,
    metricsForm: null,
    metricsRows: null,
    metricsList: null,
    metricsStatus: null,
    metricsEditor: null,
    metricsEditorToggle: null,
    metricsContent: null,
    metricsCollapseToggle: null,
    metricsCompactToggle: null,
    metricsSummaryBtn: null,
    stravaConnectBtn: null,
    stravaSyncBtn: null,
    stravaDisconnectBtn: null,
    stravaConnectionMeta: null,
    stravaMetricsGrid: null,
    stravaStatusElement: null,
    whoopConnectBtn: null,
    whoopSyncBtn: null,
    whoopDisconnectBtn: null,
    whoopManualToggleBtn: null,
    whoopManualForm: null,
    whoopManualAccessToken: null,
    whoopManualRefreshToken: null,
    whoopManualExpiresIn: null,
    whoopManualUserId: null,
    whoopManualCancelBtn: null,
    whoopConnectionMeta: null,
    whoopMetricsGrid: null,
    whoopStatusElement: null,
    onboardingContent: null,
    onboardingStatus: null,
    onboardingCoachActions: null,
    coachIntakeSearch: null,
    coachIntakeDueDate: null,
    coachTaskTitle: null,
    coachTaskDescription: null,
    athleteTaskModal: null,
    athleteTaskModalTitle: null,
    athleteTaskModalMeta: null,
    athleteTaskModalContent: null,
    athleteTaskModalStatus: null,
    onboardingAssignments: [],
    foundingOnboardingRow: null,
    foundingSubscriptionRow: null,
    paymentTaskReconcileInFlight: false,
    paymentTaskReconcileTouchedKey: "",
    accountTier: {
      key: "athlete",
      label: "Athlete Account",
      toneClass: "is-tier-athlete"
    },
    dashboardTaskBoard: null,
    profileTierBadgeEl: null,
    dashboardKickerEl: null,
    dashboardCopyEl: null,
    dashboardMessagesWidget: null,
    dashboardMessagesLabelEl: null,
    dashboardMessagesUnreadEl: null,
    dashboardMessageLinks: [],
    dashboardCompassSection: null,
    dashboardAccessContext: {
      mode: "limited",
      fullFeatureAccess: false,
      features: {
        compass: false,
        workoutCalendar: false,
        messaging: false
      },
      reason: ""
    },
    goalsManageLink: null,
    goalsToggleButton: null,
    goalsGlanceLink: null,
    goalsList: null,
    goalsCountdown: null,
    goalsStatus: null,
    goalsShowAll: false,
    glanceTrainingValue: null,
    glanceTrainingMeta: null,
    glanceGoalsValue: null,
    glanceGoalsMeta: null,
    glanceNutritionValue: null,
    glanceNutritionMeta: null,
    glanceStravaValue: null,
    glanceStravaMeta: null,
    readinessTrainingActiveCount: 0,
    readinessNextEventDays: null,
    readinessNutritionPct: null,
    readinessRecoveryScore: null,
    readinessStravaConnected: false,
    statusReadinessPct: 0,
    statusLoadPct: 0,
    statusDurabilityPct: 0,
    statusProgressPct: 0,
    compassNextObjective: "Set your next race, trip, or milestone.",
    compassNextObjectiveDate: null,
    calendarDragPayload: null,
    lastCalendarMove: null,
    calendarSuppressClickUntil: 0,
    trainingCalendarMonthIndex: null,
    trainingProgramsLoaded: false,
    trainingProgramsCache: [],
    trainingScheduleByAssignment: {},
    dashboardUpcomingTrainingItems: [],
    trainingConsistencyMessage: "",
    goalItems: [],
    nutritionToday: null,
    nutritionManageLink: null,
    nutritionGoalsLink: null,
    nutritionGlanceLink: null,
    nutritionForm: null,
    nutritionResetButton: null,
    nutritionTargetsForm: null,
    nutritionSummary: null,
    nutritionList: null,
    nutritionStatus: null,
    nutritionLogs: [],
    nutritionTargets: null,
    nutritionLogsAvailable: true,
    nutritionTargetsAvailable: true,
    passwordStatus: null,
    welcomeMessageEl: null,
    editToggleButton: null,
    editorSection: null,
    sportOverviewEditor: null,
    sportOverviewSummary: null,
    metricTemplatesBySport: {
      climbing: [
        "Readiness",
        "HRV",
        "Resting HR",
        "Sleep",
        "Fatigue",
        "Training Load",
        "Acute:Chronic Workload Ratio",
        "Recovery Score",
        "Grip Strength",
        "Power Output",
        "Climbing Grades"
      ],
      "trail-running": [
        "Readiness",
        "HRV",
        "Resting HR",
        "Sleep",
        "Fatigue",
        "Training Load",
        "Acute:Chronic Workload Ratio",
        "Recovery Score",
        "VO2 Max",
        "Power Output",
        "Session Adherence",
        "Trail Elevation Gain",
        "Altitude Exposure",
        "Pain/Injury Flags"
      ],
      skiing: [
        "Readiness",
        "HRV",
        "Resting HR",
        "Sleep",
        "Fatigue",
        "Training Load",
        "Acute:Chronic Workload Ratio",
        "Recovery Score",
        "Power Output",
        "Session Adherence",
        "Altitude Exposure",
        "Ski Vertical Feet",
        "Pain/Injury Flags"
      ],
      snowboarding: [
        "Readiness",
        "HRV",
        "Resting HR",
        "Sleep",
        "Fatigue",
        "Training Load",
        "Acute:Chronic Workload Ratio",
        "Recovery Score",
        "Power Output",
        "Session Adherence",
        "Altitude Exposure",
        "Pain/Injury Flags"
      ],
      mountainbiking: [
        "Readiness",
        "HRV",
        "Resting HR",
        "Sleep",
        "Fatigue",
        "Training Load",
        "Acute:Chronic Workload Ratio",
        "Recovery Score",
        "Power Output",
        "Session Adherence",
        "MTB Ride Metrics",
        "Jump Metrics",
        "Pain/Injury Flags"
      ],
      cycling: [
        "Readiness",
        "HRV",
        "Resting HR",
        "Sleep",
        "Fatigue",
        "Training Load",
        "Acute:Chronic Workload Ratio",
        "Recovery Score",
        "VO2 Max",
        "Power Output",
        "Session Adherence",
        "Pain/Injury Flags"
      ],
      other: [
        "Readiness",
        "HRV",
        "Resting HR",
        "Sleep",
        "Fatigue",
        "Training Load",
        "Acute:Chronic Workload Ratio",
        "Recovery Score",
        "VO2 Max",
        "Strength Metrics",
        "Grip Strength",
        "Jump Metrics",
        "Power Output",
        "Session Adherence",
        "Pain/Injury Flags"
      ]
    },
    sportOverviewTemplates: {
      climbing: [
        {
          key: "climbing_discipline",
          label: "Primary Discipline",
          type: "multi-select",
          placeholder: "Select discipline",
          options: ["Bouldering", "Sport", "Trad", "Ice", "Alpine", "Gym / Indoor"]
        },
        { key: "climbing_grade", label: "Current Climbing Level", placeholder: "5.11a, V4", type: "text" },
        { key: "climbing_years", label: "Years Climbing", placeholder: "e.g. 4", type: "number", min: "0", max: "80", step: "0.5" },
        { key: "climbing_focus", label: "Current Focus", placeholder: "Power endurance, technique, projecting", type: "text" },
        { key: "arm_span", label: "Arm Span (cm)", placeholder: "For ape index calculation", type: "text" },
        { key: "climbing_notes", label: "Important Notes", placeholder: "Injury history, limitations, preferred climbing days", type: "textarea", rows: "3" }
      ],
      skiing: [
        {
          key: "ski_discipline",
          label: "Ski Disciplines",
          type: "multi-select",
          placeholder: "Select one or more disciplines",
          options: ["Alpine", "Touring", "Freeride", "Nordic", "Park"]
        },
        {
          key: "ski_terrain",
          label: "Preferred Terrain",
          type: "multi-select",
          placeholder: "Select one or more terrain types",
          options: ["Groomers", "Steeps", "Moguls", "Backcountry", "Park"]
        }
      ],
      snowboarding: [
        {
          key: "snowboard_discipline",
          label: "Snowboard Disciplines",
          type: "multi-select",
          placeholder: "Select one or more disciplines",
          options: ["Freeride", "Park", "Splitboard", "Alpine", "All-Mountain"]
        },
        {
          key: "snowboard_stance",
          label: "Stance",
          type: "select",
          placeholder: "Select stance",
          options: ["Regular", "Goofy", "Switch"]
        }
      ],
      mountainbiking: [
        {
          key: "mtb_discipline",
          label: "MTB Disciplines",
          type: "multi-select",
          placeholder: "Select one or more disciplines",
          options: ["XC", "Trail", "Enduro", "DH", "Bike Park"]
        },
        { key: "mtb_weekly_volume", label: "Weekly Ride Volume", placeholder: "e.g. 6 hrs", type: "text" }
      ],
      "trail-running": [
        {
          key: "run_primary_distance",
          label: "Primary Distances",
          type: "multi-select",
          placeholder: "Select one or more distance focuses",
          options: ["5k", "10k", "Half Marathon", "Marathon", "Ultra"]
        },
        { key: "run_elevation_goal", label: "Elevation Focus", placeholder: "e.g. 3000 ft/week", type: "text" },
        {
          key: "run_surface",
          label: "Preferred Surface",
          type: "multi-select",
          placeholder: "Select one or more surfaces",
          options: ["Singletrack", "Technical Trail", "Fire Road", "Mixed Trail", "Road"]
        }
      ],
      cycling: [
        {
          key: "cycling_discipline",
          label: "Cycling Disciplines",
          type: "multi-select",
          placeholder: "Select one or more disciplines",
          options: ["Road", "Gravel", "Mountain Bike", "Cyclocross", "Track"]
        },
        { key: "cycling_weekly_volume", label: "Weekly Ride Volume", placeholder: "e.g. 8 hrs / 180 mi", type: "text" },
        { key: "cycling_focus", label: "Current Focus", placeholder: "Endurance, sprint power, climbing", type: "text" }
      ],
      other: [
        { key: "other_sport_name", label: "Sport Name", placeholder: "What sport are you training for?", type: "text" },
        { key: "other_focus", label: "Current Focus", placeholder: "What are you working on most right now?", type: "text" },
        { key: "other_notes", label: "Important Notes", placeholder: "Constraints, event schedule, or key context", type: "textarea", rows: "3" }
      ]
    },
    trainingTemplates: [],
    selectedTrainingTemplateId: "",
    onboardingTemplates: [],
    selectedOnboardingTemplateId: "",
    isAssigningCoachTask: false,
    isAssigningQuickTask: false,
    onboardingCoachTaskFilter: "active"
  };

  function getDefaultOnboardingTemplates() {
    return [
      {
        id: MEMBERSHIP_PAYMENT_TASK_FORM_ID,
        name: MEMBERSHIP_PAYMENT_TASK_NAME,
        description: "Assign this when an athlete is approved for membership. Includes a direct checkout link.",
        task_type: "custom_task",
        action_label: "Open Payment",
        action_url: MEMBERSHIP_PAYMENT_TASK_URL,
        action_target: "_self",
        questions: []
      },
      {
        id: "founding-member-intake-v1",
        name: "Founding Member Intake",
        description: "Baseline onboarding form to align goals, history, equipment, and schedule.",
        questions: [
          { key: "primary_goal", label: "Primary Performance Goal", type: "text", required: true, placeholder: "What is your #1 goal for this cohort?" },
          { key: "event_date", label: "Key Event / Race Date", type: "date" },
          { key: "training_days", label: "Preferred Training Days", type: "text", required: true, placeholder: "e.g. Mon, Wed, Fri" },
          { key: "minutes_per_session", label: "Typical Session Length (minutes)", type: "number", min: 10, max: 240 },
          { key: "injury_history", label: "Recent Injury History", type: "textarea", rows: 3, placeholder: "Any injuries, pain, or limitations in the last 12 months?" },
          { key: "equipment_access", label: "Equipment Access", type: "textarea", rows: 3, placeholder: "Gym, home setup, trail access, wearables, etc." },
          { key: "experience_level", label: "Current Experience Level", type: "select", options: ["Beginner", "Intermediate", "Advanced"] },
          { key: "coaching_preferences", label: "Coaching Preferences", type: "textarea", rows: 3, placeholder: "How do you prefer feedback and accountability?" }
        ]
      },
      {
        id: "performance-readiness-screen-v1",
        name: "Performance Readiness Screen",
        description: "Quick readiness and lifestyle intake before plan build.",
        questions: [
          { key: "sleep_hours", label: "Average Sleep (hours/night)", type: "number", min: 0, max: 14, step: 0.5, required: true },
          { key: "stress_level", label: "Current Life Stress", type: "select", options: ["Low", "Moderate", "High"], required: true },
          { key: "work_schedule", label: "Work / School Schedule Constraints", type: "textarea", rows: 3 },
          { key: "nutrition_notes", label: "Nutrition Notes", type: "textarea", rows: 3, placeholder: "Allergies, restrictions, fueling challenges" },
          { key: "confidence_score", label: "Confidence Score (1-10)", type: "number", min: 1, max: 10 }
        ]
      }
    ];
  }

  function shouldAutoOpenMetricReport() {
    try {
      return new URLSearchParams(window.location.search || "").get("printMetricReport") === "1";
    } catch (e) {
      return false;
    }
  }

  function clearAutoMetricReportFlag() {
    var url;
    try {
      url = new URL(window.location.href);
    } catch (e) {
      return;
    }

    if (!url.searchParams.has("printMetricReport")) {
      return;
    }

    url.searchParams.delete("printMetricReport");
    window.history.replaceState({}, document.title, url.toString());
  }

  function maybeAutoOpenMetricReport() {
    if (!state.metricsReportAutoPending || !state.metricsLatest || !state.metricsLatest.length) {
      return;
    }

    state.metricsReportAutoPending = false;
    clearAutoMetricReportFlag();
    onGenerateMetricSummaryPdf();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initializeProfile();
  });

  function initializeProfile() {
    state.guardElement = document.querySelector("[data-profile-guard]");
    state.contentElement = document.querySelector("[data-profile-content]");
    state.form = document.querySelector("[data-profile-form]");
    state.statusElement = document.querySelector("[data-profile-status]");
    state.metricsForm = document.querySelector("[data-metrics-form]");
    state.metricsRows = document.querySelector("[data-metric-rows]");
    state.metricsList = document.querySelector("[data-metrics-list]");
    state.metricsStatus = document.querySelector("[data-metrics-status]");
    state.metricsEditor = document.querySelector("[data-metrics-editor]");
    state.metricsEditorToggle = null;
    state.metricsContent = document.querySelector("[data-metrics-content]");
    state.metricsCollapseToggle = document.querySelector("[data-metrics-collapse-toggle]");
    state.metricsCompactToggle = document.querySelector("[data-metrics-compact-toggle]");
    state.metricsSummaryBtn = document.querySelector("[data-metrics-summary-pdf]");
    state.onboardingContent = document.querySelector("[data-onboarding-content]");
    state.onboardingStatus = document.querySelector("[data-onboarding-status]");
    state.onboardingCoachActions = document.querySelector("[data-onboarding-coach-actions]");
    state.dashboardTaskBoard = document.querySelector("[data-dashboard-task-board]") || document.querySelector("[data-dashboard-glance]");
    state.profileTierBadgeEl = document.querySelector("[data-profile-tier-badge]");
    state.welcomeMessageEl = document.querySelector("[data-profile-welcome-message]");
    state.dashboardKickerEl = document.querySelector(".profile-dashboard-kicker");
    state.dashboardCopyEl = document.querySelector("[data-profile-dashboard-copy]");
    state.dashboardMessagesWidget = document.querySelector(".profile-header-messages-widget");
    state.dashboardMessagesLabelEl = state.dashboardMessagesWidget
      ? state.dashboardMessagesWidget.querySelector(".profile-header-messages-label")
      : null;
    state.dashboardMessagesUnreadEl = document.querySelector("[data-profile-msg-summary-unread]");
    state.dashboardMessageLinks = Array.prototype.slice.call(document.querySelectorAll("[data-profile-messages-open]"));
    state.dashboardCompassSection = document.querySelector("[data-status-rings]");
    state.coachIntakeSearch = document.querySelector("[data-coach-intake-search]");
    state.coachIntakeDueDate = document.querySelector("[data-coach-intake-due-date]");
    state.coachTaskTitle = document.querySelector("[data-coach-task-title]");
    state.coachTaskDescription = document.querySelector("[data-coach-task-description]");
    state.athleteTaskModal = document.querySelector("[data-athlete-task-modal]");
    state.athleteTaskModalTitle = document.querySelector("[data-athlete-task-title]");
    state.athleteTaskModalMeta = document.querySelector("[data-athlete-task-meta]");
    state.athleteTaskModalContent = document.querySelector("[data-athlete-task-content]");
    state.athleteTaskModalStatus = document.querySelector("[data-athlete-task-status]");
    state.onboardingTemplates = getDefaultOnboardingTemplates();
    state.goalsManageLink = document.querySelector("[data-goals-manage-link]");
    state.goalsToggleButton = document.querySelector("[data-goals-toggle-list]");
    state.goalsGlanceLink = document.querySelector("[data-glance-goals-link]");
    state.goalsList = document.querySelector("[data-goals-list]");
    state.goalsCountdown = document.querySelector("[data-goals-countdown]");
    state.goalsStatus = document.querySelector("[data-goals-status]");
    state.glanceTrainingValue = document.querySelector("[data-glance-training]");
    state.glanceTrainingMeta = document.querySelector("[data-glance-training-meta]");
    state.glanceGoalsValue = document.querySelector("[data-glance-goals]");
    state.glanceGoalsMeta = document.querySelector("[data-glance-goals-meta]");
    state.glanceNutritionValue = document.querySelector("[data-glance-nutrition]");
    state.glanceNutritionMeta = document.querySelector("[data-glance-nutrition-meta]");
    state.glanceStravaValue = document.querySelector("[data-glance-strava]");
    state.glanceStravaMeta = document.querySelector("[data-glance-strava-meta]");
    state.nutritionToday = document.querySelector("[data-nutrition-today]");
    state.nutritionManageLink = document.querySelector("[data-nutrition-manage-link]");
    state.nutritionGoalsLink = document.querySelector("[data-nutrition-goals-link]");
    state.nutritionGlanceLink = document.querySelector("[data-glance-nutrition-link]");
    state.nutritionForm = document.querySelector("[data-nutrition-form]");
    state.nutritionResetButton = document.querySelector("[data-nutrition-reset]");
    state.nutritionTargetsForm = document.querySelector("[data-nutrition-targets-form]");
    state.nutritionSummary = document.querySelector("[data-nutrition-summary]");
    state.nutritionList = document.querySelector("[data-nutrition-list]");
    state.nutritionStatus = document.querySelector("[data-nutrition-status]");
    state.passwordStatus = document.querySelector("[data-password-status]");
    state.metricsReportAutoPending = shouldAutoOpenMetricReport();
    state.editToggleButton = document.querySelector("[data-profile-edit-toggle]");
    state.editorSection = document.querySelector("[data-profile-editor]");
    state.sportOverviewEditor = document.querySelector("[data-sport-overview-editor]");
    state.sportOverviewSummary = document.querySelector("[data-sport-overview-summary]");

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

      configureCoachView()
        .then(function (ok) {
          if (ok === false) {
            return;
          }

          loadDashboard();
          setupFormHandlers();
        })
        .catch(function (error) {
          showError(error && error.message ? error.message : "Could not load athlete view.");
        });
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      if (!session) {
        redirectToHome();
      }
    });
  }

  function configureCoachView() {
    if (!state.user) {
      return Promise.resolve(false);
    }

    state.viewUser = state.user;

    var params;
    try {
      params = new URLSearchParams(window.location.search || "");
    } catch (e) {
      return Promise.resolve(true);
    }

    var wantsCoachView = params.get("coachView") === "1";
    var athleteId = String(params.get("athleteId") || "").trim();
    var isAdminUser =
      !!state.user.email && String(state.user.email).toLowerCase() === ADMIN_EMAIL;

    if (isAdminUser && (!wantsCoachView || !athleteId)) {
      window.location.href = "admin.html";
      return Promise.resolve(false);
    }

    if (!wantsCoachView || !athleteId) {
      return Promise.resolve(true);
    }

    if (!isAdminUser) {
      return Promise.reject(new Error("Coach view is only available to admin accounts."));
    }

    state.isCoachView = true;
    state.viewedAthleteId = athleteId;

    return state.client
      .from("admin_all_users")
      .select("user_id,email,user_created_at,last_sign_in_at")
      .eq("user_id", athleteId)
      .single()
      .then(function (result) {
        if (result.error || !result.data) {
          throw new Error("Athlete was not found for this coach view link.");
        }

        state.viewUser = {
          id: result.data.user_id,
          email: result.data.email,
          created_at: result.data.user_created_at,
          last_sign_in_at: result.data.last_sign_in_at
        };

        return true;
      });
  }

  function loadDashboard() {
    if (!state.viewUser) {
      return;
    }

    hideGuard();
    showContent();
    renderWelcomeMessage();
    hideLegacyDashboardSections();
    renderDashboardCoachTasks();
    renderDashboardQuickGlanceDefaults();
    refreshAthleteDashboardAccess();
    applyCoachViewUi();
    configureGoalsLink();
    populateUserInfo();
    loadProfileData();
    loadMetricsData();
    loadCurrentTrainingProgram();
    loadOnboardingIntake();
    loadGoalItems();
    maybeShowFoundingPaymentStatus();
  }

  function hideLegacyDashboardSections() {
    [
      "#profile-nutrition-section",
      "#profile-strava-section",
      "#profile-wearables-section",
      ".profile-section-danger",
      "#profile-danger-section",
      "[data-section-collapse-content=\"danger\"]",
      "[data-section-collapse-content=\"strava\"]",
      "#profile-overview-section",
      "#profile-athlete-overview-section",
      "[data-profile-overview]",
      "[data-metrics-content]",
      "[data-metrics-editor]"
    ].forEach(function (selector) {
      var element = document.querySelector(selector);
      if (!element) {
        return;
      }

      element.hidden = true;
      element.style.display = "none";
      element.setAttribute("aria-hidden", "true");
    });
  }

  function refreshAthleteDashboardAccess() {
    var previous = state.dashboardAccessContext || null;
    var next = computeAthleteDashboardAccessContext();
    state.dashboardAccessContext = next;

    applyAthleteDashboardAccessUi(next);
    renderProfileTierBadge();

    var previousCalendar = previous && previous.features ? !!previous.features.workoutCalendar : null;
    var nextCalendar = next && next.features ? !!next.features.workoutCalendar : false;

    if (previousCalendar !== null && previousCalendar !== nextCalendar) {
      refreshTrainingProgramsCalendarFromState();
    }
  }

  function hasCompletedMembershipPayment(onboardingRow) {
    var row = onboardingRow && onboardingRow.is_founding_member === true ? onboardingRow : null;
    var subscription = state.foundingSubscriptionRow || null;
    var completedPaymentTask = (state.onboardingAssignments || []).some(function (assignment) {
      return isPaymentTaskAssignment(assignment) && isAssignmentCompleted(assignment);
    });

    if (completedPaymentTask) {
      return true;
    }

    if (subscription) {
      var subscriptionStatus = String(subscription.status || "").toLowerCase();
      if (
        subscriptionStatus === "active" ||
        subscriptionStatus === "trialing" ||
        subscriptionStatus === "paid" ||
        subscriptionStatus === "completed" ||
        subscriptionStatus === "succeeded"
      ) {
        return true;
      }

      var lastEventType = String(subscription.last_event_type || "").toLowerCase();
      if (
        lastEventType === "invoice.payment_succeeded" ||
        lastEventType === "checkout.session.completed" ||
        lastEventType === "checkout.session.async_payment_succeeded"
      ) {
        return true;
      }
    }

    if (!row) {
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

  function isLikelyIndividualizedProgram(program) {
    if (!program || !program.is_active) {
      return false;
    }

    var name = String(
      (program.training_program && program.training_program.name) ||
      program.program_name ||
      ""
    ).toLowerCase();

    if (
      name.indexOf("custom") > -1 ||
      name.indexOf("individualized") > -1 ||
      name.indexOf("1:1") > -1 ||
      name.indexOf("1-1") > -1
    ) {
      return true;
    }

    var assignedBy = String(program.assigned_by || "").trim();
    var viewedUserId = String(getViewedUserId() || "").trim();
    return !!assignedBy && !!viewedUserId && assignedBy !== viewedUserId;
  }

  function resolveAthleteAccountTier() {
    var activePrograms = (state.trainingProgramsCache || []).filter(function (program) {
      return !!(program && program.is_active);
    });

    var hasActiveProgram = activePrograms.length > 0;
    var hasIndividualizedProgramming = activePrograms.some(isLikelyIndividualizedProgram);
    var hasMembership = hasCompletedMembershipPayment(state.foundingOnboardingRow);

    if (hasIndividualizedProgramming) {
      return {
        key: "individualized",
        label: "Individualized Programming",
        toneClass: "is-tier-individualized"
      };
    }

    if (hasActiveProgram) {
      return {
        key: "active_program",
        label: "Active Program",
        toneClass: "is-tier-program"
      };
    }

    if (hasMembership) {
      return {
        key: "active_member",
        label: "Active Membership",
        toneClass: "is-tier-member"
      };
    }

    return {
      key: "athlete",
      label: "Athlete Account",
      toneClass: "is-tier-athlete"
    };
  }

  function renderProfileTierBadge() {
    if (!state.profileTierBadgeEl) {
      return;
    }

    var tier = resolveAthleteAccountTier();
    state.accountTier = tier;

    var badge = state.profileTierBadgeEl;
    badge.hidden = false;
    badge.textContent = tier.label;
    badge.classList.remove("is-tier-member", "is-tier-individualized", "is-tier-program", "is-tier-athlete");
    if (tier.toneClass) {
      badge.classList.add(tier.toneClass);
    }
    badge.setAttribute("data-tier", String(tier.key || "athlete"));

    if (state.contentElement) {
      state.contentElement.setAttribute("data-account-tier", String(tier.key || "athlete"));
    }
  }

  function computeAthleteDashboardAccessContext() {
    if (state.isCoachView) {
      return {
        mode: "coach_view",
        fullFeatureAccess: true,
        features: {
          compass: true,
          workoutCalendar: true,
          messaging: true,
          browsePrograms: true
        },
        reason: ""
      };
    }

    var activePrograms = (state.trainingProgramsCache || []).filter(function (program) {
      return !!(program && program.is_active);
    });

    var assignments = (state.onboardingAssignments || []).filter(function (assignment) {
      return !!assignment && String(assignment.status || "").toLowerCase() !== "archived";
    });

    var pendingLiability = assignments.filter(function (assignment) {
      return isLiabilityTaskAssignment(assignment) && !isAssignmentCompleted(assignment);
    });

    var paymentAssignments = assignments.filter(function (assignment) {
      return isPaymentTaskAssignment(assignment);
    });

    var onboardingFormAssignments = assignments.filter(function (assignment) {
      return isOnboardingFormAssignment(assignment);
    });

    var hasPaymentTask = paymentAssignments.length > 0;
    var hasPendingPaymentTask = paymentAssignments.some(function (assignment) {
      return !isAssignmentCompleted(assignment);
    });
    var hasCompletedPaymentTask = paymentAssignments.some(function (assignment) {
      return isAssignmentCompleted(assignment);
    });

    var founding = state.foundingOnboardingRow && state.foundingOnboardingRow.is_founding_member === true
      ? state.foundingOnboardingRow
      : null;
    var foundingPaymentComplete = hasCompletedMembershipPayment(founding);

    if (founding) {
      if (!foundingPaymentComplete) {
        return {
          mode: "limited",
          fullFeatureAccess: false,
          features: {
            compass: false,
            workoutCalendar: false,
            messaging: false,
            browsePrograms: true
          },
          reason: "Complete assigned liability forms and membership payment to unlock coaching features."
        };
      }

      return {
        mode: "full",
        fullFeatureAccess: true,
        features: {
          compass: true,
          workoutCalendar: true,
          messaging: true,
          browsePrograms: true
        },
        reason: ""
      };
    }

    if (pendingLiability.length) {
      return {
        mode: "limited",
        fullFeatureAccess: false,
        features: {
          compass: false,
          workoutCalendar: false,
          messaging: false,
          browsePrograms: false
        },
        reason: "Complete assigned liability forms to continue setup."
      };
    }

    if (hasPaymentTask && hasPendingPaymentTask) {
      return {
        mode: "limited",
        fullFeatureAccess: false,
        features: {
          compass: false,
          workoutCalendar: false,
          messaging: false,
          browsePrograms: true
        },
        reason: "Complete your payment task to unlock coaching features."
      };
    }

    if (hasPaymentTask && hasCompletedPaymentTask) {
      return {
        mode: "full",
        fullFeatureAccess: true,
        features: {
          compass: true,
          workoutCalendar: true,
          messaging: true,
          browsePrograms: true
        },
        reason: ""
      };
    }

    if (activePrograms.length) {
      return {
        mode: "premade_program_only",
        fullFeatureAccess: false,
        features: {
          compass: false,
          workoutCalendar: false,
          messaging: false,
          browsePrograms: true
        },
        reason: "Program-only access: membership features unlock after coach-guided onboarding and payment."
      };
    }

    return {
      mode: "limited",
      fullFeatureAccess: false,
      features: {
        compass: false,
        workoutCalendar: false,
        messaging: false,
        browsePrograms: true
      },
      reason: "Welcome. Complete assigned tasks to unlock full dashboard features."
    };
  }

  function applyAthleteDashboardAccessUi(context) {
    if (!context || state.isCoachView) {
      return;
    }

    if (state.dashboardCompassSection) {
      state.dashboardCompassSection.hidden = !context.features.compass;
    }

    if (state.dashboardMessagesLabelEl) {
      state.dashboardMessagesLabelEl.hidden = !context.features.messaging;
    }

    if (state.dashboardMessagesUnreadEl) {
      state.dashboardMessagesUnreadEl.hidden = !context.features.messaging;
    }

    (state.dashboardMessageLinks || []).forEach(function (link) {
      if (!link) {
        return;
      }

      if (context.features.messaging) {
        link.hidden = false;
        link.removeAttribute("aria-hidden");
        link.style.display = "";
      } else {
        link.hidden = true;
        link.setAttribute("aria-hidden", "true");
        link.style.display = "none";
      }
    });

    if (state.dashboardKickerEl) {
      state.dashboardKickerEl.textContent = context.features.compass
        ? "Nomadic Performance Compass"
        : "Athlete Dashboard";
    }

    if (state.dashboardCopyEl) {
      if (context.mode === "full") {
        state.dashboardCopyEl.textContent = "Your current training context, coaching updates, and next steps at a glance.";
      } else if (context.mode === "premade_program_only") {
        state.dashboardCopyEl.textContent = "You can access your purchased program here. Compass, calendar, and messaging unlock with membership onboarding.";
      } else {
        state.dashboardCopyEl.textContent = context.reason || "Complete assigned setup tasks to unlock full dashboard features.";
      }
    }
  }

  function isAssignmentCompleted(assignment) {
    var status = String(assignment && assignment.status || "").toLowerCase();
    return status === "submitted" || status === "archived";
  }

  function isLiabilityTaskAssignment(assignment) {
    var formId = String(assignment && assignment.form_id || "").toLowerCase();
    var name = String(assignment && assignment.form_name || "").toLowerCase();
    var description = String(assignment && assignment.form_schema && assignment.form_schema.description || "").toLowerCase();
    var combined = formId + " " + name + " " + description;

    return (
      combined.indexOf("liability") > -1 ||
      combined.indexOf("waiver") > -1 ||
      combined.indexOf("release") > -1 ||
      combined.indexOf("consent") > -1
    );
  }

  function isPaymentTaskAssignment(assignment) {
    var formId = String(assignment && assignment.form_id || "").toLowerCase();
    var name = String(assignment && assignment.form_name || "").toLowerCase();
    var description = String(assignment && assignment.form_schema && assignment.form_schema.description || "").toLowerCase();
    var actionUrl = String(assignment && assignment.form_schema && assignment.form_schema.action_url || "").toLowerCase();
    var combined = formId + " " + name + " " + description + " " + actionUrl;

    if (
      formId === MEMBERSHIP_PAYMENT_TASK_FORM_ID ||
      formId.indexOf("membership-payment") > -1 ||
      formId.indexOf("membership_payment") > -1 ||
      formId.indexOf("founding-payment") > -1
    ) {
      return true;
    }

    if (actionUrl.indexOf("founding-member.html") > -1 && actionUrl.indexOf("checkout=start") > -1) {
      return true;
    }

    return (
      combined.indexOf("payment") > -1 ||
      combined.indexOf("membership payment") > -1 ||
      (combined.indexOf("membership") > -1 && combined.indexOf("checkout") > -1) ||
      (combined.indexOf("membership") > -1 && combined.indexOf("subscription") > -1) ||
      combined.indexOf("checkout") > -1 ||
      combined.indexOf("invoice") > -1 ||
      combined.indexOf("pay membership") > -1
    );
  }

  function isMembershipPaymentTaskAssignment(assignment) {
    if (!assignment) {
      return false;
    }

    var formId = String(assignment.form_id || "").toLowerCase();
    var name = String(assignment.form_name || "").toLowerCase();
    var description = String(assignment.form_schema && assignment.form_schema.description || "").toLowerCase();
    var actionUrl = String(assignment.form_schema && assignment.form_schema.action_url || "").toLowerCase();

    if (
      formId === MEMBERSHIP_PAYMENT_TASK_FORM_ID ||
      formId.indexOf("membership-payment") > -1 ||
      formId.indexOf("founding-payment") > -1
    ) {
      return true;
    }

    if (actionUrl.indexOf("founding-member.html") > -1 && actionUrl.indexOf("checkout=start") > -1) {
      return true;
    }

    return (
      name.indexOf("complete membership payment") > -1 ||
      (name.indexOf("membership") > -1 && name.indexOf("payment") > -1) ||
      (description.indexOf("membership") > -1 && description.indexOf("payment") > -1)
    );
  }

  function maybeReconcileCompletedMembershipPaymentTasks() {
    if (state.isCoachView || !state.client || !getViewedUserId()) {
      return;
    }

    var hasCompletedPayment = hasCompletedMembershipPayment(state.foundingOnboardingRow);
    if (!hasCompletedPayment) {
      return;
    }

    if (state.paymentTaskReconcileInFlight) {
      return;
    }

    var stalePaymentTasks = (state.onboardingAssignments || []).filter(function (assignment) {
      if (!assignment) {
        return false;
      }

      if (!isMembershipPaymentTaskAssignment(assignment) && !isPaymentTaskAssignment(assignment)) {
        return false;
      }

      var status = String(assignment.status || "").toLowerCase();
      return status !== "submitted" && status !== "archived";
    });

    if (!stalePaymentTasks.length) {
      return;
    }

    var athleteId = String(getViewedUserId() || "").trim();
    var reconcileKey = athleteId + ":" + String(stalePaymentTasks.length);
    if (state.paymentTaskReconcileTouchedKey === reconcileKey) {
      return;
    }

    state.paymentTaskReconcileInFlight = true;
    state.paymentTaskReconcileTouchedKey = reconcileKey;

    var staleIds = stalePaymentTasks.map(function (assignment) {
      return String(assignment.id || "").trim();
    }).filter(Boolean);

    var completionIso = new Date().toISOString();
    state.client
      .from("athlete_onboarding_intake_assignments")
      .update({
        status: "submitted",
        submitted_at: completionIso,
        updated_at: completionIso
      })
      .in("id", staleIds)
      .eq("athlete_user_id", athleteId)
      .then(function (result) {
        if (result.error) {
          return;
        }

        state.onboardingAssignments = (state.onboardingAssignments || []).map(function (assignment) {
          if (!assignment || staleIds.indexOf(String(assignment.id || "").trim()) === -1) {
            return assignment;
          }

          return Object.assign({}, assignment, {
            status: "submitted",
            submitted_at: completionIso,
            updated_at: completionIso
          });
        });

        renderOnboardingAssignments();
      })
      .catch(function () {
        // noop
      })
      .finally(function () {
        state.paymentTaskReconcileInFlight = false;
      });
  }

  function isOnboardingFormAssignment(assignment) {
    if (!assignment) {
      return false;
    }

    if (isLiabilityTaskAssignment(assignment) || isPaymentTaskAssignment(assignment)) {
      return false;
    }

    var category = getCoachAssignmentCategory(assignment);
    return category === "onboarding" || category === "form";
  }

  function applyCoachViewUi() {
    if (!state.isCoachView) {
      if (state.onboardingCoachActions) {
        state.onboardingCoachActions.hidden = true;
      }
      return;
    }

    var heading = document.querySelector(".section-heading");
    var subtitle = document.querySelector("[data-profile-dashboard-copy]");
    var headingRow = document.querySelector(".profile-dashboard-heading-row");
    var resetBtn = document.querySelector("[data-profile-reset-password]");
    var deleteSection = document.querySelector(".profile-section-danger");
    var emailField = state.form ? state.form.querySelector("[name='email']") : null;

    if (heading) {
      heading.textContent = "Athlete Profile";
    }

    if (subtitle) {
      subtitle.textContent = "Coach view: review and edit this athlete's profile and metrics.";
    }

    var stravaCopy = document.querySelector("#profile-strava-section .profile-section-copy");
    if (stravaCopy) {
      stravaCopy.textContent = "Coach view: monitor this athlete's latest Strava and Whoop sync status and summary metrics.";
    }

    if (headingRow && !headingRow.querySelector("[data-coach-back-link]")) {
      var backLink = document.createElement("a");
      backLink.className = "btn profile-btn-cancel";
      backLink.href = "admin.html";
      backLink.textContent = "Back to Coaching Dashboard";
      backLink.setAttribute("data-coach-back-link", "1");
      headingRow.appendChild(backLink);
    }

    if (resetBtn) {
      resetBtn.style.display = "none";
    }

    if (deleteSection) {
      deleteSection.style.display = "none";
    }

    if (emailField) {
      emailField.disabled = true;
      emailField.title = "Email changes are disabled in coach view.";
    }

    if (state.goalsManageLink) {
      state.goalsManageLink.style.display = "none";
    }

    if (state.nutritionManageLink) {
      state.nutritionManageLink.style.display = "";
      state.nutritionManageLink.textContent = "View Nutrition Log";
    }

    if (state.onboardingCoachActions) {
      state.onboardingCoachActions.hidden = false;
    }

    renderCoachTaskFilterControls();

    if (state.nutritionGoalsLink) {
      state.nutritionGoalsLink.style.display = "";
      state.nutritionGoalsLink.textContent = "Set Nutrition Goals";
    }
  }

  function configureNutritionLink() {
    if (!state.nutritionManageLink && !state.nutritionGoalsLink && !state.nutritionGlanceLink) {
      return;
    }

    var viewedUserId = getViewedUserId();
    if (!viewedUserId) {
      return;
    }

    var logHref = "athlete-nutrition.html?athleteId=" + encodeURIComponent(viewedUserId);
    var goalsHref = "athlete-nutrition-goals.html?athleteId=" + encodeURIComponent(viewedUserId);
    if (state.isCoachView) {
      logHref += "&coachView=1";
      goalsHref += "&coachView=1";
      if (state.nutritionManageLink) {
        state.nutritionManageLink.textContent = "View Nutrition Log";
      }
      if (state.nutritionGoalsLink) {
        state.nutritionGoalsLink.textContent = "Set Nutrition Goals";
      }
    } else {
      if (state.nutritionManageLink) {
        state.nutritionManageLink.textContent = "Log Food";
      }
      if (state.nutritionGoalsLink) {
        state.nutritionGoalsLink.textContent = "Nutrition Goals";
      }
    }

    if (state.nutritionManageLink) {
      state.nutritionManageLink.href = logHref;
      state.nutritionManageLink.style.display = "";
    }

    if (state.nutritionGoalsLink) {
      state.nutritionGoalsLink.href = goalsHref;
      state.nutritionGoalsLink.style.display = "";
    }

    if (state.nutritionGlanceLink) {
      state.nutritionGlanceLink.href = logHref;
      state.nutritionGlanceLink.textContent = state.isCoachView ? "View Log" : "Log Food";
    }
  }

  function configureGoalsLink() {
    var href = getGoalsPageHref();

    if (state.goalsManageLink) {
      state.goalsManageLink.href = href;
    }

    if (state.goalsGlanceLink) {
      state.goalsGlanceLink.href = href;
      state.goalsGlanceLink.textContent = state.isCoachView ? "View Goals" : "Manage Goals";
    }
  }

  function getGoalsPageHref() {
    var viewedUserId = getViewedUserId();
    if (!viewedUserId) {
      return "athlete-goals.html";
    }

    var href = "athlete-goals.html?athleteId=" + encodeURIComponent(viewedUserId);
    if (state.isCoachView) {
      href += "&coachView=1";
    }

    return href;
  }

  function populateUserInfo() {
    if (!state.viewUser) {
      return;
    }

    var emailEl = document.querySelector("[data-profile-email]");

    if (emailEl) {
      emailEl.textContent = state.viewUser.email || "—";
    }

    renderWelcomeMessage();
  }

  function renderWelcomeMessage() {
    if (!state.welcomeMessageEl) {
      return;
    }

    var displayName = getDashboardDisplayName();
    if (state.isCoachView) {
      state.welcomeMessageEl.textContent = "Viewing athlete: " + displayName;
      return;
    }

    state.welcomeMessageEl.textContent = "Welcome " + displayName;
  }

  function getDashboardDisplayName() {
    var fullName = String(state.profile && state.profile.name || "").trim();
    if (fullName) {
      return fullName;
    }

    var email = String(state.viewUser && state.viewUser.email || "").trim();
    if (email && email.indexOf("@") > 0) {
      return titleCaseWords(email.split("@")[0].replace(/[._-]+/g, " "));
    }

    return "Athlete";
  }

  function titleCaseWords(value) {
    return String(value || "")
      .split(/\s+/)
      .filter(function (part) { return !!part; })
      .map(function (part) {
        var lower = part.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join(" ");
  }

  function loadProfileData() {
    var viewedUserId = getViewedUserId();
    if (!viewedUserId) {
      return;
    }

    setStatus("Loading athlete info...", "info");

    state.client
      .from("athlete_profiles")
      .select("*")
      .eq("user_id", viewedUserId)
      .single()
      .then(function (result) {
        if (result.error && result.error.code !== "PGRST116") {
          setStatus(result.error.message, "error");
          return;
        }

        if (result.data) {
          state.profile = mergeLocalSportProfile(result.data);
          populateForm(state.profile);
          refreshTrainingProgramsCalendarFromState();
        } else {
          state.profile = mergeLocalSportProfile(null);
          if (state.profile) {
            populateForm(state.profile);
            refreshTrainingProgramsCalendarFromState();
          } else {
            updateHero(null);
          }
        }

        clearStatus();
      })
      .catch(function () {
        clearStatus();
      });
  }

  function populateForm(profile) {
    if (!state.form) {
      return;
    }

    var nameField = state.form.querySelector("[name='name']");
    var emailField = state.form.querySelector("[name='email']");
    var bioField = state.form.querySelector("[name='bio']");
    var ageField = state.form.querySelector("[name='age']");
    var locationField = state.form.querySelector("[name='location']");
    var heightField = state.form.querySelector("[name='height_cm']");
    var armSpanField = state.form.querySelector("[name='arm_span_cm']");
    var weightField = state.form.querySelector("[name='weight_kg']");
    var sexField = state.form.querySelector("[name='sex']");

    if (emailField) emailField.value = (state.viewUser && state.viewUser.email) || "";
    if (nameField) nameField.value = profile && profile.name ? profile.name : "";
    if (bioField) bioField.value = profile && profile.bio ? profile.bio : "";
    if (ageField) ageField.value = profile && profile.age ? profile.age : "";
    if (locationField) locationField.value = profile && profile.location ? profile.location : "";
    if (heightField) heightField.value = profile && profile.height_cm ? profile.height_cm : "";
    if (armSpanField) armSpanField.value = profile && profile.arm_span_cm ? profile.arm_span_cm : "";
    if (weightField) weightField.value = profile && profile.weight_kg ? profile.weight_kg : "";
    if (sexField) sexField.value = getProfileSexForFormValue(profile);

    var sports = getProfileSports(profile);
    setSelectedSportsInForm(sports);
    renderSportOverviewEditor(sports, getProfileSportOverview(profile));

    updateHero(profile);
  }

  function updateHero(profile) {
    var sportEl = document.querySelector("[data-hero-sport]");
    var locationEl = document.querySelector("[data-hero-location]");
    var dobAgeEl = document.querySelector("[data-profile-dob-age]");

    var sports = getProfileSports(profile);
    if (sportEl) sportEl.textContent = formatSportsDisplay(sports);
    if (locationEl) locationEl.textContent = normalizeDisplayValue(profile && profile.location);
    if (dobAgeEl) dobAgeEl.textContent = formatDobAgeDisplay(profile);

    renderWelcomeMessage();

    renderSportOverviewSummary(profile);
  }

  function formatDobAgeDisplay(profile) {
    if (!profile) {
      return "—";
    }

    var dob = getProfileDobValue(profile);
    var age = calculateAgeFromDob(dob);
    if (age == null) {
      age = parseInt(profile.age || 0, 10) || null;
    }

    if (dob && age != null) {
      return "DOB: " + dob + " | Age: " + age;
    }

    if (dob) {
      return "DOB: " + dob;
    }

    if (age != null) {
      return "Age: " + age;
    }

    return "—";
  }

  function getProfileDobValue(profile) {
    var overview = getProfileSportOverview(profile);
    var general = overview && overview.general && typeof overview.general === "object"
      ? overview.general
      : {};
    var raw = profile && (
      profile.dob ||
      profile.date_of_birth ||
      profile.birth_date ||
      general.date_of_birth ||
      general.dob
    );
    if (!raw) {
      return "";
    }

    var value = String(raw).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    var parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      return "";
    }

    var yyyy = parsed.getFullYear();
    var mm = String(parsed.getMonth() + 1).padStart(2, "0");
    var dd = String(parsed.getDate()).padStart(2, "0");
    return yyyy + "-" + mm + "-" + dd;
  }

  function calculateAgeFromDob(dobText) {
    var dob = String(dobText || "").trim();
    if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      return null;
    }

    var birth = new Date(dob + "T00:00:00");
    if (isNaN(birth.getTime())) {
      return null;
    }

    var today = new Date();
    var age = today.getFullYear() - birth.getFullYear();
    var hasBirthdayPassed =
      today.getMonth() > birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());

    if (!hasBirthdayPassed) {
      age -= 1;
    }

    if (age < 0 || age > 120) {
      return null;
    }

    return age;
  }

  function loadMetricsData() {
    var viewedUserId = getViewedUserId();
    if (!viewedUserId || !state.client || !state.metricsList) {
      return;
    }

    state.metricsList.innerHTML = '<p class="profile-loading">Loading metrics...</p>';

    state.client
      .from("athlete_metrics")
      .select("*")
      .eq("user_id", viewedUserId)
      .order("updated_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          if (isMissingRelationError(result.error)) {
            state.metrics = [];
            state.metricsLatest = [];
            renderMetricsCards();
            seedMetricRowsFromSport();
            setMetricsStatus(
              "Metrics table not found yet. Ask your coach/admin to create athlete_metrics to enable saving.",
              "info"
            );
            return;
          }

          setMetricsStatus(result.error.message, "error");
          return;
        }

        state.metrics = Array.isArray(result.data) ? result.data : [];
        state.metricsLatest = getLatestMetrics(state.metrics);
        renderMetricsCards();
        renderMetricRowsFromData(state.metricsLatest);
        maybeAutoOpenMetricReport();
      })
      .catch(function (error) {
        setMetricsStatus(error && error.message ? error.message : "Failed to load metrics.", "error");
      });
  }

  function renderMetricsCards() {
    if (!state.metricsList) {
      return;
    }

    if (!state.metricsLatest.length) {
      state.metricsList.innerHTML =
        '<div class="profile-empty-state metrics-empty">' +
        '<p class="profile-empty-state-title">No metrics recorded yet</p>' +
        '<p class="profile-empty-state-copy">Add your first baseline metric, or ask your coach to assign sport-specific tests.</p>' +
        (!state.isCoachView
          ? '<a class="btn profile-btn-edit-profile" href="metrics-editor.html?athleteId=' + encodeURIComponent(getViewedUserId() || "") + '&athleteName=' + encodeURIComponent((state.profile && state.profile.name) || (state.viewUser && state.viewUser.email) || "Athlete") + '&personal=true">Add Baseline Metrics</a>'
          : '') +
        "</div>";
      return;
    }

    var cards = state.metricsLatest
      .map(function (metric) {
        var metricKey = getMetricKey(metric);
        var name = escapeHtml(metric.metric_name || "Metric");
        var frontValueHtml = buildMetricFrontValueHtml(metric);
        var category = escapeHtml(metric.metric_category || "Performance");
        var updated = metric.updated_at ? formatDate(metric.updated_at) : "—";
        var trend = getMetricTrend(metric);
        var trendClass = trend && trend.delta > 0 ? "is-up" : trend && trend.delta < 0 ? "is-down" : "is-neutral";
        var trendText = trend
          ? (trend.delta > 0 ? "Up " : trend.delta < 0 ? "Down " : "No change ") +
            trend.deltaLabel +
            " vs last test"
          : "Baseline recorded";
        var historyPoints = (metric._history || [])
          .slice(0, 4)
          .reverse()
          .map(function (entry) {
            var entryValue = escapeHtml(entry.metric_value || "—");
            var entryDate = escapeAttribute(formatDate(entry.updated_at || ""));
            return '<span class="metric-history-point" title="' + entryDate + '">' + entryValue + "</span>";
          })
          .join("");

        return (
          '<article class="metric-card" data-metric-key="' + escapeAttribute(metricKey) + '">' +
          '<div class="metric-card-inner">' +
          '<div class="metric-card-face metric-card-front">' +
          '<div class="metric-card-body">' +
          '<span class="metric-category">' + category + "</span>" +
          '<h3 class="metric-name">' + name + "</h3>" +
          '<p class="metric-value">' + frontValueHtml + "</p>" +
          '<p class="metric-trend ' + trendClass + '">' + trendText + "</p>" +
          (historyPoints ? '<div class="metric-history-row">' + historyPoints + "</div>" : "") +
          '</div>' +
          '<div class="metric-card-footer">' +
          '<p class="metric-updated">Updated ' + updated + "</p>" +
          '<div class="metric-card-actions">' +
          '<button type="button" class="metric-card-btn" data-metric-action="benchmark" data-metric-name="' +
          escapeAttribute(metric.metric_name || "") +
          '" data-metric-unit="' +
          escapeAttribute(metric.metric_unit || "") +
          '">Benchmarks</button>' +
          '<button type="button" class="metric-card-btn" data-metric-action="edit" data-metric-name="' +
          escapeAttribute(metric.metric_name || "") +
          '" data-metric-unit="' +
          escapeAttribute(metric.metric_unit || "") +
          '">Edit</button>' +
          '<button type="button" class="metric-card-btn" data-metric-action="test" data-metric-name="' +
          escapeAttribute(metric.metric_name || "") +
          '" data-metric-unit="' +
          escapeAttribute(metric.metric_unit || "") +
          '">+ Test</button>' +
          "</div>" +
          "</div>" +
          "</div>" +
          '<div class="metric-card-face metric-card-back">' +
          '<div class="metric-flip-label" data-metric-flip-label>Edit Metric</div>' +
          '<div class="metric-benchmark" data-metric-benchmark>' +
          '<p class="metric-benchmark-value" data-benchmark-value></p>' +
          '<p class="metric-benchmark-rating" data-benchmark-rating></p>' +
          '<p class="metric-benchmark-range" data-benchmark-range></p>' +
          '<p class="metric-benchmark-meaning" data-benchmark-meaning></p>' +
          '<p class="metric-benchmark-note">Benchmarks are general guideposts and should be interpreted with sport context, injury history, and coaching judgment.</p>' +
          '</div>' +
          '<div class="metric-flip-grid">' +
          '<input type="text" data-metric-edit="name" placeholder="Metric name" value="' + escapeAttribute(metric.metric_name || "") + '" />' +
          '<input type="text" data-metric-edit="value" placeholder="Test value" value="' + escapeAttribute(metric.metric_value || "") + '" />' +
          '<div class="metric-ybalance-grid" data-metric-ybalance-grid hidden>' +
          '<input type="text" data-metric-edit="left" placeholder="L Leg" />' +
          '<input type="text" data-metric-edit="right" placeholder="R Leg" />' +
          '<input type="text" data-metric-edit="symmetry" placeholder="Symmetry" readonly />' +
          '</div>' +
           '<div class="metric-grant-grid" data-metric-grant-grid hidden>' +
           '<input type="text" data-metric-edit="left" placeholder="L Leg" />' +
           '<input type="text" data-metric-edit="right" placeholder="R Leg" />' +
           '</div>' +
          '<input type="text" data-metric-edit="unit" placeholder="Unit" value="' + escapeAttribute(metric.metric_unit || "") + '" />' +
          '<input type="text" data-metric-edit="category" placeholder="Category" value="' + escapeAttribute(metric.metric_category || "Performance") + '" />' +
          '<p class="metric-input-note" data-leglength-estimate-note hidden>Norm note: For Y Balance and Adapted Grant Foot Raise, leg length is estimated as height x 0.53 when direct leg length is not provided.</p>' +
          "</div>" +
          '<div class="metric-card-actions metric-card-actions-back metric-card-actions-benchmark">' +
          '<button type="button" class="metric-card-btn" data-metric-flip-close>Close</button>' +
          '</div>' +
          '<div class="metric-card-actions metric-card-actions-back">' +
          '<button type="button" class="metric-card-btn metric-card-btn-danger" data-metric-flip-delete>Delete Metric</button>' +
          '<button type="button" class="metric-card-btn" data-metric-flip-cancel>Cancel</button>' +
          '<button type="button" class="metric-card-btn metric-card-btn-primary" data-metric-flip-save>Save</button>' +
          "</div>" +
          "</div>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    state.metricsList.innerHTML = '<div class="metrics-grid">' + cards + "</div>";
  }

  function renderMetricRowsFromData(metrics) {
    if (!state.metricsRows) {
      return;
    }

    state.metricsRows.innerHTML = "";

    if (metrics && metrics.length) {
      metrics.forEach(function (metric) {
        appendMetricRow({
          name: metric.metric_name || "",
          value: metric.metric_value || "",
          unit: metric.metric_unit || "",
          category: metric.metric_category || ""
        });
      });
      return;
    }

    seedMetricRowsFromSport();
  }

  function seedMetricRowsFromSport() {
    var sports = getSelectedSportsFromForm();
    if (!sports.length) {
      sports = getProfileSports(state.profile);
    }

    var sport = sports[0] || (state.profile && state.profile.sport);
    var templates = state.metricTemplatesBySport[sport] || ["Resting HR", "Max HR", "Vertical Jump"];

    templates.slice(0, 3).forEach(function (name) {
      appendMetricRow({ name: name, value: "", unit: "", category: "Performance" });
    });
  }

  function appendMetricRow(values) {
    if (!state.metricsRows) {
      return;
    }

    var row = document.createElement("div");
    row.className = "metric-row";

    row.innerHTML =
      '<input type="text" data-metric-name placeholder="Metric name" value="' +
      escapeAttribute(values && values.name) +
      '" />' +
      '<input type="text" data-metric-value placeholder="Value" value="' +
      escapeAttribute(values && values.value) +
      '" />' +
      '<input type="text" data-metric-unit placeholder="Unit (bpm, kg, cm)" value="' +
      escapeAttribute(values && values.unit) +
      '" />' +
      '<input type="text" data-metric-category placeholder="Category" value="' +
      escapeAttribute(values && values.category) +
      '" />' +
      '<button type="button" class="metric-row-remove" data-metric-remove aria-label="Remove metric">Remove</button>';

    state.metricsRows.appendChild(row);
  }

  function setupFormHandlers() {
    if (state.editToggleButton) {
      state.editToggleButton.addEventListener("click", onEditProfileClick);
    }

    if (state.form) {
      state.form.addEventListener("submit", onProfileSubmit);
    }

    var cancelBtn = document.querySelector("[data-profile-cancel]");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", function (event) {
        event.preventDefault();
        loadProfileData();
        clearStatus();
      });
    }

    if (state.metricsForm) {
      state.metricsForm.addEventListener("submit", onMetricsSubmit);
    }

    if (state.metricsCollapseToggle) {
      state.metricsCollapseToggle.addEventListener("click", function () {
        toggleMetricsSection();
      });
    }

    if (state.metricsCompactToggle) {
      state.metricsCompactToggle.addEventListener("click", function () {
        toggleMetricsCompactMode();
      });
    }

    if (state.goalsToggleButton) {
      state.goalsToggleButton.addEventListener("click", function () {
        toggleGoalsListView();
      });
    }

    document.querySelectorAll("[data-section-collapse-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var section = String(btn.getAttribute("data-section-collapse-toggle") || "").trim();
        if (!section) {
          return;
        }
        toggleSectionCollapsed(section);
      });
    });

    if (state.metricsSummaryBtn) {
      state.metricsSummaryBtn.addEventListener("click", onGenerateMetricSummaryPdf);
    }

    if (state.nutritionTargetsForm) {
      state.nutritionTargetsForm.addEventListener("submit", onNutritionTargetsSubmit);
    }

    if (state.nutritionForm) {
      state.nutritionForm.addEventListener("submit", onNutritionLogSubmit);
    }

    if (state.nutritionResetButton) {
      state.nutritionResetButton.addEventListener("click", function () {
        resetNutritionLogForm(true);
      });
    }

    if (state.nutritionList) {
      state.nutritionList.addEventListener("click", function (event) {
        var deleteBtn = event.target && event.target.closest("[data-nutrition-delete]");
        if (!deleteBtn) {
          return;
        }

        onNutritionLogDelete(
          String(deleteBtn.getAttribute("data-nutrition-delete") || ""),
          String(deleteBtn.getAttribute("data-nutrition-date") || "")
        );
      });
    }

    if (state.dashboardTaskBoard) {
      state.dashboardTaskBoard.addEventListener("click", onDashboardTaskBoardClick);
    }

    var manageMetricsBtn = document.querySelector("[data-metric-manage]");
    if (manageMetricsBtn) {
      manageMetricsBtn.addEventListener("click", function () {
        var viewedUserId = getViewedUserId();
        if (!viewedUserId) {
          alert("No athlete selected.");
          return;
        }

        var athleteName =
          (state.profile && state.profile.name) ||
          (state.viewUser && state.viewUser.email) ||
          "Athlete";

        var url = "metrics-editor.html?athleteId=" + encodeURIComponent(viewedUserId) +
                  "&athleteName=" + encodeURIComponent(athleteName);

        if (!state.isCoachView) {
          url += "&personal=true";
        }

        window.location.href = url;
      });
    }

    var cancelMetricsBtn = document.querySelector("[data-metrics-cancel]");
    if (cancelMetricsBtn) {
      cancelMetricsBtn.addEventListener("click", function (event) {
        event.preventDefault();
        renderMetricRowsFromData(state.metricsLatest);
        setMetricsStatus("", "info");
        if (state.metricsEditor && !state.metricsEditor.hidden) {
          toggleMetricsEditor();
        }
      });
    }

    if (state.metricsRows) {
      state.metricsRows.addEventListener("click", function (event) {
        if (event.target && event.target.matches("[data-metric-remove]")) {
          var row = event.target.closest(".metric-row");
          if (row) {
            row.remove();
          }
        }
      });
    }

    if (state.metricsList) {
      state.metricsList.addEventListener("click", function (event) {
        var deleteFlipBtn = event.target && event.target.closest("[data-metric-flip-delete]");
        if (deleteFlipBtn) {
          var deleteCard = deleteFlipBtn.closest(".metric-card");
          if (deleteCard) {
            deleteMetricFromFlippedCard(deleteCard);
          }
          return;
        }

        var cancelFlipBtn = event.target && event.target.closest("[data-metric-flip-cancel]");
        if (cancelFlipBtn) {
          var cancelCard = cancelFlipBtn.closest(".metric-card");
          if (cancelCard) {
            closeMetricCardEditor(cancelCard);
          }
          return;
        }

        var closeFlipBtn = event.target && event.target.closest("[data-metric-flip-close]");
        if (closeFlipBtn) {
          var closeCard = closeFlipBtn.closest(".metric-card");
          if (closeCard) {
            closeMetricCardEditor(closeCard);
          }
          return;
        }

        var saveFlipBtn = event.target && event.target.closest("[data-metric-flip-save]");
        if (saveFlipBtn) {
          var saveCard = saveFlipBtn.closest(".metric-card");
          if (saveCard) {
            saveMetricFromFlippedCard(saveCard);
          }
          return;
        }

        var actionBtn = event.target && event.target.closest("[data-metric-action]");
        if (!actionBtn) {
          return;
        }

        var action = actionBtn.getAttribute("data-metric-action");
        var metricName = String(actionBtn.getAttribute("data-metric-name") || "");
        var metricUnit = String(actionBtn.getAttribute("data-metric-unit") || "");
        var metric = findLatestMetricByNameUnit(metricName, metricUnit);
        if (!metric) {
          return;
        }

        if (action === "edit") {
          openMetricCardEditor(actionBtn.closest(".metric-card"), metric, "edit");
          return;
        }

        if (action === "test") {
          openMetricCardEditor(actionBtn.closest(".metric-card"), metric, "test");
          return;
        }

        if (action === "benchmark") {
          openMetricCardBenchmark(actionBtn.closest(".metric-card"), metric);
        }
      });

      state.metricsList.addEventListener("input", function (event) {
        var target = event && event.target;
        if (!target) {
          return;
        }

        var field = String(target.getAttribute("data-metric-edit") || "");
        if (field !== "left" && field !== "right" && field !== "unit" && field !== "name") {
          return;
        }

        var card = target.closest(".metric-card");
        if (!card) {
          return;
        }

         updateYBalanceDraftValue(card);
         updateSingleLegSquatDraftValue(card);
         updateSingleLegHeelRaiseDraftValue(card);
         updateSidePlankDraftValue(card);
         updateEdgePullDraftValue(card);
         updateGrantDraftValue(card);
        updateLegLengthEstimateNote(card);
      });
    }

    if (state.form) {
      state.form.addEventListener("change", function (event) {
        var target = event && event.target;
        if (!target || target.name !== "sports[]") {
          return;
        }

        var selectedSports = getSelectedSportsFromForm();
        var currentOverview = collectSportOverviewFromForm();
        renderSportOverviewEditor(selectedSports, currentOverview);

        if (!state.metrics.length && state.metricsRows && !state.metricsRows.children.length) {
          seedMetricRowsFromSport();
        }
      });
    }

    applyMetricsSectionPreference();
    applyMetricsCompactPreference();
    applySectionCollapsePreferences();
    applyGoalsListPreference();

    var resetPasswordBtn = document.querySelector("[data-profile-reset-password]");
    if (resetPasswordBtn) {
      resetPasswordBtn.addEventListener("click", onResetMyPassword);
    }

    var logoutBtn = document.querySelector("[data-profile-logout]");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", onLogout);
    }

    var trainingProgramContent = document.getElementById("profile-training-program-content");
    if (trainingProgramContent) {
      trainingProgramContent.addEventListener("click", function (event) {
        var calendarSessionLink = event.target && event.target.closest(".training-calendar-session");
        if (calendarSessionLink && Date.now() < (Number(state.calendarSuppressClickUntil) || 0)) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        var calendarPrevBtn = event.target && event.target.closest("[data-calendar-prev]");
        var calendarNextBtn = event.target && event.target.closest("[data-calendar-next]");
        var calendarTodayBtn = event.target && event.target.closest("[data-calendar-today]");
        if (calendarPrevBtn) {
          event.preventDefault();
          stepTrainingCalendarMonth(calendarPrevBtn, -1);
          return;
        }
        if (calendarNextBtn) {
          event.preventDefault();
          stepTrainingCalendarMonth(calendarNextBtn, 1);
          return;
        }
        if (calendarTodayBtn) {
          event.preventDefault();
          jumpTrainingCalendarToToday(calendarTodayBtn);
          return;
        }

        var completeBtn = event.target && event.target.closest("[data-complete-program]");
        var makeCurrentBtn = event.target && event.target.closest("[data-make-current-program]");
        var deletePastBtn = event.target && event.target.closest("[data-delete-past-program]");
        var changeBtn = event.target && event.target.closest("[data-change-active-program]");
        var assignBtn = event.target && event.target.closest("[data-assign-active-program]");
        var tabBtn = event.target && event.target.closest("[data-training-program-tab]");

        if (tabBtn) {
          setTrainingProgramsTab(trainingProgramContent, String(tabBtn.getAttribute("data-training-program-tab") || "current"));
          return;
        }

        if (completeBtn) {
          onCompleteProgram(String(completeBtn.getAttribute("data-complete-program") || ""));
          return;
        }

        if (makeCurrentBtn) {
          onMakeProgramCurrent(String(makeCurrentBtn.getAttribute("data-make-current-program") || ""));
          return;
        }

        if (deletePastBtn) {
          onDeletePastProgram(String(deletePastBtn.getAttribute("data-delete-past-program") || ""));
          return;
        }

        if (changeBtn) {
          onCustomizeProgramForAthlete();
          return;
        }

        if (assignBtn) {
          openCoachProgramModal();
          return;
        }
      });

      trainingProgramContent.addEventListener("dragstart", function (event) {
        var sessionEl = event.target && event.target.closest("[data-calendar-session-id]");
        if (!sessionEl || state.isCoachView) {
          return;
        }

        var sessionStatus = String(sessionEl.getAttribute("data-calendar-session-status") || "").toLowerCase();
        if (sessionStatus === "completed") {
          event.preventDefault();
          setTrainingProgramStatus("Completed workouts cannot be rescheduled by drag and drop.", "info");
          return;
        }

        var payload = {
          scheduleId: String(sessionEl.getAttribute("data-calendar-session-id") || ""),
          sourceDate: String(sessionEl.getAttribute("data-calendar-session-date") || ""),
          status: sessionStatus,
          label: String(sessionEl.getAttribute("data-calendar-session-label") || "Workout")
        };

        if (!payload.scheduleId || !payload.sourceDate) {
          event.preventDefault();
          return;
        }

        state.calendarDragPayload = payload;
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = "move";
          try {
            event.dataTransfer.setData("text/plain", JSON.stringify(payload));
          } catch (e) {
            // Some browsers can block custom drag payloads in strict contexts.
          }
        }
      });

      trainingProgramContent.addEventListener("dragover", function (event) {
        if (state.isCoachView) {
          return;
        }

        var dayEl = event.target && event.target.closest("[data-calendar-date]");
        if (!dayEl || dayEl.classList.contains("training-calendar-day-empty")) {
          return;
        }

        event.preventDefault();
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = "move";
        }
        dayEl.classList.add("is-drop-target");
      });

      trainingProgramContent.addEventListener("dragleave", function (event) {
        var dayEl = event.target && event.target.closest("[data-calendar-date]");
        if (!dayEl) {
          return;
        }

        var related = event.relatedTarget;
        if (related && dayEl.contains(related)) {
          return;
        }
        dayEl.classList.remove("is-drop-target");
      });

      trainingProgramContent.addEventListener("drop", function (event) {
        if (state.isCoachView) {
          return;
        }

        var dayEl = event.target && event.target.closest("[data-calendar-date]");
        if (!dayEl || dayEl.classList.contains("training-calendar-day-empty")) {
          return;
        }

        event.preventDefault();
        dayEl.classList.remove("is-drop-target");

        var targetDate = String(dayEl.getAttribute("data-calendar-date") || "");
        var payload = getCalendarDragPayloadFromEvent(event) || state.calendarDragPayload;
        state.calendarDragPayload = null;
        if (!payload || !payload.scheduleId || !targetDate) {
          return;
        }

        state.calendarSuppressClickUntil = Date.now() + 1200;
        onRescheduleCalendarSession(payload.scheduleId, targetDate, payload.sourceDate, payload.status, payload.label);
      });

      trainingProgramContent.addEventListener("dragend", function () {
        state.calendarDragPayload = null;
        trainingProgramContent.querySelectorAll(".training-calendar-day.is-drop-target").forEach(function (dayEl) {
          dayEl.classList.remove("is-drop-target");
        });
      });
    }

    if (state.onboardingContent) {
      state.onboardingContent.addEventListener("submit", function (event) {
        var formEl = event && event.target;
        if (!formEl || !formEl.matches("[data-onboarding-response-form]")) {
          return;
        }

        event.preventDefault();
        var assignmentId = String(formEl.getAttribute("data-assignment-id") || "").trim();
        if (!assignmentId) {
          setOnboardingStatus("Could not find intake assignment.", "error");
          return;
        }

        onSubmitOnboardingResponse(assignmentId, formEl);
      });

      state.onboardingContent.addEventListener("click", function (event) {
        var deleteTaskBtn = event.target && event.target.closest("[data-onboarding-delete-assignment]");
        if (deleteTaskBtn) {
          var deleteAssignmentId = String(deleteTaskBtn.getAttribute("data-onboarding-delete-assignment") || "").trim();
          if (!deleteAssignmentId) {
            setOnboardingStatus("Could not find task assignment.", "error");
            return;
          }

          onDeleteOnboardingAssignment(deleteAssignmentId);
          return;
        }

        var openFormBtn = event.target && event.target.closest("[data-onboarding-open-form]");
        if (openFormBtn) {
          var openAssignmentId = String(openFormBtn.getAttribute("data-onboarding-open-form") || "").trim();
          if (!openAssignmentId) {
            setOnboardingStatus("Could not find task assignment.", "error");
            return;
          }

          event.preventDefault();
          openAthleteTaskModalByAssignmentId(openAssignmentId);
          return;
        }

        var completeTaskBtn = event.target && event.target.closest("[data-onboarding-complete-task]");
        if (!completeTaskBtn) {
          return;
        }

        var assignmentId = String(completeTaskBtn.getAttribute("data-onboarding-complete-task") || "").trim();
        if (!assignmentId) {
          setOnboardingStatus("Could not find task assignment.", "error");
          return;
        }

        onMarkOnboardingTaskComplete(assignmentId);
      });
    }

    if (state.athleteTaskModal) {
      state.athleteTaskModal.addEventListener("submit", function (event) {
        var formEl = event && event.target;
        if (!formEl || !formEl.matches("[data-onboarding-response-form]")) {
          return;
        }

        event.preventDefault();
        var assignmentId = String(formEl.getAttribute("data-assignment-id") || "").trim();
        if (!assignmentId) {
          setAthleteTaskModalStatus("Could not find task assignment.", "error");
          return;
        }

        onSubmitOnboardingResponse(assignmentId, formEl);
      });

      state.athleteTaskModal.addEventListener("click", function (event) {
        var closeBtn = event.target && event.target.closest("[data-athlete-task-close]");
        if (!closeBtn) {
          return;
        }

        event.preventDefault();
        closeAthleteTaskModal();
      });
    }

    var coachIntakeOpenBtn = document.querySelector("[data-coach-intake-open]");
    if (coachIntakeOpenBtn) {
      coachIntakeOpenBtn.addEventListener("click", openCoachIntakeModal);
    }

    var coachTaskOpenBtn = document.querySelector("[data-coach-task-open]");
    if (coachTaskOpenBtn) {
      coachTaskOpenBtn.addEventListener("click", openCoachIntakeModal);
    }

    document.querySelectorAll("[data-coach-intake-close]").forEach(function (btn) {
      btn.addEventListener("click", closeCoachIntakeModal);
    });

    if (state.coachIntakeSearch) {
      state.coachIntakeSearch.addEventListener("input", function () {
        renderCoachIntakeTemplateList(String(state.coachIntakeSearch.value || ""));
      });
    }

    var coachIntakeAssignBtn = document.querySelector("[data-coach-intake-assign]");
    if (coachIntakeAssignBtn) {
      coachIntakeAssignBtn.addEventListener("click", onAssignIntakeToCurrentAthlete);
    }

    var coachTaskAssignBtn = document.querySelector("[data-coach-intake-assign-quick]");
    if (coachTaskAssignBtn) {
      coachTaskAssignBtn.addEventListener("click", onAssignQuickTaskToCurrentAthlete);
    }

    var coachTaskFilterEl = document.querySelector("[data-onboarding-coach-filter]");
    if (coachTaskFilterEl) {
      coachTaskFilterEl.addEventListener("click", function (event) {
        var filterBtn = event.target && event.target.closest("[data-onboarding-coach-filter-btn]");
        if (!filterBtn) {
          return;
        }

        var nextFilter = String(filterBtn.getAttribute("data-onboarding-coach-filter-btn") || "").trim().toLowerCase();
        if (nextFilter !== "active" && nextFilter !== "completed" && nextFilter !== "all") {
          return;
        }

        state.onboardingCoachTaskFilter = nextFilter;
        renderCoachTaskFilterControls();
        renderOnboardingAssignments();
      });
    }

    var coachProgramCloseButtons = document.querySelectorAll("[data-coach-program-close]");
    coachProgramCloseButtons.forEach(function (btn) {
      btn.addEventListener("click", closeCoachProgramModal);
    });

    var coachProgramSearch = document.querySelector("[data-coach-program-search]");
    if (coachProgramSearch) {
      coachProgramSearch.addEventListener("input", function () {
        renderCoachProgramTemplateList(String(coachProgramSearch.value || ""));
      });
    }

    var coachProgramAssignBtn = document.querySelector("[data-coach-program-assign]");
    if (coachProgramAssignBtn) {
      coachProgramAssignBtn.addEventListener("click", onAssignTemplateToCurrentAthlete);
    }

    document.addEventListener("keydown", function (event) {
      if (event && event.key === "Escape") {
        closeCoachProgramModal();
        closeCoachIntakeModal();
        closeAthleteTaskModal();
      }
    });
  }

  function onDashboardTaskBoardClick(event) {
    var actionEl = event.target && event.target.closest("[data-dashboard-action]");
    if (!actionEl) {
      return;
    }

    var action = String(actionEl.getAttribute("data-dashboard-action") || "");
    if (action === "remove-onboarding-assignment") {
      var deleteAssignmentId = String(actionEl.getAttribute("data-assignment-id") || "").trim();
      if (!deleteAssignmentId) {
        return;
      }

      event.preventDefault();
      onDeleteOnboardingAssignment(deleteAssignmentId);
      return;
    }

    if (action === "start-membership-checkout") {
      event.preventDefault();
      startMembershipCheckoutFromDashboard(actionEl);
      return;
    }

    if (action === "open-onboarding-form") {
      var assignmentId = String(actionEl.getAttribute("data-assignment-id") || "").trim();
      if (!assignmentId) {
        return;
      }

      event.preventDefault();
      openAthleteTaskModalByAssignmentId(assignmentId);
    }
  }

  function startMembershipCheckoutFromDashboard(actionEl) {
    var fallbackHref = String(actionEl && actionEl.getAttribute("href") || "founding-member.html?checkout=start");

    if (state.isCoachView) {
      window.location.href = fallbackHref;
      return;
    }

    if (!state.client || !state.client.functions) {
      window.location.href = fallbackHref;
      return;
    }

    setOnboardingStatus("Redirecting to secure checkout...", "info");

    var expectedUserId = String(getViewedUserId() || state.user && state.user.id || "").trim();
    var successUrl = window.location.origin + "/founding-payment-success.html" +
      (expectedUserId ? "?expected_user_id=" + encodeURIComponent(expectedUserId) : "");
    var cancelUrl = window.location.origin + "/founding-member.html?checkout=cancelled";

    state.client.functions
      .invoke("stripe-create-checkout", {
        body: {
          plan: "founding_member",
          source: "athlete_dashboard_task",
          email: state.user && state.user.email ? state.user.email : null,
          success_url: successUrl,
          cancel_url: cancelUrl
        }
      })
      .then(function (result) {
        if (result.error) {
          throw result.error;
        }

        var data = result.data || {};
        var checkoutUrl = String(data.url || "").trim();
        if (!checkoutUrl) {
          throw new Error("Checkout URL was not returned.");
        }

        window.location.href = checkoutUrl;
      })
      .catch(function () {
        setOnboardingStatus("Could not launch checkout directly. Redirecting to membership checkout page...", "info");
        window.location.href = fallbackHref;
      });
  }

  function onEditProfileClick(event) {
    if (event) {
      event.preventDefault();
    }

    var viewedUserId = getViewedUserId();
    if (!viewedUserId) {
      setStatus("No athlete selected.", "error");
      return;
    }

    var athleteName =
      (state.profile && state.profile.name) ||
      (state.viewUser && state.viewUser.email) ||
      (state.user && state.user.email) ||
      "Athlete";

    var url =
      "athlete-editor.html?athleteId=" +
      encodeURIComponent(viewedUserId) +
      "&athleteName=" +
      encodeURIComponent(athleteName);

    if (!state.isCoachView) {
      url += "&personal=true";
    }

    window.location.href = url;
  }

  function onProfileSubmit(event) {
    event.preventDefault();

    var viewedUserId = getViewedUserId();
    if (!viewedUserId || !state.client || !state.form) {
      setStatus("Not authenticated.", "error");
      return;
    }

    var formData = new FormData(state.form);
    var selectedSports = getSelectedSportsFromForm();
    if (!selectedSports.length) {
      setStatus("Select at least one sport.", "error");
      return;
    }

    var sportOverview = collectSportOverviewFromForm();
    var desiredEmail = String(formData.get("email") || "").trim();
    var desiredHeight = parseFloat(formData.get("height_cm") || "") || null;
    var desiredArmSpan = parseFloat(formData.get("arm_span_cm") || "") || null;
    var desiredWeight = parseFloat(formData.get("weight_kg") || "") || null;
    var desiredSex = String(formData.get("sex") || "").trim() || null;
    var profileData = {
      user_id: viewedUserId,
      name: String(formData.get("name") || "").trim(),
      sport: selectedSports[0],
      sports: selectedSports,
      sport_overview: sportOverview,
      bio: String(formData.get("bio") || "").trim(),
      age: parseInt(formData.get("age") || 0, 10) || null,
      location: String(formData.get("location") || "").trim(),
      height_cm: desiredHeight,
      arm_span_cm: desiredArmSpan,
      weight_kg: desiredWeight,
      sex: desiredSex,
      updated_at: new Date().toISOString()
    };

    setStatus("Saving athlete info...", "info");

    saveProfileWithFallback(profileData)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        state.profile = Object.assign({}, state.profile || {}, result.data || profileData);
        updateHero(state.profile);
        refreshTrainingProgramsCalendarFromState();
        persistLocalSportProfile(profileData);

        maybeUpdateEmail(desiredEmail)
          .then(function (emailMessage) {
            setStatus(emailMessage ? "Athlete info saved. " + emailMessage : "Athlete info saved.", "success");
            setTimeout(function () {
              clearStatus();
            }, 2400);
          })
          .catch(function (emailError) {
            setStatus(
              "Athlete info saved, but email could not be updated: " +
                (emailError && emailError.message ? emailError.message : "Unknown error."),
              "info"
            );
          });
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to save athlete info.", "error");
      });
  }

  function saveProfileWithFallback(profileData) {
    var payload = Object.assign({}, profileData);
    var viewedUserId = getViewedUserId();
    var droppedColumns = {};
    var optionalColumnsFallbackOrder = [
      "sport_overview",
      "sports",
      "arm_span_cm",
      "height_cm",
      "weight_kg",
      "sex",
      "bio",
      "age",
      "location",
      "level",
      "sport",
      "name"
    ];

    function runSave(nextPayload, attemptsRemaining) {
      var operation;
      if (state.profile && state.profile.id) {
        operation = state.client
          .from("athlete_profiles")
          .update(nextPayload)
          .eq("user_id", viewedUserId)
          .select()
          .single();
      } else {
        operation = state.client.from("athlete_profiles").insert([nextPayload]).select().single();
      }

      return operation.then(function (result) {
        if (!result.error || !isMissingColumnError(result.error) || attemptsRemaining <= 0) {
          return result;
        }

        var missingColumn = getMissingColumnName(result.error);
        if (!missingColumn) {
          missingColumn = optionalColumnsFallbackOrder.find(function (column) {
            return Object.prototype.hasOwnProperty.call(nextPayload, column) && !droppedColumns[column];
          }) || null;
        }

        if (!missingColumn || droppedColumns[missingColumn]) {
          return result;
        }

        droppedColumns[missingColumn] = true;
        var retryPayload = Object.assign({}, nextPayload);
        delete retryPayload[missingColumn];
        return runSave(retryPayload, attemptsRemaining - 1);
      });
    }

    return runSave(payload, 6);
  }

  function maybeUpdateEmail(desiredEmail) {
    var existingEmail = (state.viewUser && state.viewUser.email) || "";

    if (state.isCoachView) {
      return Promise.resolve("");
    }

    if (!desiredEmail || desiredEmail.toLowerCase() === existingEmail.toLowerCase()) {
      return Promise.resolve("");
    }

    return state.client.auth.updateUser({ email: desiredEmail }).then(function (result) {
      if (result.error) {
        throw result.error;
      }

      return "Check your inbox to confirm your new email address.";
    });
  }

  function toggleEditorSection() {
    if (!state.editorSection || !state.editToggleButton) {
      return;
    }

    var isHidden = !!state.editorSection.hidden;
    state.editorSection.hidden = !isHidden;
    state.editToggleButton.setAttribute("aria-expanded", isHidden ? "true" : "false");
    state.editToggleButton.textContent = isHidden ? "Close Athlete Profile Editor" : "Edit Athlete Profile";
  }

  function onMetricsSubmit(event) {
    event.preventDefault();

    var viewedUserId = getViewedUserId();
    if (!viewedUserId || !state.client || !state.metricsRows) {
      setMetricsStatus("Not authenticated.", "error");
      return;
    }

    var rowNodes = Array.prototype.slice.call(state.metricsRows.querySelectorAll(".metric-row"));
    var metricsToSave = rowNodes
      .map(function (row) {
        var name = String((row.querySelector("[data-metric-name]") || {}).value || "").trim();
        var value = String((row.querySelector("[data-metric-value]") || {}).value || "").trim();
        var unit = String((row.querySelector("[data-metric-unit]") || {}).value || "").trim();
        var category = String((row.querySelector("[data-metric-category]") || {}).value || "").trim();

        return {
          user_id: viewedUserId,
          metric_name: name,
          metric_value: value,
          metric_unit: unit,
          metric_category: category || "Performance",
          updated_at: new Date().toISOString()
        };
      })
      .filter(function (metric) {
        return metric.metric_name && metric.metric_value;
      });

    var latestLookup = buildLatestMetricsLookup(state.metrics || []);
    var metricsToInsert = metricsToSave.filter(function (metric) {
      var key = getMetricKey(metric);
      var latest = latestLookup[key];
      if (!latest) {
        return true;
      }

      return (
        normalizeMetricValue(metric.metric_value) !== normalizeMetricValue(latest.metric_value) ||
        normalizeMetricValue(metric.metric_unit) !== normalizeMetricValue(latest.metric_unit) ||
        normalizeMetricValue(metric.metric_category) !== normalizeMetricValue(latest.metric_category)
      );
    });

    if (!metricsToInsert.length) {
      setMetricsStatus("No metric changes detected. Update a value to log a new test.", "info");
      return;
    }

    setMetricsStatus("Saving new metric test entries...", "info");

    state.client
      .from("athlete_metrics")
      .insert(metricsToInsert)
      .select("*")
      .then(function (insertResult) {
        if (insertResult.error) {
          if (isMissingRelationError(insertResult.error)) {
            setMetricsStatus(
              "Metrics table not found. Create athlete_metrics in Supabase before saving metrics.",
              "error"
            );
            return;
          }

          if (isRlsError(insertResult.error)) {
            setMetricsStatus(
              "Permission denied by database policy while saving metrics. Ask admin to update athlete_metrics RLS policy for coach edits.",
              "error"
            );
            return;
          }

          setMetricsStatus(insertResult.error.message, "error");
          return;
        }

        var insertedRows = Array.isArray(insertResult.data) ? insertResult.data : metricsToInsert;
        state.metrics = insertedRows.concat(state.metrics || []);
        state.metricsLatest = getLatestMetrics(state.metrics);
        renderMetricsCards();
        renderMetricRowsFromData(state.metricsLatest);
        setMetricsStatus("Metrics saved as new test entries.", "success");

        if (state.metricsEditor && !state.metricsEditor.hidden) {
          toggleMetricsEditor();
        }
      })
      .catch(function (error) {
        setMetricsStatus(error && error.message ? error.message : "Failed to save metrics.", "error");
      });
  }

  function applyMetricsSectionPreference() {
    if (!state.metricsContent || !state.metricsCollapseToggle) {
      return;
    }

    var collapsed = false;
    try {
      collapsed = window.localStorage.getItem(METRICS_COLLAPSE_KEY) === "1";
    } catch (_error) {
      collapsed = false;
    }

    setMetricsSectionCollapsed(collapsed);
  }

  function toggleMetricsSection() {
    if (!state.metricsContent) {
      return;
    }

    setMetricsSectionCollapsed(!state.metricsContent.hidden);
  }

  function setMetricsSectionCollapsed(collapsed) {
    if (!state.metricsContent || !state.metricsCollapseToggle) {
      return;
    }

    state.metricsContent.hidden = !!collapsed;
    state.metricsCollapseToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    state.metricsCollapseToggle.textContent = collapsed ? "Show Metrics" : "Hide Metrics";

    try {
      window.localStorage.setItem(METRICS_COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch (_error) {
      /* localStorage may be disabled by browser privacy settings */
    }
  }

  function applyMetricsCompactPreference() {
    var compact = true;
    try {
      var value = window.localStorage.getItem(METRICS_COMPACT_KEY);
      if (value === "0") {
        compact = false;
      } else if (value === "1") {
        compact = true;
      }
    } catch (_error) {
      compact = true;
    }

    setMetricsCompactMode(compact, false);
  }

  function toggleMetricsCompactMode() {
    if (!state.metricsList) {
      return;
    }

    var compact = !state.metricsList.classList.contains("is-compact");
    setMetricsCompactMode(compact, true);
  }

  function setMetricsCompactMode(compact, persist) {
    if (!state.metricsList) {
      return;
    }

    state.metricsList.classList.toggle("is-compact", !!compact);

    if (compact) {
      closeAllMetricCardEditors();
    }

    if (state.metricsCompactToggle) {
      state.metricsCompactToggle.textContent = compact ? "Show Details" : "Hide Details";
      state.metricsCompactToggle.setAttribute("aria-pressed", compact ? "false" : "true");
    }

    if (persist) {
      try {
        window.localStorage.setItem(METRICS_COMPACT_KEY, compact ? "1" : "0");
      } catch (_error) {
        /* localStorage may be unavailable */
      }
    }
  }

  function getCollapseStorageKey(sectionName) {
    var section = String(sectionName || "").trim().toLowerCase();
    if (section === "strava") {
      return STRAVA_COLLAPSE_KEY;
    }
    if (section === "danger") {
      return DANGER_COLLAPSE_KEY;
    }
    return "";
  }

  function getSectionToggleElements(sectionName) {
    var section = String(sectionName || "").trim().toLowerCase();
    if (!section) {
      return { content: null, toggle: null };
    }

    var content = document.querySelector('[data-section-collapse-content="' + section + '"]');
    var toggle = document.querySelector('[data-section-collapse-toggle="' + section + '"]');
    return { content: content, toggle: toggle };
  }

  function getSectionToggleText(sectionName, collapsed) {
    var section = String(sectionName || "").trim().toLowerCase();
    if (section === "strava") {
      return collapsed ? "Show Wearables" : "Hide Wearables";
    }
    if (section === "danger") {
      return collapsed ? "Show Danger Zone" : "Hide Danger Zone";
    }
    return collapsed ? "Show Section" : "Hide Section";
  }

  function setSectionCollapsed(sectionName, collapsed, persist) {
    var elements = getSectionToggleElements(sectionName);
    if (!elements.content || !elements.toggle) {
      return;
    }

    var isCollapsed = !!collapsed;
    elements.content.hidden = isCollapsed;
    elements.toggle.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
    elements.toggle.textContent = getSectionToggleText(sectionName, isCollapsed);

    if (persist) {
      var storageKey = getCollapseStorageKey(sectionName);
      if (storageKey) {
        try {
          window.localStorage.setItem(storageKey, isCollapsed ? "1" : "0");
        } catch (_error) {
          /* localStorage may be unavailable */
        }
      }
    }
  }

  function toggleSectionCollapsed(sectionName) {
    var elements = getSectionToggleElements(sectionName);
    if (!elements.content) {
      return;
    }

    setSectionCollapsed(sectionName, !elements.content.hidden, true);
  }

  function applySectionCollapsePreferences() {
    // Legacy dashboard section toggles (wearables/danger) were removed.
  }

  function getMetricKey(metric) {
    var name = normalizeMetricValue(metric && metric.metric_name);
    var unit = normalizeMetricValue(metric && metric.metric_unit);
    return name + "|" + unit;
  }

  function normalizeMetricValue(value) {
    return String(value || "").trim().toLowerCase();
  }

  function parseSideVariantMetricName(rawName) {
    var name = String(rawName || "").trim();
    var sideMatch = name.match(/^(.*)\((left|right)\)\s*$/i);
    if (!sideMatch) {
      return null;
    }

    return {
      baseName: String(sideMatch[1] || "").trim(),
      side: String(sideMatch[2] || "").toLowerCase()
    };
  }

  function isPairedSideVariantMetric(metric) {
    var parsed = parseSideVariantMetricName(metric && metric.metric_name);
    if (!parsed) {
      return null;
    }

    if (isSingleLegSquatMetricName(parsed.baseName)) {
      parsed.group = "single-leg-squat";
      return parsed;
    }

    if (isSingleLegHeelRaiseMetricName(parsed.baseName)) {
      parsed.group = "single-leg-heel-raise";
      return parsed;
    }

    if (isSidePlankMetricName(parsed.baseName)) {
      parsed.group = "side-plank-hip-abduction";
      return parsed;
    }

    if (isYBalanceMetricName(parsed.baseName)) {
      parsed.group = "y-balance";
      return parsed;
    }

    if (isEdgePullMetricName(parsed.baseName)) {
      parsed.group = "edge-pull";
      return parsed;
    }

    return null;
  }

  function parseSingleLegSquatLegValues(metricValue) {
    var text = String(metricValue || "").replace(/,/g, " ").trim();
    if (!text) {
      return { left: null, right: null };
    }

    var leftMatch = text.match(/(?:\bL\b|\bleft\b|\bl leg\b)[^\d-]*(-?\d+(?:\.\d+)?)/i);
    var rightMatch = text.match(/(?:\bR\b|\bright\b|\br leg\b)[^\d-]*(-?\d+(?:\.\d+)?)/i);
    var left = leftMatch ? Number(leftMatch[1]) : null;
    var right = rightMatch ? Number(rightMatch[1]) : null;

    if (Number.isFinite(left) && Number.isFinite(right)) {
      return { left: left, right: right };
    }

    var numbers = text.match(/-?\d+(?:\.\d+)?/g) || [];
    if (numbers.length >= 2) {
      var first = Number(numbers[0]);
      var second = Number(numbers[1]);
      if (Number.isFinite(first) && Number.isFinite(second)) {
        return { left: first, right: second };
      }
    }

    return { left: null, right: null };
  }

  function buildLatestMetricsLookup(metrics) {
    var map = {};
    (metrics || []).forEach(function (metric) {
      var key = getMetricKey(metric);
      if (!key || map[key]) {
        return;
      }
      map[key] = metric;
    });
    return map;
  }

  function getLatestMetrics(metrics) {
    var groups = {};

    (metrics || []).forEach(function (metric) {
      var key = getMetricKey(metric);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(metric);
    });

    var latestMetrics = Object.keys(groups)
      .map(function (key) {
        var history = groups[key]
          .slice()
          .sort(function (a, b) {
            return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
          });

        var latest = Object.assign({}, history[0]);
        latest._history = history;
        latest._previous = history.length > 1 ? history[1] : null;
        return latest;
      })
      .sort(function (a, b) {
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      });

    var pairedBaseKeys = {};
    latestMetrics.forEach(function (metric) {
      var parsed = isPairedSideVariantMetric(metric);
      if (!parsed) {
        return;
      }
      var baseKey = normalizeMetricValue(parsed.baseName) + "|" + normalizeMetricValue(metric.metric_unit);
      pairedBaseKeys[baseKey] = true;
    });

    var displayMap = {};
    latestMetrics.forEach(function (metric) {
      var parsed = isPairedSideVariantMetric(metric);
      if (!parsed) {
        var metricKey = getMetricKey(metric);
        if (pairedBaseKeys[metricKey]) {
          return;
        }
        displayMap[getMetricKey(metric)] = metric;
        return;
      }

      var exactBaseKey = normalizeMetricValue(parsed.baseName) + "|" + normalizeMetricValue(metric.metric_unit);
      var combinedKey = exactBaseKey + "|" + parsed.group;
      if (!displayMap[combinedKey]) {
        displayMap[combinedKey] = {
          user_id: metric.user_id,
          metric_name: parsed.baseName,
          metric_value: "",
          metric_unit: metric.metric_unit,
          metric_category: metric.metric_category,
          updated_at: metric.updated_at,
          _history: [],
          _previous: null,
          _pairedSideMetrics: { left: null, right: null }
        };
      }

      var combinedMetric = displayMap[combinedKey];
      combinedMetric._pairedSideMetrics[parsed.side] = metric;
      combinedMetric.updated_at = [combinedMetric.updated_at, metric.updated_at]
        .filter(function (value) { return !!value; })
        .sort()
        .slice(-1)[0] || combinedMetric.updated_at;
      combinedMetric.metric_category = combinedMetric.metric_category || metric.metric_category;
      combinedMetric._history = (combinedMetric._history || []).concat(metric);

      if (combinedMetric._pairedSideMetrics.left && combinedMetric._pairedSideMetrics.right) {
        var leftMetric = combinedMetric._pairedSideMetrics.left;
        var rightMetric = combinedMetric._pairedSideMetrics.right;
        combinedMetric.metric_value =
          "L " + String(leftMetric.metric_value || "").trim() +
          " | R " + String(rightMetric.metric_value || "").trim();
      }
    });

    return Object.keys(displayMap)
      .map(function (key) {
        var metric = displayMap[key];
        if (metric && metric._pairedSideMetrics) {
          if (!metric._pairedSideMetrics.left || !metric._pairedSideMetrics.right) {
            return metric._pairedSideMetrics.left || metric._pairedSideMetrics.right || metric;
          }
        }
        return metric;
      })
      .sort(function (a, b) {
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      });
  }

  function getMetricTrend(metric) {
    if (!metric || !metric._previous) {
      return null;
    }

    var current = parseFloat(metric.metric_value);
    var previous = parseFloat(metric._previous.metric_value);
    if (isNaN(current) || isNaN(previous)) {
      return null;
    }

    var delta = current - previous;
    return {
      delta: delta,
      deltaLabel: formatMetricDelta(delta)
    };
  }

  function formatMetricDelta(delta) {
    var rounded = Math.round(delta * 100) / 100;
    if (rounded > 0) {
      return "+" + String(rounded);
    }
    return String(rounded);
  }

  function loadCurrentTrainingProgram() {
    var section = document.getElementById("profile-training-program-section");
    var content = document.getElementById("profile-training-program-content");
    if (!section || !content || !getViewedUserId() || !state.client) {
      return;
    }

    var existingHeight = content.offsetHeight;
    if (existingHeight > 0) {
      content.style.minHeight = String(existingHeight) + "px";
    }

    content.innerHTML = '<p class="profile-training-loading">Loading your training programs...</p>';

    // Always use the non-join version to avoid ambiguous relationship embeds.
    loadCurrentTrainingProgramWithoutJoin(content);
  }

  function loadOnboardingIntake() {
    if (!state.client || !getViewedUserId() || !state.onboardingContent) {
      return;
    }

    state.onboardingContent.innerHTML = '<p class="profile-loading">Loading task forms...</p>';
    setOnboardingStatus("", "info");

    ensureDefaultLiabilityWaiverTaskForCurrentAthlete()
      .then(function () {
        return state.client
      .from("athlete_onboarding_intake_assignments")
      .select("id,athlete_user_id,form_id,form_name,form_schema,response_data,status,assigned_at,assigned_by,due_date,submitted_at,updated_at")
      .eq("athlete_user_id", getViewedUserId())
      .order("assigned_at", { ascending: false })
      .limit(20);
      })
      .then(function (result) {
        if (result.error) {
          if (isMissingRelationError(result.error)) {
            state.onboardingAssignments = [];
            renderOnboardingAssignments();
            setOnboardingStatus(
              "Task assignment tables are not installed yet. Run sql/create-athlete-onboarding-intake.sql in Supabase.",
              "error"
            );
            return;
          }

          setOnboardingStatus(result.error.message, "error");
          loadFoundingOnboardingTaskContext();
          return;
        }

        state.onboardingAssignments = (result.data || []).map(normalizeOnboardingAssignment);
        renderOnboardingAssignments();
        maybeReconcileCompletedMembershipPaymentTasks();
        loadFoundingOnboardingTaskContext();
      })
      .catch(function (error) {
        setOnboardingStatus(error && error.message ? error.message : "Failed to load task forms.", "error");
        loadFoundingOnboardingTaskContext();
      });
  }

  function loadFoundingSubscriptionState() {
    if (!state.client || !getViewedUserId()) {
      state.foundingSubscriptionRow = null;
      renderDashboardCoachTasks();
      refreshAthleteDashboardAccess();
      return;
    }

    state.client
      .from("founding_member_subscriptions")
      .select("user_id,status,last_event_type,last_event_created_at,updated_at")
      .eq("user_id", getViewedUserId())
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(function (result) {
        if (result.error) {
          state.foundingSubscriptionRow = null;
          renderDashboardCoachTasks();
          refreshAthleteDashboardAccess();
          return;
        }

        state.foundingSubscriptionRow = result.data || null;
        renderDashboardCoachTasks();
        refreshAthleteDashboardAccess();
        maybeReconcileCompletedMembershipPaymentTasks();
      })
      .catch(function () {
        state.foundingSubscriptionRow = null;
        renderDashboardCoachTasks();
        refreshAthleteDashboardAccess();
      });
  }

  function ensureDefaultLiabilityWaiverTaskForCurrentAthlete() {
    if (!state.client || !getViewedUserId() || state.isCoachView) {
      return Promise.resolve();
    }

    return state.client
      .rpc("ensure_default_liability_waiver_task", {
        p_athlete_user_id: getViewedUserId()
      })
      .then(function (result) {
        if (!result || !result.error) {
          return null;
        }

        if (isMissingFunctionError(result.error) || isMissingRelationError(result.error)) {
          return null;
        }

        return null;
      })
      .catch(function () {
        return null;
      });
  }

  function loadFoundingOnboardingTaskContext() {
    if (!state.client || !getViewedUserId()) {
      state.foundingOnboardingRow = null;
      renderDashboardCoachTasks();
      refreshAthleteDashboardAccess();
      return;
    }

    state.client
      .from("founding_member_onboarding")
      .select("athlete_user_id,is_founding_member,stage,payment_completed_at,docs_signed_at,welcome_completed_at")
      .eq("athlete_user_id", getViewedUserId())
      .eq("is_founding_member", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(function (result) {
        if (result.error) {
          if (isMissingRelationError(result.error)) {
            state.foundingOnboardingRow = null;
            renderDashboardCoachTasks();
            refreshAthleteDashboardAccess();
            return;
          }

          state.foundingOnboardingRow = null;
          renderDashboardCoachTasks();
          refreshAthleteDashboardAccess();
          return;
        }

        state.foundingOnboardingRow = result.data || null;
        renderDashboardCoachTasks();
        refreshAthleteDashboardAccess();
        maybeReconcileCompletedMembershipPaymentTasks();
        loadFoundingSubscriptionState();
      })
      .catch(function () {
        state.foundingOnboardingRow = null;
        renderDashboardCoachTasks();
        refreshAthleteDashboardAccess();
      });
  }

  function normalizeOnboardingAssignment(row) {
    var schema = row && row.form_schema && typeof row.form_schema === "object" ? row.form_schema : {};
    var response = row && row.response_data && typeof row.response_data === "object" ? row.response_data : {};
    return {
      id: String(row && row.id || ""),
      athlete_user_id: String(row && row.athlete_user_id || ""),
      form_id: String(row && row.form_id || ""),
      form_name: String(row && row.form_name || "Task Form"),
      form_schema: schema,
      response_data: response,
      status: String(row && row.status || "assigned"),
      assigned_at: String(row && row.assigned_at || ""),
      due_date: row && row.due_date ? String(row.due_date) : "",
      submitted_at: row && row.submitted_at ? String(row.submitted_at) : "",
      updated_at: row && row.updated_at ? String(row.updated_at) : ""
    };
  }

  function renderDashboardCoachTasks(assignmentsInput) {
    if (!state.dashboardTaskBoard) {
      return;
    }

    state.dashboardTaskBoard.setAttribute("data-dashboard-task-board", "");

    var assignments = Array.isArray(assignmentsInput)
      ? assignmentsInput
      : (state.onboardingAssignments || []);

    var visibleAssignments = assignments.filter(function (assignment) {
      return assignment && assignment.status !== "archived";
    });

    var hasCompletedFoundingPayment = !!(state.foundingOnboardingRow && (
      state.foundingOnboardingRow.payment_completed_at ||
      String(state.foundingOnboardingRow.stage || "") === "welcome_pending_intakes" ||
      String(state.foundingOnboardingRow.stage || "") === "intakes_completed_assessment_pending" ||
      String(state.foundingOnboardingRow.stage || "") === "assessment_in_progress" ||
      String(state.foundingOnboardingRow.stage || "") === "assessment_published_pending_review" ||
      String(state.foundingOnboardingRow.stage || "") === "review_scheduled" ||
      String(state.foundingOnboardingRow.stage || "") === "active_training"
    ));

    var pendingAssignments = visibleAssignments.filter(function (assignment) {
      var status = String(assignment && assignment.status || "").toLowerCase();
      if (status === "submitted") {
        return false;
      }

      // Athlete view fallback: hide stale payment assignment cards once payment is completed.
      if (!state.isCoachView && hasCompletedFoundingPayment && (isMembershipPaymentTaskAssignment(assignment) || isPaymentTaskAssignment(assignment))) {
        return false;
      }

      return true;
    });

    pendingAssignments.sort(compareOnboardingTaskPriority);

    var cards = [];

    pendingAssignments.forEach(function (assignment) {
      cards.push(buildCoachAssignmentTaskCard(assignment));
    });

    var paymentTaskCard = getFoundingPaymentTaskCard(state.foundingOnboardingRow);
    if (paymentTaskCard) {
      cards.push(paymentTaskCard);
    }

    var workoutTaskCard = getTodayWorkoutTaskCard(state.dashboardUpcomingTrainingItems || []);
    if (workoutTaskCard) {
      cards.push(workoutTaskCard);
    }

    var stageTaskCard = getFoundingStageTaskCard(state.foundingOnboardingRow, pendingAssignments.length);
    if (stageTaskCard) {
      cards.push(stageTaskCard);
    }

    cards.sort(function (a, b) {
      return (Number(a.priority) || 999) - (Number(b.priority) || 999);
    });

    if (!visibleAssignments.length && !stageTaskCard && !paymentTaskCard && !workoutTaskCard) {
      state.dashboardTaskBoard.innerHTML =
        '<article class="profile-glance-card profile-today-card">' +
          '<p class="profile-glance-label">Coach Tasks</p>' +
          '<strong class="profile-glance-value">No Tasks Assigned</strong>' +
          '<p class="profile-glance-meta">No membership steps, forms, workouts, or check-in tasks are currently assigned.</p>' +
        '</article>';
      return;
    }

    if (!cards.length) {
      state.dashboardTaskBoard.innerHTML =
        '<p class="profile-task-inline-status">All tasks complete.</p>';
      return;
    }

    state.dashboardTaskBoard.innerHTML = cards.slice(0, 4)
      .map(function (card) {
        var toneClass = card.tone === "alert" ? " is-alert" : (card.tone === "good" ? " is-good" : "");
        var actionAttr = card.dashboardAction
          ? ' data-dashboard-action="' + escapeAttribute(String(card.dashboardAction || "")) + '"'
          : "";
        var assignmentAttr = card.assignmentId
          ? ' data-assignment-id="' + escapeAttribute(String(card.assignmentId || "")) + '"'
          : "";
        var secondaryActionHtml = "";
        if (card.secondaryActionLabel) {
          var secondaryActionAttr = card.secondaryDashboardAction
            ? ' data-dashboard-action="' + escapeAttribute(String(card.secondaryDashboardAction || "")) + '"'
            : "";
          secondaryActionHtml =
            '<a class="profile-glance-action profile-glance-action-secondary" href="#profile-tasks-section"' + secondaryActionAttr + assignmentAttr + '>' +
              escapeHtml(card.secondaryActionLabel) +
            '</a>';
        }
        return (
          '<article class="profile-glance-card profile-today-card' + toneClass + '">' +
            '<p class="profile-glance-label">' + escapeHtml(card.label || "Coach Task") + '</p>' +
            '<strong class="profile-glance-value">' + escapeHtml(card.title || "Task") + '</strong>' +
            '<p class="profile-glance-meta">' + escapeHtml(card.meta || "") + '</p>' +
            '<a class="profile-glance-action" href="' + escapeAttribute(card.href || "#profile-tasks-section") + '"' + actionAttr + assignmentAttr + '>' + escapeHtml(card.actionLabel || "Open Task") + '</a>' +
            secondaryActionHtml +
          '</article>'
        );
      })
      .join("");
  }

  function buildCoachAssignmentTaskCard(assignment) {
    var dueDays = assignment && assignment.due_date ? getDaysUntilDate(assignment.due_date) : null;
    var dueLabel = assignment && assignment.due_date ? formatDate(assignment.due_date) : "No due date";
    var dueMeta = "Due " + dueLabel;

    if (typeof dueDays === "number") {
      if (dueDays > 0) {
        dueMeta += " (" + dueDays + " day" + (dueDays === 1 ? "" : "s") + " left)";
      } else if (dueDays === 0) {
        dueMeta += " (due today)";
      } else {
        dueMeta += " (" + Math.abs(dueDays) + " day" + (Math.abs(dueDays) === 1 ? "" : "s") + " overdue)";
      }
    }

    var category = getCoachAssignmentCategory(assignment);
    var isPaymentTask = isPaymentTaskAssignment(assignment);
    var label = "Coach Task";
    var actionLabel = state.isCoachView ? "Review Task" : "Open Task";

    if (category === "onboarding") {
      label = "Task Form";
      actionLabel = state.isCoachView ? "Review Form" : "Complete Form";
    } else if (category === "daily_readiness") {
      label = "Daily Readiness";
      actionLabel = state.isCoachView ? "Review Check-in" : "Complete Check-in";
    } else if (category === "weekly_progress") {
      label = "Weekly Progress";
      actionLabel = state.isCoachView ? "Review Update" : "Submit Update";
    } else if (category === "form") {
      label = "Assigned Form";
      actionLabel = state.isCoachView ? "Review Form" : "Complete Form";
    } else if (category === "custom_task") {
      label = "Coach Task";
      actionLabel = state.isCoachView ? "Review Task" : "Complete Task";

      if (!state.isCoachView) {
        var taskAction = getCustomTaskActionConfig(assignment);
        if (taskAction) {
          actionLabel = taskAction.label;
        }
      }
    }

    var dashboardAction = "";
    var assignmentId = "";
    var href = "#profile-tasks-section";

    if (isPaymentTask) {
      label = "Membership";
      actionLabel = "Complete Payment";
      href = MEMBERSHIP_PAYMENT_TASK_URL;
      dashboardAction = "start-membership-checkout";
      assignmentId = String(assignment && assignment.id || "");
    }

    if (!state.isCoachView && !isCustomCoachTaskAssignment(assignment) && (category === "onboarding" || category === "form")) {
      dashboardAction = "open-onboarding-form";
      assignmentId = String(assignment && assignment.id || "");
    } else if (!state.isCoachView && category === "custom_task" && !isPaymentTask) {
      var customTaskAction = getCustomTaskActionConfig(assignment);
      if (customTaskAction) {
        href = customTaskAction.url;
      }
    }

    return {
      label: label,
      title: assignment && assignment.form_name ? assignment.form_name : "Assigned Task",
      meta: dueMeta,
      href: href,
      actionLabel: actionLabel,
      dashboardAction: dashboardAction,
      assignmentId: assignmentId,
      secondaryActionLabel: state.isCoachView && isPaymentTask ? "Remove Task" : "",
      secondaryDashboardAction: state.isCoachView && isPaymentTask ? "remove-onboarding-assignment" : "",
      tone: typeof dueDays === "number" && dueDays < 0 ? "alert" : "",
      priority: getAssignmentTaskPriority(assignment)
    };
  }

  function getCoachAssignmentCategory(assignment) {
    var name = String(assignment && assignment.form_name || "").toLowerCase();
    var formId = String(assignment && assignment.form_id || "").toLowerCase();
    var schema = assignment && assignment.form_schema && typeof assignment.form_schema === "object"
      ? assignment.form_schema
      : {};
    var taskType = String(schema.task_type || "").toLowerCase();

    if (taskType === "custom_task" || formId.indexOf("coach-task-") === 0) {
      if (name.indexOf("daily readiness") > -1 || name.indexOf("readiness") > -1) {
        return "daily_readiness";
      }
      if (name.indexOf("weekly progress") > -1 || name.indexOf("progress") > -1) {
        return "weekly_progress";
      }
      return "custom_task";
    }

    if (name.indexOf("onboarding") > -1 || name.indexOf("intake") > -1) {
      return "onboarding";
    }
    if (name.indexOf("daily readiness") > -1 || name.indexOf("readiness") > -1) {
      return "daily_readiness";
    }
    if (name.indexOf("weekly progress") > -1 || name.indexOf("progress") > -1) {
      return "weekly_progress";
    }

    return "form";
  }

  function getFoundingPaymentTaskCard(onboardingRow) {
    if (!onboardingRow || onboardingRow.is_founding_member !== true) {
      return null;
    }

    if (hasCompletedMembershipPayment(onboardingRow)) {
      return null;
    }

    var stage = String(onboardingRow.stage || "").trim();
    if (stage !== "docs_signed_pending_payment" && stage !== "payment_pending") {
      return null;
    }

    return {
      label: "Membership",
      title: "Complete Membership Payment",
      meta: "Payment is required before full plan access and coach workflow unlock.",
      href: "founding-member.html?checkout=start",
      dashboardAction: "start-membership-checkout",
      actionLabel: "Complete Payment",
      tone: "alert",
      priority: 140
    };
  }

  function getTodayWorkoutTaskCard(upcomingItems) {
    var todayKey = getTodayDateInputValue();
    var todaySessions = (Array.isArray(upcomingItems) ? upcomingItems : []).filter(function (item) {
      if (String(item && item.kind || "") !== "training") {
        return false;
      }

      if (String(item && item.scheduled_for || "") !== todayKey) {
        return false;
      }

      var status = String(item && item.status || "scheduled").toLowerCase();
      return status !== "completed";
    });

    if (!todaySessions.length) {
      return null;
    }

    var session = todaySessions[0];
    var sessionStatus = String(session && session.status || "scheduled").toLowerCase();
    var dueMeta = todaySessions.length === 1
      ? "1 workout due today"
      : String(todaySessions.length) + " workouts due today";

    return {
      label: "Today\'s Workout",
      title: String(session && session.session_label || "Complete Today\'s Session"),
      meta: dueMeta,
      href: getTrainingSessionLaunchHref(session) || "#profile-training-program-section",
      actionLabel: sessionStatus.indexOf("partial") > -1 ? "Finish Session" : "Open Workout",
      tone: "",
      priority: 120
    };
  }

  function compareOnboardingTaskPriority(a, b) {
    return getAssignmentTaskPriority(a) - getAssignmentTaskPriority(b);
  }

  function getAssignmentTaskPriority(assignment) {
    var dueDays = assignment && assignment.due_date ? getDaysUntilDate(assignment.due_date) : null;
    if (typeof dueDays !== "number") {
      return 700;
    }
    if (dueDays < 0) {
      return 100 + Math.abs(dueDays);
    }
    if (dueDays === 0) {
      return 200;
    }
    return 300 + dueDays;
  }

  function getFoundingStageTaskCard(onboardingRow, pendingIntakeCount) {
    if (!onboardingRow || onboardingRow.is_founding_member !== true) {
      return null;
    }

    var stage = String(onboardingRow.stage || "").trim();
    if (!stage) {
      return null;
    }

    if (stage === "docs_signed_pending_payment" || stage === "payment_pending") {
      return null;
    }

    if (stage === "welcome_pending_intakes" && pendingIntakeCount > 0) {
      return {
        label: "Coach Follow-up",
        title: "Submit Assigned Task Forms",
        meta: String(pendingIntakeCount) + " task form" + (pendingIntakeCount === 1 ? "" : "s") + " remaining.",
        href: "#profile-tasks-section",
        actionLabel: state.isCoachView ? "Review Tasks" : "Open Tasks",
        tone: "",
        priority: 350
      };
    }

    if (stage === "intakes_completed_assessment_pending") {
      return {
        label: "Coach Follow-up",
        title: "Assessment Prep Pending",
        meta: "Your intake is complete. Coach will start your assessment plan next.",
        href: "#profile-metrics-section",
        actionLabel: "View Metrics",
        tone: "",
        priority: 400
      };
    }

    if (stage === "assessment_in_progress") {
      return {
        label: "Coach Task",
        title: "Complete Assessment Tasks",
        meta: "Finish assigned assessment work and keep coach updated.",
        href: "#profile-metrics-section",
        actionLabel: "Open Assessment",
        tone: "",
        priority: 420
      };
    }

    if (stage === "assessment_published_pending_review") {
      return {
        label: "Coach Follow-up",
        title: "Review Assessment Results",
        meta: "Coach published your assessment. Review takeaways before your check-in.",
        href: "#profile-metrics-section",
        actionLabel: "Review Results",
        tone: "",
        priority: 430
      };
    }

    if (stage === "review_scheduled") {
      return {
        label: "Coach Follow-up",
        title: "Prepare For Review Session",
        meta: "Bring your questions and recent training notes to the scheduled review.",
        href: "athlete-messages.html",
        actionLabel: "Open Messages",
        tone: "",
        priority: 440
      };
    }

    if (stage === "active_training" && pendingIntakeCount === 0) {
      return {
        label: "Coach Tasks",
        title: "Initial Tasks Complete",
        meta: "Stay consistent with your active training plan and weekly check-ins.",
        href: "#profile-training-program-section",
        actionLabel: "Open Training",
        tone: "good",
        priority: 800
      };
    }

    return null;
  }

  function renderOnboardingAssignments() {
    if (!state.onboardingContent) {
      return;
    }

    var assignments = (state.onboardingAssignments || []).filter(function (assignment) {
      return !!assignment;
    });

    renderDashboardCoachTasks(assignments);
    refreshAthleteDashboardAccess();

    if (!assignments.length) {
      state.onboardingContent.innerHTML =
        '<div class="profile-empty-state">' +
          '<p class="profile-empty-state-title">No tasks assigned</p>' +
          '<p class="profile-empty-state-copy">' +
            (state.isCoachView
              ? "Assign tasks so this athlete can complete required setup steps."
              : "Your coach has not assigned any tasks yet.") +
          "</p>" +
        "</div>";
      return;
    }

    var visibleAssignments = state.isCoachView
      ? assignments.filter(function (assignment) {
          var filter = String(state.onboardingCoachTaskFilter || "active").toLowerCase();
          var status = String(assignment && assignment.status || "").toLowerCase();
          if (filter === "completed") {
            return status === "submitted" || status === "archived";
          }
          if (filter === "all") {
            return true;
          }
          return status !== "submitted" && status !== "archived";
        })
      : assignments.filter(function (assignment) {
          var status = String(assignment && assignment.status || "").toLowerCase();
          if (status === "archived" || status === "submitted") {
            return false;
          }

          // Liability waiver stays in the top dashboard task strip to avoid duplicate cards.
          return !isLiabilityTaskAssignment(assignment);
        });

    // Keep athlete view uncluttered: membership payment tasks live in the top strip only.
    // In coach view, hide only ACTIVE payment tasks from the lower list to avoid duplicate cards.
    // Completed payment tasks remain visible for review when using Completed/All filters.
    if (!state.isCoachView) {
      visibleAssignments = visibleAssignments.filter(function (assignment) {
        return !isPaymentTaskAssignment(assignment);
      });
    } else {
      visibleAssignments = visibleAssignments.filter(function (assignment) {
        var status = String(assignment && assignment.status || "").toLowerCase();
        if (!isPaymentTaskAssignment(assignment)) {
          return true;
        }

        return status === "submitted" || status === "archived";
      });
    }

    if (!visibleAssignments.length) {
      var hasPendingLiabilityTask = !state.isCoachView && assignments.some(function (assignment) {
        if (!assignment) {
          return false;
        }

        var assignmentStatus = String(assignment.status || "").toLowerCase();
        if (assignmentStatus === "archived" || assignmentStatus === "submitted") {
          return false;
        }

        return isLiabilityTaskAssignment(assignment);
      });

      if (hasPendingLiabilityTask) {
        state.onboardingContent.innerHTML = "";
        return;
      }

      if (!state.isCoachView) {
        state.onboardingContent.innerHTML = "";
        return;
      }

      var coachFilter = String(state.onboardingCoachTaskFilter || "active").toLowerCase();
      var emptyTitle = "No active task forms";
      var emptyCopy = "All task forms are archived.";
      if (coachFilter === "completed") {
        emptyTitle = "No completed tasks";
        emptyCopy = "Completed tasks will appear here after athletes submit or complete them.";
      } else if (coachFilter === "all") {
        emptyTitle = "No task forms";
        emptyCopy = "No task forms have been assigned yet.";
      }

      state.onboardingContent.innerHTML =
        '<div class="profile-empty-state">' +
          '<p class="profile-empty-state-title">' + escapeHtml(emptyTitle) + '</p>' +
          '<p class="profile-empty-state-copy">' + escapeHtml(emptyCopy) + '</p>' +
        "</div>";
      return;
    }

    state.onboardingContent.innerHTML = visibleAssignments
      .map(function (assignment) {
        var isCustomTask = isCustomCoachTaskAssignment(assignment);
        var isPaymentTask = isPaymentTaskAssignment(assignment);
        var dueLabel = assignment.due_date ? formatDate(assignment.due_date) : "No due date";
        var submittedLabel = assignment.submitted_at ? formatDate(assignment.submitted_at) : "Not submitted";
        var statusLabel = assignment.status === "submitted" ? "Submitted" : (assignment.status === "archived" ? "Archived" : "Assigned");
        var showCompletedPaymentBadge =
          state.isCoachView &&
          isPaymentTask &&
          (assignment.status === "submitted" || assignment.status === "archived");

        var html = '';
        html += '<article class="profile-nutrition-card profile-onboarding-card">';
        html += '<div class="profile-section-header">';
        html += '<div><h3>' + escapeHtml(assignment.form_name) + '</h3>';
        html += '<p class="profile-section-copy">Assigned ' + escapeHtml(formatDate(assignment.assigned_at)) + ' • Due ' + escapeHtml(dueLabel) + '</p></div>';
        html += '<span class="admin-risk-chip ' + (assignment.status === "submitted" ? "is-stable" : "") + '">' + escapeHtml(statusLabel) + '</span>';
        if (showCompletedPaymentBadge) {
          html += '<span class="admin-risk-chip is-watch">Payment Task</span>';
        }
        html += '</div>';

        if (isCustomTask) {
          var taskDescription = String(assignment.form_schema && assignment.form_schema.description || "").trim();
          var customTaskAction = getCustomTaskActionConfig(assignment);
          if (taskDescription) {
            html += '<p class="profile-section-copy">' + escapeHtml(taskDescription) + '</p>';
          }

          if (state.isCoachView) {
            html += '<p class="profile-section-copy"><strong>Submission:</strong> ' + escapeHtml(submittedLabel) + '</p>';
            if (assignment.response_data && assignment.response_data.task_completed_at) {
              html += '<p class="profile-section-copy"><strong>Completed:</strong> ' + escapeHtml(formatDate(String(assignment.response_data.task_completed_at || ""))) + '</p>';
            }
            html += '<div class="profile-section-actions">';
            html += '<button type="button" class="btn profile-btn-cancel" data-onboarding-delete-assignment="' + escapeAttribute(assignment.id) + '">Delete Task</button>';
            html += '</div>';
            html += '</article>';
            return html;
          }

          if (assignment.status === "submitted") {
            html += '<p class="profile-section-copy"><strong>Status:</strong> Completed ' + escapeHtml(submittedLabel) + '</p>';
          } else {
            html += '<div class="profile-section-actions">';
            if (customTaskAction) {
              var targetAttr = customTaskAction.target === "_blank" ? ' target="_blank" rel="noopener noreferrer"' : "";
              html += '<a class="btn profile-btn-cancel" href="' + escapeAttribute(customTaskAction.url) + '"' + targetAttr + '>' + escapeHtml(customTaskAction.label) + '</a>';
            }
            html += '<button type="button" class="btn profile-btn-save" data-onboarding-complete-task="' + escapeAttribute(assignment.id) + '">Mark Task Complete</button>';
            html += '</div>';
          }

          html += '</article>';
          return html;
        }

        if (state.isCoachView) {
          html += '<p class="profile-section-copy"><strong>Submission:</strong> ' + escapeHtml(submittedLabel) + '</p>';
          if (assignment.response_data && Object.keys(assignment.response_data).length) {
            html += '<div class="profile-goals-list">';
            html += Object.keys(assignment.response_data)
              .map(function (key) {
                return '<div class="goal-list-item"><strong>' + escapeHtml(formatQuestionKeyLabel(key)) + '</strong><span>' + escapeHtml(String(assignment.response_data[key] || "—")) + '</span></div>';
              })
              .join('');
            html += '</div>';
          } else {
            html += '<p class="profile-empty-state-copy">No athlete responses submitted yet.</p>';
          }
          html += '<div class="profile-section-actions">';
          html += '<button type="button" class="btn profile-btn-cancel" data-onboarding-delete-assignment="' + escapeAttribute(assignment.id) + '">Delete Task</button>';
          html += '</div>';
          html += '</article>';
          return html;
        }

        var description = String(assignment.form_schema && assignment.form_schema.description || "").trim();
        if (description) {
          html += '<p class="profile-section-copy">' + escapeHtml(description) + '</p>';
        }

        html += '<div class="profile-section-actions">';
        html += '<button type="button" class="btn profile-btn-save" data-onboarding-open-form="' + escapeAttribute(assignment.id) + '">Complete Form</button>';
        html += '</div>';
        html += '</article>';
        return html;
      })
      .join("");

    renderCoachTaskFilterControls();
  }

  function renderCoachTaskFilterControls() {
    var filterEl = document.querySelector("[data-onboarding-coach-filter]");
    if (!filterEl) {
      return;
    }

    var isCoach = !!state.isCoachView;
    filterEl.hidden = !isCoach;
    if (!isCoach) {
      return;
    }

    var activeFilter = String(state.onboardingCoachTaskFilter || "active").toLowerCase();
    filterEl.querySelectorAll("[data-onboarding-coach-filter-btn]").forEach(function (btn) {
      var value = String(btn.getAttribute("data-onboarding-coach-filter-btn") || "").trim().toLowerCase();
      btn.classList.toggle("is-active", value === activeFilter);
    });
  }

  function buildOnboardingResponseFormHtml(assignment) {
    if (!assignment) {
      return '';
    }

    var schemaQuestions = Array.isArray(assignment.form_schema && assignment.form_schema.questions)
      ? assignment.form_schema.questions
      : [];

    var html = '';
    html += '<form data-onboarding-response-form data-assignment-id="' + escapeAttribute(assignment.id) + '">';
    if (!schemaQuestions.length) {
      html += '<p class="profile-empty-state-copy">This intake form has no questions configured.</p>';
    } else {
      html += schemaQuestions
        .map(function (question) {
          return buildOnboardingQuestionField(question, assignment.response_data || {});
        })
        .join('');
    }

    html += '<div class="profile-section-actions">';
    html += '<button type="submit" class="btn profile-btn-save">Save Task Responses</button>';
    html += '<button type="button" class="btn profile-btn-cancel" data-athlete-task-close>Cancel</button>';
    html += '</div>';
    html += '</form>';
    return html;
  }

  function isCustomCoachTaskAssignment(assignment) {
    if (!assignment) {
      return false;
    }

    var formId = String(assignment.form_id || "").trim();
    var taskType = String(assignment.form_schema && assignment.form_schema.task_type || "").trim().toLowerCase();

    return taskType === "custom_task" || formId.indexOf("coach-task-") === 0;
  }

  function getCustomTaskActionConfig(assignment) {
    var schema = assignment && assignment.form_schema && typeof assignment.form_schema === "object"
      ? assignment.form_schema
      : {};
    var url = String(schema.action_url || "").trim();
    if (!url) {
      return null;
    }

    return {
      url: url,
      label: String(schema.action_label || "Open Task").trim() || "Open Task",
      target: String(schema.action_target || "_self") === "_blank" ? "_blank" : "_self"
    };
  }

  function formatQuestionKeyLabel(key) {
    return String(key || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, function (char) {
        return char.toUpperCase();
      });
  }

  function buildOnboardingQuestionField(question, responseData) {
    var q = question && typeof question === "object" ? question : {};
    var key = String(q.key || "").trim();
    if (!key) {
      return "";
    }

    var label = String(q.label || formatQuestionKeyLabel(key));
    var type = String(q.type || "text").toLowerCase();
    var required = !!q.required;
    var value = responseData && Object.prototype.hasOwnProperty.call(responseData, key)
      ? String(responseData[key] || "")
      : "";

    var html = '';
    html += '<div class="form-group">';
    html += '<label>' + escapeHtml(label) + (required ? " *" : "") + '</label>';

    if (type === "textarea") {
      html += '<textarea name="q:' + escapeAttribute(key) + '" rows="' + escapeAttribute(String(q.rows || 3)) + '" placeholder="' + escapeAttribute(String(q.placeholder || "")) + '"' + (required ? ' required' : '') + '>' + escapeHtml(value) + '</textarea>';
    } else if (type === "select") {
      var options = Array.isArray(q.options) ? q.options : [];
      html += '<select name="q:' + escapeAttribute(key) + '"' + (required ? ' required' : '') + '>';
      html += '<option value="">Select...</option>';
      options.forEach(function (optionValue) {
        var optionText = String(optionValue || "");
        var selected = value === optionText ? ' selected' : '';
        html += '<option value="' + escapeAttribute(optionText) + '"' + selected + '>' + escapeHtml(optionText) + '</option>';
      });
      html += '</select>';
    } else {
      var inputType = ["number", "date", "email"].indexOf(type) > -1 ? type : "text";
      var minAttr = q.min != null ? ' min="' + escapeAttribute(String(q.min)) + '"' : "";
      var maxAttr = q.max != null ? ' max="' + escapeAttribute(String(q.max)) + '"' : "";
      var stepAttr = q.step != null ? ' step="' + escapeAttribute(String(q.step)) + '"' : "";
      html += '<input type="' + escapeAttribute(inputType) + '" name="q:' + escapeAttribute(key) + '" value="' + escapeAttribute(value) + '" placeholder="' + escapeAttribute(String(q.placeholder || "")) + '"' + minAttr + maxAttr + stepAttr + (required ? ' required' : '') + ' />';
    }

    html += '</div>';
    return html;
  }

  function onSubmitOnboardingResponse(assignmentId, formEl) {
    if (!state.client || !getViewedUserId() || !assignmentId || !formEl || state.isCoachView) {
      setOnboardingStatus("You cannot submit task responses from this view.", "error");
      return;
    }

    var assignment = (state.onboardingAssignments || []).find(function (item) {
      return String(item && item.id || "") === assignmentId;
    });

    if (!assignment) {
      setOnboardingStatus("Task assignment not found.", "error");
      return;
    }

    var formData = new FormData(formEl);
    var responses = {};
    formData.forEach(function (value, key) {
      if (String(key || "").indexOf("q:") !== 0) {
        return;
      }
      var responseKey = String(key).slice(2);
      responses[responseKey] = String(value || "").trim();
    });

    var requiredQuestions = Array.isArray(assignment.form_schema && assignment.form_schema.questions)
      ? assignment.form_schema.questions.filter(function (question) {
          return !!(question && question.required && question.key);
        })
      : [];

    var missingQuestion = requiredQuestions.find(function (question) {
      var key = String(question.key || "");
      return !String(responses[key] || "").trim();
    });
    if (missingQuestion) {
      setOnboardingStatus("Please complete required field: " + String(missingQuestion.label || missingQuestion.key), "error");
      setAthleteTaskModalStatus("Please complete required field: " + String(missingQuestion.label || missingQuestion.key), "error");
      return;
    }

    setOnboardingStatus("Saving task responses...", "info");
    setAthleteTaskModalStatus("Saving task responses...", "info");

    state.client
      .from("athlete_onboarding_intake_assignments")
      .update({
        response_data: responses,
        status: "submitted",
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", assignmentId)
      .eq("athlete_user_id", getViewedUserId())
      .then(function (result) {
        if (result.error) {
          setOnboardingStatus(result.error.message, "error");
          return;
        }

        maybeAdvanceFoundingStageAfterIntakeSubmission()
          .then(function (advanced) {
            if (advanced) {
              setOnboardingStatus("Task responses saved. Membership workflow advanced to assessment pending review.", "success");
              setAthleteTaskModalStatus("Task responses saved.", "success");
            } else {
              setOnboardingStatus("Task responses saved.", "success");
              setAthleteTaskModalStatus("Task responses saved.", "success");
            }
            closeAthleteTaskModal();
            loadOnboardingIntake();
          })
          .catch(function () {
            setOnboardingStatus("Task responses saved.", "success");
            setAthleteTaskModalStatus("Task responses saved.", "success");
            closeAthleteTaskModal();
            loadOnboardingIntake();
          });
      })
      .catch(function (error) {
        setOnboardingStatus(error && error.message ? error.message : "Failed to save task responses.", "error");
        setAthleteTaskModalStatus(error && error.message ? error.message : "Failed to save task responses.", "error");
      });
  }

  function openAthleteTaskModalByAssignmentId(assignmentId) {
    if (state.isCoachView) {
      return;
    }

    var assignment = (state.onboardingAssignments || []).find(function (item) {
      return String(item && item.id || "") === String(assignmentId || "");
    });

    if (!assignment || isCustomCoachTaskAssignment(assignment)) {
      setOnboardingStatus("Task assignment not found.", "error");
      return;
    }

    var modal = state.athleteTaskModal;
    if (!modal || !state.athleteTaskModalContent) {
      window.location.hash = "#profile-tasks-section";
      return;
    }

    var dueLabel = assignment.due_date ? formatDate(assignment.due_date) : "No due date";

    if (state.athleteTaskModalTitle) {
      state.athleteTaskModalTitle.textContent = String(assignment.form_name || "Complete Task Form");
    }
    if (state.athleteTaskModalMeta) {
      state.athleteTaskModalMeta.textContent = "Assigned " + formatDate(assignment.assigned_at) + " • Due " + dueLabel;
    }
    state.athleteTaskModalContent.innerHTML = buildOnboardingResponseFormHtml(assignment);
    setAthleteTaskModalStatus("", "info");

    modal.hidden = false;
    document.body.classList.add("admin-modal-open");
  }

  function closeAthleteTaskModal() {
    var modal = state.athleteTaskModal;
    if (!modal || modal.hidden) {
      return;
    }

    modal.hidden = true;
    document.body.classList.remove("admin-modal-open");

    if (state.athleteTaskModalContent) {
      state.athleteTaskModalContent.innerHTML = '<p class="admin-loading">Select a task to continue.</p>';
    }

    if (state.athleteTaskModalTitle) {
      state.athleteTaskModalTitle.textContent = "Complete Task Form";
    }
    if (state.athleteTaskModalMeta) {
      state.athleteTaskModalMeta.textContent = "";
    }

    setAthleteTaskModalStatus("", "info");
  }

  function setAthleteTaskModalStatus(message, variant) {
    if (!state.athleteTaskModalStatus) {
      return;
    }

    state.athleteTaskModalStatus.textContent = message || "";
    state.athleteTaskModalStatus.classList.remove("is-error", "is-success", "is-info");
    if (!message) {
      return;
    }

    if (variant === "error") {
      state.athleteTaskModalStatus.classList.add("is-error");
    } else if (variant === "success") {
      state.athleteTaskModalStatus.classList.add("is-success");
    } else {
      state.athleteTaskModalStatus.classList.add("is-info");
    }
  }

  function onMarkOnboardingTaskComplete(assignmentId) {
    if (!state.client || !getViewedUserId() || !assignmentId || state.isCoachView) {
      setOnboardingStatus("You cannot complete tasks from this view.", "error");
      return;
    }

    var assignment = (state.onboardingAssignments || []).find(function (item) {
      return String(item && item.id || "") === String(assignmentId || "");
    });

    if (!assignment) {
      setOnboardingStatus("Task assignment not found.", "error");
      return;
    }

    setOnboardingStatus("Marking task complete...", "info");

    var nowIso = new Date().toISOString();
    var isCustomTask = isCustomCoachTaskAssignment(assignment);
    var nextStatus = isCustomTask ? "archived" : "submitted";

    state.client
      .from("athlete_onboarding_intake_assignments")
      .update({
        response_data: {
          task_completed_at: nowIso,
          completion_type: "athlete_marked_complete"
        },
        status: nextStatus,
        submitted_at: nowIso,
        updated_at: nowIso
      })
      .eq("id", assignmentId)
      .eq("athlete_user_id", getViewedUserId())
      .then(function (result) {
        if (result.error) {
          setOnboardingStatus(result.error.message, "error");
          return;
        }

        maybeAdvanceFoundingStageAfterIntakeSubmission()
          .then(function (advanced) {
            if (advanced) {
              setOnboardingStatus("Task completed. Membership workflow advanced to assessment pending review.", "success");
            } else if (isCustomTask) {
              setOnboardingStatus("Task completed and archived.", "success");
            } else {
              setOnboardingStatus("Task completed.", "success");
            }
            loadOnboardingIntake();
          });
      })
      .catch(function (error) {
        setOnboardingStatus(error && error.message ? error.message : "Failed to complete task.", "error");
      });
  }

  function maybeAdvanceFoundingStageAfterIntakeSubmission() {
    if (!state.client || state.isCoachView || !getViewedUserId()) {
      return Promise.resolve(false);
    }

    var athleteUserId = getViewedUserId();

    return state.client
      .from("athlete_onboarding_intake_assignments")
      .select("id,status")
      .eq("athlete_user_id", athleteUserId)
      .then(function (assignmentsResult) {
        if (assignmentsResult.error) {
          throw assignmentsResult.error;
        }

        var allAssignments = Array.isArray(assignmentsResult.data) ? assignmentsResult.data : [];
        var activeAssignments = allAssignments.filter(function (item) {
          return String(item && item.status || "").toLowerCase() !== "archived";
        });

        if (!activeAssignments.length) {
          return false;
        }

        var hasPending = activeAssignments.some(function (item) {
          return String(item && item.status || "").toLowerCase() !== "submitted";
        });

        if (hasPending) {
          return false;
        }

        return state.client
          .from("founding_member_onboarding")
          .select("athlete_user_id,stage,is_founding_member")
          .eq("athlete_user_id", athleteUserId)
          .maybeSingle();
      })
      .then(function (onboardingResult) {
        if (onboardingResult === false) {
          return false;
        }

        if (!onboardingResult || onboardingResult.error) {
          if (onboardingResult && onboardingResult.error) {
            throw onboardingResult.error;
          }
          return false;
        }

        var onboardingRow = onboardingResult.data || null;
        if (!onboardingRow || onboardingRow.is_founding_member !== true) {
          return false;
        }

        var currentStage = String(onboardingRow.stage || "").trim();
        if (currentStage !== "welcome_pending_intakes") {
          return false;
        }

        return state.client
          .from("founding_member_onboarding")
          .update({
            stage: "intakes_completed_assessment_pending",
            welcome_completed_at: new Date().toISOString()
          })
          .eq("athlete_user_id", athleteUserId)
          .eq("stage", "welcome_pending_intakes")
          .select("athlete_user_id")
          .maybeSingle()
          .then(function (updateResult) {
            if (updateResult.error) {
              throw updateResult.error;
            }

            return !!(updateResult.data && updateResult.data.athlete_user_id);
          });
      })
      .catch(function () {
        return false;
      });
  }

  function openCoachIntakeModal() {
    if (!state.isCoachView || !state.client || !getViewedUserId()) {
      setOnboardingStatus("Unable to manage task forms right now.", "error");
      return;
    }

    var modal = document.querySelector("[data-coach-intake-modal]");
    if (!modal) {
      return;
    }

    var athleteLabel = document.querySelector("[data-coach-intake-athlete-label]");
    if (athleteLabel) {
      athleteLabel.textContent =
        "Athlete: " +
        ((state.profile && state.profile.name) || (state.viewUser && state.viewUser.email) || "Selected athlete");
    }

    if (state.coachIntakeSearch) {
      state.coachIntakeSearch.value = "";
    }
    if (state.coachIntakeDueDate) {
      state.coachIntakeDueDate.value = "";
    }
    if (state.coachTaskTitle) {
      state.coachTaskTitle.value = "";
    }
    if (state.coachTaskDescription) {
      state.coachTaskDescription.value = "";
    }

    state.selectedOnboardingTemplateId = "";
    state.isAssigningCoachTask = false;
    state.isAssigningQuickTask = false;
    setCoachIntakeAssignButtonsDisabled(false);
    setCoachIntakeStatus("", "info");
    modal.hidden = false;
    document.body.classList.add("admin-modal-open");
    renderCoachIntakeTemplateList("");
  }

  function closeCoachIntakeModal() {
    var modal = document.querySelector("[data-coach-intake-modal]");
    if (!modal || modal.hidden) {
      return;
    }

    modal.hidden = true;
    document.body.classList.remove("admin-modal-open");
    state.selectedOnboardingTemplateId = "";
    state.isAssigningCoachTask = false;
    state.isAssigningQuickTask = false;
    setCoachIntakeAssignButtonsDisabled(false);
    if (state.coachTaskTitle) {
      state.coachTaskTitle.value = "";
    }
    if (state.coachTaskDescription) {
      state.coachTaskDescription.value = "";
    }
    setCoachIntakeStatus("", "info");
  }

  function renderCoachIntakeTemplateList(searchTerm) {
    var list = document.querySelector("[data-coach-intake-list]");
    if (!list) {
      return;
    }

    var query = String(searchTerm || "").trim().toLowerCase();
    var filtered = (state.onboardingTemplates || []).filter(function (template) {
      if (!query) {
        return true;
      }
      return String(template && template.name || "").toLowerCase().indexOf(query) > -1;
    });

    if (!filtered.length) {
      list.innerHTML = '<p class="admin-loading">No task forms match this search.</p>';
      return;
    }

    list.innerHTML = filtered
      .map(function (template) {
        var checked = state.selectedOnboardingTemplateId === template.id ? " checked" : "";
        return (
          '<label class="admin-assign-item">' +
          '<input type="radio" name="coach-intake-template" data-coach-intake-template value="' +
          escapeAttribute(template.id) +
          '"' +
          checked +
          ' />' +
          '<span class="admin-assign-item-main">' +
          '<strong>' + escapeHtml(template.name || "Task Form") + '</strong>' +
          '<small>' + escapeHtml(template.description || "") + '</small>' +
          '</span>' +
          '</label>'
        );
      })
      .join("");

    list.querySelectorAll("[data-coach-intake-template]").forEach(function (radio) {
      radio.addEventListener("change", function () {
        state.selectedOnboardingTemplateId = String(radio.value || "");
      });
    });
  }

  function onAssignIntakeToCurrentAthlete() {
    var viewedUserId = getViewedUserId();
    if (!state.isCoachView || !viewedUserId || !state.client) {
      setCoachIntakeStatus("Unable to assign task form right now.", "error");
      return;
    }

    if (!state.selectedOnboardingTemplateId) {
      setCoachIntakeStatus("Select a task form to assign.", "error");
      return;
    }

    if (state.isAssigningCoachTask) {
      return;
    }

    var template = (state.onboardingTemplates || []).find(function (item) {
      return item.id === state.selectedOnboardingTemplateId;
    });
    if (!template) {
      setCoachIntakeStatus("Task form not found.", "error");
      return;
    }

    var dueDate = state.coachIntakeDueDate ? String(state.coachIntakeDueDate.value || "").trim() : "";
    var nowIso = new Date().toISOString();
    state.isAssigningCoachTask = true;
    setCoachIntakeAssignButtonsDisabled(true);
    setCoachIntakeStatus("Assigning task form...", "info");

    if (String(template.id || "") === MEMBERSHIP_PAYMENT_TASK_FORM_ID) {
      assignMembershipPaymentTaskFromCoachIntake(viewedUserId, dueDate)
        .finally(function () {
          state.isAssigningCoachTask = false;
          setCoachIntakeAssignButtonsDisabled(false);
        });
      return;
    }

    state.client
      .from("athlete_onboarding_intake_assignments")
      .select("id")
      .eq("athlete_user_id", viewedUserId)
      .eq("form_id", template.id)
      .eq("status", "assigned")
      .order("assigned_at", { ascending: false })
      .limit(1)
      .then(function (existingResult) {
        if (existingResult.error) {
          throw existingResult.error;
        }

        var alreadyAssigned = Array.isArray(existingResult.data) && existingResult.data.length > 0;
        if (alreadyAssigned) {
          setCoachIntakeStatus("This task is already assigned to the athlete.", "info");
          setOnboardingStatus("Task already assigned to athlete.", "info");
          setTimeout(function () {
            closeCoachIntakeModal();
            loadOnboardingIntake();
          }, 350);
          return null;
        }

        return state.client
      .from("athlete_onboarding_intake_assignments")
      .insert({
        athlete_user_id: viewedUserId,
        form_id: template.id,
        form_name: template.name,
        form_schema: buildCoachTemplateAssignmentSchema(template),
        response_data: {},
        status: "assigned",
        assigned_at: nowIso,
        assigned_by: state.user ? state.user.id : null,
        due_date: dueDate || null,
        updated_at: nowIso
      });
      })
      .then(function (result) {
        if (!result) {
          return;
        }

        if (result.error) {
          throw result.error;
        }

        setCoachIntakeStatus("Task form assigned.", "success");
        setOnboardingStatus("Task form assigned to athlete.", "success");
        setTimeout(function () {
          closeCoachIntakeModal();
          loadOnboardingIntake();
        }, 400);
      })
      .catch(function (error) {
        setCoachIntakeStatus(error && error.message ? error.message : "Failed to assign task form.", "error");
      })
      .finally(function () {
        state.isAssigningCoachTask = false;
        setCoachIntakeAssignButtonsDisabled(false);
      });
  }

  function buildCoachTemplateAssignmentSchema(template) {
    var source = template && typeof template === "object" ? template : {};
    var schema = {
      description: String(source.description || ""),
      questions: Array.isArray(source.questions) ? source.questions : []
    };

    if (source.task_type) {
      schema.task_type = String(source.task_type);
    }
    if (source.action_label) {
      schema.action_label = String(source.action_label);
    }
    if (source.action_url) {
      schema.action_url = String(source.action_url);
    }
    if (source.action_target) {
      schema.action_target = String(source.action_target);
    }

    return schema;
  }

  function assignMembershipPaymentTaskFromCoachIntake(athleteUserId, dueDate) {
    if (!state.client || !athleteUserId) {
      setCoachIntakeStatus("Unable to assign payment task right now.", "error");
      return Promise.resolve(false);
    }

    var dueDateValue = String(dueDate || "").trim() || null;

    return state.client
      .from("athlete_onboarding_intake_assignments")
      .select("id,status")
      .eq("athlete_user_id", athleteUserId)
      .eq("form_id", MEMBERSHIP_PAYMENT_TASK_FORM_ID)
      .neq("status", "archived")
      .order("assigned_at", { ascending: false })
      .limit(1)
      .then(function (lookupResult) {
        if (lookupResult.error) {
          setCoachIntakeStatus(lookupResult.error.message, "error");
          return false;
        }

        var existing = Array.isArray(lookupResult.data) && lookupResult.data.length
          ? lookupResult.data[0]
          : null;

        if (existing) {
          setCoachIntakeStatus("Membership payment task is already assigned.", "info");
          setOnboardingStatus("Membership payment task is already assigned to athlete.", "info");
          setTimeout(function () {
            closeCoachIntakeModal();
            loadOnboardingIntake();
          }, 400);
          return true;
        }

        var nowIso = new Date().toISOString();
        return state.client
          .from("athlete_onboarding_intake_assignments")
          .insert({
            athlete_user_id: athleteUserId,
            form_id: MEMBERSHIP_PAYMENT_TASK_FORM_ID,
            form_name: MEMBERSHIP_PAYMENT_TASK_NAME,
            form_schema: buildCoachTemplateAssignmentSchema({
              description: "You are approved for membership. Complete payment to activate coaching access.",
              task_type: "custom_task",
              action_label: "Open Payment",
              action_url: MEMBERSHIP_PAYMENT_TASK_URL,
              action_target: "_self",
              questions: []
            }),
            response_data: {},
            status: "assigned",
            assigned_at: nowIso,
            assigned_by: state.user ? state.user.id : null,
            due_date: dueDateValue,
            updated_at: nowIso
          })
          .then(function (insertResult) {
            if (insertResult.error) {
              setCoachIntakeStatus(insertResult.error.message, "error");
              return false;
            }

            setCoachIntakeStatus("Membership payment task assigned.", "success");
            setOnboardingStatus("Membership payment task assigned to athlete.", "success");
            setTimeout(function () {
              closeCoachIntakeModal();
              loadOnboardingIntake();
            }, 400);
            return true;
          });
      })
      .catch(function (error) {
        setCoachIntakeStatus(error && error.message ? error.message : "Failed to assign payment task.", "error");
        return false;
      });
  }

  function onAssignQuickTaskToCurrentAthlete() {
    var viewedUserId = getViewedUserId();
    if (!state.isCoachView || !viewedUserId || !state.client) {
      setCoachIntakeStatus("Unable to assign quick task right now.", "error");
      return;
    }

    var taskTitle = String(state.coachTaskTitle && state.coachTaskTitle.value || "").trim();
    var taskDescription = String(state.coachTaskDescription && state.coachTaskDescription.value || "").trim();
    if (!taskTitle) {
      setCoachIntakeStatus("Enter a quick task title.", "error");
      return;
    }

    if (state.isAssigningQuickTask) {
      return;
    }

    var dueDate = state.coachIntakeDueDate ? String(state.coachIntakeDueDate.value || "").trim() : "";
    var nowIso = new Date().toISOString();
    var taskFormId = "coach-task-" + Date.now();

    state.isAssigningQuickTask = true;
    setCoachIntakeAssignButtonsDisabled(true);

    setCoachIntakeStatus("Assigning quick task...", "info");

    state.client
      .from("athlete_onboarding_intake_assignments")
      .insert({
        athlete_user_id: viewedUserId,
        form_id: taskFormId,
        form_name: taskTitle,
        form_schema: {
          task_type: "custom_task",
          description: taskDescription,
          questions: []
        },
        response_data: {},
        status: "assigned",
        assigned_at: nowIso,
        assigned_by: state.user ? state.user.id : null,
        due_date: dueDate || null,
        updated_at: nowIso
      })
      .then(function (result) {
        if (result.error) {
          setCoachIntakeStatus(result.error.message, "error");
          return;
        }

        setCoachIntakeStatus("Quick task assigned.", "success");
        setOnboardingStatus("Quick coach task assigned to athlete.", "success");
        setTimeout(function () {
          closeCoachIntakeModal();
          loadOnboardingIntake();
        }, 400);
      })
      .catch(function (error) {
        setCoachIntakeStatus(error && error.message ? error.message : "Failed to assign quick task.", "error");
      })
      .finally(function () {
        state.isAssigningQuickTask = false;
        setCoachIntakeAssignButtonsDisabled(false);
      });
  }

  function onDeleteOnboardingAssignment(assignmentId) {
    if (!state.client || !state.isCoachView || !getViewedUserId() || !assignmentId) {
      setOnboardingStatus("Unable to delete this task from current view.", "error");
      return;
    }

    var confirmed = window.confirm("Delete this task assignment for the athlete? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    setOnboardingStatus("Deleting task...", "info");

    state.client
      .from("athlete_onboarding_intake_assignments")
      .delete()
      .eq("id", assignmentId)
      .eq("athlete_user_id", getViewedUserId())
      .then(function (result) {
        if (result.error) {
          setOnboardingStatus(result.error.message, "error");
          return;
        }

        setOnboardingStatus("Task deleted.", "success");
        loadOnboardingIntake();
      })
      .catch(function (error) {
        setOnboardingStatus(error && error.message ? error.message : "Failed to delete task.", "error");
      });
  }

  function setCoachIntakeAssignButtonsDisabled(disabled) {
    var isDisabled = !!disabled;
    var assignBtn = document.querySelector("[data-coach-intake-assign]");
    var quickBtn = document.querySelector("[data-coach-intake-assign-quick]");

    if (assignBtn) {
      assignBtn.disabled = isDisabled;
    }
    if (quickBtn) {
      quickBtn.disabled = isDisabled;
    }
  }

  function setOnboardingStatus(message, variant) {
    if (!state.onboardingStatus) {
      return;
    }

    state.onboardingStatus.textContent = message || "";
    state.onboardingStatus.classList.remove("is-error", "is-success", "is-info");
    if (!message) {
      return;
    }

    if (variant === "error") {
      state.onboardingStatus.classList.add("is-error");
    } else if (variant === "success") {
      state.onboardingStatus.classList.add("is-success");
    } else {
      state.onboardingStatus.classList.add("is-info");
    }
  }

  function setCoachIntakeStatus(message, variant) {
    var statusEl = document.querySelector("[data-coach-intake-status]");
    if (!statusEl) {
      return;
    }

    statusEl.textContent = message || "";
    statusEl.classList.remove("is-error", "is-success", "is-info");
    if (!message) {
      return;
    }

    if (variant === "error") {
      statusEl.classList.add("is-error");
    } else if (variant === "success") {
      statusEl.classList.add("is-success");
    } else {
      statusEl.classList.add("is-info");
    }
  }

  function loadGoalItems() {
    if (!state.client || !getViewedUserId()) {
      return;
    }

    setGoalsStatus("Loading goals and milestones...", "info");

    state.client
      .from("athlete_goals_events")
      .select("id,user_id,title,goal_type,target_date,details,status,created_at,updated_at")
      .eq("user_id", getViewedUserId())
      .order("target_date", { ascending: true })
      .order("created_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          if (isMissingRelationError(result.error)) {
            state.goalItems = readGoalFallbackItems(getViewedUserId());
            renderGoalItems();
            refreshTrainingProgramsCalendarFromState();
            setGoalsStatus(
              "Goals table not found yet. Run the goals SQL migration to sync goals with coach dashboard.",
              "error"
            );
            return;
          }

          setGoalsStatus(result.error.message, "error");
          return;
        }

        state.goalItems = (result.data || []).map(normalizeGoalItem);
        writeGoalFallbackItems(getViewedUserId(), state.goalItems);
        renderGoalItems();
        refreshTrainingProgramsCalendarFromState();
        setGoalsStatus("", "info");
      })
      .catch(function (error) {
        setGoalsStatus(error && error.message ? error.message : "Failed to load goals.", "error");
      });
  }

  function normalizeGoalItem(item) {
    return {
      id: String(item && item.id || ""),
      user_id: String(item && item.user_id || getViewedUserId() || ""),
      title: String(item && item.title || "").trim(),
      goal_type: String(item && item.goal_type || "goal").trim() || "goal",
      target_date: item && item.target_date ? String(item.target_date) : "",
      details: String(item && item.details || "").trim(),
      status: String(item && item.status || "active").trim() || "active",
      created_at: item && item.created_at ? String(item.created_at) : new Date().toISOString(),
      updated_at: item && item.updated_at ? String(item.updated_at) : new Date().toISOString()
    };
  }

  function renderGoalItems() {
    if (!state.goalsList || !state.goalsCountdown) {
      return;
    }

    var goalsSectionEl = document.getElementById("profile-goals-section");

    var items = (state.goalItems || [])
      .slice()
      .sort(function (a, b) {
        var aCompleted = String(a.status || "active") === "completed" ? 1 : 0;
        var bCompleted = String(b.status || "active") === "completed" ? 1 : 0;
        if (aCompleted !== bCompleted) {
          return aCompleted - bCompleted;
        }

        var aDate = a.target_date || "9999-12-31";
        var bDate = b.target_date || "9999-12-31";
        if (aDate !== bDate) {
          return aDate.localeCompare(bDate);
        }
        return String(b.created_at || "").localeCompare(String(a.created_at || ""));
      });

    updateQuickGlanceGoals(items);

    renderGoalCountdown(items);

    if (!items.length) {
      if (goalsSectionEl) {
        goalsSectionEl.classList.add("is-goals-empty");
      }

      updateGoalsToggleButton(0, 0);
      state.goalsList.innerHTML =
        '<div class="profile-empty-state">' +
          '<p class="profile-empty-state-title">No goals or events yet</p>' +
          '<p class="profile-empty-state-copy">Add your next race, event, or milestone to keep training focused and measurable.</p>' +
        '</div>';
      return;
    }

    if (goalsSectionEl) {
      goalsSectionEl.classList.remove("is-goals-empty");
    }

    var defaultGoalCount = 2;
    var visibleCount = state.goalsShowAll ? items.length : Math.min(defaultGoalCount, items.length);
    var visibleItems = items.slice(0, visibleCount);
    updateGoalsToggleButton(items.length, visibleCount);

    state.goalsList.innerHTML = visibleItems
      .map(function (item) {
        var isCompleted = String(item.status || "active") === "completed";
        var daysUntil = getDaysUntilDate(item.target_date);
        var countdown = "";

        if (typeof daysUntil === "number") {
          if (daysUntil > 0) {
            countdown = daysUntil + " days away";
          } else if (daysUntil === 0) {
            countdown = "Today";
          } else {
            countdown = Math.abs(daysUntil) + " days ago";
          }
        }

        return (
          '<article class="profile-goal-item ' + (isCompleted ? 'is-completed' : '') + '">' +
            '<div class="profile-goal-main">' +
              '<div class="profile-goal-top">' +
                '<span class="profile-goal-type">' + escapeHtml(getGoalTypeLabel(item.goal_type)) + '</span>' +
                '<span class="profile-goal-status-chip ' + (isCompleted ? 'is-completed' : 'is-active') + '">' + (isCompleted ? 'Completed' : 'Active') + '</span>' +
                (item.target_date ? '<span class="profile-goal-date">' + escapeHtml(formatGoalDate(item.target_date)) + '</span>' : '<span class="profile-goal-date is-empty">No target date</span>') +
              '</div>' +
              '<h3>' + escapeHtml(item.title || 'Untitled goal') + '</h3>' +
              (item.details ? '<p class="profile-goal-details">' + escapeHtml(item.details) + '</p>' : '') +
              (countdown ? '<p class="profile-goal-countdown-inline">' + escapeHtml(countdown) + '</p>' : '') +
            '</div>' +
          '</article>'
        );
      })
      .join("");

  }

  function applyGoalsListPreference() {
    var showAll = false;
    try {
      showAll = window.localStorage.getItem(GOALS_VIEW_ALL_KEY) === "1";
    } catch (_error) {
      showAll = false;
    }
    state.goalsShowAll = !!showAll;
  }

  function toggleGoalsListView() {
    state.goalsShowAll = !state.goalsShowAll;

    try {
      window.localStorage.setItem(GOALS_VIEW_ALL_KEY, state.goalsShowAll ? "1" : "0");
    } catch (_error) {
      /* localStorage may be unavailable */
    }

    renderGoalItems();
  }

  function updateGoalsToggleButton(totalCount, visibleCount) {
    if (!state.goalsToggleButton) {
      return;
    }

    var shouldShow = totalCount > 2;
    state.goalsToggleButton.hidden = !shouldShow;
    if (!shouldShow) {
      return;
    }

    if (state.goalsShowAll) {
      state.goalsToggleButton.textContent = "Show Fewer Goals";
      return;
    }

    state.goalsToggleButton.textContent = "Show All Goals (" + String(totalCount - visibleCount) + " more)";
  }

  function renderGoalCountdown(items) {
    var activeUpcoming = (items || []).filter(function (item) {
      if (String(item.status || "active") === "completed") {
        return false;
      }
      return !!item.target_date;
    }).sort(function (a, b) {
      return String(a.target_date || "").localeCompare(String(b.target_date || ""));
    });

    if (!activeUpcoming.length) {
      state.goalsCountdown.innerHTML =
        '<div class="profile-goals-countdown-card is-empty">' +
          '<p class="profile-goals-countdown-label">Next Event</p>' +
          '<strong>Add a dated event to start your countdown</strong>' +
          (!state.isCoachView
            ? '<a href="' + escapeAttribute(getGoalsPageHref()) + '" class="btn profile-btn-cancel profile-goals-empty-action">Set First Event</a>'
            : '') +
        '</div>';
      return;
    }

    var nextItem = activeUpcoming[0];
    var daysUntil = getDaysUntilDate(nextItem.target_date);
    var countdownText;
    if (typeof daysUntil !== "number") {
      countdownText = "Date unavailable";
    } else if (daysUntil > 0) {
      countdownText = daysUntil + " days";
    } else if (daysUntil === 0) {
      countdownText = "Today";
    } else {
      countdownText = Math.abs(daysUntil) + " days ago";
    }

    state.goalsCountdown.innerHTML =
      '<div class="profile-goals-countdown-card">' +
        '<p class="profile-goals-countdown-label">Next ' + escapeHtml(getGoalTypeLabel(nextItem.goal_type)) + '</p>' +
        '<strong>' + escapeHtml(nextItem.title || 'Upcoming event') + '</strong>' +
        '<p class="profile-goals-countdown-meta">' + escapeHtml(formatGoalDate(nextItem.target_date)) + ' • ' + escapeHtml(countdownText) + '</p>' +
      '</div>';
  }

  function getGoalTypeLabel(goalType) {
    var value = String(goalType || "goal").toLowerCase();
    if (value === "specific_goal") return "Specific Goal";
    if (value === "race") return "Race";
    if (value === "event") return "Event";
    if (value === "trip") return "Trip";
    if (value === "milestone") return "Milestone";
    return "General Goal";
  }

  function getDaysUntilDate(dateKey) {
    if (!dateKey) {
      return null;
    }

    var target = new Date(String(dateKey) + "T00:00:00");
    if (Number.isNaN(target.getTime())) {
      return null;
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  function formatGoalDate(dateKey) {
    if (!dateKey) {
      return "No target date";
    }

    try {
      var date = new Date(String(dateKey) + "T00:00:00");
      if (Number.isNaN(date.getTime())) {
        return dateKey;
      }

      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch (e) {
      return dateKey;
    }
  }

  function setGoalsStatus(message, variant) {
    if (!state.goalsStatus) {
      return;
    }

    state.goalsStatus.textContent = message || "";
    state.goalsStatus.classList.remove("is-error", "is-success", "is-info");

    if (!message) {
      return;
    }

    if (variant === "error") {
      state.goalsStatus.classList.add("is-error");
    } else if (variant === "success") {
      state.goalsStatus.classList.add("is-success");
    } else {
      state.goalsStatus.classList.add("is-info");
    }
  }

  function readGoalFallbackItems(userId) {
    var map = readGoalFallbackMap();
    var key = String(userId || "");
    var rows = map[key];
    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map(normalizeGoalItem);
  }

  function writeGoalFallbackItems(userId, rows) {
    var key = String(userId || "");
    if (!key) {
      return;
    }

    var map = readGoalFallbackMap();
    map[key] = Array.isArray(rows) ? rows.map(normalizeGoalItem) : [];

    try {
      window.localStorage.setItem(GOALS_FALLBACK_KEY, JSON.stringify(map));
    } catch (e) {
      // Local storage can fail in private browsing modes.
    }
  }

  function readGoalFallbackMap() {
    try {
      var raw = window.localStorage.getItem(GOALS_FALLBACK_KEY);
      if (!raw) {
        return {};
      }

      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function loadNutritionData() {
    if (!state.client || !getViewedUserId()) {
      return;
    }

    if (state.nutritionSummary) {
      state.nutritionSummary.innerHTML = '<p class="profile-loading">Loading nutrition summary...</p>';
    }
    if (state.nutritionList) {
      state.nutritionList.innerHTML = '<p class="profile-loading">Loading nutrition log history...</p>';
    }

    resetNutritionLogForm(false);
    setNutritionStatus("Loading nutrition logs and targets...", "info");

    Promise.all([loadNutritionTargets(), loadNutritionLogs()])
      .then(function () {
        renderNutritionDashboard();
        if (!state.nutritionLogsAvailable || !state.nutritionTargetsAvailable) {
          setNutritionStatus(
            "Nutrition tables are not set up yet. Entries are saved locally until SQL migration is applied.",
            "info"
          );
          return;
        }

        setNutritionStatus("", "info");
      })
      .catch(function (error) {
        setNutritionStatus(error && error.message ? error.message : "Failed to load nutrition tracking data.", "error");
      });
  }

  function loadNutritionTargets() {
    var userId = getViewedUserId();
    if (!state.client || !userId) {
      state.nutritionTargets = null;
      return Promise.resolve(null);
    }

    return state.client
      .from("athlete_nutrition_targets")
      .select("id,user_id,target_calories,target_protein_g,target_carbs_g,target_fats_g,target_hydration_l,target_fiber_g,updated_at")
      .eq("user_id", userId)
      .maybeSingle()
      .then(function (result) {
        if (result.error) {
          if (isMissingRelationError(result.error)) {
            state.nutritionTargetsAvailable = false;
            state.nutritionTargets = readNutritionTargetsFallback(userId);
            return state.nutritionTargets;
          }

          throw result.error;
        }

        state.nutritionTargetsAvailable = true;
        state.nutritionTargets = result.data ? normalizeNutritionTargets(result.data) : null;
        writeNutritionTargetsFallback(userId, state.nutritionTargets);
        return state.nutritionTargets;
      });
  }

  function loadNutritionLogs() {
    var userId = getViewedUserId();
    if (!state.client || !userId) {
      state.nutritionLogs = [];
      return Promise.resolve([]);
    }

    return state.client
      .from("athlete_nutrition_logs")
      .select("id,user_id,logged_on,calories,protein_g,carbs_g,fats_g,fiber_g,hydration_l,meal_quality,energy_level,hunger_level,notes,created_at,updated_at")
      .eq("user_id", userId)
      .order("logged_on", { ascending: false })
      .limit(180)
      .then(function (result) {
        if (result.error) {
          if (isMissingRelationError(result.error)) {
            state.nutritionLogsAvailable = false;
            state.nutritionLogs = readNutritionLogsFallback(userId);
            return state.nutritionLogs;
          }

          throw result.error;
        }

        state.nutritionLogsAvailable = true;
        state.nutritionLogs = (result.data || []).map(normalizeNutritionLog);
        writeNutritionLogsFallback(userId, state.nutritionLogs);
        return state.nutritionLogs;
      });
  }

  function normalizeNutritionLog(row) {
    return {
      id: String(row && row.id || ""),
      user_id: String(row && row.user_id || getViewedUserId() || ""),
      logged_on: String(row && row.logged_on || ""),
      calories: parseOptionalNumber(row && row.calories, 0),
      protein_g: parseOptionalNumber(row && row.protein_g, 0),
      carbs_g: parseOptionalNumber(row && row.carbs_g, 0),
      fats_g: parseOptionalNumber(row && row.fats_g, 0),
      fiber_g: parseOptionalNumber(row && row.fiber_g, 0),
      hydration_l: parseOptionalNumber(row && row.hydration_l, 0),
      meal_quality: parseOptionalRating(row && row.meal_quality),
      energy_level: parseOptionalRating(row && row.energy_level),
      hunger_level: parseOptionalRating(row && row.hunger_level),
      notes: String(row && row.notes || "").trim(),
      created_at: row && row.created_at ? String(row.created_at) : new Date().toISOString(),
      updated_at: row && row.updated_at ? String(row.updated_at) : new Date().toISOString()
    };
  }

  function normalizeNutritionTargets(row) {
    return {
      id: String(row && row.id || ""),
      user_id: String(row && row.user_id || getViewedUserId() || ""),
      target_calories: parseOptionalNumber(row && row.target_calories, 0),
      target_protein_g: parseOptionalNumber(row && row.target_protein_g, 0),
      target_carbs_g: parseOptionalNumber(row && row.target_carbs_g, 0),
      target_fats_g: parseOptionalNumber(row && row.target_fats_g, 0),
      target_hydration_l: parseOptionalNumber(row && row.target_hydration_l, 0),
      target_fiber_g: parseOptionalNumber(row && row.target_fiber_g, 0),
      updated_at: row && row.updated_at ? String(row.updated_at) : new Date().toISOString()
    };
  }

  function renderNutritionDashboard() {
    renderNutritionTodayProgress();
    renderNutritionSummary();
    updateQuickGlanceNutrition();
  }

  function renderNutritionTodayProgress() {
    if (!state.nutritionToday) {
      return;
    }

    var logs = sortNutritionLogs(state.nutritionLogs || []);
    var todayKey = getTodayDateInputValue();
    var todayLog = logs.find(function (log) {
      return String(log.logged_on || "") === todayKey;
    }) || null;
    var targets = state.nutritionTargets || {};

    var metrics = [
      { key: "calories", targetKey: "target_calories", label: "Calories", unit: "kcal", decimals: 0 },
      { key: "protein_g", targetKey: "target_protein_g", label: "Protein", unit: "g", decimals: 0 },
      { key: "carbs_g", targetKey: "target_carbs_g", label: "Carbs", unit: "g", decimals: 0 },
      { key: "fats_g", targetKey: "target_fats_g", label: "Fat", unit: "g", decimals: 0 },
      { key: "fiber_g", targetKey: "target_fiber_g", label: "Fiber", unit: "g", decimals: 0 },
      { key: "hydration_l", targetKey: "target_hydration_l", label: "Hydration", unit: "L", decimals: 1 }
    ];

    state.nutritionToday.innerHTML = metrics.map(function (metric) {
      var consumed = todayLog && Number.isFinite(todayLog[metric.key]) ? todayLog[metric.key] : null;
      var target = Number.isFinite(targets[metric.targetKey]) ? targets[metric.targetKey] : null;
      var remaining = (target != null && consumed != null) ? Math.max(target - consumed, 0) : null;
      var pct = (target != null && target > 0 && consumed != null)
        ? Math.max(0, Math.min((consumed / target) * 100, 100))
        : 0;

      return (
        '<article class="profile-nutrition-progress-card">' +
          '<div class="profile-nutrition-progress-head">' +
            '<span class="profile-nutrition-progress-label">' + escapeHtml(metric.label) + '</span>' +
            '<strong class="profile-nutrition-progress-value">' +
              escapeHtml(formatNutritionValue(consumed, metric.decimals, metric.unit)) +
              ' / ' +
              escapeHtml(formatNutritionValue(target, metric.decimals, metric.unit)) +
            '</strong>' +
          '</div>' +
          '<div class="profile-nutrition-progress-bar"><span style="width:' + escapeAttribute(formatDecimal(pct, 0)) + '%"></span></div>' +
          '<p class="profile-nutrition-progress-meta">Remaining: ' + escapeHtml(formatNutritionValue(remaining, metric.decimals, metric.unit)) + '</p>' +
        '</article>'
      );
    }).join("");
  }

  function renderNutritionTargetsForm() {
    if (!state.nutritionTargetsForm) {
      return;
    }

    var form = state.nutritionTargetsForm;
    var targets = state.nutritionTargets || {};

    setInputValue(form, "target_calories", targets.target_calories);
    setInputValue(form, "target_protein_g", targets.target_protein_g);
    setInputValue(form, "target_carbs_g", targets.target_carbs_g);
    setInputValue(form, "target_fats_g", targets.target_fats_g);
    setInputValue(form, "target_hydration_l", targets.target_hydration_l);
    setInputValue(form, "target_fiber_g", targets.target_fiber_g);
  }

  function renderNutritionSummary() {
    if (!state.nutritionSummary) {
      return;
    }

    var logs = sortNutritionLogs(state.nutritionLogs || []);
    if (!logs.length) {
      state.nutritionSummary.innerHTML =
        '<div class="profile-empty-state">' +
          '<p class="profile-empty-state-title">No nutrition logs yet</p>' +
          '<p class="profile-empty-state-copy">Track today\'s meals to unlock progress and target adherence insights.</p>' +
        '</div>';
      return;
    }

    var recent = logs.slice(0, 7);
    var averages = {
      calories: averageNumeric(recent, "calories"),
      protein_g: averageNumeric(recent, "protein_g"),
      carbs_g: averageNumeric(recent, "carbs_g"),
      fats_g: averageNumeric(recent, "fats_g"),
      fiber_g: averageNumeric(recent, "fiber_g"),
      hydration_l: averageNumeric(recent, "hydration_l")
    };

    var adherence = calculateNutritionAdherence(averages, state.nutritionTargets);
    var lastLogged = logs[0] && logs[0].logged_on ? formatGoalDate(logs[0].logged_on) : "-";

    var cards = [
      { label: "Last Logged", value: lastLogged },
      { label: "7-Day Logs", value: String(recent.length) },
      { label: "7d Avg Calories", value: formatNullableNumber(averages.calories, " kcal") },
      { label: "7d Avg Protein", value: formatNullableNumber(averages.protein_g, " g") },
      { label: "7d Avg Carbs", value: formatNullableNumber(averages.carbs_g, " g") },
      { label: "7d Avg Fat", value: formatNullableNumber(averages.fats_g, " g") },
      { label: "Target Adherence", value: adherence }
    ];

    state.nutritionSummary.innerHTML = cards
      .map(function (item) {
        return (
          '<article class="profile-nutrition-summary-card">' +
            '<span class="profile-nutrition-summary-card-label">' + escapeHtml(item.label) + "</span>" +
            '<strong class="profile-nutrition-summary-card-value">' + escapeHtml(item.value) + "</strong>" +
          "</article>"
        );
      })
      .join("");
  }

  function formatNutritionValue(value, decimals, unit) {
    if (value == null || !Number.isFinite(value)) {
      return "--";
    }

    var places = Number.isFinite(decimals) ? decimals : 0;
    var text = formatDecimal(value, places);
    return unit ? text + " " + unit : text;
  }

  function renderNutritionList() {
    if (!state.nutritionList) {
      return;
    }

    var logs = sortNutritionLogs(state.nutritionLogs || []);
    if (!logs.length) {
      state.nutritionList.innerHTML =
        '<div class="profile-empty-state">' +
          '<p class="profile-empty-state-title">No nutrition history yet</p>' +
          '<p class="profile-empty-state-copy">Log meals to build your daily and weekly trend history.</p>' +
          '<a href="' + escapeAttribute(state.nutritionManageLink && state.nutritionManageLink.href ? state.nutritionManageLink.href : "athlete-nutrition.html") + '" class="btn profile-btn-cancel">Open Nutrition Log</a>' +
        '</div>';
      return;
    }

    var visible = logs.slice(0, 10);
    state.nutritionList.innerHTML = visible
      .map(function (log) {
        var chips = [];
        var mealName = extractMealNameFromNotes(log.notes);
        var visibleNotes = extractVisibleNutritionNotes(log.notes);
        if (log.calories != null) chips.push("Calories " + formatInteger(log.calories));
        if (log.protein_g != null) chips.push("Protein " + formatInteger(log.protein_g) + "g");
        if (log.carbs_g != null) chips.push("Carbs " + formatInteger(log.carbs_g) + "g");
        if (log.fats_g != null) chips.push("Fat " + formatInteger(log.fats_g) + "g");
        if (log.fiber_g != null) chips.push("Fiber " + formatInteger(log.fiber_g) + "g");
        if (log.hydration_l != null) chips.push("Hydration " + formatDecimal(log.hydration_l, 1) + "L");
        if (mealName) chips.unshift("Meal " + mealName);

        return (
          '<article class="profile-nutrition-log-item">' +
            '<div class="profile-nutrition-log-head">' +
              '<h3 class="profile-nutrition-log-date">' + escapeHtml(formatGoalDate(log.logged_on)) + "</h3>" +
              '<button type="button" class="profile-nutrition-log-delete" data-nutrition-delete="' +
                escapeAttribute(log.id || "") +
                '" data-nutrition-date="' +
                escapeAttribute(log.logged_on || "") +
              '">Delete</button>' +
            "</div>" +
            '<div class="profile-nutrition-log-grid">' +
              chips.map(function (chip) {
                return '<span class="profile-nutrition-chip">' + escapeHtml(chip) + "</span>";
              }).join("") +
            "</div>" +
            (visibleNotes ? '<p class="profile-nutrition-notes">' + escapeHtml(visibleNotes) + "</p>" : "") +
          "</article>"
        );
      })
      .join("");
  }

  function extractMealNameFromNotes(notes) {
    var text = String(notes || "").trim();
    if (!text) {
      return "";
    }

    var firstLine = text.split(/\r?\n/)[0] || "";
    var match = firstLine.match(/^\[Meal\]\s*(.+)$/i);
    return match ? String(match[1] || "").trim() : "";
  }

  function extractVisibleNutritionNotes(notes) {
    var text = String(notes || "").trim();
    if (!text) {
      return "";
    }

    if (!/^\[Meal\]\s*/i.test(text)) {
      return text;
    }

    var lines = text.split(/\r?\n/);
    lines.shift();
    return lines.join("\n").trim();
  }

  function onNutritionTargetsSubmit(event) {
    event.preventDefault();

    var userId = getViewedUserId();
    if (!userId || !state.nutritionTargetsForm) {
      setNutritionStatus("No athlete selected.", "error");
      return;
    }

    var formData = new FormData(state.nutritionTargetsForm);
    var payload = normalizeNutritionTargets({
      id: state.nutritionTargets && state.nutritionTargets.id ? state.nutritionTargets.id : "",
      user_id: userId,
      target_calories: formData.get("target_calories"),
      target_protein_g: formData.get("target_protein_g"),
      target_carbs_g: formData.get("target_carbs_g"),
      target_fats_g: formData.get("target_fats_g"),
      target_hydration_l: formData.get("target_hydration_l"),
      target_fiber_g: formData.get("target_fiber_g"),
      updated_at: new Date().toISOString()
    });

    setNutritionStatus("Saving nutrition targets...", "info");

    if (!state.nutritionTargetsAvailable) {
      state.nutritionTargets = payload;
      writeNutritionTargetsFallback(userId, payload);
      renderNutritionDashboard();
      setNutritionStatus("Nutrition targets saved locally (pending database migration).", "success");
      return;
    }

    state.client
      .from("athlete_nutrition_targets")
      .upsert([payload], { onConflict: "user_id" })
      .select("id,user_id,target_calories,target_protein_g,target_carbs_g,target_fats_g,target_hydration_l,target_fiber_g,updated_at")
      .maybeSingle()
      .then(function (result) {
        if (result.error) {
          if (isMissingRelationError(result.error)) {
            state.nutritionTargetsAvailable = false;
            state.nutritionTargets = payload;
            writeNutritionTargetsFallback(userId, payload);
            renderNutritionDashboard();
            setNutritionStatus("Nutrition targets saved locally. Run nutrition SQL migration to sync cloud data.", "info");
            return;
          }

          setNutritionStatus(result.error.message, "error");
          return;
        }

        state.nutritionTargets = normalizeNutritionTargets(result.data || payload);
        writeNutritionTargetsFallback(userId, state.nutritionTargets);
        renderNutritionDashboard();
        setNutritionStatus("Nutrition targets saved.", "success");
      })
      .catch(function (error) {
        setNutritionStatus(error && error.message ? error.message : "Failed to save nutrition targets.", "error");
      });
  }

  function onNutritionLogSubmit(event) {
    event.preventDefault();

    var userId = getViewedUserId();
    if (!userId || !state.nutritionForm) {
      setNutritionStatus("No athlete selected.", "error");
      return;
    }

    var formData = new FormData(state.nutritionForm);
    var loggedOn = String(formData.get("logged_on") || "").trim();
    if (!loggedOn) {
      setNutritionStatus("Select a date for the nutrition log.", "error");
      return;
    }

    var payload = normalizeNutritionLog({
      user_id: userId,
      logged_on: loggedOn,
      calories: formData.get("calories"),
      protein_g: formData.get("protein_g"),
      carbs_g: formData.get("carbs_g"),
      fats_g: formData.get("fats_g"),
      fiber_g: formData.get("fiber_g"),
      hydration_l: formData.get("hydration_l"),
      meal_quality: formData.get("meal_quality"),
      energy_level: formData.get("energy_level"),
      hunger_level: formData.get("hunger_level"),
      notes: formData.get("notes"),
      updated_at: new Date().toISOString()
    });

    if (!nutritionLogHasContent(payload)) {
      setNutritionStatus("Add at least one nutrition value or note before saving.", "error");
      return;
    }

    setNutritionStatus("Saving nutrition log...", "info");

    if (!state.nutritionLogsAvailable) {
      payload.id = payload.id || "local-" + payload.logged_on;
      replaceNutritionLog(payload);
      writeNutritionLogsFallback(userId, state.nutritionLogs);
      renderNutritionDashboard();
      resetNutritionLogForm(true);
      setNutritionStatus("Nutrition log saved locally (pending database migration).", "success");
      return;
    }

    state.client
      .from("athlete_nutrition_logs")
      .upsert([payload], { onConflict: "user_id,logged_on" })
      .select("id,user_id,logged_on,calories,protein_g,carbs_g,fats_g,fiber_g,hydration_l,meal_quality,energy_level,hunger_level,notes,created_at,updated_at")
      .then(function (result) {
        if (result.error) {
          if (isMissingRelationError(result.error)) {
            state.nutritionLogsAvailable = false;
            payload.id = payload.id || "local-" + payload.logged_on;
            replaceNutritionLog(payload);
            writeNutritionLogsFallback(userId, state.nutritionLogs);
            renderNutritionDashboard();
            resetNutritionLogForm(true);
            setNutritionStatus("Nutrition log saved locally. Run nutrition SQL migration to sync cloud data.", "info");
            return;
          }

          setNutritionStatus(result.error.message, "error");
          return;
        }

        var rows = Array.isArray(result.data) ? result.data : [];
        var saved = rows.length ? normalizeNutritionLog(rows[0]) : payload;
        replaceNutritionLog(saved);
        writeNutritionLogsFallback(userId, state.nutritionLogs);
        renderNutritionDashboard();
        resetNutritionLogForm(true);
        setNutritionStatus("Nutrition log saved.", "success");
      })
      .catch(function (error) {
        setNutritionStatus(error && error.message ? error.message : "Failed to save nutrition log.", "error");
      });
  }

  function onNutritionLogDelete(logId, loggedOn) {
    var userId = getViewedUserId();
    var id = String(logId || "").trim();
    var dateKey = String(loggedOn || "").trim();

    if (!userId || (!id && !dateKey)) {
      return;
    }

    setNutritionStatus("Deleting nutrition log...", "info");

    function removeLocal() {
      state.nutritionLogs = (state.nutritionLogs || []).filter(function (row) {
        if (id && String(row.id || "") === id) {
          return false;
        }
        if (dateKey && String(row.logged_on || "") === dateKey) {
          return false;
        }
        return true;
      });
      writeNutritionLogsFallback(userId, state.nutritionLogs);
      renderNutritionDashboard();
      setNutritionStatus("Nutrition log deleted.", "success");
    }

    if (!state.nutritionLogsAvailable || id.indexOf("local-") === 0) {
      removeLocal();
      return;
    }

    state.client
      .from("athlete_nutrition_logs")
      .delete()
      .eq("user_id", userId)
      .eq("id", id)
      .then(function (result) {
        if (result.error) {
          setNutritionStatus(result.error.message, "error");
          return;
        }

        removeLocal();
      })
      .catch(function (error) {
        setNutritionStatus(error && error.message ? error.message : "Failed to delete nutrition log.", "error");
      });
  }

  function replaceNutritionLog(nextLog) {
    var normalized = normalizeNutritionLog(nextLog);
    var nextDate = normalized.logged_on;

    var rows = (state.nutritionLogs || []).filter(function (row) {
      return String(row.logged_on || "") !== String(nextDate || "");
    });

    rows.push(normalized);
    state.nutritionLogs = sortNutritionLogs(rows);
  }

  function sortNutritionLogs(rows) {
    return (Array.isArray(rows) ? rows : []).slice().sort(function (a, b) {
      return String(b.logged_on || "").localeCompare(String(a.logged_on || ""));
    });
  }

  function nutritionLogHasContent(log) {
    if (!log) {
      return false;
    }

    return [
      log.calories,
      log.protein_g,
      log.carbs_g,
      log.fats_g,
      log.fiber_g,
      log.hydration_l,
      log.meal_quality,
      log.energy_level,
      log.hunger_level
    ].some(function (value) {
      return value != null;
    }) || !!String(log.notes || "").trim();
  }

  function averageNumeric(rows, key) {
    var values = (Array.isArray(rows) ? rows : [])
      .map(function (row) {
        var value = row ? row[key] : null;
        return Number.isFinite(value) ? value : null;
      })
      .filter(function (value) {
        return value != null;
      });

    if (!values.length) {
      return null;
    }

    var total = values.reduce(function (acc, value) {
      return acc + value;
    }, 0);
    return total / values.length;
  }

  function calculateNutritionAdherence(averages, targets) {
    if (!targets || typeof targets !== "object") {
      return "No targets";
    }

    var comparisons = [
      [averages && averages.calories, targets.target_calories],
      [averages && averages.protein_g, targets.target_protein_g],
      [averages && averages.carbs_g, targets.target_carbs_g],
      [averages && averages.fats_g, targets.target_fats_g],
      [averages && averages.hydration_l, targets.target_hydration_l],
      [averages && averages.fiber_g, targets.target_fiber_g]
    ].filter(function (pair) {
      return Number.isFinite(pair[0]) && Number.isFinite(pair[1]) && pair[1] > 0;
    });

    if (!comparisons.length) {
      return "No targets";
    }

    var score = comparisons.reduce(function (acc, pair) {
      var actual = pair[0];
      var target = pair[1];
      var ratio = Math.abs(actual - target) / target;
      var component = Math.max(0, 1 - ratio);
      return acc + component;
    }, 0) / comparisons.length;

    return formatInteger(score * 100) + "%";
  }

  function parseOptionalNumber(value, minimum) {
    var text = String(value == null ? "" : value).trim();
    if (!text) {
      return null;
    }

    var numeric = parseFloat(text);
    if (!Number.isFinite(numeric)) {
      return null;
    }

    if (Number.isFinite(minimum) && numeric < minimum) {
      return null;
    }

    return numeric;
  }

  function parseOptionalRating(value) {
    var numeric = parseOptionalNumber(value, 1);
    if (numeric == null) {
      return null;
    }

    var rounded = Math.round(numeric);
    if (rounded < 1 || rounded > 5) {
      return null;
    }
    return rounded;
  }

  function setInputValue(form, name, value) {
    if (!form) {
      return;
    }

    var input = form.querySelector("[name='" + name + "']");
    if (!input) {
      return;
    }

    input.value = value == null ? "" : String(value);
  }

  function resetNutritionLogForm(includeNotes) {
    if (!state.nutritionForm) {
      return;
    }

    setInputValue(state.nutritionForm, "logged_on", getTodayDateInputValue());
    if (!includeNotes) {
      return;
    }

    [
      "calories",
      "protein_g",
      "carbs_g",
      "fats_g",
      "fiber_g",
      "hydration_l",
      "meal_quality",
      "energy_level",
      "hunger_level",
      "notes"
    ].forEach(function (name) {
      setInputValue(state.nutritionForm, name, "");
    });
  }

  function getTodayDateInputValue() {
    var now = new Date();
    var yyyy = String(now.getFullYear());
    var mm = String(now.getMonth() + 1).padStart(2, "0");
    var dd = String(now.getDate()).padStart(2, "0");
    return yyyy + "-" + mm + "-" + dd;
  }

  function setNutritionStatus(message, variant) {
    if (!state.nutritionStatus) {
      return;
    }

    state.nutritionStatus.textContent = message || "";
    state.nutritionStatus.classList.remove("is-error", "is-success", "is-info");

    if (!message) {
      return;
    }

    if (variant === "error") {
      state.nutritionStatus.classList.add("is-error");
    } else if (variant === "success") {
      state.nutritionStatus.classList.add("is-success");
    } else {
      state.nutritionStatus.classList.add("is-info");
    }
  }

  function readNutritionLogsFallback(userId) {
    var map = readNutritionLogsFallbackMap();
    var key = String(userId || "");
    var rows = map[key];
    if (!Array.isArray(rows)) {
      return [];
    }
    return rows.map(normalizeNutritionLog);
  }

  function writeNutritionLogsFallback(userId, rows) {
    var key = String(userId || "");
    if (!key) {
      return;
    }

    var map = readNutritionLogsFallbackMap();
    map[key] = Array.isArray(rows) ? rows.map(normalizeNutritionLog) : [];

    try {
      window.localStorage.setItem(NUTRITION_LOGS_FALLBACK_KEY, JSON.stringify(map));
    } catch (e) {
      // Local storage can fail in private browsing modes.
    }
  }

  function readNutritionLogsFallbackMap() {
    try {
      var raw = window.localStorage.getItem(NUTRITION_LOGS_FALLBACK_KEY);
      if (!raw) {
        return {};
      }

      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function readNutritionTargetsFallback(userId) {
    var map = readNutritionTargetsFallbackMap();
    var key = String(userId || "");
    if (!key || !map[key]) {
      return null;
    }
    return normalizeNutritionTargets(map[key]);
  }

  function writeNutritionTargetsFallback(userId, row) {
    var key = String(userId || "");
    if (!key) {
      return;
    }

    var map = readNutritionTargetsFallbackMap();
    if (!row) {
      delete map[key];
    } else {
      map[key] = normalizeNutritionTargets(row);
    }

    try {
      window.localStorage.setItem(NUTRITION_TARGETS_FALLBACK_KEY, JSON.stringify(map));
    } catch (e) {
      // Local storage can fail in private browsing modes.
    }
  }

  function readNutritionTargetsFallbackMap() {
    try {
      var raw = window.localStorage.getItem(NUTRITION_TARGETS_FALLBACK_KEY);
      if (!raw) {
        return {};
      }

      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function loadStravaOverview() {
    if (!state.client || !getViewedUserId()) {
      return;
    }

    renderStravaConnection(null, true);

    state.client
      .from("athlete_strava_connections")
      .select("user_id,strava_athlete_id,athlete_name,athlete_username,connected_at,last_sync_at,sync_status,updated_at")
      .eq("user_id", getViewedUserId())
      .maybeSingle()
      .then(function (result) {
        if (result.error) {
          if (isMissingRelationError(result.error)) {
            setStravaStatus(
              "Strava tables are not set up yet. Run sql/create-strava-integration.sql in Supabase first.",
              "error"
            );
            renderStravaConnection(null, false);
            renderStravaMetrics([]);
            return;
          }

          if (isRlsError(result.error)) {
            setStravaStatus(
              "Strava data is blocked by row-level security policy. Ask your admin to enable access.",
              "error"
            );
            renderStravaConnection(null, false);
            renderStravaMetrics([]);
            return;
          }

          setStravaStatus(result.error.message, "error");
          renderStravaConnection(null, false);
          renderStravaMetrics([]);
          return;
        }

        state.stravaConnection = result.data || null;
        renderStravaConnection(state.stravaConnection, false);
        loadStravaDailyMetrics();
      })
      .catch(function (error) {
        setStravaStatus(error && error.message ? error.message : "Failed to load Strava connection.", "error");
        renderStravaConnection(null, false);
        renderStravaMetrics([]);
      });
  }

  function loadStravaDailyMetrics() {
    if (!state.client || !getViewedUserId()) {
      return;
    }

    state.client
      .from("athlete_strava_daily_metrics")
      .select("metric_date,activity_count,distance_m,moving_time_sec,elevation_gain_m,training_load,resting_hr,hrv_ms,sleep_hours,recovery_score")
      .eq("user_id", getViewedUserId())
      .order("metric_date", { ascending: false })
      .limit(30)
      .then(function (result) {
        if (result.error) {
          if (isMissingRelationError(result.error)) {
            renderStravaMetrics([]);
            return;
          }

          if (isRlsError(result.error)) {
            setStravaStatus(
              "Cannot read Strava metrics due to row-level security policy.",
              "error"
            );
            renderStravaMetrics([]);
            return;
          }

          setStravaStatus(result.error.message, "error");
          renderStravaMetrics([]);
          return;
        }

        state.stravaDailyMetrics = Array.isArray(result.data) ? result.data : [];
        renderStravaMetrics(state.stravaDailyMetrics);
      })
      .catch(function (error) {
        setStravaStatus(error && error.message ? error.message : "Failed to load Strava metrics.", "error");
        renderStravaMetrics([]);
      });
  }

  function renderStravaConnection(connection, isLoading) {
    if (!state.stravaConnectionMeta) {
      return;
    }

    if (isLoading) {
      state.stravaConnectionMeta.innerHTML = '<p class="profile-loading">Checking Strava connection...</p>';
      state.readinessStravaConnected = false;
      state.readinessRecoveryScore = null;
      updateDailyReadinessCard();
      return;
    }

    var canManage = canManageStravaConnection();
    var isConnected = !!connection;

    if (state.stravaConnectBtn) {
      state.stravaConnectBtn.hidden = !canManage || isConnected;
      state.stravaConnectBtn.disabled = !canManage;
    }
    if (state.stravaSyncBtn) {
      state.stravaSyncBtn.hidden = !isConnected;
      state.stravaSyncBtn.disabled = !isConnected;
    }
    if (state.stravaDisconnectBtn) {
      state.stravaDisconnectBtn.hidden = !canManage || !isConnected;
      state.stravaDisconnectBtn.disabled = !canManage || !isConnected;
    }

    if (!isConnected) {
      var coachHint = state.isCoachView
        ? "This athlete has not connected Strava yet."
        : "Connect your Strava account to pull activity and recovery metrics into this dashboard.";
      state.stravaConnectionMeta.innerHTML =
        '<p class="strava-connection-empty">' + escapeHtml(coachHint) + "</p>";
      state.readinessStravaConnected = false;
      state.readinessRecoveryScore = null;
      updateDailyReadinessCard();
      return;
    }

    var athleteLabel = connection.athlete_name || connection.athlete_username || "Connected athlete";
    var syncLabel = connection.last_sync_at ? formatDate(connection.last_sync_at) : "Not synced yet";
    var statusText = connection.sync_status || "connected";

    state.stravaConnectionMeta.innerHTML =
      '<div class="strava-connection-grid">' +
      '<div class="strava-connection-item"><span>Account</span><strong>' + escapeHtml(athleteLabel) + "</strong></div>" +
      '<div class="strava-connection-item"><span>Connection Status</span><strong>' + escapeHtml(statusText) + "</strong></div>" +
      '<div class="strava-connection-item"><span>Last Sync</span><strong>' + escapeHtml(syncLabel) + "</strong></div>" +
      "</div>";
    state.readinessStravaConnected = true;
    updateDailyReadinessCard();
  }

  function renderStravaMetrics(rows) {
    if (!state.stravaMetricsGrid) {
      return;
    }

    var data = Array.isArray(rows) ? rows : [];
    if (!data.length) {
      state.readinessRecoveryScore = null;
      state.stravaMetricsGrid.innerHTML =
        '<div class="profile-empty-state">' +
          '<p class="profile-empty-state-title">No recovery metrics yet</p>' +
          '<p class="profile-empty-state-copy">Connect and sync Strava to unlock readiness and recovery trends.</p>' +
          (state.stravaConnection
            ? '<button type="button" class="btn profile-btn-cancel" data-inline-strava-sync>Sync Strava</button>'
            : (canManageStravaConnection()
              ? '<button type="button" class="btn profile-btn-edit-profile" data-inline-strava-connect>Connect Strava</button>'
              : '')) +
        '</div>';
      updateDailyReadinessCard();
      return;
    }

    var recentSeven = data.slice(0, 7);
    var latestWithRecovery = data.find(function (row) {
      return row && (row.recovery_score != null || row.resting_hr != null || row.hrv_ms != null);
    }) || data[0];

    var totalDistanceMeters = sumNumeric(recentSeven, "distance_m");
    var totalMovingTime = sumNumeric(recentSeven, "moving_time_sec");
    var totalElevation = sumNumeric(recentSeven, "elevation_gain_m");
    var totalActivities = sumNumeric(recentSeven, "activity_count");
    var totalLoad = sumNumeric(recentSeven, "training_load");

    var cards = [
      { label: "7-Day Distance", value: formatDecimal(totalDistanceMeters / 1000, 1) + " km" },
      { label: "7-Day Moving Time", value: formatDecimal(totalMovingTime / 3600, 1) + " h" },
      { label: "7-Day Elevation", value: formatInteger(totalElevation) + " m" },
      { label: "7-Day Activities", value: formatInteger(totalActivities) },
      { label: "7-Day Training Load", value: formatInteger(totalLoad) },
      { label: "Recovery Score", value: formatNullableNumber(latestWithRecovery && latestWithRecovery.recovery_score) },
      { label: "Resting HR", value: formatNullableNumber(latestWithRecovery && latestWithRecovery.resting_hr, " bpm") },
      { label: "HRV", value: formatNullableNumber(latestWithRecovery && latestWithRecovery.hrv_ms, " ms") }
    ];

    var recoveryScore = Number(latestWithRecovery && latestWithRecovery.recovery_score);
    var restingHr = Number(latestWithRecovery && latestWithRecovery.resting_hr);
    var hrvMs = Number(latestWithRecovery && latestWithRecovery.hrv_ms);

    state.readinessRecoveryScore = Number.isFinite(recoveryScore) ? recoveryScore : null;
    updateDailyReadinessCard();

    state.stravaMetricsGrid.innerHTML = cards
      .map(function (item) {
        return (
          '<article class="strava-metric-card">' +
          '<span class="strava-metric-label">' + escapeHtml(item.label) + "</span>" +
          '<strong class="strava-metric-value">' + escapeHtml(item.value) + "</strong>" +
          "</article>"
        );
      })
      .join("");
  }

  function updateDailyReadinessCard() {
    var score = 55;
    var notes = [];

    if ((state.readinessTrainingActiveCount || 0) > 0) {
      score += 10;
      notes.push("training plan active");
    } else {
      score -= 10;
      notes.push("no active training plan");
    }

    if (Number.isFinite(state.readinessNutritionPct)) {
      var nutritionPct = Number(state.readinessNutritionPct);
      if (nutritionPct >= 80 && nutritionPct <= 115) {
        score += 12;
        notes.push("nutrition aligned");
      } else if (nutritionPct >= 60 && nutritionPct <= 130) {
        score += 6;
        notes.push("nutrition partially aligned");
      } else {
        score -= 6;
        notes.push("nutrition off target");
      }
    } else {
      notes.push("nutrition baseline incomplete");
    }

    if (Number.isFinite(state.readinessRecoveryScore)) {
      var recoveryImpact = Math.max(-20, Math.min(20, (Number(state.readinessRecoveryScore) - 50) * 0.4));
      score += recoveryImpact;
      notes.push("recovery score " + formatInteger(state.readinessRecoveryScore));
    } else if (state.readinessStravaConnected) {
      score += 2;
      notes.push("sync Strava for full recovery context");
    } else {
      score -= 8;
      notes.push("connect Strava for recovery insights");
    }

    if (Number.isFinite(state.readinessNextEventDays)) {
      var days = Number(state.readinessNextEventDays);
      if (days <= 2) {
        score -= 12;
        notes.push("event very close");
      } else if (days <= 7) {
        score -= 7;
        notes.push("event within 7 days");
      } else if (days <= 14) {
        score -= 3;
        notes.push("event within 14 days");
      }
    }

    score = Math.max(1, Math.min(99, Math.round(score)));

    var readinessLabel = getReadinessStatusLabel(score);
    var variant = "";
    if (readinessLabel === "Ready to Push" || readinessLabel === "Ready to Train") {
      variant = "good";
    } else if (readinessLabel === "Recovery Priority") {
      variant = "alert";
    }

    state.statusReadinessPct = score;
    updateStatusRing("readiness", state.statusReadinessPct, readinessLabel, notes.slice(0, 1).join(""), variant);

    var durabilityBase = Number.isFinite(state.statusDurabilityPct) ? Number(state.statusDurabilityPct) : 50;
    var recoveryPct = Number.isFinite(state.readinessRecoveryScore)
      ? Math.max(0, Math.min(100, Number(state.readinessRecoveryScore)))
      : 50;
    var durabilityScore = Math.round((durabilityBase * 0.7) + (recoveryPct * 0.3));
    state.statusDurabilityPct = Math.max(1, Math.min(99, durabilityScore));
    updateStatusRing(
      "durability",
      state.statusDurabilityPct,
      String(state.statusDurabilityPct) + "%",
      Number.isFinite(state.readinessRecoveryScore)
        ? "Recovery " + formatInteger(state.readinessRecoveryScore) + " + nutrition alignment"
        : "Durability driven by nutrition baseline",
      state.statusDurabilityPct >= 70 ? "good" : (state.statusDurabilityPct < 45 ? "alert" : "")
    );

    updateQuickGlanceCard(
      "strava",
      readinessLabel + " " + String(score),
      notes.slice(0, 2).join(" | "),
      variant
    );

    updateMountainHeadline();
  }

  function updateMountainHeadline() {
    var heading = document.querySelector("[data-mountain-status-headline]");
    var summary = document.querySelector("[data-mountain-status-summary]");
    if (!heading || !summary) {
      return;
    }

    var readiness = Number(state.statusReadinessPct) || 0;
    var load = Number(state.statusLoadPct) || 0;
    var durability = Number(state.statusDurabilityPct) || 0;
    var progress = Number(state.statusProgressPct) || 0;
    var composite = Math.round((readiness * 0.4) + (load * 0.2) + (durability * 0.2) + (progress * 0.2));

    var statusText = "Maintain";
    if (composite >= 80 && readiness >= 72 && durability >= 65) {
      statusText = "Ready to Push";
    } else if (composite >= 64 && readiness >= 58 && durability >= 50) {
      statusText = "Ready to Train";
    } else if (composite < 48 || readiness < 48 || durability < 42) {
      statusText = "Recovery Priority";
    }

    heading.textContent = statusText;
    summary.textContent = buildCompassInterpretation(statusText, readiness, load, durability, progress);
    var phaseLabel = updateTrailStatus(statusText, readiness, load, durability, progress) || deriveRoadmapPhaseLabel(statusText, readiness, load, durability, progress);
    updateCompassCurrentStatus(statusText, phaseLabel, readiness, load, durability, progress);
  }

  function buildCompassInterpretation(statusText, readiness, load, durability, progress) {
    var guidance = "Keep intensity moderate and stay consistent this week.";

    if (statusText === "Ready to Push") {
      guidance = "You are trending well. Keep your hard work focused, then recover with intent after big sessions.";
    } else if (statusText === "Recovery Priority") {
      guidance = "Your system is asking for recovery. Reduce intensity today and prioritize sleep, fueling, and tissue care.";
    } else if (load >= 82) {
      guidance = "Your volume is elevated. Keep strength work moderate and avoid stacking extra conditioning.";
    } else if (progress < 45) {
      guidance = "Progress is lagging a bit. Keep sessions consistent and review your plan with your coach.";
    }

    return guidance;
  }

  function updateCompassCurrentStatus(statusText, phaseLabel, readiness, load, durability, progress) {
    var trainingStatusEl = document.querySelector("[data-compass-training-status]");
    var phaseEl = document.querySelector("[data-compass-phase]");
    var objectiveEl = document.querySelector("[data-compass-next-objective]");
    var coachNoteEl = document.querySelector("[data-compass-coach-note]");
    if (!trainingStatusEl || !phaseEl || !objectiveEl || !coachNoteEl) {
      return;
    }

    trainingStatusEl.textContent = statusText;
    phaseEl.textContent = String(phaseLabel || "Strength + Durability");
    objectiveEl.textContent = String(state.compassNextObjective || "Set your next race, trip, or milestone.");
    coachNoteEl.textContent = buildCoachCompassNote(statusText, readiness, load, durability, progress);
  }

  function buildCoachCompassNote(statusText, readiness, load, durability, progress) {
    var consistencyNote = String(state.trainingConsistencyMessage || "").trim();

    if (statusText === "Recovery Priority") {
      return "Today should be a recovery-first day. Keep intensity low, complete mobility/prehab, and rebuild for the next quality session." +
        (consistencyNote ? " " + consistencyNote : "");
    }

    if (load >= 82) {
      return "You are trending well, but your sport volume jumped this week. Keep strength work moderate and prioritize recovery after your next long session.";
    }

    if (progress < 45) {
      return "You are training, but progress is flatter than expected. Keep consistency high and adjust session focus with your coach this week.";
    }

    if (readiness >= 72 && durability >= 65) {
      return "You are on track this week. Push quality where planned and keep recovery habits tight between harder efforts." +
        (consistencyNote ? " " + consistencyNote : "");
    }

    return "Maintain today. Keep intensity moderate, stay consistent with your plan, and protect recovery between sessions." +
      (consistencyNote ? " " + consistencyNote : "");
  }

  function updateTrailStatus(statusText, readiness, load, durability, progress) {
    var phaseEl = document.querySelector("[data-trail-status-phase]");
    var fillEl = document.querySelector("[data-trail-status-fill]");
    var noteEl = document.querySelector("[data-trail-status-note]");
    var checkpointsWrap = document.querySelector("[data-trail-status-checkpoints]");
    if (!phaseEl || !fillEl || !noteEl || !checkpointsWrap) {
      return;
    }

    var roadmap = buildMemberRoadmap(statusText, readiness, load, durability, progress);
    var steps = roadmap.steps || [];
    var index = Math.max(0, Math.min(steps.length - 1, Number(roadmap.currentIndex) || 0));

    checkpointsWrap.style.setProperty("--roadmap-step-count", String(Math.max(steps.length, 1)));
    checkpointsWrap.innerHTML = steps
      .map(function (step, stepIndex) {
        return (
          '<span class="profile-trail-checkpoint" role="listitem">' +
            '<span class="profile-trail-checkpoint-index">' + String(stepIndex + 1) + '</span>' +
            '<span class="profile-trail-checkpoint-title">' + escapeHtml(step.label || "Step") + '</span>' +
            '<span class="profile-trail-checkpoint-meta">' + escapeHtml(step.meta || "") + '</span>' +
          '</span>'
        );
      })
      .join("");

    var checkpoints = checkpointsWrap.querySelectorAll(".profile-trail-checkpoint");
    checkpoints.forEach(function (checkpoint, checkpointIndex) {
      checkpoint.classList.remove("is-active", "is-complete");
      if (checkpointIndex < index) {
        checkpoint.classList.add("is-complete");
      }
      if (checkpointIndex === index) {
        checkpoint.classList.add("is-active");
      }
    });

    phaseEl.textContent = String(roadmap.phaseLabel || "Training Roadmap");
    noteEl.textContent = String(roadmap.note || "Your roadmap connects assessment, training phases, events, and reassessments.");

    var fillPercent = steps.length > 1
      ? (10 + ((90 * index) / (steps.length - 1)))
      : 100;
    fillEl.style.width = String(Math.round(fillPercent)) + "%";

    return String(roadmap.currentPhase || "Strength + Durability");
  }

  function buildMemberRoadmap(statusText, readiness, load, durability, progress) {
    var nextEventDays = Number.isFinite(state.readinessNextEventDays)
      ? Number(state.readinessNextEventDays)
      : null;
    var activeTraining = Number(state.readinessTrainingActiveCount) || 0;
    var objective = String(state.compassNextObjective || "").trim();
    var hasObjective = !!objective && objective.toLowerCase() !== "set your next race, trip, or milestone.";

    var latestMetricDate = getLatestMetricUpdatedDate();
    var daysSinceAssessment = latestMetricDate ? getDaysSinceDate(latestMetricDate) : null;
    var quarterlyDue = typeof daysSinceAssessment === "number" ? daysSinceAssessment >= 84 : false;
    var reassessmentDate = latestMetricDate ? addDaysToDateValue(latestMetricDate, 84) : null;

    var assessmentMeta = latestMetricDate ? ("Last: " + formatDate(latestMetricDate)) : "Baseline pending";
    var baseMeta = activeTraining > 0
      ? (String(activeTraining) + " active program" + (activeTraining === 1 ? "" : "s"))
      : "Programming to be assigned";
    var strengthMeta = load >= 58 ? "Current emphasis" : "Planned phase";
    var powerMeta = load >= 72 ? "Current emphasis" : "Upcoming phase";
    var eventMeta = "No event date set";
    if (state.compassNextObjectiveDate) {
      eventMeta = "Target: " + formatDate(state.compassNextObjectiveDate);
    } else if (nextEventDays !== null) {
      eventMeta = nextEventDays > 0 ? ("In " + nextEventDays + " days") : (nextEventDays === 0 ? "Today" : "Recently passed");
    }
    var quarterlyMeta = reassessmentDate
      ? ("Due: " + formatDate(reassessmentDate.toISOString()))
      : "Every 12 weeks";

    var steps = [
      { key: "assessment", label: "Performance Assessment", meta: assessmentMeta },
      { key: "base", label: "Base Build", meta: baseMeta },
      { key: "strength", label: "Strength Build", meta: strengthMeta },
      { key: "power", label: "Power + Specific", meta: powerMeta },
      { key: "event", label: hasObjective ? abbreviateRoadmapLabel(objective, 26) : "Event / Race Prep", meta: eventMeta },
      { key: "quarterly", label: "Quarterly Reassessment", meta: quarterlyMeta }
    ];

    var currentKey = "assessment";
    var note = "Start with baseline testing to anchor your training roadmap.";
    var currentPhase = "Assessment + Plan Design";
    var phaseLabel = "Assessment";

    if (activeTraining > 0 || progress >= 36) {
      currentKey = "base";
      note = "Build consistency and aerobic work capacity while stacking quality reps.";
      currentPhase = "Base Building";
      phaseLabel = "Base Build";
    }

    if (load >= 58 || progress >= 50) {
      currentKey = "strength";
      note = "Shift emphasis toward force production, durability, and controlled loading.";
      currentPhase = "Strength + Durability";
      phaseLabel = "Strength Build";
    }

    if (load >= 72 && readiness >= 62 && durability >= 52) {
      currentKey = "power";
      note = "Convert strength into sport-specific power and high-quality performance outputs.";
      currentPhase = "Power + Specific Preparation";
      phaseLabel = "Power + Specific";
    }

    if (nextEventDays !== null && nextEventDays >= 0 && nextEventDays <= 45) {
      currentKey = "event";
      if (nextEventDays <= 10) {
        note = "Event is near. Taper intelligently and prioritize freshness and confidence.";
      } else {
        note = "Event prep block is active. Focus on specificity, pacing, and readiness.";
      }
      currentPhase = "Event Preparation";
      phaseLabel = "Event Prep";
    }

    if (quarterlyDue && statusText !== "Recovery Priority") {
      currentKey = "quarterly";
      note = "Quarterly reassessment due. Re-test key metrics and update your next training block.";
      currentPhase = "Quarterly Reassessment";
      phaseLabel = "Quarterly Review";
    }

    if (statusText === "Recovery Priority") {
      note = "Recovery is the priority this week. Keep roadmap momentum by reducing load and restoring readiness.";
    }

    var keys = steps.map(function (step) { return step.key; });
    var currentIndex = Math.max(0, keys.indexOf(currentKey));

    return {
      steps: steps,
      currentIndex: currentIndex,
      note: note,
      currentPhase: currentPhase,
      phaseLabel: phaseLabel
    };
  }

  function deriveRoadmapPhaseLabel(statusText, readiness, load, durability, progress) {
    return String(buildMemberRoadmap(statusText, readiness, load, durability, progress).phaseLabel || "Strength + Durability");
  }

  function getLatestMetricUpdatedDate() {
    var list = Array.isArray(state.metricsLatest) ? state.metricsLatest : [];
    if (!list.length) {
      return null;
    }

    var latest = list[0];
    var updated = latest && latest.updated_at ? String(latest.updated_at) : "";
    if (!updated) {
      return null;
    }
    return updated;
  }

  function getDaysSinceDate(dateInput) {
    var raw = String(dateInput || "").trim();
    if (!raw) {
      return null;
    }

    var dateValue = new Date(raw);
    if (isNaN(dateValue.getTime())) {
      dateValue = parseDateInputValue(raw);
    }
    if (!dateValue || isNaN(dateValue.getTime())) {
      return null;
    }

    var today = parseDateInputValue(getTodayDateInputValue());
    if (!today) {
      return null;
    }

    var diffMs = today.getTime() - dateValue.getTime();
    return Math.floor(diffMs / 86400000);
  }

  function addDaysToDateValue(dateInput, daysToAdd) {
    var raw = String(dateInput || "").trim();
    if (!raw) {
      return null;
    }

    var dateValue = new Date(raw);
    if (isNaN(dateValue.getTime())) {
      dateValue = parseDateInputValue(raw);
    }
    if (!dateValue || isNaN(dateValue.getTime())) {
      return null;
    }

    var result = new Date(dateValue.getTime());
    result.setDate(result.getDate() + (parseInt(daysToAdd, 10) || 0));
    return result;
  }

  function abbreviateRoadmapLabel(text, maxLen) {
    var value = String(text || "").trim();
    var limit = Number(maxLen) || 24;
    if (value.length <= limit) {
      return value;
    }
    return value.slice(0, Math.max(0, limit - 1)).trim() + "...";
  }

  function getReadinessStatusLabel(score) {
    var value = Number(score) || 0;
    if (value >= 80) {
      return "Ready";
    }
    if (value >= 66) {
      return "Train";
    }
    if (value >= 50) {
      return "Maintain";
    }
    return "Recover";
  }

  function getLoadStatusLabel(score) {
    var value = Number(score) || 0;
    if (value < 35) {
      return "Under";
    }
    if (value < 65) {
      return "Productive";
    }
    if (value < 80) {
      return "Tolerable";
    }
    if (value < 92) {
      return "Overreach";
    }
    return "Deload";
  }

  function getDurabilityStatusLabel(score) {
    var value = Number(score) || 0;
    if (value >= 78) {
      return "Clear";
    }
    if (value >= 60) {
      return "Monitor";
    }
    if (value >= 45) {
      return "Modify";
    }
    return "Rehab";
  }

  function getProgressStatusLabel(score) {
    var value = Number(score) || 0;
    if (value >= 85) {
      return "Ahead";
    }
    if (value >= 65) {
      return "On Track";
    }
    if (value >= 45) {
      return "Stable";
    }
    if (value >= 30) {
      return "Behind";
    }
    return "Adjust";
  }

  function onStravaConnect() {
    if (!canManageStravaConnection()) {
      setStravaStatus("Only the athlete can connect a Strava account from this view.", "info");
      return;
    }

    if (!state.client || !state.client.functions) {
      setStravaStatus("Supabase Functions are not available in this build.", "error");
      return;
    }

    setStravaStatus("Generating Strava authorization link...", "info");

    state.client.functions
      .invoke("strava-connect-start", {
        body: {
          redirectTo: getStravaRedirectUrl()
        }
      })
      .then(function (result) {
        if (result.error) {
          handleStravaEdgeError(result.error, "strava-connect-start");
          return;
        }

        var data = result.data || {};
        var authUrl = data.auth_url || data.authUrl || data.url || "";
        if (!authUrl) {
          setStravaStatus("Strava auth URL was not returned by strava-connect-start.", "error");
          return;
        }

        window.location.href = authUrl;
      })
      .catch(function (error) {
        handleStravaEdgeError(error, "strava-connect-start");
      });
  }

  function onStravaSync() {
    if (!state.client || !state.client.functions) {
      setStravaStatus("Supabase Functions are not available in this build.", "error");
      return;
    }

    if (!state.stravaConnection) {
      setStravaStatus("Connect Strava before requesting a sync.", "info");
      return;
    }

    setStravaStatus("Syncing latest Strava metrics...", "info");

    state.client.functions
      .invoke("strava-sync-latest", {
        body: {
          days: 30
        }
      })
      .then(function (result) {
        if (result.error) {
          handleStravaEdgeError(result.error, "strava-sync-latest");
          return;
        }

        setStravaStatus("Strava sync complete.", "success");
        loadStravaOverview();
      })
      .catch(function (error) {
        handleStravaEdgeError(error, "strava-sync-latest");
      });
  }

  function onStravaDisconnect() {
    if (!canManageStravaConnection()) {
      setStravaStatus("Only the athlete can disconnect a Strava account from this view.", "info");
      return;
    }

    if (!state.client || !state.client.functions) {
      setStravaStatus("Supabase Functions are not available in this build.", "error");
      return;
    }

    if (!state.stravaConnection) {
      setStravaStatus("No Strava account is currently connected.", "info");
      return;
    }

    if (!confirm("Disconnect Strava from this athlete profile?")) {
      return;
    }

    setStravaStatus("Disconnecting Strava account...", "info");

    state.client.functions
      .invoke("strava-disconnect", { body: {} })
      .then(function (result) {
        if (result.error) {
          handleStravaEdgeError(result.error, "strava-disconnect");
          return;
        }

        state.stravaConnection = null;
        state.stravaDailyMetrics = [];
        renderStravaConnection(null, false);
        renderStravaMetrics([]);
        setStravaStatus("Strava disconnected.", "success");
      })
      .catch(function (error) {
        handleStravaEdgeError(error, "strava-disconnect");
      });
  }

  function handleStravaEdgeError(error, functionName) {
    resolveStravaEdgeError(error, functionName)
      .then(function (message) {
        setStravaStatus(message, "error");
      })
      .catch(function () {
        setStravaStatus(formatStravaEdgeError(error, functionName), "error");
      });
  }

  function resolveStravaEdgeError(error, functionName) {
    var baseMessage = formatStravaEdgeError(error, functionName);
    var context = error && error.context;

    if (!context || typeof context.clone !== "function") {
      return Promise.resolve(baseMessage);
    }

    return context
      .clone()
      .json()
      .then(function (payload) {
        var detail = "";
        if (payload && typeof payload.error === "string") {
          detail = payload.error;
        } else if (payload && typeof payload.message === "string") {
          detail = payload.message;
        } else if (payload && typeof payload.code === "string") {
          detail = payload.code;
        }

        if (!detail) {
          return buildStravaStatusMessageFromHttp(context.status, baseMessage, functionName);
        }

        return buildStravaStatusMessageFromDetail(detail, context.status, functionName, baseMessage);
      })
      .catch(function () {
        return buildStravaStatusMessageFromHttp(context.status, baseMessage, functionName);
      });
  }

  function buildStravaStatusMessageFromHttp(status, fallbackMessage, functionName) {
    if (status === 401) {
      return "You are not authenticated. Sign in again and retry " + functionName + ".";
    }

    if (status === 404) {
      return (
        "Could not reach " +
        functionName +
        ". Deploy Supabase Edge Functions and confirm project secrets are set. See supabase/functions/README.md."
      );
    }

    return fallbackMessage;
  }

  function buildStravaStatusMessageFromDetail(detail, status, functionName, fallbackMessage) {
    var cleanDetail = String(detail || "").trim();
    var normalized = cleanDetail.toLowerCase();

    if (
      normalized.indexOf("missing authorization header") !== -1 ||
      normalized.indexOf("missing authorization bearer token") !== -1 ||
      normalized.indexOf("unable to authenticate user") !== -1
    ) {
      return "Your login session is missing or expired. Sign in again and retry " + functionName + ".";
    }

    if (normalized.indexOf("missing required environment variable") !== -1) {
      return functionName + " is missing a required secret: " + cleanDetail;
    }

    if (status === 401) {
      return "You are not authenticated. Sign in again and retry " + functionName + ".";
    }

    return functionName + " error: " + cleanDetail;
  }

  function formatStravaEdgeError(error, functionName) {
    var message = String((error && error.message) || "").trim();
    var normalized = message.toLowerCase();

    if (
      normalized.indexOf("failed to send a request to the edge function") !== -1 ||
      normalized.indexOf("requested function was not found") !== -1 ||
      normalized.indexOf("not_found") !== -1
    ) {
      return (
        "Could not reach " +
        functionName +
        ". Deploy Supabase Edge Functions and confirm project secrets are set. See supabase/functions/README.md."
      );
    }

    if (normalized.indexOf("non-2xx") !== -1) {
      return (
        functionName +
        " returned an error response. Check function logs in Supabase and verify STRAVA_* secrets are configured."
      );
    }

    return message || ("Failed calling " + functionName + ".");
  }

  function loadWhoopOverview() {
    if (!state.client || !getViewedUserId()) {
      return;
    }

    renderWhoopConnection(null, true);

    state.client
      .from("athlete_whoop_connections")
      .select("user_id,whoop_user_id,connected_at,last_sync_at,sync_status,updated_at")
      .eq("user_id", getViewedUserId())
      .maybeSingle()
      .then(function (result) {
        if (result.error) {
          if (isMissingRelationError(result.error)) {
            setWhoopStatus(
              "Whoop tables are not set up yet. Run sql/create-whoop-integration.sql in Supabase first.",
              "error"
            );
            renderWhoopConnection(null, false);
            renderWhoopMetrics([]);
            return;
          }

          if (isRlsError(result.error)) {
            setWhoopStatus(
              "Whoop data is blocked by row-level security policy. Ask your admin to enable access.",
              "error"
            );
            renderWhoopConnection(null, false);
            renderWhoopMetrics([]);
            return;
          }

          setWhoopStatus(result.error.message, "error");
          renderWhoopConnection(null, false);
          renderWhoopMetrics([]);
          return;
        }

        state.whoopConnection = result.data || null;
        renderWhoopConnection(state.whoopConnection, false);
        loadWhoopDailyMetrics();
      })
      .catch(function (error) {
        setWhoopStatus(error && error.message ? error.message : "Failed to load Whoop connection.", "error");
        renderWhoopConnection(null, false);
        renderWhoopMetrics([]);
      });
  }

  function loadWhoopDailyMetrics() {
    if (!state.client || !getViewedUserId()) {
      return;
    }

    state.client
      .from("athlete_whoop_daily_metrics")
      .select("metric_date,recovery_score,resting_hr,hrv_ms,sleep_hours,day_strain,workout_count,workout_duration_sec")
      .eq("user_id", getViewedUserId())
      .order("metric_date", { ascending: false })
      .limit(30)
      .then(function (result) {
        if (result.error) {
          if (isMissingRelationError(result.error)) {
            renderWhoopMetrics([]);
            return;
          }

          if (isRlsError(result.error)) {
            setWhoopStatus(
              "Cannot read Whoop metrics due to row-level security policy.",
              "error"
            );
            renderWhoopMetrics([]);
            return;
          }

          setWhoopStatus(result.error.message, "error");
          renderWhoopMetrics([]);
          return;
        }

        state.whoopDailyMetrics = Array.isArray(result.data) ? result.data : [];
        renderWhoopMetrics(state.whoopDailyMetrics);
      })
      .catch(function (error) {
        setWhoopStatus(error && error.message ? error.message : "Failed to load Whoop metrics.", "error");
        renderWhoopMetrics([]);
      });
  }

  function renderWhoopConnection(connection, isLoading) {
    if (!state.whoopConnectionMeta) {
      return;
    }

    if (isLoading) {
      state.whoopConnectionMeta.innerHTML = '<p class="profile-loading">Checking Whoop connection...</p>';
      return;
    }

    var canManage = canManageWhoopConnection();
    var isConnected = !!connection;

    if (state.whoopConnectBtn) {
      state.whoopConnectBtn.hidden = !canManage || isConnected;
      state.whoopConnectBtn.disabled = !canManage;
    }
    if (state.whoopManualToggleBtn) {
      state.whoopManualToggleBtn.hidden = !canManage || isConnected;
      state.whoopManualToggleBtn.disabled = !canManage;
    }
    if (state.whoopSyncBtn) {
      state.whoopSyncBtn.hidden = !isConnected;
      state.whoopSyncBtn.disabled = !isConnected;
    }
    if (state.whoopDisconnectBtn) {
      state.whoopDisconnectBtn.hidden = !canManage || !isConnected;
      state.whoopDisconnectBtn.disabled = !canManage || !isConnected;
    }

    if (!isConnected) {
      setWhoopManualFormVisible(false);
      var coachHint = state.isCoachView
        ? "This athlete has not connected Whoop yet."
        : "Connect your Whoop account to pull recovery, sleep, and strain metrics.";
      state.whoopConnectionMeta.innerHTML =
        '<p class="strava-connection-empty">' + escapeHtml(coachHint) + "</p>";
      return;
    }

    var whoopLabel = connection.whoop_user_id ? "Whoop User " + connection.whoop_user_id : "Connected account";
    var syncLabel = connection.last_sync_at ? formatDate(connection.last_sync_at) : "Not synced yet";
    var statusText = connection.sync_status || "connected";

    state.whoopConnectionMeta.innerHTML =
      '<div class="strava-connection-grid">' +
      '<div class="strava-connection-item"><span>Account</span><strong>' + escapeHtml(whoopLabel) + "</strong></div>" +
      '<div class="strava-connection-item"><span>Connection Status</span><strong>' + escapeHtml(statusText) + "</strong></div>" +
      '<div class="strava-connection-item"><span>Last Sync</span><strong>' + escapeHtml(syncLabel) + "</strong></div>" +
      "</div>";
    setWhoopManualFormVisible(false);
  }

  function onWhoopManualSubmit(event) {
    if (event) {
      event.preventDefault();
    }

    if (!canManageWhoopConnection()) {
      setWhoopStatus("Only the athlete can set Whoop credentials from this view.", "info");
      return;
    }

    if (!state.client || !state.client.functions) {
      setWhoopStatus("Supabase Functions are not available in this build.", "error");
      return;
    }

    var accessToken = String((state.whoopManualAccessToken && state.whoopManualAccessToken.value) || "").trim();
    var refreshToken = String((state.whoopManualRefreshToken && state.whoopManualRefreshToken.value) || "").trim();
    var userId = String((state.whoopManualUserId && state.whoopManualUserId.value) || "").trim();
    var expiresInRaw = String((state.whoopManualExpiresIn && state.whoopManualExpiresIn.value) || "").trim();
    var expiresIn = expiresInRaw ? Number(expiresInRaw) : null;

    if (!accessToken || !refreshToken) {
      setWhoopStatus("Access token and refresh token are required.", "error");
      return;
    }

    setWhoopStatus("Saving Whoop info...", "info");

    state.client.functions
      .invoke("whoop-manual-connect", {
        body: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: Number.isFinite(expiresIn) ? expiresIn : null,
          whoop_user_id: userId || null
        }
      })
      .then(function (result) {
        if (result.error) {
          handleWhoopEdgeError(result.error, "whoop-manual-connect");
          return;
        }

        setWhoopStatus("Whoop credentials saved. Syncing latest metrics...", "success");
        setWhoopManualFormVisible(false);
        if (state.whoopManualAccessToken) state.whoopManualAccessToken.value = "";
        if (state.whoopManualRefreshToken) state.whoopManualRefreshToken.value = "";
        if (state.whoopManualExpiresIn) state.whoopManualExpiresIn.value = "";
        if (state.whoopManualUserId) state.whoopManualUserId.value = "";
        loadWhoopOverview();
      })
      .catch(function (error) {
        handleWhoopEdgeError(error, "whoop-manual-connect");
      });
  }

  function setWhoopManualFormVisible(visible) {
    if (!state.whoopManualForm) {
      return;
    }

    var shouldShow = !!visible && canManageWhoopConnection();
    state.whoopManualForm.hidden = !shouldShow;
  }

  function renderWhoopMetrics(rows) {
    if (!state.whoopMetricsGrid) {
      return;
    }

    var data = Array.isArray(rows) ? rows : [];
    if (!data.length) {
      state.whoopMetricsGrid.innerHTML =
        '<div class="profile-empty-state">' +
          '<p class="profile-empty-state-title">No Whoop metrics yet</p>' +
          '<p class="profile-empty-state-copy">Connect and sync Whoop to unlock recovery and sleep trends.</p>' +
          (state.whoopConnection
            ? '<button type="button" class="btn profile-btn-cancel" data-inline-whoop-sync>Sync Whoop</button>'
            : (canManageWhoopConnection()
              ? '<button type="button" class="btn profile-btn-edit-profile" data-inline-whoop-connect>Connect Whoop</button>'
              : '')) +
        '</div>';
      return;
    }

    var recentSeven = data.slice(0, 7);
    var latest = data[0] || null;
    var avgRecovery = averageNumeric(recentSeven, "recovery_score");
    var avgSleep = averageNumeric(recentSeven, "sleep_hours");
    var totalWorkoutCount = sumNumeric(recentSeven, "workout_count");
    var totalWorkoutHours = sumNumeric(recentSeven, "workout_duration_sec") / 3600;
    var avgStrain = averageNumeric(recentSeven, "day_strain");

    var cards = [
      { label: "7-Day Avg Recovery", value: formatNullableNumber(avgRecovery) },
      { label: "7-Day Avg Sleep", value: formatNullableNumber(avgSleep, " h") },
      { label: "7-Day Workouts", value: formatInteger(totalWorkoutCount) },
      { label: "7-Day Workout Time", value: formatDecimal(totalWorkoutHours, 1) + " h" },
      { label: "7-Day Avg Strain", value: formatNullableNumber(avgStrain) },
      { label: "Resting HR", value: formatNullableNumber(latest && latest.resting_hr, " bpm") },
      { label: "HRV", value: formatNullableNumber(latest && latest.hrv_ms, " ms") },
      { label: "Latest Sleep", value: formatNullableNumber(latest && latest.sleep_hours, " h") }
    ];

    if (!Number.isFinite(state.readinessRecoveryScore)) {
      var whoopRecoveryScore = Number(latest && latest.recovery_score);
      if (Number.isFinite(whoopRecoveryScore)) {
        state.readinessRecoveryScore = whoopRecoveryScore;
        updateDailyReadinessCard();
      }
    }

    state.whoopMetricsGrid.innerHTML = cards
      .map(function (item) {
        return (
          '<article class="strava-metric-card">' +
          '<span class="strava-metric-label">' + escapeHtml(item.label) + "</span>" +
          '<strong class="strava-metric-value">' + escapeHtml(item.value) + "</strong>" +
          "</article>"
        );
      })
      .join("");
  }

  function onWhoopConnect() {
    if (!canManageWhoopConnection()) {
      setWhoopStatus("Only the athlete can connect a Whoop account from this view.", "info");
      return;
    }

    if (!state.client || !state.client.functions) {
      setWhoopStatus("Supabase Functions are not available in this build.", "error");
      return;
    }

    setWhoopStatus("Generating Whoop authorization link...", "info");

    state.client.functions
      .invoke("whoop-connect-start", {
        body: {
          redirectTo: getWhoopRedirectUrl()
        }
      })
      .then(function (result) {
        if (result.error) {
          handleWhoopEdgeError(result.error, "whoop-connect-start");
          return;
        }

        var data = result.data || {};
        var authUrl = data.auth_url || data.authUrl || data.url || "";
        if (!authUrl) {
          setWhoopStatus("Whoop auth URL was not returned by whoop-connect-start.", "error");
          return;
        }

        window.location.href = authUrl;
      })
      .catch(function (error) {
        handleWhoopEdgeError(error, "whoop-connect-start");
      });
  }

  function onWhoopSync() {
    if (!state.client || !state.client.functions) {
      setWhoopStatus("Supabase Functions are not available in this build.", "error");
      return;
    }

    if (!state.whoopConnection) {
      setWhoopStatus("Connect Whoop before requesting a sync.", "info");
      return;
    }

    setWhoopStatus("Syncing latest Whoop metrics...", "info");

    state.client.functions
      .invoke("whoop-sync-latest", {
        body: {
          days: 30
        }
      })
      .then(function (result) {
        if (result.error) {
          handleWhoopEdgeError(result.error, "whoop-sync-latest");
          return;
        }

        setWhoopStatus("Whoop sync complete.", "success");
        loadWhoopOverview();
      })
      .catch(function (error) {
        handleWhoopEdgeError(error, "whoop-sync-latest");
      });
  }

  function onWhoopDisconnect() {
    if (!canManageWhoopConnection()) {
      setWhoopStatus("Only the athlete can disconnect a Whoop account from this view.", "info");
      return;
    }

    if (!state.client || !state.client.functions) {
      setWhoopStatus("Supabase Functions are not available in this build.", "error");
      return;
    }

    if (!state.whoopConnection) {
      setWhoopStatus("No Whoop account is currently connected.", "info");
      return;
    }

    if (!confirm("Disconnect Whoop from this athlete profile?")) {
      return;
    }

    setWhoopStatus("Disconnecting Whoop account...", "info");

    state.client.functions
      .invoke("whoop-disconnect", { body: {} })
      .then(function (result) {
        if (result.error) {
          handleWhoopEdgeError(result.error, "whoop-disconnect");
          return;
        }

        state.whoopConnection = null;
        state.whoopDailyMetrics = [];
        renderWhoopConnection(null, false);
        renderWhoopMetrics([]);
        setWhoopStatus("Whoop disconnected.", "success");
      })
      .catch(function (error) {
        handleWhoopEdgeError(error, "whoop-disconnect");
      });
  }

  function handleWhoopEdgeError(error, functionName) {
    resolveWhoopEdgeError(error, functionName)
      .then(function (message) {
        setWhoopStatus(message, "error");
      })
      .catch(function () {
        setWhoopStatus(formatWhoopEdgeError(error, functionName), "error");
      });
  }

  function resolveWhoopEdgeError(error, functionName) {
    var baseMessage = formatWhoopEdgeError(error, functionName);
    var context = error && error.context;

    if (!context || typeof context.clone !== "function") {
      return Promise.resolve(baseMessage);
    }

    return context
      .clone()
      .json()
      .then(function (payload) {
        var detail = "";
        if (payload && typeof payload.error === "string") {
          detail = payload.error;
        } else if (payload && typeof payload.message === "string") {
          detail = payload.message;
        } else if (payload && typeof payload.code === "string") {
          detail = payload.code;
        }

        if (!detail) {
          return buildWhoopStatusMessageFromHttp(context.status, baseMessage, functionName);
        }

        return buildWhoopStatusMessageFromDetail(detail, context.status, functionName, baseMessage);
      })
      .catch(function () {
        return buildWhoopStatusMessageFromHttp(context.status, baseMessage, functionName);
      });
  }

  function buildWhoopStatusMessageFromHttp(status, fallbackMessage, functionName) {
    if (status === 401) {
      return "You are not authenticated. Sign in again and retry " + functionName + ".";
    }

    if (status === 404) {
      return (
        "Could not reach " +
        functionName +
        ". Deploy Supabase Edge Functions and confirm project secrets are set. See supabase/functions/README.md."
      );
    }

    return fallbackMessage;
  }

  function buildWhoopStatusMessageFromDetail(detail, status, functionName, fallbackMessage) {
    var cleanDetail = String(detail || "").trim();
    var normalized = cleanDetail.toLowerCase();

    if (
      normalized.indexOf("missing authorization header") !== -1 ||
      normalized.indexOf("missing authorization bearer token") !== -1 ||
      normalized.indexOf("unable to authenticate user") !== -1
    ) {
      return "Your login session is missing or expired. Sign in again and retry " + functionName + ".";
    }

    if (normalized.indexOf("missing required environment variable") !== -1) {
      return functionName + " is missing a required secret: " + cleanDetail;
    }

    if (status === 401) {
      return "You are not authenticated. Sign in again and retry " + functionName + ".";
    }

    return functionName + " error: " + cleanDetail;
  }

  function formatWhoopEdgeError(error, functionName) {
    var message = String((error && error.message) || "").trim();
    var normalized = message.toLowerCase();

    if (
      normalized.indexOf("failed to send a request to the edge function") !== -1 ||
      normalized.indexOf("requested function was not found") !== -1 ||
      normalized.indexOf("not_found") !== -1
    ) {
      return (
        "Could not reach " +
        functionName +
        ". Deploy Supabase Edge Functions and confirm project secrets are set. See supabase/functions/README.md."
      );
    }

    if (normalized.indexOf("non-2xx") !== -1) {
      return (
        functionName +
        " returned an error response. Check function logs in Supabase and verify WHOOP_* secrets are configured."
      );
    }

    return message || ("Failed calling " + functionName + ".");
  }

  function canManageWhoopConnection() {
    if (state.isCoachView) {
      return false;
    }
    if (!state.user || !state.viewUser) {
      return false;
    }
    return String(state.user.id || "") === String(state.viewUser.id || "");
  }

  function getWhoopRedirectUrl() {
    return window.location.origin + "/profile.html";
  }

  function maybeShowStravaRedirectStatus() {
    var params;
    try {
      params = new URLSearchParams(window.location.search || "");
    } catch (e) {
      return;
    }

    var status = String(params.get(STRAVA_REDIRECT_STATUS_PARAM) || "").trim();
    if (!status) {
      return;
    }

    var message = String(params.get(STRAVA_REDIRECT_MESSAGE_PARAM) || "").trim();
    if (!message) {
      if (status === "connected") {
        message = "Strava account connected. Run a sync to pull your latest metrics.";
      } else if (status === "synced") {
        message = "Strava metrics synced successfully.";
      } else {
        message = "There was an issue completing Strava connection.";
      }
    }

    setStravaStatus(message, status === "error" ? "error" : "success");
    params.delete(STRAVA_REDIRECT_STATUS_PARAM);
    params.delete(STRAVA_REDIRECT_MESSAGE_PARAM);
    if (window.history && window.history.replaceState) {
      var cleanQuery = params.toString();
      var cleanUrl = window.location.pathname + (cleanQuery ? "?" + cleanQuery : "") + window.location.hash;
      window.history.replaceState({}, "", cleanUrl);
    }
  }

  function maybeShowWhoopRedirectStatus() {
    var params;
    try {
      params = new URLSearchParams(window.location.search || "");
    } catch (e) {
      return;
    }

    var status = String(params.get(WHOOP_REDIRECT_STATUS_PARAM) || "").trim();
    if (!status) {
      return;
    }

    var message = String(params.get(WHOOP_REDIRECT_MESSAGE_PARAM) || "").trim();
    if (!message) {
      if (status === "connected") {
        message = "Whoop account connected. Run a sync to pull your latest metrics.";
      } else if (status === "synced") {
        message = "Whoop metrics synced successfully.";
      } else {
        message = "There was an issue completing Whoop connection.";
      }
    }

    setWhoopStatus(message, status === "error" ? "error" : "success");
    params.delete(WHOOP_REDIRECT_STATUS_PARAM);
    params.delete(WHOOP_REDIRECT_MESSAGE_PARAM);
    if (window.history && window.history.replaceState) {
      var cleanQuery = params.toString();
      var cleanUrl = window.location.pathname + (cleanQuery ? "?" + cleanQuery : "") + window.location.hash;
      window.history.replaceState({}, "", cleanUrl);
    }
  }

  function maybeShowFoundingPaymentStatus() {
    var params;
    try {
      params = new URLSearchParams(window.location.search || "");
    } catch (e) {
      return;
    }

    var status = String(params.get(FOUNDING_PAYMENT_STATUS_PARAM) || "").trim().toLowerCase();
    if (!status) {
      return;
    }

    var message = String(params.get(FOUNDING_PAYMENT_MESSAGE_PARAM) || "").trim();
    if (!message) {
      if (status === "success") {
        message = "Payment complete. Your membership payment task is now marked complete and your coach can review it.";
      } else if (status === "cancelled") {
        message = "Payment was cancelled. You can return to the founding member page anytime to finish checkout.";
      } else {
        message = "There was an issue verifying payment status.";
      }
    }

    setOnboardingStatus(message, status === "success" ? "success" : "info");

    if (status === "success") {
      finalizeFoundingMemberPaymentFromSuccess()
        .then(function () {
          loadOnboardingIntake();
          loadFoundingOnboardingTaskContext();
          loadFoundingSubscriptionState();

          var tasksSection = document.getElementById("profile-tasks-section");
          if (tasksSection && typeof tasksSection.scrollIntoView === "function") {
            tasksSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        })
        .catch(function () {
          var tasksSection = document.getElementById("profile-tasks-section");
          if (tasksSection && typeof tasksSection.scrollIntoView === "function") {
            tasksSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
    }

    params.delete(FOUNDING_PAYMENT_STATUS_PARAM);
    params.delete(FOUNDING_PAYMENT_MESSAGE_PARAM);

    if (window.history && window.history.replaceState) {
      var cleanQuery = params.toString();
      var cleanUrl = window.location.pathname + (cleanQuery ? "?" + cleanQuery : "") + window.location.hash;
      window.history.replaceState({}, "", cleanUrl);
    }
  }

  function finalizeFoundingMemberPaymentFromSuccess() {
    if (!state.client || !getViewedUserId()) {
      return Promise.resolve(false);
    }

    return state.client
      .rpc("complete_founding_member_payment", {
        p_athlete_user_id: getViewedUserId()
      })
      .then(function (result) {
        if (result.error) {
          throw result.error;
        }

        return true;
      });
  }

  function setStravaStatus(message, variant) {
    if (!state.stravaStatusElement) {
      return;
    }

    state.stravaStatusElement.textContent = message || "";
    state.stravaStatusElement.classList.remove("is-error", "is-success", "is-info");

    if (!message) {
      return;
    }

    if (variant === "error") {
      state.stravaStatusElement.classList.add("is-error");
    } else if (variant === "success") {
      state.stravaStatusElement.classList.add("is-success");
    } else {
      state.stravaStatusElement.classList.add("is-info");
    }
  }

  function setWhoopStatus(message, variant) {
    if (!state.whoopStatusElement) {
      return;
    }

    state.whoopStatusElement.textContent = message || "";
    state.whoopStatusElement.classList.remove("is-error", "is-success", "is-info");

    if (!message) {
      return;
    }

    if (variant === "error") {
      state.whoopStatusElement.classList.add("is-error");
    } else if (variant === "success") {
      state.whoopStatusElement.classList.add("is-success");
    } else {
      state.whoopStatusElement.classList.add("is-info");
    }
  }

  function canManageStravaConnection() {
    if (state.isCoachView) {
      return false;
    }
    if (!state.user || !state.viewUser) {
      return false;
    }
    return String(state.user.id || "") === String(state.viewUser.id || "");
  }

  function getStravaRedirectUrl() {
    return window.location.origin + "/profile.html";
  }

  function sumNumeric(rows, key) {
    return (rows || []).reduce(function (total, row) {
      var value = Number(row && row[key]);
      if (!Number.isFinite(value)) {
        return total;
      }
      return total + value;
    }, 0);
  }

  function formatInteger(value) {
    if (!Number.isFinite(value)) {
      return "—";
    }
    return String(Math.round(value));
  }

  function formatDecimal(value, places) {
    if (!Number.isFinite(value)) {
      return "—";
    }
    return value.toFixed(places);
  }

  function formatNullableNumber(value, suffix) {
    var numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
      return "—";
    }
    var formatted = Math.abs(numberValue - Math.round(numberValue)) < 0.01
      ? String(Math.round(numberValue))
      : numberValue.toFixed(1);
    return formatted + (suffix || "");
  }

  function loadCurrentTrainingProgramWithoutJoin(contentElement) {
    state.client
      .from("user_training_programs")
      .select("*")
      .eq("user_id", getViewedUserId())
      .order("assigned_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          contentElement.innerHTML = '<p class="profile-training-error">' + escapeHtml(result.error.message) + "</p>";
          contentElement.style.minHeight = "";
          updateQuickGlanceCard("training", "Unavailable", "Could not load training programs", "alert");
          return;
        }

        var programs = result.data || [];
        if (!programs.length) {
          renderTrainingPrograms(contentElement, [], {});
          return;
        }

        var missingProgramIds = [];
        var seenProgramIds = {};
        programs.forEach(function (program) {
          if (program && program.program_id && !program.program_name && !seenProgramIds[program.program_id]) {
            seenProgramIds[program.program_id] = true;
            missingProgramIds.push(program.program_id);
          }
        });

        if (!missingProgramIds.length) {
          hydrateAndRenderTrainingSchedules(contentElement, programs);
          return;
        }

        state.client
          .from("training_programs")
          .select("id,name,description")
          .in("id", missingProgramIds)
          .then(function (programResult) {
            var templateMap = {};
            if (!programResult.error && programResult.data) {
              programResult.data.forEach(function (templateRow) {
                templateMap[templateRow.id] = templateRow;
              });
            }

            var enrichedPrograms = programs.map(function (program) {
              var copy = Object.assign({}, program);
              if (!copy.program_name && copy.program_id && templateMap[copy.program_id]) {
                copy.training_program = {
                  name: templateMap[copy.program_id].name,
                  description: templateMap[copy.program_id].description
                };
              }
              return copy;
            });

            hydrateAndRenderTrainingSchedules(contentElement, enrichedPrograms);
          })
          .catch(function () {
            hydrateAndRenderTrainingSchedules(contentElement, programs);
          });
      })
      .catch(function (error) {
        contentElement.innerHTML =
          '<p class="profile-training-error">' +
          escapeHtml(error && error.message ? error.message : "Failed to load training program.") +
          "</p>";
        contentElement.style.minHeight = "";
        updateQuickGlanceCard("training", "Unavailable", "Could not load training programs", "alert");
      });
  }

  function hydrateAndRenderTrainingSchedules(contentElement, programs) {
    var activeAssignmentIds = (programs || [])
      .filter(function (program) {
        return !!program && !!program.is_active && !!program.id;
      })
      .map(function (program) {
        return String(program.id);
      });

    if (!activeAssignmentIds.length) {
      renderTrainingPrograms(contentElement, programs, {});
      return;
    }

    state.client
      .from("athlete_program_schedule")
      .select("id,user_training_program_id,slot_key,session_label,scheduled_for,status")
      .eq("athlete_user_id", getViewedUserId())
      .in("user_training_program_id", activeAssignmentIds)
      .order("scheduled_for", { ascending: true })
      .then(function (scheduleResult) {
        if (scheduleResult.error) {
          renderTrainingPrograms(contentElement, programs, {});
          return;
        }

        var scheduleByAssignment = {};
        (scheduleResult.data || []).forEach(function (row) {
          var assignmentId = String(row && row.user_training_program_id || "");
          if (!assignmentId) {
            return;
          }

          if (!scheduleByAssignment[assignmentId]) {
            scheduleByAssignment[assignmentId] = [];
          }

          scheduleByAssignment[assignmentId].push({
            id: String(row && row.id || ""),
            slot_key: String(row && row.slot_key || ""),
            session_label: String(row && row.session_label || "").trim(),
            scheduled_for: String(row && row.scheduled_for || ""),
            status: String(row && row.status || "scheduled")
          });
        });

        renderTrainingPrograms(contentElement, programs, scheduleByAssignment);
      })
      .catch(function () {
        renderTrainingPrograms(contentElement, programs, {});
      });
  }

  function renderTrainingPrograms(contentElement, programs, scheduleByAssignment) {
    state.trainingProgramsLoaded = true;
    state.trainingProgramsCache = Array.isArray(programs) ? programs.slice() : [];
    state.trainingScheduleByAssignment = scheduleByAssignment && typeof scheduleByAssignment === "object"
      ? Object.assign({}, scheduleByAssignment)
      : {};

    var activePrograms = (programs || []).filter(function (program) {
      return !!program.is_active;
    });
    var pastPrograms = (programs || []).filter(function (program) {
      return !program.is_active;
    });

    var safeScheduleMap = scheduleByAssignment && typeof scheduleByAssignment === "object"
      ? scheduleByAssignment
      : {};

    refreshAthleteDashboardAccess();
    var accessContext = state.dashboardAccessContext || {};
    var workoutCalendarEnabled = state.isCoachView || !!(accessContext.features && accessContext.features.workoutCalendar);

    var upcomingScheduledItems = collectUpcomingScheduledItems(activePrograms, safeScheduleMap, 14);
    state.dashboardUpcomingTrainingItems = upcomingScheduledItems.slice();
    var trainingCalendarItems = collectTrainingCalendarItems(activePrograms, safeScheduleMap);
    var calendarSupplementalItems = collectTrainingCalendarSupplementalItems();
    var calendarScheduledItems = trainingCalendarItems.concat(calendarSupplementalItems);
    var adherence = calculateTrainingAdherenceStats(trainingCalendarItems);
    state.trainingConsistencyMessage = trainingCalendarItems.length
      ? String(adherence && adherence.consistencyMessage || "")
      : "";

    renderDashboardCoachTasks();

    updateQuickGlanceTraining(activePrograms.length, pastPrograms.length, upcomingScheduledItems);

    var html = '';

    html += '<div class="training-program-section-header">';
    html += '<p class="training-note">Browse the program library to find a plan that fits your goals. Your plan will appear here once your coach assigns it to you.</p>';
    html += (state.isCoachView
      ? '<div class="training-coach-actions"><button type="button" class="btn profile-btn-edit-profile training-change-btn" data-assign-active-program>Assign Program to Athlete</button><button type="button" class="btn profile-btn-edit-profile training-change-btn" data-change-active-program>Edit Program for Athlete</button></div>'
      : '');
    html += '</div>';

    if (workoutCalendarEnabled && calendarScheduledItems.length) {
      html += buildTrainingTodayStripHtml(trainingCalendarItems, calendarSupplementalItems);
    }

    if (workoutCalendarEnabled) {
      html += buildTrainingUpcomingEventsCardHtml(calendarSupplementalItems);
    }

    if (workoutCalendarEnabled && calendarScheduledItems.length) {
      html += buildTrainingCalendarCardHtml(calendarScheduledItems);
    } else if (workoutCalendarEnabled && activePrograms.length) {
      html +=
        '<article class="training-calendar-card training-calendar-card-compact">' +
          '<h3>Workout Calendar</h3>' +
          '<p>Your coach has not added dated sessions yet. Once your plan is scheduled, the calendar will appear here.</p>' +
        '</article>';
    } else if (!workoutCalendarEnabled && !state.isCoachView) {
      html +=
        '<article class="training-calendar-card training-calendar-card-compact">' +
          '<h3>Workout Calendar Locked</h3>' +
          '<p>Calendar view unlocks after your liability waiver is completed and a training plan has been assigned by your coach.</p>' +
        '</article>';
    }

    var browseProgramsEnabled = state.isCoachView || !!(accessContext && accessContext.features && accessContext.features.browsePrograms);
    var trainingEmptyStateActionsHtml = "";

    if (!state.isCoachView) {
      if (browseProgramsEnabled) {
        trainingEmptyStateActionsHtml += '<a class="btn profile-btn-cancel" href="training-programs.html">Browse Program Library</a>';
      } else {
        trainingEmptyStateActionsHtml += '<a class="btn profile-btn-cancel" href="#profile-tasks-section">Complete Liability Waiver First</a>';
      }

      trainingEmptyStateActionsHtml += '<a class="btn profile-btn-cancel" href="custom-plan-inquiry.html">Inquire About Individualized Programming</a>';
      trainingEmptyStateActionsHtml += '<a class="btn profile-btn-cancel" href="membership-inquiry.html">Inquire About Membership</a>';
    }

    if (!activePrograms.length) {
      html +=
        '<div class="profile-empty-state">' +
          '<p class="profile-empty-state-title">No training session assigned</p>' +
          '<p class="profile-empty-state-copy">Activate a plan so your current workout appears here.</p>' +
          (state.isCoachView
            ? '<p class="profile-empty-state-copy">Use coach actions above to assign a program.</p>'
            : '<div class="profile-empty-state-actions">' + trainingEmptyStateActionsHtml + '</div>') +
        '</div>';
    } else {
      html += '<div class="training-program-grid training-program-grid-active">';
      activePrograms.forEach(function (program) {
        var scheduleRows = safeScheduleMap[String(program.id || "")] || [];
        html += buildTrainingProgramCard(program, true, scheduleRows);
      });
      html += '</div>';
    }

    if (workoutCalendarEnabled && trainingCalendarItems.length) {
      html += buildTrainingAdherencePanelHtml(adherence);
    }

    html += '<p class="profile-status training-program-status" role="status" aria-live="polite" data-training-program-status></p>';

    contentElement.innerHTML = html;
    initializeTrainingCalendarNavigators(contentElement);
    contentElement.style.minHeight = "";
  }

  function renderDashboardQuickGlanceDefaults() {
    state.readinessTrainingActiveCount = 0;
    state.readinessNextEventDays = null;
    state.readinessNutritionPct = null;
    state.readinessRecoveryScore = null;
    state.readinessStravaConnected = false;
    state.statusReadinessPct = 0;
    state.statusLoadPct = 0;
    state.statusDurabilityPct = 0;
    state.statusProgressPct = 0;
    state.dashboardUpcomingTrainingItems = [];
    state.trainingConsistencyMessage = "";
    state.compassNextObjective = "Set your next race, trip, or milestone.";
    state.compassNextObjectiveDate = null;
    updateQuickGlanceCard("training", "Loading...", "Checking today's session", "");
    updateQuickGlanceCard("goals", "Loading...", "Finding your next event", "");
    updateQuickGlanceCard("nutrition", "Loading...", "Checking today's intake", "");
    updateQuickGlanceCard("strava", "Loading...", "Checking recovery signals", "");
    updateStatusRing("readiness", 0, "Loading", "Checking readiness", "");
    updateStatusRing("load", 0, "Loading", "Checking training load", "");
    updateStatusRing("durability", 0, "Loading", "Checking durability", "");
    updateStatusRing("progress", 0, "Loading", "Checking progress", "");
    updateMountainHeadline();
  }

  function updateQuickGlanceTraining(activeCount, pastCount, upcomingScheduledItems) {
    var active = Number(activeCount) || 0;
    var past = Number(pastCount) || 0;
    state.readinessTrainingActiveCount = active;

    var upcoming = Array.isArray(upcomingScheduledItems) ? upcomingScheduledItems : [];
    var todayKey = getTodayDateInputValue();
    var todaysSessions = upcoming.filter(function (item) {
      return String(item && item.scheduled_for || "") === todayKey;
    });
    var nextUpcoming = upcoming.find(function (item) {
      return String(item && item.scheduled_for || "") >= todayKey;
    });

    if (active > 0) {
      if (todaysSessions.length) {
        state.statusLoadPct = 100;
        updateStatusRing(
          "load",
          state.statusLoadPct,
          "Today",
          String(todaysSessions.length) + " workout" + (todaysSessions.length === 1 ? "" : "s"),
          "good"
        );
        updateQuickGlanceCard(
          "training",
          "Today: " + todaysSessions.length + " Session" + (todaysSessions.length === 1 ? "" : "s"),
          "Open your scheduled workout calendar below",
          "good"
        );
        updateDailyReadinessCard();
        return;
      }

      if (nextUpcoming && nextUpcoming.scheduled_for) {
        var daysUntil = getDaysUntilDate(nextUpcoming.scheduled_for);
        if (typeof daysUntil === "number") {
          if (daysUntil <= 0) {
            state.statusLoadPct = 100;
          } else if (daysUntil <= 3) {
            state.statusLoadPct = 88;
          } else if (daysUntil <= 7) {
            state.statusLoadPct = 74;
          } else {
            state.statusLoadPct = 62;
          }
        } else {
          state.statusLoadPct = 65;
        }
        updateStatusRing(
          "load",
          state.statusLoadPct,
          typeof daysUntil === "number"
            ? (daysUntil === 0 ? "Today" : (daysUntil > 0 ? "In " + daysUntil + "d" : "Due"))
            : "Active",
          String(nextUpcoming.session_label || "Next session"),
          daysUntil === 0 ? "good" : ""
        );
        var nextText = typeof daysUntil === "number"
          ? (daysUntil === 0 ? "Today" : (daysUntil > 0 ? "In " + daysUntil + " day" + (daysUntil === 1 ? "" : "s") : "Overdue"))
          : "Upcoming";
        updateQuickGlanceCard(
          "training",
          nextText,
          "Next: " + String(nextUpcoming.session_label || "Scheduled workout"),
          daysUntil === 0 ? "good" : ""
        );
        updateDailyReadinessCard();
        return;
      }

      updateQuickGlanceCard(
        "training",
        "Session Ready",
        String(active) + " active program" + (active === 1 ? "" : "s") + " | " + String(past) + " past",
        "good"
      );
      state.statusLoadPct = 72;
      updateStatusRing("load", state.statusLoadPct, "Active", String(active) + " program" + (active === 1 ? "" : "s"), "good");
      updateDailyReadinessCard();
      return;
    }

    updateQuickGlanceCard(
      "training",
      "No Session Assigned",
      state.isCoachView ? "Assign a program from coach actions" : "Activate a plan to get today's workout",
      "alert"
    );
    state.statusLoadPct = 18;
    updateStatusRing("load", state.statusLoadPct, "Needs Plan", "No active training program", "alert");
    updateDailyReadinessCard();
  }

  function updateQuickGlanceGoals(items) {
    var list = Array.isArray(items) ? items : [];
    var active = list.filter(function (item) {
      return String(item && item.status || "active") !== "completed";
    });

    var activeEvents = active.filter(function (item) {
      var type = String(item && item.goal_type || "").toLowerCase();
      if (type === "race" || type === "event" || type === "trip") {
        return true;
      }

      var title = String(item && item.title || "").toLowerCase();
      return /race|event|competition|meet|marathon|ultra|triathlon/.test(title);
    });

    if (!activeEvents.length) {
      state.readinessNextEventDays = null;
      state.compassNextObjective = "Set your next race, trip, or milestone.";
      state.compassNextObjectiveDate = null;
      state.statusProgressPct = 20;
      updateStatusRing("progress", state.statusProgressPct, "No Event", "Set your next event", "alert");
      updateQuickGlanceCard("goals", "No Event Set", "Add a race, event, or trip to anchor your training", "alert");
      updateDailyReadinessCard();
      return;
    }

    var withDate = activeEvents.filter(function (item) {
      return !!(item && item.target_date);
    }).sort(function (a, b) {
      return String(a.target_date || "").localeCompare(String(b.target_date || ""));
    });

    if (!withDate.length) {
      state.readinessNextEventDays = null;
      state.compassNextObjective = String(activeEvents[0] && activeEvents[0].title || "Add a target date");
      state.compassNextObjectiveDate = null;
      state.statusProgressPct = 52;
      updateStatusRing("progress", state.statusProgressPct, "Set Date", "Event exists, date missing", "");
      updateQuickGlanceCard("goals", String(activeEvents.length) + " Event" + (activeEvents.length === 1 ? "" : "s"), "Add target dates to start countdowns", "");
      updateDailyReadinessCard();
      return;
    }

    var nextItem = withDate[0];
    state.compassNextObjective = String(nextItem && nextItem.title || "Upcoming milestone");
    state.compassNextObjectiveDate = String(nextItem && nextItem.target_date || "");
    var daysUntil = getDaysUntilDate(nextItem.target_date);
    state.readinessNextEventDays = typeof daysUntil === "number" ? daysUntil : null;
    if (typeof daysUntil === "number") {
      if (daysUntil <= 2) {
        state.statusProgressPct = 100;
      } else if (daysUntil <= 7) {
        state.statusProgressPct = 95;
      } else if (daysUntil <= 14) {
        state.statusProgressPct = 90;
      } else if (daysUntil <= 30) {
        state.statusProgressPct = 82;
      } else if (daysUntil <= 60) {
        state.statusProgressPct = 72;
      } else {
        state.statusProgressPct = 62;
      }
    } else {
      state.statusProgressPct = 58;
    }

    if ((state.readinessTrainingActiveCount || 0) > 0) {
      state.statusProgressPct = Math.min(100, state.statusProgressPct + 8);
    }
    var meta = "Next: " + (nextItem.title || "Upcoming milestone");
    var value = "Upcoming";
    if (typeof daysUntil === "number") {
      if (daysUntil > 0) {
        value = daysUntil + " days";
      } else if (daysUntil === 0) {
        value = "Today";
      } else {
        value = Math.abs(daysUntil) + " days ago";
      }
    }

    updateStatusRing("progress", state.statusProgressPct, value, nextItem.title || "Upcoming milestone", daysUntil === 0 ? "good" : "");
    updateQuickGlanceCard("goals", value, meta, daysUntil === 0 ? "good" : "");
    updateDailyReadinessCard();
  }

  function updateQuickGlanceNutrition() {
    var logs = sortNutritionLogs(state.nutritionLogs || []);
    var todayKey = getTodayDateInputValue();
    var today = logs.find(function (log) {
      return String(log && log.logged_on || "") === todayKey;
    }) || null;

    if (!today) {
      state.readinessNutritionPct = null;
      state.statusDurabilityPct = 16;
      updateStatusRing("durability", state.statusDurabilityPct, "No Log", "Add nutrition for today", "alert");
      updateQuickGlanceCard("nutrition", "No Entry Today", "Add food to track daily intake", "alert");
      updateDailyReadinessCard();
      return;
    }

    var calories = Number(today.calories);
    var target = Number(state.nutritionTargets && state.nutritionTargets.target_calories);
    if (Number.isFinite(calories) && Number.isFinite(target) && target > 0) {
      var pct = Math.max(0, Math.min((calories / target) * 100, 999));
      state.readinessNutritionPct = pct;
      var adherencePct = Math.max(0, Math.min(100, Math.round(100 - Math.abs(pct - 100))));
      state.statusDurabilityPct = adherencePct;
      var value = formatInteger(calories) + " kcal";
      var meta = formatInteger(pct) + "% of target";
      updateStatusRing(
        "durability",
        state.statusDurabilityPct,
        String(adherencePct) + "%",
        formatInteger(pct) + "% calories vs target",
        adherencePct >= 70 ? "good" : ""
      );
      updateQuickGlanceCard("nutrition", value, meta, pct >= 70 && pct <= 120 ? "good" : "");
      updateDailyReadinessCard();
      return;
    }

    if (Number.isFinite(calories)) {
      state.readinessNutritionPct = null;
      state.statusDurabilityPct = 56;
      updateStatusRing("durability", state.statusDurabilityPct, "Logged", "Set calorie target", "");
      updateQuickGlanceCard("nutrition", formatInteger(calories) + " kcal", "Set calorie target for comparison", "");
      updateDailyReadinessCard();
      return;
    }

    state.readinessNutritionPct = null;
    state.statusDurabilityPct = 46;
    updateStatusRing("durability", state.statusDurabilityPct, "Logged", "Nutrition entry saved", "good");
    updateQuickGlanceCard("nutrition", "Logged Today", "Nutrition entry saved", "good");
    updateDailyReadinessCard();
  }

  function updateStatusRing(type, percent, valueLabel, metaLabel, variant) {
    var card = document.querySelector('[data-status-ring="' + String(type || "") + '"]');
    if (!card) {
      return;
    }

    var visual = card.querySelector("[data-status-ring-visual]");
    var valueEl = card.querySelector("[data-status-ring-value]");
    var metaEl = card.querySelector("[data-status-ring-meta]");
    var safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
    var fallbackLabel = formatInteger(safePercent) + "%";
    var interpretedLabel = valueLabel;

    if (valueLabel !== "Loading") {
      if (type === "readiness") {
        interpretedLabel = getReadinessStatusLabel(safePercent);
      } else if (type === "load") {
        interpretedLabel = getLoadStatusLabel(safePercent);
      } else if (type === "durability") {
        interpretedLabel = getDurabilityStatusLabel(safePercent);
      } else if (type === "progress") {
        interpretedLabel = getProgressStatusLabel(safePercent);
      }
    }

    if (visual) {
      visual.style.setProperty("--peak-pct", String(safePercent));
    }

    if (valueEl) {
      valueEl.textContent = String(interpretedLabel || fallbackLabel);
    }

    if (metaEl) {
      metaEl.textContent = String(metaLabel || "");
    }

    card.classList.remove("is-good", "is-alert");
    if (variant === "good") {
      card.classList.add("is-good");
    } else if (variant === "alert") {
      card.classList.add("is-alert");
    }

    updateMountainHeadline();
  }

  function updateQuickGlanceCard(type, value, meta, variant) {
    var valueElement = null;
    var metaElement = null;
    var card = document.querySelector('[data-glance-card="' + String(type || "") + '"]');

    if (type === "training") {
      valueElement = state.glanceTrainingValue;
      metaElement = state.glanceTrainingMeta;
    } else if (type === "goals") {
      valueElement = state.glanceGoalsValue;
      metaElement = state.glanceGoalsMeta;
    } else if (type === "nutrition") {
      valueElement = state.glanceNutritionValue;
      metaElement = state.glanceNutritionMeta;
    } else if (type === "strava") {
      valueElement = state.glanceStravaValue;
      metaElement = state.glanceStravaMeta;
    }

    if (valueElement) {
      valueElement.textContent = String(value || "--");
    }

    if (metaElement) {
      metaElement.textContent = String(meta || "");
    }

    if (card) {
      card.classList.remove("is-good", "is-alert");
      if (variant === "good") {
        card.classList.add("is-good");
      } else if (variant === "alert") {
        card.classList.add("is-alert");
      }
    }
  }

  function setTrainingProgramsTab(contentElement, tab) {
    if (!contentElement) {
      return;
    }

    var selectedTab = tab === "past" ? "past" : "current";

    contentElement.querySelectorAll("[data-training-program-tab]").forEach(function (btn) {
      var isActive = btn.getAttribute("data-training-program-tab") === selectedTab;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    contentElement.querySelectorAll("[data-training-program-panel]").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-training-program-panel") !== selectedTab;
    });
  }

  function buildTrainingProgramCard(program, isActive) {
    var programName =
      (program.training_program && program.training_program.name) ||
      program.program_name ||
      (program.program_id ? "Program " + String(program.program_id).slice(0, 8) : "Assigned Program");
    var athleteName =
      (state.profile && state.profile.name) ||
      (state.viewUser && state.viewUser.email) ||
      "Athlete";

    var startDate = program.assigned_at ? formatDate(program.assigned_at) : "—";
    var assignmentQuery = program.id ? "&assignmentId=" + encodeURIComponent(program.id) : "";
    var athleteQuery = "&athleteName=" + encodeURIComponent(athleteName);
    var programUrl =
      "training-program-example.html?program=" + encodeURIComponent(programName) +
      (program.program_id ? "&templateId=" + encodeURIComponent(program.program_id) : "") +
      assignmentQuery +
      athleteQuery;
    var viewUrl = programUrl + "&view=1";

    var scheduleRows = Array.isArray(arguments[2]) ? arguments[2] : [];
    var nextSession = getNextScheduledSession(scheduleRows);
    var nextSessionLabel = nextSession
      ? String(nextSession.session_label || nextSession.slot_key || "Scheduled Workout")
      : "Not scheduled";
    var nextSessionDate = nextSession && nextSession.scheduled_for
      ? formatDate(nextSession.scheduled_for)
      : "—";
    var scheduledProgramUrl = nextSession && nextSession.slot_key
      ? (programUrl + "&day=" + encodeURIComponent(nextSession.slot_key))
      : programUrl;
    var overviewUrl = isActive ? viewUrl : viewUrl;
    var isAthleteActiveCard = isActive && !state.isCoachView;

    if (isAthleteActiveCard) {
      return [
        '<div class="profile-training-details training-program-card is-active is-compact-active" data-training-program-id="' + escapeAttribute(program.id || "") + '">',
        '<a class="training-program-link training-program-link-title" href="' + programUrl + '">' + escapeHtml(programName) + '</a>',
        '<div class="training-program-meta">',
        '<span><strong>Start:</strong> ' + escapeHtml(startDate) + '</span>',
        '<span><strong>Next:</strong> ' + escapeHtml(nextSessionLabel) + ' · ' + escapeHtml(nextSessionDate) + '</span>',
        '</div>',
        '<a class="btn training-open-btn training-open-btn-compact" href="' + overviewUrl + '">Program Overview</a>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="profile-training-details training-program-card' + (isActive ? ' is-active' : ' is-past') + '" data-training-program-id="' + escapeAttribute(program.id || "") + '">',
      '<div class="training-row"><span>Program</span><strong><a class="training-program-link" href="' + programUrl + '">' + escapeHtml(programName) + '</a></strong></div>',
      '<div class="training-row"><span>Start Date</span><strong>' + escapeHtml(startDate) + '</strong></div>',
      (isActive ? '<div class="training-row"><span>Next Workout</span><strong>' + escapeHtml(nextSessionLabel) + ' · ' + escapeHtml(nextSessionDate) + '</strong></div>' : ''),
      isActive
        ? '<p class="training-note">This program is currently active. Use the button below when it is complete.</p>'
        : '<p class="training-note">This program has been moved to your past training history.</p>',
      '<a class="btn training-open-btn" href="' + (isActive ? overviewUrl : viewUrl) + '">' + (isActive ? 'Program Overview' : 'View Program') + '</a>',
      isActive
        ? '<div class="training-card-actions"><button type="button" class="btn profile-btn-edit-profile training-complete-btn" data-complete-program="' + escapeAttribute(program.id || "") + '">Completed Training Program</button></div>'
        : '<div class="training-card-actions training-card-actions-past"><button type="button" class="btn profile-btn-edit-profile training-make-current-btn" data-make-current-program="' + escapeAttribute(program.id || "") + '">Make Current</button><button type="button" class="btn profile-btn-delete training-delete-past-btn" data-delete-past-program="' + escapeAttribute(program.id || "") + '">Delete</button></div>',
      '</div>'
    ].join("");
  }

  function collectUpcomingScheduledItems(activePrograms, scheduleByAssignment, maxItems) {
    var programsById = {};
    (Array.isArray(activePrograms) ? activePrograms : []).forEach(function (program) {
      programsById[String(program && program.id || "")] = program;
    });

    var todayKey = getTodayDateInputValue();
    var allItems = [];

    Object.keys(scheduleByAssignment || {}).forEach(function (assignmentId) {
      var rows = Array.isArray(scheduleByAssignment[assignmentId]) ? scheduleByAssignment[assignmentId] : [];
      var program = programsById[String(assignmentId || "")];
      if (!program) {
        return;
      }

      rows.forEach(function (row) {
        var dateValue = String(row && row.scheduled_for || "");
        if (!dateValue || dateValue < todayKey) {
          return;
        }

        allItems.push({
          program: program,
          assignment_id: assignmentId,
          scheduled_for: dateValue,
          slot_key: String(row && row.slot_key || ""),
          session_label: String(row && row.session_label || row && row.slot_key || "Workout").trim() || "Workout"
        });
      });
    });

    allItems.sort(function (a, b) {
      if (a.scheduled_for !== b.scheduled_for) {
        return a.scheduled_for.localeCompare(b.scheduled_for);
      }
      return String(a.session_label || "").localeCompare(String(b.session_label || ""));
    });

    return allItems.slice(0, Math.max(0, parseInt(maxItems, 10) || 0));
  }

  function collectTrainingCalendarItems(activePrograms, scheduleByAssignment) {
    var programsById = {};
    (Array.isArray(activePrograms) ? activePrograms : []).forEach(function (program) {
      programsById[String(program && program.id || "")] = program;
    });

    var allItems = [];

    Object.keys(scheduleByAssignment || {}).forEach(function (assignmentId) {
      var rows = Array.isArray(scheduleByAssignment[assignmentId]) ? scheduleByAssignment[assignmentId] : [];
      var program = programsById[String(assignmentId || "")];
      if (!program) {
        return;
      }

      rows.forEach(function (row) {
        var dateValue = String(row && row.scheduled_for || "");
        if (!dateValue) {
          return;
        }

        allItems.push({
          kind: "training",
          program: program,
          schedule_id: String(row && row.id || ""),
          assignment_id: assignmentId,
          scheduled_for: dateValue,
          slot_key: String(row && row.slot_key || ""),
          session_label: String(row && row.session_label || row && row.slot_key || "Workout").trim() || "Workout",
          status: String(row && row.status || "scheduled")
        });
      });
    });

    allItems.sort(function (a, b) {
      if (a.scheduled_for !== b.scheduled_for) {
        return a.scheduled_for.localeCompare(b.scheduled_for);
      }
      if (String(a.slot_key || "") !== String(b.slot_key || "")) {
        return String(a.slot_key || "").localeCompare(String(b.slot_key || ""));
      }
      return String(a.session_label || "").localeCompare(String(b.session_label || ""));
    });

    return allItems;
  }

  function collectTrainingCalendarSupplementalItems() {
    var supplementalItems = [];

    (Array.isArray(state.goalItems) ? state.goalItems : []).forEach(function (item) {
      var targetDate = String(item && item.target_date || "").trim();
      if (!targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
        return;
      }

      var typeValue = String(item && item.goal_type || "goal").trim().toLowerCase();
      var isEvent = /race|event|competition|meet|trip/.test(typeValue);
      var title = String(item && item.title || "").trim() || (isEvent ? "Event" : "Goal");
      var status = String(item && item.status || "active").trim().toLowerCase();

      supplementalItems.push({
        kind: "milestone",
        milestone_type: isEvent ? "event" : "goal",
        milestone_status: status,
        scheduled_for: targetDate,
        title: title,
        subtitle: getGoalTypeLabel(typeValue) || (isEvent ? "Event" : "Goal")
      });
    });

    var birthDate = getProfileDobValue(state.profile || null);
    if (/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      var birthdayItems = buildBirthdayCalendarItems(birthDate, 6, 12);
      supplementalItems = supplementalItems.concat(birthdayItems);
    }

    supplementalItems.sort(function (a, b) {
      if (a.scheduled_for !== b.scheduled_for) {
        return String(a.scheduled_for || "").localeCompare(String(b.scheduled_for || ""));
      }
      return String(a.title || "").localeCompare(String(b.title || ""));
    });

    return supplementalItems;
  }

  function buildBirthdayCalendarItems(dobValue, backMonths, forwardMonths) {
    var parsedDob = parseDateInputValue(dobValue);
    if (!parsedDob) {
      return [];
    }

    var today = new Date();
    var start = new Date(today.getFullYear(), today.getMonth(), 1);
    var end = new Date(today.getFullYear(), today.getMonth(), 1);
    start.setMonth(start.getMonth() - (parseInt(backMonths, 10) || 0));
    end.setMonth(end.getMonth() + (parseInt(forwardMonths, 10) || 0));

    var birthdayMonth = parsedDob.getMonth();
    var birthdayDay = parsedDob.getDate();
    var items = [];
    var cursor = new Date(start.getFullYear(), start.getMonth(), 1);

    while (cursor <= end) {
      var year = cursor.getFullYear();
      var daysInMonth = new Date(year, birthdayMonth + 1, 0).getDate();
      if (birthdayDay <= daysInMonth && cursor.getMonth() === birthdayMonth) {
        items.push({
          kind: "birthday",
          scheduled_for: formatDateInputValue(new Date(year, birthdayMonth, birthdayDay)),
          title: "Birthday",
          subtitle: "Celebrate"
        });
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return items;
  }

  function getNextScheduledSession(rows) {
    var todayKey = getTodayDateInputValue();
    var sorted = (Array.isArray(rows) ? rows : []).slice().sort(function (a, b) {
      return String(a && a.scheduled_for || "").localeCompare(String(b && b.scheduled_for || ""));
    });

    for (var i = 0; i < sorted.length; i++) {
      var row = sorted[i];
      if (String(row && row.scheduled_for || "") >= todayKey) {
        return row;
      }
    }

    return null;
  }

  function getTrainingSessionLaunchHref(item) {
    if (!item || String(item.kind || "") !== "training") {
      return "";
    }

    var program = item.program || {};
    var programName =
      (program.training_program && program.training_program.name) ||
      program.program_name ||
      (program.program_id ? "Program " + String(program.program_id).slice(0, 8) : "Assigned Program");
    var athleteName =
      (state.profile && state.profile.name) ||
      (state.viewUser && state.viewUser.email) ||
      "Athlete";

    return (
      "training-program-example.html?program=" + encodeURIComponent(programName) +
      (program.program_id ? "&templateId=" + encodeURIComponent(program.program_id) : "") +
      (program.id ? "&assignmentId=" + encodeURIComponent(program.id) : "") +
      "&athleteName=" + encodeURIComponent(athleteName) +
      "&day=" + encodeURIComponent(String(item.slot_key || ""))
    );
  }

  function getNextTrainingCalendarWorkout(trainingItems, fromDateKey) {
    var todayKey = String(fromDateKey || getTodayDateInputValue() || "");
    var list = (Array.isArray(trainingItems) ? trainingItems : []).slice().sort(function (a, b) {
      var aKey = String(a && a.scheduled_for || "");
      var bKey = String(b && b.scheduled_for || "");
      if (aKey !== bKey) {
        return aKey.localeCompare(bKey);
      }

      return String(a && a.slot_key || "").localeCompare(String(b && b.slot_key || ""));
    });

    for (var i = 0; i < list.length; i++) {
      if (String(list[i] && list[i].scheduled_for || "") >= todayKey) {
        return list[i];
      }
    }

    return null;
  }

  function buildTrainingTodayStripHtml(trainingItems, supplementalItems) {
    var todayKey = getTodayDateInputValue();
    var workoutsToday = (Array.isArray(trainingItems) ? trainingItems : []).filter(function (item) {
      return String(item && item.scheduled_for || "") === todayKey;
    });
    var milestonesToday = (Array.isArray(supplementalItems) ? supplementalItems : []).filter(function (item) {
      return String(item && item.scheduled_for || "") === todayKey;
    });

    var value = workoutsToday.length
      ? String(workoutsToday.length) + " workout" + (workoutsToday.length === 1 ? "" : "s") + " today"
      : "No workout scheduled today";
    var meta = milestonesToday.length
      ? milestonesToday.map(function (item) { return String(item && item.title || "Milestone"); }).join(" | ")
      : "Use Today to jump to the current day in your calendar.";

    var actionItem = workoutsToday.length ? workoutsToday[0] : getNextTrainingCalendarWorkout(trainingItems, todayKey);
    var actionHref = getTrainingSessionLaunchHref(actionItem);
    var actionDate = String(actionItem && actionItem.scheduled_for || "");
    var actionLabel = actionDate === todayKey ? "Open Today's Session" : "Open Next Session";
    var actionHtml = actionHref
      ? '<div class="training-today-strip-actions"><a class="btn profile-btn-edit-profile training-today-strip-action" href="' + escapeAttribute(actionHref) + '">' + escapeHtml(actionLabel) + '</a></div>'
      : "";

    return (
      '<article class="training-today-strip">' +
        '<p class="training-today-strip-label">Today</p>' +
        '<strong class="training-today-strip-value">' + escapeHtml(value) + '</strong>' +
        '<p class="training-today-strip-meta">' + escapeHtml(meta) + '</p>' +
        actionHtml +
      '</article>'
    );
  }

  function buildTrainingUpcomingEventsCardHtml(supplementalItems) {
    var todayKey = getTodayDateInputValue();
    var upcomingItems = (Array.isArray(supplementalItems) ? supplementalItems : []).filter(function (item) {
      if (String(item && item.kind || "") !== "milestone") {
        return false;
      }

      var dateKey = String(item && item.scheduled_for || "");
      if (!dateKey || dateKey < todayKey) {
        return false;
      }

      return String(item && item.milestone_type || "").toLowerCase() !== "birthday";
    }).sort(function (a, b) {
      return String(a && a.scheduled_for || "").localeCompare(String(b && b.scheduled_for || ""));
    }).slice(0, 4);

    var rowsHtml = upcomingItems.map(function (item) {
      var parsedDate = parseDateInputValue(item && item.scheduled_for);
      var displayDate = parsedDate
        ? parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : String(item && item.scheduled_for || "");
      var label = String(item && item.title || "Milestone");
      var kindLabel = String(item && item.milestone_type || "event").replace(/_/g, " ");

      return (
        '<li>' +
          '<span class="training-upcoming-item-date">' + escapeHtml(displayDate) + '</span>' +
          '<span class="training-upcoming-item-title">' + escapeHtml(label) + '</span>' +
          '<span class="training-upcoming-item-kind">' + escapeHtml(kindLabel) + '</span>' +
        '</li>'
      );
    }).join("");

    var emptyHtml =
      '<p class="training-upcoming-empty">No upcoming events or goals yet. Add one to anchor your next block.</p>';

    return (
      '<article class="training-upcoming-card">' +
        '<h3>Upcoming Events and Goals</h3>' +
        (upcomingItems.length
          ? '<ul class="training-upcoming-list">' + rowsHtml + '</ul>'
          : emptyHtml) +
        '<a class="btn profile-btn-cancel training-upcoming-manage" href="' + escapeAttribute(getGoalsPageHref()) + '">' +
          escapeHtml(state.isCoachView ? 'Manage Athlete Goals' : 'Manage Goals') +
        '</a>' +
      '</article>'
    );
  }

  function summarizeTrainingAdherenceWindow(items, startDateKey, endDateKey) {
    var slice = (Array.isArray(items) ? items : []).filter(function (item) {
      var dateKey = String(item && item.scheduled_for || "");
      return dateKey >= String(startDateKey || "") && dateKey <= String(endDateKey || "");
    });

    var completed = 0;
    var partial = 0;
    var missed = 0;

    slice.forEach(function (item) {
      var status = String(item && item.status || "scheduled").toLowerCase();
      if (status === "completed") {
        completed += 1;
      } else if (status.indexOf("partial") > -1) {
        partial += 1;
      } else if (status === "missed" || status === "skipped") {
        missed += 1;
      }
    });

    var denominator = Math.max(1, slice.length);
    var adherencePct = slice.length
      ? Math.round(((completed + (partial * 0.5)) / denominator) * 100)
      : 0;

    return {
      adherencePct: adherencePct,
      completed: completed,
      partial: partial,
      missed: missed,
      total: slice.length
    };
  }

  function calculateTrainingAdherenceStats(trainingItems) {
    var list = Array.isArray(trainingItems) ? trainingItems : [];
    var today = parseDateInputValue(getTodayDateInputValue()) || new Date();
    var start7 = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    var start30 = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
    var start7Key = formatDateInputValue(start7);
    var startDateKey = formatDateInputValue(start30);
    var todayKey = formatDateInputValue(today);

    var last7 = summarizeTrainingAdherenceWindow(list, start7Key, todayKey);
    var last30 = summarizeTrainingAdherenceWindow(list, startDateKey, todayKey);

    if (!last30.total) {
      return {
        adherencePct: 0,
        adherence7Pct: 0,
        adherence30Pct: 0,
        trendDelta: 0,
        trendLabel: "No baseline",
        completed: 0,
        partial: 0,
        missed: 0,
        total: 0,
        streak: 0,
        consistencyMessage: "No recent workouts logged yet."
      };
    }

    var adherencePct = last30.adherencePct;

    var streak = 0;
    for (var i = 0; i < 14; i++) {
      var key = formatDateInputValue(new Date(today.getFullYear(), today.getMonth(), today.getDate() - i));
      var dayRows = list.filter(function (item) {
        return String(item && item.scheduled_for || "") === key;
      });

      if (!dayRows.length) {
        continue;
      }

      var allMet = dayRows.every(function (item) {
        var status = String(item && item.status || "scheduled").toLowerCase();
        return status === "completed" || status.indexOf("partial") > -1;
      });

      if (!allMet) {
        break;
      }

      streak += 1;
    }

    var trendDelta = last7.adherencePct - last30.adherencePct;
    var trendLabel = trendDelta >= 8
      ? "Improving"
      : (trendDelta <= -8 ? "Slipping" : "Steady");

    var consistencyMessage = trendDelta >= 8
      ? "Momentum is building. Keep your key sessions protected this week."
      : (trendDelta <= -8
        ? "Recent adherence dipped. Scale volume but complete priority sessions."
        : (adherencePct >= 70
          ? "Consistency is stable. Keep stacking quality sessions."
          : "Consistency is mixed. Pick two non-negotiable sessions this week."));

    return {
      adherencePct: adherencePct,
      adherence7Pct: last7.adherencePct,
      adherence30Pct: last30.adherencePct,
      trendDelta: trendDelta,
      trendLabel: trendLabel,
      completed: last30.completed,
      partial: last30.partial,
      missed: last30.missed,
      total: last30.total,
      streak: streak,
      consistencyMessage: consistencyMessage
    };
  }

  function buildTrainingAdherencePanelHtml(adherence) {
    var stats = adherence && typeof adherence === "object" ? adherence : calculateTrainingAdherenceStats([]);
    var trendValue = (stats.trendDelta > 0 ? "+" : "") + String(stats.trendDelta || 0) + " pts";
    return (
      '<article class="training-adherence-panel">' +
        '<h3>Adherence Insights</h3>' +
        '<div class="training-adherence-grid">' +
          '<p><span>7-day adherence</span><strong>' + escapeHtml(String(stats.adherence7Pct || 0) + '%') + '</strong></p>' +
          '<p><span>30-day adherence</span><strong>' + escapeHtml(String(stats.adherence30Pct || 0) + '%') + '</strong></p>' +
          '<p><span>Trend</span><strong>' + escapeHtml(String(stats.trendLabel || 'Steady') + ' (' + trendValue + ')') + '</strong></p>' +
          '<p><span>Current streak</span><strong>' + escapeHtml(String(stats.streak || 0) + ' day' + ((stats.streak || 0) === 1 ? '' : 's')) + '</strong></p>' +
          '<p><span>Completed</span><strong>' + escapeHtml(String(stats.completed || 0)) + '</strong></p>' +
          '<p><span>Partial / Missed</span><strong>' + escapeHtml(String(stats.partial || 0) + ' / ' + String(stats.missed || 0)) + '</strong></p>' +
        '</div>' +
        '<p class="training-adherence-note">' + escapeHtml(String(stats.consistencyMessage || 'Stay consistent this week.')) + '</p>' +
      '</article>'
    );
  }

  function buildTrainingCalendarCardHtml(items) {
    var list = Array.isArray(items) ? items : [];
    if (!list.length) {
      return (
        '<article class="training-calendar-card">' +
          '<h3>Workout Calendar</h3>' +
          '<p>Your coach has not scheduled specific workout dates yet.</p>' +
        '</article>'
      );
    }

    return (
      '<article class="training-calendar-card" data-training-calendar-card>' +
        '<h3>Workout Calendar</h3>' +
        '<p>Workouts, goals, events, and birthdays stay visible on the month view.</p>' +
        '<div class="training-calendar-nav" data-calendar-nav hidden>' +
          '<button type="button" class="training-calendar-nav-btn" data-calendar-prev aria-label="Previous month">Back</button>' +
          '<strong class="training-calendar-nav-label" data-calendar-current-month>Month</strong>' +
          '<button type="button" class="training-calendar-nav-btn" data-calendar-today aria-label="Jump to current month">Today</button>' +
          '<button type="button" class="training-calendar-nav-btn" data-calendar-next aria-label="Next month">Next</button>' +
        '</div>' +
        buildTrainingCalendarMonthsHtml(list) +
      '</article>'
    );
  }

  function buildTrainingCalendarMonthsHtml(items) {
    var list = Array.isArray(items) ? items : [];
    if (!list.length) {
      return "";
    }

    var months = {};
    var monthKeys = [];

    list.forEach(function (item) {
      var scheduled = parseDateInputValue(item && item.scheduled_for);
      if (!scheduled) {
        return;
      }

      var monthKey = scheduled.getFullYear() + "-" + String(scheduled.getMonth() + 1).padStart(2, "0");
      if (!months[monthKey]) {
        months[monthKey] = {};
        monthKeys.push(monthKey);
      }

      var dateKey = formatDateInputValue(scheduled);
      if (!months[monthKey][dateKey]) {
        months[monthKey][dateKey] = [];
      }

      months[monthKey][dateKey].push(item);
    });

    monthKeys.sort();

    var todayMonthKey = getTodayDateInputValue().slice(0, 7);
    monthKeys = buildCalendarMonthKeyRange(monthKeys, todayMonthKey, 6, 12);

    return '<div class="training-calendar-months">' + monthKeys.map(function (monthKey) {
      return buildTrainingCalendarMonthHtml(monthKey, months[monthKey]);
    }).join("") + '</div>';
  }

  function buildCalendarMonthKeyRange(existingMonthKeys, anchorMonthKey, backPadding, forwardPadding, maxMonths) {
    var anchor = parseMonthKey(anchorMonthKey) || new Date();
    var back = Math.max(0, parseInt(backPadding, 10) || 0);
    var forward = Math.max(0, parseInt(forwardPadding, 10) || 0);

    var start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    var end = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    start.setMonth(start.getMonth() - back);
    end.setMonth(end.getMonth() + forward);

    var defaultWindow = back + forward + 1;
    var allowedMonths = Math.max(1, parseInt(maxMonths, 10) || defaultWindow);
    var result = [];
    var cursor = new Date(start.getFullYear(), start.getMonth(), 1);

    while (cursor <= end && result.length < allowedMonths) {
      result.push(formatMonthKey(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }

    if (!result.length) {
      result.push(formatMonthKey(anchor));
    }

    return result;
  }

  function parseMonthKey(monthKey) {
    var parts = String(monthKey || "").split("-");
    if (parts.length !== 2) {
      return null;
    }

    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return null;
    }

    var value = new Date(year, month - 1, 1);
    return isNaN(value.getTime()) ? null : value;
  }

  function formatMonthKey(dateValue) {
    if (!(dateValue instanceof Date) || isNaN(dateValue.getTime())) {
      return "";
    }

    return dateValue.getFullYear() + "-" + String(dateValue.getMonth() + 1).padStart(2, "0");
  }

  function buildTrainingCalendarMonthHtml(monthKey, itemsByDate) {
    var parts = String(monthKey || "").split("-");
    var year = parseInt(parts[0], 10);
    var monthIndex = parseInt(parts[1], 10) - 1;
    var monthDate = new Date(year, monthIndex, 1);
    if (isNaN(monthDate.getTime())) {
      return "";
    }

    var weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var firstWeekday = monthDate.getDay();
    var daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    var todayKey = getTodayDateInputValue();
    var gridCells = [];

    for (var blankIdx = 0; blankIdx < firstWeekday; blankIdx++) {
      gridCells.push('<div class="training-calendar-day training-calendar-day-empty" aria-hidden="true"></div>');
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var dateValue = new Date(year, monthIndex, day);
      var dateKey = formatDateInputValue(dateValue);
      var entries = itemsByDate && itemsByDate[dateKey] ? itemsByDate[dateKey] : [];
      entries = entries.slice().sort(function (a, b) {
        return getTrainingCalendarItemSortOrder(a) - getTrainingCalendarItemSortOrder(b);
      });

      var sessionsHtml = entries.map(function (item) {
        if (String(item && item.kind || "") !== "training") {
          return buildTrainingCalendarSupplementalItemHtml(item);
        }

        var program = item && item.program ? item.program : {};
        var programName =
          (program.training_program && program.training_program.name) ||
          program.program_name ||
          (program.program_id ? "Program " + String(program.program_id).slice(0, 8) : "Assigned Program");
        var url = getTrainingSessionLaunchHref(item);
        var sessionStatus = getTrainingCalendarStatusClass(item, dateKey, todayKey);

        return (
          '<a class="training-calendar-session ' + sessionStatus + '" href="' + url + '"' +
            ' draggable="' + (state.isCoachView || String(item.status || "").toLowerCase() === "completed" ? "false" : "true") + '"' +
            ' data-calendar-session-id="' + escapeAttribute(item.schedule_id || "") + '"' +
            ' data-calendar-session-date="' + escapeAttribute(dateKey) + '"' +
            ' data-calendar-session-status="' + escapeAttribute(String(item.status || "scheduled")) + '"' +
            ' data-calendar-session-label="' + escapeAttribute(String(item.session_label || "Workout")) + '">' +
            '<span class="training-calendar-session-title">' + escapeHtml(String(item.session_label || "Workout")) + '</span>' +
            '<span class="training-calendar-session-program">' + escapeHtml(programName) + '</span>' +
          '</a>'
        );
      }).join("");

      gridCells.push(
        '<div class="training-calendar-day' + (entries.length ? ' has-session' : '') + (dateKey === todayKey ? ' is-today' : '') + '" data-calendar-date="' + escapeAttribute(dateKey) + '">' +
          '<div class="training-calendar-day-number">' + day + '</div>' +
          '<div class="training-calendar-day-sessions">' + sessionsHtml + '</div>' +
        '</div>'
      );
    }

    return (
      '<section class="training-calendar-month" data-calendar-month data-calendar-month-key="' + escapeAttribute(monthKey) + '">' +
        '<div class="training-calendar-month-header">' + escapeHtml(monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })) + '</div>' +
        '<div class="training-calendar-weekdays">' + weekdayLabels.map(function (label) {
          return '<span>' + label + '</span>';
        }).join("") + '</div>' +
        '<div class="training-calendar-grid">' + gridCells.join("") + '</div>' +
      '</section>'
    );
  }

  function getTrainingCalendarStatusClass(item, dateKey, todayKey) {
    var status = String(item && item.status || "scheduled");
    var normalizedStatus = status.trim().toLowerCase();

    if (normalizedStatus.indexOf("partial") > -1) {
      return "is-partial";
    }

    if (status === "completed") {
      return "is-completed";
    }

    if (normalizedStatus === "missed" || normalizedStatus === "skipped") {
      return "is-missed";
    }

    if (dateKey === todayKey) {
      return "is-today";
    }

    if (dateKey < todayKey) {
      return "is-missed";
    }

    return "is-future";
  }

  function getTrainingCalendarItemSortOrder(item) {
    var kind = String(item && item.kind || "training");
    if (kind === "training") {
      return 1;
    }
    if (kind === "milestone") {
      return 2;
    }
    if (kind === "birthday") {
      return 3;
    }
    return 9;
  }

  function buildTrainingCalendarSupplementalItemHtml(item) {
    var kind = String(item && item.kind || "milestone");
    var typeClass = kind === "birthday"
      ? "is-birthday"
      : (String(item && item.milestone_type || "goal") === "event" ? "is-event" : "is-goal");
    var title = String(item && item.title || (kind === "birthday" ? "Birthday" : "Milestone"));
    var subtitle = String(item && item.subtitle || "");

    return (
      '<div class="training-calendar-supplement ' + typeClass + '">' +
        '<span class="training-calendar-session-title">' + escapeHtml(title) + '</span>' +
        (subtitle ? '<span class="training-calendar-session-program">' + escapeHtml(subtitle) + '</span>' : '') +
      '</div>'
    );
  }

  function refreshTrainingProgramsCalendarFromState() {
    var content = document.getElementById("profile-training-program-content");
    if (!content || !state.client || !getViewedUserId()) {
      return;
    }

    if (!state.trainingProgramsLoaded || !Array.isArray(state.trainingProgramsCache)) {
      return;
    }

    renderTrainingPrograms(
      content,
      state.trainingProgramsCache,
      state.trainingScheduleByAssignment && typeof state.trainingScheduleByAssignment === "object"
        ? state.trainingScheduleByAssignment
        : {}
    );
  }

  function getCalendarDragPayloadFromEvent(event) {
    if (!event || !event.dataTransfer || typeof event.dataTransfer.getData !== "function") {
      return null;
    }

    var raw = "";
    try {
      raw = String(event.dataTransfer.getData("text/plain") || "").trim();
    } catch (e) {
      return null;
    }

    if (!raw) {
      return null;
    }

    try {
      var payload = JSON.parse(raw);
      return payload && typeof payload === "object" ? payload : null;
    } catch (e) {
      return null;
    }
  }

  function onRescheduleCalendarSession(scheduleId, targetDate, sourceDate, currentStatus, sessionLabel) {
    var viewedUserId = getViewedUserId();
    if (!state.client || !viewedUserId || !scheduleId || !targetDate) {
      setTrainingProgramStatus("Unable to reschedule this workout right now.", "error");
      return;
    }

    if (String(sourceDate || "") === String(targetDate || "")) {
      setTrainingProgramStatus("Workout is already on that day.", "info");
      return;
    }

    if (!parseDateInputValue(targetDate)) {
      setTrainingProgramStatus("Select a valid target day in the calendar.", "error");
      return;
    }

    var statusValue = String(currentStatus || "scheduled").toLowerCase();
    if (statusValue === "completed") {
      setTrainingProgramStatus("Completed workouts cannot be moved.", "info");
      return;
    }

    var updatePayload = {
      scheduled_for: targetDate,
      status: "scheduled"
    };

    setTrainingProgramStatus("Rescheduling " + String(sessionLabel || "workout") + "...", "info");

    state.client
      .from("athlete_program_schedule")
      .update(updatePayload)
      .eq("id", scheduleId)
      .eq("athlete_user_id", viewedUserId)
      .then(function (result) {
        if (result.error) {
          setTrainingProgramStatus(result.error.message || "Could not move workout.", "error");
          return;
        }

        var moveRecord = {
          scheduleId: String(scheduleId || ""),
          fromDate: String(sourceDate || ""),
          toDate: String(targetDate || ""),
          previousStatus: statusValue,
          label: String(sessionLabel || "Workout")
        };
        state.lastCalendarMove = moveRecord;

        moveCalendarSessionInDom(String(scheduleId || ""), String(sourceDate || ""), String(targetDate || ""));
        setTrainingProgramStatus(
          "Workout moved to " + formatDate(targetDate) + ".",
          "success",
          {
            actionLabel: "Undo",
            onAction: function () {
              onUndoCalendarReschedule(moveRecord);
            }
          }
        );
      })
      .catch(function (error) {
        setTrainingProgramStatus(error && error.message ? error.message : "Could not move workout.", "error");
      });
  }

  function onUndoCalendarReschedule(moveRecord) {
    var viewedUserId = getViewedUserId();
    var move = moveRecord && typeof moveRecord === "object" ? moveRecord : state.lastCalendarMove;
    if (!state.client || !viewedUserId || !move || !move.scheduleId || !move.fromDate) {
      setTrainingProgramStatus("Unable to undo this move right now.", "error");
      return;
    }

    setTrainingProgramStatus("Undoing move for " + String(move.label || "workout") + "...", "info");

    state.client
      .from("athlete_program_schedule")
      .update({
        scheduled_for: String(move.fromDate || ""),
        status: String(move.previousStatus || "scheduled")
      })
      .eq("id", String(move.scheduleId || ""))
      .eq("athlete_user_id", viewedUserId)
      .then(function (result) {
        if (result.error) {
          setTrainingProgramStatus(result.error.message || "Could not undo workout move.", "error");
          return;
        }

        state.lastCalendarMove = null;
        moveCalendarSessionInDom(String(move.scheduleId || ""), String(move.toDate || ""), String(move.fromDate || ""));
        setTrainingProgramStatus("Move undone. Workout returned to " + formatDate(String(move.fromDate || "")) + ".", "success");
      })
      .catch(function (error) {
        setTrainingProgramStatus(error && error.message ? error.message : "Could not undo workout move.", "error");
      });
  }

  function moveCalendarSessionInDom(scheduleId, sourceDate, targetDate) {
    var sessionEl = document.querySelector('[data-calendar-session-id="' + String(scheduleId || "") + '"]');
    var fromDayEl = sourceDate
      ? document.querySelector('[data-calendar-date="' + String(sourceDate || "") + '"]')
      : null;
    var toDayEl = targetDate
      ? document.querySelector('[data-calendar-date="' + String(targetDate || "") + '"]')
      : null;

    if (!sessionEl || !toDayEl) {
      return;
    }

    var targetSessionsWrap = toDayEl.querySelector(".training-calendar-day-sessions");
    if (!targetSessionsWrap) {
      return;
    }

    sessionEl.setAttribute("data-calendar-session-date", String(targetDate || ""));
    targetSessionsWrap.appendChild(sessionEl);
    toDayEl.classList.add("has-session");

    if (fromDayEl) {
      var fromSessionsWrap = fromDayEl.querySelector(".training-calendar-day-sessions");
      if (fromSessionsWrap && !fromSessionsWrap.querySelector(".training-calendar-session")) {
        fromDayEl.classList.remove("has-session");
      }
    }
  }

  function parseDateInputValue(dateString) {
    var parts = String(dateString || "").split("-");
    if (parts.length !== 3) {
      return null;
    }

    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return null;
    }

    var value = new Date(year, month - 1, day);
    return isNaN(value.getTime()) ? null : value;
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

  function initializeTrainingCalendarNavigators(scopeElement) {
    var root = scopeElement || document;
    root.querySelectorAll("[data-training-calendar-card]").forEach(function (card) {
      var months = Array.prototype.slice.call(card.querySelectorAll("[data-calendar-month]"));
      var nav = card.querySelector("[data-calendar-nav]");
      if (!months.length) {
        if (nav) {
          nav.hidden = true;
        }
        return;
      }

      if (!nav) {
        return;
      }

      if (!card.getAttribute("data-calendar-nav-bound")) {
        var prevBtn = card.querySelector("[data-calendar-prev]");
        var nextBtn = card.querySelector("[data-calendar-next]");
        var todayBtn = card.querySelector("[data-calendar-today]");

        if (prevBtn) {
          prevBtn.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            stepTrainingCalendarMonth(prevBtn, -1);
          });
        }

        if (nextBtn) {
          nextBtn.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            stepTrainingCalendarMonth(nextBtn, 1);
          });
        }

        if (todayBtn) {
          todayBtn.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            jumpTrainingCalendarToToday(todayBtn);
          });
        }

        card.setAttribute("data-calendar-nav-bound", "true");
      }

      var initialIndex = 0;
      if (Number.isInteger(state.trainingCalendarMonthIndex)) {
        initialIndex = Number(state.trainingCalendarMonthIndex);
      } else {
        var todayMonthKey = getTodayDateInputValue().slice(0, 7);
        var foundIndex = months.findIndex(function (monthEl) {
          return String(monthEl.getAttribute("data-calendar-month-key") || "") === todayMonthKey;
        });
        if (foundIndex > -1) {
          initialIndex = foundIndex;
        }
      }

      nav.hidden = months.length <= 1;
      setTrainingCalendarMonthByIndex(card, initialIndex);
    });
  }

  function stepTrainingCalendarMonth(buttonEl, delta) {
    var card = buttonEl && buttonEl.closest("[data-training-calendar-card]");
    if (!card) {
      return;
    }

    var current = parseInt(card.getAttribute("data-calendar-month-index") || "0", 10);
    var safeCurrent = isNaN(current) ? 0 : current;
    setTrainingCalendarMonthByIndex(card, safeCurrent + (parseInt(delta, 10) || 0));
  }

  function setTrainingCalendarMonthByIndex(card, requestedIndex) {
    if (!card) {
      return;
    }

    var months = Array.prototype.slice.call(card.querySelectorAll("[data-calendar-month]"));
    if (!months.length) {
      return;
    }

    var maxIndex = months.length - 1;
    var index = Math.max(0, Math.min(maxIndex, parseInt(requestedIndex, 10) || 0));
    card.setAttribute("data-calendar-month-index", String(index));
    state.trainingCalendarMonthIndex = index;

    months.forEach(function (monthEl, monthIndex) {
      monthEl.hidden = monthIndex !== index;
    });

    var labelEl = card.querySelector("[data-calendar-current-month]");
    var prevBtn = card.querySelector("[data-calendar-prev]");
    var nextBtn = card.querySelector("[data-calendar-next]");
    var activeMonth = months[index];
    var headerEl = activeMonth ? activeMonth.querySelector(".training-calendar-month-header") : null;

    if (labelEl) {
      labelEl.textContent = headerEl ? String(headerEl.textContent || "Month") : "Month";
    }
    if (prevBtn) {
      prevBtn.disabled = index <= 0;
    }
    if (nextBtn) {
      nextBtn.disabled = index >= maxIndex;
    }
  }

  function jumpTrainingCalendarToToday(buttonEl) {
    var card = buttonEl && buttonEl.closest("[data-training-calendar-card]");
    if (!card) {
      return;
    }

    var todayKey = getTodayDateInputValue();
    var todayMonthKey = todayKey.slice(0, 7);
    var months = Array.prototype.slice.call(card.querySelectorAll("[data-calendar-month]"));
    var targetIndex = months.findIndex(function (monthEl) {
      return String(monthEl.getAttribute("data-calendar-month-key") || "") === todayMonthKey;
    });

    if (targetIndex < 0) {
      targetIndex = 0;
    }

    setTrainingCalendarMonthByIndex(card, targetIndex);

    var todayDayEl = card.querySelector('[data-calendar-date="' + todayKey + '"]');
    if (todayDayEl) {
      todayDayEl.classList.remove("is-jump-target");
      todayDayEl.offsetWidth;
      todayDayEl.classList.add("is-jump-target");
      try {
        todayDayEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      } catch (error) {
        todayDayEl.scrollIntoView();
      }
    }
  }

  function getDateOffsetInputValue(offsetDays) {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + (parseInt(offsetDays, 10) || 0));
    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function onCustomizeProgramForAthlete() {
    var viewedUserId = getViewedUserId();
    if (!state.isCoachView || !viewedUserId || !state.client) {
      setTrainingProgramStatus("Unable to edit athlete program right now.", "error");
      return;
    }

    setTrainingProgramStatus("Preparing athlete-specific editable program...", "info");

    state.client
      .from("user_training_programs")
      .select("*")
      .eq("user_id", viewedUserId)
      .eq("is_active", true)
      .order("assigned_at", { ascending: false })
      .limit(1)
      .then(function (assignmentResult) {
        if (assignmentResult.error) {
          setTrainingProgramStatus(assignmentResult.error.message, "error");
          return;
        }

        var activeAssignment = assignmentResult.data && assignmentResult.data[0];
        if (!activeAssignment || !activeAssignment.program_id) {
          setTrainingProgramStatus("Assign a template first, then you can customize it for this athlete.", "info");
          return;
        }

        state.client
          .from("training_programs")
          .select("id,name,description")
          .eq("id", activeAssignment.program_id)
          .single()
          .then(function (programResult) {
            if (programResult.error || !programResult.data) {
              setTrainingProgramStatus(
                programResult.error ? programResult.error.message : "Program could not be loaded.",
                "error"
              );
              return;
            }

            var sourceProgram = programResult.data;
            var sourcePayload = parseTemplatePayload(sourceProgram.description);
            if (!sourcePayload) {
              setTrainingProgramStatus("This program cannot be customized because its template data is invalid.", "error");
              return;
            }

            var athleteLabel =
              (state.profile && state.profile.name) ||
              (state.viewUser && state.viewUser.email) ||
              "Athlete";

            var customPayload = {
              archived: true,
              structure: normalizeTemplateStructure(sourcePayload.structure),
              days: sourcePayload.days || {}
            };

            var customProgramName =
              (sourceProgram.name || activeAssignment.program_name || "Training Program") +
              " - " +
              athleteLabel +
              " (Custom)";

            state.client
              .from("training_programs")
              .insert({
                name: customProgramName,
                description: serializeTemplatePayload(customPayload)
              })
              .select("id,name")
              .single()
              .then(function (insertProgramResult) {
                if (insertProgramResult.error || !insertProgramResult.data) {
                  setTrainingProgramStatus(
                    insertProgramResult.error ? insertProgramResult.error.message : "Failed to create custom program.",
                    "error"
                  );
                  return;
                }

                var customProgram = insertProgramResult.data;
                var now = new Date().toISOString();

                state.client
                  .from("user_training_programs")
                  .insert({
                    user_id: viewedUserId,
                    program_id: customProgram.id,
                    program_name: customProgram.name,
                    is_active: true,
                    assigned_at: now,
                    assigned_by: state.user ? state.user.id : null
                  })
                  .then(function (assignResult) {
                    if (assignResult.error) {
                      setTrainingProgramStatus(assignResult.error.message, "error");
                      return;
                    }

                    setTrainingProgramStatus("Opened athlete-specific program editor.", "success");
                    var athleteNameParam =
                      (state.profile && state.profile.name) ||
                      (state.viewUser && state.viewUser.email) ||
                      "Athlete";
                    window.location.href =
                      "training-program-example.html?builder=1&templateId=" +
                      encodeURIComponent(customProgram.id) +
                      "&athleteId=" +
                      encodeURIComponent(viewedUserId) +
                      "&athleteName=" +
                      encodeURIComponent(athleteNameParam);
                  })
                  .catch(function (error) {
                    setTrainingProgramStatus(
                      error && error.message ? error.message : "Failed to assign custom program.",
                      "error"
                    );
                  });
              })
              .catch(function (error) {
                setTrainingProgramStatus(
                  error && error.message ? error.message : "Failed to create custom program.",
                  "error"
                );
              });
          })
          .catch(function (error) {
            setTrainingProgramStatus(
              error && error.message ? error.message : "Failed to load source program.",
              "error"
            );
          });
      })
      .catch(function (error) {
        setTrainingProgramStatus(
          error && error.message ? error.message : "Failed to prepare athlete program editor.",
          "error"
        );
      });
  }

  function openCoachProgramModal() {
    if (!state.isCoachView) {
      return;
    }

    if (!state.client || !getViewedUserId()) {
      setTrainingProgramStatus("Unable to manage athlete program right now.", "error");
      return;
    }

    var modal = document.querySelector("[data-coach-program-modal]");
    if (!modal) {
      return;
    }

    var athleteLabel = document.querySelector("[data-coach-program-athlete-label]");
    if (athleteLabel) {
      athleteLabel.textContent =
        "Athlete: " +
        ((state.profile && state.profile.name) || (state.viewUser && state.viewUser.email) || "Selected athlete");
    }

    var searchInput = document.querySelector("[data-coach-program-search]");
    if (searchInput) {
      searchInput.value = "";
    }

    state.selectedTrainingTemplateId = "";
    setCoachProgramStatus("", "info");
    modal.hidden = false;
    document.body.classList.add("admin-modal-open");
    loadCoachProgramTemplates();
  }

  function closeCoachProgramModal() {
    var modal = document.querySelector("[data-coach-program-modal]");
    if (!modal || modal.hidden) {
      return;
    }

    modal.hidden = true;
    document.body.classList.remove("admin-modal-open");
    state.selectedTrainingTemplateId = "";
    setCoachProgramStatus("", "info");
  }

  function loadCoachProgramTemplates() {
    if (!state.client) {
      return;
    }

    var list = document.querySelector("[data-coach-program-list]");
    if (list) {
      list.innerHTML = '<p class="admin-loading">Loading templates...</p>';
    }

    state.client
      .from("training_programs")
      .select("id,name,description,updated_at,created_at")
      .order("updated_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          setCoachProgramStatus(result.error.message, "error");
          return;
        }

        state.trainingTemplates = (result.data || [])
          .map(function (row) {
            var payload = parseTemplatePayload(String(row.description || ""));
            if (!payload || payload.archived) {
              return null;
            }
            return {
              id: row.id,
              name: row.name || "Untitled Template",
              updated_at: row.updated_at || row.created_at || ""
            };
          })
          .filter(function (item) {
            return !!item;
          });

        renderCoachProgramTemplateList("");
      })
      .catch(function (error) {
        setCoachProgramStatus(
          error && error.message ? error.message : "Failed to load templates.",
          "error"
        );
      });
  }

  function renderCoachProgramTemplateList(searchTerm) {
    var list = document.querySelector("[data-coach-program-list]");
    if (!list) {
      return;
    }

    var query = String(searchTerm || "").trim().toLowerCase();
    var filtered = (state.trainingTemplates || []).filter(function (template) {
      if (!query) {
        return true;
      }

      return String(template.name || "").toLowerCase().indexOf(query) > -1;
    });

    if (!filtered.length) {
      list.innerHTML = '<p class="admin-loading">No templates match this search.</p>';
      return;
    }

    list.innerHTML = filtered
      .map(function (template) {
        var checked = state.selectedTrainingTemplateId === template.id ? " checked" : "";
        return (
          '<label class="admin-assign-item">' +
          '<input type="radio" name="coach-program-template" data-coach-program-template value="' +
          escapeAttribute(template.id) +
          '"' +
          checked +
          ' />' +
          '<span class="admin-assign-item-main">' +
          '<strong>' +
          escapeHtml(template.name) +
          "</strong>" +
          '<small>Updated ' +
          escapeHtml(formatDate(template.updated_at)) +
          "</small>" +
          "</span>" +
          "</label>"
        );
      })
      .join("");

    list.querySelectorAll("[data-coach-program-template]").forEach(function (radio) {
      radio.addEventListener("change", function () {
        state.selectedTrainingTemplateId = String(radio.value || "");
      });
    });
  }

  function onAssignTemplateToCurrentAthlete() {
    var viewedUserId = getViewedUserId();
    if (!state.isCoachView || !viewedUserId || !state.client) {
      setCoachProgramStatus("Unable to assign template right now.", "error");
      return;
    }

    if (!state.selectedTrainingTemplateId) {
      setCoachProgramStatus("Select a template to assign.", "error");
      return;
    }

    var template = state.trainingTemplates.find(function (item) {
      return item.id === state.selectedTrainingTemplateId;
    });

    if (!template) {
      setCoachProgramStatus("Template not found.", "error");
      return;
    }

    var now = new Date().toISOString();
    setCoachProgramStatus("Assigning template to athlete...", "info");

    state.client
      .from("user_training_programs")
      .insert({
        user_id: viewedUserId,
        program_id: template.id,
        program_name: template.name,
        is_active: true,
        assigned_at: now,
        assigned_by: state.user ? state.user.id : null
      })
      .then(function (insertResult) {
        if (insertResult.error) {
          setCoachProgramStatus(insertResult.error.message, "error");
          return;
        }

        setCoachProgramStatus("Template assigned to this athlete.", "success");
        setTrainingProgramStatus("Program added to this athlete.", "success");
        setTimeout(function () {
          closeCoachProgramModal();
          loadCurrentTrainingProgram();
        }, 500);
      })
      .catch(function (error) {
        setCoachProgramStatus(error && error.message ? error.message : "Failed to assign template.", "error");
      });
  }

  function parseTemplatePayload(description) {
    var marker = "__NOMADIC_TEMPLATE__";
    var value = String(description || "");
    if (value.indexOf(marker) !== 0) {
      return null;
    }

    try {
      return JSON.parse(value.slice(marker.length));
    } catch (e) {
      return null;
    }
  }

  function serializeTemplatePayload(payload) {
    var marker = "__NOMADIC_TEMPLATE__";
    var safePayload = {
      archived: !!(payload && payload.archived),
      structure: normalizeTemplateStructure(payload && payload.structure),
      days: payload && payload.days ? payload.days : {}
    };
    return marker + JSON.stringify(safePayload);
  }

  function normalizeTemplateStructure(structure) {
    var weeks = parseInt((structure && structure.weeks) || 1, 10);
    var workoutsPerWeek = parseInt((structure && structure.workoutsPerWeek) || 3, 10);
    return {
      weeks: Math.max(1, Math.min(24, isNaN(weeks) ? 1 : weeks)),
      workoutsPerWeek: Math.max(1, Math.min(14, isNaN(workoutsPerWeek) ? 3 : workoutsPerWeek))
    };
  }

  function setCoachProgramStatus(message, variant) {
    var statusEl = document.querySelector("[data-coach-program-status]");
    if (!statusEl) {
      return;
    }

    statusEl.textContent = message || "";
    statusEl.classList.remove("is-error", "is-success", "is-info");

    if (!message) {
      return;
    }

    if (variant === "error") {
      statusEl.classList.add("is-error");
    } else if (variant === "success") {
      statusEl.classList.add("is-success");
    } else {
      statusEl.classList.add("is-info");
    }
  }

  function onCompleteProgram(programId) {
    var viewedUserId = getViewedUserId();
    if (!viewedUserId || !state.client || !programId) {
      setTrainingProgramStatus("Unable to update this program right now.", "error");
      return;
    }

    if (!confirm("Move this training program into the past training programs section?")) {
      return;
    }

    setTrainingProgramStatus("Marking program complete...", "info");

    state.client
      .from("user_training_programs")
      .update({ is_active: false })
      .eq("id", programId)
      .eq("user_id", viewedUserId)
      .then(function (result) {
        if (result.error) {
          setTrainingProgramStatus(result.error.message, "error");
          return;
        }

        setTrainingProgramStatus("Training program moved to past programs.", "success");
        setTimeout(function () {
          loadCurrentTrainingProgram();
        }, 350);
      })
      .catch(function (error) {
        setTrainingProgramStatus(
          error && error.message ? error.message : "Failed to complete program.",
          "error"
        );
      });
  }

  function onMakeProgramCurrent(programId) {
    var viewedUserId = getViewedUserId();
    if (!viewedUserId || !state.client || !programId) {
      setTrainingProgramStatus("Unable to update this program right now.", "error");
      return;
    }

    setTrainingProgramStatus("Moving program to current...", "info");

    state.client
      .from("user_training_programs")
      .update({ is_active: true })
      .eq("id", programId)
      .eq("user_id", viewedUserId)
      .eq("is_active", false)
      .then(function (result) {
        if (result.error) {
          setTrainingProgramStatus(result.error.message, "error");
          return;
        }

        setTrainingProgramStatus("Program moved to current training programs.", "success");
        setTimeout(function () {
          loadCurrentTrainingProgram();
        }, 350);
      })
      .catch(function (error) {
        setTrainingProgramStatus(
          error && error.message ? error.message : "Failed to make program current.",
          "error"
        );
      });
  }

  function onDeletePastProgram(programId) {
    var viewedUserId = getViewedUserId();
    if (!viewedUserId || !state.client || !programId) {
      setTrainingProgramStatus("Unable to delete this program right now.", "error");
      return;
    }

    if (!confirm("Delete this past training program? This cannot be undone.")) {
      return;
    }

    setTrainingProgramStatus("Deleting past program...", "info");

    state.client
      .from("user_training_programs")
      .delete()
      .eq("id", programId)
      .eq("user_id", viewedUserId)
      .eq("is_active", false)
      .then(function (result) {
        if (result.error) {
          setTrainingProgramStatus(result.error.message, "error");
          return;
        }

        setTrainingProgramStatus("Past training program deleted.", "success");
        setTimeout(function () {
          loadCurrentTrainingProgram();
        }, 350);
      })
      .catch(function (error) {
        setTrainingProgramStatus(
          error && error.message ? error.message : "Failed to delete past program.",
          "error"
        );
      });
  }

  function setTrainingProgramStatus(message, variant, options) {
    var statusEl = document.querySelector("[data-training-program-status]");
    if (!statusEl) {
      return;
    }

    statusEl.textContent = message || "";
    statusEl.classList.remove("is-error", "is-success", "is-info");

    if (!message) {
      return;
    }

    if (variant === "error") {
      statusEl.classList.add("is-error");
    } else if (variant === "success") {
      statusEl.classList.add("is-success");
    } else {
      statusEl.classList.add("is-info");
    }

    if (options && options.actionLabel && typeof options.onAction === "function") {
      var actionBtn = document.createElement("button");
      actionBtn.type = "button";
      actionBtn.className = "training-program-status-action";
      actionBtn.textContent = String(options.actionLabel || "Action");
      actionBtn.addEventListener("click", function () {
        options.onAction();
      });
      statusEl.appendChild(document.createTextNode(" "));
      statusEl.appendChild(actionBtn);
    }
  }

  function onDeleteAccount() {
    if (state.isCoachView) {
      setStatus("Delete athletes from the Coaching Dashboard.", "info");
      return;
    }

    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      return;
    }

    if (!confirm("This will permanently delete your account and all data. Continue?")) {
      return;
    }

    if (!state.client || !state.user) {
      setStatus("Not authenticated.", "error");
      return;
    }

    setStatus("Deleting account...", "info");

    state.client
      .rpc("athlete_delete_own_account")
      .then(function (result) {
        if (result.error) {
          var message = result.error.message || "Failed to delete account.";
          if (result.error.code === "42883" || /athlete_delete_own_account\(\)/i.test(message)) {
            message = "Delete account is not configured yet. Run sql/create-athlete-self-delete-account-rpc.sql in Supabase.";
          }
          setStatus(message, "error");
          return;
        }

        setStatus("Account deleted. Redirecting...", "success");

        state.client.auth
          .signOut()
          .finally(function () {
            setTimeout(function () {
              redirectToHome();
            }, 700);
          });
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to delete account.", "error");
      });
  }

  function onResetMyPassword() {
    if (state.isCoachView) {
      setPasswordStatus("Password reset is disabled in coach view.", "info");
      return;
    }

    if (!state.client || !state.user || !state.user.email) {
      setPasswordStatus("Not authenticated.", "error");
      return;
    }

    var cooldownMs = getResetCooldownRemainingMs();
    if (cooldownMs > 0) {
      var seconds = Math.ceil(cooldownMs / 1000);
      setPasswordStatus(
        "Please wait " + seconds + " seconds before requesting another reset email.",
        "info"
      );
      return;
    }

    setPasswordStatus("Sending password reset email...", "info");

    state.client.auth
      .resetPasswordForEmail(state.user.email, {
        redirectTo: getPasswordResetRedirectUrl()
      })
      .then(function (result) {
        if (result.error) {
          if (isRateLimitError(result.error)) {
            markResetCooldown();
            setPasswordStatus(
              "Email rate limit reached. Please wait about a minute, then try again.",
              "error"
            );
            return;
          }

          setPasswordStatus(result.error.message, "error");
          return;
        }

        markResetCooldown();

        setPasswordStatus(
          "Password reset email sent. Check your inbox.",
          "success"
        );
      })
      .catch(function (error) {
        setPasswordStatus(
          error && error.message
            ? error.message
            : "Failed to send password reset email.",
          "error"
        );
      });
  }

  function onLogout() {
    if (!state.client) {
      setPasswordStatus("Not authenticated.", "error");
      return;
    }

    setPasswordStatus("Logging out...", "info");

    state.client.auth
      .signOut()
      .then(function (result) {
        if (result.error) {
          setPasswordStatus(result.error.message, "error");
          return;
        }

        window.location.href = "index.html";
      })
      .catch(function (error) {
        setPasswordStatus(
          error && error.message ? error.message : "Failed to log out.",
          "error"
        );
      });
  }

  function getResetCooldownRemainingMs() {
    try {
      var key = getResetCooldownKey();
      var expiresAt = parseInt(window.localStorage.getItem(key) || "0", 10);
      if (!expiresAt) {
        return 0;
      }

      var remaining = expiresAt - Date.now();
      return remaining > 0 ? remaining : 0;
    } catch (e) {
      return 0;
    }
  }

  function markResetCooldown() {
    try {
      var key = getResetCooldownKey();
      // 60-second client cooldown helps avoid repeated Supabase throttle hits.
      var expiresAt = Date.now() + 60 * 1000;
      window.localStorage.setItem(key, String(expiresAt));
    } catch (e) {
      // Ignore storage errors.
    }
  }

  function getResetCooldownKey() {
    var email = state.user && state.user.email ? state.user.email.toLowerCase() : "unknown";
    return "nomadic_reset_password_cooldown_" + email;
  }

  function getPasswordResetRedirectUrl() {
    return window.location.origin + "/update-password.html";
  }

  function getViewedUserId() {
    return state.viewUser && state.viewUser.id ? state.viewUser.id : null;
  }

  function isRateLimitError(error) {
    var message = error && error.message ? error.message.toLowerCase() : "";
    return message.indexOf("rate limit") > -1 || message.indexOf("too many") > -1;
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
        escapeHtml(message) +
        "</p>" +
        "<p><a href=\"index.html\" class=\"btn\" style=\"display: inline-block; margin-top: 1rem;\">Return Home</a></p>" +
        "</div>";
    }
  }

  function redirectToHome() {
    window.location.href = "index.html";
  }

  function setStatus(message, variant) {
    if (!state.statusElement) {
      return;
    }

    state.statusElement.textContent = message || "";
    state.statusElement.classList.remove("is-error", "is-success", "is-info");

    if (variant === "error") {
      state.statusElement.classList.add("is-error");
    } else if (variant === "success") {
      state.statusElement.classList.add("is-success");
    } else {
      state.statusElement.classList.add("is-info");
    }
  }

  function clearStatus() {
    if (!state.statusElement) {
      return;
    }

    state.statusElement.textContent = "";
    state.statusElement.classList.remove("is-error", "is-success", "is-info");
  }

  function setMetricsStatus(message, variant) {
    if (!state.metricsStatus) {
      return;
    }

    state.metricsStatus.textContent = message || "";
    state.metricsStatus.classList.remove("is-error", "is-success", "is-info");

    if (variant === "error") {
      state.metricsStatus.classList.add("is-error");
    } else if (variant === "success") {
      state.metricsStatus.classList.add("is-success");
    } else {
      state.metricsStatus.classList.add("is-info");
    }
  }

  function toggleMetricsEditor() {
    if (!state.metricsEditor) {
      return;
    }

    var isHidden = !!state.metricsEditor.hidden;
    state.metricsEditor.hidden = !isHidden;
  }

  function openMetricsEditorWithRows(rows) {
    if (!state.metricsEditor || !state.metricsRows) {
      return;
    }

    if (state.metricsEditor.hidden) {
      toggleMetricsEditor();
    }

    state.metricsRows.innerHTML = "";
    (rows || []).forEach(function (row) {
      appendMetricRow(row || {});
    });
  }

  function findLatestMetricByNameUnit(name, unit) {
    var targetName = normalizeMetricValue(name);
    var targetUnit = normalizeMetricValue(unit);

    return (state.metricsLatest || []).find(function (metric) {
      return (
        normalizeMetricValue(metric.metric_name) === targetName &&
        normalizeMetricValue(metric.metric_unit) === targetUnit
      );
    }) || null;
  }

  function findLatestMetricByKey(key) {
    var metricKey = String(key || "");
    return (state.metricsLatest || []).find(function (metric) {
      return getMetricKey(metric) === metricKey;
    }) || null;
  }

  function openMetricCardEditor(card, metric, mode) {
    if (!card || !metric) {
      return;
    }

    closeAllMetricCardEditors();

    var modeValue = mode === "test" ? "test" : "edit";
    card.classList.add("is-flipped");
    card.setAttribute("data-metric-mode", modeValue);

    var label = card.querySelector("[data-metric-flip-label]");
    var nameInput = card.querySelector('[data-metric-edit="name"]');
    var valueInput = card.querySelector('[data-metric-edit="value"]');
    var leftInput = card.querySelector('[data-metric-edit="left"]');
    var rightInput = card.querySelector('[data-metric-edit="right"]');
    var symmetryInput = card.querySelector('[data-metric-edit="symmetry"]');
    var yBalanceGrid = card.querySelector("[data-metric-ybalance-grid]");
    var grantGrid = card.querySelector("[data-metric-grant-grid]");
    var unitInput = card.querySelector('[data-metric-edit="unit"]');
    var categoryInput = card.querySelector('[data-metric-edit="category"]');
    var legLengthNote = card.querySelector("[data-leglength-estimate-note]");
    var isYBalance = isYBalanceMetricName(metric.metric_name || "");
    var isSingleLegSquat = isSingleLegSquatMetricName(metric.metric_name || "");
    var isSingleLegHeelRaise = isSingleLegHeelRaiseMetricName(metric.metric_name || "");
    var isSidePlank = isSidePlankMetricName(metric.metric_name || "");
    var isEdgePull = isEdgePullMetricName(metric.metric_name || "");
    var isGrant = isAdaptedGrantFootRaiseMetricName(metric.metric_name || "");

    if (label) {
      label.textContent = modeValue === "test" ? "Log New Test" : "Edit Metric";
    }

    if (nameInput) {
      nameInput.value = metric.metric_name || "";
    }
    if (unitInput) {
      unitInput.value = metric.metric_unit || "";
    }
    if (categoryInput) {
      categoryInput.value = metric.metric_category || "Performance";
    }

    if (leftInput) {
      leftInput.placeholder = isEdgePull ? "L Hand" : "L Leg";
    }
    if (rightInput) {
      rightInput.placeholder = isEdgePull ? "R Hand" : "R Leg";
    }

    if (legLengthNote) {
      var metricName = String(metric.metric_name || "");
      var showNote =
        isYBalanceMetricName(metricName) ||
        isAdaptedGrantFootRaiseMetricName(metricName);
      legLengthNote.hidden = !showNote;
    }

    if (yBalanceGrid) {
      yBalanceGrid.hidden = !(isYBalance || isEdgePull || isSingleLegSquat || isSingleLegHeelRaise || isSidePlank);
    }

    if (grantGrid) {
      grantGrid.hidden = !isGrant;
    }

    if (isYBalance) {
      card.setAttribute("data-metric-ybalance", "true");

      var parsed = parseYBalanceLegValues(metric.metric_value || "");
      var shouldBlankForTest = modeValue === "test";
      if (leftInput) {
        leftInput.value = shouldBlankForTest
          ? ""
          : (parsed.left === null ? "" : formatMetricNumber(parsed.left));
      }
      if (rightInput) {
        rightInput.value = shouldBlankForTest
          ? ""
          : (parsed.right === null ? "" : formatMetricNumber(parsed.right));
      }
      if (symmetryInput) {
        symmetryInput.value = "";
      }

      updateYBalanceDraftValue(card);

      if (leftInput) {
        leftInput.focus();
      }
      return;
    }

    card.removeAttribute("data-metric-ybalance");

    if (isSingleLegSquat) {
      card.setAttribute("data-metric-squat", "true");

      var leftSquatMetric = metric._pairedSideMetrics && metric._pairedSideMetrics.left;
      var rightSquatMetric = metric._pairedSideMetrics && metric._pairedSideMetrics.right;
      var leftSquatParsed = parseNumericMetricValue(leftSquatMetric && leftSquatMetric.metric_value);
      var rightSquatParsed = parseNumericMetricValue(rightSquatMetric && rightSquatMetric.metric_value);
      var shouldBlankForTestSquat = modeValue === "test";

      if (leftInput) {
        leftInput.value = shouldBlankForTestSquat
          ? ""
          : (Number.isFinite(leftSquatParsed) ? formatMetricNumber(leftSquatParsed) : "");
      }
      if (rightInput) {
        rightInput.value = shouldBlankForTestSquat
          ? ""
          : (Number.isFinite(rightSquatParsed) ? formatMetricNumber(rightSquatParsed) : "");
      }
      if (symmetryInput) {
        symmetryInput.value = "";
      }

      updateSingleLegSquatDraftValue(card);

      if (leftInput) {
        leftInput.focus();
      }
      return;
    }

    card.removeAttribute("data-metric-squat");

    if (isSingleLegHeelRaise) {
      card.setAttribute("data-metric-heelraise", "true");

      var leftHeelRaiseMetric = metric._pairedSideMetrics && metric._pairedSideMetrics.left;
      var rightHeelRaiseMetric = metric._pairedSideMetrics && metric._pairedSideMetrics.right;
      var leftHeelRaiseParsed = parseNumericMetricValue(leftHeelRaiseMetric && leftHeelRaiseMetric.metric_value);
      var rightHeelRaiseParsed = parseNumericMetricValue(rightHeelRaiseMetric && rightHeelRaiseMetric.metric_value);
      var shouldBlankForTestHeelRaise = modeValue === "test";

      if (leftInput) {
        leftInput.value = shouldBlankForTestHeelRaise
          ? ""
          : (Number.isFinite(leftHeelRaiseParsed) ? formatMetricNumber(leftHeelRaiseParsed) : "");
      }
      if (rightInput) {
        rightInput.value = shouldBlankForTestHeelRaise
          ? ""
          : (Number.isFinite(rightHeelRaiseParsed) ? formatMetricNumber(rightHeelRaiseParsed) : "");
      }
      if (symmetryInput) {
        symmetryInput.value = "";
      }

      updateSingleLegHeelRaiseDraftValue(card);

      if (leftInput) {
        leftInput.focus();
      }
      return;
    }

    card.removeAttribute("data-metric-heelraise");

    if (isSidePlank) {
      card.setAttribute("data-metric-sideplank", "true");

      var leftPlankMetric = metric._pairedSideMetrics && metric._pairedSideMetrics.left;
      var rightPlankMetric = metric._pairedSideMetrics && metric._pairedSideMetrics.right;
      var leftPlankParsed = parseNumericMetricValue(leftPlankMetric && leftPlankMetric.metric_value);
      var rightPlankParsed = parseNumericMetricValue(rightPlankMetric && rightPlankMetric.metric_value);
      var shouldBlankForTestPlank = modeValue === "test";

      if (leftInput) {
        leftInput.value = shouldBlankForTestPlank
          ? ""
          : (Number.isFinite(leftPlankParsed) ? formatMetricNumber(leftPlankParsed) : "");
      }
      if (rightInput) {
        rightInput.value = shouldBlankForTestPlank
          ? ""
          : (Number.isFinite(rightPlankParsed) ? formatMetricNumber(rightPlankParsed) : "");
      }
      if (symmetryInput) {
        symmetryInput.value = "";
      }

      updateSidePlankDraftValue(card);

      if (leftInput) {
        leftInput.focus();
      }
      return;
    }

    card.removeAttribute("data-metric-sideplank");

    if (isEdgePull) {
      card.setAttribute("data-metric-edgepull", "true");

      var leftPairedMetric = metric._pairedSideMetrics && metric._pairedSideMetrics.left;
      var rightPairedMetric = metric._pairedSideMetrics && metric._pairedSideMetrics.right;
      var parsedEdgeValue = parseYBalanceLegValues(metric.metric_value || "");
      var leftParsed = parseNumericMetricValue(leftPairedMetric && leftPairedMetric.metric_value);
      var rightParsed = parseNumericMetricValue(rightPairedMetric && rightPairedMetric.metric_value);
      var shouldBlankForTestEdge = modeValue === "test";

      if (leftInput) {
        leftInput.value = shouldBlankForTestEdge
          ? ""
          : (Number.isFinite(leftParsed)
            ? formatMetricNumber(leftParsed)
            : (parsedEdgeValue.left === null ? "" : formatMetricNumber(parsedEdgeValue.left)));
      }
      if (rightInput) {
        rightInput.value = shouldBlankForTestEdge
          ? ""
          : (Number.isFinite(rightParsed)
            ? formatMetricNumber(rightParsed)
            : (parsedEdgeValue.right === null ? "" : formatMetricNumber(parsedEdgeValue.right)));
      }
      if (symmetryInput) {
        symmetryInput.value = "";
      }

      updateEdgePullDraftValue(card);

      if (leftInput) {
        leftInput.focus();
      }
      return;
    }

    card.removeAttribute("data-metric-edgepull");

    if (isGrant) {
      card.setAttribute("data-metric-grant", "true");

      var parsedGrant = parseGrantLegValues(metric.metric_value || "");
      var shouldBlankForTestGrant = modeValue === "test";
      if (leftInput) {
        leftInput.value = shouldBlankForTestGrant
          ? ""
          : (parsedGrant.left === null ? "" : formatMetricNumber(parsedGrant.left));
      }
      if (rightInput) {
        rightInput.value = shouldBlankForTestGrant
          ? ""
          : (parsedGrant.right === null ? "" : formatMetricNumber(parsedGrant.right));
      }

      updateGrantDraftValue(card);

      if (leftInput) {
        leftInput.focus();
      }
      return;
    }

    card.removeAttribute("data-metric-grant");

    if (valueInput) {
      valueInput.value = modeValue === "test" ? "" : (metric.metric_value || "");
      valueInput.focus();
    }
  }

  function openMetricCardBenchmark(card, metric) {
    if (!card || !metric) {
      return;
    }

    closeAllMetricCardEditors();

    var summary = buildMetricBenchmarkSummary(metric);
    card.classList.add("is-flipped");
    card.setAttribute("data-metric-mode", "benchmark");

    var label = card.querySelector("[data-metric-flip-label]");
    var valueEl = card.querySelector("[data-benchmark-value]");
    var ratingEl = card.querySelector("[data-benchmark-rating]");
    var rangeEl = card.querySelector("[data-benchmark-range]");
    var meaningEl = card.querySelector("[data-benchmark-meaning]");

    if (label) {
      label.textContent = "Benchmarks";
    }
    if (valueEl) {
      valueEl.textContent = summary.currentValue;
    }
    if (ratingEl) {
      ratingEl.textContent = summary.rating;
    }
    if (rangeEl) {
      rangeEl.textContent = summary.range;
    }
    if (meaningEl) {
      meaningEl.textContent = summary.meaning;
    }
  }

  function buildMetricBenchmarkSummary(metric) {
    var metricName = String(metric.metric_name || "");
    var metricUnit = String(metric.metric_unit || "");
    var metricValue = String(metric.metric_value || "").trim();
    var numericValue = parseNumericMetricValue(metricValue);
    var readableValue = metricValue || "Not recorded";
    var valueWithUnit = metricUnit ? readableValue + " " + metricUnit : readableValue;
    var normalizedName = normalizeMetricValue(metricName);

    if (isVerticalJumpMetricName(normalizedName)) {
      return buildVerticalJumpBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (metric && metric._pairedSideMetrics) {
      if (isSingleLegSquatMetricName(normalizedName)) {
        return buildSingleLegSquatPairedBenchmarkSummary(metric, valueWithUnit);
      }
      if (isSingleLegHeelRaiseMetricName(normalizedName)) {
        return buildSingleLegHeelRaisePairedBenchmarkSummary(metric, valueWithUnit);
      }
      if (isSidePlankMetricName(normalizedName)) {
        return buildSidePlankPairedBenchmarkSummary(metric, valueWithUnit);
      }
      if (isYBalanceMetricName(normalizedName)) {
        return buildYBalancePairedBenchmarkSummary(metric, valueWithUnit);
      }
      if (isEdgePullMetricName(normalizedName)) {
        return buildEdgePullPairedBenchmarkSummary(metric, valueWithUnit);
      }
    }

    if (isEdgePullMetricName(normalizedName)) {
      return buildEdgePullBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (isSingleLegSquatMetricName(normalizedName)) {
      return buildSingleLegSquatBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (isSidePlankMetricName(normalizedName)) {
      return buildSidePlankBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (isYBalanceMetricName(normalizedName)) {
      return buildYBalanceReachBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (isMaxHangMetricName(normalizedName)) {
      return buildMaxHangBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (isMaxPullUpMetricName(normalizedName)) {
      return buildMaxPullUpBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (isHanging90DegreeHoldMetricName(normalizedName)) {
      return buildHanging90DegreeHoldBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (isCountermovementPushUpMetricName(normalizedName)) {
      return buildCountermovementPushUpBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (isCkcuestMetricName(normalizedName)) {
      return buildCkcuestBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    if (isAdaptedGrantFootRaiseMetricName(normalizedName)) {
      return buildAdaptedGrantFootRaiseBenchmarkSummary(metric, numericValue, valueWithUnit);
    }

    var definitions = [
      {
        keys: ["vertical jump", "countermovement jump", "cmj"],
        range: "Typical adult field-guide range: <30 developing, 30-45 solid, 45-55 strong, 55+ advanced (cm).",
        classify: function (value) {
          return classifyHigherBetter(value, [30, 45, 55], ["Developing", "Solid", "Strong", "Advanced"]);
        },
        meaning: {
          Developing: "Explosive lower-body power is a limiter. Prioritize jump mechanics, force production, and landing control.",
          Solid: "Baseline power is functional. Continue progressing with plyometrics and unilateral strength.",
          Strong: "Good power profile for most mountain and field sports. Maintain with quality speed-strength work.",
          Advanced: "High explosive profile. Focus on transfer to sport-specific speed and fatigue resistance."
        }
      },
      {
        keys: ["single leg heel raise", "single-leg heel raise", "heel raise"],
        range: "Single-leg heel raise guide: <20 developing, 20-30 functional, 31-40 strong, 40+ advanced (reps).",
        classify: function (value) {
          return classifyHigherBetter(value, [20, 31, 40], ["Developing", "Functional", "Strong", "Advanced"]);
        },
        meaning: {
          Developing: "Calf endurance may limit climbing, running economy, or downhill tolerance.",
          Functional: "Adequate endurance for general training. Build capacity for longer sessions.",
          Strong: "Good lower-leg endurance for repeated loading and terrain variation.",
          Advanced: "Excellent local endurance. Emphasize stiffness and reactive power transfer."
        }
      },
      {
        keys: ["side plank", "hip abduction hold", "plank"],
        range: "Side plank hold guide: <30 developing, 30-45 functional, 46-75 strong, 75+ advanced (seconds).",
        classify: function (value) {
          return classifyHigherBetter(value, [30, 46, 75], ["Developing", "Functional", "Strong", "Advanced"]);
        },
        meaning: {
          Developing: "Lateral trunk endurance is likely limiting. Build anti-rotation and hip control capacity.",
          Functional: "Core endurance supports general movement demands but can improve under fatigue.",
          Strong: "Good trunk endurance for force transfer and frontal-plane control.",
          Advanced: "Excellent trunk stability reserve. Keep quality and progress sport-specific complexity."
        }
      },
      {
        keys: ["y balance", "anterior reach"],
        range: "Anterior reach guide (as % leg length): <65 developing, 65-74 functional, 75-84 strong, 85+ advanced.",
        classify: function (value) {
          return classifyHigherBetter(value, [65, 75, 85], ["Developing", "Functional", "Strong", "Advanced"]);
        },
        meaning: {
          Developing: "Dynamic balance/control may increase compensations under load or fatigue.",
          Functional: "Movement control is serviceable. Build single-leg strength and reach quality.",
          Strong: "Good single-leg control and mobility integration for multi-planar tasks.",
          Advanced: "High dynamic control. Focus on maintaining symmetry and sport transfer."
        }
      },
      {
        keys: ["pull up", "pull-up", "20mm edge pull", "edge pull"],
        range: "Upper-pull benchmark guide: <5 developing, 5-10 functional, 11-15 strong, 16+ advanced (strict reps).",
        classify: function (value) {
          return classifyHigherBetter(value, [5, 11, 16], ["Developing", "Functional", "Strong", "Advanced"]);
        },
        meaning: {
          Developing: "Pulling strength-endurance is likely a bottleneck. Progress with strict volume and hangs.",
          Functional: "Useful baseline pulling capacity. Progress strength with targeted overload.",
          Strong: "Good pulling profile for climbing and upper-body force tasks.",
          Advanced: "High pulling capacity. Keep quality and monitor tendon load tolerance."
        }
      },
      {
        keys: ["resting hr", "resting heart rate"],
        range: "Resting HR guide: >70 elevated, 60-70 average, 50-59 good, <50 highly trained (bpm).",
        classify: function (value) {
          return classifyLowerBetter(value, [70, 60, 50], ["Elevated", "Average", "Good", "Highly Trained"]);
        },
        meaning: {
          Elevated: "Recovery capacity may be limited currently. Review sleep, stress, and aerobic base.",
          Average: "General population range. Consistent aerobic training can improve economy.",
          Good: "Efficient baseline for endurance and recovery demands.",
          "Highly Trained": "Strong aerobic adaptation. Continue balancing intensity and recovery."
        }
      }
    ];

    var definition = definitions.find(function (item) {
      return (item.keys || []).some(function (key) {
        return normalizedName.indexOf(normalizeMetricValue(key)) !== -1;
      });
    });

    var isYBalanceAnterior =
      normalizedName.indexOf("y balance") !== -1 ||
      normalizedName.indexOf("anterior reach") !== -1;

    if (definition && isYBalanceAnterior) {
      return buildYBalanceBenchmarkSummary(metric, definition);
    }

    if (!definition || numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: numericValue === null
          ? "Rating: Add a numeric score to unlock benchmark comparison."
          : "Rating: No direct benchmark mapped yet.",
        range: definition
          ? "Reference: " + definition.range
          : "Reference: Coach-defined metric. Compare against your previous tests and sport demands.",
        meaning: "Meaning: Use trend over time, left/right symmetry, and sport context to judge whether this metric is moving in the right direction."
      };
    }

    var rating = definition.classify(numericValue);
    var meaningText = definition.meaning[rating] || "Use this score with training context and trend direction.";

    return {
      currentValue: "Current score: " + valueWithUnit,
      rating: "Rating: " + rating,
      range: "Reference: " + definition.range,
      meaning: "Meaning: " + meaningText
    };
  }

  function onGenerateMetricSummaryPdf() {
    if (!state.metricsLatest || !state.metricsLatest.length) {
      setMetricsStatus("No metrics available yet. Add test results first.", "info");
      return;
    }

    var JsPdfCtor =
      (window.jspdf && window.jspdf.jsPDF) ||
      window.jsPDF ||
      null;

    if (!JsPdfCtor) {
      setMetricsStatus("PDF library did not load. Refresh and try again.", "error");
      return;
    }

    try {
      var doc = new JsPdfCtor({ unit: "pt", format: "letter" });
      var report = buildMetricSummaryReport(state.metricsLatest);
      var boulderingEstimate = estimateBoulderingLevelFromMetrics(state.metricsLatest);
      var boulderingBoxplotSignal = estimateBoulderingBoxplotSignal(state.metricsLatest);
      var sportClimbingEstimate = estimateSportClimbingLevelFromMetrics(state.metricsLatest);
      var sportBoxplotSignal = estimateSportBoxplotSignal(state.metricsLatest);
      var quadrantInsight = estimateClimbingStrengthQuadrant(state.metricsLatest);
      var gradeAdvice = buildClimbingGradeAdvice(
        state.metricsLatest,
        boulderingBoxplotSignal,
        sportBoxplotSignal
      );
      var pageWidth = doc.internal.pageSize.getWidth();
      var pageHeight = doc.internal.pageSize.getHeight();
      var margin = 40;
      var maxWidth = pageWidth - margin * 2;
      var y = margin;
      var lineHeight = 14;
      var athleteLabel =
        (state.profile && state.profile.name) ||
        (state.viewUser && state.viewUser.email) ||
        "Athlete";
      var sports = (state.profile && state.profile.sports) || [];
      var sportOverview = (state.profile && state.profile.sport_overview) || {};

      function ensureSpace(requiredHeight) {
        if (y + requiredHeight <= pageHeight - margin) {
          return;
        }
        doc.addPage();
        y = margin;
      }

      function writeWrapped(text, fontSize, color, bold) {
        var safeText = String(text || "");
        doc.setFontSize(fontSize || 10);
        if (bold) {
          doc.setFont(undefined, "bold");
        }
        if (Array.isArray(color) && color.length === 3) {
          doc.setTextColor(color[0], color[1], color[2]);
        } else {
          doc.setTextColor(33, 33, 33);
        }
        var lines = doc.splitTextToSize(safeText, maxWidth);
        ensureSpace(lines.length * lineHeight + 2);
        doc.text(lines, margin, y);
        y += lines.length * lineHeight;
        if (bold) {
          doc.setFont(undefined, "normal");
        }
      }

      function drawSeparator() {
        ensureSpace(10);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y + 4, pageWidth - margin, y + 4);
        y += 10;
      }

      // Header
      doc.setFontSize(22);
      doc.setTextColor(20, 100, 180);
      doc.setFont(undefined, "bold");
      doc.text("PERFORMANCE REPORT", margin, y);
      y += 25;
      doc.setFont(undefined, "normal");

      // Athlete Information Section
      doc.setFontSize(11);
      doc.setTextColor(33, 33, 33);
      writeWrapped("Athlete: " + athleteLabel, 12, [33, 33, 33], true);
      
      if (sports && sports.length) {
        writeWrapped("Sports: " + sports.join(", "), 11);
      }

      writeWrapped("Report Date: " + formatDate(new Date().toISOString()), 11);
      writeWrapped("Metrics Assessed: " + String(report.rows.length), 11);
      writeWrapped("Estimated Bouldering Level: " + boulderingEstimate.estimatedLevel, 11, [33, 33, 33], true);
      writeWrapped("Bouldering Estimate Details: " + boulderingEstimate.message, 9, [85, 85, 85]);
      writeWrapped("Bouldering Boxplot Signal: " + boulderingBoxplotSignal.band, 11, [33, 33, 33], true);
      writeWrapped("Boxplot Signal Details: " + boulderingBoxplotSignal.message, 9, [85, 85, 85]);
      writeWrapped("Estimated Sport Climbing Level: " + sportClimbingEstimate.estimatedLevel, 11, [33, 33, 33], true);
      writeWrapped("Sport Estimate Details: " + sportClimbingEstimate.message, 9, [85, 85, 85]);
      writeWrapped("Sport Boxplot Signal: " + sportBoxplotSignal.band, 11, [33, 33, 33], true);
      writeWrapped("Sport Boxplot Details: " + sportBoxplotSignal.message, 9, [85, 85, 85]);
      writeWrapped("Pull/Finger Strength Profile: " + quadrantInsight.quadrant, 11, [33, 33, 33], true);
      writeWrapped("Quadrant Interpretation: " + quadrantInsight.message, 9, [85, 85, 85]);
      y += 8;

      drawSeparator();

      // Performance Summary Section
      writeWrapped("PERFORMANCE SUMMARY", 13, [20, 100, 180], true);
      y += 4;

      var ratingCounts = categorizeRatings(report.rows);
      if (ratingCounts.excellent > 0) {
        writeWrapped("• Excellent Performance: " + ratingCounts.excellent + " metric(s)", 10);
      }
      if (ratingCounts.good > 0) {
        writeWrapped("• Good Performance: " + ratingCounts.good + " metric(s)", 10);
      }
      if (ratingCounts.average > 0) {
        writeWrapped("• Average Performance: " + ratingCounts.average + " metric(s)", 10);
      }
      if (ratingCounts.developing > 0) {
        writeWrapped("• Areas for Development: " + ratingCounts.developing + " metric(s)", 10);
      }
      y += 8;

      if (gradeAdvice && gradeAdvice.lines && gradeAdvice.lines.length) {
        drawSeparator();
        writeWrapped("GOAL-GRADE TRAINING ADVICE", 13, [20, 100, 180], true);
        y += 4;
        writeWrapped("Grade Context: " + gradeAdvice.context, 10, [85, 85, 85]);
        gradeAdvice.lines.forEach(function (line) {
          writeWrapped("• " + line, 10);
          y += 4;
        });
        y += 6;
      }

      // Sport-Specific Context
      if (sports && sports.length) {
        drawSeparator();
        writeWrapped("SPORT-SPECIFIC ANALYSIS", 13, [20, 100, 180], true);
        y += 4;

        sports.forEach(function (sport) {
          var sportAnalysis = getSportSpecificRecommendations(sport, report.rows, sportOverview);
          writeWrapped(sportAnalysis.title, 11, [60, 60, 60], true);
          writeWrapped(sportAnalysis.description, 10);
          y += 6;
        });
      }

      y += 4;
      drawSeparator();

      // Detailed Metrics Section
      writeWrapped("DETAILED METRIC ANALYSIS", 13, [20, 100, 180], true);
      y += 8;

      report.rows.forEach(function (row, index) {
        ensureSpace(100);
        writeWrapped(String(index + 1) + ". " + row.name, 11, [33, 33, 33], true);
        writeWrapped("Result: " + row.result, 10);
        writeWrapped("Performance Level: " + row.rating, 10, getRatingColor(row.rating));
        writeWrapped("Reference Range: " + row.reference, 9, [85, 85, 85]);
        writeWrapped(row.meaning, 9);
        y += 8;
      });

      y += 8;
      drawSeparator();

      // Key Takeaways
      writeWrapped("KEY TAKEAWAYS & RECOMMENDATIONS", 13, [20, 100, 180], true);
      y += 4;

      var takeaways = generateKeyTakeaways(report.rows, sports);
      takeaways.forEach(function (takeaway) {
        writeWrapped("• " + takeaway, 10);
        y += 6;
      });

      y += 8;
      drawSeparator();

      // Footer Note
      writeWrapped(
        "This performance report compares individual metrics against research-based normative standards. Results should be interpreted in context of sport demands, training history, injury status, and coaching judgment. Trends over time are more meaningful than single data points. Consult with your coach to develop targeted training interventions.",
        8,
        [100, 100, 100]
      );

      var pdfBlob = doc.output('blob');
      var pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      setMetricsStatus("Performance Report opened in new page.", "success");
    } catch (error) {
      setMetricsStatus(
        error && error.message ? error.message : "Failed to generate performance report.",
        "error"
      );
    }
  }

  function estimateBoulderingLevelFromMetrics(metrics) {
    var sex = resolveAthleteSexForBenchmarks();
    var table = sex === "female" ? climbingMetricsFemale : sex === "male" ? climbingMetrics : null;
    if (!table) {
      return {
        estimatedLevel: "Not enough information",
        message: "Athlete sex is not set to male/female, so sex-specific bouldering norms cannot be applied yet."
      };
    }

    var normEstimate = estimateClimbingLevelFromNormTable(metrics, table, "bouldering");
    var boxplotSignal = estimateBoulderingBoxplotSignal(metrics);

    if (boxplotSignal.band === "Not enough information") {
      return normEstimate;
    }

    if (normEstimate.estimatedLevel === "Not enough information") {
      return {
        estimatedLevel: boxplotSignal.band,
        message:
          "Norm-table estimate unavailable. Using boxplot trend estimate from sex-specific bouldering data: " +
          boxplotSignal.message
      };
    }

    return {
      estimatedLevel: normEstimate.estimatedLevel,
      message:
        normEstimate.message +
        " Boxplot trend signal: " +
        boxplotSignal.band +
        ". " +
        boxplotSignal.message
    };
  }

  function estimateSportClimbingLevelFromMetrics(metrics) {
    var sex = resolveAthleteSexForBenchmarks();
    var table = sex === "male" ? sportClimbingMetricsMale : sex === "female" ? sportClimbingMetricsFemale : null;
    if (!table) {
      return {
        estimatedLevel: "Not enough information",
        message: "Athlete sex is not set to male/female, so sex-specific sport climbing norms cannot be applied yet."
      };
    }

    return estimateClimbingLevelFromNormTable(metrics, table, "sport");
  }

  function estimateClimbingLevelFromNormTable(metrics, table, label) {
    var metricMap = buildNumericMetricMap(metrics);
    var levelVotes = {};
    var matched = 0;

    table.forEach(function (normMetric) {
      var canonicalName = String(normMetric && normMetric.name || "");
      var matchedValue = findMetricValueByCanonicalName(metricMap, canonicalName);
      if (matchedValue === null) {
        return;
      }

      matched += 1;
      var levels = normMetric.levels || {};
      Object.keys(levels).forEach(function (level) {
        var range = levels[level];
        if (!Array.isArray(range) || range.length < 2) {
          return;
        }
        var low = Number(range[0]);
        var high = Number(range[1]);
        if (Number.isFinite(low) && Number.isFinite(high) && matchedValue >= low && matchedValue <= high) {
          levelVotes[level] = (levelVotes[level] || 0) + 1;
        }
      });
    });

    if (matched === 0) {
      return {
        estimatedLevel: "Not enough information",
        message: "No compatible " + label + " metric values were found in this athlete profile yet."
      };
    }

    var bestLevel = "";
    var bestVotes = 0;
    Object.keys(levelVotes).forEach(function (level) {
      var votes = levelVotes[level] || 0;
      if (votes > bestVotes) {
        bestVotes = votes;
        bestLevel = level;
      }
    });

    if (!bestLevel) {
      return {
        estimatedLevel: "Not enough information",
        message: "Metrics were found, but values did not align with current " + label + " norm bands."
      };
    }

    return {
      estimatedLevel: bestLevel,
      message: "Estimated from " + String(matched) + " matched " + label + " metric(s) using sex-specific normative bands."
    };
  }

  function estimateClimbingStrengthQuadrant(metrics) {
    var metricMap = buildNumericMetricMap(metrics);
    var hang = findMetricValueByCanonicalName(metricMap, "Max Hang Str: Wt., 20mm, 10sec");
    var pull = findMetricValueByCanonicalName(metricMap, "Weighted Pull-Up Str:Wt, 1 Rep Max");

    if (hang === null || pull === null) {
      var missing = [];
      if (hang === null) {
        missing.push("Max Hang strength");
      }
      if (pull === null) {
        missing.push("Weighted Pull-Up strength");
      }
      return {
        quadrant: "Not enough information",
        message: "Need " + missing.join(" and ") + " to classify Q1-Q4 pull/finger profile."
      };
    }

    var highThreshold = 1.5;
    var fingerHigh = hang >= highThreshold;
    var pullHigh = pull >= highThreshold;

    if (fingerHigh && pullHigh) {
      return {
        quadrant: "Q1 (High Pull + High Finger)",
        message: "Common in high performers. This supports stronger grade potential, while actual performance still depends on access, tactics, and technical execution."
      };
    }
    if (!fingerHigh && pullHigh) {
      return {
        quadrant: "Q2 (High Pull + Lower Finger)",
        message: "Pulling capacity is strong, but finger strength is likely the current limiter. In bouldering this can cap top-end performance until finger force catches up."
      };
    }
    if (!fingerHigh && !pullHigh) {
      return {
        quadrant: "Q3 (Lower Pull + Lower Finger)",
        message: "Typical of easier-to-moderate grades where movement, positioning, and tactics can drive progress while strength base is developed."
      };
    }

    return {
      quadrant: "Q4 (Lower Pull + High Finger)",
      message: "Rare profile in climbers. Prioritize pulling strength development so high finger force can be expressed on steeper and more powerful terrain."
    };
  }

  function estimateBoulderingBoxplotSignal(metrics) {
    var sex = resolveAthleteSexForBenchmarks();
    var metricBands = getBoulderingBoxplotBandsBySex(sex);
    if (!metricBands) {
      return {
        band: "Not enough information",
        message: "Athlete sex is not set to male/female, so bouldering boxplot bands cannot be applied."
      };
    }

    var metricMap = buildNumericMetricMap(metrics);
    return estimateGradeBandSignalFromBoxplotTable(metricMap, metricBands, "bouldering");
  }

  function estimateSportBoxplotSignal(metrics) {
    var sex = resolveAthleteSexForBenchmarks();
    var metricBands = getSportBoxplotBandsBySex(sex);
    if (!metricBands) {
      return {
        band: "Not enough information",
        message: "Athlete sex is not set to male/female, so sport boxplot bands cannot be applied."
      };
    }

    var metricMap = buildNumericMetricMap(metrics);
    return estimateGradeBandSignalFromBoxplotTable(metricMap, metricBands, "sport");
  }

  function estimateGradeBandSignalFromBoxplotTable(metricMap, metricBands, label) {
    var votes = {};
    var matchedMetrics = 0;

    Object.keys(metricBands).forEach(function (metricName) {
      var value = findMetricValueByCanonicalName(metricMap, metricName);
      if (value === null) {
        return;
      }

      matchedMetrics += 1;
      var bands = metricBands[metricName];
      Object.keys(bands).forEach(function (band) {
        var range = bands[band];
        var low = Number(range[0]);
        var high = Number(range[1]);
        if (Number.isFinite(low) && Number.isFinite(high) && value >= low && value <= high) {
          votes[band] = (votes[band] || 0) + 1;
        }
      });
    });

    if (matchedMetrics === 0) {
      return {
        band: "Not enough information",
        message: "Need at least one of: max hang ratio, weighted pull-up ratio, max pull-ups, or 7:3 repeaters."
      };
    }

    var bestBand = "";
    var bestVotes = 0;
    Object.keys(votes).forEach(function (band) {
      var count = votes[band] || 0;
      if (count > bestVotes) {
        bestVotes = count;
        bestBand = band;
      }
    });

    if (!bestBand) {
      return {
        band: "Not enough information",
        message: "Compatible metrics were found, but values did not overlap with the " + label + " boxplot trend bands."
      };
    }

    var confidence = "Low";
    if (bestVotes >= 3) {
      confidence = "High";
    } else if (bestVotes >= 2) {
      confidence = "Moderate";
    }

    return {
      band: bestBand,
      message:
        "Derived from " + String(matchedMetrics) + " matched metric(s) with " + confidence + " confidence (" +
        String(bestVotes) + " supporting vote(s))."
    };
  }

  function getBoulderingBoxplotBandsBySex(sex) {
    var male = {
      "Max Hang Str: Wt., 20mm, 10sec": {
        "Less Than V4": [1.0, 1.25],
        "V4 - V6": [1.2, 1.45],
        "V7 - V9": [1.33, 1.6],
        "V10 - V12": [1.45, 1.75],
        "V13+": [1.6, 2.05]
      },
      "Weighted Pull-Up Str:Wt, 1 Rep Max": {
        "Less Than V4": [1.1, 1.35],
        "V4 - V6": [1.35, 1.6],
        "V7 - V9": [1.4, 1.7],
        "V10 - V12": [1.5, 1.85],
        "V13+": [1.65, 1.95]
      },
      "Max Pull-Ups, reps": {
        "Less Than V4": [6, 13],
        "V4 - V6": [11, 19],
        "V7 - V9": [13, 20],
        "V10 - V12": [15, 24],
        "V13+": [19, 23]
      },
      "7:3 Repeaters at Bodyweight, 20mm, sec": {
        "Less Than V4": [45, 95],
        "V4 - V6": [70, 130],
        "V7 - V9": [100, 160],
        "V10 - V12": [120, 220],
        "V13+": [150, 230]
      }
    };

    var female = {
      "Max Hang Str: Wt., 20mm, 10sec": {
        "Less Than V4": [1.0, 1.15],
        "V4 - V6": [1.1, 1.35],
        "V7 - V9": [1.27, 1.56],
        "V10 - V12": [1.46, 1.78],
        "V13+": [1.58, 1.78]
      },
      "Weighted Pull-Up Str:Wt, 1 Rep Max": {
        "Less Than V4": [1.0, 1.23],
        "V4 - V6": [1.15, 1.38],
        "V7 - V9": [1.31, 1.5],
        "V10 - V12": [1.42, 1.56],
        "V13+": [1.52, 1.6]
      },
      "Max Pull-Ups, reps": {
        "Less Than V4": [2, 8],
        "V4 - V6": [6, 11],
        "V7 - V9": [10, 15],
        "V10 - V12": [14, 16],
        "V13+": [16, 20]
      },
      "7:3 Repeaters at Bodyweight, 20mm, sec": {
        "Less Than V4": [25, 55],
        "V4 - V6": [60, 120],
        "V7 - V9": [90, 190],
        "V10 - V12": [95, 165],
        "V13+": [160, 230]
      }
    };

    if (sex === "male") {
      return male;
    }
    if (sex === "female") {
      return female;
    }
    return null;
  }

  function getSportBoxplotBandsBySex(sex) {
    var male = {
      "Max Hang Str: Wt., 20mm, 10sec": {
        "5.10a-d": [1.1, 1.45],
        "5.11a-d": [1.14, 1.36],
        "5.12a-d": [1.25, 1.51],
        "5.13a-d": [1.35, 1.56],
        "5.14a-d": [1.45, 1.66]
      },
      "Weighted Pull-Up Str:Wt, 1 Rep Max": {
        "5.10a-d": [1.35, 1.52],
        "5.11a-d": [1.34, 1.57],
        "5.12a-d": [1.36, 1.61],
        "5.13a-d": [1.47, 1.7],
        "5.14a-d": [1.58, 1.74]
      },
      "Max Pull-Ups, reps": {
        "5.10a-d": [11, 17],
        "5.11a-d": [12, 19],
        "5.12a-d": [13, 18],
        "5.13a-d": [15, 20],
        "5.14a-d": [16, 23]
      },
      "7:3 Repeaters at Bodyweight, 20mm, sec": {
        "5.10a-d": [50, 90],
        "5.11a-d": [65, 120],
        "5.12a-d": [90, 145],
        "5.13a-d": [120, 190],
        "5.14a-d": [150, 205]
      }
    };

    var female = {
      "Max Hang Str: Wt., 20mm, 10sec": {
        "5.10a-d": [1.0, 1.24],
        "5.11a-d": [1.04, 1.26],
        "5.12a-d": [1.17, 1.43],
        "5.13a-d": [1.25, 1.54],
        "5.14a-d": [1.35, 1.55]
      },
      "Weighted Pull-Up Str:Wt, 1 Rep Max": {
        "5.10a-d": [1.08, 1.26],
        "5.11a-d": [1.11, 1.34],
        "5.12a-d": [1.17, 1.42],
        "5.13a-d": [1.31, 1.49],
        "5.14a-d": [1.36, 1.5]
      },
      "Max Pull-Ups, reps": {
        "5.10a-d": [3, 10],
        "5.11a-d": [4, 10],
        "5.12a-d": [6, 13],
        "5.13a-d": [10, 15],
        "5.14a-d": [8, 14]
      },
      "7:3 Repeaters at Bodyweight, 20mm, sec": {
        "5.10a-d": [35, 60],
        "5.11a-d": [35, 105],
        "5.12a-d": [75, 125],
        "5.13a-d": [90, 200],
        "5.14a-d": [180, 220]
      }
    };

    if (sex === "male") {
      return male;
    }
    if (sex === "female") {
      return female;
    }
    return null;
  }

  function buildClimbingGradeAdvice(metrics, boulderingSignal, sportSignal) {
    var sex = resolveAthleteSexForBenchmarks();
    if (!sex) {
      return {
        context: "Unknown (sex not set)",
        lines: ["Set athlete sex in profile so grade-based training advice can use the correct boxplot bands."]
      };
    }

    var goalContext = resolveClimbingGoalContext(boulderingSignal, sportSignal);
    var discipline = goalContext.discipline;
    var targetBand = goalContext.band;
    if (!discipline || !targetBand) {
      return {
        context: "Unknown target grade",
        lines: ["Add a climbing goal grade (for example V7 or 5.12a) in the profile to unlock goal-grade advice."]
      };
    }

    var table = discipline === "sport"
      ? getSportBoxplotBandsBySex(sex)
      : getBoulderingBoxplotBandsBySex(sex);

    if (!table) {
      return {
        context: discipline + " " + targetBand,
        lines: ["No grade-band table available for this athlete context yet."]
      };
    }

    var metricMap = buildNumericMetricMap(metrics);
    var lines = [];

    Object.keys(table).forEach(function (metricName) {
      var bandRange = (table[metricName] || {})[targetBand];
      if (!bandRange) {
        return;
      }

      var value = findMetricValueByCanonicalName(metricMap, metricName);
      if (value === null) {
        return;
      }

      var position = classifyBoxplotPosition(value, bandRange);
      var advice = getBoxplotAdvice(position.key);
      lines.push(shortMetricLabel(metricName) + ": " + position.label + ". " + advice);
    });

    if (!lines.length) {
      lines.push("Not enough compatible metric values were found to generate boxplot-zone training advice.");
    }

    return {
      context: discipline.charAt(0).toUpperCase() + discipline.slice(1) + " target " + targetBand + " (" + goalContext.source + ")",
      lines: lines
    };
  }

  function resolveClimbingGoalContext(boulderingSignal, sportSignal) {
    var overview = getProfileSportOverview(state.profile) || {};
    var general = overview && overview.general && typeof overview.general === "object"
      ? overview.general
      : {};

    var rawGradeCandidates = [
      overview.climbing_goal_grade,
      overview.goal_climbing_grade,
      overview.goal_grade,
      general.climbing_goal_grade,
      general.goal_climbing_grade,
      general.goal_grade,
      overview.climbing_grade,
      general.climbing_grade
    ];

    var rawGrade = rawGradeCandidates.find(function (value) {
      return String(value || "").trim().length > 0;
    });

    var gradeText = String(rawGrade || "").trim();
    var boulderBand = parseBoulderingBandFromGrade(gradeText);
    if (boulderBand) {
      return { discipline: "bouldering", band: boulderBand, source: "profile grade" };
    }

    var sportBand = parseSportBandFromGrade(gradeText);
    if (sportBand) {
      return { discipline: "sport", band: sportBand, source: "profile grade" };
    }

    if (boulderingSignal && boulderingSignal.band && boulderingSignal.band !== "Not enough information") {
      return { discipline: "bouldering", band: boulderingSignal.band, source: "boxplot signal" };
    }

    if (sportSignal && sportSignal.band && sportSignal.band !== "Not enough information") {
      return { discipline: "sport", band: sportSignal.band, source: "boxplot signal" };
    }

    return { discipline: "", band: "", source: "" };
  }

  function parseBoulderingBandFromGrade(rawGrade) {
    var text = String(rawGrade || "").toUpperCase();
    var match = text.match(/V\s*(\d{1,2})/i);
    if (!match) {
      return "";
    }

    var v = parseInt(match[1], 10);
    if (!Number.isFinite(v)) {
      return "";
    }
    if (v < 4) {
      return "Less Than V4";
    }
    if (v <= 6) {
      return "V4 - V6";
    }
    if (v <= 9) {
      return "V7 - V9";
    }
    if (v <= 12) {
      return "V10 - V12";
    }
    return "V13+";
  }

  function parseSportBandFromGrade(rawGrade) {
    var text = String(rawGrade || "").toLowerCase();
    var match = text.match(/5\.(10|11|12|13|14)/);
    if (!match) {
      return "";
    }
    var major = parseInt(match[1], 10);
    if (major === 10) {
      return "5.10a-d";
    }
    if (major === 11) {
      return "5.11a-d";
    }
    if (major === 12) {
      return "5.12a-d";
    }
    if (major === 13) {
      return "5.13a-d";
    }
    if (major === 14) {
      return "5.14a-d";
    }
    return "";
  }

  function classifyBoxplotPosition(value, bandRange) {
    var q1 = Number(Array.isArray(bandRange) ? bandRange[0] : NaN);
    var q3 = Number(Array.isArray(bandRange) ? bandRange[1] : NaN);
    if (!Number.isFinite(q1) || !Number.isFinite(q3)) {
      return { key: "box-below-median", label: "Box Below Median" };
    }

    var low = Math.min(q1, q3);
    var high = Math.max(q1, q3);
    var iqr = Math.max(high - low, 0.05);
    var median = low + iqr / 2;
    var lowerWhisker = low - iqr * 0.4;
    var upperWhisker = high + iqr * 0.4;

    if (value < lowerWhisker) {
      return { key: "lower-outlier-space", label: "Lower Outlier Space" };
    }
    if (value < low) {
      return { key: "lower-whisker", label: "Lower Whisker" };
    }
    if (value < median) {
      return { key: "box-below-median", label: "Box Below Median" };
    }
    if (value <= high) {
      return { key: "box-beyond-median", label: "Box Beyond Median" };
    }
    if (value <= upperWhisker) {
      return { key: "upper-whisker", label: "Upper Whisker" };
    }
    return { key: "upper-outlier-space", label: "Upper Outlier Space" };
  }

  function getBoxplotAdvice(positionKey) {
    if (positionKey === "upper-whisker") {
      return "You are likely more than good here. Keep this at maintenance and train it every 7-10 days.";
    }
    if (positionKey === "box-beyond-median") {
      return "You are likely in a good place for this goal variable. Train it about once per week.";
    }
    if (positionKey === "box-below-median") {
      return "This may not block your goals, but training it 1-2x/week for a few weeks can move you toward the median.";
    }
    if (positionKey === "lower-whisker") {
      return "This is low-hanging fruit. Train it 2-3x/week early in session, after warm-up, with full focus.";
    }
    if (positionKey === "upper-outlier-space") {
      return "This is already very high. Look for limiting factors elsewhere and reduce direct work on this system.";
    }
    if (positionKey === "lower-outlier-space") {
      return "There is a clear path forward. Train this variable 2-3x/week with structured focus.";
    }
    return "Maintain balanced development while monitoring trend over repeated tests.";
  }

  function shortMetricLabel(metricName) {
    var normalized = normalizeMetricValue(metricName);
    if (normalized.indexOf("max hang") !== -1 || normalized.indexOf("edge pull") !== -1) {
      return "Max Hang Ratio";
    }
    if (normalized.indexOf("weighted pull") !== -1) {
      return "Weighted Pull-Up Ratio";
    }
    if (normalized.indexOf("max pull") !== -1) {
      return "Max Pull-Ups";
    }
    if (normalized.indexOf("7:3") !== -1 || normalized.indexOf("repeaters") !== -1) {
      return "7:3 Repeaters";
    }
    return String(metricName || "Metric");
  }

  function buildNumericMetricMap(metrics) {
    var metricList = Array.isArray(metrics) ? metrics : [];
    var metricMap = {};
    metricList.forEach(function (metric) {
      var name = normalizeMetricValue(metric && metric.metric_name);
      var value = extractFirstNumericValue(metric && metric.metric_value);
      if (!name || value === null) {
        return;
      }
      metricMap[name] = value;
    });
    return metricMap;
  }

  function findMetricValueByCanonicalName(metricMap, canonicalName) {
    var aliases = {
      "Max Hang Str: Wt., 20mm, 10sec": [
        "max hang str: wt., 20mm, 10sec",
        "max hang strength",
        "20mm edge hang",
        "20mm edge pull",
        "edge pull",
        "20mm edge pull (single-arm)"
      ],
      "Weighted Pull-Up Str:Wt, 1 Rep Max": [
        "weighted pull-up str:wt, 1 rep max",
        "weighted pull up",
        "weighted pull-up"
      ],
      "Campus Max Reach, inches": [
        "campus max reach, inches",
        "campus max reach"
      ],
      "Long Reach Foot-On Campus Time, sec": [
        "long reach foot-on campus time, sec",
        "long reach foot on campus time"
      ],
      "Short Reach Foot-On Campus Time, sec": [
        "short reach foot-on campus time, sec",
        "short reach foot on campus time"
      ],
      "7:3 Repeaters at Bodyweight, 20mm, sec": [
        "7:3 repeaters at bodyweight, 20mm, sec",
        "7:3 repeaters",
        "repeaters"
      ],
      "Continuous Hang Time, 20mm, sec": [
        "continuous hang time, 20mm, sec",
        "continuous hang time",
        "core hold time"
      ],
      "Max Pull-Ups, reps": [
        "max pull-ups, reps",
        "max pull ups",
        "pull ups",
        "max pull up"
      ],
      "Max Push-Ups, reps": [
        "max push-ups, reps",
        "max push ups",
        "push ups"
      ]
    };

    var aliasList = aliases[canonicalName] || [normalizeMetricValue(canonicalName)];
    for (var i = 0; i < aliasList.length; i++) {
      var candidate = metricMap[normalizeMetricValue(aliasList[i])];
      if (Number.isFinite(candidate)) {
        return candidate;
      }
    }
    return null;
  }

  function extractFirstNumericValue(rawValue) {
    var text = String(rawValue || "").trim();
    if (!text) {
      return null;
    }
    var parsed = parseFloat(text);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
    var match = text.match(/-?\d+(?:\.\d+)?/);
    if (!match) {
      return null;
    }
    var fallback = Number(match[0]);
    return Number.isFinite(fallback) ? fallback : null;
  }

  function categorizeRatings(rows) {
    var counts = { excellent: 0, good: 0, average: 0, developing: 0 };
    
    rows.forEach(function (row) {
      var rating = String(row.rating || "").toLowerCase();
      if (rating.indexOf("excellent") !== -1 || rating.indexOf("highly trained") !== -1) {
        counts.excellent++;
      } else if (rating.indexOf("good") !== -1 || rating.indexOf("trained") !== -1) {
        counts.good++;
      } else if (rating.indexOf("average") !== -1 || rating.indexOf("moderate") !== -1) {
        counts.average++;
      } else if (rating.indexOf("developing") !== -1 || rating.indexOf("below") !== -1 || rating.indexOf("beginner") !== -1) {
        counts.developing++;
      }
    });
    
    return counts;
  }

  function getRatingColor(rating) {
    var ratingLower = String(rating || "").toLowerCase();
    if (ratingLower.indexOf("excellent") !== -1 || ratingLower.indexOf("highly trained") !== -1) {
      return [34, 139, 34]; // Green
    } else if (ratingLower.indexOf("good") !== -1 || ratingLower.indexOf("trained") !== -1) {
      return [70, 130, 180]; // Blue
    } else if (ratingLower.indexOf("average") !== -1 || ratingLower.indexOf("moderate") !== -1) {
      return [184, 134, 11]; // Gold
    } else if (ratingLower.indexOf("developing") !== -1 || ratingLower.indexOf("below") !== -1) {
      return [220, 20, 60]; // Crimson
    }
    return [33, 33, 33]; // Default
  }

  function getSportSpecificRecommendations(sport, rows, sportOverview) {
    var sportLower = String(sport || "").toLowerCase();
    var title = sport.charAt(0).toUpperCase() + sport.slice(1);
    var description = "";

    if (sportLower.indexOf("climb") !== -1) {
      description = "Climbing performance depends on finger strength, pulling power, core stability, and body awareness. Focus on grip endurance (edge pull tests), power endurance, and antagonist strength to prevent injury.";
    } else if (sportLower.indexOf("ski") !== -1 || sportLower.indexOf("snowboard") !== -1) {
      description = "Ski/snowboard performance requires strong legs (single-leg balance, squat strength), aerobic capacity, and shock absorption. Lower body asymmetries should be addressed to prevent injury on variable terrain.";
    } else if (sportLower.indexOf("run") !== -1 || sportLower.indexOf("trail") !== -1) {
      description = "Running performance depends on aerobic capacity (resting/max HR), power generation (vertical jump, broad jump), and muscular endurance. Efficient movement patterns and consistent power output prevent injury during distance activities.";
    } else if (sportLower.indexOf("mtb") !== -1 || sportLower.indexOf("mountain bike") !== -1) {
      description = "Mountain biking requires anaerobic capacity (FTP), core stability, leg strength, and aerobic base. Balance and body control are critical on technical terrain.";
    } else {
      description = "Assess metrics relative to your primary training demands and injury history. Work with your coach to prioritize training interventions.";
    }

    return { title: title, description: description };
  }

  function generateKeyTakeaways(rows, sports) {
    var takeaways = [];
    var ratingCounts = categorizeRatings(rows);

    if (ratingCounts.developing > 0) {
      var developmentAreas = rows
        .filter(function (row) {
          var rating = String(row.rating || "").toLowerCase();
          return rating.indexOf("developing") !== -1 || rating.indexOf("below") !== -1;
        })
        .map(function (row) { return row.name; })
        .slice(0, 2);

      if (developmentAreas.length) {
        takeaways.push("Prioritize improving " + developmentAreas.join(" and ") + " through targeted training.");
      }
    }

    if (ratingCounts.excellent + ratingCounts.good > ratingCounts.developing) {
      takeaways.push("Strong baseline fitness. Focus on maintaining strengths while addressing development areas.");
    }

    takeaways.push("Track these metrics regularly (monthly or quarterly) to monitor progress and adjust training.");
    takeaways.push("Compare results to previous assessments to identify trends—single data points are less meaningful than trajectory.");

    if (sports && sports.length) {
      takeaways.push("All interpretations are tailored to your " + sports[0] + " activity demands.");
    }

    return takeaways.length ? takeaways : ["Review metrics with your coach to develop a targeted training plan."];
  }

  function buildMetricSummaryReport(metrics) {
    var rows = (metrics || []).map(function (metric) {
      try {
        var summary = buildMetricBenchmarkSummary(metric);
        var rating = extractBenchmarkLabel(summary && summary.rating, "Rating:");
        var reference = extractBenchmarkLabel(summary && summary.range, "Reference:");
        var meaning = extractBenchmarkLabel(summary && summary.meaning, "Meaning:");
        var result = buildMetricResultLabel(metric);

        return {
          name: String(metric && metric.metric_name || "Metric"),
          result: result,
          rating: rating,
          reference: reference,
          meaning: meaning
        };
      } catch (error) {
        return {
          name: String(metric && metric.metric_name || "Metric"),
          result: buildMetricResultLabel(metric),
          rating: "Unable to classify",
          reference: "Metric-specific benchmark mapping failed.",
          meaning: error && error.message ? error.message : "Unexpected metric processing error."
        };
      }
    });

    return {
      rows: rows
    };
  }

  function extractBenchmarkLabel(text, prefix) {
    var value = String(text || "").trim();
    var labelPrefix = String(prefix || "").trim();
    if (!labelPrefix) {
      return value;
    }
    if (value.indexOf(labelPrefix) === 0) {
      return value.slice(labelPrefix.length).trim();
    }
    return value;
  }

  function buildMetricResultLabel(metric) {
    var value = String(metric && metric.metric_value || "").trim();
    var unit = String(metric && metric.metric_unit || "").trim();
    if (!value) {
      return "Not recorded";
    }
    return unit ? value + " " + unit : value;
  }

  function deriveMetricFlag(metric, rating, resultText) {
    var cleanRating = String(rating || "").trim().toLowerCase();
    if (!resultText || String(resultText).toLowerCase() === "not recorded") {
      return "Missing result";
    }
    if (cleanRating.indexOf("add a numeric") !== -1) {
      return "Result format needs numeric value for normative comparison";
    }
    if (
      cleanRating === "developing" ||
      cleanRating === "elevated" ||
      cleanRating === "below average" ||
      cleanRating === "below beginner"
    ) {
      return "Below normative target";
    }

    var metricName = String(metric && metric.metric_name || "");
    if (isYBalanceMetricName(metricName)) {
      var parsed = parseYBalanceLegValues(String(metric && metric.metric_value || ""));
      if (parsed && parsed.left !== null && parsed.right !== null) {
        var symmetry = calculateSymmetryPercent(parsed.left, parsed.right);
        if (symmetry !== null && symmetry < 95) {
          return "Y Balance asymmetry flagged (" + formatMetricNumber(symmetry) + "% symmetry)";
        }
      }
    }

    return "";
  }

  function isVerticalJumpMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("vertical jump") !== -1 ||
      name.indexOf("countermovement jump") !== -1 ||
      name === "cmj" ||
      name.indexOf(" cmj") !== -1 ||
      name.indexOf("cmj ") !== -1
    );
  }

  function isEdgePullMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("20mm edge pull") !== -1 || 
      name.indexOf("20mm edge hang") !== -1 ||
      name.indexOf("edge pull") !== -1 ||
      name.indexOf("edge hang") !== -1
    );
  }

  function isSingleLegSquatMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("single leg squat") !== -1 ||
      name.indexOf("single-leg squat") !== -1 ||
      name.indexOf("sl squat") !== -1
    );
  }

  function isSingleLegHeelRaiseMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("single leg heel raise") !== -1 ||
      name.indexOf("single-leg heel raise") !== -1 ||
      name.indexOf("heel raise") !== -1
    );
  }

  function isSidePlankMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      (name.indexOf("side plank") !== -1 && name.indexOf("hip abduction") !== -1) ||
      name.indexOf("side plank hip abduction") !== -1 ||
      name.indexOf("plank hold") !== -1
    );
  }

  function isMaxPullUpMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("max pull up") !== -1 ||
      name.indexOf("pull up") !== -1 ||
      name.indexOf("pullup") !== -1 ||
      name.indexOf("pull-up") !== -1
    );
  }

  function isMaxHangMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("max hang") !== -1 ||
      name.indexOf("dead hang") !== -1 ||
      name.indexOf("bar hang") !== -1
    );
  }

  function isHanging90DegreeHoldMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("90 degree hold") !== -1 ||
      name.indexOf("90 degree") !== -1 ||
      name.indexOf("90 degree bent leg") !== -1 ||
      name.indexOf("hanging 90") !== -1 ||
      name.indexOf("hip flexion hold") !== -1
    );
  }

  function isCountermovementPushUpMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("countermovement push-up") !== -1 ||
      name.indexOf("countermovement push up") !== -1 ||
      name.indexOf("cmpu") !== -1 ||
      name.indexOf("power push up") !== -1
    );
  }

  function isCkcuestMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("closed kinetic chain upper extremity stability test") !== -1 ||
      name.indexOf("ckcuest") !== -1 ||
      name.indexOf("shoulder tap test") !== -1 ||
      name.indexOf("shoulder tap") !== -1
    );
  }

  function isAdaptedGrantFootRaiseMetricName(normalizedName) {
    var name = normalizeMetricValue(normalizedName);
    return (
      name.indexOf("grant foot raise") !== -1 ||
      name.indexOf("adapted grant") !== -1 ||
      name.indexOf("foot raise") !== -1 ||
      name.indexOf("grant reach") !== -1
    );
  }

  function buildSingleLegSquatBenchmarkSummary(metric, numericValue, valueWithUnit) {
    var sex = resolveAthleteSexForBenchmarks();
    var bands = getSingleLegSquatNormBandForSex(sex);

    if (numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to unlock benchmark comparison.",
        range:
          "Reference: 30-second Single-Leg Squat uses sex-specific rep bands for Developing to Elite.",
        meaning:
          "Meaning: Enter numeric reps from a standardized 30-second test (controlled reps, no hand support, full extension)."
      };
    }

    if (!bands) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men: Developing <12, Recreational 12-16, Trained 17-21, Advanced 22-26, Elite 27+. " +
          "Women: Developing <10, Recreational 10-14, Trained 15-19, Advanced 20-24, Elite 25+.",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply Single-Leg Squat normative values."
      };
    }

    var rating = classifySingleLegSquatReps(numericValue, bands);
    var meaningByRating = {
      Developing: "Single-leg capacity is currently a limiter. Prioritize unilateral strength, control, and tempo quality.",
      Recreational: "Foundational single-leg control is present. Continue progressing depth quality and endurance.",
      Trained: "Solid single-leg strength-endurance profile for most field and mountain demands.",
      Advanced: "High unilateral control and endurance. Emphasize transfer to high-load and reactive tasks.",
      Elite: "Exceptional 30-second single-leg squat capacity. Maintain quality while progressing sport-specific complexity."
    };

    return {
      currentValue: "Current score: " + valueWithUnit,
      rating: "Rating: " + rating,
      range:
        "Reference: " +
        (bands.sex === "male" ? "Men" : "Women") +
        " 30s norms - Developing <" +
        bands.recreationalLow +
        ", Recreational " +
        bands.recreationalLow +
        "-" +
        bands.recreationalHigh +
        ", Trained " +
        bands.trainedLow +
        "-" +
        bands.trainedHigh +
        ", Advanced " +
        bands.advancedLow +
        "-" +
        bands.advancedHigh +
        ", Elite " +
        bands.eliteLow +
        "+ reps.",
      meaning: "Meaning: " + (meaningByRating[rating] || "Interpret with training context and trend direction.")
    };
  }

  function buildSingleLegSquatPairedBenchmarkSummary(metric, valueWithUnit) {
    var pair = metric && metric._pairedSideMetrics ? metric._pairedSideMetrics : null;
    if (!pair || !pair.left || !pair.right) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add both left and right values to unlock benchmark comparison.",
        range:
          "Reference: 30-second Single-Leg Squat uses sex-specific rep bands for Developing to Elite.",
        meaning:
          "Meaning: Enter both left and right rep counts so the card can compare each side against the normative table."
      };
    }

    var left = parseSingleLegSquatLegValues(pair.left.metric_value || "").left;
    var right = parseSingleLegSquatLegValues(pair.right.metric_value || "").right;
    var sex = resolveAthleteSexForBenchmarks();
    var bands = getSingleLegSquatNormBandForSex(sex);

    if (left === null || right === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add both left and right values to unlock benchmark comparison.",
        range:
          "Reference: 30-second Single-Leg Squat uses sex-specific rep bands for Developing to Elite.",
        meaning:
          "Meaning: Enter both left and right rep counts so the card can compare each side against the normative table."
      };
    }

    if (!bands) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men: Developing <12, Recreational 12-16, Trained 17-21, Advanced 22-26, Elite 27+. " +
          "Women: Developing <10, Recreational 10-14, Trained 15-19, Advanced 20-24, Elite 25+.",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply Single-Leg Squat normative values."
      };
    }

    var leftRating = classifySingleLegSquatReps(left, bands);
    var rightRating = classifySingleLegSquatReps(right, bands);
    var lowerLegScore = Math.min(left, right);
    var combinedRating = classifySingleLegSquatReps(lowerLegScore, bands);
    var symmetry = calculateSymmetryPercent(left, right);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";

    return {
      currentValue:
        "Current score: L Leg " +
        formatMetricDisplayValue(left, metric && metric.metric_unit) +
        " | R Leg " +
        formatMetricDisplayValue(right, metric && metric.metric_unit) +
        " | Symmetry " + symmetryText,
      rating: "Rating: " + combinedRating + " (Left: " + leftRating + ", Right: " + rightRating + ")",
      range:
        "Reference: Men: Developing <12, Recreational 12-16, Trained 17-21, Advanced 22-26, Elite 27+. " +
        "Women: Developing <10, Recreational 10-14, Trained 15-19, Advanced 20-24, Elite 25+.",
      meaning:
        "Meaning: Compare left and right squat capacity, then use the lower score for classification. " +
        (symmetry !== null ? (symmetry >= 95 ? "Symmetry is strong." : "Monitor side-to-side asymmetry.") : "")
    };
  }

  function buildSingleLegHeelRaisePairedBenchmarkSummary(metric, valueWithUnit) {
    var pair = metric && metric._pairedSideMetrics ? metric._pairedSideMetrics : null;
    if (!pair || !pair.left || !pair.right) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add both left and right values to unlock benchmark comparison.",
        range:
          "Reference: Single-leg heel raise uses sex-specific rep bands for Developing to Elite.",
        meaning:
          "Meaning: Enter both left and right rep counts so the card can compare each side against the normative table."
      };
    }

    var left = parseSingleLegSquatLegValues(pair.left.metric_value || "").left;
    var right = parseSingleLegSquatLegValues(pair.right.metric_value || "").right;
    var sex = resolveAthleteSexForBenchmarks();
    var bands = getSingleLegHeelRaiseNormBandForSex(sex);

    if (left === null || right === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add both left and right values to unlock benchmark comparison.",
        range:
          "Reference: Single-leg heel raise uses sex-specific rep bands for Developing to Elite.",
        meaning:
          "Meaning: Enter both left and right rep counts so the card can compare each side against the normative table."
      };
    }

    if (!bands) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men: Developing <20, Recreational 20-30, Trained 31-40, Advanced 41-50, Elite 51+. " +
          "Women: Developing <18, Recreational 18-28, Trained 29-38, Advanced 39-48, Elite 49+.",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply Single-Leg Heel Raise normative values."
      };
    }

    var leftRating = classifySingleLegHeelRaiseReps(left, bands);
    var rightRating = classifySingleLegHeelRaiseReps(right, bands);
    var lowerLegScore = Math.min(left, right);
    var combinedRating = classifySingleLegHeelRaiseReps(lowerLegScore, bands);
    var symmetry = calculateSymmetryPercent(left, right);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";

    return {
      currentValue:
        "Current score: L Leg " +
        formatMetricDisplayValue(left, metric && metric.metric_unit) +
        " | R Leg " +
        formatMetricDisplayValue(right, metric && metric.metric_unit) +
        " | Symmetry " + symmetryText,
      rating: "Rating: " + combinedRating + " (Left: " + leftRating + ", Right: " + rightRating + ")",
      range:
        "Reference: Men: Developing <20, Recreational 20-30, Trained 31-40, Advanced 41-50, Elite 51+. " +
        "Women: Developing <18, Recreational 18-28, Trained 29-38, Advanced 39-48, Elite 49+.",
      meaning:
        "Meaning: Compare left and right heel raise capacity, then use the lower score for classification. " +
        (symmetry !== null ? (symmetry >= 95 ? "Symmetry is strong." : "Monitor side-to-side asymmetry.") : "")
    };
  }

  function buildSidePlankPairedBenchmarkSummary(metric, valueWithUnit) {
    var pair = metric && metric._pairedSideMetrics ? metric._pairedSideMetrics : null;
    if (!pair || !pair.left || !pair.right) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add both left and right values to unlock benchmark comparison.",
        range:
          "Reference: Side plank with hip abduction uses sex-specific hold-time bands for Developing to Elite.",
        meaning:
          "Meaning: Enter both left and right hold times so the card can compare each side against the normative table."
      };
    }

    var left = parseNumericMetricValue(pair.left.metric_value || "");
    var right = parseNumericMetricValue(pair.right.metric_value || "");
    var sex = resolveAthleteSexForBenchmarks();
    var bands = getSidePlankNormBandForSex(sex);

    if (left === null || right === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add both left and right values to unlock benchmark comparison.",
        range:
          "Reference: Side plank with hip abduction uses sex-specific hold-time bands for Developing to Elite.",
        meaning:
          "Meaning: Enter both left and right hold times so the card can compare each side against the normative table."
      };
    }

    if (!bands) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men: Developing <20, Recreational 20-35, Trained 35-50, Advanced 50-70, Elite 70+. " +
          "Women: Developing <15, Recreational 15-30, Trained 30-45, Advanced 45-60, Elite 60+.",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply Side Plank + Hip Abduction normative values."
      };
    }

    var leftRating = classifySidePlankHoldTime(left, bands);
    var rightRating = classifySidePlankHoldTime(right, bands);
    var lowerHoldTime = Math.min(left, right);
    var combinedRating = classifySidePlankHoldTime(lowerHoldTime, bands);
    var symmetry = calculateSymmetryPercent(left, right);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";

    return {
      currentValue:
        "Current score: L Leg " +
        formatMetricDisplayValue(left, metric && metric.metric_unit) +
        " | R Leg " +
        formatMetricDisplayValue(right, metric && metric.metric_unit) +
        " | Symmetry " + symmetryText,
      rating: "Rating: " + combinedRating + " (Left: " + leftRating + ", Right: " + rightRating + ")",
      range:
        "Reference: Men: Developing <20, Recreational 20-35, Trained 35-50, Advanced 50-70, Elite 70+. " +
        "Women: Developing <15, Recreational 15-30, Trained 30-45, Advanced 45-60, Elite 60+.",
      meaning:
        "Meaning: Compare left and right side plank hold capacity, then use the lower hold time for classification. " +
        (symmetry !== null ? (symmetry >= 95 ? "Symmetry is strong." : "Monitor side-to-side asymmetry.") : "")
    };
  }

  function buildYBalancePairedBenchmarkSummary(metric, valueWithUnit) {
    var pair = metric && metric._pairedSideMetrics ? metric._pairedSideMetrics : null;
    if (!pair || !pair.left || !pair.right) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add both left and right values to unlock benchmark comparison.",
        range:
          "Reference: Y Balance anterior reach uses sex-specific normalized reach categories (% leg length) for Developing to Elite Control.",
        meaning:
          "Meaning: Enter both left and right values to evaluate side-to-side balance and normative level."
      };
    }

    var leftRaw = parseNumericMetricValue(pair.left.metric_value || "");
    var rightRaw = parseNumericMetricValue(pair.right.metric_value || "");
    var unit = normalizeMetricValue(metric && metric.metric_unit);
    var sex = resolveAthleteSexForBenchmarks();
    var band = getYBalanceNormBandForSex(sex);
    var heightCm = getAthleteHeightCmForBenchmarks();
    var legLengthCm = heightCm ? calculateLegLengthCm(heightCm) : null;

    function toNormalizedPercent(rawValue) {
      if (!Number.isFinite(rawValue)) {
        return null;
      }
      if (unit.indexOf("%") !== -1 || !unit) {
        return rawValue;
      }
      if (Number.isFinite(legLengthCm) && legLengthCm > 0) {
        var reachCm = convertLengthToCm(rawValue, unit);
        if (Number.isFinite(reachCm)) {
          return (reachCm / legLengthCm) * 100;
        }
      }
      return null;
    }

    var leftPercent = toNormalizedPercent(leftRaw);
    var rightPercent = toNormalizedPercent(rightRaw);
    if (leftPercent === null || rightPercent === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing data for leg-length normalization.",
        range:
          "Reference: Y Balance norms are based on normalized anterior reach (% leg length).",
        meaning:
          "Meaning: Enter athlete height so leg length can be estimated (height x 0.53), or store values directly as % leg length."
      };
    }

    if (!band) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men: Developing <60%, Recreational 60-65%, Trained 65-72%, Advanced 72-78%, Elite >78%. " +
          "Women: Developing <65%, Recreational 65-70%, Trained 70-77%, Advanced 77-83%, Elite >83%.",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply Y Balance normative values."
      };
    }

    var leftRating = classifyYBalanceReach(leftPercent, band);
    var rightRating = classifyYBalanceReach(rightPercent, band);
    var lowerReachPercent = Math.min(leftPercent, rightPercent);
    var combinedRating = classifyYBalanceReach(lowerReachPercent, band);
    var symmetry = calculateSymmetryPercent(leftPercent, rightPercent);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";

    return {
      currentValue:
        "Current score: L Leg " +
        formatMetricDisplayValue(leftRaw, metric && metric.metric_unit) +
        " | R Leg " +
        formatMetricDisplayValue(rightRaw, metric && metric.metric_unit) +
        " | Symmetry " + symmetryText,
      rating: "Rating: " + combinedRating + " (Left: " + leftRating + ", Right: " + rightRating + ")",
      range:
        "Reference: " +
        (band.sex === "male" ? "Men" : "Women") +
        " anterior reach norms - Developing <" +
        band.developingHigh +
        "%, Recreational " +
        band.recreationalLow +
        "-" +
        band.recreationalHigh +
        "%, Trained " +
        band.trainedLow +
        "-" +
        band.trainedHigh +
        "%, Advanced " +
        band.advancedLow +
        "-" +
        band.advancedHigh +
        "%, Elite >" +
        band.eliteLow +
        "%.",
      meaning:
        "Meaning: Compare left and right normalized reach, then use the lower side for classification. " +
        (symmetry !== null ? (symmetry >= 95 ? "Symmetry is strong." : "Monitor side-to-side asymmetry.") : "")
    };
  }

  function buildEdgePullPairedBenchmarkSummary(metric, valueWithUnit) {
    var pair = metric && metric._pairedSideMetrics ? metric._pairedSideMetrics : null;
    if (!pair || !pair.left || !pair.right) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add both left and right values to unlock benchmark comparison.",
        range:
          "Reference: 20mm Edge Pull (single-arm) uses sex-specific relative load ranges (% bodyweight).",
        meaning:
          "Meaning: Enter both left and right hand edge pull values so the card can compare each side against the normative table."
      };
    }

    var leftRaw = parseNumericMetricValue(pair.left.metric_value || "");
    var rightRaw = parseNumericMetricValue(pair.right.metric_value || "");
    var unit = normalizeMetricValue(metric && metric.metric_unit);
    var sex = resolveAthleteSexForBenchmarks();
    var band = getEdgePullNormBandForSex(sex);
    var weightKg = getAthleteWeightKgForBenchmarks();

    if (leftRaw === null || rightRaw === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add both left and right values to unlock benchmark comparison.",
        range:
          "Reference: 20mm Edge Pull (single-arm) uses sex-specific relative load ranges (% bodyweight).",
        meaning:
          "Meaning: Enter both left and right hand edge pull values so the card can compare each side against the normative table."
      };
    }

    if (!band) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men - Developing <0.6x BW, Recreational 0.6-0.75x, Trained 0.75-0.9x, Advanced 0.9-1.05x, Elite >1.05x. " +
          "Women - Developing <0.55x BW, Recreational 0.55-0.7x, Trained 0.7-0.85x, Advanced 0.85-1.0x, Elite >1.0x (single-arm hang).",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply the 20mm Edge Pull normative table."
      };
    }

    function toRelativeLoad(value) {
      if (!Number.isFinite(value)) {
        return null;
      }

      if (unit.indexOf("%") !== -1) {
        return value;
      }

      if (!Number.isFinite(weightKg) || weightKg <= 0) {
        return null;
      }

      var loadKg = convertMassToKg(value, unit);
      if (!Number.isFinite(loadKg)) {
        return null;
      }

      return (loadKg / weightKg) * 100;
    }

    var leftRelative = toRelativeLoad(leftRaw);
    var rightRelative = toRelativeLoad(rightRaw);

    if (leftRelative === null || rightRelative === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing bodyweight for relative-load comparison.",
        range:
          "Reference: Relative load is calculated as (edge pull load / bodyweight) x 100.",
        meaning:
          "Meaning: Enter athlete weight in profile and record edge pull in kg or lbs (or store values directly as %BW)."
      };
    }

    var leftRating = classifyEdgePullRelativeLoad(leftRelative, band);
    var rightRating = classifyEdgePullRelativeLoad(rightRelative, band);
    var lowerSideRelative = Math.min(leftRelative, rightRelative);
    var combinedRating = classifyEdgePullRelativeLoad(lowerSideRelative, band);
    var symmetry = calculateSymmetryPercent(leftRelative, rightRelative);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";

    return {
      currentValue:
        "Current score: L Hand " +
        formatMetricDisplayValue(leftRaw, metric && metric.metric_unit) +
        " | R Hand " +
        formatMetricDisplayValue(rightRaw, metric && metric.metric_unit) +
        " | Symmetry " + symmetryText,
      rating: "Rating: " + combinedRating + " (Left: " + leftRating + ", Right: " + rightRating + ")",
      range:
        "Reference: " +
        (band.sex === "male"
          ? "Men"
          : "Women") +
        " Developing <" + band.developingHigh + "% (" + formatMetricNumber(band.developingHigh / 100) + "x BW) | Recreational " +
        band.recreationalLow + "-" + band.recreationalHigh + "% (" + formatMetricNumber(band.recreationalLow / 100) + "-" + formatMetricNumber(band.recreationalHigh / 100) + "x) | Trained " +
        band.trainedLow + "-" + band.trainedHigh + "% (" + formatMetricNumber(band.trainedLow / 100) + "-" + formatMetricNumber(band.trainedHigh / 100) + "x) | Advanced " +
        band.advancedLow + "-" + band.advancedHigh + "% (" + formatMetricNumber(band.advancedLow / 100) + "-" + formatMetricNumber(band.advancedHigh / 100) + "x) | Elite >" + band.eliteLow + "% (" + formatMetricNumber(band.eliteLow / 100) + "x).",
      meaning:
        "Meaning: Compare left and right hand relative edge-force output, then use the lower side for classification. " +
        (symmetry !== null ? (symmetry >= 95 ? "Symmetry is strong." : "Monitor side-to-side asymmetry.") : "")
    };
  }

  function classifySingleLegSquatReps(reps, bands) {
    if (!Number.isFinite(reps) || !bands) {
      return "Needs Data";
    }
    if (reps < bands.recreationalLow) {
      return "Developing";
    }
    if (reps <= bands.recreationalHigh) {
      return "Recreational";
    }
    if (reps <= bands.trainedHigh) {
      return "Trained";
    }
    if (reps <= bands.advancedHigh) {
      return "Advanced";
    }
    return "Elite";
  }

  function getSingleLegSquatNormBandForSex(sex) {
    if (!sex) {
      return null;
    }

    var table = {
      male: {
        sex: "male",
        recreationalLow: 12,
        recreationalHigh: 16,
        trainedLow: 17,
        trainedHigh: 21,
        advancedLow: 22,
        advancedHigh: 26,
        eliteLow: 27
      },
      female: {
        sex: "female",
        recreationalLow: 10,
        recreationalHigh: 14,
        trainedLow: 15,
        trainedHigh: 19,
        advancedLow: 20,
        advancedHigh: 24,
        eliteLow: 25
      }
    };

    return table[sex] || null;
  }

  function classifySingleLegHeelRaiseReps(reps, bands) {
    if (!Number.isFinite(reps) || !bands) {
      return "Needs Data";
    }
    if (reps < bands.recreationalLow) {
      return "Developing";
    }
    if (reps <= bands.recreationalHigh) {
      return "Recreational";
    }
    if (reps <= bands.trainedHigh) {
      return "Trained";
    }
    if (reps <= bands.advancedHigh) {
      return "Advanced";
    }
    return "Elite";
  }

  function getSingleLegHeelRaiseNormBandForSex(sex) {
    if (!sex) {
      return null;
    }

    var table = {
      male: {
        sex: "male",
        recreationalLow: 20,
        recreationalHigh: 30,
        trainedLow: 31,
        trainedHigh: 40,
        advancedLow: 41,
        advancedHigh: 50,
        eliteLow: 51
      },
      female: {
        sex: "female",
        recreationalLow: 18,
        recreationalHigh: 28,
        trainedLow: 29,
        trainedHigh: 38,
        advancedLow: 39,
        advancedHigh: 48,
        eliteLow: 49
      }
    };

    return table[sex] || null;
  }

  function classifySidePlankHoldTime(seconds, band) {
    if (!Number.isFinite(seconds) || !band) {
      return "Needs Data";
    }
    if (seconds < band.developingHigh) {
      return "Developing";
    }
    if (seconds <= band.recreationalHigh) {
      return "Recreational";
    }
    if (seconds <= band.trainedHigh) {
      return "Trained";
    }
    if (seconds <= band.advancedHigh) {
      return "Advanced";
    }
    return "Elite";
  }

  function getSidePlankNormBandForSex(sex) {
    if (!sex) {
      return null;
    }

    var table = {
      male: {
        sex: "male",
        developingHigh: 20,
        recreationalLow: 20,
        recreationalHigh: 35,
        trainedLow: 35,
        trainedHigh: 50,
        advancedLow: 50,
        advancedHigh: 70,
        eliteLow: 70
      },
      female: {
        sex: "female",
        developingHigh: 15,
        recreationalLow: 15,
        recreationalHigh: 30,
        trainedLow: 30,
        trainedHigh: 45,
        advancedLow: 45,
        advancedHigh: 60,
        eliteLow: 60
      }
    };

    return table[sex] || null;
  }

  function classifyMaxPullUpReps(reps, band) {
    if (!Number.isFinite(reps) || !band) {
      return "Needs Data";
    }
    if (reps < band.recreationalLow) {
      return "Developing";
    }
    if (reps <= band.recreationalHigh) {
      return "Recreational";
    }
    if (reps <= band.trainedHigh) {
      return band.trainedLabel || "Trained";
    }
    if (reps <= band.advancedHigh) {
      return "Advanced";
    }
    return "Elite";
  }

  function getMaxPullUpNormBandForSex(sex) {
    if (!sex) {
      return null;
    }

    var isClimber = isAthleteClimber();

    if (isClimber) {
      var climberTable = {
        male: {
          sex: "male",
          sport: "climber",
          recreationalLow: 8,
          recreationalHigh: 12,
          trainedLow: 12,
          trainedHigh: 18,
          trainedLabel: "Strong Intermediate",
          advancedLow: 18,
          advancedHigh: 25,
          eliteLow: 25
        },
        female: {
          sex: "female",
          sport: "climber",
          recreationalLow: 3,
          recreationalHigh: 6,
          trainedLow: 6,
          trainedHigh: 10,
          trainedLabel: "Strong Intermediate",
          advancedLow: 10,
          advancedHigh: 15,
          eliteLow: 15
        }
      };
      return climberTable[sex] || null;
    }

    var generalTable = {
      male: {
        sex: "male",
        sport: "general",
        recreationalLow: 4,
        recreationalHigh: 7,
        trainedLow: 8,
        trainedHigh: 12,
        trainedLabel: "Trained",
        advancedLow: 13,
        advancedHigh: 18,
        eliteLow: 19
      },
      female: {
        sex: "female",
        sport: "general",
        recreationalLow: 1,
        recreationalHigh: 3,
        trainedLow: 4,
        trainedHigh: 7,
        trainedLabel: "Trained",
        advancedLow: 8,
        advancedHigh: 12,
        eliteLow: 13
      }
    };

    return generalTable[sex] || null;
  }

  function isAthleteClimber() {
    var profile = state.profile || {};
    var sport = String(profile.sport || "").toLowerCase();
    if (sport.indexOf("climb") !== -1) {
      return true;
    }

    var sports = profile.sports || [];
    if (Array.isArray(sports)) {
      for (var i = 0; i < sports.length; i++) {
        if (String(sports[i] || "").toLowerCase().indexOf("climb") !== -1) {
          return true;
        }
      }
    }

    var overview = getProfileSportOverview(profile);
    if (overview && overview.climbing) {
      return true;
    }

    return false;
  }

  function buildMaxPullUpBenchmarkSummary(metric, numericValue, valueWithUnit) {
    var sex = resolveAthleteSexForBenchmarks();
    var band = getMaxPullUpNormBandForSex(sex);

    if (numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to unlock benchmark comparison.",
        range:
          "Reference: Max Pull Up uses sex-specific rep bands for Developing to Elite (general or climbing-specific norms).",
        meaning:
          "Meaning: Enter max reps from a standardized pull-up test. Climbing athletes will see climbing-specific benchmarks if sport is set to climbing."
      };
    }

    if (!band) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men General: Developing 0-3, Recreational 4-7, Trained 8-12, Advanced 13-18, Elite 19+. " +
          "Women General: Developing 0, Recreational 1-3, Trained 4-7, Advanced 8-12, Elite 13+. " +
          "(Climbing norms available if sport includes climbing.)",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply Max Pull Up normative values."
      };
    }

    var rating = classifyMaxPullUpReps(numericValue, band);
    var isClimber = band.sport === "climber";
    var sportLabel = isClimber ? "Climber" : "General Athlete";
    var meaningByRating = {
      Developing: "Pull-up capacity is limited. Build foundational upper-body strength and scapular stability with assisted progressions.",
      Recreational: "Foundational pull-up strength is present. Continue gradual load increases with quality form focus.",
      "Trained": "Solid pull-up capacity for general fitness. Progress with added load or volume variation.",
      "Strong Intermediate": "Strong intermediate climbing pull-up profile. Emphasize power endurance and dynamic lock-off strength.",
      Advanced: "High pull-up strength baseline. Continue progressive overload while maintaining movement quality.",
      Elite: "Exceptional pull-up performance. Focus on sport-specific transfer and maintaining quality under fatigue."
    };

    var minReps = band.recreationalLow;
    var maxReps = band.advancedHigh;

    return {
      currentValue: "Current score: " + valueWithUnit,
      rating: "Rating: " + rating,
      range:
        "Reference: " +
        sportLabel +
        " (" +
        (band.sex === "male" ? "Men" : "Women") +
        ") - Developing <" +
        minReps +
        ", Recreational " +
        band.recreationalLow +
        "-" +
        band.recreationalHigh +
        ", " +
        (band.trainedLabel || "Trained") +
        " " +
        band.trainedLow +
        "-" +
        band.trainedHigh +
        ", Advanced " +
        band.advancedLow +
        "-" +
        band.advancedHigh +
        ", Elite " +
        band.eliteLow +
        "+ reps.",
      meaning: "Meaning: " + (meaningByRating[rating] || "Interpret with training context and trend direction.")
    };
  }

  function buildMaxHangBenchmarkSummary(metric, numericValue, valueWithUnit) {
    if (numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to unlock benchmark comparison.",
        range:
          "Reference: Bodyweight Dead Hang norms - Beginner 10-30s, Intermediate 30-90s, Advanced 90-150s, Elite 3-5 minutes.",
        meaning:
          "Meaning: Enter max dead-hang time in seconds from a standardized bodyweight test on a straight bar."
      };
    }

    var rating = classifyMaxHangTime(numericValue);
    var meaningByRating = {
      "Below Beginner": "Foundational hang capacity is limited. Build grip endurance and tendon tolerance progressively.",
      Beginner: "Baseline hang endurance is present. Continue progressive dead-hang exposure and recovery management.",
      Intermediate: "Solid hang endurance profile. Progress toward longer isometric tolerance and climbing-specific transfer.",
      Advanced: "High dead-hang endurance. Emphasize quality under fatigue and route-specific grip demands.",
      Elite: "Exceptional dead-hang endurance. Focus on performance transfer, resilience, and maintaining tissue health."
    };

    return {
      currentValue: "Current score: " + valueWithUnit,
      rating: "Rating: " + rating,
      range:
        "Reference: Bodyweight Dead Hang norms - Beginner 10-30s, Intermediate 30-90s, Advanced 90-150s, Elite 180-300s (3-5 min).",
      meaning: "Meaning: " + (meaningByRating[rating] || "Interpret with training context and trend direction.")
    };
  }

  function classifyMaxHangTime(seconds) {
    if (!Number.isFinite(seconds)) {
      return "Needs Data";
    }
    if (seconds < 10) {
      return "Below Beginner";
    }
    if (seconds <= 30) {
      return "Beginner";
    }
    if (seconds <= 90) {
      return "Intermediate";
    }
    if (seconds <= 150) {
      return "Advanced";
    }
    return "Elite";
  }

  function classifyHanging90DegreeHoldTime(seconds, band) {
    if (!Number.isFinite(seconds) || !band) {
      return "Needs Data";
    }
    if (seconds < band.developingHigh) {
      return "Developing";
    }
    if (seconds <= band.recreationalHigh) {
      return "Recreational";
    }
    if (seconds <= band.trainedHigh) {
      return "Trained";
    }
    if (seconds <= band.advancedHigh) {
      return "Advanced";
    }
    return "Elite";
  }

  function getHanging90DegreeNormBandForSex(sex) {
    if (!sex) {
      return null;
    }

    var table = {
      male: {
        sex: "male",
        developingHigh: 15,
        recreationalLow: 15,
        recreationalHigh: 30,
        trainedLow: 30,
        trainedHigh: 50,
        advancedLow: 50,
        advancedHigh: 75,
        eliteLow: 75
      },
      female: {
        sex: "female",
        developingHigh: 10,
        recreationalLow: 10,
        recreationalHigh: 25,
        trainedLow: 25,
        trainedHigh: 40,
        advancedLow: 40,
        advancedHigh: 60,
        eliteLow: 60
      }
    };

    return table[sex] || null;
  }

  function buildHanging90DegreeHoldBenchmarkSummary(metric, numericValue, valueWithUnit) {
    var sex = resolveAthleteSexForBenchmarks();
    var band = getHanging90DegreeNormBandForSex(sex);

    if (numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to unlock benchmark comparison.",
        range:
          "Reference: Hanging 90° Hip-Flexion Hold uses sex-specific hold-time bands (seconds) for Developing to Elite.",
        meaning:
          "Meaning: Enter hold time in seconds from a standardized Hanging 90° test (hips flexed to 90°, core engaged until form breakdown)."
      };
    }

    if (!band) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men: Developing <15, Recreational 15-30, Trained 30-50, Advanced 50-75, Elite 75+. " +
          "Women: Developing <10, Recreational 10-25, Trained 25-40, Advanced 40-60, Elite 60+ (all in seconds).",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply Hanging 90° Hip-Flexion Hold normative values."
      };
    }

    var rating = classifyHanging90DegreeHoldTime(numericValue, band);
    var meaningByRating = {
      Developing: "Hip flexor and core endurance is limited. Build abdominal strength and hip flexor stamina with progressive holds and variations.",
      Recreational: "Foundational core and hip flexor endurance is present. Continue progressing hold time with controlled movement.",
      Trained: "Solid core-hip integration and endurance. Progress with added challenge (leg raises, tempo variation).",
      Advanced: "High hip flexor endurance and core stability. Emphasize quality and transfer to sport-specific demands.",
      Elite: "Exceptional Hanging 90° hold capacity. Maintain quality while progressing sport-specific core integration."
    };

    return {
      currentValue: "Current score: " + valueWithUnit,
      rating: "Rating: " + rating,
      range:
        "Reference: " +
        (band.sex === "male" ? "Men" : "Women") +
        " hold-time norms - Developing <" +
        band.developingHigh +
        "s, Recreational " +
        band.recreationalLow +
        "-" +
        band.recreationalHigh +
        "s, Trained " +
        band.trainedLow +
        "-" +
        band.trainedHigh +
        "s, Advanced " +
        band.advancedLow +
        "-" +
        band.advancedHigh +
        "s, Elite " +
        band.eliteLow +
        "+ seconds.",
      meaning: "Meaning: " + (meaningByRating[rating] || "Interpret with training context and trend direction.")
    };
  }

  function buildCountermovementPushUpBenchmarkSummary(metric, numericValue, valueWithUnit) {
    if (numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to log CMPU performance.",
        range:
          "Reference: CMPU is primarily an explosive power assessment using stretch-shortening cycle mechanics; use consistent setup and compare trend over time.",
        meaning:
          "Meaning: The Countermovement Push-Up (CMPU) is a plyometric upper-extremity power test. Perform a rapid, controlled descent from plank, then immediately reverse into a maximal-effort explosive push (often with hand lift-off) to maximize vertical velocity."
      };
    }

    return {
      currentValue: "Current score: " + valueWithUnit,
      rating: "Rating: Performance recorded. Track repeated-test trend and output quality.",
      range:
        "Reference: CMPU assesses upper-limb neuromuscular force-time qualities (peak force, velocity, and power output) under plyometric SSC demand.",
      meaning:
        "Meaning: Use this as an explosive upper-extremity power marker: rapid controlled lowering followed by immediate maximal push. Keep technique and testing setup standardized to make sessions comparable."
    };
  }

  function buildCkcuestBenchmarkSummary(metric, numericValue, valueWithUnit) {
    var sex = resolveAthleteSexForBenchmarks();
    var rating = "Needs Data";

    if (Number.isFinite(numericValue)) {
      if (numericValue < 21) {
        rating = "Below Passing";
      } else if (numericValue < 26) {
        rating = "Passing";
      } else {
        rating = "Strong";
      }
    }

    var sexNormLine =
      sex === "male"
        ? "Sex-specific context: men in some athletic cohorts average around 26 touches."
        : sex === "female"
        ? "Sex-specific context: women in some athletic cohorts average around 22 touches."
        : "Sex-specific context: reported athletic averages are ~26 touches (men) and ~22 touches (women).";

    if (numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score (average touches across trials) to benchmark CKCUEST.",
        range:
          "Reference: CKCUEST is a 15-second shoulder stability/endurance test; >=21 touches is commonly used as a pass threshold in many contexts.",
        meaning:
          "Meaning: Closed Kinetic Chain Upper Extremity Stability Test (CKCUEST): from push-up/plank position with hands on two tape marks 36 inches (91 cm) apart, alternate opposite-hand taps for max touches in 15 seconds. Use one warm-up then three 15-second trials with 45-60 seconds rest; score is average touches."
      };
    }

    return {
      currentValue: "Current score: " + valueWithUnit,
      rating: "Rating: " + rating,
      range:
        "Reference: CKCUEST protocol uses 3 scored 15-second trials (after warm-up), 45-60s rest, hands 36 in / 91 cm apart. " +
        "Common pass benchmark is >=21 touches. " +
        sexNormLine,
      meaning:
        "Meaning: CKCUEST measures shoulder stability, strength, and endurance for return-to-sport decision-making (especially overhead athletes). Consider averaging three trials and optionally normalizing by athlete height or deriving power from bodyweight."
    };
  }

  function classifyAdaptedGrantFootRaise(normalizedScore) {
    if (!Number.isFinite(normalizedScore)) {
      return "Needs Data";
    }
    if (normalizedScore < 0.90) {
      return "Novice";
    }
    if (normalizedScore < 0.97) {
      return "Intermediate";
    }
    if (normalizedScore < 1.00) {
      return "Advanced";
    }
    return "Elite";
  }

  function getAdaptedGrantFootRaiseNormBand() {
    return {
      noviceCm: 103.7,
      intermediateLow: 108,
      intermediateHigh: 110,
      advancedLow: 111,
      advancedHigh: 113,
      eliteCm: 114,
      noviceNormalized: 0.90,
      intermediateNormalized: 0.97,
      advancedNormalized: 1.00,
      eliteNormalized: 1.01
    };
  }

  function calculateLegLengthCm(heightCm) {
    if (!Number.isFinite(heightCm) || heightCm <= 0) {
      return null;
    }
    return heightCm * 0.53;
  }

  function buildAdaptedGrantFootRaiseBenchmarkSummary(metric, numericValue, valueWithUnit) {
    var heightCm = getAthleteHeightCmForBenchmarks();
    var legLengthCm = heightCm ? calculateLegLengthCm(heightCm) : null;
    var unit = normalizeMetricValue(metric && metric.metric_unit);
    var reachCm = numericValue === null ? null : convertLengthToCm(numericValue, unit);
    var normalizedScore = null;

     var metricValue = String(metric && metric.metric_value || "").trim();
     var isBilateral = metricValue.indexOf("|") !== -1;
     var parsedGrant = isBilateral ? parseGrantLegValues(metricValue) : { left: null, right: null };

     if (isBilateral && (parsedGrant.left !== null || parsedGrant.right !== null)) {
       // Handle bilateral leg values
       var leftReachCm = parsedGrant.left !== null ? convertLengthToCm(parsedGrant.left, unit) : null;
       var rightReachCm = parsedGrant.right !== null ? convertLengthToCm(parsedGrant.right, unit) : null;

       if (legLengthCm === null) {
         return {
           currentValue: "Current score: " + valueWithUnit,
           rating: "Rating: Missing athlete height for normalization.",
           range:
             "Reference: Climbing norms (normalized): Novice ~104cm, Intermediate ~108-110cm, Advanced ~111-113cm, Elite ~114cm. " +
             "Normalized using leg length (height × 0.53).",
           meaning:
             "Meaning: Set athlete height (height_cm) in profile. Normalized score = Foot Raise Height ÷ Leg Length. Taller athletes naturally reach higher but normalized values compare fairly."
         };
       }

       var leftNormalized = leftReachCm !== null ? leftReachCm / legLengthCm : null;
       var rightNormalized = rightReachCm !== null ? rightReachCm / legLengthCm : null;
       var leftRating = leftNormalized !== null ? classifyAdaptedGrantFootRaise(leftNormalized) : "—";
       var rightRating = rightNormalized !== null ? classifyAdaptedGrantFootRaise(rightNormalized) : "—";

       return {
         currentValue:
           "Current score: " +
           valueWithUnit +
           " | L Normalized: " +
           (leftNormalized ? formatMetricNumber(leftNormalized) : "—") +
           " | R Normalized: " +
           (rightNormalized ? formatMetricNumber(rightNormalized) : "—"),
         rating: "Ratings - Left: " + leftRating + ", Right: " + rightRating,
         range:
           "Reference: Climbing norms (normalized by leg length) - Novice <0.90, Intermediate 0.90-0.97, Advanced 0.97-1.00, Elite 1.00+. " +
           "Raw norms: Novice ~104cm, Intermediate ~108-110cm, Advanced ~111-113cm, Elite 114cm.",
         meaning:
           "Meaning: Bilateral tracking reveals leg asymmetry. Compare L vs R normalized scores to identify imbalances. " +
           "Use trend over time and asymmetry data to guide training."
       };
     }

     if (reachCm !== null && legLengthCm !== null) {
       normalizedScore = reachCm / legLengthCm;
    }

    if (reachCm === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to unlock benchmark comparison.",
        range:
          "Reference: Adapted Grant Foot Raise uses leg-length normalized climbing norms (Novice to Elite). " +
          "Normalization formula: Reach Height ÷ Leg Length.",
        meaning:
          "Meaning: Enter foot raise height in cm or inches. Athlete height is required for normalization. Climbing-specific norms will apply."
      };
    }

    if (!legLengthCm) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete height for normalization.",
        range:
          "Reference: Climbing norms (normalized): Novice ~104cm, Intermediate ~108-110cm, Advanced ~111-113cm, Elite ~114cm. " +
          "Normalized using leg length (height × 0.53).",
        meaning:
          "Meaning: Set athlete height (height_cm) in profile. Normalized score = Foot Raise Height ÷ Leg Length. Taller athletes naturally reach higher but normalized values compare fairly."
      };
    }

    var band = getAdaptedGrantFootRaiseNormBand();
    var rating = classifyAdaptedGrantFootRaise(normalizedScore);
    var meaningByRating = {
      Novice: "Reaching baseline for climbing. Build leg length awareness and work on reach mechanics with flexibility training.",
      Intermediate: "Solid reaching capacity for intermediate climbing demands. Progress with targeted hip mobility and reach-specific strength.",
      Advanced: "High reaching capacity for advanced climbing movement. Emphasize locked-off reach and dynamic positioning.",
      Elite: "Exceptional leg reach for elite climbing. Maintain quality and refine micro-adjustments for maximal reach utilization."
    };

    return {
      currentValue:
        "Current score: " +
        valueWithUnit +
        " | Normalized: " +
        (normalizedScore ? formatMetricNumber(normalizedScore) : "—"),
      rating: "Rating: " + rating,
      range:
        "Reference: Climbing norms (normalized by leg length) - Novice <0.90, Intermediate 0.90-0.97, Advanced 0.97-1.00, Elite 1.00+. " +
        "Raw norms: Novice ~104cm, Intermediate ~108-110cm, Advanced ~111-113cm, Elite 114cm.",
      meaning:
        "Meaning: " +
        (meaningByRating[rating] || "Interpret with training context and trend direction.") +
        " Normalized scoring accounts for natural height variation."
    };
  }

  function buildSidePlankBenchmarkSummary(metric, numericValue, valueWithUnit) {
    var sex = resolveAthleteSexForBenchmarks();
    var band = getSidePlankNormBandForSex(sex);

    if (numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to unlock benchmark comparison.",
        range:
          "Reference: Side Plank + Hip Abduction uses sex-specific hold-time bands (seconds) for Developing to Elite.",
        meaning:
          "Meaning: Enter hold time in seconds from a standardized Side Plank with Hip Abduction test (seconds until form breakdown)."
      };
    }

    if (!band) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men: Developing <20, Recreational 20-35, Trained 35-50, Advanced 50-70, Elite 70+. " +
          "Women: Developing <15, Recreational 15-30, Trained 30-45, Advanced 45-60, Elite 60+ (all in seconds).",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply Side Plank + Hip Abduction normative values."
      };
    }

    var rating = classifySidePlankHoldTime(numericValue, band);
    var meaningByRating = {
      Developing: "Lateral trunk endurance with hip control is limited. Build core anti-rotation strength and hip stabilizer capacity.",
      Recreational: "Foundational lateral stability is present. Continue progressing hold time and adding dynamic hip movements.",
      Trained: "Solid lateral core endurance for most mountain and field demands. Progress load or complexity.",
      Advanced: "High lateral stability and hip control endurance. Emphasize reactive transfer and fatigue resistance.",
      Elite: "Exceptional Side Plank + Hip Abduction capacity. Maintain quality while progressing sport-specific integration."
    };

    return {
      currentValue: "Current score: " + valueWithUnit,
      rating: "Rating: " + rating,
      range:
        "Reference: " +
        (band.sex === "male" ? "Men" : "Women") +
        " hold-time norms - Developing <" +
        band.developingHigh +
        "s, Recreational " +
        band.recreationalLow +
        "-" +
        band.recreationalHigh +
        "s, Trained " +
        band.trainedLow +
        "-" +
        band.trainedHigh +
        "s, Advanced " +
        band.advancedLow +
        "-" +
        band.advancedHigh +
        "s, Elite " +
        band.eliteLow +
        "+ seconds.",
      meaning: "Meaning: " + (meaningByRating[rating] || "Interpret with training context and trend direction.")
    };
  }

  function classifyYBalanceReach(percentageReach, band) {
    if (!Number.isFinite(percentageReach) || !band) {
      return "Needs Data";
    }
    if (percentageReach < band.developingHigh) {
      return "Developing";
    }
    if (percentageReach <= band.recreationalHigh) {
      return "Recreational";
    }
    if (percentageReach <= band.trainedHigh) {
      return "Trained";
    }
    if (percentageReach <= band.advancedHigh) {
      return "Advanced";
    }
    return "Elite Control";
  }

  function getYBalanceNormBandForSex(sex) {
    if (!sex) {
      return null;
    }

    var table = {
      male: {
        sex: "male",
        developingHigh: 60,
        recreationalLow: 60,
        recreationalHigh: 65,
        trainedLow: 65,
        trainedHigh: 72,
        advancedLow: 72,
        advancedHigh: 78,
        eliteLow: 78
      },
      female: {
        sex: "female",
        developingHigh: 65,
        recreationalLow: 65,
        recreationalHigh: 70,
        trainedLow: 70,
        trainedHigh: 77,
        advancedLow: 77,
        advancedHigh: 83,
        eliteLow: 83
      }
    };

    return table[sex] || null;
  }

  function buildYBalanceReachBenchmarkSummary(metric, numericValue, valueWithUnit) {
    var sex = resolveAthleteSexForBenchmarks();
    var band = getYBalanceNormBandForSex(sex);
    var unit = normalizeMetricValue(metric && metric.metric_unit);
    var heightCm = getAthleteHeightCmForBenchmarks();
    var legLengthCm = heightCm ? calculateLegLengthCm(heightCm) : null;
    var normalizedReachPercent = null;

    if (numericValue !== null) {
      if (unit.indexOf("%") !== -1) {
        normalizedReachPercent = numericValue;
      } else if (Number.isFinite(legLengthCm) && legLengthCm > 0) {
        var reachCm = convertLengthToCm(numericValue, unit);
        if (Number.isFinite(reachCm)) {
          normalizedReachPercent = (reachCm / legLengthCm) * 100;
        }
      } else if (!unit) {
        // Backward compatibility: if no unit is stored, assume value may already be normalized %.
        normalizedReachPercent = numericValue;
      }
    }

    if (numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to unlock benchmark comparison.",
        range:
          "Reference: Y Balance anterior reach uses sex-specific normalized reach categories (% leg length) for Developing to Elite Control.",
        meaning:
          "Meaning: Enter normalized anterior reach as % leg length, or enter reach distance (cm/in) with athlete height to auto-estimate leg length (height x 0.53). Clinical note: anterior reach asymmetry >4cm indicates elevated lower-extremity injury risk."
      };
    }

    if (!band) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men: Developing <60%, Recreational 60-65%, Trained 65-72%, Advanced 72-78%, Elite >78%. " +
          "Women: Developing <65%, Recreational 65-70%, Trained 70-77%, Advanced 77-83%, Elite >83% (all normalized to leg length).",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply Y Balance normative values."
      };
    }

    if (!Number.isFinite(normalizedReachPercent)) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing data for leg-length normalization.",
        range:
          "Reference: Y Balance norms are based on normalized anterior reach (% leg length).",
        meaning:
          "Meaning: Enter athlete height in profile so leg length can be estimated (height x 0.53), or enter the Y Balance result directly as %."
      };
    }

    var rating = classifyYBalanceReach(normalizedReachPercent, band);
    var meaningByRating = {
      Developing: "Anterior reach capacity is limited. Prioritize hip mobility, ankle dorsiflexion, and balance control in standing loads.",
      Recreational: "Foundational mobility and balance present. Continue progressing reach distance with controlled tempo.",
      Trained: "Solid anterior mobility and dynamic balance control. Maintain with sport-specific movement complexity.",
      Advanced: "High reach capacity and balance poise. Continue progressive loading while monitoring asymmetry (>4cm indicates injury risk).",
      "Elite Control": "Exceptional anterior reach and balance. Emphasize bilateral symmetry (<4cm asymmetry) and sport-specific transfer under fatigue."
    };

    return {
      currentValue:
        "Current score: " +
        valueWithUnit +
        " | Normalized reach: " +
        formatMetricNumber(normalizedReachPercent) +
        "%",
      rating: "Rating: " + rating,
      range:
        "Reference: " +
        (band.sex === "male" ? "Men" : "Women") +
        " anterior reach norms - Developing <" +
        band.developingHigh +
        "%, Recreational " +
        band.recreationalLow +
        "-" +
        band.recreationalHigh +
        "%, Trained " +
        band.trainedLow +
        "-" +
        band.trainedHigh +
        "%, Advanced " +
        band.advancedLow +
        "-" +
        band.advancedHigh +
        "%, Elite >" +
        band.eliteLow +
        "% (normalized to leg length).",
      meaning: "Meaning: " + (meaningByRating[rating] || "Interpret with training context and trend direction.")
    };
  }

  function buildEdgePullBenchmarkSummary(metric, numericValue, valueWithUnit) {
    var sex = resolveAthleteSexForBenchmarks();
    var band = getEdgePullNormBandForSex(sex);
    var unit = normalizeMetricValue(metric && metric.metric_unit);
    var weightKg = getAthleteWeightKgForBenchmarks();
    var pullLoadKg = numericValue === null ? null : convertMassToKg(numericValue, unit);
    var relativeLoad = null;

    if (numericValue !== null) {
      if (unit.indexOf("%") !== -1) {
        relativeLoad = numericValue;
      } else if (Number.isFinite(weightKg) && weightKg > 0 && Number.isFinite(pullLoadKg)) {
        relativeLoad = (pullLoadKg / weightKg) * 100;
      }
    }

    if (numericValue === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to unlock benchmark comparison.",
        range:
          "Reference: 20mm Edge Pull (single-arm) uses sex-specific relative load ranges (% bodyweight).",
        meaning:
          "Meaning: Enter a numeric hang score. If score is in kg, athlete weight is required to calculate % bodyweight."
      };
    }

    if (!band) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete sex for normative comparison.",
        range:
          "Reference: Men - Developing <0.6x BW, Recreational 0.6-0.75x, Trained 0.75-0.9x, Advanced 0.9-1.05x, Elite >1.05x. " +
          "Women - Developing <0.55x BW, Recreational 0.55-0.7x, Trained 0.7-0.85x, Advanced 0.85-1.0x, Elite >1.0x (single-arm hang).",
        meaning:
          "Meaning: Set athlete sex (male/female) in profile data to apply the 20mm Edge Pull normative table."
      };
    }

    if (relativeLoad === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing bodyweight for relative-load comparison.",
        range:
          "Reference: Relative load is calculated as (edge pull load / bodyweight) x 100.",
        meaning:
          "Meaning: Enter athlete weight in profile and record edge pull in kg or lbs (or enter metric directly as %BW)."
      };
    }

    var rating = classifyEdgePullRelativeLoad(relativeLoad, band);
    var meaningByRating = {
      Developing: "Developing relative finger-force output. Build tendon tolerance and progressive max-strength capacity.",
      Recreational: "Recreational climbing force baseline. Continue steady finger-strength progression and recovery management.",
      Trained: "Trained relative force profile with solid climbing transfer potential.",
      Advanced: "Advanced relative edge-force output suited to higher climbing performance demands.",
      Elite: "Elite relative edge-force output. Prioritize precision, resilience, and sport-specific transfer under fatigue."
    };

    return {
      currentValue:
        "Current score: " +
        valueWithUnit +
        " | Relative load: " +
        formatMetricNumber(relativeLoad) +
        "% BW",
      rating: "Rating: " + rating,
      range:
        "Reference: " +
        (band.sex === "male"
          ? "Men"
          : "Women") +
        " Developing <" + band.developingHigh + "% (" + formatMetricNumber(band.developingHigh / 100) + "x BW) | Recreational " +
        band.recreationalLow + "-" + band.recreationalHigh + "% (" + formatMetricNumber(band.recreationalLow / 100) + "-" + formatMetricNumber(band.recreationalHigh / 100) + "x) | Trained " +
        band.trainedLow + "-" + band.trainedHigh + "% (" + formatMetricNumber(band.trainedLow / 100) + "-" + formatMetricNumber(band.trainedHigh / 100) + "x) | Advanced " +
        band.advancedLow + "-" + band.advancedHigh + "% (" + formatMetricNumber(band.advancedLow / 100) + "-" + formatMetricNumber(band.advancedHigh / 100) + "x) | Elite >" + band.eliteLow + "% (" + formatMetricNumber(band.eliteLow / 100) + "x).",
      meaning: "Meaning: " + (meaningByRating[rating] || "Interpret with training context and trend direction.")
    };
  }

  function classifyEdgePullRelativeLoad(valuePercent, band) {
    if (!Number.isFinite(valuePercent) || !band) {
      return "Needs Data";
    }
    if (valuePercent < band.developingHigh) {
      return "Developing";
    }
    if (valuePercent < band.trainedLow) {
      return "Recreational";
    }
    if (valuePercent < band.advancedLow) {
      return "Trained";
    }
    if (valuePercent < band.eliteLow) {
      return "Advanced";
    }
    return "Elite";
  }

  function getAthleteWeightKgForBenchmarks() {
    var profile = state.profile || {};
    var weightUnit = resolveAthleteWeightUnitForBenchmarks();
    var profileWeight = parseFloat(profile.weight_kg);
    if (Number.isFinite(profileWeight) && profileWeight > 0) {
      return convertMassToKg(profileWeight, weightUnit);
    }

    if (state.form) {
      var weightField = state.form.querySelector("[name='weight_kg']");
      var fieldWeight = parseFloat((weightField && weightField.value) || "");
      if (Number.isFinite(fieldWeight) && fieldWeight > 0) {
        return convertMassToKg(fieldWeight, weightUnit);
      }
    }

    return null;
  }

  function resolveAthleteWeightUnitForBenchmarks() {
    var profile = state.profile || {};
    var overview = getProfileSportOverview(profile);
    var general = overview && overview.general && typeof overview.general === "object"
      ? overview.general
      : {};

    var rawCandidates = [
      profile.weight_unit,
      overview && overview.weight_unit,
      general.weight_unit
    ];

    var raw = rawCandidates.find(function (value) {
      return String(value || "").trim().length > 0;
    });

    var normalized = normalizeMetricValue(raw);
    if (/\b(lb|lbs|pound|pounds)\b/.test(normalized)) {
      return "lb";
    }
    return "kg";
  }

  function getAthleteHeightCmForBenchmarks() {
    var profile = state.profile || {};
    var profileHeight = parseFloat(profile.height_cm);
    if (Number.isFinite(profileHeight) && profileHeight > 0) {
      return profileHeight;
    }

    if (state.form) {
      var heightField = state.form.querySelector("[name='height_cm']");
      var fieldHeight = parseFloat((heightField && heightField.value) || "");
      if (Number.isFinite(fieldHeight) && fieldHeight > 0) {
        return fieldHeight;
      }
    }

    return null;
  }

  function getEdgePullNormBandForSex(sex) {
    if (!sex) {
      return null;
    }

    var table = {
      male: {
        sex: "male",
        developingHigh: 60,
        recreationalLow: 60,
        recreationalHigh: 75,
        trainedLow: 75,
        trainedHigh: 90,
        advancedLow: 90,
        advancedHigh: 105,
        eliteLow: 105
      },
      female: {
        sex: "female",
        developingHigh: 55,
        recreationalLow: 55,
        recreationalHigh: 70,
        trainedLow: 70,
        trainedHigh: 85,
        advancedLow: 85,
        advancedHigh: 100,
        eliteLow: 100
      }
    };

    return table[sex] || null;
  }

  function getProfileSportOverview(profile) {
    if (!profile || typeof profile.sport_overview !== "object") {
      return null;
    }
    return profile.sport_overview;
  }

  function buildVerticalJumpBenchmarkSummary(metric, numericValue, valueWithUnit) {
    var age = getAthleteAgeForBenchmarks();
    var sex = resolveAthleteSexForBenchmarks();
    var band = getVerticalJumpNormBand(age, sex);
    var unit = normalizeMetricValue(metric && metric.metric_unit);
    var valueCm = numericValue === null ? null : convertLengthToCm(numericValue, unit);
    var ageLabel = age == null ? "age unknown" : String(age);
    var sexLabel = sex === "male" ? "men" : sex === "female" ? "women" : "sex unknown";

    if (valueCm === null) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Add a numeric score to unlock benchmark comparison.",
        range:
          "Reference: Vertical jump age/sex norms available (men and women, 20-29 to 50+). " +
          "Set profile age and sex for athlete-specific comparison.",
        meaning:
          "Meaning: Enter jump result as a number (cm or inches), and ensure athlete age/sex are set for precise normative interpretation."
      };
    }

    if (!band) {
      return {
        currentValue: "Current score: " + valueWithUnit,
        rating: "Rating: Missing athlete context for age/sex-specific norming.",
        range:
          "Reference: Vertical Jump Norms use sex-specific age bands (20-29, 30-39, 40-49, 50+). " +
          "Current profile: age " + ageLabel + ", sex " + sexLabel + ".",
        meaning:
          "Meaning: Add athlete DOB/age and sex (male/female) in profile data to calculate vertical jump category from your normative table."
      };
    }

    var rating = classifyVerticalJumpByAverageBand(valueCm, band);
    var meaningByRating = {
      "Below Average": "Jump power is below age/sex average. Prioritize lower-body force production, landing mechanics, and progressive power work.",
      "Average": "Jump performance is in the expected range for this athlete's age/sex group.",
      "Above Average": "Jump performance is above expected age/sex average. Maintain power while progressing sport-specific transfer."
    };

    return {
      currentValue: "Current score: " + valueWithUnit,
      rating: "Rating: " + rating,
      range:
        "Reference: " +
        (band.sex === "male" ? "Men" : "Women") +
        " " +
        band.ageBandLabel +
        " average = " +
        band.inchesLabel +
        " (" +
        band.cmLabel +
        ").",
      meaning: "Meaning: " + (meaningByRating[rating] || "Interpret with training context and trend direction.")
    };
  }

  function classifyVerticalJumpByAverageBand(valueCm, band) {
    if (!band || !Number.isFinite(valueCm)) {
      return "Needs Data";
    }
    if (valueCm < band.cmLow) {
      return "Below Average";
    }
    if (valueCm > band.cmHigh) {
      return "Above Average";
    }
    return "Average";
  }

  function getAthleteAgeForBenchmarks() {
    var profile = state.profile || {};
    var dob = getProfileDobValue(profile);
    var dobAge = calculateAgeFromDob(dob);
    if (dobAge != null) {
      return dobAge;
    }

    var rawAge = parseInt(profile.age, 10);
    if (Number.isFinite(rawAge) && rawAge > 0 && rawAge < 121) {
      return rawAge;
    }

    return null;
  }

  function resolveAthleteSexForBenchmarks() {
    var profile = state.profile || {};
    var overview = getProfileSportOverview(profile);
    var general = overview && overview.general && typeof overview.general === "object"
      ? overview.general
      : {};

    var rawCandidates = [
      profile.sex,
      profile.gender,
      profile.biological_sex,
      general.sex,
      general.gender,
      general.biological_sex
    ];

    var raw = rawCandidates.find(function (value) {
      return String(value || "").trim().length > 0;
    });

    var normalized = normalizeMetricValue(raw);
    if (normalized === "male" || normalized === "m" || normalized === "man") {
      return "male";
    }
    if (normalized === "female" || normalized === "f" || normalized === "woman") {
      return "female";
    }
    return "";
  }

  function getProfileSexForFormValue(profile) {
    var overview = getProfileSportOverview(profile);
    var general = overview && overview.general && typeof overview.general === "object"
      ? overview.general
      : {};

    var rawCandidates = [
      profile && profile.sex,
      profile && profile.gender,
      profile && profile.biological_sex,
      overview && overview.sex,
      overview && overview.gender,
      overview && overview.biological_sex,
      general.sex,
      general.gender,
      general.biological_sex
    ];

    var raw = rawCandidates.find(function (value) {
      return String(value || "").trim().length > 0;
    });

    var normalized = normalizeMetricValue(raw);
    if (normalized === "male" || normalized === "m" || normalized === "man") {
      return "male";
    }
    if (normalized === "female" || normalized === "f" || normalized === "woman") {
      return "female";
    }
    if (
      normalized === "prefer-not-to-say" ||
      normalized === "prefer not to say" ||
      normalized === "undisclosed"
    ) {
      return "prefer-not-to-say";
    }
    if (normalized === "other" || normalized === "nonbinary" || normalized === "non-binary") {
      return "other";
    }
    return "";
  }

  function getVerticalJumpNormBand(age, sex) {
    if (!Number.isFinite(age) || !sex) {
      return null;
    }

    var ageBandLabel = "";
    if (age >= 20 && age <= 29) {
      ageBandLabel = "20-29";
    } else if (age >= 30 && age <= 39) {
      ageBandLabel = "30-39";
    } else if (age >= 40 && age <= 49) {
      ageBandLabel = "40-49";
    } else if (age >= 50) {
      ageBandLabel = "50+";
    } else {
      ageBandLabel = "20-29";
    }

    var tables = {
      male: {
        "20-29": { cmLow: 51, cmHigh: 56, inchesLabel: "20-22 in", cmLabel: "51-56 cm" },
        "30-39": { cmLow: 46, cmHigh: 51, inchesLabel: "18-20 in", cmLabel: "46-51 cm" },
        "40-49": { cmLow: 41, cmHigh: 46, inchesLabel: "16-18 in", cmLabel: "41-46 cm" },
        "50+": { cmLow: 33, cmHigh: 41, inchesLabel: "13-16 in", cmLabel: "33-41 cm" }
      },
      female: {
        "20-29": { cmLow: 41, cmHigh: 46, inchesLabel: "16-18 in", cmLabel: "41-46 cm" },
        "30-39": { cmLow: 36, cmHigh: 41, inchesLabel: "14-16 in", cmLabel: "36-41 cm" },
        "40-49": { cmLow: 31, cmHigh: 36, inchesLabel: "12-14 in", cmLabel: "31-36 cm" },
        "50+": { cmLow: 26, cmHigh: 31, inchesLabel: "10-12 in", cmLabel: "26-31 cm" }
      }
    };

    var sexTable = tables[sex];
    if (!sexTable || !sexTable[ageBandLabel]) {
      return null;
    }

    return {
      sex: sex,
      ageBandLabel: ageBandLabel,
      cmLow: sexTable[ageBandLabel].cmLow,
      cmHigh: sexTable[ageBandLabel].cmHigh,
      inchesLabel: sexTable[ageBandLabel].inchesLabel,
      cmLabel: sexTable[ageBandLabel].cmLabel
    };
  }

  function buildBilateralMetricFlags(metrics) {
    var groups = {};
    (metrics || []).forEach(function (metric) {
      var rawName = String(metric && metric.metric_name || "").trim();
      var sideMatch = rawName.match(/^(.*)\((left|right)\)\s*$/i);
      if (!sideMatch) {
        return;
      }

      var baseName = String(sideMatch[1] || "").trim();
      var side = String(sideMatch[2] || "").toLowerCase();
      var score = parseNumericMetricValue(metric.metric_value);
      if (!Number.isFinite(score)) {
        return;
      }

      if (!groups[baseName]) {
        groups[baseName] = {};
      }
      groups[baseName][side] = score;
    });

    return Object.keys(groups)
      .map(function (name) {
        var pair = groups[name] || {};
        if (!Number.isFinite(pair.left) || !Number.isFinite(pair.right)) {
          return "";
        }
        var symmetry = calculateSymmetryPercent(pair.left, pair.right);
        if (symmetry === null || symmetry >= 95) {
          return "";
        }
        return name + " side-to-side asymmetry flagged: " + formatMetricNumber(symmetry) + "% symmetry (<95%).";
      })
      .filter(function (line) {
        return !!line;
      });
  }

  function buildMetricFrontValueHtml(metric) {
    var metricName = String(metric.metric_name || "");
    var metricUnit = String(metric.metric_unit || "").trim();
    var metricValue = String(metric.metric_value || "").trim();
    var normalizedName = normalizeMetricValue(metricName);
    var pairedSideMetric =
      metric &&
      metric._pairedSideMetrics &&
      (isSingleLegSquatMetricName(metricName) ||
        isSingleLegHeelRaiseMetricName(metricName) ||
        isSidePlankMetricName(metricName) ||
        isYBalanceMetricName(metricName) ||
        isEdgePullMetricName(metricName));
    var isYBalanceAnterior =
      normalizedName.indexOf("y balance") !== -1 ||
      normalizedName.indexOf("anterior reach") !== -1;

    if (pairedSideMetric) {
      var leftMetric = metric._pairedSideMetrics.left;
      var rightMetric = metric._pairedSideMetrics.right;
      if (leftMetric && rightMetric) {
        var leftValue = parseNumericMetricValue(leftMetric.metric_value || "");
        var rightValue = parseNumericMetricValue(rightMetric.metric_value || "");
        var leftText = escapeHtml(formatMetricDisplayValue(leftValue, metricUnit));
        var rightText = escapeHtml(formatMetricDisplayValue(rightValue, metricUnit));
        var symmetry = calculateSymmetryPercent(leftValue, rightValue);
        var symmetryText = symmetry === null ? "—" : escapeHtml(formatMetricNumber(symmetry) + "%");
        var leftLabel = isEdgePullMetricName(metricName) ? "L Hand" : "L Leg";
        var rightLabel = isEdgePullMetricName(metricName) ? "R Hand" : "R Leg";

        return (
          '<span class="metric-value-split">' +
          '<span>' + leftLabel + ' ' + leftText + '</span>' +
          '<span>' + rightLabel + ' ' + rightText + '</span>' +
          '<span>Symmetry ' + symmetryText + '</span>' +
          "</span>"
        );
      }
    }

    if (!isYBalanceAnterior) {
      var safeValue = escapeHtml(metricValue || "—");
      var safeUnit = escapeHtml(metricUnit || "");
      return safeValue + (safeUnit ? '<span class="metric-unit"> ' + safeUnit + "</span>" : "");
    }

    var parsed = parseYBalanceLegValues(metricValue);
    if (!parsed || parsed.left === null || parsed.right === null) {
      var fallbackValue = escapeHtml(metricValue || "—");
      var fallbackUnit = escapeHtml(metricUnit || "");
      return fallbackValue + (fallbackUnit ? '<span class="metric-unit"> ' + fallbackUnit + "</span>" : "");
    }

    var leftText = escapeHtml(formatMetricDisplayValue(parsed.left, metricUnit));
    var rightText = escapeHtml(formatMetricDisplayValue(parsed.right, metricUnit));
    var symmetry = calculateSymmetryPercent(parsed.left, parsed.right);
    var symmetryText = symmetry === null ? "—" : escapeHtml(formatMetricNumber(symmetry) + "%");

    return (
      '<span class="metric-value-split">' +
      '<span>L Leg ' + leftText + '</span>' +
      '<span>R Leg ' + rightText + '</span>' +
      '<span>Symmetry ' + symmetryText + '</span>' +
      "</span>"
    );
  }

  function buildYBalanceBenchmarkSummary(metric, definition) {
    var metricUnit = String(metric.metric_unit || "").trim();
    var metricValue = String(metric.metric_value || "").trim();
    var parsed = parseYBalanceLegValues(metricValue);
    var left = parsed && parsed.left;
    var right = parsed && parsed.right;

    if (left === null || right === null) {
      return {
        currentValue:
          "Current score: L Leg — | R Leg — | Symmetry —",
        rating:
          "Rating: Add both leg values (example: L 74, R 71) to compare to Y Balance benchmarks.",
        range:
          "Reference: " + definition.range + " Symmetry target is typically >=95%.",
        meaning:
          "Meaning: Track both sides and symmetry over time. Large side-to-side gaps can indicate reduced single-leg control under fatigue."
      };
    }

    var lowerLegScore = Math.min(left, right);
    var rating = definition.classify(lowerLegScore);
    var baseMeaning = definition.meaning[rating] || "Use this score with training context and trend direction.";
    var symmetry = calculateSymmetryPercent(left, right);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";
    var symmetryMeaning = "";

    if (symmetry !== null) {
      if (symmetry >= 95) {
        symmetryMeaning = "Symmetry is strong.";
      } else if (symmetry >= 90) {
        symmetryMeaning = "Symmetry is moderate; monitor side-to-side control.";
      } else {
        symmetryMeaning = "Symmetry gap is notable; prioritize unilateral balance/control work.";
      }
    }

    var leftText = formatMetricDisplayValue(left, metricUnit);
    var rightText = formatMetricDisplayValue(right, metricUnit);

    return {
      currentValue:
        "Current score: L Leg " + leftText + " | R Leg " + rightText + " | Symmetry " + symmetryText,
      rating: "Rating: " + rating,
      range:
        "Reference: " + definition.range + " Symmetry target is typically >=95% (or <=4 cm side-to-side when measured in cm).",
      meaning:
        "Meaning: " + baseMeaning + (symmetryMeaning ? " " + symmetryMeaning : "")
    };
  }

  function classifyHigherBetter(value, thresholds, labels) {
    if (value < thresholds[0]) {
      return labels[0];
    }
    if (value < thresholds[1]) {
      return labels[1];
    }
    if (value < thresholds[2]) {
      return labels[2];
    }
    return labels[3];
  }

  function classifyLowerBetter(value, thresholds, labels) {
    if (value > thresholds[0]) {
      return labels[0];
    }
    if (value >= thresholds[1]) {
      return labels[1];
    }
    if (value >= thresholds[2]) {
      return labels[2];
    }
    return labels[3];
  }

  function parseNumericMetricValue(rawValue) {
    var text = String(rawValue || "").replace(/,/g, "").trim();
    if (!text) {
      return null;
    }

    var match = text.match(/-?\d+(?:\.\d+)?/);
    if (!match) {
      return null;
    }

    var parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function convertLengthToCm(value, unitText) {
    if (!Number.isFinite(value)) {
      return null;
    }

    var unit = normalizeMetricValue(unitText || "");
    if (!unit) {
      return value;
    }

    if (/\bcm\b/.test(unit) || /\bcentimet(er|re)s?\b/.test(unit)) {
      return value;
    }

    if (/\b(in|inch|inches)\b/.test(unit) || unit === '"') {
      return value * 2.54;
    }

    if (/\b(ft|foot|feet)\b/.test(unit)) {
      return value * 30.48;
    }

    if (/\bmm\b/.test(unit) || /\bmillimeters?\b/.test(unit)) {
      return value / 10;
    }

    if (/\bm\b/.test(unit) || /\bmeters?\b/.test(unit)) {
      return value * 100;
    }

    return value;
  }

  function convertMassToKg(value, unitText) {
    if (!Number.isFinite(value)) {
      return null;
    }

    var unit = normalizeMetricValue(unitText || "");
    if (!unit || /\b(kg|kilogram|kilograms)\b/.test(unit)) {
      return value;
    }

    if (/\b(lb|lbs|pound|pounds)\b/.test(unit)) {
      return value * 0.45359237;
    }

    return value;
  }

  function updateYBalanceDraftValue(card) {
    if (!card) {
      return;
    }

    var name = String((card.querySelector('[data-metric-edit="name"]') || {}).value || "").trim();
    if (!isYBalanceMetricName(name)) {
      card.removeAttribute("data-metric-ybalance");
      return;
    }

    card.setAttribute("data-metric-ybalance", "true");

    var leftRaw = String((card.querySelector('[data-metric-edit="left"]') || {}).value || "").trim();
    var rightRaw = String((card.querySelector('[data-metric-edit="right"]') || {}).value || "").trim();
    var unit = String((card.querySelector('[data-metric-edit="unit"]') || {}).value || "").trim();
    var symmetryInput = card.querySelector('[data-metric-edit="symmetry"]');
    var valueInput = card.querySelector('[data-metric-edit="value"]');

    var left = parseNumericMetricValue(leftRaw);
    var right = parseNumericMetricValue(rightRaw);

    if (left === null || right === null) {
      if (symmetryInput) {
        symmetryInput.value = "";
      }
      if (valueInput) {
        valueInput.value = "";
      }
      return;
    }

    var leftText = formatMetricDisplayValue(left, unit);
    var rightText = formatMetricDisplayValue(right, unit);
    var symmetry = calculateSymmetryPercent(left, right);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";

    if (symmetryInput) {
      symmetryInput.value = symmetryText;
    }
    if (valueInput) {
      valueInput.value = "L " + leftText + " | R " + rightText + " | Symmetry " + symmetryText;
    }
  }

  function updateSingleLegSquatDraftValue(card) {
    if (!card) {
      return;
    }

    var name = String((card.querySelector('[data-metric-edit="name"]') || {}).value || "").trim();
    if (!isSingleLegSquatMetricName(name)) {
      card.removeAttribute("data-metric-squat");
      return;
    }

    card.setAttribute("data-metric-squat", "true");

    var leftRaw = String((card.querySelector('[data-metric-edit="left"]') || {}).value || "").trim();
    var rightRaw = String((card.querySelector('[data-metric-edit="right"]') || {}).value || "").trim();
    var unit = String((card.querySelector('[data-metric-edit="unit"]') || {}).value || "").trim();
    var symmetryInput = card.querySelector('[data-metric-edit="symmetry"]');
    var valueInput = card.querySelector('[data-metric-edit="value"]');

    var left = parseNumericMetricValue(leftRaw);
    var right = parseNumericMetricValue(rightRaw);

    if (left === null || right === null) {
      if (symmetryInput) {
        symmetryInput.value = "";
      }
      if (valueInput) {
        valueInput.value = "";
      }
      return;
    }

    var leftText = formatMetricDisplayValue(left, unit);
    var rightText = formatMetricDisplayValue(right, unit);
    var symmetry = calculateSymmetryPercent(left, right);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";

    if (symmetryInput) {
      symmetryInput.value = symmetryText;
    }
    if (valueInput) {
      valueInput.value = "L Leg " + leftText + " | R Leg " + rightText + " | Symmetry " + symmetryText;
    }
  }

  function updateSingleLegHeelRaiseDraftValue(card) {
    if (!card) {
      return;
    }

    var name = String((card.querySelector('[data-metric-edit="name"]') || {}).value || "").trim();
    if (!isSingleLegHeelRaiseMetricName(name)) {
      card.removeAttribute("data-metric-heelraise");
      return;
    }

    card.setAttribute("data-metric-heelraise", "true");

    var leftRaw = String((card.querySelector('[data-metric-edit="left"]') || {}).value || "").trim();
    var rightRaw = String((card.querySelector('[data-metric-edit="right"]') || {}).value || "").trim();
    var unit = String((card.querySelector('[data-metric-edit="unit"]') || {}).value || "").trim();
    var symmetryInput = card.querySelector('[data-metric-edit="symmetry"]');
    var valueInput = card.querySelector('[data-metric-edit="value"]');

    var left = parseNumericMetricValue(leftRaw);
    var right = parseNumericMetricValue(rightRaw);

    if (left === null || right === null) {
      if (symmetryInput) {
        symmetryInput.value = "";
      }
      if (valueInput) {
        valueInput.value = "";
      }
      return;
    }

    var leftText = formatMetricDisplayValue(left, unit);
    var rightText = formatMetricDisplayValue(right, unit);
    var symmetry = calculateSymmetryPercent(left, right);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";

    if (symmetryInput) {
      symmetryInput.value = symmetryText;
    }
    if (valueInput) {
      valueInput.value = "L Leg " + leftText + " | R Leg " + rightText + " | Symmetry " + symmetryText;
    }
  }

  function updateSidePlankDraftValue(card) {
    if (!card) {
      return;
    }

    var name = String((card.querySelector('[data-metric-edit="name"]') || {}).value || "").trim();
    if (!isSidePlankMetricName(name)) {
      card.removeAttribute("data-metric-sideplank");
      return;
    }

    card.setAttribute("data-metric-sideplank", "true");

    var leftRaw = String((card.querySelector('[data-metric-edit="left"]') || {}).value || "").trim();
    var rightRaw = String((card.querySelector('[data-metric-edit="right"]') || {}).value || "").trim();
    var unit = String((card.querySelector('[data-metric-edit="unit"]') || {}).value || "").trim();
    var symmetryInput = card.querySelector('[data-metric-edit="symmetry"]');
    var valueInput = card.querySelector('[data-metric-edit="value"]');

    var left = parseNumericMetricValue(leftRaw);
    var right = parseNumericMetricValue(rightRaw);

    if (left === null || right === null) {
      if (symmetryInput) {
        symmetryInput.value = "";
      }
      if (valueInput) {
        valueInput.value = "";
      }
      return;
    }

    var leftText = formatMetricDisplayValue(left, unit);
    var rightText = formatMetricDisplayValue(right, unit);
    var symmetry = calculateSymmetryPercent(left, right);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";

    if (symmetryInput) {
      symmetryInput.value = symmetryText;
    }
    if (valueInput) {
      valueInput.value = "L Leg " + leftText + " | R Leg " + rightText + " | Symmetry " + symmetryText;
    }
  }

  function updateEdgePullDraftValue(card) {
    if (!card) {
      return;
    }

    var name = String((card.querySelector('[data-metric-edit="name"]') || {}).value || "").trim();
    if (!isEdgePullMetricName(name)) {
      card.removeAttribute("data-metric-edgepull");
      return;
    }

    card.setAttribute("data-metric-edgepull", "true");

    var leftRaw = String((card.querySelector('[data-metric-edit="left"]') || {}).value || "").trim();
    var rightRaw = String((card.querySelector('[data-metric-edit="right"]') || {}).value || "").trim();
    var unit = String((card.querySelector('[data-metric-edit="unit"]') || {}).value || "").trim();
    var symmetryInput = card.querySelector('[data-metric-edit="symmetry"]');
    var valueInput = card.querySelector('[data-metric-edit="value"]');

    var left = parseNumericMetricValue(leftRaw);
    var right = parseNumericMetricValue(rightRaw);

    if (left === null || right === null) {
      if (symmetryInput) {
        symmetryInput.value = "";
      }
      if (valueInput) {
        valueInput.value = "";
      }
      return;
    }

    var leftText = formatMetricDisplayValue(left, unit);
    var rightText = formatMetricDisplayValue(right, unit);
    var symmetry = calculateSymmetryPercent(left, right);
    var symmetryText = symmetry === null ? "—" : formatMetricNumber(symmetry) + "%";

    if (symmetryInput) {
      symmetryInput.value = symmetryText;
    }
    if (valueInput) {
      valueInput.value = "L Hand " + leftText + " | R Hand " + rightText + " | Symmetry " + symmetryText;
    }
  }

    function updateGrantDraftValue(card) {
      if (!card) {
        return;
      }

      var name = String((card.querySelector('[data-metric-edit="name"]') || {}).value || "").trim();
      if (!isAdaptedGrantFootRaiseMetricName(name)) {
        card.removeAttribute("data-metric-grant");
        return;
      }

      card.setAttribute("data-metric-grant", "true");

      var leftRaw = String((card.querySelector('[data-metric-edit="left"]') || {}).value || "").trim();
      var rightRaw = String((card.querySelector('[data-metric-edit="right"]') || {}).value || "").trim();
      var unit = String((card.querySelector('[data-metric-edit="unit"]') || {}).value || "").trim();
      var valueInput = card.querySelector('[data-metric-edit="value"]');

      var left = parseNumericMetricValue(leftRaw);
      var right = parseNumericMetricValue(rightRaw);

      if (left === null || right === null) {
        if (valueInput) {
          valueInput.value = "";
        }
        return;
      }

      var leftText = formatMetricDisplayValue(left, unit);
      var rightText = formatMetricDisplayValue(right, unit);

      if (valueInput) {
        valueInput.value = "L " + leftText + " | R " + rightText;
      }
    }

  function updateLegLengthEstimateNote(card) {
    if (!card) {
      return;
    }

    var legLengthNote = card.querySelector("[data-leglength-estimate-note]");
    if (!legLengthNote) {
      return;
    }

    var name = String((card.querySelector('[data-metric-edit="name"]') || {}).value || "").trim();
    var showNote = isYBalanceMetricName(name) || isAdaptedGrantFootRaiseMetricName(name);
    legLengthNote.hidden = !showNote;
  }

  function isYBalanceMetricName(name) {
    var normalized = normalizeMetricValue(name);
    return normalized.indexOf("y balance") !== -1 || normalized.indexOf("anterior reach") !== -1;
  }

  function parseYBalanceLegValues(rawValue) {
    var text = String(rawValue || "").replace(/,/g, " ").trim();
    if (!text) {
      return { left: null, right: null };
    }

    var leftMatch = text.match(/(?:\bL\b|\bleft\b|\bl leg\b)[^\d-]*(-?\d+(?:\.\d+)?)/i);
    var rightMatch = text.match(/(?:\bR\b|\bright\b|\br leg\b)[^\d-]*(-?\d+(?:\.\d+)?)/i);
    var left = leftMatch ? Number(leftMatch[1]) : null;
    var right = rightMatch ? Number(rightMatch[1]) : null;

    if (Number.isFinite(left) && Number.isFinite(right)) {
      return { left: left, right: right };
    }

    var numbers = text.match(/-?\d+(?:\.\d+)?/g) || [];
    if (numbers.length >= 2) {
      var first = Number(numbers[0]);
      var second = Number(numbers[1]);
      if (Number.isFinite(first) && Number.isFinite(second)) {
        return { left: first, right: second };
      }
    }

    return { left: null, right: null };
  }

  function parseGrantLegValues(rawValue) {
    var text = String(rawValue || "").replace(/,/g, " ").trim();
    if (!text) {
      return { left: null, right: null };
    }

    var leftMatch = text.match(/(?:\bL\b|\bleft\b|\bl leg\b)[^\d-]*(-?\d+(?:\.\d+)?)/i);
    var rightMatch = text.match(/(?:\bR\b|\bright\b|\br leg\b)[^\d-]*(-?\d+(?:\.\d+)?)/i);
    var left = leftMatch ? Number(leftMatch[1]) : null;
    var right = rightMatch ? Number(rightMatch[1]) : null;

    if (Number.isFinite(left) && Number.isFinite(right)) {
      return { left: left, right: right };
    }

    var numbers = text.match(/-?\d+(?:\.\d+)?/g) || [];
    if (numbers.length >= 2) {
      var first = Number(numbers[0]);
      var second = Number(numbers[1]);
      if (Number.isFinite(first) && Number.isFinite(second)) {
        return { left: first, right: second };
      }
    }

    return { left: null, right: null };
  }

  function calculateSymmetryPercent(left, right) {
    if (!Number.isFinite(left) || !Number.isFinite(right)) {
      return null;
    }

    var larger = Math.max(Math.abs(left), Math.abs(right));
    var smaller = Math.min(Math.abs(left), Math.abs(right));
    if (larger <= 0) {
      return null;
    }

    return (smaller / larger) * 100;
  }

  function formatMetricDisplayValue(value, unit) {
    var numericText = formatMetricNumber(value);
    return unit ? numericText + " " + unit : numericText;
  }

  function formatMetricNumber(value) {
    if (!Number.isFinite(value)) {
      return "—";
    }

    var rounded = Math.round(value * 10) / 10;
    if (Math.abs(rounded - Math.round(rounded)) < 0.0001) {
      return String(Math.round(rounded));
    }
    return rounded.toFixed(1);
  }

  function closeMetricCardEditor(card) {
    if (!card) {
      return;
    }
    card.classList.remove("is-flipped");
    card.removeAttribute("data-metric-mode");
  }

  function closeAllMetricCardEditors() {
    if (!state.metricsList) {
      return;
    }

    state.metricsList.querySelectorAll(".metric-card.is-flipped").forEach(function (card) {
      closeMetricCardEditor(card);
    });
  }

  function deleteMetricFromFlippedCard(card) {
    var viewedUserId = getViewedUserId();
    if (!viewedUserId || !state.client || !card) {
      setMetricsStatus("Not authenticated.", "error");
      return;
    }

    var metricKey = String(card.getAttribute("data-metric-key") || "");
    var metric = findLatestMetricByKey(metricKey);
    if (!metric) {
      setMetricsStatus("Could not find this metric to delete.", "error");
      return;
    }

    if (!confirm("Delete this metric and all of its test history?")) {
      return;
    }

    setMetricsStatus("Deleting metric...", "info");

    var name = String(metric.metric_name || "");
    var unit = String(metric.metric_unit || "").trim();

    function deleteByNameAndUnit(targetName, targetUnit) {
      var safeName = String(targetName || "").trim();
      var safeUnit = String(targetUnit || "").trim();
      if (!safeName) {
        return Promise.resolve();
      }

      if (safeUnit) {
        return state.client
          .from("athlete_metrics")
          .delete()
          .eq("user_id", viewedUserId)
          .eq("metric_name", safeName)
          .eq("metric_unit", safeUnit)
          .then(function (result) {
            if (result.error) {
              throw result.error;
            }
          });
      }

      return state.client
        .from("athlete_metrics")
        .delete()
        .eq("user_id", viewedUserId)
        .eq("metric_name", safeName)
        .eq("metric_unit", "")
        .then(function (resultEmptyUnit) {
          if (resultEmptyUnit.error) {
            throw resultEmptyUnit.error;
          }

          return state.client
            .from("athlete_metrics")
            .delete()
            .eq("user_id", viewedUserId)
            .eq("metric_name", safeName)
            .is("metric_unit", null)
            .then(function (resultNullUnit) {
              if (resultNullUnit.error) {
                throw resultNullUnit.error;
              }
            });
        });
    }

    var pair = metric && metric._pairedSideMetrics ? metric._pairedSideMetrics : null;
    var deleteTargets = [];

    if (pair && (pair.left || pair.right)) {
      if (pair.left) {
        deleteTargets.push({
          name: String(pair.left.metric_name || "").trim(),
          unit: String(pair.left.metric_unit || "").trim()
        });
      }
      if (pair.right) {
        deleteTargets.push({
          name: String(pair.right.metric_name || "").trim(),
          unit: String(pair.right.metric_unit || "").trim()
        });
      }
    } else {
      deleteTargets.push({ name: name, unit: unit });
    }

    var dedupedTargets = [];
    var seen = {};
    deleteTargets.forEach(function (target) {
      var targetName = String(target && target.name || "").trim();
      var targetUnit = String(target && target.unit || "").trim();
      if (!targetName) {
        return;
      }
      var token = normalizeMetricValue(targetName) + "|" + normalizeMetricValue(targetUnit);
      if (seen[token]) {
        return;
      }
      seen[token] = true;
      dedupedTargets.push({ name: targetName, unit: targetUnit });
    });

    Promise.all(
      dedupedTargets.map(function (target) {
        return deleteByNameAndUnit(target.name, target.unit);
      })
    )
      .then(function () {
        loadMetricsData();
        setMetricsStatus("Metric deleted.", "success");
      })
      .catch(function (error) {
        setMetricsStatus(error && error.message ? error.message : "Failed to delete metric.", "error");
      });
  }
  function saveMetricFromFlippedCard(card) {
    var viewedUserId = getViewedUserId();
    if (!viewedUserId || !state.client || !card) {
      setMetricsStatus("Not authenticated.", "error");
      return;
    }

    var mode = card.getAttribute("data-metric-mode") || "edit";
    var name = String((card.querySelector('[data-metric-edit="name"]') || {}).value || "").trim();
    var value = String((card.querySelector('[data-metric-edit="value"]') || {}).value || "").trim();
    var unit = String((card.querySelector('[data-metric-edit="unit"]') || {}).value || "").trim();
    var category = String((card.querySelector('[data-metric-edit="category"]') || {}).value || "").trim() || "Performance";
    var isYBalance = isYBalanceMetricName(name);
    var isSingleLegSquat = isSingleLegSquatMetricName(name);
    var isSingleLegHeelRaise = isSingleLegHeelRaiseMetricName(name);
    var isSidePlank = isSidePlankMetricName(name);
    var isEdgePull = isEdgePullMetricName(name);

    if (isSingleLegSquat) {
      updateSingleLegSquatDraftValue(card);

      var leftSquatInput = card.querySelector('[data-metric-edit="left"]');
      var rightSquatInput = card.querySelector('[data-metric-edit="right"]');
      var leftSquatRaw = String((leftSquatInput && leftSquatInput.value) || "").trim();
      var rightSquatRaw = String((rightSquatInput && rightSquatInput.value) || "").trim();
      var leftSquatValue = parseNumericMetricValue(leftSquatRaw);
      var rightSquatValue = parseNumericMetricValue(rightSquatRaw);

      if (!Number.isFinite(leftSquatValue) || !Number.isFinite(rightSquatValue)) {
        setMetricsStatus("Single Leg Squat requires both L Leg and R Leg values.", "error");
        return;
      }

      var squatBaseName = String(name || "")
        .replace(/\s*\((left|right)\)\s*$/i, "")
        .trim();
      var squatLeftName = squatBaseName + " (Left)";
      var squatRightName = squatBaseName + " (Right)";

      var squatPayloads = [
        {
          user_id: viewedUserId,
          metric_name: squatLeftName,
          metric_value: formatMetricNumber(leftSquatValue),
          metric_unit: unit,
          metric_category: category,
          updated_at: new Date().toISOString()
        },
        {
          user_id: viewedUserId,
          metric_name: squatRightName,
          metric_value: formatMetricNumber(rightSquatValue),
          metric_unit: unit,
          metric_category: category,
          updated_at: new Date().toISOString()
        }
      ];

      var squatMetricKey = String(card.getAttribute("data-metric-key") || "");
      var currentSquatMetric = findLatestMetricByKey(squatMetricKey);
      var currentSquatPair = currentSquatMetric && currentSquatMetric._pairedSideMetrics ? currentSquatMetric._pairedSideMetrics : null;
      var currentSquatLeft = parseNumericMetricValue(currentSquatPair && currentSquatPair.left && currentSquatPair.left.metric_value);
      var currentSquatRight = parseNumericMetricValue(currentSquatPair && currentSquatPair.right && currentSquatPair.right.metric_value);
      var hasSameSquatValues =
        Number.isFinite(currentSquatLeft) && Number.isFinite(currentSquatRight) &&
        currentSquatLeft === leftSquatValue &&
        currentSquatRight === rightSquatValue &&
        normalizeMetricValue(currentSquatMetric && currentSquatMetric.metric_unit) === normalizeMetricValue(unit) &&
        normalizeMetricValue(currentSquatMetric && currentSquatMetric.metric_category) === normalizeMetricValue(category) &&
        normalizeMetricValue(currentSquatMetric && currentSquatMetric.metric_name) === normalizeMetricValue(squatBaseName);

      if (hasSameSquatValues && mode !== "test") {
        setMetricsStatus("No metric changes detected.", "info");
        closeMetricCardEditor(card);
        return;
      }

      setMetricsStatus(mode === "test" ? "Logging new side-specific test score..." : "Saving side-specific metric update...", "info");

      state.client
        .from("athlete_metrics")
        .insert(squatPayloads)
        .select("*")
        .then(function (insertResult) {
          if (insertResult.error) {
            if (isMissingRelationError(insertResult.error)) {
              setMetricsStatus("Metrics table not found. Create athlete_metrics in Supabase before saving metrics.", "error");
              return;
            }

            if (isRlsError(insertResult.error)) {
              setMetricsStatus("Permission denied by database policy while saving metrics. Ask admin to update athlete_metrics RLS policy for coach edits.", "error");
              return;
            }

            setMetricsStatus(insertResult.error.message, "error");
            return;
          }

          var inserted = Array.isArray(insertResult.data) ? insertResult.data : squatPayloads;
          state.metrics = inserted.concat(state.metrics || []);
          state.metricsLatest = getLatestMetrics(state.metrics);
          renderMetricsCards();
          renderMetricRowsFromData(state.metricsLatest);
          setMetricsStatus(mode === "test" ? "New side-specific test score logged." : "Metric updated.", "success");
        })
        .catch(function (error) {
          setMetricsStatus(error && error.message ? error.message : "Failed to save metric.", "error");
        });
      return;
    }

    if (isSingleLegHeelRaise) {
      updateSingleLegHeelRaiseDraftValue(card);

      var leftHeelRaiseInput = card.querySelector('[data-metric-edit="left"]');
      var rightHeelRaiseInput = card.querySelector('[data-metric-edit="right"]');
      var leftHeelRaiseRaw = String((leftHeelRaiseInput && leftHeelRaiseInput.value) || "").trim();
      var rightHeelRaiseRaw = String((rightHeelRaiseInput && rightHeelRaiseInput.value) || "").trim();
      var leftHeelRaiseValue = parseNumericMetricValue(leftHeelRaiseRaw);
      var rightHeelRaiseValue = parseNumericMetricValue(rightHeelRaiseRaw);

      if (!Number.isFinite(leftHeelRaiseValue) || !Number.isFinite(rightHeelRaiseValue)) {
        setMetricsStatus("Single Leg Heel Raise requires both L Leg and R Leg values.", "error");
        return;
      }

      var heelRaiseBaseName = String(name || "")
        .replace(/\s*\((left|right)\)\s*$/i, "")
        .trim();
      var heelRaiseLeftName = heelRaiseBaseName + " (Left)";
      var heelRaiseRightName = heelRaiseBaseName + " (Right)";

      var heelRaisePayloads = [
        {
          user_id: viewedUserId,
          metric_name: heelRaiseLeftName,
          metric_value: formatMetricNumber(leftHeelRaiseValue),
          metric_unit: unit,
          metric_category: category,
          updated_at: new Date().toISOString()
        },
        {
          user_id: viewedUserId,
          metric_name: heelRaiseRightName,
          metric_value: formatMetricNumber(rightHeelRaiseValue),
          metric_unit: unit,
          metric_category: category,
          updated_at: new Date().toISOString()
        }
      ];

      var heelRaiseMetricKey = String(card.getAttribute("data-metric-key") || "");
      var currentHeelRaiseMetric = findLatestMetricByKey(heelRaiseMetricKey);
      var currentHeelRaisePair = currentHeelRaiseMetric && currentHeelRaiseMetric._pairedSideMetrics ? currentHeelRaiseMetric._pairedSideMetrics : null;
      var currentHeelRaiseLeft = parseNumericMetricValue(currentHeelRaisePair && currentHeelRaisePair.left && currentHeelRaisePair.left.metric_value);
      var currentHeelRaiseRight = parseNumericMetricValue(currentHeelRaisePair && currentHeelRaisePair.right && currentHeelRaisePair.right.metric_value);
      var hasSameHeelRaiseValues =
        Number.isFinite(currentHeelRaiseLeft) && Number.isFinite(currentHeelRaiseRight) &&
        currentHeelRaiseLeft === leftHeelRaiseValue &&
        currentHeelRaiseRight === rightHeelRaiseValue &&
        normalizeMetricValue(currentHeelRaiseMetric && currentHeelRaiseMetric.metric_unit) === normalizeMetricValue(unit) &&
        normalizeMetricValue(currentHeelRaiseMetric && currentHeelRaiseMetric.metric_category) === normalizeMetricValue(category) &&
        normalizeMetricValue(currentHeelRaiseMetric && currentHeelRaiseMetric.metric_name) === normalizeMetricValue(heelRaiseBaseName);

      if (hasSameHeelRaiseValues && mode !== "test") {
        setMetricsStatus("No metric changes detected.", "info");
        closeMetricCardEditor(card);
        return;
      }

      setMetricsStatus(mode === "test" ? "Logging new side-specific test score..." : "Saving side-specific metric update...", "info");

      state.client
        .from("athlete_metrics")
        .insert(heelRaisePayloads)
        .select("*")
        .then(function (insertResult) {
          if (insertResult.error) {
            if (isMissingRelationError(insertResult.error)) {
              setMetricsStatus("Metrics table not found. Create athlete_metrics in Supabase before saving metrics.", "error");
              return;
            }

            if (isRlsError(insertResult.error)) {
              setMetricsStatus("Permission denied by database policy while saving metrics. Ask admin to update athlete_metrics RLS policy for coach edits.", "error");
              return;
            }

            setMetricsStatus(insertResult.error.message, "error");
            return;
          }

          var inserted = Array.isArray(insertResult.data) ? insertResult.data : heelRaisePayloads;
          state.metrics = inserted.concat(state.metrics || []);
          state.metricsLatest = getLatestMetrics(state.metrics);
          renderMetricsCards();
          renderMetricRowsFromData(state.metricsLatest);
          setMetricsStatus(mode === "test" ? "New side-specific test score logged." : "Metric updated.", "success");
        })
        .catch(function (error) {
          setMetricsStatus(error && error.message ? error.message : "Failed to save metric.", "error");
        });
      return;
    }

    if (isSidePlank) {
      updateSidePlankDraftValue(card);

      var leftPlankInput = card.querySelector('[data-metric-edit="left"]');
      var rightPlankInput = card.querySelector('[data-metric-edit="right"]');
      var leftPlankRaw = String((leftPlankInput && leftPlankInput.value) || "").trim();
      var rightPlankRaw = String((rightPlankInput && rightPlankInput.value) || "").trim();
      var leftPlankValue = parseNumericMetricValue(leftPlankRaw);
      var rightPlankValue = parseNumericMetricValue(rightPlankRaw);

      if (!Number.isFinite(leftPlankValue) || !Number.isFinite(rightPlankValue)) {
        setMetricsStatus("Side Plank with Hip Abduction requires both L Leg and R Leg values.", "error");
        return;
      }

      var plankBaseName = String(name || "")
        .replace(/\s*\((left|right)\)\s*$/i, "")
        .trim();
      var plankLeftName = plankBaseName + " (Left)";
      var plankRightName = plankBaseName + " (Right)";

      var plankPayloads = [
        {
          user_id: viewedUserId,
          metric_name: plankLeftName,
          metric_value: formatMetricNumber(leftPlankValue),
          metric_unit: unit,
          metric_category: category,
          updated_at: new Date().toISOString()
        },
        {
          user_id: viewedUserId,
          metric_name: plankRightName,
          metric_value: formatMetricNumber(rightPlankValue),
          metric_unit: unit,
          metric_category: category,
          updated_at: new Date().toISOString()
        }
      ];

      var plankMetricKey = String(card.getAttribute("data-metric-key") || "");
      var currentPlankMetric = findLatestMetricByKey(plankMetricKey);
      var currentPlankPair = currentPlankMetric && currentPlankMetric._pairedSideMetrics ? currentPlankMetric._pairedSideMetrics : null;
      var currentPlankLeft = parseNumericMetricValue(currentPlankPair && currentPlankPair.left && currentPlankPair.left.metric_value);
      var currentPlankRight = parseNumericMetricValue(currentPlankPair && currentPlankPair.right && currentPlankPair.right.metric_value);
      var hasSamePlankValues =
        Number.isFinite(currentPlankLeft) && Number.isFinite(currentPlankRight) &&
        currentPlankLeft === leftPlankValue &&
        currentPlankRight === rightPlankValue &&
        normalizeMetricValue(currentPlankMetric && currentPlankMetric.metric_unit) === normalizeMetricValue(unit) &&
        normalizeMetricValue(currentPlankMetric && currentPlankMetric.metric_category) === normalizeMetricValue(category) &&
        normalizeMetricValue(currentPlankMetric && currentPlankMetric.metric_name) === normalizeMetricValue(plankBaseName);

      if (hasSamePlankValues && mode !== "test") {
        setMetricsStatus("No metric changes detected.", "info");
        closeMetricCardEditor(card);
        return;
      }

      setMetricsStatus(mode === "test" ? "Logging new side-specific test score..." : "Saving side-specific metric update...", "info");

      state.client
        .from("athlete_metrics")
        .insert(plankPayloads)
        .select("*")
        .then(function (insertResult) {
          if (insertResult.error) {
            if (isMissingRelationError(insertResult.error)) {
              setMetricsStatus("Metrics table not found. Create athlete_metrics in Supabase before saving metrics.", "error");
              return;
            }

            if (isRlsError(insertResult.error)) {
              setMetricsStatus("Permission denied by database policy while saving metrics. Ask admin to update athlete_metrics RLS policy for coach edits.", "error");
              return;
            }

            setMetricsStatus(insertResult.error.message, "error");
            return;
          }

          var inserted = Array.isArray(insertResult.data) ? insertResult.data : plankPayloads;
          state.metrics = inserted.concat(state.metrics || []);
          state.metricsLatest = getLatestMetrics(state.metrics);
          renderMetricsCards();
          renderMetricRowsFromData(state.metricsLatest);
          setMetricsStatus(mode === "test" ? "New side-specific test score logged." : "Metric updated.", "success");
        })
        .catch(function (error) {
          setMetricsStatus(error && error.message ? error.message : "Failed to save metric.", "error");
        });
      return;
    }

    if (isEdgePull) {
      updateEdgePullDraftValue(card);

      var leftInput = card.querySelector('[data-metric-edit="left"]');
      var rightInput = card.querySelector('[data-metric-edit="right"]');
      var leftValueRaw = String((leftInput && leftInput.value) || "").trim();
      var rightValueRaw = String((rightInput && rightInput.value) || "").trim();
      var leftValue = parseNumericMetricValue(leftValueRaw);
      var rightValue = parseNumericMetricValue(rightValueRaw);

      if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) {
        setMetricsStatus("20mm Edge Pull requires both L Hand and R Hand values.", "error");
        return;
      }

      var baseName = String(name || "")
        .replace(/\s*\((left|right)\)\s*$/i, "")
        .trim();
      var leftName = baseName + " (Left)";
      var rightName = baseName + " (Right)";
      var leftText = formatMetricNumber(leftValue);
      var rightText = formatMetricNumber(rightValue);

      var payloads = [
        {
          user_id: viewedUserId,
          metric_name: leftName,
          metric_value: leftText,
          metric_unit: unit,
          metric_category: category,
          updated_at: new Date().toISOString()
        },
        {
          user_id: viewedUserId,
          metric_name: rightName,
          metric_value: rightText,
          metric_unit: unit,
          metric_category: category,
          updated_at: new Date().toISOString()
        }
      ];

      var metricKey = String(card.getAttribute("data-metric-key") || "");
      var currentMetric = findLatestMetricByKey(metricKey);
      var currentPair = currentMetric && currentMetric._pairedSideMetrics ? currentMetric._pairedSideMetrics : null;
      var currentLeft = parseNumericMetricValue(currentPair && currentPair.left && currentPair.left.metric_value);
      var currentRight = parseNumericMetricValue(currentPair && currentPair.right && currentPair.right.metric_value);
      var hasSameValues =
        Number.isFinite(currentLeft) && Number.isFinite(currentRight) &&
        currentLeft === leftValue &&
        currentRight === rightValue &&
        normalizeMetricValue(currentMetric && currentMetric.metric_unit) === normalizeMetricValue(unit) &&
        normalizeMetricValue(currentMetric && currentMetric.metric_category) === normalizeMetricValue(category) &&
        normalizeMetricValue(currentMetric && currentMetric.metric_name) === normalizeMetricValue(baseName);

      if (hasSameValues && mode !== "test") {
        setMetricsStatus("No metric changes detected.", "info");
        closeMetricCardEditor(card);
        return;
      }

      setMetricsStatus(mode === "test" ? "Logging new side-specific test score..." : "Saving side-specific metric update...", "info");

      state.client
        .from("athlete_metrics")
        .insert(payloads)
        .select("*")
        .then(function (insertResult) {
          if (insertResult.error) {
            if (isMissingRelationError(insertResult.error)) {
              setMetricsStatus("Metrics table not found. Create athlete_metrics in Supabase before saving metrics.", "error");
              return;
            }

            if (isRlsError(insertResult.error)) {
              setMetricsStatus("Permission denied by database policy while saving metrics. Ask admin to update athlete_metrics RLS policy for coach edits.", "error");
              return;
            }

            setMetricsStatus(insertResult.error.message, "error");
            return;
          }

          var inserted = Array.isArray(insertResult.data) ? insertResult.data : payloads;
          state.metrics = inserted.concat(state.metrics || []);
          state.metricsLatest = getLatestMetrics(state.metrics);
          renderMetricsCards();
          renderMetricRowsFromData(state.metricsLatest);
          setMetricsStatus(mode === "test" ? "New side-specific test score logged." : "Metric updated.", "success");
        })
        .catch(function (error) {
          setMetricsStatus(error && error.message ? error.message : "Failed to save metric.", "error");
        });
      return;
    }

    if (isYBalance) {
      updateYBalanceDraftValue(card);
      value = String((card.querySelector('[data-metric-edit="value"]') || {}).value || "").trim();
      if (!value) {
        setMetricsStatus("Y Balance requires L Leg and R Leg values.", "error");
        return;
      }
    }

    if (!name || !value) {
      setMetricsStatus("Metric name and value are required.", "error");
      return;
    }

    var payload = {
      user_id: viewedUserId,
      metric_name: name,
      metric_value: value,
      metric_unit: unit,
      metric_category: category,
      updated_at: new Date().toISOString()
    };

    var latestLookup = buildLatestMetricsLookup(state.metrics || []);
    var latest = latestLookup[getMetricKey(payload)];
    var isSameAsLatest = latest &&
      normalizeMetricValue(payload.metric_value) === normalizeMetricValue(latest.metric_value) &&
      normalizeMetricValue(payload.metric_unit) === normalizeMetricValue(latest.metric_unit) &&
      normalizeMetricValue(payload.metric_category) === normalizeMetricValue(latest.metric_category);

    if (isSameAsLatest && mode !== "test") {
      setMetricsStatus(
        "No metric changes detected.",
        "info"
      );
      closeMetricCardEditor(card);
      return;
    }

    setMetricsStatus(mode === "test" ? "Logging new test score..." : "Saving metric update...", "info");

    state.client
      .from("athlete_metrics")
      .insert([payload])
      .select("*")
      .then(function (insertResult) {
        if (insertResult.error) {
          if (isMissingRelationError(insertResult.error)) {
            setMetricsStatus("Metrics table not found. Create athlete_metrics in Supabase before saving metrics.", "error");
            return;
          }

          if (isRlsError(insertResult.error)) {
            setMetricsStatus("Permission denied by database policy while saving metrics. Ask admin to update athlete_metrics RLS policy for coach edits.", "error");
            return;
          }

          setMetricsStatus(insertResult.error.message, "error");
          return;
        }

        var inserted = Array.isArray(insertResult.data) ? insertResult.data : [payload];
        state.metrics = inserted.concat(state.metrics || []);
        state.metricsLatest = getLatestMetrics(state.metrics);
        renderMetricsCards();
        renderMetricRowsFromData(state.metricsLatest);
        setMetricsStatus(mode === "test" ? "New test score logged." : "Metric updated.", "success");
      })
      .catch(function (error) {
        setMetricsStatus(error && error.message ? error.message : "Failed to save metric.", "error");
      });
  }

  function setPasswordStatus(message, variant) {
    if (!state.passwordStatus) {
      return;
    }

    state.passwordStatus.textContent = message || "";
    state.passwordStatus.classList.remove("is-error", "is-success", "is-info");

    if (!message) {
      return;
    }

    if (variant === "error") {
      state.passwordStatus.classList.add("is-error");
    } else if (variant === "success") {
      state.passwordStatus.classList.add("is-success");
    } else {
      state.passwordStatus.classList.add("is-info");
    }
  }

  function getSelectedSportsFromForm() {
    if (!state.form) {
      return [];
    }

    var nodes = Array.prototype.slice.call(state.form.querySelectorAll('input[name="sports[]"]:checked'));
    var sports = nodes
      .map(function (node) {
        return String(node.value || "").trim();
      })
      .filter(function (value) {
        return !!value;
      });

    return Array.from(new Set(sports));
  }

  function setSelectedSportsInForm(sports) {
    if (!state.form) {
      return;
    }

    var selectedLookup = {};
    (sports || []).forEach(function (sport) {
      selectedLookup[String(sport)] = true;
    });

    state.form.querySelectorAll('input[name="sports[]"]').forEach(function (node) {
      node.checked = !!selectedLookup[String(node.value || "")];
    });
  }

  function getProfileSports(profile) {
    var local = loadLocalSportProfile();
    var sportsFromProfile = [];

    if (profile && Array.isArray(profile.sports)) {
      sportsFromProfile = profile.sports;
    } else if (profile && profile.sports) {
      sportsFromProfile = parseSportsValue(profile.sports);
    } else if (profile && profile.sport) {
      sportsFromProfile = parseSportsValue(profile.sport);
    }

    if (!sportsFromProfile.length && local && Array.isArray(local.sports)) {
      sportsFromProfile = local.sports;
    }

    return Array.from(new Set(
      (sportsFromProfile || [])
        .map(function (sport) {
          return String(sport || "").trim();
        })
        .filter(function (sport) {
          return !!sport;
        })
    ));
  }

  function parseSportsValue(value) {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    var text = String(value).trim();
    if (!text) {
      return [];
    }

    if (text[0] === "[") {
      var parsedArray = safeJsonParse(text);
      if (Array.isArray(parsedArray)) {
        return parsedArray;
      }
    }

    return text
      .split(",")
      .map(function (part) {
        return String(part || "").trim();
      })
      .filter(function (part) {
        return !!part;
      });
  }

  function getProfileSportOverview(profile) {
    var local = loadLocalSportProfile();
    var baseOverview = {};

    if (profile && profile.sport_overview && typeof profile.sport_overview === "object") {
      baseOverview = profile.sport_overview;
    } else if (profile && profile.sport_overview) {
      baseOverview = safeJsonParse(profile.sport_overview) || {};
    }

    if (local && local.sport_overview && typeof local.sport_overview === "object") {
      return Object.assign({}, local.sport_overview, baseOverview);
    }

    return baseOverview;
  }

  function renderSportOverviewEditor(selectedSports, existingOverview) {
    if (!state.sportOverviewEditor) {
      return;
    }

    var sports = (selectedSports || []).slice();
    var overview = existingOverview || {};
    if (!sports.length) {
      state.sportOverviewEditor.innerHTML =
        '<p class="sport-overview-empty">Select one or more sports to customize your overview details.</p>';
      return;
    }

    var cards = sports.map(function (sport) {
      var sportLabel = getSportLabel(sport);
      var fields = state.sportOverviewTemplates[sport] || [
        { key: "notes", label: "Sport Notes", placeholder: "Add sport-specific context", type: "text" }
      ];
      var sportValues = overview && overview[sport] && typeof overview[sport] === "object"
        ? overview[sport]
        : {};

      var fieldMarkup = fields.map(function (field) {
        var rawFieldValue = sportValues[field.key];
        var fieldValue = rawFieldValue == null ? "" : String(rawFieldValue);
        var fieldType = String(field.type || "text").toLowerCase();
        if (fieldType === "multi-select") {
          var multiOptions = Array.isArray(field.options) ? field.options : [];
          var selectedValues = normalizeMultiValue(rawFieldValue);
          var selectedLookup = {};
          selectedValues.forEach(function (value) {
            selectedLookup[String(value || "").toLowerCase()] = true;
          });

          var multiOptionMarkup = multiOptions.map(function (option) {
            var optionValue = typeof option === "object" && option
              ? String(option.value || option.label || "")
              : String(option || "");
            if (!optionValue) {
              return "";
            }
            var optionLabel = typeof option === "object" && option
              ? String(option.label || option.value || optionValue)
              : optionValue;
            var checkedAttr = selectedLookup[optionValue.toLowerCase()] ? ' checked' : '';
            var optionId = 'overview-' + sport + '-' + field.key + '-' + optionValue
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");
            return (
              '<label class="sport-overview-chip" for="' + escapeAttribute(optionId) + '">' +
              '<input id="' + escapeAttribute(optionId) + '" type="checkbox" data-sport-overview-field data-field-type="multi-check" data-overview-key="' +
              escapeAttribute(field.key) +
              '" value="' +
              escapeAttribute(optionValue) +
              '"' + checkedAttr + ' />' +
              '<span>' + escapeHtml(optionLabel) + '</span>' +
              '</label>'
            );
          }).join("");

          return (
            '<div class="sport-overview-field">' +
            '<label>' + escapeHtml(field.label) + "</label>" +
            '<div class="sport-overview-chip-group">' + multiOptionMarkup + '</div>' +
            "</div>"
          );
        }

        if (fieldType === "select") {
          var options = Array.isArray(field.options) ? field.options : [];
          var placeholder = String(field.placeholder || "Select an option");
          var optionMarkup = ['<option value="">' + escapeHtml(placeholder) + '</option>'];
          options.forEach(function (option) {
            var optionValue = typeof option === "object" && option
              ? String(option.value || option.label || "")
              : String(option || "");
            if (!optionValue) {
              return;
            }
            var optionLabel = typeof option === "object" && option
              ? String(option.label || option.value || optionValue)
              : optionValue;
            var selectedAttr = fieldValue.toLowerCase() === optionValue.toLowerCase() ? ' selected' : '';
            optionMarkup.push(
              '<option value="' + escapeAttribute(optionValue) + '"' + selectedAttr + '>' +
              escapeHtml(optionLabel) +
              '</option>'
            );
          });

          return (
            '<div class="sport-overview-field">' +
            '<label>' + escapeHtml(field.label) + "</label>" +
            '<select data-sport-overview-field data-overview-key="' +
            escapeAttribute(field.key) +
            '\">' + optionMarkup.join("") + '</select>' +
            "</div>"
          );
        }

        if (fieldType === "textarea") {
          return (
            '<div class="sport-overview-field">' +
            '<label>' + escapeHtml(field.label) + "</label>" +
            '<textarea data-sport-overview-field data-overview-key="' +
            escapeAttribute(field.key) +
            '" rows="' +
            escapeAttribute(String(field.rows || "3")) +
            '" placeholder="' +
            escapeAttribute(field.placeholder || "") +
            '">' +
            escapeHtml(fieldValue) +
            '</textarea>' +
            "</div>"
          );
        }

        var minAttr = field.min != null ? ' min="' + escapeAttribute(String(field.min)) + '"' : "";
        var maxAttr = field.max != null ? ' max="' + escapeAttribute(String(field.max)) + '"' : "";
        var stepAttr = field.step != null ? ' step="' + escapeAttribute(String(field.step)) + '"' : "";
        return (
          '<div class="sport-overview-field">' +
          '<label>' + escapeHtml(field.label) + "</label>" +
          '<input type="' + escapeAttribute(fieldType || "text") + '" data-sport-overview-field data-overview-key="' +
          escapeAttribute(field.key) +
          '" value="' +
          escapeAttribute(fieldValue) +
          '" placeholder="' +
          escapeAttribute(field.placeholder || "") +
          '"' + minAttr + maxAttr + stepAttr + ' />' +
          "</div>"
        );
      }).join("");

      return (
        '<section class="sport-overview-card" data-sport-overview-card data-sport-key="' +
        escapeAttribute(sport) +
        '">' +
        '<h4>' +
        escapeHtml(sportLabel) +
        " Overview</h4>" +
        '<div class="sport-overview-fields">' + fieldMarkup + "</div>" +
        "</section>"
      );
    });

    state.sportOverviewEditor.innerHTML = cards.join("");
  }

  function collectSportOverviewFromForm() {
    if (!state.sportOverviewEditor) {
      return {};
    }

    var overview = {};
    state.sportOverviewEditor.querySelectorAll("[data-sport-overview-card]").forEach(function (card) {
      var sport = String(card.getAttribute("data-sport-key") || "").trim();
      if (!sport) {
        return;
      }

      var sportValues = {};
      card.querySelectorAll("[data-sport-overview-field]").forEach(function (input) {
        var key = String(input.getAttribute("data-overview-key") || "").trim();
        if (!key) {
          return;
        }

        var fieldType = String(input.getAttribute("data-field-type") || "").toLowerCase();
        if (fieldType === "multi-check") {
          if (input.checked) {
            if (!Array.isArray(sportValues[key])) {
              sportValues[key] = [];
            }
            sportValues[key].push(String(input.value || "").trim());
          }
          return;
        }

        var value = String(input.value || "").trim();
        if (value) {
          sportValues[key] = value;
        }
      });

      if (Object.keys(sportValues).length) {
        overview[sport] = sportValues;
      }
    });

    return overview;
  }

  function formatSportsDisplay(sports) {
    if (!sports || !sports.length) {
      return "—";
    }

    return sports
      .slice(0, 3)
      .map(getSportLabel)
      .join(", ");
  }

  function renderSportOverviewSummary(profile) {
    if (!state.sportOverviewSummary) {
      return;
    }

    var sports = getProfileSports(profile);
    var overview = getProfileSportOverview(profile);
    if (!sports.length) {
      state.sportOverviewSummary.hidden = true;
      state.sportOverviewSummary.innerHTML = "";
      return;
    }

    var summaryCards = sports.map(function (sport) {
      var details = overview && overview[sport] && typeof overview[sport] === "object"
        ? overview[sport]
        : {};
      
      // Special handling for climbing to include ape index calculation
      var detailEntries;
      if (sport === "climbing") {
        detailEntries = buildClimbingDetailEntries(details, profile);
      } else {
        detailEntries = Object.keys(details || {}).map(function (key) {
          return '<li><strong>' + escapeHtml(prettifyOverviewKey(key)) + ':</strong> ' + escapeHtml(formatOverviewValue(details[key])) + "</li>";
        }).join("");
      }

      return (
        '<article class="profile-sport-summary-card">' +
        '<h3>' + escapeHtml(getSportLabel(sport)) + "</h3>" +
        (detailEntries
          ? '<ul class="profile-sport-summary-list">' + detailEntries + "</ul>"
          : '<p class="profile-sport-summary-empty">No sport-specific details added yet.</p>') +
        "</article>"
      );
    }).join("");

    state.sportOverviewSummary.hidden = false;
    state.sportOverviewSummary.innerHTML = '<div class="profile-sport-summary-grid">' + summaryCards + "</div>";
  }

  function buildClimbingDetailEntries(details, profile) {
    var entries = [];
    
    // Add climbing-specific detail entries
    var climbingKeys = ["climbing_type", "climbing_grade", "climbing_focus"];
    climbingKeys.forEach(function (key) {
      if (details[key]) {
        entries.push(
          '<li><strong>' + escapeHtml(prettifyOverviewKey(key)) + ':</strong> ' + 
          escapeHtml(formatOverviewValue(details[key])) + "</li>"
        );
      }
    });

    // Add ape index calculation if we have arm_span or height
    var armSpan = details.arm_span ? parseFloat(details.arm_span) : (profile && profile.arm_span_cm ? profile.arm_span_cm : null);
    var height = profile && profile.height_cm ? profile.height_cm : null;
    
    if (armSpan && height && typeof ApeIndexUtil !== "undefined") {
      var apeResult = ApeIndexUtil.calculateApeIndex(armSpan, height);
      if (apeResult.valid) {
        entries.push(
          '<li><strong>Ape Index:</strong> ' + 
          escapeHtml(ApeIndexUtil.formatForDisplay(apeResult, "short")) + 
          ' (' + escapeHtml(apeResult.classification) + ')</li>'
        );
      }
    }

    return entries.join("");
  }

  function prettifyOverviewKey(key) {
    return String(key || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, function (char) {
        return char.toUpperCase();
      });
  }

  function normalizeMultiValue(value) {
    if (value == null) {
      return [];
    }

    if (Array.isArray(value)) {
      return value
        .map(function (item) {
          return String(item || "").trim();
        })
        .filter(function (item) {
          return !!item;
        });
    }

    return String(value)
      .split(",")
      .map(function (item) {
        return String(item || "").trim();
      })
      .filter(function (item) {
        return !!item;
      });
  }

  function formatOverviewValue(value) {
    if (Array.isArray(value)) {
      return value
        .map(function (item) {
          return String(item || "").trim();
        })
        .filter(function (item) {
          return !!item;
        })
        .join(", ");
    }
    return String(value == null ? "" : value);
  }

  function getSportLabel(sport) {
    var value = String(sport || "").trim();
    if (!value) {
      return "";
    }
    return normalizeDisplayValue(value);
  }

  function getSportProfileStorageKey(userId) {
    return "nomadic_sport_profile_" + String(userId || "unknown");
  }

  function persistLocalSportProfile(profileData) {
    var viewedUserId = getViewedUserId();
    if (!viewedUserId) {
      return;
    }

    try {
      window.localStorage.setItem(
        getSportProfileStorageKey(viewedUserId),
        JSON.stringify({
          sports: Array.isArray(profileData.sports) ? profileData.sports : [],
          sport_overview: profileData.sport_overview && typeof profileData.sport_overview === "object"
            ? profileData.sport_overview
            : {}
        })
      );
    } catch (e) {
      // Ignore storage errors.
    }
  }

  function mergeLocalSportProfile(profile) {
    var localData = loadLocalSportProfile();

    if (!profile && !localData) {
      return null;
    }

    var merged = Object.assign({}, profile || {});
    var localSports = localData && Array.isArray(localData.sports) ? localData.sports : [];
    var profileSports = [];
    if (profile && Array.isArray(profile.sports)) {
      profileSports = profile.sports;
    } else if (profile && profile.sports) {
      profileSports = parseSportsValue(profile.sports);
    } else if (profile && profile.sport) {
      profileSports = parseSportsValue(profile.sport);
    }

    profileSports = Array.from(new Set(profileSports.map(function (sport) {
      return String(sport || "").trim();
    }).filter(function (sport) {
      return !!sport;
    })));

    var finalSports = profileSports.length ? profileSports : localSports;
    if (finalSports.length) {
      merged.sports = finalSports;
      merged.sport = merged.sport || finalSports[0];
    }

    var profileOverview = {};
    if (profile && profile.sport_overview && typeof profile.sport_overview === "object") {
      profileOverview = profile.sport_overview;
    } else if (profile && profile.sport_overview) {
      profileOverview = safeJsonParse(profile.sport_overview) || {};
    }

    var localOverview = localData && localData.sport_overview && typeof localData.sport_overview === "object"
      ? localData.sport_overview
      : {};
    merged.sport_overview = Object.assign({}, localOverview, profileOverview);
    return merged;
  }

  function loadLocalSportProfile() {
    var viewedUserId = getViewedUserId();
    if (!viewedUserId) {
      return null;
    }

    try {
      return safeJsonParse(window.localStorage.getItem(getSportProfileStorageKey(viewedUserId)) || "") || null;
    } catch (e) {
      return null;
    }
  }

  function safeJsonParse(value) {
    try {
      return JSON.parse(String(value || ""));
    } catch (e) {
      return null;
    }
  }

  function getMissingColumnName(error) {
    var message = String((error && error.message) || "");
    var details = String((error && error.details) || "");
    var text = message + " " + details;

    // Pattern: "... the 'sport_overview' column of 'athlete_profiles' in the schema cache"
    var quotedBeforeColumn = text.match(/['\"]([a-zA-Z0-9_]+)['\"]\s+column/i);
    if (quotedBeforeColumn && quotedBeforeColumn[1]) {
      return quotedBeforeColumn[1];
    }

    // Pattern: "column 'height_cm' does not exist"
    var columnThenName = text.match(/column\s+['\"]?([a-zA-Z0-9_]+)['\"]?/i);
    if (columnThenName && columnThenName[1]) {
      return columnThenName[1];
    }

    // Pattern: "Could not find the sport_overview column"
    var findColumn = text.match(/find\s+the\s+['\"]?([a-zA-Z0-9_]+)['\"]?\s+column/i);
    if (findColumn && findColumn[1]) {
      return findColumn[1];
    }

    return null;
  }

  function normalizeDisplayValue(value) {
    if (!value) {
      return "—";
    }

    var text = String(value);
    return text
      .split("-")
      .join(" ")
      .replace(/\b\w/g, function (c) {
        return c.toUpperCase();
      });
  }

  function isMissingRelationError(error) {
    var msg = error && error.message ? error.message.toLowerCase() : "";
    return error && error.code === "42P01" || msg.indexOf("does not exist") > -1;
  }

  function isMissingFunctionError(error) {
    var msg = error && error.message ? error.message.toLowerCase() : "";
    var code = error && error.code ? String(error.code) : "";
    return code === "42883" || (msg.indexOf("function") > -1 && msg.indexOf("does not exist") > -1);
  }

  function isMissingRelationshipError(error) {
    var msg = error && error.message ? error.message.toLowerCase() : "";
    return msg.indexOf("could not find a relationship") > -1;
  }

  function isMissingColumnError(error) {
    var msg = error && error.message ? error.message.toLowerCase() : "";
    var code = error && error.code ? String(error.code) : "";
    return code === "42703" ||
      code === "PGRST204" ||
      msg.indexOf("column") > -1 && msg.indexOf("does not exist") > -1 ||
      msg.indexOf("schema cache") > -1 && msg.indexOf("column") > -1;
  }

  function isRlsError(error) {
    var msg = error && error.message ? error.message.toLowerCase() : "";
    return error && error.code === "42501" || msg.indexOf("row-level security") > -1 || msg.indexOf("violates row-level security") > -1;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "");
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
      return dateString;
    }
  }
})();
