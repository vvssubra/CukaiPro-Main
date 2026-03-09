# Seed data – test all features and flows

Load sample data into your CukaiPro Supabase project so you can click through every area of the app (dashboard, invoices, deductions, SST, EA forms, sales, reports, team) without entering data by hand.

## Prerequisites

- Supabase project linked to your app (`.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).
- Migrations applied: at least the ones that create `organizations`, `organization_members`, `user_profiles`, `contacts`, `invoices`, `tax_deductions`, `sst_filings`, `ea_forms`, `quotations`, `quotation_lines`, `credit_notes`, `credit_note_lines`.  
  See [Supabase setup](SUPABASE_SETUP.md) and [Accounting setup](ACCOUNTING_SETUP.md) (for `accounts` / `transactions`).
- You have **signed up** and **created one organization** (or use an existing one).

## Step 1: Get your organization ID

1. Log in to the app and go to **Settings** (or **Settings → Team**).
2. Or in Supabase: **SQL Editor** → run:
   ```sql
   SELECT id, business_name FROM organizations ORDER BY created_at DESC LIMIT 5;
   ```
3. Copy the `id` (UUID) of the organization you want to seed.

## Step 2: Edit the seed script

1. Open **`supabase/seed_data.sql`** in this repo.
2. Replace **`YOUR_ORG_ID_HERE`** with your organization UUID (both occurrences: the main one at the top of the `DO` block).
   - Example: `oid UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';`

## Step 3: Run the script

1. In Supabase Dashboard, go to **SQL Editor**.
2. Paste the full contents of `supabase/seed_data.sql` (after replacing the placeholder).
3. Click **Run** (or press the run shortcut).
4. You should see a notice: `Seed data inserted for organization ...`

If you get **"relation … does not exist"**: run the migrations that create the missing table (see [SUPABASE_SETUP.md](SUPABASE_SETUP.md) and [ACCOUNTING_SETUP.md](ACCOUNTING_SETUP.md)).

If you get **row-level security** errors: the SQL Editor runs as the database owner, which usually bypasses RLS. If your project enforces RLS for the database role, you may need to run the seed using a script that uses the **service role** key (not documented here).

## Step 4: Verify in the app

Log in and check:

| Where to go | What you should see |
|-------------|---------------------|
| **Dashboard** | Recent activity, SST due, revenue from seeded invoices and deductions |
| **Taxes → Deductions** | 8 deductions (business, capital, personal) for 2024 and 2025 |
| **Taxes → SST Filing** | 2 periods: one submitted, one draft |
| **Taxes → Filing Summary / EA Form** | 2 EA forms (employees) for current year |
| **Invoices** | 3 invoices (draft and paid), some linked to clients |
| **Sales → Add Company/Client** | 3 contacts (2 customers, 1 supplier) in the list |
| **Sales → Quotation** | 2 quotations with lines |
| **Sales → Credit Notes** | 1 credit note with lines |
| **Reports** | Tax/financial reports showing numbers from seeded data |
| **Settings → Team** | (Optional) One pending invite if you added the invitation INSERT — see comment at the bottom of `seed_data.sql` |

## Optional: Seed a pending invitation

To test the **Settings → Team** pending-invite flow:

1. Get your **user UUID** from Supabase: **Authentication → Users** → copy your user’s UUID.
2. At the bottom of `supabase/seed_data.sql` there is a commented `INSERT INTO invitations ...`.
3. Uncomment it and replace `YOUR_ORG_ID_HERE` and `YOUR_USER_ID_FOR_INVITES` with your organization and user UUIDs.
4. Run that `INSERT` in the SQL Editor.

Then in the app, **Settings → Team** should show one pending invitation.

## Resetting seed data

To remove seeded data for an organization and re-run the seed:

1. In SQL Editor, run (replace `'your-org-id'` with your organization UUID):
   ```sql
   -- Delete in order of dependencies (child tables first)
   DELETE FROM credit_note_lines WHERE credit_note_id IN (SELECT id FROM credit_notes WHERE organization_id = 'your-org-id');
   DELETE FROM credit_notes WHERE organization_id = 'your-org-id';
   DELETE FROM quotation_lines WHERE quotation_id IN (SELECT id FROM quotations WHERE organization_id = 'your-org-id');
   DELETE FROM quotations WHERE organization_id = 'your-org-id';
   DELETE FROM ea_forms WHERE organization_id = 'your-org-id';
   DELETE FROM sst_filings WHERE organization_id = 'your-org-id';
   DELETE FROM invoices WHERE organization_id = 'your-org-id';
   DELETE FROM tax_deductions WHERE organization_id = 'your-org-id';
   DELETE FROM contacts WHERE organization_id = 'your-org-id';
   -- If you use accounting:
   DELETE FROM transaction_lines WHERE transaction_id IN (SELECT id FROM transactions WHERE organization_id = 'your-org-id');
   DELETE FROM transactions WHERE organization_id = 'your-org-id';
   DELETE FROM accounts WHERE organization_id = 'your-org-id';
   ```
2. Run `seed_data.sql` again with your org ID.
