import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DashboardPage from './page';

vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'owner@example.com', createdAt: '' },
  }),
}));

vi.mock('@/providers/profile-provider', () => ({
  useProfile: () => ({
    status: 'available',
    profile: {
      id: 'user-1',
      displayName: 'Ada Lovelace',
      avatarUrl: null,
      status: 'active',
      createdAt: '',
      updatedAt: '',
    },
    error: null,
  }),
}));

describe('DashboardPage identity', () => {
  it('greets the application profile instead of a hard-coded user', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('heading', { name: 'Good morning, Ada Lovelace' })).toBeInTheDocument();
    expect(screen.queryByText(/Michael/)).not.toBeInTheDocument();
  });
});
