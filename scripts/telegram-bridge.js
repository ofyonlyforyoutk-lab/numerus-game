#!/usr/bin/env node
/**
 * NUMERUS — Ponte Telegram → projeto (roda no seu PC, 24/7 se quiser)
 *
 * 1. Crie um bot no Telegram: fale com @BotFather → /newbot → copie o token.
 * 2. Rode:  TELEGRAM_TOKEN=<token> node scripts/telegram-bridge.js
 *
 * O que ele faz:
 *  - Toda mensagem enviada ao bot é salva em inbox/messages.md
 *  - Mensagens começando com "imagem:", "img:", "gera:" ou "arte:"
 *    geram uma imagem automaticamente (Pollinations) em client/src/assets/generated/
 *  - Avisa o status por mensagem no próprio Telegram
 *
 * IMPORTANTE (sincronização honesta): o bot escuta e registra o tempo todo,
 * mas quem "executa" (lê o inbox, integra arte no jogo) é o assistente do
 * Freebuff — então, ao mandar algo pelo celular, volte ao Freebuff e diga
 * "olha o inbox" que ele lê tudo e age.
 */

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const TOKEN = process.env.TELEGRAM_TOKEN;
const ROOT = path.resolve(__dirname, '..');
const INBOX_DIR = path.join(ROOT, 'inbox');
const MESSAGES_FILE = path.join(INBOX_DIR, 'messages.md');
const PENDING_FILE = path.join(INBOX_DIR, 'pending-prompts.json');
const GENERATED_DIR = path.join(ROOT, 'client', 'src', 'assets', 'generated');
const GENERATOR = path.join(ROOT, 'scripts', 'generate-art.js');

if (!TOKEN) {
  console.error('❌ Defina a variável TELEGRAM_TOKEN (ex.: TELEGRAM_TOKEN=123:ABC node scripts/telegram-bridge.js)');
  process.exit(1);
}
fs.mkdirSync(INBOX_DIR, { recursive: true });

const API = `https://api.telegram.org/bot${TOKEN}`;
// Opcional: só processa mensagens destes IDs (ex.: ALLOWED_USER_IDS=123456,789012)
const ALLOWED = (process.env.ALLOWED_USER_IDS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
let offset = 0;
let busy = false;

async function apiCall(method, payload = {}) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

function logMessage(msg) {
  const from = msg.from
    ? [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ') + (msg.from.username ? ` (@${msg.from.username})` : '')
    : 'desconhecido';
  const text = msg.text ? msg.text : `(mídia: ${msg.photo ? 'foto' : msg.document ? 'documento' : 'outro'})`;
  const line = `[${new Date().toLocaleString('pt-BR')}] **${from}**: ${text}\n`;
  fs.appendFileSync(MESSAGES_FILE, line);
  return line.trim();
}

function readPending() {
  try {
    return fs.existsSync(PENDING_FILE) ? JSON.parse(fs.readFileSync(PENDING_FILE, 'utf8')) : [];
  } catch (e) {
    console.error('⚠ pending-prompts.json inválido, recomeçando:', e.message);
    return [];
  }
}

function isAllowed(userId) {
  return ALLOWED.length === 0 || ALLOWED.includes(String(userId));
}

async function reply(chatId, text) {
  try {
    await apiCall('sendMessage', { chat_id: chatId, text });
  } catch (e) {
    console.error('⚠ Falha ao responder no Telegram:', e.message);
  }
}

function runGenerator(prompt, file) {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [GENERATOR, '--prompt', prompt, '--file', file],
      { timeout: 150000 },
      (err, stdout, stderr) => {
        resolve({ ok: !err, output: (stdout || '') + (stderr || '') });
      }
    );
  });
}

async function handleImageRequest(chatId, prompt, fromName) {
  // Salva no pendente para o assistente revisar depois
  const pending = readPending();
  pending.push({ date: new Date().toISOString(), from: fromName, prompt });
  fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2));

  const existing = fs.existsSync(GENERATED_DIR)
    ? fs.readdirSync(GENERATED_DIR).filter(f => f.startsWith('art-phone-'))
    : [];
  const file = `art-phone-${existing.length + 1}.png`;

  await reply(chatId, '🎨 Recebi seu prompt! Gerando a imagem (leva ~30s)…');
  const { ok, output } = await runGenerator(prompt, file);
  if (ok) {
    await reply(chatId, `✅ Imagem pronta: \`client/src/assets/generated/${file}\`\nVolte ao Freebuff e diga que tem arte nova no inbox — eu integro no jogo!`);
  } else {
    await reply(chatId, `❌ Não consegui gerar agora. Salvei seu prompt na fila.\nErro: ${output.slice(-200)}`);
  }
}

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  const logged = logMessage(msg);
  console.log('📨', logged);

  if (!isAllowed(msg.from ? msg.from.id : null)) {
    await reply(chatId, '🔒 Este bot é privado. Não autorizado.');
    return;
  }

  if (text && /^(imagem|img|gera|arte)\s*:/i.test(text)) {
    const prompt = text.replace(/^(imagem|img|gera|arte)\s*:/i, '').trim();
    if (prompt.length < 5) {
      await reply(chatId, 'O prompt está curto demais. Exemplo:\n`imagem: dragão de ouro segurando um papiro`');
      return;
    }
    await handleImageRequest(chatId, prompt, msg.from ? msg.from.first_name : '?');
  } else if (msg.photo || msg.document) {
    await reply(chatId, '📎 Ainda não sei processar imagens enviadas, mas salvei sua mensagem no inbox.');
  } else {
    await reply(chatId, '📥 Recebido e salvo no inbox!\n\n• Pra gerar arte, mande: `imagem: <descrição>`\n• Quando voltar ao Freebuff, é só dizer: "olha o inbox".');
  }
}

async function poll() {
  try {
    const data = await apiCall('getUpdates', {
      offset,
      timeout: 30,
      allowed_updates: ['message']
    });
    if (data.ok && Array.isArray(data.result) && data.result.length) {
      for (const update of data.result) {
        offset = Math.max(offset, update.update_id + 1);
        if (update.message) {
          if (busy) {
            // Nunca perde mensagem: registra no inbox e segue
            logMessage(update.message);
            await reply(update.message.chat.id, '⏳ Já estou processando outra mensagem. A sua foi salva no inbox.');
            continue;
          }
          busy = true;
          try {
            await handleMessage(update.message);
          } catch (e) {
            console.error('⚠ Erro no handler:', e.message);
          } finally {
            busy = false;
          }
        }
      }
    }
  } catch (e) {
    console.error('⚠ Erro no polling:', e.message);
  }
  setTimeout(poll, 2000);
}

console.log('🤖 Ponte Telegram → NUMERUS rodando. (Ctrl+C para parar)');
poll();
