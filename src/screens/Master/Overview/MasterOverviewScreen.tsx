import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChartCard, LoadingNotice, PeriodFilter, StatTile } from '../../../components';
import { apiMasterOverview } from '../../../api';
import { RatingTrendChart } from '../../../components/RatingTrendChart';
import { formatInt, formatPercent, plural } from '../../../utils/format';
import { averagesFromApi, presetRange, todayInPanel, type DayRange, type PeriodKey } from '../../../utils/overview';
import { CategoryChart } from './CategoryChart';
import { ReviewVolumeChart } from './ReviewVolumeChart';

const INVALID_RANGE = 'A data final precisa ser igual ou depois da inicial.';

function share(part: number, total: number): string {
  return formatPercent(total === 0 ? 0 : part / total);
}

export default function MasterOverviewScreen() {
  const [today] = useState(todayInPanel);
  const [period, setPeriod] = useState<PeriodKey>('lastMonth');
  const [custom, setCustom] = useState<DayRange>(() => presetRange('lastMonth', today));
  const customInvalid = period === 'custom' && custom.start > custom.end;
  const range = period === 'custom' ? custom : presetRange(period, today);
  const overview = useQuery({
    queryKey: ['master', 'overview', range.start, range.end],
    queryFn: () => apiMasterOverview(range.start, range.end),
    enabled: !customInvalid,
    placeholderData: keepPreviousData,
  });
  const data = overview.data;

  if (!data) {
    return (
      <div className="px-lg py-xl lg:px-xxl">
        <LoadingNotice text="Carregando a visão geral..." />
      </div>
    );
  }

  const customers = { length: data.customers.total };
  const active = data.customers.active;
  const joined = data.customers.joined;
  const reviewed = data.items.reviewed;
  const products = { length: data.items.total };
  const productCount = data.items.products;
  const companies = { length: data.companies.total };
  const companyCategories = data.companies.categories;
  const ratingDays = customInvalid ? [] : data.days.map(({ day, count, ...averages }) => ({ day, count, ...averagesFromApi(averages) }));

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
          <ReviewVolumeChart byMonth={data.volume.byMonth} byWeekday={data.volume.byWeekday} />
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
        <CategoryChart counts={data.categories} />
      </div>
    </div>
  );
}
