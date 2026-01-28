import React from 'react';
import type { ActionType } from '@/types/ui';

/**
 * Semantic Action Buttons - Lo stile comunica l'azione
 * 
 * Tipi di azione (imported from @/lib/types/ui):
 * - primary: Azione principale positiva (salva, conferma)
 * - secondary: Azione secondaria (annulla)
 * - destructive/danger: Azione distruttiva (elimina)
 * - warning: Azione cautela (ripristina, attenzione)
 * - success: Azione completata con successo
 * - info: Azione informativa
 * - ghost: Azione trasparente
 * - edit: Modifica contenuto
 * - expand: Mostra dettagli
 * - test: Esegui test
 */

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  action: ActionType;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const actionStyles: Record<ActionType, string> = {
  // PRIMARY: Azione principale positiva
  primary: `
    bg-gradient-to-br from-sky-500 to-sky-600
    text-white font-semibold
    hover:from-sky-600 hover:to-sky-700 hover:shadow-lg hover:shadow-sky-500/30
    active:from-sky-700 active:to-sky-800 active:scale-95
    transition-all duration-250 ease-snappy
    focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

  // SECONDARY: Azione secondaria (annulla, chiudi)
  secondary: `
    bg-slate-100 text-slate-900
    border border-slate-300 font-medium
    hover:bg-slate-200 hover:border-slate-400 hover:shadow-md hover:shadow-slate-200/40
    active:bg-slate-300 active:scale-95
    transition-all duration-250 ease-smooth
    focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

  // DESTRUCTIVE/DANGER: Azione distruttiva (elimina)
  destructive: `
    bg-gradient-to-br from-red-500 to-red-600
    text-white font-semibold
    hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/30
    active:from-red-700 active:to-red-800 active:scale-95
    transition-all duration-250 ease-snappy
    focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

  // DANGER: Alias for destructive
  danger: `
    bg-gradient-to-br from-red-500 to-red-600
    text-white font-semibold
    hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/30
    active:from-red-700 active:to-red-800 active:scale-95
    transition-all duration-250 ease-snappy
    focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

  // WARNING: Azione cautela (ripristina, attenzione)
  warning: `
    bg-gradient-to-br from-amber-400 to-amber-500
    text-slate-900 font-semibold
    hover:from-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-500/30
    active:from-amber-600 active:to-amber-700 active:scale-95
    transition-all duration-250 ease-snappy
    focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

  // SUCCESS: Azione completata positivamente
  success: `
    bg-gradient-to-br from-emerald-500 to-emerald-600
    text-white font-semibold
    hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30
    active:from-emerald-700 active:to-emerald-800 active:scale-95
    transition-all duration-250 ease-snappy
    focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

  // INFO: Azione informativa
  info: `
    bg-gradient-to-br from-cyan-500 to-cyan-600
    text-white font-semibold
    hover:from-cyan-600 hover:to-cyan-700 hover:shadow-lg hover:shadow-cyan-500/30
    active:from-cyan-700 active:to-cyan-800 active:scale-95
    transition-all duration-250 ease-snappy
    focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

  // GHOST: Azione trasparente
  ghost: `
    bg-transparent text-slate-700
    hover:bg-slate-100 hover:shadow-sm
    active:bg-slate-200 active:scale-95
    transition-all duration-250 ease-smooth
    focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

  // EDIT: Modifica/Aggiorna contenuto
  edit: `
    bg-slate-50 text-slate-900
    border-2 border-dashed border-slate-300
    hover:bg-slate-100 hover:border-sky-400 hover:text-sky-600
    active:bg-slate-200 active:scale-95
    transition-all duration-250 ease-smooth
    focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

  // EXPAND: Mostra dettagli/Menu
  expand: `
    bg-white text-slate-700
    border border-slate-200
    hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm
    active:bg-slate-100 active:scale-95
    transition-all duration-250 ease-smooth
    focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

  // TEST: Esegui test (suoni, etc)
  test: `
    bg-gradient-to-br from-slate-700 to-slate-800
    text-white font-semibold
    hover:from-slate-800 hover:to-slate-900 hover:shadow-lg hover:shadow-slate-500/30
    active:from-slate-900 active:to-black active:scale-95
    transition-all duration-250 ease-snappy
    focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-lg gap-2.5',
};

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ action, size = 'md', isLoading = false, icon, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center font-medium
          relative overflow-hidden
          ${actionStyles[action]}
          ${sizeStyles[size]}
          ${className}
          ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
        `}
        disabled={props.disabled || isLoading}
        {...props}
      >
        {/* Icon */}
        {icon && !isLoading && (
          <span className="group-hover:scale-110 transition-transform duration-250">
            {icon}
          </span>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <div className="w-4 h-4 border-2 border-transparent border-t-current rounded-full spin-soft" />
        )}

        {/* Text */}
        <span>{children}</span>
      </button>
    );
  }
);

ActionButton.displayName = 'ActionButton';
