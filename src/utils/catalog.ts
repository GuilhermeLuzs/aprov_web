import type { ApiPanelItem, ApiRecurrence, ApiServiceModality, CatalogQuery } from '../api';
import type { CatalogItem, Category, Product, ProductKind, ProductStatus, Recurrence, Review, ServiceModality } from '../types';
import { reviewAverage } from './overview';
import { formatCep } from './validation';

export type CatalogRow = { product: Product; average: number | null; count: number };

export function catalogRows(products: Product[], reviews: Review[]): CatalogRow[] {
  return products.map((product) => {
    const own = reviews.filter((r) => r.productId === product.id);
    const average = own.length === 0 ? null : own.reduce((sum, r) => sum + reviewAverage(r), 0) / own.length;
    return { product, average, count: own.length };
  });
}

export const MODALITY_FROM_API: Record<ApiServiceModality, ServiceModality> = {
  remote: 'remoto',
  on_site: 'presencial',
  at_home: 'domicilio',
};

export const MODALITY_TO_API: Record<ServiceModality, ApiServiceModality> = {
  remoto: 'remote',
  presencial: 'on_site',
  domicilio: 'at_home',
};

export const RECURRENCE_FROM_API: Record<ApiRecurrence, Recurrence> = {
  once: 'unica',
  weekly: 'semanal',
  biweekly: 'quinzenal',
  monthly: 'mensal',
  yearly: 'anual',
};

export const RECURRENCE_TO_API: Record<Recurrence, ApiRecurrence> = {
  unica: 'once',
  semanal: 'weekly',
  quinzenal: 'biweekly',
  mensal: 'monthly',
  anual: 'yearly',
};

export function catalogItemFromApi(item: ApiPanelItem): CatalogItem {
  const service = item.service;
  return {
    id: item.id,
    kind: item.kind,
    categories: item.categories,
    title: item.title,
    description: item.description,
    coverUrl: item.coverUrl ?? '',
    media: (item.media ?? []).map((file) => ({ id: file.id, kind: file.type, url: file.url, coverUrl: file.coverUrl })),
    brand: item.brand ?? undefined,
    service:
      service && service.durationMinutes && service.recurrence && service.modality
        ? {
            durationMinutes: service.durationMinutes,
            recurrence: RECURRENCE_FROM_API[service.recurrence],
            modality: MODALITY_FROM_API[service.modality],
            cep: service.cep ? formatCep(service.cep) : undefined,
            cities: service.cities ?? [],
          }
        : undefined,
    status: item.active ? 'active' : 'inactive',
    average: item.averageRating,
    count: item.reviewCount,
  };
}

export type CatalogFilters = {
  query: string;
  categories: Category[];
  status: ProductStatus | '';
  kind: ProductKind | '';
};

export const EMPTY_FILTERS: CatalogFilters = { query: '', categories: [], status: '', kind: '' };

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return filters.query.trim() !== '' || filters.categories.length > 0 || filters.status !== '' || filters.kind !== '';
}

export type SortKey = 'title' | 'average' | 'count';
export type SortDirection = 'asc' | 'desc';
export type CatalogSort = { key: SortKey; direction: SortDirection };

export const DEFAULT_SORT: CatalogSort = { key: 'title', direction: 'asc' };

export function nextSort(current: CatalogSort, key: SortKey): CatalogSort {
  if (current.key !== key) return { key, direction: key === 'title' ? 'asc' : 'desc' };
  return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
}

export function catalogQueryOf(filters: CatalogFilters, search: string, sort: CatalogSort, page: number, perPage: number): CatalogQuery {
  return {
    page,
    perPage,
    search,
    categories: filters.categories,
    status: filters.status,
    kind: filters.kind,
    sort: sort.key,
    direction: sort.direction,
  };
}
