-- Create coach-managed blog posts table
create table if not exists public.coach_blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  category text,
  cover_image_url text,
  content_html text not null,
  published_at timestamptz,
  is_published boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coach_blog_posts_is_published_idx
  on public.coach_blog_posts (is_published, published_at desc);

create index if not exists coach_blog_posts_slug_idx
  on public.coach_blog_posts (slug);

alter table public.coach_blog_posts enable row level security;

create or replace function public.nomadic_blog_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_coach_blog_posts_updated_at on public.coach_blog_posts;
create trigger trg_coach_blog_posts_updated_at
before update on public.coach_blog_posts
for each row
execute function public.nomadic_blog_set_updated_at();

-- Public read access for published posts.
drop policy if exists "coach_blog_posts_public_read" on public.coach_blog_posts;
create policy "coach_blog_posts_public_read"
on public.coach_blog_posts
for select
using (is_published = true);

-- Coach admin can create/update/delete posts.
drop policy if exists "coach_blog_posts_admin_manage" on public.coach_blog_posts;
create policy "coach_blog_posts_admin_manage"
on public.coach_blog_posts
for all
to authenticated
using ((auth.jwt() ->> 'email') = 'joe@nomadicperformance.com')
with check ((auth.jwt() ->> 'email') = 'joe@nomadicperformance.com');
