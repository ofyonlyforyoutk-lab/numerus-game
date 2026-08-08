import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import AnimatedMenu from './components/AnimatedMenu';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import Results from './components/Results';
import StoryHub from './components/StoryHub';
import StoryResult from './components/StoryResult';
import { CPUGameEngine } from './cpu-game-engine';
import { sound } from './utils/sound';
import { STORY_TITLES, MAX_CHAPTERS, STORY_LOCAL_KEY, defaultProgress, CHAPTERS } from './story/campaign';
import './App.css';

const SERVER_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : window.location.origin;

const API = SERVER_URL;

function App() {
  // Connection state
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // Game mode
  const [gameMode, setGameMode] = useState(null); // 'menu', 'lobby', 'cpu', 'online', 'story', 'story-battle'
  const [cpuEngine, setCpuEngine] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [results, setResults] = useState(null);

  // Online state
  const [roomId, setRoomId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [hostId, setHostId] = useState(null);
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [error, setError] = useState(null);

  // Account (auth)
  const [auth, setAuth] = useState(null); // { token, user }

  // Story mode
  const [storyProgress, setStoryProgress] = useState(defaultProgress());
  const [storyEngine, setStoryEngine] = useState(null);
  const [storyChapter, setStoryChapter] = useState(null);
  const [storyResult, setStoryResult] = useState(null);

  // ─── Restore auth + story progress ─────────────────────────
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('numerus_auth') || 'null');
      if (saved?.token) {
        setAuth(saved);
        fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${saved.token}` } })
          .then((r) => r.json())
          .then((data) => {
            if (data.success && data.user) {
              const updated = { token: saved.token, user: data.user };
              setAuth(updated);
              localStorage.setItem('numerus_auth', JSON.stringify(updated));
            } else {
              localStorage.removeItem('numerus_auth');
              setAuth(null);
            }
          })
          .catch(() => {});
      }
    } catch { /* ignore */ }

    try {
      const local = JSON.parse(localStorage.getItem(STORY_LOCAL_KEY) || 'null');
      if (local) setStoryProgress({ ...defaultProgress(), ...local });
    } catch { /* ignore */ }
  }, []);

  // When logged in, server profile is the source of truth for story progress
  useEffect(() => {
    if (!auth?.token) return;
    fetch(`${API}/api/profile`, { headers: { Authorization: `Bearer ${auth.token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user?.profile) {
          const p = data.user.profile;
          const merged = {
            title: p.title || 'Aprendiz',
            stars: p.stars || 0,
            completed: p.completed || {},
            gamesPlayed: p.gamesPlayed || 0,
            wins: p.wins || 0
          };
          setStoryProgress(merged);
          localStorage.setItem(STORY_LOCAL_KEY, JSON.stringify(merged));
        }
      })
      .catch(() => {});
  }, [auth?.token]);

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
      if (data.host) setHostId(data.host);
    });

    newSocket.on('game_state', (state) => {
      setGameState(state);
      // Don't clear results if this is the final state (game_over already fired)
      if (!state?.finished) setResults(null);
      // If the game started while we were still in the lobby, jump straight into the board
      if (state?.started) {
        setGameMode((prev) => (prev === 'lobby' ? 'online' : prev));
      }
    });

    newSocket.on('game_over', (res) => {
      setResults(res);
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  // ─── Account Actions ───────────────────────────────────────

  const handleLoginSuccess = useCallback((token, user) => {
    const data = { token, user };
    setAuth(data);
    localStorage.setItem('numerus_auth', JSON.stringify(data));
  }, []);

  const handleLogout = useCallback(() => {
    if (auth?.token) {
      fetch(`${API}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.token}` }
      }).catch(() => {});
    }
    localStorage.removeItem('numerus_auth');
    setAuth(null);
  }, [auth]);

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

  const handleStartStory = useCallback(() => {
    setGameMode('story');
  }, []);

  // ─── Online Room Actions ───────────────────────────────────

  const handleCreateRoom = useCallback((callback) => {
    if (!socket) return;
    const name = (localStorage.getItem('numerus_player_name') || '').trim();
    socket.emit('create_room', { name }, (response) => {
      if (response.success) {
        setRoomId(response.roomId);
        setPlayerId(response.playerId);
        setHostId(response.host);
      }
      callback(response);
    });
  }, [socket]);

  const handleJoinRoom = useCallback((id, callback) => {
    if (!socket) return;
    const name = (localStorage.getItem('numerus_player_name') || '').trim();
    socket.emit('join_room', { roomId: id, name }, (response) => {
      if (response.success) {
        setRoomId(response.roomId);
        setPlayerId(response.playerId);
        setHostId(response.host);
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

  // ─── CPU / Story Actions ───────────────────────────────────

  const handleCPUAction = useCallback((action) => {
    if (cpuEngine) cpuEngine.processHumanAction(action);
  }, [cpuEngine]);

  // ─── Story Mode ────────────────────────────────────────────

  const handleStoryFinished = useCallback((engine, chapter) => {
    const resultsData = engine.getResults();
    const rankings = resultsData?.rankings || [];
    const won = rankings[0]?.id === 'human-player';
    const myChips = rankings.find((r) => r.id === 'human-player')?.chips ?? 0;
    const stars = won ? (myChips >= 16 ? 3 : myChips >= 8 ? 2 : 1) : 0;
    const nextUnlocked = won && chapter.id < MAX_CHAPTERS;

    const completed = { ...(storyProgress.completed || {}) };
    if (won) completed[chapter.id] = Math.max(completed[chapter.id] || 0, stars);
    const totalStars = Object.values(completed).reduce((s, n) => s + n, 0);
    const title = STORY_TITLES[Math.min(Object.keys(completed).length, STORY_TITLES.length) - 1] || 'Aprendiz';
    const nextProgress = {
      ...storyProgress,
      completed,
      stars: totalStars,
      title,
      gamesPlayed: (storyProgress.gamesPlayed || 0) + 1,
      wins: (storyProgress.wins || 0) + (won ? 1 : 0)
    };

    setStoryProgress(nextProgress);
    localStorage.setItem(STORY_LOCAL_KEY, JSON.stringify(nextProgress));

    // Sync to server when logged in
    if (auth?.token) {
      fetch(`${API}/api/story/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ chapterId: chapter.id, stars, won })
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.profile) {
            const p = data.profile;
            const serverProgress = {
              title: p.title || title,
              stars: p.stars || 0,
              completed: p.completed || {},
              gamesPlayed: p.gamesPlayed || 0,
              wins: p.wins || 0
            };
            setStoryProgress(serverProgress);
            localStorage.setItem(STORY_LOCAL_KEY, JSON.stringify(serverProgress));
            setAuth((a) => (a ? { ...a, user: { ...a.user, profile: p } } : a));
          }
        })
        .catch(() => {});
    }

    setStoryResult({ won, stars, chapter, myChips, nextUnlocked });
  }, [storyProgress, auth]);

  const handlePlayChapter = useCallback((chapter) => {
    const engine = new CPUGameEngine(2, chapter.difficulty, {
      humanName: auth?.user?.displayName || localStorage.getItem('numerus_player_name') || 'Você',
      cpuNames: [chapter.master],
      cpuChipsBonus: chapter.bonus
    });
    engine.onStateChange = (state) => {
      setGameState(state);
      if (state.finished) {
        handleStoryFinished(engine, chapter);
      }
    };
    engine.start();
    setStoryEngine(engine);
    setStoryChapter(chapter);
    setStoryResult(null);
    setGameState(null);
    setGameMode('story-battle');
  }, [auth, handleStoryFinished]);

  const handleStoryAction = useCallback((action) => {
    if (storyEngine) storyEngine.processHumanAction(action);
  }, [storyEngine]);

  const handleStoryToHub = useCallback(() => {
    setStoryResult(null);
    setStoryEngine(null);
    setStoryChapter(null);
    setGameState(null);
    setGameMode('story');
  }, []);

  const handleBackToMenu = useCallback(() => {
    // Leave the online room so the game isn't left hanging for the others
    if (socket && (gameMode === 'online' || gameMode === 'lobby')) {
      socket.emit('leave_room');
    }
    setGameMode('menu');
    setGameState(null);
    setResults(null);
    setCpuEngine(null);
    setRoomId(null);
    setPlayerId(null);
    setHostId(null);
    setRoomPlayers([]);
    setStoryEngine(null);
    setStoryChapter(null);
    setStoryResult(null);
  }, [socket, gameMode]);

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

  // Story chapter result
  if (storyResult && gameMode === 'story-battle') {
    return (
      <div className="app">
        <div className="header">
          <h1>NUMERUS</h1>
          <div className="subtitle">Master the Equation</div>
        </div>
        <StoryResult
          result={storyResult}
          onReplay={() => storyChapter && handlePlayChapter(storyChapter)}
          onHub={handleStoryToHub}
          onNext={() => {
            if (!storyResult.nextUnlocked || !storyChapter) return;
            const full = CHAPTERS.find((c) => c.id === storyChapter.id + 1);
            if (full) handlePlayChapter(full);
          }}
        />
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
  if (gameState && gameState.started && (gameMode === 'cpu' || gameMode === 'online' || gameMode === 'story-battle')) {
    return (
      <div className="app">
        <GameBoard
          gameState={gameState}
          playerId={gameMode === 'cpu' || gameMode === 'story-battle' ? 'human-player' : playerId}
          onAction={gameMode === 'cpu' ? handleCPUAction : gameMode === 'story-battle' ? handleStoryAction : handleOnlineAction}
          onBackToMenu={handleBackToMenu}
          isCPU={gameMode === 'cpu' || gameMode === 'story-battle'}
        />
      </div>
    );
  }

  // Story hub
  if (gameMode === 'story') {
    return (
      <div className="app">
        <div className="header">
          <h1>NUMERUS</h1>
          <div className="subtitle">Master the Equation</div>
        </div>
        <StoryHub
          progress={storyProgress}
          user={auth?.user || null}
          onBack={handleBackToMenu}
          onPlay={handlePlayChapter}
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
          host={hostId}
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
        onStartStory={handleStartStory}
        user={auth?.user || null}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;
