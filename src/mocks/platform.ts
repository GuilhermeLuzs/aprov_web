import { CHARACTERISTICS, type Characteristic, type Customer, type Review } from '../types';
import { mockToday } from './clock';
import { partnerProducts } from './partnerProducts';
import { reviews as companyReviews } from './reviews';

const DAY_MS = 24 * 60 * 60 * 1000;
const LAUNCH_DAY = '2025-10-01';
const FIRST_PARTNER_REVIEW_DAY = '2025-11-01';
const CUSTOMER_COUNT = 360;
const ACTIVE_SHARE = 0.58;
const ACTIVE_WINDOW_DAYS = 30;
const XP_PER_REVIEW = 25;
const POINTS_PER_REVIEW = 10;

const WEEKDAY_WEIGHT = [1.35, 1.15, 0.85, 0.85, 0.95, 1.1, 1.45];

const COMPANY_QUALITY: Record<string, number> = {
  c3: 4.0,
  c4: 4.4,
  c5: 3.8,
  c6: 3.3,
  c7: 4.2,
  c8: 4.5,
  c9: 4.6,
  c10: 4.3,
};

const FIRST_NAMES = [
  'Ana', 'Beatriz', 'Bruno', 'Camila', 'Carlos', 'Daniela', 'Diego', 'Eduarda', 'Felipe', 'Fernanda',
  'Gabriel', 'Giovana', 'Gustavo', 'Helena', 'Igor', 'Isabela', 'João', 'Juliana', 'Larissa', 'Leonardo',
  'Lucas', 'Luana', 'Marcos', 'Mariana', 'Mateus', 'Natália', 'Otávio', 'Patrícia', 'Pedro', 'Rafaela',
  'Renato', 'Sabrina', 'Samuel', 'Tatiane', 'Thiago', 'Valéria', 'Vinícius', 'Yasmin', 'Rodrigo', 'Letícia',
];

const LAST_NAMES = [
  'Almeida', 'Barbosa', 'Cardoso', 'Carvalho', 'Costa', 'Dias', 'Ferreira', 'Gomes', 'Lima', 'Martins',
  'Melo', 'Monteiro', 'Moreira', 'Nascimento', 'Oliveira', 'Pereira', 'Ribeiro', 'Rocha', 'Santos', 'Silva',
  'Souza', 'Teixeira', 'Vieira', 'Azevedo', 'Campos', 'Freitas', 'Mendes', 'Nunes', 'Pinto', 'Ramos',
];

const CITIES: [string, string][] = [
  ['São Paulo', 'SP'],
  ['Campinas', 'SP'],
  ['Taubaté', 'SP'],
  ['Rio de Janeiro', 'RJ'],
  ['Belo Horizonte', 'MG'],
  ['Juiz de Fora', 'MG'],
  ['Curitiba', 'PR'],
  ['Porto Alegre', 'RS'],
  ['Florianópolis', 'SC'],
  ['Salvador', 'BA'],
  ['Recife', 'PE'],
  ['Fortaleza', 'CE'],
  ['Goiânia', 'GO'],
  ['Brasília', 'DF'],
  ['Manaus', 'AM'],
  ['Belém', 'PA'],
];

const EMAIL_DOMAINS = ['email.com', 'correio.com.br', 'caixapostal.com'];

type Band = 'good' | 'mixed' | 'bad';

const TITLES: Record<Band, string[]> = {
  good: [
    'Superou o que eu esperava',
    'Recomendo sem medo',
    'Compraria de novo',
    'Muito bom, vale cada centavo',
    'Atendimento e qualidade excelentes',
    'Exatamente o que eu precisava',
  ],
  mixed: [
    'Bom, mas pode melhorar',
    'Cumpre o que promete, sem surpresas',
    'Gostei, com ressalvas',
    'Razoável pelo preço',
    'Esperava um pouco mais',
  ],
  bad: [
    'Não recomendo',
    'Bem diferente do anunciado',
    'Tive problemas desde o início',
    'Decepcionante',
    'Não valeu o que paguei',
  ],
};

const COMMENTS: Record<Band, string[]> = {
  good: [
    'Chegou tudo certinho e antes do prazo. Já indiquei para a família.',
    'Dá para ver o cuidado em cada detalhe. Vou voltar a comprar.',
    'Foi a primeira vez e me surpreendeu. O atendimento também foi ótimo.',
    'Uso todo dia e continua como novo.',
  ],
  mixed: [
    'O resultado foi bom, mas a comunicação podia ser mais rápida.',
    'Nada de errado, mas também nada de especial.',
    'Funciona bem, só achei o preço um pouco salgado.',
    'Demorou mais do que o combinado, mas valeu a espera.',
  ],
  bad: [
    'Precisei entrar em contato três vezes para resolver.',
    'Veio com defeito e a troca demorou semanas.',
    'O que chegou não tem nada a ver com as fotos.',
    'Pelo preço, esperava muito mais cuidado.',
  ],
};

const GENERIC_TAGS: { id: string; positive: boolean; characteristic: Characteristic }[] = [
  { id: 't01', positive: true, characteristic: 'entrega' },
  { id: 't02', positive: true, characteristic: 'entrega' },
  { id: 't09', positive: true, characteristic: 'entrega' },
  { id: 't03', positive: true, characteristic: 'qualidade' },
  { id: 't04', positive: true, characteristic: 'qualidade' },
  { id: 't05', positive: true, characteristic: 'conformidade' },
  { id: 't07', positive: true, characteristic: 'conformidade' },
  { id: 't08', positive: true, characteristic: 'conformidade' },
  { id: 't10', positive: true, characteristic: 'custoBeneficio' },
  { id: 't11', positive: true, characteristic: 'custoBeneficio' },
  { id: 't12', positive: true, characteristic: 'custoBeneficio' },
  { id: 't13', positive: false, characteristic: 'entrega' },
  { id: 't14', positive: false, characteristic: 'entrega' },
  { id: 't15', positive: false, characteristic: 'qualidade' },
  { id: 't20', positive: false, characteristic: 'qualidade' },
  { id: 't16', positive: false, characteristic: 'conformidade' },
  { id: 't18', positive: false, characteristic: 'conformidade' },
  { id: 't19', positive: false, characteristic: 'conformidade' },
  { id: 't21', positive: false, characteristic: 'custoBeneficio' },
  { id: 't22', positive: false, characteristic: 'custoBeneficio' },
];

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = seededRandom(2026);

function between(min: number, max: number): number {
  return min + random() * (max - min);
}

function whole(min: number, max: number): number {
  return Math.floor(between(min, max + 1));
}

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(random() * list.length)];
}

function pickSome<T>(list: readonly T[], max: number): T[] {
  return [...list].sort(() => random() - 0.5).slice(0, whole(0, Math.min(max, list.length)));
}

function shiftDay(day: string, days: number): string {
  return new Date(new Date(`${day}T00:00:00.000Z`).getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

function daysBetween(start: string, end: string): number {
  return Math.round((new Date(`${end}T00:00:00.000Z`).getTime() - new Date(`${start}T00:00:00.000Z`).getTime()) / DAY_MS);
}

function timestamp(day: string, fromHour: number, toHour: number): string {
  const hour = String(whole(fromHour, toHour)).padStart(2, '0');
  const minute = String(whole(0, 59)).padStart(2, '0');
  return `${day}T${hour}:${minute}:00.000Z`;
}

function slug(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function cpfCheckDigit(digits: number[]): number {
  const weightStart = digits.length + 1;
  const rest = (digits.reduce((sum, digit, i) => sum + digit * (weightStart - i), 0) * 10) % 11;
  return rest === 10 ? 0 : rest;
}

function randomCpf(): string {
  const digits = Array.from({ length: 9 }, () => whole(0, 9));
  digits.push(cpfCheckDigit(digits));
  digits.push(cpfCheckDigit(digits));
  const text = digits.join('');
  return `${text.slice(0, 3)}.${text.slice(3, 6)}.${text.slice(6, 9)}-${text.slice(9)}`;
}

const totalDays = daysBetween(LAUNCH_DAY, mockToday);
const firstReviewDay = companyReviews.map((r) => r.createdAt.slice(0, 10)).sort()[0];
const companyAuthorIds = [...new Set(companyReviews.map((r) => r.authorId))];

function signupDay(id: string): string {
  if (companyAuthorIds.includes(id)) return shiftDay(LAUNCH_DAY, whole(0, Math.min(30, daysBetween(LAUNCH_DAY, firstReviewDay))));
  return shiftDay(LAUNCH_DAY, Math.floor(totalDays * Math.sqrt(random())));
}

function lastActiveDay(createdDay: string): string {
  const windowStart = shiftDay(mockToday, -(ACTIVE_WINDOW_DAYS - 1));
  if (createdDay >= windowStart || random() < ACTIVE_SHARE) {
    const from = createdDay > windowStart ? createdDay : windowStart;
    return shiftDay(from, whole(0, daysBetween(from, mockToday)));
  }
  return shiftDay(createdDay, whole(0, daysBetween(createdDay, windowStart) - 1));
}

const baseCustomers: Customer[] = Array.from({ length: CUSTOMER_COUNT }, (_, index) => {
  const id = `u${index + 2}`;
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const [city, uf] = pick(CITIES);
  const username = `${slug(first)}.${slug(last)}${whole(1, 99)}`;
  const createdDay = signupDay(id);
  const createdAt = timestamp(createdDay, 8, 22);
  const lastActiveAt = timestamp(lastActiveDay(createdDay), 8, 23);
  return {
    id,
    name: `${first} ${last}`,
    username,
    email: `${username}@${pick(EMAIL_DOMAINS)}`,
    cpf: randomCpf(),
    birthDate: `${whole(1960, 2007)}-${String(whole(1, 12)).padStart(2, '0')}-${String(whole(1, 28)).padStart(2, '0')}`,
    city,
    uf,
    createdAt,
    lastActiveAt: lastActiveAt > createdAt ? lastActiveAt : createdAt,
    xp: 0,
    points: 0,
  };
}).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

function rating(quality: number): number {
  return Math.min(5, Math.max(1, Math.round((quality + between(-1.7, 1.1)) * 2) / 2));
}

function bandOf(average: number): Band {
  if (average >= 3.8) return 'good';
  if (average > 2.5) return 'mixed';
  return 'bad';
}

function buildPartnerReviews(): Review[] {
  const built: Review[] = [];
  const span = daysBetween(FIRST_PARTNER_REVIEW_DAY, mockToday);
  for (let offset = 0; offset <= span; offset++) {
    const day = shiftDay(FIRST_PARTNER_REVIEW_DAY, offset);
    const authors = baseCustomers.filter((c) => c.createdAt.slice(0, 10) < day && c.lastActiveAt.slice(0, 10) >= day);
    if (authors.length === 0) continue;
    const weekday = new Date(`${day}T00:00:00.000Z`).getUTCDay();
    const expected = (1 + 14 * (offset / span) ** 1.3) * WEEKDAY_WEIGHT[weekday] * between(0.7, 1.3);
    for (let n = 0; n < Math.round(expected); n++) {
      const product = pick(partnerProducts);
      const quality = COMPANY_QUALITY[product.companyId] ?? 4;
      const ratings = Object.fromEntries(CHARACTERISTICS.map((key) => [key, rating(quality)])) as Record<Characteristic, number>;
      const average = CHARACTERISTICS.reduce((sum, key) => sum + ratings[key], 0) / CHARACTERISTICS.length;
      const band = bandOf(average);
      const positive = GENERIC_TAGS.filter((tag) => tag.positive && ratings[tag.characteristic] >= 4);
      const negative = GENERIC_TAGS.filter((tag) => !tag.positive && ratings[tag.characteristic] <= 2.5);
      built.push({
        id: `r${1000 + built.length}`,
        productId: product.id,
        companyId: product.companyId,
        authorId: pick(authors).id,
        createdAt: timestamp(day, 10, 23),
        title: pick(TITLES[band]),
        ratings,
        positiveTagIds: pickSome(positive, 2).map((tag) => tag.id),
        negativeTagIds: pickSome(negative, 2).map((tag) => tag.id),
        comment: random() < 0.4 ? '' : pick(COMMENTS[band]),
        wouldBuyAgain: band === 'good' ? true : band === 'bad' ? false : random() < 0.5 ? null : true,
        agreements: whole(0, 25),
        disagreements: whole(0, 6),
      });
    }
  }
  return built;
}

export const partnerReviews = buildPartnerReviews();

export const customers: Customer[] = baseCustomers.map((customer) => {
  const own = [...companyReviews, ...partnerReviews].filter((r) => r.authorId === customer.id);
  const lastReview = own.map((r) => r.createdAt).sort().at(-1);
  return {
    ...customer,
    lastActiveAt: lastReview && lastReview > customer.lastActiveAt ? lastReview : customer.lastActiveAt,
    xp: own.length * XP_PER_REVIEW + whole(0, 80),
    points: own.length * POINTS_PER_REVIEW + whole(0, 120),
  };
});
