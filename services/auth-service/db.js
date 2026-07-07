const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'auth_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

let ready = false;

// Initialize database (create table if it doesn't exist)
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student';`);
    } catch (alterError) {
      console.warn('Could not alter users table to add role column:', alterError.message);
    }
    ready = true;
    console.log('Database initialized successfully.');
    return true;
  } catch (error) {
    ready = false;
    console.warn('PostgreSQL unavailable. Auth service will use in-memory users for this run.');
    return false;
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDb,
  isReady: () => ready,
};
