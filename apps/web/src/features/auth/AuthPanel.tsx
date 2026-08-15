'use client';

import type { AuthView } from './auth.types';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { PasswordRecoveryRequestForm } from './PasswordRecoveryRequestForm';
import { IconButton } from '@paymentflow/ui';

export interface AuthPanelProps {
  view: AuthView;
  onClose: () => void;
  onViewChange: (view: Exclude<AuthView, 'closed'>) => void;
  panelId: string;
}

export function AuthPanel({ view, onClose, onViewChange, panelId }: AuthPanelProps) {
  const isOpen = view !== 'closed';

  return (
    <>
      <div className="lamplight__capsule" data-visible={!isOpen || undefined} aria-hidden={isOpen}>
        <LockIcon />
        <span className="lamplight__capsule-text">Secure access</span>
        <span className="lamplight__capsule-label">PaymentFlow authentication</span>
      </div>

      <div
        id={panelId}
        className={`lamplight__panel ${isOpen ? 'lamplight__panel--open' : ''}`}
        role="region"
        aria-label="Authentication"
        aria-hidden={!isOpen}
      >
        {isOpen && (
          <div className="lamplight__panel-header">
            <IconButton
              icon={<CloseIcon />}
              label="Close authentication panel"
              onClick={onClose}
              className="lamplight__close-btn"
              size="sm"
            />
          </div>
        )}

        <div className="lamplight__panel-content">
          {isOpen && (
            <div
              className="lamplight__form-container"
              data-direction={view === 'signup' ? 'forward' : 'backward'}
            >
              {view === 'signin' && (
                <SignInForm onForgotPassword={() => onViewChange('recovery')} />
              )}
              {view === 'signup' && <SignUpForm />}
              {view === 'recovery' && (
                <PasswordRecoveryRequestForm onBack={() => onViewChange('signin')} />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="4" y1="4" x2="12" y2="12" />
      <line x1="12" y1="4" x2="4" y2="12" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="lamplight__capsule-icon"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
