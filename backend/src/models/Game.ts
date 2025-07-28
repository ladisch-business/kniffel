import pool from '../database/connection';
import { Game, GameSettings, GamePlayer, ScoreBlock } from '../types';

export class GameModel {
  static async create(settings: GameSettings, createdBy: string): Promise<Game> {
    const query = `
      INSERT INTO games (
        mode, max_players, ai_players, is_public, tournament_mode,
        joker_kniffel, fast_game, time_limit, multi_blocks, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      settings.mode,
      settings.maxPlayers,
      settings.aiPlayers,
      settings.isPublic,
      settings.tournamentMode,
      settings.jokerKniffel,
      settings.fastGame,
      settings.timeLimit,
      settings.multiBlocks || 1,
      createdBy
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id: string): Promise<Game | null> {
    const query = 'SELECT * FROM games WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findPublicGames(): Promise<Game[]> {
    const query = `
      SELECT * FROM games 
      WHERE is_public = true AND status = 'waiting'
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async addPlayer(gameId: string, userId: string | null, playerIndex: number, isAi: boolean = false, aiName?: string): Promise<GamePlayer> {
    const query = `
      INSERT INTO game_players (game_id, user_id, player_index, is_ai, ai_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(query, [gameId, userId, playerIndex, isAi, aiName]);
    return result.rows[0];
  }

  static async getPlayers(gameId: string): Promise<GamePlayer[]> {
    const query = `
      SELECT gp.*, u.username
      FROM game_players gp
      LEFT JOIN users u ON gp.user_id = u.id
      WHERE gp.game_id = $1
      ORDER BY gp.player_index
    `;
    
    const result = await pool.query(query, [gameId]);
    return result.rows;
  }

  static async createScoreBlocks(gamePlayerId: string, multiBlocks: number): Promise<void> {
    const queries = [];
    for (let i = 0; i < multiBlocks; i++) {
      queries.push(pool.query(
        'INSERT INTO score_blocks (game_player_id, block_index) VALUES ($1, $2)',
        [gamePlayerId, i]
      ));
    }
    await Promise.all(queries);
  }

  static async getScoreBlocks(gamePlayerId: string): Promise<ScoreBlock[]> {
    const query = `
      SELECT * FROM score_blocks 
      WHERE game_player_id = $1 
      ORDER BY block_index
    `;
    
    const result = await pool.query(query, [gamePlayerId]);
    return result.rows;
  }

  static async updateGameStatus(gameId: string, status: string): Promise<void> {
    const query = 'UPDATE games SET status = $1 WHERE id = $2';
    await pool.query(query, [status, gameId]);
  }

  static async updateCurrentPlayer(gameId: string, playerIndex: number): Promise<void> {
    const query = 'UPDATE games SET current_player_index = $1 WHERE id = $2';
    await pool.query(query, [playerIndex, gameId]);
  }
}
