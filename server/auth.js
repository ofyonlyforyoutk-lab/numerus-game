/**
 * NUMERUS - Authentication module
 * Username + password with bcryptjs (pure JS, no native build issues)
 * and opaque session tokens stored in the database.
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const store = require('./store');

const SESSION_TTL_DAYS = 30;

function publicUser(user, profile) {
  return {
    id: String(user.id),
    username: user.username,
    displayName: user.display_name || user.username,
    profile: profile ? {
      title: profile.title,
      stars: profile.stars || 0,
      completed: profile.completed || {},
      gamesPlayed: profile.games_played || 0,
      wins: profile.wins || 0
    } : null
  };
}

async function register({ username, password, displayName }) {
  const cleanUsername = String(username || '').trim().toLowerCase();
  const cleanDisplay = String(displayName || '').trim();

  if (cleanUsername.length < 3) {
    return { success: false, error: 'O nome de usuário precisa de pelo menos 3 caracteres' };
  }
  if (!/^[a-z0-9_.-]+$/.test(cleanUsername)) {
    return { success: false, error: 'Use apenas letras, números, ponto, traço ou underline no usuário' };
  }
  if (!password || password.length < 4) {
    return { success: false, error: 'A senha precisa de pelo menos 4 caracteres' };
  }

  const existing = await store.getUserByUsername(cleanUsername);
  if (existing) {
    return { success: false, error: 'Este nome de usuário já está em uso' };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await store.createUser({
    username: cleanUsername,
    displayName: cleanDisplay || cleanUsername,
    passwordHash
  });

  const token = await createSessionFor(user.id);
  const profile = await store.getProfile(user.id);
  return { success: true, token, user: publicUser(user, profile) };
}

async function login({ username, password }) {
  const cleanUsername = String(username || '').trim().toLowerCase();
  const user = await store.getUserByUsername(cleanUsername);
  if (!user) {
    return { success: false, error: 'Usuário ou senha incorretos' };
  }

  const ok = await bcrypt.compare(password || '', user.password_hash);
  if (!ok) {
    return { success: false, error: 'Usuário ou senha incorretos' };
  }

  const token = await createSessionFor(user.id);
  const profile = await store.getProfile(user.id);
  return { success: true, token, user: publicUser(user, profile) };
}

async function createSessionFor(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await store.createSession({ token, userId, expiresAt });
  return token;
}

async function logout(token) {
  if (token) await store.deleteSession(token);
}

async function me(token) {
  if (!token) return null;
  const session = await store.getSession(token);
  if (!session) return null;
  return publicUser(session.user, session.profile);
}

/** Express middleware — requires a valid Bearer token. */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const session = token ? await store.getSession(token) : null;
  if (!session) {
    return res.status(401).json({ success: false, error: 'Não autenticado' });
  }
  req.auth = { token, user: session.user, profile: session.profile };
  next();
}

module.exports = { register, login, logout, me, requireAuth, publicUser };
