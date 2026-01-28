import React, { useState } from 'react';
import type { TeamColor } from '@/domain/match/types';
import { TEAM_COLOR_PALETTE, isValidHexColor, getContrastTextColor } from '@/domain/settings/defaults';

interface TeamColorPickerProps {
  color: TeamColor;
  onChange?: (color: TeamColor) => void;
}

export const TeamColorPicker: React.FC<TeamColorPickerProps> = ({ color, onChange }) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customHex, setCustomHex] = useState(color.primary);
  const [customError, setCustomError] = useState('');

  const applyColorChange = (nextColor: TeamColor, options?: { clearError?: boolean }) => {
    onChange?.(nextColor);
    setShowCustom(false);
    if (options?.clearError) {
      setCustomError('');
    }
  };

  const handlePresetClick = (paletteColor: TeamColor) => {
    applyColorChange(paletteColor, { clearError: false });
  };

  const handleCustomSubmit = () => {
    if (!isValidHexColor(customHex)) {
      setCustomError('Formato non valido. Usa #RRGGBB');
      return;
    }
    applyColorChange(
      {
        primary: customHex,
        secondary: color.secondary,
      },
      { clearError: true },
    );
  };

  return (
    <div className="space-y-3">
      <label className="block ui-label">Colore Squadra</label>

      {/* Preset Palette */}
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(TEAM_COLOR_PALETTE).map(([key, palette]) => (
          <button
            key={key}
            onClick={() => handlePresetClick(palette)}
            className={`h-10 rounded-lg border-2 transition-transform hover:scale-105 ${
              color.primary === palette.primary
                ? 'border-slate-900 ring-2 ring-slate-900 ring-offset-2'
                : 'border-slate-300'
            }`}
            style={{ backgroundColor: palette.primary }}
            title={key}
            aria-label={`Colore ${key}`}
          />
        ))}
      </div>

      {/* Custom Color Input */}
      <div>
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="text-sm text-sky-700 hover:text-sky-800 font-medium"
        >
          {showCustom ? '✕ Annulla' : '+ Colore personalizzato'}
        </button>
        {showCustom && (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              placeholder="#000000"
              value={customHex}
              onChange={(e) => {
                setCustomHex(e.target.value);
                setCustomError('');
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                customError
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-sky-500'
              }`}
            />
            {customError && <p className="text-xs text-red-600">{customError}</p>}
            <button
              onClick={handleCustomSubmit}
              className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Applica
            </button>
          </div>
        )}
      </div>

      {/* Color Preview */}
      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg border-2 border-slate-300 shadow-sm"
            style={{ backgroundColor: color.primary }}
          />
          <div className="flex-1">
            <p className="text-xs text-slate-600">Colore selezionato</p>
            <p className="text-sm font-mono font-semibold text-slate-900">{color.primary}</p>
            <p
              className="text-xs font-semibold"
              style={{ color: getContrastTextColor(color.primary) }}
            >
              Testo: {getContrastTextColor(color.primary) === '#000000' ? 'Nero' : 'Bianco'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
