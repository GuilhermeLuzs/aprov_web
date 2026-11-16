import type { Category } from '../types';
import type { ApiAverages } from './catalog';
import { apiRequest } from './client';

export type ApiMasterOverview = {
  customers: { total: number; joined: number; active: number };
  companies: { total: number; categories: number };
  items: { total: number; products: number; reviewed: number };
  categories: { category: Category; product: number; service: number }[];
  volume: { byMonth: { month: string; count: number }[]; byWeekday: number[] };
  days: ({ day: string; count: number } & ApiAverages)[];
};

export async function apiMasterOverview(from: string, to: string): Promise<ApiMasterOverview> {
  return apiRequest<ApiMasterOverview>(`panel/master/overview?${new URLSearchParams({ from, to }).toString()}`);
}
