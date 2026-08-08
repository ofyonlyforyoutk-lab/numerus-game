#!/usr/bin/env node
/**
 * NUMERUS — Gerador de arte com Pollinations.ai (grátis, sem chave)
 *
 * Uso:
 *   node scripts/generate-art.js                 → gera todos os prompts de card-prompts.json
 *   node scripts/generate-art.js --prompt "..." --file art-phone-1.png [--seed 42]
 *                                                → gera uma imagem avulsa (usado pela ponte do Telegram)
 *
 * As imagens são salvas em client/src/assets/generated/ e o manifesto
 * (index.js) é reescrito automaticamente para o jogo usar a arte.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'client', 'src', 'assets', 'generated');
const MANIFEST = path.join(OUT_DIR, 'index.js');
const PROMPTS_FILE = path.join(__dirname, 'card-prompts.json');

const WIDTH = 700;
const HEIGHT = 980; // 5:7, mesma proporção das cartas (viewBox 100x140)
const DELAY_MS = 16000; // Pollinations anônimo: ~1 requisição a cada 15s

// Nomes de arquivo → chave usada pelo CardArt.js
const NAMED_KEYS = {
  'art-sqrt.png': 'sqrt',
  'art-multiply.png': 'multiply',
  'art-card-back.png': 'card-back'
};

function parseArgs(argv) {
  const args = { prompt: null, file: null, seed: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--prompt') args.prompt = argv[i + 1];
    else if (argv[i] === '--file') args.file = argv[i + 1];
    else if (argv[i] === '--seed') args.seed = argv[i + 1];
  }
  return args;
}

function buildUrl(prompt, seed) {
  let url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${WIDTH}&height=${HEIGHT}&model=flux&nologo=true`;
  if (seed) url += `&seed=${seed}`;
  return url;
}

async function generateOne({ prompt, file, seed }) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const dest = path.join(OUT_DIR, file);
  process.stdout.write(`🎨 Gerando "${prompt.slice(0, 55)}…" → ${file} `);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(buildUrl(prompt, seed), { redirect: 'follow', signal: AbortSignal.timeout(120000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 8000) throw new Error('resposta vazia/corrompida');
      fs.writeFileSync(dest, buf);
      console.log(`✅ (${Math.round(buf.length / 1024)} KB)`);
      return true;
    } catch (e) {
      console.log(`\n   ⚠ tentativa ${attempt}/3 falhou: ${e.message}`);
      if (attempt < 3) await new Promise(r => setTimeout(r, 6000 * attempt));
    }
  }
  console.log('❌');
  return false;
}

function keyForFile(file) {
  if (NAMED_KEYS[file]) return NAMED_KEYS[file];
  return file.replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '');
}

async function writeManifest() {
  const files = fs.existsSync(OUT_DIR)
    ? fs.readdirSync(OUT_DIR).filter(f => /\.(png|jpe?g|webp)$/i.test(f)).sort()
    : [];
  const imports = [];
  const entries = [];
  const used = new Set();
  files.forEach((f, i) => {
    const v = `art${i}`;
    let key = keyForFile(f);
    let n = 1;
    while (used.has(key)) { key = `${key}_${n++}`; }
    used.add(key);
    imports.push(`import ${v} from './${f}';`);
    entries.push(`  ${JSON.stringify(key)}: ${v}`);
  });
  const content =
    '// ⚠️ ARQUIVO GERADO AUTOMATICAMENTE por scripts/generate-art.js — não edite à mão.\n' +
    '// As chaves (sqrt, multiply, card-back…) são usadas por CardArt.js\n' +
    '// para trocar a arte SVG pela arte gerada, quando ela existir.\n' +
    imports.join('\n') + '\n\n' +
    'const GENERATED = {\n' + entries.join(',\n') + '\n};\n\n' +
    'export default GENERATED;\n';
  fs.writeFileSync(MANIFEST, content);
  console.log(`📦 Manifesto atualizado: ${files.length} imagem(ns) em assets/generated/`);
}

(async () => {
  const args = parseArgs(process.argv);
  let jobs = [];
  if (args.prompt && args.file) {
    jobs = [{ prompt: args.prompt, file: args.file, seed: args.seed }];
  } else {
    const prompts = JSON.parse(fs.readFileSync(PROMPTS_FILE, 'utf8'));
    jobs = prompts.filter(p => !fs.existsSync(path.join(OUT_DIR, p.file)));
    console.log(`📋 ${prompts.length} prompts definidos — ${jobs.length} faltando.`);
  }
  if (jobs.length === 0) {
    console.log('✨ Nada a gerar (tudo já existe).');
    await writeManifest();
    return;
  }
  let ok = 0;
  for (let i = 0; i < jobs.length; i++) {
    if (i > 0) {
      console.log(`⏳ aguardando ${DELAY_MS / 1000}s (limite do Pollinations anônimo)…`);
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
    if (await generateOne(jobs[i])) ok++;
  }
  await writeManifest();
  console.log(`🏁 ${ok}/${jobs.length} imagem(ns) gerada(s) em client/src/assets/generated/`);
})();
