import { CalendarDays, ChevronDown } from 'lucide-react';
import { icon } from '../theme';
import type { DayRange, PeriodKey } from '../utils/overview';

const PRESETS: { key: PeriodKey; label: string }[] = [
  { key: '7d', label: 'Últimos 7 dias' },
  { key: '30d', label: 'Últimos 30 dias' },
  { key: 'month', label: 'Este mês' },
  { key: 'lastMonth', label: 'Mês passado' },
  { key: 'custom', label: 'Personalizado' },
];

type Props = {
  period: PeriodKey;
  onPeriodChange: (period: PeriodKey) => void;
  custom: DayRange;
  onCustomChange: (range: DayRange) => void;
  error?: string;
  align?: 'start' | 'end';
};

const ALIGN = { start: 'items-start', end: 'md:items-end' };

const DATE_INPUT =
  'h-control rounded-control border border-border bg-surface px-md text-ink outline-none focus:border-primary';

export function PeriodFilter({ period, onPeriodChange, custom, onCustomChange, error, align = 'end' }: Props) {
  return (
    <div className={`flex flex-col gap-sm ${ALIGN[align]}`}>
      <div className="relative flex h-control items-center rounded-control border border-border bg-surface transition-colors focus-within:border-primary">
        <CalendarDays
          size={icon.size.md}
          strokeWidth={icon.strokeWidth}
          className="pointer-events-none absolute left-md text-ink-muted"
          aria-hidden
        />
        <select
          value={period}
          onChange={(event) => onPeriodChange(event.target.value as PeriodKey)}
          aria-label="Período"
          className="h-full appearance-none rounded-control bg-surface pr-control pl-control font-semibold text-ink outline-none"
        >
          {PRESETS.map((preset) => (
            <option key={preset.key} value={preset.key}>
              {preset.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={icon.size.md}
          strokeWidth={icon.strokeWidth}
          className="pointer-events-none absolute right-md text-ink-muted"
          aria-hidden
        />
      </div>

      {period === 'custom' ? (
        <div className="flex flex-wrap items-center gap-sm">
          <label className="flex items-center gap-sm text-caption text-ink-muted">
            De
            <input
              type="date"
              value={custom.start}
              onChange={(event) => onCustomChange({ ...custom, start: event.target.value })}
              className={DATE_INPUT}
            />
          </label>
          <label className="flex items-center gap-sm text-caption text-ink-muted">
            até
            <input
              type="date"
              value={custom.end}
              onChange={(event) => onCustomChange({ ...custom, end: event.target.value })}
              className={DATE_INPUT}
            />
          </label>
        </div>
      ) : null}

      {error ? <p className="text-caption text-disagree">{error}</p> : null}
    </div>
  );
}
