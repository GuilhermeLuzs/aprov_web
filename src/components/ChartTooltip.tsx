type TooltipRow = { name?: string | number; value?: unknown; color?: string; dataKey?: unknown };

type Props = {
  active?: boolean;
  payload?: readonly TooltipRow[];
  label?: string | number;
  formatLabel: (label: string) => string;
  formatValue: (value: number) => string;
};

export function ChartTooltip({ active, payload, label, formatLabel, formatValue }: Props) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="flex flex-col gap-xs rounded-control border border-border bg-surface p-md shadow-card">
      <span className="text-caption text-ink-muted">{formatLabel(String(label ?? ''))}</span>
      <ul className="flex flex-col gap-xs">
        {payload.map((row) => (
          <li key={String(row.dataKey)} className="flex items-center gap-sm">
            <span
              className="h-legend-line w-legend-key shrink-0 rounded-pill"
              style={{ backgroundColor: row.color }}
              aria-hidden
            />
            <span className="font-semibold text-ink tabular-nums">{formatValue(Number(row.value))}</span>
            <span className="text-caption text-ink-muted">{row.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
