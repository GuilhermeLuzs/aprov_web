import type { Category } from './company';

export type ProductKind = 'product' | 'service';

export const PRODUCT_KIND_LABEL: Record<ProductKind, string> = {
  product: 'Produto',
  service: 'Serviço',
};

export type ProductStatus = 'active' | 'inactive';

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
};

export type MediaKind = 'photo' | 'video';

export type ProductMedia = {
  id: string;
  kind: MediaKind;
  url: string;
  name: string;
};

export type ServiceModality = 'remoto' | 'presencial' | 'domicilio';

export const SERVICE_MODALITY_LABEL: Record<ServiceModality, string> = {
  remoto: 'Remoto',
  presencial: 'Presencial',
  domicilio: 'A domicílio',
};

export type DurationUnit = 'minutos' | 'horas' | 'dias';

export const DURATION_UNIT_LABEL: Record<DurationUnit, string> = {
  minutos: 'minutos',
  horas: 'horas',
  dias: 'dias',
};

export type Recurrence = 'unica' | 'semanal' | 'quinzenal' | 'mensal' | 'anual';

export const RECURRENCE_LABEL: Record<Recurrence, string> = {
  unica: 'Única',
  semanal: 'Semanal',
  quinzenal: 'Quinzenal',
  mensal: 'Mensal',
  anual: 'Anual',
};

export const MINUTES_PER_UNIT: Record<DurationUnit, number> = {
  minutos: 1,
  horas: 60,
  dias: 1440,
};

export type BrazilState = { uf: string; name: string };

export type ServiceCity = { ibge: number; name: string; uf: string };

export type MunicipalityData = {
  states: BrazilState[];
  citiesByUf: Record<string, ServiceCity[]>;
};

export type ServiceDetails = {
  durationMinutes: number;
  recurrence: Recurrence;
  modality: ServiceModality;
  cep?: string;
  cities?: ServiceCity[];
};

export type Product = {
  id: string;
  companyId: string;
  kind: ProductKind;
  categories: Category[];
  title: string;
  description: string;
  imageUrl: string;
  media?: ProductMedia[];
  brand?: string;
  service?: ServiceDetails;
  status: ProductStatus;
  coinsReward: number;
  xpReward: number;
};
