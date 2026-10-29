import type { AccessEvent, Customer } from '../types';
import { testMasterAccount } from './accounts';
import { customers } from './platform';

const by = testMasterAccount.name;
const taken = new Set<string>();

function pickCustomer(fits: (customer: Customer) => boolean): Customer {
  const found = customers.find((c) => !taken.has(c.id) && fits(c)) ?? customers.find((c) => !taken.has(c.id));
  if (!found) throw new Error('Faltam clientes nos mocks.');
  taken.add(found.id);
  return found;
}

function activeBetween(start: string, end: string) {
  return (customer: Customer) => customer.createdAt < start && customer.lastActiveAt > end;
}

function lastSeenOn(day: string) {
  return (customer: Customer) => customer.lastActiveAt.startsWith(day);
}

const duplicated = pickCustomer(activeBetween('2026-07-01', '2026-07-21'));
const spammer = pickCustomer(activeBetween('2026-07-20', '2026-08-10'));
const harasser = pickCustomer(lastSeenOn('2026-10-02'));
const copier = pickCustomer(lastSeenOn('2026-10-20'));

export const accessEvents: AccessEvent[] = [
  {
    id: 'ae1',
    account: { kind: 'customer', id: duplicated.id },
    action: 'suspend',
    reason: 'fakeAccount',
    note: 'Cadastro com o mesmo CPF de outra conta, segundo a verificação automática.',
    createdAt: '2026-07-15T14:10:00.000Z',
    by,
  },
  {
    id: 'ae2',
    account: { kind: 'customer', id: duplicated.id },
    action: 'reactivate',
    reason: 'mistake',
    note: 'A verificação confundiu dois CPFs parecidos. Documento conferido pelo suporte.',
    createdAt: '2026-07-20T10:25:00.000Z',
    by,
  },
  {
    id: 'ae3',
    account: { kind: 'customer', id: spammer.id },
    action: 'suspend',
    reason: 'spam',
    note: 'Colou o mesmo link de loja em 14 comentários seguidos.',
    createdAt: '2026-08-01T09:40:00.000Z',
    by,
  },
  {
    id: 'ae4',
    account: { kind: 'customer', id: spammer.id },
    action: 'reactivate',
    reason: 'appeal',
    note: 'Explicou no recurso que não sabia da regra. Orientado a não repetir.',
    createdAt: '2026-08-09T16:05:00.000Z',
    by,
  },
  {
    id: 'ae5',
    account: { kind: 'company', id: 'c6' },
    action: 'suspend',
    reason: 'misleading',
    note: 'Fotos do jogo de panelas mostravam 7 peças; o item tem 5. Várias denúncias no mesmo dia.',
    createdAt: '2026-09-10T11:30:00.000Z',
    by,
  },
  {
    id: 'ae6',
    account: { kind: 'company', id: 'c6' },
    action: 'reactivate',
    reason: 'resolved',
    note: 'Fotos e descrição corrigidas pela empresa e conferidas.',
    createdAt: '2026-09-18T15:45:00.000Z',
    by,
  },
  {
    id: 'ae7',
    account: { kind: 'customer', id: harasser.id },
    action: 'suspend',
    reason: 'harassment',
    note: 'Comentários ofensivos repetidos contra o mesmo usuário, mesmo depois do aviso por e-mail.',
    createdAt: harasser.lastActiveAt,
    by,
  },
  {
    id: 'ae8',
    account: { kind: 'customer', id: copier.id },
    action: 'suspend',
    reason: 'fakeReview',
    note: 'Denunciada por repetir o mesmo comentário em avaliações de empresas diferentes. Textos conferidos.',
    createdAt: copier.lastActiveAt,
    by,
  },
  {
    id: 'ae9',
    account: { kind: 'company', id: 'c5' },
    action: 'suspend',
    reason: 'coupons',
    note: 'Três clientes relataram códigos de cupom recusados no site da empresa. Aguardando retorno.',
    createdAt: '2026-10-23T17:20:00.000Z',
    by,
  },
];
