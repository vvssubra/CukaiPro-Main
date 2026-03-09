-- CukaiPro Seed Data – sample data for one organization to test all features and flows.
-- Run in Supabase SQL Editor after signing up and creating an organization.
--
-- BEFORE RUNNING:
-- 1. Replace YOUR_ORG_ID_HERE with your organization UUID.
--    Get it from: SELECT id, business_name FROM organizations ORDER BY created_at DESC LIMIT 1;
-- 2. Ensure migrations are applied (invoices, tax_deductions, contacts, sst_filings, ea_forms,
--    quotations, credit_notes; optionally accounting_tables for accounts/transactions).
--
-- This script only INSERTs; safe to run once per org. Uses a DO block to capture contact IDs
-- for use in invoices and quotations.

DO $$
DECLARE
  oid UUID := 'YOUR_ORG_ID_HERE';
  c1_id UUID;
  c2_id UUID;
  c3_id UUID;
  s1_id UUID;
  q1_id UUID;
  q2_id UUID;
  cn1_id UUID;
  acc_rev_id UUID;
  acc_exp_id UUID;
  acc_ast_id UUID;
  t1_id UUID;
BEGIN
  -- ========== CONTACTS (2 customers, 1 supplier) ==========
  INSERT INTO contacts (organization_id, name, type, email, phone, tin)
  VALUES (oid, 'TechMaju Sdn Bhd', 'customer', 'billing@techmaju.com.my', '+603-2345 6789', 'C12345678A')
  RETURNING id INTO c1_id;

  INSERT INTO contacts (organization_id, name, type, email, phone, tin)
  VALUES (oid, 'Global Trading Co', 'customer', 'accounts@globaltrading.my', '+603-8765 4321', 'C87654321B')
  RETURNING id INTO c2_id;

  INSERT INTO contacts (organization_id, name, type, email, phone, tin)
  VALUES (oid, 'Office Supplies Malaysia', 'supplier', 'orders@officesupplies.my', '+603-1111 2222', 'C11223344C')
  RETURNING id INTO c3_id;

  -- ========== TAX DEDUCTIONS (business, capital, personal; 2024 & 2025) ==========
  INSERT INTO tax_deductions (organization_id, category_id, category_name, category_type, amount, claimable_percentage, deduction_date, description, tax_year, has_receipt, status)
  VALUES
    (oid, 'salaries', 'Salaries & Wages', 'business', 15000.00, 100, '2025-01-15', 'Monthly staff salaries', 2025, false, 'approved'),
    (oid, 'rent', 'Business Rent', 'business', 4500.00, 100, '2025-01-01', 'Office rent January', 2025, false, 'approved'),
    (oid, 'utilities', 'Utilities', 'business', 680.50, 100, '2025-02-10', 'Electricity and water', 2025, false, 'pending'),
    (oid, 'professional_fees', 'Professional Fees', 'business', 2500.00, 100, '2024-11-20', 'Audit and tax advisory', 2024, false, 'approved'),
    (oid, 'computers', 'Computers & IT Equipment', 'capital', 8500.00, 60, '2024-06-01', 'Laptops for team (20% initial + 40% annual)', 2024, false, 'approved'),
    (oid, 'epf', 'EPF Contributions', 'personal', 1650.00, 100, '2025-01-31', 'Employee EPF', 2025, false, 'approved'),
    (oid, 'office_supplies', 'Office Supplies', 'business', 420.00, 100, '2025-02-05', 'Stationery and supplies', 2025, false, 'pending'),
    (oid, 'rent', 'Business Rent', 'business', 4500.00, 100, '2024-12-01', 'Office rent December', 2024, false, 'approved');

  -- ========== INVOICES (draft, paid, with contact_id where table has it) ==========
  INSERT INTO invoices (organization_id, client_name, tin, amount, invoice_date, notes, status, contact_id, sst_rate, code_number, lhdn_status)
  VALUES
    (oid, 'TechMaju Sdn Bhd', 'C12345678A', 11800.00, '2025-01-20', 'Consulting services Jan 2025', 'paid', c1_id, 6.00, 'INV-2025-00001', 'draft'),
    (oid, 'Global Trading Co', 'C87654321B', 23600.00, '2025-02-10', 'Product delivery Q1', 'draft', c2_id, 6.00, NULL, 'draft'),
    (oid, 'Walk-in Customer', NULL, 530.00, '2025-02-15', 'One-off sale', 'draft', NULL, 6.00, NULL, 'draft');

  -- ========== SST FILINGS (one draft, one submitted) ==========
  INSERT INTO sst_filings (organization_id, period_start, period_end, due_date, total_amount, status, submitted_at, notes)
  VALUES
    (oid, '2024-12-01', '2024-12-31', '2025-01-15', 1200.00, 'submitted', '2025-01-14 10:00:00+08', 'December 2024 SST'),
    (oid, '2025-01-01', '2025-01-31', '2025-02-15', 2100.00, 'draft', NULL, 'January 2025 SST');

  -- ========== EA FORMS (2 employees, tax year 2025) ==========
  INSERT INTO ea_forms (organization_id, tax_year, employee_name, employee_ic, employee_tax_no, gross_salary, allowances, epf_employee, epf_employer, socso, eis, pcb, notes)
  VALUES
    (oid, 2025, 'Ahmad bin Abdullah', '900101-14-5678', 'C 12345678', 8500.00, 500.00, 935.00, 1028.50, 49.40, 8.50, 420.00, 'Full-time executive'),
    (oid, 2025, 'Siti binti Rahman', '920515-08-9012', 'C 87654321', 6200.00, 300.00, 682.00, 750.20, 39.20, 6.20, 180.00, 'Full-time staff');

  -- ========== QUOTATIONS (2 with lines) ==========
  INSERT INTO quotations (organization_id, contact_id, ref_no, quotation_date, status, total, currency, valid_until, notes)
  VALUES (oid, c1_id, 'QT-2025-001', '2025-01-05', 'pending', 17700.00, 'MYR', '2025-02-05', 'Annual support package')
  RETURNING id INTO q1_id;

  INSERT INTO quotation_lines (quotation_id, description, qty, unit_price, discount_pct, subtotal, sort_order)
  VALUES
    (q1_id, 'Software licence annual', 1, 12000.00, 0, 12000.00, 0),
    (q1_id, 'Support and maintenance', 1, 5700.00, 0, 5700.00, 1);

  INSERT INTO quotations (organization_id, contact_id, ref_no, quotation_date, status, total, currency, valid_until, notes)
  VALUES (oid, c2_id, 'QT-2025-002', '2025-02-01', 'success', 11800.00, 'MYR', '2025-03-01', 'Converted to invoice')
  RETURNING id INTO q2_id;

  INSERT INTO quotation_lines (quotation_id, description, qty, unit_price, discount_pct, subtotal, sort_order)
  VALUES (q2_id, 'Consulting 5 days', 5, 2360.00, 0, 11800.00, 0);

  -- ========== CREDIT NOTE (1 with lines) ==========
  INSERT INTO credit_notes (organization_id, contact_id, ref_no, credit_note_date, status, total, currency, notes)
  VALUES (oid, c1_id, 'CN-2025-001', '2025-02-12', 'unapplied', 1180.00, 'MYR', 'Discount adjustment for INV-2025-00001')
  RETURNING id INTO cn1_id;

  INSERT INTO credit_note_lines (credit_note_id, description, qty, unit_price, subtotal, sort_order)
  VALUES (cn1_id, 'Discount adjustment', 1, 1180.00, 1180.00, 0);

  -- ========== OPTIONAL: Chart of Accounts (skip if accounting migration not applied) ==========
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'accounts') THEN
    INSERT INTO accounts (organization_id, name, code, type, currency, opening_balance, is_system)
    VALUES (oid, 'Cash at Bank', '1000', 'asset', 'MYR', 25000.00, false)
    RETURNING id INTO acc_ast_id;

    INSERT INTO accounts (organization_id, name, code, type, currency, opening_balance, is_system)
    VALUES (oid, 'Sales Revenue', '4000', 'revenue', 'MYR', 0, false)
    RETURNING id INTO acc_rev_id;

    INSERT INTO accounts (organization_id, name, code, type, currency, opening_balance, is_system)
    VALUES (oid, 'Operating Expenses', '6000', 'expense', 'MYR', 0, false)
    RETURNING id INTO acc_exp_id;

    -- Optional: 2 simple transactions
    INSERT INTO transactions (organization_id, type, ref_no, transaction_date, description)
    VALUES (oid, 'journal_entry', 'J-2025-001', '2025-01-31', 'January opening balance')
    RETURNING id INTO t1_id;

    INSERT INTO transaction_lines (transaction_id, account_id, debit, credit, description, sort_order)
    VALUES
      (t1_id, acc_ast_id, 25000.00, 0, 'Opening cash', 0),
      (t1_id, acc_rev_id, 0, 25000.00, 'Opening balance', 1);
  END IF;

  RAISE NOTICE 'Seed data inserted for organization %', oid;
END $$;

-- ========== INVITATIONS (optional) ==========
-- To test Settings → Team pending invite: run the following manually after replacing placeholders.
-- Get your user UUID from Supabase Dashboard → Authentication → Users.
--
-- INSERT INTO invitations (organization_id, invited_by, email, role, status)
-- VALUES (
--   'YOUR_ORG_ID_HERE',
--   'YOUR_USER_ID_FOR_INVITES',
--   'teammate@example.com',
--   'staff',
--   'pending'
-- );
