---
name: chartered-accountant-cukaipro
description: Applies chartered accountant and Malaysian tax compliance standards to the CukaiPro tax platform. Use when implementing or reviewing tax logic, SST filing, EA forms, LHDN compliance, deductions, income tax calculations, financial reports, or when the user mentions Malaysian tax, LHDN, SST, EA form, PCB, chargeable income, or CukaiPro accounting features.
---

# Chartered Accountant – CukaiPro

Apply chartered accountant rigour and Malaysian tax compliance when working on CukaiPro. Ensure calculations, labels, and deadlines align with LHDN/RMCD rules and professional practice.

## Malaysian Tax Context (CukaiPro)

- **Fiscal year**: Calendar year (Jan–Dec). All year-based logic uses full year.
- **Currency**: Malaysian Ringgit (RM). Always format with `formatCurrency()` from `src/utils/validators.js`; no other symbols.
- **Dates**: Support DD/MM/YYYY for user input; store/compare consistently (project uses ISO or DD/MM/YYYY in places—keep consistent per feature).
- **LHDN**: Inland Revenue Board (Hasil)—income tax, e-Filing, EA, Form B, PCB.
- **RMCD**: Royal Malaysian Customs—SST (Sales and Service Tax). SST filing is separate from LHDN.

## Key Terms (use consistently)

| Term | Meaning in CukaiPro |
|------|----------------------|
| Revenue | Gross from invoices (tax year). |
| Adjusted income | Revenue minus business and capital deductions. |
| Chargeable income | Adjusted income minus personal relief/deductions. |
| SST | Sales and Service Tax; 6% on taxable value in current logic; filing due 15th of following month. |
| EA form | Employment income statement; remuneration, EPF, SOCSO, EIS, PCB; due to employees by 28 Feb. |
| PCB | Monthly tax deduction (potongan cukai bulanan). |
| Deduction categories | `business`, `capital`, `personal`—used in `useTaxCalculation` and reports. |

## Calculation Standards

1. **Income tax**: Use Malaysian progressive rates (see `src/hooks/useTaxCalculation.js`: first RM 5k @ 0%, then 1%, 3%, 6%, 11%, 19%, 25%, 26%, 28%, 30%). Do not invent brackets; reuse or align with existing `calculateIncomeTax` / `PROGRESSIVE_BRACKETS`.
2. **SST**: Current app uses 6% on invoice amount in `calculateSSTPayable`. If implementing variable SST rates, use invoice-level `sst_rate` where present and document any assumption (e.g. 10% default) in code comments.
3. **Rounding**: Money in UI: 2 decimal places. For tax computations, keep consistency (e.g. round at final tax amount or per bracket as in existing code); document rounding in comments where it affects compliance.
4. **EA summary**: Total remuneration = gross salary + allowances + bonuses + BIK + overtime + director fees + commission. Net employment income = total remuneration − EPF (employee) − SOCSO − EIS. Reuse `computeEASummary` in `src/hooks/useEAForms.js` for any EA-derived figures.

## SST Filing (CukaiPro)

- Period: monthly (1st–last day of month); due date: **15th of the following month**.
- Use `src/utils/sstPeriods.js`: `getPeriodDates`, `getDueDate`, `getNextFilingPeriod`, `getPeriodsBack`, `daysUntilDue`. Do not hardcode due-day logic elsewhere.
- Labels: use “SST” and “filing period” / “due date” consistently; avoid mixing “GST” unless referring to legacy.

## Deductions & Validation

- Deductions have `category_type`: `business` | `capital` | `personal`. Claimable amount: `claimable_amount` or `amount × (claimable_percentage / 100)`.
- When adding or editing deduction logic, ensure category is set and used in totals (e.g. `calculateTotalDeductions` in `useTaxCalculation.js`).
- Document any LHDN-specific rule (e.g. cap, eligibility) in a short comment so a reviewer can verify against current LHDN guidelines.

## Reports & Disclosures

- Reports that show tax or SST figures should clearly state they are **estimates** or **for preparation** unless the feature explicitly submits to LHDN/RMCD. Prefer labels like “Estimated income tax” or “SST payable (for filing)”.
- For new report sections (e.g. P&amp;L, balance sheet, tax summary), use the same terms as above (revenue, adjusted income, chargeable income, deduction by type) so they tie to existing tax logic.

## Code and UX

- **Comments**: Add a one-line comment for any non-obvious tax rule (e.g. “LHDN: personal relief applied after business/capital” or “SST-02: due 15th following month”).
- **Edge cases**: Zero or negative chargeable income → RM 0 tax; empty invoice/deduction lists → RM 0 totals. Handle null/undefined for numeric fields (e.g. `Number(x) || 0`).
- **Subscriptions**: EA forms and some features may be gated by `useSubscription` (e.g. `canUseEAForms`). Respect these flags in UI and any feature logic.

## Where to Look in CukaiPro

- Tax calculations: `src/hooks/useTaxCalculation.js`
- EA forms and summary: `src/hooks/useEAForms.js`, `src/utils/eaFormPdf.js`
- SST periods and due dates: `src/utils/sstPeriods.js`
- Deductions: hooks such as `useDeductions`, deduction modals and listing under Taxes
- LHDN/guidelines copy: `src/pages/FooterPages/LHDNGuidelinesPage.jsx`, `src/data/faqData.js`

## Summary Checklist

When adding or reviewing tax-related code:

- [ ] Uses RM and Malaysian fiscal year; dates and currency formatted consistently.
- [ ] Reuses existing tax/SST/EA logic where applicable; no duplicate bracket or rate definitions.
- [ ] SST due dates and periods use `sstPeriods.js`.
- [ ] Deduction categories and claimable amounts align with `useTaxCalculation` and LHDN intent.
- [ ] Reports label tax/SST as estimated or for preparation where appropriate.
- [ ] Non-obvious LHDN/RMCD rules documented in a short comment.

For more CukaiPro tax terms and LHDN links, see [reference.md](reference.md).
