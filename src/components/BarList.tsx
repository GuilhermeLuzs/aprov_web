import type { RatingTone } from '../utils/overview';
import { RATING_TONE_FILL } from './RatingValue';

export type BarListItem = {
  id: string;
  label: string;
  value: number;
  valueLabel: string;
  detail?: string;
  imageUrl?: string;
  tone?: RatingTone;
};

type Props = {
  items: BarListItem[];
  max: number;
  emptyText: string;
};

export function BarList({ items, max, emptyText }: Props) {
  if (items.length === 0) return <p className="text-caption text-ink-muted">{emptyText}</p>;

  return (
    <ol className="flex flex-col gap-md">
      {items.map((item) => (
        <li key={item.id}>
          <div className="flex items-center gap-md">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt=""
                loading="lazy"
                className="sensitive h-avatar-md w-avatar-md shrink-0 rounded-control bg-surface-alt object-cover"
              />
            ) : null}
            <div className="flex min-w-zero flex-1 flex-col gap-xs">
              <div className="flex items-baseline justify-between gap-md">
                <span className="sensitive min-w-zero truncate text-ink" title={item.label}>
                  {item.label}
                </span>
                <span className="sensitive shrink-0 font-semibold text-ink tabular-nums">{item.valueLabel}</span>
              </div>
              <div className="h-bar rounded-pill bg-surface-alt">
                <div
                  className={`h-full rounded-pill ${item.tone ? RATING_TONE_FILL[item.tone] : 'bg-series-1'}`}
                  style={{ width: `${max === 0 ? 0 : (item.value / max) * 100}%` }}
                />
              </div>
              {item.detail ? <span className="sensitive text-caption text-ink-muted">{item.detail}</span> : null}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
