'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { Button, Input, Checkbox, Alert } from '@paymentflow/ui';
import { PasswordField } from './PasswordField';
import { validateSignupForm } from '@/lib/auth/validation';
import { useAuth } from '@/providers/auth-provider';
import { EMAIL_CONFIRMATION_REQUIRED_MESSAGE } from '@/lib/auth/errors';

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

  const isPending = error === 'Authentication service integration is pending.';
  const isConfirmationRequired = error === EMAIL_CONFIRMATION_REQUIRED_MESSAGE;

  return (
    <form className="lamplight__form" onSubmit={handleSubmit} noValidate>
      <p className="lamplight__form-eyebrow">NEW WORKSPACE</p>
      <h2 className="lamplight__form-title">Create your workspace</h2>
      <p className="lamplight__form-subtitle">Start managing payments in minutes</p>

      {error && !isPending && !isConfirmationRequired && (
        <Alert variant="error" className="lamplight__form-alert">
          {error}
        </Alert>
      )}
      {isConfirmationRequired && (
        <Alert variant="info" className="lamplight__form-alert">
          {EMAIL_CONFIRMATION_REQUIRED_MESSAGE}
        </Alert>
      )}
      {isPending && (
        <Alert variant="info" className="lamplight__form-alert">
          Authentication service integration is pending.
        </Alert>
      )}

      <div className="lamplight__form-fields">
        <Input
          label="Full Name"
          type="text"
          placeholder="Jane Smith"
          autoComplete="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearError();
          }}
          error={fieldErrors['name']}
        />
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
          placeholder="Create a secure password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError();
          }}
          error={fieldErrors['password']}
          hint="Must be at least 12 characters"
        />
        <PasswordField
          label="Confirm Password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearError();
          }}
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
    </form>
  );
}
