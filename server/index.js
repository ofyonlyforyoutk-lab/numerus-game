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
  ROUNDS
} = require('./game-logic');

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
function handlePlayerLeave(room, roomId, playerId) {
  const wasHost = room.host === playerId;
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
    io.to(roomId).emit('game_over', room.game.results);
    broadcastGameState(roomId);
    return;
  }

  io.to(roomId).emit('room_update', {
    roomId,
    players: room.players,
    settings: room.settings,
    host: room.host
  });
}

function broadcastGameState(roomId) {
  const room = getRoom(roomId);
  if (!room || !room.game) return;

  // Send each player their own hand + public game state
  for (const playerId of room.players) {
    const playerState = {
      ...room.game,
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
            equationResult: p.destiny ? p.equationResult : null
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
  socket.on('create_room', (data, callback) => {
    const roomId = data.roomId || `numerus-${Math.random().toString(36).substr(2, 6)}`;
    const room = createRoom(roomId, data.settings);
    room.host = socket.id;
    room.players.push(socket.id);
    socket.join(roomId);
    currentRoom = roomId;

    console.log(`🏠 Room created: ${roomId} by ${socket.id}`);
    callback({ success: true, roomId, playerId: socket.id, host: room.host });
    io.to(roomId).emit('room_update', {
      roomId,
      players: room.players,
      settings: room.settings,
      host: room.host
    });
  });

  // ─── Join Room ────────────────────────────────────────────
  socket.on('join_room', (data, callback) => {
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

    room.players.push(socket.id);
    socket.join(data.roomId);
    currentRoom = data.roomId;

    console.log(`🚪 Player ${socket.id} joined room ${data.roomId}`);
    callback({ success: true, roomId: data.roomId, playerId: socket.id, host: room.host });
    io.to(data.roomId).emit('room_update', {
      roomId: data.roomId,
      players: room.players,
      settings: room.settings,
      host: room.host
    });
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
    if (room.players.length < 2) {
      return callback({ success: false, error: 'Mínimo 2 jogadores' });
    }

    // Create game state
    room.game = createGameState(currentRoom, room.players, room.settings);
    
    if (!startGame(room.game)) {
      return callback({ success: false, error: 'Erro ao iniciar jogo' });
    }

    console.log(`🎮 Game started in room ${currentRoom}`);
    callback({ success: true });
    
    // Auto-execute Round 0 (Despertar - deal operations)
    for (const playerId of room.players) {
      executeRoundAction(room.game, playerId, { type: 'deal_operations' });
    }

    // Round 0 is auto-complete after dealing; advance to Round 1
    if (checkRoundComplete(room.game)) {
      advanceRound(room.game);
    }
    
    broadcastGameState(currentRoom);
  });

  // ─── Game Action ──────────────────────────────────────────
  socket.on('game_action', (data, callback) => {
    const room = getRoom(currentRoom);
    if (!room || !room.game) {
      return callback({ success: false, error: 'Jogo não encontrado' });
    }

    const result = executeRoundAction(room.game, socket.id, data.action);
    
    if (!result.success) {
      return callback(result);
    }

    // Auto-advance through rounds that are already complete (auto-rounds)
    const hasMore = advanceChained(room.game);
    if (!hasMore) {
      io.to(currentRoom).emit('game_over', room.game.results);
    }

    broadcastGameState(currentRoom);
    callback(result);
  });

  // ─── Leave Room (voluntário) ─────────────────────────────
  socket.on('leave_room', () => {
    const room = getRoom(currentRoom);
    if (!room) return;
    // Leave the socket.io room FIRST so the leaver doesn't receive
    // game_over/room_update broadcasts meant for the remaining players.
    socket.leave(currentRoom);
    handlePlayerLeave(room, currentRoom, socket.id);
    currentRoom = null;
  });

  // ─── Disconnect ───────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`❌ Player disconnected: ${socket.id}`);
    
    if (currentRoom) {
      const room = getRoom(currentRoom);
      if (room) {
        handlePlayerLeave(room, currentRoom, socket.id);
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

// Serve React app for all other routes
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n⚔️  NUMERUS Server running on port ${PORT}`);
  console.log(`   📡 Socket.io ready`);
  console.log(`   🎮 Waiting for players...\n`);
});
