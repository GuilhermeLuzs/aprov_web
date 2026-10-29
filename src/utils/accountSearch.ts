import type { AccountKind, AccountStatus, Company, Customer } from '../types';
import { shiftDay } from './overview';
import { onlyDigits } from './validation';

export const SEARCH_PATH = '/master/busca';

export const ACCOUNT_PATH: Record<AccountKind, string> = {
  customer: `${SEARCH_PATH}/clientes`,
  company: `${SEARCH_PATH}/empresas`,
};

export const RESULT_LIMIT = 50;
export const MIN_NAME_LENGTH = 3;
const RECENT_DAYS = 30;
const DOCUMENT_LENGTH: Record<AccountKind, number> = { customer: 11, company: 14 };
const ID_PATTERN: Record<AccountKind, RegExp> = { customer: /^u\d+$/i, company: /^c\d+$/i };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOCUMENT_CHARACTERS = /^[\d.\-/\s]+$/;

export type QueryKind = 'none' | 'id' | 'email' | 'username' | 'document' | 'name' | 'tooShort' | 'incompleteDocument';

export type SearchCriteria = {
  query: string;
  status: string;
  uf: string;
  joined: string;
  activity: string;
  category: string;
  size: string;
};

export type FilterKey = Exclude<keyof SearchCriteria, 'query'>;

export const EMPTY_CRITERIA: SearchCriteria = { query: '', status: '', uf: '', joined: '', activity: '', category: '', size: '' };

export const FILTER_KEYS: Record<AccountKind, FilterKey[]> = {
  customer: ['status', 'uf', 'joined', 'activity'],
  company: ['status', 'uf', 'category', 'size'],
};

const PARAM: Record<keyof SearchCriteria, string> = {
  query: 'q',
  status: 'status',
  uf: 'uf',
  joined: 'cadastro',
  activity: 'atividade',
  category: 'categoria',
  size: 'porte',
};

const KIND_PARAM: Record<AccountKind, string> = { customer: 'clientes', company: 'empresas' };

export function kindFromParams(params: URLSearchParams): AccountKind {
  return params.get('tipo') === KIND_PARAM.company ? 'company' : 'customer';
}

export function criteriaFromParams(params: URLSearchParams): SearchCriteria {
  const entries = (Object.keys(PARAM) as (keyof SearchCriteria)[]).map((key) => [key, params.get(PARAM[key]) ?? '']);
  return Object.fromEntries(entries) as SearchCriteria;
}

export function paramsFrom(kind: AccountKind, criteria: SearchCriteria): URLSearchParams {
  const params = new URLSearchParams({ tipo: KIND_PARAM[kind] });
  if (criteria.query.trim()) params.set(PARAM.query, criteria.query.trim());
  FILTER_KEYS[kind].forEach((key) => {
    if (criteria[key]) params.set(PARAM[key], criteria[key]);
  });
  return params;
}

function normalized(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

export function queryKind(query: string, kind: AccountKind): QueryKind {
  const text = query.trim();
  if (!text) return 'none';
  if (EMAIL_PATTERN.test(text)) return 'email';
  if (ID_PATTERN[kind].test(text)) return 'id';
  if (kind === 'customer' && text.startsWith('@')) return text.length > 1 ? 'username' : 'tooShort';
  if (DOCUMENT_CHARACTERS.test(text)) {
    return onlyDigits(text).length === DOCUMENT_LENGTH[kind] ? 'document' : 'incompleteDocument';
  }
  return normalized(text).length >= MIN_NAME_LENGTH ? 'name' : 'tooShort';
}

export function isSearchable(kind: QueryKind): boolean {
  return kind !== 'tooShort' && kind !== 'incompleteDocument';
}

export function hasAnchor(criteria: SearchCriteria, kind: AccountKind): boolean {
  const query = queryKind(criteria.query, kind);
  return (query !== 'none' && isSearchable(query)) || FILTER_KEYS[kind].some((key) => criteria[key] !== '');
}

function matchesName(name: string, query: string): boolean {
  const haystack = normalized(name);
  return normalized(query).split(/\s+/).every((term) => haystack.includes(term));
}

function matchesQuery(fields: { id: string; email: string; name: string; document: string; username?: string }, query: string, kind: QueryKind): boolean {
  const text = query.trim();
  if (kind === 'none') return true;
  if (kind === 'email') return fields.email.toLowerCase() === text.toLowerCase();
  if (kind === 'id') return fields.id.toLowerCase() === text.toLowerCase();
  if (kind === 'document') return onlyDigits(fields.document) === onlyDigits(text);
  if (kind === 'username') return (fields.username ?? '').startsWith(normalized(text.slice(1)));
  if (kind === 'name') return matchesName(fields.name, text);
  return false;
}

export const JOINED_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };

function joinedMatches(createdAt: string, filter: string, today: string): boolean {
  if (!filter) return true;
  const day = createdAt.slice(0, 10);
  if (filter === 'older') return day < shiftDay(today, -89);
  return day >= shiftDay(today, -(JOINED_DAYS[filter] - 1));
}

function activityMatches(lastActiveAt: string, filter: string, today: string): boolean {
  if (!filter) return true;
  const recent = lastActiveAt.slice(0, 10) >= shiftDay(today, -(RECENT_DAYS - 1));
  return filter === 'recent' ? recent : !recent;
}

export function searchCustomers(
  customers: Customer[],
  criteria: SearchCriteria,
  statusOf: (id: string) => AccountStatus,
  today: string,
): Customer[] {
  const kind = queryKind(criteria.query, 'customer');
  return customers
    .filter(
      (c) =>
        matchesQuery({ ...c, document: c.cpf }, criteria.query, kind) &&
        (!criteria.status || statusOf(c.id) === criteria.status) &&
        (!criteria.uf || c.uf === criteria.uf) &&
        joinedMatches(c.createdAt, criteria.joined, today) &&
        activityMatches(c.lastActiveAt, criteria.activity, today),
    )
    .sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt));
}

export function ufOf(company: Company): string {
  return company.address.trim().match(/\b([A-Z]{2})$/)?.[1] ?? '';
}

export function searchCompanies(companies: Company[], criteria: SearchCriteria, statusOf: (id: string) => AccountStatus): Company[] {
  const kind = queryKind(criteria.query, 'company');
  return companies
    .filter(
      (c) =>
        matchesQuery({ ...c, document: c.cnpj }, criteria.query, kind) &&
        (!criteria.status || statusOf(c.id) === criteria.status) &&
        (!criteria.uf || ufOf(c) === criteria.uf) &&
        (!criteria.category || c.category === criteria.category) &&
        (!criteria.size || c.size === criteria.size),
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}
