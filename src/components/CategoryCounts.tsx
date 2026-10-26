import { useCallback, useId, useRef, useState } from 'react';
import { formatInt } from '../utils/format';
import { useDismiss } from './useDismiss';

export type CategoryCount = { label: string; count: number };

type Props = {
  label: string;
  counts: CategoryCount[];
  total: number;
  visible?: number;
};

export function CategoryCounts({ label, counts, total, visible = 3 }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);
  useDismiss(wrapperRef, open, close);

  if (counts.length === 0) return null;

  const shown = counts.slice(0, visible);
  const hiddenCount = counts.length - shown.length;
  const overlaps = counts.reduce((sum, entry) => sum + entry.count, 0) > total;

  return (
    <div ref={wrapperRef} className="relative text-caption text-ink-muted">
      {label}: {shown.map((entry) => `${formatInt(entry.count)} ${entry.label}`).join(' · ')}
      {hiddenCount > 0 ? ' ' : null}
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`Ver mais ${hiddenCount} ${hiddenCount === 1 ? 'categoria' : 'categorias'}`}
          className="font-semibold whitespace-nowrap text-primary hover:text-primary-press"
        >
          Ver +{hiddenCount}
        </button>
      ) : null}

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Itens por categoria"
          className="absolute top-full left-zero z-10 mt-sm flex w-max max-w-popover flex-col gap-sm rounded-control border border-border bg-surface p-md shadow-card"
        >
          <span className="font-semibold text-ink">Itens por categoria</span>
          <ul className="flex flex-col gap-xs">
            {counts.map((entry) => (
              <li key={entry.label} className="flex justify-between gap-lg">
                <span className="text-ink">{entry.label}</span>
                <span className="font-semibold text-ink tabular-nums">{formatInt(entry.count)}</span>
              </li>
            ))}
          </ul>
          {overlaps ? (
            <span>Um item pode estar em mais de uma categoria, por isso a soma passa do total.</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
