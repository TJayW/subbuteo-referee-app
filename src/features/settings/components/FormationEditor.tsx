import React, { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import type { Formation, Player } from '@/domain/match/types';

interface FormationEditorProps {
  formation: Formation;
  onChange?: (formation: Formation) => void;
}

export const FormationEditor: React.FC<FormationEditorProps> = ({ formation, onChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formationName, setFormationName] = useState(formation.name);
  const [players, setPlayers] = useState(formation.players);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    number: '',
    position: '',
    isCaptain: false,
  });

  const handleAddPlayer = () => {
    if (!editForm.name.trim()) return;

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: editForm.name,
      number: editForm.number ? parseInt(editForm.number) : undefined,
      position: editForm.position || undefined,
      isCaptain: editForm.isCaptain,
    };

    const newPlayers = editingId
      ? players.map((p) => (p.id === editingId ? { ...newPlayer, id: p.id } : p))
      : [...players, newPlayer];

    setPlayers(newPlayers);
    setEditForm({ name: '', number: '', position: '', isCaptain: false });
    setEditingId(null);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingId(player.id);
    setEditForm({
      name: player.name,
      number: player.number?.toString() || '',
      position: player.position || '',
      isCaptain: player.isCaptain || false,
    });
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditForm({ name: '', number: '', position: '', isCaptain: false });
    }
  };

  const handleSave = () => {
    onChange?.({
      name: formationName,
      players,
    });
    setIsModalOpen(false);
  };

  const playerCount = players.length;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-900">Formazione</label>

      {/* Summary Card */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full p-3 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <p className="text-sm font-semibold text-slate-900">{formationName}</p>
        <p className="text-xs text-slate-600">{playerCount} giocatori</p>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={() => setIsModalOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
              <h3 className="font-semibold text-slate-900 mb-4">Modifica Formazione</h3>

              {/* Formation Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome formazione
                </label>
                <input
                  type="text"
                  value={formationName}
                  onChange={(e) => setFormationName(e.target.value)}
                  placeholder="es. 4-4-2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Players List */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Giocatori ({playerCount})
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {player.number && `#${player.number} `}
                          {player.name}
                          {player.isCaptain && ' (C)'}
                        </p>
                        {player.position && (
                          <p className="text-xs text-slate-600">{player.position}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditPlayer(player)}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                          aria-label="Modifica"
                        >
                          <Edit2 className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleRemovePlayer(player.id)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          aria-label="Rimuovi"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add/Edit Player Form */}
              <div className="space-y-2 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Nome giocatore"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={editForm.number}
                    onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
                    placeholder="Numero"
                    min="1"
                    max="99"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={editForm.position}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    placeholder="Ruolo (GK, DEF...)"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isCaptain}
                    onChange={(e) => setEditForm({ ...editForm, isCaptain: e.target.checked })}
                    className="w-4 h-4 text-emerald-500 border-slate-300 rounded"
                  />
                  <span className="text-sm text-slate-700">Capitano</span>
                </label>

                <button
                  onClick={handleAddPlayer}
                  className="w-full px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {editingId ? 'Aggiorna' : 'Aggiungi'}
                </button>

                {editingId && (
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditForm({ name: '', number: '', position: '', isCaptain: false });
                    }}
                    className="w-full px-3 py-2 bg-slate-300 text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-400 transition-colors"
                  >
                    Annulla Modifica
                  </button>
                )}
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Salva Formazione
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
