/**
 * NUMERUS - Auth + story save test (uses the local JSON store, no DATABASE_URL needed).
 * Verifies: register, login, me, duplicate username, wrong password, story save.
 */
const BASE = process.env.TEST_URL || 'http://localhost:3001';
const results = { passed: 0, failed: 0 };

function assert(cond, name) {
  if (cond) { results.passed++; console.log(`  ✅ ${name}`); }
  else { results.failed++; console.log(`  ❌ ${name}`); }
}

async function api(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: res.status, data: await res.json() };
}

async function main() {
  console.log(`\n=== TESTE AUTH + SAVE MODO HISTÓRIA (${BASE}) ===\n`);

  const username = `mestre_${Date.now().toString(36)}`;

  // Register
  const reg = await api('/api/auth/register', {
    method: 'POST',
    body: { username, password: 'segredo123', displayName: 'Mestre Teste' }
  });
  assert(reg.status === 200 && reg.data.success && reg.data.token, 'Registro criado com token');
  const token = reg.data.token;
  assert(reg.data.user.displayName === 'Mestre Teste', 'Nome de exibição salvo');

  // Me
  const me = await api('/api/auth/me', { token });
  assert(me.status === 200 && me.data.user.username === username, 'GET /me retorna o usuário');
  assert(me.data.user.profile?.title === 'Aprendiz', 'Perfil inicial com título Aprendiz');

  // Duplicate username
  const dup = await api('/api/auth/register', {
    method: 'POST',
    body: { username, password: 'outra123' }
  });
  assert(dup.status === 400 && !dup.data.success, 'Usuário duplicado é rejeitado');

  // Wrong password
  const bad = await api('/api/auth/login', {
    method: 'POST',
    body: { username, password: 'errada' }
  });
  assert(bad.status === 401 && !bad.data.success, 'Senha errada é rejeitada');

  // Login (correct)
  const login = await api('/api/auth/login', {
    method: 'POST',
    body: { username, password: 'segredo123' }
  });
  assert(login.status === 200 && login.data.success && login.data.token, 'Login correto retorna token');

  // Story save
  const story = await api('/api/story/complete', {
    method: 'POST',
    token,
    body: { chapterId: 1, stars: 3, won: true }
  });
  assert(story.status === 200 && story.data.success, 'Save do capítulo 1 aceito');
  assert(story.data.profile.completed && story.data.profile.completed['1'] === 3, 'Capítulo 1 salvo com 3 estrelas');

  // Save chapter 2 (best stars preserved)
  await api('/api/story/complete', { method: 'POST', token, body: { chapterId: 1, stars: 1, won: true } });
  const story2 = await api('/api/story/complete', { method: 'POST', token, body: { chapterId: 2, stars: 2, won: true } });
  assert(story2.data.profile.completed['1'] === 3, 'Melhor pontuação do capítulo é mantida');
  assert(story2.data.profile.stars === 5, 'Total de estrelas = 5');
  assert(story2.data.profile.title === 'Escrevente', `Título atualizado (${story2.data.profile.title})`);

  // Anti-cheat: locked chapter rejected
  const locked = await api('/api/story/complete', {
    method: 'POST',
    token,
    body: { chapterId: 10, stars: 3, won: true }
  });
  assert(locked.status === 403, 'Capítulo bloqueado é rejeitado (anti-cheat)');

  // Loss (stars 0) must NOT count as completing a chapter
  const loss = await api('/api/story/complete', {
    method: 'POST',
    token,
    body: { chapterId: 3, stars: 0, won: false }
  });
  assert(loss.status === 200 && loss.data.profile.completed['3'] === undefined,
    'Derrota não conta como capítulo concluído');
  assert(loss.data.profile.title === 'Escrevente', 'Título não inflado por derrota');

  // Unauthenticated profile
  const noAuth = await api('/api/profile');
  assert(noAuth.status === 401, 'Sem token não acessa o perfil');

  console.log(`\n=== RESULTADO: ${results.passed} passed, ${results.failed} failed ===\n`);
  process.exit(results.failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('❌ Teste falhou:', e.message);
  process.exit(1);
});
