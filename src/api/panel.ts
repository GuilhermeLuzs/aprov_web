import type { Category } from '../types';
import { apiRequest } from './client';

export type ApiModality = 'physical' | 'online' | 'hybrid';

export type ApiCompanySize = 'micro' | 'small' | 'medium' | 'large';

export type ApiPanelCompany = {
  id: number;
  cnpj: string;
  name: string;
  email: string;
  phone: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  niche: Category;
  modality: ApiModality;
  size: ApiCompanySize;
  description: string | null;
  logoUrl: string | null;
  responsibleName: string;
  responsiblePhone: string;
};

export type ApiPanelAccount = {
  id: number;
  role: 'company' | 'master';
  name: string;
  email: string;
  company: ApiPanelCompany | null;
};

export type CompanyRegistrationPayload = {
  cnpj: string;
  name: string;
  email: string;
  phone: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  niche: Category;
  modality: ApiModality;
  size: ApiCompanySize;
  responsibleName: string;
  responsibleCpf: string;
  responsibleEmail: string;
  responsiblePhone: string;
  password: string;
};

export async function apiPanelLogin(email: string, password: string): Promise<ApiPanelAccount> {
  return apiRequest<ApiPanelAccount>('panel/login', { method: 'POST', body: { email, password } });
}

export async function apiPanelMe(): Promise<ApiPanelAccount> {
  return apiRequest<ApiPanelAccount>('panel/me');
}

export async function apiPanelLogout(): Promise<void> {
  await apiRequest<null>('panel/logout', { method: 'POST' });
}

export async function apiRegisterCompany(payload: CompanyRegistrationPayload): Promise<{ email: string }> {
  return apiRequest<{ email: string }>('panel/register', { method: 'POST', body: payload });
}

export async function apiUpdatePanelProfile(profile: { name: string; email: string }): Promise<ApiPanelAccount> {
  return apiRequest<ApiPanelAccount>('panel/me', { method: 'PATCH', body: profile });
}

export async function apiChangePanelPassword(currentPassword: string, password: string): Promise<void> {
  await apiRequest<null>('panel/me/password', { method: 'PUT', body: { currentPassword, password } });
}

export type CompanyUpdatePayload = Omit<CompanyRegistrationPayload, 'cnpj' | 'responsibleCpf' | 'responsibleEmail' | 'password'> & {
  description: string;
};

export async function apiUpdateCompany(payload: CompanyUpdatePayload): Promise<ApiPanelAccount> {
  return apiRequest<ApiPanelAccount>('panel/company', { method: 'PATCH', body: payload });
}

export async function apiDeactivateCompany(password: string): Promise<void> {
  await apiRequest<null>('panel/deactivate', { method: 'POST', body: { password } });
}
