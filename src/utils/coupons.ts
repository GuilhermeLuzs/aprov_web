import type { CouponOffer } from '../types';

export const LOW_STOCK = 5;
export const COUPON_TITLE_MAX = 40;
export const CODE_MAX = 30;

export function availableCount(offer: CouponOffer): number {
  return offer.codes.filter((c) => !c.deliveredAt).length;
}

export function deliveredCount(offer: CouponOffer): number {
  return offer.codes.length - availableCount(offer);
}

export type ParsedCodes = { codes: string[]; repeated: string[]; tooLong: string[] };

export function parseCodes(text: string, existing: string[]): ParsedCodes {
  const taken = new Set(existing.map((c) => c.toUpperCase()));
  const codes: string[] = [];
  const repeated: string[] = [];
  const tooLong: string[] = [];
  text
    .split(/[\n,;]+/)
    .map((line) => line.trim().toUpperCase())
    .filter(Boolean)
    .forEach((code) => {
      if (code.length > CODE_MAX) tooLong.push(code);
      else if (taken.has(code)) repeated.push(code);
      else {
        taken.add(code);
        codes.push(code);
      }
    });
  return { codes, repeated, tooLong };
}
