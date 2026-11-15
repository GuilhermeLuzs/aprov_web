import { useQuery } from '@tanstack/react-query';
import { ApiError, apiAddCouponCodes, apiCreateCoupon, apiPanelCoupons, apiRemoveCouponCode, type ApiCoupon, type NewCoupon } from '../api';
import { queryClient } from '../queries/client';
import type { CouponOffer } from '../types';

const COUPONS_KEY = ['coupons'] as const;

function offerFromApi(coupon: ApiCoupon): CouponOffer {
  return {
    id: String(coupon.id),
    companyId: '',
    title: coupon.title,
    coinCost: coupon.coinCost,
    validUntil: coupon.validUntil,
    codes: coupon.codes.map((code) => ({ id: code.id, code: code.code, deliveredAt: code.deliveredAt ?? undefined })),
  };
}

export function failureMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return fallback;
  return Object.values(error.errors)[0]?.[0] ?? error.message;
}

async function refresh(): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: COUPONS_KEY });
}

export async function addCouponOffer(coupon: NewCoupon): Promise<void> {
  await apiCreateCoupon(coupon);
  await refresh();
}

export async function addCouponCodes(offerId: string, codes: string[]): Promise<void> {
  await apiAddCouponCodes(Number(offerId), codes);
  await refresh();
}

export async function removeCouponCode(offer: CouponOffer, code: string): Promise<void> {
  const found = offer.codes.find((item) => item.code === code);
  if (found?.id) await apiRemoveCouponCode(Number(offer.id), found.id);
  await refresh();
}

export function useCouponOffers() {
  return useQuery({ queryKey: COUPONS_KEY, queryFn: async () => (await apiPanelCoupons()).map(offerFromApi) });
}
