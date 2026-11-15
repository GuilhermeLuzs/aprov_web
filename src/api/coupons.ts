import { apiRequest } from './client';

export type ApiCouponCode = { id: number; code: string; deliveredAt: string | null };

export type ApiCoupon = {
  id: number;
  title: string;
  description: string | null;
  coinCost: number;
  validUntil: string;
  codes: ApiCouponCode[];
};

export type NewCoupon = { title: string; coinCost: number; validUntil: string; codes: string[] };

export async function apiPanelCoupons(): Promise<ApiCoupon[]> {
  return apiRequest<ApiCoupon[]>('panel/coupons');
}

export async function apiCreateCoupon(coupon: NewCoupon): Promise<ApiCoupon> {
  return apiRequest<ApiCoupon>('panel/coupons', { method: 'POST', body: coupon });
}

export async function apiAddCouponCodes(id: number, codes: string[]): Promise<ApiCoupon> {
  return apiRequest<ApiCoupon>(`panel/coupons/${id}/codes`, { method: 'POST', body: { codes } });
}

export async function apiRemoveCouponCode(id: number, codeId: number): Promise<ApiCoupon> {
  return apiRequest<ApiCoupon>(`panel/coupons/${id}/codes/${codeId}`, { method: 'DELETE' });
}
