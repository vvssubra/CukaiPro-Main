-- Bug reports from support widget: one row per conversation/session, messages in bug_report_messages.
-- support-chat Edge Function (service_role) inserts; admin page (anon) reads and updates status.

create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  message text not null,
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  page_url text,
  screenshot_base64 text,
  user_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bug_report_messages (
  id uuid primary key default gen_random_uuid(),
  bug_report_id uuid not null references public.bug_reports(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_bug_reports_session_id on public.bug_reports(session_id);
create index if not exists idx_bug_reports_created_at on public.bug_reports(created_at desc);
create index if not exists idx_bug_report_messages_bug_report_id on public.bug_report_messages(bug_report_id);

alter table public.bug_reports enable row level security;
alter table public.bug_report_messages enable row level security;

-- Anon: read all (for admin page), update bug_reports (status only from admin)
create policy "anon_select_bug_reports" on public.bug_reports for select to anon using (true);
create policy "anon_update_bug_reports" on public.bug_reports for update to anon using (true) with check (true);
create policy "anon_select_bug_report_messages" on public.bug_report_messages for select to anon using (true);

-- Service role can do everything (Edge Function uses service_role to insert)
create policy "service_all_bug_reports" on public.bug_reports for all to service_role using (true) with check (true);
create policy "service_all_bug_report_messages" on public.bug_report_messages for all to service_role using (true) with check (true);

comment on table public.bug_reports is 'Support widget bug reports; admin page at docs/bug-reports-admin.html';
