import { useSyncExternalStore } from 'react';
import {
  assignments as seededAssignments,
  caseResolutions as seededResolutions,
  mockNow,
  reports as seededReports,
  tickets as seededTickets,
} from '../mocks';
import type { Assignment, CaseResolution, Report, Ticket, TicketStatus } from '../types';

type QueueState = {
  reports: Report[];
  resolutions: CaseResolution[];
  assignments: Assignment[];
  tickets: Ticket[];
};

let state: QueueState = {
  reports: seededReports,
  resolutions: seededResolutions,
  assignments: seededAssignments,
  tickets: seededTickets,
};
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function resolveCase(resolution: Omit<CaseResolution, 'at'>) {
  state = { ...state, resolutions: [...state.resolutions, { ...resolution, at: mockNow() }] };
  emit();
}

export function assign(queue: Assignment['queue'], key: string, to: string) {
  const others = state.assignments.filter((a) => a.queue !== queue || a.key !== key);
  state = { ...state, assignments: [...others, { queue, key, to }] };
  emit();
}

function updateTicket(id: string, change: (ticket: Ticket) => Ticket) {
  state = { ...state, tickets: state.tickets.map((t) => (t.id === id ? change(t) : t)) };
  emit();
}

export function replyToTicket(id: string, author: string, text: string, status: TicketStatus) {
  updateTicket(id, (t) => ({
    ...t,
    status,
    messages: [...t.messages, { id: `tm${Date.now()}`, from: 'admin', author, text, createdAt: mockNow() }],
  }));
}

export function setTicketStatus(id: string, status: TicketStatus) {
  updateTicket(id, (t) => ({ ...t, status }));
}

export function useQueues(): QueueState {
  return useSyncExternalStore(subscribe, () => state);
}
