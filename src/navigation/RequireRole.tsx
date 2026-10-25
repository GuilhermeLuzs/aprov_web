import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useCurrentAccount } from '../store/session';
import { PANEL_PATH, type Role } from '../types';

type Props = {
  role: Role;
  children: ReactNode;
};

export function RequireRole({ role, children }: Props) {
  const account = useCurrentAccount();
  if (!account) return <Navigate to="/login" replace />;
  if (account.role !== role) return <Navigate to={PANEL_PATH[account.role]} replace />;
  return children;
}
