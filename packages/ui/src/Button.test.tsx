import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  describe('rendering', () => {
    it('renders children text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders with base btn class', () => {
      render(<Button>Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn');
    });

    it('defaults to type="button"', () => {
      render(<Button>Test</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('allows type="submit" override', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('forwards HTML attributes', () => {
      render(
        <Button data-testid="custom" aria-label="custom label">
          Test
        </Button>,
      );
      const btn = screen.getByRole('button');
      expect(btn).toHaveAttribute('data-testid', 'custom');
      expect(btn).toHaveAttribute('aria-label', 'custom label');
    });

    it('appends custom className without overriding base classes', () => {
      render(<Button className="my-custom">Styled</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toHaveClass('btn', 'btn--primary', 'my-custom');
    });
  });

  describe('variants', () => {
    it('applies primary variant by default', () => {
      render(<Button>Primary</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--primary');
    });

    it.each([
      ['primary', 'btn--primary'],
      ['secondary', 'btn--secondary'],
      ['quiet', 'btn--quiet'],
      ['destructive', 'btn--destructive'],
      ['agent', 'btn--agent'],
      ['ghost', 'btn--ghost'],
      ['danger', 'btn--danger'],
    ] as const)('applies %s variant class', (variant, expectedClass) => {
      render(<Button variant={variant}>Test</Button>);
      expect(screen.getByRole('button')).toHaveClass(expectedClass);
    });
  });

  describe('sizes', () => {
    it('applies no size class for md (default)', () => {
      render(<Button>Medium</Button>);
      const btn = screen.getByRole('button');
      expect(btn).not.toHaveClass('btn--sm');
      expect(btn).not.toHaveClass('btn--lg');
    });

    it('applies btn--sm for small size', () => {
      render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--sm');
    });

    it('applies btn--lg for large size', () => {
      render(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--lg');
    });
  });

  describe('interactions', () => {
    it('applies no interaction class by default', () => {
      render(<Button>Default</Button>);
      const btn = screen.getByRole('button');
      expect(btn).not.toHaveClass('btn--stretch');
      expect(btn).not.toHaveClass('btn--magnetic');
      expect(btn).not.toHaveClass('btn--glow');
      expect(btn).not.toHaveClass('btn--lift');
      expect(btn).not.toHaveClass('btn--press');
    });

    it.each([
      ['stretch', 'btn--stretch'],
      ['magnetic', 'btn--magnetic'],
      ['glow', 'btn--glow'],
      ['lift', 'btn--lift'],
      ['press', 'btn--press'],
    ] as const)('applies %s interaction class', (interaction, expectedClass) => {
      render(<Button interaction={interaction}>Test</Button>);
      expect(screen.getByRole('button')).toHaveClass(expectedClass);
    });
  });

  describe('loading state', () => {
    it('shows spinner when loading', () => {
      render(<Button loading>Submit</Button>);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('applies btn--loading class when loading', () => {
      render(<Button loading>Submit</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--loading');
    });

    it('sets aria-busy when loading', () => {
      render(<Button loading>Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('does not set aria-busy when not loading', () => {
      render(<Button>Submit</Button>);
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
    });

    it('disables the button when loading', () => {
      render(<Button loading>Submit</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('displays loadingText when loading and loadingText provided', () => {
      render(
        <Button loading loadingText="Processing...">
          Submit
        </Button>,
      );
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('displays children when loading but no loadingText', () => {
      render(<Button loading>Submit</Button>);
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('hides icons when loading', () => {
      render(
        <Button
          loading
          iconLeft={<span data-testid="left-icon">L</span>}
          iconRight={<span data-testid="right-icon">R</span>}
        >
          Submit
        </Button>,
      );
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });

    it('renders sm spinner for sm and md buttons', () => {
      const { container } = render(
        <Button loading size="sm">
          Go
        </Button>,
      );
      const spinner = container.querySelector('.btn__spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('renders md spinner for lg buttons', () => {
      render(
        <Button loading size="lg">
          Go
        </Button>,
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('disables the button when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('sets aria-disabled when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not fire onClick when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>,
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('icons', () => {
    it('renders iconLeft', () => {
      render(<Button iconLeft={<span data-testid="icon-left">+</span>}>Add</Button>);
      expect(screen.getByTestId('icon-left')).toBeInTheDocument();
    });

    it('renders iconRight', () => {
      render(<Button iconRight={<span data-testid="icon-right">→</span>}>Next</Button>);
      expect(screen.getByTestId('icon-right')).toBeInTheDocument();
    });

    it('renders both icons simultaneously', () => {
      render(
        <Button
          iconLeft={<span data-testid="icon-left">←</span>}
          iconRight={<span data-testid="icon-right">→</span>}
        >
          Navigate
        </Button>,
      );
      expect(screen.getByTestId('icon-left')).toBeInTheDocument();
      expect(screen.getByTestId('icon-right')).toBeInTheDocument();
    });

    it('marks icon containers as aria-hidden', () => {
      const { container } = render(
        <Button iconLeft={<span>+</span>} iconRight={<span>→</span>}>
          Test
        </Button>,
      );
      const iconContainers = container.querySelectorAll('.btn__icon');
      iconContainers.forEach((el) => {
        expect(el).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('applies left/right modifier classes to icon containers', () => {
      const { container } = render(
        <Button iconLeft={<span>L</span>} iconRight={<span>R</span>}>
          Test
        </Button>,
      );
      expect(container.querySelector('.btn__icon--left')).toBeInTheDocument();
      expect(container.querySelector('.btn__icon--right')).toBeInTheDocument();
    });
  });

  describe('fullWidth', () => {
    it('applies btn--full-width class when fullWidth is true', () => {
      render(<Button fullWidth>Full</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--full-width');
    });

    it('does not apply btn--full-width by default', () => {
      render(<Button>Normal</Button>);
      expect(screen.getByRole('button')).not.toHaveClass('btn--full-width');
    });
  });

  describe('event handling', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(
        <Button loading onClick={handleClick}>
          Click
        </Button>,
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('class composition', () => {
    it('combines variant, size, interaction, and state classes', () => {
      render(
        <Button variant="agent" size="lg" interaction="glow" fullWidth className="extra">
          Combined
        </Button>,
      );
      const btn = screen.getByRole('button');
      expect(btn).toHaveClass(
        'btn',
        'btn--agent',
        'btn--lg',
        'btn--glow',
        'btn--full-width',
        'extra',
      );
    });

    it('filters out empty class strings', () => {
      render(<Button size="md">Test</Button>);
      const btn = screen.getByRole('button');
      const classAttr = btn.getAttribute('class') ?? '';
      expect(classAttr).not.toContain('  ');
    });
  });
});
