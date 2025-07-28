import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { socketService } from '../services/socket';
import { Users, Play, Settings, Crown, Bot, Clock, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

const GameLobbyPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { currentGame, players, setCurrentGame, setPlayers, joinGame, leaveGame, startGame } = useGameStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!gameId) {
      navigate('/');
      return;
    }

    const loadGame = async () => {
      try {
        await joinGame(gameId);
      } catch (error: any) {
        toast.error(error.message);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadGame();

    const handleGameUpdated = (game: any) => {
      setCurrentGame(game);
    };

    const handlePlayerJoined = (player: any) => {
      setPlayers([...players, player]);
      toast.success(`${player.username || player.ai_name} ist dem Spiel beigetreten`);
    };

    const handlePlayerLeft = (playerId: string) => {
      const leftPlayer = players.find(p => p.id === playerId);
      if (leftPlayer) {
        setPlayers(players.filter(p => p.id !== playerId));
        toast(`${leftPlayer.username || leftPlayer.ai_name} hat das Spiel verlassen`);
      }
    };

    const handleGameStarted = (game: any) => {
      setCurrentGame(game);
      navigate(`/game/${gameId}`);
    };

    socketService.on('gameUpdated', handleGameUpdated);
    socketService.on('playerJoined', handlePlayerJoined);
    socketService.on('playerLeft', handlePlayerLeft);
    socketService.on('gameStarted', handleGameStarted);

    return () => {
      socketService.off('gameUpdated', handleGameUpdated);
      socketService.off('playerJoined', handlePlayerJoined);
      socketService.off('playerLeft', handlePlayerLeft);
      socketService.off('gameStarted', handleGameStarted);
    };
  }, [gameId, navigate, joinGame, setCurrentGame, setPlayers, players]);

  const handleLeaveGame = () => {
    leaveGame();
    navigate('/');
  };

  const handleStartGame = () => {
    if (currentGame && players.length >= 2) {
      startGame();
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

  const isGameCreator = currentGame?.created_by === user?.id;
  const canStartGame = isGameCreator && players.length >= 2;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-medium mx-auto"></div>
          <p className="mt-4 text-wood-medium dark:text-paper-medium">Lade Spiel...</p>
        </div>
      </div>
    );
  }

  if (!currentGame) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-wood-medium dark:text-paper-medium">Spiel nicht gefunden</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="paper-texture rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-wood-dark dark:text-paper-light font-serif mb-2">
              Spiel-Lobby
            </h1>
            <p className="text-wood-medium dark:text-paper-medium">
              Warten auf Spieler...
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-wood-medium dark:text-paper-medium mb-2">
              <Users className="h-5 w-5" />
              <span>{players.length}/{currentGame.max_players} Spieler</span>
            </div>
            <div className="text-sm text-wood-medium dark:text-paper-medium">
              Spiel-ID: {currentGame.id.slice(0, 8)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-wood-dark dark:text-paper-light mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Spieleinstellungen
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-wood-medium dark:text-paper-medium">Spielmodus:</span>
                <span className="font-medium text-wood-dark dark:text-paper-light">
                  {getGameModeLabel(currentGame.mode)}
                </span>
              </div>

              {currentGame.mode === 'multi_block' && (
                <div className="flex justify-between">
                  <span className="text-wood-medium dark:text-paper-medium">Spielblöcke:</span>
                  <span className="font-medium text-wood-dark dark:text-paper-light">
                    {currentGame.multi_blocks}
                  </span>
                </div>
              )}

              {currentGame.tournament_mode && (
                <div className="flex justify-between items-center">
                  <span className="text-wood-medium dark:text-paper-medium">Turniermodus:</span>
                  <div className="flex items-center space-x-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-wood-dark dark:text-paper-light">Aktiviert</span>
                  </div>
                </div>
              )}

              {currentGame.joker_kniffel && (
                <div className="flex justify-between">
                  <span className="text-wood-medium dark:text-paper-medium">Joker-Kniffel:</span>
                  <span className="font-medium text-wood-dark dark:text-paper-light">Aktiviert</span>
                </div>
              )}

              {currentGame.fast_game && (
                <div className="flex justify-between items-center">
                  <span className="text-wood-medium dark:text-paper-medium">Zeitlimit:</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-wood-dark dark:text-paper-light">
                      {currentGame.time_limit}s pro Zug
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-wood-medium dark:text-paper-medium">Sichtbarkeit:</span>
                <span className="font-medium text-wood-dark dark:text-paper-light">
                  {currentGame.is_public ? 'Öffentlich' : 'Privat'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-wood-dark dark:text-paper-light mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Spieler
            </h2>
            <div className="space-y-2">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-wood-light dark:bg-anthracite-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {player.is_ai ? (
                      <Bot className="h-5 w-5 text-wood-medium" />
                    ) : (
                      <Users className="h-5 w-5 text-wood-medium" />
                    )}
                    <span className="font-medium text-wood-dark dark:text-paper-light">
                      {player.username || player.ai_name}
                    </span>
                    {player.user_id === currentGame.created_by && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="text-sm text-wood-medium dark:text-paper-medium">
                    Spieler {index + 1}
                  </div>
                </div>
              ))}

              {Array.from({ length: currentGame.max_players - players.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="flex items-center p-3 bg-gray-100 dark:bg-anthracite-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-anthracite-600"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400">Warten auf Spieler...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-wood-medium">
          <button
            onClick={handleLeaveGame}
            className="btn-secondary"
          >
            Spiel verlassen
          </button>

          {isGameCreator && (
            <button
              onClick={handleStartGame}
              disabled={!canStartGame}
              className={`btn-primary flex items-center space-x-2 ${
                !canStartGame ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Play className="h-5 w-5" />
              <span>Spiel starten</span>
            </button>
          )}

          {!isGameCreator && (
            <div className="text-wood-medium dark:text-paper-medium">
              Warten auf Spielleiter...
            </div>
          )}
        </div>
      </div>

      {currentGame.tournament_mode && (
        <div className="paper-texture rounded-lg p-6">
          <h2 className="text-xl font-semibold text-wood-dark dark:text-paper-light mb-4 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            Turnier-Informationen
          </h2>
          <div className="text-wood-medium dark:text-paper-medium space-y-2">
            <p>• Nach jedem Spiel wird der Spieler mit der niedrigsten Punktzahl eliminiert</p>
            <p>• Das Turnier läuft, bis nur noch ein Sieger übrig ist</p>
            <p>• Jeder Spieler spielt einen vollständigen Kniffel-Block pro Runde</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLobbyPage;
