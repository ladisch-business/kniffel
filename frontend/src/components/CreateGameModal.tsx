import React, { useState } from 'react';
import { X } from 'lucide-react';
import { GameSettings } from '../types';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGame: (settings: GameSettings) => void;
}

const CreateGameModal: React.FC<CreateGameModalProps> = ({
  isOpen,
  onClose,
  onCreateGame,
}) => {
  const [settings, setSettings] = useState<GameSettings>({
    mode: 'classic',
    maxPlayers: 4,
    aiPlayers: 0,
    isPublic: true,
    tournamentMode: false,
    jokerKniffel: false,
    fastGame: false,
    timeLimit: 60,
    multiBlocks: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateGame(settings);
    onClose();
  };

  const handleModeChange = (mode: GameSettings['mode']) => {
    setSettings(prev => ({
      ...prev,
      mode,
      multiBlocks: mode === 'multi_block' ? 3 : 1,
    }));
  };

  const handleTournamentToggle = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      tournamentMode: enabled,
      maxPlayers: enabled ? Math.max(prev.maxPlayers, 4) : prev.maxPlayers,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="paper-texture rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-wood-medium">
          <h2 className="text-2xl font-bold text-wood-dark dark:text-paper-light font-serif">
            Neues Spiel erstellen
          </h2>
          <button
            onClick={onClose}
            className="text-wood-medium hover:text-wood-dark dark:hover:text-paper-light transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-wood-dark dark:text-paper-light mb-3">
              Spielmodus
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'classic', label: 'Klassisches Kniffel', desc: 'Standard-Regelwerk mit bis zu 3 Würfen' },
                { value: 'eins_muss_weg', label: 'Eins muss weg', desc: 'Nach jedem Wurf muss mindestens ein Würfel beiseitegelegt werden' },
                { value: 'multi_block', label: 'Multi-Block', desc: 'Mehrere Spielblöcke parallel ausfüllen' },
              ].map((mode) => (
                <div
                  key={mode.value}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    settings.mode === mode.value
                      ? 'border-wood-dark bg-wood-light dark:border-paper-light dark:bg-anthracite-700'
                      : 'border-wood-medium hover:border-wood-dark dark:border-anthracite-600 dark:hover:border-paper-medium'
                  }`}
                  onClick={() => handleModeChange(mode.value as GameSettings['mode'])}
                >
                  <h4 className="font-semibold text-wood-dark dark:text-paper-light">{mode.label}</h4>
                  <p className="text-sm text-wood-medium dark:text-paper-medium mt-1">{mode.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {settings.mode === 'multi_block' && (
            <div>
              <label className="block text-sm font-medium text-wood-dark dark:text-paper-light mb-2">
                Anzahl Spielblöcke: {settings.multiBlocks}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={settings.multiBlocks}
                onChange={(e) => setSettings(prev => ({ ...prev, multiBlocks: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-wood-medium dark:text-paper-medium mt-1">
                <span>1</span>
                <span>10</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-wood-dark dark:text-paper-light mb-2">
                Maximale Spieleranzahl: {settings.maxPlayers}
              </label>
              <input
                type="range"
                min="2"
                max={settings.tournamentMode ? "10" : "5"}
                value={settings.maxPlayers}
                onChange={(e) => setSettings(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-wood-medium dark:text-paper-medium mt-1">
                <span>2</span>
                <span>{settings.tournamentMode ? '10' : '5'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-wood-dark dark:text-paper-light mb-2">
                KI-Gegner: {settings.aiPlayers}
              </label>
              <input
                type="range"
                min="0"
                max={settings.maxPlayers - 1}
                value={settings.aiPlayers}
                onChange={(e) => setSettings(prev => ({ ...prev, aiPlayers: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-wood-medium dark:text-paper-medium mt-1">
                <span>0</span>
                <span>{settings.maxPlayers - 1}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-wood-dark dark:text-paper-light mb-3">
              Optionale Regeln
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.tournamentMode}
                  onChange={(e) => handleTournamentToggle(e.target.checked)}
                  className="rounded border-wood-medium text-wood-medium focus:ring-wood-medium"
                />
                <span className="ml-2 text-wood-dark dark:text-paper-light">
                  Turniermodus (Eliminierung nach jedem Spiel)
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.jokerKniffel}
                  onChange={(e) => setSettings(prev => ({ ...prev, jokerKniffel: e.target.checked }))}
                  className="rounded border-wood-medium text-wood-medium focus:ring-wood-medium"
                />
                <span className="ml-2 text-wood-dark dark:text-paper-light">
                  Joker-Kniffel (weitere Kniffels als Joker verwenden)
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.fastGame}
                  onChange={(e) => setSettings(prev => ({ ...prev, fastGame: e.target.checked }))}
                  className="rounded border-wood-medium text-wood-medium focus:ring-wood-medium"
                />
                <span className="ml-2 text-wood-dark dark:text-paper-light">
                  Schnelles Spiel (Zeitlimit pro Zug)
                </span>
              </label>

              {settings.fastGame && (
                <div className="ml-6">
                  <label className="block text-sm text-wood-medium dark:text-paper-medium mb-2">
                    Zeitlimit: {settings.timeLimit} Sekunden
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="timeLimit"
                        checked={settings.timeLimit === 60}
                        onChange={() => setSettings(prev => ({ ...prev, timeLimit: 60 }))}
                        className="text-wood-medium focus:ring-wood-medium"
                      />
                      <span className="ml-2 text-wood-dark dark:text-paper-light">1 Minute</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="timeLimit"
                        checked={settings.timeLimit === 120}
                        onChange={() => setSettings(prev => ({ ...prev, timeLimit: 120 }))}
                        className="text-wood-medium focus:ring-wood-medium"
                      />
                      <span className="ml-2 text-wood-dark dark:text-paper-light">2 Minuten</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.isPublic}
                onChange={(e) => setSettings(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="rounded border-wood-medium text-wood-medium focus:ring-wood-medium"
              />
              <span className="ml-2 text-wood-dark dark:text-paper-light">
                Öffentliches Spiel (andere Spieler können beitreten)
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-wood-medium">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Spiel erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGameModal;
