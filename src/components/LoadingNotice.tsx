import { LoaderCircle } from 'lucide-react';
import { icon } from '../theme';

export function LoadingNotice({ text }: { text: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-md rounded-card border border-border bg-surface p-xxl text-ink-muted">
      <LoaderCircle size={icon.size.lg} strokeWidth={icon.strokeWidth} className="animate-spin" aria-hidden />
      <span>{text}</span>
    </div>
  );
}
