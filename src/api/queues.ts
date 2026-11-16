import type { AccountRef, Assignment, CaseResolution, Report, ReportTarget, Ticket, TicketStatus } from '../types';
import { apiRequest } from './client';

export type ApiTargetInfo = {
  title: string;
  text: string;
  context: string;
  owner: { ref: AccountRef; name: string } | null;
  rating: number | null;
  removed: boolean;
};

export type ApiQueues = {
  reports: Report[];
  resolutions: CaseResolution[];
  assignments: Assignment[];
  tickets: Ticket[];
  targets: Record<string, ApiTargetInfo>;
  admins: Record<string, string>;
};

export async function apiMasterQueues(): Promise<ApiQueues> {
  return apiRequest<ApiQueues>('panel/master/queues');
}

export async function apiResolveCase(target: ReportTarget, decision: 'removed' | 'kept', note: string): Promise<void> {
  await apiRequest('panel/master/reports/resolve', { method: 'POST', body: { targetType: target.kind, targetId: Number(target.id), decision, note } });
}

export async function apiAssign(queue: Assignment['queue'], key: string, toId: string): Promise<void> {
  await apiRequest('panel/master/assignments', { method: 'PUT', body: { queue, key, toId: toId || null } });
}

export async function apiReplyTicket(id: string, text: string, status: TicketStatus): Promise<void> {
  await apiRequest(`panel/master/tickets/${id}/messages`, { method: 'POST', body: { text, status } });
}

export async function apiTicketStatus(id: string, status: TicketStatus): Promise<void> {
  await apiRequest(`panel/master/tickets/${id}/status`, { method: 'PATCH', body: { status } });
}
