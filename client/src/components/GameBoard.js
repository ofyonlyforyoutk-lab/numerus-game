import React, { useState, useEffect, useRef } from 'react';
import Card, { CardBack } from './Card';
import BettingPanel from './BettingPanel';
import EquationBuilder from './EquationBuilder';
import DestinySelector from './DestinySelector';
import GameLog from './GameLog';
import { sound } from '../utils/sound';
import { CoinIcon, SwordsIcon, BackArrowIcon, EyeIcon, BookIcon, ScalesIcon, HourglassIcon, ScrollIcon } from '../assets/Icons';

const ROUND_NAMES = [
  'O Despertar',
  'O Chamado do Destino',
  'A Revelação dos Conhecimentos',
  'O Julgamento da Coragem',
  'O Conhecimento Cresce',
  'A Construção da Equação',
  'O Peso da Convicção',
  'O Juramento',
  'A Revelação',
  'O Grande Julgamento'
];

const ROUND_DESCRIPTIONS = [
  'Receba os Conhecimentos Fundamentais',
  'Primeira aposta e carta fechada',
  'Receba duas cartas abertas',
  'Rodada de apostas',
  'Receba mais uma carta aberta',
  'Construa sua Equação',
  'Última rodada de apostas',
  'Escolha seu destino secretamente',
  'Revele seu Selo e sua Equação',
  'Compare apenas com quem escolheu o mesmo destino'
];

function GameBoard({ gameState, playerId, onAction, onBackToMenu, isCPU }) {
  const [selectedCards, setSelectedCards] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const myData = gameState.players[playerId] || {};
  const opponents = Object.values(gameState.players).filter(p => p.id !== playerId);
  const currentRound = gameState.currentRound;
  const roundName = ROUND_NAMES[currentRound] || 'Desconhecido';
  const roundDesc = ROUND_DESCRIPTIONS[currentRound] || '';

  const handleAction = (action) => {
    setActionLoading(true);
    sound.resume();
    // Play appropriate sound for action type
    if (action.type === 'bet') sound.bet();
    else if (action.type === 'fold') sound.fold();
    else if (action.type === 'draw_face_down' || action.type === 'draw_face_up' || action.type === 'deal_operations') sound.cardDeal();
    else if (action.type === 'submit_equation') sound.equationSubmit();
    else if (action.type === 'choose_destiny') sound.destiny();
    else if (action.type === 'reveal') sound.reveal();
    else sound.click();

    if (isCPU) {
      onAction(action);
      setTimeout(() => setActionLoading(false), 100);
    } else {
      onAction(action, (response) => {
        setActionLoading(false);
        if (!response?.success) {
          sound.error();
          console.error(response?.error);
        }
      });
    }
  };

  // Play round transition sound when round changes
  const prevRoundRef = useRef(currentRound);
  useEffect(() => {
    if (prevRoundRef.current !== currentRound && currentRound > 0) {
      sound.roundTransition();
    }
    prevRoundRef.current = currentRound;
  }, [currentRound]);

  // Play CPU thinking sound
  useEffect(() => {
    if (gameState.cpuThinking) {
      sound.cpuThink();
    }
  }, [gameState.cpuThinking]);

  const renderActionPanel = () => {
    // Show CPU thinking indicator
    if (gameState.cpuThinking && !isCPU) {
      return (
        <div className="center-area">
          <div className="cpu-thinking">
            <span>Oponente pensando</span>
            <span className="dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </span>
          </div>
        </div>
      );
    }

    switch (currentRound) {
      case 0:
        return (
          <div className="center-area animate-in">
            <div className="table-surface">
              <div className="table-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <SwordsIcon size={24} /> O Despertar
            </div>
              <div className="table-desc">Receba seus Conhecimentos Fundamentais</div>
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                  className="btn btn-primary btn-glow"
                  onClick={() => handleAction({ type: 'deal_operations' })}
                  disabled={actionLoading || (gameState.myOperations && gameState.myOperations.length > 0)}
                >
                  {gameState.myOperations && gameState.myOperations.length > 0 ? '✦ Recebido' : 'Receber Cartas'}
                </button>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="center-area animate-in">
            <div className="table-surface">
              <div className="table-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <HourglassIcon size={24} /> O Chamado do Destino
              </div>
              <div className="table-desc">{roundDesc}</div>
              <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleAction({ type: 'draw_face_down' })}
                  disabled={actionLoading || (gameState.myFaceDown && gameState.myFaceDown.length > 0)}
                >
                  {gameState.myFaceDown && gameState.myFaceDown.length > 0 ? '✦ Carta Recebida' : 'Puxar Carta Fechada'}
                </button>
              </div>
            </div>
            <BettingPanel
              myChips={gameState.myChips}
              onBet={(amount) => handleAction({ type: 'bet', amount })}
              disabled={actionLoading}
              minBet={0}
            />
          </div>
        );

      case 2:
        return (
          <div className="center-area animate-in">
            <div className="table-surface">
              <div className="table-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <BookIcon size={24} /> A Revelação dos Conhecimentos
              </div>
              <div className="table-desc">Receba duas cartas abertas. √ e × têm efeitos especiais!</div>
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleAction({ type: 'draw_face_up' })}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Recebendo...' : 'Receber Cartas Abertas'}
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="center-area animate-in">
            <div className="table-surface">
              <div className="table-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <ScalesIcon size={24} /> O Julgamento da Coragem
              </div>
              <div className="table-desc">Nova rodada de apostas. Mostre sua coragem!</div>
            </div>
            <BettingPanel
              myChips={gameState.myChips}
              onBet={(amount) => handleAction({ type: 'bet', amount })}
              onFold={() => handleAction({ type: 'fold' })}
              onCheck={() => handleAction({ type: 'check' })}
              disabled={actionLoading}
              showFold
              showCheck
            />
          </div>
        );

      case 4:
        return (
          <div className="center-area animate-in">
            <div className="table-surface">
              <div className="table-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <BookIcon size={24} /> O Conhecimento Cresce
              </div>
              <div className="table-desc">Receba mais uma carta aberta para enriquecer sua Equação.</div>
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleAction({ type: 'draw_face_up' })}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Recebendo...' : 'Puxar Carta Aberta'}
                </button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <EquationBuilder
            myHand={gameState.myHand || []}
            myOperations={gameState.myOperations || []}
            mySpecials={gameState.mySpecials || []}
            onSubmit={(equation) => handleAction({ type: 'submit_equation', equation })}
            disabled={actionLoading}
          />
        );

      case 6:
        return (
          <div className="center-area animate-in">
            <div className="table-surface">
              <div className="table-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <ScalesIcon size={24} /> O Peso da Convicção
              </div>
              <div className="table-desc">Última rodada de apostas antes do Juramento.</div>
            </div>
            <BettingPanel
              myChips={gameState.myChips}
              onBet={(amount) => handleAction({ type: 'bet', amount })}
              onFold={() => handleAction({ type: 'fold' })}
              onCheck={() => handleAction({ type: 'check' })}
              disabled={actionLoading}
              showFold
              showCheck
            />
          </div>
        );

      case 7:
        return (
          <div className="center-area animate-in">
            <div className="table-surface">
              <div className="table-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <ScrollIcon size={24} /> O Juramento
              </div>
              <div className="table-desc">Escolha secretamente seu destino. Será revelado no final.</div>
            </div>
            <DestinySelector
              onSelect={(destiny) => handleAction({ type: 'choose_destiny', destiny })}
              selected={gameState.myDestiny}
              disabled={actionLoading}
            />
          </div>
        );

      case 8:
        return (
          <div className="center-area animate-in">
            <div className="table-surface">
              <div className="table-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <EyeIcon size={24} /> A Revelação
              </div>
              <div className="table-desc">Hora de revelar sua Equação e seu destino!</div>
              <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                <p style={{ color: 'var(--gold-light)', fontSize: '1.3rem', fontFamily: 'Cinzel' }}>
                  Sua Equação = {gameState.myEquationResult}
                </p>
                <p style={{ color: 'var(--gold)', marginTop: '0.5rem', fontFamily: 'Cinzel' }}>
                  Destino: {gameState.myDestiny === 'simplicidade' ? 'I - Simplicidade (≈1)' :
                           gameState.myDestiny === 'grandeza' ? 'XX - Grandeza (≈20)' : 'I+XX - Duplo Juramento'}
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button
                  className="btn btn-primary btn-glow"
                  onClick={() => handleAction({ type: 'reveal' })}
                  disabled={actionLoading || gameState.myRevealed}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
                >
                  {gameState.myRevealed ? '✦ Revelado' : (<><EyeIcon size={20} /> Revelar Equação</>)}
                </button>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="center-area animate-in">
            <div className="table-surface">
              <div className="table-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <ScalesIcon size={24} /> O Grande Julgamento
              </div>
              <div className="table-desc">As Equações são comparadas... Aguarde o resultado.</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="game-board">
      {/* Top Bar */}
      <div className="top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => { sound.click(); onBackToMenu(); }}
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <BackArrowIcon size={14} /> Menu
          </button>
          <div>
            <div className="round-info">Rodada {currentRound + 1}/10</div>
            <div className="round-name">{roundName}</div>
          </div>
        </div>
        <div className="pot-info">
          <div className="pot-label">Pote</div>
          <div className="pot-amount" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
            <CoinIcon size={20} /> {gameState.pot}
          </div>
        </div>
        <div className="my-chips">
          <div className="my-chips-label">Suas Fichas</div>
          <div className="my-chips-amount">{gameState.myChips}</div>
        </div>
      </div>

      {/* Opponents */}
      <div className="opponents-area">
        {opponents.map(opponent => (
          <div
            key={opponent.id}
            className={`opponent-card ${opponent.folded ? 'folded' : ''} ${opponent.isCPU ? 'cpu' : ''}`}
          >
            <div className="opponent-name">
              {opponent.isCPU && '✦ '}{opponent.name}
            </div>
            <div className="opponent-chips" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
              <CoinIcon size={14} /> {opponent.chips}
            </div>
            <div className="opponent-cards">
              {Array.from({ length: Math.min(opponent.handCount, 8) }).map((_, i) => (
                <CardBack key={i} usePDFArt />
              ))}
            </div>
            {opponent.bet > 0 && (
              <div className="opponent-bet">Aposta: {opponent.bet}</div>
            )}
            {opponent.destiny && (
              <div className={`opponent-destiny ${
                opponent.destiny === 'simplicidade' ? 'destiny-i' :
                opponent.destiny === 'grandeza' ? 'destiny-xx' : 'destiny-double'
              }`}>
                {opponent.destiny === 'simplicidade' ? 'I' :
                 opponent.destiny === 'grandeza' ? 'XX' : 'I+XX'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Center - Action Area */}
      {renderActionPanel()}

      {/* Hand */}
      <div className="hand-area">
        <div className="hand-label">Sua Mão ({(gameState.myHand || []).length} cartas)</div>
        <div className="hand-cards">
          {(gameState.myHand || []).map((card, index) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => {
                if (currentRound === 5) {
                  // Equation builder handles selection
                } else {
                  setSelectedCards(prev =>
                    prev.some(c => c.id === card.id)
                      ? prev.filter(c => c.id !== card.id)
                      : [...prev, card]
                  );
                }
              }}
              selected={selectedCards.some(c => c.id === card.id)}
              style={{ animationDelay: `${index * 0.05}s` }}
            />
          ))}
        </div>
      </div>

      {/* Game Log */}
      <GameLog log={gameState.log || []} />
    </div>
  );
}

export default GameBoard;
