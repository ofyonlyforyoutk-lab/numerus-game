import React, { useState, useEffect } from 'react';
import DifficultySelector from './DifficultySelector';
import Codex from './Codex';
import AuthModal from './AuthModal';
import { SwordsIcon, GlobeIcon, DoorIcon, BackArrowIcon, BookIcon, MapIcon, KeyIcon, LogoutIcon, CrownIcon } from '../assets/Icons';
import { sound } from '../utils/sound';

function AnimatedMenu({ onStartGame, onStartOnline, onJoinRoom, onStartStory, user, onLoginSuccess, onLogout }) {
  const [view, setView] = useState('main'); // main, difficulty, online, join
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [particles, setParticles] = useState([]);
  const [soundOn, setSoundOn] = useState(true);
  const [showCodex, setShowCodex] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  // Start ambient menu music on first interaction
  useEffect(() => {
    const startAmbient = () => {
      sound.resume();
      sound.startMusic();
      window.removeEventListener('click', startAmbient);
    };
    window.addEventListener('click', startAmbient);
    return () => {
      window.removeEventListener('click', startAmbient);
      sound.stopMusic();
    };
  }, []);

  const handleNavigate = (fn) => {
    sound.resume();
    sound.click();
    fn();
  };

  const toggleSound = () => {
    sound.resume();
    const on = sound.toggle();
    setSoundOn(on);
  };

  const handleStartCPU = () => {
    if (selectedDifficulty) {
      sound.resume();
      sound.destiny();
      onStartGame(selectedDifficulty);
    }
  };

  const handleJoin = () => {
    if (joinCode.trim()) {
      sound.resume();
      sound.click();
      onJoinRoom(joinCode.trim());
    }
  };

  const Particles = () => (
    <div className="particles">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        />
      ))}
    </div>
  );

  const AccountChip = () => (
    <div
      style={{
        position: 'fixed',
        top: '1.2rem',
        left: '1.2rem',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem'
      }}
    >
      {user ? (
        <>
          <div
            style={{
              background: 'rgba(20, 12, 8, 0.85)',
              border: '1px solid rgba(201, 168, 76, 0.4)',
              borderRadius: '8px',
              padding: '0.4rem 0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--gold-light)'
            }}
            title={`${user.username} — ${user.profile?.title || 'Aprendiz'}`}
          >
            <CrownIcon size={18} />
            <span style={{ fontFamily: 'Cinzel', fontSize: '0.9rem' }}>{user.displayName}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              {user.profile?.title || 'Aprendiz'}
            </span>
          </div>
          <button
            onClick={() => { sound.click(); onLogout(); }}
            title="Sair da conta"
            style={{
              background: 'rgba(20, 12, 8, 0.85)',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              borderRadius: '50%',
              width: 40,
              height: 40,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LogoutIcon size={18} />
          </button>
        </>
      ) : (
        <button
          onClick={() => { sound.click(); setShowAuth(true); }}
          title="Entrar ou criar conta"
          style={{
            background: 'rgba(20, 12, 8, 0.85)',
            border: '1px solid rgba(201, 168, 76, 0.35)',
            borderRadius: '8px',
            padding: '0.4rem 0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--gold-light)',
            fontFamily: 'Cinzel'
          }}
        >
          <KeyIcon size={18} /> Entrar
        </button>
      )}
    </div>
  );

  const SoundButton = () => (
    <button
      onClick={toggleSound}
      style={{
        position: 'fixed',
        top: '1.2rem',
        right: '1.2rem',
        zIndex: 100,
        background: 'rgba(20, 12, 8, 0.8)',
        border: '1px solid rgba(201, 168, 76, 0.3)',
        borderRadius: '50%',
        width: 44,
        height: 44,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        transition: 'all 0.3s'
      }}
      title={soundOn ? 'Desativar som' : 'Ativar som'}
    >
      {soundOn ? (
        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 10 V14 H7 L11 18 V6 L7 10 Z" fill="#c9a84c" />
          <path d="M14 8 A5 5 0 0 1 14 16" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M16.5 5.5 A9 9 0 0 1 16.5 18.5" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        </svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 10 V14 H7 L11 18 V6 L7 10 Z" fill="#8a7a5a" />
          <line x1="15" y1="9" x2="20" y2="15" stroke="#c44536" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="9" x2="15" y2="15" stroke="#c44536" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );

  if (view === 'main') {
    return (
      <div className="main-menu" style={{ position: 'relative' }}>
        <Particles />
        <SoundButton />
        <AccountChip />

        {/* Manual cover as backdrop */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/assets/backcover.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.08,
            zIndex: -1
          }}
        />

        <div className="menu-emblem">N</div>

        <div className="menu-options">
          <button
            className="menu-btn primary btn-glow"
            onClick={() => handleNavigate(() => setView('difficulty'))}
            onMouseEnter={() => sound.hover()}
          >
            <span className="btn-icon" style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '0.6rem' }}>
              <SwordsIcon size={24} />
            </span>
            Jogar vs CPU
            <span className="btn-desc">Duelo contra a inteligência artificial</span>
          </button>

          <button
            className="menu-btn"
            onClick={() => handleNavigate(() => onStartStory())}
            onMouseEnter={() => sound.hover()}
          >
            <span className="btn-icon" style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '0.6rem' }}>
              <MapIcon size={24} />
            </span>
            Modo História
            <span className="btn-desc">A Jornada dos Dez Círculos — campanha com saves</span>
          </button>

          <button
            className="menu-btn"
            onClick={() => handleNavigate(() => onStartOnline())}
            onMouseEnter={() => sound.hover()}
          >
            <span className="btn-icon" style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '0.6rem' }}>
              <GlobeIcon size={24} />
            </span>
            Multiplayer Online
            <span className="btn-desc">Jogue com outros mestres do mundo</span>
          </button>

          <div className="menu-divider" />

          <button
            className="menu-btn"
            onClick={() => handleNavigate(() => setView('join'))}
            onMouseEnter={() => sound.hover()}
          >
            <span className="btn-icon" style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '0.6rem' }}>
              <DoorIcon size={24} />
            </span>
            Entrar em Sala
            <span className="btn-desc">Use um código para entrar</span>
          </button>

          <button
            className="menu-btn"
            onClick={() => handleNavigate(() => setShowCodex(true))}
            onMouseEnter={() => sound.hover()}
          >
            <span className="btn-icon" style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '0.6rem' }}>
              <BookIcon size={24} />
            </span>
            O Códice
            <span className="btn-desc">Folheie o manual original do jogo</span>
          </button>
        </div>

        <p style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontStyle: 'italic',
          marginTop: '2rem',
          fontSize: '0.95rem',
          maxWidth: '400px'
        }}>
          "Não são os maiores números que fazem os maiores Mestres. São as escolhas."
        </p>

        {showCodex && <Codex onClose={() => setShowCodex(false)} />}
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onAuthed={(token, authedUser) => { setShowAuth(false); onLoginSuccess(token, authedUser); }}
          />
        )}
      </div>
    );
  }

  if (view === 'difficulty') {
    return (
      <div className="main-menu" style={{ position: 'relative' }}>
        <Particles />
        <SoundButton />

        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/assets/circles.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.06,
            zIndex: -1
          }}
        />

        <h2 style={{
          fontFamily: 'Cinzel',
          fontSize: '1.8rem',
          color: 'var(--gold)',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
          <SwordsIcon size={28} />
          Escolha seu Oponente
        </h2>
        <p style={{
          color: 'var(--text-muted)',
          fontStyle: 'italic',
          marginBottom: '2rem'
        }}>
          Cada Mestre possui uma força diferente...
        </p>

        <DifficultySelector
          selected={selectedDifficulty}
          onSelect={(d) => { sound.cardSelect(); setSelectedDifficulty(d); }}
        />

        <div className="menu-options" style={{ marginTop: '2rem' }}>
          <button
            className="menu-btn primary btn-glow"
            onClick={handleStartCPU}
            disabled={!selectedDifficulty}
            onMouseEnter={() => sound.hover()}
          >
            <span className="btn-icon" style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '0.6rem' }}>
              <SwordsIcon size={24} />
            </span>
            Iniciar Duelo
          </button>
          <button
            className="menu-btn"
            onClick={() => handleNavigate(() => setView('main'))}
            onMouseEnter={() => sound.hover()}
          >
            <span className="btn-icon" style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '0.6rem' }}>
              <BackArrowIcon size={20} />
            </span>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (view === 'join') {
    return (
      <div className="main-menu" style={{ position: 'relative' }}>
        <Particles />
        <SoundButton />

        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/assets/instruments.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.06,
            zIndex: -1
          }}
        />

        <div className="lobby" style={{ width: '100%', maxWidth: '500px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center' }}>
            <BookIcon size={28} />
            Entrar em Sala
          </h2>

          <div className="lobby-input">
            <label>Código da Sala</label>
            <input
              type="text"
              placeholder="Digite o código..."
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
          </div>

          <div className="lobby-buttons">
            <button
              className="menu-btn primary"
              onClick={handleJoin}
              disabled={!joinCode.trim()}
              onMouseEnter={() => sound.hover()}
            >
              <span className="btn-icon" style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '0.6rem' }}>
                <DoorIcon size={24} />
              </span>
              Entrar
            </button>
            <button
              className="menu-btn"
              onClick={() => handleNavigate(() => setView('main'))}
              onMouseEnter={() => sound.hover()}
            >
              <span className="btn-icon" style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '0.6rem' }}>
                <BackArrowIcon size={20} />
              </span>
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default AnimatedMenu;
