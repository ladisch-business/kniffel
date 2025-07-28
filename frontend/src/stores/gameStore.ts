import { create } from 'zustand';
import { Game, GamePlayer, DiceState, ScoreBlock, GameTurn } from '../types';
import { gameAPI } from '../services/api';
import { socketService } from '../services/socket';

interface GameStore {
  currentGame: Game | null;
  players: GamePlayer[];
  scoreBlocks: Map<string, ScoreBlock[]>;
  diceState: DiceState;
  currentTurn: GameTurn | null;
  timeRemaining: number | null;
  isMyTurn: boolean;
  
  setCurrentGame: (game: Game | null) => void;
  setPlayers: (players: GamePlayer[]) => void;
  setScoreBlocks: (playerId: string, blocks: ScoreBlock[]) => void;
  setDiceState: (state: DiceState) => void;
  setCurrentTurn: (turn: GameTurn | null) => void;
  setTimeRemaining: (time: number | null) => void;
  setIsMyTurn: (isMyTurn: boolean) => void;
  
  createGame: (settings: any) => Promise<Game>;
  joinGame: (gameId: string) => Promise<void>;
  leaveGame: () => void;
  startGame: () => void;
  rollDice: (keptDice: boolean[]) => void;
  submitScore: (category: string, blockIndex: number) => void;
  
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentGame: null,
  players: [],
  scoreBlocks: new Map(),
  diceState: {
    values: [1, 1, 1, 1, 1],
    kept: [false, false, false, false, false],
    rollNumber: 0,
    isRolling: false,
  },
  currentTurn: null,
  timeRemaining: null,
  isMyTurn: false,

  setCurrentGame: (game) => set({ currentGame: game }),
  setPlayers: (players) => set({ players }),
  setScoreBlocks: (playerId, blocks) => {
    const scoreBlocks = new Map(get().scoreBlocks);
    scoreBlocks.set(playerId, blocks);
    set({ scoreBlocks });
  },
  setDiceState: (state) => set({ diceState: state }),
  setCurrentTurn: (turn) => set({ currentTurn: turn }),
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  setIsMyTurn: (isMyTurn) => set({ isMyTurn }),

  createGame: async (settings) => {
    try {
      const game = await gameAPI.createGame(settings);
      set({ currentGame: game });
      return game;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create game');
    }
  },

  joinGame: async (gameId) => {
    try {
      await gameAPI.joinGame(gameId);
      const game = await gameAPI.getGame(gameId);
      set({ 
        currentGame: game,
        players: game.players || []
      });
      socketService.joinGame(gameId);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to join game');
    }
  },

  leaveGame: () => {
    const { currentGame } = get();
    if (currentGame) {
      socketService.leaveGame(currentGame.id);
    }
    set({
      currentGame: null,
      players: [],
      scoreBlocks: new Map(),
      currentTurn: null,
      timeRemaining: null,
      isMyTurn: false,
    });
  },

  startGame: () => {
    const { currentGame } = get();
    if (currentGame) {
      socketService.startGame(currentGame.id);
    }
  },

  rollDice: (keptDice) => {
    const { currentGame, diceState } = get();
    if (currentGame && !diceState.isRolling) {
      set({
        diceState: {
          ...diceState,
          isRolling: true,
        }
      });
      socketService.rollDice(currentGame.id, keptDice);
    }
  },

  submitScore: (category, blockIndex) => {
    const { currentGame } = get();
    if (currentGame) {
      socketService.submitScore(currentGame.id, category, blockIndex);
    }
  },

  reset: () => set({
    currentGame: null,
    players: [],
    scoreBlocks: new Map(),
    diceState: {
      values: [1, 1, 1, 1, 1],
      kept: [false, false, false, false, false],
      rollNumber: 0,
      isRolling: false,
    },
    currentTurn: null,
    timeRemaining: null,
    isMyTurn: false,
  }),
}));
