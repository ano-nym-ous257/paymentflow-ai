import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  LoginCredentials,
  SignupCredentials,
  ResetPasswordRequest,
  UpdatePasswordRequest,
  AuthenticatedUser,
} from './types';
import {
  normalizeAuthError,
  EMAIL_CONFIRMATION_REQUIRED_MESSAGE,
  INVALID_RECOVERY_SESSION_MESSAGE,
} from './errors';
import { mapSupabaseUser } from './supabase-user-mapper';
import { getPasswordRecoveryRedirectUrl } from '@/lib/supabase/config';

/** Application-level contract implemented by platform-specific authentication backends. */
export interface AuthAdapter {
  login: (credentials: LoginCredentials) => Promise<AuthenticatedUser>;
  signup: (credentials: SignupCredentials) => Promise<AuthenticatedUser>;
  logout: () => Promise<void>;
  resetPassword: (request: ResetPasswordRequest) => Promise<void>;
  initializePasswordRecovery: () => Promise<void>;
  updatePassword: (request: UpdatePasswordRequest) => Promise<void>;
  getCurrentUser: () => Promise<AuthenticatedUser | null>;
}

type SupabaseAuthClient = Pick<
  SupabaseClient['auth'],
  | 'signInWithPassword'
  | 'signUp'
  | 'signOut'
  | 'resetPasswordForEmail'
  | 'getUser'
  | 'onAuthStateChange'
  | 'updateUser'
>;

type SupabaseAuthClientFactory = () => SupabaseAuthClient | Promise<SupabaseAuthClient>;
type PasswordRecoveryRedirectFactory = () => string;
const RECOVERY_INITIALIZATION_TIMEOUT_MS = 5000;

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

  async login(credentials: LoginCredentials): Promise<AuthenticatedUser> {
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

  async signup(credentials: SignupCredentials): Promise<AuthenticatedUser> {
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

  async initializePasswordRecovery(): Promise<void> {
    let authClient: SupabaseAuthClient;
    try {
      authClient = await this.getAuthClient();
    } catch (error) {
      throw normalizeAuthError(error);
    }

    return new Promise((resolve, reject) => {
      let settled = false;
      let unsubscribe: (() => void) | undefined;
      const finish = (error?: Error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        unsubscribe?.();
        if (error) reject(error);
        else resolve();
      };
      const timeoutId = window.setTimeout(
        () => finish(new Error(INVALID_RECOVERY_SESSION_MESSAGE)),
        RECOVERY_INITIALIZATION_TIMEOUT_MS,
      );

      const { data } = authClient.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' && session) {
          finish();
        } else if (event === 'SIGNED_OUT') {
          finish(new Error(INVALID_RECOVERY_SESSION_MESSAGE));
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
      if (settled) unsubscribe();
    });
  }

  async updatePassword(request: UpdatePasswordRequest): Promise<void> {
    let authClient: SupabaseAuthClient;
    try {
      authClient = await this.getAuthClient();
      const { error } = await authClient.updateUser({ password: request.password });
      if (error) throw error;
    } catch (error) {
      throw normalizeAuthError(error);
    }

    try {
      await authClient.signOut();
    } catch {
      // The password is already updated; recovery-session cleanup is best effort.
    }
  }

  async getCurrentUser(): Promise<AuthenticatedUser | null> {
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
