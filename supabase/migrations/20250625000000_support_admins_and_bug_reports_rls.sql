-- Support admins: users who can access bug reports admin (read/update bug_reports and bug_report_messages).
-- Add via SQL or service_role only. Authenticated users can SELECT their own row to check if they are a support admin.
create table if not exists public.support_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.support_admins enable row level security;

-- Authenticated users can only check if they themselves are in the table (for the in-app admin page).
drop policy if exists "support_admins_select_own" on public.support_admins;
create policy "support_admins_select_own"
  on public.support_admins for select to authenticated
  using (user_id = auth.uid());

comment on table public.support_admins is 'Users allowed to access Bug Reports Admin (dashboard). Add via SQL: INSERT INTO support_admins (user_id) VALUES (auth.users.id);';

-- Drop anon policies so only authenticated support admins and service_role can access bug reports.
drop policy if exists "anon_select_bug_reports" on public.bug_reports;
drop policy if exists "anon_update_bug_reports" on public.bug_reports;
drop policy if exists "anon_select_bug_report_messages" on public.bug_report_messages;

-- Authenticated support admins: SELECT and UPDATE bug_reports, SELECT bug_report_messages.
drop policy if exists "support_admin_select_bug_reports" on public.bug_reports;
create policy "support_admin_select_bug_reports"
  on public.bug_reports for select to authenticated
  using (
    exists (select 1 from public.support_admins where support_admins.user_id = auth.uid())
  );

drop policy if exists "support_admin_update_bug_reports" on public.bug_reports;
create policy "support_admin_update_bug_reports"
  on public.bug_reports for update to authenticated
  using (
    exists (select 1 from public.support_admins where support_admins.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.support_admins where support_admins.user_id = auth.uid())
  );

drop policy if exists "support_admin_select_bug_report_messages" on public.bug_report_messages;
create policy "support_admin_select_bug_report_messages"
  on public.bug_report_messages for select to authenticated
  using (
    exists (select 1 from public.support_admins where support_admins.user_id = auth.uid())
  );

-- service_role policies remain (Edge Function uses service_role to insert).
-- No change to service_all_* policies from original migration.
