import { useEffect } from 'react';
import { useParams } from 'react-router';
import { AccountStatusBadge, CompanyAvatar, RatingValue, StatTile, StatusBadge } from '../../../components';
import { reviews } from '../../../mocks';
import { useProducts } from '../../../store/catalog';
import { markViewed, useAccessEvents } from '../../../store/moderation';
import { useCompanies } from '../../../store/session';
import {
  CATEGORY_LABEL,
  COMPANY_SIZE_LABEL,
  MODALITY_LABEL,
  PRODUCT_KIND_LABEL,
  type AccountRef,
} from '../../../types';
import { catalogRows } from '../../../utils/catalog';
import { formatInt, formatRating, plural } from '../../../utils/format';
import { eventsOf, statusFrom } from '../../../utils/moderation';
import { averagesOf } from '../../../utils/overview';
import { AccessPanel } from './AccessPanel';
import { AccessHistory, AccountNotFound, BackToSearch, InfoCard, SectionCard } from './AccountParts';

const TOP_ITEMS = 5;

export default function CompanyAccountScreen() {
  const { id } = useParams();
  const company = useCompanies().find((c) => c.id === id);
  const allEvents = useAccessEvents();
  const allProducts = useProducts();

  useEffect(() => {
    if (company) markViewed({ kind: 'company', id: company.id });
  }, [company]);

  if (!company) return <AccountNotFound />;

  const ref: AccountRef = { kind: 'company', id: company.id };
  const events = eventsOf(allEvents, ref);
  const products = allProducts.filter((p) => p.companyId === company.id);
  const received = reviews.filter((r) => r.companyId === company.id);
  const activeCount = products.filter((p) => p.status === 'active').length;
  const reviewers = new Set(received.map((r) => r.authorId)).size;
  const topItems = catalogRows(products, received)
    .sort((a, b) => b.count - a.count || a.product.title.localeCompare(b.product.title))
    .slice(0, TOP_ITEMS);

  return (
    <div className="flex flex-col gap-xl px-lg py-xl lg:px-xxl">
      <BackToSearch />

      <div className="flex flex-wrap items-center gap-lg">
        <CompanyAvatar name={company.name} imageUrl={company.logoUrl} />
        <div className="flex min-w-zero flex-1 flex-col gap-xs">
          <div className="flex flex-wrap items-center gap-md">
            <h1 className="sensitive font-display font-bold text-display text-ink">{company.name}</h1>
            <AccountStatusBadge status={statusFrom(events[0])} />
          </div>
          <p className="text-ink-muted">
            Empresa parceira · {CATEGORY_LABEL[company.category]}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-lg lg:grid-cols-3">
        <div className="flex flex-col gap-lg lg:col-start-3 lg:row-start-1">
          <AccessPanel account={ref} name={company.name} latest={events[0]} />
          <InfoCard
            title="Dados da empresa"
            items={[
              { label: 'ID', value: <span className="font-mono">{company.id}</span> },
              { label: 'CNPJ', value: company.cnpj, sensitive: true },
              { label: 'E-mail', value: company.email, sensitive: true },
              { label: 'Telefone', value: company.phone, sensitive: true },
              { label: 'Endereço', value: company.address, sensitive: true },
              { label: 'Modalidade', value: MODALITY_LABEL[company.modality] },
              { label: 'Porte', value: COMPANY_SIZE_LABEL[company.size] },
            ]}
          />
        </div>

        <div className="flex min-w-zero flex-col gap-lg lg:col-span-2 lg:col-start-1 lg:row-start-1">
          <div className="grid gap-lg sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Itens cadastrados"
              value={formatInt(products.length)}
              detail={`${plural(activeCount, 'ativo', 'ativos')} · ${plural(products.length - activeCount, 'inativo', 'inativos')}`}
            />
            <StatTile label="Avaliações recebidas" value={formatInt(received.length)} detail="desde o cadastro" />
            <StatTile
              label="Nota média"
              value={received.length > 0 ? formatRating(averagesOf(received).overall) : '–'}
              detail="de 5, em todas as avaliações"
            />
            <StatTile label="Clientes que avaliaram" value={formatInt(reviewers)} detail="pessoas diferentes" />
          </div>

          <SectionCard title="Itens mais avaliados" description={`Os ${TOP_ITEMS} itens com mais avaliações desde o cadastro.`}>
            {topItems.length === 0 ? (
              <p className="text-caption text-ink-muted">A empresa ainda não cadastrou itens.</p>
            ) : (
              <ul className="flex flex-col">
                {topItems.map((row) => (
                  <li
                    key={row.product.id}
                    className="flex flex-col gap-sm border-b border-border py-sm last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-md"
                  >
                    <div className="flex min-w-zero flex-col gap-xs">
                      <span className="sensitive font-semibold text-ink">{row.product.title}</span>
                      <span className="text-caption text-ink-muted">
                        {PRODUCT_KIND_LABEL[row.product.kind]} · <span className="sensitive">{plural(row.count, 'avaliação', 'avaliações')}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-md">
                      <RatingValue average={row.average} />
                      <StatusBadge status={row.product.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <AccessHistory events={events} />
        </div>
      </div>
    </div>
  );
}
