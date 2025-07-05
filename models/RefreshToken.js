import { runQuery, getRow, getAllRows } from '../config/database.js';

export class RefreshToken {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.token = data.token;
    this.expires_at = data.expires_at;
    this.created_at = data.created_at;
  }

  static async create(userId, token, expiresAt) {
    const result = await runQuery(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );

    return await RefreshToken.findById(result.id);
  }

  static async findById(id) {
    const token = await getRow('SELECT * FROM refresh_tokens WHERE id = ?', [id]);
    return token ? new RefreshToken(token) : null;
  }

  static async findByToken(token) {
    const refreshToken = await getRow(
      'SELECT * FROM refresh_tokens WHERE token = ?',
      [token]
    );
    return refreshToken ? new RefreshToken(refreshToken) : null;
  }

  static async findByUserId(userId) {
    const tokens = await getAllRows(
      'SELECT * FROM refresh_tokens WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return tokens.map(token => new RefreshToken(token));
  }

  async delete() {
    await runQuery('DELETE FROM refresh_tokens WHERE id = ?', [this.id]);
  }

  static async deleteByUserId(userId) {
    await runQuery('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
  }

  static async deleteExpired() {
    await runQuery(
      'DELETE FROM refresh_tokens WHERE expires_at <= ?',
      [new Date().toISOString()]
    );
  }

  isExpired() {
    return new Date() > new Date(this.expires_at);
  }

  isValid() {
    return !this.isExpired();
  }
}