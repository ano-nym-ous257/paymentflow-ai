import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LamplightAuth } from './LamplightAuth';
import { AuthProvider } from '@/providers/auth-provider';

function renderWithProviders(ui: React.ReactElement) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

describe('LamplightAuth', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('state machine', () => {
    it('starts in closed state', () => {
      const { container } = renderWithProviders(<LamplightAuth initialMode="signin" />);
      const panel = container.querySelector('[role="region"][aria-label="Authentication"]');
      expect(panel).toHaveAttribute('aria-hidden', 'true');
    });

    it('opens to initialMode=signin on first pull', () => {
      renderWithProviders(<LamplightAuth initialMode="signin" />);
      const pullButton = screen.getByLabelText('Open sign in form');
      fireEvent.click(pullButton);
      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(screen.getByText('Sign in to PaymentFlow')).toBeInTheDocument();
    });

    it('opens to initialMode=signup on first pull', () => {
      renderWithProviders(<LamplightAuth initialMode="signup" />);
      const pullButton = screen.getByLabelText('Open sign up form');
      fireEvent.click(pullButton);
      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(screen.getByText('Create your account')).toBeInTheDocument();
    });

    it('switches from signin to signup on second pull', () => {
      renderWithProviders(<LamplightAuth initialMode="signin" />);
      const pullButton = screen.getByLabelText('Open sign in form');
      fireEvent.click(pullButton);
      act(() => {
        vi.advanceTimersByTime(350);
      });

      const switchButton = screen.getByLabelText('Switch to sign up');
      fireEvent.click(switchButton);
      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(screen.getByText('Create your account')).toBeInTheDocument();
    });

    it('switches from signup to signin on pull', () => {
      renderWithProviders(<LamplightAuth initialMode="signup" />);
      const pullButton = screen.getByLabelText('Open sign up form');
      fireEvent.click(pullButton);
      act(() => {
        vi.advanceTimersByTime(350);
      });

      const switchButton = screen.getByLabelText('Switch to sign in');
      fireEvent.click(switchButton);
      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(screen.getByText('Sign in to PaymentFlow')).toBeInTheDocument();
    });

    it('pull cord never closes the panel', () => {
      renderWithProviders(<LamplightAuth initialMode="signin" />);
      const pullButton = screen.getByLabelText('Open sign in form');
      fireEvent.click(pullButton);
      act(() => {
        vi.advanceTimersByTime(350);
      });

      const switchButton = screen.getByLabelText('Switch to sign up');
      fireEvent.click(switchButton);
      act(() => {
        vi.advanceTimersByTime(350);
      });

      const switchBack = screen.getByLabelText('Switch to sign in');
      fireEvent.click(switchBack);
      act(() => {
        vi.advanceTimersByTime(350);
      });

      const panel = screen.getByRole('region', { name: 'Authentication' });
      expect(panel).toHaveAttribute('aria-hidden', 'false');
    });
  });

  describe('close button', () => {
    it('closes the panel when close button is clicked', () => {
      const { container } = renderWithProviders(<LamplightAuth initialMode="signin" />);
      fireEvent.click(screen.getByLabelText('Open sign in form'));
      act(() => {
        vi.advanceTimersByTime(350);
      });

      fireEvent.click(screen.getByLabelText('Close authentication panel'));
      const panel = container.querySelector('[role="region"][aria-label="Authentication"]');
      expect(panel).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('capsule', () => {
    it('shows capsule when panel is closed', () => {
      renderWithProviders(<LamplightAuth initialMode="signin" />);
      const capsule = screen.getByText('PaymentFlow');
      expect(capsule.parentElement).toHaveAttribute('data-visible', 'true');
    });

    it('hides capsule when panel is open', () => {
      renderWithProviders(<LamplightAuth initialMode="signin" />);
      fireEvent.click(screen.getByLabelText('Open sign in form'));
      act(() => {
        vi.advanceTimersByTime(350);
      });
      const capsule = screen.getByText('PaymentFlow');
      expect(capsule.parentElement).not.toHaveAttribute('data-visible');
    });
  });

  describe('pull cord accessibility', () => {
    it('has descriptive aria-label when closed', () => {
      renderWithProviders(<LamplightAuth initialMode="signin" />);
      expect(screen.getByLabelText('Open sign in form')).toBeInTheDocument();
    });

    it('updates aria-label to show switch target when open on signin', () => {
      renderWithProviders(<LamplightAuth initialMode="signin" />);
      fireEvent.click(screen.getByLabelText('Open sign in form'));
      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(screen.getByLabelText('Switch to sign up')).toBeInTheDocument();
    });

    it('updates aria-label to show switch target when open on signup', () => {
      renderWithProviders(<LamplightAuth initialMode="signup" />);
      fireEvent.click(screen.getByLabelText('Open sign up form'));
      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(screen.getByLabelText('Switch to sign in')).toBeInTheDocument();
    });
  });

  describe('pulling animation', () => {
    it('sets pulling state on pull', () => {
      const { container } = renderWithProviders(<LamplightAuth initialMode="signin" />);
      fireEvent.click(screen.getByLabelText('Open sign in form'));
      expect(container.querySelector('.lamplight')).toHaveAttribute('data-pulling', 'true');
    });

    it('clears pulling state after animation delay', () => {
      const { container } = renderWithProviders(<LamplightAuth initialMode="signin" />);
      fireEvent.click(screen.getByLabelText('Open sign in form'));
      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(container.querySelector('.lamplight')).not.toHaveAttribute('data-pulling');
    });
  });

  describe('password toggle', () => {
    it('password toggle is keyboard accessible (no negative tabIndex)', () => {
      renderWithProviders(<LamplightAuth initialMode="signin" />);
      fireEvent.click(screen.getByLabelText('Open sign in form'));
      act(() => {
        vi.advanceTimersByTime(350);
      });
      const toggle = screen.getByLabelText('Show password');
      expect(toggle).not.toHaveAttribute('tabindex', '-1');
      expect(toggle.tagName).toBe('BUTTON');
    });
  });
});
