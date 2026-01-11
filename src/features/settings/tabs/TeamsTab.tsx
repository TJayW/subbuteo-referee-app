import React from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { TEAM_COLOR_PALETTE } from "@/domain/settings/defaults";
import type { TeamConfig, Player } from "@/domain/match/types";

interface TeamsTabProps {
  homeTeamConfig: TeamConfig;
  awayTeamConfig: TeamConfig;
  onHomeTeamChange: (config: TeamConfig) => void;
  onAwayTeamChange: (config: TeamConfig) => void;
}

export const TeamsTab: React.FC<TeamsTabProps> = ({
  homeTeamConfig,
  awayTeamConfig,
  onHomeTeamChange,
  onAwayTeamChange,
}) => {
  const [homeExpanded, setHomeExpanded] = React.useState(false);
  const [awayExpanded, setAwayExpanded] = React.useState(false);
  const [homeFormationExpanded, setHomeFormationExpanded] = React.useState(false);
  const [awayFormationExpanded, setAwayFormationExpanded] = React.useState(false);

  // Standard formations
  const FORMATIONS = [
    '4-4-2',
    '4-3-3',
    '3-5-2',
    '5-3-2',
    '4-2-3-1',
    '3-3-4',
  ];

  const handleTeamNameChange = (team: 'home' | 'away', name: string) => {
    if (team === 'home') {
      onHomeTeamChange({ ...homeTeamConfig, displayName: name });
    } else {
      onAwayTeamChange({ ...awayTeamConfig, displayName: name });
    }
  };

  const handleCoachChange = (team: 'home' | 'away', coach: string) => {
    if (team === 'home') {
      onHomeTeamChange({ ...homeTeamConfig, coach });
    } else {
      onAwayTeamChange({ ...awayTeamConfig, coach });
    }
  };

  const handleFormationChange = (team: 'home' | 'away', formationName: string) => {
    if (team === 'home') {
      onHomeTeamChange({
        ...homeTeamConfig,
        formation: {
          ...homeTeamConfig.formation,
          name: formationName,
        },
      });
    } else {
      onAwayTeamChange({
        ...awayTeamConfig,
        formation: {
          ...awayTeamConfig.formation,
          name: formationName,
        },
      });
    }
  };

  const handleColorChange = (team: 'home' | 'away', colorKey: string) => {
    const color = TEAM_COLOR_PALETTE[colorKey];
    if (color) {
      if (team === 'home') {
        onHomeTeamChange({
          ...homeTeamConfig,
          color,
        });
      } else {
        onAwayTeamChange({
          ...awayTeamConfig,
          color,
        });
      }
    }
  };

  const handleAddPlayer = (team: 'home' | 'away') => {
    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name: `Giocatore`,
      number: (team === 'home' ? homeTeamConfig.formation.players.length : awayTeamConfig.formation.players.length) + 1,
      position: 'MID',
    };

    if (team === 'home') {
      onHomeTeamChange({
        ...homeTeamConfig,
        formation: {
          ...homeTeamConfig.formation,
          players: [...homeTeamConfig.formation.players, newPlayer],
        },
      });
    } else {
      onAwayTeamChange({
        ...awayTeamConfig,
        formation: {
          ...awayTeamConfig.formation,
          players: [...awayTeamConfig.formation.players, newPlayer],
        },
      });
    }
  };

  const handleUpdatePlayer = (
    team: 'home' | 'away',
    playerId: string,
    updatedPlayer: Partial<Player>
  ) => {
    if (team === 'home') {
      onHomeTeamChange({
        ...homeTeamConfig,
        formation: {
          ...homeTeamConfig.formation,
          players: homeTeamConfig.formation.players.map((p) =>
            p.id === playerId ? { ...p, ...updatedPlayer } : p
          ),
        },
      });
    } else {
      onAwayTeamChange({
        ...awayTeamConfig,
        formation: {
          ...awayTeamConfig.formation,
          players: awayTeamConfig.formation.players.map((p) =>
            p.id === playerId ? { ...p, ...updatedPlayer } : p
          ),
        },
      });
    }
  };

  const handleRemovePlayer = (team: 'home' | 'away', playerId: string) => {
    if (team === 'home') {
      onHomeTeamChange({
        ...homeTeamConfig,
        formation: {
          ...homeTeamConfig.formation,
          players: homeTeamConfig.formation.players.filter((p) => p.id !== playerId),
        },
      });
    } else {
      onAwayTeamChange({
        ...awayTeamConfig,
        formation: {
          ...awayTeamConfig.formation,
          players: awayTeamConfig.formation.players.filter((p) => p.id !== playerId),
        },
      });
    }
  };

  const TeamSection = ({
    config,
    expanded,
    formationExpanded,
    setExpanded,
    setFormationExpanded,
    onNameChange,
    onCoachChange,
    onFormationChange,
    onColorChange,
    onAddPlayer,
    onUpdatePlayer,
    onRemovePlayer,
  }: any) => (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition"
      >
        <span className="font-semibold text-gray-800">{config.displayName || 'Squadra'}</span>
        <ChevronDown
          size={20}
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="p-4 space-y-4 bg-white">
          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Squadra
            </label>
            <input
              type="text"
              value={config.displayName}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Coach */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allenatore
            </label>
            <input
              type="text"
              value={config.coach || ''}
              onChange={(e) => onCoachChange(e.target.value)}
              placeholder="Nome allenatore/manager"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Colore Squadra
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(TEAM_COLOR_PALETTE).map(([key, color]) => (
                <button
                  key={key}
                  onClick={() => onColorChange(key)}
                  className={`h-10 rounded-md border-2 transition ${
                    config.color.primary === color.primary
                      ? 'border-gray-800'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.primary }}
                  title={key}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: config.color.primary }}
              />
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: config.color.secondary }}
              />
              <span className="text-xs text-gray-600">
                {config.color.primary} / {config.color.secondary}
              </span>
            </div>
          </div>

          {/* Formation */}
          <div className="border-t pt-4">
            <button
              onClick={() => setFormationExpanded(!formationExpanded)}
              className="w-full px-3 py-2 flex items-center justify-between bg-blue-50 hover:bg-blue-100 rounded-md transition"
            >
              <span className="font-medium text-blue-900">
                Formazione: {config.formation.name} ({config.formation.players.length} giocatori)
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform ${formationExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {formationExpanded && (
              <div className="mt-3 space-y-3 bg-blue-50 p-3 rounded-md">
                {/* Formation Presets */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Formazione Predefinita
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {FORMATIONS.map((f) => (
                      <button
                        key={f}
                        onClick={() => onFormationChange(f)}
                        className={`px-3 py-2 text-xs font-medium rounded-md transition ${
                          config.formation.name === f
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Players List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-700">
                      Giocatori ({config.formation.players.length})
                    </label>
                    <button
                      onClick={() => onAddPlayer()}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition"
                    >
                      <Plus size={14} />
                      Aggiungi
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {config.formation.players.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">
                        Nessun giocatore. Aggiungi i giocatori della squadra.
                      </p>
                    ) : (
                      config.formation.players.map((player: Player, idx: number) => (
                        <div key={player.id} className="flex items-center gap-2 bg-white p-2 rounded border border-blue-200">
                          <input
                            type="number"
                            min="0"
                            max="99"
                            value={player.number || idx + 1}
                            onChange={(e) =>
                              onUpdatePlayer(player.id, {
                                number: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-10 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="N"
                          />

                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) =>
                              onUpdatePlayer(player.id, { name: e.target.value })
                            }
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nome"
                          />

                          <select
                            value={player.position || 'MID'}
                            onChange={(e) =>
                              onUpdatePlayer(player.id, { position: e.target.value })
                            }
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="GK">GK</option>
                            <option value="DEF">DEF</option>
                            <option value="MID">MID</option>
                            <option value="ATT">ATT</option>
                          </select>

                          <button
                            onClick={() => onRemovePlayer(player.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <TeamSection
        config={homeTeamConfig}
        expanded={homeExpanded}
        formationExpanded={homeFormationExpanded}
        setExpanded={setHomeExpanded}
        setFormationExpanded={setHomeFormationExpanded}
        onNameChange={(name: string) => handleTeamNameChange('home', name)}
        onCoachChange={(coach: string) => handleCoachChange('home', coach)}
        onFormationChange={(formationName: string) => handleFormationChange('home', formationName)}
        onColorChange={(colorKey: string) => handleColorChange('home', colorKey)}
        onAddPlayer={() => handleAddPlayer('home')}
        onUpdatePlayer={(playerId: string, player: Partial<Player>) => handleUpdatePlayer('home', playerId, player)}
        onRemovePlayer={(playerId: string) => handleRemovePlayer('home', playerId)}
      />

      <TeamSection
        config={awayTeamConfig}
        expanded={awayExpanded}
        formationExpanded={awayFormationExpanded}
        setExpanded={setAwayExpanded}
        setFormationExpanded={setAwayFormationExpanded}
        onNameChange={(name: string) => handleTeamNameChange('away', name)}
        onCoachChange={(coach: string) => handleCoachChange('away', coach)}
        onFormationChange={(formationName: string) => handleFormationChange('away', formationName)}
        onColorChange={(colorKey: string) => handleColorChange('away', colorKey)}
        onAddPlayer={() => handleAddPlayer('away')}
        onUpdatePlayer={(playerId: string, player: Partial<Player>) => handleUpdatePlayer('away', playerId, player)}
        onRemovePlayer={(playerId: string) => handleRemovePlayer('away', playerId)}
      />
    </div>
  );
};
