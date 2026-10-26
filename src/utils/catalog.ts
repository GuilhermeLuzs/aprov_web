import type { Category, Product, ProductKind, ProductStatus, Review } from '../types';
import { reviewAverage } from './overview';

export type CatalogRow = { product: Product; average: number | null; count: number };

export function catalogRows(products: Product[], reviews: Review[]): CatalogRow[] {
  return products.map((product) => {
    const own = reviews.filter((r) => r.productId === product.id);
    const average = own.length === 0 ? null : own.reduce((sum, r) => sum + reviewAverage(r), 0) / own.length;
    return { product, average, count: own.length };
  });
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

function normalized(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

export function filterRows(rows: CatalogRow[], filters: CatalogFilters): CatalogRow[] {
  const terms = normalized(filters.query).split(/\s+/).filter(Boolean);
  return rows.filter(({ product }) => {
    if (filters.categories.length > 0 && !product.categories.some((c) => filters.categories.includes(c))) return false;
    if (filters.status && product.status !== filters.status) return false;
    if (filters.kind && product.kind !== filters.kind) return false;
    const haystack = normalized(`${product.title} ${product.description}`);
    return terms.every((term) => haystack.includes(term));
  });
}

export type SortKey = 'title' | 'average' | 'count';
export type SortDirection = 'asc' | 'desc';
export type CatalogSort = { key: SortKey; direction: SortDirection };

export const DEFAULT_SORT: CatalogSort = { key: 'title', direction: 'asc' };

export function sortRows(rows: CatalogRow[], sort: CatalogSort): CatalogRow[] {
  const sign = sort.direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (sort.key === 'average') {
      if (a.average === null || b.average === null) {
        if (a.average === b.average) return a.product.title.localeCompare(b.product.title);
        return a.average === null ? 1 : -1;
      }
      return sign * (a.average - b.average) || a.product.title.localeCompare(b.product.title);
    }
    if (sort.key === 'count') {
      return sign * (a.count - b.count) || a.product.title.localeCompare(b.product.title);
    }
    return sign * a.product.title.localeCompare(b.product.title, 'pt-BR');
  });
}

export function nextSort(current: CatalogSort, key: SortKey): CatalogSort {
  if (current.key !== key) return { key, direction: key === 'title' ? 'asc' : 'desc' };
  return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
}
