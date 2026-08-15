'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';

export interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { logout } = useAuth();
  const logoutInProgress = useRef(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (logoutInProgress.current) return;
    logoutInProgress.current = true;
    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      logoutInProgress.current = false;
      setIsLoggingOut(false);
    }
  }, [logout]);

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
          <button type="button" className="header__search" aria-label="Search">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              aria-hidden="true"
              className="header__search-icon"
            >
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3" />
              <path
                d="M10 10l3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            <span className="header__search-text">Search&hellip;</span>
            <kbd className="header__search-kbd">
              <span aria-hidden="true">&#8984;</span>K
            </kbd>
          </button>
          <button
            type="button"
            className="header__icon-btn header__notif-btn"
            aria-label="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M9 2a5 5 0 00-5 5v2.5l-1 2h12l-1-2V7a5 5 0 00-5-5z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
              <path
                d="M7.5 15a1.5 1.5 0 003 0"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            <span className="header__notif-dot" aria-label="3 unread notifications" />
          </button>
          <button type="button" className="header__avatar" aria-label="User menu">
            <span className="header__avatar-initials">MR</span>
          </button>
          <button
            type="button"
            className="header__logout"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            aria-busy={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      </div>
    </header>
  );
}
