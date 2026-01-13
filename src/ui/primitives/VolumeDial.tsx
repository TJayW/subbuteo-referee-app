/**
 * Premium 360° Volume Dial / Knob Control
 * 
 * Features:
 * - Mouse + touch pointer events (360° rotation)
 * - Keyboard accessibility (arrow keys ±1%, page up/down ±10%)
 * - ARIA: role="slider" with valuenow/min/max/valuetext
 * - Visual: circular track + thumb, numeric % label, mute button
 * - Responsive: scales on small screens, shows percentage
 * - Touch-friendly: 48px+ min tap area
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { angleToVolume, volumeToAngle, getAngleFromPoint } from '@/utils/volume-helpers';

interface VolumeDial {
  volume: number; // 0-100
  enabled: boolean;
  onChange: (volume: number) => void;
  onToggle: (enabled: boolean) => void;
}

export const VolumeDial: React.FC<VolumeDial> = ({
  volume,
  enabled,
  onChange,
  onToggle,
}) => {
  const dialRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const angle = volumeToAngle(volume);

  /**
   * Handle pointer move during drag
   */
  const handlePointerMove = useCallback((e: PointerEvent | React.PointerEvent) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const clientX = 'clientX' in e ? e.clientX : (e as Record<string, unknown>).clientX as number;
    const clientY = 'clientY' in e ? e.clientY : (e as Record<string, unknown>).clientY as number;

    const pointX = clientX - rect.left;
    const pointY = clientY - rect.top;

    const newAngle = getAngleFromPoint(centerX, centerY, pointX, pointY);
    const newVolume = angleToVolume(newAngle);
    onChange(newVolume);
  }, [onChange]);

  /**
   * Handle pointer down (mouse + touch)
   */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!enabled) return;
      setIsDragging(true);
      handlePointerMove(e);
    },
    [enabled, handlePointerMove]
  );

  /**
   * Handle keyboard: arrow keys ±1%, page up/down ±10%
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<SVGSVGElement>) => {
      if (!enabled) return;

      let delta = 0;
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') delta = 1;
      else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') delta = -1;
      else if (e.key === 'PageUp') delta = 10;
      else if (e.key === 'PageDown') delta = -10;
      else if (e.key === 'Home') {
        onChange(0);
        e.preventDefault();
        return;
      } else if (e.key === 'End') {
        onChange(100);
        e.preventDefault();
        return;
      }

      if (delta !== 0) {
        e.preventDefault();
        const newVolume = Math.max(0, Math.min(100, volume + delta));
        onChange(newVolume);
      }
    },
    [volume, enabled, onChange]
  );

  /**
   * Setup global pointer events for drag
   */
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: PointerEvent) => {
      handlePointerMove(e);
    };

    const handleUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [isDragging, handlePointerMove]);

  /**
   * Calculate thumb position (SVG coordinates)
   * Center = (50, 50), radius = 45
   */
  const radius = 45;
  const centerX = 50;
  const centerY = 50;
  const rad = (angle * Math.PI) / 180;
  const thumbX = centerX + radius * Math.cos(rad - Math.PI / 2);
  const thumbY = centerY + radius * Math.sin(rad - Math.PI / 2);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Dial SVG */}
      <svg
        ref={dialRef}
        width="120"
        height="120"
        viewBox="0 0 100 100"
        className={`cursor-pointer select-none transition-opacity ${
          enabled ? 'opacity-100' : 'opacity-50'
        } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        tabIndex={enabled ? 0 : -1}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={volume}
        aria-valuetext={`${volume}% volume`}
        aria-label="Volume control dial"
      >
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r="48"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1"
        />

        {/* Active arc (blue track showing current volume) */}
        <circle
          cx={centerX}
          cy={centerY}
          r="45"
          fill="none"
          stroke="#1e293b"
          strokeWidth="3"
          strokeDasharray={`${(angle / 360) * 2 * Math.PI * 45} ${2 * Math.PI * 45}`}
          strokeLinecap="round"
          opacity={enabled ? 1 : 0.5}
        />

        {/* Thumb (filled circle at current position) */}
        <circle
          cx={thumbX}
          cy={thumbY}
          r="5"
          fill="#1e293b"
          opacity={enabled ? 1 : 0.5}
        />

        {/* Center dot */}
        <circle cx={centerX} cy={centerY} r="2" fill="#64748b" />
      </svg>

      {/* Control Row: Mute + Percentage */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(!enabled)}
          className={`p-2 rounded-lg transition-colors ${
            enabled
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-900'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-400'
          }`}
          title={enabled ? 'Mute audio' : 'Enable audio'}
          aria-label={enabled ? 'Mute audio' : 'Enable audio'}
        >
          {enabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>

        <span
          className={`text-2xl font-semibold tabular-nums w-16 text-center ${
            enabled ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          {volume}%
        </span>
      </div>

      {/* Accessibility hint for keyboard */}
      <span className="text-xs text-slate-500 text-center max-w-xs">
        Use arrow keys ±1%, PgUp/PgDn ±10%, Home/End
      </span>
    </div>
  );
};
