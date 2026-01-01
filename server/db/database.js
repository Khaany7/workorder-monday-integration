const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
let db;

function initDatabase() {
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err);
        } else {
            console.log('✅ Connected to SQLite database');
            createTables();
        }
    });
}

function createTables() {
    // Users table
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('✅ Users table ready');
        }
    });

    // Work orders table
    db.run(`
    CREATE TABLE IF NOT EXISTS workorders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project TEXT,
      wo TEXT,
      po TEXT,
      state TEXT,
      status TEXT,
      date TEXT,
      pm TEXT,
      notes TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
        if (err) {
            console.error('Error creating workorders table:', err);
        } else {
            console.log('✅ Workorders table ready');
        }
    });
}

function getDatabase() {
    return db;
}

module.exports = { initDatabase, getDatabase };
