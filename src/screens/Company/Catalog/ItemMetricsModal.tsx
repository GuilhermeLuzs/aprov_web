import { EmptyNotice, Modal, StatTile, StatusBadge } from '../../../components';
import { RatingTrendChart } from '../../../components/RatingTrendChart';
import { CATEGORY_LABEL, CHARACTERISTICS, CHARACTERISTIC_LABEL, PRODUCT_KIND_LABEL, type Review } from '../../../types';
import { formatRating } from '../../../utils/format';
import { averagesByDay, averagesOf } from '../../../utils/overview';
import type { CatalogRow } from '../../../utils/catalog';

type Props = {
  row: CatalogRow | null;
  reviews: Review[];
  onClose: () => void;
};

export function ItemMetricsModal({ row, reviews, onClose }: Props) {
  if (!row) return null;

  const { product } = row;
  const own = reviews.filter((r) => r.productId === product.id);
  const averages = averagesOf(own);
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
          <div className="grid gap-md sm:grid-cols-2">
            <StatTile emphasis label="Nota geral" value={formatRating(averages.overall)} detail="de 5, em todas as avaliações" />
            <StatTile label="Avaliações" value={String(own.length)} detail={own.length === 1 ? 'publicada desde o cadastro' : 'publicadas desde o cadastro'} />
          </div>
          <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
            {CHARACTERISTICS.map((key) => (
              <StatTile key={key} label={CHARACTERISTIC_LABEL[key]} value={formatRating(averages[key])} detail="média" />
            ))}
          </div>
          <RatingTrendChart
            data={averagesByDay(own)}
            title="Notas ao longo do tempo"
            description="Média do dia, de 1 a 5, desde a primeira avaliação do item."
          />
        </>
      )}
    </Modal>
  );
}
