import { useSyncExternalStore } from 'react';
import { integrationSettings as seeded } from '../mocks';
import type { CouponSource, IntegrationSettings } from '../types';

let settings: IntegrationSettings[] = seeded;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function save(next: IntegrationSettings) {
  settings = settings.some((s) => s.companyId === next.companyId)
    ? settings.map((s) => (s.companyId === next.companyId ? next : s))
    : [...settings, next];
  listeners.forEach((listener) => listener());
}

function randomKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return `aprov_live_${[...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}

function current(companyId: string): IntegrationSettings {
  return settings.find((s) => s.companyId === companyId) ?? { companyId, apiKey: '', webhookUrl: '' };
}

export function regenerateApiKey(companyId: string) {
  save({ ...current(companyId), apiKey: randomKey() });
}

export function setCouponSource(companyId: string, couponSource: CouponSource) {
  save({ ...current(companyId), couponSource });
}

export function saveWebhookUrl(companyId: string, webhookUrl: string) {
  save({ ...current(companyId), webhookUrl });
}

export function useIntegrationSettings(companyId: string): IntegrationSettings {
  const found = useSyncExternalStore(subscribe, () => settings.find((s) => s.companyId === companyId));
  return found ?? { companyId, apiKey: '', webhookUrl: '' };
}
