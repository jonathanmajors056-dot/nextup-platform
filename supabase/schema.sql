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

alter table opportunities enable row level security;
alter table saved_opportunities enable row level security;
alter table opportunity_audit_log enable row level security;
alter table opportunity_sources enable row level security;
alter table opportunity_source_items enable row level security;
alter table location_preferences enable row level security;

create policy "published opportunities are public" on opportunities
  for select using (status = 'published');
