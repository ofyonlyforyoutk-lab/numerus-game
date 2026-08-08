/**
 * NUMERUS - Multiplayer Server
 * Express + Socket.io for real-time game communication
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const {
  createGameState,
  executeRoundAction,
  checkRoundComplete,
  advanceRound,
  startGame,
  calculateFinalResults,
  calculateStoryResult,
  processCPUTurns,
  ROUNDS
} = require('./game-logic');
const { getChapter, cpuThinkMs } = require('./chapters');
const store = require('./store');
const auth = require('./auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Serve static React build
app.use(express.static(path.join(__dirname, '../client/build')));

// ═══════════════════════════════════════════════════════════════
// ROOM MANAGEMENT
// ═══════════════════════════════════════════════════════════════

const rooms = new Map();

function getRoom(roomId) {
  return rooms.get(roomId);
}

function createRoom(roomId, settings = {}) {
  const room = {
    id: roomId,
    players: [],
    host: null,
    names: {},
    userIds: {},
    mode: 'online',
    chapterId: null,
    game: null,
    settings: {
      maxPlayers: settings.maxPlayers || 6,
      maxRounds: settings.maxRounds || 10,
      timeLimit: settings.timeLimit || null
    },
    created: Date.now()
  };
  rooms.set(roomId, room);
  return room;
}

/** Payload for room_update with player names + mode. */
function roomUpdatePayload(room) {
  return {
    roomId: room.id,
    mode: room.mode,
    chapterId: room.chapterId,
    players: room.players.map((id, i) => ({ id, name: room.names[id] || `Jogador ${i + 1}` })),
    settings: room.settings,
    host: room.host
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Resolve a user account from a session token (optional). */
async function resolveUserId(token) {
  if (!token) return null;
  try {
    const session = await store.getSession(token);
    return session ? session.user.id : null;
  } catch {
    return null;
  }
}

/**
 * Co-op story game over: computes the group result, awards progress
 * to every logged-in human, and emits game_over with storyResult.
 */
async function finishStoryGame(room) {
  const story = calculateStoryResult(room.game);
  const payload = {
    ...room.game.results,
    storyResult: {
      won: story.won,
      stars: story.stars,
      chips: story.chips,
      bossPosition: story.bossPosition,
      chapterId: room.chapterId
    }
  };

  if (room.chapterId) {
    for (const pid of room.players) {
      const userId = room.userIds[pid];
      if (!userId) continue;
      try {
        const profile = await store.getProfile(userId);
        const completedCount = Object.keys(profile.completed || {}).length;
        if (room.chapterId > completedCount + 1) continue; // chapter still locked for this player
        await store.updateStoryResult(userId, {
          chapterId: room.chapterId,
          stars: story.won ? story.stars : 0,
          won: story.won
        });
      } catch (e) {
        console.error('coop award error:', e.message);
      }
    }
  }

  io.to(room.id).emit('game_over', payload);
}

function advanceChained(gameState) {    // Auto-advance through rounds that are already complete (e.g. final judgment)
    let maxSteps = 12;
    while (maxSteps-- > 0) {
      if (checkRoundComplete(gameState)) {
        const hasMore = advanceRound(gameState);
        if (!hasMore) {
          return false; // Game over
        }
      } else {
        break;
      }
    }
    if (maxSteps <= 0) {
      console.warn('⚠️ advanceChained: guarda de segurança atingida em rodada', gameState.currentRound);
    }
    return true;
}

/**
 * Remove a player from a room and handle all consequences:
 * - Deletes the room if it becomes empty
 * - Transfers host status to the first remaining player
 * - If a game is running, ends it for the remaining players (abandonment)
 */
async function handlePlayerLeave(room, roomId, playerId) {
  const wasHost = room.host === playerId;
  delete room.userIds[playerId];
  room.players = room.players.filter(p => p !== playerId);

  if (room.players.length === 0) {
    rooms.delete(roomId);
    console.log(`🗑️ Room deleted: ${roomId}`);
    return;
  }

  if (wasHost) room.host = room.players[0];

  // If a game is running and someone abandons, finish it for the rest
  if (room.game && room.game.started && !room.game.finished) {
    calculateFinalResults(room.game);
    room.game.finished = true;
    if (room.mode === 'story') {
      await finishStoryGame(room);
    } else {
      io.to(roomId).emit('game_over', room.game.results);
    }
    broadcastGameState(roomId);
    return;
  }

  io.to(roomId).emit('room_update', roomUpdatePayload(room));
}

function broadcastGameState(roomId) {
  const room = getRoom(roomId);
  if (!room || !room.game) return;

  // Send each player their own hand + public game state
  for (const playerId of room.players) {
    const playerState = {
      ...room.game,
      mode: room.mode,
      chapterId: room.chapterId,
      myId: playerId,
      myHand: room.game.players[playerId]?.hand || [],
      myOperations: room.game.players[playerId]?.operations || [],
      mySpecials: room.game.players[playerId]?.specials || [],
      myFaceDown: room.game.players[playerId]?.faceDown || [],
      myChips: room.game.players[playerId]?.chips || 0,
      myBet: room.game.players[playerId]?.bet || 0,
      myDestiny: room.game.players[playerId]?.destiny || null,
      myEquationResult: room.game.players[playerId]?.equationResult ?? null,
      myRevealed: room.game.players[playerId]?.revealed || false,
      // Hide other players' hands
      players: Object.fromEntries(
        Object.entries(room.game.players).map(([id, p]) => [
          id,
          {
            id: p.id,
            name: p.name,
            chips: p.chips,
            handCount: p.hand.length,
            bet: p.bet,
            folded: p.folded,
            revealed: p.revealed,
            destiny: p.destiny,
            equationResult: p.destiny ? p.equationResult : null,
            isCPU: !!p.isCPU
          }
        ])
      )
    };
    io.to(playerId).emit('game_state', playerState);
  }
}

// ═══════════════════════════════════════════════════════════════
// SOCKET CONNECTIONS
// ═══════════════════════════════════════════════════════════════

io.on('connection', (socket) => {
  console.log(`🔌 Player connected: ${socket.id}`);

  let currentRoom = null;

  // ─── Create Room ──────────────────────────────────────────
  socket.on('create_room', async (data, callback) => {
    try {
      const roomId = data.roomId || `numerus-${Math.random().toString(36).substr(2, 6)}`;
      const isStory = data.mode === 'story';
      const room = createRoom(roomId, { ...(data.settings || {}), maxPlayers: isStory ? 4 : 6 });
      room.mode = isStory ? 'story' : 'online';
      room.chapterId = isStory ? (Number(data.chapterId) || 1) : null;
      room.host = socket.id;
      room.names[socket.id] = (data.name || '').trim().slice(0, 20) || null;
      room.userIds[socket.id] = await resolveUserId(data.token);
      room.players.push(socket.id);
      socket.join(roomId);
      currentRoom = roomId;

      console.log(`🏠 Room created: ${roomId} (${room.mode}${isStory ? ` cap. ${room.chapterId}` : ''}) by ${socket.id}`);
      callback({ success: true, roomId, playerId: socket.id, host: room.host, mode: room.mode, chapterId: room.chapterId });
      io.to(roomId).emit('room_update', roomUpdatePayload(room));
    } catch (e) {
      console.error('create_room error:', e.message);
      callback({ success: false, error: 'Erro ao criar sala' });
    }
  });

  // ─── Join Room ────────────────────────────────────────────
  socket.on('join_room', async (data, callback) => {
    try {
      const room = getRoom(data.roomId);
      if (!room) {
        return callback({ success: false, error: 'Sala não encontrada' });
      }
      if (room.players.length >= room.settings.maxPlayers) {
        return callback({ success: false, error: 'Sala cheia' });
      }
      if (room.game && room.game.started) {
        return callback({ success: false, error: 'Jogo já começou' });
      }

      room.names[socket.id] = (data.name || '').trim().slice(0, 20) || null;
      room.userIds[socket.id] = await resolveUserId(data.token);
      room.players.push(socket.id);
      socket.join(data.roomId);
      currentRoom = data.roomId;

      console.log(`🚪 Player ${socket.id} joined room ${data.roomId} (${room.mode})`);
      callback({ success: true, roomId: data.roomId, playerId: socket.id, host: room.host, mode: room.mode, chapterId: room.chapterId });
      io.to(data.roomId).emit('room_update', roomUpdatePayload(room));
    } catch (e) {
      console.error('join_room error:', e.message);
      callback({ success: false, error: 'Erro ao entrar na sala' });
    }
  });

  // ─── Start Game ───────────────────────────────────────────
  socket.on('start_game', (data, callback) => {
    const room = getRoom(currentRoom);
    if (!room) return callback({ success: false, error: 'Sala não encontrada' });
    if (room.host !== socket.id) {
      return callback({ success: false, error: 'Apenas o anfitrião da sala pode iniciar o duelo' });
    }
    if (room.game && room.game.started) {
      return callback({ success: false, error: 'O jogo já começou' });
    }

    if (room.mode === 'story') {
      const chapter = getChapter(room.chapterId);
      if (!chapter) return callback({ success: false, error: 'Capítulo não encontrado' });
      if (room.players.length < 1) return callback({ success: false, error: 'Sem jogadores na sala' });
      if (room.players.length > 4) return callback({ success: false, error: 'Máximo de 4 jogadores no co-op' });
      // Co-op: 1-4 humans + the chapter's boss (CPU)
      room.game = createGameState(currentRoom, room.players, room.settings, room.names, {
        name: chapter.master,
        difficulty: chapter.difficulty,
        bonus: chapter.bonus
      });
    } else {
      if (room.players.length < 2) {
        return callback({ success: false, error: 'Mínimo 2 jogadores' });
      }
      room.game = createGameState(currentRoom, room.players, room.settings, room.names);
    }

    if (!startGame(room.game)) {
      return callback({ success: false, error: 'Erro ao iniciar jogo' });
    }

    console.log(`🎮 Game started in room ${currentRoom} (${room.mode}${room.mode === 'story' ? `, capítulo ${room.chapterId}` : ''})`);
    callback({ success: true });

    // Auto-execute Round 0 (Despertar - deal operations) for everyone, incl. the boss
    for (const playerId of Object.keys(room.game.players)) {
      executeRoundAction(room.game, playerId, { type: 'deal_operations' });
    }

    // Round 0 is auto-complete after dealing; advance to Round 1
    if (checkRoundComplete(room.game)) {
      advanceRound(room.game);
    }

    broadcastGameState(currentRoom);
  });

  // ─── Game Action ──────────────────────────────────────────
  socket.on('game_action', async (data, callback) => {
    const room = getRoom(currentRoom);
    if (!room || !room.game) {
      return callback({ success: false, error: 'Jogo não encontrado' });
    }

    // Co-op story: serialize per-room so concurrent human actions can't
    // interleave during the boss's "thinking" delay (prevents double awards)
    if (room.mode === 'story' && room.chapterId) {
      room._chain = (room._chain || Promise.resolve()).then(async () => {
        const fresh = getRoom(currentRoom);
        if (!fresh || !fresh.game) return callback({ success: false, error: 'Jogo não encontrado' });
        if (fresh.game.finished) return callback({ success: false, error: 'Jogo já terminou' });

        const result = executeRoundAction(fresh.game, socket.id, data.action);
        if (!result.success) return callback(result);

        const chapter = getChapter(fresh.chapterId);
        fresh.game.cpuThinking = true;
        broadcastGameState(currentRoom);
        await sleep(cpuThinkMs(chapter ? chapter.difficulty : 'estrategista'));
        fresh.game.cpuThinking = false;

        // Someone abandoned the game while we were "thinking" — stop here
        if (fresh.game.finished) return callback(result);

        processCPUTurns(fresh.game, chapter ? chapter.difficulty : 'estrategista');

        const hasMore = advanceChained(fresh.game);
        if (!hasMore) {
          await finishStoryGame(fresh);
          broadcastGameState(currentRoom);
          return callback(result);
        }
        broadcastGameState(currentRoom);
        callback(result);
      }).catch((e) => {
        console.error('story action error:', e.message);
        callback({ success: false, error: 'Erro ao processar ação' });
      });
      return;
    }

    // Normal (competitive) flow
    const result = executeRoundAction(room.game, socket.id, data.action);
    if (!result.success) {
      return callback(result);
    }

    const hasMore = advanceChained(room.game);
    if (!hasMore) {
      io.to(currentRoom).emit('game_over', room.game.results);
    }

    broadcastGameState(currentRoom);
    callback(result);
  });

  // ─── Leave Room (voluntário) ─────────────────────────────
  socket.on('leave_room', async () => {
    const room = getRoom(currentRoom);
    if (!room) return;
    // Leave the socket.io room FIRST so the leaver doesn't receive
    // game_over/room_update broadcasts meant for the remaining players.
    socket.leave(currentRoom);
    await handlePlayerLeave(room, currentRoom, socket.id);
    currentRoom = null;
  });

  // ─── Disconnect ───────────────────────────────────────────
  socket.on('disconnect', async () => {
    console.log(`❌ Player disconnected: ${socket.id}`);

    if (currentRoom) {
      const room = getRoom(currentRoom);
      if (room) {
        await handlePlayerLeave(room, currentRoom, socket.id);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════

app.get('/api/rooms', (req, res) => {
  const roomList = [];
  for (const [id, room] of rooms) {
    roomList.push({
      id,
      players: room.players.length,
      maxPlayers: room.settings.maxPlayers,
      started: room.game?.started || false
    });
  }
  res.json(roomList);
});

// ═══════════════════════════════════════════════════════════════
// AUTH & PROFILE API
// ═══════════════════════════════════════════════════════════════

app.post('/api/auth/register', async (req, res) => {
  try {
    const result = await auth.register(req.body || {});
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (e) {
    console.error('register error:', e.message);
    res.status(500).json({ success: false, error: 'Erro interno ao criar conta' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const result = await auth.login(req.body || {});
    if (!result.success) return res.status(401).json(result);
    res.json(result);
  } catch (e) {
    console.error('login error:', e.message);
    res.status(500).json({ success: false, error: 'Erro interno ao entrar' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  await auth.logout(token);
  res.json({ success: true });
});

app.get('/api/auth/me', async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const user = await auth.me(token);
  if (!user) return res.status(401).json({ success: false, error: 'Sessão inválida' });
  res.json({ success: true, user });
});

// Story progress (requires login)
app.get('/api/profile', auth.requireAuth, async (req, res) => {
  res.json({ success: true, user: auth.publicUser(req.auth.user, req.auth.profile) });
});

app.post('/api/story/complete', auth.requireAuth, async (req, res) => {
  const { chapterId, stars, won } = req.body || {};
  const id = parseInt(chapterId, 10);
  if (!Number.isInteger(id) || id < 1 || id > 12) {
    return res.status(400).json({ success: false, error: 'Capítulo inválido' });
  }
  // Anti-cheat: only the current or next chapter can be completed
  const profile = await store.getProfile(req.auth.user.id);
  const completedCount = Object.keys(profile.completed || {}).length;
  if (id > completedCount + 1) {
    return res.status(403).json({ success: false, error: 'Este círculo ainda está bloqueado' });
  }
  const s = Math.max(0, Math.min(3, Math.round(parseInt(stars, 10) || 0)));
  const w = !!won;
  try {
    const updated = await store.updateStoryResult(req.auth.user.id, { chapterId: id, stars: s, won: w });
    res.json({ success: true, profile: auth.publicUser(req.auth.user, updated).profile });
  } catch (e) {
    console.error('story/complete error:', e.message);
    res.status(500).json({ success: false, error: 'Erro ao salvar progresso' });
  }
});

// Serve React app for all other routes
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3001;
store.init()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`\n⚔️  NUMERUS Server running on port ${PORT}`);
      console.log(`   📡 Socket.io ready`);
      console.log(`   🎮 Waiting for players...\n`);
    });
  })
  .catch((err) => {
    console.error('Falha ao inicializar armazenamento:', err.message);
    process.exit(1);
  });
