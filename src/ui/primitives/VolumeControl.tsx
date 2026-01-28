/**
 * Compact Volume Slider Control (for TopBar)
 * 
 * INTERNAL REPRESENTATION: 0-100 (integer percent)
 * 
 * Guarantees:
 * - step=1 for 1% granularity
 * - No rounding issues: input is always 0-100 integer
 * - Parent (AppShell) converts to 0-1 float only when persisting
 * - displayVolume is clamped to [0, 100]
 */

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { IconButton } from './IconButton';

interface VolumeControlProps {
  volume: number; // 0-100 (integer percent)
  enabled: boolean;
  onChange: (volume: number) => void;
  onToggle: (enabled: boolean) => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  enabled,
  onChange,
  onToggle,
}) => {
  // Clamp volume locally for safety (should never be needed if parent is correct)
  const displayVolume = Math.max(0, Math.min(100, Math.round(volume)));

  return (
    <div className="flex items-center gap-2">
      <IconButton
        size="md"
        variant="ghost"
        onClick={() => onToggle(!enabled)}
        title={enabled ? 'Muta' : 'Abilita audio'}
        aria-label={enabled ? 'Muta audio' : 'Abilita audio'}
      >
        {enabled ? (
          <Volume2 className="w-5 h-5" />
        ) : (
          <VolumeX className="w-5 h-5 opacity-50" />
        )}
      </IconButton>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={displayVolume}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={!enabled}
        className="w-24 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-50"
        aria-label="Controllo volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={displayVolume}
      />
      <span className="text-xs text-slate-500 w-8 text-right tabular-nums">
        {displayVolume}%
      </span>
    </div>
  );
};
