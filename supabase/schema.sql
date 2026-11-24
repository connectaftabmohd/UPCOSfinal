-- UPCOS Portal Supabase Schema
-- Run this SQL in your Supabase Dashboard -> SQL Editor if you want relational table persistence
-- Note: Supabase Email OTP Auth works immediately out of the box even before creating these tables.

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

create table if not exists public.portal_admin_config (
  id text primary key,
  email text not null,
  password_hash text not null,
  salt text not null,
  updated_at timestamptz not null default now()
);

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

-- Enable Row Level Security (server accesses via SUPABASE_SERVICE_ROLE_KEY)
alter table public.portal_users enable row level security;
alter table public.portal_admin_config enable row level security;
alter table public.portal_contacts enable row level security;
alter table public.portal_community_posts enable row level security;

-- Public read policy only for non-blocked community posts
drop policy if exists "Public read non-blocked community posts" on public.portal_community_posts;
create policy "Public read non-blocked community posts"
  on public.portal_community_posts
  for select
  using (is_blocked = false);
