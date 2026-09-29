-- Persist the student journey after a save: applying -> applied -> outcome.
create table if not exists public.opportunity_progress (
  user_id uuid not null,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  status text not null check (status in ('saved', 'applying', 'applied', 'shortlisted', 'won', 'not_selected')),
  updated_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

alter table public.opportunity_progress enable row level security;
revoke all on public.opportunity_progress from anon, authenticated;
grant select, insert, update on public.opportunity_progress to authenticated;

drop policy if exists "progress_owner_read" on public.opportunity_progress;
drop policy if exists "progress_owner_insert" on public.opportunity_progress;
drop policy if exists "progress_owner_update" on public.opportunity_progress;
create policy "progress_owner_read" on public.opportunity_progress
  for select to authenticated using (user_id = auth.uid());
create policy "progress_owner_insert" on public.opportunity_progress
  for insert to authenticated with check (user_id = auth.uid());
create policy "progress_owner_update" on public.opportunity_progress
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
