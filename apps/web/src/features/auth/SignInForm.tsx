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

  const isPending = error === 'Authentication service integration is pending.';

  return (
    <form className="lamplight__form" onSubmit={handleSubmit} noValidate>
      <p className="lamplight__form-eyebrow">SECURE ACCESS</p>
      <h2 className="lamplight__form-title">Welcome back</h2>
      <p className="lamplight__form-subtitle">Sign in to your PaymentFlow workspace</p>

      {error && !isPending && (
        <Alert variant="error" className="lamplight__form-alert">
          {error}
        </Alert>
      )}
      {isPending && (
        <Alert variant="info" className="lamplight__form-alert">
          Authentication service integration is pending.
        </Alert>
      )}

      <div className="lamplight__form-fields">
        <Input
          label="Email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError();
          }}
          error={fieldErrors['email']}
        />
        <PasswordField
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError();
          }}
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
    </form>
  );
}
