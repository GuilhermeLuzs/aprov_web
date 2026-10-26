export const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function formatRating(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatInt(value: number): string {
  return value.toLocaleString('pt-BR');
}

export function formatDay(day: string): string {
  const [, month, date] = day.split('-');
  return `${date}/${month}`;
}

export function formatLongDay(day: string): string {
  const [year, month, date] = day.split('-').map(Number);
  return `${date} de ${MONTH_LABELS[month - 1]} de ${year}`;
}

export function plural(count: number, singular: string, pluralForm: string): string {
  return `${formatInt(count)} ${count === 1 ? singular : pluralForm}`;
}
