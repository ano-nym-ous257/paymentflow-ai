import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PasswordRecoveryRequestForm } from './PasswordRecoveryRequestForm';

const auth = vi.hoisted(() => ({
  resetPassword: vi.fn(),
  clearError: vi.fn(),
}));

vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => auth,
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function enterEmail(email: string) {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
}

describe('PasswordRecoveryRequestForm', () => {
  beforeEach(() => {
    auth.resetPassword.mockReset();
    auth.clearError.mockReset();
  });

  it('rejects an invalid email locally', () => {
    render(<PasswordRecoveryRequestForm onBack={vi.fn()} />);
    enterEmail('not-an-email');

    fireEvent.click(screen.getByRole('button', { name: 'Send recovery instructions' }));

    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    expect(auth.resetPassword).not.toHaveBeenCalled();
  });

  it('calls resetPassword exactly once and prevents duplicate submissions', () => {
    auth.resetPassword.mockReturnValue(new Promise(() => {}));
    render(<PasswordRecoveryRequestForm onBack={vi.fn()} />);
    enterEmail('owner@paymentflow.test');

    const submit = screen.getByRole('button', { name: 'Send recovery instructions' });
    fireEvent.click(submit);
    fireEvent.click(submit);

    expect(auth.resetPassword).toHaveBeenCalledOnce();
    expect(auth.resetPassword).toHaveBeenCalledWith({ email: 'owner@paymentflow.test' });
    expect(screen.getByRole('button', { name: /Sending instructions/ })).toBeDisabled();
  });

  it('shows a neutral confirmation after a successful request', async () => {
    auth.resetPassword.mockResolvedValue({ success: true });
    render(<PasswordRecoveryRequestForm onBack={vi.fn()} />);
    enterEmail('owner@paymentflow.test');

    fireEvent.click(screen.getByRole('button', { name: 'Send recovery instructions' }));

    expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'If an account exists for this email, we’ve sent password recovery instructions.',
    );
    expect(screen.queryByText(/registered|account found|does not exist/i)).not.toBeInTheDocument();
  });

  it('shows a normalized safe provider failure', async () => {
    auth.resetPassword.mockResolvedValue({
      success: false,
      error: 'Authentication is temporarily unavailable. Please try again.',
    });
    render(<PasswordRecoveryRequestForm onBack={vi.fn()} />);
    enterEmail('owner@paymentflow.test');

    fireEvent.click(screen.getByRole('button', { name: 'Send recovery instructions' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Authentication is temporarily unavailable. Please try again.',
      ),
    );
  });

  it('allows the user to return to sign in', () => {
    const onBack = vi.fn();
    render(<PasswordRecoveryRequestForm onBack={onBack} />);

    fireEvent.click(screen.getByRole('button', { name: 'Return to sign in' }));

    expect(onBack).toHaveBeenCalledOnce();
  });
});
