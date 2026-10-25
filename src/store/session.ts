import { useSyncExternalStore } from 'react';
import { accounts as seededAccounts, companies as seededCompanies } from '../mocks';
import type { Account, Company, CompanyResponsible } from '../types';
import { onlyDigits } from '../utils/validation';

type SessionState = {
  accounts: Account[];
  companies: Company[];
  current: Account | null;
};

export type CompanyRegistration = Omit<Company, 'id'> & {
  responsible: CompanyResponsible;
  password: string;
};

export type RegistrationResult = { ok: true } | { ok: false; reason: 'cnpj' | 'email' };

let state: SessionState = { accounts: seededAccounts, companies: seededCompanies, current: null };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function sameEmail(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function isCnpjTaken(cnpj: string): boolean {
  return state.companies.some((c) => onlyDigits(c.cnpj) === onlyDigits(cnpj));
}

export function isEmailTaken(email: string): boolean {
  return state.accounts.some((a) => sameEmail(a.email, email));
}

export function signIn(email: string, password: string): Account | null {
  const account = state.accounts.find((a) => sameEmail(a.email, email) && a.password === password);
  if (!account) return null;
  state = { ...state, current: account };
  emit();
  return account;
}

export function signOut(): void {
  state = { ...state, current: null };
  emit();
}

export function registerCompany(registration: CompanyRegistration): RegistrationResult {
  if (isCnpjTaken(registration.cnpj)) return { ok: false, reason: 'cnpj' };
  if (isEmailTaken(registration.responsible.email)) return { ok: false, reason: 'email' };

  const { responsible, password, ...companyData } = registration;
  const id = `c-${Date.now()}`;
  const company: Company = { id, ...companyData };
  const account: Account = {
    id: `a-${Date.now()}`,
    role: 'empresa',
    name: company.name,
    email: responsible.email.trim(),
    password,
    companyId: id,
  };
  state = { ...state, companies: [...state.companies, company], accounts: [...state.accounts, account] };
  emit();
  return { ok: true };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useCurrentAccount(): Account | null {
  return useSyncExternalStore(subscribe, () => state.current);
}
