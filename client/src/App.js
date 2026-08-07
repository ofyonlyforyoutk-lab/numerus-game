import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import AnimatedMenu from './components/AnimatedMenu';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import Results from './components/Results';
import { CPUGameEngine } from './cpu-game-engine';
import { sound } from './utils/sound';
import './App.css';

const SERVER_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : window.location.origin;

function App() {
  // Connection state
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // Game mode
  const [gameMode, setGameMode] = useState(null); // 'menu', 'lobby', 'cpu', 'online'
  const [cpuEngine, setCpuEngine] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [results, setResults] = useState(null);

  // Online state
  const [roomId, setRoomId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [error, setError] = useState(null);

  // Initialize socket
  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('room_update', (data) => {
      setRoomPlayers(data.players);
    });

    newSocket.on('game_state', (state) => {
      setGameState(state);
      setResults(null);
    });

    newSocket.on('game_over', (res) => {
      setResults(res);
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  // ─── Menu Actions ─────────────────────────────────────────

  const handleStartCPU = useCallback((difficulty) => {
    const engine = new CPUGameEngine(2, difficulty);
    engine.onStateChange = (state) => {
      setGameState(state);
      if (state.finished) {
        setResults(state.results);
      }
    };
    engine.start();
    setCpuEngine(engine);
    setGameMode('cpu');
  }, []);

  const handleStartOnline = useCallback(() => {
    setGameMode('lobby');
  }, []);

  const handleCreateRoom = useCallback((callback) => {
    if (!socket) return;
    socket.emit('create_room', {}, (response) => {
      if (response.success) {
        setRoomId(response.roomId);
        setPlayerId(response.playerId);
      }
      callback(response);
    });
  }, [socket]);

  const handleJoinRoom = useCallback((id, callback) => {
    if (!socket) return;
    socket.emit('join_room', { roomId: id }, (response) => {
      if (response.success) {
        setRoomId(response.roomId);
        setPlayerId(response.playerId);
      }
      callback(response);
    });
  }, [socket]);

  const handleStartOnlineGame = useCallback((callback) => {
    if (!socket) return;
    socket.emit('start_game', {}, (response) => {
      if (response.success) setGameMode('online');
      callback(response);
    });
  }, [socket]);

  const handleOnlineAction = useCallback((action, callback) => {
    if (!socket) return;
    socket.emit('game_action', { action }, callback);
  }, [socket]);

  const handleCPUAction = useCallback((action) => {
    if (cpuEngine) {
      cpuEngine.processHumanAction(action);
    }
  }, [cpuEngine]);

  const handleBackToMenu = useCallback(() => {
    setGameMode('menu');
    setGameState(null);
    setResults(null);
    setCpuEngine(null);
    setRoomId(null);
    setPlayerId(null);
    setRoomPlayers([]);
  }, []);

  // ─── Render ───────────────────────────────────────────────

  // Loading
  if (!socket) {
    return (
      <div className="app">
        <div className="header">
          <h1>NUMERUS</h1>
          <div className="subtitle">Master the Equation</div>
        </div>
        <div className="loading-screen">
          <div className="loading-emblem">N</div>
          <div className="loading-text">Preparando o Códice...</div>
        </div>
      </div>
    );
  }

  // Results
  if (results) {
    return (
      <div className="app">
        <div className="header">
          <h1>NUMERUS</h1>
          <div className="subtitle">Master the Equation</div>
        </div>
        <Results results={results} onPlayAgain={handleBackToMenu} />
      </div>
    );
  }

  // Game in progress
  if (gameState && gameState.started && (gameMode === 'cpu' || gameMode === 'online')) {
    return (
      <div className="app">
        <GameBoard
          gameState={gameState}
          playerId={gameMode === 'cpu' ? 'human-player' : playerId}
          onAction={gameMode === 'cpu' ? handleCPUAction : handleOnlineAction}
          onBackToMenu={handleBackToMenu}
          isCPU={gameMode === 'cpu'}
        />
      </div>
    );
  }

  // Lobby (online)
  if (gameMode === 'lobby') {
    return (
      <div className="app">
        <div className="header">
          <h1>NUMERUS</h1>
          <div className="subtitle">Master the Equation</div>
        </div>
        <Lobby
          roomId={roomId}
          playerId={playerId}
          players={roomPlayers}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onStartGame={handleStartOnlineGame}
          onBackToMenu={handleBackToMenu}
          error={error}
        />
      </div>
    );
  }

  // Main Menu
  return (
    <div className="app">
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/assets/cover.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.06,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      <div className="header">
        <h1>NUMERUS</h1>
        <div className="subtitle">Master the Equation</div>
        <p className="tagline">Um Jogo de Estratégia • Lógica • Matemática</p>
      </div>
      <AnimatedMenu
        onStartGame={handleStartCPU}
        onStartOnline={handleStartOnline}
        onJoinRoom={(code) => {
          handleJoinRoom(code, (res) => {
            if (res.success) setGameMode('lobby');
          });
        }}
      />
    </div>
  );
}

export default App;
