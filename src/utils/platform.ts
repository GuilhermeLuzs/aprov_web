import type { Category, Customer, Product, Review } from '../types';
import { dayOf, type DayRange } from './overview';

export function lastMonths(today: string, count: number): string[] {
  const [year, month] = today.split('-').map(Number);
  return Array.from({ length: count }, (_, i) =>
    new Date(Date.UTC(year, month - count + i, 1)).toISOString().slice(0, 7),
  );
}

export type MonthCount = { month: string; count: number };

export function countByMonth(reviews: Review[], months: string[]): MonthCount[] {
  const counts = new Map(months.map((month) => [month, 0]));
  reviews.forEach((r) => {
    const month = dayOf(r).slice(0, 7);
    if (counts.has(month)) counts.set(month, (counts.get(month) ?? 0) + 1);
  });
  return [...counts.entries()].map(([month, count]) => ({ month, count }));
}

function dayIn(timestamp: string, range: DayRange): boolean {
  const day = timestamp.slice(0, 10);
  return day >= range.start && day <= range.end;
}

export function activeCount(customers: Customer[], range: DayRange): number {
  return customers.filter((c) => dayIn(c.lastActiveAt, range)).length;
}

export function joinedCount(customers: Customer[], range: DayRange): number {
  return customers.filter((c) => dayIn(c.createdAt, range)).length;
}

export function reviewedCount(products: Product[], reviews: Review[]): number {
  const reviewed = new Set(reviews.map((r) => r.productId));
  return products.filter((p) => reviewed.has(p.id)).length;
}

export type CategoryKindCount = { category: Category; product: number; service: number };

export function categoryKindCounts(products: Product[], categories: Category[]): CategoryKindCount[] {
  return categories.map((category) => {
    const inCategory = products.filter((p) => p.categories.includes(category));
    const product = inCategory.filter((p) => p.kind === 'product').length;
    return { category, product, service: inCategory.length - product };
  });
}
