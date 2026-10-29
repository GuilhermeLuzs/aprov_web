import type { AccountRef } from './moderation';

export type ReportTargetKind = 'review' | 'item';

export type ReportTarget = { kind: ReportTargetKind; id: string };

export const REPORT_TARGET_LABEL: Record<ReportTargetKind, string> = {
  review: 'Avaliação',
  item: 'Item do catálogo',
};

export type ReportReason = 'fake' | 'offensive' | 'spam' | 'personalData' | 'unrelated' | 'misleading' | 'other';

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  fake: 'Falsa ou copiada',
  offensive: 'Ofensiva',
  spam: 'Spam ou propaganda',
  personalData: 'Expõe dados pessoais',
  unrelated: 'Não fala do item',
  misleading: 'Informação enganosa',
  other: 'Outro motivo',
};

export type Report = {
  id: string;
  target: ReportTarget;
  reporterId: string;
  reason: ReportReason;
  comment: string;
  createdAt: string;
};

export type CaseDecision = 'removed' | 'kept';

export type CaseResolution = {
  target: ReportTarget;
  decision: CaseDecision;
  note: string;
  by: string;
  at: string;
};

export type Assignment = { queue: 'report' | 'ticket'; key: string; to: string };

export type TicketStatus = 'open' | 'waiting' | 'resolved';

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Aberto',
  waiting: 'Aguardando resposta',
  resolved: 'Resolvido',
};

export type TicketTopic = 'account' | 'coins' | 'coupons' | 'review' | 'catalog' | 'other';

export const TICKET_TOPIC_LABEL: Record<TicketTopic, string> = {
  account: 'Conta e acesso',
  coins: 'Moedas e pontos',
  coupons: 'Cupons',
  review: 'Avaliações',
  catalog: 'Catálogo',
  other: 'Outros assuntos',
};

export type TicketMessage = {
  id: string;
  from: 'requester' | 'admin';
  author: string;
  text: string;
  createdAt: string;
};

export type Ticket = {
  id: string;
  requester: AccountRef;
  subject: string;
  topic: TicketTopic;
  status: TicketStatus;
  createdAt: string;
  messages: TicketMessage[];
};
