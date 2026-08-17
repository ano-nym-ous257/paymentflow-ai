import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProfileRepository } from '@/lib/profile/repository';
import { ProfileProvider, useProfile } from './profile-provider';

const authState = vi.hoisted(() => ({
  user: null as { id: string; email: string; createdAt: string } | null,
  isInitializing: false,
}));

vi.mock('./auth-provider', () => ({ useAuth: () => authState }));

function Probe() {
  const state = useProfile();
  return (
    <div>
      <span data-testid="status">{state.status}</span>
      <span data-testid="name">{state.profile?.displayName ?? 'none'}</span>
      <span data-testid="error">{state.error ?? 'none'}</span>
    </div>
  );
}

function repositoryReturning(
  result: Awaited<ReturnType<ProfileRepository['getByAuthenticatedUserId']>>,
): ProfileRepository {
  return { getByAuthenticatedUserId: vi.fn().mockResolvedValue(result) };
}

describe('ProfileProvider', () => {
  beforeEach(() => {
    authState.user = null;
    authState.isInitializing = false;
  });

  it('remains unresolved while authentication is initializing', () => {
    authState.isInitializing = true;
    render(
      <ProfileProvider repository={repositoryReturning(null)}>
        <Probe />
      </ProfileProvider>,
    );
    expect(screen.getByTestId('status')).toHaveTextContent('unresolved');
  });

  it('settles without querying profile persistence when unauthenticated', () => {
    const repository = repositoryReturning(null);
    render(
      <ProfileProvider repository={repository}>
        <Probe />
      </ProfileProvider>,
    );
    expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated');
    expect(repository.getByAuthenticatedUserId).not.toHaveBeenCalled();
  });

  it('loads the application profile after an authenticated subject is available', async () => {
    authState.user = { id: 'user-1', email: 'owner@example.com', createdAt: '' };
    const repository = repositoryReturning({
      id: 'user-1',
      displayName: 'PaymentFlow Owner',
      avatarUrl: null,
      status: 'active',
      createdAt: '',
      updatedAt: '',
    });
    render(
      <ProfileProvider repository={repository}>
        <Probe />
      </ProfileProvider>,
    );

    expect(screen.getByTestId('status')).toHaveTextContent('loading');
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('available'));
    expect(screen.getByTestId('name')).toHaveTextContent('PaymentFlow Owner');
    expect(repository.getByAuthenticatedUserId).toHaveBeenCalledWith('user-1');
  });

  it('represents a missing provisioned profile separately from authentication', async () => {
    authState.user = { id: 'user-1', email: 'owner@example.com', createdAt: '' };
    render(
      <ProfileProvider repository={repositoryReturning(null)}>
        <Probe />
      </ProfileProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('missing'));
  });

  it('settles safely when profile persistence fails', async () => {
    authState.user = { id: 'user-1', email: 'owner@example.com', createdAt: '' };
    const repository: ProfileRepository = {
      getByAuthenticatedUserId: vi.fn().mockRejectedValue(new Error('provider detail')),
    };
    render(
      <ProfileProvider repository={repository}>
        <Probe />
      </ProfileProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('error'));
    expect(screen.getByTestId('error')).toHaveTextContent(
      'Your profile is temporarily unavailable. Please try again.',
    );
  });
});
