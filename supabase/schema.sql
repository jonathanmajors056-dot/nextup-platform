create extension if not exists pgcrypto;

create type opportunity_status as enum ('draft', 'published', 'archived', 'rejected');
create type verification_status as enum ('awaiting_review', 'community_submitted', 'officially_verified', 'rejected', 'expired');

create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  summary text not null default '',
  category text not null default 'Other',
  organizer text not null default '',
  official_url text not null,
  source_url text,
  source_type text not null default 'manual',
  format text not null default 'online',
  location text,
  latitude numeric,
  longitude numeric,
  event_start_date timestamptz,
  event_end_date timestamptz,
  registration_deadline timestamptz,
  eligibility text not null default '',
  fees text,
  benefit text,
  skills text[] not null default '{}',
  tags text[] not null default '{}',
  verification_status verification_status not null default 'awaiting_review',
  ai_confidence numeric not null default 0,
  status opportunity_status not null default 'draft',
  raw_source text,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists saved_opportunities (
  user_id uuid not null,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

create table if not exists opportunity_audit_log (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references opportunities(id) on delete cascade,
  actor_id uuid,
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists opportunity_sources (
  id text primary key,
  name text not null,
  kind text not null,
  status text not null default 'needs_configuration',
  source_url text,
  regions text[] not null default '{}',
  supports_online boolean not null default false,
  last_run_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists opportunity_source_items (
  fingerprint text primary key,
  provider_id text not null references opportunity_sources(id) on delete cascade,
  external_id text,
  opportunity_id uuid references opportunities(id) on delete set null,
  source_url text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists location_preferences (
  user_id uuid primary key,
  label text not null,
  city text not null default '',
  region text not null default '',
  country text not null default 'India',
  latitude numeric,
  longitude numeric,
  precision text not null default 'city',
  consented_to_geolocation boolean not null default false,
  radius_km integer not null default 250,
  updated_at timestamptz not null default now()
);

-- Safe upgrades for projects that already ran an earlier NextUp schema.
alter table opportunities add column if not exists latitude numeric;
alter table opportunities add column if not exists longitude numeric;
alter table location_preferences add column if not exists radius_km integer not null default 250;

alter table opportunities enable row level security;
alter table saved_opportunities enable row level security;
alter table opportunity_audit_log enable row level security;
alter table opportunity_sources enable row level security;
alter table opportunity_source_items enable row level security;
alter table location_preferences enable row level security;

create policy "published opportunities are public" on opportunities
  for select using (status = 'published');

-- NewsPortal tables. Stories remain attributed to their canonical source and are
-- never published by ingestion without an explicit review decision.
create table if not exists news_items (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  summary text not null default '',
  publisher text not null,
  canonical_url text not null unique,
  source_url text not null,
  source_type text not null default 'rss',
  author text not null default '',
  published_at timestamptz not null,
  updated_at timestamptz,
  image_url text,
  video_url text,
  category text not null default 'AI',
  tags text[] not null default '{}',
  topics text[] not null default '{}',
  geography text not null default 'Global',
  entities text[] not null default '{}',
  language text not null default 'en',
  reading_minutes integer not null default 1,
  fingerprint text not null unique,
  verification_status text not null default 'awaiting_review',
  status text not null default 'draft',
  ingested_at timestamptz not null default now(),
  fresh_until timestamptz not null,
  is_breaking boolean not null default false,
  is_sponsored boolean not null default false
);

create table if not exists saved_news (
  user_id uuid not null,
  news_id uuid not null references news_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, news_id)
);

create table if not exists news_audit_log (
  id uuid primary key default gen_random_uuid(),
  news_id uuid references news_items(id) on delete cascade,
  actor_id uuid,
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table news_items enable row level security;
alter table saved_news enable row level security;
alter table news_audit_log enable row level security;

create policy "published news is public" on news_items
  for select using (status = 'published');
