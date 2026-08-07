/**
 * NUMERUS - Local CPU Game Engine
 * Runs the entire game client-side against AI opponents
 */

import { v4 as uuidv4 } from 'uuid';

const SCHOOLS = ['ouro', 'prata', 'bronze', 'terra'];
const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const STARTING_CHIPS = 20;

const CPU_NAMES = {
  aprendiz: ['Papiro', 'Tinta', 'Esboco', 'Pergaminho'],
  estrategista: ['Espada', 'Escudo', 'Lamina', 'Couracado'],
  mestre: ['Algoritmo', 'Teorema', 'Integral', 'Derivada'],
  arquimestre: ['Coroa', 'Cetro', 'Trono', 'Imperio'],
  magno: ['Morgana', 'Merlin', 'Gandalf', 'Dumbledor']
};

function createDeck() {
  const deck = [];
  for (const school of SCHOOLS) {
    for (const number of NUMBERS) {
      deck.push({
        id: uuidv4(),
        type: 'number',
        value: number,
        school,
        name: `${number} de ${school.charAt(0).toUpperCase() + school.slice(1)}`
      });
    }
  }
  for (let i = 0; i < 4; i++) {
    deck.push({ id: uuidv4(), type: 'special', operation: 'sqrt', name: 'Raiz Quadrada (√)' });
    deck.push({ id: uuidv4(), type: 'special', operation: 'multiply', name: 'Multiplicação (×)' });
  }
  return deck;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function evaluateEquation(cards) {
  try {
    const tokens = [];
    for (const card of cards) {
      if (card.type === 'number') tokens.push({ type: 'number', value: card.value });
      else if (card.type === 'operation') tokens.push({ type: 'operation', op: card.operation });
      else if (card.type === 'special') {
        if (card.operation === 'sqrt') tokens.push({ type: 'sqrt' });
        else if (card.operation === 'multiply') tokens.push({ type: 'operation', op: 'multiply' });
      }
    }

    // Apply sqrt
    let processed = [];
    let i = 0;
    while (i < tokens.length) {
      if (tokens[i].type === 'sqrt' && i + 1 < tokens.length && tokens[i + 1].type === 'number') {
        processed.push({ type: 'number', value: Math.sqrt(tokens[i + 1].value) });
        i += 2;
      } else {
        processed.push(tokens[i]);
        i++;
      }
    }

    // Apply × and ÷
    let processed2 = [];
    i = 0;
    while (i < processed.length) {
      if (processed[i].type === 'operation' && (processed[i].op === 'multiply' || processed[i].op === 'divide')) {
        const left = processed2.pop();
        const right = processed[i + 1];
        if (!left || !right || right.value === 0) return null;
        const result = processed[i].op === 'multiply' ? left.value * right.value : left.value / right.value;
        processed2.push({ type: 'number', value: result });
        i += 2;
      } else {
        processed2.push(processed[i]);
        i++;
      }
    }

    // Apply + and −
    let result = 0;
    let lastOp = 'add';
    for (const token of processed2) {
      if (token.type === 'number') {
        result = lastOp === 'add' ? result + token.value : lastOp === 'subtract' ? result - token.value : result;
      } else if (token.type === 'operation') {
        lastOp = token.op;
      }
    }

    return isFinite(result) ? Math.round(result * 10000) / 10000 : null;
  } catch {
    return null;
  }
}

/**
 * Build a structurally valid equation (number-op-number alternating),
 * then refine it by trying multiple shuffles within a valid structure.
 */
function buildValidEquation(numbers, ops, specials) {
  // Place sqrt cards immediately before a number (highest precedence)
  const sqrtCards = specials.filter(s => s.operation === 'sqrt');
  const multCards = specials.filter(s => s.operation === 'multiply');
  const restSpecials = specials.filter(s => s.operation !== 'sqrt' && s.operation !== 'multiply');

  // Slot order: [number, op, number, op, ...] starting with a number
  const equation = [];
  const slotCount = numbers.length + ops.length + specials.length;
  const nums = shuffle([...numbers]);
  const basicOps = shuffle([...ops]);

  // Build a token template: start with a number, then alternate number/op
  let numIdx = 0, opIdx = 0;
  let pendingSqrt = 0;
  let lastWasNumber = false;

  // Convert special multiply to an operation in the op pool
  const allOps = [...basicOps, ...multCards.map(m => ({ ...m, type: 'operation', operation: 'multiply' }))];
  // Track sqrt cards for placement before numbers
  const sqrtQueue = [...sqrtCards];

  for (let i = 0; i < slotCount && numIdx < nums.length; i++) {
    if (!lastWasNumber) {
      // Place a number (with optional sqrt prefix)
      if (sqrtQueue.length > 0 && numIdx < nums.length) {
        equation.push(sqrtQueue.shift());
        equation.push(nums[numIdx++]);
        lastWasNumber = true;
      } else {
        equation.push(nums[numIdx++]);
        lastWasNumber = true;
      }
    } else {
      // Place an operation between numbers
      if (allOps.length > 0) {
        equation.push(allOps.pop());
        lastWasNumber = false;
      } else if (numIdx < nums.length) {
        equation.push(nums[numIdx++]);
      }
    }
  }

  // Append any remaining specials (should be none in normal play)
  for (const s of [...restSpecials, ...sqrtQueue]) {
    equation.push(s);
  }

  return equation;
}

/**
 * CPU AI - makes decisions based on difficulty
 */
function cpuDecide(destiny, hand, difficulty) {
  const numbers = hand.filter(c => c.type === 'number');
  const ops = hand.filter(c => c.type === 'operation');
  const specials = hand.filter(c => c.type === 'special');
  const target = destiny === 'simplicidade' ? 1 : 20;

  // Base valid equation structure
  let equation = buildValidEquation(numbers, ops, specials);
  let bestDistance = Infinity;
  let bestResult = evaluateEquation(equation);
  if (bestResult !== null) bestDistance = Math.abs(bestResult - target);

  // Try many structured permutations for higher difficulties
  const attempts = difficulty === 'magno' ? 300 :
                   difficulty === 'arquimestre' ? 150 :
                   difficulty === 'mestre' ? 80 :
                   difficulty === 'estrategista' ? 30 : 8;

  for (let i = 0; i < attempts; i++) {
    const candidate = buildValidEquation(numbers, ops, specials);
    const result = evaluateEquation(candidate);
    if (result !== null) {
      const dist = Math.abs(result - target);
      if (dist < bestDistance) {
        bestDistance = dist;
        equation = candidate;
      }
    }
  }

  return equation;
}

/**
 * Main game engine
 */
export class CPUGameEngine {
  constructor(playerCount = 2, difficulty = 'estrategista') {
    this.playerCount = Math.min(playerCount, 6);
    this.difficulty = difficulty;
    this.humanPlayerId = 'human-player';
    this.cpuPlayers = [];
    this.gameState = null;
    this.onStateChange = null;
    this.cpuThinkingTime = difficulty === 'magno' ? 2000 : 
                           difficulty === 'arquimestre' ? 1500 :
                           difficulty === 'mestre' ? 1200 :
                           difficulty === 'estrategista' ? 800 : 500;
  }

  start() {
    const deck = shuffle(createDeck());
    const playerIds = [this.humanPlayerId];
    
    // Create CPU players
    const names = CPU_NAMES[this.difficulty] || CPU_NAMES.estrategista;
    for (let i = 1; i < this.playerCount; i++) {
      const cpuId = `cpu-${i}`;
      playerIds.push(cpuId);
      this.cpuPlayers.push({
        id: cpuId,
        name: names[(i - 1) % names.length],
        difficulty: this.difficulty,
        isCPU: true
      });
    }

    // Initialize game state
    this.gameState = {
      deck,
      discardPile: [],
      players: {},
      playerOrder: playerIds,
      currentRound: 0,
      pot: 0,
      roundBets: {},
      started: true,
      finished: false,
      winner: null,
      log: [],
      currentTurn: this.humanPlayerId,
      awaitingAction: true,
      cpuThinking: false
    };

    // Initialize players
    for (const id of playerIds) {
      this.gameState.players[id] = {
        id,
        name: id === this.humanPlayerId ? 'Você' : this.cpuPlayers.find(p => p.id === id)?.name || id,
        chips: STARTING_CHIPS,
        hand: [],
        faceDown: [],
        operations: [],
        specials: [],
        equation: [],
        destiny: null,
        seal: null,
        bet: 0,
        folded: false,
        revealed: false,
        equationResult: null,
        isCPU: id !== this.humanPlayerId
      };
    }

    this.gameState.log.push({ action: '=== O Despertar ===', round: 0 });
    this.notifyStateChange();
    return this.gameState;
  }

  notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange(this.getPublicState());
    }
  }

  getPublicState() {
    if (!this.gameState) return null;
    const me = this.gameState.players[this.humanPlayerId] || {};
    return {
      ...this.gameState,
      myId: this.humanPlayerId,
      myHand: me.hand || [],
      myOperations: me.operations || [],
      mySpecials: me.specials || [],
      myFaceDown: me.faceDown || [],
      myChips: me.chips || 0,
      myBet: me.bet || 0,
      myDestiny: me.destiny || null,
      myEquationResult: me.equationResult ?? null,
      myRevealed: me.revealed || false,
      players: Object.fromEntries(
        Object.entries(this.gameState.players).map(([id, p]) => [
          id,
          {
            id: p.id,
            name: p.name,
            chips: p.chips,
            handCount: p.hand.length,
            bet: p.bet,
            folded: p.folded,
            revealed: p.revealed,
            destiny: p.destiny,
            equationResult: p.revealed ? p.equationResult : null,
            isCPU: p.isCPU
          }
        ])
      )
    };
  }

  /**
   * Process human player action
   */
  async processHumanAction(action) {
    const player = this.gameState.players[this.humanPlayerId];
    const round = this.gameState.currentRound;

    if (!this.gameState.finished) {
      switch (round) {
        case 0: // Despertar
          if (action.type === 'deal_operations') {
            this.dealOperations(this.humanPlayerId);
          }
          break;

        case 1: // Chamado do Destino
          if (action.type === 'bet') {
            this.placeBet(this.humanPlayerId, action.amount);
          } else if (action.type === 'draw_face_down') {
            this.drawFaceDown(this.humanPlayerId);
          }
          break;

        case 2: // Revelação
          if (action.type === 'draw_face_up') {
            this.drawFaceUp(this.humanPlayerId);
          }
          break;

        case 3: // Julgamento da Coragem
        case 6: // Peso da Convicção
          if (action.type === 'bet') {
            this.placeBet(this.humanPlayerId, action.amount);
          } else if (action.type === 'fold') {
            player.folded = true;
            player.hasBetThisRound = true;
          } else if (action.type === 'check') {
            player.hasBetThisRound = true;
          }
          break;

        case 4: // Conhecimento Cresce
          if (action.type === 'draw_face_up') {
            this.drawFaceUp(this.humanPlayerId);
          }
          break;

        case 5: // Construção da Equação
          if (action.type === 'submit_equation') {
            this.submitEquation(this.humanPlayerId, action.equation);
          }
          break;

        case 7: // Juramento
          if (action.type === 'choose_destiny') {
            this.chooseDestiny(this.humanPlayerId, action.destiny);
          }
          break;

        case 8: // Revelação
          if (action.type === 'reveal') {
            this.revealPlayer(this.humanPlayerId);
          }
          break;
      }

      // Let CPUs act in the current round
      await this.processCPUTurns();

      // Advance rounds (chained, so auto-rounds like betting and judgment complete)
      this.advanceChained();
    }

    this.notifyStateChange();
  }

  /**
   * Advance the round as many times as possible without needing human input.
   */
  advanceChained() {
    let guard = 0;
    while (!this.gameState.finished && guard < 10) {
      const progressed = this.checkAndAdvance();
      if (!progressed) break;
      guard++;
    }
  }

  /**
   * Have all CPUs act in the current round.
   */
  async processCPUTurns() {
    const round = this.gameState.currentRound;
    const cpusToAct = this.gameState.playerOrder
      .filter(id => id !== this.humanPlayerId)
      .filter(id => !this.gameState.players[id].folded);

    if (cpusToAct.length === 0) return;

    this.gameState.cpuThinking = true;
    this.notifyStateChange();

    for (const cpuId of cpusToAct) {
      const cpu = this.gameState.players[cpuId];
      await new Promise(r => setTimeout(r, this.cpuThinkingTime));

      switch (round) {
        case 0:
          this.dealOperations(cpuId);
          break;
        case 1:
          this.drawFaceDown(cpuId);
          this.placeBet(cpuId, Math.floor(cpu.chips * 0.1));
          break;
        case 2:
          this.drawFaceUp(cpuId);
          break;
        case 3:
        case 6:
          if (cpu.chips > 3 && Math.random() > 0.3) {
            this.placeBet(cpuId, Math.floor(cpu.chips * 0.15));
          } else {
            cpu.hasBetThisRound = true;
          }
          break;
        case 4:
          this.drawFaceUp(cpuId);
          break;
        case 5:
          // CPU pre-selects its target destiny from its hand, then builds toward it
          cpu.pendingDestiny = this.pickCPUDestiny(cpu);
          const equation = cpuDecide(cpu.pendingDestiny, cpu.hand, this.difficulty);
          this.submitEquation(cpuId, equation);
          break;
        case 7:
          const destiny = cpu.pendingDestiny || this.pickCPUDestiny(cpu);
          this.chooseDestiny(cpuId, destiny);
          break;
        case 8:
          this.revealPlayer(cpuId);
          break;
      }
    }

    this.gameState.cpuThinking = false;
  }

  /**
   * CPU picks a destiny based on its hand values.
   */
  pickCPUDestiny(cpu) {
    const numbers = cpu.hand.filter(c => c.type === 'number');
    const hasSqrt = cpu.hand.some(c => c.type === 'special' && c.operation === 'sqrt');
    const hasMultiply = cpu.hand.some(c => c.type === 'special' && c.operation === 'multiply');
    const sum = numbers.reduce((s, c) => s + c.value, 0);
    const avg = numbers.length ? sum / numbers.length : 5;
    const hasHigh = numbers.some(c => c.value >= 7);
    const hasLow = numbers.some(c => c.value <= 3);

    // Higher difficulties make smarter choices
    const smart = this.difficulty === 'magno' || this.difficulty === 'arquimestre' || this.difficulty === 'mestre';
    if (!smart) return Math.random() > 0.5 ? 'simplicidade' : 'grandeza';

    if (hasSqrt && hasLow) return 'simplicidade';
    if (hasHigh && !hasLow) return 'grandeza';
    return avg <= 5 ? 'simplicidade' : 'grandeza';
  }

  dealOperations(playerId) {
    const player = this.gameState.players[playerId];
    if (player.operations.length > 0) return;

    player.operations = [
      { id: uuidv4(), type: 'operation', operation: 'add', name: 'Soma (+)', symbol: '+' },
      { id: uuidv4(), type: 'operation', operation: 'subtract', name: 'Subtração (−)', symbol: '−' },
      { id: uuidv4(), type: 'operation', operation: 'divide', name: 'Divisão (÷)', symbol: '÷' }
    ];
    player.hand = [...player.operations];
    this.gameState.log.push({ round: 0, player: playerId, action: `${player.name} recebeu conhecimentos fundamentais` });
  }

  drawFaceDown(playerId) {
    const player = this.gameState.players[playerId];
    if (player.faceDown.length > 0) return;

    let card = this.gameState.deck.pop();
    let attempts = 0;
    while (card && card.type === 'special' && attempts < 50) {
      this.gameState.deck.unshift(card);
      card = this.gameState.deck.pop();
      attempts++;
    }

    if (card && card.type !== 'special') {
      player.faceDown = [card];
      player.hand.push(card);
    }
  }

  drawFaceUp(playerId) {
    const player = this.gameState.players[playerId];
    const drawnCards = [];

    for (let i = 0; i < 2; i++) {
      const card = this.gameState.deck.pop();
      if (!card) break;
      drawnCards.push(card);

      if (card.operation === 'sqrt') {
        player.specials.push(card);
        player.hand.push(card);
        const extra = this.gameState.deck.pop();
        if (extra && extra.type === 'number') {
          player.hand.push(extra);
          drawnCards.push(extra);
        }
      } else if (card.operation === 'multiply') {
        if (player.operations.length > 0) {
          const discarded = player.operations.pop();
          player.hand = player.hand.filter(c => c.id !== discarded.id);
          this.gameState.discardPile.push(discarded);
        }
        player.specials.push(card);
        player.hand.push(card);
        const extra = this.gameState.deck.pop();
        if (extra && extra.type === 'number') {
          player.hand.push(extra);
          drawnCards.push(extra);
        }
      } else {
        player.hand.push(card);
      }
    }
  }

  placeBet(playerId, amount) {
    const player = this.gameState.players[playerId];
    if (amount > player.chips) amount = player.chips;
    if (amount < 0) amount = 0;
    
    player.bet += amount;
    player.chips -= amount;
    this.gameState.pot += amount;
    player.hasBetThisRound = true;
  }

  submitEquation(playerId, equation) {
    const player = this.gameState.players[playerId];
    const result = evaluateEquation(equation);
    player.equation = equation;
    player.equationResult = result;
    this.gameState.log.push({ round: 5, player: playerId, action: `${player.name} construiu equação = ${result}` });
  }

  chooseDestiny(playerId, destiny) {
    const player = this.gameState.players[playerId];
    player.destiny = destiny;
    player.seal = destiny === 'simplicidade' ? 'I' : destiny === 'grandeza' ? 'XX' : 'I+XX';
  }

  revealPlayer(playerId) {
    const player = this.gameState.players[playerId];
    player.revealed = true;
    this.gameState.log.push({ round: 8, player: playerId, action: `${player.name} revelou equação = ${player.equationResult}` });
  }

  checkAndAdvance() {
    const players = Object.values(this.gameState.players);
    const activePlayers = players.filter(p => !p.folded);
    let complete = false;

    switch (this.gameState.currentRound) {
      case 0:
        complete = activePlayers.every(p => p.operations.length > 0);
        break;
      case 1:
        complete = activePlayers.every(p => p.faceDown.length > 0);
        break;
      case 2:
        complete = activePlayers.every(p => p.hand.length >= 5);
        break;
      case 3:
      case 6:
        complete = activePlayers.every(p => p.hasBetThisRound);
        break;
      case 4:
        complete = activePlayers.every(p => p.hand.length >= 7);
        break;
      case 5:
        complete = activePlayers.every(p => p.equation.length > 0);
        break;
      case 7:
        complete = activePlayers.every(p => p.destiny !== null);
        break;
      case 8:
        complete = activePlayers.every(p => p.revealed);
        break;
      case 9:
        this.calculateResults();
        return false;
    }

    if (complete) {
      if (this.gameState.currentRound < 9) {
        this.gameState.currentRound++;
        this.gameState.log.push({ round: this.gameState.currentRound, action: `=== Rodada ${this.gameState.currentRound + 1} ===` });
        for (const p of Object.values(this.gameState.players)) {
          p.bet = 0;
          p.hasBetThisRound = false;
        }
        return true;
      } else {
        this.calculateResults();
      }
    }
    return false;
  }

  calculateResults() {
    const players = Object.values(this.gameState.players);
    
    const simplicityPlayers = players.filter(p => p.destiny === 'simplicidade' || p.destiny === 'duplo_juramento');
    const greatnessPlayers = players.filter(p => p.destiny === 'grandeza' || p.destiny === 'duplo_juramento');

    let simplicityWinner = null, simplicityDist = Infinity;
    for (const p of simplicityPlayers) {
      if (p.equationResult !== null) {
        const dist = Math.abs(p.equationResult - 1);
        if (dist < simplicityDist) {
          simplicityDist = dist;
          simplicityWinner = p;
        }
      }
    }

    let greatnessWinner = null, greatnessDist = Infinity;
    for (const p of greatnessPlayers) {
      if (p.equationResult !== null) {
        const dist = Math.abs(p.equationResult - 20);
        if (dist < greatnessDist) {
          greatnessDist = dist;
          greatnessWinner = p;
        }
      }
    }

    if (simplicityWinner) simplicityWinner.chips += Math.ceil(this.gameState.pot / 2);
    if (greatnessWinner) greatnessWinner.chips += Math.ceil(this.gameState.pot / 2);

    const sorted = [...players].sort((a, b) => b.chips - a.chips);
    this.gameState.winner = sorted[0].id;
    this.gameState.finished = true;

    this.gameState.results = {
      simplicityWinner: simplicityWinner?.id,
      simplicityDistance: simplicityDist,
      greatnessWinner: greatnessWinner?.id,
      greatnessDistance: greatnessDist,
      rankings: sorted.map((p, i) => ({
        id: p.id,
        name: p.name,
        chips: p.chips,
        destiny: p.destiny,
        equationResult: p.equationResult,
        position: i + 1,
        isCPU: p.isCPU
      }))
    };

    this.gameState.log.push({ action: '=== O Grande Julgamento ===' });
    this.notifyStateChange();
  }

  getResults() {
    return this.gameState?.results || null;
  }
}

export { createDeck, shuffle, evaluateEquation };
