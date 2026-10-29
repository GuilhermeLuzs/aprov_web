import type { AccessEvent, AccountKind, AccountRef, AccountStatus } from '../types';

export function eventsOf(events: AccessEvent[], account: AccountRef): AccessEvent[] {
  return events
    .filter((e) => e.account.kind === account.kind && e.account.id === account.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function latestEvents(events: AccessEvent[], kind: AccountKind): Map<string, AccessEvent> {
  const latest = new Map<string, AccessEvent>();
  events
    .filter((e) => e.account.kind === kind)
    .forEach((e) => {
      const current = latest.get(e.account.id);
      if (!current || e.createdAt > current.createdAt) latest.set(e.account.id, e);
    });
  return latest;
}

export function statusFrom(latest: AccessEvent | undefined): AccountStatus {
  return latest?.action === 'suspend' ? 'suspended' : 'active';
}
