import React from 'react';
import { ScrollIcon, SwordsIcon, BookIcon, CrownIcon, StaffIcon, SparkleIcon } from '../assets/Icons';

const DIFFICULTIES = [
  {
    id: 'aprendiz',
    name: 'Aprendiz',
    icon: 'scroll',
    stars: 1,
    desc: 'Curioso e imprevisível. Perfeito para iniciantes.',
    color: '#5a9a3a'
  },
  {
    id: 'estrategista',
    name: 'Estrategista',
    icon: 'swords',
    stars: 2,
    desc: 'Calcula seus movimentos com precisão.',
    color: '#4a8ab5'
  },
  {
    id: 'mestre',
    name: 'Mestre dos Números',
    icon: 'book',
    stars: 3,
    desc: 'Domina a arte da equação perfeita.',
    color: '#c9a84c'
  },
  {
    id: 'arquimestre',
    name: 'Arquimestre',
    icon: 'crown',
    stars: 4,
    desc: 'Quase imbatível. Mentes brilhantes tremem.',
    color: '#cd7f32'
  },
  {
    id: 'magno',
    name: 'O Magno',
    icon: 'staff',
    stars: 5,
    desc: 'Uma lenda viva de Numerus. Sorte necessária.',
    color: '#c44536'
  }
];

function DifficultyIcon({ icon, color, size = 40 }) {
  switch (icon) {
    case 'scroll': return <ScrollIcon size={size} />;
    case 'swords': return <SwordsIcon size={size} />;
    case 'book': return <BookIcon size={size} />;
    case 'crown': return <CrownIcon size={size} />;
    case 'staff': return <StaffIcon size={size} />;
    default: return <SwordsIcon size={size} />;
  }
}

function DifficultySelector({ selected, onSelect }) {
  return (
    <div className="difficulty-grid">
      {DIFFICULTIES.map((diff, index) => (
        <div
          key={diff.id}
          className={`difficulty-card ${selected === diff.id ? 'selected' : ''}`}
          onClick={() => onSelect(diff.id)}
          style={{
            animationDelay: `${index * 0.1}s`,
            '--accent-color': diff.color
          }}
        >
          <span className="difficulty-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
            <DifficultyIcon icon={diff.icon} color={diff.color} />
          </span>
          <div className="difficulty-name" style={{ color: diff.color }}>
            {diff.name}
          </div>
          <div className="difficulty-desc">{diff.desc}</div>
          <div className="difficulty-stars" style={{ color: diff.color, display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '0.5rem' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <SparkleIcon key={i} size={12} color={i < diff.stars ? diff.color : 'rgba(138,122,90,0.25)'} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default DifficultySelector;
