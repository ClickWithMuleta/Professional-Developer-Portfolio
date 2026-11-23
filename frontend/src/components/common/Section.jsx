import React from 'react';
import Container from './Container';

export const Section = React.forwardRef(({
  id,
  children,
  className = '',
  containerSize = 'default',
  variant = 'default',
  withContainer = true,
  ...props
}, ref) => {
  const variantStyles = {
    default: 'bg-canvas',
    subtle: 'bg-canvas-subtle border-y border-stroke-muted',
    grid: 'bg-canvas bg-dot-grid relative',
  };

  return (
    <section
      ref={ref}
      id={id}
      className={`py-16 sm:py-20 lg:py-24 ${variantStyles[variant] || variantStyles.default} ${className}`}
      {...props}
    >
      {withContainer ? (
        <Container size={containerSize}>
          {children}
        </Container>
      ) : (
        children
      )}
    </section>
  );
});

Section.displayName = 'Section';

export default Section;
