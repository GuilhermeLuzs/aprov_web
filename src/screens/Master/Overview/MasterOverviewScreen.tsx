import { useMemo, useState } from 'react';
import { ChartCard, PeriodFilter, StatTile } from '../../../components';
import { RatingTrendChart } from '../../../components/RatingTrendChart';
import { customers, mockToday, reviews } from '../../../mocks';
import { useProducts } from '../../../store/catalog';
import { useCompanies } from '../../../store/session';
import { CATEGORY_LABEL, type Category } from '../../../types';
import { formatInt, formatPercent, plural } from '../../../utils/format';
import { averagesByDay, countByWeekday, inRange, presetRange, type DayRange, type PeriodKey } from '../../../utils/overview';
import { activeCount, categoryKindCounts, countByMonth, joinedCount, lastMonths, reviewedCount } from '../../../utils/platform';
import { CategoryChart } from './CategoryChart';
import { ReviewVolumeChart } from './ReviewVolumeChart';

const VOLUME_MONTHS = lastMonths(mockToday, 12);
const VOLUME_RANGE: DayRange = { start: `${VOLUME_MONTHS[0]}-01`, end: mockToday };
const INVALID_RANGE = 'A data final precisa ser igual ou depois da inicial.';
const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];

function share(part: number, total: number): string {
  return formatPercent(total === 0 ? 0 : part / total);
}

export default function MasterOverviewScreen() {
  const companies = useCompanies();
  const products = useProducts();

  const [period, setPeriod] = useState<PeriodKey>('lastMonth');
  const [custom, setCustom] = useState<DayRange>(presetRange('lastMonth', mockToday));

  const last30Days = presetRange('30d', mockToday);
  const active = activeCount(customers, last30Days);
  const joined = joinedCount(customers, last30Days);
  const reviewed = reviewedCount(products, reviews);
  const productCount = products.filter((p) => p.kind === 'product').length;
  const companyCategories = new Set(companies.map((c) => c.category)).size;

  const volumeReviews = useMemo(() => inRange(reviews, VOLUME_RANGE), []);

  const customInvalid = period === 'custom' && custom.start > custom.end;
  const ratingDays = useMemo(() => {
    if (customInvalid) return [];
    return averagesByDay(inRange(reviews, period === 'custom' ? custom : presetRange(period, mockToday)));
  }, [period, custom, customInvalid]);

  const periodFilter = (
    <PeriodFilter
      period={period}
      onPeriodChange={setPeriod}
      custom={custom}
      onCustomChange={setCustom}
      error={customInvalid ? INVALID_RANGE : undefined}
      align="start"
    />
  );

  return (
    <div className="flex flex-col gap-xl px-lg py-xl lg:px-xxl">
      <div className="flex flex-col gap-xs">
        <h1 className="font-display font-bold text-display text-ink">Visão geral</h1>
        <p className="text-ink-muted">Como a APROV está sendo usada por clientes e empresas parceiras.</p>
      </div>

      <div className="grid gap-lg sm:grid-cols-2 xl:grid-cols-5">
        <StatTile
          label="Usuários cadastrados"
          value={formatInt(customers.length)}
          detail={`clientes do app, ${formatInt(joined)} novos nos últimos 30 dias`}
        />
        <StatTile
          label="Usuários ativos"
          value={formatInt(active)}
          detail={`${share(active, customers.length)} dos cadastrados usaram o app nos últimos 30 dias`}
        />
        <StatTile
          label="Empresas parceiras"
          value={formatInt(companies.length)}
          detail={`em ${plural(companyCategories, 'categoria', 'categorias')}`}
        />
        <StatTile
          label="Itens cadastrados"
          value={formatInt(products.length)}
          detail={`${plural(productCount, 'produto', 'produtos')} · ${plural(products.length - productCount, 'serviço', 'serviços')}`}
        />
        <StatTile
          label="Itens avaliados"
          value={formatInt(reviewed)}
          detail={`${share(reviewed, products.length)} dos itens têm ao menos uma avaliação`}
        />
      </div>

      <div className="grid items-start gap-lg xl:grid-cols-3">
        <div className="flex min-w-zero flex-col gap-lg xl:col-span-2">
          <ReviewVolumeChart byMonth={countByMonth(volumeReviews, VOLUME_MONTHS)} byWeekday={countByWeekday(volumeReviews)} />
          {ratingDays.length > 0 ? (
            <RatingTrendChart
              data={ratingDays}
              title="Notas por dia"
              description="Média das avaliações publicadas em cada dia, de 1 a 5, somando todas as empresas."
              actions={periodFilter}
            />
          ) : (
            <ChartCard title="Notas por dia" description="Média das avaliações publicadas em cada dia, de 1 a 5." actions={periodFilter}>
              <p className="text-caption text-ink-muted">
                {customInvalid ? 'Corrija as datas para ver o gráfico.' : 'Nenhuma avaliação neste período. Escolha um período maior.'}
              </p>
            </ChartCard>
          )}
        </div>
        <CategoryChart counts={categoryKindCounts(products, CATEGORIES)} />
      </div>
    </div>
  );
}
