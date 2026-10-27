import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  BarList,
  CategoryCounts,
  EmptyNotice,
  PeriodFilter,
  StatTile,
  type BarListItem,
  type CategoryCount,
} from '../../../components';
import { RatingTrendChart } from '../../../components/RatingTrendChart';
import { mockToday, reviews, tagById } from '../../../mocks';
import { useProducts } from '../../../store/catalog';
import { useCurrentAccount } from '../../../store/session';
import { CATEGORY_LABEL, CHARACTERISTICS, CHARACTERISTIC_LABEL, PRODUCT_KIND_LABEL, type Category } from '../../../types';
import { formatRating, plural } from '../../../utils/format';
import {
  averagesByDay,
  averagesOf,
  countByDay,
  countByWeekday,
  inRange,
  presetRange,
  productScores,
  ratingTone,
  scoreExtremes,
  tagCounts,
  type DayRange,
  type PeriodKey,
  type ProductScore,
} from '../../../utils/overview';
import { VolumeChart } from './VolumeChart';

const TOP_TAGS = 5;
const TOP_ITEMS = 5;
const MAX_RATING = 5;
const INVALID_RANGE = 'A data final precisa ser igual ou depois da inicial.';

function scoreItem(score: ProductScore): BarListItem {
  return {
    id: score.product.id,
    label: score.product.title,
    value: score.average,
    valueLabel: formatRating(score.average),
    detail: `${PRODUCT_KIND_LABEL[score.product.kind]} · ${plural(score.count, 'avaliação', 'avaliações')}`,
    imageUrl: score.product.imageUrl,
    tone: ratingTone(score.average),
  };
}

export default function CompanyOverviewScreen() {
  const account = useCurrentAccount();
  const companyProducts = useProducts().filter((p) => p.companyId === account?.companyId);
  const companyReviews = reviews.filter((r) => r.companyId === account?.companyId);

  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [custom, setCustom] = useState<DayRange>(presetRange('30d', mockToday));

  const customInvalid = period === 'custom' && custom.start > custom.end;
  const range = period === 'custom' ? custom : presetRange(period, mockToday);

  const scoped = useMemo(
    () => (customInvalid ? [] : inRange(companyReviews, range)),
    [companyReviews, range, customInvalid],
  );

  const averages = averagesOf(scoped);
  const extremes = scoreExtremes(productScores(scoped, companyProducts), TOP_ITEMS);
  const positive = tagCounts(scoped, tagById, 'positive').slice(0, TOP_TAGS);
  const negative = tagCounts(scoped, tagById, 'negative').slice(0, TOP_TAGS);
  const maxTag = Math.max(0, ...positive.map((t) => t.count), ...negative.map((t) => t.count));

  const categoryTotals = companyProducts.reduce<Partial<Record<Category, number>>>((counts, product) => {
    product.categories.forEach((category) => {
      counts[category] = (counts[category] ?? 0) + 1;
    });
    return counts;
  }, {});
  const categoryCounts: CategoryCount[] = (Object.entries(categoryTotals) as [Category, number][])
    .map(([category, count]) => ({ label: CATEGORY_LABEL[category], count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const productCount = companyProducts.filter((p) => p.kind === 'product').length;
  const kindDetail = `Tipo: ${plural(productCount, 'produto', 'produtos')} · ${plural(
    companyProducts.length - productCount,
    'serviço',
    'serviços',
  )}`;

  const heading = (
    <div className="flex flex-col gap-xs">
      <h1 className="font-display font-bold text-display text-ink">Visão geral</h1>
      <p className="text-ink-muted">
        Como os clientes avaliaram os itens da <span className="sensitive">{account?.name ?? 'sua empresa'}</span>.
      </p>
    </div>
  );

  if (companyReviews.length === 0) {
    return (
      <div className="flex flex-col gap-xl px-lg py-xl lg:px-xxl">
        {heading}
        <EmptyNotice
          mood="neutral"
          title="Sua empresa ainda não recebeu avaliações"
          text="Assim que um cliente avaliar um dos seus itens pelo app, as notas e os gráficos aparecem aqui."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-xl px-lg py-xl lg:px-xxl">
      <div className="flex flex-col gap-lg md:flex-row md:items-start md:justify-between">
        {heading}
        <PeriodFilter
          period={period}
          onPeriodChange={setPeriod}
          custom={custom}
          onCustomChange={setCustom}
          error={customInvalid ? INVALID_RANGE : undefined}
        />
      </div>

      <div className="grid gap-lg md:grid-cols-3">
        <StatTile
          emphasis
          label="Nota média geral"
          value={scoped.length > 0 ? formatRating(averages.overall) : '–'}
          detail={`de ${MAX_RATING}, nas avaliações do período`}
        />
        <StatTile label="Avaliações no período" value={String(scoped.length)} detail="publicadas pelos clientes" />
        <StatTile
          label="Itens cadastrados"
          value={String(companyProducts.length)}
          detail={companyProducts.length === 0 ? 'nenhum item ainda' : kindDetail}
        >
          <CategoryCounts label="Categoria" counts={categoryCounts} total={companyProducts.length} />
        </StatTile>
      </div>

      {scoped.length === 0 ? (
        <EmptyNotice
          mood="confused"
          title="Nenhuma avaliação neste período"
          text="Escolha um período maior para ver as notas e os gráficos."
        />
      ) : (
        <>
          <div className="grid gap-lg sm:grid-cols-2 lg:grid-cols-4">
            {CHARACTERISTICS.map((key) => (
              <StatTile key={key} label={CHARACTERISTIC_LABEL[key]} value={formatRating(averages[key])} detail="média do período" />
            ))}
          </div>

          <RatingTrendChart
            data={averagesByDay(scoped)}
            title="Notas ao longo do período"
            description="Média do dia, de 1 a 5, nos dias que tiveram avaliação."
          />

          <VolumeChart byDay={countByDay(scoped, range)} byWeekday={countByWeekday(scoped)} />

          <section className="flex min-w-zero flex-col gap-lg rounded-card border border-border bg-surface p-lg">
            <div className="flex flex-wrap items-start justify-between gap-md">
              <div className="flex flex-col gap-xs">
                <h2 className="font-display font-semibold text-subtitle text-ink">Itens por nota média</h2>
                <p className="text-caption text-ink-muted">Os produtos e serviços com as melhores e as piores notas do período.</p>
              </div>
              <Link to="/empresa/catalogo" className="font-semibold text-caption text-primary hover:text-primary-press">
                Ver a nota de todos os itens
              </Link>
            </div>
            <div className="grid gap-xl md:grid-cols-2">
              <div className="flex min-w-zero flex-col gap-md">
                <h3 className="font-semibold text-ink">Melhores notas</h3>
                <BarList max={MAX_RATING} emptyText="Dados insuficientes para montar o ranking." items={extremes.best.map(scoreItem)} />
              </div>
              <div className="flex min-w-zero flex-col gap-md">
                <h3 className="font-semibold text-ink">Piores notas</h3>
                <BarList max={MAX_RATING} emptyText="Dados insuficientes para montar o ranking." items={extremes.worst.map(scoreItem)} />
              </div>
            </div>
          </section>

          <section className="flex min-w-zero flex-col gap-lg rounded-card border border-border bg-surface p-lg">
            <div className="flex flex-col gap-xs">
              <h2 className="font-display font-semibold text-subtitle text-ink">Palavras-chave mais marcadas</h2>
              <p className="text-caption text-ink-muted">Quantas vezes cada uma apareceu nas avaliações do período.</p>
            </div>
            <div className="grid gap-xl md:grid-cols-2">
              <div className="flex flex-col gap-md">
                <h3 className="font-semibold text-ink">O que foi bom</h3>
                <BarList
                  max={maxTag}
                  emptyText="Nenhuma palavra-chave positiva no período."
                  items={positive.map((entry) => ({
                    id: entry.tag.id,
                    label: entry.tag.label,
                    value: entry.count,
                    valueLabel: String(entry.count),
                  }))}
                />
              </div>
              <div className="flex flex-col gap-md">
                <h3 className="font-semibold text-ink">O que pode melhorar</h3>
                <BarList
                  max={maxTag}
                  emptyText="Nenhuma palavra-chave negativa no período."
                  items={negative.map((entry) => ({
                    id: entry.tag.id,
                    label: entry.tag.label,
                    value: entry.count,
                    valueLabel: String(entry.count),
                  }))}
                />
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
