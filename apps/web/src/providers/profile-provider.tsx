'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ProfileRepository } from '@/lib/profile/repository';
import { profileRepository } from '@/lib/profile/repository';
import type { ProfileState } from '@/lib/profile/types';
import { useAuth } from './auth-provider';

const initialState: ProfileState = { status: 'unresolved', profile: null, error: null };
const unauthenticatedState: ProfileState = {
  status: 'unauthenticated',
  profile: null,
  error: null,
};

const ProfileContext = createContext<ProfileState | null>(null);

export interface ProfileProviderProps {
  children: ReactNode;
  repository?: ProfileRepository;
}

export function ProfileProvider({
  children,
  repository = profileRepository,
}: ProfileProviderProps) {
  const { user, isInitializing } = useAuth();
  const [state, setState] = useState<ProfileState>(initialState);

  useEffect(() => {
    let active = true;

    if (isInitializing) {
      setState(initialState);
      return () => {
        active = false;
      };
    }

    if (!user) {
      setState(unauthenticatedState);
      return () => {
        active = false;
      };
    }

    setState({ status: 'loading', profile: null, error: null });
    repository
      .getByAuthenticatedUserId(user.id)
      .then((profile) => {
        if (!active) return;
        setState(
          profile
            ? { status: 'available', profile, error: null }
            : { status: 'missing', profile: null, error: null },
        );
      })
      .catch(() => {
        if (active) {
          setState({
            status: 'error',
            profile: null,
            error: 'Your profile is temporarily unavailable. Please try again.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [isInitializing, repository, user]);

  return <ProfileContext.Provider value={state}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileState {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
}
