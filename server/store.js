/**
 * NUMERUS - Storage Adapter
 *
 * Two backends with the same async interface:
 *   - Postgres (Supabase/Neon/etc.) when DATABASE_URL is set  → used in production
 *   - Local JSON file (server/data.json) when it isn't        → used for local dev/tests
 *
 * Tables (Postgres): users, sessions, profiles
 */

const fs = require('fs');
const path = require('path');

// ─── Titles earned by completing story chapters ───────────────
const TITLES = [
  'Aprendiz', 'Escrevente', 'Iniciado', 'Sábio', 'Estrategista',
  'Arquimestre', 'Guardião', 'Lenda', 'Códice Vivo', 'NUMERUS'
];

function titleForCompletedCount(count) {
  if (count <= 0) return TITLES[0];
  return TITLES[Math.min(count, TITLES.length) - 1];
}

// ═══════════════════════════════════════════════════════════════
// POSTGRES BACKEND
// ═══════════════════════════════════════════════════════════════

let pgPool = null;

async function initPostgres() {
  const { Pool } = require('pg');
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS profiles (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL DEFAULT 'Aprendiz',
      stars INTEGER NOT NULL DEFAULT 0,
      completed JSONB NOT NULL DEFAULT '{}',
      games_played INTEGER NOT NULL DEFAULT 0,
      wins INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log('🗄️  Storage: PostgreSQL (Supabase) conectado');
}

async function pgQuery(text, params) {
  const res = await pgPool.query(text, params);
  return res.rows;
}

// ═══════════════════════════════════════════════════════════════
// LOCAL JSON BACKEND
// ═══════════════════════════════════════════════════════════════

const DATA_FILE = path.join(__dirname, 'data.json');
let fileData = null;

function loadFile() {
  if (fileData) return fileData;
  if (fs.existsSync(DATA_FILE)) {
    try {
      fileData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch {
      fileData = null;
    }
  }
  if (!fileData) {
    fileData = { users: [], sessions: [], profiles: [], nextUserId: 1 };
  }
  return fileData;
}

function saveFile() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(fileData, null, 2));
}

function initFile() {
  loadFile();
  saveFile();
  console.log('🗄️  Storage: arquivo local (nenhum DATABASE_URL — modo desenvolvimento)');
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API (backend-agnostic)
// ═══════════════════════════════════════════════════════════════

async function init() {
  if (process.env.DATABASE_URL) {
    await initPostgres();
  } else {
    initFile();
  }
}

function isPostgres() {
  return !!pgPool;
}

// ─── Users ─────────────────────────────────────────────────────

async function getUserByUsername(username) {
  if (isPostgres()) {
    const rows = await pgQuery('SELECT * FROM users WHERE username = $1', [username]);
    return rows[0] || null;
  }
  return loadFile().users.find(u => u.username === username) || null;
}

async function getUserById(id) {
  if (isPostgres()) {
    const rows = await pgQuery('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] || null;
  }
  return loadFile().users.find(u => String(u.id) === String(id)) || null;
}

async function createUser({ username, displayName, passwordHash }) {
  if (isPostgres()) {
    const rows = await pgQuery(
      `INSERT INTO users (username, display_name, password_hash)
       VALUES ($1, $2, $3) RETURNING *`,
      [username, displayName, passwordHash]
    );
    const user = rows[0];
    await pgQuery(
      `INSERT INTO profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING`,
      [user.id]
    );
    return user;
  }
  const data = loadFile();
  const user = {
    id: data.nextUserId++,
    username,
    display_name: displayName,
    password_hash: passwordHash,
    created_at: new Date().toISOString()
  };
  data.users.push(user);
  data.profiles.push({
    user_id: user.id,
    title: 'Aprendiz',
    stars: 0,
    completed: {},
    games_played: 0,
    wins: 0,
    updated_at: new Date().toISOString()
  });
  saveFile();
  return user;
}

// ─── Sessions ──────────────────────────────────────────────────

async function createSession({ token, userId, expiresAt }) {
  if (isPostgres()) {
    await pgQuery(
      'INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)',
      [token, userId, expiresAt]
    );
    return;
  }
  const data = loadFile();
  data.sessions.push({ token, user_id: userId, expires_at: expiresAt });
  saveFile();
}

async function getSession(token) {
  let session = null;
  if (isPostgres()) {
    const rows = await pgQuery('SELECT * FROM sessions WHERE token = $1', [token]);
    session = rows[0] || null;
  } else {
    session = loadFile().sessions.find(s => s.token === token) || null;
  }
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;

  const user = await getUserById(session.user_id);
  if (!user) return null;
  const profile = await getProfile(user.id);
  return { session, user, profile };
}

async function deleteSession(token) {
  if (isPostgres()) {
    await pgQuery('DELETE FROM sessions WHERE token = $1', [token]);
    return;
  }
  const data = loadFile();
  data.sessions = data.sessions.filter(s => s.token !== token);
  saveFile();
}

// ─── Profiles / story progress ─────────────────────────────────

async function getProfile(userId) {
  if (isPostgres()) {
    const rows = await pgQuery(
      `SELECT * FROM profiles WHERE user_id = $1`,
      [userId]
    );
    if (!rows[0]) {
      await pgQuery('INSERT INTO profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [userId]);
      return { user_id: userId, title: 'Aprendiz', stars: 0, completed: {}, games_played: 0, wins: 0 };
    }
    const p = rows[0];
    p.completed = typeof p.completed === 'string' ? JSON.parse(p.completed) : p.completed;
    return p;
  }
  const data = loadFile();
  let profile = data.profiles.find(p => String(p.user_id) === String(userId));
  if (!profile) {
    profile = {
      user_id: userId,
      title: 'Aprendiz',
      stars: 0,
      completed: {},
      games_played: 0,
      wins: 0,
      updated_at: new Date().toISOString()
    };
    data.profiles.push(profile);
    saveFile();
  }
  return profile;
}

/**
 * Record a story chapter result and return the updated profile.
 */
async function updateStoryResult(userId, { chapterId, stars, won }) {
  const profile = await getProfile(userId);
  const completed = { ...profile.completed };
  const previousStars = completed[chapterId] || 0;
  // Only a real win (stars > 0) counts as completing the chapter
  if (stars > 0) {
    // Keep the best stars for the chapter
    completed[chapterId] = Math.max(previousStars, stars);
  }

  const completedCount = Object.keys(completed).length;
  const title = titleForCompletedCount(completedCount);
  const totalStars = Object.values(completed).reduce((s, n) => s + n, 0);

  if (isPostgres()) {
    await pgQuery(
      `UPDATE profiles
       SET completed = $1, stars = $2, title = $3,
           games_played = games_played + 1,
           wins = wins + $4,
           updated_at = NOW()
       WHERE user_id = $5`,
      [JSON.stringify(completed), totalStars, title, won ? 1 : 0, userId]
    );
  } else {
    const data = loadFile();
    const p = data.profiles.find(x => String(x.user_id) === String(userId));
    if (p) {
      p.completed = completed;
      p.stars = totalStars;
      p.title = title;
      p.games_played += 1;
      p.wins += won ? 1 : 0;
      p.updated_at = new Date().toISOString();
    }
    saveFile();
  }

  return getProfile(userId);
}

module.exports = {
  init,
  isPostgres,
  getUserByUsername,
  getUserById,
  createUser,
  createSession,
  getSession,
  deleteSession,
  getProfile,
  updateStoryResult,
  titleForCompletedCount
};
