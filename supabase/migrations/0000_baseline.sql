-- Idempotent baseline for a fresh Supabase project.
-- 0001 adds Auth roles, submission state, indexes, triggers, and policies.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

do $$
begin
  create type public.opportunity_status as enum ('draft', 'published', 'archived', 'rejected');
exception when duplicate_object then null;
end
$$;

do $$
begin
  create type public.verification_status as enum ('awaiting_review', 'community_submitted', 'officially_verified', 'rejected', 'expired');
exception when duplicate_object then null;
end
$$;

create table if not exists public.opportunities (
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
  event_start_date timestamptz,
  event_end_date timestamptz,
  registration_deadline timestamptz,
  eligibility text not null default '',
  fees text,
  benefit text,
  skills text[] not null default '{}',
  tags text[] not null default '{}',
  search_text text not null default '',
  verification_status public.verification_status not null default 'awaiting_review',
  ai_confidence numeric not null default 0,
  status public.opportunity_status not null default 'draft',
  raw_source text,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_opportunities (
  user_id uuid not null,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

create table if not exists public.opportunity_audit_log (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  actor_id uuid,
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
