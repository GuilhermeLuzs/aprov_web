import { Link } from 'react-router';
import { AccountStatusBadge, CompanyAvatar } from '../../../components';
import { customers } from '../../../mocks';
import { useAccessEvents, useRecentlyViewed } from '../../../store/moderation';
import { useCompanies } from '../../../store/session';
import type { AccountKind } from '../../../types';
import { ACCOUNT_PATH } from '../../../utils/accountSearch';
import { eventsOf, statusFrom } from '../../../utils/moderation';

const EXAMPLES: Record<AccountKind, { example: string; meaning: string }[]> = {
  customer: [
    { example: '@ana.silva12', meaning: 'nome de usuário' },
    { example: 'ana@email.com', meaning: 'e-mail, exato' },
    { example: '123.456.789-09', meaning: 'CPF, exato' },
    { example: 'u42', meaning: 'ID da conta' },
    { example: 'Ana Silva', meaning: 'nome, com pelo menos 3 letras' },
  ],
  company: [
    { example: 'Voltz', meaning: 'nome da empresa, com pelo menos 3 letras' },
    { example: 'sac@empresa.com.br', meaning: 'e-mail, exato' },
    { example: '23.456.789/0001-95', meaning: 'CNPJ, exato' },
    { example: 'c3', meaning: 'ID da conta' },
  ],
};

function RecentlyViewed() {
  const recent = useRecentlyViewed();
  const companies = useCompanies();
  const events = useAccessEvents();

  const items = recent.flatMap((ref) => {
    const account =
      ref.kind === 'customer' ? customers.find((c) => c.id === ref.id) : companies.find((c) => c.id === ref.id);
    if (!account) return [];
    const subtitle = 'username' in account ? `@${account.username}` : `CNPJ ${account.cnpj}`;
    const imageUrl = 'logoUrl' in account ? account.logoUrl : undefined;
    return [{ ref, name: account.name, subtitle, imageUrl, status: statusFrom(eventsOf(events, ref)[0]) }];
  });

  return (
    <section className="flex flex-col gap-md rounded-card border border-border bg-surface p-lg">
      <h2 className="font-display font-semibold text-subtitle text-ink">Vistas recentemente</h2>
      {items.length === 0 ? (
        <p className="text-caption text-ink-muted">As contas que você abrir aparecem aqui para voltar a elas rápido.</p>
      ) : (
        <ul className="flex flex-col">
          {items.map((item) => (
            <li key={`${item.ref.kind}-${item.ref.id}`} className="flex items-center gap-md border-b border-border py-sm last:border-b-0">
              <CompanyAvatar name={item.name} imageUrl={item.imageUrl} />
              <div className="flex min-w-zero flex-1 flex-col">
                <Link
                  to={`${ACCOUNT_PATH[item.ref.kind]}/${item.ref.id}`}
                  className="sensitive truncate font-semibold text-ink hover:text-primary"
                >
                  {item.name}
                </Link>
                <span className="sensitive truncate text-caption text-ink-muted">{item.subtitle}</span>
              </div>
              <AccountStatusBadge status={item.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function SearchGuide({ kind }: { kind: AccountKind }) {
  return (
    <div className="grid items-start gap-lg lg:grid-cols-2">
      <section className="flex flex-col gap-md rounded-card border border-border bg-surface p-lg">
        <div className="flex flex-col gap-xs">
          <h2 className="font-display font-semibold text-subtitle text-ink">Como buscar</h2>
          <p className="text-caption text-ink-muted">
            Use um identificador para ir direto à conta, ou escolha um filtro para ver um grupo. A lista completa não é
            mostrada de uma vez.
          </p>
        </div>
        <dl className="flex flex-col">
          {EXAMPLES[kind].map((entry) => (
            <div key={entry.example} className="flex flex-wrap items-baseline gap-sm border-b border-border py-sm last:border-b-0">
              <dt className="rounded-control bg-surface-alt px-sm font-mono text-caption text-ink">{entry.example}</dt>
              <dd className="text-caption text-ink-muted">{entry.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>
      <RecentlyViewed />
    </div>
  );
}
