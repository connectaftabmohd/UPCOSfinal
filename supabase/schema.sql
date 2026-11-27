-- UPCOS Portal Complete Supabase Database Schema
-- Run this SQL in your Supabase Dashboard -> SQL Editor to set up all tables for Auth and Website Data.

-- 1. Employee / User Profiles
create table if not exists public.portal_users (
  id text primary key,
  name text not null,
  mobile text default '',
  email text,
  password_hash text,
  salt text,
  district text not null default 'लखनऊ (Lucknow)',
  department text not null default 'चिकित्सा स्वास्थ्य एवं परिवार कल्याण (Health Dept)',
  designation text not null default 'आउटसोर्सिंग कर्मचारी',
  avatar text,
  is_verified boolean not null default false,
  role text not null default 'user' check (role in ('admin', 'user')),
  joined_date text not null default 'हाल ही में',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_portal_users_mobile on public.portal_users (mobile);
create index if not exists idx_portal_users_email on public.portal_users (lower(email));

-- 2. Admin Config
create table if not exists public.portal_admin_config (
  id text primary key,
  email text not null,
  password_hash text not null,
  salt text not null,
  updated_at timestamptz not null default now()
);

-- 3. Contact Messages
create table if not exists public.portal_contacts (
  id text primary key,
  name text not null,
  email text not null,
  phone text,
  subject text not null default 'सामान्य पूछताछ',
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4. Community Forum Posts
create table if not exists public.portal_community_posts (
  id text primary key,
  author_id text not null,
  author_name text not null,
  author_district text not null,
  author_department text not null,
  category text not null default 'सामान्य',
  content text not null,
  created_at_label text not null default 'अभी-अभी',
  likes integer not null default 0,
  comments_count integer not null default 0,
  report_count integer not null default 0,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now()
);

-- 5. Website News & Recruitment Posts
create table if not exists public.portal_news (
  id text primary key,
  slug text unique not null,
  title text not null,
  category text not null,
  department text not null,
  publication_date text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_portal_news_sort on public.portal_news (sort_order asc, updated_at desc);

-- 6. Government Orders (Shasanadesh)
create table if not exists public.portal_orders (
  id text primary key,
  slug text unique not null,
  order_number text not null,
  title text not null,
  department text not null,
  year integer not null default 2026,
  date text,
  sort_order integer not null default 0,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_portal_orders_sort on public.portal_orders (sort_order asc, updated_at desc);

-- 7. Government Departments
create table if not exists public.portal_departments (
  id text primary key,
  name text not null,
  english_name text not null,
  sort_order integer not null default 0,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- 8. Frequently Asked Questions (FAQs)
create table if not exists public.portal_faqs (
  id text primary key,
  category text not null default 'सामान्य',
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 9. Site Configuration (Breaking News Ticker & Settings)
create table if not exists public.portal_site_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security across all tables
alter table public.portal_users enable row level security;
alter table public.portal_admin_config enable row level security;
alter table public.portal_contacts enable row level security;
alter table public.portal_community_posts enable row level security;
alter table public.portal_news enable row level security;
alter table public.portal_orders enable row level security;
alter table public.portal_departments enable row level security;
alter table public.portal_faqs enable row level security;
alter table public.portal_site_config enable row level security;

-- Authenticated Supabase Auth users can read, insert, and update their own profile row
drop policy if exists "Users can read own profile" on public.portal_users;
create policy "Users can read own profile"
  on public.portal_users
  for select
  to authenticated
  using (id = ('sb-' || auth.uid()::text) or id = auth.uid()::text);

drop policy if exists "Users can insert own profile" on public.portal_users;
create policy "Users can insert own profile"
  on public.portal_users
  for insert
  to authenticated
  with check ((id = ('sb-' || auth.uid()::text) or id = auth.uid()::text) and role = 'user');

drop policy if exists "Users can update own profile" on public.portal_users;
create policy "Users can update own profile"
  on public.portal_users
  for update
  to authenticated
  using (id = ('sb-' || auth.uid()::text) or id = auth.uid()::text)
  with check ((id = ('sb-' || auth.uid()::text) or id = auth.uid()::text) and role = 'user');

-- Public read-only access for editorial website content (writes happen server-side via SUPABASE_SERVICE_ROLE_KEY)
drop policy if exists "Public read non-blocked community posts" on public.portal_community_posts;
create policy "Public read non-blocked community posts"
  on public.portal_community_posts
  for select
  using (is_blocked = false);

drop policy if exists "Public read news" on public.portal_news;
create policy "Public read news"
  on public.portal_news
  for select
  using (true);

drop policy if exists "Public read orders" on public.portal_orders;
create policy "Public read orders"
  on public.portal_orders
  for select
  using (true);

drop policy if exists "Public read departments" on public.portal_departments;
create policy "Public read departments"
  on public.portal_departments
  for select
  using (true);

drop policy if exists "Public read faqs" on public.portal_faqs;
create policy "Public read faqs"
  on public.portal_faqs
  for select
  using (true);

drop policy if exists "Public read site config" on public.portal_site_config;
create policy "Public read site config"
  on public.portal_site_config
  for select
  using (true);

-- Explicit Role Grants (ensures PostgREST & service_role access even when default privileges are restricted)
grant usage on schema public to anon, authenticated, service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant select, insert, update on public.portal_users to authenticated;
grant select on public.portal_community_posts, public.portal_news, public.portal_orders, public.portal_departments, public.portal_faqs, public.portal_site_config to anon, authenticated;

