'use client';

import { useState, useCallback } from 'react';
import type { AuthView } from './auth.types';
import { Lamplight } from './Lamplight';
import { AuthPanel } from './AuthPanel';
import { useAuth } from '@/providers/auth-provider';

export type { AuthView } from './auth.types';

export interface LamplightAuthProps {
  initialMode: 'signin' | 'signup';
}

const PANEL_ID = 'lamplight-auth-panel';

export function LamplightAuth({ initialMode }: LamplightAuthProps) {
  const [view, setView] = useState<AuthView>('closed');
  const [isPulling, setIsPulling] = useState(false);
  const { clearError } = useAuth();

  const handlePull = useCallback(() => {
    setIsPulling(true);
    const timeout = setTimeout(() => {
      setIsPulling(false);
      clearError();
      setView((current) => {
        if (current === 'closed') return initialMode;
        if (current === 'signin') return 'signup';
        return 'signin';
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [initialMode, clearError]);

  const handleClose = useCallback(() => {
    clearError();
    setView('closed');
  }, [clearError]);

  const handleViewChange = useCallback(
    (nextView: Exclude<AuthView, 'closed'>) => {
      clearError();
      setView(nextView);
    },
    [clearError],
  );

  const isOpen = view !== 'closed';

  const pullLabel =
    view === 'closed'
      ? `Open ${initialMode === 'signin' ? 'sign in' : 'sign up'} form`
      : view === 'signin'
        ? 'Switch to sign up'
        : 'Switch to sign in';

  return (
    <div className="lamplight" data-state={view} data-pulling={isPulling || undefined}>
      <Lamplight
        isOn={isOpen}
        isPulling={isPulling}
        onPull={handlePull}
        pullLabel={pullLabel}
        view={view}
        panelId={PANEL_ID}
      />
      <AuthPanel
        view={view}
        onClose={handleClose}
        onViewChange={handleViewChange}
        panelId={PANEL_ID}
      />
    </div>
  );
}
