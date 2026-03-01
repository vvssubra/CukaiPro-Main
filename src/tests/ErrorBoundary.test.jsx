import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ErrorBoundary, { ErrorFallback } from '../components/Common/ErrorBoundary';

// Suppress expected console.error output from React's error boundary
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

function ThrowingComponent() {
  throw new Error('Test crash');
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <span>All good</span>
      </ErrorBoundary>
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders error UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/Test crash/)).toBeInTheDocument();
  });

  it('shows a "Go to Login" button linking to /login', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    const loginButton = screen.getByRole('button', { name: /go to login/i });
    expect(loginButton).toBeInTheDocument();
  });
});

describe('ErrorFallback', () => {
  it('renders error message and Go to Login button', () => {
    const onReset = vi.fn();
    const error = new Error('Something failed');
    render(<ErrorFallback error={error} onReset={onReset} />);
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/Something failed/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to login/i })).toBeInTheDocument();
  });

  it('calls onReset when Try Again is clicked', async () => {
    const onReset = vi.fn();
    const error = new Error('Something failed');
    const { getByRole } = render(<ErrorFallback error={error} onReset={onReset} />);
    getByRole('button', { name: /try again/i }).click();
    expect(onReset).toHaveBeenCalledOnce();
  });
});
