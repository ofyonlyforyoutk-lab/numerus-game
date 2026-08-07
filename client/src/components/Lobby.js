import React, { useState } from 'react';
import { SwordsIcon, DoorIcon, BackArrowIcon, GlobeIcon, BookIcon } from '../assets/Icons';
import { sound } from '../utils/sound';

function Lobby({ roomId, playerId, players, onCreateRoom, onJoinRoom, onStartGame, onBackToMenu, error }) {
  const [joinId, setJoinId] = useState('');
  const [loading, setLoading] = useState(false);

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
    return (
      <div className="lobby animate-in">
        <h2>Sala de Espera</h2>

        <div className="room-info">
          <div className="room-id">
            Código da Sala: <strong>{roomId}</strong>
          </div>
          <div className="player-count">
            {players.length} jogador(es) na sala
          </div>
          <div className="players-list">
            {players.map((p, i) => (
              <span key={p} className="player-tag">
                {p === playerId ? `✦ Você` : `Jogador ${i + 1}`}
              </span>
            ))}
          </div>
        </div>

        {players.length < 2 ? (
          <p style={{ textAlign: 'center', color: '#c9a84c', fontStyle: 'italic' }}>
            Aguardando outros jogadores...<br />
            Compartilhe o código: <strong>{roomId}</strong>
          </p>
        ) : (
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
