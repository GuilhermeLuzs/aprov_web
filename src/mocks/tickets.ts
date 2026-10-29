import type { AccountRef, Customer, Ticket, TicketMessage } from '../types';
import { accessEvents } from './accessEvents';
import { testMasterAccount } from './accounts';
import { customers } from './platform';
import { assignments as reportAssignments, nextActiveCustomer } from './reports';

const adminId = testMasterAccount.id;

function customerRef(customer: Customer): AccountRef {
  return { kind: 'customer', id: customer.id };
}

function companyRef(id: string): AccountRef {
  return { kind: 'company', id };
}

let messageCount = 0;

function thread(entries: [from: 'requester' | 'admin', createdAt: string, text: string][]): TicketMessage[] {
  return entries.map(([from, createdAt, text]) => ({
    id: `tm${++messageCount}`,
    from,
    ...(from === 'admin' ? { adminId } : {}),
    text,
    createdAt,
  }));
}

function ticket(
  id: string,
  requester: AccountRef,
  subject: string,
  topic: Ticket['topic'],
  status: Ticket['status'],
  messages: Parameters<typeof thread>[0],
): Ticket {
  return { id, requester, subject, topic, status, createdAt: messages[0][1], messages: thread(messages) };
}

const harasserId = accessEvents.find((e) => e.reason === 'harassment')?.account.id ?? '';
const suspendedCustomer = customerRef(customers.find((c) => c.id === harasserId) ?? customers[0]);

export const tickets: Ticket[] = [
  ticket('tk1', suspendedCustomer, 'Minha conta foi suspensa sem motivo', 'account', 'open', [
    ['requester', '2026-10-03T08:15:00.000Z', 'Tentei entrar no app e aparece que minha conta está suspensa. Não fiz nada de errado. Quero minha conta de volta.'],
    ['requester', '2026-10-10T21:40:00.000Z', 'Já faz uma semana e ninguém respondeu. Vou perder meus pontos?'],
  ]),
  ticket('tk2', companyRef('c3'), 'Como importar o template do N8N?', 'coupons', 'waiting', [
    ['requester', '2026-10-21T14:00:00.000Z', 'Baixamos o template de cupons, mas o N8N mostra erro de credencial ao importar. Qual chave devemos usar?'],
    ['admin', '2026-10-22T10:20:00.000Z', 'Olá! A chave é a que aparece em Cupons, na integração avançada. Cole no nó "APROV" do fluxo, no campo de cabeçalho. Pode testar e nos contar?'],
  ]),
  ticket('tk3', companyRef('c5'), 'Painel bloqueado de repente', 'account', 'open', [
    ['requester', '2026-10-24T09:30:00.000Z', 'Nosso painel parou de abrir ontem à noite. Precisamos atualizar os cupons urgente. O que aconteceu?'],
  ]),
  ticket('tk4', customerRef(nextActiveCustomer('2026-10-24T18:05:00.000Z')), 'Não recebi as moedas da minha avaliação', 'coins', 'open', [
    ['requester', '2026-10-24T18:05:00.000Z', 'Avaliei o curso de barista com fotos e comentário longo, mas só caíram 30 moedas. Deveria ter recebido mais.'],
  ]),
  ticket('tk5', companyRef('c7'), 'Avaliação injusta de um cliente', 'review', 'open', [
    ['requester', '2026-10-22T16:45:00.000Z', 'Um cliente disse que a passadoria devolveu roupas com mofo, mas ele nunca contratou o serviço com a gente. Dá para remover?'],
  ]),
  ticket('tk6', customerRef(nextActiveCustomer('2026-10-25T07:50:00.000Z')), 'Quero excluir minha conta e meus dados', 'account', 'open', [
    ['requester', '2026-10-25T07:50:00.000Z', 'Gostaria de excluir minha conta e todos os meus dados, conforme a LGPD.'],
  ]),
  ticket('tk7', companyRef('c10'), 'Erro ao enviar foto no catálogo', 'catalog', 'waiting', [
    ['requester', '2026-10-20T11:10:00.000Z', 'Quando tento cadastrar o kit degustação, a foto não sobe. Aparece "arquivo inválido".'],
    ['admin', '2026-10-20T15:30:00.000Z', 'As fotos precisam estar em JPG, PNG ou WEBP e ter até 5 MB. Pode conferir o arquivo e tentar de novo?'],
  ]),
  ticket('tk8', customerRef(nextActiveCustomer('2026-10-16T12:00:00.000Z')), 'Cupom não funciona no site da loja', 'coupons', 'resolved', [
    ['requester', '2026-10-15T20:00:00.000Z', 'Troquei moedas por um cupom de 10% e o site diz que o código é inválido.'],
    ['admin', '2026-10-16T09:10:00.000Z', 'Falamos com a empresa: o cupom só vale para compras acima de R$ 80. Ela vai deixar isso claro no app.'],
    ['requester', '2026-10-16T12:00:00.000Z', 'Agora funcionou, obrigada!'],
  ]),
  ticket('tk9', customerRef(nextActiveCustomer('2026-10-18T13:25:00.000Z')), 'Qual a diferença entre pontos e XP?', 'other', 'resolved', [
    ['requester', '2026-10-18T13:25:00.000Z', 'Não entendi a diferença entre pontos APROV e XP.'],
    ['admin', '2026-10-18T16:00:00.000Z', 'O XP sobe seu nível e não é gasto. Os pontos APROV você usa para comprar cosméticos na loja do app.'],
  ]),
];

export const assignments = [
  ...reportAssignments,
  { queue: 'ticket' as const, key: 'tk2', toId: adminId },
  { queue: 'ticket' as const, key: 'tk7', toId: adminId },
];
