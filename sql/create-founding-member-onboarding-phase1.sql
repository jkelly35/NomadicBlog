-- Nomadic Performance - founding member onboarding phase 1
-- Creates onboarding status + legal document/signature schema.

begin;

create or replace function public.is_nomadic_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.email(), '')) = 'joe@nomadicperformance.com';
$$;

create table if not exists public.founding_member_onboarding (
  athlete_user_id uuid primary key references auth.users(id) on delete cascade,
  coach_user_id uuid references auth.users(id) on delete set null,
  is_founding_member boolean not null default true,
  stage text not null default 'first_login_pending_docs' check (
    stage in (
      'invited',
      'first_login_pending_docs',
      'docs_signed_pending_payment',
      'payment_pending',
      'welcome_pending_intakes',
      'intakes_completed_assessment_pending',
      'assessment_in_progress',
      'assessment_published_pending_review',
      'review_scheduled',
      'active_training'
    )
  ),
  first_login_completed_at timestamptz,
  docs_signed_at timestamptz,
  payment_completed_at timestamptz,
  welcome_completed_at timestamptz,
  coach_notified_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.founding_member_legal_documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  version text not null,
  requires_signature boolean not null default true,
  is_active boolean not null default true,
  content_markdown text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint founding_member_legal_documents_slug_check check (length(trim(slug)) > 0),
  constraint founding_member_legal_documents_title_check check (length(trim(title)) > 0),
  constraint founding_member_legal_documents_version_check check (length(trim(version)) > 0)
);

create table if not exists public.founding_member_legal_signatures (
  id uuid primary key default gen_random_uuid(),
  athlete_user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references public.founding_member_legal_documents(id) on delete restrict,
  document_slug text not null,
  document_title text not null,
  document_version text not null,
  agreed_to_terms boolean not null default false,
  signed_name text not null,
  signed_email text not null,
  signature_text text not null,
  ip_address text,
  user_agent text,
  signed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint founding_member_legal_signatures_name_check check (length(trim(signed_name)) > 0),
  constraint founding_member_legal_signatures_email_check check (length(trim(signed_email)) > 3),
  constraint founding_member_legal_signatures_signature_text_check check (length(trim(signature_text)) > 0),
  unique (athlete_user_id, document_id, document_version)
);

create index if not exists idx_founding_member_onboarding_stage
  on public.founding_member_onboarding (stage);

create index if not exists idx_founding_member_onboarding_coach
  on public.founding_member_onboarding (coach_user_id);

create index if not exists idx_founding_member_legal_docs_active
  on public.founding_member_legal_documents (is_active, requires_signature);

create index if not exists idx_founding_member_legal_signatures_athlete
  on public.founding_member_legal_signatures (athlete_user_id, signed_at desc);

create or replace function public.set_founding_member_onboarding_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_founding_member_legal_documents_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_founding_member_onboarding_updated_at
  on public.founding_member_onboarding;

create trigger trg_founding_member_onboarding_updated_at
before update on public.founding_member_onboarding
for each row
execute function public.set_founding_member_onboarding_updated_at();

drop trigger if exists trg_founding_member_legal_documents_updated_at
  on public.founding_member_legal_documents;

create trigger trg_founding_member_legal_documents_updated_at
before update on public.founding_member_legal_documents
for each row
execute function public.set_founding_member_legal_documents_updated_at();

alter table public.founding_member_onboarding enable row level security;
alter table public.founding_member_legal_documents enable row level security;
alter table public.founding_member_legal_signatures enable row level security;

drop policy if exists "founding_member_onboarding_select_self_or_admin" on public.founding_member_onboarding;
create policy "founding_member_onboarding_select_self_or_admin"
on public.founding_member_onboarding
for select
to authenticated
using (
  athlete_user_id = auth.uid()
  or public.is_nomadic_admin()
);

drop policy if exists "founding_member_onboarding_update_self_or_admin" on public.founding_member_onboarding;
create policy "founding_member_onboarding_update_self_or_admin"
on public.founding_member_onboarding
for update
to authenticated
using (
  athlete_user_id = auth.uid()
  or public.is_nomadic_admin()
)
with check (
  athlete_user_id = auth.uid()
  or public.is_nomadic_admin()
);

drop policy if exists "founding_member_onboarding_insert_admin_only" on public.founding_member_onboarding;
create policy "founding_member_onboarding_insert_admin_only"
on public.founding_member_onboarding
for insert
to authenticated
with check (public.is_nomadic_admin());

drop policy if exists "founding_member_legal_documents_select_authenticated" on public.founding_member_legal_documents;
create policy "founding_member_legal_documents_select_authenticated"
on public.founding_member_legal_documents
for select
to authenticated
using (true);

drop policy if exists "founding_member_legal_documents_admin_manage" on public.founding_member_legal_documents;
create policy "founding_member_legal_documents_admin_manage"
on public.founding_member_legal_documents
for all
to authenticated
using (public.is_nomadic_admin())
with check (public.is_nomadic_admin());

drop policy if exists "founding_member_legal_signatures_select_self_or_admin" on public.founding_member_legal_signatures;
create policy "founding_member_legal_signatures_select_self_or_admin"
on public.founding_member_legal_signatures
for select
to authenticated
using (
  athlete_user_id = auth.uid()
  or public.is_nomadic_admin()
);

drop policy if exists "founding_member_legal_signatures_insert_self" on public.founding_member_legal_signatures;
create policy "founding_member_legal_signatures_insert_self"
on public.founding_member_legal_signatures
for insert
to authenticated
with check (athlete_user_id = auth.uid());

insert into public.founding_member_legal_documents (
  slug,
  title,
  version,
  requires_signature,
  is_active,
  content_markdown
)
values
  (
    'membership_agreement',
    'Nomadic Performance Membership Agreement',
    'v1.0',
    true,
    true,
    'Membership Agreement (Draft)\n\n- Membership scope and service expectations\n- Communication and scheduling terms\n- Billing and cancellation terms\n- Member responsibilities\n\nBy signing, you acknowledge and agree to the terms of this agreement.'
  ),
  (
    'liability_waiver',
    'Nomadic Performance Liability Waiver',
    'v1.0',
    true,
    true,
    'Liability Waiver (Draft)\n\n- Assumption of risk\n- Medical clearance responsibility\n- Limitation of liability\n- Emergency and safety acknowledgement\n\nBy signing, you acknowledge and agree to this waiver.'
  )
on conflict (slug) do update
set
  title = excluded.title,
  version = excluded.version,
  requires_signature = excluded.requires_signature,
  is_active = excluded.is_active,
  content_markdown = excluded.content_markdown,
  updated_at = now();

commit;
