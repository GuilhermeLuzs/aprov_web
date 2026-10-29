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

const DAY_MS = 24 * 60 * 60 * 1000;
const RELATIVE_DAYS = 30;

export function formatRelativeDay(day: string, today: string): string {
  const days = Math.round((Date.parse(`${today}T00:00:00.000Z`) - Date.parse(`${day}T00:00:00.000Z`)) / DAY_MS);
  if (days <= 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days <= RELATIVE_DAYS) return `há ${days} dias`;
  return formatLongDay(day);
}

export function formatDateTime(timestamp: string): string {
  return `${formatLongDay(timestamp.slice(0, 10))}, ${timestamp.slice(11, 16)}`;
}

export function maskCpf(cpf: string): string {
  return cpf.replace(/^\d{3}/, '***').replace(/\d{2}$/, '**');
}

export function formatMonth(month: string): string {
  const [year, index] = month.split('-').map(Number);
  return `${MONTH_LABELS[index - 1]}/${String(year).slice(2)}`;
}

export function formatLongMonth(month: string): string {
  const [year, index] = month.split('-').map(Number);
  return `${MONTH_LABELS[index - 1]} de ${year}`;
}

export function formatPercent(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'percent', maximumFractionDigits: 0 });
}

export function plural(count: number, singular: string, pluralForm: string): string {
  return `${formatInt(count)} ${count === 1 ? singular : pluralForm}`;
}
