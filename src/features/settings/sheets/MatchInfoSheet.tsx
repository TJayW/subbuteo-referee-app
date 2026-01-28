import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import type { SettingsState, TeamKey } from '@/domain/match/types';
import { TeamColorPicker } from '../components/TeamColorPicker';
import { FormationEditor } from '../components/FormationEditor';
import { OfficiatingSection } from '../components/OfficiatingSection';
import { MatchConfigDisplay } from '../components/MatchConfigDisplay';

interface MatchInfoSheetProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsState;
  onChange?: (settings: SettingsState) => void;
}

type TabType = 'config' | 'teams' | 'officiating' | 'settings';

export const MatchInfoSheet: React.FC<MatchInfoSheetProps> = ({
  isOpen,
  onClose,
  settings,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('teams');
  const [expandedTeam, setExpandedTeam] = useState<TeamKey | null>('home');

  const handleSettingsChange = (updates: Partial<SettingsState>) => {
    onChange?.({ ...settings, ...updates });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-end lg:items-center justify-center z-50">
        <div className="w-full lg:w-96 ui-surface rounded-t-2xl lg:rounded-xl shadow-2xl max-h-[90vh] lg:max-h-none overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Informazioni Partita</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Chiudi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 overflow-x-auto">
            <button
              onClick={() => setActiveTab('config')}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'config'
                  ? 'border-b-2 border-slate-900 text-slate-900 bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Configura
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'teams'
                  ? 'border-b-2 border-slate-900 text-slate-900 bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Squadre
            </button>
            <button
              onClick={() => setActiveTab('officiating')}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'officiating'
                  ? 'border-b-2 border-slate-900 text-slate-900 bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Arbitri
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'border-b-2 border-slate-900 text-slate-900 bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Impostazioni
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* CONFIG TAB */}
            {activeTab === 'config' && (
              <MatchConfigDisplay settings={settings} compact={false} />
            )}

            {/* TEAMS TAB */}
            {activeTab === 'teams' && (
              <div className="space-y-4">
                {/* Home Team */}
                <div className="ui-surface overflow-hidden">
                  <button
                    onClick={() => setExpandedTeam(expandedTeam === 'home' ? null : 'home')}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-slate-300"
                        style={{ backgroundColor: settings.homeTeamConfig.color.primary }}
                      />
                      <div className="flex flex-col items-start">
                        <span className="text-xs font-bold text-slate-500">CASA</span>
                        <span className="font-medium text-slate-900">{settings.homeTeamConfig.displayName}</span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-600 transition-transform ${
                        expandedTeam === 'home' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedTeam === 'home' && (
                    <div className="p-3 space-y-4 border-t border-slate-200">
                      {/* Team Name Input */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">
                          Nome squadra
                        </label>
                        <input
                          type="text"
                          maxLength={24}
                          placeholder="es. Juventus"
                          value={settings.homeTeamConfig.displayName}
                          onChange={(e) => {
                            const trimmed = e.target.value.trim();
                            const displayName = trimmed || 'Casa';
                            handleSettingsChange({
                              homeTeamConfig: {
                                ...settings.homeTeamConfig,
                                displayName,
                              },
                            });
                          }}
                          className="ui-input"
                        />
                      </div>

                      {/* Color Picker */}
                      <TeamColorPicker
                        color={settings.homeTeamConfig.color}
                        onChange={(color) =>
                          handleSettingsChange({
                            homeTeamConfig: {
                              ...settings.homeTeamConfig,
                              color,
                            },
                          })
                        }
                      />

                      {/* Formation Editor */}
                      <FormationEditor
                        formation={settings.homeTeamConfig.formation}
                        onChange={(formation) =>
                          handleSettingsChange({
                            homeTeamConfig: {
                              ...settings.homeTeamConfig,
                              formation,
                            },
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Away Team */}
                <div className="ui-surface overflow-hidden">
                  <button
                    onClick={() => setExpandedTeam(expandedTeam === 'away' ? null : 'away')}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-slate-300"
                        style={{ backgroundColor: settings.awayTeamConfig.color.primary }}
                      />
                      <div className="flex flex-col items-start">
                        <span className="text-xs font-bold text-slate-500">OSPITE</span>
                        <span className="font-medium text-slate-900">{settings.awayTeamConfig.displayName}</span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-600 transition-transform ${
                        expandedTeam === 'away' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedTeam === 'away' && (
                    <div className="p-3 space-y-4 border-t border-slate-200">
                      {/* Team Name Input */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">
                          Nome squadra
                        </label>
                        <input
                          type="text"
                          maxLength={24}
                          placeholder="es. Milano"
                          value={settings.awayTeamConfig.displayName}
                          onChange={(e) => {
                            const trimmed = e.target.value.trim();
                            const displayName = trimmed || 'Ospite';
                            handleSettingsChange({
                              awayTeamConfig: {
                                ...settings.awayTeamConfig,
                                displayName,
                              },
                            });
                          }}
                          className="ui-input"
                        />
                      </div>

                      {/* Color Picker */}
                      <TeamColorPicker
                        color={settings.awayTeamConfig.color}
                        onChange={(color) =>
                          handleSettingsChange({
                            awayTeamConfig: {
                              ...settings.awayTeamConfig,
                              color,
                            },
                          })
                        }
                      />

                      {/* Formation Editor */}
                      <FormationEditor
                        formation={settings.awayTeamConfig.formation}
                        onChange={(formation) =>
                          handleSettingsChange({
                            awayTeamConfig: {
                              ...settings.awayTeamConfig,
                              formation,
                            },
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* OFFICIATING TAB */}
            {activeTab === 'officiating' && (
              <OfficiatingSection
                officiating={settings.officiating}
                onChange={(officiating: SettingsState['officiating']) => handleSettingsChange({ officiating })}
              />
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div>
                  <label className="block ui-label mb-2">
                    Durata tempo (minuti)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={settings.periodDurationMinutes}
                    onChange={(e) =>
                      handleSettingsChange({
                        periodDurationMinutes: parseInt(e.target.value) || 45,
                      })
                    }
                    className="ui-input"
                  />
                </div>

                <div>
                  <label className="block ui-label mb-2">
                    Timeout per squadra
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={settings.timeoutsPerTeam}
                    onChange={(e) =>
                      handleSettingsChange({
                        timeoutsPerTeam: parseInt(e.target.value) || 1,
                      })
                    }
                    className="ui-input"
                  />
                </div>

                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.audioEnabled}
                    onChange={(e) => handleSettingsChange({ audioEnabled: e.target.checked })}
                    className="w-4 h-4 text-slate-900 border-slate-300 rounded"
                  />
                  <span className="text-sm font-medium text-slate-900">Suoni abilitati</span>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.vibrationEnabled}
                    onChange={(e) =>
                      handleSettingsChange({ vibrationEnabled: e.target.checked })
                    }
                    className="w-4 h-4 text-slate-900 border-slate-300 rounded"
                  />
                  <span className="text-sm font-medium text-slate-900">Vibrazione abilitata</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
