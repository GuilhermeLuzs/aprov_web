import { customers, reviews } from '../../../mocks';
import { useProducts } from '../../../store/catalog';
import { useCompanies } from '../../../store/session';
import type { AccountRef, ReportTarget } from '../../../types';
import { reviewAverage } from '../../../utils/overview';

export type TargetInfo = {
  title: string;
  text: string;
  context: string;
  owner?: { ref: AccountRef; name: string };
  rating?: number;
  itemActive?: boolean;
};

export function useTargetInfo(): (target: ReportTarget) => TargetInfo {
  const products = useProducts();
  const companies = useCompanies();

  return (target) => {
    if (target.kind === 'review') {
      const review = reviews.find((r) => r.id === target.id);
      const product = products.find((p) => p.id === review?.productId);
      const company = companies.find((c) => c.id === review?.companyId);
      const author = customers.find((c) => c.id === review?.authorId);
      return {
        title: review?.title ?? 'Avaliação removida',
        text: review?.comment ?? '',
        context: [product?.title, company?.name].filter(Boolean).join(' · '),
        owner: author ? { ref: { kind: 'customer', id: author.id }, name: author.name } : undefined,
        rating: review ? reviewAverage(review) : undefined,
      };
    }
    const product = products.find((p) => p.id === target.id);
    const company = companies.find((c) => c.id === product?.companyId);
    return {
      title: product?.title ?? 'Item removido',
      text: product?.description ?? '',
      context: company?.name ?? '',
      owner: company ? { ref: { kind: 'company', id: company.id }, name: company.name } : undefined,
      itemActive: product?.status === 'active',
    };
  };
}
