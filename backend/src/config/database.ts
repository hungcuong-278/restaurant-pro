import knex, { Knex } from 'knex';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const environment = process.env.NODE_ENV || 'development';

// Get absolute path to database file
const dbPath = path.resolve(__dirname, '../../database/dev.sqlite3');
console.log('[Database] Using database at:', dbPath);

// Database configuration with absolute path
const dbConfig = {
  client: 'sqlite3',
  connection: {
    filename: dbPath
  },
  useNullAsDefault: true,
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations'
  },
  seeds: {
    directory: './seeds'
  }
};

// Create database connection - Singleton pattern
let db: Knex;

function getDatabase(): Knex {
  if (!db) {
    console.log('[Database] Creating new Knex instance');
    db = knex(dbConfig);
  }
  return db;
}

// Initialize on import
db = getDatabase();

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
export const closeConnection = async (): Promise<void> => {
  await db.destroy();
  console.log('🔌 Database connection closed');
};

export default db;