import React, { useEffect } from 'react';
import { TrophyIcon, CoinIcon, BackArrowIcon } from '../assets/Icons';
import { CoinStackIcon } from '../assets/Icons';
import { sound } from '../utils/sound';

function Results({ results, onPlayAgain }) {
  useEffect(() => {
    sound.resume();
    const winnerId = results?.rankings?.[0]?.id;
    const myWin = results?.rankings?.find(r => r.id === 'human-player');
    if (winnerId === 'human-player') {
      sound.victory();
    } else if (myWin) {
      sound.defeat();
    } else {
      sound.reveal();
    }
  }, [results]);

  if (!results) return null;

  const winnerId = results.rankings?.[0]?.id;
  const winnerName = results.rankings?.[0]?.name || 'Desconhecido';
  const winnerChips = results.rankings?.[0]?.chips || 0;

  return (
    <div className="results-screen animate-in">
      <h2>⚖️ O Grande Julgamento</h2>
      
      <div className="winner-display">
        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
          <TrophyIcon size={72} />
        </div>
        <div className="winner-name">Arquimestre: {winnerName}</div>
        <div className="winner-chips" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <CoinIcon size={18} /> {winnerChips} Fichas de Prestígio
        </div>
      </div>

      {/* Simplicity Winner */}
      {results.simplicityWinner && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(74, 124, 40, 0.2)', borderRadius: '4px', border: '1px solid #4a7c28' }}>
          <div style={{ fontFamily: 'Cinzel', color: '#4a7c28', fontSize: '0.9rem' }}>
            🏅 Vencedor da Simplicidade (≈1)
          </div>
          <div style={{ color: '#e8d48b', marginTop: '0.3rem' }}>
            {results.rankings?.find(r => r.id === results.simplicityWinner)?.name} — 
            Distância: {results.simplicityDistance?.toFixed(2)}
          </div>
        </div>
      )}

      {/* Greatness Winner */}
      {results.greatnessWinner && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(201, 168, 76, 0.2)', borderRadius: '4px', border: '1px solid #c9a84c' }}>
          <div style={{ fontFamily: 'Cinzel', color: '#c9a84c', fontSize: '0.9rem' }}>
            🏅 Vencedor da Grandeza (≈20)
          </div>
          <div style={{ color: '#e8d48b', marginTop: '0.3rem' }}>
            {results.rankings?.find(r => r.id === results.greatnessWinner)?.name} — 
            Distância: {results.greatnessDistance?.toFixed(2)}
          </div>
        </div>
      )}

      {/* Rankings */}
      <div className="rankings">
        {results.rankings?.map((player) => (
          <div key={player.id} className="ranking-item">
            <span className="ranking-position">
              {player.position === 1 ? '🥇' : player.position === 2 ? '🥈' : player.position === 3 ? '🥉' : `${player.position}°`}
            </span>
            <span className="ranking-name">{player.name}</span>
            <span style={{ 
              color: player.destiny === 'simplicidade' ? '#4a7c28' : 
                     player.destiny === 'grandeza' ? '#c9a84c' : '#c44536',
              fontFamily: 'Cinzel',
              fontSize: '0.8rem',
              marginRight: '1rem'
            }}>
              {player.destiny === 'simplicidade' ? 'I' : 
               player.destiny === 'grandeza' ? 'XX' : 'I+XX'}
            </span>
            <span className="ranking-chips">
              {player.equationResult !== null && player.equationResult !== undefined ? 
                `Eq: ${player.equationResult}` : ''}
            </span>
            <span className="ranking-chips" style={{ marginLeft: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CoinStackIcon size={18} /> {player.chips}
            </span>
          </div>
        ))}
      </div>

      <div className="lobby-buttons">
        <button className="btn btn-primary btn-glow" onClick={() => { sound.click(); onPlayAgain(); }}>
          <span className="btn-icon" style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '0.5rem' }}>
            <BackArrowIcon size={18} />
          </span>
          Novo Duelo
        </button>
      </div>

      <div style={{ 
        marginTop: '2rem', 
        textAlign: 'center',
        fontFamily: 'Cinzel',
        color: '#8b6914',
        fontStyle: 'italic',
        fontSize: '0.9rem'
      }}>
        "Não são os maiores números que fazem os maiores Mestres. São as escolhas."
        <br />
        — Epílogo do Códice de Numerus
      </div>
    </div>
  );
}

export default Results;
