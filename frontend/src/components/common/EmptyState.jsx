/**
 * EmptyState Component
 * =====================
 * Rendered when a list, filter, or query produces zero items.
 * Clean, accessible, and in harmony with the Technical Precision design system.
 */

import React from 'react';
import { FolderOpen, RotateCcw } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  title = 'No items found',
  description = 'There are no records matching your current filter criteria.',
  icon: Icon = FolderOpen,
  actionLabel = 'Reset Filters',
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`w-full p-8 sm:p-12 text-center rounded-2xl bg-surface-1/60 border border-stroke-muted flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-surface-2 border border-stroke-muted flex items-center justify-center text-text-muted mb-4 shadow-ambient">
        <Icon className="w-6 h-6 text-accent-electric/80" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-1 tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {onAction && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onAction}
          icon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
