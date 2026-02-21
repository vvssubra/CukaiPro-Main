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

## 6. tax_deductions and invoices (RLS)

If you see **"new row violates row-level security policy for table 'tax_deductions'"** when saving a deduction:

1. The app already sends `organization_id` with each insert. The block is from Supabase RLS.
2. In **Supabase → SQL Editor**, run the script **`supabase/rls_tax_deductions.sql`** from this repo (or paste its contents and run). It creates policies so authenticated users can SELECT/INSERT/UPDATE/DELETE rows in `tax_deductions` only when they are an **active member** of that row’s `organization_id` (via `organization_members`).

After running the script, try adding a tax deduction again. If you use an `invoices` table with `organization_id`, add similar RLS policies for `invoices` (same pattern: allow access only when `organization_id` is in an org the user belongs to).
