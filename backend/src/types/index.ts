export interface User {
  id: string;
  username: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserRegistration {
  username: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export type GameMode = 'classic' | 'eins_muss_weg' | 'multi_block';

export type GameStatus = 'waiting' | 'active' | 'finished';

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export interface GameSettings {
  mode: GameMode;
  maxPlayers: number;
  aiPlayers: number;
  isPublic: boolean;
  tournamentMode: boolean;
  jokerKniffel: boolean;
  fastGame: boolean;
  timeLimit?: number;
  multiBlocks?: number;
}

export interface Game {
  id: string;
  mode: GameMode;
  max_players: number;
  ai_players: number;
  is_public: boolean;
  tournament_mode: boolean;
  joker_kniffel: boolean;
  fast_game: boolean;
  time_limit?: number;
  multi_blocks: number;
  status: GameStatus;
  current_player_index: number;
  current_round: number;
  created_by: string;
  created_at: Date;
  finished_at?: Date;
}

export interface GamePlayer {
  id: string;
  game_id: string;
  user_id?: string;
  player_index: number;
  is_ai: boolean;
  ai_name?: string;
  is_eliminated: boolean;
  total_score: number;
  username?: string;
}

export interface ScoreBlock {
  id: string;
  game_player_id: string;
  block_index: number;
  
  ones?: number;
  twos?: number;
  threes?: number;
  fours?: number;
  fives?: number;
  sixes?: number;
  upper_bonus: number;
  
  three_of_kind?: number;
  four_of_kind?: number;
  full_house?: number;
  small_straight?: number;
  large_straight?: number;
  kniffel?: number;
  chance?: number;
  
  joker_kniffels: number;
  total_score: number;
  is_completed: boolean;
}

export interface GameTurn {
  id: string;
  game_id: string;
  player_index: number;
  round_number: number;
  roll_number: number;
  dice_values: number[];
  dice_kept: boolean[];
  score_category?: string;
  score_value?: number;
  block_index: number;
  created_at: Date;
}

export interface DiceRoll {
  values: number[];
  kept: boolean[];
  rollNumber: number;
}

export interface ScoreCategory {
  name: string;
  key: keyof ScoreBlock;
  calculate: (dice: number[]) => number;
  isUpper: boolean;
}

export interface UserStatistics {
  id: string;
  user_id: string;
  human_only_games: number;
  human_only_wins: number;
  ai_only_games: number;
  ai_only_wins: number;
  mixed_games: number;
  mixed_wins: number;
  tournament_wins: number;
  total_games: number;
  total_wins: number;
  highest_score: number;
  total_kniffels: number;
  classic_games: number;
  classic_wins: number;
  eins_muss_weg_games: number;
  eins_muss_weg_wins: number;
  multi_block_games: number;
  multi_block_wins: number;
  updated_at: Date;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  created_at: Date;
  friend_username?: string;
}

export interface ServerToClientEvents {
  gameUpdated: (game: Game) => void;
  playerJoined: (player: GamePlayer) => void;
  playerLeft: (playerId: string) => void;
  gameStarted: (game: Game) => void;
  turnStarted: (playerIndex: number, timeLimit?: number) => void;
  diceRolled: (turn: GameTurn) => void;
  scoreSubmitted: (playerId: string, category: string, score: number, blockIndex: number) => void;
  gameFinished: (game: Game, winners: GamePlayer[]) => void;
  playerEliminated: (playerId: string) => void;
  timerTick: (remainingTime: number) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  joinGame: (gameId: string) => void;
  leaveGame: (gameId: string) => void;
  rollDice: (gameId: string, keptDice: boolean[]) => void;
  submitScore: (gameId: string, category: string, blockIndex: number) => void;
  startGame: (gameId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  username: string;
}
