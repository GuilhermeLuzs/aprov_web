import type { Tag } from '../types';

export const tags: Tag[] = [
  {
    id: 't01',
    label: 'Chegou antes do prazo',
    sentiment: 'positive',
    characteristic: 'entrega',
  },
  {
    id: 't02',
    label: 'Bem embalado',
    sentiment: 'positive',
    characteristic: 'entrega',
  },
  {
    id: 't03',
    label: 'Material resistente',
    sentiment: 'positive',
    characteristic: 'qualidade',
  },
  {
    id: 't04',
    label: 'Acabamento impecável',
    sentiment: 'positive',
    characteristic: 'qualidade',
  },
  {
    id: 't05',
    label: 'Funciona como descrito',
    sentiment: 'positive',
    characteristic: 'conformidade',
  },
  {
    id: 't06',
    label: 'Sabor caseiro de verdade',
    sentiment: 'positive',
    characteristic: 'qualidade',
  },
  {
    id: 't07',
    label: 'Veio completo',
    sentiment: 'positive',
    characteristic: 'conformidade',
  },
  {
    id: 't08',
    label: 'Igual às fotos',
    sentiment: 'positive',
    characteristic: 'conformidade',
  },
  {
    id: 't09',
    label: 'Profissional pontual',
    sentiment: 'positive',
    characteristic: 'entrega',
  },
  {
    id: 't10',
    label: 'Custo-benefício justo',
    sentiment: 'positive',
    characteristic: 'custoBeneficio',
  },
  {
    id: 't11',
    label: 'Mais barato que a concorrência',
    sentiment: 'positive',
    characteristic: 'custoBeneficio',
  },
  {
    id: 't12',
    label: 'Rende bastante',
    sentiment: 'positive',
    characteristic: 'custoBeneficio',
  },
  {
    id: 't13',
    label: 'Atrasou muito',
    sentiment: 'negative',
    characteristic: 'entrega',
  },
  {
    id: 't14',
    label: 'Mal embalado',
    sentiment: 'negative',
    characteristic: 'entrega',
  },
  {
    id: 't15',
    label: 'Quebrou rápido',
    sentiment: 'negative',
    characteristic: 'qualidade',
  },
  {
    id: 't16',
    label: 'Diferente das fotos',
    sentiment: 'negative',
    characteristic: 'conformidade',
  },
  {
    id: 't17',
    label: 'Chegou frio ou passado',
    sentiment: 'negative',
    characteristic: 'qualidade',
  },
  {
    id: 't18',
    label: 'Faltaram itens',
    sentiment: 'negative',
    characteristic: 'conformidade',
  },
  {
    id: 't19',
    label: 'Sem manual',
    sentiment: 'negative',
    characteristic: 'conformidade',
  },
  {
    id: 't20',
    label: 'Serviço malfeito',
    sentiment: 'negative',
    characteristic: 'qualidade',
  },
  {
    id: 't21',
    label: 'Caro pelo que entrega',
    sentiment: 'negative',
    characteristic: 'custoBeneficio',
  },
  {
    id: 't22',
    label: 'Cobram taxa escondida',
    sentiment: 'negative',
    characteristic: 'custoBeneficio',
  },
];

export const tagById: Record<string, Tag> = Object.fromEntries(tags.map((t) => [t.id, t]));
