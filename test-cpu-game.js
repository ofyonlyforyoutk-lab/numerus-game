// Test the server-side CPU player AI
const { CPUPlayer, DIFFICULTY, DIFFICULTY_NAMES } = require('./server/cpu-player');

console.log('=== CPU PLAYER AI TESTS ===\n');

// Test difficulty names
console.log('Difficulty names:');
for (const [key, value] of Object.entries(DIFFICULTY_NAMES)) {
  console.log(`  ${key}: ${value.icon} ${value.name} (${value.stars})`);
}

// Create CPU players at each difficulty
const cpuAprentice = new CPUPlayer('c1', 'Papiro', DIFFICULTY.APPRENTICE);
const cpuStrategist = new CPUPlayer('c2', 'Espada', DIFFICULTY.STRATEGIST);
const cpuMaster = new CPUPlayer('c3', 'Algoritmo', DIFFICULTY.MASTER);
const cpuArch = new CPUPlayer('c4', 'Coroa', DIFFICULTY.ARCHIMAGISTER);
const cpuMagno = new CPUPlayer('c5', 'Morgana', DIFFICULTY.MAGNO);

// Sample hand
const sampleHand = [
  { type: 'number', value: 5, school: 'ouro' },
  { type: 'number', value: 3, school: 'prata' },
  { type: 'number', value: 9, school: 'bronze' },
  { type: 'number', value: 2, school: 'terra' },
  { type: 'operation', operation: 'add' },
  { type: 'operation', operation: 'subtract' },
  { type: 'operation', operation: 'divide' },
  { type: 'special', operation: 'sqrt' }
];

console.log('\nDestiny decisions:');
console.log('  Aprendiz:', cpuAprentice.decideDestiny(sampleHand, null));
console.log('  Estrategista:', cpuStrategist.decideDestiny(sampleHand, null));
console.log('  Mestre:', cpuMaster.decideDestiny(sampleHand, null));
console.log('  Arquimestre:', cpuArch.decideDestiny(sampleHand, null));
console.log('  Magno:', cpuMagno.decideDestiny(sampleHand, null));

console.log('\nEquation building (simplicidade):');
for (const cpu of [cpuAprentice, cpuStrategist, cpuMaster, cpuArch, cpuMagno]) {
  const eq = cpu.buildEquation(sampleHand, 'simplicidade');
  const result = cpu.evaluateEquationFast(eq);
  console.log(`  ${cpu.difficulty}: ${eq.length} cards -> result ${result}`);
}

console.log('\nEquation building (grandeza):');
for (const cpu of [cpuAprentice, cpuStrategist, cpuMaster, cpuArch, cpuMagno]) {
  const eq = cpu.buildEquation(sampleHand, 'grandeza');
  const result = cpu.evaluateEquationFast(eq);
  console.log(`  ${cpu.difficulty}: ${eq.length} cards -> result ${result}`);
}

console.log('\nBetting decisions:');
for (const cpu of [cpuAprentice, cpuStrategist, cpuMaster, cpuArch, cpuMagno]) {
  const bet = cpu.decideBet(20, 5, 'mid', sampleHand);
  console.log(`  ${cpu.difficulty}: bet ${bet} (has ${20})`);
}

console.log('\nAll CPU tests completed successfully!');
process.exit(0);
