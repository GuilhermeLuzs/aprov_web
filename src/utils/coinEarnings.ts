import { REWARD_THRESHOLD, REWARD_TOPICS_BY_KIND, type CoinRedemption, type CoinSettings, type ProductKind, type Review, type RewardTopic } from '../types';
import { daysIn, dayOf, inRange, type DayRange } from './overview';

type ReviewFacts = Record<RewardTopic, number>;

function seed(id: string): number {
  return [...id].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 997, 7);
}

function factsOf(review: Review): ReviewFacts {
  const s = seed(review.id);
  const photos = s % 4;
  return {
    review: 1,
    tags: review.positiveTagIds.length + review.negativeTagIds.length,
    video: s % 3 === 0 ? 1 : 0,
    photos,
    photoInUse: photos > 0 && s % 2 === 0 ? 1 : 0,
    longComment: review.comment.length,
    consistentComment: review.comment.length > 40 && s % 5 !== 0 ? 1 : 0,
  };
}

export type ReviewEarning = { review: Review; byTopic: Partial<Record<RewardTopic, number>>; total: number };

export function earningOf(review: Review, kind: ProductKind, settings: CoinSettings): ReviewEarning {
  const facts = factsOf(review);
  const table = settings.rewards[kind];
  const byTopic: Partial<Record<RewardTopic, number>> = {};
  REWARD_TOPICS_BY_KIND[kind].forEach((topic) => {
    const rule = table[topic];
    if (!rule || rule.coins === 0) return;
    const needed = REWARD_THRESHOLD[topic] ? (rule.threshold ?? 1) : 1;
    if (facts[topic] >= needed) byTopic[topic] = rule.coins;
  });
  const total = Object.values(byTopic).reduce((sum, coins) => sum + (coins ?? 0), 0);
  return { review, byTopic, total };
}

export function earningsOf(reviews: Review[], kindOf: (review: Review) => ProductKind, settings: CoinSettings): ReviewEarning[] {
  return reviews.map((review) => earningOf(review, kindOf(review), settings));
}

export function sumEarnings(earnings: ReviewEarning[]): number {
  return earnings.reduce((sum, e) => sum + e.total, 0);
}

export function sumRedemptions(redemptions: CoinRedemption[]): number {
  return redemptions.reduce((sum, r) => sum + r.coins, 0);
}

export function earningsInRange(earnings: ReviewEarning[], range: DayRange): ReviewEarning[] {
  const inside = new Set(inRange(earnings.map((e) => e.review), range).map((r) => r.id));
  return earnings.filter((e) => inside.has(e.review.id));
}

export function redemptionsInRange(redemptions: CoinRedemption[], range: DayRange): CoinRedemption[] {
  return redemptions.filter((r) => r.createdAt.slice(0, 10) >= range.start && r.createdAt.slice(0, 10) <= range.end);
}

export type TopicTotal = { topic: RewardTopic; coins: number };

export function totalsByTopic(earnings: ReviewEarning[]): TopicTotal[] {
  const totals = new Map<RewardTopic, number>();
  earnings.forEach((e) =>
    (Object.entries(e.byTopic) as [RewardTopic, number][]).forEach(([topic, coins]) => totals.set(topic, (totals.get(topic) ?? 0) + coins)),
  );
  return [...totals.entries()].map(([topic, coins]) => ({ topic, coins })).sort((a, b) => b.coins - a.coins);
}

export type DayCoins = { day: string; earned: number; redeemed: number; reviews: number; coupons: number };

export function coinsByDay(earnings: ReviewEarning[], redemptions: CoinRedemption[], range: DayRange): DayCoins[] {
  const days = new Map(daysIn(range).map((day) => [day, { day, earned: 0, redeemed: 0, reviews: 0, coupons: 0 }]));
  earnings.forEach((e) => {
    const entry = days.get(dayOf(e.review));
    if (entry) {
      entry.earned += e.total;
      entry.reviews += 1;
    }
  });
  redemptions.forEach((r) => {
    const entry = days.get(r.createdAt.slice(0, 10));
    if (entry) {
      entry.redeemed += r.coins;
      entry.coupons += 1;
    }
  });
  return [...days.values()];
}

export const WEEKLY_FROM_DAYS = 15;

export function coinsByWeek(days: DayCoins[]): DayCoins[] {
  const weeks = new Map<string, DayCoins>();
  days.forEach((entry) => {
    const date = new Date(`${entry.day}T00:00:00.000Z`);
    const offset = (date.getUTCDay() + 6) % 7;
    const monday = new Date(date.getTime() - offset * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const week = weeks.get(monday) ?? { day: monday, earned: 0, redeemed: 0, reviews: 0, coupons: 0 };
    week.earned += entry.earned;
    week.redeemed += entry.redeemed;
    week.reviews += entry.reviews;
    week.coupons += entry.coupons;
    weeks.set(monday, week);
  });
  return [...weeks.values()];
}
