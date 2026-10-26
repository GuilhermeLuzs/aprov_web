import { PRODUCT_STATUS_LABEL, type ProductStatus } from '../types';

const STATUS_CLASS: Record<ProductStatus, string> = {
  active: 'bg-agree-dim text-agree',
  inactive: 'bg-surface-alt text-ink-muted',
};

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span className={`inline-flex rounded-pill px-sm py-xs font-semibold text-caption whitespace-nowrap ${STATUS_CLASS[status]}`}>
      {PRODUCT_STATUS_LABEL[status]}
    </span>
  );
}
