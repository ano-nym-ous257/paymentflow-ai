'use client';

import { useCallback, useRef, useState, type FormEvent } from 'react';
import { Alert, Button, Input } from '@paymentflow/ui';
import { validateEmail } from '@/lib/auth/validation';
import { useAuth } from '@/providers/auth-provider';

const NEUTRAL_CONFIRMATION =
  'If an account exists for this email, we’ve sent password recovery instructions.';

export interface PasswordRecoveryRequestFormProps {
  onBack: () => void;
}

export function PasswordRecoveryRequestForm({ onBack }: PasswordRecoveryRequestFormProps) {
  const { resetPassword, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [requestError, setRequestError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const submissionPending = useRef(false);

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (submissionPending.current) return;

      const validationError = validateEmail(email);
      setEmailError(validationError ?? undefined);
      setRequestError('');
      if (validationError) return;

      submissionPending.current = true;
      setIsSubmitting(true);
      const result = await resetPassword({ email });
      if (result.success) {
        setIsComplete(true);
      } else {
        submissionPending.current = false;
        setIsSubmitting(false);
        setRequestError(result.error);
      }
    },
    [email, resetPassword],
  );

  const handleBack = useCallback(() => {
    clearError();
    onBack();
  }, [clearError, onBack]);

  if (isComplete) {
    return (
      <div className="lamplight__form">
        <p className="lamplight__form-eyebrow">PASSWORD RECOVERY</p>
        <h2 className="lamplight__form-title">Check your email</h2>
        <Alert variant="success" className="lamplight__form-alert">
          {NEUTRAL_CONFIRMATION}
        </Alert>
        <button type="button" className="lamplight__text-action" onClick={handleBack}>
          Return to sign in
        </button>
      </div>
    );
  }

  return (
    <form className="lamplight__form" onSubmit={handleSubmit} noValidate>
      <p className="lamplight__form-eyebrow">PASSWORD RECOVERY</p>
      <h2 className="lamplight__form-title">Reset your password</h2>
      <p className="lamplight__form-subtitle">
        Enter your email and we’ll send recovery instructions.
      </p>
      {requestError && (
        <Alert variant="error" className="lamplight__form-alert">
          {requestError}
        </Alert>
      )}
      <div className="lamplight__form-fields">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setEmailError(undefined);
            clearError();
          }}
          error={emailError}
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        interaction="stretch"
        fullWidth
        loading={isSubmitting}
        loadingText="Sending instructions…"
      >
        Send recovery instructions
      </Button>
      <button type="button" className="lamplight__text-action" onClick={handleBack}>
        Return to sign in
      </button>
    </form>
  );
}
