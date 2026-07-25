import type { InputHTMLAttributes, ReactNode } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  label: ReactNode;
  id?: string;
  error?: string;
}

export function Checkbox({ label, id, error, className = '', ...rest }: CheckboxProps) {
  const checkboxId =
    id ??
    `checkbox-${typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : 'field'}`;
  const errorId = error ? `${checkboxId}-error` : undefined;

  return (
    <div className={`checkbox-field ${error ? 'checkbox-field--error' : ''} ${className}`.trim()}>
      <label htmlFor={checkboxId} className="checkbox-field__label">
        <input
          id={checkboxId}
          type="checkbox"
          className="checkbox-field__input"
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          {...rest}
        />
        <span className="checkbox-field__check" aria-hidden="true" />
        <span className="checkbox-field__text">{label}</span>
      </label>
      {error && (
        <p id={errorId} className="checkbox-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
