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
    default: selected ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200',
    success: selected ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
    warning: selected ? 'bg-amber-600 text-white border-amber-600' : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
    danger: selected ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100',
    info: selected ? 'bg-sky-600 text-white border-sky-600' : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'px-2.5 py-1 text-xs font-medium',
    md: 'px-3 py-1.5 text-sm font-medium',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`ui-chip rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
};
