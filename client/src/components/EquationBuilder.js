import React, { useState, useMemo } from 'react';
import Card from './Card';
import { sound } from '../utils/sound';
import { SwordsIcon, CheckIcon, CrossIcon } from '../assets/Icons';

function EquationBuilder({ myHand, myOperations, mySpecials, onSubmit, disabled }) {
  const [equationCards, setEquationCards] = useState([]);
  const [availableCards, setAvailableCards] = useState([...myHand]);

  // All cards that need to be used
  const requiredCards = useMemo(() => {
    return [...myOperations, ...mySpecials];
  }, [myOperations, mySpecials]);

  const numberCards = useMemo(() => {
    return myHand.filter(c => c.type === 'number');
  }, [myHand]);

  const addToEquation = (card) => {
    if (equationCards.some(c => c.id === card.id)) return;
    sound.cardSelect();
    setEquationCards(prev => [...prev, card]);
    setAvailableCards(prev => prev.filter(c => c.id !== card.id));
  };

  const removeFromEquation = (card) => {
    sound.cardSelect();
    setEquationCards(prev => prev.filter(c => c.id !== card.id));
    setAvailableCards(prev => [...prev, card]);
  };

  const moveCard = (index, direction) => {
    const newEquation = [...equationCards];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newEquation.length) return;
    [newEquation[index], newEquation[newIndex]] = [newEquation[newIndex], newEquation[index]];
    setEquationCards(newEquation);
  };

  const handleSubmit = () => {
    if (equationCards.length === 0) return;
    onSubmit(equationCards);
  };

  // Check if all required cards are in the equation
  const allRequiredUsed = requiredCards.every(req => 
    equationCards.some(eq => eq.id === req.id)
  );

  const allNumbersUsed = numberCards.every(num => 
    equationCards.some(eq => eq.id === num.id)
  );

  const canSubmit = allRequiredUsed && allNumbersUsed && equationCards.length > 0;

  // Simple preview of the equation result (mirrors server evaluation)
  const previewResult = useMemo(() => {
    if (equationCards.length === 0) return null;
    try {
      const tokens = [];
      for (const card of equationCards) {
        if (card.type === 'number') tokens.push({ type: 'number', value: card.value });
        else if (card.type === 'operation') tokens.push({ type: 'operation', op: card.operation });
        else if (card.type === 'special') {
          if (card.operation === 'sqrt') tokens.push({ type: 'sqrt' });
          else if (card.operation === 'multiply') tokens.push({ type: 'operation', op: 'multiply' });
        }
      }

      // √ first
      let processed = [];
      let i = 0;
      while (i < tokens.length) {
        if (tokens[i].type === 'sqrt' && i + 1 < tokens.length && tokens[i + 1].type === 'number') {
          processed.push({ type: 'number', value: Math.sqrt(tokens[i + 1].value) });
          i += 2;
        } else { processed.push(tokens[i]); i++; }
      }

      // × and ÷
      let processed2 = [];
      i = 0;
      while (i < processed.length) {
        if (processed[i].type === 'operation' && (processed[i].op === 'multiply' || processed[i].op === 'divide')) {
          const left = processed2.pop();
          const right = processed[i + 1];
          if (!left || !right) return 'Inválido';
          if (right.value === 0) return 'Div. por 0';
          processed2.push({ type: 'number', value: processed[i].op === 'multiply' ? left.value * right.value : left.value / right.value });
          i += 2;
        } else { processed2.push(processed[i]); i++; }
      }

      // + and −
      let result = 0;
      let lastOp = 'add';
      for (const token of processed2) {
        if (token.type === 'number') {
          result = lastOp === 'add' ? result + token.value : lastOp === 'subtract' ? result - token.value : result;
        } else if (token.type === 'operation') {
          lastOp = token.op;
        }
      }

      return isFinite(result) ? Math.round(result * 10000) / 10000 : 'Inválido';
    } catch {
      return 'Inválido';
    }
  }, [equationCards]);

  return (
    <div className="center-area animate-in">
      <div className="equation-builder">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          <SwordsIcon size={26} /> A Construção da Equação
        </h3>
        <p style={{ textAlign: 'center', color: '#c9a84c', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Monte sua equação usando TODAS as cartas numéricas e operações.
          <br />
          <span style={{ fontSize: '0.8rem' }}>
            Ordem: √ → × e ÷ → + e − | Sem parênteses | Sem divisão por zero
          </span>
        </p>

        {/* Equation Slots */}
        <div className="equation-slots">
          {equationCards.length === 0 ? (
            <div style={{ color: '#c9a84c', fontStyle: 'italic', padding: '2rem' }}>
              Clique nas cartas abaixo para construir sua equação...
            </div>
          ) : (
            equationCards.map((card, index) => (
              <div key={card.id} style={{ position: 'relative', display: 'inline-block' }}>
                <Card
                  card={card}
                  onClick={() => removeFromEquation(card)}
                  selected={false}
                  small
                />
                <div style={{ 
                  position: 'absolute', 
                  top: -8, 
                  right: -8, 
                  display: 'flex',
                  gap: 2
                }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveCard(index, -1); }}
                    style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#c9a84c', color: '#1a0f0a',
                      border: 'none', cursor: 'pointer', fontSize: '0.7rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >◀</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveCard(index, 1); }}
                    style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#c9a84c', color: '#1a0f0a',
                      border: 'none', cursor: 'pointer', fontSize: '0.7rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >▶</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Result Preview */}
        {equationCards.length > 0 && (
          <div className="equation-result">
            <div className="result-label">Resultado Parcial:</div>
            <div className="result-value">{previewResult}</div>
          </div>
        )}

        {/* Available Cards */}
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ 
            fontFamily: 'Cinzel', color: '#c9a84c', 
            fontSize: '0.9rem', marginBottom: '0.8rem',
            textAlign: 'center'
          }}>
            Cartas Disponíveis:
          </div>
          <div style={{ 
            display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
            justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
            border: '1px solid rgba(201, 168, 76, 0.2)'
          }}>
            {availableCards.map(card => (
              <Card
                key={card.id}
                card={card}
                onClick={() => addToEquation(card)}
                small
              />
            ))}
          </div>
        </div>

        {/* Validation Status */}
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.8rem',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '4px',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: allNumbersUsed ? '#4a8a4a' : '#c44536', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {allNumbersUsed ? <CheckIcon size={14} /> : <CrossIcon size={14} />} Cartas Numéricas: {equationCards.filter(c => c.type === 'number').length}/{numberCards.length}
            </span>
            <span style={{ color: allRequiredUsed ? '#4a8a4a' : '#c44536', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {allRequiredUsed ? <CheckIcon size={14} /> : <CrossIcon size={14} />} Operações & Especiais: {equationCards.filter(c => c.type !== 'number').length}/{requiredCards.length}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={disabled || !canSubmit}
            style={{ fontSize: '1.1rem', padding: '1rem 3rem' }}
          >
            {disabled ? 'Enviando...' : (<><SwordsIcon size={22} /> Submeter Equação</>)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EquationBuilder;
