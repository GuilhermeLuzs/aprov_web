import type { CoinIcon, ProductKind } from '../types';
import { apiRequest } from './client';

export type ApiRewardTopic =
  | 'completed_review'
  | 'min_tags'
  | 'sent_video'
  | 'min_valid_photos'
  | 'min_comment_length'
  | 'coherent_comment'
  | 'photo_in_use';

export type ApiRewardRule = { coins: number; threshold: number | null };

export type ApiCoinSettings = {
  enabled: boolean;
  name: string;
  color: string;
  icon: CoinIcon;
  valueInReais: number;
  rewards: Record<ProductKind, Partial<Record<ApiRewardTopic, ApiRewardRule>>>;
};

export type CoinSettingsPayload = Omit<ApiCoinSettings, 'enabled'>;

export type ApiCoinDay = { day: string; earned: number; redeemed: number; reviews: number; coupons: number };

export type ApiCoinPerformance = {
  everEarned: number;
  inHands: number;
  period: {
    earned: number;
    reviews: number;
    redeemed: number;
    coupons: number;
    days: ApiCoinDay[];
    topics: { topic: ApiRewardTopic | null; coins: number }[];
  };
};

export async function apiCoinSettings(): Promise<ApiCoinSettings> {
  return apiRequest<ApiCoinSettings>('panel/coin');
}

export async function apiSaveCoinSettings(payload: CoinSettingsPayload): Promise<ApiCoinSettings> {
  return apiRequest<ApiCoinSettings>('panel/coin', { method: 'PUT', body: payload });
}

export async function apiSetCoinsEnabled(active: boolean): Promise<ApiCoinSettings> {
  return apiRequest<ApiCoinSettings>('panel/coin/status', { method: 'PATCH', body: { active } });
}

export async function apiCoinPerformance(from: string, to: string): Promise<ApiCoinPerformance> {
  return apiRequest<ApiCoinPerformance>(`panel/coin/performance?${new URLSearchParams({ from, to }).toString()}`);
}
