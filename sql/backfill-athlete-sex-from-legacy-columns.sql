-- Nomadic Performance - one-time backfill for athlete_profiles.sex
-- Run this in Supabase SQL editor.
-- This script is safe to re-run and will not overwrite non-empty sex values.

begin;

alter table public.athlete_profiles
	add column if not exists sex text;

do $$
declare
	has_gender boolean;
	has_biological_sex boolean;
	has_sport_overview boolean;
	candidate_expr text;
begin
	select exists (
		select 1
		from information_schema.columns
		where table_schema = 'public'
			and table_name = 'athlete_profiles'
			and column_name = 'gender'
	) into has_gender;

	select exists (
		select 1
		from information_schema.columns
		where table_schema = 'public'
			and table_name = 'athlete_profiles'
			and column_name = 'biological_sex'
	) into has_biological_sex;

	select exists (
		select 1
		from information_schema.columns
		where table_schema = 'public'
			and table_name = 'athlete_profiles'
			and column_name = 'sport_overview'
	) into has_sport_overview;

	candidate_expr := 'coalesce(';

	if has_gender then
		candidate_expr := candidate_expr || 'nullif(trim(gender), ''''), ';
	end if;

	if has_biological_sex then
		candidate_expr := candidate_expr || 'nullif(trim(biological_sex), ''''), ';
	end if;

	if has_sport_overview then
		candidate_expr := candidate_expr ||
			'nullif(trim(sport_overview ->> ''sex''), ''''), ' ||
			'nullif(trim(sport_overview ->> ''gender''), ''''), ' ||
			'nullif(trim(sport_overview ->> ''biological_sex''), ''''), ' ||
			'nullif(trim((sport_overview -> ''general'') ->> ''sex''), ''''), ' ||
			'nullif(trim((sport_overview -> ''general'') ->> ''gender''), ''''), ' ||
			'nullif(trim((sport_overview -> ''general'') ->> ''biological_sex''), ''''), ';
	end if;

	candidate_expr := candidate_expr || 'null)';

	execute format($sql$
		update public.athlete_profiles
		set sex = case
			when lower(%1$s) in ('male', 'm', 'man') then 'male'
			when lower(%1$s) in ('female', 'f', 'woman') then 'female'
			when lower(%1$s) in ('prefer-not-to-say', 'prefer not to say', 'undisclosed') then 'prefer-not-to-say'
			when lower(%1$s) in ('other', 'nonbinary', 'non-binary') then 'other'
			else null
		end
		where (sex is null or trim(sex) = '')
			and %1$s is not null;
	$sql$, candidate_expr);
end $$;

commit;

-- Optional verification:
-- select sex, count(*) from public.athlete_profiles group by sex order by sex;
