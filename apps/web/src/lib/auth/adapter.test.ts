import type { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SupabaseAuthAdapter } from './adapter';
import { EMAIL_CONFIRMATION_REQUIRED_MESSAGE, normalizeAuthError } from './errors';
import { mapSupabaseUser } from './supabase-user-mapper';
import { getPasswordRecoveryRedirectUrl } from '@/lib/supabase/config';

const supabaseUser = {
  id: 'supabase-user-1',
  email: 'owner@paymentflow.test',
  created_at: '2026-08-14T00:00:00.000Z',
  app_metadata: { provider: 'email' },
  user_metadata: {
    full_name: 'PaymentFlow Owner',
    role: 'admin',
    organization: 'Untrusted Organization',
  },
  aud: 'authenticated',
} as SupabaseUser;

function createAuthClient() {
  return {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    getUser: vi.fn(),
  };
}

function createAdapter(authClient: ReturnType<typeof createAuthClient>) {
  return new SupabaseAuthAdapter(() => authClient as unknown as SupabaseClient['auth']);
}

describe('SupabaseAuthAdapter', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('maps a Supabase identity without trusting authorization metadata', () => {
    expect(mapSupabaseUser(supabaseUser)).toEqual({
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: 'PaymentFlow Owner',
      role: 'viewer',
      organization: '',
      createdAt: supabaseUser.created_at,
    });
  });

  it('logs in with email and password and returns an application user', async () => {
    const authClient = createAuthClient();
    authClient.signInWithPassword.mockResolvedValue({
      data: { user: supabaseUser, session: { access_token: 'not-exposed' } },
      error: null,
    });

    await expect(
      createAdapter(authClient).login({ email: supabaseUser.email!, password: 'test-password' }),
    ).resolves.toMatchObject({ id: supabaseUser.id, role: 'viewer' });
    expect(authClient.signInWithPassword).toHaveBeenCalledWith({
      email: supabaseUser.email,
      password: 'test-password',
    });
  });

  it('normalizes invalid login errors', async () => {
    const authClient = createAuthClient();
    authClient.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { code: 'invalid_credentials', message: 'provider detail' },
    });

    await expect(
      createAdapter(authClient).login({ email: 'wrong@example.com', password: 'wrong-password' }),
    ).rejects.toThrow('Email or password is incorrect.');
  });

  it('normalizes rejected provider requests', async () => {
    const authClient = createAuthClient();
    authClient.signInWithPassword.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(
      createAdapter(authClient).login({ email: 'owner@example.com', password: 'test-password' }),
    ).rejects.toThrow('Authentication is temporarily unavailable. Please try again.');
  });

  it('signs up with display-name metadata when a session is active', async () => {
    const authClient = createAuthClient();
    authClient.signUp.mockResolvedValue({
      data: { user: supabaseUser, session: { access_token: 'not-exposed' } },
      error: null,
    });

    await expect(
      createAdapter(authClient).signup({
        name: 'PaymentFlow Owner',
        email: supabaseUser.email!,
        password: 'test-password',
        organization: 'Ignored Organization',
      }),
    ).resolves.toMatchObject({ id: supabaseUser.id, role: 'viewer', organization: '' });
    expect(authClient.signUp).toHaveBeenCalledWith({
      email: supabaseUser.email,
      password: 'test-password',
      options: { data: { full_name: 'PaymentFlow Owner' } },
    });
  });

  it('keeps signup unauthenticated when email confirmation is required', async () => {
    const authClient = createAuthClient();
    authClient.signUp.mockResolvedValue({
      data: { user: supabaseUser, session: null },
      error: null,
    });

    await expect(
      createAdapter(authClient).signup({
        name: 'PaymentFlow Owner',
        email: supabaseUser.email!,
        password: 'test-password',
      }),
    ).rejects.toThrow(EMAIL_CONFIRMATION_REQUIRED_MESSAGE);
  });

  it('logs out through Supabase', async () => {
    const authClient = createAuthClient();
    authClient.signOut.mockResolvedValue({ error: null });

    await expect(createAdapter(authClient).logout()).resolves.toBeUndefined();
    expect(authClient.signOut).toHaveBeenCalledOnce();
  });

  it('returns the mapped current authenticated user', async () => {
    const authClient = createAuthClient();
    authClient.getUser.mockResolvedValue({ data: { user: supabaseUser }, error: null });

    await expect(createAdapter(authClient).getCurrentUser()).resolves.toMatchObject({
      id: supabaseUser.id,
      role: 'viewer',
    });
  });

  it('returns null when there is no authenticated user', async () => {
    const authClient = createAuthClient();
    authClient.getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(createAdapter(authClient).getCurrentUser()).resolves.toBeNull();
  });

  it.each([
    { code: 'session_not_found' },
    { name: 'AuthSessionMissingError' },
    { message: 'Auth session missing from browser storage' },
  ])('returns null for a supported missing-session error: %o', async (error) => {
    const authClient = createAuthClient();
    authClient.getUser.mockResolvedValue({ data: { user: null }, error });

    await expect(createAdapter(authClient).getCurrentUser()).resolves.toBeNull();
  });

  it('does not convert unrelated current-user errors into logged-out state', async () => {
    const authClient = createAuthClient();
    authClient.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Failed to fetch' },
    });

    await expect(createAdapter(authClient).getCurrentUser()).rejects.toThrow(
      'Authentication is temporarily unavailable. Please try again.',
    );
  });

  it('requests a password recovery email with the configured update-password redirect', async () => {
    const authClient = createAuthClient();
    authClient.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000/');

    await expect(
      createAdapter(authClient).resetPassword({ email: supabaseUser.email! }),
    ).resolves.toBeUndefined();
    expect(getPasswordRecoveryRedirectUrl()).toBe('http://localhost:3000/auth/update-password');
    expect(authClient.resetPasswordForEmail).toHaveBeenCalledWith(supabaseUser.email, {
      redirectTo: 'http://localhost:3000/auth/update-password',
    });
  });

  it('fails safely when the application URL is unavailable during password recovery', async () => {
    const authClient = createAuthClient();
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '');

    await expect(
      createAdapter(authClient).resetPassword({ email: supabaseUser.email! }),
    ).rejects.toThrow('Authentication is not configured correctly. Please contact support.');
    expect(authClient.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it.each([
    [{ code: 'email_not_confirmed' }, 'Please verify your email before signing in.'],
    [{ code: 'user_already_exists' }, 'An account with this email already exists.'],
    [{ status: 429 }, 'Too many authentication attempts. Please try again later.'],
    [
      { message: 'Failed to fetch' },
      'Authentication is temporarily unavailable. Please try again.',
    ],
    [{ message: 'sensitive provider detail' }, 'Authentication failed. Please try again.'],
  ])('normalizes provider errors to safe application messages', (providerError, expected) => {
    expect(normalizeAuthError(providerError).message).toBe(expected);
  });
});
