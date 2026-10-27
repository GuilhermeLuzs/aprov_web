import type { ProductKind } from './catalog';

export type CoinIcon =
  | 'coins'
  | 'cpu'
  | 'utensils'
  | 'sparkles'
  | 'snowflake'
  | 'coffee'
  | 'eye'
  | 'paw-print'
  | 'book-open'
  | 'hammer'
  | 'heart-pulse'
  | 'zap'
  | 'graduation-cap'
  | 'star'
  | 'heart'
  | 'leaf'
  | 'gem'
  | 'flame';

export const COIN_ICONS: CoinIcon[] = [
  'coins',
  'utensils',
  'coffee',
  'cpu',
  'sparkles',
  'snowflake',
  'eye',
  'paw-print',
  'book-open',
  'hammer',
  'heart-pulse',
  'zap',
  'graduation-cap',
  'star',
  'heart',
  'leaf',
  'gem',
  'flame',
];

export type RewardTopic = 'review' | 'tags' | 'video' | 'photos' | 'photoInUse' | 'longComment' | 'consistentComment';

export const REWARD_TOPICS_BY_KIND: Record<ProductKind, RewardTopic[]> = {
  product: ['review', 'tags', 'video', 'photos', 'photoInUse', 'longComment', 'consistentComment'],
  service: ['review', 'tags', 'photos', 'longComment', 'consistentComment'],
};

export const REWARD_TOPIC_LABEL: Record<RewardTopic, string> = {
  review: 'Fez a avaliação',
  tags: 'Marcou palavras-chave',
  video: 'Mandou vídeo',
  photos: 'Mandou fotos válidas',
  photoInUse: 'Foto com a pessoa usando o produto',
  longComment: 'Comentário longo',
  consistentComment: 'Comentário condizente',
};

export const REWARD_TOPIC_HINT: Partial<Record<RewardTopic, string>> = {
  review: 'Só os campos obrigatórios.',
  photos: 'Depende da verificação automática das fotos.',
  photoInUse: 'Depende da verificação automática das fotos.',
  consistentComment: 'Fala das palavras-chave marcadas. Analisado por IA.',
};

export type RewardThreshold = { unit: string; min: number };

export const REWARD_THRESHOLD: Partial<Record<RewardTopic, RewardThreshold>> = {
  tags: { unit: 'palavras-chave', min: 1 },
  photos: { unit: 'fotos', min: 1 },
  longComment: { unit: 'caracteres', min: 1 },
};

export type RewardRule = { coins: number; threshold?: number };

export type RewardTable = Partial<Record<RewardTopic, RewardRule>>;

export type CoinSettings = {
  companyId: string;
  enabled: boolean;
  name: string;
  color: string;
  icon: CoinIcon;
  valueInReais: number;
  rewards: Record<ProductKind, RewardTable>;
};

export const COIN_ICON_LABEL: Record<CoinIcon, string> = {
  coins: 'Moedas',
  cpu: 'Chip',
  utensils: 'Talheres',
  sparkles: 'Brilho',
  snowflake: 'Floco de neve',
  coffee: 'Café',
  eye: 'Olho',
  'paw-print': 'Pata',
  'book-open': 'Livro',
  hammer: 'Martelo',
  'heart-pulse': 'Batimento',
  zap: 'Raio',
  'graduation-cap': 'Capelo',
  star: 'Estrela',
  heart: 'Coração',
  leaf: 'Folha',
  gem: 'Diamante',
  flame: 'Chama',
};
