import { useQuery } from '@tanstack/react-query';
import { apiCompanyAccount, apiCustomerAccount, apiSearchAccounts, type AccountCriteria } from '../api';
import type { AccountKind } from '../types';

export const ACCOUNTS_KEY = ['master', 'accounts'] as const;

export function numericId(id: string | undefined): string | null {
  const match = id?.match(/^[uc](\d{1,18})$/i);
  return match ? match[1] : null;
}

export function useAccountSearch(kind: AccountKind, criteria: AccountCriteria) {
  return useQuery({ queryKey: [...ACCOUNTS_KEY, 'search', kind, criteria], queryFn: () => apiSearchAccounts(kind, criteria) });
}

export function useCustomerAccount(id: string | null) {
  return useQuery({ queryKey: [...ACCOUNTS_KEY, 'customer', id], queryFn: () => apiCustomerAccount(id as string), enabled: id !== null });
}

export function useCompanyAccount(id: string | null) {
  return useQuery({ queryKey: [...ACCOUNTS_KEY, 'company', id], queryFn: () => apiCompanyAccount(id as string), enabled: id !== null });
}
