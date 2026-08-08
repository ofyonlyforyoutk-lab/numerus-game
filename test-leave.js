/**
 * NUMERUS - Tests for host transfer + game abandonment on leave/disconnect.
 */
const { io } = require('socket.io-client');

const URL = process.env.TEST_URL || 'http://localhost:3001';
const results = { passed: 0, failed: 0 };

function assert(cond, name) {
  if (cond) { results.passed++; console.log(`  ✅ ${name}`); }
  else { results.failed++; console.log(`  ❌ ${name}`); }
}

function makePlayer(name) {
  return new Promise((resolve, reject) => {
    const socket = io(URL, { reconnection: false, transports: ['websocket'], timeout: 6000 });
    socket.on('connect', () => resolve({ socket, name }));
    socket.on('connect_error', (e) => reject(new Error(`${name} connect error: ${e.message}`)));
    setTimeout(() => reject(new Error(`${name} connect timeout`)), 10000);
  });
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log(`\n=== TESTE HOST TRANSFER + ABANDONO (${URL}) ===\n`);

  // ── Test 1: host leaves lobby → host transfers to remaining player ──
  console.log('--- Teste 1: anfitrião sai do lobby, host transfere ---');
  {
    const p1 = await makePlayer('Host');
    const p2 = await makePlayer('Jogador2');
    let update = null;
    p2.socket.on('room_update', (d) => { update = d; });

    const createRes = await new Promise(r => p1.socket.emit('create_room', {}, r));
    const roomId = createRes.roomId;
    await new Promise(r => p2.socket.emit('join_room', { roomId }, r));
    await wait(300);

    // Host leaves voluntarily
    p1.socket.emit('leave_room');
    await wait(500);

    assert(update && update.players.length === 1 && update.host === p2.socket.id,
      `Host transferido para o jogador restante (host = p2)`);

    // Now p2 (new host) can start — but there's only 1 player, so it should fail with min players
    const startRes = await new Promise(r => p2.socket.emit('start_game', {}, r));
    assert(!startRes.success && /Mínimo 2/.test(startRes.error || ''), 'Novo host existe (erro é só por falta de jogadores)');

    p1.socket.disconnect();
    p2.socket.disconnect();
    await wait(300);
  }

  // ── Test 2: player abandons mid-game → game ends for remaining player ──
  console.log('--- Teste 2: abandono durante o jogo finaliza a partida ---');
  {
    const p1 = await makePlayer('Host2');
    const p2 = await makePlayer('Jogador2');
    let gameOver = null;
    // game_over goes to the player(s) who REMAIN in the room (p1 stays)
    p1.socket.on('game_over', (r) => { gameOver = r; });

    const createRes = await new Promise(r => p1.socket.emit('create_room', {}, r));
    const roomId = createRes.roomId;
    await new Promise(r => p2.socket.emit('join_room', { roomId }, r));
    const startRes = await new Promise(r => p1.socket.emit('start_game', {}, r));
    assert(startRes.success, 'Jogo iniciado (2 jogadores)');
    await wait(500);

    // p2 abandons mid-game
    p2.socket.emit('leave_room');
    await wait(700);

    assert(gameOver !== null && gameOver.rankings && gameOver.rankings.length === 2,
      'game_over enviado ao jogador restante com rankings');

    p1.socket.disconnect();
    p2.socket.disconnect();
    await wait(300);
  }

  console.log(`\n=== RESULTADO: ${results.passed} passed, ${results.failed} failed ===\n`);
  process.exit(results.failed === 0 ? 0 : 1);
}

main().catch(e => {
  console.error('❌ Teste falhou:', e.message);
  process.exit(1);
});
