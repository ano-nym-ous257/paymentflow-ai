'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { Button, Input, Checkbox, Alert } from '@paymentflow/ui';
import { PasswordField } from './PasswordField';
import { validateSignupForm } from '@/lib/auth/validation';
import { useAuth } from '@/providers/auth-provider';

export function SignUpForm() {
  const { signup, isLoading, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      clearError();

      const result = validateSignupForm(name, email, password, confirmPassword);
      if (!result.valid) {
        setFieldErrors(result.errors);
        return;
      }
      if (!acceptedTerms) {
        setFieldErrors({ terms: 'You must accept the terms and conditions' });
        return;
      }
      setFieldErrors({});
      await signup({ name, email, password });
    },
    [name, email, password, confirmPassword, acceptedTerms, signup, clearError],
  );

  return (
    <form className="lamplight__form" onSubmit={handleSubmit} noValidate>
      <h2 className="lamplight__form-title">Create your account</h2>
      <p className="lamplight__form-subtitle">Start managing your payments today</p>

      {error && (
        <Alert variant="error" className="lamplight__form-alert">
          {error}
        </Alert>
      )}

      <div className="lamplight__form-fields">
        <Input
          label="Full Name"
          type="text"
          placeholder="Jane Smith"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors['name']}
        />
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
          placeholder="At least 12 characters"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors['password']}
          hint="Must be at least 12 characters"
        />
        <PasswordField
          label="Confirm Password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors['confirmPassword']}
        />
        <Checkbox
          label="I agree to the Terms of Service and Privacy Policy"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          error={fieldErrors['terms']}
        />
      </div>

      <Button
        variant="primary"
        size="lg"
        interaction="stretch"
        fullWidth
        type="submit"
        loading={isLoading}
        loadingText="Creating account..."
      >
        Create Account
      </Button>

      <p className="lamplight__form-hint">Pull the cord above to switch to sign in</p>
    </form>
  );
}
