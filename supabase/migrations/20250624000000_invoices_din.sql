-- LHDN Document Identification Number (DIN): persist when returned by MyInvois (Get Document Details / validation).
-- See docs/PRD_EINVOICING.md and docs/GAP_ANALYSIS_EINVOICING_PRD.md.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'din') THEN
      ALTER TABLE invoices ADD COLUMN din TEXT;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_invoices_din ON invoices(din) WHERE din IS NOT NULL;
