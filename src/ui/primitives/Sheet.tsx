import React, { type ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  position?: 'bottom' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'bottom',
  size = 'md',
}) => {
  if (!isOpen) return null;

  const sizeClasses: Record<string, string> = {
    sm: position === 'bottom' ? 'h-1/3' : 'w-72',
    md: position === 'bottom' ? 'h-1/2' : 'w-96',
    lg: position === 'bottom' ? 'h-2/3' : 'w-[28rem]',
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 fade-in"
        onClick={onClose}
      />
      <div
        className={`fixed z-50 bg-white shadow-2xl overflow-hidden flex flex-col ${
          position === 'bottom'
            ? `inset-x-0 bottom-0 rounded-t-2xl slide-in-from-bottom ${sizeClasses[size]}`
            : `inset-y-0 right-0 rounded-l-2xl slide-in-from-right ${sizeClasses[size]}`
        }`}
      >
        {/* Header */}
        {title && (
          <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between bg-slate-50">
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <IconButton size="sm" variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </IconButton>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </>
  );
};
