import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authAdapter } from '@/lib/auth/adapter';
import type { User } from '@/lib/auth/types';
import { AuthProvider, useAuth } from './auth-provider';

const user: User = {
  id: 'user-1',
  email: 'owner@paymentflow.test',
  name: 'PaymentFlow Owner',
  role: 'admin',
  organization: 'PaymentFlow',
  createdAt: '2026-08-14T00:00:00.000Z',
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function AuthProbe() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="initializing">{String(auth.isInitializing)}</span>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="user">{auth.user?.email ?? 'none'}</span>
      <button type="button" onClick={() => void auth.logout()}>
        Log out
      </button>
      <button
        type="button"
        onClick={() => void auth.login({ email: user.email, password: 'test-password' })}
      >
        Log in
      </button>
      <button
        type="button"
        onClick={() =>
          void auth.signup({ name: user.name, email: user.email, password: 'test-password' })
        }
      >
        Sign up
      </button>
      <button
        type="button"
        onClick={() => void auth.updatePassword({ password: 'new-secure-password' })}
      >
        Update password
      </button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.spyOn(authAdapter, 'getCurrentUser').mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('begins initializing and calls getCurrentUser exactly once per mount', async () => {
    const currentUser = deferred<User | null>();
    vi.mocked(authAdapter.getCurrentUser).mockReturnValue(currentUser.promise);

    const first = render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(screen.getByTestId('initializing')).toHaveTextContent('true');
    expect(authAdapter.getCurrentUser).toHaveBeenCalledTimes(1);

    first.rerender(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );
    expect(authAdapter.getCurrentUser).toHaveBeenCalledTimes(1);

    await act(async () => currentUser.resolve(null));
    first.unmount();

    vi.mocked(authAdapter.getCurrentUser).mockReturnValue(new Promise(() => {}));
    const second = render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );
    expect(authAdapter.getCurrentUser).toHaveBeenCalledTimes(2);
    second.unmount();
  });

  it('restores an authenticated session', async () => {
    vi.mocked(authAdapter.getCurrentUser).mockResolvedValue(user);
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'));
    expect(screen.getByTestId('initializing')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent(user.email);
  });

  it('settles unauthenticated when there is no current user', async () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('initializing')).toHaveTextContent('false'));
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('settles safely when session initialization fails', async () => {
    vi.mocked(authAdapter.getCurrentUser).mockRejectedValue(new Error('Unavailable'));
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('initializing')).toHaveTextContent('false'));
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('clears authentication state after logout completes', async () => {
    vi.mocked(authAdapter.getCurrentUser).mockResolvedValue(user);
    vi.spyOn(authAdapter, 'logout').mockRejectedValue(new Error('Unavailable'));
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'));
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('false'));
    expect(screen.getByTestId('initializing')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it.each([
    ['login', 'Log in'],
    ['signup', 'Sign up'],
  ] as const)('%s settles the provider into an authenticated state', async (method, buttonName) => {
    vi.spyOn(authAdapter, method).mockResolvedValue(user);
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('initializing')).toHaveTextContent('false'));
    fireEvent.click(screen.getByRole('button', { name: buttonName }));

    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'));
    expect(screen.getByTestId('initializing')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent(user.email);
  });

  it('settles locally logged out after a successful password update', async () => {
    vi.mocked(authAdapter.getCurrentUser).mockResolvedValue(user);
    vi.spyOn(authAdapter, 'updatePassword').mockResolvedValue();
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'));
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('false'));
    expect(authAdapter.updatePassword).toHaveBeenCalledOnce();
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });
});
