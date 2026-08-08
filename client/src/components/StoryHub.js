import React from 'react';
import { CHAPTERS, STORY_TITLES, isChapterUnlocked } from '../story/campaign';
import { MapIcon, BackArrowIcon, StarIcon, LockIcon, SwordsIcon, CrownIcon, KeyIcon, GlobeIcon } from '../assets/Icons';
import { sound } from '../utils/sound';

function Stars({ value, max = 3 }) {
  return (
    <div className="stars" style={{ display: 'flex', gap: '0.2rem', justifyContent: 'center' }}>
      {Array.from({ length: max }).map((_, i) => (
        <StarIcon key={i} size={18} filled={i < value} />
      ))}
    </div>
  );
}

function StoryHub({ progress, user, onBack, onPlay, onPlayCoop }) {
  const completedCount = Object.keys(progress.completed || {}).length;
  const title = STORY_TITLES[Math.min(completedCount, STORY_TITLES.length) - 1] || 'Aprendiz';

  return (
    <div className="story-hub animate-in">
      <div className="story-header">
        <button
          className="btn btn-secondary story-back"
          onClick={() => { sound.click(); onBack(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <BackArrowIcon size={16} /> Menu
        </button>

        <div className="story-title-block">
          <div className="story-title">
            <MapIcon size={30} /> A Jornada dos Dez Círculos
          </div>
          <div className="story-title-row">
            <span className="story-title-badge"><CrownIcon size={20} /> {title}</span>
            <span className="story-stars-total">
              {Object.values(progress.completed || {}).reduce((s, n) => s + n, 0)} estrelas
            </span>
          </div>
          <p className="story-sub">
            Derrote cada Mestre para desbloquear o próximo círculo — sozinho ou em grupo de até 4 aliados.
          </p>
        </div>
      </div>

      {!user && (
        <div className="story-guest-banner">
          <KeyIcon size={18} />
          <span>
            Você está jogando sem conta. Crie uma para salvar seu progresso na nuvem — ele
            também é salvo neste navegador.
          </span>
        </div>
      )}

      <div className="story-chapters">
        {CHAPTERS.map((chapter, idx) => {
          const unlocked = isChapterUnlocked(chapter.id, progress.completed || {});
          const stars = (progress.completed || {})[chapter.id] || 0;
          const isNext = unlocked && stars === 0;

          return (
            <div
              key={chapter.id}
              className={`chapter-card ${unlocked ? '' : 'locked'} ${isNext ? 'next' : ''}`}
              role="button"
              tabIndex={unlocked ? 0 : -1}
              onClick={() => { if (unlocked) { sound.cardSelect(); onPlay(chapter); } }}
              onKeyDown={(e) => { if (unlocked && e.key === 'Enter') { sound.cardSelect(); onPlay(chapter); } }}
            >
              <div className="chapter-number">
                {unlocked ? idx + 1 : <LockIcon size={16} />}
              </div>
              <div className="chapter-body">
                <div className="chapter-name">
                  {chapter.name}
                  {isNext && <span className="chapter-now">• agora</span>}
                </div>
                <div className="chapter-master">{chapter.master}</div>
                <div className="chapter-lore">{unlocked ? chapter.lore : '???'}</div>
                <div className="chapter-foot">
                  {stars > 0 && <Stars value={stars} />}
                  {unlocked ? (
                    <div className="chapter-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="chapter-action"
                        onClick={() => { sound.cardSelect(); onPlay(chapter); }}
                        title="Jogar sozinho"
                      >
                        <SwordsIcon size={15} /> Solo
                      </button>
                      <button
                        className="chapter-action coop"
                        onClick={() => { sound.cardSelect(); onPlayCoop(chapter); }}
                        title="Jogar online com até 4 aliados contra o Mestre"
                      >
                        <GlobeIcon size={15} /> Co-op
                      </button>
                    </div>
                  ) : (
                    <span className="chapter-challenge locked-text">Vencer o círculo anterior</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StoryHub;
