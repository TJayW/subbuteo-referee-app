import React, { useState } from "react";
import { X, Keyboard, Info, AlertCircle, Save, XCircle } from "lucide-react";
import type { SettingsState } from "@/domain/match/types";
import type { SoundCategory } from "@/adapters/audio/audio-manifest";
import { SettingsTabs, type TabDef } from "../components/SettingsTabs";
import { AudioTab } from "../tabs/AudioTab";
import { TeamsTab } from "../tabs/TeamsTab";
import { MatchTab } from "../tabs/MatchTab";
import { ActionButton } from '@/ui/primitives/ActionButton';

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsState;
  onChange?: (settings: SettingsState) => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  onClose,
  settings,
  onChange,
}) => {
  // Match Tab State
  const [periodDuration, setPeriodDuration] = useState(settings.periodDurationMinutes);
  const [halftimeDuration, setHalftimeDuration] = useState(settings.halftimeDurationMinutes || 15);
  const [extratimeDuration, setExtratimeDuration] = useState(settings.extratimeDurationMinutes || 15);
  const [extratimeInterval, setExtratimeInterval] = useState((settings as any).extratimeIntervalMinutes || 5);
  const [timeoutsPerTeam, setTimeoutsPerTeam] = useState(settings.timeoutsPerTeam);
  const [timeoutDuration, setTimeoutDuration] = useState(settings.timeoutDurationSeconds || 60);

  // Audio Tab State
  const [audioEnabled, setAudioEnabled] = useState(settings.audioEnabled);
  const [audioVolume, setAudioVolume] = useState(settings.audioVolume);
  const [vibrationEnabled, setVibrationEnabled] = useState(settings.vibrationEnabled);
  const [categoryGains, setCategoryGains] = useState<Record<SoundCategory, number>>(
    settings.categoryGains ?? {
      referee: 1.0,
      crowd: 0.8,
      ui: 0.9,
      matchControl: 1.0,
    }
  );

  // Team & Officiating State
  const [homeTeamConfig, setHomeTeamConfig] = useState(settings.homeTeamConfig);
  const [awayTeamConfig, setAwayTeamConfig] = useState(settings.awayTeamConfig);
  const [referee1, setReferee1] = useState(settings.officiating.referee1);
  const [referee2, setReferee2] = useState(settings.officiating.referee2 || "");

  const handleSave = () => {
    onChange?.({
      ...settings,
      // Match timing
      periodDurationMinutes: periodDuration,
      halftimeDurationMinutes: halftimeDuration,
      extratimeDurationMinutes: extratimeDuration,
      extratimeIntervalMinutes: extratimeInterval,
      timeoutsPerTeam,
      timeoutDurationSeconds: timeoutDuration,
      // Audio
      audioEnabled,
      audioVolume,
      vibrationEnabled,
      categoryGains,
      // Teams
      homeTeamName: homeTeamConfig.displayName,
      awayTeamName: awayTeamConfig.displayName,
      homeTeamConfig,
      awayTeamConfig,
      // Officiating
      officiating: {
        referee1,
        referee2,
      },
    } as SettingsState);
    onClose();
  };

  if (!isOpen) return null;

  // Define all tabs in logical order
  const tabs: TabDef[] = [
    {
      id: 'squadre',
      label: '👥 Squadre',
      content: (
        <div className="pb-4">
          <TeamsTab
            homeTeamConfig={homeTeamConfig}
            awayTeamConfig={awayTeamConfig}
            onHomeTeamChange={setHomeTeamConfig}
            onAwayTeamChange={setAwayTeamConfig}
          />
        </div>
      ),
    },
    {
      id: 'partita',
      label: '⏱️ Partita',
      content: (
        <div className="pb-4">
          <MatchTab
            settings={{
              ...settings,
              periodDurationMinutes: periodDuration,
              halftimeDurationMinutes: halftimeDuration,
              extratimeDurationMinutes: extratimeDuration,
              extratimeIntervalMinutes: extratimeInterval,
              timeoutsPerTeam,
              timeoutDurationSeconds: timeoutDuration,
            }}
            onChange={(updates) => {
              if (updates.periodDurationMinutes) setPeriodDuration(updates.periodDurationMinutes);
              if (updates.halftimeDurationMinutes) setHalftimeDuration(updates.halftimeDurationMinutes);
              if (updates.extratimeDurationMinutes) setExtratimeDuration(updates.extratimeDurationMinutes);
              if (updates.timeoutsPerTeam !== undefined) setTimeoutsPerTeam(updates.timeoutsPerTeam);
              if (updates.timeoutDurationSeconds) setTimeoutDuration(updates.timeoutDurationSeconds);
              if ((updates as any).extratimeIntervalMinutes) setExtratimeInterval((updates as any).extratimeIntervalMinutes);
            }}
          />
        </div>
      ),
    },
    {
      id: 'audio',
      label: '🔊 Audio',
      content: (
        <div className="pb-4">
          <AudioTab
            audioEnabled={audioEnabled}
            audioVolume={audioVolume}
            vibrationEnabled={vibrationEnabled}
            categoryGains={categoryGains as Record<SoundCategory, number>}
            onToggleAudio={setAudioEnabled}
            onVolumeChange={setAudioVolume}
            onToggleVibration={setVibrationEnabled}
            onCategoryVolumeChange={(category, volume) => {
              setCategoryGains((prev) => ({
                ...prev,
                [category]: volume,
              }));
            }}
          />
        </div>
      ),
    },
    {
      id: 'arbitri',
      label: '👨‍⚖️ Arbitri',
      content: (
          <div className="space-y-6 pb-4">
          {/* Referee 1 */}
          <div>
            <label className="block ui-label mb-2">
              Arbitro Principale
            </label>
            <input
              type="text"
              value={referee1}
              onChange={(e) => setReferee1(e.target.value)}
              className="ui-input"
              placeholder="Nome arbitro principale"
            />
            <p className="ui-help mt-1">
              L'arbitro responsabile della partita
            </p>
          </div>

          {/* Referee 2 */}
          <div>
            <label className="block ui-label mb-2">
              Arbitro di Linea
            </label>
            <input
              type="text"
              value={referee2}
              onChange={(e) => setReferee2(e.target.value)}
              className="ui-input"
              placeholder="Nome arbitro di linea (opzionale)"
            />
            <p className="ui-help mt-1">
              L'arbitro assistente (opzionale)
            </p>
          </div>

          <div className="ui-surface-muted p-3 text-xs text-slate-700">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-sky-600" />
              <div>
                <p className="font-medium mb-1">Informazioni Arbitri</p>
                <p>Inserisci i nomi degli arbitri per il record ufficiale della partita.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'generale',
      label: '⚙️ Generale',
      content: (
        <div className="space-y-6 pb-4">
          {/* Keyboard Shortcuts */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Keyboard className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Scorciatoie Tastiera</h3>
            </div>
            <div className="space-y-2 ml-6">
              <div className="text-xs">
                <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
                  Cmd/Ctrl + Z
                </span>
                <span className="text-slate-600 ml-2">Annulla</span>
              </div>
              <div className="text-xs">
                <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
                  Shift + Cmd/Ctrl + Z
                </span>
                <span className="text-slate-600 ml-2">Ripeti</span>
              </div>
              <div className="text-xs">
                <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
                  Spazio
                </span>
                <span className="text-slate-600 ml-2">Play/Pausa Timer (quando attivo)</span>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Informazioni App</h3>
            </div>
            <div className="ml-6 space-y-2 text-xs text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">Subbuteo Referee App</span>
              </p>
              <p>
                Versione: <span className="font-mono text-slate-700">1.0.0</span>
              </p>
              <p>
                Per segnalare bug o suggerire funzionalità, contatta il team di sviluppo.
              </p>
              <div className="pt-2 border-t border-slate-200">
                <p className="font-medium text-slate-900 mb-1">Funzionalità Principali:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Cronometraggio match in tempo reale</li>
                  <li>Registrazione eventi (goal, cartellini, etc)</li>
                  <li>Gestione squadre e giocatori</li>
                  <li>Sincronizzazione dati via cloud</li>
                  <li>Report statistici e esportazione</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reset Settings */}
          <div className="border-t border-slate-200 pt-4">
            <button
              onClick={() => {
                // Reset all to defaults
                setPeriodDuration(45);
                setHalftimeDuration(15);
                setExtratimeDuration(15);
                setExtratimeInterval(5);
                setTimeoutsPerTeam(1);
                setTimeoutDuration(60);
                setAudioEnabled(true);
                setAudioVolume(0.6);
                setVibrationEnabled(true);
                setCategoryGains({
                  referee: 1.0,
                  crowd: 0.8,
                  ui: 0.9,
                  matchControl: 1.0,
                });
              }}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 transition text-center"
            >
              🔄 Ripristina Valori Standard
            </button>
          </div>

          {/* Support */}
          <div className="ui-surface-muted p-3 text-xs text-slate-700">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-medium mb-1">Suggerimenti</p>
                <p>Accedi regolarmente alle impostazioni per mantenere i dati della squadra aggiornati.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-end lg:items-center justify-center z-50 p-4 lg:p-0">
        <div className="w-full lg:w-[600px] ui-surface rounded-t-2xl lg:rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header - Fixed */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-xl text-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-200 z-10">
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-xl">Impostazioni</h2>
              <p className="text-sm text-slate-500 truncate">
                {homeTeamConfig.displayName} vs {awayTeamConfig.displayName} • {periodDuration}′
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 ml-2"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs with scrollable content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-6">
              <SettingsTabs tabs={tabs} />
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="sticky bottom-0 bg-slate-50/80 border-t border-slate-200 px-6 py-4 flex gap-3 flex-shrink-0">
            <ActionButton
              action="secondary"
              size="md"
              onClick={onClose}
              icon={<XCircle className="w-4 h-4" />}
              className="flex-1"
            >
              Annulla
            </ActionButton>
            <ActionButton
              action="primary"
              size="md"
              onClick={handleSave}
              icon={<Save className="w-4 h-4" />}
              className="flex-1"
            >
              Salva Modifiche
            </ActionButton>
          </div>
        </div>
      </div>
    </>
  );
};
