export type Role = 'empresa' | 'master';

export const PANEL_PATH: Record<Role, string> = {
  empresa: '/empresa',
  master: '/master',
};

export const PANEL_LABEL: Record<Role, string> = {
  empresa: 'Painel da empresa',
  master: 'Administração',
};

export type Account = {
  id: string;
  role: Role;
  name: string;
  email: string;
  password: string;
  companyId?: string;
};
