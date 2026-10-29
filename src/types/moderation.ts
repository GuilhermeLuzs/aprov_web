export type AccountKind = 'customer' | 'company';

export type AccountRef = { kind: AccountKind; id: string };

export type AccountStatus = 'active' | 'suspended';

export const ACCOUNT_STATUS_LABEL: Record<AccountStatus, string> = {
  active: 'Ativa',
  suspended: 'Suspensa',
};

export type AccessAction = 'suspend' | 'reactivate';

export const ACCESS_ACTION_LABEL: Record<AccessAction, string> = {
  suspend: 'Acesso suspenso',
  reactivate: 'Acesso reativado',
};

export type AccessReason =
  | 'spam'
  | 'fakeReview'
  | 'offensive'
  | 'harassment'
  | 'fakeAccount'
  | 'misleading'
  | 'coupons'
  | 'manipulation'
  | 'registration'
  | 'appeal'
  | 'resolved'
  | 'mistake'
  | 'other';

export const ACCESS_REASON_LABEL: Record<AccessReason, string> = {
  spam: 'Spam ou divulgação',
  fakeReview: 'Avaliação falsa ou copiada',
  offensive: 'Conteúdo ofensivo',
  harassment: 'Assédio a outros usuários',
  fakeAccount: 'Conta falsa ou duplicada',
  misleading: 'Itens com informação enganosa',
  coupons: 'Cupons não entregues ou recusados',
  manipulation: 'Tentativa de manipular avaliações',
  registration: 'Dados cadastrais irregulares',
  appeal: 'Recurso aceito',
  resolved: 'Problema resolvido',
  mistake: 'Suspensão aplicada por engano',
  other: 'Outro motivo',
};

export const SUSPEND_REASONS: Record<AccountKind, AccessReason[]> = {
  customer: ['spam', 'fakeReview', 'offensive', 'harassment', 'fakeAccount', 'other'],
  company: ['misleading', 'coupons', 'manipulation', 'registration', 'offensive', 'other'],
};

export const REACTIVATE_REASONS: AccessReason[] = ['appeal', 'resolved', 'mistake', 'other'];

export type AccessEvent = {
  id: string;
  account: AccountRef;
  action: AccessAction;
  reason: AccessReason;
  note: string;
  createdAt: string;
  byId: string;
};
