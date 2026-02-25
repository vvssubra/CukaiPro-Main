import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { isSupabaseConfigured } from './lib/supabaseConfig';
import { AuthProvider } from './context/AuthContext';
import { OrganizationProvider } from './context/OrganizationContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary, { ErrorFallback } from './components/Common/ErrorBoundary';
import Loading from './components/Common/Loading';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Navbar from './components/Navbar';

function ConfigRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-4">
          <span className="material-icons-outlined text-3xl">settings</span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Setup required</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          Add your Supabase credentials so the app can connect to the database.
        </p>
        <ol className="list-decimal list-inside text-sm text-slate-600 dark:text-slate-400 space-y-2 mb-6">
          <li>Copy <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">.env.example</code> to <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">.env</code></li>
          <li>Set <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> in <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">.env</code></li>
          <li>Restart the dev server (<code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">npm run dev</code>)</li>
        </ol>
        <p className="text-xs text-slate-500 dark:text-slate-500">
          Get the values from your Supabase project: Dashboard → Settings → API.
        </p>
      </div>
    </div>
  );
}

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/Auth/SignupPage'));
const OnboardingWizard = lazy(() => import('./pages/Onboarding/OnboardingWizard'));
const InvoiceListPage = lazy(() => import('./pages/Invoices'));
const TaxesPage = lazy(() => import('./pages/Taxes/TaxesPage'));
const DeductionsPage = lazy(() => import('./pages/Taxes/DeductionsPage'));
const FilingSummaryPage = lazy(() => import('./pages/Taxes/FilingSummaryPage'));
const EAFormPage = lazy(() => import('./pages/Taxes/EAFormPage'));
const SSTFilingPage = lazy(() => import('./pages/Taxes/SSTFilingPage'));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'));
const AcceptInvitePage = lazy(() => import('./pages/Auth/AcceptInvitePage'));
const ReportsPage = lazy(() => import('./pages/Reports/ReportsPage'));
const HelpPage = lazy(() => import('./pages/Help/HelpPage'));
const GuidePage = lazy(() => import('./pages/Help/GuidePage'));
const ConfigDebugPage = lazy(() => import('./pages/Debug/ConfigDebugPage'));

function AppLayout() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-custom dark:text-gray-100 antialiased min-h-screen">
      {!isDashboard && <Navbar />}
      <Suspense fallback={<Loading fullScreen />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/invoices"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <InvoiceListPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <InvoiceListPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/taxes"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <TaxesPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/deductions"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <DeductionsPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/tax-filing"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <FilingSummaryPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/sst-filing"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <SSTFilingPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/taxes/ea-form"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <EAFormPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <SettingsPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/reports"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <ReportsPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/help"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <HelpPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/guide"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <GuidePage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  if (!isSupabaseConfigured) {
    return <ConfigRequired />;
  }
  return (
    <Sentry.ErrorBoundary fallback={({ error, resetError }) => <ErrorFallback error={error} onReset={resetError} />}>
      <BrowserRouter>
        <AppProvider>
          <AuthProvider>
            <OrganizationProvider>
              <ToastProvider>
              <Suspense fallback={<Loading fullScreen />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/onboarding" element={<OnboardingWizard />} />
                  <Route path="/invite/:token" element={<AcceptInvitePage />} />
                  {import.meta.env.DEV && <Route path="/debug/config" element={<ConfigDebugPage />} />}
                  <Route path="/*" element={<AppLayout />} />
                </Routes>
              </Suspense>
              </ToastProvider>
            </OrganizationProvider>
          </AuthProvider>
        </AppProvider>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  );
}

export default App;