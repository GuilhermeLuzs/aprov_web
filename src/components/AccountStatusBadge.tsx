import { ACCOUNT_STATUS_LABEL, type AccountStatus } from '../types';

const STATUS_CLASS: Record<AccountStatus, string> = {
  active: 'bg-agree-dim text-agree',
  suspended: 'bg-disagree-dim text-disagree',
};

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  return (
    <span className={`inline-flex rounded-pill px-sm py-xs font-semibold text-caption whitespace-nowrap ${STATUS_CLASS[status]}`}>
      {ACCOUNT_STATUS_LABEL[status]}
    </span>
  );
}
