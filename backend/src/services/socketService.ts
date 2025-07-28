import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { GameModel } from '../models/Game';
import { GameLogicService } from './gameLogic';
import { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  InterServerEvents, 
  SocketData 
} from '../types';

export class SocketService {
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  private gameTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, decoded: any) => {
        if (err) {
          return next(new Error('Authentication error'));
        }
        
        socket.data.userId = decoded.id;
        socket.data.username = decoded.username;
        next();
      });
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.data.username} connected`);

      socket.on('joinGame', async (gameId: string) => {
        try {
          const game = await GameModel.findById(gameId);
          if (!game) {
            socket.emit('error', 'Game not found');
            return;
          }

          socket.join(gameId);
          
          const players = await GameModel.getPlayers(gameId);
          const player = players.find(p => p.user_id === socket.data.userId);
          
          if (player) {
            socket.to(gameId).emit('playerJoined', player);
            socket.emit('gameUpdated', game);
          }
        } catch (error) {
          console.error('Join game error:', error);
          socket.emit('error', 'Failed to join game');
        }
      });

      socket.on('leaveGame', (gameId: string) => {
        socket.leave(gameId);
        socket.to(gameId).emit('playerLeft', socket.data.userId);
      });

      socket.on('startGame', async (gameId: string) => {
        try {
          const game = await GameModel.findById(gameId);
          if (!game || game.created_by !== socket.data.userId) {
            socket.emit('error', 'Not authorized to start game');
            return;
          }

          await GameModel.updateGameStatus(gameId, 'active');
          
          this.io.to(gameId).emit('gameStarted', game);
          this.io.to(gameId).emit('turnStarted', 0, game.time_limit);
          
          if (game.fast_game && game.time_limit) {
            this.startTurnTimer(gameId, game.time_limit);
          }
        } catch (error) {
          console.error('Start game error:', error);
          socket.emit('error', 'Failed to start game');
        }
      });

      socket.on('rollDice', async (gameId: string, keptDice: boolean[]) => {
        try {
          const game = await GameModel.findById(gameId);
          if (!game || game.status !== 'active') {
            socket.emit('error', 'Game not active');
            return;
          }

          const players = await GameModel.getPlayers(gameId);
          const currentPlayer = players[game.current_player_index];
          
          if (currentPlayer.user_id !== socket.data.userId) {
            socket.emit('error', 'Not your turn');
            return;
          }

          const newDice = GameLogicService.rollDice(5);
          const finalDice = newDice.map((die, index) => keptDice[index] ? die : newDice[index]);

          this.io.to(gameId).emit('diceRolled', {
            id: '',
            game_id: gameId,
            player_index: game.current_player_index,
            round_number: game.current_round,
            roll_number: 1,
            dice_values: finalDice,
            dice_kept: keptDice,
            block_index: 0,
            created_at: new Date()
          });
        } catch (error) {
          console.error('Roll dice error:', error);
          socket.emit('error', 'Failed to roll dice');
        }
      });

      socket.on('disconnect', () => {
        console.log(`User ${socket.data.username} disconnected`);
      });
    });
  }

  private startTurnTimer(gameId: string, timeLimit: number) {
    if (this.gameTimers.has(gameId)) {
      clearTimeout(this.gameTimers.get(gameId)!);
    }

    let remainingTime = timeLimit;
    
    const timer = setInterval(() => {
      remainingTime--;
      this.io.to(gameId).emit('timerTick', remainingTime);
      
      if (remainingTime <= 0) {
        clearInterval(timer);
        this.gameTimers.delete(gameId);
        this.handleTimeExpired(gameId);
      }
    }, 1000);

    this.gameTimers.set(gameId, timer as any);
  }

  private async handleTimeExpired(gameId: string) {
    try {
      const game = await GameModel.findById(gameId);
      if (!game) return;

      const players = await GameModel.getPlayers(gameId);
      const currentPlayer = players[game.current_player_index];
      
      this.io.to(gameId).emit('playerEliminated', currentPlayer.id);
      
    } catch (error) {
      console.error('Handle time expired error:', error);
    }
  }
}
