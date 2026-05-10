-- Add default metrics to all existing athlete accounts if missing
-- Run this in the Supabase SQL editor or as a migration

DO $$
DECLARE
  metric_record RECORD;
  default_metrics CONSTANT jsonb[] := ARRAY[
    '{"metric_name": "Resting HR", "metric_unit": "bpm", "metric_category": "Cardio"}'::jsonb,
    '{"metric_name": "Max HR", "metric_unit": "bpm", "metric_category": "Cardio"}'::jsonb,
    '{"metric_name": "Height", "metric_unit": "cm", "metric_category": "Performance"}'::jsonb,
    '{"metric_name": "Weight", "metric_unit": "kg", "metric_category": "Performance"}'::jsonb,
    '{"metric_name": "BMI", "metric_unit": "", "metric_category": "Performance"}'::jsonb,
    '{"metric_name": "Blood Pressure", "metric_unit": "mmHg", "metric_category": "Cardio"}'::jsonb,
    '{"metric_name": "VO2 Max", "metric_unit": "ml/kg/min", "metric_category": "Cardio"}'::jsonb
  ];
  user_rec RECORD;
  m jsonb;
BEGIN
  FOR user_rec IN SELECT user_id FROM athlete_profiles LOOP
    FOREACH m IN ARRAY default_metrics LOOP
      IF NOT EXISTS (
        SELECT 1 FROM athlete_metrics
        WHERE user_id = user_rec.user_id
          AND metric_name = m->>'metric_name'
      ) THEN
        INSERT INTO athlete_metrics (user_id, metric_name, metric_value, metric_unit, metric_category, updated_at)
        VALUES (
          user_rec.user_id,
          m->>'metric_name',
          '',
          m->>'metric_unit',
          m->>'metric_category',
          NOW()
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;
