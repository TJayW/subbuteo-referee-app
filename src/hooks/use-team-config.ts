/**
 * Custom hook for managing team configuration
 * Eliminates duplication between home/away team handlers
 */

import { useCallback } from 'react';
import type { TeamConfig, Player, TeamColor } from '@/domain/match/types';

interface UseTeamConfigProps {
  config: TeamConfig;
  onChange: (config: TeamConfig) => void;
}

interface UseTeamConfigReturn {
  updateName: (name: string) => void;
  updateCoach: (coach: string) => void;
  updateFormation: (formationName: string) => void;
  updateColor: (colorKey: string, palette: Record<string, TeamColor>) => void;
  addPlayer: () => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  removePlayer: (playerId: string) => void;
}

/**
 * Hook for managing team configuration with memoized handlers
 */
export function useTeamConfig({ config, onChange }: UseTeamConfigProps): UseTeamConfigReturn {
  
  const updateName = useCallback((name: string) => {
    onChange({ ...config, displayName: name });
  }, [config, onChange]);

  const updateCoach = useCallback((coach: string) => {
    onChange({ ...config, coach });
  }, [config, onChange]);

  const updateFormation = useCallback((formationName: string) => {
    onChange({
      ...config,
      formation: {
        ...config.formation,
        name: formationName,
      },
    });
  }, [config, onChange]);

  const updateColor = useCallback((colorKey: string, palette: Record<string, TeamColor>) => {
    const color = palette[colorKey];
    if (color) {
      onChange({ ...config, color });
    }
  }, [config, onChange]);

  const addPlayer = useCallback(() => {
    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name: `Giocatore`,
      number: config.formation.players.length + 1,
      position: 'MID',
    };
    
    onChange({
      ...config,
      formation: {
        ...config.formation,
        players: [...config.formation.players, newPlayer],
      },
    });
  }, [config, onChange]);

  const updatePlayer = useCallback((playerId: string, updates: Partial<Player>) => {
    onChange({
      ...config,
      formation: {
        ...config.formation,
        players: config.formation.players.map((p) =>
          p.id === playerId ? { ...p, ...updates } : p
        ),
      },
    });
  }, [config, onChange]);

  const removePlayer = useCallback((playerId: string) => {
    onChange({
      ...config,
      formation: {
        ...config.formation,
        players: config.formation.players.filter((p) => p.id !== playerId),
      },
    });
  }, [config, onChange]);

  return {
    updateName,
    updateCoach,
    updateFormation,
    updateColor,
    addPlayer,
    updatePlayer,
    removePlayer,
  };
}
