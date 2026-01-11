import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'secondary' | 'primary' | 'success' | 'danger' | 'warning';
  children: React.ReactNode;
  isLoading?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'md', variant = 'ghost', className = '', isLoading = false, children, ...props }, ref) => {
    const sizeClasses: Record<string, string> = {
      sm: 'p-1.5 w-8 h-8',
      md: 'p-2 w-10 h-10',
      lg: 'p-3 w-12 h-12',
    };

    const variantClasses: Record<string, string> = {
      // Ghost: Subtle, minimal interaction
      ghost: `
        text-slate-600 hover:text-slate-900 hover:bg-slate-100/80
        active:bg-slate-200 active:scale-95
        transition-all duration-250 ease-smooth
        focus:outline-none focus:ring-2 focus:ring-slate-400/70 focus:ring-offset-1
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
      `,
      // Secondary: Medium emphasis
      secondary: `
        bg-slate-100 text-slate-900 
        hover:bg-slate-200 hover:shadow-md hover:shadow-slate-200/40
        active:bg-slate-300 active:scale-95
        transition-all duration-250 ease-smooth
        focus:outline-none focus:ring-2 focus:ring-slate-400/70 focus:ring-offset-1
        disabled:opacity-40 disabled:cursor-not-allowed
      `,
      // Primary: Main action - Blue gradient, prominent
      primary: `
        text-white bg-gradient-to-br from-blue-500 to-blue-600
        hover:from-blue-600 hover:to-blue-700 
        hover:shadow-[0_8px_24px_rgba(59,130,246,0.4)]
        active:from-blue-700 active:to-blue-800 active:scale-95 active:shadow-md
        transition-all duration-250 ease-snappy
        focus:outline-none focus:ring-2 focus:ring-blue-400/70 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
      `,
      // Success: Positive actions - Green
      success: `
        text-white bg-gradient-to-br from-emerald-500 to-emerald-600
        hover:from-emerald-600 hover:to-emerald-700
        hover:shadow-[0_8px_24px_rgba(16,185,129,0.4)]
        active:from-emerald-700 active:to-emerald-800 active:scale-95
        transition-all duration-250 ease-snappy
        focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
      `,
      // Danger: Destructive actions - Red
      danger: `
        text-white bg-gradient-to-br from-red-500 to-red-600
        hover:from-red-600 hover:to-red-700
        hover:shadow-[0_8px_24px_rgba(239,68,68,0.4)]
        active:from-red-700 active:to-red-800 active:scale-95
        transition-all duration-250 ease-snappy
        focus:outline-none focus:ring-2 focus:ring-red-400/70 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
      `,
      // Warning: Caution/attention - Amber
      warning: `
        text-slate-900 bg-gradient-to-br from-amber-400 to-amber-500
        hover:from-amber-500 hover:to-amber-600
        hover:shadow-[0_8px_24px_rgba(251,146,60,0.4)]
        active:from-amber-600 active:to-amber-700 active:scale-95
        transition-all duration-250 ease-snappy
        focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
      `,
    };

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center rounded-lg
          relative overflow-hidden
          ${sizeClasses[size]} 
          ${variantClasses[variant]} 
          ${className}
          ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
        `}
        disabled={props.disabled || isLoading}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/2 h-1/2 border-2 border-transparent border-t-current rounded-full spin-soft" />
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
