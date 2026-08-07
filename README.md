# ⚔️ NUMERUS - Master the Equation

Jogo de cartas multiplayer de estratégia e matemática, inspirado no RPG de mesa NUMERUS.

**Domine a Equação. Escolha o seu Destino.**

## 🎮 Funcionalidades

- **Modo CPU** — 5 dificuldades: Aprendiz, Estrategista, Mestre dos Números, Arquimestre e O Magno
- **Multiplayer Online** — salas com código, até 6 jogadores, tempo real via Socket.io
- **10 Círculos (rodadas)** — do Despertar ao Grande Julgamento
- **3 Destinos** — Simplicidade (I ≈ 1), Grandeza (XX ≈ 20) e Duplo Juramento
- **O Códice** — folheie o manual original do jogo dentro do app
- Visual medieval animado + sons sintetizados (Web Audio API)

## 🚀 Rodando localmente

```bash
# Instalar dependências do servidor
npm install

# Instalar e compilar o cliente
cd client && npm install && npm run build && cd ..

# Iniciar o servidor
npm start
```

Acesse **http://localhost:3001**

## 🌍 Colocando Online (gratuito)

O jogo já é um app único: o servidor Express serve o frontend React compilado
e o Socket.io na mesma porta. Basta hospedar em qualquer plataforma com
**servidor Node persistente** (WebSockets não funcionam em serverless como Vercel).

### Opção A — Render (recomendado, grátis)

1. Crie um repositório no GitHub e suba o **conteúdo da pasta `numerus-game`**
   (server/, client/, render.yaml e package.json devem ficar na RAIZ do repositório)
2. Acesse [render.com](https://render.com) → **New → Blueprint**
3. Conecte seu repositório (o `render.yaml` configura tudo automaticamente)
4. Pronto! Você recebe uma URL tipo `https://numerus-game.onrender.com`

> ⚠️ No plano gratuito o servidor "dorme" após 15 min sem visitas
> e acorda em ~1 min quando alguém acessa. É normal!

### Opção B — Zeabur (grátis)

1. Acesse [zeabur.com](https://zeabur.com) e conecte seu GitHub
2. Crie um serviço apontando para a pasta `numerus-game`
3. O Zeabur detecta Node.js automaticamente

### Opção C — Render via CLI (sem GitHub)

```bash
npm i -g @renderinc/cli
render login
render blueprint launch
```

## 📁 Estrutura

```
numerus-game/
├── server/
│   ├── index.js          # Express + Socket.io (multiplayer)
│   ├── game-logic.js     # Regras completas (10 rodadas, equações, destinos)
│   └── cpu-player.js     # IA dos 5 níveis de dificuldade
├── client/
│   ├── public/assets/    # Páginas do manual + cartas extraídas do PDF
│   └── src/              # React app (menu, mesa de jogo, código)
├── render.yaml           # Blueprint de deploy automático (Render)
└── package.json          # Scripts de build/start
```

## 🛡️ Anti-cheat

Toda a lógica do jogo roda no servidor. O cliente apenas envia ações
e recebe o estado público — nunca é confiável para calcular resultados.
