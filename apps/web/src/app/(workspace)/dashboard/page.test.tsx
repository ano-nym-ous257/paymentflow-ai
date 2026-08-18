import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses local time while preserving the application profile display name', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 18, 15, 30));

    render(<DashboardPage />);

    expect(
      screen.getByRole('heading', { name: 'Good afternoon, Ada Lovelace' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Tuesday, August 18, 2026/)).toBeInTheDocument();
    expect(screen.queryByText(/Michael/)).not.toBeInTheDocument();
  });

  it('does not retain the hard-coded greeting or July 16, 2026 date', () => {
    const source = readFileSync(__filename.replace(/\.test\.tsx$/, '.tsx'), 'utf8');

    expect(source).not.toContain('Wednesday, July 16, 2026');
    expect(source).not.toMatch(/Good morning,\s*\{displayName\}/);
  });
});
