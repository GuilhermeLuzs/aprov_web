import type { Company } from '../types';

export const companies: Company[] = [
  {
    id: 'c2',
    cnpj: '11.222.333/0001-81',
    name: 'Cozinha da Vó Marlene Comidas Caseiras e Congelados Artesanais',
    address: 'Rua das Laranjeiras, 312, Belo Horizonte, MG',
    email: 'contato@cozinhadavomarlene.com.br',
    phone: '(31) 3241-7788',
    category: 'alimentacao',
    modality: 'hibrida',
    size: 'pequena',
    description:
      'Congelados artesanais feitos em pequenos lotes, do jeito caseiro, entregues na sua casa.',
    logoUrl:
      'https://images.pexels.com/photos/3171160/pexels-photo-3171160.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
    coinName: 'PratosVó',
    coinColor: '#B45309',
  },
];
