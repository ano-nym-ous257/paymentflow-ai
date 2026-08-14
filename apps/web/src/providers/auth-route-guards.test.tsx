import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authAdapter } from '@/lib/auth/adapter';
import type { User } from '@/lib/auth/types';
import { AuthProvider, useAuth } from './auth-provider';
import { AuthGuard, WorkspaceGuard } from './auth-route-guards';

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

const user: User = {
  id: 'user-1',
  email: 'owner@paymentflow.test',
  name: 'PaymentFlow Owner',
  role: 'admin',
  organization: 'PaymentFlow',
  createdAt: '2026-08-14T00:00:00.000Z',
};

function LogoutButton() {
  const { logout } = useAuth();
  return (
    <button type="button" onClick={() => void logout()}>
      Log out
    </button>
  );
}

describe('authentication route guards', () => {
  beforeEach(() => {
    replace.mockReset();
    vi.spyOn(authAdapter, 'getCurrentUser').mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows an accessible loading state while authentication initializes', () => {
    vi.mocked(authAdapter.getCurrentUser).mockReturnValue(new Promise(() => {}));
    render(
      <AuthProvider>
        <WorkspaceGuard>Workspace</WorkspaceGuard>
      </AuthProvider>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading authentication');
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated workspace access to /login', async () => {
    render(
      <AuthProvider>
        <WorkspaceGuard>Workspace</WorkspaceGuard>
      </AuthProvider>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument();
  });

  it('renders protected workspace content for an authenticated session', async () => {
    vi.mocked(authAdapter.getCurrentUser).mockResolvedValue(user);
    render(
      <AuthProvider>
        <WorkspaceGuard>Workspace AppShell</WorkspaceGuard>
      </AuthProvider>,
    );

    expect(await screen.findByText('Workspace AppShell')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('redirects an authenticated user rendered through AuthGuard to /dashboard', async () => {
    vi.mocked(authAdapter.getCurrentUser).mockResolvedValue(user);
    render(
      <AuthProvider>
        <AuthGuard>Lamplight authentication</AuthGuard>
      </AuthProvider>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/dashboard'));
    expect(screen.queryByText('Lamplight authentication')).not.toBeInTheDocument();
  });

  it('makes the protected workspace inaccessible after logout', async () => {
    vi.mocked(authAdapter.getCurrentUser).mockResolvedValue(user);
    vi.spyOn(authAdapter, 'logout').mockResolvedValue();
    render(
      <AuthProvider>
        <WorkspaceGuard>
          <span>Protected workspace</span>
          <LogoutButton />
        </WorkspaceGuard>
      </AuthProvider>,
    );

    expect(await screen.findByText('Protected workspace')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

    await waitFor(() => expect(screen.queryByText('Protected workspace')).not.toBeInTheDocument());
    expect(replace).toHaveBeenCalledWith('/login');
  });
});
