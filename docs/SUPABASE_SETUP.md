# Supabase database checklist (login / multi-tenant)

If **login keeps loading** or redirects fail, check the following in your Supabase project.

## 1. Tables

In **Table Editor** (or SQL), confirm these exist:

| Table | Purpose |
|-------|---------|
| `user_profiles` | Profile per auth user (id = auth.uid()) |
| `organizations` | One row per business (has `created_by` = user id) |
| `organization_members` | Links users to orgs with `role` and `status` |

## 2. `user_profiles` columns

- `id` (uuid, primary key, same as `auth.users.id`)
- `full_name` (text)
- `email` (text) — optional but used by app
- `onboarding_completed_at` (timestamptz, optional) — when the user completed the guided onboarding wizard. Null means onboarding is incomplete.

Run **`supabase/migrations/20250622000000_add_onboarding_completed_at.sql`** to add this column if it does not exist.

## 3. RLS (Row Level Security)

**Enable RLS** on all three tables. Policies must allow the **authenticated** user to read/write their own data.

### user_profiles

- **Select**: user can read own row  
  `auth.uid() = id`
- **Insert**: user can insert own row (e.g. on signup)  
  `auth.uid() = id`

### organization_members

- **Select**: user can read rows where they are a member  
  `auth.uid() = user_id`
- **Insert**: e.g. only existing owners/admins (or service role for signup)

### organizations

- **Select**: user can read orgs they belong to (via `organization_members`)  
  e.g. `EXISTS (SELECT 1 FROM organization_members WHERE organization_id = organizations.id AND user_id = auth.uid())`
- **Insert**: e.g. `auth.uid() = created_by` so only the creator can insert

If **RLS is too strict** (e.g. no SELECT for authenticated user), the app will get empty results or errors and loading may never finish.

## 4. Quick checks in Supabase

1. **Authentication**  
   Dashboard → Authentication → Users: confirm the user exists after signup/login.

2. **SQL**  
   Run (replace `USER_UUID` with a real auth user id):

   ```sql
   -- Do you have a profile?
   SELECT * FROM user_profiles WHERE id = 'USER_UUID';

   -- Do you have any org memberships?
   SELECT * FROM organization_members WHERE user_id = 'USER_UUID';
   ```

3. **RLS**  
   Table → RLS: ensure policies allow the logged-in user to SELECT from `user_profiles` (own row) and from `organization_members` (own rows). If not, fix policies so authenticated users can read their data.

## 5. App behavior after fixes

- **Auth loading**: Set to false as soon as the session exists; profile loads in the background.
- **Org loading**: Has a 10s timeout; if the request fails or times out, loading stops and you get redirected to onboarding if there is no org.

If login still hangs, open DevTools → **Console** and **Network** and look for failed or slow requests to Supabase (e.g. `user_profiles` or `organization_members`).

---

## 6. sst_filings (SST Filing Periods)

To enable SST filing period tracking and status (draft, ready, submitted):

1. Run **`supabase/sst_filings.sql`** in Supabase SQL Editor. This creates:
   - `sst_filings` table (organization_id, period_start, period_end, due_date, total_amount, status, submitted_at, etc.)
   - RLS policies (same pattern as tax_deductions)
   - Trigger for `updated_at`

2. The app uses `sst_filings` for:
   - Tracking taxable periods (start/end dates, due date)
   - Filing status: draft, ready, submitted
   - SST-02 style exports with period summary

---

## 7. tax_deductions and invoices (RLS)

If you see **"new row violates row-level security policy for table 'tax_deductions'"** when saving a deduction:

1. The app already sends `organization_id` with each insert. The block is from Supabase RLS.
2. In **Supabase → SQL Editor**, run the script **`supabase/rls_tax_deductions.sql`** from this repo (or paste its contents and run). It creates policies so authenticated users can SELECT/INSERT/UPDATE/DELETE rows in `tax_deductions` only when they are an **active member** of that row’s `organization_id` (via `organization_members`).

After running the script, try adding a tax deduction again. If you use an `invoices` table with `organization_id`, add similar RLS policies for `invoices` (same pattern: allow access only when `organization_id` is in an org the user belongs to).

---

## 8. Phase 3: Invitations & Team (Optional)

To enable team management and invitations:

1. Run **`supabase/phase3_invitations.sql`** in Supabase SQL Editor. This creates:
   - `invitations` table (email, role, token, organization_id, etc.)
   - RLS policies for invitations
   - RLS policies for `user_profiles` (view org member profiles)
   - RLS policies for `organization_members` (view members of your org)

2. After running, you can:
   - Go to Settings → Team
   - Invite members by email and role (Admin, Accountant, Staff)
   - Invite emails are sent via the `send-invite-email` Edge Function (Resend). See [docs/INVITE_EMAIL.md](INVITE_EMAIL.md).
   - Or share the invite link manually: `/invite/{token}`
   - Invitees sign up or log in, visit the link, and accept
