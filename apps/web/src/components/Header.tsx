'use client';

import Link from 'next/link';

export interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="shell__header header" role="banner">
      <div className="header__inner">
        <div className="header__left">
          <button
            type="button"
            className="header__menu-btn"
            onClick={onMenuToggle}
            aria-label="Toggle navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M3 5h14M3 10h14M3 15h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <Link href="/dashboard" className="header__logo">
            <span className="header__logo-text">PaymentFlow</span>
            <span className="header__logo-accent">AI</span>
          </Link>
        </div>
        <div className="header__actions">
          <div className="header__search" aria-label="Search">
            <span className="header__search-placeholder">Search...</span>
          </div>
          <button type="button" className="header__icon-btn" aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M10 2a6 6 0 00-6 6v3l-1 2h14l-1-2V8a6 6 0 00-6-6zM8.5 17a1.5 1.5 0 003 0"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="header__avatar" role="img" aria-label="User menu">
            <span className="header__avatar-initials">U</span>
          </div>
        </div>
      </div>
    </header>
  );
}
