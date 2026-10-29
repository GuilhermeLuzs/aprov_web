import { Clock } from 'lucide-react';
import { mockNow } from '../../../mocks';
import { icon } from '../../../theme';
import { TICKET_STATUS_LABEL, type TicketStatus } from '../../../types';
import { formatAge } from '../../../utils/format';
import { isOverdue } from '../../../utils/queues';

export function AgeLabel({ since, overdueCheck = true }: { since: string; overdueCheck?: boolean }) {
  const now = mockNow();
  const late = overdueCheck && isOverdue(since, now);
  return (
    <span className={`inline-flex items-center gap-xs text-caption whitespace-nowrap ${late ? 'font-semibold text-disagree' : 'text-ink-muted'}`}>
      <Clock size={icon.size.sm} strokeWidth={icon.strokeWidth} aria-hidden />
      {formatAge(since, now)}
      {late ? ' · atrasada' : ''}
    </span>
  );
}

const TICKET_STATUS_CLASS: Record<TicketStatus, string> = {
  open: 'bg-primary-dim text-primary',
  waiting: 'bg-surface-alt text-ink-muted',
  resolved: 'bg-agree-dim text-agree',
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`inline-flex rounded-pill px-sm py-xs font-semibold text-caption whitespace-nowrap ${TICKET_STATUS_CLASS[status]}`}>
      {TICKET_STATUS_LABEL[status]}
    </span>
  );
}

export function CountPill({ count, singular, plural }: { count: number; singular: string; plural: string }) {
  return (
    <span className="inline-flex rounded-pill bg-disagree-dim px-sm py-xs font-semibold text-caption whitespace-nowrap text-disagree">
      {count} {count === 1 ? singular : plural}
    </span>
  );
}
