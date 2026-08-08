/**
 * NUMERUS - Chapter definitions for the server.
 * Used to spawn the boss (CPU Master) in co-op story rooms.
 * Mirrors the client-side campaign data.
 */

const CHAPTERS = [
  { id: 1, name: 'O Primeiro Círculo', master: 'Papiro, o Escriba', difficulty: 'aprendiz', bonus: 0 },
  { id: 2, name: 'O Segundo Selo', master: 'Tinta, a Copista', difficulty: 'aprendiz', bonus: 0 },
  { id: 3, name: 'O Círculo das Lâminas', master: 'Espada, a Audaz', difficulty: 'estrategista', bonus: 2 },
  { id: 4, name: 'Os Quatro Ventos', master: 'Escudo, o Firme', difficulty: 'estrategista', bonus: 4 },
  { id: 5, name: 'O Círculo dos Sábios', master: 'Teorema, o Geômetra', difficulty: 'mestre', bonus: 6 },
  { id: 6, name: 'A Torre de Marfim', master: 'Integral, a Calculista', difficulty: 'mestre', bonus: 8 },
  { id: 7, name: 'O Círculo do Trono', master: 'Coroa, o Arquimestre', difficulty: 'arquimestre', bonus: 10 },
  { id: 8, name: 'A Última Biblioteca', master: 'Cetro, o Erudito', difficulty: 'arquimestre', bonus: 12 },
  { id: 9, name: 'O Círculo dos Magnos', master: 'Morgana, a Enigmática', difficulty: 'magno', bonus: 14 },
  { id: 10, name: 'NUMERUS', master: 'O Códice Vivo', difficulty: 'magno', bonus: 16 }
];

function getChapter(id) {
  return CHAPTERS.find((c) => c.id === Number(id)) || null;
}

function cpuThinkMs(difficulty) {
  return difficulty === 'magno' ? 1400 :
         difficulty === 'arquimestre' ? 1100 :
         difficulty === 'mestre' ? 900 :
         difficulty === 'estrategista' ? 700 : 500;
}

module.exports = { CHAPTERS, getChapter, cpuThinkMs };
