import React from "react";
import { Info } from "lucide-react";
import type { SettingsState } from "@/domain/match/types";

interface MatchTabProps {
  settings: SettingsState;
  onChange: (settings: Partial<SettingsState>) => void;
}

export const MatchTab: React.FC<MatchTabProps> = ({ settings, onChange }) => {
  const handleChange = (field: string, value: unknown) => {
    onChange({
      [field]: value,
    });
  };

  return (
    <div className="space-y-6 pb-4">
      {/* SECTION: Regular Time */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-bold text-gray-900">Tempi Regolamentari</h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Tempo Standard
          </span>
        </div>

        <div className="space-y-4">
          {/* Period Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durata di ogni Tempo (minuti)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="120"
                step="1"
                value={settings.periodDurationMinutes || 45}
                onChange={(e) =>
                  handleChange("periodDurationMinutes", parseInt(e.target.value))
                }
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-semibold"
              />
              <span className="text-gray-600">minuti</span>
              <div className="text-xs text-gray-500 ml-auto">
                Totale: {(settings.periodDurationMinutes || 45) * 2} minuti
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tempo di gioco per il primo e il secondo tempo
            </p>
          </div>

          {/* Halftime Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durata Intervallo (minuti)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="60"
                step="1"
                value={settings.halftimeDurationMinutes || 15}
                onChange={(e) =>
                  handleChange("halftimeDurationMinutes", parseInt(e.target.value))
                }
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-semibold"
              />
              <span className="text-gray-600">minuti</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pausa tra il primo e il secondo tempo
            </p>
          </div>
        </div>
      </div>

      {/* SECTION: Extra Time */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-bold text-gray-900">Tempo Supplementare</h3>
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
            Opzionale
          </span>
        </div>

        <div className="space-y-4">
          {/* Extra Time Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durata di ogni Supplementare (minuti)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="120"
                step="1"
                value={settings.extratimeDurationMinutes || 15}
                onChange={(e) =>
                  handleChange("extratimeDurationMinutes", parseInt(e.target.value))
                }
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center font-semibold"
              />
              <span className="text-gray-600">minuti</span>
              <div className="text-xs text-gray-500 ml-auto">
                Totale: {(settings.extratimeDurationMinutes || 15) * 2} minuti
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tempo di gioco per il primo e il secondo supplementare (se necessario)
            </p>
          </div>

          {/* Extra Time Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intervallo tra i Supplementari (minuti)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="30"
                step="1"
                value={
                  (settings as any).extratimeIntervalMinutes ||
                  5
                }
                onChange={(e) =>
                  handleChange("extratimeIntervalMinutes", parseInt(e.target.value))
                }
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center font-semibold"
              />
              <span className="text-gray-600">minuti</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pausa tra il primo e il secondo supplementare
            </p>
          </div>
        </div>
      </div>

      {/* SECTION: Timeouts */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-bold text-gray-900">Richieste di Pausa</h3>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            Timeout
          </span>
        </div>

        <div className="space-y-4">
          {/* Timeouts per Team */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numero di Timeout per Squadra
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="10"
                step="1"
                value={settings.timeoutsPerTeam || 1}
                onChange={(e) =>
                  handleChange("timeoutsPerTeam", parseInt(e.target.value))
                }
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center font-semibold"
              />
              <span className="text-gray-600">timeout</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Quante volte ogni squadra può chiedere una pausa
            </p>
          </div>

          {/* Timeout Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durata di un Timeout (secondi)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="10"
                max="300"
                step="10"
                value={settings.timeoutDurationSeconds || 60}
                onChange={(e) =>
                  handleChange("timeoutDurationSeconds", parseInt(e.target.value))
                }
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center font-semibold"
              />
              <span className="text-gray-600">secondi</span>
              <div className="text-xs text-gray-500 ml-auto">
                {Math.floor((settings.timeoutDurationSeconds || 60) / 60)}:{String(
                  ((settings.timeoutDurationSeconds || 60) % 60)
                ).padStart(2, "0")}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Durata di una singola richiesta di pausa
            </p>
          </div>
        </div>
      </div>

      {/* SECTION: Match Summary / Info */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 space-y-2">
            <p className="font-semibold text-slate-900">Durata Totale Partita (senza supplementari):</p>
            <p className="font-mono bg-white px-2 py-1 rounded border border-slate-200">
              {(settings.periodDurationMinutes || 45) * 2 + (settings.halftimeDurationMinutes || 15)} minuti
            </p>
            {settings.extratimeDurationMinutes && (
              <>
                <p className="font-semibold text-slate-900 mt-3">Con Supplementare:</p>
                <p className="font-mono bg-white px-2 py-1 rounded border border-slate-200">
                  +{(settings.extratimeDurationMinutes || 15) * 2 + ((settings as any).extratimeIntervalMinutes || 5)} minuti
                </p>
              </>
            )}
            <p className="font-semibold text-slate-900 mt-3">Configurazione Timeout:</p>
            <p>
              Ogni squadra ha {settings.timeoutsPerTeam || 1} timeout da{" "}
              {settings.timeoutDurationSeconds || 60} secondi l'uno
            </p>
          </div>
        </div>
      </div>

      {/* SECTION: Presets */}
      <div className="border-t border-gray-200 pt-4">
        <p className="text-xs font-semibold text-gray-700 mb-3">Regolamenti Predefiniti</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              handleChange("periodDurationMinutes", 45);
              handleChange("halftimeDurationMinutes", 15);
              handleChange("extratimeDurationMinutes", 15);
              handleChange("extratimeIntervalMinutes", 5);
              handleChange("timeoutsPerTeam", 1);
              handleChange("timeoutDurationSeconds", 60);
            }}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition text-gray-700"
          >
            🏆 Calcio (45+15+15)
          </button>

          <button
            onClick={() => {
              handleChange("periodDurationMinutes", 40);
              handleChange("halftimeDurationMinutes", 10);
              handleChange("extratimeDurationMinutes", 10);
              handleChange("extratimeIntervalMinutes", 5);
              handleChange("timeoutsPerTeam", 2);
              handleChange("timeoutDurationSeconds", 60);
            }}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition text-gray-700"
          >
            🏀 Pallone Elastico
          </button>

          <button
            onClick={() => {
              handleChange("periodDurationMinutes", 30);
              handleChange("halftimeDurationMinutes", 10);
              handleChange("extratimeDurationMinutes", 10);
              handleChange("extratimeIntervalMinutes", 3);
              handleChange("timeoutsPerTeam", 3);
              handleChange("timeoutDurationSeconds", 45);
            }}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition text-gray-700"
          >
            🎾 Futsal/Volley
          </button>

          <button
            onClick={() => {
              handleChange("periodDurationMinutes", 20);
              handleChange("halftimeDurationMinutes", 5);
              handleChange("extratimeDurationMinutes", 10);
              handleChange("extratimeIntervalMinutes", 2);
              handleChange("timeoutsPerTeam", 2);
              handleChange("timeoutDurationSeconds", 30);
            }}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition text-gray-700"
          >
            ⚾ Altre Attività
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Clicca sui pulsanti per applicare configurazioni standard di vari sport
        </p>
      </div>
    </div>
  );
};
