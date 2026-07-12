-- Nomadic Performance - derived performance metrics layer
-- Purpose: compute predictive, normalized features per athlete from raw tests/logs.
-- Run in Supabase SQL editor after core analytics tables exist.

begin;

create or replace function public.safe_to_numeric(p_value text)
returns numeric
language sql
immutable
as $$
  with cleaned as (
    select regexp_replace(coalesce(p_value, ''), '[^0-9\.\-]+', '', 'g') as value_text
  )
  select case
    when value_text ~ '^-?[0-9]+(\.[0-9]+)?$' then value_text::numeric
    else null
  end
  from cleaned;
$$;

create or replace view public.athlete_derived_metrics_latest as
with profiles as (
  select
    ap.user_id,
    ap.created_at as profile_created_at,
    ap.weight_kg as profile_weight_kg,
    coalesce(ap.sports, array[]::text[]) as sports,
    lower(trim(coalesce(ap.sport, ''))) as primary_sport
  from public.athlete_profiles ap
),
raw_metric_rows as (
  select
    am.user_id,
    lower(trim(am.metric_name)) as metric_name_norm,
    am.metric_name,
    public.safe_to_numeric(am.metric_value) as value_num,
    am.updated_at as observed_at
  from public.athlete_metrics am
),
raw_assessment_rows as (
  select
    ae.athlete_user_id as user_id,
    lower(trim(ae.test_name)) as metric_name_norm,
    ae.test_name as metric_name,
    coalesce(ae.result_numeric, public.safe_to_numeric(ae.result_value)) as value_num,
    coalesce(ae.updated_at, ae.created_at, ae.assessment_date::timestamptz) as observed_at
  from public.athlete_assessment_events ae
),
raw_rows as (
  select * from raw_metric_rows
  union all
  select * from raw_assessment_rows
),
latest_raw as (
  select distinct on (user_id, metric_name_norm)
    user_id,
    metric_name_norm,
    metric_name,
    value_num,
    observed_at
  from raw_rows
  where value_num is not null
  order by user_id, metric_name_norm, observed_at desc nulls last
),
latest_context_weight as (
  select distinct on (acd.athlete_user_id)
    acd.athlete_user_id as user_id,
    acd.bodyweight_kg
  from public.athlete_context_daily acd
  where acd.bodyweight_kg is not null
  order by acd.athlete_user_id, acd.context_date desc, acd.updated_at desc
),
latest_weight_metric as (
  select distinct on (lr.user_id)
    lr.user_id,
    lr.value_num as weight_kg
  from latest_raw lr
  where lr.metric_name_norm in ('weight', 'body weight', 'bodyweight', 'weight kg', 'weight_kg')
  order by lr.user_id, lr.observed_at desc nulls last
),
workload as (
  select
    eh.athlete_user_id as user_id,
    sum(case when eh.workout_completed_at >= now() - interval '7 days' then coalesce(eh.volume_load, 0) else 0 end) as weekly_training_volume,
    (sum(case when eh.workout_completed_at >= now() - interval '28 days' then coalesce(eh.volume_load, 0) else 0 end) / 4.0) as rolling_weekly_volume_4w_avg,
    min(eh.workout_completed_at) as first_workout_at
  from public.athlete_exercise_history eh
  group by eh.athlete_user_id
),
first_assessment as (
  select
    ae.athlete_user_id as user_id,
    min(coalesce(ae.assessment_date::timestamptz, ae.created_at)) as first_assessment_at
  from public.athlete_assessment_events ae
  group by ae.athlete_user_id
),
first_metric as (
  select
    am.user_id,
    min(am.updated_at) as first_metric_at
  from public.athlete_metrics am
  group by am.user_id
),
latest_signal as (
  select
    p.user_id,
    coalesce(p.profile_weight_kg, lcw.bodyweight_kg, lwm.weight_kg) as body_weight_kg,
    p.primary_sport,
    p.sports,
    p.profile_created_at,

    max(case when lr.metric_name_norm in ('grip strength', 'grip strength kg', 'max grip strength') then lr.value_num end) as grip_strength_kg,
    max(case when lr.metric_name_norm in ('pull up max', 'pull-up max', 'max pull ups', 'max pull-ups', 'pull ups', 'pull-ups') then lr.value_num end) as pullups_max_reps,
    max(case when lr.metric_name_norm in ('jump height', 'vertical jump', 'relative jump height', 'broad jump') then lr.value_num end) as jump_height_metric,
    max(case when lr.metric_name_norm in ('single leg strength', 'single-leg strength', 'single leg squat', 'single-leg squat') then lr.value_num end) as single_leg_strength,
    max(case when lr.metric_name_norm in ('20mm edge hang strength', '20mm edge hang', 'edge_20mm_strength') then lr.value_num end) as edge_hang_strength,
    max(case when lr.metric_name_norm in ('pain score', 'pain') then lr.value_num end) as pain_score,
    max(case when lr.metric_name_norm in ('climbing grade', 'climbing grades') then lr.value_num end) as climbing_grade_numeric,
    max(case when lr.metric_name_norm like '%y-balance%' then lr.value_num end) as y_balance_metric,
    max(case when lr.metric_name_norm like '%side plank%' then lr.value_num end) as side_plank_metric,
    max(case when lr.metric_name_norm in ('calf capacity', 'single leg heel raise', 'single-leg heel raise') then lr.value_num end) as calf_capacity,

    max(case when lr.metric_name_norm like '%(left)%' then lr.value_num end) as left_side_value,
    max(case when lr.metric_name_norm like '%(right)%' then lr.value_num end) as right_side_value,

    max(lr.observed_at) as latest_signal_at
  from profiles p
  left join latest_context_weight lcw on lcw.user_id = p.user_id
  left join latest_weight_metric lwm on lwm.user_id = p.user_id
  left join latest_raw lr on lr.user_id = p.user_id
  group by p.user_id, p.primary_sport, p.sports, p.profile_created_at, p.profile_weight_kg, lcw.bodyweight_kg, lwm.weight_kg
),
derived as (
  select
    ls.user_id,
    now() as computed_at,

    case when ls.body_weight_kg > 0 then ls.grip_strength_kg / ls.body_weight_kg else null end as relative_grip_strength,
    case when ls.body_weight_kg > 0 then ls.pullups_max_reps / ls.body_weight_kg else null end as pullups_per_kg_bodyweight,
    case when ls.body_weight_kg > 0 then ls.jump_height_metric / ls.body_weight_kg else null end as relative_jump_height,

    case
      when ls.left_side_value is not null and ls.right_side_value is not null and greatest(abs(ls.left_side_value), abs(ls.right_side_value)) > 0
      then (abs(ls.left_side_value - ls.right_side_value) / greatest(abs(ls.left_side_value), abs(ls.right_side_value))) * 100.0
      else null
    end as left_right_asymmetry_pct,

    (
      coalesce(ls.single_leg_strength, 0)
      + coalesce(ls.jump_height_metric, 0)
      + coalesce(ls.calf_capacity, 0)
    ) / nullif(
      (case when ls.single_leg_strength is not null then 1 else 0 end)
      + (case when ls.jump_height_metric is not null then 1 else 0 end)
      + (case when ls.calf_capacity is not null then 1 else 0 end),
      0
    ) as composite_lower_body_score,

    (
      coalesce(ls.grip_strength_kg, 0)
      + coalesce(ls.pullups_max_reps, 0)
      + coalesce(ls.edge_hang_strength, 0)
    ) / nullif(
      (case when ls.grip_strength_kg is not null then 1 else 0 end)
      + (case when ls.pullups_max_reps is not null then 1 else 0 end)
      + (case when ls.edge_hang_strength is not null then 1 else 0 end),
      0
    ) as composite_upper_body_score,

    (
      coalesce(case when ls.body_weight_kg > 0 then ls.grip_strength_kg / ls.body_weight_kg end, 0)
      + coalesce(case when ls.body_weight_kg > 0 then ls.pullups_max_reps / ls.body_weight_kg end, 0)
      + coalesce(case when ls.body_weight_kg > 0 then ls.jump_height_metric / ls.body_weight_kg end, 0)
    ) / nullif(
      (case when ls.grip_strength_kg is not null and ls.body_weight_kg > 0 then 1 else 0 end)
      + (case when ls.pullups_max_reps is not null and ls.body_weight_kg > 0 then 1 else 0 end)
      + (case when ls.jump_height_metric is not null and ls.body_weight_kg > 0 then 1 else 0 end),
      0
    ) as relative_power_index,

    (
      coalesce(ls.y_balance_metric, 0)
      + coalesce(ls.side_plank_metric, 0)
    ) / nullif(
      (case when ls.y_balance_metric is not null then 1 else 0 end)
      + (case when ls.side_plank_metric is not null then 1 else 0 end),
      0
    ) as mobility_score,

    (
      coalesce(ls.grip_strength_kg, 0)
      + coalesce(ls.pullups_max_reps, 0)
      + coalesce(ls.single_leg_strength, 0)
      + coalesce(ls.edge_hang_strength, 0)
    ) / nullif(
      (case when ls.grip_strength_kg is not null then 1 else 0 end)
      + (case when ls.pullups_max_reps is not null then 1 else 0 end)
      + (case when ls.single_leg_strength is not null then 1 else 0 end)
      + (case when ls.edge_hang_strength is not null then 1 else 0 end),
      0
    ) as strength_score,

    (
      coalesce(w.weekly_training_volume, 0)
      + coalesce(ls.calf_capacity, 0)
    ) / nullif(
      (case when w.weekly_training_volume is not null then 1 else 0 end)
      + (case when ls.calf_capacity is not null then 1 else 0 end),
      0
    ) as endurance_score,

    (
      coalesce(ls.edge_hang_strength, 0)
      + coalesce(ls.climbing_grade_numeric, 0)
      + coalesce(case when ls.body_weight_kg > 0 then ls.grip_strength_kg / ls.body_weight_kg end, 0)
    ) / nullif(
      (case when ls.edge_hang_strength is not null then 1 else 0 end)
      + (case when ls.climbing_grade_numeric is not null then 1 else 0 end)
      + (case when ls.grip_strength_kg is not null and ls.body_weight_kg > 0 then 1 else 0 end),
      0
    ) as climbing_specific_performance_index,

    (
      coalesce(ls.single_leg_strength, 0)
      + coalesce(ls.calf_capacity, 0)
      + coalesce(
        case
          when ls.left_side_value is not null and ls.right_side_value is not null and greatest(abs(ls.left_side_value), abs(ls.right_side_value)) > 0
          then 100.0 - ((abs(ls.left_side_value - ls.right_side_value) / greatest(abs(ls.left_side_value), abs(ls.right_side_value))) * 100.0)
          else null
        end,
        0
      )
    ) / nullif(
      (case when ls.single_leg_strength is not null then 1 else 0 end)
      + (case when ls.calf_capacity is not null then 1 else 0 end)
      + (case when ls.left_side_value is not null and ls.right_side_value is not null then 1 else 0 end),
      0
    ) as ski_performance_index,

    (
      coalesce(ls.pain_score, 0) * 0.45
      + coalesce(
          case
            when ls.left_side_value is not null and ls.right_side_value is not null and greatest(abs(ls.left_side_value), abs(ls.right_side_value)) > 0
            then (abs(ls.left_side_value - ls.right_side_value) / greatest(abs(ls.left_side_value), abs(ls.right_side_value))) * 100.0
            else null
          end,
          0
        ) * 0.35
      + coalesce(
          case
            when w.rolling_weekly_volume_4w_avg > 0 then ((w.weekly_training_volume / w.rolling_weekly_volume_4w_avg) - 1.0) * 100.0
            else null
          end,
          0
        ) * 0.20
    ) as injury_risk_score,

    case
      when least(
        coalesce(w.first_workout_at, 'infinity'::timestamptz),
        coalesce(fa.first_assessment_at, 'infinity'::timestamptz),
        coalesce(fm.first_metric_at, 'infinity'::timestamptz),
        coalesce(ls.profile_created_at, 'infinity'::timestamptz)
      ) = 'infinity'::timestamptz
      then null
      else extract(epoch from age(now(), least(
        coalesce(w.first_workout_at, 'infinity'::timestamptz),
        coalesce(fa.first_assessment_at, 'infinity'::timestamptz),
        coalesce(fm.first_metric_at, 'infinity'::timestamptz),
        coalesce(ls.profile_created_at, 'infinity'::timestamptz)
      ))) / (365.25 * 24 * 60 * 60)
    end as training_age_years,

    w.weekly_training_volume,

    case
      when cardinality(coalesce(ls.sports, array[]::text[])) > 0
      then 1.0 / cardinality(ls.sports)::numeric
      else case
        when coalesce(ls.primary_sport, '') = '' then null
        else 1.0
      end
    end as sport_specialization_index,

    ls.body_weight_kg
  from latest_signal ls
  left join workload w on w.user_id = ls.user_id
  left join first_assessment fa on fa.user_id = ls.user_id
  left join first_metric fm on fm.user_id = ls.user_id
)
select * from derived;

create or replace view public.athlete_derived_metric_events as
select
  adm.user_id,
  metric_key,
  metric_name,
  metric_value,
  metric_unit,
  computed_at
from public.athlete_derived_metrics_latest adm
cross join lateral (
  values
    ('relative_grip_strength', 'Relative Grip Strength', adm.relative_grip_strength, 'ratio'),
    ('pullups_per_kg_bodyweight', 'Pull-Ups per kg Body Weight', adm.pullups_per_kg_bodyweight, 'reps_per_kg'),
    ('relative_jump_height', 'Relative Jump Height', adm.relative_jump_height, 'cm_per_kg'),
    ('left_right_asymmetry_pct', 'Left/Right Asymmetry', adm.left_right_asymmetry_pct, '%'),
    ('composite_lower_body_score', 'Composite Lower-Body Score', adm.composite_lower_body_score, 'score'),
    ('composite_upper_body_score', 'Composite Upper-Body Score', adm.composite_upper_body_score, 'score'),
    ('relative_power_index', 'Relative Power Index', adm.relative_power_index, 'score'),
    ('mobility_score', 'Mobility Score', adm.mobility_score, 'score'),
    ('strength_score', 'Strength Score', adm.strength_score, 'score'),
    ('endurance_score', 'Endurance Score', adm.endurance_score, 'score'),
    ('climbing_specific_performance_index', 'Climbing-Specific Performance Index', adm.climbing_specific_performance_index, 'score'),
    ('ski_performance_index', 'Ski Performance Index', adm.ski_performance_index, 'score'),
    ('injury_risk_score', 'Injury Risk Score', adm.injury_risk_score, 'risk_score'),
    ('training_age_years', 'Training Age', adm.training_age_years, 'years'),
    ('weekly_training_volume', 'Weekly Training Volume', adm.weekly_training_volume, 'volume_load'),
    ('sport_specialization_index', 'Sport Specialization Index', adm.sport_specialization_index, 'index')
) as m(metric_key, metric_name, metric_value, metric_unit)
where m.metric_value is not null;

grant select on public.athlete_derived_metrics_latest to authenticated;
grant select on public.athlete_derived_metric_events to authenticated;

create or replace view public.analytics_feature_observations as
select
  am.user_id as athlete_user_id,
  coalesce(am.updated_at, now()) as observed_at,
  'athlete_metrics'::text as source_table,
  am.id::text as source_id,
  lower(regexp_replace(trim(coalesce(am.metric_name, '')), '[^a-zA-Z0-9]+', '_', 'g')) as feature_key,
  am.metric_name as feature_name,
  public.safe_to_numeric(am.metric_value) as value_numeric,
  am.metric_value::text as value_text,
  null::jsonb as value_json,
  nullif(trim(coalesce(am.metric_unit, '')), '') as unit
from public.athlete_metrics am

union all

select
  ae.athlete_user_id,
  coalesce(ae.updated_at, ae.created_at, ae.assessment_date::timestamptz, now()) as observed_at,
  'athlete_assessment_events'::text as source_table,
  ae.id::text as source_id,
  coalesce(nullif(trim(ae.metric_key), ''), lower(regexp_replace(trim(coalesce(ae.test_name, 'assessment')), '[^a-zA-Z0-9]+', '_', 'g'))) as feature_key,
  ae.test_name as feature_name,
  coalesce(ae.result_numeric, public.safe_to_numeric(ae.result_value)) as value_numeric,
  ae.result_value::text as value_text,
  null::jsonb as value_json,
  nullif(trim(coalesce(ae.result_unit, '')), '') as unit
from public.athlete_assessment_events ae

union all

select
  aoe.athlete_user_id,
  coalesce(aoe.updated_at, aoe.created_at, aoe.outcome_date::timestamptz, now()) as observed_at,
  'athlete_outcome_events'::text as source_table,
  aoe.id::text as source_id,
  lower(regexp_replace(trim(coalesce(aoe.outcome_type, 'outcome')), '[^a-zA-Z0-9]+', '_', 'g')) as feature_key,
  aoe.outcome_type as feature_name,
  aoe.outcome_numeric as value_numeric,
  coalesce(aoe.outcome_value, aoe.renewal_status, aoe.injury_status)::text as value_text,
  jsonb_build_object(
    'sport', aoe.sport,
    'goal_progress_score', aoe.goal_progress_score,
    'satisfaction_score', aoe.satisfaction_score,
    'notes', aoe.notes
  ) as value_json,
  null::text as unit
from public.athlete_outcome_events aoe

union all

select
  ard.athlete_user_id,
  coalesce(ard.updated_at, ard.created_at, ard.recovery_date::timestamptz, now()) as observed_at,
  'athlete_recovery_daily'::text as source_table,
  ard.id::text as source_id,
  f.feature_key,
  f.feature_name,
  f.value_numeric,
  f.value_text,
  null::jsonb as value_json,
  f.unit
from public.athlete_recovery_daily ard
cross join lateral (
  values
    ('sleep_hours', 'Sleep Hours', ard.sleep_hours, null::text, 'h'),
    ('sleep_efficiency', 'Sleep Efficiency', ard.sleep_efficiency, null::text, 'pct'),
    ('hrv_ms', 'HRV', ard.hrv_ms, null::text, 'ms'),
    ('resting_hr', 'Resting HR', ard.resting_hr, null::text, 'bpm'),
    ('recovery_score', 'Recovery Score', ard.recovery_score, null::text, 'score'),
    ('soreness_score', 'Soreness Score', ard.soreness_score, null::text, 'score'),
    ('fatigue_score', 'Fatigue Score', ard.fatigue_score, null::text, 'score'),
    ('bedtime_regular', 'Bedtime Regular', case when ard.bedtime_regular then 1::numeric else 0::numeric end, case when ard.bedtime_regular is null then null else ard.bedtime_regular::text end, 'bool')
) as f(feature_key, feature_name, value_numeric, value_text, unit)
where f.value_numeric is not null or f.value_text is not null

union all

select
  acd.athlete_user_id,
  coalesce(acd.updated_at, acd.created_at, acd.context_date::timestamptz, now()) as observed_at,
  'athlete_context_daily'::text as source_table,
  acd.id::text as source_id,
  f.feature_key,
  f.feature_name,
  f.value_numeric,
  f.value_text,
  null::jsonb as value_json,
  f.unit
from public.athlete_context_daily acd
cross join lateral (
  values
    ('stress_score', 'Stress Score', acd.stress_score, null::text, 'score'),
    ('timezone_shift_hours', 'Timezone Shift Hours', acd.timezone_shift_hours, null::text, 'hours'),
    ('caffeine_mg', 'Caffeine', acd.caffeine_mg, null::text, 'mg'),
    ('alcohol_units', 'Alcohol Units', acd.alcohol_units, null::text, 'units'),
    ('bodyweight_kg', 'Bodyweight', acd.bodyweight_kg, null::text, 'kg'),
    ('hydration_score', 'Hydration Score', acd.hydration_score, null::text, 'score'),
    ('travel_day', 'Travel Day', case when acd.travel_day then 1::numeric else 0::numeric end, case when acd.travel_day is null then null else acd.travel_day::text end, 'bool'),
    ('illness_flag', 'Illness Flag', case when acd.illness_flag then 1::numeric else 0::numeric end, case when acd.illness_flag is null then null else acd.illness_flag::text end, 'bool')
) as f(feature_key, feature_name, value_numeric, value_text, unit)
where f.value_numeric is not null or f.value_text is not null

union all

select
  asdm.user_id as athlete_user_id,
  coalesce(asdm.updated_at, asdm.created_at, asdm.metric_date::timestamptz, now()) as observed_at,
  'athlete_strava_daily_metrics'::text as source_table,
  asdm.id::text as source_id,
  f.feature_key,
  f.feature_name,
  f.value_numeric,
  null::text as value_text,
  null::jsonb as value_json,
  f.unit
from public.athlete_strava_daily_metrics asdm
cross join lateral (
  values
    ('activity_count', 'Activity Count', asdm.activity_count::numeric, 'count'),
    ('distance_m', 'Distance', asdm.distance_m, 'm'),
    ('moving_time_sec', 'Moving Time', asdm.moving_time_sec::numeric, 'sec'),
    ('elevation_gain_m', 'Elevation Gain', asdm.elevation_gain_m, 'm'),
    ('training_load', 'Training Load', asdm.training_load, 'load'),
    ('resting_hr', 'Resting HR', asdm.resting_hr, 'bpm'),
    ('hrv_ms', 'HRV', asdm.hrv_ms, 'ms'),
    ('sleep_hours', 'Sleep Hours', asdm.sleep_hours, 'h'),
    ('recovery_score', 'Recovery Score', asdm.recovery_score, 'score')
) as f(feature_key, feature_name, value_numeric, unit)
where f.value_numeric is not null

union all

select
  acog.athlete_user_id,
  coalesce(acog.updated_at, acog.created_at, acog.cognitive_date::timestamptz, now()) as observed_at,
  'athlete_cognitive_daily'::text as source_table,
  acog.id::text as source_id,
  f.feature_key,
  f.feature_name,
  f.value_numeric,
  null::text as value_text,
  null::jsonb as value_json,
  f.unit
from public.athlete_cognitive_daily acog
cross join lateral (
  values
    ('deep_work_hours', 'Deep Work Hours', acog.deep_work_hours, 'h'),
    ('focus_score', 'Focus Score', acog.focus_score, 'score'),
    ('cognitive_sharpness_score', 'Cognitive Sharpness', acog.cognitive_sharpness_score, 'score'),
    ('commits_count', 'Commits', acog.commits_count::numeric, 'count'),
    ('prs_merged_count', 'PRs Merged', acog.prs_merged_count::numeric, 'count'),
    ('bug_count', 'Bug Count', acog.bug_count::numeric, 'count'),
    ('cycle_time_hours', 'Cycle Time', acog.cycle_time_hours, 'h')
) as f(feature_key, feature_name, value_numeric, unit)
where f.value_numeric is not null

union all

select
  aeh.athlete_user_id,
  coalesce(aeh.updated_at, aeh.created_at, aeh.workout_completed_at, now()) as observed_at,
  'athlete_exercise_history'::text as source_table,
  aeh.id::text as source_id,
  f.feature_key,
  f.feature_name,
  f.value_numeric,
  f.value_text,
  f.value_json,
  f.unit
from public.athlete_exercise_history aeh
cross join lateral (
  values
    ('total_sets', 'Total Sets', aeh.total_sets::numeric, null::text, null::jsonb, 'sets'),
    ('completed_sets', 'Completed Sets', aeh.completed_sets::numeric, null::text, null::jsonb, 'sets'),
    ('top_weight', 'Top Weight', aeh.top_weight, null::text, null::jsonb, 'kg'),
    ('volume_load', 'Volume Load', aeh.volume_load, null::text, null::jsonb, 'volume_load'),
    ('exercise_name', 'Exercise Name', null::numeric, aeh.exercise_name, null::jsonb, null::text),
    ('movement_pattern', 'Movement Pattern', null::numeric, aeh.movement_pattern, null::jsonb, null::text),
    ('training_goal', 'Training Goal', null::numeric, aeh.training_goal, null::jsonb, null::text),
    ('set_logs', 'Set Logs', null::numeric, null::text, aeh.set_logs, 'json'),
    ('workout_summary', 'Workout Summary', null::numeric, null::text, aeh.workout_summary, 'json')
) as f(feature_key, feature_name, value_numeric, value_text, value_json, unit)
where f.value_numeric is not null or f.value_text is not null or f.value_json is not null

union all

select
  aps.athlete_user_id,
  coalesce(aps.updated_at, aps.created_at, aps.session_date::timestamptz, now()) as observed_at,
  'athlete_programming_sessions'::text as source_table,
  aps.id::text as source_id,
  f.feature_key,
  f.feature_name,
  f.value_numeric,
  f.value_text,
  f.value_json,
  f.unit
from public.athlete_programming_sessions aps
cross join lateral (
  values
    ('microcycle_week', 'Microcycle Week', aps.microcycle_week::numeric, null::text, null::jsonb, 'week'),
    ('deload_week', 'Deload Week', case when aps.deload_week then 1::numeric else 0::numeric end, case when aps.deload_week is null then null else aps.deload_week::text end, null::jsonb, 'bool'),
    ('phase', 'Phase', null::numeric, aps.phase, null::jsonb, null::text),
    ('block_name', 'Block Name', null::numeric, aps.block_name, null::jsonb, null::text),
    ('progression_strategy', 'Progression Strategy', null::numeric, aps.progression_strategy, null::jsonb, null::text),
    ('session_intent', 'Session Intent', null::numeric, aps.session_intent, null::jsonb, null::text),
    ('constraints', 'Constraints', null::numeric, null::text, to_jsonb(aps.constraints), 'json')
) as f(feature_key, feature_name, value_numeric, value_text, value_json, unit)
where f.value_numeric is not null or f.value_text is not null or f.value_json is not null

union all

select
  aoia.athlete_user_id,
  coalesce(aoia.updated_at, aoia.created_at, aoia.assigned_at, now()) as observed_at,
  'athlete_onboarding_intake_assignments'::text as source_table,
  aoia.id::text as source_id,
  'onboarding_response'::text as feature_key,
  'Onboarding Response'::text as feature_name,
  null::numeric as value_numeric,
  null::text as value_text,
  jsonb_build_object(
    'form_id', aoia.form_id,
    'form_name', aoia.form_name,
    'status', aoia.status,
    'response_data', aoia.response_data,
    'form_schema', aoia.form_schema
  ) as value_json,
  'json'::text as unit
from public.athlete_onboarding_intake_assignments aoia;

create or replace view public.analytics_feature_observations_latest as
select distinct on (athlete_user_id, feature_key)
  athlete_user_id,
  observed_at,
  source_table,
  source_id,
  feature_key,
  feature_name,
  value_numeric,
  value_text,
  value_json,
  unit
from public.analytics_feature_observations
order by athlete_user_id, feature_key, observed_at desc nulls last;

grant select on public.analytics_feature_observations to authenticated;
grant select on public.analytics_feature_observations_latest to authenticated;

insert into public.analytics_metric_catalog
  (metric_key, category_id, metric_name, description, cadence, data_type, unit, source_type, sport_scope, is_sensitive)
values
  ('relative_grip_strength', 'performance_testing', 'Relative Grip Strength', 'Grip strength normalized by body weight.', 'assessment', 'numeric', 'ratio', 'derived', '{}', false),
  ('pullups_per_kg_bodyweight', 'performance_testing', 'Pull-Ups per kg Body Weight', 'Max pull-up capacity normalized by body weight.', 'assessment', 'numeric', 'reps_per_kg', 'derived', '{}', false),
  ('relative_jump_height', 'performance_testing', 'Relative Jump Height', 'Jump metric normalized by body weight.', 'assessment', 'numeric', 'cm_per_kg', 'derived', '{}', false),
  ('left_right_asymmetry_pct', 'movement_mobility', 'Left/Right Asymmetry', 'Percent asymmetry between left and right side values.', 'assessment', 'numeric', '%', 'derived', '{}', false),
  ('composite_lower_body_score', 'performance_testing', 'Composite Lower-Body Score', 'Composite of lower-body strength/capacity markers.', 'weekly', 'numeric', 'score', 'derived', '{}', false),
  ('composite_upper_body_score', 'performance_testing', 'Composite Upper-Body Score', 'Composite of upper-body strength markers.', 'weekly', 'numeric', 'score', 'derived', '{}', false),
  ('relative_power_index', 'performance_testing', 'Relative Power Index', 'Combined normalized power profile across key tests.', 'weekly', 'numeric', 'score', 'derived', '{}', false),
  ('mobility_score', 'movement_mobility', 'Mobility Score', 'Composite mobility quality indicator from mobility tests.', 'weekly', 'numeric', 'score', 'derived', '{}', false),
  ('strength_score', 'performance_testing', 'Strength Score', 'Composite strength indicator across key tests.', 'weekly', 'numeric', 'score', 'derived', '{}', false),
  ('endurance_score', 'outcomes', 'Endurance Score', 'Composite endurance indicator from volume and capacity markers.', 'weekly', 'numeric', 'score', 'derived', '{}', false),
  ('climbing_specific_performance_index', 'outcomes', 'Climbing-Specific Performance Index', 'Composite climbing readiness/performance signal.', 'weekly', 'numeric', 'score', 'derived', '{climbing}', false),
  ('ski_performance_index', 'outcomes', 'Ski Performance Index', 'Composite ski performance/tolerance signal.', 'weekly', 'numeric', 'score', 'derived', '{skiing,snowboarding}', false),
  ('injury_risk_score', 'injury_pain', 'Injury Risk Score', 'Composite risk indicator from pain, asymmetry, and load dynamics.', 'weekly', 'numeric', 'risk_score', 'derived', '{}', true),
  ('training_age_years', 'athlete_profile', 'Training Age', 'Estimated years of observed training history.', 'weekly', 'numeric', 'years', 'derived', '{}', false),
  ('weekly_training_volume', 'training_load', 'Weekly Training Volume', '7-day summed training volume from logged workouts.', 'weekly', 'numeric', 'volume_load', 'derived', '{}', false),
  ('sport_specialization_index', 'sport_profile', 'Sport Specialization Index', 'Index of specialization breadth across declared sports.', 'weekly', 'numeric', 'index', 'derived', '{}', false)
on conflict (metric_key) do update
set category_id = excluded.category_id,
    metric_name = excluded.metric_name,
    description = excluded.description,
    cadence = excluded.cadence,
    data_type = excluded.data_type,
    unit = excluded.unit,
    source_type = excluded.source_type,
    sport_scope = excluded.sport_scope,
    is_sensitive = excluded.is_sensitive,
    active = true,
    updated_at = now();

commit;
