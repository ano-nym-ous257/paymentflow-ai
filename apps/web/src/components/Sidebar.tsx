'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  readonly href: string;
  readonly label: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/wallets', label: 'Wallets' },
  { href: '/payments', label: 'Payments' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/exchange-rates', label: 'Exchange Rates' },
  { href: '/settings', label: 'Settings' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`shell__sidebar sidebar${isOpen ? ' sidebar--open' : ''}`}
      aria-label="Main navigation"
    >
      <button
        type="button"
        className="sidebar__close-btn"
        onClick={onClose}
        aria-label="Close navigation"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <nav className="sidebar__nav">
        <ul className="sidebar__list" role="list">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="sidebar__label">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
