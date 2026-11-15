import type { Category, ProductKind } from '../types';
import type { ApiAverages, ApiTagCount } from './catalog';
import { apiRequest } from './client';

export type ApiRankedItem = { id: number; title: string; kind: ProductKind; coverUrl: string | null; average: number; count: number };

export type ApiOverview = {
  totalReviews: number;
  catalog: { total: number; products: number; services: number; categories: Partial<Record<Category, number>> };
  period: {
    count: number;
    averages: ApiAverages;
    days: ({ day: string; count: number } & ApiAverages)[];
    byDay: { day: string; count: number }[];
    byWeekday: number[];
    positiveTags: ApiTagCount[];
    negativeTags: ApiTagCount[];
    best: ApiRankedItem[];
    worst: ApiRankedItem[];
  };
};

export async function apiPanelOverview(from: string, to: string): Promise<ApiOverview> {
  return apiRequest<ApiOverview>(`panel/overview?${new URLSearchParams({ from, to }).toString()}`);
}
