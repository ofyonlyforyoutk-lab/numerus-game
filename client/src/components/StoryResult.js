import React from 'react';
import { TrophyIcon, BackArrowIcon, SwordsIcon, StarIcon, MapIcon, CoinStackIcon } from '../assets/Icons';
import { sound } from '../utils/sound';

function Stars({ value, max = 3 }) {
  return (
    <div className="stars stars-big" style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
      {Array.from({ length: max }).map((_, i) => (
        <StarIcon key={i} size={30} filled={i < value} />
      ))}
    </div>
  );
}

function StoryResult({ result, coop, isHost, onReplay, onHub, onNext }) {
  const { won, stars, chapter, myChips, nextUnlocked } = result;

  return (
    <div className={`story-result animate-in ${won ? 'victory' : 'defeat'}`}>
      <div className="story-result-inner">
        <div className="story-result-icon">
          <TrophyIcon size={72} />
        </div>

        <h2 className="story-result-title">
          {coop ? (won ? 'O Grupo Conquistou o Círculo!' : 'O Grupo Sucumbiu...') : (won ? 'Círculo Conquistado!' : 'O Círculo Resistiu')}
        </h2>

        {chapter && (
          <>
            <p className="story-result-chapter">{chapter.name}</p>
            <p className="story-result-master">vs {chapter.master}</p>
          </>
        )}

        {won ? (
          <>
            <Stars value={stars} />
            <p className="story-result-stars-text">
              {stars === 3 ? 'Desempenho lendário!' : stars === 2 ? 'Grande vitória!' : 'Vitória! Termine com mais fichas para ganhar mais estrelas.'}
            </p>
            {coop && (
              <p className="story-result-stars-text" style={{ color: 'var(--gold-light)' }}>
                O progresso foi salvo para todos os aliados com conta.
              </p>
            )}
            <div className="story-result-chips">
              <CoinStackIcon size={22} /> {myChips} fichas restantes
            </div>
          </>
        ) : (
          <p className="story-result-stars-text">
            {coop
              ? 'O Mestre foi implacável com o grupo. Reúnam-se e tentem novamente — juntos são mais fortes.'
              : 'O Mestre foi implacável desta vez. Estude sua equação, ajuste sua aposta e tente novamente.'}
          </p>
        )}

        {chapter?.quote && <blockquote className="story-quote">"{chapter.quote}"</blockquote>}

        <div className="story-result-buttons">
          {coop && !isHost && (
            <p className="story-result-stars-text" style={{ width: '100%' }}>
              O anfitrião pode abrir uma nova batalha.
            </p>
          )}
          {won && nextUnlocked && onNext && (
            <button
              className="btn btn-primary btn-glow"
              onClick={() => { sound.destiny(); onNext(); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <MapIcon size={18} /> Próximo Círculo
            </button>
          )}
          {onReplay && (
            <button
              className="btn btn-secondary"
              onClick={() => { sound.click(); onReplay(); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <SwordsIcon size={18} /> {coop ? 'Nova Batalha' : 'Revanche'}
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => { sound.click(); onHub(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <BackArrowIcon size={18} /> Mapa dos Círculos
          </button>
        </div>
      </div>
    </div>
  );
}

export default StoryResult;
