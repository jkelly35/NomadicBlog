-- Adds class description, recurring weekday selection, and date-level attendance storage.

alter table public.in_person_classes
  add column if not exists class_end_date date,
  add column if not exists description text,
  add column if not exists meeting_days jsonb not null default '[]'::jsonb,
  add column if not exists attendance_by_date jsonb not null default '{}'::jsonb;

update public.in_person_classes
set
  class_end_date = coalesce(class_end_date, class_date),
  meeting_days = case
    when meeting_days is null or jsonb_array_length(meeting_days) = 0
      then to_jsonb(ARRAY[extract(dow from class_date)::int])
    else meeting_days
  end,
  attendance_by_date = coalesce(attendance_by_date, '{}'::jsonb)
where class_end_date is null
   or meeting_days is null
   or jsonb_array_length(meeting_days) = 0
   or attendance_by_date is null;

create index if not exists in_person_classes_class_end_date_idx
  on public.in_person_classes (class_end_date desc);
