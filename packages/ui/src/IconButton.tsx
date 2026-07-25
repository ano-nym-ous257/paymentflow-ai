import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  size?: IconButtonSize;
}

const SIZE_CLASS: Record<IconButtonSize, string> = {
  sm: 'icon-btn--sm',
  md: '',
  lg: 'icon-btn--lg',
};

export function IconButton({
  icon,
  label,
  size = 'md',
  type = 'button',
  className = '',
  ...rest
}: IconButtonProps) {
  const classes = ['icon-btn', SIZE_CLASS[size], className].filter(Boolean).join(' ');

  return (
    <button type={type} className={classes} aria-label={label} {...rest}>
      {icon}
    </button>
  );
}
