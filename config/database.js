import sqlite3 from 'sqlite3';
import {promises as fs} from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || './database/mood_tracker.db';

let db;

export const getDatabase = () => {
    if (!db) {
        throw new Error('Banco de dados não iniciado');
    }
    return db;
};

export const initDatabase = async () => {
    try {
        // Ensure database directory exists
        const dbDir = path.dirname(DB_PATH);
        await fs.mkdir(dbDir, {recursive: true});

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

        // Função de preenchimento de informações DEFAULT no Banco de Dados
        await seedDatabase();

        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
};

const createTables = async () => {
    // Users table
    await runQuery(`
        CREATE TABLE IF NOT EXISTS users
        (
            id
            INTEGER
            PRIMARY
            KEY
            AUTOINCREMENT,
            name
            TEXT
            NOT
            NULL,
            email
            TEXT
            UNIQUE
            NOT
            NULL,
            password
            TEXT
            NOT
            NULL,
            created_at
            DATETIME
            DEFAULT
            CURRENT_TIMESTAMP,
            updated_at
            DATETIME
            DEFAULT
            CURRENT_TIMESTAMP
        )
    `);

    // Refresh tokens table
    await runQuery(`
        CREATE TABLE IF NOT EXISTS refresh_tokens
        (
            id
            INTEGER
            PRIMARY
            KEY
            AUTOINCREMENT,
            user_id
            INTEGER
            NOT
            NULL,
            token
            TEXT
            NOT
            NULL,
            expires_at
            DATETIME
            NOT
            NULL,
            created_at
            DATETIME
            DEFAULT
            CURRENT_TIMESTAMP,
            FOREIGN
            KEY
        (
            user_id
        ) REFERENCES users
        (
            id
        ) ON DELETE CASCADE
            )
    `);

    // Moods table
    await runQuery(`
        CREATE TABLE IF NOT EXISTS moods
        (
            id
            INTEGER
            PRIMARY
            KEY
            AUTOINCREMENT,
            user_id
            INTEGER
            NOT
            NULL,
            rating
            INTEGER
            NOT
            NULL
            CHECK
        (
            rating
            >=
            1
            AND
            rating
            <=
            5
        ),
            note TEXT,
            date DATE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY
        (
            user_id
        ) REFERENCES users
        (
            id
        ) ON DELETE CASCADE
            )
    `);

    await runQuery(`
        CREATE TABLE IF NOT EXISTS group_tag
        (
            id
            INTEGER
            PRIMARY
            KEY
            AUTOINCREMENT,
            group_name
            TEXT
            NOT
            NULL
        )
    `);

    await runQuery(`
        CREATE TABLE IF NOT EXISTS tag
        (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tag_name TEXT UNIQUE NOT NULL,
            icon TEXT NOT NULL,
            group_id INTEGER NOT NULL,
            FOREIGN KEY (group_id) REFERENCES group_tag(id) ON DELETE CASCADE
        )
    `);

    await runQuery(`
        CREATE TABLE IF NOT EXISTS mood_tag
        (
            mood_id
            INTEGER
            NOT
            NULL,
            tag_id
            INTEGER
            NOT
            NULL,
            PRIMARY
            KEY
        (
            mood_id,
            tag_id
        ),
            FOREIGN KEY
        (
            mood_id
        ) REFERENCES moods
        (
            id
        ) ON DELETE CASCADE,
            FOREIGN KEY
        (
            tag_id
        ) REFERENCES tag
        (
            id
        )
          ON DELETE CASCADE
            )
    `);
};

// NOVO: Função de seeding integrada ao arquivo do banco de dados
const seedDatabase = async () => {
    try {
        // 1. Verifica se a tabela de grupos já tem dados
        const checkRow = await getRow('SELECT COUNT(id) as count FROM group_tag');
        if (checkRow && checkRow.count > 0) {
            console.log('Database already seeded. Skipping.');
            return;
        }

        console.log('Database is empty. Seeding initial data...');

        // 2. Define os dados iniciais, agora com nomes de ícones para cada tag
        const initialData = [
            {
                group_name: 'Atividades',
                tags: [
                    { name: 'Trabalho', icon: 'briefcase' },
                    { name: 'Estudo', icon: 'School' },
                    { name: 'Exercício', icon: 'dumbbell' },
                    { name: 'Lazer', icon: 'gamepad-2' }
                ]
            },
            {
                group_name: 'Emoções',
                tags: [
                    { name: 'Feliz', icon: 'Smile' },
                    { name: 'Triste', icon: 'Frown' },
                    { name: 'Ansioso(a)', icon: 'Meh' },
                    { name: 'Calmo(a)', icon: 'Leaf' },
                    { name: 'Bravo', icon: 'Angry' },
                    { name: 'Desapontado', icon: 'Frown' },
                    { name: 'Preocupado', icon: 'Frown' },
                    { name: 'Assustado', icon: 'Ghost' },
                    { name: 'Frustrado', icon: 'Annoyed' },
                    { name: 'Estressado', icon: 'BrainCircuit' }
                ]
            },
            {
                group_name: 'Social',
                tags: [
                    { name: 'Amigos', icon: 'Users' },
                    { name: 'Família', icon: 'Home' },
                    { name: 'Sozinho(a)', icon: 'User' },
                    { name: 'Festa', icon: 'PartyPopper' }
                ]
            },
            {
                group_name: 'Clima',
                tags: [
                    { name: 'Ensolarado', icon: 'Sun' },
                    { name: 'Chuvoso', icon: 'CloudRain' },
                    { name: 'Nublado', icon: 'Cloud' }
                ]
            },
            {
                group_name: 'Saúde',
                tags: [
                    { name: 'Dormi bem', icon: 'Bed' },
                    { name: 'Comi bem', icon: 'Utensils' },
                    { name: 'Doente', icon: 'Thermometer' }
                ]
            }
        ];

        // 3. Insere os dados com a lógica corrigida
        for (const groupData of initialData) {
            const { group_name, tags } = groupData;
            const groupResult = await runQuery('INSERT INTO group_tag (group_name) VALUES (?)', [group_name]);
            const groupId = groupResult.id;

            if (tags && tags.length > 0) {
                // Itera sobre a lista de objetos de tag (que agora contêm nome e ícone)
                for (const tag of tags) {
                    // Corrige o comando INSERT para incluir 3 colunas e 3 valores
                    await runQuery('INSERT INTO tag (tag_name, icon, group_id) VALUES (?, ?, ?)', [tag.name, tag.icon, groupId]);
                }
            }
        }
        console.log('INSERTS de geração de GROUP_TAGS e TAGS criados com sucesso.');

    } catch (error) {
        console.error('Erro durante a inserção de informações DEFAULT:', error);
    }
}

// Helper function to run queries with Promise
export const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({id: this.lastID, changes: this.changes});
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
                console.error('Erro ao fechar o banco de dados:', err);
            } else {
                console.log('Banco de dados desconectado');
            }
        });
    }
};