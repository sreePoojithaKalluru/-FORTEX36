import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', '..', 'data');
const dbPath = join(dataDir, 'app.db');

if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

function init() {
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      domain TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS emails (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      sender TEXT,
      date TEXT,
      received_at TEXT NOT NULL,
      is_relevant INTEGER DEFAULT 0,
      relevance_reason TEXT,
      deadline TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      email_id INTEGER,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      deadline_at TEXT,
      sent_at TEXT,
      read_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (email_id) REFERENCES emails(id)
    );

    CREATE TABLE IF NOT EXISTS gmail_tokens (
      user_id INTEGER PRIMARY KEY,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      expiry_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_emails_user ON emails(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_emails_deadline ON emails(deadline);
  `);

  // Insert sample demo user
  const demoUser = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@example.com');
  if (!demoUser) {
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, domain) 
      VALUES (?, ?, ?)
    `).run('demo@example.com', 'demo123', 'Software Development');
    
    const userId = result.lastInsertRowid;
    
    // Insert sample notifications
    db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, deadline_at, sent_at) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      'deadline_reminder',
      'Deadline Approaching',
      'The code review deadline for "Authentication Module" is in 3 days.',
      '2024-01-25',
      new Date().toISOString()
    );
    
    db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, sent_at) 
      VALUES (?, ?, ?, ?, ?)
    `).run(
      userId,
      'relevant_email',
      'New Relevant Email',
      'A new software development project email has been categorized as relevant to your domain.',
      new Date().toISOString()
    );
  }

  console.log('Database initialized at', dbPath);
  db.close();
}

init();
