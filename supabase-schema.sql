-- =============================================================
-- FLYUN STUDIO · Supabase schema
-- 飞云工作室 · 数据库初始化
--
-- HOW TO USE
--   1. Open the Supabase project SQL Editor:
--      https://app.supabase.com/project/<your-project>/sql
--   2. Paste the entire content of this file and click "Run".
--   3. In Authentication → Users, create at least one admin user
--      (email + password). The studio admin signs in with that
--      account inside admin.html → "Cloud" tab to push changes.
--
-- DESIGN NOTES
--   - Public visitors read with the publishable anon key.
--   - All write operations require an authenticated Supabase user
--     (RLS: USING auth.role() = 'authenticated').
--   - Drafts are hidden from public read; admins still see them.
-- =============================================================

-- ----- Extensions -------------------------------------------------
create extension if not exists "pgcrypto";

-- ----- Helper: updated_at trigger --------------------------------
create or replace function public.flyun_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- =============================================================
-- 1. POSTS  · 博客文章
-- =============================================================
create table if not exists public.posts (
  id           text primary key,
  title_zh     text,
  title_en     text,
  excerpt_zh   text,
  excerpt_en   text,
  body_zh      text,
  body_en      text,
  tags         text[] default '{}'::text[],
  cover        text,
  status       text default 'published'
                check (status in ('draft','published')),
  date         date default current_date,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.flyun_touch_updated_at();

alter table public.posts enable row level security;
drop policy if exists "posts public read" on public.posts;
drop policy if exists "posts auth read all" on public.posts;
drop policy if exists "posts auth write" on public.posts;
create policy "posts public read"   on public.posts for select using (status = 'published');
create policy "posts auth read all" on public.posts for select to authenticated using (true);
create policy "posts auth write"    on public.posts for all   to authenticated using (true) with check (true);

-- =============================================================
-- 2. CASES · 案例
-- =============================================================
create table if not exists public.cases (
  id           text primary key,
  title_zh     text,
  title_en     text,
  subtitle_zh  text,
  subtitle_en  text,
  category     text,                -- immersive / xr / brand / talent / ip
  year         text,
  cover        text,
  link         text,
  position     int default 0,
  status       text default 'published'
                check (status in ('draft','published')),
  meta         jsonb default '{}'::jsonb,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
drop trigger if exists cases_touch on public.cases;
create trigger cases_touch before update on public.cases
  for each row execute function public.flyun_touch_updated_at();

alter table public.cases enable row level security;
drop policy if exists "cases public read" on public.cases;
drop policy if exists "cases auth read all" on public.cases;
drop policy if exists "cases auth write" on public.cases;
create policy "cases public read"   on public.cases for select using (status = 'published');
create policy "cases auth read all" on public.cases for select to authenticated using (true);
create policy "cases auth write"    on public.cases for all   to authenticated using (true) with check (true);

-- =============================================================
-- 3. LETTERS · FLYUN Letter 双月刊
-- =============================================================
create table if not exists public.letters (
  id           text primary key,
  issue        text,
  title_zh     text,
  title_en     text,
  excerpt_zh   text,
  excerpt_en   text,
  body_zh      text,
  body_en      text,
  cover        text,
  status       text default 'published'
                check (status in ('draft','published')),
  date         date default current_date,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
drop trigger if exists letters_touch on public.letters;
create trigger letters_touch before update on public.letters
  for each row execute function public.flyun_touch_updated_at();

alter table public.letters enable row level security;
drop policy if exists "letters public read" on public.letters;
drop policy if exists "letters auth read all" on public.letters;
drop policy if exists "letters auth write" on public.letters;
create policy "letters public read"   on public.letters for select using (status = 'published');
create policy "letters auth read all" on public.letters for select to authenticated using (true);
create policy "letters auth write"    on public.letters for all   to authenticated using (true) with check (true);

-- =============================================================
-- 4. JOBS · 招聘
-- =============================================================
create table if not exists public.jobs (
  id              text primary key,
  title_zh        text,
  title_en        text,
  team            text,
  location        text,
  type            text,             -- full-time / part-time / freelance
  description_zh  text,
  description_en  text,
  status          text default 'open'
                   check (status in ('open','closed','draft')),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
drop trigger if exists jobs_touch on public.jobs;
create trigger jobs_touch before update on public.jobs
  for each row execute function public.flyun_touch_updated_at();

alter table public.jobs enable row level security;
drop policy if exists "jobs public read" on public.jobs;
drop policy if exists "jobs auth read all" on public.jobs;
drop policy if exists "jobs auth write" on public.jobs;
create policy "jobs public read"   on public.jobs for select using (status = 'open');
create policy "jobs auth read all" on public.jobs for select to authenticated using (true);
create policy "jobs auth write"    on public.jobs for all   to authenticated using (true) with check (true);

-- =============================================================
-- 5. SITE_CONTENT · 双语 i18n 文案覆盖
-- =============================================================
create table if not exists public.site_content (
  lang        text not null check (lang in ('zh','en')),
  key         text not null,
  value       text,
  updated_at  timestamptz default now(),
  primary key (lang, key)
);
drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch before update on public.site_content
  for each row execute function public.flyun_touch_updated_at();

alter table public.site_content enable row level security;
drop policy if exists "content public read" on public.site_content;
drop policy if exists "content auth write" on public.site_content;
create policy "content public read" on public.site_content for select using (true);
create policy "content auth write"  on public.site_content for all to authenticated using (true) with check (true);

-- =============================================================
-- 6. SITE_IMAGES · 命名图片槽
--    e.g. key='home.about.portrait', url='https://…'
-- =============================================================
create table if not exists public.site_images (
  key         text primary key,
  url         text not null,
  updated_at  timestamptz default now()
);
drop trigger if exists site_images_touch on public.site_images;
create trigger site_images_touch before update on public.site_images
  for each row execute function public.flyun_touch_updated_at();

alter table public.site_images enable row level security;
drop policy if exists "images public read" on public.site_images;
drop policy if exists "images auth write" on public.site_images;
create policy "images public read" on public.site_images for select using (true);
create policy "images auth write"  on public.site_images for all to authenticated using (true) with check (true);

-- =============================================================
-- 7. SITE_SETTINGS · 全站设置（主题默认值、首页开关等）
-- =============================================================
create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb,
  updated_at  timestamptz default now()
);
drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.flyun_touch_updated_at();

alter table public.site_settings enable row level security;
drop policy if exists "settings public read" on public.site_settings;
drop policy if exists "settings auth write" on public.site_settings;
create policy "settings public read" on public.site_settings for select using (true);
create policy "settings auth write"  on public.site_settings for all to authenticated using (true) with check (true);

-- =============================================================
-- 8. (Optional) Storage bucket for image uploads
--    Run this in the SQL editor after creating a public bucket
--    named "flyun" in Storage. Uncomment to apply policies.
-- =============================================================
-- insert into storage.buckets (id, name, public)
--   values ('flyun', 'flyun', true)
--   on conflict (id) do nothing;
-- drop policy if exists "flyun read"  on storage.objects;
-- drop policy if exists "flyun write" on storage.objects;
-- create policy "flyun read"  on storage.objects for select  using (bucket_id = 'flyun');
-- create policy "flyun write" on storage.objects for all     to authenticated
--   using (bucket_id = 'flyun') with check (bucket_id = 'flyun');

-- =============================================================
-- DONE.  Public visitors can now read published content; the
-- studio admin must sign in (Supabase Auth) to write.
-- =============================================================
