import { CHARACTERISTICS, type Characteristic, type Product, type Review, type Sentiment, type Tag } from '../types';

export type PeriodKey = '7d' | '30d' | 'month' | 'lastMonth' | 'custom';

export type DayRange = { start: string; end: string };

const DAY_MS = 24 * 60 * 60 * 1000;

function toDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function fromDay(day: string): Date {
  return new Date(`${day}T00:00:00.000Z`);
}

export function shiftDay(day: string, days: number): string {
  return toDay(new Date(fromDay(day).getTime() + days * DAY_MS));
}

export function dayOf(review: Review): string {
  return review.createdAt.slice(0, 10);
}

export function presetRange(key: Exclude<PeriodKey, 'custom'>, today: string): DayRange {
  if (key === '7d') return { start: shiftDay(today, -6), end: today };
  if (key === '30d') return { start: shiftDay(today, -29), end: today };
  const monthStart = `${today.slice(0, 8)}01`;
  if (key === 'lastMonth') {
    const lastMonthEnd = shiftDay(monthStart, -1);
    return { start: `${lastMonthEnd.slice(0, 8)}01`, end: lastMonthEnd };
  }
  return { start: monthStart, end: today };
}

export function daysIn(range: DayRange): string[] {
  const days: string[] = [];
  for (let day = range.start; day <= range.end; day = shiftDay(day, 1)) days.push(day);
  return days;
}

export function inRange(reviews: Review[], range: DayRange): Review[] {
  return reviews.filter((r) => {
    const day = dayOf(r);
    return day >= range.start && day <= range.end;
  });
}

export function reviewAverage(review: Review): number {
  return CHARACTERISTICS.reduce((sum, key) => sum + review.ratings[key], 0) / CHARACTERISTICS.length;
}

function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, v) => sum + v, 0) / values.length;
}

export type Averages = { overall: number } & Record<Characteristic, number>;

export function averagesOf(reviews: Review[]): Averages {
  return {
    overall: mean(reviews.map(reviewAverage)),
    entrega: mean(reviews.map((r) => r.ratings.entrega)),
    qualidade: mean(reviews.map((r) => r.ratings.qualidade)),
    conformidade: mean(reviews.map((r) => r.ratings.conformidade)),
    custoBeneficio: mean(reviews.map((r) => r.ratings.custoBeneficio)),
  };
}

export type ProductScore = { product: Product; average: number; count: number };

export function productScores(reviews: Review[], products: Product[]): ProductScore[] {
  return products
    .map((product) => {
      const own = reviews.filter((r) => r.productId === product.id);
      return { product, average: mean(own.map(reviewAverage)), count: own.length };
    })
    .filter((score) => score.count > 0)
    .sort((a, b) => b.average - a.average || b.count - a.count);
}

export type ScoreExtremes = { best: ProductScore[]; worst: ProductScore[] };

export function scoreExtremes(scores: ProductScore[], size: number): ScoreExtremes {
  const bestCount = Math.min(size, Math.ceil(scores.length / 2));
  const worstCount = Math.min(size, scores.length - bestCount);
  return {
    best: scores.slice(0, bestCount),
    worst: scores.slice(scores.length - worstCount).reverse(),
  };
}

export type RatingTone ='bad' | 'poor' | 'fair' | 'good';

const RATING_TONE_FLOORS: [number, RatingTone][] = [
  [4.5, 'good'],
  [3.5, 'fair'],
  [2.5, 'poor'],
];

export function ratingTone(average: number): RatingTone {
  const shown = Math.round(average * 10) / 10;
  return RATING_TONE_FLOORS.find(([floor]) => shown >= floor)?.[1] ?? 'bad';
}

export type TagCount ={ tag: Tag; count: number };

export function tagCounts(reviews: Review[], tagById: Record<string, Tag>, sentiment: Sentiment): TagCount[] {
  const counts = new Map<string, number>();
  reviews.forEach((r) => {
    const ids = sentiment === 'positive' ? r.positiveTagIds : r.negativeTagIds;
    ids.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
  });
  return [...counts.entries()]
    .map(([id, count]) => ({ tag: tagById[id], count }))
    .filter((entry) => entry.tag)
    .sort((a, b) => b.count - a.count || a.tag.label.localeCompare(b.tag.label));
}

export type DayCount = { day: string; count: number };

export function countByDay(reviews: Review[], range: DayRange): DayCount[] {
  const counts = new Map(daysIn(range).map((day) => [day, 0]));
  reviews.forEach((r) => {
    const day = dayOf(r);
    if (counts.has(day)) counts.set(day, (counts.get(day) ?? 0) + 1);
  });
  return [...counts.entries()].map(([day, count]) => ({ day, count }));
}

export function countByWeekday(reviews: Review[]): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    counts[fromDay(dayOf(r)).getUTCDay()] += 1;
  });
  return counts;
}

export type DayAverages = { day: string; count: number } & Averages;

export function averagesByDay(reviews: Review[]): DayAverages[] {
  const byDay = new Map<string, Review[]>();
  reviews.forEach((r) => {
    const day = dayOf(r);
    byDay.set(day, [...(byDay.get(day) ?? []), r]);
  });
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, list]) => ({ day, count: list.length, ...averagesOf(list) }));
}
