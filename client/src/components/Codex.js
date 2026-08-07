import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';
import { BackArrowIcon, LeftArrowIcon, RightArrowIcon, BookIcon } from '../assets/Icons';

const PAGES = [
  { file: '/assets/pages/page_1.jpg', title: 'Capa', numeral: 'I' },
  { file: '/assets/pages/page_2.jpg', title: 'Domine a Equação', numeral: 'I' },
  { file: '/assets/pages/page_3.jpg', title: 'Aos Novos Mestres', numeral: 'I' },
  { file: '/assets/pages/page_4.jpg', title: 'Página de Separação', numeral: 'II' },
  { file: '/assets/pages/page_5.jpg', title: 'A Ordem dos Calculistas', numeral: 'II' },
  { file: '/assets/pages/page_6.jpg', title: 'As Quatro Escolas', numeral: 'III' },
  { file: '/assets/pages/page_7.jpg', title: 'Os Instrumentos do Mestre', numeral: 'IV' },
  { file: '/assets/pages/page_8.jpg', title: 'Os Dez Círculos de Numerus', numeral: 'V' },
  { file: '/assets/pages/page_9.jpg', title: 'A Construção da Equação', numeral: 'VI' },
  { file: '/assets/pages/page_10.jpg', title: 'Os Destinos da Ordem', numeral: 'VII' },
  { file: '/assets/pages/page_11.jpg', title: 'O Encerramento do Duelo', numeral: 'VIII' }
];

function Codex({ onClose }) {
  const [page, setPage] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [direction, setDirection] = useState('next');

  const goTo = (target) => {
    if (target < 0 || target >= PAGES.length || flipping) return;
    setDirection(target > page ? 'next' : 'prev');
    sound.pageTurn();
    setFlipping(true);
    setTimeout(() => {
      setPage(target);
      setFlipping(false);
    }, 420);
  };

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goTo(page + 1);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(page - 1);
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [page, flipping]);

  const current = PAGES[page];
  const prev = PAGES[page - 1];
  const next = PAGES[page + 1];

  return (
    <div className="codex-overlay">
      <div className="codex-header">
        <div className="codex-title">
          <BookIcon size={22} /> O Códice de Numerus
        </div>
        <div className="codex-subtitle">
          Folheie as páginas do manual original do jogo
        </div>
        <button className="btn btn-secondary codex-close" onClick={() => { sound.click(); onClose(); }}>
          <BackArrowIcon size={14} /> Fechar
        </button>
      </div>

      <div className="codex-stage">
        {/* Left page (previous) */}
        <div className={`codex-page codex-page-left ${page === 0 ? 'codex-page-hidden' : ''}`}>
          {prev && (
            <>
              <img src={prev.file} alt={prev.title} draggable={false} />
              <div className="codex-page-caption">{prev.title}</div>
            </>
          )}
        </div>

        {/* Book spine */}
        <div className="codex-spine">
          <div className="codex-spine-label">NUMERUS</div>
        </div>

        {/* Right page (current) */}
        <div className="codex-page codex-page-right">
          <img src={current.file} alt={current.title} draggable={false} />
          <div className="codex-page-caption">
            <span className="codex-numeral">Círculo {current.numeral}</span>
            <span className="codex-page-name">{current.title}</span>
          </div>
        </div>

        {/* Flip overlay animation */}
        {flipping && (
          <div className={`codex-flip ${direction === 'prev' ? 'codex-flip-back' : ''}`}>
            <img src={(direction === 'next' ? next : prev)?.file} alt="" draggable={false} />
          </div>
        )}
      </div>

      <div className="codex-nav">
        <button
          className="btn btn-secondary codex-nav-btn"
          onClick={() => goTo(page - 1)}
          disabled={page === 0 || flipping}
        >
          <LeftArrowIcon size={16} /> Anterior
        </button>
        <div className="codex-counter">
          Página {page + 1} de {PAGES.length}
        </div>
        <button
          className="btn btn-primary codex-nav-btn"
          onClick={() => goTo(page + 1)}
          disabled={page === PAGES.length - 1 || flipping}
        >
          Próxima <RightArrowIcon size={16} />
        </button>
      </div>

      <div className="codex-dots">
        {PAGES.map((p, i) => (
          <button
            key={i}
            className={`codex-dot ${i === page ? 'active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={p.title}
          />
        ))}
      </div>
    </div>
  );
}

export default Codex;
