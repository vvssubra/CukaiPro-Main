-- E-Invoicing: code_number uniqueness per org and function to get next INV-YYYY-NNNNN.
-- LHDN MyInvois codeNumber: unique per org per submission; format INV-YYYY-NNNNN (Malaysian fiscal year = calendar year).

-- Uniqueness: (organization_id, code_number) when code_number is not null
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_org_code_number_unique
  ON invoices(organization_id, code_number)
  WHERE code_number IS NOT NULL AND code_number != '';

-- Returns next code_number for the organization and year, e.g. INV-2025-00001
-- Call from Edge Function or RPC with SELECT get_next_invoice_code_number(org_id, year).
CREATE OR REPLACE FUNCTION get_next_invoice_code_number(p_organization_id UUID, p_year INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_seq INTEGER;
  new_code TEXT;
  prefix TEXT;
BEGIN
  prefix := 'INV-' || p_year || '-';
  SELECT COALESCE(MAX((regexp_match(code_number, '^INV-[0-9]+-([0-9]+)$'))[1]::INTEGER), 0) + 1
  INTO next_seq
  FROM invoices
  WHERE organization_id = p_organization_id
    AND code_number IS NOT NULL
    AND code_number ~ ('^INV-' || p_year || '-[0-9]+$');

  new_code := prefix || LPAD(next_seq::TEXT, 5, '0');
  RETURN new_code;
END;
$$;

-- Allow authenticated users who are active members of the org to call the function
GRANT EXECUTE ON FUNCTION get_next_invoice_code_number(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_invoice_code_number(UUID, INTEGER) TO service_role;
