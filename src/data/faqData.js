/**
 * FAQ data for CukaiPro Help & docs.
 * Malaysian tax SaaS – concise, relevant content.
 */
export const FAQ_ITEMS = [
  {
    id: 'add-deductions',
    question: 'How do I add tax deductions?',
    answer:
      'Go to Taxes → Deductions. Click "Add Deduction", choose a category (e.g. business expenses, capital allowance, personal relief), enter amount (RM), date (DD/MM/YYYY), and optionally upload a receipt. Save to record. Claimable amount is auto-calculated per LHDN rules.',
    tags: ['deductions', 'taxes'],
  },
  {
    id: 'invite-team',
    question: 'How do I invite team members?',
    answer:
      'Go to Settings → Team. Enter the email address, select a role (Staff, Admin, Accountant), and click "Send invite". The invitee receives an email with a link. They must accept within the link to join. Only Admins and Owners can invite.',
    tags: ['team', 'settings', 'invite'],
  },
  {
    id: 'sst-filing',
    question: 'What is SST filing?',
    answer:
      'SST (Sales and Service Tax) is Malaysia\'s indirect tax. If your business is SST-registered, you must file SST returns (typically every 2 months) with RMCD. CukaiPro helps you track SST liabilities and prepare filing data. Go to Taxes → SST Filing for your SST dashboard.',
    tags: ['sst', 'taxes', 'filing'],
  },
  {
    id: 'ea-form',
    question: 'What is the EA form?',
    answer:
      'EA (Employment Income) Form is the annual statement of remuneration employers must issue to employees by 28 Feb. It shows salary, allowances, and deductions for income tax. CukaiPro lets you manage EA forms per employee. Go to Taxes → Filing Summary or EA Form.',
    tags: ['ea', 'form', 'employment', 'income'],
  },
  {
    id: 'form-b',
    question: 'What is Form B?',
    answer:
      'Form B is the income tax return for businesses (partnerships, sole proprietors). It reports business income, allowable expenses, and tax payable for the year. Filing is due by 30 June (or extended). Use CukaiPro\'s Filing Summary and Deductions to prepare Form B data.',
    tags: ['form b', 'business', 'income tax', 'filing'],
  },
  {
    id: 'deduction-categories',
    question: 'What deduction categories are supported?',
    answer:
      'CukaiPro supports business expenses, capital allowance, and personal relief. Categories include office rent, equipment, donations, EPF/life insurance, and more. Claimable percentages follow LHDN guidelines. Check the Add Deduction modal for the full list.',
    tags: ['deductions', 'categories', 'lhdn'],
  },
  {
    id: 'invoices',
    question: 'How do I manage invoices?',
    answer:
      'Go to Invoices to create, view, and manage invoices. You can track sales for income reporting and SST. Create invoices with line items, tax rates, and customer details. Export or share as needed for records and compliance.',
    tags: ['invoices', 'sales', 'sst'],
  },
  {
    id: 'reports',
    question: 'Where can I view tax reports?',
    answer:
      'Go to Reports for an overview of tax filings, deductions, SST, and EA forms. Use Filing Summary for annual tax position. Reports help you track progress and prepare for LHDN submissions.',
    tags: ['reports', 'filing', 'summary'],
  },
  {
    id: 'tax-year',
    question: 'How do I switch tax year?',
    answer:
      'Use the year selector on Taxes, Deductions, and Filing Summary pages. Malaysian tax year follows calendar year (Jan–Dec). Ensure deductions and filings are recorded under the correct year.',
    tags: ['tax year', 'deductions', 'filing'],
  },
];
