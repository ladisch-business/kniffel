import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { userAPI } from '../services/api';
import { UserStatistics, Friend } from '../types';
import { User, UserPlus, UserMinus, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [statsData, friendsData] = await Promise.all([
        userAPI.getStatistics(),
        userAPI.getFriends(),
      ]);
      
      setStatistics(statsData);
      setFriends(friendsData.filter((f: Friend) => f.status === 'accepted'));
      setFriendRequests(friendsData.filter((f: Friend) => f.status === 'pending'));
    } catch (error: any) {
      toast.error('Fehler beim Laden der Profildaten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFriendUsername.trim()) {
      toast.error('Bitte geben Sie einen Benutzernamen ein');
      return;
    }

    try {
      await userAPI.sendFriendRequest(newFriendUsername.trim());
      toast.success('Freundschaftsanfrage gesendet!');
      setNewFriendUsername('');
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Senden der Anfrage');
    }
  };

  const handleAcceptFriendRequest = async (friendId: string) => {
    try {
      await userAPI.acceptFriendRequest(friendId);
      toast.success('Freundschaftsanfrage angenommen!');
      loadUserData();
    } catch (error: any) {
      toast.error('Fehler beim Annehmen der Anfrage');
    }
  };

  const handleRejectFriendRequest = async (friendId: string) => {
    try {
      await userAPI.rejectFriendRequest(friendId);
      toast.success('Freundschaftsanfrage abgelehnt');
      loadUserData();
    } catch (error: any) {
      toast.error('Fehler beim Ablehnen der Anfrage');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await userAPI.removeFriend(friendId);
      toast.success('Freund entfernt');
      loadUserData();
    } catch (error: any) {
      toast.error('Fehler beim Entfernen des Freundes');
    }
  };

  const getWinRate = (wins: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-medium mx-auto"></div>
          <p className="mt-4 text-wood-medium dark:text-paper-medium">Lade Profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="paper-texture rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-wood-medium rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-paper-light" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-wood-dark dark:text-paper-light font-serif">
                  {user?.username}
                </h1>
                <p className="text-wood-medium dark:text-paper-medium">
                  Kniffel-Spieler
                </p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {statistics && (
            <div className="paper-texture rounded-lg p-6">
              <h2 className="text-2xl font-bold text-wood-dark dark:text-paper-light mb-6 font-serif flex items-center">
                <Trophy className="h-6 w-6 mr-2" />
                Spielstatistiken
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Overall Stats */}
                <div className="bg-wood-light dark:bg-anthracite-700 rounded-lg p-4">
                  <h3 className="font-semibold text-wood-dark dark:text-paper-light mb-3">
                    Gesamt
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-wood-medium dark:text-paper-medium">Spiele:</span>
                      <span className="font-medium text-wood-dark dark:text-paper-light">
                        {statistics.total_games}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wood-medium dark:text-paper-medium">Siege:</span>
                      <span className="font-medium text-wood-dark dark:text-paper-light">
                        {statistics.total_wins}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wood-medium dark:text-paper-medium">Siegrate:</span>
                      <span className="font-medium text-wood-dark dark:text-paper-light">
                        {getWinRate(statistics.total_wins, statistics.total_games)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wood-medium dark:text-paper-medium">Höchste Punktzahl:</span>
                      <span className="font-medium text-wood-dark dark:text-paper-light">
                        {statistics.highest_score}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Human-only Games */}
                <div className="bg-wood-light dark:bg-anthracite-700 rounded-lg p-4">
                  <h3 className="font-semibold text-wood-dark dark:text-paper-light mb-3">
                    Nur Menschen
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-wood-medium dark:text-paper-medium">Spiele:</span>
                      <span className="font-medium text-wood-dark dark:text-paper-light">
                        {statistics.human_only_games}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wood-medium dark:text-paper-medium">Siege:</span>
                      <span className="font-medium text-wood-dark dark:text-paper-light">
                        {statistics.human_only_wins}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wood-medium dark:text-paper-medium">Siegrate:</span>
                      <span className="font-medium text-wood-dark dark:text-paper-light">
                        {getWinRate(statistics.human_only_wins, statistics.human_only_games)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mixed Games */}
                <div className="bg-wood-light dark:bg-anthracite-700 rounded-lg p-4">
                  <h3 className="font-semibold text-wood-dark dark:text-paper-light mb-3">
                    Gemischte Spiele
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-wood-medium dark:text-paper-medium">Spiele:</span>
                      <span className="font-medium text-wood-dark dark:text-paper-light">
                        {statistics.mixed_games}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wood-medium dark:text-paper-medium">Siege:</span>
                      <span className="font-medium text-wood-dark dark:text-paper-light">
                        {statistics.mixed_wins}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wood-medium dark:text-paper-medium">Siegrate:</span>
                      <span className="font-medium text-wood-dark dark:text-paper-light">
                        {getWinRate(statistics.mixed_wins, statistics.mixed_games)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tournament Stats */}
                <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-wood-dark dark:text-paper-light mb-3 flex items-center">
                    <Trophy className="h-4 w-4 mr-1 text-yellow-600" />
                    Turniere
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-wood-medium dark:text-paper-medium">Siege:</span>
                      <span className="font-bold text-yellow-700 dark:text-yellow-300">
                        {statistics.tournament_wins}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Game Mode Stats */}
                <div className="bg-wood-light dark:bg-anthracite-700 rounded-lg p-4">
                  <h3 className="font-semibold text-wood-dark dark:text-paper-light mb-3">
                    Klassisch
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-wood-medium dark:text-paper-medium">Spiele:</span>
                      <span className="font-medium text-wood-dark dark:text-paper-light">
                        {statistics.classic_games}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wood-medium dark:text-paper-medium">Siege:</span>
                      <span className="font-medium text-wood-dark dark:text-paper-light">
                        {statistics.classic_wins}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-wood-light dark:bg-anthracite-700 rounded-lg p-4">
                  <h3 className="font-semibold text-wood-dark dark:text-paper-light mb-3">
                    Eins muss weg
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-wood-medium dark:text-paper-medium">Spiele:</span>
                      <span className="font-medium text-wood-dark dark:text-paper-light">
                        {statistics.eins_muss_weg_games}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wood-medium dark:text-paper-medium">Siege:</span>
                      <span className="font-medium text-wood-dark dark:text-paper-light">
                        {statistics.eins_muss_weg_wins}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Friends Section */}
        <div className="space-y-6">
          {/* Add Friend */}
          <div className="paper-texture rounded-lg p-6">
            <h2 className="text-xl font-bold text-wood-dark dark:text-paper-light mb-4 font-serif">
              Freund hinzufügen
            </h2>
            <form onSubmit={handleSendFriendRequest} className="space-y-4">
              <input
                type="text"
                value={newFriendUsername}
                onChange={(e) => setNewFriendUsername(e.target.value)}
                placeholder="Benutzername"
                className="w-full px-3 py-2 border border-wood-medium rounded-md focus:outline-none focus:ring-wood-medium focus:border-wood-medium dark:bg-anthracite-700 dark:border-anthracite-600 dark:text-paper-light"
              />
              <button
                type="submit"
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Anfrage senden</span>
              </button>
            </form>
          </div>

          {/* Friend Requests */}
          {friendRequests.length > 0 && (
            <div className="paper-texture rounded-lg p-6">
              <h2 className="text-xl font-bold text-wood-dark dark:text-paper-light mb-4 font-serif">
                Freundschaftsanfragen
              </h2>
              <div className="space-y-3">
                {friendRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-wood-light dark:bg-anthracite-700 rounded-lg">
                    <span className="font-medium text-wood-dark dark:text-paper-light">
                      {request.friend_username}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptFriendRequest(request.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Annehmen
                      </button>
                      <button
                        onClick={() => handleRejectFriendRequest(request.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Ablehnen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="paper-texture rounded-lg p-6">
            <h2 className="text-xl font-bold text-wood-dark dark:text-paper-light mb-4 font-serif">
              Freunde ({friends.length})
            </h2>
            {friends.length === 0 ? (
              <p className="text-wood-medium dark:text-paper-medium text-center py-4">
                Noch keine Freunde hinzugefügt
              </p>
            ) : (
              <div className="space-y-2">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-3 bg-wood-light dark:bg-anthracite-700 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-wood-medium" />
                      <span className="font-medium text-wood-dark dark:text-paper-light">
                        {friend.friend_username}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
