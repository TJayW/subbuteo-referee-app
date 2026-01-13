import React, { useState, useRef, useEffect } from 'react';
import { Download, Info, Zap } from 'lucide-react';
import { LAYOUT_WIDTHS } from '@/constants/layout';
import logger from '@/utils/logger';

export interface ExportOption {
  id: 'json' | 'csv' | 'png' | 'html';
  icon: React.ReactNode;
  label: string;
  description: string;
  action: () => void;
  color: string;
}

interface ExportPopoverProps {
  options: ExportOption[];
}

export const ExportPopover: React.FC<ExportPopoverProps> = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleExport = async (option: ExportOption) => {
    setIsLoading(true);
    try {
      await option.action();
    } catch (error) {
      logger.error(`Export ${option.id} failed:`, error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="p-2 text-white bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/50 rounded-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 group"
        aria-label="📥 Esporta partita"
        aria-expanded={isOpen}
      >
        <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          onMouseLeave={() => setIsOpen(false)}
          className="absolute right-0 mt-3 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 scale-in overflow-hidden"
          style={{ width: `${LAYOUT_WIDTHS.EXPORT_POPOVER}px` }}
        >
          {/* Header */}
          <div className="px-4 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-slate-50 to-blue-50">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Esporta Rapporto</h3>
            </div>
            <p className="text-xs text-slate-600 mt-2">Scegli il formato più adatto alle tue esigenze</p>
          </div>

          {/* Options */}
          <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
            {options.map((option, idx) => (
              <button
                key={option.id}
                onClick={() => handleExport(option)}
                disabled={isLoading}
                style={{
                  animation: `float-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both`,
                  animationDelay: `${idx * 50}ms`,
                }}
                className={`
                  w-full p-3 rounded-lg border-2 transition-all duration-250 ease-smooth
                  text-left group hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                  ${option.color}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-lg group-hover:scale-125 transition-transform duration-250 ease-smooth">
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors duration-250">
                      {option.label}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 truncate">
                      {option.description}
                    </div>
                  </div>
                  {isLoading && (
                    <div className="animate-spin">
                      <Zap className="w-4 h-4 text-blue-500" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Info Footer */}
          <div className="px-4 py-3 bg-blue-50/50 border-t border-blue-100 rounded-b-xl">
            <div className="flex gap-2 text-xs text-blue-900">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                I file verranno salvati sul tuo dispositivo con timestamp automatico.
              </p>
            </div>
          </div>

          {/* Arrow */}
          <div className="absolute -top-1 right-4 w-2 h-2 bg-white border-l border-t border-slate-200 transform rotate-45" />
        </div>
      )}
    </div>
  );
};
