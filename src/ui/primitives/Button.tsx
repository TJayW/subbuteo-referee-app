import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, className = '', children, disabled, ...props }, ref) => {
    const baseClasses = `
      inline-flex items-center justify-center font-medium rounded-lg 
      transition-all duration-250 ease-smooth
      focus:outline-none focus:ring-2 focus:ring-offset-2 
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-95
    `;

    const variantClasses: Record<string, string> = {
      primary: `
        bg-gradient-to-br from-slate-900 to-slate-800 text-white 
        hover:from-slate-800 hover:to-slate-700 hover:shadow-lg hover:shadow-slate-900/30
        focus:ring-slate-500
      `,
      secondary: `
        bg-slate-100 text-slate-900 
        hover:bg-slate-200 hover:shadow-md hover:shadow-slate-200/40
        focus:ring-slate-400
      `,
      ghost: `
        text-slate-700 hover:bg-slate-100/80 
        active:bg-slate-200 active:scale-95
        focus:ring-slate-400
      `,
      danger: `
        bg-gradient-to-br from-red-600 to-red-700 text-white 
        hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:shadow-red-600/30
        focus:ring-red-500
      `,
    };

    const sizeClasses: Record<string, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="spin-soft mr-2 w-4 h-4">⟳</span>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
