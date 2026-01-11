import React from 'react';

interface ChipProps {
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  icon,
  selected = false,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
}) => {
  const variantClasses: Record<string, string> = {
    default: selected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    success: selected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200',
    warning: selected ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-900 hover:bg-amber-200',
    danger: selected ? 'bg-red-600 text-white' : 'bg-red-100 text-red-900 hover:bg-red-200',
    info: selected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-900 hover:bg-blue-200',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'px-2.5 py-1 text-xs font-medium',
    md: 'px-3 py-1.5 text-sm font-medium',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
};
