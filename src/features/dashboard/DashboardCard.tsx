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
    <div className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className={`border-b border-slate-100 ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <div className="text-slate-600">{icon}</div>}
            <div>
              <h3 className={`font-semibold text-slate-900 ${compact ? 'text-sm' : 'text-base'}`}>
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
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
        <div className={`border-t border-slate-100 ${compact ? 'px-3 py-2' : 'px-4 py-3'} bg-slate-50`}>
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
    primary: 'text-blue-600 hover:bg-blue-50 hover:text-blue-700',
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
