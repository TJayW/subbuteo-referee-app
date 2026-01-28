import React from 'react';

interface SegmentedControlProps<T extends string | number> {
  options: Array<{ label: string; value: T; icon?: React.ReactNode }>;
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  size = 'md',
}: SegmentedControlProps<T>) {
  const sizeClasses: Record<string, string> = {
    sm: 'p-0.5 gap-0.5',
    md: 'p-1 gap-1',
  };

  const buttonClasses: Record<string, string> = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
  };

  return (
    <div className={`inline-flex ui-surface-muted ${sizeClasses[size]}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`inline-flex items-center gap-1.5 rounded-md font-medium transition-all ${buttonClasses[size]} ${
            value === option.value
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {option.icon && <span>{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
}
