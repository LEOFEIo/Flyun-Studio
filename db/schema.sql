-- =========================================================
-- FLYUN STUDIO · Supabase 初始化脚本
-- 在 Supabase SQL Editor 中一次性运行
-- 项目: https://neppacfsixrjzpkvcgxy.supabase.co
-- =========================================================

-- 必要扩展
create extension if not exists pgcrypto;

-- =========================================================
-- 1. 表结构
-- =========================================================

-- 博客文章
create table if not exists public.posts (
  id          text primary key default ('p_' || extract(epoch from now())::bigint),
  title_zh    text default '',
  title_en    text default '',
  excerpt_zh  text default '',
  excerpt_en  text default '',
  body_zh     text default '',
  body_en     text default '',
  tags        text[] default '{}',
  cover       text default '',
  status      text default 'published' check (status in ('published','draft')),
  date        text default to_char(now(), 'YYYY-MM-DD'),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists posts_status_date_idx on public.posts (status, date desc);
create index if not exists posts_updated_idx     on public.posts (updated_at desc);

-- 主页 / 站内多语言文案覆盖（按 (key, lang) 唯一）
create table if not exists public.content_overrides (
  key         text not null,
  lang        text not null check (lang in ('zh','en')),
  value       text default '',
  updated_at  timestamptz default now(),
  primary key (key, lang)
);

-- 图片资源（hero 头像、案例封面、博客封面…）
create table if not exists public.images (
  key         text primary key,
  url         text not null,
  label       text default '',
  updated_at  timestamptz default now()
);

-- 站点级别设置（默认主题、公告、SEO…）
create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb default '{}'::jsonb,
  updated_at  timestamptz default now()
);

-- =========================================================
-- 2. Row Level Security
-- 公开页面访客（anon）可以读，写操作必须是已认证用户。
-- =========================================================

alter table public.posts             enable row level security;
alter table public.content_overrides enable row level security;
alter table public.images            enable row level security;
alter table public.site_settings     enable row level security;

-- 删除可能已存在的旧策略（幂等）
drop policy if exists "posts read public"        on public.posts;
drop policy if exists "posts read all auth"      on public.posts;
drop policy if exists "posts write auth"         on public.posts;
drop policy if exists "content read public"      on public.content_overrides;
drop policy if exists "content write auth"       on public.content_overrides;
drop policy if exists "images read public"       on public.images;
drop policy if exists "images write auth"        on public.images;
drop policy if exists "settings read public"     on public.site_settings;
drop policy if exists "settings write auth"      on public.site_settings;

-- posts: 任何人能读"已发布"，登录用户能读全部并写
create policy "posts read public" on public.posts
  for select using (status = 'published');

create policy "posts read all auth" on public.posts
  for select to authenticated using (true);

create policy "posts write auth" on public.posts
  for all to authenticated using (true) with check (true);

-- content_overrides: 公开读，登录写
create policy "content read public" on public.content_overrides
  for select using (true);

create policy "content write auth" on public.content_overrides
  for all to authenticated using (true) with check (true);

-- images: 公开读，登录写
create policy "images read public" on public.images
  for select using (true);

create policy "images write auth" on public.images
  for all to authenticated using (true) with check (true);

-- site_settings: 公开读，登录写
create policy "settings read public" on public.site_settings
  for select using (true);

create policy "settings write auth" on public.site_settings
  for all to authenticated using (true) with check (true);

-- =========================================================
-- 3. Storage bucket（用于上传图片）
-- 在 Supabase Dashboard 的 Storage 面板手动创建一个名为
-- "flyun-public" 的 PUBLIC bucket，或者在此运行：
-- =========================================================

insert into storage.buckets (id, name, public)
values ('flyun-public', 'flyun-public', true)
on conflict (id) do nothing;

-- Storage 策略（已登录用户可上传 / 删除，所有人可读）
drop policy if exists "flyun storage read"   on storage.objects;
drop policy if exists "flyun storage write"  on storage.objects;
drop policy if exists "flyun storage update" on storage.objects;
drop policy if exists "flyun storage delete" on storage.objects;

create policy "flyun storage read" on storage.objects
  for select using (bucket_id = 'flyun-public');

create policy "flyun storage write" on storage.objects
  for insert to authenticated with check (bucket_id = 'flyun-public');

create policy "flyun storage update" on storage.objects
  for update to authenticated using (bucket_id = 'flyun-public');

create policy "flyun storage delete" on storage.objects
  for delete to authenticated using (bucket_id = 'flyun-public');

-- =========================================================
-- 4. 一些可选示例数据（演示效果）
-- =========================================================

insert into public.posts (id, title_zh, title_en, excerpt_zh, excerpt_en, body_zh, body_en, tags, status, date)
values (
  'p_welcome',
  '飞云博客 · 第一封信',
  'FLYUN Journal · A First Letter',
  '把交互空间、XR 与人才业务的日常笔记，发到一个所有人都能看的地方。',
  'Putting the daily notes of spatial design, XR and talent into a place everyone can see.',
  '# 一封迟到的开场白\n\n这是 **飞云博客** 的第一篇。在这之前，我们的笔记停留在文件夹和私密文档里。今天起，所有有意思的研究、未完成的概念、设计过程中的弯路 —— 都会发布在这里。\n\n> 让空间会回应人，让对的人在场。\n\n— Leo',
  '# A late opening note\n\nThis is the first post of **FLYUN Journal**. Until today our notes lived in folders and private docs. From now on, every research, half-baked concept and detour in the design process gets published here.\n\n> Let space respond to people. Let the right people be there.\n\n— Leo',
  array['工作室日记','XR','journal'],
  'published',
  to_char(now(), 'YYYY-MM-DD')
)
on conflict (id) do nothing;

-- 默认设置
insert into public.site_settings (key, value)
values
  ('theme',    '{"default":""}'),
  ('announce', '{"zh":"","en":""}'),
  ('tagline',  '"交互空间 · XR · 猎头人才"'),
  ('email',    '"hello@flyun.studio"')
on conflict (key) do update set value = excluded.value;

-- =========================================================
-- 完成
-- 接下来：
-- 1) 在 Supabase Dashboard → Authentication → Providers
--    打开 Email provider 并允许注册。
-- 2) 在 Authentication → Users 创建主理人账号，或在 admin.html
--    点「注册」按钮，注册后到邮箱点击验证。
-- 3) 用账号登录 admin.html，所有保存自动同步到云端，全网访客可见。
-- =========================================================
