import React, { useState } from 'react';
import { CoinIcon } from '../assets/Icons';

function BettingPanel({ myChips, onBet, onFold, onCheck, disabled, showFold, showCheck, minBet = 0 }) {
  const [amount, setAmount] = useState(0);

  const handleBet = () => {
    if (amount >= minBet && amount <= myChips) {
      onBet(amount);
      setAmount(0);
    }
  };

  return (
    <div className="betting-panel animate-in">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CoinIcon size={24} /> Fichas: {myChips}
      </h3>
      
      <div className="bet-slider">
        <span style={{ color: '#c9a84c' }}>{minBet}</span>
        <input
          type="range"
          min={minBet}
          max={myChips}
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value))}
          disabled={disabled}
        />
        <span style={{ color: '#c9a84c' }}>{myChips}</span>
      </div>
      
      <div className="bet-amount">{amount}</div>
      
      <div className="bet-buttons">
        <button
          className="btn btn-primary"
          onClick={handleBet}
          disabled={disabled || amount < minBet || amount > myChips}
        >
          Apostar {amount}
        </button>
        
        {showCheck && (
          <button
            className="btn btn-secondary"
            onClick={onCheck}
            disabled={disabled}
          >
            Passar
          </button>
        )}
        
        {showFold && (
          <button
            className="btn btn-danger"
            onClick={onFold}
            disabled={disabled}
          >
            Desistir
          </button>
        )}
      </div>
    </div>
  );
}

export default BettingPanel;
