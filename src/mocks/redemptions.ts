import type { CoinRedemption } from '../types';

export const redemptions: CoinRedemption[] = [
  { id: 'cr1', companyId: 'c2', customerId: 'u3', createdAt: '2026-09-12T18:20:00.000Z', coins: 50, coupon: '10% na lasanha' },
  { id: 'cr2', companyId: 'c2', customerId: 'u6', createdAt: '2026-09-27T12:05:00.000Z', coins: 30, coupon: 'Frete grátis' },
  { id: 'cr3', companyId: 'c2', customerId: 'u4', createdAt: '2026-10-08T20:40:00.000Z', coins: 50, coupon: '10% na lasanha' },
  { id: 'cr4', companyId: 'c2', customerId: 'u9', createdAt: '2026-10-19T13:15:00.000Z', coins: 80, coupon: 'Brigadeiros de brinde' },
];
