# CukaiPro - LHDN-Ready Tax Platform

A modern, production-ready tax management platform for Malaysian businesses built with React, Vite, and Tailwind CSS. Comprehensive solution for invoicing, tax calculations, SST filing, accounting, and LHDN compliance.

## ✨ Key Features

### 🧾 Tax Management
- **Malaysian Income Tax Calculation** - Progressive tax brackets (0%-30%) with accurate LHDN rates
- **SST (Sales & Service Tax)** - 6% SST calculation, filing periods, and LHDN status tracking
- **Tax Deductions** - Business expenses, capital allowances, and personal relief tracking
- **EA Forms** - Employee Allowance form management with PDF export
- **Tax Filing Progress** - Track Form C filing with deadline countdowns
- **Tax Savings Calculator** - Estimate tax savings based on deductions
- **Year-over-Year Analysis** - Compare tax metrics across years

### 📊 Invoicing & Billing
- **Invoice Management** - Create, edit, view, and delete invoices
- **LHDN Status Tracking** - Track validation and submission status (pending, validated, submitted)
- **SST Filing Periods** - Monthly filing periods with automatic due date calculation
- **Invoice Filtering** - By status, date range, LHDN status, and client
- **CSV Export** - Export invoices for analysis
- **Payment Tracking** - Track invoice payments and receivables

### 💼 Accounting & General Ledger
- **Chart of Accounts** - Complete account hierarchy (assets, liabilities, equity, revenue, expenses)
- **Double-Entry Transactions** - Journal entries with automatic balance verification
- **Bank Reconciliation** - Match bank statements with ledger entries
- **Transaction Management** - Track invoices, payments, receipts, bills, and credit notes
- **General Ledger Reports** - Detailed transaction listing by account
- **Opening Balances** - Set initial account balances

### 📈 Financial Reporting
- **Balance Sheet** - Assets, liabilities, and equity statements
- **Profit & Loss** - Revenue and expense reports with period comparison
- **Tax Transaction Listing** - Detailed tax-related transaction reports
- **SST Processor** - SST calculation and filing status reports
- **Journal Report** - Complete journal entry history
- **Export & Print** - Download reports in PDF/TXT format

### 👥 Team Collaboration
- **Multi-Tenancy** - Manage multiple organizations from one account
- **Role-Based Access** - Owner, Admin, Accountant, and Staff roles
- **Team Invitations** - Invite team members via email with secure tokens
- **Permission Management** - Granular permissions for data access and actions
- **Organization Switching** - Seamless switching between organizations
- **Audit Trail** - Track all user actions and data changes

### 💳 Billing & Subscriptions
- **Stripe Integration** - Secure payment processing
- **Multiple Plans** - Pro and Enterprise plans (monthly/yearly)
- **Member Limits** - Enforce team size based on subscription
- **Payment Methods** - Credit card, online banking, FPX support
- **Subscription Management** - Upgrade/downgrade plans

### 🎨 UI/UX Features
- **Dark Mode** - Complete dark theme support with toggle
- **Framer Motion** - Smooth animations and page transitions
- **Recharts Integration** - Interactive charts and data visualization
- **Responsive Design** - Mobile-first, works on all devices
- **PDF Export** - Generate PDFs using jsPDF for forms and reports
- **Drag & Drop** - Upload receipts with drag-and-drop
- **Toast Notifications** - Real-time feedback for user actions
- **Loading States** - Skeleton loaders for better UX
- **Error Boundaries** - Graceful error handling with Sentry

### 🔐 Authentication & Security
- **Supabase Auth** - Email/password authentication
- **Protected Routes** - Route guards for dashboard pages
- **Row-Level Security** - Organization-scoped data isolation
- **Session Management** - Persistent auth state
- **Password Reset** - Email-based password recovery
- **Onboarding Wizard** - 4-step guided setup for new users

### 🇲🇾 Malaysian Tax Compliance
- **LHDN Guidelines** - Built-in Malaysian tax authority guidelines
- **Tax Calendar** - Important tax dates and deadlines
- **SST Due Dates** - Automatic calculation (15th of following month)
- **Form C Tracking** - Track corporate tax filing progress
- **RM Currency** - Malaysian Ringgit formatting throughout
- **Local Regulations** - Compliance with Malaysian tax laws

## Project Structure

```
src/
├── components/
│   ├── Auth/            # Authentication components
│   ├── Common/          # Reusable UI components (Button, Card, Input, Loading, etc.)
│   ├── Dashboard/       # Dashboard-specific components
│   ├── Invoice/         # Invoice management components
│   ├── Tax/             # Tax calculation components
│   └── Layout/          # Layout components (Header, Sidebar, Footer)
├── pages/
│   ├── public/          # Public pages (Landing, About, Contact, etc.)
│   ├── auth/            # Auth pages (Login, Signup)
│   └── dashboard/       # Protected dashboard pages
│       ├── DashboardPage.jsx
│       ├── InvoicesPage.jsx
│       ├── TaxesPage.jsx
│       ├── DeductionsPage.jsx
│       ├── SettingsPage.jsx
│       ├── reports/     # Financial reports
│       ├── AccountsPage.jsx
│       └── TransactionsPage.jsx
├── hooks/               # Custom React hooks (20+ hooks)
│   ├── useAuth.js
│   ├── useOrganization.js
│   ├── useInvoices.js
│   ├── useTaxCalculations.js
│   └── usePermissions.js
├── context/             # Context providers
│   ├── AuthContext.jsx
│   ├── OrganizationContext.jsx
│   ├── AppContext.jsx
│   └── ToastContext.jsx
├── lib/                 # Third-party library configs
│   ├── supabase.js     # Supabase client
│   └── sentry.js       # Sentry configuration
├── utils/               # Utility functions
│   ├── taxCalculations.js
│   ├── dateUtils.js
│   └── formatters.js
└── tests/               # Test files (Vitest + Playwright)
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vvssubra/CukaiPro-Main.git
cd CukaiPro-Main
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Documentation

- **[User guide](docs/USER_GUIDE.md)** – Complete walkthrough for new users (sign up, onboarding, dashboard, invoices, taxes, reports, settings, help). Includes app screenshots; see [Screenshot checklist](docs/GUIDE_SCREENSHOTS.md) to add or refresh images.
- **[Accounting setup](docs/ACCOUNTING_SETUP.md)** – If you deploy to a live Supabase project, run the accounting migration (SQL) so Chart of Accounts, Transactions, and Bank Reconciliation work. Required when you see "table not found" errors for `accounts` or `transactions`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

## Technology Stack

### Core
- **React 19** - Latest React with improved performance
- **Vite 8** - Next-generation build tool
- **React Router 7** - Client-side routing

### Backend & Database
- **Supabase** - PostgreSQL database, authentication, and storage
- **Supabase Auth** - Email/password authentication with RLS
- **Supabase Storage** - File storage for receipts and documents
- **Supabase Edge Functions** - Serverless functions for checkout and emails

### Styling & UI
- **Tailwind CSS 3** - Utility-first CSS framework
- **Framer Motion 12** - Advanced animation library
- **Material Icons** - Google Material Design icons
- **Recharts 3** - React charting library

### Forms & Validation
- **React Hook Form 7** - Performant form library
- **Zod 4** - TypeScript-first schema validation
- **@hookform/resolvers** - Validation resolver for React Hook Form

### Payments & Integrations
- **Stripe** - Payment processing for subscriptions
- **@stripe/stripe-js** - Stripe JavaScript SDK

### PDF & Export
- **jsPDF 4** - Client-side PDF generation
- **jsPDF AutoTable 5** - Table plugin for jsPDF

### Monitoring & Analytics
- **Sentry 8** - Error tracking and performance monitoring
- **Sentry React Integration** - React error boundaries and tracking

### HTTP & API
- **Axios 1** - Promise-based HTTP client

### Testing
- **Vitest 4** - Fast unit test framework
- **React Testing Library 16** - Component testing utilities
- **@vitest/ui** - Interactive test UI
- **Playwright 1** - End-to-end testing
- **jsdom 28** - DOM implementation for testing

### Code Quality
- **ESLint 9** - JavaScript/React linting
- **Prettier 3** - Code formatter
- **TypeScript Support** - JSDoc type checking

## Environment Variables

Create a `.env` file in the root directory. See `.env.example` for all available variables.

### Required Variables

```env
# Supabase Configuration (Required for full functionality)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration (Required for billing features)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
VITE_STRIPE_PRO_YEARLY_PRICE_ID=price_xxx
VITE_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_xxx
VITE_STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_xxx

# Sentry Configuration (Optional - for error monitoring)
VITE_SENTRY_DSN=your_sentry_dsn
VITE_SENTRY_ENVIRONMENT=development
```

### Optional Variables

```env
# Application Settings
VITE_APP_ENV=development
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

**Note**: The app can run without Supabase configuration for viewing public pages only. Protected routes and features require Supabase setup.

## Database Setup

### Supabase Configuration

1. Create a [Supabase](https://supabase.com) project
2. Copy your project URL and anon key to `.env`
3. Run the database migrations in the `supabase/migrations` folder
4. **Important**: Run the accounting setup migration for Chart of Accounts and Transactions features

See [Accounting Setup Guide](docs/ACCOUNTING_SETUP.md) for detailed database setup instructions.

### Database Schema

The application uses the following main tables:
- `user_profiles` - User profile information
- `organizations` - Multi-tenant organizations
- `organization_members` - Team member relationships with roles
- `invoices` - Invoice records with LHDN status
- `tax_deductions` - Tax deduction records with receipts
- `sst_filings` - SST filing period tracking
- `ea_forms` - Employee Allowance forms
- `accounts` - Chart of Accounts
- `transactions` - Financial transactions
- `transaction_lines` - Double-entry transaction lines
- `bank_statement_entries` - Bank reconciliation entries
- `invitations` - Team member invitations
- `audit_logs` - Audit trail for all changes

### Storage Buckets

- `deduction-receipts` - Stores receipt images and PDFs (max 5MB per file)

## Authentication & Onboarding

The app includes a complete authentication system powered by Supabase:

- **Signup** - New user registration with company name
- **Login** - Email/password authentication
- **Logout** - Session termination
- **Password Reset** - Email-based password recovery
- **Protected Routes** - Route guards for authenticated pages
- **Session Persistence** - Automatic session restoration
- **Onboarding Wizard** - 4-step guided setup:
  1. Welcome screen
  2. Organization setup
  3. Deduction setup (optional)
  4. Completion

### Default Access

Use the signup flow to create a new account. No demo credentials required.

## Team Collaboration & Permissions

### Multi-Tenancy
- Create and manage multiple organizations from a single account
- Switch seamlessly between organizations
- Organization-scoped data isolation using Supabase RLS

### Role-Based Access Control

| Feature | Owner | Admin | Accountant | Staff |
|---------|-------|-------|------------|-------|
| Manage members | ✅ | ✅ | ❌ | ❌ |
| Change roles | ✅ | ✅ | ❌ | ❌ |
| Remove members | ✅ | ✅ | ❌ | ❌ |
| Send invitations | ✅ | ✅ | ❌ | ❌ |
| Add/edit deductions | ✅ | ✅ | ❌ | ✅ |
| Verify deductions | ✅ | ✅ | ✅ | ❌ |
| View deductions | ✅ | ✅ | ✅ | ✅ (own only) |
| Add/edit invoices | ✅ | ✅ | ❌ | ✅ |
| View invoices | ✅ | ✅ | ✅ | ✅ (own only) |
| View reports | ✅ | ✅ | ✅ | ❌ |
| Manage accounts | ✅ | ✅ | ✅ | ❌ |
| Manage transactions | ✅ | ✅ | ✅ | ❌ |
| Bank reconciliation | ✅ | ✅ | ✅ | ❌ |

### Team Invitations
- Invite team members via email
- Secure token-based invitation system
- Set role during invitation
- Track invitation status (pending/accepted)

## Integrations

### Supabase
- **Database** - PostgreSQL with real-time capabilities
- **Authentication** - Email/password auth with session management
- **Storage** - File storage for receipts and documents
- **Row-Level Security** - Organization-scoped data isolation
- **Edge Functions** - Serverless functions for email and payments

### Stripe
- **Payment Processing** - Secure subscription payments
- **Plan Management** - Pro and Enterprise subscription plans
- **Checkout Sessions** - Hosted checkout pages
- **Payment Methods** - Credit card, online banking, FPX

### Sentry
- **Error Tracking** - Real-time error monitoring
- **Performance Monitoring** - 10% sample rate for performance tracking
- **Browser Tracing** - User interaction tracking
- **Sensitive Data Filtering** - Automatic removal of passwords, tokens, API keys

## Testing

The project includes comprehensive testing setup with Vitest and Playwright.

### Unit & Component Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

Write tests using Vitest and React Testing Library:

```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### End-to-End Testing

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

E2E tests are located in the `tests/` directory and use Playwright.

## Code Style

The project uses Prettier and ESLint for consistent code style:

```bash
# Format code
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint

# Fix linting errors
npm run lint:fix
```

## Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The build output will be in the `dist/` directory, optimized and ready for deployment.

### Deployment

This application is ready to deploy to:
- **Vercel** - Recommended (includes `vercel.json` config)
- **Netlify** - Works out of the box
- **Any static hosting** - Serve the `dist/` folder

### Production Checklist

- [ ] Set up Supabase project and run all migrations
- [ ] Configure environment variables in hosting platform
- [ ] Set up Stripe account and add price IDs
- [ ] Configure Sentry DSN for error monitoring
- [ ] Update CORS settings in Supabase
- [ ] Test authentication flow
- [ ] Verify file uploads work (Supabase storage bucket permissions)

## Malaysian Tax Compliance Features

### LHDN Integration Ready
- **LHDN Status Tracking** - Track submission status (pending, validated, submitted)
- **Form C Filing** - Corporate tax filing progress tracking
- **EA Forms** - Employee Allowance forms with PDF export
- **SST Compliance** - Sales & Service Tax calculation and filing

### Malaysian Tax Rates
- **Income Tax** - Progressive brackets from 0% to 30% following LHDN rates
- **SST Rate** - 6% Sales & Service Tax on applicable services
- **Tax Year** - Calendar year (January 1 - December 31)
- **Filing Deadline** - June 30th for previous year

### Deduction Categories
**Business Expenses (100% deductible)**
- Salaries and wages
- Rent and utilities
- Insurance premiums
- Advertising and marketing
- Professional fees
- Travel expenses
- Training and development

**Capital Allowances**
- Machinery and equipment (Initial: 20%, Annual: 14%)
- Motor vehicles (Initial: 20%, Annual: 20%)
- Computers and IT (Initial: 40%, Annual: 40%)
- Furniture and fittings (Initial: 20%, Annual: 10%)

**Personal Relief**
- Self and dependents relief
- Medical expenses
- Education fees
- EPF contributions
- Life insurance premiums
- Medical insurance
- SOCSO contributions
- SSPN savings

### Compliance Reports
- Balance Sheet (Statement of Financial Position)
- Profit & Loss Statement (Income Statement)
- General Ledger
- Journal Entries
- Tax Transaction Listing
- SST Processor Report

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For support, email support@cukaipro.com or open an issue in the repository.

---

Built with ❤️ in Kuala Lumpur, Malaysia
