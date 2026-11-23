import React from 'react';

const VARIANTS = {
  ghost: 'bg-transparent hover:bg-surface-2 text-text-secondary hover:text-text-primary border-transparent',
  outline: 'bg-transparent hover:bg-surface-2 text-text-secondary hover:text-text-primary border-stroke-muted hover:border-stroke-active',
  surface: 'bg-surface-2 hover:bg-surface-3 text-text-primary border-stroke-muted hover:border-stroke-active',
};

const SIZES = {
  sm: 'w-8 h-8 rounded-md p-1.5',
  md: 'w-9 h-9 rounded-lg p-2',
  lg: 'w-10 h-10 rounded-lg p-2.5',
};

export const IconButton = React.forwardRef(({
  icon,
  ariaLabel,
  variant = 'outline',
  size = 'md',
  href,
  target,
  rel,
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center border transition-all duration-150 select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-50 disabled:pointer-events-none';
  const variantStyles = VARIANTS[variant] || VARIANTS.outline;
  const sizeStyles = SIZES[size] || SIZES.md;
  const combinedClass = `${baseStyles} ${variantStyles} ${sizeStyles} ${className}`;

  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : rel}
        aria-label={ariaLabel}
        className={combinedClass}
        {...props}
      >
        {icon}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      className={combinedClass}
      {...props}
    >
      {icon}
    </button>
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;
