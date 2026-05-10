-- Nomadic Performance - Migrate existing athletes to 20mm Edge Hang test
-- Run this in Supabase SQL editor.
-- This script is safe to re-run and will not cause issues with already-migrated records.

begin;

-- Update existing metric names from "20mm Edge Pull" to "20mm Edge Hang"
update public.athlete_metrics
set metric_name = '20mm Edge Hang'
where lower(trim(metric_name)) = lower('20mm Edge Pull')
  and metric_name != '20mm Edge Hang';

-- Update metrics marked as "20mm Edge Pull Strength" to "20mm Edge Hang Strength"
update public.athlete_metrics
set metric_name = '20mm Edge Hang Strength'
where lower(trim(metric_name)) = lower('20mm Edge Pull Strength')
  and metric_name != '20mm Edge Hang Strength';

-- Ensure all edge hang metrics have "kg" as unit if they don't already
update public.athlete_metrics
set metric_unit = 'kg'
where (lower(trim(metric_name)) = lower('20mm Edge Hang')
   or lower(trim(metric_name)) = lower('20mm Edge Hang Strength'))
  and (metric_unit is null or trim(metric_unit) = '');

-- Add arm_span_cm to sport_overview for climbing athletes if not already present
-- This preserves existing data while adding the new field structure
update public.athlete_profiles
set sport_overview = 
  case 
    when sport_overview is null or sport_overview = '{}'::jsonb then
      '{"climbing": {"arm_span": null}}'::jsonb
    when sport_overview ? 'climbing' then
      case 
        when (sport_overview -> 'climbing') ? 'arm_span' then
          sport_overview
        else
          jsonb_set(sport_overview, '{climbing,arm_span}', 'null'::jsonb)
      end
    else
      jsonb_set(sport_overview, '{climbing}', '{"arm_span": null}'::jsonb)
  end
where sports && array['climbing']::text[]
  and sport_overview is not null
  and sport_overview != '{}'::jsonb
  and not ((sport_overview -> 'climbing') ? 'arm_span');

commit;

-- Optional verification queries:
-- Check metric name updates:
-- select metric_name, count(*) as count 
-- from public.athlete_metrics 
-- where metric_name like '%Edge%' 
-- group by metric_name 
-- order by metric_name;
--
-- Check climbing athletes with arm_span in sport_overview:
-- select user_id, arm_span_cm, 
--   sport_overview -> 'climbing' ->> 'arm_span' as arm_span_in_overview
-- from public.athlete_profiles 
-- where sports && array['climbing']::text[] 
-- limit 20;
