import React, { useEffect, useRef } from 'react';

function GameLog({ log }) {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div className="game-log" ref={logRef}>
      {log.length === 0 ? (
        <div className="log-entry" style={{ fontStyle: 'italic' }}>
          O duelo ainda não começou...
        </div>
      ) : (
        log.map((entry, i) => (
          <div 
            key={i} 
            className={`log-entry ${entry.action && entry.action.startsWith('===') ? 'round-start' : ''}`}
          >
            {entry.round !== undefined && (
              <span style={{ color: '#8b6914' }}>[{entry.round}] </span>
            )}
            {entry.action}
          </div>
        ))
      )}
    </div>
  );
}

export default GameLog;
