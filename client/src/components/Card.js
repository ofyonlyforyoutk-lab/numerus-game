import React from 'react';
import { NumberCardArt, OperationCardArt, SpecialCardArt, CardBackArt } from '../assets/CardArt';
import { PDFCardBackArt } from '../assets/PDFCardArt';
import GENERATED from '../assets/generated';

function Card({ card, onClick, selected, small, className = '', style }) {
  if (!card) return null;

  const classes = [
    'card',
    card.type === 'number' ? card.school : '',
    card.type === 'operation' ? 'operation' : '',
    card.type === 'special' ? 'special' : '',
    selected ? 'selected' : '',
    small ? 'small' : '',
    className
  ].filter(Boolean).join(' ');

  const renderArt = () => {
    if (card.type === 'number') {
      return <NumberCardArt value={card.value} school={card.school} />;
    }
    if (card.type === 'operation') {
      return <OperationCardArt operation={card.operation} />;
    }
    if (card.type === 'special') {
      return <SpecialCardArt operation={card.operation} />;
    }
    return null;
  };

  return (
    <div
      className={classes}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', ...style }}
      title={card.name}
    >
      {renderArt()}
    </div>
  );
}

export function CardBack({ width, height, className = '', usePDFArt = false }) {
  // Arte gerada (Pollinations) tem prioridade quando existe
  const generated = GENERATED['card-back'];
  if (generated) {
    return (
      <div
        className={`card-back-art ${className}`}
        style={{ width, height, borderRadius: 6, overflow: 'hidden' }}
      >
        <img
          src={generated}
          alt="Verso da carta"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    );
  }
  if (usePDFArt) {
    return <PDFCardBackArt width={width} height={height} className={className} />;
  }
  return (
    <div className={`card-back-art ${className}`}>
      <CardBackArt width={width} height={height} />
    </div>
  );
}

export default Card;
