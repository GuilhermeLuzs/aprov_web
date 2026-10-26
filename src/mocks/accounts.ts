import type { Account } from '../types';

export const testCompanyAccount: Account = {
  id: 'a1',
  role: 'empresa',
  name: 'Cozinha da Vó Marlene',
  email: 'empresa@aprov.com',
  password: 'aprov123',
  companyId: 'c2',
};

export const testMasterAccount: Account = {
  id: 'a2',
  role: 'master',
  name: 'Administração APROV',
  email: 'master@aprov.com',
  password: 'aprov123',
};

export const accounts: Account[] = [testCompanyAccount, testMasterAccount];
