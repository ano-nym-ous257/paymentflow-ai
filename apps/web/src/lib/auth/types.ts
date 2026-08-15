/**
 * Authentication types for PaymentFlow AI
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'analyst' | 'viewer';
  organization: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  organization?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  password: string;
}

export type AuthActionResult = { success: true } | { success: false; error: string };

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (request: ResetPasswordRequest) => Promise<AuthActionResult>;
  initializePasswordRecovery: () => Promise<AuthActionResult>;
  updatePassword: (request: UpdatePasswordRequest) => Promise<AuthActionResult>;
  clearError: () => void;
}
