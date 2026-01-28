import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Undo,
  Redo,
  MoreVertical,
  Volume2,
  VolumeX,
  Zap,
  RotateCcw,
  Dot,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { IconButton } from '@/ui/primitives';
import { useFocusZone } from '@/hooks/use-focus-zone';
import { FOCUS_RING } from '@/styles/focus-ring';

interface HeaderToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  audioVolume: number; // 0-100
  audioEnabled: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSettings: () => void;
  onToggleAudio: (enabled: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onAdvancedControls: () => void;
  exportPopover?: React.ReactNode;
  globalTimeTravel: {
    isTimeTraveling: boolean;
    position: { current: number; total: number };
    onJumpToPresent: () => void;
  };
  isPanelCollapsed?: boolean;
  onTogglePanel?: () => void;
}

/**
 * Right-side action toolbar: responsive, modular
 * 
 * Desktop (lg): shows all actions inline
 * Tablet (md): hides volume control, keeps core actions
 * Mobile (sm): hides undo/redo, uses overflow menu
 */
export const HeaderToolbar: React.FC<HeaderToolbarProps> = ({
  canUndo,
  canRedo,
  audioVolume,
  audioEnabled,
  onUndo,
  onRedo,
  onSettings,
  onToggleAudio,
  onVolumeChange,
  onAdvancedControls,
  exportPopover,
  globalTimeTravel,
  isPanelCollapsed = false,
  onTogglePanel,
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const { isTimeTraveling, position, onJumpToPresent } = globalTimeTravel;

  // Integrate with global focus manager
  const { zoneRef, handleFocusWithin } = useFocusZone({
    id: 'topbar',
    primarySelector: '[data-primary-topbar-control]',
    label: 'Top Bar Controls'
  });

  return (
    <div 
      ref={zoneRef as React.Ref<HTMLDivElement>}
      onFocus={handleFocusWithin}
      data-zone="topbar"
      className="flex items-center gap-1 flex-shrink-0"
    >
      {/* Desktop: Global Status Inline Cluster (Reordered: Status/CTA left, Undo/Redo right) */}
      <div className="hidden sm:flex items-center gap-2">
        {/* Global status inline cluster */}
        <div
          className="flex items-center gap-1.5"
          data-testid="global-status-surface"
          data-scope="global"
          data-active={isTimeTraveling ? 'true' : 'false'}
        >
          <AnimatePresence mode="wait">
            {isTimeTraveling ? (
              <motion.div
                key="not-at-head"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="flex items-center gap-1.5"
              >
                <span
                  className="ui-chip bg-amber-50 text-amber-800 border-amber-200 font-mono whitespace-nowrap max-w-[80px] truncate"
                  aria-label={`Stai visualizzando ${position.current} di ${position.total}`}
                >
                  {position.current}/{position.total}
                </span>
                <button
                  onClick={onJumpToPresent}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 active:translate-y-px text-white rounded-md transition-all whitespace-nowrap flex-shrink-0 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  aria-label="Torna al presente (Cmd+Shift+P o clic)"
                  data-testid="global-status-cta"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden md:inline">Torna al presente</span>
                  <span className="inline md:hidden">Presente</span>
                </button>
              </motion.div>
            ) : (
              <motion.span
                key="at-head"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12, ease: 'easeIn' }}
                className="ui-badge text-emerald-700 bg-emerald-50 border-emerald-200 whitespace-nowrap"
                aria-label="Sistema live, nessun undo attivo"
              >
                <Dot className="w-4 h-4 text-emerald-500" />
                LIVE
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="ui-divider flex-shrink-0" />

        {/* Undo/Redo buttons - FIXED RIGHT POSITION */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <IconButton
            size="sm"
            variant="ghost"
            onClick={onUndo}
            disabled={!canUndo}
            title="Annulla Globale (⌘Z)"
            aria-label="Annulla globale (Cmd+Z)"
            data-primary-topbar-control
            className={FOCUS_RING}
          >
            <Undo className="w-4 h-4" />
          </IconButton>
          <IconButton
            size="sm"
            variant="ghost"
            onClick={onRedo}
            disabled={!canRedo}
            title="Ripeti Globale (⌘⇧Z)"
            aria-label="Ripeti globale (Cmd+Shift+Z)"
            className={FOCUS_RING}
          >
            <Redo className="w-4 h-4" />
          </IconButton>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden sm:block ui-divider flex-shrink-0" />

      {/* Sidebar Toggle (Desktop/Tablet only) */}
      {onTogglePanel && (
        <div className="hidden md:flex">
          <IconButton
            size="sm"
            variant="ghost"
            onClick={onTogglePanel}
            aria-label={isPanelCollapsed ? 'Espandi sidebar' : 'Comprimi sidebar'}
            aria-pressed={!isPanelCollapsed}
            title={isPanelCollapsed ? 'Espandi sidebar (Ctrl+\\)' : 'Comprimi sidebar (Ctrl+\\)'}
            data-sidebar-toggle
          >
            {isPanelCollapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </IconButton>
        </div>
      )}

      {/* Divider (if sidebar toggle visible) */}
      {onTogglePanel && <div className="hidden md:block ui-divider flex-shrink-0" />}

      {/* Desktop: Volume Control Inline */}
      <div className="hidden lg:flex items-center gap-1.5 px-1.5 py-1">
        <IconButton
          size="sm"
          variant="ghost"
          onClick={() => onToggleAudio(!audioEnabled)}
          title={audioEnabled ? 'Muta' : 'Abilita audio'}
        >
          {audioEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4 opacity-50" />
          )}
        </IconButton>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={audioVolume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          disabled={!audioEnabled}
          className={`w-20 h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-slate-900 disabled:opacity-50 ${FOCUS_RING}`}
          aria-label="Controllo volume"
        />
        <span className="text-xs text-slate-500 w-6 text-right tabular-nums">
          {audioVolume}%
        </span>
      </div>

      {/* Tablet: Volume Toggle Only */}
      <div className="hidden md:flex lg:hidden">
        <div className="relative">
          <IconButton
            size="sm"
            variant="ghost"
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            title={audioEnabled ? 'Muta' : 'Abilita audio'}
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 opacity-50" />
            )}
          </IconButton>
          {showVolumeSlider && (
            <div className="absolute right-0 top-full mt-2 ui-surface p-3 z-50">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={audioVolume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                disabled={!audioEnabled}
                className="w-24 h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-slate-900 disabled:opacity-50"
                aria-label="Controllo volume"
              />
              <div className="text-xs text-slate-500 mt-1 text-center tabular-nums">
                {audioVolume}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="hidden md:block ui-divider" />

      {/* Export Popover */}
      {exportPopover}

      {/* Advanced Controls Button */}
      <IconButton
        size="sm"
        variant="ghost"
        onClick={onAdvancedControls}
        title="Advanced Controls (Cmd+Shift+A)"
        className="text-amber-600 hover:text-amber-700"
      >
        <Zap className="w-4 h-4" />
      </IconButton>

      {/* Divider before Settings */}
      <div className="hidden sm:block ui-divider" />

      {/* Settings Button */}
      <IconButton
        size="sm"
        variant="ghost"
        onClick={onSettings}
        title="Impostazioni"
      >
        <Settings className="w-4 h-4" />
      </IconButton>

      {/* Mobile: Overflow Menu */}
      <div className="sm:hidden relative">
        <IconButton
          size="sm"
          variant="ghost"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          title="Altro"
        >
          <MoreVertical className="w-4 h-4" />
        </IconButton>
        {showMobileMenu && (
          <div className="absolute right-0 top-full mt-1 ui-surface z-50">
            <button
              onClick={() => {
                onUndo();
                setShowMobileMenu(false);
              }}
              disabled={!canUndo}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed w-full text-left"
              title="Annulla (Cmd+Z)"
            >
              <Undo className="w-4 h-4" />
              Annulla
            </button>
            <button
              onClick={() => {
                onRedo();
                setShowMobileMenu(false);
              }}
              disabled={!canRedo}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed w-full text-left"
              title="Ripeti (Cmd+Shift+Z)"
            >
              <Redo className="w-4 h-4" />
              Ripeti
            </button>
            <div className="border-t border-slate-200" />
            <button
              onClick={() => {
                onToggleAudio(!audioEnabled);
                setShowMobileMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
            >
              {audioEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
              {audioEnabled ? 'Muta' : 'Audio'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
