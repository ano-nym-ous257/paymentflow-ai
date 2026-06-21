import React from 'react';

/**
 * Button component (starter)
 * Props: variant: 'primary' | 'ghost' | 'danger', children, className, onClick
 */
export default function Button({ variant = 'primary', children, className = '', ...rest }) {
  const base = 'btn';
  const variantClass = variant === 'primary' ? 'btn--primary' : variant === 'danger' ? 'btn--danger' : 'btn--ghost';

  return (
    <button className={`${base} ${variantClass} ${className}`} {...rest}>
      {children}
    </button>
  );
}
