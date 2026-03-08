# Do now: Support admins + support-chat (project xkylwjlcablefymuzoie)

`db push` can't be used here (duplicate migration versions and remote history), so do these three steps in the Dashboard.

---

## 1. Run the migration (SQL Editor)

1. Open: **https://supabase.com/dashboard/project/xkylwjlcablefymuzoie/sql/new**
2. Open **`supabase/migrations/20250625000000_support_admins_and_bug_reports_rls.sql`** in your repo, copy **all** of it, paste into the SQL Editor, click **Run**.

---

## 2. Insert yourself as a support admin

1. Get your user ID: **https://supabase.com/dashboard/project/xkylwjlcablefymuzoie/auth/users** → copy the **User UID** (UUID) of your user.
2. In SQL Editor run (replace `YOUR-USER-UUID` with that UUID):

```sql
INSERT INTO public.support_admins (user_id) VALUES ('YOUR-USER-UUID')
ON CONFLICT (user_id) DO NOTHING;
```

---

## 3. Set Edge Function secret (support-chat)

- **SUPABASE_ANON_KEY** – already available to Edge Functions; no action needed.
- **SUPABASE_SERVICE_ROLE_KEY** – you must set this:

1. Open: **https://supabase.com/dashboard/project/xkylwjlcablefymuzoie/settings/api**
2. Copy the **service_role** key (secret).
3. Open: **https://supabase.com/dashboard/project/xkylwjlcablefymuzoie/functions/support-chat/details**
4. Go to **Secrets** (or project **Edge Functions** → **Secrets**).
5. Add secret: name **`SUPABASE_SERVICE_ROLE_KEY`**, value = the key you copied → Save.

After this, the support widget and Bug Reports Admin will work.
