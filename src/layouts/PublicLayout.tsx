import { Outlet } from 'react-router';
import { CompanyHeader } from './CompanyHeader';
import { PublicFooter } from './PublicFooter';
import { PublicHeader } from './PublicHeader';

type Props = {
  audience?: 'clientes' | 'empresas';
};

export function PublicLayout({ audience = 'clientes' }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      {audience === 'empresas' ? <CompanyHeader /> : <PublicHeader />}
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
