/**
 * NUMERUS - Co-op story mode test.
 * 2 logged-in humans + the chapter boss (server CPU). Plays ALL rounds,
 * verifies game_over carries storyResult and both accounts get progress.
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
    socket.on('connect', () => resolve({ socket, name, latest: null }));
    socket.on('connect_error', (e) => reject(new Error(`${name} connect error: ${e.message}`)));
    setTimeout(() => reject(new Error(`${name} connect timeout`)), 10000);
  });
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function api(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: res.status, data: await res.json() };
}

async function emitAction(player, action) {
  return new Promise(resolve => player.socket.emit('game_action', { action }, resolve));
}

async function main() {
  console.log(`\n=== TESTE CO-OP MODO HISTÓRIA (${URL}) ===\n`);

  // Register two accounts
  const suffix = Date.now().toString(36);
  const regA = await api('/api/auth/register', { method: 'POST', body: { username: `coop_a_${suffix}`, password: 'segredo123', displayName: 'Aliada A' } });
  const regB = await api('/api/auth/register', { method: 'POST', body: { username: `coop_b_${suffix}`, password: 'segredo123', displayName: 'Aliado B' } });
  assert(regA.status === 200 && regB.status === 200, 'Contas de teste criadas');
  const tokenA = regA.data.token;
  const tokenB = regB.data.token;

  const p1 = await makePlayer('Aliada A');
  const p2 = await makePlayer('Aliado B');
  p1.socket.on('game_state', (s) => { p1.latest = s; });
  p2.socket.on('game_state', (s) => { p2.latest = s; });

  let gameOver = null;
  p1.socket.on('game_over', (r) => { gameOver = r; });

  // Create co-op story room (chapter 1)
  const createRes = await new Promise(r => p1.socket.emit('create_room', { name: 'Aliada A', mode: 'story', chapterId: 1, token: tokenA }, r));
  assert(createRes.success && createRes.mode === 'story' && createRes.chapterId === 1, `Sala co-op criada (capítulo 1): ${createRes.roomId}`);
  const roomId = createRes.roomId;

  const joinRes = await new Promise(r => p2.socket.emit('join_room', { roomId, name: 'Aliado B', token: tokenB }, r));
  assert(joinRes.success, 'Aliado B entrou na sala co-op');
  assert(joinRes.mode === 'story', 'Modo story confirmado no join');

  // Start (host, min 1 human allowed in co-op)
  const startRes = await new Promise(r => p1.socket.emit('start_game', {}, r));
  assert(startRes.success, 'Jogo co-op iniciado pelo anfitrião');

  await wait(800);
  assert(p1.latest && p2.latest, 'Ambos receberam game_state');
  const bossNames = Object.values(p1.latest?.players || {}).filter(p => p.isCPU).map(p => p.name);
  assert(bossNames.length === 1 && bossNames[0] === 'Papiro, o Escriba', `Chefe presente: ${bossNames[0] || '?'}`);
  if (p1.latest) console.log(`  ℹ️  Rodada inicial: ${p1.latest.currentRound + 1}/10`);

  // ── Play all rounds (humans act; boss acts automatically) ──
  let iterations = 0;
  while (iterations < 100) {
    iterations++;
    const state = p1.latest;
    if (!state) { await wait(400); continue; }
    if (state.finished || gameOver) break;
    const round = state.currentRound;

    switch (round) {
      case 0:
        await emitAction(p1, { type: 'deal_operations' });
        await emitAction(p2, { type: 'deal_operations' });
        break;
      case 1:
        await emitAction(p1, { type: 'bet', amount: 2 });
        await emitAction(p2, { type: 'bet', amount: 2 });
        await emitAction(p1, { type: 'draw_face_down' });
        await emitAction(p2, { type: 'draw_face_down' });
        break;
      case 2:
        await emitAction(p1, { type: 'draw_face_up' });
        await emitAction(p2, { type: 'draw_face_up' });
        break;
      case 3:
        await emitAction(p1, { type: 'bet', amount: 2 });
        await emitAction(p2, { type: 'bet', amount: 2 });
        break;
      case 4:
        await emitAction(p1, { type: 'draw_face_up' });
        await emitAction(p2, { type: 'draw_face_up' });
        break;
      case 5: {
        for (const player of [p1, p2]) {
          const myState = player.latest;
          const myHand = myState?.myHand || [];
          let submitted = false;
          for (let attempt = 0; attempt < 300 && !submitted; attempt++) {
            const equation = GL.shuffleDeck([...myHand]);
            const check = GL.evaluateEquation(equation);
            if (!check.valid) continue;
            const res = await emitAction(player, { type: 'submit_equation', equation });
            if (res.success) submitted = true;
          }
          if (!submitted) console.log(`  ℹ️  ${player.name} não achou equação válida (tentará de novo)`);
        }
        break;
      }
      case 6:
        await emitAction(p1, { type: 'bet', amount: 1 });
        await emitAction(p2, { type: 'bet', amount: 1 });
        break;
      case 7:
        await emitAction(p1, { type: 'choose_destiny', destiny: 'grandeza' });
        await emitAction(p2, { type: 'choose_destiny', destiny: 'simplicidade' });
        break;
      case 8:
        await emitAction(p1, { type: 'reveal' });
        await emitAction(p2, { type: 'reveal' });
        break;
      case 9:
        break;
    }

    await wait(400);
  }

  await wait(1200);

  assert(gameOver !== null, 'game_over recebido');
  if (gameOver) {
    assert(gameOver.storyResult !== undefined, 'game_over traz storyResult (co-op)');
    if (gameOver.storyResult) {
      console.log(`  ℹ️  Resultado do grupo: ${gameOver.storyResult.won ? 'VITÓRIA' : 'derrota'}, ${gameOver.storyResult.stars} estrela(s), chefe em ${gameOver.storyResult.bossPosition}º`);
      assert(gameOver.storyResult.chapterId === 1, 'chapterId correto no storyResult');
    }
    if (gameOver.rankings) {
      for (const r of gameOver.rankings) {
        console.log(`     ${r.position}º ${r.name}${r.isCPU ? ' (CHEFE)' : ''}: ${r.chips} fichas`);
      }
    }
  }

  // Progress should have been awarded to both logged-in accounts
  const profA = await api('/api/profile', { token: tokenA });
  const profB = await api('/api/profile', { token: tokenB });
  assert(profA.status === 200 && profA.data.user.profile.gamesPlayed >= 1, `Conta A com jogo registrado (${profA.data.user.profile.gamesPlayed})`);
  assert(profB.status === 200 && profB.data.user.profile.gamesPlayed >= 1, `Conta B com jogo registrado (${profB.data.user.profile.gamesPlayed})`);

  console.log(`\n=== RESULTADO: ${results.passed} passed, ${results.failed} failed ===\n`);
  p1.socket.disconnect();
  p2.socket.disconnect();
  process.exit(results.failed === 0 ? 0 : 1);
}

main().catch(e => {
  console.error('❌ Teste falhou:', e.message);
  process.exit(1);
});
