import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/Common/ErrorBoundary';
import Loading from './components/Common/Loading';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Navbar from './components/Navbar';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const InvoiceListPage = lazy(() => import('./pages/Invoices'));
const TaxesPage = lazy(() => import('./pages/Taxes/TaxesPage'));
const DeductionsPage = lazy(() => import('./pages/Taxes/DeductionsPage'));
const FilingSummaryPage = lazy(() => import('./pages/Taxes/FilingSummaryPage'));

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
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* NEW: Add this route for /dashboard/invoices */}
          <Route
            path="/dashboard/invoices"
            element={
              <ProtectedRoute>
                <InvoiceListPage />
              </ProtectedRoute>
            }
          />
          <Route path="/invoices" element={<InvoiceListPage />} />
          <Route path="/dashboard/taxes" element={<ProtectedRoute><TaxesPage /></ProtectedRoute>} />
          <Route path="/dashboard/deductions" element={<ProtectedRoute><DeductionsPage /></ProtectedRoute>} />
          <Route path="/dashboard/tax-filing" element={<ProtectedRoute><FilingSummaryPage /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <AuthProvider>
            <Suspense fallback={<Loading fullScreen />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/*" element={<AppLayout />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;