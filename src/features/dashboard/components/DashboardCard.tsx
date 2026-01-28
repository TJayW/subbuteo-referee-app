/**
 * DashboardCard: Unified card component for console dashboard
 * Consistent spacing, borders, and action patterns
 */

import React from 'react';
import { MoreVertical } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export type { DashboardCardProps };

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  icon,
  actions,
  children,
  footer,
  className = '',
  compact = false,
}) => {
  return (
    <div className={`ui-surface ${className}`}>
      {/* Header */}
      <div className={`ui-card-header ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <div className="text-slate-600">{icon}</div>}
            <div className="min-w-0">
              <h3 className={`font-semibold text-slate-900 ${compact ? 'text-sm' : 'text-base'} truncate`}>
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-1">{actions}</div>}
        </div>
      </div>

      {/* Body */}
      <div className={compact ? 'p-3' : 'p-4'}>
        {children}
      </div>

      {/* Footer (optional) */}
      {footer && (
        <div className={`border-t border-slate-100 ${compact ? 'px-3 py-2' : 'px-4 py-3'} bg-slate-50/80`}>
          {footer}
        </div>
      )}
    </div>
  );
};

/**
 * Compact action button for card headers
 */
interface CardActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
}

export const CardAction: React.FC<CardActionProps> = ({
  icon,
  label,
  onClick,
  variant = 'default',
}) => {
  const baseClasses = 'p-1.5 rounded-md transition-colors';
  const variantClasses = {
    default: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    primary: 'text-sky-600 hover:bg-sky-50 hover:text-sky-700',
    danger: 'text-red-600 hover:bg-red-50 hover:text-red-700',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
      title={label}
    >
      {icon}
    </button>
  );
};

/**
 * Card menu button (kebab)
 */
export const CardMenu: React.FC<{ onToggle?: () => void }> = ({ onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
      title="Opzioni"
    >
      <MoreVertical size={16} />
    </button>
  );
};
