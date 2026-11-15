import { useSyncExternalStore } from 'react';
import {
  ApiError,
  apiChangePanelPassword,
  apiPanelLogin,
  apiPanelLogout,
  apiPanelMe,
  apiRegisterCompany,
  apiUpdatePanelProfile,
  onUnauthorized,
  type ApiCompanySize,
  type ApiModality,
  type ApiPanelAccount,
  type ApiPanelCompany,
  type CompanyRegistrationPayload,
} from '../api';
import { accounts as seededAccounts, companies as seededCompanies } from '../mocks';
import type { Account, Company, CompanySize, Modality } from '../types';

type SessionStatus = 'loading' | 'ready';

type SessionState = { status: SessionStatus; current: Account | null; company: Company | null };

export type FieldErrors = Record<string, string>;

export type ActionResult = { ok: true } | { ok: false; message: string; errors: FieldErrors };

const MODALITY_FROM_API: Record<ApiModality, Modality> = { physical: 'presencial', online: 'online', hybrid: 'hibrida' };

export const MODALITY_TO_API: Record<Modality, ApiModality> = { presencial: 'physical', online: 'online', hibrida: 'hybrid' };

const SIZE_FROM_API: Record<ApiCompanySize, CompanySize> = { micro: 'micro', small: 'pequena', medium: 'media', large: 'grande' };

export const SIZE_TO_API: Record<CompanySize, ApiCompanySize> = { micro: 'micro', pequena: 'small', media: 'medium', grande: 'large' };

const mockCompanyId = (apiId: number) => `c${apiId}`;

let state: SessionState = { status: 'loading', current: null, company: null };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function addressOf(company: ApiPanelCompany): string {
  const complement = company.complement ? ` - ${company.complement}` : '';
  return `${company.street}, ${company.number}${complement}, ${company.district}, ${company.city}/${company.state}`;
}

function companyFromApi(company: ApiPanelCompany): Company {
  return {
    id: mockCompanyId(company.id),
    cnpj: company.cnpj,
    name: company.name,
    address: addressOf(company),
    email: company.email,
    phone: company.phone,
    category: company.niche,
    modality: MODALITY_FROM_API[company.modality],
    size: SIZE_FROM_API[company.size],
    description: company.description ?? undefined,
    logoUrl: company.logoUrl ?? undefined,
  };
}

function accountFromApi(api: ApiPanelAccount): Account {
  return {
    id: String(api.id),
    role: api.role === 'company' ? 'empresa' : 'master',
    name: api.name,
    email: api.email,
    companyId: api.company ? mockCompanyId(api.company.id) : undefined,
  };
}

function setSession(api: ApiPanelAccount | null): void {
  state = {
    status: 'ready',
    current: api ? accountFromApi(api) : null,
    company: api?.company ? companyFromApi(api.company) : null,
  };
  emit();
}

function failure(error: unknown, fallback: string): ActionResult {
  if (error instanceof ApiError) {
    const errors = Object.fromEntries(Object.entries(error.errors).map(([field, messages]) => [field, messages[0] ?? '']));
    return { ok: false, message: error.message, errors };
  }
  return { ok: false, message: fallback, errors: {} };
}

onUnauthorized(() => {
  if (state.current) setSession(null);
});

export async function restoreSession(): Promise<void> {
  try {
    setSession(await apiPanelMe());
  } catch {
    setSession(null);
  }
}

export type SignInResult = { ok: true; account: Account } | { ok: false; message: string };

export async function signIn(email: string, password: string): Promise<SignInResult> {
  try {
    const api = await apiPanelLogin(email.trim(), password);
    setSession(api);
    return { ok: true, account: accountFromApi(api) };
  } catch (error) {
    return { ok: false, message: error instanceof ApiError ? error.message : 'Não deu para entrar agora. Tente de novo.' };
  }
}

export async function signOut(): Promise<void> {
  try {
    await apiPanelLogout();
  } finally {
    setSession(null);
  }
}

export async function registerCompany(payload: CompanyRegistrationPayload): Promise<ActionResult> {
  try {
    await apiRegisterCompany(payload);
    return { ok: true };
  } catch (error) {
    return failure(error, 'Não deu para cadastrar agora. Tente de novo.');
  }
}

export async function updateProfile(profile: { name: string; email: string }): Promise<ActionResult> {
  try {
    setSession(await apiUpdatePanelProfile({ name: profile.name.trim(), email: profile.email.trim() }));
    return { ok: true };
  } catch (error) {
    return failure(error, 'Não deu para salvar agora. Tente de novo.');
  }
}

export async function changePassword(current: string, next: string): Promise<ActionResult> {
  try {
    await apiChangePanelPassword(current, next);
    return { ok: true };
  } catch (error) {
    return failure(error, 'Não deu para trocar a senha agora. Tente de novo.');
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSessionStatus(): SessionStatus {
  return useSyncExternalStore(subscribe, () => state.status);
}

export function useCurrentAccount(): Account | null {
  return useSyncExternalStore(subscribe, () => state.current);
}

export function useCurrentCompany(): Company | null {
  return useSyncExternalStore(subscribe, () => state.company);
}

export function useAccountName(): (accountId: string) => string {
  const current = useCurrentAccount();
  return (accountId) =>
    accountId === current?.id ? current.name : (seededAccounts.find((a) => a.id === accountId)?.name ?? 'Conta removida');
}

export function useCompanies(): Company[] {
  return seededCompanies;
}
