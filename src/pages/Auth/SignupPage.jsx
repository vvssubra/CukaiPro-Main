import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import { supabase } from '../../lib/supabase';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';

function validateSignup(data) {
  const errors = {};
  if (!data.fullName?.trim() || data.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }
  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!data.password || data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/[A-Z]/.test(data.password) || !/[a-z]/.test(data.password) || !/[0-9]/.test(data.password)) {
    errors.password = 'Password must contain uppercase, lowercase, and a number';
  }
  if (!data.businessName?.trim() || data.businessName.trim().length < 2) {
    errors.businessName = 'Business name must be at least 2 characters';
  }
  return Object.keys(errors).length ? errors : null;
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { reloadOrganizations } = useOrganization();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setError('');
    const validationErrors = validateSignup(data);
    if (validationErrors) {
      Object.entries(validationErrors).forEach(([field, msg]) => setFieldError(field, { message: msg }));
      return;
    }

    setLoading(true);

    try {
      await signUp(data.email, data.password, data.fullName);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      console.error('Signup error:', err);
      setError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
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
        <div className="w-full max-w-[450px]">
          <div className="bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg shadow-sm overflow-hidden">
            <div className="p-8 md:p-10">
              <h1 className="text-2xl font-bold text-slate-custom dark:text-white mb-2">
                Create your account
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Malaysian SME Tax Management Platform
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                  </div>
                )}

                <Input
                  {...register('fullName')}
                  label="Full name"
                  placeholder="Azlan Shah"
                  error={errors.fullName?.message}
                  required
                  fullWidth
                />

                <Input
                  {...register('email')}
                  label="Email address"
                  type="email"
                  placeholder="name@company.com"
                  error={errors.email?.message}
                  required
                  fullWidth
                />

                <Input
                  {...register('password')}
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  required
                  fullWidth
                />

                <Button type="submit" fullWidth loading={loading}>
                  <span>Create account</span>
                  <span className="material-icons-outlined text-sm">arrow_forward</span>
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-slate-custom dark:text-primary/80 font-bold hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
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
