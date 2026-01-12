/**
 * Audio Tab for Settings
 * 
 * Centralized audio + vibration controls:
 * - Master audio toggle
 * - Master volume slider (0–100%, 1% precision)
 * - Category mixer (4 sliders)
 * - Test sound buttons
 * - Vibration toggle
 */

import React, { useState, useCallback } from 'react';
import { ChevronDown, Play } from 'lucide-react';
import AudioEngine from '@/adapters/audio/audio-engine';
import type { SoundCategory } from '@/adapters/audio/audio-manifest';
import { CATEGORY_LABELS, CATEGORY_TEST_SOUNDS } from '@/adapters/audio/constants';
import logger from '@/utils/logger';

interface AudioTabProps {
  audioEnabled: boolean;
  audioVolume: number; // 0-1
  vibrationEnabled: boolean;
  categoryGains: Record<SoundCategory, number>;
  onToggleAudio: (enabled: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onToggleVibration: (enabled: boolean) => void;
  onCategoryVolumeChange: (category: SoundCategory, volume: number) => void;
}

const CATEGORIES: SoundCategory[] = ['referee', 'crowd', 'ui', 'matchControl'];

export const AudioTab: React.FC<AudioTabProps> = ({
  audioEnabled,
  audioVolume,
  vibrationEnabled,
  categoryGains,
  onToggleAudio,
  onVolumeChange,
  onToggleVibration,
  onCategoryVolumeChange,
}) => {
  const [expandMixer, setExpandMixer] = useState(false);
  const [testingSoundId, setTestingSoundId] = useState<string | null>(null);
  const engine = AudioEngine.getInstance();

  /**
   * Play test sound for a category
   */
  const playTestSound = useCallback(
    async (category: SoundCategory) => {
      try {
        setTestingSoundId(category);
        await engine.init();
        const soundId = CATEGORY_TEST_SOUNDS[category];
        await engine.play(soundId);
        setTimeout(() => setTestingSoundId(null), 500);
      } catch (error) {
        logger.error('Test sound failed:', error);
        setTestingSoundId(null);
      }
    },
    [engine]
  );

  // Convert 0-1 to 0-100 for UI display
  const volumePercent = Math.round(audioVolume * 100);

  return (
    <div className="space-y-6">
      {/* Master Audio Toggle */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-slate-900">Audio</label>
          <button
            onClick={() => onToggleAudio(!audioEnabled)}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
              audioEnabled ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
            aria-label={audioEnabled ? 'Disabilita audio' : 'Abilita audio'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform m-1 ${
                audioEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        {!audioEnabled && (
          <p className="text-xs text-slate-500">Audio completamente disabilitato</p>
        )}
      </div>

      {/* Master Volume Slider (only visible when audio enabled) */}
      {audioEnabled && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-900">
              Volume Principale
            </label>
            <span className="text-sm font-semibold text-slate-900 tabular-nums">
              {volumePercent}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={volumePercent}
            onChange={(e) => {
              // Convert 0-100 to 0-1
              const percent = Number(e.target.value);
              const normalized = percent / 100;
              onVolumeChange(normalized);
            }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            aria-label="Volume principale"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={volumePercent}
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Category Mixer (Accordion) */}
      {audioEnabled && (
        <div>
          <button
            onClick={() => setExpandMixer(!expandMixer)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-medium text-slate-900">
              Mixer (4 categorie)
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform ${
                expandMixer ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandMixer && (
            <div className="mt-3 space-y-4 pl-3 border-l-2 border-slate-200">
              {CATEGORIES.map((category) => {
                const gain = categoryGains[category];
                const gainPercent = Math.round(gain * 100);

                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-slate-900">
                        {CATEGORY_LABELS[category]}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-700 tabular-nums w-10 text-right">
                          {gainPercent}%
                        </span>
                        <button
                          onClick={() => playTestSound(category)}
                          disabled={testingSoundId !== null}
                          className={`p-1.5 rounded transition-colors ${
                            testingSoundId === category
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                          title={`Test ${CATEGORY_LABELS[category]}`}
                          aria-label={`Prova suono: ${CATEGORY_LABELS[category]}`}
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={gainPercent}
                      onChange={(e) => {
                        const percent = Number(e.target.value);
                        const normalized = percent / 100;
                        onCategoryVolumeChange(category, normalized);
                      }}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 text-sm"
                      aria-label={`Volume ${CATEGORY_LABELS[category]}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={gainPercent}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Vibration Toggle */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-900">
            Vibrazione
          </label>
          <button
            onClick={() => onToggleVibration(!vibrationEnabled)}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
              vibrationEnabled ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
            aria-label={vibrationEnabled ? 'Disabilita vibrazione' : 'Abilita vibrazione'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform m-1 ${
                vibrationEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {vibrationEnabled ? 'Abilitata su eventi importanti' : 'Disabilitata'}
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-1">
        <p className="font-medium text-slate-900">💡 Nota</p>
        <p>
          L'audio si inizializza al primo evento di gioco. Le impostazioni vengono salvate
          automaticamente.
        </p>
        {audioEnabled && (
          <p>
            Usa i test sound per verificare il mix prima di iniziare la partita.
          </p>
        )}
      </div>
    </div>
  );
};
