import sqlite3 from 'sqlite3';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || './database/mood_tracker.db';

let db;

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

export const initDatabase = async () => {
  try {
    // Ensure database directory exists
    const dbDir = path.dirname(DB_PATH);
    await fs.mkdir(dbDir, { recursive: true });

    // Initialize SQLite database
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        throw err;
      }
    });

    // Enable foreign keys
    await runQuery('PRAGMA foreign_keys = ON');

    // Create tables
    await createTables();
    
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

const createTables = async () => {
  // Users table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Refresh tokens table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Moods table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS moods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mood_value INTEGER NOT NULL CHECK (mood_value >= 1 AND mood_value <= 10),
      emotions TEXT, -- JSON string of emotions array
      notes TEXT,
      activities TEXT, -- JSON string of activities array
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  await runQuery('CREATE INDEX IF NOT EXISTS idx_moods_user_id ON moods(user_id)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_moods_date ON moods(date)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_moods_user_date ON moods(user_id, date)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)');
};

// Helper function to run queries with Promise
export const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

// Helper function to get a single row
export const getRow = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Helper function to get all rows
export const getAllRows = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Close database connection
export const closeDatabase = () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
};