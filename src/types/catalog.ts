import type { Category } from './company';

export type ProductKind = 'product' | 'service';

export const PRODUCT_KIND_LABEL: Record<ProductKind, string> = {
  product: 'Produto',
  service: 'Serviço',
};

export type ProductStatus = 'active' | 'inactive';

export type Product = {
  id: string;
  companyId: string;
  kind: ProductKind;
  categories: Category[];
  title: string;
  description: string;
  imageUrl: string;
  status: ProductStatus;
  coinsReward: number;
  xpReward: number;
};
