'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { Button, Input, Alert } from '@paymentflow/ui';
import { PasswordField } from './PasswordField';
import { validateLoginForm } from '@/lib/auth/validation';
import { useAuth } from '@/providers/auth-provider';

export function SignInForm() {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      clearError();
      const result = validateLoginForm(email, password);
      if (!result.valid) {
        setFieldErrors(result.errors);
        return;
      }
      setFieldErrors({});
      await login({ email, password });
    },
    [email, password, login, clearError],
  );

  return (
    <form className="lamplight__form" onSubmit={handleSubmit} noValidate>
      <h2 className="lamplight__form-title">Sign in to PaymentFlow</h2>
      <p className="lamplight__form-subtitle">Enter your credentials to access your account</p>

      {error && (
        <Alert variant="error" className="lamplight__form-alert">
          {error}
        </Alert>
      )}

      <div className="lamplight__form-fields">
        <Input
          label="Email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors['email']}
        />
        <PasswordField
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors['password']}
        />
      </div>

      <Button
        variant="primary"
        size="lg"
        interaction="stretch"
        fullWidth
        type="submit"
        loading={isLoading}
        loadingText="Signing in..."
      >
        Sign In
      </Button>

      <p className="lamplight__form-hint">Pull the cord above to switch to sign up</p>
    </form>
  );
}
