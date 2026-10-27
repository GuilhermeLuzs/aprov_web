import type { CouponOffer } from '../types';

const codes = (prefix: string, count: number, delivered: number) =>
  Array.from({ length: count }, (_, i) => ({
    code: `${prefix}-${String(1000 + i * 37).slice(-4)}`,
    deliveredAt: i < delivered ? `2026-10-${String(5 + i).padStart(2, '0')}T12:00:00.000Z` : undefined,
  }));

export const couponOffers: CouponOffer[] = [
  { id: 'co1', companyId: 'c2', title: '10% em qualquer pedido', coinCost: 50, validUntil: '2026-12-31', codes: codes('VOVO10', 20, 6) },
  { id: 'co2', companyId: 'c2', title: 'Frete grátis', coinCost: 30, validUntil: '2026-11-30', codes: codes('VOFRETE', 6, 3) },
];
