# Performance Intelligence System Design

## Objective
Turn Nomadic into a decision engine that improves both athletic outcomes and coding performance by tracking:
- inputs (training + programming decisions)
- internal state (recovery/readiness)
- outputs (session quality + work output)
- outcomes (performance tests, milestones, injury risk)

## Data Collection Phases

### Phase 1 (MVP: start now)
Collect daily/session data in these domains:
1. Recovery / readiness
- sleep_hours
- sleep_efficiency
- hrv_ms
- resting_hr
- recovery_score
- soreness_score
- fatigue_score

2. Programming metadata per session
- block_name, mesocycle, microcycle_week, phase
- progression_strategy
- deload_week
- session_intent
- constraints

3. Cognitive / software output
- deep_work_hours
- focus_score
- cognitive_sharpness_score
- commits_count
- prs_merged_count
- bug_count
- cycle_time_hours

4. Context / confounders
- stress_score
- travel_day
- timezone_shift_hours
- illness_flag
- caffeine_mg
- alcohol_units
- bodyweight_kg
- hydration_score

### Phase 2 (after 4 to 6 weeks of MVP data)
Add:
- nutrition adherence and macro quality signals
- richer sleep staging metrics
- intervention tags (breathwork, sauna, cold, mobility)
- automated wearable sync connectors for all supported providers

## Derived Metrics (computed daily/weekly)

1. Recovery debt score
- Combine sleep deviation, HRV deviation, resting HR delta, soreness, fatigue.

2. Adherence score
- planned sessions completed over 7/30 days.

3. Training monotony and strain
- monotony = mean daily load / std dev daily load
- strain = weekly load x monotony

4. Acute:Chronic ratio
- 7-day load / 28-day load, by modality.

5. Programming effectiveness index
- performance improvement per unit of load while controlling for confounders.

## Dashboard Spec

### Coach: Load & Intelligence Tab (athlete-insight)
Top row cards:
- Recovery status (today and 7-day trend)
- 7-day total training load
- 30-day adherence
- Cognitive output score (7-day)

Sections:
1. Readiness & Recovery
- HRV, resting HR, sleep, recovery score trends
- baseline bands + outlier markers

2. Strength Load
- daily/weekly/monthly volume load
- movement pattern distribution
- volume by intent (strength/hypertrophy/power if tagged)

3. Endurance Load
- daily/weekly/monthly mileage
- training load and activity count
- modality split (run/bike/hike/ski)

4. Programming Context
- current block, week, progression strategy
- deload flag and constraint tags

5. Correlation Insights
- top positive and negative associations for last 30/60/90 days
- example: sleep consistency vs session completion quality

### Athlete: Compass + Action
Expose only actionable outputs:
- today recommendation (push / maintain / deload)
- key reason codes (sleep debt, high monotony, high readiness)
- one coaching note + next objective

## Correlation Framework
Use rolling, within-athlete analysis first.

Rules:
1. Use athlete-specific baselines (not population thresholds).
2. Run lag windows (0-day, 1-day, 2-3 day effects).
3. Segment by phase (build/deload/taper) before interpreting.
4. Control for confounders from athlete_context_daily.

Priority correlation tests:
1. hrv_ms, sleep_hours -> next-day session completion quality
2. acute:chronic ratio -> injury/pain proxy events
3. strain + monotony -> cognitive_sharpness_score and bug_count
4. movement-pattern load -> periodic test outcomes
5. recovery debt -> deep_work_hours and cycle_time_hours

## Experimentation Framework

### Unit of change
One programming adjustment at a time per 2 to 4 week window.

### Experiment template
- hypothesis
- intervention
- primary metric
- guardrail metrics
- evaluation window
- success threshold

Example:
- hypothesis: reducing lower-body weekly volume by 15% improves coding focus without hurting strength progress
- intervention: reduce lower-body sets for 2 weeks
- primary metric: focus_score 7-day average
- guardrails: top set load, soreness_score, fatigue_score
- success: +1.0 focus_score with no decline in top set load > 3%

### Decision cadence
- weekly: monitor guardrails and data quality
- biweekly: assess trend direction
- end-window: accept/reject/iterate intervention

## Data Quality Rules
1. Require one daily recovery entry for any day with completed training.
2. Flag stale wearable data (> 72h) in UI.
3. Keep metric definitions versioned (no silent semantic changes).
4. Backfill nulls intentionally; do not auto-impute in source tables.
5. Track source field (manual/device/import) for trust scoring.

## Initial Build Checklist
1. Run migration: sql/create-performance-intelligence-foundation.sql.
2. Add write paths in frontend for the new daily forms.
3. Add aggregation queries for 7/30-day summaries.
4. Render correlation insight cards behind a minimum-data threshold.
5. Add experiment log UI and outcomes review panel.
