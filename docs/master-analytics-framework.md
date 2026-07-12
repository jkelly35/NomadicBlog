# Master Analytics Framework

## Intent
Operationalize coach analytics into a consistent taxonomy so analysis can scale from individual athlete decisions to population-level performance research.

## Categories

1. Athlete Profile
- Purpose: Who is this athlete?
- Core fields: age, sex, height, weight, location/elevation, training age, sport age, occupation constraints, injury and surgery history.

2. Sport Profile
- Purpose: What sports do they do and at what level?
- Core fields: primary and secondary sports, seasonal priority, current level, goal level, event calendar.

3. Goal Profile
- Purpose: What are they training for?
- Core fields: goals, target events, constraints, success criteria.

4. Training Load
- Purpose: What are they doing?
- Core fields: session type, sport, duration, RPE, load, sets/reps/load, mileage, vertical gain, planned versus completed.

5. Wearable Physiology
- Purpose: How is their body responding?
- Core fields: HRV, resting HR, sleep duration and efficiency, sleep stages, respiratory rate, skin temperature deviation, device readiness.

6. Subjective Readiness
- Purpose: How do they feel?
- Core fields: sleep quality, energy, stress, soreness, motivation, mood, readiness, pain, fatigue.

7. Performance Testing
- Purpose: What can they physically do?
- Core fields: strength, power, endurance, sport-specific tests, symmetry markers.

8. Movement and Mobility
- Purpose: How do they move?
- Core fields: joint ROM, movement quality, mobility restrictions, asymmetry.

9. Injury and Pain
- Purpose: What limits them?
- Core fields: pain intensity and frequency, symptom location, modified sessions, diagnosis, recurrence.

10. Recovery and Lifestyle
- Purpose: What affects adaptation?
- Core fields: sleep schedule, travel, work stress, hydration confidence, nutrition quality, alcohol.

11. Program Adherence
- Purpose: Are they doing the plan?
- Core fields: planned versus completed sessions, check-in completion, mobility and recovery completion.

12. Outcomes
- Purpose: Did performance improve?
- Core fields: sport outcomes, milestone progress, pain-free participation, satisfaction.

13. Membership and Business
- Purpose: What drives retention and sustainability?
- Core fields: lead source, conversion, retention, cancellation reasons, NPS, feature usage.

## Priority Research Questions

1. Does assessment score predict future performance improvement?
2. Does consistency score predict goal progress?
3. Does sleep quality predict readiness better than HRV?
4. Does HRV predict next-day or next-week performance?
5. Does training load spike predict pain flare-ups?
6. Does strength training adherence predict sport performance improvement?
7. Does sport-specific strength testing correlate with sport level?
8. In climbers, does 20 mm edge strength correlate with climbing grade?
9. In runners, does calf capacity correlate with pain-free mileage?
10. In skiers, does single-leg strength correlate with ski-day tolerance?
11. Does direct messaging and check-in completion improve retention?
12. Which variables best predict membership renewal?

## Day One Minimum Data Model

1. Athlete table
- athlete ID, demographics, sports, goals, injury history, training age, membership status.

2. Daily table
- date, athlete ID, wearable metrics, subjective metrics, pain, completed training flag.

3. Session table
- date, athlete ID, session details, load, exercise details, pain during and after, notes.

4. Assessment table
- date, athlete ID, test name, result, unit, side, method/device, pain flag, notes.

5. Outcome table
- date, athlete ID, outcome type, goal progress, injury status, satisfaction, renewal status.

## Implementation in This Repository

Migration added:
- sql/create-analytics-catalog-and-assessment-outcomes.sql

This migration creates:
- analytics_categories
- analytics_metric_catalog
- analytics_research_questions
- athlete_assessment_events
- athlete_outcome_events

It also seeds:
- The master analytics category list
- 12 priority research questions
- A starter metric catalog including climbing-specific and business metrics

## Notes on Analysis Integrity

1. Analyze wearable trends within-athlete before cross-athlete pooling.
2. Keep device source and method metadata for wearable values.
3. Treat acute:chronic ratios as one signal, not a single risk predictor.
4. Separate sensitive metrics (for example pain, cycle-related data) for privacy and role controls.
5. Use lag windows for causal hypotheses (same day, +1 day, +2 to 3 days).
