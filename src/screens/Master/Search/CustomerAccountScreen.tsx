import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { AccountStatusBadge, CompanyAvatar, RatingValue, StatTile } from '../../../components';
import { customers, mockToday, reviews } from '../../../mocks';
import { useProducts } from '../../../store/catalog';
import { markViewed, useAccessEvents } from '../../../store/moderation';
import { useCompanies } from '../../../store/session';
import { icon } from '../../../theme';
import type { AccountRef } from '../../../types';
import { formatInt, formatLongDay, formatRating, formatRelativeDay, maskCpf, plural } from '../../../utils/format';
import { eventsOf, statusFrom } from '../../../utils/moderation';
import { averagesOf, reviewAverage } from '../../../utils/overview';
import { AccessPanel } from './AccessPanel';
import { AccessHistory, AccountNotFound, BackToSearch, InfoCard, SectionCard } from './AccountParts';

const RECENT_REVIEWS = 5;

function ageOn(birthDate: string, today: string): number {
  const years = Number(today.slice(0, 4)) - Number(birthDate.slice(0, 4));
  return today.slice(5) < birthDate.slice(5) ? years - 1 : years;
}

function CpfValue({ cpf }: { cpf: string }) {
  const [shown, setShown] = useState(false);
  return (
    <span className="inline-flex items-center gap-sm">
      <span className="sensitive tabular-nums">{shown ? cpf : maskCpf(cpf)}</span>
      <button
        type="button"
        onClick={() => setShown((current) => !current)}
        aria-label={shown ? 'Esconder o CPF' : 'Mostrar o CPF completo'}
        title={shown ? 'Esconder o CPF' : 'Mostrar o CPF completo'}
        className="flex h-avatar-sm w-avatar-sm items-center justify-center rounded-pill text-ink-muted hover:bg-surface-alt hover:text-ink"
      >
        {shown ? (
          <EyeOff size={icon.size.sm} strokeWidth={icon.strokeWidth} aria-hidden />
        ) : (
          <Eye size={icon.size.sm} strokeWidth={icon.strokeWidth} aria-hidden />
        )}
      </button>
    </span>
  );
}

export default function CustomerAccountScreen() {
  const { id } = useParams();
  const customer = customers.find((c) => c.id === id);
  const allEvents = useAccessEvents();
  const products = useProducts();
  const companies = useCompanies();

  useEffect(() => {
    if (customer) markViewed({ kind: 'customer', id: customer.id });
  }, [customer]);

  if (!customer) return <AccountNotFound />;

  const ref: AccountRef = { kind: 'customer', id: customer.id };
  const events = eventsOf(allEvents, ref);
  const own = reviews.filter((r) => r.authorId === customer.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const agreements = own.reduce((sum, r) => sum + r.agreements, 0);
  const disagreements = own.reduce((sum, r) => sum + r.disagreements, 0);
  const lastReviewDay = own[0]?.createdAt.slice(0, 10);

  return (
    <div className="flex flex-col gap-xl px-lg py-xl lg:px-xxl">
      <BackToSearch />

      <div className="flex flex-wrap items-center gap-lg">
        <CompanyAvatar name={customer.name} />
        <div className="flex min-w-zero flex-1 flex-col gap-xs">
          <div className="flex flex-wrap items-center gap-md">
            <h1 className="sensitive font-display font-bold text-display text-ink">{customer.name}</h1>
            <AccountStatusBadge status={statusFrom(events[0])} />
          </div>
          <p className="text-ink-muted">
            <span className="sensitive">@{customer.username}</span> · Cliente desde {formatLongDay(customer.createdAt.slice(0, 10))}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-lg lg:grid-cols-3">
        <div className="flex flex-col gap-lg lg:col-start-3 lg:row-start-1">
          <AccessPanel account={ref} name={customer.name} latest={events[0]} />
          <InfoCard
            title="Dados da conta"
            items={[
              { label: 'ID', value: <span className="font-mono">{customer.id}</span> },
              { label: 'E-mail', value: customer.email, sensitive: true },
              { label: 'CPF', value: <CpfValue cpf={customer.cpf} /> },
              {
                label: 'Nascimento',
                value: `${formatLongDay(customer.birthDate)} (${ageOn(customer.birthDate, mockToday)} anos)`,
                sensitive: true,
              },
              { label: 'Cidade', value: `${customer.city}, ${customer.uf}` },
              { label: 'Último acesso', value: formatRelativeDay(customer.lastActiveAt.slice(0, 10), mockToday) },
            ]}
          />
        </div>

        <div className="flex min-w-zero flex-col gap-lg lg:col-span-2 lg:col-start-1 lg:row-start-1">
          <div className="grid gap-lg sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Avaliações publicadas"
              value={formatInt(own.length)}
              detail={lastReviewDay ? `a última ${formatRelativeDay(lastReviewDay, mockToday)}` : 'nenhuma ainda'}
            />
            <StatTile
              label="Nota média dada"
              value={own.length > 0 ? formatRating(averagesOf(own).overall) : '–'}
              detail="de 5, em todas as avaliações"
            />
            <StatTile
              label="Concordâncias recebidas"
              value={formatInt(agreements)}
              detail={plural(disagreements, 'discordância', 'discordâncias')}
            />
            <StatTile label="Pontos APROV" value={formatInt(customer.points)} detail={`${formatInt(customer.xp)} de XP`} />
          </div>

          <SectionCard title="Avaliações recentes" description={`As ${RECENT_REVIEWS} últimas que esta pessoa publicou.`}>
            {own.length === 0 ? (
              <p className="text-caption text-ink-muted">Esta pessoa ainda não publicou avaliações.</p>
            ) : (
              <ul className="flex flex-col">
                {own.slice(0, RECENT_REVIEWS).map((review) => {
                  const product = products.find((p) => p.id === review.productId);
                  const company = companies.find((c) => c.id === review.companyId);
                  return (
                    <li key={review.id} className="flex items-start justify-between gap-md border-b border-border py-sm last:border-b-0">
                      <div className="flex min-w-zero flex-col gap-xs">
                        <span className="sensitive font-semibold text-ink">{review.title}</span>
                        <span className="sensitive text-caption text-ink-muted">
                          {product?.title ?? 'Item removido'} · {company?.name ?? 'Empresa removida'}
                        </span>
                        <span className="text-caption text-ink-muted">{formatRelativeDay(review.createdAt.slice(0, 10), mockToday)}</span>
                      </div>
                      <RatingValue average={reviewAverage(review)} />
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          <AccessHistory events={events} />
        </div>
      </div>
    </div>
  );
}
