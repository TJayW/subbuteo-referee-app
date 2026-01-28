/**
 * Audio Settings Section (for SettingsSheet)
 * 
 * Provides:
 * - Master volume dial + mute button
 * - Per-category volume sliders (Referee, Crowd, UI, Match Control)
 * - Test sound buttons for each category
 * - Clean, premium UI consistent with app design
 */

import React, { useState, useCallback } from 'react';
import { Play } from 'lucide-react';
import { VolumeDial } from '@/ui/primitives/VolumeDial';
import AudioEngine from '@/adapters/audio/audio-engine';
import type { SoundCategory } from '@/adapters/audio/audio-manifest';
import { CATEGORY_LABELS, CATEGORY_TEST_SOUNDS } from '@/adapters/audio/constants';
import logger from '@/utils/logger';

interface AudioSettingsSectionProps {
  masterVolume: number; // 0-1
  enabled: boolean;
  categoryGains: Record<SoundCategory, number>; // 0-1
  onMasterVolumeChange: (volume: number) => void;
  onToggleEnabled: (enabled: boolean) => void;
  onCategoryVolumeChange: (category: SoundCategory, volume: number) => void;
}

export const AudioSettingsSection: React.FC<AudioSettingsSectionProps> = ({
  masterVolume,
  enabled,
  categoryGains,
  onMasterVolumeChange,
  onToggleEnabled,
  onCategoryVolumeChange,
}) => {
  const [expandAdvanced, setExpandAdvanced] = useState(false);
  const engine = AudioEngine.getInstance();

  /**
   * Play test sound for a category
   */
  const playTestSound = useCallback(async (category: SoundCategory) => {
    try {
      await engine.init();
      const soundId = CATEGORY_TEST_SOUNDS[category];
      await engine.play(soundId);
    } catch (error) {
      logger.error('Test sound failed:', error);
    }
  }, [engine]);

  return (
    <div className="space-y-6">
      {/* Main Audio Toggle + Master Volume */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Audio</h3>
          <button
            onClick={() => onToggleEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
              enabled ? 'bg-slate-900' : 'bg-slate-300'
            }`}
            aria-label={enabled ? 'Disabilita audio' : 'Abilita audio'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform m-1 ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Master Volume Dial */}
        {enabled && (
          <div className="flex justify-center py-6 bg-slate-50 rounded-lg">
            <VolumeDial
              volume={Math.round(masterVolume * 100)}
              enabled={enabled}
              onChange={(v) => onMasterVolumeChange(v / 100)}
              onToggle={onToggleEnabled}
            />
          </div>
        )}

        {enabled && (
          <p className="text-xs text-slate-500 text-center mt-2">
            Volume principale: {Math.round(masterVolume * 100)}%
          </p>
        )}
      </div>

      {/* Category Mixer (Advanced Section) */}
      {enabled && (
        <div className="border-t border-slate-200 pt-6">
          <button
            onClick={() => setExpandAdvanced(!expandAdvanced)}
            className="flex items-center justify-between w-full text-sm font-medium text-slate-900 hover:text-slate-700 transition-colors"
          >
            <span>Mixer Per Categoria</span>
            <span className={`transform transition-transform ${expandAdvanced ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {expandAdvanced && (
            <div className="mt-4 space-y-5">
              {(['referee', 'crowd', 'ui', 'matchControl'] as const).map((category) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-900">
                      {CATEGORY_LABELS[category]}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500 w-8 text-right">
                        {Math.round(categoryGains[category] * 100)}%
                      </span>
                      <button
                        onClick={() => playTestSound(category)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        title={`Riproduci suono di prova: ${CATEGORY_LABELS[category]}`}
                        aria-label={`Riproduci suono di prova: ${CATEGORY_LABELS[category]}`}
                      >
                        <Play className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(categoryGains[category] * 100)}
                    onChange={(e) =>
                      onCategoryVolumeChange(category, Number(e.target.value) / 100)
                    }
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    aria-label={CATEGORY_LABELS[category]}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info box */}
      {enabled && (
        <div className="ui-surface-muted p-3 text-xs text-slate-700 space-y-1">
          <p className="font-medium text-slate-900">Audio abilitato</p>
          <p>
            I suoni riprodotti per ogni evento di partita contribuiranno a una miglior
            esperienza di arbitraggio.
          </p>
        </div>
      )}

      {!enabled && (
        <div className="ui-surface-muted p-3 text-xs text-slate-600">
          <p>L'audio è disabilitato. Abilita l'audio sopra per attivare effetti sonori.</p>
        </div>
      )}
    </div>
  );
};
