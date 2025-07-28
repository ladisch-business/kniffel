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
}
