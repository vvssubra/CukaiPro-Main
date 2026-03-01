-- CukaiPro Full Accounting Module
-- Tables: accounts, contacts, transactions, transaction_lines, bank_statement_entries
-- Optional: add transaction_id to invoices

-- ========== ACCOUNTS (Chart of Accounts) ==========
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  currency TEXT NOT NULL DEFAULT 'MYR',
  opening_balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_accounts_organization_id ON accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_accounts_organization_type ON accounts(organization_id, type);
CREATE INDEX IF NOT EXISTS idx_accounts_parent_id ON accounts(parent_id);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view accounts for their org" ON accounts;
CREATE POLICY "Users can view accounts for their org" ON accounts FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = accounts.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can insert accounts for their org" ON accounts;
CREATE POLICY "Users can insert accounts for their org" ON accounts FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = accounts.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can update accounts for their org" ON accounts;
CREATE POLICY "Users can update accounts for their org" ON accounts FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = accounts.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = accounts.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can delete accounts for their org" ON accounts;
CREATE POLICY "Users can delete accounts for their org" ON accounts FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = accounts.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

-- ========== CONTACTS (Customers / Suppliers) ==========
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('customer', 'supplier')),
  email TEXT,
  phone TEXT,
  tin TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_organization_type ON contacts(organization_id, type);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view contacts for their org" ON contacts;
CREATE POLICY "Users can view contacts for their org" ON contacts FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = contacts.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can insert contacts for their org" ON contacts;
CREATE POLICY "Users can insert contacts for their org" ON contacts FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = contacts.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can update contacts for their org" ON contacts;
CREATE POLICY "Users can update contacts for their org" ON contacts FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = contacts.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = contacts.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can delete contacts for their org" ON contacts;
CREATE POLICY "Users can delete contacts for their org" ON contacts FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = contacts.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

-- ========== TRANSACTIONS ==========
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('journal_entry', 'invoice', 'payment', 'receipt', 'bill', 'credit_note')),
  ref_no TEXT,
  transaction_date DATE NOT NULL,
  description TEXT,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  invoice_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_organization_date ON transactions(organization_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_organization_ref ON transactions(organization_id, ref_no);
CREATE INDEX IF NOT EXISTS idx_transactions_contact_id ON transactions(contact_id);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view transactions for their org" ON transactions;
CREATE POLICY "Users can view transactions for their org" ON transactions FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = transactions.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can insert transactions for their org" ON transactions;
CREATE POLICY "Users can insert transactions for their org" ON transactions FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = transactions.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can update transactions for their org" ON transactions;
CREATE POLICY "Users can update transactions for their org" ON transactions FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = transactions.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = transactions.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can delete transactions for their org" ON transactions;
CREATE POLICY "Users can delete transactions for their org" ON transactions FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = transactions.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

-- ========== TRANSACTION_LINES ==========
CREATE TABLE IF NOT EXISTS transaction_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  debit NUMERIC(14, 2) NOT NULL DEFAULT 0,
  credit NUMERIC(14, 2) NOT NULL DEFAULT 0,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_transaction_lines_transaction_id ON transaction_lines(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_lines_account_id ON transaction_lines(account_id);

ALTER TABLE transaction_lines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view transaction_lines for their org" ON transaction_lines;
CREATE POLICY "Users can view transaction_lines for their org" ON transaction_lines FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM transactions t
  JOIN organization_members om ON om.organization_id = t.organization_id AND om.user_id = auth.uid() AND om.status = 'active'
  WHERE t.id = transaction_lines.transaction_id
));

DROP POLICY IF EXISTS "Users can insert transaction_lines for their org" ON transaction_lines;
CREATE POLICY "Users can insert transaction_lines for their org" ON transaction_lines FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM transactions t
  JOIN organization_members om ON om.organization_id = t.organization_id AND om.user_id = auth.uid() AND om.status = 'active'
  WHERE t.id = transaction_lines.transaction_id
));

DROP POLICY IF EXISTS "Users can update transaction_lines for their org" ON transaction_lines;
CREATE POLICY "Users can update transaction_lines for their org" ON transaction_lines FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM transactions t
  JOIN organization_members om ON om.organization_id = t.organization_id AND om.user_id = auth.uid() AND om.status = 'active'
  WHERE t.id = transaction_lines.transaction_id
))
WITH CHECK (EXISTS (
  SELECT 1 FROM transactions t
  JOIN organization_members om ON om.organization_id = t.organization_id AND om.user_id = auth.uid() AND om.status = 'active'
  WHERE t.id = transaction_lines.transaction_id
));

DROP POLICY IF EXISTS "Users can delete transaction_lines for their org" ON transaction_lines;
CREATE POLICY "Users can delete transaction_lines for their org" ON transaction_lines FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM transactions t
  JOIN organization_members om ON om.organization_id = t.organization_id AND om.user_id = auth.uid() AND om.status = 'active'
  WHERE t.id = transaction_lines.transaction_id
));

-- ========== BANK_STATEMENT_ENTRIES ==========
CREATE TABLE IF NOT EXISTS bank_statement_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  statement_date DATE NOT NULL,
  description TEXT,
  amount NUMERIC(14, 2) NOT NULL,
  reconciled_at TIMESTAMPTZ,
  transaction_line_id UUID REFERENCES transaction_lines(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bank_statement_entries_org_account ON bank_statement_entries(organization_id, account_id);
CREATE INDEX IF NOT EXISTS idx_bank_statement_entries_statement_date ON bank_statement_entries(statement_date);

ALTER TABLE bank_statement_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view bank_statement_entries for their org" ON bank_statement_entries;
CREATE POLICY "Users can view bank_statement_entries for their org" ON bank_statement_entries FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = bank_statement_entries.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can insert bank_statement_entries for their org" ON bank_statement_entries;
CREATE POLICY "Users can insert bank_statement_entries for their org" ON bank_statement_entries FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = bank_statement_entries.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can update bank_statement_entries for their org" ON bank_statement_entries;
CREATE POLICY "Users can update bank_statement_entries for their org" ON bank_statement_entries FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = bank_statement_entries.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = bank_statement_entries.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can delete bank_statement_entries for their org" ON bank_statement_entries;
CREATE POLICY "Users can delete bank_statement_entries for their org" ON bank_statement_entries FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = bank_statement_entries.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

-- ========== RECONCILIATIONS (optional session store) ==========
CREATE TABLE IF NOT EXISTS reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  statement_date DATE NOT NULL,
  statement_ending_balance NUMERIC(14, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reconciliations_org_account ON reconciliations(organization_id, account_id);

ALTER TABLE reconciliations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view reconciliations for their org" ON reconciliations;
CREATE POLICY "Users can view reconciliations for their org" ON reconciliations FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = reconciliations.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can insert reconciliations for their org" ON reconciliations;
CREATE POLICY "Users can insert reconciliations for their org" ON reconciliations FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = reconciliations.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

-- ========== INVOICES: add transaction_id if table exists ==========
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'transaction_id') THEN
      ALTER TABLE invoices ADD COLUMN transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- ========== UPDATED_AT triggers ==========
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS accounts_updated_at ON accounts;
CREATE TRIGGER accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS contacts_updated_at ON contacts;
CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS transactions_updated_at ON transactions;
CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
