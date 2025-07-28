import { io, Socket } from 'socket.io-client';
import { Game, GamePlayer, GameTurn } from '../types';

interface ServerToClientEvents {
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

interface ClientToServerEvents {
  joinGame: (gameId: string) => void;
  leaveGame: (gameId: string) => void;
  rollDice: (gameId: string, keptDice: boolean[]) => void;
  submitScore: (gameId: string, category: string, blockIndex: number) => void;
  startGame: (gameId: string) => void;
}

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(token: string) {
    const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    
    this.socket = io(SOCKET_URL, {
      auth: {
        token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to game server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from game server');
    });

    this.socket.on('error', (message: string) => {
      console.error('Socket error:', message);
    });

    this.setupEventForwarding();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  private setupEventForwarding() {
    if (!this.socket) return;

    const events: (keyof ServerToClientEvents)[] = [
      'gameUpdated',
      'playerJoined',
      'playerLeft',
      'gameStarted',
      'turnStarted',
      'diceRolled',
      'scoreSubmitted',
      'gameFinished',
      'playerEliminated',
      'timerTick'
    ];

    events.forEach(event => {
      this.socket!.on(event, (...args: any[]) => {
        const eventListeners = this.listeners.get(event) || [];
        eventListeners.forEach(listener => listener(...args));
      });
    });
  }

  on<T extends keyof ServerToClientEvents>(
    event: T,
    listener: ServerToClientEvents[T]
  ) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off<T extends keyof ServerToClientEvents>(
    event: T,
    listener: ServerToClientEvents[T]
  ) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit<T extends keyof ClientToServerEvents>(
    event: T,
    ...args: Parameters<ClientToServerEvents[T]>
  ) {
    if (this.socket) {
      (this.socket.emit as any)(event, ...args);
    }
  }

  joinGame(gameId: string) {
    this.emit('joinGame', gameId);
  }

  leaveGame(gameId: string) {
    this.emit('leaveGame', gameId);
  }

  rollDice(gameId: string, keptDice: boolean[]) {
    this.emit('rollDice', gameId, keptDice);
  }

  submitScore(gameId: string, category: string, blockIndex: number) {
    this.emit('submitScore', gameId, category, blockIndex);
  }

  startGame(gameId: string) {
    this.emit('startGame', gameId);
  }
}

export const socketService = new SocketService();
export default socketService;
