import React from 'react';

/**
 * Medieval-themed SVG icons replacing emojis throughout the UI.
 */

/** Gold coin / chip */
export function CoinIcon({ size = 20, color = '#c9a84c' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="12" r="7" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" />
      <text x="12" y="16" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="9"
        fontWeight="900" fill={color}>N</text>
    </svg>
  );
}

/** Coin stack */
export function CoinStackIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="32" rx="12" ry="4" fill="#8b6914" opacity="0.4" />
      <ellipse cx="20" cy="30" rx="12" ry="4" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
      <ellipse cx="20" cy="25" rx="12" ry="4" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
      <ellipse cx="20" cy="20" rx="12" ry="4" fill="none" stroke="#e8d48b" strokeWidth="1.5" />
      <text x="20" y="23" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="8"
        fill="#e8d48b">N</text>
    </svg>
  );
}

/** Trophy */
export function TrophyIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 6 H32 V12 A8 8 0 0 1 24 20 A8 8 0 0 1 16 12 Z" fill="#c9a84c"
        stroke="#8b6914" strokeWidth="1.5" />
      <path d="M14 8 H10 A2 2 0 0 0 10 14 H14 Z" fill="#e8d48b" stroke="#8b6914" strokeWidth="1" />
      <path d="M34 8 H38 A2 2 0 0 1 38 14 H34 Z" fill="#e8d48b" stroke="#8b6914" strokeWidth="1" />
      <rect x="22" y="22" width="4" height="6" fill="#8b6914" />
      <path d="M18 36 H30 L28 30 H20 Z" fill="#8b6914" />
      <rect x="14" y="36" width="20" height="3" rx="1" fill="#c9a84c" />
      <text x="24" y="27" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="7"
        fill="#1a0f0a" fontWeight="900">N</text>
    </svg>
  );
}

/** Swords (duel) */
export function SwordsIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <line x1="14" y1="34" x2="38" y2="10" />
        <line x1="34" y1="10" x2="38" y2="10" />
        <line x1="38" y1="10" x2="38" y2="14" />
        <line x1="14" y1="34" x2="10" y2="38" />
        <line x1="10" y1="38" x2="14" y2="38" />
      </g>
      <g stroke="#e8d48b" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <line x1="34" y1="14" x2="10" y2="38" />
        <line x1="10" y1="34" x2="10" y2="38" />
        <line x1="10" y1="38" x2="14" y2="38" />
      </g>
      <line x1="24" y1="24" x2="24" y2="24" stroke="#c9a84c" strokeWidth="3" />
    </svg>
  );
}

/** Scroll (rules) */
export function ScrollIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="3" width="16" height="18" rx="2" fill="#d4c5a9" stroke="#8b6914" strokeWidth="1.2" />
      <line x1="7" y1="7" x2="17" y2="7" stroke="#8b6914" strokeWidth="0.8" />
      <line x1="7" y1="11" x2="17" y2="11" stroke="#8b6914" strokeWidth="0.8" />
      <line x1="7" y1="15" x2="14" y2="15" stroke="#8b6914" strokeWidth="0.8" />
    </svg>
  );
}

/** Scales (judgment) */
export function ScalesIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="8" x2="20" y2="34" stroke="#c9a84c" strokeWidth="2" />
      <line x1="10" y1="12" x2="30" y2="12" stroke="#c9a84c" strokeWidth="2.5" />
      <path d="M10 12 V20 A5 5 0 0 0 20 20 V12" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
      <path d="M20 12 V20 A5 5 0 0 0 30 20 V12" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
      <rect x="4" y="34" width="32" height="3" rx="1" fill="#8b6914" />
      <circle cx="10" cy="22" r="3" fill="#c9a84c" opacity="0.7" />
      <circle cx="30" cy="22" r="3" fill="#c9a84c" opacity="0.7" />
    </svg>
  );
}

/** Eye (reveal) */
export function EyeIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12 C6 4 18 4 22 12 C18 20 6 20 2 12 Z" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="#e8d48b" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.5" fill="#c9a84c" />
    </svg>
  );
}

/** Hourglass (timed duel) */
export function HourglassIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="3" width="12" height="3" rx="1" fill="#c9a84c" />
      <rect x="6" y="18" width="12" height="3" rx="1" fill="#c9a84c" />
      <path d="M8 6 L12 12 L16 6" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
      <path d="M8 18 L12 12 L16 18" fill="none" stroke="#e8d48b" strokeWidth="1.5" />
      <text x="12" y="15.5" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="5" fill="#e8d48b">N</text>
    </svg>
  );
}

/** Crown */
export function CrownIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 28 L3 12 L12 18 L20 6 L28 18 L37 12 L34 28 Z" fill="#c9a84c"
        stroke="#8b6914" strokeWidth="1.5" />
      <rect x="6" y="30" width="28" height="3" rx="1" fill="#8b6914" />
      <circle cx="8" cy="29" r="2" fill="#e8d48b" />
      <circle cx="20" cy="29" r="2.5" fill="#e8d48b" />
      <circle cx="32" cy="29" r="2" fill="#e8d48b" />
    </svg>
  );
}

/** Wizard staff / magic */
export function StaffIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <line x1="18" y1="38" x2="30" y2="8" stroke="#8b6914" strokeWidth="3" strokeLinecap="round" />
      <circle cx="31" cy="6" r="4" fill="#c9a84c" opacity="0.8" />
      <circle cx="31" cy="6" r="2" fill="#e8d48b" />
      <path d="M26 16 L30 20 L34 16 L30 12 Z" fill="#c9a84c" opacity="0.6" />
    </svg>
  );
}

/** Book / codex */
export function BookIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 8 C16 5 10 5 6 7 V30 C10 28 16 28 20 31 C24 28 30 28 34 30 V7 C30 5 24 5 20 8 Z"
        fill="none" stroke="#c9a84c" strokeWidth="1.5" />
      <line x1="20" y1="8" x2="20" y2="31" stroke="#c9a84c" strokeWidth="1" opacity="0.6" />
      <text x="20" y="22" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="10"
        fontWeight="900" fill="#c9a84c">N</text>
    </svg>
  );
}

/** Back arrow */
export function BackArrowIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 19 L5 12 L12 5" fill="none" stroke="#c9a84c" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      <line x1="19" y1="12" x2="6" y2="12" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Left arrow */
export function LeftArrowIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 5 L7 12 L14 19" fill="none" stroke="#c9a84c" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Right arrow */
export function RightArrowIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 5 L17 12 L10 19" fill="none" stroke="#c9a84c" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Globe (online) */
export function GlobeIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="11" fill="none" stroke="#c9a84c" strokeWidth="1.8" />
      <ellipse cx="14" cy="14" rx="5" ry="11" fill="none" stroke="#c9a84c" strokeWidth="1.2" opacity="0.7" />
      <line x1="3" y1="14" x2="25" y2="14" stroke="#c9a84c" strokeWidth="1.2" opacity="0.7" />
      <circle cx="14" cy="14" r="2" fill="#e8d48b" opacity="0.8" />
    </svg>
  );
}

/** Door (join room) */
export function DoorIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="3" width="18" height="22" rx="2" fill="none" stroke="#c9a84c" strokeWidth="1.8" />
      <circle cx="19" cy="14" r="1.8" fill="#e8d48b" />
      <path d="M5 3 Q14 10 5 22" fill="none" stroke="#c9a84c" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

/** Checkmark */
export function CheckIcon({ size = 20, color = '#5a9a3a' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12 L10 18 L20 6" fill="none" stroke={color} strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Cross/X (invalid) */
export function CrossIcon({ size = 20, color = '#c44536' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <line x1="5" y1="5" x2="19" y2="19" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="19" y1="5" x2="5" y2="19" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Sparkle */
export function SparkleIcon({ size = 16, color = '#e8d48b' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" fill={color} opacity="0.8" />
    </svg>
  );
}

/** Key (account) */
export function KeyIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="15" r="4" fill="none" stroke="#c9a84c" strokeWidth="2" />
      <line x1="11" y1="12" x2="20" y2="3" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="7" x2="18" y2="9" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="5" x2="20" y2="7" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Map / journey (story mode) */
export function MapIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 4 L10 7 L18 4 L23 7 V24 L18 21 L10 24 L5 21 Z"
        fill="none" stroke="#c9a84c" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 7 V24 M18 4 V21" stroke="#c9a84c" strokeWidth="1" opacity="0.5" />
      <circle cx="14" cy="14" r="2" fill="#e8d48b" />
      <circle cx="14" cy="14" r="4.5" fill="none" stroke="#e8d48b" strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
}

/** Star (chapter rating) */
export function StarIcon({ size = 20, filled = true, color = '#e8d48b' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 1.5 L12.4 6.6 L18 7.3 L13.9 11.2 L14.9 16.7 L10 14 L5.1 16.7 L6.1 11.2 L2 7.3 L7.6 6.6 Z"
        fill={filled ? color : 'none'} stroke="#8b6914" strokeWidth="1" opacity={filled ? 1 : 0.4} />
    </svg>
  );
}

/** Lock (locked chapter) */
export function LockIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="9" width="12" height="8" rx="1.5" fill="none" stroke="#8a7a5a" strokeWidth="1.5" />
      <path d="M6.5 9 V6 A3.5 3.5 0 0 1 13.5 6 V9" fill="none" stroke="#8a7a5a" strokeWidth="1.5" />
      <circle cx="10" cy="13" r="1.2" fill="#8a7a5a" />
    </svg>
  );
}

/** Logout */
export function LogoutIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 3 H4 A1.5 1.5 0 0 0 2.5 4.5 V15.5 A1.5 1.5 0 0 0 4 17 H7"
        fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="10" x2="17" y2="10" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 7 L17 10 L14 13" fill="none" stroke="#c9a84c" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Close X */
export function CloseIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <line x1="4" y1="4" x2="16" y2="16" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="4" x2="4" y2="16" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default CoinIcon;
