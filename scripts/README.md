# Scripts do NUMERUS

## 🎨 Gerador de arte (Pollinations.ai — grátis, sem conta, sem chave)

Gera imagens de cartas em estilo fantasia e salva em `client/src/assets/generated/`,
reescrevendo o manifesto `index.js` automaticamente. Quando a arte existe, o jogo
a usa no lugar do SVG (cartas especiais √ e ×, e o verso da carta).

```bash
# Gera todas as imagens definidas em scripts/card-prompts.json
node scripts/generate-art.js

# Gera uma imagem avulsa (usado pela ponte do Telegram)
node scripts/generate-art.js --prompt "um dragão de ouro segurando um papiro" --file art-phone-1.png
```

> Limite do Pollinations anônimo: ~1 imagem a cada 15s. As imagens geradas
> **devem ser commitadas** (o Render monta o jogo a partir do repositório).

## 🤖 Ponte Telegram (mensagens do celular)

Faz o seu celular conversar com o projeto enquanto você está fora do computador:

1. No Telegram, fale com **@BotFather** → `/newbot` → escolha um nome → copie o **token**.
2. Rode no PC:
   ```bash
   TELEGRAM_TOKEN=123456:ABC-DEF node scripts/telegram-bridge.js
   ```

   Opcional — só aceitar mensagens dos SEUS IDs do Telegram (ache no @userinfobot):
   ```bash
   ALLOWED_USER_IDS=123456789,987654321 TELEGRAM_TOKEN=... node scripts/telegram-bridge.js
   ```
3. Mande mensagens para o bot pelo celular:
   - Texto livre → salvo em `inbox/messages.md`
   - `imagem: um dragão de ouro segurando um papiro` → gera a imagem automaticamente
     em `client/src/assets/generated/art-phone-N.png` e te avisa no Telegram.

**Como a sincronização funciona (sem enrolação):** o bot escuta e registra 24/7,
mas quem executa as tarefas (ler o inbox, integrar arte nova no jogo, responder com
conteúdo) é o assistente do Freebuff. Então o fluxo é: manda no Telegram → volta ao
Freebuff → diz **"olha o inbox"** → o assistente lê tudo (mensagens + prompts
pendentes em `inbox/pending-prompts.json`), gera/integra o que faltar e te responde.

> O `inbox/` é ignorado pelo git — mensagens pessoais nunca vão para o GitHub.
