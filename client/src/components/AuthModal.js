import React, { useState } from 'react';
import { KeyIcon, CloseIcon, LogoutIcon } from '../assets/Icons';
import { sound } from '../utils/sound';

const API = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : window.location.origin;

function AuthModal({ onClose, onAuthed }) {
  const [mode, setMode] = useState('login'); // login | register
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (username.trim().length < 3) return setError('O usuário precisa de pelo menos 3 caracteres');
      if (password.length < 4) return setError('A senha precisa de pelo menos 4 caracteres');
      if (password !== confirm) return setError('As senhas não conferem');
    } else {
      if (!username.trim() || !password) return setError('Preencha usuário e senha');
    }

    setLoading(true);
    sound.click();
    try {
      const res = await fetch(`${API}/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          displayName: displayName.trim() || undefined
        })
      });
      const data = await res.json();
      setLoading(false);
      if (!data.success) {
        sound.error();
        return setError(data.error || 'Erro desconhecido');
      }
      sound.victory();
      onAuthed(data.token, data.user);
    } catch (err) {
      setLoading(false);
      sound.error();
      setError('Não foi possível conectar ao servidor');
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} title="Fechar">
          <CloseIcon size={16} />
        </button>

        <div className="auth-heading">
          <KeyIcon size={26} />
          <h3>Ordem dos Numerus</h3>
          <p className="auth-sub">Sua identidade entre os Mestres</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { sound.click(); setMode('login'); setError(null); }}
          >
            Entrar
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { sound.click(); setMode('register'); setError(null); }}
          >
            Criar Conta
          </button>
        </div>

        <form onSubmit={submit} className="auth-form">
          <label className="auth-label">
            Nome de Usuário
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ex: mestre_da_soma"
              autoComplete="username"
              maxLength={24}
            />
          </label>

          {mode === 'register' && (
            <label className="auth-label">
              Nome de Exibição <span className="auth-optional">(opcional)</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Como quer ser chamado"
                maxLength={20}
              />
            </label>
          )}

          <label className="auth-label">
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {mode === 'register' && (
            <label className="auth-label">
              Confirmar Senha
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </label>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-glow auth-submit"
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
          >
            <KeyIcon size={18} />
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar na Ordem' : 'Forjar seu Selo'}
          </button>
        </form>

        {mode === 'login' && (
          <p className="auth-hint">
            Crie sua conta para salvar o progresso do Modo História em qualquer dispositivo.
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
