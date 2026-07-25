'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  AuthContextValue,
  AuthState,
  LoginCredentials,
  SignupCredentials,
  ResetPasswordRequest,
} from '@/lib/auth/types';
import { authAdapter } from '@/lib/auth/adapter';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);

  const clearError = useCallback(() => {
    setState((prev: AuthState) => ({ ...prev, error: null }));
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await authAdapter.login(credentials);
      setState({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setState((prev: AuthState) => ({ ...prev, isLoading: false, error: message }));
    }
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await authAdapter.signup(credentials);
      setState({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setState((prev: AuthState) => ({ ...prev, isLoading: false, error: message }));
    }
  }, []);

  const logout = useCallback(() => {
    authAdapter.logout().catch(() => {});
    setState(initialState);
  }, []);

  const resetPassword = useCallback(async (request: ResetPasswordRequest) => {
    setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));
    try {
      await authAdapter.resetPassword(request);
      setState((prev: AuthState) => ({ ...prev, isLoading: false }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setState((prev: AuthState) => ({ ...prev, isLoading: false, error: message }));
    }
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    signup,
    logout,
    resetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
