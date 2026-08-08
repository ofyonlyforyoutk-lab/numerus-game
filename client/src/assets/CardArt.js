import React, { useId } from 'react';
import GENERATED from './generated';

/**
 * SVG Card Art - Medieval themed cards matching the Numerus PDF aesthetic.
 * Renders beautiful vector cards for numbers, operations, and specials.
 * Quando uma arte gerada (Pollinations) existir no manifesto, ela substitui o SVG.
 */

// Stable gradient ID helper (deterministic per instance via useId)
function useGradId(prefix) {
  const id = useId().replace(/:/g, 'g');
  return `${prefix}-${id}`;
}

// School color schemes
const SCHOOL_COLORS = {
  ouro: {
    grad: ['#a07820', '#e8c86a', '#7a5a10'],
    border: '#e8d48b',
    text: '#1a0f0a',
    symbol: '◆'
  },
  prata: {
    grad: ['#7a7a7a', '#e0e0e0', '#6a6a6a'],
    border: '#f0f0f0',
    text: '#1a0f0a',
    symbol: '●'
  },
  bronze: {
    grad: ['#a05818', '#daa04a', '#8b4a10'],
    border: '#e0b050',
    text: '#1a0f0a',
    symbol: '▲'
  },
  terra: {
    grad: ['#1a4a1a', '#3a7a2a', '#143a14'],
    border: '#5a9a3a',
    text: '#d4e8c4',
    symbol: '■'
  }
};

// Roman numerals for numbers
function toRoman(value) {
  const romans = {
    0: 'N', 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
    6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X'
  };
  return romans[value] || String(value);
}

/**
 * Number card - school-themed with number and school symbol
 */
export function NumberCardArt({ value, school, width = 80, height = 112 }) {
  const colors = SCHOOL_COLORS[school] || SCHOOL_COLORS.ouro;
  const [c1, c2, c3] = colors.grad;
  const id = useGradId(`num-${school}-${value}`);

  return (
    <svg width={width} height={height} viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="50%" stopColor={c2} />
          <stop offset="100%" stopColor={c3} />
        </linearGradient>
        <radialGradient id={`${id}-inner`} cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </radialGradient>
      </defs>

      {/* Card body */}
      <rect x="2" y="2" width="96" height="136" rx="8" fill={`url(#${id})`} />
      <rect x="2" y="2" width="96" height="136" rx="8" fill={`url(#${id}-inner)`} />
      
      {/* Ornate border */}
      <rect x="5" y="5" width="90" height="130" rx="6" fill="none"
        stroke={colors.border} strokeWidth="1.5" opacity="0.7" />
      <rect x="8" y="8" width="84" height="124" rx="4" fill="none"
        stroke={colors.border} strokeWidth="0.5" opacity="0.4" />

      {/* Corner ornaments */}
      <circle cx="12" cy="12" r="3" fill={colors.border} opacity="0.6" />
      <circle cx="88" cy="12" r="3" fill={colors.border} opacity="0.6" />
      <circle cx="12" cy="128" r="3" fill={colors.border} opacity="0.6" />
      <circle cx="88" cy="128" r="3" fill={colors.border} opacity="0.6" />

      {/* Top-left small number */}
      <text x="16" y="26" fontFamily="Cinzel, serif" fontSize="16" fontWeight="900"
        fill={colors.text} opacity="0.85">{value}</text>

      {/* School symbol */}
      <text x="16" y="40" fontFamily="serif" fontSize="10" fill={colors.text} opacity="0.6">
        {colors.symbol}
      </text>

      {/* Center number */}
      <text x="50" y="80" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="42"
        fontWeight="900" fill={colors.text}
        style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))' }}>
        {value}
      </text>

      {/* School name */}
      <text x="50" y="98" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="9"
        letterSpacing="2" fill={colors.text} opacity="0.85" fontWeight="600">
        {school.toUpperCase()}
      </text>

      {/* Bottom-right small roman */}
      <text x="84" y="126" textAnchor="end" fontFamily="Cinzel, serif" fontSize="12"
        fontWeight="700" fill={colors.text} opacity="0.6">
        {toRoman(value)}
      </text>
    </svg>
  );
}

/**
 * Operation card (+ - ÷ ×)
 */
export function OperationCardArt({ operation, width = 80, height = 112 }) {
  const symbols = { add: '+', subtract: '−', multiply: '×', divide: '÷' };
  const names = { add: 'SOMA', subtract: 'SUB.', multiply: 'MULT.', divide: 'DIV.' };
  const symbol = symbols[operation] || '+';
  const name = names[operation] || 'OP';
  const id = useGradId(`op-${operation}`);

  return (
    <svg width={width} height={height} viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a3a5c" />
          <stop offset="50%" stopColor="#2d5a8a" />
          <stop offset="100%" stopColor="#16283f" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="96" height="136" rx="8" fill={`url(#${id})`} />
      <rect x="5" y="5" width="90" height="130" rx="6" fill="none"
        stroke="#4a8ab5" strokeWidth="1.5" opacity="0.7" />

      {/* Corner stars */}
      <text x="14" y="24" fontSize="12" fill="#4a8ab5" opacity="0.5">✦</text>
      <text x="86" y="24" textAnchor="end" fontSize="12" fill="#4a8ab5" opacity="0.5">✦</text>

      {/* Center symbol */}
      <text x="50" y="82" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="46"
        fontWeight="900" fill="#d4e8f8"
        style={{ filter: 'drop-shadow(0 0 8px rgba(74,138,181,0.6))' }}>
        {symbol}
      </text>

      {/* Name */}
      <text x="50" y="104" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="10"
        letterSpacing="2" fill="#8ab8d8" fontWeight="600">
        {name}
      </text>

      <text x="50" y="126" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="8"
        fill="#4a8ab5" opacity="0.7">
        N U M E R U S
      </text>
    </svg>
  );
}

/**
 * Special card (√ or ×)
 */
export function SpecialCardArt({ operation, width = 80, height = 112 }) {
  const isSqrt = operation === 'sqrt';
  const id = useGradId(`sp-${operation}`);
  const generated = GENERATED[isSqrt ? 'sqrt' : 'multiply'];
  if (generated) {
    return (
      <div style={{ width, height, borderRadius: 8, overflow: 'hidden' }}>
        <img
          src={generated}
          alt={isSqrt ? 'Raiz Quadrada (√)' : 'Multiplicação (×)'}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    );
  }
  const symbol = isSqrt ? '√' : '×';
  const name = isSqrt ? 'RAIZ' : 'MULT.';
  const c1 = isSqrt ? '#1a4a1a' : '#3a1a4a';
  const c2 = isSqrt ? '#2d7a2d' : '#5a2a7a';
  const c3 = isSqrt ? '#143a14' : '#2a143a';
  const glow = isSqrt ? 'rgba(74,170,74,0.6)' : 'rgba(154,90,192,0.6)';
  const accent = isSqrt ? '#4aaa4a' : '#9a5ac0';
  const text = isSqrt ? '#d4f8d4' : '#e8d4f8';

  return (
    <svg width={width} height={height} viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="50%" stopColor={c2} />
          <stop offset="100%" stopColor={c3} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glow} stopOpacity="0.4" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="2" y="2" width="96" height="136" rx="8" fill={`url(#${id})`} />
      <circle cx="50" cy="72" r="38" fill={`url(#${id}-glow)`} />
      <rect x="5" y="5" width="90" height="130" rx="6" fill="none"
        stroke={accent} strokeWidth="1.5" opacity="0.8" />
      <rect x="8" y="8" width="84" height="124" rx="4" fill="none"
        stroke={accent} strokeWidth="0.5" opacity="0.4" />

      {/* Corner diamonds */}
      <text x="13" y="22" fontSize="9" fill={accent} opacity="0.7">◆</text>
      <text x="87" y="22" textAnchor="end" fontSize="9" fill={accent} opacity="0.7">◆</text>
      <text x="13" y="128" fontSize="9" fill={accent} opacity="0.7">◆</text>
      <text x="87" y="128" textAnchor="end" fontSize="9" fill={accent} opacity="0.7">◆</text>

      {/* Center symbol */}
      <text x="50" y="80" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="44"
        fontWeight="900" fill={text}
        style={{ filter: `drop-shadow(0 0 10px ${glow})` }}>
        {symbol}
      </text>

      {/* Name */}
      <text x="50" y="102" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="10"
        letterSpacing="2" fill={text} opacity="0.8" fontWeight="600">
        {name}
      </text>
    </svg>
  );
}

/**
 * Card back (for opponents)
 */
export function CardBackArt({ width = 80, height = 112 }) {
  const id = useGradId('back');
  const generated = GENERATED['card-back'];
  if (generated) {
    return (
      <div style={{ width, height, borderRadius: 8, overflow: 'hidden' }}>
        <img
          src={generated}
          alt="Verso da carta"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    );
  }
  return (
    <svg width={width} height={height} viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2a1a0f" />
          <stop offset="50%" stopColor="#1a0f0a" />
          <stop offset="100%" stopColor="#120a06" />
        </linearGradient>
        <pattern id={`${id}-pattern`} width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M7 0 L14 7 L7 14 L0 7 Z" fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.25" />
        </pattern>
      </defs>

      <rect x="2" y="2" width="96" height="136" rx="8" fill={`url(#${id})`} />
      <rect x="4" y="4" width="92" height="132" rx="7" fill={`url(#${id}-pattern)`} />
      <rect x="7" y="7" width="86" height="126" rx="5" fill="none"
        stroke="#c9a84c" strokeWidth="1.2" opacity="0.6" />

      {/* Center emblem */}
      <circle cx="50" cy="70" r="26" fill="none" stroke="#c9a84c" strokeWidth="1.5" opacity="0.7" />
      <circle cx="50" cy="70" r="22" fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.4" />
      <text x="50" y="80" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="28"
        fontWeight="900" fill="#c9a84c" opacity="0.8">
        N
      </text>

      {/* Corner diamonds */}
      <text x="13" y="22" fontSize="8" fill="#c9a84c" opacity="0.5">◆</text>
      <text x="87" y="22" textAnchor="end" fontSize="8" fill="#c9a84c" opacity="0.5">◆</text>
      <text x="13" y="128" fontSize="8" fill="#c9a84c" opacity="0.5">◆</text>
      <text x="87" y="128" textAnchor="end" fontSize="8" fill="#c9a84c" opacity="0.5">◆</text>
    </svg>
  );
}

/**
 * Seal icon (I, XX, or I+XX)
 */
export function SealIcon({ type, size = 40 }) {
  const configs = {
    simplicidade: { label: 'I', color: '#5a9a3a', glow: 'rgba(90,154,58,0.5)' },
    grandeza: { label: 'XX', color: '#c9a84c', glow: 'rgba(201,168,76,0.5)' },
    duplo_juramento: { label: 'I+XX', color: '#c44536', glow: 'rgba(196,69,54,0.5)' }
  };
  const cfg = configs[type] || configs.simplicidade;

  return (
    <svg width={size} height={size} viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`seal-${type}-${size}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={cfg.color} stopOpacity="0.3" />
          <stop offset="70%" stopColor={cfg.color} stopOpacity="0.1" />
          <stop offset="100%" stopColor={cfg.color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="28" fill={`url(#seal-${type}-${size})`} />
      <circle cx="30" cy="30" r="24" fill="none" stroke={cfg.color} strokeWidth="2" opacity="0.8" />
      <circle cx="30" cy="30" r="20" fill="none" stroke={cfg.color} strokeWidth="0.8" opacity="0.5" />
      <text x="30" y="38" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="18"
        fontWeight="900" fill={cfg.color} style={{ filter: `drop-shadow(0 0 5px ${cfg.glow})` }}>
        {cfg.label}
      </text>
    </svg>
  );
}

/**
 * School emblem (diamond, circle, triangle, square)
 */
export function SchoolEmblem({ school, size = 40 }) {
  const colors = {
    ouro: '#c9a84c',
    prata: '#c0c0c0',
    bronze: '#cd7f32',
    terra: '#4a7c28'
  };
  const color = colors[school] || '#c9a84c';
  const symbols = { ouro: '◆', prata: '●', bronze: '▲', terra: '■' };

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <text x="20" y="27" textAnchor="middle" fontFamily="serif" fontSize="16" fill={color}>
        {symbols[school]}
      </text>
    </svg>
  );
}

export default NumberCardArt;
