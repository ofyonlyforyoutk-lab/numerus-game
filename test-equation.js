// Test the equation evaluation logic from game-logic.js
const { evaluateEquation, createDeck, shuffleDeck } = require('./server/game-logic');

let passed = 0;
let failed = 0;

function assert(name, actual, expected) {
  const ok = actual === expected || (typeof expected === 'number' && Math.abs(actual - expected) < 0.0001);
  if (ok) {
    console.log(`✅ ${name}: ${actual}`);
    passed++;
  } else {
    console.log(`❌ ${name}: got ${actual}, expected ${expected}`);
    failed++;
  }
}

// Test 1: Basic 5 + 3 - 2 = 6
assert('5+3-2', evaluateEquation([
  { type: 'number', value: 5 },
  { type: 'operation', operation: 'add' },
  { type: 'number', value: 3 },
  { type: 'operation', operation: 'subtract' },
  { type: 'number', value: 2 }
]).result, 6);

// Test 2: Multiplication precedence 2 + 3 × 4 = 14
assert('2+3×4 (precedence)', evaluateEquation([
  { type: 'number', value: 2 },
  { type: 'operation', operation: 'add' },
  { type: 'number', value: 3 },
  { type: 'operation', operation: 'multiply' },
  { type: 'number', value: 4 }
]).result, 14);

// Test 3: Sqrt √9 + 1 = 4
assert('√9+1', evaluateEquation([
  { type: 'special', operation: 'sqrt' },
  { type: 'number', value: 9 },
  { type: 'operation', operation: 'add' },
  { type: 'number', value: 1 }
]).result, 4);

// Test 4: Division 10 ÷ 2 + 3 = 8
assert('10÷2+3', evaluateEquation([
  { type: 'number', value: 10 },
  { type: 'operation', operation: 'divide' },
  { type: 'number', value: 2 },
  { type: 'operation', operation: 'add' },
  { type: 'number', value: 3 }
]).result, 8);

// Test 5: Division by zero invalid
assert('5÷0 invalid', evaluateEquation([
  { type: 'number', value: 5 },
  { type: 'operation', operation: 'divide' },
  { type: 'number', value: 0 }
]).valid, false);

// Test 6: Manual example √9 - 4 ÷ 2 = 1
assert('√9-4÷2 (manual example)', evaluateEquation([
  { type: 'special', operation: 'sqrt' },
  { type: 'number', value: 9 },
  { type: 'operation', operation: 'subtract' },
  { type: 'number', value: 4 },
  { type: 'operation', operation: 'divide' },
  { type: 'number', value: 2 }
]).result, 1);

// Test 7: Manual example 10 + 5 × 4 ÷ 2 = 20
assert('10+5×4÷2 (manual example)', evaluateEquation([
  { type: 'number', value: 10 },
  { type: 'operation', operation: 'add' },
  { type: 'number', value: 5 },
  { type: 'operation', operation: 'multiply' },
  { type: 'number', value: 4 },
  { type: 'operation', operation: 'divide' },
  { type: 'number', value: 2 }
]).result, 20);

// Test 8: Decimal results 7 ÷ 2 = 3.5
assert('7÷2', evaluateEquation([
  { type: 'number', value: 7 },
  { type: 'operation', operation: 'divide' },
  { type: 'number', value: 2 }
]).result, 3.5);

// Test 9: Deck creation
const deck = createDeck();
assert('Deck has 52 cards', deck.length, 52);
const numbers = deck.filter(c => c.type === 'number');
const sqrtCards = deck.filter(c => c.operation === 'sqrt');
const multCards = deck.filter(c => c.operation === 'multiply');
assert('44 number cards', numbers.length, 44);
assert('4 sqrt cards', sqrtCards.length, 4);
assert('4 multiply cards', multCards.length, 4);

// Test 10: Shuffle preserves all cards
const shuffled = shuffleDeck(deck);
assert('Shuffle keeps 52 cards', shuffled.length, 52);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
