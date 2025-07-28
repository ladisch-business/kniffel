import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { gameAPI } from '../services/api';
import { Game, GameSettings } from '../types';
import { Plus, Users, Play, Clock, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import CreateGameModal from '../components/CreateGameModal';
import GameCard from '../components/GameCard';

const HomePage: React.FC = () => {
  const [publicGames, setPublicGames] = useState<Game[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadPublicGames();
  }, []);

  const loadPublicGames = async () => {
    try {
      const games = await gameAPI.getPublicGames();
      setPublicGames(games);
    } catch (error: any) {
      toast.error('Fehler beim Laden der Spiele');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGame = async (settings: GameSettings) => {
    try {
      const game = await gameAPI.createGame(settings);
      toast.success('Spiel erfolgreich erstellt!');
      navigate(`/lobby/${game.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Erstellen des Spiels');
    }
  };

  const handleJoinGame = async (gameId: string) => {
    try {
      await gameAPI.joinGame(gameId);
      navigate(`/lobby/${gameId}`);
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Beitreten');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-wood-dark dark:text-paper-light font-serif mb-4">
          Willkommen bei Kniffel, {user?.username}!
        </h1>
        <p className="text-lg text-wood-medium dark:text-paper-medium">
          Erstellen Sie ein neues Spiel oder treten Sie einem bestehenden Spiel bei
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="paper-texture rounded-lg p-6 text-center">
          <Users className="h-12 w-12 text-wood-medium mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-wood-dark dark:text-paper-light mb-2">
            Multiplayer
          </h3>
          <p className="text-sm text-wood-medium dark:text-paper-medium">
            Spielen Sie mit Freunden oder KI-Gegnern
          </p>
        </div>

        <div className="paper-texture rounded-lg p-6 text-center">
          <Play className="h-12 w-12 text-wood-medium mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-wood-dark dark:text-paper-light mb-2">
            3 Spielmodi
          </h3>
          <p className="text-sm text-wood-medium dark:text-paper-medium">
            Klassisch, Eins muss weg, Multi-Block
          </p>
        </div>

        <div className="paper-texture rounded-lg p-6 text-center">
          <Clock className="h-12 w-12 text-wood-medium mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-wood-dark dark:text-paper-light mb-2">
            Schnelles Spiel
          </h3>
          <p className="text-sm text-wood-medium dark:text-paper-medium">
            Mit Zeitlimit für spannende Runden
          </p>
        </div>

        <div className="paper-texture rounded-lg p-6 text-center">
          <Trophy className="h-12 w-12 text-wood-medium mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-wood-dark dark:text-paper-light mb-2">
            Turniere
          </h3>
          <p className="text-sm text-wood-medium dark:text-paper-medium">
            Eliminierungsturniere mit bis zu 10 Spielern
          </p>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center space-x-2 text-lg px-8 py-3"
        >
          <Plus className="h-6 w-6" />
          <span>Neues Spiel erstellen</span>
        </button>
      </div>

      <div className="paper-texture rounded-lg p-6">
        <h2 className="text-2xl font-bold text-wood-dark dark:text-paper-light mb-6 font-serif">
          Öffentliche Spiele
        </h2>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-medium mx-auto"></div>
            <p className="mt-4 text-wood-medium dark:text-paper-medium">Lade Spiele...</p>
          </div>
        ) : publicGames.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-wood-medium dark:text-paper-medium">
              Keine öffentlichen Spiele verfügbar. Erstellen Sie das erste!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onJoin={() => handleJoinGame(game.id)}
                getGameModeLabel={getGameModeLabel}
              />
            ))}
          </div>
        )}
      </div>

      <CreateGameModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateGame={handleCreateGame}
      />
    </div>
  );
};

export default HomePage;
