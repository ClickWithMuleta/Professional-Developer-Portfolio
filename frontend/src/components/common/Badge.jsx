import React from 'react';

const VARIANTS = {
  default: 'bg-surface-2 text-text-secondary border-stroke-muted',
  accent: 'bg-accent/10 text-accent-electric border-accent/20',
  tech: 'font-mono bg-surface-1 text-text-secondary border-stroke-muted hover:border-accent hover:text-accent transition-colors',
  status: 'bg-surface-1 text-text-primary border-stroke-muted',
};

const SIZES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  withDot = false,
  dotColor = 'bg-accent-electric',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 rounded-md border font-medium select-none';
  const variantStyles = VARIANTS[variant] || VARIANTS.default;
  const sizeStyles = SIZES[size] || SIZES.md;

  return (
    <span
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {withDot && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
        </span>
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
