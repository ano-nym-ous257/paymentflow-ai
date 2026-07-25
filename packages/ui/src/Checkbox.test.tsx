import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders with a label', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
  });

  it('renders as a checkbox input', () => {
    render(<Checkbox label="Option" />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('calls onChange when toggled', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Toggle" onChange={handleChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('displays error message', () => {
    render(<Checkbox label="Required" error="This field is required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
  });

  it('sets aria-invalid when error is present', () => {
    render(<Checkbox label="Broken" error="Error" />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('generates id from string label', () => {
    render(<Checkbox label="My Check" />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'checkbox-my-check');
  });

  it('uses provided id', () => {
    render(<Checkbox label="Custom" id="custom-id" />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'custom-id');
  });

  it('forwards HTML attributes', () => {
    render(<Checkbox label="Test" data-testid="cb" />);
    expect(screen.getByTestId('cb')).toBeInTheDocument();
  });

  it('appends custom className', () => {
    const { container } = render(<Checkbox label="Styled" className="extra" />);
    expect(container.firstChild).toHaveClass('checkbox-field', 'extra');
  });
});
