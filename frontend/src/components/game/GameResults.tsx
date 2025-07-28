import React from 'react';
import { Game, GamePlayer } from '../../types';
import { Trophy, Medal, Award, Users, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameResultsProps {
  game: Game;
  winners: any[];
  players: GamePlayer[];
  onLeaveGame: () => void;
}

const GameResults: React.FC<GameResultsProps> = ({
  game,
  winners,
  players,
  onLeaveGame,
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.total_score - a.total_score);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 2: return <Medal className="h-8 w-8 text-gray-400" />;
      case 3: return <Award className="h-8 w-8 text-amber-600" />;
      default: return <Users className="h-6 w-6 text-wood-medium" />;
    }
  };

  const getGameModeLabel = (mode: string) => {
    switch (mode) {
      case 'classic': return 'Klassisches Kniffel';
      case 'eins_muss_weg': return 'Eins muss weg';
      case 'multi_block': return 'Multi-Block';
      default: return mode;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="paper-texture rounded-lg p-8 text-center"
      >
        <div className="mb-8">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center mb-4"
          >
            <Trophy className="h-16 w-16 text-yellow-500" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-wood-dark dark:text-paper-light font-serif mb-2">
            Spiel beendet!
          </h1>
          
          <p className="text-lg text-wood-medium dark:text-paper-medium">
            {getGameModeLabel(game.mode)}
            {game.tournament_mode && ' - Turnier'}
          </p>
        </div>

        {/* Winner Announcement */}
        {winners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-800"
          >
            <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
              🎉 Gewinner 🎉
            </h2>
            <div className="space-y-2">
              {winners.map((winner) => (
                <div key={winner.id} className="text-xl font-semibold text-yellow-700 dark:text-yellow-300">
                  {winner.username || winner.ai_name} - {winner.total_score} Punkte
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Final Standings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-wood-dark dark:text-paper-light mb-6 font-serif">
            Endstand
          </h2>
          
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index === 0
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700'
                    : index === 1
                    ? 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600'
                    : index === 2
                    ? 'bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700'
                    : 'bg-wood-light dark:bg-anthracite-700 border border-wood-medium dark:border-anthracite-600'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <div className="text-left">
                    <div className="font-semibold text-wood-dark dark:text-paper-light">
                      {index + 1}. {player.username || player.ai_name}
                      {player.is_ai && ' (KI)'}
                    </div>
                    {player.is_eliminated && (
                      <div className="text-sm text-red-600 dark:text-red-400">
                        Eliminiert
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-wood-dark dark:text-paper-light">
                    {player.total_score}
                  </div>
                  <div className="text-sm text-wood-medium dark:text-paper-medium">
                    Punkte
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Game Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mb-8 p-4 bg-wood-light dark:bg-anthracite-700 rounded-lg"
        >
          <h3 className="text-lg font-semibold text-wood-dark dark:text-paper-light mb-3">
            Spielstatistiken
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-wood-dark dark:text-paper-light">
                {players.length}
              </div>
              <div className="text-wood-medium dark:text-paper-medium">
                Spieler
              </div>
            </div>
            
            <div className="text-center">
              <div className="font-bold text-wood-dark dark:text-paper-light">
                {game.current_round}
              </div>
              <div className="text-wood-medium dark:text-paper-medium">
                Runden
              </div>
            </div>
            
            <div className="text-center">
              <div className="font-bold text-wood-dark dark:text-paper-light">
                {Math.max(...players.map(p => p.total_score))}
              </div>
              <div className="text-wood-medium dark:text-paper-medium">
                Höchste Punktzahl
              </div>
            </div>
            
            <div className="text-center">
              <div className="font-bold text-wood-dark dark:text-paper-light">
                {Math.round(players.reduce((sum, p) => sum + p.total_score, 0) / players.length)}
              </div>
              <div className="text-wood-medium dark:text-paper-medium">
                Durchschnitt
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="flex justify-center space-x-4"
        >
          <button
            onClick={onLeaveGame}
            className="btn-primary flex items-center space-x-2"
          >
            <Home className="h-5 w-5" />
            <span>Zurück zur Startseite</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GameResults;
