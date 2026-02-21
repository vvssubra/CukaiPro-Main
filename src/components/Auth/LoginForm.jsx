import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema } from '../../utils/validators';
import Input from '../Common/Input';
import Button from '../Common/Button';

export function LoginForm({ onSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setLoginError('');

    try {
      await signIn(data.email, data.password);
      if (onSuccess) onSuccess();
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setLoginError(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {loginError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-300">{loginError}</p>
        </div>
      )}

      <Input
        {...register('email')}
        label="Email Address"
        type="email"
        placeholder="name@company.com"
        error={errors.email?.message}
        required
        fullWidth
      />

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Password <span className="text-red-500">*</span>
          </label>
          <a
            href="#"
            className="text-xs font-semibold text-slate-700 dark:text-primary/80 hover:underline"
          >
            Forgot Password?
          </a>
        </div>
        <Input
          {...register('password')}
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          fullWidth
        />
      </div>

      <Button type="submit" fullWidth loading={isLoading}>
        <span>Login</span>
        <span className="material-icons-outlined text-sm">arrow_forward</span>
      </Button>
    </form>
  );
}

LoginForm.propTypes = {
  onSuccess: PropTypes.func,
};

export default LoginForm;
