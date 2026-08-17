import type { AuthenticatedUser } from '@/lib/auth/types';
import type { UserProfile } from './types';

export function getIdentityDisplayName(
  profile: UserProfile | null,
  user: AuthenticatedUser | null,
): string {
  const profileName = profile?.displayName.trim();
  if (profileName) return profileName;

  const emailName = user?.email.split('@')[0]?.trim();
  return emailName || 'PaymentFlow user';
}

export function getIdentityInitials(displayName: string): string {
  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'PF';
}
