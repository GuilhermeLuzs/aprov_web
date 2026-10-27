import { useSyncExternalStore } from 'react';
import { couponOffers as seeded } from '../mocks';
import type { CouponOffer } from '../types';

let offers: CouponOffer[] = seeded;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function addCouponOffer(offer: Omit<CouponOffer, 'id'>) {
  offers = [...offers, { ...offer, id: `co${Date.now()}` }];
  emit();
}

export function addCouponCodes(offerId: string, codes: string[]) {
  offers = offers.map((o) => (o.id === offerId ? { ...o, codes: [...o.codes, ...codes.map((code) => ({ code }))] } : o));
  emit();
}

export function removeCouponCode(offerId: string, code: string) {
  offers = offers.map((o) => (o.id === offerId ? { ...o, codes: o.codes.filter((c) => c.code !== code || c.deliveredAt) } : o));
  emit();
}

export function removeCouponOffer(offerId: string) {
  offers = offers.filter((o) => o.id !== offerId);
  emit();
}

export function useCouponOffers(): CouponOffer[] {
  return useSyncExternalStore(subscribe, () => offers);
}
