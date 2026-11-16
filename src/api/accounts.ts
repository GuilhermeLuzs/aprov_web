import type { AccessAction, AccessEvent, AccountKind, AccountStatus, Customer, ProductKind } from '../types';
import { apiRequest } from './client';
import type { ApiPanelCompany } from './panel';

export type ApiAccessEvent = Omit<AccessEvent, 'account'>;

export type ApiMasterCustomer = Customer & { status: AccountStatus };

export type ApiMasterCompany = Omit<ApiPanelCompany, 'id'> & { id: string; status: AccountStatus; createdAt: string };

export type AccountCriteria = Record<string, string>;

export type ApiCustomerAccount = {
  customer: ApiMasterCustomer;
  events: ApiAccessEvent[];
  reviews: {
    count: number;
    average: number | null;
    agreements: number;
    disagreements: number;
    recent: { id: string; title: string; companyName: string; rating: number; createdAt: string; removed: boolean }[];
  };
};

export type ApiCompanyAccount = {
  company: ApiMasterCompany;
  events: ApiAccessEvent[];
  items: { total: number; active: number };
  reviews: { count: number; average: number | null; reviewers: number };
  topItems: { id: string; title: string; kind: ProductKind; coverUrl: string | null; active: boolean; count: number; average: number | null }[];
};

export async function apiSearchAccounts(kind: AccountKind, criteria: AccountCriteria): Promise<(ApiMasterCustomer | ApiMasterCompany)[]> {
  const params = new URLSearchParams({ kind });
  Object.entries(criteria).forEach(([key, value]) => {
    if (value.trim()) params.set(key, value.trim());
  });
  return apiRequest(`panel/master/accounts?${params.toString()}`);
}

export async function apiCustomerAccount(id: string): Promise<ApiCustomerAccount> {
  return apiRequest(`panel/master/customers/${id}`);
}

export async function apiCompanyAccount(id: string): Promise<ApiCompanyAccount> {
  return apiRequest(`panel/master/companies/${id}`);
}

export async function apiChangeAccess(change: { kind: AccountKind; id: string; action: AccessAction; reason: string; note: string }): Promise<void> {
  await apiRequest('panel/master/access', { method: 'POST', body: change });
}
