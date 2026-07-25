import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('renders with an accessible label', () => {
    render(<IconButton icon={<span>X</span>} label="Close" />);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('defaults to type="button"', () => {
    render(<IconButton icon={<span>X</span>} label="Close" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('applies icon-btn base class', () => {
    render(<IconButton icon={<span>X</span>} label="Close" />);
    expect(screen.getByRole('button')).toHaveClass('icon-btn');
  });

  it('applies size classes', () => {
    const { rerender } = render(<IconButton icon={<span>X</span>} label="Close" size="sm" />);
    expect(screen.getByRole('button')).toHaveClass('icon-btn--sm');

    rerender(<IconButton icon={<span>X</span>} label="Close" size="lg" />);
    expect(screen.getByRole('button')).toHaveClass('icon-btn--lg');
  });

  it('calls onClick', () => {
    const handleClick = vi.fn();
    render(<IconButton icon={<span>X</span>} label="Close" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('appends custom className', () => {
    render(<IconButton icon={<span>X</span>} label="Close" className="extra" />);
    expect(screen.getByRole('button')).toHaveClass('icon-btn', 'extra');
  });

  it('forwards HTML attributes', () => {
    render(<IconButton icon={<span>X</span>} label="Close" data-testid="ib" />);
    expect(screen.getByTestId('ib')).toBeInTheDocument();
  });
});
