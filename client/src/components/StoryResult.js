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

function StoryResult({ result, onReplay, onHub, onNext }) {
  const { won, stars, chapter, myChips, nextUnlocked } = result;

  return (
    <div className={`story-result animate-in ${won ? 'victory' : 'defeat'}`}>
      <div className="story-result-inner">
        <div className="story-result-icon">
          <TrophyIcon size={72} />
        </div>

        <h2 className="story-result-title">
          {won ? 'Círculo Conquistado!' : 'O Círculo Resistiu'}
        </h2>

        <p className="story-result-chapter">{chapter.name}</p>
        <p className="story-result-master">vs {chapter.master}</p>

        {won ? (
          <>
            <Stars value={stars} />
            <p className="story-result-stars-text">
              {stars === 3 ? 'Desempenho lendário!' : stars === 2 ? 'Grande vitória!' : 'Vitória! Termine com mais fichas para ganhar mais estrelas.'}
            </p>
            <div className="story-result-chips">
              <CoinStackIcon size={22} /> {myChips} fichas restantes
            </div>
          </>
        ) : (
          <p className="story-result-stars-text">
            O Mestre foi implacável desta vez. Estude sua equação, ajuste sua aposta e tente novamente.
          </p>
        )}

        <blockquote className="story-quote">"{chapter.quote}"</blockquote>

        <div className="story-result-buttons">
          {won && nextUnlocked && (
            <button
              className="btn btn-primary btn-glow"
              onClick={() => { sound.destiny(); onNext(); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <MapIcon size={18} /> Próximo Círculo
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => { sound.click(); onReplay(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <SwordsIcon size={18} /> Revanche
          </button>
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
