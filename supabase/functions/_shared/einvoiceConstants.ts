/**
 * LHDN e-Invoice constants for Consolidated and Self-Billed flows.
 * See docs/GAP_ANALYSIS_EINVOICING_PRD.md and full LHDN-Compliant E-Invoicing PRD.
 */

/** General Public TIN for Consolidated e-Invoice (B2C aggregation). Address/BRN/SST ID: NA. */
export const CONSOLIDATED_GENERAL_PUBLIC_TIN = 'EI00000000010';

/** LHDN Classification Code for Consolidated e-Invoice line items. Must be used with CONSOLIDATED_GENERAL_PUBLIC_TIN. */
export const CONSOLIDATED_CLASSIFICATION_CODE = '004';

/** From 1 Jan 2026: single transaction above this amount (MYR) cannot be consolidated; must be individual e-Invoice. */
export const CONSOLIDATED_RM10K_RULE_THRESHOLD_MYR = 10_000;

/** Effective date for RM10,000 consolidation rule (YYYY-MM-DD). */
export const CONSOLIDATED_RM10K_RULE_EFFECTIVE_DATE = '2026-01-01';

/** Consolidated e-Invoice must be submitted within this many calendar days after the end of the month. */
export const CONSOLIDATED_SUBMISSION_DAYS_AFTER_MONTH_END = 7;

/** Industries that cannot use Consolidated e-Invoice (LHDN prohibited list). */
export const CONSOLIDATED_PROHIBITED_INDUSTRIES = [
  'automotive',           // Motor vehicles
  'luxury_goods_jewelry',
  'flight_tickets',       // Aviation
  'construction',
  'licensed_betting_gaming',
  'electricity',
  'telecommunications',
  'aviation',             // Additional common wording
  'wholesale_retail_construction_materials',
] as const;

/** Non-resident supplier TIN for Self-Billed e-Invoice (e.g. imports). */
export const SELF_BILLED_NON_RESIDENT_TIN = 'EI00000000030';

/** Self-Billed triggers: import, commission, dividend (dividend has exemptions per LHDN). */
export const SELF_BILLED_TRIGGER = {
  IMPORT: 'import',
  COMMISSION: 'commission',
  DIVIDEND: 'dividend',
} as const;
