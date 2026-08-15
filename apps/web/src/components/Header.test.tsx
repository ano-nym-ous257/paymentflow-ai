import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

const { logout } = vi.hoisted(() => ({ logout: vi.fn() }));

vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => ({ logout }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Header logout control', () => {
  beforeEach(() => {
    logout.mockReset();
  });

  it('exposes logout to an authenticated workspace user', () => {
    render(<Header onMenuToggle={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Log out' })).toBeEnabled();
  });

  it('calls the existing authentication context logout action', () => {
    logout.mockResolvedValue(undefined);
    render(<Header onMenuToggle={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(logout).toHaveBeenCalledOnce();
  });

  it('prevents duplicate activation while logout is pending', () => {
    logout.mockReturnValue(new Promise(() => {}));
    render(<Header onMenuToggle={vi.fn()} />);
    const logoutButton = screen.getByRole('button', { name: 'Log out' });

    fireEvent.click(logoutButton);
    fireEvent.click(logoutButton);

    expect(logout).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Logging out…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Logging out…' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });
});
