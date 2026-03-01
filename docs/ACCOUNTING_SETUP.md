# Accounting module setup (Supabase)

The accounting features (Chart of Accounts, Transactions, Bank Reconciliation, and related reports) require extra tables in your Supabase database. If you see errors like **"Could not find the table 'public.accounts' in the schema cache"** or **"Could not find the table 'public.transactions' in the schema cache"**, the migration has not been applied to that project yet.

## Run the migration on your live/staging Supabase project

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and select the project used by CukaiPro (e.g. the one whose URL and anon key are in your app's env).
2. Go to **SQL Editor**.
3. Copy the full contents of:
   ```
   supabase/migrations/20250301000000_accounting_tables.sql
   ```
4. Paste into a new query and click **Run** (or press the shortcut).
5. Ensure the run completes without errors. The script creates (if not present):
   - `accounts`
   - `contacts`
   - `transactions`
   - `transaction_lines`
   - `bank_statement_entries`
   - `reconciliations`
   and adds RLS policies and indexes. It is safe to run more than once (uses `IF NOT EXISTS` / `DROP POLICY IF EXISTS` where appropriate).

After this, the app can use:

- **Dashboard → Accounting → Transactions**
- **Dashboard → Accounting → Chart of Accounts**
- **Dashboard → Accounting → Bank Reconciliation**
- **Dashboard → Reports** (Balance Sheet, P&L, Ledger, Journal, Tax Listing, SST Processor, Bank Reconciliation)

## Optional: Supabase CLI (local/linked project)

If you use the Supabase CLI and your remote is already linked:

```bash
supabase db push
```

This applies all migrations in `supabase/migrations/` to the linked remote database. For a hosted project where you only run SQL in the Dashboard, use the SQL Editor steps above instead.
