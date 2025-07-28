import React from 'react';
import { Game } from '../types';
import { Users, Clock, Trophy, Play } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onJoin: () => void;
  getGameModeLabel: (mode: string) => string;
}

const GameCard: React.FC<GameCardProps> = ({ game, onJoin, getGameModeLabel }) => {
  const currentPlayers = game.players?.length || 0;
  const canJoin = game.status === 'waiting' && currentPlayers < game.max_players;

  return (
    <div className="border border-wood-medium rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-wood-dark dark:text-paper-light">
            {getGameModeLabel(game.mode)}
          </h3>
          <p className="text-sm text-wood-medium dark:text-paper-medium">
            Erstellt von: {game.created_by}
          </p>
        </div>
        <div className="flex items-center space-x-1 text-sm text-wood-medium dark:text-paper-medium">
          <Users className="h-4 w-4" />
          <span>{currentPlayers}/{game.max_players}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {game.tournament_mode && (
          <div className="flex items-center space-x-1 text-sm text-wood-medium dark:text-paper-medium">
            <Trophy className="h-4 w-4" />
            <span>Turniermodus</span>
          </div>
        )}
        
        {game.fast_game && (
          <div className="flex items-center space-x-1 text-sm text-wood-medium dark:text-paper-medium">
            <Clock className="h-4 w-4" />
            <span>{game.time_limit}s pro Zug</span>
          </div>
        )}

        {game.joker_kniffel && (
          <div className="text-sm text-wood-medium dark:text-paper-medium">
            Joker-Kniffel aktiviert
          </div>
        )}

        {game.mode === 'multi_block' && (
          <div className="text-sm text-wood-medium dark:text-paper-medium">
            {game.multi_blocks} Spielblöcke
          </div>
        )}
      </div>

      <button
        onClick={onJoin}
        disabled={!canJoin}
        className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
          canJoin
            ? 'bg-wood-medium hover:bg-wood-dark text-paper-light'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        <Play className="h-4 w-4" />
        <span>{canJoin ? 'Beitreten' : 'Spiel läuft'}</span>
      </button>
    </div>
  );
};

export default GameCard;
