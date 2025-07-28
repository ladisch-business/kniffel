import React from 'react';
import { GamePlayer } from '../../types';
import { Users, Bot, Skull } from 'lucide-react';

interface PlayerListProps {
  players: GamePlayer[];
  currentPlayerIndex: number;
  myUserId?: string;
}

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentPlayerIndex,
  myUserId,
}) => {
  return (
    <div className="paper-texture rounded-lg p-4">
      <h3 className="text-lg font-semibold text-wood-dark dark:text-paper-light mb-4">
        Spieler
      </h3>
      
      <div className="space-y-2">
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`p-3 rounded-lg border-2 transition-all ${
              index === currentPlayerIndex
                ? 'border-wood-medium bg-wood-light dark:bg-anthracite-700 shadow-md'
                : 'border-transparent bg-gray-50 dark:bg-anthracite-800'
            } ${
              player.is_eliminated
                ? 'opacity-50 grayscale'
                : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {player.is_ai ? (
                  <Bot className="h-4 w-4 text-wood-medium" />
                ) : (
                  <Users className="h-4 w-4 text-wood-medium" />
                )}
                
                <span className={`font-medium ${
                  player.user_id === myUserId
                    ? 'text-wood-dark dark:text-paper-light font-bold'
                    : 'text-wood-medium dark:text-paper-medium'
                }`}>
                  {player.username || player.ai_name}
                  {player.user_id === myUserId && ' (Sie)'}
                </span>

                {player.is_eliminated && (
                  <Skull className="h-4 w-4 text-red-500" />
                )}
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-wood-dark dark:text-paper-light">
                  {player.total_score}
                </div>
                <div className="text-xs text-wood-medium dark:text-paper-medium">
                  Punkte
                </div>
              </div>
            </div>

            {index === currentPlayerIndex && !player.is_eliminated && (
              <div className="mt-2 text-xs text-wood-medium dark:text-paper-medium">
                ▶ Am Zug
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
