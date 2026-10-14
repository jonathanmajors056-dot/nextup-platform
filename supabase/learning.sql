-- Durable adaptive learning events for the student signal desk.
-- Run after the main NextUp schema. The service role writes these rows; the
-- application only returns events for the viewer's stable HttpOnly workspace id.
create table if not exists student_learning_events (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid not null,
  event_key text,
  event_type text not null check (event_type in ('view', 'open', 'save', 'unsave', 'dismiss', 'feedback')),
  opportunity_id text,
  category text,
  format text,
  tags text[] not null default '{}',
  value text check (value is null or value in ('useful', 'not-useful')),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists student_learning_events_viewer_time_idx on student_learning_events(viewer_id, occurred_at desc);
alter table student_learning_events add column if not exists event_key text;
create unique index if not exists student_learning_events_viewer_key_idx on student_learning_events(viewer_id, event_key) where event_key is not null;
alter table student_learning_events enable row level security;
