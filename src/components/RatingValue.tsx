import { formatRating } from '../utils/format';
import { ratingTone, type RatingTone } from '../utils/overview';

export const RATING_TONE_FILL: Record<RatingTone, string> = {
  bad: 'bg-rating-bad',
  poor: 'bg-rating-poor',
  fair: 'bg-rating-fair',
  good: 'bg-rating-good',
};

export function RatingValue({ average }: { average: number | null }) {
  if (average === null) return <span className="text-caption text-ink-faint">Sem nota</span>;

  return (
    <span className="sensitive inline-flex items-center gap-sm font-semibold text-ink tabular-nums">
      <span className={`h-legend-key w-legend-key shrink-0 rounded-pill ${RATING_TONE_FILL[ratingTone(average)]}`} aria-hidden />
      {formatRating(average)}
    </span>
  );
}
