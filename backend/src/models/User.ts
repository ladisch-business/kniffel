import pool from '../database/connection';
import bcrypt from 'bcryptjs';
import { User, UserRegistration, UserLogin } from '../types';

export class UserModel {
  static async create(userData: UserRegistration): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const query = `
      INSERT INTO users (username, password_hash)
      VALUES ($1, $2)
      RETURNING id, username, password_hash, created_at, updated_at
    `;
    
    const result = await pool.query(query, [userData.username, hashedPassword]);
    return result.rows[0];
  }

  static async findByUsername(username: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async initializeStatistics(userId: string): Promise<void> {
    const query = `
      INSERT INTO user_statistics (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
    `;
    await pool.query(query, [userId]);
  }

  static async getStatistics(userId: string): Promise<any> {
    const query = `
      SELECT * FROM user_statistics 
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || {
      user_id: userId,
      total_games: 0,
      total_wins: 0,
      human_only_games: 0,
      human_only_wins: 0,
      mixed_games: 0,
      mixed_wins: 0,
      tournament_wins: 0,
      classic_games: 0,
      classic_wins: 0,
      eins_muss_weg_games: 0,
      eins_muss_weg_wins: 0,
      highest_score: 0,
      total_kniffels: 0
    };
  }

  static async getFriends(userId: string): Promise<any[]> {
    const query = `
      SELECT f.id, f.status, f.created_at,
             CASE 
               WHEN f.user_id = $1 THEN u2.username
               ELSE u1.username
             END as friend_username,
             CASE 
               WHEN f.user_id = $1 THEN f.friend_id
               ELSE f.user_id
             END as friend_id
      FROM friendships f
      LEFT JOIN users u1 ON f.user_id = u1.id
      LEFT JOIN users u2 ON f.friend_id = u2.id
      WHERE f.user_id = $1 OR f.friend_id = $1
      ORDER BY f.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async sendFriendRequest(userId: string, friendId: string): Promise<void> {
    const checkQuery = `
      SELECT id FROM friendships 
      WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
    `;
    const existing = await pool.query(checkQuery, [userId, friendId]);
    
    if (existing.rows.length > 0) {
      throw new Error('Friend request already exists');
    }

    const query = `
      INSERT INTO friendships (user_id, friend_id, status)
      VALUES ($1, $2, 'pending')
    `;
    await pool.query(query, [userId, friendId]);
  }

  static async acceptFriendRequest(friendshipId: string, userId: string): Promise<void> {
    const query = `
      UPDATE friendships 
      SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND friend_id = $2 AND status = 'pending'
    `;
    const result = await pool.query(query, [friendshipId, userId]);
    
    if (result.rowCount === 0) {
      throw new Error('Friend request not found or already processed');
    }
  }

  static async rejectFriendRequest(friendshipId: string, userId: string): Promise<void> {
    const query = `
      DELETE FROM friendships 
      WHERE id = $1 AND friend_id = $2 AND status = 'pending'
    `;
    const result = await pool.query(query, [friendshipId, userId]);
    
    if (result.rowCount === 0) {
      throw new Error('Friend request not found');
    }
  }

  static async removeFriend(friendshipId: string, userId: string): Promise<void> {
    const query = `
      DELETE FROM friendships 
      WHERE id = $1 AND (user_id = $2 OR friend_id = $2) AND status = 'accepted'
    `;
    const result = await pool.query(query, [friendshipId, userId]);
    
    if (result.rowCount === 0) {
      throw new Error('Friendship not found');
    }
  }

  static async getLeaderboard(filter: string): Promise<any[]> {
    let orderBy = 'total_wins DESC, total_games ASC';
    
    switch (filter) {
      case 'human_only':
        orderBy = 'human_only_wins DESC, human_only_games ASC';
        break;
      case 'mixed':
        orderBy = 'mixed_wins DESC, mixed_games ASC';
        break;
      case 'tournament':
        orderBy = 'tournament_wins DESC';
        break;
      default:
        orderBy = 'total_wins DESC, total_games ASC';
    }

    const query = `
      SELECT u.username, us.*, 
             ROW_NUMBER() OVER (ORDER BY ${orderBy}) as rank
      FROM user_statistics us
      JOIN users u ON us.user_id = u.id
      WHERE us.total_games > 0
      ORDER BY ${orderBy}
      LIMIT 100
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
}
