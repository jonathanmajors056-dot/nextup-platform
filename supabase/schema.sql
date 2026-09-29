create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

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
  event_start_date timestamptz,
  event_end_date timestamptz,
  registration_deadline timestamptz,
  eligibility text not null default '',
  fees text,
  benefit text,
  skills text[] not null default '{}',
  tags text[] not null default '{}',
  search_text text not null default '',
  verification_status verification_status not null default 'awaiting_review',
  ai_confidence numeric not null default 0,
  status opportunity_status not null default 'draft',
  raw_source text,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

alter table public.opportunities
  add column if not exists search_text text not null default '';

create or replace function public.set_opportunity_search_text()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.search_text = lower(concat_ws(
    ' ', new.title, new.organizer, new.summary, new.description,
    array_to_string(new.skills, ' '), array_to_string(new.tags, ' ')
  ));
  return new;
end;
$$;

drop trigger if exists opportunities_set_search_text on public.opportunities;
create trigger opportunities_set_search_text
before insert or update of title, organizer, summary, description, skills, tags
on public.opportunities
for each row execute function public.set_opportunity_search_text();

update public.opportunities
set search_text = lower(concat_ws(
  ' ', title, organizer, summary, description,
  array_to_string(skills, ' '), array_to_string(tags, ' ')
))
where search_text = '';

create index if not exists opportunities_search_text_trgm_idx
  on public.opportunities using gin (search_text gin_trgm_ops)
  where status = 'published';

create table if not exists saved_opportunities (
  user_id uuid not null,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

create table if not exists opportunity_progress (
  user_id uuid not null,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  status text not null check (status in ('saved', 'applying', 'applied', 'shortlisted', 'won', 'not_selected')),
  updated_at timestamptz not null default now(),
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

create table if not exists product_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  opportunity_id uuid references opportunities(id) on delete set null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table opportunities enable row level security;
alter table saved_opportunities enable row level security;
alter table opportunity_progress enable row level security;
alter table opportunity_audit_log enable row level security;
alter table product_events enable row level security;

create policy "published opportunities are public" on opportunities
  for select using (status = 'published');
