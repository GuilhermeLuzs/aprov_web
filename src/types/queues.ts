import type { AccountRef } from './moderation';

export type ReportTargetKind = 'review' | 'comment';

export type ReportTarget = { kind: ReportTargetKind; id: string };

export const REPORT_TARGET_LABEL: Record<ReportTargetKind, string> = {
  review: 'Avaliação',
  comment: 'Comentário',
};

export type ReportReason = 'offensive' | 'personal_data' | 'spam' | 'false_info' | 'other';

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  offensive: 'Ofensa ou discurso de ódio',
  personal_data: 'Dado pessoal de outra pessoa',
  spam: 'Propaganda ou spam',
  false_info: 'Informação falsa',
  other: 'Outro motivo',
};

export type Report = {
  id: string;
  target: ReportTarget;
  reporterId: string;
  reporterName: string;
  reason: ReportReason;
  comment: string;
  createdAt: string;
};

export type CaseDecision = 'removed' | 'kept';

export type CaseResolution = {
  target: ReportTarget;
  decision: CaseDecision;
  note: string;
  byId: string;
  at: string;
};

export type Assignment = { queue: 'report' | 'ticket'; key: string; toId: string };

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
  adminId?: string;
  text: string;
  createdAt: string;
};

export type Ticket = {
  id: string;
  requester: AccountRef;
  requesterName: string;
  subject: string;
  topic: TicketTopic;
  status: TicketStatus;
  createdAt: string;
  messages: TicketMessage[];
};
