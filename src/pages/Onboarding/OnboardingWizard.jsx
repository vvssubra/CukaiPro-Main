import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import { useDeductions } from '../../hooks/useDeductions';
import { useInvitations } from '../../hooks/useInvitations';
import { useToast } from '../../context/ToastContext';
import { getCategoryById } from '../../data/taxCategories';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';

const TOTAL_STEPS = 4;

function StepWelcome({ onNext }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
          <span className="material-icons-outlined text-3xl">celebration</span>
        </div>
        <h2 className="text-xl font-bold text-slate-custom dark:text-white mb-2">
          Welcome to CukaiPro
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Let's get your tax management set up in a few quick steps. You can skip optional steps and complete them later.
        </p>
      </div>
      <Button type="button" onClick={onNext} fullWidth>
        Get started
        <span className="material-icons-outlined text-sm ml-1">arrow_forward</span>
      </Button>
    </div>
  );
}

function StepOrganization({ onNext }) {
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { createOrganization } = useOrganization();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!businessName.trim() || businessName.trim().length < 2) {
      setError('Business name must be at least 2 characters');
      return;
    }
    setLoading(true);
    try {
      await createOrganization(businessName.trim());
      onNext();
    } catch (err) {
      setError(err?.message || 'Failed to create organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-custom dark:text-white mb-2">
          Create your organization
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Enter your business name to get started.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}
          <Input
            label="Business name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="My Sdn Bhd"
            required
            fullWidth
          />
          <Button type="submit" fullWidth loading={loading} disabled={loading || !businessName.trim()}>
            Continue
            <span className="material-icons-outlined text-sm ml-1">arrow_forward</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

function StepDeduction({ onNext, onSkip }) {
  const { addDeduction } = useDeductions();
  const toast = useToast();
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const taxYear = new Date().getFullYear();

  const businessCategories = [
    { id: 'office_supplies', name: 'Office Supplies' },
    { id: 'utilities', name: 'Utilities' },
    { id: 'rent', name: 'Business Rent' },
    { id: 'professional_fees', name: 'Professional Fees' },
    { id: 'advertising', name: 'Advertising & Promotion' },
  ];

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    const amt = parseFloat(amount);
    if (!categoryId || !amount || isNaN(amt) || amt <= 0) {
      setError('Please enter a valid category and amount.');
      return;
    }
    setLoading(true);
    try {
      const cat = getCategoryById(categoryId) || { id: categoryId, name: description || categoryId, type: 'business', claimable: 100 };
      const formData = {
        category_id: categoryId,
        amount: amt,
        description: description || cat.name,
        deduction_date: new Date().toISOString().slice(0, 10).split('-').reverse().join('/'),
        tax_year: taxYear,
      };
      const result = await addDeduction(formData, null);
      if (result.success) {
        toast.success('Deduction added.');
        onNext();
      } else {
        setError(result.error || 'Failed to add deduction.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to add deduction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-custom dark:text-white mb-2">
          Add your first deduction
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Track a tax-deductible expense now, or skip and add later from the dashboard.
        </p>
        <form onSubmit={handleAdd} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-custom dark:text-white"
            >
              <option value="">Select category</option>
              {businessCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <Input
            label="Amount (RM)"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            fullWidth
          />
          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Office supplies"
            fullWidth
          />
          <div className="flex gap-3">
            <Button type="submit" loading={loading} disabled={loading || !categoryId || !amount}>
              Add deduction
            </Button>
            <Button type="button" variant="outline" onClick={onSkip}>
              Skip for now
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StepInvite({ onNext, onSkip }) {
  const { sendInvitation, canInviteMembers } = useInvitations();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const result = await sendInvitation(email.trim(), role);
      if (result.success) {
        toast.success('Invitation sent.');
        onNext();
      } else {
        setError(result.error || 'Failed to send invitation.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to send invitation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-custom dark:text-white mb-2">
          Invite your team
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Add team members to collaborate on tax and invoices, or skip and invite later.
        </p>
        {canInviteMembers ? (
          <form onSubmit={handleInvite} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
              fullWidth
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-custom dark:text-white"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
                <option value="accountant">Accountant</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={loading} disabled={loading || !email.trim()}>
                Send invite
              </Button>
              <Button type="button" variant="outline" onClick={onSkip}>
                Skip for now
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">You can invite team members from Settings → Team after setup.</p>
            <Button type="button" onClick={onSkip} fullWidth>
              Continue to dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { user, profile, completeOnboarding } = useAuth();
  const { organizations, currentOrganization, loading: orgLoading } = useOrganization();
  const [step, setStep] = useState(1);

  const handleFinish = async () => {
    try {
      await completeOnboarding();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Failed to complete onboarding', err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">You must be logged in to continue.</p>
          <Link to="/login" className="mt-4 inline-block text-primary font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  // Already completed onboarding → go to dashboard
  if (profile?.onboarding_completed_at && currentOrganization) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  // Already has org - might be mid-flow or needs to finish optional steps
  if (orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If org exists but step is still 1-2, jump to step 3 (Add deduction)
  const displayStep = currentOrganization && step < 3 ? 3 : step;

  const renderStep = () => {
    switch (displayStep) {
      case 1:
        return <StepWelcome onNext={() => setStep(2)} />;
      case 2:
        return (
          <StepOrganization
            onNext={() => setStep(3)}
          />
        );
      case 3:
        return (
          <StepDeduction
            onNext={() => setStep(4)}
            onSkip={() => setStep(4)}
          />
        );
      case 4:
        return (
          <StepInvite
            onNext={handleFinish}
            onSkip={handleFinish}
          />
        );
      default:
        return <StepWelcome onNext={() => setStep(2)} />;
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display transition-colors duration-300">
      <nav className="w-full py-6 px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <span className="material-icons-outlined text-white text-2xl">account_balance</span>
          </div>
          <span className="text-xl font-bold text-primary dark:text-white tracking-tight">
            CukaiPro
          </span>
        </Link>
      </nav>

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[480px]">
          <div className="bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg shadow-sm overflow-hidden">
            {/* Progress indicator */}
            <div className="flex w-full h-1 bg-slate-100 dark:bg-primary/10">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(displayStep / TOTAL_STEPS) * 100}%` }}
              />
            </div>
            <div className="p-8 md:p-10">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">
                Step {displayStep} of {TOTAL_STEPS}
              </p>
              {renderStep()}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 px-8 border-t border-slate-200 dark:border-primary/10">
        <p className="text-xs text-slate-400 text-center">© 2026 CukaiPro Malaysia. All rights reserved.</p>
      </footer>
    </div>
  );
}
