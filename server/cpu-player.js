/**
 * NUMERUS - CPU Player AI System
 * 
 * Difficulty Levels:
 * 1. Aprendiz (Apprentice) - Random choices, beginner-friendly
 * 2. Estrategista (Strategist) - Basic strategy, targets closest to destiny
 * 3. Mestre dos Números (Number Master) - Advanced strategy, considers math
 * 4. Arquimestre (Archimagister) - Expert play, optimal equation building
 * 5. O Magno (The Magnificent) - Near-perfect play with slight randomness
 */

const DIFFICULTY = {
  APPRENTICE: 'aprendiz',
  STRATEGIST: 'estrategista',
  MASTER: 'mestre',
  ARCHIMAGISTER: 'arquimestre',
  MAGNO: 'magno'
};

const DIFFICULTY_NAMES = {
  [DIFFICULTY.APPRENTICE]: { name: 'Aprendiz', icon: '📜', stars: '★', desc: 'Curioso e imprevisível' },
  [DIFFICULTY.STRATEGIST]: { name: 'Estrategista', icon: '⚔️', stars: '★★', desc: 'Calcula seus movimentos' },
  [DIFFICULTY.MASTER]: { name: 'Mestre dos Números', icon: '🔢', stars: '★★★', desc: 'Domina a matemática' },
  [DIFFICULTY.ARCHIMAGISTER]: { name: 'Arquimestre', icon: '👑', stars: '★★★★', desc: 'Quase imbatível' },
  [DIFFICULTY.MAGNO]: { name: 'O Magno', icon: '🧙', stars: '★★★★★', desc: 'Lenda viva de Numerus' }
};

/**
 * CPU Player class that makes decisions based on difficulty
 */
class CPUPlayer {
  constructor(id, name, difficulty = DIFFICULTY.STRATEGIST) {
    this.id = id;
    this.name = name;
    this.difficulty = difficulty;
    this.personality = this.generatePersonality();
  }

  generatePersonality() {
    // Each CPU has slight personality quirks
    return {
      aggression: 0.3 + Math.random() * 0.4, // How much they bet
      riskTolerance: 0.2 + Math.random() * 0.5, // Willingness to go for difficult equations
      patience: 0.3 + Math.random() * 0.6 // How long they'll stay in hands
    };
  }

  /**
   * Decide which destiny to pursue
   */
  decideDestiny(hand, equationResult) {
    const numberCards = hand.filter(c => c.type === 'number');
    const avgValue = numberCards.reduce((sum, c) => sum + c.value, 0) / (numberCards.length || 1);
    
    switch (this.difficulty) {
      case DIFFICULTY.APPRENTICE:
        return Math.random() > 0.5 ? 'simplicidade' : 'grandeza';
      
      case DIFFICULTY.STRATEGIST:
        // Basic strategy: pick based on card values
        return avgValue <= 5 ? 'simplicidade' : 'grandeza';
      
      case DIFFICULTY.MASTER:
        // Consider which destiny gives better odds
        if (equationResult !== null) {
          const distToOne = Math.abs(equationResult - 1);
          const distToTwenty = Math.abs(equationResult - 20);
          if (distToOne < distToTwenty * 0.8) return 'simplicidade';
          if (distToTwenty < distToOne * 0.8) return 'grandeza';
        }
        return avgValue <= 5 ? 'simplicidade' : 'grandeza';
      
      case DIFFICULTY.ARCHIMAGISTER:
        // Optimal: pick the destiny with mathematically best chance
        return this.calculateOptimalDestiny(hand);
      
      case DIFFICULTY.MAGNO:
        // Near-perfect with occasional surprise
        if (Math.random() < 0.05) return 'duplo_juramento'; // 5% chance of bold move
        return this.calculateOptimalDestiny(hand);
      
      default:
        return 'simplicidade';
    }
  }

  calculateOptimalDestiny(hand) {
    const numberCards = hand.filter(c => c.type === 'number');
    const sum = numberCards.reduce((s, c) => s + c.value, 0);
    const hasHighCards = numberCards.some(c => c.value >= 7);
    const hasLowCards = numberCards.some(c => c.value <= 3);
    const hasOperations = hand.some(c => c.type === 'operation');
    const hasSqrt = hand.some(c => c.type === 'special' && c.operation === 'sqrt');
    
    // If we have sqrt and low numbers, simplicity is easier
    if (hasSqrt && hasLowCards && sum < 30) return 'simplicidade';
    
    // If we have many high numbers, greatness is better
    if (hasHighCards && sum > 25) return 'grandeza';
    
    // Default based on average
    const avg = sum / (numberCards.length || 1);
    return avg <= 5 ? 'simplicidade' : 'grandeza';
  }

  /**
   * Decide bet amount
   */
  decideBet(chips, pot, phase, hand) {
    const baseBet = Math.floor(chips * this.getBetFactor());
    
    switch (this.difficulty) {
      case DIFFICULTY.APPRENTICE:
        return Math.floor(Math.random() * chips * 0.3);
      
      case DIFFICULTY.STRATEGIST:
        return Math.min(baseBet, chips);
      
      case DIFFICULTY.MASTER:
        if (phase === 'initial') return Math.min(Math.floor(chips * 0.15), chips);
        return Math.min(baseBet, chips);
      
      case DIFFICULTY.ARCHIMAGISTER:
        if (phase === 'initial') return Math.min(Math.floor(chips * 0.1), chips);
        return Math.min(Math.floor(chips * this.personality.aggression * 0.5), chips);
      
      case DIFFICULTY.MAGNO:
        if (phase === 'initial') return Math.min(Math.floor(chips * 0.05), chips);
        // Strategic betting based on confidence
        const confidence = this.assessHandStrength(hand);
        return Math.min(Math.floor(chips * confidence * 0.4), chips);
      
      default:
        return Math.min(baseBet, chips);
    }
  }

  getBetFactor() {
    switch (this.difficulty) {
      case DIFFICULTY.APPRENTICE: return 0.2 + Math.random() * 0.3;
      case DIFFICULTY.STRATEGIST: return 0.15 + Math.random() * 0.2;
      case DIFFICULTY.MASTER: return 0.1 + Math.random() * 0.15;
      case DIFFICULTY.ARCHIMAGISTER: return 0.1 + Math.random() * 0.1;
      case DIFFICULTY.MAGNO: return 0.08 + Math.random() * 0.07;
      default: return 0.15;
    }
  }

  assessHandStrength(hand) {
    const numberCards = hand.filter(c => c.type === 'number');
    const hasSqrt = hand.some(c => c.type === 'special' && c.operation === 'sqrt');
    const hasMultiply = hand.some(c => c.type === 'special' && c.operation === 'multiply');
    
    let strength = 0.5;
    if (hasSqrt) strength += 0.15;
    if (hasMultiply) strength += 0.1;
    if (numberCards.length >= 4) strength += 0.1;
    
    return Math.min(strength, 0.9);
  }

  /**
   * Decide whether to fold
   */
  shouldFold(chips, pot, hand) {
    if (chips <= 2) return true; // Almost out of chips
    
    switch (this.difficulty) {
      case DIFFICULTY.APPRENTICE:
        return Math.random() < 0.15;
      
      case DIFFICULTY.STRATEGIST:
        return chips < pot * 0.3 && Math.random() < 0.2;
      
      case DIFFICULTY.MASTER:
        return chips < pot * 0.2;
      
      case DIFFICULTY.ARCHIMAGISTER:
        return chips < pot * 0.15 && this.personality.patience < 0.4;
      
      case DIFFICULTY.MAGNO:
        return false; // Never folds unless out of chips
      
      default:
        return false;
    }
  }

  /**
   * Build equation from hand
   */
  buildEquation(hand, destiny) {
    const numberCards = hand.filter(c => c.type === 'number');
    const operationCards = hand.filter(c => c.type === 'operation');
    const specialCards = hand.filter(c => c.type === 'special');
    
    // Shuffle available cards
    const shuffledNumbers = this.shuffle([...numberCards]);
    const shuffledOps = this.shuffle([...operationCards]);
    const shuffledSpecials = this.shuffle([...specialCards]);
    
    switch (this.difficulty) {
      case DIFFICULTY.APPRENTICE:
        return this.buildRandomEquation(shuffledNumbers, shuffledOps, shuffledSpecials);
      
      case DIFFICULTY.STRATEGIST:
        return this.buildBasicEquation(shuffledNumbers, shuffledOps, shuffledSpecials, destiny);
      
      case DIFFICULTY.MASTER:
        return this.buildAdvancedEquation(numberCards, operationCards, specialCards, destiny);
      
      case DIFFICULTY.ARCHIMAGISTER:
        return this.buildOptimalEquation(numberCards, operationCards, specialCards, destiny);
      
      case DIFFICULTY.MAGNO:
        return this.buildPerfectEquation(numberCards, operationCards, specialCards, destiny);
      
      default:
        return this.buildRandomEquation(shuffledNumbers, shuffledOps, shuffledSpecials);
    }
  }

  buildRandomEquation(numbers, ops, specials) {
    // Just interleave randomly
    const equation = [];
    const all = [...numbers, ...ops, ...specials];
    return this.shuffle(all);
  }

  buildBasicEquation(numbers, ops, specials, destiny) {
    // Try to sort numbers to help reach target
    const target = destiny === 'simplicidade' ? 1 : 20;
    
    // Sort: ascending for simplicity, descending for greatness
    if (destiny === 'simplicidade') {
      numbers.sort((a, b) => a.value - b.value);
    } else {
      numbers.sort((a, b) => b.value - a.value);
    }
    
    // Simple interleaving: number, op, number, op...
    const equation = [];
    let numIdx = 0, opIdx = 0, specIdx = 0;
    
    for (let i = 0; i < numbers.length + ops.length + specials.length; i++) {
      if (numIdx < numbers.length && (i % 2 === 0 || opIdx >= ops.length)) {
        equation.push(numbers[numIdx++]);
      } else if (opIdx < ops.length) {
        equation.push(ops[opIdx++]);
      } else if (specIdx < specials.length) {
        equation.push(specials[specIdx++]);
      } else if (numIdx < numbers.length) {
        equation.push(numbers[numIdx++]);
      }
    }
    
    return equation;
  }

  buildAdvancedEquation(numbers, ops, specials, destiny) {
    // More sophisticated: try different arrangements
    const target = destiny === 'simplicidade' ? 1 : 20;
    
    // Place sqrt first (it has highest precedence)
    const equation = [];
    const sqrtCards = specials.filter(s => s.operation === 'sqrt');
    const multCards = specials.filter(s => s.operation === 'multiply');
    
    // Strategy: place small numbers near sqrt for simplicity
    // or large numbers near multiply for greatness
    
    const sortedNumbers = [...numbers].sort((a, b) => 
      destiny === 'simplicidade' ? a.value - b.value : b.value - a.value
    );
    
    // Build equation: sqrt first, then multiply, then basic ops
    let numIdx = 0;
    
    // Add sqrt cards with their numbers
    for (const sqrt of sqrtCards) {
      if (numIdx < sortedNumbers.length) {
        equation.push(sqrt);
        equation.push(sortedNumbers[numIdx++]);
      }
    }
    
    // Add multiply cards
    for (const mult of multCards) {
      equation.push(mult);
      if (numIdx < sortedNumbers.length) {
        equation.push(sortedNumbers[numIdx++]);
      }
    }
    
    // Add remaining numbers and operations
    while (numIdx < sortedNumbers.length) {
      equation.push(sortedNumbers[numIdx++]);
    }
    
    for (const op of ops) {
      equation.push(op);
    }
    
    return equation;
  }

  buildOptimalEquation(numbers, ops, specials, destiny) {
    // Try multiple arrangements and pick the best
    const target = destiny === 'simplicidade' ? 1 : 20;
    let bestEquation = null;
    let bestDistance = Infinity;
    
    // Try a few random permutations
    for (let attempt = 0; attempt < 50; attempt++) {
      const candidate = this.buildAdvancedEquation(
        this.shuffle([...numbers]),
        this.shuffle([...ops]),
        this.shuffle([...specials]),
        destiny
      );
      
      const result = this.evaluateEquationFast(candidate);
      if (result !== null) {
        const distance = Math.abs(result - target);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestEquation = candidate;
        }
      }
    }
    
    return bestEquation || this.buildAdvancedEquation(numbers, ops, specials, destiny);
  }

  buildPerfectEquation(numbers, ops, specials, destiny) {
    // Extensive search for optimal equation
    const target = destiny === 'simplicidade' ? 1 : 20;
    let bestEquation = null;
    let bestDistance = Infinity;
    
    // Try many permutations
    for (let attempt = 0; attempt < 200; attempt++) {
      const candidate = this.buildAdvancedEquation(
        this.shuffle([...numbers]),
        this.shuffle([...ops]),
        this.shuffle([...specials]),
        destiny
      );
      
      const result = this.evaluateEquationFast(candidate);
      if (result !== null) {
        const distance = Math.abs(result - target);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestEquation = [...candidate];
        }
      }
    }
    
    return bestEquation || this.buildAdvancedEquation(numbers, ops, specials, destiny);
  }

  evaluateEquationFast(cards) {
    try {
      const tokens = [];
      for (const card of cards) {
        if (card.type === 'number') {
          tokens.push({ type: 'number', value: card.value });
        } else if (card.type === 'operation') {
          tokens.push({ type: 'operation', op: card.operation });
        } else if (card.type === 'special') {
          if (card.operation === 'sqrt') {
            tokens.push({ type: 'sqrt' });
          } else if (card.operation === 'multiply') {
            tokens.push({ type: 'operation', op: 'multiply' });
          }
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
          if (!left || !right) return null;
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
      
      return isFinite(result) ? result : null;
    } catch {
      return null;
    }
  }

  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

module.exports = {
  CPUPlayer,
  DIFFICULTY,
  DIFFICULTY_NAMES
};
