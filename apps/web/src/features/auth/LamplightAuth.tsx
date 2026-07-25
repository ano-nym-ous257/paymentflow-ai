'use client';

import { useState, useCallback } from 'react';
import { Lamplight } from './Lamplight';
import { AuthPanel } from './AuthPanel';

export type AuthView = 'closed' | 'signin' | 'signup';

export interface LamplightAuthProps {
  initialMode: 'signin' | 'signup';
}

export function LamplightAuth({ initialMode }: LamplightAuthProps) {
  const [view, setView] = useState<AuthView>('closed');
  const [isPulling, setIsPulling] = useState(false);

  const handlePull = useCallback(() => {
    setIsPulling(true);
    const timeout = setTimeout(() => {
      setIsPulling(false);
      setView((current) => {
        if (current === 'closed') return initialMode;
        if (current === 'signin') return 'signup';
        return 'signin';
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [initialMode]);

  const handleClose = useCallback(() => {
    setView('closed');
  }, []);

  const isOpen = view !== 'closed';

  const pullLabel =
    view === 'closed'
      ? `Open ${initialMode === 'signin' ? 'sign in' : 'sign up'} form`
      : view === 'signin'
        ? 'Switch to sign up'
        : 'Switch to sign in';

  return (
    <div className="lamplight" data-state={view} data-pulling={isPulling || undefined}>
      <Lamplight isOn={isOpen} isPulling={isPulling} onPull={handlePull} pullLabel={pullLabel} />
      <AuthPanel view={view} onClose={handleClose} />
    </div>
  );
}
