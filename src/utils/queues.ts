import type {
  AccountKind,
  Assignment,
  CaseResolution,
  Report,
  ReportReason,
  ReportTarget,
  ReportTargetKind,
  Ticket,
  TicketStatus,
  TicketTopic,
} from '../types';

const HOUR_MS = 60 * 60 * 1000;
export const OVERDUE_HOURS = 48;

export function hoursBetween(from: string, to: string): number {
  return (Date.parse(to) - Date.parse(from)) / HOUR_MS;
}

export function isOverdue(since: string, now: string): boolean {
  return hoursBetween(since, now) >= OVERDUE_HOURS;
}

export function targetKey(target: ReportTarget): string {
  return `${target.kind}:${target.id}`;
}

function assigneeOf(assignments: Assignment[], queue: Assignment['queue'], key: string): string | undefined {
  return assignments.find((a) => a.queue === queue && a.key === key)?.to;
}

export type ReasonCount = { reason: ReportReason; count: number };

export type ReportCase = {
  key: string;
  target: ReportTarget;
  reports: Report[];
  reasons: ReasonCount[];
  openedAt: string;
  lastReportAt: string;
  resolution?: CaseResolution;
  pending: boolean;
  assignee?: string;
};

export function buildCases(reports: Report[], resolutions: CaseResolution[], assignments: Assignment[]): ReportCase[] {
  const byKey = new Map<string, Report[]>();
  reports.forEach((r) => byKey.set(targetKey(r.target), [...(byKey.get(targetKey(r.target)) ?? []), r]));

  return [...byKey.entries()].map(([key, list]) => {
    const sorted = [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const lastReportAt = sorted[sorted.length - 1].createdAt;
    const resolution = resolutions
      .filter((r) => targetKey(r.target) === key)
      .sort((a, b) => b.at.localeCompare(a.at))[0];
    const counts = new Map<ReportReason, number>();
    sorted.forEach((r) => counts.set(r.reason, (counts.get(r.reason) ?? 0) + 1));
    const reopened = resolution !== undefined && resolution.decision === 'kept' && lastReportAt > resolution.at;
    const openSince = reopened ? sorted.find((r) => r.createdAt > resolution.at)?.createdAt : undefined;
    return {
      key,
      target: sorted[0].target,
      reports: sorted,
      reasons: [...counts.entries()].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count),
      openedAt: openSince ?? sorted[0].createdAt,
      lastReportAt,
      resolution,
      pending: resolution === undefined || reopened,
      assignee: assigneeOf(assignments, 'report', key),
    };
  });
}

export type OwnerFilter = '' | 'mine' | 'none';

export const OWNER_OPTIONS: { value: OwnerFilter; label: string }[] = [
  { value: 'mine', label: 'Comigo' },
  { value: 'none', label: 'Sem responsável' },
];

export type CaseFilters = { status: 'pending' | 'resolved'; kind: ReportTargetKind | ''; reason: ReportReason | ''; owner: OwnerFilter };

export type CaseSort = 'oldest' | 'mostReported';

export const DEFAULT_CASE_FILTERS: CaseFilters = { status: 'pending', kind: '', reason: '', owner: '' };

function ownerMatches(assignee: string | undefined, owner: OwnerFilter, me: string): boolean {
  if (owner === 'mine') return assignee === me;
  if (owner === 'none') return assignee === undefined;
  return true;
}

export function filterCases(cases: ReportCase[], filters: CaseFilters, me: string): ReportCase[] {
  return cases.filter(
    (c) =>
      c.pending === (filters.status === 'pending') &&
      (!filters.kind || c.target.kind === filters.kind) &&
      (!filters.reason || c.reasons.some((r) => r.reason === filters.reason)) &&
      ownerMatches(c.assignee, filters.owner, me),
  );
}

export function sortCases(cases: ReportCase[], sort: CaseSort, status: CaseFilters['status']): ReportCase[] {
  return [...cases].sort((a, b) => {
    if (status === 'resolved') return (b.resolution?.at ?? '').localeCompare(a.resolution?.at ?? '');
    if (sort === 'mostReported') return b.reports.length - a.reports.length || a.openedAt.localeCompare(b.openedAt);
    return a.openedAt.localeCompare(b.openedAt);
  });
}

export function waitingSince(ticket: Ticket): string {
  const lastAdmin = ticket.messages.findLast((m) => m.from === 'admin')?.createdAt ?? '';
  return ticket.messages.find((m) => m.from === 'requester' && m.createdAt > lastAdmin)?.createdAt ?? ticket.createdAt;
}

export function lastActivity(ticket: Ticket): string {
  return ticket.messages[ticket.messages.length - 1]?.createdAt ?? ticket.createdAt;
}

export type TicketFilters = { status: TicketStatus; topic: TicketTopic | ''; requester: AccountKind | ''; owner: OwnerFilter };

export const DEFAULT_TICKET_FILTERS: TicketFilters = { status: 'open', topic: '', requester: '', owner: '' };

export function ticketAssignee(assignments: Assignment[], ticket: Ticket): string | undefined {
  return assigneeOf(assignments, 'ticket', ticket.id);
}

export function filterTickets(tickets: Ticket[], filters: TicketFilters, assignments: Assignment[], me: string): Ticket[] {
  return tickets
    .filter(
      (t) =>
        t.status === filters.status &&
        (!filters.topic || t.topic === filters.topic) &&
        (!filters.requester || t.requester.kind === filters.requester) &&
        ownerMatches(ticketAssignee(assignments, t), filters.owner, me),
    )
    .sort((a, b) =>
      filters.status === 'open'
        ? waitingSince(a).localeCompare(waitingSince(b))
        : lastActivity(b).localeCompare(lastActivity(a)),
    );
}
