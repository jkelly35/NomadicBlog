-- Adds optional class_end_date to support date ranges for in-person classes.

alter table public.in_person_classes
  add column if not exists class_end_date date;

-- Backfill existing rows so single-date classes behave as same-day ranges.
update public.in_person_classes
set class_end_date = class_date
where class_end_date is null;

create index if not exists in_person_classes_class_end_date_idx
  on public.in_person_classes (class_end_date desc);
