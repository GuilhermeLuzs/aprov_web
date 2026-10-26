import type { ReactNode } from 'react';

type Props = {
  label: string;
  value: string;
  detail?: string;
  emphasis?: boolean;
  children?: ReactNode;
};

export function StatTile({ label, value, detail, emphasis = false, children }: Props) {
  return (
    <div className="flex flex-col gap-xs rounded-card border border-border bg-surface p-lg">
      <span className="text-caption text-ink-muted">{label}</span>
      <span className={`font-display font-bold text-ink ${emphasis ? 'text-hero' : 'text-display'}`}>{value}</span>
      {detail ? <span className="text-caption text-ink-muted">{detail}</span> : null}
      {children}
    </div>
  );
}
