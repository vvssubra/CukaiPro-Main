-- E-Invoicing (MyInvois/LHDN): add columns to invoices for e-Invoice submission and status.
-- See docs/PRD_EINVOICING.md for phased plan.
-- Only ALTERs; assumes invoices table already exists.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
    -- LHDN/MyInvois status: draft | pending | submitted | validated | rejected | cancelled
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'lhdn_status') THEN
      ALTER TABLE invoices ADD COLUMN lhdn_status TEXT DEFAULT 'draft';
    END IF;
    -- Internal reference for MyInvois (codeNumber in Submit API), e.g. INV-2025-001
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'code_number') THEN
      ALTER TABLE invoices ADD COLUMN code_number TEXT;
    END IF;
    -- Document UUID returned by MyInvois for accepted submissions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'myinvois_uuid') THEN
      ALTER TABLE invoices ADD COLUMN myinvois_uuid TEXT;
    END IF;
    -- Submission UID when submitted in a batch
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'myinvois_submission_uid') THEN
      ALTER TABLE invoices ADD COLUMN myinvois_submission_uid TEXT;
    END IF;
    -- When the invoice was submitted to MyInvois
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'submitted_at') THEN
      ALTER TABLE invoices ADD COLUMN submitted_at TIMESTAMPTZ;
    END IF;
    -- Last validation/details from Get Document Details (optional)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'myinvois_validation_result') THEN
      ALTER TABLE invoices ADD COLUMN myinvois_validation_result JSONB;
    END IF;
  END IF;
END $$;

-- Optional: index for filtering by LHDN status
CREATE INDEX IF NOT EXISTS idx_invoices_lhdn_status ON invoices(lhdn_status) WHERE lhdn_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_code_number ON invoices(code_number) WHERE code_number IS NOT NULL;
