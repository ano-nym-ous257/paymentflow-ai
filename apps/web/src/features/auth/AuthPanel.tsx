'use client';

import type { AuthView } from './LamplightAuth';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { IconButton } from '@paymentflow/ui';

export interface AuthPanelProps {
  view: AuthView;
  onClose: () => void;
}

export function AuthPanel({ view, onClose }: AuthPanelProps) {
  const isOpen = view !== 'closed';

  return (
    <div
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
        <div
          className="lamplight__capsule"
          data-visible={!isOpen || undefined}
          aria-hidden={isOpen}
        >
          <span className="lamplight__capsule-text">PaymentFlow</span>
        </div>

        {isOpen && (
          <div
            className="lamplight__form-container"
            data-direction={view === 'signup' ? 'forward' : 'backward'}
          >
            {view === 'signin' && <SignInForm />}
            {view === 'signup' && <SignUpForm />}
          </div>
        )}
      </div>
    </div>
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
