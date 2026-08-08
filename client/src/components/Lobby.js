import React, { useState, useEffect } from 'react';
import { SwordsIcon, DoorIcon, BackArrowIcon, GlobeIcon, BookIcon, ScrollIcon } from '../assets/Icons';
import { sound } from '../utils/sound';

function Lobby({ roomId, playerId, host, players, mode, chapter, onCreateRoom, onJoinRoom, onStartGame, onBackToMenu, error }) {
  const [joinId, setJoinId] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(() => localStorage.getItem('numerus_player_name') || '');

  // Persist the chosen name so every room/game uses it
  useEffect(() => {
    localStorage.setItem('numerus_player_name', name);
  }, [name]);

  const handleCreate = () => {
    setLoading(true);
    sound.click();
    onCreateRoom((response) => {
      setLoading(false);
      if (!response.success) {
        sound.error();
        alert(response.error || 'Erro ao criar sala');
      }
    });
  };

  const handleJoin = () => {
    if (!joinId.trim()) return;
    setLoading(true);
    sound.click();
    onJoinRoom(joinId.trim(), (response) => {
      setLoading(false);
      if (!response.success) {
        sound.error();
        alert(response.error || 'Erro ao entrar na sala');
      }
    });
  };

  const handleStart = () => {
    setLoading(true);
    sound.destiny();
    onStartGame((response) => {
      setLoading(false);
      if (!response.success) {
        sound.error();
        alert(response.error || 'Erro ao iniciar jogo');
      }
    });
  };

  if (roomId) {
    const isStory = mode === 'story';
    return (
      <div className="lobby animate-in">
        <h2>Sala de Espera</h2>

        {isStory && chapter && (
          <div className="coop-banner">
            <div className="coop-banner-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SwordsIcon size={18} /> Capítulo {chapter.id} — {chapter.name}
            </div>
            <div className="coop-banner-master">Mestre: {chapter.master}</div>
            <div className="coop-banner-sub">
              Até 4 aliados contra o chefe. Todos do grupo que estiverem com conta recebem o progresso.
            </div>
          </div>
        )}

        <div className="room-info">
          <div className="room-id">
            Código da Sala: <strong>{roomId}</strong>
          </div>
          <div className="player-count">
            {isStory ? `${players.length}/4 aliado(s)` : `${players.length} jogador(es) na sala`}
          </div>
          <div className="players-list">
            {players.map((p) => (
              <span key={p.id} className={`player-tag ${p.id === playerId ? 'me' : ''}`}>
                {p.id === playerId ? '✦ Você' : p.id === host ? '✦ Anfitrião' : (p.name || 'Jogador')}
              </span>
            ))}
          </div>
          {name && (
            <div className="room-your-name">
              Você joga como: <strong>{name}</strong>
            </div>
          )}
        </div>

        {isStory ? (
          playerId === host ? (
            <div className="lobby-buttons">
              <button
                className="btn btn-primary btn-glow"
                onClick={handleStart}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {loading ? 'Iniciando...' : (<><SwordsIcon size={20} /> Iniciar Batalha{players.length < 2 ? ' (sozinho)' : ''}</>)}
              </button>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#c9a84c', fontStyle: 'italic' }}>
              Aguardando o anfitrião iniciar a batalha...<br />
              Compartilhe o código: <strong>{roomId}</strong>
            </p>
          )
        ) : players.length < 2 ? (
          <p style={{ textAlign: 'center', color: '#c9a84c', fontStyle: 'italic' }}>
            Aguardando outros jogadores...<br />
            Compartilhe o código: <strong>{roomId}</strong>
          </p>
        ) : playerId === host ? (
          <div className="lobby-buttons">
            <button
              className="btn btn-primary btn-glow"
              onClick={handleStart}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {loading ? 'Iniciando...' : (<><SwordsIcon size={20} /> Iniciar Duelo</>)}
            </button>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#c9a84c', fontStyle: 'italic' }}>
            Aguardando o anfitrião iniciar o duelo...
          </p>
        )}

        <div className="lobby-buttons" style={{ marginTop: '1.5rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => { sound.click(); onBackToMenu(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <BackArrowIcon size={18} /> Voltar ao Menu
          </button>
        </div>

        {error && (
          <p style={{ textAlign: 'center', color: '#c44536', marginTop: '1rem' }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="lobby animate-in">
      <h2>Entrar na Ordem</h2>

      <div className="lobby-input">
        <label>Seu Nome <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(aparece para os outros jogadores)</span></label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ScrollIcon size={18} />
          <input
            type="text"
            placeholder="Digite seu nome..."
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 20))}
            maxLength={20}
          />
        </div>
      </div>

      <div className="lobby-input">
        <label>Criar Nova Sala</label>
        <button
          className="btn btn-primary"
          onClick={handleCreate}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {loading ? 'Criando...' : (<><GlobeIcon size={22} /> Criar Sala</>)}
        </button>
      </div>

      <div style={{ textAlign: 'center', color: '#c9a84c', margin: '1.5rem 0' }}>
        ─── ou ───
      </div>

      <div className="lobby-input">
        <label>Entrar em Sala Existente</label>
        <input
          type="text"
          placeholder="Código da sala..."
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
        />
        <button
          className="btn btn-secondary"
          onClick={handleJoin}
          disabled={loading || !joinId.trim()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {loading ? 'Entrando...' : (<><DoorIcon size={22} /> Entrar</>)}
        </button>
      </div>

      <div className="lobby-buttons" style={{ marginTop: '1.5rem' }}>
        <button
          className="btn btn-secondary"
          onClick={() => { sound.click(); onBackToMenu(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <BackArrowIcon size={18} /> Voltar ao Menu
        </button>
      </div>

      {error && (
        <p style={{ textAlign: 'center', color: '#c44536', marginTop: '1rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default Lobby;
