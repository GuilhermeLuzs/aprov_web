import type { ItemPayload } from '../api';
import type { CatalogItem, Category, DurationUnit, MediaKind, ProductKind, Recurrence, ServiceModality } from '../types';
import { MINUTES_PER_UNIT, type ServiceCity } from '../types';
import { MODALITY_TO_API, RECURRENCE_TO_API } from './catalog';
import { isValidCep, onlyDigits } from './validation';

export const MAX_MEDIA = 6;
export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 1000;
export const BRAND_MAX = 60;
export const DURATION_MAX_MINUTES = 7 * MINUTES_PER_UNIT.dias;

const MEGABYTE = 1024 * 1024;

const MEDIA_RULES: Record<MediaKind, { types: string[]; maxBytes: number; label: string }> = {
  photo: { types: ['image/jpeg', 'image/png', 'image/webp'], maxBytes: 5 * MEGABYTE, label: 'fotos JPG, PNG ou WebP até 5 MB' },
  video: { types: ['video/mp4', 'video/webm'], maxBytes: 50 * MEGABYTE, label: 'vídeos MP4 ou WebM até 50 MB' },
};

export const ACCEPTED_MEDIA = [...MEDIA_RULES.photo.types, ...MEDIA_RULES.video.types].join(',');
export const MEDIA_HINT = `Até ${MAX_MEDIA} arquivos: ${MEDIA_RULES.photo.label} e ${MEDIA_RULES.video.label}. A primeira foto é a capa.`;

export type FormMedia = {
  key: string;
  kind: MediaKind;
  url: string;
  posterUrl?: string;
  name: string;
  serverId: number | null;
  progress: number;
  error: string | null;
  file?: File;
};

export type ItemForm = {
  kind: ProductKind;
  title: string;
  description: string;
  categories: Category[];
  media: FormMedia[];
  brand: string;
  durationAmount: string;
  durationUnit: DurationUnit;
  recurrence: Recurrence | '';
  modality: ServiceModality | '';
  cep: string;
  cities: ServiceCity[];
};

export type ItemFormErrors = Partial<Record<keyof ItemForm, string>>;

export function emptyItemForm(kind: ProductKind): ItemForm {
  return {
    kind,
    title: '',
    description: '',
    categories: [],
    media: [],
    brand: '',
    durationAmount: '',
    durationUnit: 'horas',
    recurrence: '',
    modality: '',
    cep: '',
    cities: [],
  };
}

function mediaOf(item: CatalogItem): FormMedia[] {
  return item.media.map((file, index) => ({
    key: `salva-${file.id}`,
    kind: file.kind,
    url: file.url,
    posterUrl: file.coverUrl ?? undefined,
    name: file.kind === 'photo' ? `Foto ${index + 1}` : `Vídeo ${index + 1}`,
    serverId: file.id,
    progress: 1,
    error: null,
  }));
}

export function formFromItem(item: CatalogItem): ItemForm {
  return {
    kind: item.kind,
    title: item.title,
    description: item.description,
    categories: item.categories,
    media: mediaOf(item),
    brand: item.brand ?? '',
    ...durationFields(item.service?.durationMinutes),
    recurrence: item.service?.recurrence ?? '',
    modality: item.service?.modality ?? '',
    cep: item.service?.cep ?? '',
    cities: item.service?.cities ?? [],
  };
}

function durationFields(minutes?: number): Pick<ItemForm, 'durationAmount' | 'durationUnit'> {
  if (!minutes) return { durationAmount: '', durationUnit: 'horas' };
  const unit: DurationUnit = minutes % MINUTES_PER_UNIT.dias === 0 ? 'dias' : minutes % MINUTES_PER_UNIT.horas === 0 ? 'horas' : 'minutos';
  return { durationAmount: String(minutes / MINUTES_PER_UNIT[unit]), durationUnit: unit };
}

export function durationInMinutes(form: Pick<ItemForm, 'durationAmount' | 'durationUnit'>): number {
  return Number(form.durationAmount) * MINUTES_PER_UNIT[form.durationUnit];
}

export function coverOf(media: FormMedia[]): string {
  return media.find((item) => item.kind === 'photo')?.url ?? '';
}

export function itemPayload(form: ItemForm, creating: boolean): ItemPayload {
  const base: ItemPayload = {
    ...(creating ? { kind: form.kind } : {}),
    title: form.title.trim(),
    description: form.description.trim(),
    categories: form.categories,
    mediaIds: form.media.flatMap((item) => (item.serverId === null ? [] : [item.serverId])),
  };
  if (form.kind === 'product') return { ...base, brand: form.brand.trim() || null };
  const modality = form.modality as ServiceModality;
  return {
    ...base,
    durationMinutes: durationInMinutes(form),
    recurrence: RECURRENCE_TO_API[form.recurrence as Recurrence],
    modality: MODALITY_TO_API[modality],
    cep: modality === 'presencial' ? onlyDigits(form.cep) : null,
    cities: modality === 'domicilio' ? form.cities.map((city) => city.ibge) : [],
  };
}

const SERVER_FIELD: Record<string, keyof ItemForm> = {
  mediaIds: 'media',
  durationMinutes: 'durationAmount',
  kind: 'title',
};

export function formErrorsFromServer(errors: Record<string, string>): ItemFormErrors {
  const found: ItemFormErrors = {};
  Object.entries(errors).forEach(([field, message]) => {
    const root = field.split('.')[0];
    const key = SERVER_FIELD[root] ?? (root as keyof ItemForm);
    if (key in emptyItemForm('product') && !found[key]) found[key] = message;
  });
  return found;
}

export function validateItem(form: ItemForm): ItemFormErrors {
  const errors: ItemFormErrors = {};
  const title = form.title.trim();
  if (!title) errors.title = 'Informe o título.';
  else if (title.length > TITLE_MAX) errors.title = `Use até ${TITLE_MAX} caracteres.`;
  const description = form.description.trim();
  if (!description) errors.description = 'Descreva o item.';
  else if (description.length > DESCRIPTION_MAX) errors.description = `Use até ${DESCRIPTION_MAX} caracteres.`;
  if (form.categories.length === 0) errors.categories = 'Escolha pelo menos uma categoria.';
  if (form.media.some((item) => item.error)) errors.media = 'Tire ou envie de novo o arquivo que não subiu.';
  else if (form.media.some((item) => item.serverId === null)) errors.media = 'Espere os arquivos terminarem de enviar.';
  else if (!form.media.some((item) => item.kind === 'photo')) errors.media = 'Adicione pelo menos uma foto, que vira a capa do item.';
  else if (form.media.length > MAX_MEDIA) errors.media = `Cada item pode ter no máximo ${MAX_MEDIA} fotos ou vídeos.`;

  if (form.kind === 'product') {
    if (form.brand.trim().length > BRAND_MAX) errors.brand = `Use até ${BRAND_MAX} caracteres.`;
    return errors;
  }

  const amount = Number(form.durationAmount);
  if (!form.durationAmount.trim()) errors.durationAmount = 'Informe a duração.';
  else if (!Number.isInteger(amount) || amount < 1) errors.durationAmount = 'Use um número inteiro maior que zero.';
  else if (durationInMinutes(form) > DURATION_MAX_MINUTES) errors.durationAmount = 'A duração vai até 7 dias (168 horas).';
  if (!form.recurrence) errors.recurrence = 'Escolha a recorrência.';
  if (!form.modality) errors.modality = 'Escolha a modalidade.';
  else if (form.modality === 'presencial' && !isValidCep(form.cep)) errors.cep = 'Informe o CEP do local, com 8 números.';
  else if (form.modality === 'domicilio' && form.cities.length === 0) errors.cities = 'Adicione pelo menos uma cidade atendida.';
  return errors;
}

export type MediaRejection = { name: string; reason: string };

export function mediaKindOf(file: File): MediaKind | null {
  if (MEDIA_RULES.photo.types.includes(file.type)) return 'photo';
  if (MEDIA_RULES.video.types.includes(file.type)) return 'video';
  return null;
}

export function acceptMedia(files: File[], current: number): { accepted: { file: File; kind: MediaKind }[]; rejected: MediaRejection[] } {
  const accepted: { file: File; kind: MediaKind }[] = [];
  const rejected: MediaRejection[] = [];
  files.forEach((file) => {
    const kind = mediaKindOf(file);
    if (!kind) rejected.push({ name: file.name, reason: 'formato não aceito' });
    else if (file.size > MEDIA_RULES[kind].maxBytes) rejected.push({ name: file.name, reason: `passa de ${MEDIA_RULES[kind].maxBytes / MEGABYTE} MB` });
    else if (current + accepted.length >= MAX_MEDIA) rejected.push({ name: file.name, reason: `o item já tem ${MAX_MEDIA} arquivos` });
    else accepted.push({ file, kind });
  });
  return { accepted, rejected };
}
