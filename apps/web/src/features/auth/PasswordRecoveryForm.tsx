'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Alert, Button } from '@paymentflow/ui';
import { useAuth } from '@/providers/auth-provider';
import { validatePassword } from '@/lib/auth/validation';
import { PasswordField } from './PasswordField';

type RecoveryStatus = 'checking' | 'valid' | 'invalid' | 'success';

export function PasswordRecoveryForm() {
  const { initializePasswordRecovery, updatePassword, isLoading } = useAuth();
  const [status, setStatus] = useState<RecoveryStatus>('checking');
  const [recoveryError, setRecoveryError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const submissionPending = useRef(false);
  const didInitialize = useRef(false);

  useEffect(() => {
    if (didInitialize.current) return;
    didInitialize.current = true;
    void initializePasswordRecovery().then((result) => {
      if (result.success) setStatus('valid');
      else {
        setRecoveryError(result.error);
        setStatus('invalid');
      }
    });
  }, [initializePasswordRecovery]);

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (submissionPending.current) return;

      const passwordError = validatePassword(password);
      const errors: Record<string, string> = {};
      if (passwordError) errors['password'] = passwordError;
      if (!confirmPassword) errors['confirmPassword'] = 'Please confirm your password';
      else if (password !== confirmPassword) errors['confirmPassword'] = 'Passwords do not match';
      setFieldErrors(errors);
      setRecoveryError('');
      if (Object.keys(errors).length > 0) return;

      submissionPending.current = true;
      const result = await updatePassword({ password });
      if (result.success) setStatus('success');
      else {
        submissionPending.current = false;
        setRecoveryError(result.error);
      }
    },
    [confirmPassword, password, updatePassword],
  );

  if (status === 'checking') {
    return (
      <div role="status" aria-live="polite" className="password-recovery__status">
        Validating your recovery link…
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="lamplight__form">
        <p className="lamplight__form-eyebrow">PASSWORD RECOVERY</p>
        <h1 className="lamplight__form-title">Recovery link unavailable</h1>
        <Alert variant="error" className="lamplight__form-alert">
          {recoveryError}
        </Alert>
        <Link href="/login" className="password-recovery__link">
          Return to sign in
        </Link>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="lamplight__form">
        <p className="lamplight__form-eyebrow">PASSWORD UPDATED</p>
        <h1 className="lamplight__form-title">Your password has been updated</h1>
        <Alert variant="success" className="lamplight__form-alert">
          Sign in with your new password to continue.
        </Alert>
        <Link href="/login" className="password-recovery__link">
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <form className="lamplight__form" onSubmit={handleSubmit} noValidate>
      <p className="lamplight__form-eyebrow">PASSWORD RECOVERY</p>
      <h1 className="lamplight__form-title">Choose a new password</h1>
      <p className="lamplight__form-subtitle">Use at least 12 characters.</p>
      {recoveryError && (
        <Alert variant="error" className="lamplight__form-alert">
          {recoveryError}
        </Alert>
      )}
      <div className="lamplight__form-fields">
        <PasswordField
          label="New password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors['password']}
          hint="Must be at least 12 characters"
        />
        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={fieldErrors['confirmPassword']}
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        interaction="stretch"
        fullWidth
        loading={isLoading || submissionPending.current}
        loadingText="Updating password…"
      >
        Update password
      </Button>
    </form>
  );
}
