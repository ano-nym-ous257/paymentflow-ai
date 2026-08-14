'use client';

import { ThemeToggle } from '@/features/auth/ThemeToggle';
import { AuthGuard } from '@/providers/auth-route-guards';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="auth-layout">
        <div className="auth-layout__theme-toggle">
          <ThemeToggle />
        </div>
        <div className="auth-layout__brand">
          <div className="auth-layout__brand-content">
            <div className="auth-layout__logo-mark">PF</div>
            <h1 className="auth-layout__wordmark">PaymentFlow AI</h1>
            <p className="auth-layout__eyebrow-text">INTELLIGENT FINANCIAL OPERATIONS</p>
            <p className="auth-layout__headline">Financial operations, illuminated.</p>
            <p className="auth-layout__tagline">
              Manage payments, wallets, approvals, and intelligent financial workflows from one
              secure workspace.
            </p>
            <div className="auth-layout__trust-indicators">
              <div className="auth-layout__trust-item">
                <ShieldIcon />
                <span>Secure workspace</span>
              </div>
              <div className="auth-layout__trust-item">
                <CheckIcon />
                <span>Human-approved actions</span>
              </div>
              <div className="auth-layout__trust-item">
                <SparkleIcon />
                <span>AI-assisted operations</span>
              </div>
            </div>
          </div>
        </div>
        <div className="auth-layout__container">{children}</div>
      </div>
    </AuthGuard>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
