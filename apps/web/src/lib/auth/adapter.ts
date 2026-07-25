import type { LoginCredentials, SignupCredentials, ResetPasswordRequest, User } from './types';

/**
 * Contract for authentication backends.
 *
 * The active export (`authAdapter`) uses `PendingAuthAdapter` — a stub that
 * rejects every mutation with a user-facing message. Swap in a real
 * implementation (e.g. Supabase, Auth0, NestJS auth-service) when M1
 * backend work begins. No fake users, no localStorage, no demo passwords.
 */
export interface AuthAdapter {
  login: (credentials: LoginCredentials) => Promise<User>;
  signup: (credentials: SignupCredentials) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (request: ResetPasswordRequest) => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
}

const PENDING_MESSAGE = 'Authentication service integration is pending.';
const SIMULATED_LATENCY_MS = 600;

class PendingAuthAdapter implements AuthAdapter {
  private async reject(): Promise<never> {
    await new Promise((r) => setTimeout(r, SIMULATED_LATENCY_MS));
    throw new Error(PENDING_MESSAGE);
  }

  async login(_credentials: LoginCredentials): Promise<User> {
    return this.reject();
  }

  async signup(_credentials: SignupCredentials): Promise<User> {
    return this.reject();
  }

  async logout(): Promise<void> {
    return this.reject();
  }

  async resetPassword(_request: ResetPasswordRequest): Promise<void> {
    return this.reject();
  }

  async getCurrentUser(): Promise<User | null> {
    return null;
  }
}

export const authAdapter: AuthAdapter = new PendingAuthAdapter();
