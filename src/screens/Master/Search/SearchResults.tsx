import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { AccountStatusBadge, CompanyAvatar, EmptyNotice, PageSizeSelect, Pagination } from '../../../components';
import { customers, mockToday } from '../../../mocks';
import { useAccessEvents } from '../../../store/moderation';
import { useCompanies } from '../../../store/session';
import { icon } from '../../../theme';
import { CATEGORY_LABEL, type AccountKind, type AccountStatus, type Company, type Customer } from '../../../types';
import { ACCOUNT_PATH, RESULT_LIMIT, searchCompanies, searchCustomers, ufOf, type SearchCriteria } from '../../../utils/accountSearch';
import { formatRelativeDay, plural } from '../../../utils/format';
import { latestEvents, statusFrom } from '../../../utils/moderation';
import { pageCountOf, pageSlice } from '../../../utils/pagination';

const PAGE_SIZES = [10, 25, 50] as const;

type Row = { id: string; name: string; subtitle: string; imageUrl?: string; columns: string[]; status: AccountStatus };

const COLUMNS: Record<AccountKind, string[]> = {
  customer: ['Cidade', 'Último acesso'],
  company: ['Categoria', 'Estado'],
};

function customerRow(customer: Customer, status: AccountStatus): Row {
  return {
    id: customer.id,
    name: customer.name,
    subtitle: `@${customer.username} · ${customer.email}`,
    columns: [`${customer.city}, ${customer.uf}`, formatRelativeDay(customer.lastActiveAt.slice(0, 10), mockToday)],
    status,
  };
}

function companyRow(company: Company, status: AccountStatus): Row {
  return {
    id: company.id,
    name: company.name,
    subtitle: `CNPJ ${company.cnpj}`,
    imageUrl: company.logoUrl,
    columns: [CATEGORY_LABEL[company.category], ufOf(company) || '–'],
    status,
  };
}

function AccountLink({ kind, row, className }: { kind: AccountKind; row: Row; className: string }) {
  const location = useLocation();
  return (
    <Link to={`${ACCOUNT_PATH[kind]}/${row.id}`} state={{ search: location.search }} className={className} title={row.name}>
      {row.name}
    </Link>
  );
}

function ResultList({ kind, rows }: { kind: AccountKind; rows: Row[] }) {
  return (
    <>
      <table className="hidden w-full lg:table">
        <thead>
          <tr className="border-b border-border text-caption text-ink-muted">
            <th scope="col" className="w-2/5 px-md py-sm text-left font-semibold">
              {kind === 'customer' ? 'Cliente' : 'Empresa'}
            </th>
            {COLUMNS[kind].map((column) => (
              <th key={column} scope="col" className="px-md py-sm text-left font-semibold whitespace-nowrap">
                {column}
              </th>
            ))}
            <th scope="col" className="px-md py-sm text-left font-semibold whitespace-nowrap">
              Status
            </th>
            <th scope="col" className="w-px px-md py-sm">
              <span className="sr-only">Abrir</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-bg">
              <td className="max-w-zero px-md py-sm">
                <div className="flex min-w-zero items-center gap-md">
                  <CompanyAvatar name={row.name} imageUrl={row.imageUrl} />
                  <div className="flex min-w-zero flex-col">
                    <AccountLink kind={kind} row={row} className="sensitive truncate font-semibold text-ink hover:text-primary" />
                    <span className="sensitive truncate text-caption text-ink-muted">{row.subtitle}</span>
                  </div>
                </div>
              </td>
              {row.columns.map((value, index) => (
                <td key={COLUMNS[kind][index]} className="px-md py-sm whitespace-nowrap text-ink-muted">
                  {value}
                </td>
              ))}
              <td className="px-md py-sm">
                <AccountStatusBadge status={row.status} />
              </td>
              <td className="px-md py-sm text-ink-faint">
                <ChevronRight size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="flex flex-col lg:hidden">
        {rows.map((row) => (
          <li key={row.id} className="flex items-start gap-md border-b border-border py-md last:border-b-0">
            <CompanyAvatar name={row.name} imageUrl={row.imageUrl} />
            <div className="flex min-w-zero flex-1 flex-col gap-xs">
              <AccountLink kind={kind} row={row} className="sensitive font-semibold text-ink hover:text-primary" />
              <span className="sensitive truncate text-caption text-ink-muted">{row.subtitle}</span>
              <div className="flex flex-wrap items-center gap-sm text-caption text-ink-muted">
                <AccountStatusBadge status={row.status} />
                {row.columns.map((value, index) => (
                  <span key={COLUMNS[kind][index]}>{value}</span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

type Props = { kind: AccountKind; criteria: SearchCriteria };

export function SearchResults({ kind, criteria }: Props) {
  const companies = useCompanies();
  const latest = latestEvents(useAccessEvents(), kind);
  const statusOf = (id: string) => statusFrom(latest.get(id));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);

  const rows =
    kind === 'customer'
      ? searchCustomers(customers, criteria, statusOf, mockToday).map((c) => customerRow(c, statusOf(c.id)))
      : searchCompanies(companies, criteria, statusOf).map((c) => companyRow(c, statusOf(c.id)));

  if (rows.length === 0) {
    return (
      <EmptyNotice
        mood="confused"
        title="Nenhuma conta encontrada"
        text="Confira o que foi digitado ou tire algum filtro. E-mail, CPF, CNPJ e ID precisam estar completos e exatos."
      />
    );
  }

  const overflow = rows.length > RESULT_LIMIT;
  const shown = rows.slice(0, RESULT_LIMIT);
  const pageCount = pageCountOf(shown.length, pageSize);
  const currentPage = Math.min(page, pageCount);
  const pageRows = pageSlice(shown, currentPage, pageSize);
  const firstShown = (currentPage - 1) * pageSize + 1;
  const lastShown = firstShown + pageRows.length - 1;

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <section className="flex min-w-zero flex-col gap-lg rounded-card border border-border bg-surface p-lg">
      <div className="flex flex-col gap-xs">
        <h2 className="font-display font-semibold text-subtitle text-ink">
          {overflow ? `Mais de ${RESULT_LIMIT} contas encontradas` : plural(rows.length, 'conta encontrada', 'contas encontradas')}
        </h2>
        {overflow ? (
          <p className="text-caption text-ink-muted">
            Mostrando só as {RESULT_LIMIT} {kind === 'customer' ? 'que usaram o app mais recentemente' : 'primeiras em ordem alfabética'}.
            Adicione filtros ou use um identificador para chegar na conta certa.
          </p>
        ) : null}
      </div>
      <ResultList kind={kind} rows={pageRows} />
      <div className="flex flex-col items-center gap-md border-t border-border pt-lg lg:grid lg:grid-cols-3">
        <span aria-live="polite" className="text-caption text-ink-muted lg:justify-self-start">
          Mostrando {firstShown} a {lastShown} de {shown.length} · Página {currentPage} de {pageCount}
        </span>
        <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
        <div className="lg:col-start-3 lg:justify-self-end">
          <PageSizeSelect value={pageSize} options={PAGE_SIZES} onChange={changePageSize} />
        </div>
      </div>
    </section>
  );
}
