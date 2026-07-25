import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

export type ButtonVariant =
  'primary' | 'secondary' | 'quiet' | 'destructive' | 'agent' | 'ghost' | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonInteraction = 'stretch' | 'magnetic' | 'glow' | 'lift' | 'press';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  interaction?: ButtonInteraction;
  loading?: boolean;
  loadingText?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn--primary',
  secondary: 'btn--secondary',
  quiet: 'btn--quiet',
  destructive: 'btn--destructive',
  agent: 'btn--agent',
  ghost: 'btn--ghost',
  danger: 'btn--danger',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'btn--sm',
  md: '',
  lg: 'btn--lg',
};

const INTERACTION_CLASS: Record<ButtonInteraction, string> = {
  stretch: 'btn--stretch',
  magnetic: 'btn--magnetic',
  glow: 'btn--glow',
  lift: 'btn--lift',
  press: 'btn--press',
};

export function Button({
  variant = 'primary',
  size = 'md',
  interaction,
  loading = false,
  loadingText,
  iconLeft,
  iconRight,
  fullWidth = false,
  type = 'button',
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const classes = [
    'btn',
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    interaction ? INTERACTION_CLASS[interaction] : '',
    loading ? 'btn--loading' : '',
    fullWidth ? 'btn--full-width' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      {...rest}
    >
      {loading && (
        <Spinner size={size === 'lg' ? 'md' : 'sm'} label="Loading" className="btn__spinner" />
      )}
      {iconLeft && !loading && (
        <span className="btn__icon btn__icon--left" aria-hidden="true">
          {iconLeft}
        </span>
      )}
      <span className="btn__label">{loading && loadingText ? loadingText : children}</span>
      {iconRight && !loading && (
        <span className="btn__icon btn__icon--right" aria-hidden="true">
          {iconRight}
        </span>
      )}
    </button>
  );
}
