# Runbook: Support admins migration + support-chat secrets

Use this when:

- You need to apply **`20250625000000_support_admins_and_bug_reports_rls.sql`** (support admins table + RLS) and `db push` fails due to remote/local migration mismatch.
- You need to **insert a support admin** and set **Edge Function secrets** for `support-chat`.

---

## 1. Apply the migration (SQL Editor)

Because `npx supabase db push` can fail when the remote has migrations not in this repo, apply the migration manually:

1. Open **Supabase Dashboard** → **SQL Editor**.
2. Open the file **`supabase/migrations/20250625000000_support_admins_and_bug_reports_rls.sql`** from this repo.
3. Copy its full contents, paste into the SQL Editor, and **Run**.

This creates `support_admins`, enables RLS, drops anon policies on `bug_reports` / `bug_report_messages`, and adds policies so only authenticated support admins (and service_role) can read/update.

---

## 2. Insert at least one support admin

In **SQL Editor** (or Table Editor for `support_admins`), run:

```sql
INSERT INTO public.support_admins (user_id) VALUES ('<auth.users.id>');
```

Replace **`<auth.users.id>`** with the **UUID** of the user who should access Bug Reports Admin:

- **Dashboard → Authentication → Users** → copy the **User UID** of that user.
- Example: `INSERT INTO public.support_admins (user_id) VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890');`

To avoid duplicates, use `ON CONFLICT DO NOTHING`:

```sql
INSERT INTO public.support_admins (user_id) VALUES ('<your-user-uuid>')
ON CONFLICT (user_id) DO NOTHING;
```

---

## 3. Set Edge Function secrets for `support-chat`

The `support-chat` function needs **both** keys:

- **`SUPABASE_SERVICE_ROLE_KEY`** – to insert into `bug_reports` and `bug_report_messages`. You must set this in the Dashboard (or via CLI if your provider allows it; Supabase reserves `SUPABASE_*` so CLI may skip it).
- **`SUPABASE_ANON_KEY`** – automatically available to Edge Functions; no need to set it unless you use a different project. Used to validate that requests come from your frontend (widget sends `Authorization: Bearer <anon_key>`).

### Option A: Dashboard

1. **Supabase Dashboard** → **Edge Functions** → **support-chat** → **Secrets**.
2. Add:
   - **`SUPABASE_SERVICE_ROLE_KEY`** (Project Settings → API → **service_role** key).
   - **`SUPABASE_ANON_KEY`** (Project Settings → API → **anon public** key).

### Option B: CLI

From the project root (with Supabase CLI linked):

```bash
npx supabase secrets set SUPABASE_ANON_KEY="<your-anon-key>" SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
```

Replace `<your-anon-key>` and `<your-service-role-key>` with the values from **Project Settings → API**. Secrets are project-wide, so all Edge Functions (including `support-chat`) can read them.

---

## 4. Verify

- Log in to the app as the user you added to `support_admins`.
- Go to **Dashboard → Admin → Bug Reports** (or `/dashboard/admin/bug-reports`).
- Confirm you see the Bug Reports Admin page and existing reports (if any).
