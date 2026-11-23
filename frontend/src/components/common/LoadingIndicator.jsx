import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingIndicator = ({
  message,
  size = 'md',
  className = '',
  inline = false,
}) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 text-text-secondary ${className}`}>
      <Loader2 className={`${iconSizes[size] || iconSizes.md} animate-spin text-accent-electric`} />
      {message && (
        <span className="text-xs font-mono tracking-tight text-text-muted">
          {message}
        </span>
      )}
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="w-full flex items-center justify-center p-8">
      {content}
    </div>
  );
};

export default LoadingIndicator;
