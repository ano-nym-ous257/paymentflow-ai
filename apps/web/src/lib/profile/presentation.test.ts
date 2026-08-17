import { describe, expect, it } from 'vitest';
import { getIdentityDisplayName, getIdentityInitials } from './presentation';

describe('profile presentation', () => {
  it('uses application profile identity and derives initials', () => {
    const profile = {
      id: 'user-1',
      displayName: 'Ada Lovelace',
      avatarUrl: null,
      status: 'active' as const,
      createdAt: '',
      updatedAt: '',
    };
    const user = { id: 'user-1', email: 'owner@example.com', createdAt: '' };

    expect(getIdentityDisplayName(profile, user)).toBe('Ada Lovelace');
    expect(getIdentityInitials('Ada Lovelace')).toBe('AL');
  });

  it('falls back to authentication email without manufacturing role or organization data', () => {
    const user = { id: 'user-1', email: 'owner@example.com', createdAt: '' };
    expect(getIdentityDisplayName(null, user)).toBe('owner');
    expect(user).not.toHaveProperty('role');
    expect(user).not.toHaveProperty('organization');
  });
});
