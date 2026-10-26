import type { ReactNode } from 'react';

const SERIES_DOT = ['bg-series-1', 'bg-series-2', 'bg-series-3', 'bg-series-4', 'bg-series-5'];

export type LegendItem = { key: string; label: string; series: number };

type Props = {
  title: string;
  description?: string;
  legend?: LegendItem[];
  hiddenKeys?: string[];
  onToggleKey?: (key: string) => void;
  actions?: ReactNode;
  children: ReactNode;
};

export function ChartCard({ title, description, legend, hiddenKeys = [], onToggleKey, actions, children }: Props) {
  const visibleCount = (legend ?? []).filter((item) => !hiddenKeys.includes(item.key)).length;

  return (
    <section className="flex min-w-zero flex-col gap-lg rounded-card border border-border bg-surface p-lg">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div className="flex flex-col gap-xs">
          <h2 className="font-display font-semibold text-subtitle text-ink">{title}</h2>
          {description ? <p className="text-caption text-ink-muted">{description}</p> : null}
        </div>
        {actions}
      </div>

      {legend && legend.length > 1 ? (
        <ul className="flex flex-wrap gap-sm" aria-label="Legenda">
          {legend.map((item) => {
            const hidden = hiddenKeys.includes(item.key);
            const isLastVisible = !hidden && visibleCount === 1;
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => onToggleKey?.(item.key)}
                  disabled={!onToggleKey || isLastVisible}
                  aria-pressed={!hidden}
                  title={hidden ? `Mostrar ${item.label}` : `Esconder ${item.label}`}
                  className={`flex items-center gap-sm rounded-pill px-sm py-xs text-caption transition-colors enabled:hover:bg-surface-alt disabled:cursor-default ${
                    hidden ? 'text-ink-faint' : 'text-ink-muted'
                  }`}
                >
                  <span
                    className={`h-legend-key w-legend-key shrink-0 rounded-pill ${
                      hidden ? 'border-2 border-ink-faint bg-surface' : SERIES_DOT[item.series]
                    }`}
                    aria-hidden
                  />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {children}
    </section>
  );
}
