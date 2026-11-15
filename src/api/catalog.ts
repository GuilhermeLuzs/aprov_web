import type { Category, MediaKind, ProductKind } from '../types';
import { apiRequest, apiUpload } from './client';

export type ApiServiceModality = 'remote' | 'on_site' | 'at_home';

export type ApiRecurrence = 'once' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export type ApiItemCity = { ibge: number; name: string; uf: string };

export type ApiItemMedia = { id: number; type: MediaKind; url: string; coverUrl: string | null };

export type ApiPanelItem = {
  id: number;
  kind: ProductKind;
  title: string;
  description: string;
  categories: Category[];
  brand: string | null;
  service: {
    durationMinutes: number | null;
    recurrence: ApiRecurrence | null;
    modality: ApiServiceModality | null;
    cep: string | null;
    cities?: ApiItemCity[];
  } | null;
  active: boolean;
  coverUrl: string | null;
  media?: ApiItemMedia[];
  averageRating: number | null;
  reviewCount: number;
};

export type ApiCatalogPage = {
  page: number;
  pageCount: number;
  total: number;
  catalogSize: number;
  categories: Category[];
  items: ApiPanelItem[];
};

export type CatalogQuery = {
  page: number;
  perPage: number;
  search: string;
  categories: Category[];
  status: 'active' | 'inactive' | '';
  kind: ProductKind | '';
  sort: 'title' | 'average' | 'count';
  direction: 'asc' | 'desc';
};

export type ItemPayload = {
  kind?: ProductKind;
  title: string;
  description: string;
  categories: Category[];
  mediaIds: number[];
  brand?: string | null;
  durationMinutes?: number;
  recurrence?: ApiRecurrence;
  modality?: ApiServiceModality;
  cep?: string | null;
  cities?: number[];
};

export type ApiAverages = {
  overall: number | null;
  delivery: number | null;
  quality: number | null;
  conformity: number | null;
  value: number | null;
};

export type ApiTagCount = { id: number; label: string; count: number };

export type ApiItemMetrics = {
  totalReviews: number;
  lastReviewDay: string | null;
  period: {
    count: number;
    averages: ApiAverages;
    days: ({ day: string; count: number } & ApiAverages)[];
    positiveTags: ApiTagCount[];
    negativeTags: ApiTagCount[];
  };
};

export type VideoDetails = { cover: Blob; width: number; height: number; durationSeconds: number };

function catalogSearch(query: CatalogQuery): string {
  const params = new URLSearchParams({
    page: String(query.page),
    perPage: String(query.perPage),
    sort: query.sort,
    direction: query.direction,
  });
  if (query.search.trim()) params.set('search', query.search.trim());
  if (query.status) params.set('status', query.status);
  if (query.kind) params.set('kind', query.kind);
  query.categories.forEach((category) => params.append('categories[]', category));
  return params.toString();
}

export async function apiPanelItems(query: CatalogQuery): Promise<ApiCatalogPage> {
  return apiRequest<ApiCatalogPage>(`panel/items?${catalogSearch(query)}`);
}

export async function apiPanelItem(id: number): Promise<ApiPanelItem> {
  return apiRequest<ApiPanelItem>(`panel/items/${id}`);
}

export async function apiCreateItem(payload: ItemPayload): Promise<ApiPanelItem> {
  return apiRequest<ApiPanelItem>('panel/items', { method: 'POST', body: payload });
}

export async function apiUpdateItem(id: number, payload: ItemPayload): Promise<ApiPanelItem> {
  return apiRequest<ApiPanelItem>(`panel/items/${id}`, { method: 'PUT', body: payload });
}

export async function apiSetItemStatus(id: number, active: boolean): Promise<{ id: number; active: boolean }> {
  return apiRequest<{ id: number; active: boolean }>(`panel/items/${id}/status`, { method: 'PATCH', body: { active } });
}

export async function apiItemMetrics(id: number, from: string, to: string): Promise<ApiItemMetrics> {
  return apiRequest<ApiItemMetrics>(`panel/items/${id}/metrics?${new URLSearchParams({ from, to }).toString()}`);
}

export async function apiUploadItemMedia(
  file: File,
  video: VideoDetails | null,
  onProgress: (fraction: number) => void,
): Promise<ApiItemMedia> {
  const form = new FormData();
  form.append('file', file);
  if (video) {
    form.append('cover', video.cover, 'capa.jpg');
    form.append('width', String(video.width));
    form.append('height', String(video.height));
    form.append('durationSeconds', String(video.durationSeconds));
  }
  return apiUpload<ApiItemMedia>('panel/item-media', form, onProgress);
}
