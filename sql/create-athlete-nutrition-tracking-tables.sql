-- Nomadic Performance - athlete nutrition tracking tables
-- Run this in Supabase SQL editor.

begin;

create or replace function public.is_nomadic_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.email(), '')) = 'joe@nomadicperformance.com';
$$;

create table if not exists public.athlete_nutrition_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_calories numeric(8, 2),
  target_protein_g numeric(8, 2),
  target_carbs_g numeric(8, 2),
  target_fats_g numeric(8, 2),
  target_hydration_l numeric(6, 2),
  target_fiber_g numeric(8, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint athlete_nutrition_targets_user_unique unique (user_id),
  constraint athlete_nutrition_targets_non_negative_chk
    check (
      coalesce(target_calories, 0) >= 0 and
      coalesce(target_protein_g, 0) >= 0 and
      coalesce(target_carbs_g, 0) >= 0 and
      coalesce(target_fats_g, 0) >= 0 and
      coalesce(target_hydration_l, 0) >= 0 and
      coalesce(target_fiber_g, 0) >= 0
    )
);

create table if not exists public.athlete_nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_on date not null,
  calories numeric(8, 2),
  protein_g numeric(8, 2),
  carbs_g numeric(8, 2),
  fats_g numeric(8, 2),
  fiber_g numeric(8, 2),
  hydration_l numeric(6, 2),
  meal_quality int,
  energy_level int,
  hunger_level int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint athlete_nutrition_logs_user_date_unique unique (user_id, logged_on),
  constraint athlete_nutrition_logs_non_negative_chk
    check (
      coalesce(calories, 0) >= 0 and
      coalesce(protein_g, 0) >= 0 and
      coalesce(carbs_g, 0) >= 0 and
      coalesce(fats_g, 0) >= 0 and
      coalesce(fiber_g, 0) >= 0 and
      coalesce(hydration_l, 0) >= 0
    ),
  constraint athlete_nutrition_logs_meal_quality_chk
    check (meal_quality is null or meal_quality between 1 and 5),
  constraint athlete_nutrition_logs_energy_level_chk
    check (energy_level is null or energy_level between 1 and 5),
  constraint athlete_nutrition_logs_hunger_level_chk
    check (hunger_level is null or hunger_level between 1 and 5)
);

create table if not exists public.nutrition_foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  source text,
  source_food_id text,
  default_serving_g numeric(8, 2) not null default 100,
  kcal_100g numeric(8, 2) not null default 0,
  protein_g_100g numeric(8, 2) not null default 0,
  carbs_g_100g numeric(8, 2) not null default 0,
  fats_g_100g numeric(8, 2) not null default 0,
  fiber_g_100g numeric(8, 2) not null default 0,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nutrition_foods_non_negative_chk
    check (
      default_serving_g > 0 and
      kcal_100g >= 0 and
      protein_g_100g >= 0 and
      carbs_g_100g >= 0 and
      fats_g_100g >= 0 and
      fiber_g_100g >= 0
    )
);

create unique index if not exists nutrition_foods_name_brand_unique_idx
  on public.nutrition_foods (lower(name), lower(coalesce(brand, '')));

create table if not exists public.nutrition_food_servings (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references public.nutrition_foods(id) on delete cascade,
  serving_name text not null,
  grams numeric(8, 2) not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nutrition_food_servings_positive_grams_chk check (grams > 0)
);

create unique index if not exists nutrition_food_servings_food_label_unique_idx
  on public.nutrition_food_servings (food_id, lower(serving_name));

create index if not exists nutrition_food_servings_food_idx
  on public.nutrition_food_servings (food_id, is_default desc, grams);

create table if not exists public.athlete_nutrition_food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_on date not null,
  food_id uuid not null references public.nutrition_foods(id) on delete restrict,
  serving_id uuid references public.nutrition_food_servings(id) on delete set null,
  quantity numeric(8, 2) not null default 1,
  grams_consumed numeric(8, 2) not null,
  calories numeric(8, 2) not null,
  protein_g numeric(8, 2) not null,
  carbs_g numeric(8, 2) not null,
  fats_g numeric(8, 2) not null,
  fiber_g numeric(8, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint athlete_nutrition_food_entries_non_negative_chk
    check (
      quantity > 0 and
      grams_consumed >= 0 and
      calories >= 0 and
      protein_g >= 0 and
      carbs_g >= 0 and
      fats_g >= 0 and
      fiber_g >= 0
    )
);

create index if not exists athlete_nutrition_logs_user_date_idx
  on public.athlete_nutrition_logs (user_id, logged_on desc);

create index if not exists athlete_nutrition_food_entries_user_date_idx
  on public.athlete_nutrition_food_entries (user_id, logged_on desc);

create index if not exists athlete_nutrition_food_entries_food_idx
  on public.athlete_nutrition_food_entries (food_id, logged_on desc);

alter table public.athlete_nutrition_targets enable row level security;
alter table public.athlete_nutrition_logs enable row level security;
alter table public.nutrition_foods enable row level security;
alter table public.nutrition_food_servings enable row level security;
alter table public.athlete_nutrition_food_entries enable row level security;

drop policy if exists "athlete_nutrition_targets_select_own_or_admin" on public.athlete_nutrition_targets;
create policy "athlete_nutrition_targets_select_own_or_admin"
on public.athlete_nutrition_targets
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_targets_insert_own_or_admin" on public.athlete_nutrition_targets;
create policy "athlete_nutrition_targets_insert_own_or_admin"
on public.athlete_nutrition_targets
for insert
to authenticated
with check (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_targets_update_own_or_admin" on public.athlete_nutrition_targets;
create policy "athlete_nutrition_targets_update_own_or_admin"
on public.athlete_nutrition_targets
for update
to authenticated
using (
  auth.uid() = user_id
  or public.is_nomadic_admin()
)
with check (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_targets_delete_own_or_admin" on public.athlete_nutrition_targets;
create policy "athlete_nutrition_targets_delete_own_or_admin"
on public.athlete_nutrition_targets
for delete
to authenticated
using (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_logs_select_own_or_admin" on public.athlete_nutrition_logs;
create policy "athlete_nutrition_logs_select_own_or_admin"
on public.athlete_nutrition_logs
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_logs_insert_own_or_admin" on public.athlete_nutrition_logs;
create policy "athlete_nutrition_logs_insert_own_or_admin"
on public.athlete_nutrition_logs
for insert
to authenticated
with check (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_logs_update_own_or_admin" on public.athlete_nutrition_logs;
create policy "athlete_nutrition_logs_update_own_or_admin"
on public.athlete_nutrition_logs
for update
to authenticated
using (
  auth.uid() = user_id
  or public.is_nomadic_admin()
)
with check (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_logs_delete_own_or_admin" on public.athlete_nutrition_logs;
create policy "athlete_nutrition_logs_delete_own_or_admin"
on public.athlete_nutrition_logs
for delete
to authenticated
using (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

drop policy if exists "nutrition_foods_select_authenticated" on public.nutrition_foods;
create policy "nutrition_foods_select_authenticated"
on public.nutrition_foods
for select
to authenticated
using (true);

drop policy if exists "nutrition_foods_write_admin_only" on public.nutrition_foods;
create policy "nutrition_foods_write_admin_only"
on public.nutrition_foods
for all
to authenticated
using (public.is_nomadic_admin())
with check (public.is_nomadic_admin());

drop policy if exists "nutrition_food_servings_select_authenticated" on public.nutrition_food_servings;
create policy "nutrition_food_servings_select_authenticated"
on public.nutrition_food_servings
for select
to authenticated
using (true);

drop policy if exists "nutrition_food_servings_write_admin_only" on public.nutrition_food_servings;
create policy "nutrition_food_servings_write_admin_only"
on public.nutrition_food_servings
for all
to authenticated
using (public.is_nomadic_admin())
with check (public.is_nomadic_admin());

drop policy if exists "athlete_nutrition_food_entries_select_own_or_admin" on public.athlete_nutrition_food_entries;
create policy "athlete_nutrition_food_entries_select_own_or_admin"
on public.athlete_nutrition_food_entries
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_food_entries_insert_own_or_admin" on public.athlete_nutrition_food_entries;
create policy "athlete_nutrition_food_entries_insert_own_or_admin"
on public.athlete_nutrition_food_entries
for insert
to authenticated
with check (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_food_entries_update_own_or_admin" on public.athlete_nutrition_food_entries;
create policy "athlete_nutrition_food_entries_update_own_or_admin"
on public.athlete_nutrition_food_entries
for update
to authenticated
using (
  auth.uid() = user_id
  or public.is_nomadic_admin()
)
with check (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

drop policy if exists "athlete_nutrition_food_entries_delete_own_or_admin" on public.athlete_nutrition_food_entries;
create policy "athlete_nutrition_food_entries_delete_own_or_admin"
on public.athlete_nutrition_food_entries
for delete
to authenticated
using (
  auth.uid() = user_id
  or public.is_nomadic_admin()
);

create or replace function public.athlete_nutrition_targets_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_athlete_nutrition_targets_updated_at on public.athlete_nutrition_targets;
create trigger trg_athlete_nutrition_targets_updated_at
before update on public.athlete_nutrition_targets
for each row
execute function public.athlete_nutrition_targets_set_updated_at();

create or replace function public.athlete_nutrition_logs_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_athlete_nutrition_logs_updated_at on public.athlete_nutrition_logs;
create trigger trg_athlete_nutrition_logs_updated_at
before update on public.athlete_nutrition_logs
for each row
execute function public.athlete_nutrition_logs_set_updated_at();

create or replace function public.nutrition_foods_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_nutrition_foods_updated_at on public.nutrition_foods;
create trigger trg_nutrition_foods_updated_at
before update on public.nutrition_foods
for each row
execute function public.nutrition_foods_set_updated_at();

create or replace function public.nutrition_food_servings_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_nutrition_food_servings_updated_at on public.nutrition_food_servings;
create trigger trg_nutrition_food_servings_updated_at
before update on public.nutrition_food_servings
for each row
execute function public.nutrition_food_servings_set_updated_at();

create or replace function public.athlete_nutrition_food_entries_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_athlete_nutrition_food_entries_updated_at on public.athlete_nutrition_food_entries;
create trigger trg_athlete_nutrition_food_entries_updated_at
before update on public.athlete_nutrition_food_entries
for each row
execute function public.athlete_nutrition_food_entries_set_updated_at();

insert into public.nutrition_foods (
  name,
  brand,
  source,
  source_food_id,
  default_serving_g,
  kcal_100g,
  protein_g_100g,
  carbs_g_100g,
  fats_g_100g,
  fiber_g_100g,
  is_verified
)
values
  ('Banana', null, 'seed', 'banana', 118, 89, 1.1, 22.8, 0.3, 2.6, true),
  ('Chicken Breast, Cooked', null, 'seed', 'chicken_breast_cooked', 120, 165, 31, 0, 3.6, 0, true),
  ('White Rice, Cooked', null, 'seed', 'white_rice_cooked', 158, 130, 2.4, 28.2, 0.3, 0.4, true),
  ('Rolled Oats, Dry', null, 'seed', 'rolled_oats_dry', 40, 389, 16.9, 66.3, 6.9, 10.6, true),
  ('Egg, Whole', null, 'seed', 'egg_whole', 50, 143, 12.6, 1.1, 9.5, 0, true),
  ('Greek Yogurt, Plain Nonfat', null, 'seed', 'greek_yogurt_nonfat', 170, 59, 10.3, 3.6, 0.4, 0, true),
  ('Salmon, Cooked', null, 'seed', 'salmon_cooked', 120, 206, 22.1, 0, 12.4, 0, true),
  ('Olive Oil', null, 'seed', 'olive_oil', 14, 884, 0, 0, 100, 0, true),
  ('Almonds', null, 'seed', 'almonds', 28, 579, 21.2, 21.6, 49.9, 12.5, true),
  ('Sweet Potato, Baked', null, 'seed', 'sweet_potato_baked', 150, 90, 2, 20.7, 0.2, 3.3, true)
on conflict (lower(name), lower(coalesce(brand, '')))
do update
set
  source = excluded.source,
  source_food_id = excluded.source_food_id,
  default_serving_g = excluded.default_serving_g,
  kcal_100g = excluded.kcal_100g,
  protein_g_100g = excluded.protein_g_100g,
  carbs_g_100g = excluded.carbs_g_100g,
  fats_g_100g = excluded.fats_g_100g,
  fiber_g_100g = excluded.fiber_g_100g,
  is_verified = excluded.is_verified,
  updated_at = now();

insert into public.nutrition_food_servings (food_id, serving_name, grams, is_default)
select f.id,
  case lower(f.name)
    when 'banana' then '1 medium'
    when 'chicken breast, cooked' then '1 breast'
    when 'white rice, cooked' then '1 cup'
    when 'rolled oats, dry' then '1/2 cup dry'
    when 'egg, whole' then '1 large egg'
    when 'greek yogurt, plain nonfat' then '3/4 cup'
    when 'salmon, cooked' then '1 fillet'
    when 'olive oil' then '1 tbsp'
    when 'almonds' then '1 oz'
    when 'sweet potato, baked' then '1 medium'
    else '1 serving'
  end,
  case lower(f.name)
    when 'banana' then 118
    when 'chicken breast, cooked' then 120
    when 'white rice, cooked' then 158
    when 'rolled oats, dry' then 40
    when 'egg, whole' then 50
    when 'greek yogurt, plain nonfat' then 170
    when 'salmon, cooked' then 120
    when 'olive oil' then 14
    when 'almonds' then 28
    when 'sweet potato, baked' then 150
    else f.default_serving_g
  end,
  true
from public.nutrition_foods f
where f.source = 'seed'
on conflict (food_id, lower(serving_name))
do update
set grams = excluded.grams,
    is_default = excluded.is_default,
    updated_at = now();

commit;
