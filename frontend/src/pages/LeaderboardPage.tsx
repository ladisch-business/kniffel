import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { UserStatistics } from '../types';
import { Trophy, Medal, Award, Users, Filter, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface LeaderboardEntry extends UserStatistics {
  username: string;
  rank: number;
}

type LeaderboardFilter = 'total' | 'human_only' | 'mixed' | 'tournament';

const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<LeaderboardFilter>('total');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [filter]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await userAPI.getLeaderboard(filter);
      setLeaderboard(data);
    } catch (error: any) {
      toast.error('Fehler beim Laden der Bestenliste');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <div className="w-6 h-6 flex items-center justify-center text-wood-medium font-bold">{rank}</div>;
    }
  };

  const getFilterLabel = (filterType: LeaderboardFilter) => {
    switch (filterType) {
      case 'total': return 'Gesamt';
      case 'human_only': return 'Nur Menschen';
      case 'mixed': return 'Gemischte Spiele';
      case 'tournament': return 'Turniere';
      default: return filterType;
    }
  };

  const getWinRate = (wins: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  };

  const getStatsForFilter = (entry: LeaderboardEntry) => {
    switch (filter) {
      case 'total':
        return {
          games: entry.total_games,
          wins: entry.total_wins,
          winRate: getWinRate(entry.total_wins, entry.total_games),
        };
      case 'human_only':
        return {
          games: entry.human_only_games,
          wins: entry.human_only_wins,
          winRate: getWinRate(entry.human_only_wins, entry.human_only_games),
        };
      case 'mixed':
        return {
          games: entry.mixed_games,
          wins: entry.mixed_wins,
          winRate: getWinRate(entry.mixed_wins, entry.mixed_games),
        };
      case 'tournament':
        return {
          games: 0, // Tournament games are not tracked separately
          wins: entry.tournament_wins,
          winRate: 0,
        };
      default:
        return { games: 0, wins: 0, winRate: 0 };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="paper-texture rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-wood-dark dark:text-paper-light font-serif flex items-center">
            <Trophy className="h-8 w-8 mr-3 text-yellow-500" />
            Bestenliste
          </h1>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-wood-medium" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as LeaderboardFilter)}
              className="px-3 py-2 border border-wood-medium rounded-md focus:outline-none focus:ring-wood-medium focus:border-wood-medium dark:bg-anthracite-700 dark:border-anthracite-600 dark:text-paper-light"
            >
              <option value="total">Gesamt</option>
              <option value="human_only">Nur Menschen</option>
              <option value="mixed">Gemischte Spiele</option>
              <option value="tournament">Turniere</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-wood-medium dark:text-paper-medium">
            Zeige Bestenliste für: <span className="font-semibold">{getFilterLabel(filter)}</span>
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-medium mx-auto"></div>
            <p className="mt-4 text-wood-medium dark:text-paper-medium">Lade Bestenliste...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-wood-medium mx-auto mb-4" />
            <p className="text-wood-medium dark:text-paper-medium">
              Noch keine Einträge in dieser Kategorie
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => {
              const stats = getStatsForFilter(entry);
              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                    entry.rank === 1
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700'
                      : entry.rank === 2
                      ? 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600'
                      : entry.rank === 3
                      ? 'bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700'
                      : 'bg-wood-light dark:bg-anthracite-700 border border-wood-medium dark:border-anthracite-600'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div>
                      <div className="font-semibold text-wood-dark dark:text-paper-light">
                        {entry.username}
                      </div>
                      <div className="text-sm text-wood-medium dark:text-paper-medium">
                        {filter === 'tournament' ? (
                          `${stats.wins} Turniersiege`
                        ) : (
                          `${stats.wins}/${stats.games} Siege (${stats.winRate}%)`
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {filter === 'tournament' ? (
                      <div className="text-2xl font-bold text-wood-dark dark:text-paper-light">
                        {stats.wins}
                      </div>
                    ) : (
                      <>
                        <div className="text-xl font-bold text-wood-dark dark:text-paper-light">
                          {stats.winRate}%
                        </div>
                        <div className="text-sm text-wood-medium dark:text-paper-medium">
                          Siegrate
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Additional Stats */}
        {!isLoading && leaderboard.length > 0 && (
          <div className="mt-8 pt-6 border-t border-wood-medium">
            <h3 className="text-lg font-semibold text-wood-dark dark:text-paper-light mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Statistiken
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-wood-light dark:bg-anthracite-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-wood-dark dark:text-paper-light">
                  {leaderboard.length}
                </div>
                <div className="text-sm text-wood-medium dark:text-paper-medium">
                  Aktive Spieler
                </div>
              </div>
              
              <div className="bg-wood-light dark:bg-anthracite-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-wood-dark dark:text-paper-light">
                  {Math.max(...leaderboard.map(e => e.highest_score))}
                </div>
                <div className="text-sm text-wood-medium dark:text-paper-medium">
                  Höchste Punktzahl
                </div>
              </div>
              
              <div className="bg-wood-light dark:bg-anthracite-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-wood-dark dark:text-paper-light">
                  {leaderboard.reduce((sum, e) => sum + e.total_kniffels, 0)}
                </div>
                <div className="text-sm text-wood-medium dark:text-paper-medium">
                  Gesamt Kniffels
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
