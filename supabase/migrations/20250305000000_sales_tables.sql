-- CukaiPro Sales: quotations, credit notes, extend contacts, invoices.
-- Quotations are not revenue; for estimation until converted to invoice.
-- LHDN: revenue from invoices (invoice_date tax year); credit notes reduce revenue.
-- SST: use sst_rate on invoice when present; default 6% in app (see useTaxCalculation).

-- ========== Extend CONTACTS (Add Company / customers) ==========
-- TIN and tax fields for LHDN/RMCD compliance and e-Invoice.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'company_name') THEN
    ALTER TABLE contacts ADD COLUMN company_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'alternate_name') THEN
    ALTER TABLE contacts ADD COLUMN alternate_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'registration_no') THEN
    ALTER TABLE contacts ADD COLUMN registration_no TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'tax_registration_no') THEN
    ALTER TABLE contacts ADD COLUMN tax_registration_no TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'tax_entity') THEN
    ALTER TABLE contacts ADD COLUMN tax_entity TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'tax_exemption_no') THEN
    ALTER TABLE contacts ADD COLUMN tax_exemption_no TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'tax_exemption_expiry') THEN
    ALTER TABLE contacts ADD COLUMN tax_exemption_expiry DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'billing_address') THEN
    ALTER TABLE contacts ADD COLUMN billing_address TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'billing_postcode') THEN
    ALTER TABLE contacts ADD COLUMN billing_postcode TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'delivery_address') THEN
    ALTER TABLE contacts ADD COLUMN delivery_address TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'delivery_postcode') THEN
    ALTER TABLE contacts ADD COLUMN delivery_postcode TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'area') THEN
    ALTER TABLE contacts ADD COLUMN area TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'phone_2') THEN
    ALTER TABLE contacts ADD COLUMN phone_2 TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'fax') THEN
    ALTER TABLE contacts ADD COLUMN fax TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'fax_2') THEN
    ALTER TABLE contacts ADD COLUMN fax_2 TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'website') THEN
    ALTER TABLE contacts ADD COLUMN website TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'attention') THEN
    ALTER TABLE contacts ADD COLUMN attention TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'business_nature') THEN
    ALTER TABLE contacts ADD COLUMN business_nature TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'agent') THEN
    ALTER TABLE contacts ADD COLUMN agent TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'currency') THEN
    ALTER TABLE contacts ADD COLUMN currency TEXT DEFAULT 'MYR';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'credit_term') THEN
    ALTER TABLE contacts ADD COLUMN credit_term TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'tax_code') THEN
    ALTER TABLE contacts ADD COLUMN tax_code TEXT;
  END IF;
END $$;

-- ========== QUOTATIONS ==========
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  ref_no TEXT NOT NULL,
  quotation_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'lost', 'success')),
  total NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'MYR',
  valid_until DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotations_organization_id ON quotations(organization_id);
CREATE INDEX IF NOT EXISTS idx_quotations_organization_ref ON quotations(organization_id, ref_no);
CREATE INDEX IF NOT EXISTS idx_quotations_contact_id ON quotations(contact_id);
CREATE INDEX IF NOT EXISTS idx_quotations_quotation_date ON quotations(quotation_date DESC);

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view quotations for their org" ON quotations;
CREATE POLICY "Users can view quotations for their org" ON quotations FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = quotations.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can insert quotations for their org" ON quotations;
CREATE POLICY "Users can insert quotations for their org" ON quotations FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = quotations.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can update quotations for their org" ON quotations;
CREATE POLICY "Users can update quotations for their org" ON quotations FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = quotations.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = quotations.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can delete quotations for their org" ON quotations;
CREATE POLICY "Users can delete quotations for their org" ON quotations FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = quotations.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

-- ========== QUOTATION_LINES ==========
CREATE TABLE IF NOT EXISTS quotation_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  product_code TEXT,
  product_variant TEXT,
  unit TEXT,
  type TEXT,
  doc_no TEXT,
  description TEXT,
  qty NUMERIC(14, 4) NOT NULL DEFAULT 1,
  unit_price NUMERIC(14, 2) NOT NULL DEFAULT 0,
  discount_pct NUMERIC(5, 2) DEFAULT 0,
  discount_amount NUMERIC(14, 2) DEFAULT 0,
  subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_quotation_lines_quotation_id ON quotation_lines(quotation_id);

ALTER TABLE quotation_lines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view quotation_lines for their org" ON quotation_lines;
CREATE POLICY "Users can view quotation_lines for their org" ON quotation_lines FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM quotations q
  JOIN organization_members om ON om.organization_id = q.organization_id AND om.user_id = auth.uid() AND om.status = 'active'
  WHERE q.id = quotation_lines.quotation_id
));

DROP POLICY IF EXISTS "Users can insert quotation_lines for their org" ON quotation_lines;
CREATE POLICY "Users can insert quotation_lines for their org" ON quotation_lines FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM quotations q
  JOIN organization_members om ON om.organization_id = q.organization_id AND om.user_id = auth.uid() AND om.status = 'active'
  WHERE q.id = quotation_lines.quotation_id
));

DROP POLICY IF EXISTS "Users can update quotation_lines for their org" ON quotation_lines;
CREATE POLICY "Users can update quotation_lines for their org" ON quotation_lines FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM quotations q
  JOIN organization_members om ON om.organization_id = q.organization_id AND om.user_id = auth.uid() AND om.status = 'active'
  WHERE q.id = quotation_lines.quotation_id
))
WITH CHECK (EXISTS (
  SELECT 1 FROM quotations q
  JOIN organization_members om ON om.organization_id = q.organization_id AND om.user_id = auth.uid() AND om.status = 'active'
  WHERE q.id = quotation_lines.quotation_id
));

DROP POLICY IF EXISTS "Users can delete quotation_lines for their org" ON quotation_lines;
CREATE POLICY "Users can delete quotation_lines for their org" ON quotation_lines FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM quotations q
  JOIN organization_members om ON om.organization_id = q.organization_id AND om.user_id = auth.uid() AND om.status = 'active'
  WHERE q.id = quotation_lines.quotation_id
));

-- ========== CREDIT_NOTES ==========
-- LHDN: credit notes reduce revenue in year of credit_note_date (simplified).
CREATE TABLE IF NOT EXISTS credit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  invoice_id UUID,
  ref_no TEXT NOT NULL,
  credit_note_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'unapplied' CHECK (status IN ('unapplied', 'partially_applied', 'fully_applied')),
  total NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'MYR',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_notes_organization_id ON credit_notes(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_organization_ref ON credit_notes(organization_id, ref_no);
CREATE INDEX IF NOT EXISTS idx_credit_notes_contact_id ON credit_notes(contact_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_credit_note_date ON credit_notes(credit_note_date DESC);

ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view credit_notes for their org" ON credit_notes;
CREATE POLICY "Users can view credit_notes for their org" ON credit_notes FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = credit_notes.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can insert credit_notes for their org" ON credit_notes;
CREATE POLICY "Users can insert credit_notes for their org" ON credit_notes FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = credit_notes.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can update credit_notes for their org" ON credit_notes;
CREATE POLICY "Users can update credit_notes for their org" ON credit_notes FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = credit_notes.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = credit_notes.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

DROP POLICY IF EXISTS "Users can delete credit_notes for their org" ON credit_notes;
CREATE POLICY "Users can delete credit_notes for their org" ON credit_notes FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = credit_notes.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

-- ========== CREDIT_NOTE_LINES ==========
CREATE TABLE IF NOT EXISTS credit_note_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_note_id UUID NOT NULL REFERENCES credit_notes(id) ON DELETE CASCADE,
  product_code TEXT,
  product_variant TEXT,
  unit TEXT,
  type TEXT,
  doc_no TEXT,
  description TEXT,
  qty NUMERIC(14, 4) NOT NULL DEFAULT 1,
  unit_price NUMERIC(14, 2) NOT NULL DEFAULT 0,
  discount_pct NUMERIC(5, 2) DEFAULT 0,
  discount_amount NUMERIC(14, 2) DEFAULT 0,
  subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_credit_note_lines_credit_note_id ON credit_note_lines(credit_note_id);

ALTER TABLE credit_note_lines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view credit_note_lines for their org" ON credit_note_lines;
CREATE POLICY "Users can view credit_note_lines for their org" ON credit_note_lines FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM credit_notes cn
  JOIN organization_members om ON om.organization_id = cn.organization_id AND om.user_id = auth.uid() AND om.status = 'active'
  WHERE cn.id = credit_note_lines.credit_note_id
));

DROP POLICY IF EXISTS "Users can insert credit_note_lines for their org" ON credit_note_lines;
CREATE POLICY "Users can insert credit_note_lines for their org" ON credit_note_lines FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM credit_notes cn
  JOIN organization_members om ON om.organization_id = cn.organization_id AND om.user_id = auth.uid() AND om.status = 'active'
  WHERE cn.id = credit_note_lines.credit_note_id
));

DROP POLICY IF EXISTS "Users can update credit_note_lines for their org" ON credit_note_lines;
CREATE POLICY "Users can update credit_note_lines for their org" ON credit_note_lines FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM credit_notes cn
  JOIN organization_members om ON om.organization_id = cn.organization_id AND om.user_id = auth.uid() AND om.status = 'active'
  WHERE cn.id = credit_note_lines.credit_note_id
))
WITH CHECK (EXISTS (
  SELECT 1 FROM credit_notes cn
  JOIN organization_members om ON om.organization_id = cn.organization_id AND om.user_id = auth.uid() AND om.status = 'active'
  WHERE cn.id = credit_note_lines.credit_note_id
));

DROP POLICY IF EXISTS "Users can delete credit_note_lines for their org" ON credit_note_lines;
CREATE POLICY "Users can delete credit_note_lines for their org" ON credit_note_lines FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM credit_notes cn
  JOIN organization_members om ON om.organization_id = cn.organization_id AND om.user_id = auth.uid() AND om.status = 'active'
  WHERE cn.id = credit_note_lines.credit_note_id
));

-- ========== INVOICES: add contact_id and sst_rate ==========
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'contact_id') THEN
      ALTER TABLE invoices ADD COLUMN contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'sst_rate') THEN
      ALTER TABLE invoices ADD COLUMN sst_rate NUMERIC(5, 2) DEFAULT 6;
    END IF;
  END IF;
END $$;

-- ========== Triggers ==========
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quotations_updated_at ON quotations;
CREATE TRIGGER quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS credit_notes_updated_at ON credit_notes;
CREATE TRIGGER credit_notes_updated_at BEFORE UPDATE ON credit_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
