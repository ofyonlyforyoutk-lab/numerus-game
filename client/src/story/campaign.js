/**
 * NUMERUS - Modo História
 * A jornada dos Dez Círculos: duelo contra os Mestres lendários da Ordem.
 * Cada vitória abre o próximo círculo e eleva seu título.
 */

export const STORY_TITLES = [
  'Aprendiz', 'Escrevente', 'Iniciado', 'Sábio', 'Estrategista',
  'Arquimestre', 'Guardião', 'Lenda', 'Códice Vivo', 'NUMERUS'
];

export const MAX_CHAPTERS = 10;

export const CHAPTERS = [
  {
    id: 1,
    name: 'O Primeiro Círculo',
    master: 'Papiro, o Escriba',
    difficulty: 'aprendiz',
    bonus: 0,
    lore: 'Às margens do Rio de Tinta, o velho Papiro testa todo recém-chegado à Ordem. Dizem que quem o vence nunca mais teme os números.',
    quote: '"Todo Mestre já foi aprendiz. Mas nem todo aprendiz se torna Mestre."'
  },
  {
    id: 2,
    name: 'O Segundo Selo',
    master: 'Tinta, a Copista',
    difficulty: 'aprendiz',
    bonus: 0,
    lore: 'Tinta copia cada jogada de seus oponentes antes de respondê-la. Seu pergaminho não perdoa hesitações — nem erros de cálculo.',
    quote: '"A caneta é mais afiada que a espada... quando sabe escrever a equação certa."'
  },
  {
    id: 3,
    name: 'O Círculo das Lâminas',
    master: 'Espada, a Audaz',
    difficulty: 'estrategista',
    bonus: 2,
    lore: 'A arena dos duelistas sagrados. Espada aposta alto e não recua diante de nenhum número — o pote dela sempre transborda de ousadia.',
    quote: '"Coragem não é não ter medo. É apostar quando a equação ainda não se revelou."'
  },
  {
    id: 4,
    name: 'Os Quatro Ventos',
    master: 'Escudo, o Firme',
    difficulty: 'estrategista',
    bonus: 4,
    lore: 'Escudo defende a passagem dos Quatro Ventos. Ele nunca aposta por impulso: cada ficha gasta é um passo calculado em seu plano.',
    quote: '"A paciência divide. A pressa multiplica. Só a sabedoria soma."'
  },
  {
    id: 5,
    name: 'O Círculo dos Sábios',
    master: 'Teorema, o Geômetra',
    difficulty: 'mestre',
    bonus: 6,
    lore: 'Na biblioteca infinita, Teorema enxerga padrões onde outros veem caos. Suas equações nascem perfeitas — e implacáveis.',
    quote: '"Tudo o que existe pode ser provado. Até o seu destino."'
  },
  {
    id: 6,
    name: 'A Torre de Marfim',
    master: 'Integral, a Calculista',
    difficulty: 'mestre',
    bonus: 8,
    lore: 'No alto da torre, Integral soma séculos de conhecimento. Nenhum aprendiz jamais subiu esses degraus sem suar números.',
    quote: '"O infinito é grande, mas a soma dos seus erros será maior ainda."'
  },
  {
    id: 7,
    name: 'O Círculo do Trono',
    master: 'Coroa, o Arquimestre',
    difficulty: 'arquimestre',
    bonus: 10,
    lore: 'A Ordem inteira se curva diante de Coroa. Seu cetro aponta para o número exato — e ele nunca se engana duas vezes.',
    quote: '"Os reis governam homens. Os Arquimestres governam números."'
  },
  {
    id: 8,
    name: 'A Última Biblioteca',
    master: 'Cetro, o Erudito',
    difficulty: 'arquimestre',
    bonus: 12,
    lore: 'Nenhum livro desta biblioteca foi aberto por séculos. Cetro guarda os segredos das dez escolas — e não entrega nenhum de graça.',
    quote: '"Conhecimento é poder. Mas poder sem equação é apenas ruído."'
  },
  {
    id: 9,
    name: 'O Círculo dos Magnos',
    master: 'Morgana, a Enigmática',
    difficulty: 'magno',
    bonus: 14,
    lore: 'Dizem que Morgana vê o resultado da equação antes de ela existir. Poucos a desafiaram; nenhum a venceu nesta era.',
    quote: '"O futuro é uma variável. Eu apenas a isolo."'
  },
  {
    id: 10,
    name: 'NUMERUS',
    master: 'O Códice Vivo',
    difficulty: 'magno',
    bonus: 16,
    lore: 'No centro de todos os círculos, o próprio Códice tomou forma. Ele é o jogo, as regras e o número final. Derrote-o... e torne-se a equação suprema.',
    quote: '"Eu sou o Um que se soma a todos. Prove que você é maior."'
  }
];

export function titleForStars(stars) {
  if (stars <= 0) return STORY_TITLES[0];
  return STORY_TITLES[Math.min(stars, STORY_TITLES.length) - 1];
}

export function isChapterUnlocked(chapterId, completed) {
  if (chapterId <= 1) return true;
  return !!completed[chapterId - 1];
}

export const STORY_LOCAL_KEY = 'numerus_story_progress';

export function defaultProgress() {
  return { title: 'Aprendiz', stars: 0, completed: {}, gamesPlayed: 0, wins: 0 };
}
