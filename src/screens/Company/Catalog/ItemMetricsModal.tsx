import { useState } from 'react';
import { BarList, EmptyNotice, Modal, PeriodFilter, StatTile, StatusBadge } from '../../../components';
import { RatingTrendChart } from '../../../components/RatingTrendChart';
import { mockToday, tagById } from '../../../mocks';
import { CATEGORY_LABEL, CHARACTERISTICS, CHARACTERISTIC_LABEL, PRODUCT_KIND_LABEL, type Review } from '../../../types';
import type { CatalogRow } from '../../../utils/catalog';
import { formatLongDay, formatRating, plural } from '../../../utils/format';
import {
  averagesByDay,
  averagesOf,
  dayOf,
  inRange,
  presetRange,
  tagCounts,
  type DayRange,
  type PeriodKey,
  type TagCount,
} from '../../../utils/overview';

type Props = {
  row: CatalogRow | null;
  reviews: Review[];
  onClose: () => void;
};

const TOP_TAGS = 5;
const INVALID_RANGE = 'A data final precisa ser igual ou depois da inicial.';

function KeywordList({ title, entries, max, emptyText }: { title: string; entries: TagCount[]; max: number; emptyText: string }) {
  return (
    <div className="flex min-w-zero flex-col gap-md">
      <h3 className="font-semibold text-ink">{title}</h3>
      <BarList
        max={max}
        emptyText={emptyText}
        items={entries.map((entry) => ({
          id: entry.tag.id,
          label: entry.tag.label,
          value: entry.count,
          valueLabel: String(entry.count),
        }))}
      />
    </div>
  );
}

function ItemMetrics({ row, reviews, onClose }: Props & { row: CatalogRow }) {
  const { product } = row;
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [custom, setCustom] = useState<DayRange>(presetRange('30d', mockToday));

  const own = reviews.filter((r) => r.productId === product.id);
  const customInvalid = period === 'custom' && custom.start > custom.end;
  const range = period === 'custom' ? custom : presetRange(period, mockToday);
  const scoped = customInvalid ? [] : inRange(own, range);
  const lastDay = own.map(dayOf).sort().at(-1);
  const averages = averagesOf(scoped);
  const positive = tagCounts(scoped, tagById, 'positive').slice(0, TOP_TAGS);
  const negative = tagCounts(scoped, tagById, 'negative').slice(0, TOP_TAGS);
  const maxTag = Math.max(0, ...positive.map((t) => t.count), ...negative.map((t) => t.count));
  const categories = product.categories.map((category) => CATEGORY_LABEL[category]).join(', ');

  return (
    <Modal
      open
      onClose={onClose}
      title={product.title}
      header={
        <img
          src={product.imageUrl}
          alt=""
          className="h-avatar-lg w-avatar-lg shrink-0 rounded-control bg-surface-alt object-cover"
        />
      }
      subtitle={
        <div className="flex flex-wrap items-center gap-sm text-caption text-ink-muted">
          <span>{PRODUCT_KIND_LABEL[product.kind]}</span>
          <span aria-hidden>·</span>
          <span>{categories}</span>
          <StatusBadge status={product.status} />
        </div>
      }
    >
      {own.length === 0 ? (
        <EmptyNotice
          mood="neutral"
          title="Este item ainda não recebeu avaliações"
          text="Quando um cliente avaliar este item pelo app, as notas e o gráfico aparecem aqui."
        />
      ) : (
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

          {customInvalid ? null : scoped.length === 0 ? (
            <EmptyNotice
              mood="confused"
              title="Nenhuma avaliação neste período"
              text={`O item tem ${plural(own.length, 'avaliação', 'avaliações')} no total; a mais recente é de ${lastDay ? formatLongDay(lastDay) : ''}.`}
            />
          ) : (
            <>
              <div className="grid gap-md sm:grid-cols-2">
                <StatTile emphasis label="Nota geral" value={formatRating(averages.overall)} detail="de 5, nas avaliações do período" />
                <StatTile
                  label="Avaliações no período"
                  value={String(scoped.length)}
                  detail={`de ${plural(own.length, 'avaliação', 'avaliações')} desde o cadastro`}
                />
              </div>
              <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
                {CHARACTERISTICS.map((key) => (
                  <StatTile key={key} label={CHARACTERISTIC_LABEL[key]} value={formatRating(averages[key])} detail="média do período" />
                ))}
              </div>
              <RatingTrendChart
                data={averagesByDay(scoped)}
                title="Notas ao longo do período"
                description="Média do dia, de 1 a 5, nos dias que tiveram avaliação."
              />
              <section className="flex flex-col gap-lg rounded-card border border-border bg-surface p-lg">
                <div className="flex flex-col gap-xs">
                  <h2 className="font-display font-semibold text-subtitle text-ink">Palavras-chave mais marcadas</h2>
                  <p className="text-caption text-ink-muted">Quantas vezes cada uma apareceu nas avaliações do período.</p>
                </div>
                <div className="grid gap-xl sm:grid-cols-2">
                  <KeywordList title="O que foi bom" entries={positive} max={maxTag} emptyText="Nenhuma palavra-chave positiva no período." />
                  <KeywordList
                    title="O que pode melhorar"
                    entries={negative}
                    max={maxTag}
                    emptyText="Nenhuma palavra-chave negativa no período."
                  />
                </div>
              </section>
            </>
          )}
        </>
      )}
    </Modal>
  );
}

export function ItemMetricsModal({ row, reviews, onClose }: Props) {
  if (!row) return null;
  return <ItemMetrics key={row.product.id} row={row} reviews={reviews} onClose={onClose} />;
}
