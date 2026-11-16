import { useSyncExternalStore } from 'react';
import { apiChangeAccess } from '../api';
import { queryClient } from '../queries/client';
import { ACCOUNTS_KEY, numericId } from '../queries/accounts';
import type { AccessAction, AccountRef, AccountStatus } from '../types';

const RECENT_LIMIT = 5;

export type RecentAccount = { ref: AccountRef; name: string; subtitle: string; imageUrl?: string; status: AccountStatus };

let recent: RecentAccount[] = [];
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((listener) => listener());
}

export async function recordAccessChange(change: { account: AccountRef; action: AccessAction; reason: string; note: string }): Promise<void> {
  await apiChangeAccess({
    kind: change.account.kind,
    id: numericId(change.account.id) ?? change.account.id,
    action: change.action,
    reason: change.reason,
    note: change.note,
  });
  await queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
}

export function markViewed(account: RecentAccount) {
  const same = (entry: RecentAccount) => entry.ref.kind === account.ref.kind && entry.ref.id === account.ref.id;
  recent = [account, ...recent.filter((entry) => !same(entry))].slice(0, RECENT_LIMIT);
  emit();
}

export function useRecentlyViewed(): RecentAccount[] {
  return useSyncExternalStore(subscribe, () => recent);
}
