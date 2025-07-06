import bcrypt from "bcryptjs";
import { runQuery, getRow, getAllRows } from "../config/database.js";

export class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async create(userData) {
    const { name, email, password } = userData;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await runQuery(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    return await User.findById(result.id);
  }

  static async findById(id) {
    const user = await getRow("SELECT * FROM users WHERE id = ?", [id]);
    return user ? new User(user) : null;
  }

  static async findByEmail(email) {
    const user = await getRow("SELECT * FROM users WHERE email = ?", [email]);
    return user ? new User(user) : null;
  }

  static async findAll() {
    const users = await getAllRows(
      "SELECT * FROM users ORDER BY created_at DESC"
    );
    return users.map((user) => new User(user));
  }

  async update(updates) {
    const allowedUpdates = ["name", "email"];
    const validUpdates = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        validUpdates[key] = updates[key];
      }
    }

    if (Object.keys(validUpdates).length === 0) {
      return this;
    }

    const setClause = Object.keys(validUpdates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = [...Object.values(validUpdates), this.id];

    await runQuery(
      `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return await User.findById(this.id);
  }

  async updatePassword(newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await runQuery(
      "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [hashedPassword, this.id]
    );
  }

  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  async delete() {
    await runQuery("DELETE FROM users WHERE id = ?", [this.id]);
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
