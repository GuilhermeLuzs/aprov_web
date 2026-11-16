import type { Customer, Review } from '../types';
import { accessEvents } from './accessEvents';
import { partnerProducts } from './partnerProducts';
import { customers } from './platform';

const HOUR_MS = 60 * 60 * 1000;

function shiftHours(timestamp: string, hours: number): string {
  return new Date(Date.parse(timestamp) + hours * HOUR_MS).toISOString();
}

function suspendedFor(reason: string): Customer {
  const id = accessEvents.find((e) => e.reason === reason)?.account.id;
  const found = customers.find((c) => c.id === id);
  if (!found) throw new Error(`Falta a conta suspensa por ${reason} nos mocks.`);
  return found;
}

const taken = new Set(accessEvents.map((e) => e.account.id));

export function nextActiveCustomer(activeAt: string): Customer {
  const found = customers.find((c) => !taken.has(c.id) && c.createdAt < activeAt && c.lastActiveAt >= activeAt);
  if (!found) throw new Error('Faltam clientes ativos nos mocks.');
  taken.add(found.id);
  return found;
}

const copier = suspendedFor('fakeReview');
const harasser = suspendedFor('harassment');

function flaggedReview(id: string, productId: string, authorId: string, createdAt: string, title: string, comment: string, rating: number): Review {
  return {
    id,
    productId,
    companyId: partnerProducts.find((p) => p.id === productId)?.companyId ?? '',
    authorId,
    createdAt,
    title,
    ratings: { entrega: rating, qualidade: rating, conformidade: rating, custoBeneficio: rating },
    positiveTagIds: [],
    negativeTagIds: [],
    comment,
    wouldBuyAgain: rating >= 4,
    agreements: 0,
    disagreements: 0,
  };
}

const COPIED_TEXT = 'Produto excelente, recomendo a todos!!! Entrega rápida e ótimo atendimento, nota 10!!!';

export const reportedReviews: Review[] = [
  flaggedReview('rf1', 'p101', copier.id, shiftHours(copier.lastActiveAt, -6), 'Recomendo a todos!!!', COPIED_TEXT, 5),
  flaggedReview('rf2', 'p117', copier.id, shiftHours(copier.lastActiveAt, -5), 'Recomendo a todos!!!', COPIED_TEXT, 5),
  flaggedReview(
    'rf3',
    'p125',
    harasser.id,
    shiftHours(harasser.lastActiveAt, -3),
    'Recepção despreparada',
    'Atendimento péssimo. A recepcionista é uma incompetente e devia ser demitida, não sabe nem atender um telefone.',
    1,
  ),
  flaggedReview(
    'rf4',
    'p106',
    nextActiveCustomer('2026-10-21T15:10:00.000Z').id,
    '2026-10-21T15:10:00.000Z',
    'Achei mais barato',
    'Comprei a mesma camisa pela metade do preço em www.ofertasrelampago.com.br, procurem lá antes de comprar aqui!',
    2,
  ),
  flaggedReview(
    'rf5',
    'p129',
    nextActiveCustomer('2026-10-23T11:40:00.000Z').id,
    '2026-10-23T11:40:00.000Z',
    'Café bom, entregador grosso',
    'O café é ótimo, mas o entregador Marcos (35 99812-4410) foi grosseiro e jogou a caixa no portão.',
    3,
  ),
  flaggedReview(
    'rf6',
    'p121',
    nextActiveCustomer('2026-10-24T09:05:00.000Z').id,
    '2026-10-24T09:05:00.000Z',
    'Ninguém faz nada',
    'Minha vizinha faz barulho a noite toda e o condomínio não resolve. Estou cansada disso.',
    1,
  ),
  flaggedReview(
    'rf7',
    'p113',
    nextActiveCustomer('2026-10-22T19:30:00.000Z').id,
    '2026-10-22T19:30:00.000Z',
    'Descascaram no segundo mês',
    'As panelas descascaram no segundo mês de uso, sempre com colher de silicone. Mandei fotos para a loja e não tive resposta.',
    1.5,
  ),
  flaggedReview(
    'rf8',
    'p118',
    nextActiveCustomer('2026-10-12T10:00:00.000Z').id,
    '2026-10-12T10:00:00.000Z',
    'Serviço muito ruim',
    'Pior passadoria que já contratei. Roupas voltaram amassadas e com cheiro de mofo. Dinheiro jogado fora.',
    1,
  ),
];

