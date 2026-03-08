# Chartered Accountant – CukaiPro Reference

## Official Portals (verify current URLs)

- **LHDN**: https://www.hasil.gov.my — Income tax, e-Filing, taxpayer services
- **e-Filing**: https://efiling.hasil.gov.my — File income tax returns
- **SST (RMCD/Kastam)**: https://www.mycustom.gov.my — Sales and Service Tax filing

CukaiPro prepares data and tracks deadlines; submission is done via these portals.

## CukaiPro Tax Data Flow

1. **Invoices** → revenue (by tax year from `invoice_date`); may carry `sst_rate` for SST.
2. **Deductions** → filtered by `tax_year`; `category_type` (business/capital/personal) drives adjusted income and chargeable income.
3. **EA forms** → per-employee remuneration, EPF, SOCSO, EIS, PCB; used for EA statements and PCB totals.
4. **SST filings** → monthly periods; liability derived from invoices; due 15th of following month.

## EA Form Fields (employment income)

- **Income**: gross_salary, allowances, bonuses, benefits_in_kind, overtime, director_fees, commission
- **Statutory**: epf_employee, socso, eis
- **Tax**: pcb (monthly tax deduction)
- Total remuneration = sum of income fields; net employment income = total remuneration − epf − socso − eis.

## File References

| Purpose | Path |
|--------|------|
| Tax calculation & brackets | `src/hooks/useTaxCalculation.js` |
| EA summary & CRUD | `src/hooks/useEAForms.js` |
| EA PDF generation | `src/utils/eaFormPdf.js` |
| SST period & due date | `src/utils/sstPeriods.js` |
| Currency/formatting | `src/utils/validators.js` (formatCurrency, formatDate) |
| LHDN copy & links | `src/pages/FooterPages/LHDNGuidelinesPage.jsx` |
| FAQ (SST, EA, Form B) | `src/data/faqData.js` |

## Compliance Note

Dates and procedures may change. When in doubt, recommend the user confirm with LHDN/RMCD or a tax advisor. The skill keeps CukaiPro's implementation aligned with standard Malaysian tax terminology and filing structure.
