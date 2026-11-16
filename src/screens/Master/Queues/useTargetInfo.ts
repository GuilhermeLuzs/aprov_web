import { useQueues } from '../../../store/queues';
import type { AccountRef, ReportTarget } from '../../../types';
import { targetKey } from '../../../utils/queues';

export type TargetInfo = {
  title: string;
  text: string;
  context: string;
  owner?: { ref: AccountRef; name: string };
  rating?: number;
  removed?: boolean;
};

export function useTargetInfo(): (target: ReportTarget) => TargetInfo {
  const { targets } = useQueues();

  return (target) => {
    const found = targets[targetKey(target)];
    if (!found) return { title: 'Conteúdo removido', text: '', context: '' };
    return {
      title: found.title,
      text: found.text,
      context: found.context,
      owner: found.owner ?? undefined,
      rating: found.rating ?? undefined,
      removed: found.removed,
    };
  };
}

export function useAdminName(): (id: string) => string {
  const { admins } = useQueues();
  return (id) => admins[id] ?? 'Equipe da APROV';
}
