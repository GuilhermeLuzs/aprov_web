import { useQuery } from '@tanstack/react-query';
import { ApiError, apiAssign, apiMasterQueues, apiReplyTicket, apiResolveCase, apiTicketStatus, type ApiQueues } from '../api';
import { queryClient } from '../queries/client';
import type { Assignment, CaseResolution, TicketStatus } from '../types';

const QUEUES_KEY = ['master', 'queues'] as const;

const EMPTY: ApiQueues = { reports: [], resolutions: [], assignments: [], tickets: [], targets: {}, admins: {}, accessEvents: [] };

export function failureMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

async function refresh(): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: QUEUES_KEY });
}

export async function resolveCase(resolution: Omit<CaseResolution, 'at' | 'byId'>): Promise<void> {
  await apiResolveCase(resolution.target, resolution.decision, resolution.note);
  await refresh();
}

export async function assign(queue: Assignment['queue'], key: string, toId: string): Promise<void> {
  await apiAssign(queue, key, toId);
  await refresh();
}

export async function replyToTicket(id: string, text: string, status: TicketStatus): Promise<void> {
  await apiReplyTicket(id, text, status);
  await refresh();
}

export async function setTicketStatus(id: string, status: TicketStatus): Promise<void> {
  await apiTicketStatus(id, status);
  await refresh();
}

export function useQueuesQuery() {
  return useQuery({ queryKey: QUEUES_KEY, queryFn: apiMasterQueues });
}

export function useQueues(): ApiQueues {
  return useQueuesQuery().data ?? EMPTY;
}
