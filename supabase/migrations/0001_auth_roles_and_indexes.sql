-- NextUp launch migration.
-- Apply this after 0000_baseline.sql (or after the existing supabase/schema.sql bootstrap script).

begin;

do $$
begin
  create type public.submission_status as enum ('queued', 'processing', 'completed', 'failed');
exception
  when duplicate_object then null;
end
$$;

alter table public.opportunities
  add column if not exists published_at timestamptz,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_by uuid references auth.users(id) on delete set null,
  add column if not exists dedupe_hash text,
  add column if not exists search_text text not null default '';

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  raw_text text not null,
  source_url text,
  source_type text not null default 'manual',
  submitted_by uuid references auth.users(id) on delete set null,
  status public.submission_status not null default 'queued',
  opportunity_id uuid references public.opportunities(id) on delete set null,
  idempotency_key text,
  attempt_count integer not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint submissions_raw_text_length check (char_length(raw_text) between 20 and 30000)
);

create unique index if not exists submissions_idempotency_key_idx
  on public.submissions (idempotency_key)
  where idempotency_key is not null;

create unique index if not exists opportunities_dedupe_hash_idx
  on public.opportunities (dedupe_hash)
  where dedupe_hash is not null;

create index if not exists opportunities_published_deadline_idx
  on public.opportunities (registration_deadline, id)
  where status = 'published';

create index if not exists opportunities_review_queue_idx
  on public.opportunities (created_at desc)
  where status = 'draft';

create index if not exists opportunities_category_format_idx
  on public.opportunities (category, format, registration_deadline)
  where status = 'published';

create index if not exists opportunities_published_at_idx
  on public.opportunities (published_at desc, id)
  where status = 'published';

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

create index if not exists saved_opportunities_user_created_idx
  on public.saved_opportunities (user_id, created_at desc);

create index if not exists saved_opportunities_opportunity_idx
  on public.saved_opportunities (opportunity_id);

create index if not exists submissions_status_created_idx
  on public.submissions (status, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists opportunities_set_updated_at on public.opportunities;
create trigger opportunities_set_updated_at
before update on public.opportunities
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

drop trigger if exists submissions_set_updated_at on public.submissions;
create trigger submissions_set_updated_at
before update on public.submissions
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and is_active = true
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.opportunities enable row level security;
alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.submissions enable row level security;
alter table public.saved_opportunities enable row level security;
alter table public.opportunity_audit_log enable row level security;
alter table public.product_events enable row level security;

revoke all on public.opportunities from anon, authenticated;
grant select on public.opportunities to anon, authenticated;
grant insert, update, delete on public.opportunities to authenticated;

revoke all on public.profiles from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;

revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

revoke all on public.submissions from anon, authenticated;
grant select, insert, update on public.submissions to authenticated;

revoke all on public.saved_opportunities from anon, authenticated;
grant select, insert, delete on public.saved_opportunities to authenticated;

revoke all on public.opportunity_audit_log from anon, authenticated;
grant select, insert on public.opportunity_audit_log to authenticated;

revoke all on public.product_events from anon, authenticated;
grant insert on public.product_events to anon, authenticated;
grant select on public.product_events to authenticated;

drop policy if exists "published opportunities are public" on public.opportunities;
drop policy if exists "opportunities_public_read" on public.opportunities;
drop policy if exists "opportunities_admin_all" on public.opportunities;
create policy "opportunities_public_read" on public.opportunities
  for select to anon, authenticated
  using (status = 'published');
create policy "opportunities_admin_all" on public.opportunities
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "profiles_owner_read" on public.profiles;
drop policy if exists "profiles_owner_insert" on public.profiles;
drop policy if exists "profiles_owner_update" on public.profiles;
create policy "profiles_owner_read" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles_owner_insert" on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy "profiles_owner_update" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "admin_users_admin_read" on public.admin_users;
create policy "admin_users_admin_read" on public.admin_users
  for select to authenticated using (public.is_admin());

drop policy if exists "submissions_admin_all" on public.submissions;
create policy "submissions_admin_all" on public.submissions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "saved_owner_read" on public.saved_opportunities;
drop policy if exists "saved_owner_insert" on public.saved_opportunities;
drop policy if exists "saved_owner_delete" on public.saved_opportunities;
create policy "saved_owner_read" on public.saved_opportunities
  for select to authenticated using (user_id = auth.uid());
create policy "saved_owner_insert" on public.saved_opportunities
  for insert to authenticated with check (user_id = auth.uid());
create policy "saved_owner_delete" on public.saved_opportunities
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "audit_admin_all" on public.opportunity_audit_log;
create policy "audit_admin_all" on public.opportunity_audit_log
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "product_events_public_insert" on public.product_events;
drop policy if exists "product_events_admin_read" on public.product_events;
create policy "product_events_public_insert" on public.product_events
  for insert to anon, authenticated with check (true);
create policy "product_events_admin_read" on public.product_events
  for select to authenticated using (public.is_admin());

commit;
