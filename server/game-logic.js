/**
 * NUMERUS - Master the Equation
 * Core Game Logic
 * 
 * All game rules validated server-side for anti-cheat.
 * Mathematical order: √ first, then × and ÷, then + and −
 */

const { randomUUID: uuidv4 } = require('crypto');

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const SCHOOLS = ['ouro', 'prata', 'bronze', 'terra'];
const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const STARTING_CHIPS = 20;

// Round names (the Dez Círculos)
const ROUNDS = [
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

const DESTINIES = {
  SIMPLICITY: 'simplicidade',  // Target: 1
  GREATNESS: 'grandeza',       // Target: 20
  DOUBLE: 'duplo_juramento'    // Both I and XX
};

// ═══════════════════════════════════════════════════════════════
// DECK CREATION
// ═══════════════════════════════════════════════════════════════

function createDeck() {
  const deck = [];

  // 44 number cards (0-10 in each school)
  for (const school of SCHOOLS) {
    for (const number of NUMBERS) {
      deck.push({
        id: uuidv4(),
        type: 'number',
        value: number,
        school: school,
        name: `${number} de ${school.charAt(0).toUpperCase() + school.slice(1)}`
      });
    }
  }

  // 4 Raiz Quadrada (√) cards
  for (let i = 0; i < 4; i++) {
    deck.push({
      id: uuidv4(),
      type: 'special',
      operation: 'sqrt',
      name: 'Raiz Quadrada (√)'
    });
  }

  // 4 Multiplicação (×) cards
  for (let i = 0; i < 4; i++) {
    deck.push({
      id: uuidv4(),
      type: 'special',
      operation: 'multiply',
      name: 'Multiplicação (×)'
    });
  }

  return deck;
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ═══════════════════════════════════════════════════════════════
// CARD UTILITIES
// ═══════════════════════════════════════════════════════════════

function isNumberCard(card) {
  return card.type === 'number';
}

function isSpecialCard(card) {
  return card.type === 'special';
}

function isOperationCard(card) {
  return card.type === 'operation';
}

function isNumeric(card) {
  return card.type === 'number';
}

// ═══════════════════════════════════════════════════════════════
// EQUATION EVALUATION
// ═══════════════════════════════════════════════════════════════

/**
 * Evaluate an equation following Numerus rules:
 * - No parentheses allowed
 * - Division by zero is forbidden
 * - Order: √ first, then × and ÷ (left to right), then + and − (left to right)
 * 
 * @param {Array} cards - Ordered array of cards forming the equation
 * @returns {{ valid: boolean, result: number|null, error: string|null }}
 */
function evaluateEquation(cards) {
  if (!cards || cards.length === 0) {
    return { valid: false, result: null, error: 'Equação vazia' };
  }

  // Validate: must have at least one number card and one operation
  const numberCards = cards.filter(c => isNumberCard(c));
  const operationCards = cards.filter(c => c.type === 'operation');
  const specialCards = cards.filter(c => isSpecialCard(c));

  if (numberCards.length === 0) {
    return { valid: false, result: null, error: 'Sem cartas numéricas' };
  }

  // Build a mathematical expression string for evaluation
  // We'll process the cards in order, applying the correct precedence

  try {
    const tokens = [];
    for (const card of cards) {
      if (isNumberCard(card)) {
        tokens.push({ type: 'number', value: card.value });
      } else if (card.type === 'operation') {
        tokens.push({ type: 'operation', op: card.operation });
      } else if (isSpecialCard(card)) {
        if (card.operation === 'sqrt') {
          tokens.push({ type: 'sqrt' });
        } else if (card.operation === 'multiply') {
          tokens.push({ type: 'operation', op: 'multiply' });
        }
      }
    }

    // Apply precedence: √ → ×/÷ → +/−
    const result = evaluateWithPrecedence(tokens);
    
    if (result === Infinity || result === -Infinity) {
      return { valid: false, result: null, error: 'Divisão por zero' };
    }
    
    if (isNaN(result)) {
      return { valid: false, result: null, error: 'Expressão inválida' };
    }

    return { valid: true, result: Math.round(result * 10000) / 10000, error: null };
  } catch (e) {
    return { valid: false, result: null, error: e.message || 'Erro ao avaliar equação' };
  }
}

function evaluateWithPrecedence(tokens) {
  // Step 1: Apply √ (unary, highest precedence)
  let processed = [];
  let i = 0;
  while (i < tokens.length) {
    if (tokens[i].type === 'sqrt') {
      // √ applies to the next number
      if (i + 1 < tokens.length && tokens[i + 1].type === 'number') {
        processed.push({ type: 'number', value: Math.sqrt(tokens[i + 1].value) });
        i += 2;
      } else {
        throw new Error('Raiz quadrada sem número');
      }
    } else {
      processed.push(tokens[i]);
      i++;
    }
  }

  // Step 2: Apply × and ÷ (left to right)
  let processed2 = [];
  i = 0;
  while (i < processed.length) {
    if (processed[i].type === 'operation' && (processed[i].op === 'multiply' || processed[i].op === 'divide')) {
      const left = processed2.pop();
      const right = processed[i + 1];
      if (!left || !right || left.type !== 'number' || right.type !== 'number') {
        throw new Error('Operação mal formada');
      }
      let result;
      if (processed[i].op === 'multiply') {
        result = left.value * right.value;
      } else {
        if (right.value === 0) throw new Error('Divisão por zero');
        result = left.value / right.value;
      }
      processed2.push({ type: 'number', value: result });
      i += 2;
    } else {
      processed2.push(processed[i]);
      i++;
    }
  }

  // Step 3: Apply + and − (left to right)
  let result = 0;
  let lastOp = 'add';
  for (const token of processed2) {
    if (token.type === 'number') {
      if (lastOp === 'add') result += token.value;
      else if (lastOp === 'subtract') result -= token.value;
    } else if (token.type === 'operation') {
      lastOp = token.op;
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════
// GAME STATE CREATION
// ═══════════════════════════════════════════════════════════════

function createGameState(roomId, playerIds, settings = {}) {
  const deck = shuffleDeck(createDeck());
  
  const players = {};
  for (const playerId of playerIds) {
    players[playerId] = {
      id: playerId,
      name: `Jogador ${playerId.substring(0, 4)}`,
      chips: STARTING_CHIPS,
      hand: [],
      faceDown: [],
      operations: [],
      specials: [],
      equation: [],
      destiny: null,
      seal: null,
      bet: 0,
      totalBet: 0,
      folded: false,
      revealed: false,
      equationResult: null
    };
  }

  return {
    id: roomId,
    deck: deck,
    discardPile: [],
    players: players,
    playerOrder: [...playerIds],
    currentRound: 0,
    currentPhase: 'waiting', // waiting, playing, betting, equation, reveal, judgment, finished
    bettingRound: 0,
    pot: 0,
    roundBets: {},
    roundNumber: 1,
    maxRounds: settings.maxRounds || 10,
    timeLimit: settings.timeLimit || null, // minutes, null = no limit
    roundResults: [],
    started: false,
    finished: false,
    winner: null,
    log: []
  };
}

// ═══════════════════════════════════════════════════════════════
// ROUND ACTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Execute a game round action.
 * All validation happens here server-side.
 */
function executeRoundAction(gameState, playerId, action) {
  const player = gameState.players[playerId];
  if (!player) return { success: false, error: 'Jogador não encontrado' };
  if (gameState.finished) return { success: false, error: 'Jogo já terminou' };
  if (!gameState.started) return { success: false, error: 'Jogo não começou' };

  const round = gameState.currentRound;

  switch (round) {
    case 0: return handleDespertar(gameState, playerId, action);
    case 1: return handleChamadoDestino(gameState, playerId, action);
    case 2: return handleRevelacaoConhecimentos(gameState, playerId, action);
    case 3: return handleJulgamentoCoragem(gameState, playerId, action);
    case 4: return handleConhecimentoCresce(gameState, playerId, action);
    case 5: return handleConstrucaoEquacao(gameState, playerId, action);
    case 6: return handlePesoConviccao(gameState, playerId, action);
    case 7: return handleJuramento(gameState, playerId, action);
    case 8: return handleRevelacao(gameState, playerId, action);
    case 9: return handleGrandeJulgamento(gameState, playerId, action);
    default: return { success: false, error: 'Rodada inválida' };
  }
}

// ─── Round 0: O Despertar ───────────────────────────────────
function handleDespertar(gameState, playerId, action) {
  const player = gameState.players[playerId];
  if (player.operations.length > 0) {
    return { success: false, error: 'Já recebeu os conhecimentos fundamentais' };
  }

  // Deal +, −, ÷ to each player
  player.operations = [
    { id: uuidv4(), type: 'operation', operation: 'add', name: 'Soma (+)', symbol: '+' },
    { id: uuidv4(), type: 'operation', operation: 'subtract', name: 'Subtração (−)', symbol: '−' },
    { id: uuidv4(), type: 'operation', operation: 'divide', name: 'Divisão (÷)', symbol: '÷' }
  ];

  player.hand = [...player.operations];
  gameState.log.push({ round: 0, player: playerId, action: 'recebeu conhecimentos fundamentais' });

  return { success: true, message: 'Recebeu +, − e ÷' };
}

// ─── Round 1: O Chamado do Destino ──────────────────────────
function handleChamadoDestino(gameState, playerId, action) {
  const player = gameState.players[playerId];
  
  // First, handle the bet
  if (action.type === 'bet') {
    if (player.bet > 0) return { success: false, error: 'Já apostou nesta rodada' };
    if (action.amount < 0 || action.amount > player.chips) {
      return { success: false, error: 'Aposta inválida' };
    }
    player.bet = action.amount;
    player.chips -= action.amount;
    gameState.pot += action.amount;
    gameState.roundBets[playerId] = action.amount;
    return { success: true, message: `Apostou ${action.amount} fichas` };
  }

  // Then, deal a face-down card
  if (action.type === 'draw_face_down') {
    if (player.faceDown.length > 0) {
      return { success: false, error: 'Já recebeu carta fechada' };
    }
    
    let card = drawCard(gameState);
    if (!card) return { success: false, error: 'Baralho vazio' };

    // If it's √ or ×, reshuffle and redraw until we get a number
    let attempts = 0;
    while (isSpecialCard(card) && attempts < 50) {
      gameState.deck.push(card);
      gameState.deck = shuffleDeck(gameState.deck);
      card = drawCard(gameState);
      attempts++;
    }

    if (isSpecialCard(card)) {
      return { success: false, error: 'Não há cartas numéricas disponíveis' };
    }

    player.faceDown = [card];
    player.hand.push(card);
    gameState.log.push({ round: 1, player: playerId, action: 'recebeu carta fechada' });

    return { success: true, message: 'Recebeu carta fechada', card };
  }

  return { success: false, error: 'Ação inválida para esta rodada' };
}

// ─── Round 2: A Revelação dos Conhecimentos ─────────────────
function handleRevelacaoConhecimentos(gameState, playerId, action) {
  const player = gameState.players[playerId];

  if (action.type === 'draw_face_up') {
    if (player.faceDown.length === 0) {
      return { success: false, error: 'Primeiro deve completar a rodada anterior' };
    }

    // Draw 2 face-up cards
    const drawnCards = [];
    for (let i = 0; i < 2; i++) {
      const card = drawCard(gameState);
      if (!card) return { success: false, error: 'Baralho vazio' };
      drawnCards.push(card);

      if (card.operation === 'sqrt') {
        // √: keep it, receive one extra card
        player.specials.push(card);
        player.hand.push(card);
        const extraCard = drawCard(gameState);
        if (extraCard && isNumberCard(extraCard)) {
          player.hand.push(extraCard);
          drawnCards.push(extraCard);
        }
      } else if (card.operation === 'multiply') {
        // ×: discard one basic operation, keep ×, receive one numbered card
        if (player.operations.length > 0) {
          const discarded = player.operations.pop();
          player.hand = player.hand.filter(c => c.id !== discarded.id);
          gameState.discardPile.push(discarded);
        }
        player.specials.push(card);
        player.hand.push(card);
        const extraCard = drawCard(gameState);
        if (extraCard && isNumberCard(extraCard)) {
          player.hand.push(extraCard);
          drawnCards.push(extraCard);
        }
      } else {
        player.hand.push(card);
      }
    }

    gameState.log.push({ round: 2, player: playerId, action: `recebeu ${drawnCards.length} cartas` });
    return { success: true, message: 'Recebeu cartas abertas', cards: drawnCards };
  }

  return { success: false, error: 'Ação inválida' };
}

// ─── Round 3: O Julgamento da Coragem ───────────────────────
function handleJulgamentoCoragem(gameState, playerId, action) {
  const player = gameState.players[playerId];

  if (action.type === 'bet') {
    if (player.folded) return { success: false, error: 'Já desistiu' };
    if (action.amount < 0 || action.amount > player.chips) {
      return { success: false, error: 'Aposta inválida' };
    }
    player.bet += action.amount;
    player.chips -= action.amount;
    gameState.pot += action.amount;
    gameState.roundBets[playerId] = (gameState.roundBets[playerId] || 0) + action.amount;
    player.hasBetThisRound = true;
    return { success: true, message: `Apostou mais ${action.amount} fichas` };
  }

  if (action.type === 'fold') {
    player.folded = true;
    player.hasBetThisRound = true;
    return { success: true, message: 'Desistiu da rodada' };
  }

  if (action.type === 'check') {
    player.hasBetThisRound = true;
    return { success: true, message: 'Passou a vez' };
  }

  return { success: false, error: 'Ação inválida' };
}

// ─── Round 4: O Conhecimento Cresce ─────────────────────────
function handleConhecimentoCresce(gameState, playerId, action) {
  const player = gameState.players[playerId];

  if (action.type === 'draw_face_up') {
    const card = drawCard(gameState);
    if (!card) return { success: false, error: 'Baralho vazio' };

    if (card.operation === 'sqrt') {
      player.specials.push(card);
      player.hand.push(card);
      // Extra card for √
      const extra = drawCard(gameState);
      if (extra && isNumberCard(extra)) {
        player.hand.push(extra);
      }
    } else if (card.operation === 'multiply') {
      // Discard one operation, keep ×, get a number
      if (player.operations.length > 0) {
        const discarded = player.operations.pop();
        player.hand = player.hand.filter(c => c.id !== discarded.id);
        gameState.discardPile.push(discarded);
      }
      player.specials.push(card);
      player.hand.push(card);
      const extra = drawCard(gameState);
      if (extra && isNumberCard(extra)) {
        player.hand.push(extra);
      }
    } else {
      player.hand.push(card);
    }

    gameState.log.push({ round: 4, player: playerId, action: 'recebeu carta aberta' });
    return { success: true, message: 'Recebeu carta aberta', card };
  }

  return { success: false, error: 'Ação inválida' };
}

// ─── Round 5: A Construção da Equação ───────────────────────
function handleConstrucaoEquacao(gameState, playerId, action) {
  const player = gameState.players[playerId];

  if (action.type === 'submit_equation') {
    if (!action.equation || !Array.isArray(action.equation)) {
      return { success: false, error: 'Equação inválida' };
    }

    // Validate: must use ALL number cards, ALL operations, ALL specials
    const numberCardsInHand = player.hand.filter(c => isNumberCard(c));
    const operationCardsInHand = player.operations.filter(c => c.type === 'operation');
    const specialCardsInHand = player.specials;

    const numberCardsInEq = action.equation.filter(c => isNumberCard(c));
    const operationCardsInEq = action.equation.filter(c => c.type === 'operation');
    const specialCardsInEq = action.equation.filter(c => isSpecialCard(c));

    // Check all number cards are used
    if (numberCardsInEq.length !== numberCardsInHand.length) {
      return { success: false, error: 'Deve usar TODAS as cartas numéricas' };
    }

    // Check all operations are used
    if (operationCardsInEq.length !== operationCardsInHand.length) {
      return { success: false, error: 'Deve usar TODAS as operações' };
    }

    // Check all special cards are used
    if (specialCardsInEq.length !== specialCardsInHand.length) {
      return { success: false, error: 'Deve usar TODAS as cartas especiais' };
    }

    // Evaluate the equation
    const evaluation = evaluateEquation(action.equation);
    if (!evaluation.valid) {
      return { success: false, error: evaluation.error };
    }

    player.equation = action.equation;
    player.equationResult = evaluation.result;
    gameState.log.push({ round: 5, player: playerId, action: `equação = ${evaluation.result}` });

    return { success: true, message: `Equação = ${evaluation.result}`, result: evaluation.result };
  }

  return { success: false, error: 'Ação inválida' };
}

// ─── Round 6: O Peso da Convicção ───────────────────────────
function handlePesoConviccao(gameState, playerId, action) {
  return handleJulgamentoCoragem(gameState, playerId, action);
}

// ─── Round 7: O Juramento ───────────────────────────────────
function handleJuramento(gameState, playerId, action) {
  const player = gameState.players[playerId];

  if (action.type === 'choose_destiny') {
    if (!Object.values(DESTINIES).includes(action.destiny)) {
      return { success: false, error: 'Destino inválido' };
    }
    player.destiny = action.destiny;
    player.seal = action.destiny === DESTINIES.SIMPLICITY ? 'I' : 
                  action.destiny === DESTINIES.GREATNESS ? 'XX' : 'I+XX';
    gameState.log.push({ round: 7, player: playerId, action: `escolheu ${action.destiny}` });
    return { success: true, message: `Escolheu ${player.seal}` };
  }

  return { success: false, error: 'Ação inválida' };
}

// ─── Round 8: A Revelação ───────────────────────────────────
function handleRevelacao(gameState, playerId, action) {
  const player = gameState.players[playerId];

  if (action.type === 'reveal') {
    if (player.revealed) return { success: false, error: 'Já revelou' };
    player.revealed = true;
    gameState.log.push({ round: 8, player: playerId, action: 'revelou selo e equação' });
    return { success: true, message: 'Revelou sua equação' };
  }

  return { success: false, error: 'Ação inválida' };
}

// ─── Round 9: O Grande Julgamento ───────────────────────────
function handleGrandeJulgamento(gameState, playerId, action) {
  // This round is automatic - compare results
  return { success: true, message: 'Julgamento automático' };
}

// ═══════════════════════════════════════════════════════════════
// ROUND PROGRESSION
// ═══════════════════════════════════════════════════════════════

function drawCard(gameState) {
  if (gameState.deck.length === 0) return null;
  return gameState.deck.pop();
}

function checkRoundComplete(gameState) {
  const players = Object.values(gameState.players);
  const activePlayers = players.filter(p => !p.folded);
  
  switch (gameState.currentRound) {
    case 0: // Despertar
      return activePlayers.every(p => p.operations.length > 0);
    case 1: // Chamado do Destino
      return activePlayers.every(p => p.faceDown.length > 0);
    case 2: // Revelação
      return activePlayers.every(p => p.hand.length >= 5); // 3 ops + 2 drawn
    case 3: // Julgamento (betting)
    case 6: // Peso da Convicção (betting)
      return activePlayers.every(p => p.hasBetThisRound);
    case 4: // Conhecimento Cresce
      return activePlayers.every(p => p.hand.length >= 7);
    case 5: // Construção da Equação
      return activePlayers.every(p => p.equation.length > 0);
    case 7: // Juramento
      return activePlayers.every(p => p.destiny !== null);
    case 8: // Revelação
      return activePlayers.every(p => p.revealed);
    case 9: // Grande Julgamento
      return true; // Auto
    default:
      return false;
  }
}

function advanceRound(gameState) {
  if (gameState.currentRound < 9) {
    gameState.currentRound++;
    gameState.log.push({ round: gameState.currentRound, action: `=== ${ROUNDS[gameState.currentRound]} ===` });
    
    // Reset per-round state
    for (const player of Object.values(gameState.players)) {
      player.bet = 0;
      player.folded = false;
      player.hasBetThisRound = false;
    }
    gameState.roundBets = {};
    
    return true;
  } else {
    // Game over - calculate final results
    calculateFinalResults(gameState);
    gameState.finished = true;
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// FINAL RESULTS
// ═══════════════════════════════════════════════════════════════

function calculateFinalResults(gameState) {
  const players = Object.values(gameState.players);
  
  // Group players by destiny
  const simplicityPlayers = players.filter(p => p.destiny === DESTINIES.SIMPLICITY || p.destiny === DESTINIES.DOUBLE);
  const greatnessPlayers = players.filter(p => p.destiny === DESTINIES.GREATNESS || p.destiny === DESTINIES.DOUBLE);
  
  // Find closest to target for each group
  let simplicityWinner = null;
  let simplicityDistance = Infinity;
  for (const p of simplicityPlayers) {
    if (p.equationResult !== null) {
      const dist = Math.abs(p.equationResult - 1);
      if (dist < simplicityDistance) {
        simplicityDistance = dist;
        simplicityWinner = p;
      }
    }
  }
  
  let greatnessWinner = null;
  let greatnessDistance = Infinity;
  for (const p of greatnessPlayers) {
    if (p.equationResult !== null) {
      const dist = Math.abs(p.equationResult - 20);
      if (dist < greatnessDistance) {
        greatnessDistance = dist;
        greatnessWinner = p;
      }
    }
  }

  // Award chips
  if (simplicityWinner && simplicityDistance < Infinity) {
    const prize = Math.ceil(gameState.pot / 2);
    simplicityWinner.chips += prize;
    gameState.log.push({ action: `${simplicityWinner.id} venceu Simplicidade com distância ${simplicityDistance.toFixed(2)}` });
  }
  
  if (greatnessWinner && greatnessDistance < Infinity) {
    const prize = Math.ceil(gameState.pot / 2);
    greatnessWinner.chips += prize;
    gameState.log.push({ action: `${greatnessWinner.id} venceu Grandeza com distância ${greatnessDistance.toFixed(2)}` });
  }

  // Determine overall winner
  const sortedPlayers = [...players].sort((a, b) => b.chips - a.chips);
  gameState.winner = sortedPlayers[0].id;
  
  gameState.results = {
    simplicityWinner: simplicityWinner?.id,
    simplicityDistance,
    greatnessWinner: greatnessWinner?.id,
    greatnessDistance,
    rankings: sortedPlayers.map((p, i) => ({
      id: p.id,
      name: p.name,
      chips: p.chips,
      destiny: p.destiny,
      equationResult: p.equationResult,
      position: i + 1
    }))
  };
}

// ═══════════════════════════════════════════════════════════════
// GAME START
// ═══════════════════════════════════════════════════════════════

function startGame(gameState) {
  if (gameState.started) return false;
  if (Object.keys(gameState.players).length < 2) return false;
  
  gameState.started = true;
  gameState.currentRound = 0;
  gameState.log.push({ action: '=== O Despertar ===' });
  
  return true;
}

module.exports = {
  createDeck,
  shuffleDeck,
  createGameState,
  executeRoundAction,
  checkRoundComplete,
  advanceRound,
  startGame,
  evaluateEquation,
  ROUNDS,
  DESTINIES,
  STARTING_CHIPS,
  isNumberCard,
  isSpecialCard,
  isOperationCard
};
