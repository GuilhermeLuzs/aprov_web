import type { LucideIcon } from 'lucide-react';
import { icon } from '../theme';

type Layout = 'stacked' | 'row';

type Props = {
  Icon: LucideIcon;
  title: string;
  text: string;
  layout?: Layout;
};

const LAYOUT: Record<Layout, string> = {
  stacked: 'flex-col gap-md p-xl',
  row: 'flex-row items-start gap-lg p-lg',
};

export function FeatureCard({ Icon, title, text, layout = 'stacked' }: Props) {
  return (
    <article className={`flex rounded-card border border-border bg-surface shadow-card ${LAYOUT[layout]}`}>
      <span className="flex h-feature-icon w-feature-icon shrink-0 items-center justify-center rounded-control bg-primary-dim text-primary">
        <Icon size={icon.size.lg} strokeWidth={icon.strokeWidth} aria-hidden />
      </span>
      <div className="flex flex-col gap-xs">
        <h3 className="font-display font-semibold text-subtitle text-ink">{title}</h3>
        <p className="text-ink-muted">{text}</p>
      </div>
    </article>
  );
}
