import { useSyncExternalStore } from 'react';
import { coinSettings as seeded, defaultCoinSettings } from '../mocks';
import type { CoinSettings } from '../types';

let settings: CoinSettings[] = seeded;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((listener) => listener());
}

function ensure(companyId: string): CoinSettings {
  const found = settings.find((s) => s.companyId === companyId);
  if (found) return found;
  const created = defaultCoinSettings(companyId);
  settings = [...settings, created];
  return created;
}

export function saveCoinSettings(next: CoinSettings) {
  ensure(next.companyId);
  settings = settings.map((s) => (s.companyId === next.companyId ? next : s));
  emit();
}

export function setCoinsEnabled(companyId: string, enabled: boolean) {
  const current = ensure(companyId);
  saveCoinSettings({ ...current, enabled });
}

export function useCoinSettings(companyId: string | undefined): CoinSettings | null {
  return useSyncExternalStore(subscribe, () => (companyId ? (settings.find((s) => s.companyId === companyId) ?? null) : null));
}

export function coinSettingsOrDefault(companyId: string, found: CoinSettings | null): CoinSettings {
  return found ?? defaultCoinSettings(companyId);
}
