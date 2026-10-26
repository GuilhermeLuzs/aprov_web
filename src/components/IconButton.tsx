import type { LucideIcon } from 'lucide-react';
import { icon } from '../theme';

type Props = {
  Icon: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
};

export function IconButton({ Icon, label, onClick, disabled = false }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-control w-control shrink-0 items-center justify-center rounded-pill text-ink-muted transition-colors enabled:hover:bg-surface-alt enabled:hover:text-ink disabled:cursor-not-allowed disabled:text-ink-faint"
    >
      <Icon size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
    </button>
  );
}
