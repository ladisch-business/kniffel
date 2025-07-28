import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { socketService } from '../services/socket';
import { Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

import DiceArea from '../components/game/DiceArea';
import Scorecard from '../components/game/Scorecard';
import GameTimer from '../components/game/GameTimer';
import PlayerList from '../components/game/PlayerList';
import GameResults from '../components/game/GameResults';

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { 
    currentGame, 
    players, 
    diceState, 
    currentTurn, 
    timeRemaining, 
    isMyTurn,
    setCurrentGame,
    setDiceState,
    setCurrentTurn,
    setTimeRemaining,
    setIsMyTurn,
    leaveGame 
  } = useGameStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [gameFinished, setGameFinished] = useState(false);
  const [winners, setWinners] = useState<any[]>([]);

  useEffect(() => {
    if (!gameId) {
      navigate('/');
      return;
    }

    if (!currentGame || currentGame.id !== gameId) {
      navigate(`/lobby/${gameId}`);
      return;
    }

    setIsLoading(false);

    const handleGameUpdated = (game: any) => {
      setCurrentGame(game);
    };

    const handleTurnStarted = (playerIndex: number, timeLimit?: number) => {
      const myPlayerIndex = players.findIndex(p => p.user_id === user?.id);
      setIsMyTurn(playerIndex === myPlayerIndex);
      if (timeLimit) {
        setTimeRemaining(timeLimit);
      }
    };

    const handleDiceRolled = (turn: any) => {
      setCurrentTurn(turn);
      setDiceState({
        values: turn.dice_values,
        kept: turn.dice_kept,
        rollNumber: turn.roll_number,
        isRolling: false,
      });
    };

    const handleScoreSubmitted = (_playerId: string, category: string, score: number, _blockIndex: number) => {
      toast.success(`Punkte eingetragen: ${category} = ${score}`);
    };

    const handleGameFinished = (game: any, gameWinners: any[]) => {
      setCurrentGame(game);
      setWinners(gameWinners);
      setGameFinished(true);
      toast.success('Spiel beendet!');
    };

    const handlePlayerEliminated = (playerId: string) => {
      const eliminatedPlayer = players.find(p => p.id === playerId);
      if (eliminatedPlayer) {
        toast.error(`${eliminatedPlayer.username || eliminatedPlayer.ai_name} wurde eliminiert!`);
      }
    };

    const handleTimerTick = (remainingTime: number) => {
      setTimeRemaining(remainingTime);
    };

    socketService.on('gameUpdated', handleGameUpdated);
    socketService.on('turnStarted', handleTurnStarted);
    socketService.on('diceRolled', handleDiceRolled);
    socketService.on('scoreSubmitted', handleScoreSubmitted);
    socketService.on('gameFinished', handleGameFinished);
    socketService.on('playerEliminated', handlePlayerEliminated);
    socketService.on('timerTick', handleTimerTick);

    return () => {
      socketService.off('gameUpdated', handleGameUpdated);
      socketService.off('turnStarted', handleTurnStarted);
      socketService.off('diceRolled', handleDiceRolled);
      socketService.off('scoreSubmitted', handleScoreSubmitted);
      socketService.off('gameFinished', handleGameFinished);
      socketService.off('playerEliminated', handlePlayerEliminated);
      socketService.off('timerTick', handleTimerTick);
    };
  }, [gameId, currentGame, players, user, navigate, setCurrentGame, setIsMyTurn, setCurrentTurn, setDiceState, setTimeRemaining]);

  const handleLeaveGame = () => {
    leaveGame();
    navigate('/');
  };

  const getCurrentPlayer = () => {
    if (!currentGame || !players.length) return null;
    return players[currentGame.current_player_index] || null;
  };

  const getMyPlayer = () => {
    return players.find(p => p.user_id === user?.id) || null;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-medium mx-auto"></div>
          <p className="mt-4 text-wood-medium dark:text-paper-medium">Lade Spiel...</p>
        </div>
      </div>
    );
  }

  if (!currentGame) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-wood-medium dark:text-paper-medium">Spiel nicht gefunden</p>
        </div>
      </div>
    );
  }

  const currentPlayer = getCurrentPlayer();
  const myPlayer = getMyPlayer();

  if (gameFinished) {
    return (
      <GameResults
        game={currentGame}
        winners={winners}
        players={players}
        onLeaveGame={handleLeaveGame}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Info Header */}
        <div className="lg:col-span-4 paper-texture rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-wood-dark dark:text-paper-light font-serif">
                Kniffel - Runde {currentGame.current_round}
              </h1>
              {currentGame.tournament_mode && (
                <div className="flex items-center space-x-1 text-yellow-600">
                  <Trophy className="h-5 w-5" />
                  <span className="font-medium">Turnier</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-6">
              {currentGame.fast_game && timeRemaining !== null && (
                <GameTimer timeRemaining={timeRemaining} />
              )}
              
              <div className="text-center">
                <div className="text-sm text-wood-medium dark:text-paper-medium">Am Zug:</div>
                <div className="font-semibold text-wood-dark dark:text-paper-light">
                  {currentPlayer?.username || currentPlayer?.ai_name || 'Unbekannt'}
                </div>
              </div>

              <button
                onClick={handleLeaveGame}
                className="btn-secondary text-sm"
              >
                Spiel verlassen
              </button>
            </div>
          </div>
        </div>

        {/* Player List */}
        <div className="lg:col-span-1">
          <PlayerList
            players={players}
            currentPlayerIndex={currentGame.current_player_index}
            myUserId={user?.id}
          />
        </div>

        {/* Game Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dice Area */}
          <DiceArea
            diceState={diceState}
            isMyTurn={isMyTurn}
            gameMode={currentGame.mode}
            currentTurn={currentTurn}
          />

          {/* Scorecard */}
          {myPlayer && (
            <Scorecard
              player={myPlayer}
              game={currentGame}
              isMyTurn={isMyTurn}
              diceValues={diceState.values}
            />
          )}
        </div>

        {/* Game Rules/Info */}
        <div className="lg:col-span-1">
          <div className="paper-texture rounded-lg p-4">
            <h3 className="text-lg font-semibold text-wood-dark dark:text-paper-light mb-4">
              Spielregeln
            </h3>
            <div className="space-y-2 text-sm text-wood-medium dark:text-paper-medium">
              {currentGame.mode === 'classic' && (
                <div>
                  <p className="font-medium">Klassisches Kniffel:</p>
                  <p>Bis zu 3 Würfe pro Runde. Würfel können zwischen den Würfen behalten werden.</p>
                </div>
              )}
              
              {currentGame.mode === 'eins_muss_weg' && (
                <div>
                  <p className="font-medium">Eins muss weg:</p>
                  <p>Nach jedem Wurf muss mindestens ein Würfel permanent beiseitegelegt werden.</p>
                </div>
              )}
              
              {currentGame.mode === 'multi_block' && (
                <div>
                  <p className="font-medium">Multi-Block:</p>
                  <p>Sie können Ihre Ergebnisse in {currentGame.multi_blocks} verschiedene Blöcke eintragen.</p>
                </div>
              )}

              {currentGame.joker_kniffel && (
                <div className="mt-3">
                  <p className="font-medium">Joker-Kniffel:</p>
                  <p>Weitere Kniffels können als Joker in beliebigen Feldern eingetragen werden.</p>
                </div>
              )}

              {currentGame.fast_game && (
                <div className="mt-3">
                  <p className="font-medium">Zeitlimit:</p>
                  <p>{currentGame.time_limit} Sekunden pro Zug. Bei Überschreitung werden Sie eliminiert.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
