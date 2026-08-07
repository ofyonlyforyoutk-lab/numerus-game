import React, { useState } from 'react';
import { CardBackArt } from './CardArt';

/**
 * Card back using the actual illustrated card art extracted from the PDF manual.
 * Falls back to the SVG design if the image fails to load.
 */

export function PDFCardBackArt({ width = 28, height = 40, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`card-back-art ${className}`}>
        <CardBackArt width={width} height={height} />
      </div>
    );
  }

  return (
    <div
      className={`pdf-card-back ${className}`}
      style={{
        width,
        height,
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid rgba(201, 168, 76, 0.5)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
        position: 'relative',
        flexShrink: 0
      }}
    >
      <img
        src="/assets/cards/carta_exemplo_1.png"
        alt=""
        onError={() => setFailed(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
        draggable={false}
      />
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, transparent 40%, rgba(0,0,0,0.3) 100%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}

export default PDFCardBackArt;
