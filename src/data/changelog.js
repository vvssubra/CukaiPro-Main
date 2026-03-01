const changelog = [
  {
    version: '1.3.0',
    date: '2026-03-01',
    label: 'Latest',
    features: [
      'LHDN e-Invoice MyInvois integration for automated submission',
      'Bulk SST-02 filing with multi-period selection',
    ],
    bugFixes: [
      'Fixed SST calculation rounding error on invoices above RM 100,000',
      'Resolved duplicate entries appearing in the deductions list after import',
      'Fixed dark mode contrast issue on the tax summary cards',
    ],
    improvements: [
      'Dashboard loading speed improved by 40% with optimized data fetching',
      'Enhanced PDF export formatting for SST reports',
    ],
  },
  {
    version: '1.2.1',
    date: '2026-02-14',
    label: '',
    features: [],
    bugFixes: [
      'Fixed invoice date picker not saving in DD/MM/YYYY format for Malaysian locale',
      'Corrected Form C progress tracker resetting on page refresh',
    ],
    improvements: [
      'Improved LHDN status badge visibility in both light and dark mode',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-01-20',
    label: '',
    features: [
      'Year-over-Year tax comparison dashboard with trend indicators',
      'Receipt upload with automatic OCR for expense categorization',
      'Dark mode support across all pages and modals',
    ],
    bugFixes: [
      'Fixed currency formatting inconsistency for RM values in exported reports',
    ],
    improvements: [
      'Redesigned staff activity feed with relative timestamps',
      'Added keyboard navigation support for all modal dialogs',
    ],
  },
];

export default changelog;
