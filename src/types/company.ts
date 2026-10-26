export type Category =
  | 'eletronicos'
  | 'alimentacao'
  | 'moda'
  | 'servicos_domesticos'
  | 'beleza'
  | 'educacao'
  | 'casa'
  | 'saude';

export const CATEGORY_LABEL: Record<Category, string> = {
  eletronicos: 'Eletrônicos',
  alimentacao: 'Alimentação',
  moda: 'Moda',
  servicos_domesticos: 'Serviços domésticos',
  beleza: 'Beleza',
  educacao: 'Educação',
  casa: 'Casa',
  saude: 'Saúde',
};

export type Modality = 'presencial' | 'online' | 'hibrida';

export const MODALITY_LABEL: Record<Modality, string> = {
  presencial: 'Presencial',
  online: 'Online',
  hibrida: 'Híbrida',
};

export type CompanySize = 'micro' | 'pequena' | 'media' | 'grande';

export const COMPANY_SIZE_LABEL: Record<CompanySize, string> = {
  micro: 'Até 9 colaboradores',
  pequena: 'De 10 a 49 colaboradores',
  media: 'De 50 a 99 colaboradores',
  grande: '100 colaboradores ou mais',
};

export type Company = {
  id: string;
  cnpj: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  category: Category;
  modality: Modality;
  size: CompanySize;
  description?: string;
  logoUrl?: string;
  coinName?: string;
  coinColor?: string;
};

export type CompanyResponsible = {
  name: string;
  cpf: string;
  email: string;
  phone: string;
};
