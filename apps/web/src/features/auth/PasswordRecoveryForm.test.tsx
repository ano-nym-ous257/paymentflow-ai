import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PasswordRecoveryForm } from './PasswordRecoveryForm';

const auth = vi.hoisted(() => ({
  initializePasswordRecovery: vi.fn(),
  updatePassword: vi.fn(),
}));

vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => ({ ...auth, isLoading: false }),
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

async function renderValidForm() {
  auth.initializePasswordRecovery.mockResolvedValue({ success: true });
  render(<PasswordRecoveryForm />);
  expect(await screen.findByRole('heading', { name: 'Choose a new password' })).toBeInTheDocument();
}

function enterPasswords(password: string, confirmation: string) {
  fireEvent.change(screen.getByLabelText('New password'), { target: { value: password } });
  fireEvent.change(screen.getByLabelText('Confirm new password'), {
    target: { value: confirmation },
  });
}

describe('PasswordRecoveryForm', () => {
  beforeEach(() => {
    auth.initializePasswordRecovery.mockReset();
    auth.updatePassword.mockReset();
  });

  it('shows accessible loading UI while recovery state is unresolved', () => {
    auth.initializePasswordRecovery.mockReturnValue(new Promise(() => {}));
    render(<PasswordRecoveryForm />);

    expect(screen.getByRole('status')).toHaveTextContent('Validating your recovery link');
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
  });

  it('exposes the password-update form for valid recovery state', async () => {
    await renderValidForm();

    expect(screen.getByLabelText('New password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm new password')).toBeInTheDocument();
  });

  it('does not expose the form for invalid or expired recovery state', async () => {
    auth.initializePasswordRecovery.mockResolvedValue({
      success: false,
      error: 'This password recovery link is invalid or has expired.',
    });
    render(<PasswordRecoveryForm />);

    expect(
      await screen.findByRole('heading', { name: 'Recovery link unavailable' }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Return to sign in' })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('rejects mismatched passwords locally', async () => {
    await renderValidForm();
    enterPasswords('a-secure-password', 'a-different-password');

    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(auth.updatePassword).not.toHaveBeenCalled();
  });

  it('rejects an invalid password using existing validation', async () => {
    await renderValidForm();
    enterPasswords('short', 'short');

    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    expect(screen.getByText('Password must be at least 12 characters')).toBeInTheDocument();
    expect(auth.updatePassword).not.toHaveBeenCalled();
  });

  it('submits exactly once and prevents duplicates while pending', async () => {
    const update = deferred<{ success: true }>();
    auth.updatePassword.mockReturnValue(update.promise);
    await renderValidForm();
    enterPasswords('a-secure-password', 'a-secure-password');

    const button = screen.getByRole('button', { name: 'Update password' });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(auth.updatePassword).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: /Updating password/ })).toBeDisabled();
    update.resolve({ success: true });
    await screen.findByRole('heading', { name: 'Your password has been updated' });
  });

  it('shows success and a login path when the boundary confirms the password changed', async () => {
    auth.updatePassword.mockResolvedValue({ success: true });
    await renderValidForm();
    enterPasswords('a-secure-password', 'a-secure-password');

    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    expect(
      await screen.findByRole('heading', { name: 'Your password has been updated' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue to sign in' })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('shows a normalized application error when the update fails', async () => {
    auth.updatePassword.mockResolvedValue({
      success: false,
      error: 'Password does not meet the security requirements.',
    });
    await renderValidForm();
    enterPasswords('a-secure-password', 'a-secure-password');

    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Password does not meet the security requirements.',
      ),
    );
  });
});
