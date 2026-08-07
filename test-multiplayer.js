/**
 * NUMERUS - Full multiplayer test over real Socket.io connections.
 * Two clients: create room, join, start, and play ALL 10 rounds to completion.
 * Verifies the server-side round progression works end-to-end online.
 */
const { io } = require('socket.io-client');
const GL = require('./server/game-logic');

const URL = process.env.TEST_URL || 'http://localhost:3001';
const results = { passed: 0, failed: 0 };

function assert(cond, name) {
  if (cond) { results.passed++; console.log(`  ✅ ${name}`); }
  else { results.failed++; console.log(`  ❌ ${name}`); }
}

function makePlayer(name) {
  return new Promise((resolve, reject) => {
    const socket = io(URL, { reconnection: false, transports: ['websocket'], timeout: 6000 });
    socket.on('connect', () => resolve({ socket, name, states: {} }));
    socket.on('connect_error', (e) => reject(new Error(`${name} connect error: ${e.message}`)));
    setTimeout(() => reject(new Error(`${name} connect timeout`)), 10000);
  });
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function emitAction(player, action) {
  return new Promise(resolve => player.socket.emit('game_action', { action }, resolve));
}

async function main() {
  console.log(`\n=== TESTE MULTIPLAYER COMPLETO (${URL}) ===\n`);

  const p1 = await makePlayer('Jogador 1');
  const p2 = await makePlayer('Jogador 2'); const p3 = await makePlayer('Jogador 3');
  console.log('  ✅ Dois jogadores conectados');

  // Track latest public game state per player
  p1.socket.on('game_state', (s) => { p1.states[s.myId] = s; p1.latest = s; });
  p2.socket.on('game_state', (s) => { p2.states[s.myId] = s; p2.latest = s; });
  let gameOver = null;
  p1.socket.on('game_over', (r) => { gameOver = r; });

  // Create + join
  const createRes = await new Promise(resolve => p1.socket.emit('create_room', {}, resolve));
  assert(createRes.success, `Sala criada: ${createRes.roomId}`);
  const roomId = createRes.roomId;

  const joinRes = await new Promise(resolve => p2.socket.emit('join_room', { roomId }, resolve));
  assert(joinRes.success, 'Jogador 2 entrou na sala');

  // Start game
  const startRes = await new Promise(resolve => p1.socket.emit('start_game', {}, resolve));
  assert(startRes.success, 'Jogo iniciado');

  await wait(700);
  assert(p1.latest && p2.latest, 'Ambos receberam game_state (rodada 1 - auto-avanço)');
  if (p1.latest) console.log(`  ℹ️  Rodada atual após start: ${p1.latest.currentRound + 1}/10 (${p1.latest.currentRound === 1 ? 'avançou do Despertar' : 'TRAVOU no Despertar'})`);

  // ── Play all rounds ──
  let iterations = 0;
  while (iterations < 60) {
    iterations++;
    const state = p1.latest;
    if (!state) { await wait(300); continue; }
    if (state.finished || gameOver) break;
    const round = state.currentRound;

    switch (round) {
      case 0: // Despertar (server auto-deals, but just in case)
        await emitAction(p1, { type: 'deal_operations' });
        await emitAction(p2, { type: 'deal_operations' });
        break;
      case 1: // Chamado do Destino
        await emitAction(p1, { type: 'bet', amount: 2 });
        await emitAction(p2, { type: 'bet', amount: 2 });
        await emitAction(p1, { type: 'draw_face_down' });
        await emitAction(p2, { type: 'draw_face_down' });
        break;
      case 2: // Revelação dos Conhecimentos
        await emitAction(p1, { type: 'draw_face_up' });
        await emitAction(p2, { type: 'draw_face_up' });
        break;
      case 3: // Julgamento da Coragem
        await emitAction(p1, { type: 'bet', amount: 2 });
        await emitAction(p2, { type: 'bet', amount: 2 });
        break;
      case 4: // Conhecimento Cresce
        await emitAction(p1, { type: 'draw_face_up' });
        await emitAction(p2, { type: 'draw_face_up' });
        break;
      case 5: { // Construção da Equação
        for (const player of [p1, p2]) {
          const myState = player.latest;
          const myHand = myState?.myHand || [];
          const myOps = myState?.myOperations || [];
          const mySpecials = myState?.mySpecials || [];
          // Try many orderings to find a valid equation (like real CPU AI)
          let submitted = false;
          for (let attempt = 0; attempt < 300 && !submitted; attempt++) {
            const equation = GL.shuffleDeck([...myHand]);
            const check = GL.evaluateEquation(equation);
            if (!check.valid) continue;
            const res = await emitAction(player, { type: 'submit_equation', equation });
            if (res.success) submitted = true;
          }
          if (!submitted) console.log(`  ℹ️  ${player.name} não encontrou equação válida (tentará de novo)`);
        }
        break;
      }
      case 6: // Peso da Convicção
        await emitAction(p1, { type: 'bet', amount: 1 });
        await emitAction(p2, { type: 'bet', amount: 1 });
        break;
      case 7: // Juramento
        await emitAction(p1, { type: 'choose_destiny', destiny: 'grandeza' });
        await emitAction(p2, { type: 'choose_destiny', destiny: 'simplicidade' });
        break;
      case 8: // Revelação
        await emitAction(p1, { type: 'reveal' });
        await emitAction(p2, { type: 'reveal' });
        break;
      case 9: // Grande Julgamento (auto)
        break;
    }

    await wait(350);
  }

  await wait(800);

  const finalState = p1.latest;
  assert(finalState?.finished || gameOver, `Jogo terminou (rodada final: ${finalState?.currentRound + 1}/10)`);
  if (gameOver) {
    console.log('  ℹ️  game_over recebido com rankings!');
    if (gameOver.rankings) {
      for (const r of gameOver.rankings) {
        console.log(`     ${r.position}º ${r.name}: ${r.chips} fichas (destino ${r.destiny}, equação ${r.equationResult})`);
      }
    }
  } else if (finalState) {
    console.log(`  ℹ️  Estado: rodada ${finalState.currentRound + 1}/10, finished=${finalState.finished}, pot=${finalState.pot}`);
  }

  console.log(`\n=== RESULTADO: ${results.passed} passed, ${results.failed} failed ===\n`);
  p1.socket.disconnect();
  p2.socket.disconnect();
  process.exit(results.failed === 0 ? 0 : 1);
}

main().catch(e => {
  console.error('❌ Teste falhou:', e.message);
  process.exit(1);
});
