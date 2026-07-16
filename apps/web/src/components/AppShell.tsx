'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header onMenuToggle={handleToggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
      {sidebarOpen && (
        <div
          className="shell__overlay"
          onClick={handleCloseSidebar}
          onKeyDown={undefined}
          role="presentation"
        />
      )}
      <main id="main-content" className="shell__main" role="main">
        {children}
      </main>
    </div>
  );
}
