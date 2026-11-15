import { useState } from 'react';
import { BarList, Button, EmptyNotice, LoadingNotice, Modal, PeriodFilter, StatTile, StatusBadge } from '../../../components';
import { RatingTrendChart } from '../../../components/RatingTrendChart';
import type { ApiTagCount } from '../../../api';
import { useItemMetrics } from '../../../queries/catalog';
import { CATEGORY_LABEL, CHARACTERISTICS, CHARACTERISTIC_LABEL, PRODUCT_KIND_LABEL, type CatalogItem } from '../../../types';
import { formatLongDay, formatRating, plural } from '../../../utils/format';
import { averagesFromApi, presetRange, todayInPanel, type DayRange, type PeriodKey } from '../../../utils/overview';

type Props = {
  item: CatalogItem | null;
  onClose: () => void;
};

const INVALID_RANGE = 'A data final precisa ser igual ou depois da inicial.';

function KeywordList({ title, entries, max, emptyText }: { title: string; entries: ApiTagCount[]; max: number; emptyText: string }) {
  return (
    <div className="flex min-w-zero flex-col gap-md">
      <h3 className="font-semibold text-ink">{title}</h3>
      <BarList
        max={max}
        emptyText={emptyText}
        items={entries.map((entry) => ({
          id: String(entry.id),
          label: entry.label,
          value: entry.count,
          valueLabel: String(entry.count),
        }))}
      />
    </div>
  );
}

function ItemMetrics({ item, onClose }: { item: CatalogItem; onClose: () => void }) {
  const [today] = useState(todayInPanel);
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [custom, setCustom] = useState<DayRange>(() => presetRange('30d', today));

  const customInvalid = period === 'custom' && custom.start > custom.end;
  const range = period === 'custom' ? custom : presetRange(period, today);
  const metrics = useItemMetrics(item.id, range.start, range.end, !customInvalid);
  const categories = item.categories.map((category) => CATEGORY_LABEL[category]).join(', ');

  const body = () => {
    if (metrics.isPending && !customInvalid) return <LoadingNotice text="Carregando as notas..." />;
    if (metrics.isError) {
      return (
        <EmptyNotice
          mood="confused"
          title="Não deu para carregar as notas"
          text="Confira a internet e tente de novo."
          action={<Button label="Tentar de novo" variant="outline" onClick={() => void metrics.refetch()} />}
        />
      );
    }

    const data = metrics.data;
    if (data && data.totalReviews === 0) {
      return (
        <EmptyNotice
          mood="neutral"
          title="Este item ainda não recebeu avaliações"
          text="Quando um cliente avaliar este item pelo app, as notas e o gráfico aparecem aqui."
        />
      );
    }

    const scoped = data?.period;
    const averages = scoped ? averagesFromApi(scoped.averages) : null;
    const maxTag = Math.max(0, ...(scoped?.positiveTags ?? []).map((t) => t.count), ...(scoped?.negativeTags ?? []).map((t) => t.count));

    return (
      <>
        <div className="flex justify-end">
          <PeriodFilter
            period={period}
            onPeriodChange={setPeriod}
            custom={custom}
            onCustomChange={setCustom}
            error={customInvalid ? INVALID_RANGE : undefined}
          />
        </div>

        {customInvalid || !data || !scoped || !averages ? null : scoped.count === 0 ? (
          <EmptyNotice
            mood="confused"
            title="Nenhuma avaliação neste período"
            text={`O item tem ${plural(data.totalReviews, 'avaliação', 'avaliações')} no total; a mais recente é de ${data.lastReviewDay ? formatLongDay(data.lastReviewDay) : ''}.`}
          />
        ) : (
          <div aria-busy={metrics.isFetching} className={`flex flex-col gap-lg ${metrics.isPlaceholderData ? 'opacity-50' : ''}`}>
            <div className="grid gap-md sm:grid-cols-2">
              <StatTile emphasis label="Nota geral" value={formatRating(averages.overall)} detail="de 5, nas avaliações do período" />
              <StatTile
                label="Avaliações no período"
                value={String(scoped.count)}
                detail={`de ${plural(data.totalReviews, 'avaliação', 'avaliações')} desde o cadastro`}
              />
            </div>
            <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
              {CHARACTERISTICS.map((key) => (
                <StatTile key={key} label={CHARACTERISTIC_LABEL[key]} value={formatRating(averages[key])} detail="média do período" />
              ))}
            </div>
            <RatingTrendChart
              data={scoped.days.map(({ day, count, ...dayAverages }) => ({ day, count, ...averagesFromApi(dayAverages) }))}
              title="Notas ao longo do período"
              description="Média do dia, de 1 a 5, nos dias que tiveram avaliação."
            />
            <section className="flex flex-col gap-lg rounded-card border border-border bg-surface p-lg">
              <div className="flex flex-col gap-xs">
                <h2 className="font-display font-semibold text-subtitle text-ink">Palavras-chave mais marcadas</h2>
                <p className="text-caption text-ink-muted">Quantas vezes cada uma apareceu nas avaliações do período.</p>
              </div>
              <div className="grid gap-xl sm:grid-cols-2">
                <KeywordList title="O que foi bom" entries={scoped.positiveTags} max={maxTag} emptyText="Nenhuma palavra-chave positiva no período." />
                <KeywordList
                  title="O que pode melhorar"
                  entries={scoped.negativeTags}
                  max={maxTag}
                  emptyText="Nenhuma palavra-chave negativa no período."
                />
              </div>
            </section>
          </div>
        )}
      </>
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={item.title}
      sensitiveTitle
      header={
        <img
          src={item.coverUrl}
          alt=""
          className="sensitive h-avatar-lg w-avatar-lg shrink-0 rounded-control bg-surface-alt object-cover"
        />
      }
      subtitle={
        <div className="flex flex-wrap items-center gap-sm text-caption text-ink-muted">
          <span>{PRODUCT_KIND_LABEL[item.kind]}</span>
          <span aria-hidden>·</span>
          <span className="sensitive">{categories}</span>
          <StatusBadge status={item.status} />
        </div>
      }
    >
      {body()}
    </Modal>
  );
}

export function ItemMetricsModal({ item, onClose }: Props) {
  if (!item) return null;
  return <ItemMetrics key={item.id} item={item} onClose={onClose} />;
}
