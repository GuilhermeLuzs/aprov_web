import { useSyncExternalStore } from 'react';
import { accessEvents as seeded, mockNow } from '../mocks';
import type { AccessEvent, AccountRef } from '../types';

const RECENT_LIMIT = 5;

let events: AccessEvent[] = seeded;
let recent: AccountRef[] = [];
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function recordAccessChange(change: Omit<AccessEvent, 'id' | 'createdAt'>) {
  events = [...events, { ...change, id: `ae${Date.now()}`, createdAt: mockNow() }];
  emit();
}

export function markViewed(account: AccountRef) {
  if (recent[0]?.kind === account.kind && recent[0]?.id === account.id) return;
  recent = [account, ...recent.filter((r) => r.kind !== account.kind || r.id !== account.id)].slice(0, RECENT_LIMIT);
  emit();
}

export function useAccessEvents(): AccessEvent[] {
  return useSyncExternalStore(subscribe, () => events);
}

export function useRecentlyViewed(): AccountRef[] {
  return useSyncExternalStore(subscribe, () => recent);
}
