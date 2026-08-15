import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoginCredentials, SignupCredentials, ResetPasswordRequest, User } from './types';
import { normalizeAuthError, EMAIL_CONFIRMATION_REQUIRED_MESSAGE } from './errors';
import { mapSupabaseUser } from './supabase-user-mapper';
import { getPasswordRecoveryRedirectUrl } from '@/lib/supabase/config';

/** Application-level contract implemented by platform-specific authentication backends. */
export interface AuthAdapter {
  login: (credentials: LoginCredentials) => Promise<User>;
  signup: (credentials: SignupCredentials) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (request: ResetPasswordRequest) => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
}

type SupabaseAuthClient = Pick<
  SupabaseClient['auth'],
  'signInWithPassword' | 'signUp' | 'signOut' | 'resetPasswordForEmail' | 'getUser'
>;

type SupabaseAuthClientFactory = () => SupabaseAuthClient | Promise<SupabaseAuthClient>;
type PasswordRecoveryRedirectFactory = () => string;

function isMissingSessionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { code?: string; name?: string; message?: string };
  return (
    candidate.code === 'session_not_found' ||
    candidate.name === 'AuthSessionMissingError' ||
    candidate.message?.toLowerCase().includes('auth session missing') === true
  );
}

export class SupabaseAuthAdapter implements AuthAdapter {
  constructor(
    private readonly getAuthClient: SupabaseAuthClientFactory,
    private readonly getPasswordRecoveryRedirect: PasswordRecoveryRedirectFactory = getPasswordRecoveryRedirectUrl,
  ) {}

  async login(credentials: LoginCredentials): Promise<User> {
    let response;
    try {
      const authClient = await this.getAuthClient();
      response = await authClient.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
    } catch (error) {
      throw normalizeAuthError(error);
    }
    const { data, error } = response;

    if (error) throw normalizeAuthError(error);
    if (!data.user) throw normalizeAuthError();
    return mapSupabaseUser(data.user);
  }

  async signup(credentials: SignupCredentials): Promise<User> {
    let response;
    try {
      const authClient = await this.getAuthClient();
      response = await authClient.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.name,
          },
        },
      });
    } catch (error) {
      throw normalizeAuthError(error);
    }
    const { data, error } = response;

    if (error) throw normalizeAuthError(error);
    if (!data.user) throw normalizeAuthError();
    if (!data.session) throw new Error(EMAIL_CONFIRMATION_REQUIRED_MESSAGE);
    return mapSupabaseUser(data.user);
  }

  async logout(): Promise<void> {
    let response;
    try {
      const authClient = await this.getAuthClient();
      response = await authClient.signOut();
    } catch (error) {
      throw normalizeAuthError(error);
    }
    const { error } = response;
    if (error) throw normalizeAuthError(error);
  }

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    let response;
    try {
      const authClient = await this.getAuthClient();
      const redirectTo = this.getPasswordRecoveryRedirect();
      response = await authClient.resetPasswordForEmail(request.email, { redirectTo });
    } catch (error) {
      throw normalizeAuthError(error);
    }
    const { error } = response;
    if (error) throw normalizeAuthError(error);
  }

  async getCurrentUser(): Promise<User | null> {
    let response;
    try {
      const authClient = await this.getAuthClient();
      response = await authClient.getUser();
    } catch (error) {
      throw normalizeAuthError(error);
    }
    const { data, error } = response;
    if (error) {
      if (isMissingSessionError(error)) return null;
      throw normalizeAuthError(error);
    }
    return data.user ? mapSupabaseUser(data.user) : null;
  }
}

export const authAdapter: AuthAdapter = new SupabaseAuthAdapter(async () => {
  const { getSupabaseBrowserClient } = await import('@/lib/supabase/client');
  return getSupabaseBrowserClient().auth;
});
