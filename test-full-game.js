// Full game simulation test using server game-logic
const GL = require('./server/game-logic');

console.log('=== FULL GAME SIMULATION ===\n');

// Create a game with 2 players
const roomId = 'test-room';
const gameState = GL.createGameState(roomId, ['p1', 'p2'], { maxRounds: 10 });

// Helper to log round
function logRound(gs) {
  const r = gs.currentRound;
  const p1 = gs.players.p1;
  const p2 = gs.players.p2;
  console.log(`\nRodada ${r + 1} (${GL.ROUNDS[r]}):`);
  console.log(`  P1: hand=${p1.hand.length}, ops=${p1.operations.length}, faceDown=${p1.faceDown.length}, chips=${p1.chips}, bet=${p1.bet}`);
  console.log(`  P2: hand=${p2.hand.length}, ops=${p2.operations.length}, faceDown=${p2.faceDown.length}, chips=${p2.chips}, bet=${p2.bet}`);
}

// Start game
GL.startGame(gameState);
logRound(gameState);

// Auto-play rounds
let round = 0;
let maxIterations = 200;
let iterations = 0;

while (!gameState.finished && iterations < maxIterations) {
  iterations++;
  round = gameState.currentRound;

  // Actions per round
  switch (round) {
    case 0: // Despertar - deal operations
      GL.executeRoundAction(gameState, 'p1', { type: 'deal_operations' });
      GL.executeRoundAction(gameState, 'p2', { type: 'deal_operations' });
      break;

    case 1: // Chamado do Destino - bet + face down
      GL.executeRoundAction(gameState, 'p1', { type: 'bet', amount: 2 });
      GL.executeRoundAction(gameState, 'p2', { type: 'bet', amount: 2 });
      GL.executeRoundAction(gameState, 'p1', { type: 'draw_face_down' });
      GL.executeRoundAction(gameState, 'p2', { type: 'draw_face_down' });
      break;

    case 2: // Revelação - draw face up
      GL.executeRoundAction(gameState, 'p1', { type: 'draw_face_up' });
      GL.executeRoundAction(gameState, 'p2', { type: 'draw_face_up' });
      break;

    case 3: // Julgamento da Coragem - betting
      GL.executeRoundAction(gameState, 'p1', { type: 'bet', amount: 3 });
      GL.executeRoundAction(gameState, 'p2', { type: 'bet', amount: 3 });
      break;

    case 4: // Conhecimento Cresce - draw
      GL.executeRoundAction(gameState, 'p1', { type: 'draw_face_up' });
      GL.executeRoundAction(gameState, 'p2', { type: 'draw_face_up' });
      break;

    case 5: // Construção da Equação
      // Build equations using ALL of the player's cards by trying many random
      // orderings and picking the first valid one (mirrors the real CPU AI).
      for (const pid of ['p1', 'p2']) {
        const p = gameState.players[pid];
        let submitted = false;
        const allCards = p.hand;
        for (let attempt = 0; attempt < 300 && !submitted; attempt++) {
          const equation = GL.shuffleDeck(allCards);
          const check = GL.evaluateEquation(equation);
          if (!check.valid) continue;
          const res = GL.executeRoundAction(gameState, pid, { type: 'submit_equation', equation });
          if (res.success) {
            submitted = true;
          }
        }
        if (!submitted) {
          console.log(`  [${pid}] Não conseguiu montar equação válida`);
        }
      }
      break;

    case 6: // Peso da Convicção - betting
      GL.executeRoundAction(gameState, 'p1', { type: 'bet', amount: 2 });
      GL.executeRoundAction(gameState, 'p2', { type: 'bet', amount: 2 });
      break;

    case 7: // Juramento
      GL.executeRoundAction(gameState, 'p1', { type: 'choose_destiny', destiny: 'grandeza' });
      GL.executeRoundAction(gameState, 'p2', { type: 'choose_destiny', destiny: 'simplicidade' });
      break;

    case 8: // Revelação
      GL.executeRoundAction(gameState, 'p1', { type: 'reveal' });
      GL.executeRoundAction(gameState, 'p2', { type: 'reveal' });
      break;

    case 9: // Grande Julgamento - auto
      // trigger final check
      GL.checkRoundComplete(gameState);
      break;
  }

  // Check round complete and advance
  if (GL.checkRoundComplete(gameState)) {
    const hasMore = GL.advanceRound(gameState);
    if (!hasMore) {
      console.log('\n=== GAME OVER ===');
    }
  }

  if (round !== gameState.currentRound || gameState.finished) {
    if (!gameState.finished) logRound(gameState);
  }
}

// Show final results
if (gameState.finished) {
  console.log('\n=== RESULTADOS FINAIS ===');
  if (gameState.results) {
    console.log(`Vencedor Simplicidade: ${gameState.results.simplicityWinner} (distância ${gameState.results.simplicityDistance?.toFixed(2)})`);
    console.log(`Vencedor Grandeza: ${gameState.results.greatnessWinner} (distância ${gameState.results.greatnessDistance?.toFixed(2)})`);
    console.log('\nRankings:');
    for (const r of gameState.results.rankings) {
      console.log(`  ${r.position}º ${r.name}: ${r.chips} fichas (destino ${r.destiny}, equação ${r.equationResult})`);
    }
  }
  console.log('\n✅ Game completed successfully!');
  process.exit(0);
} else {
  console.log(`\n❌ Game did not complete! Stopped at round ${gameState.currentRound} after ${iterations} iterations`);
  process.exit(1);
}
