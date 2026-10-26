import { ArrowDown, ArrowUp, ArrowUpDown, ChartLine, Pencil } from 'lucide-react';
import { IconButton, RatingValue, Switch } from '../../../components';
import { icon } from '../../../theme';
import { CATEGORY_LABEL, PRODUCT_KIND_LABEL, PRODUCT_STATUS_LABEL } from '../../../types';
import type { CatalogRow, CatalogSort, SortKey } from '../../../utils/catalog';
import { formatInt } from '../../../utils/format';

type Props = {
  rows: CatalogRow[];
  sort: CatalogSort;
  onSort: (key: SortKey) => void;
  onShowMetrics: (row: CatalogRow) => void;
  onToggleStatus: (row: CatalogRow) => void;
};

function categoriesOf(row: CatalogRow): string {
  return row.product.categories.map((category) => CATEGORY_LABEL[category]).join(', ');
}

function Actions({ row, onShowMetrics }: { row: CatalogRow } & Pick<Props, 'onShowMetrics'>) {
  return (
    <div className="flex items-center justify-end gap-xs">
      <IconButton Icon={ChartLine} label={`Ver as notas de ${row.product.title}`} onClick={() => onShowMetrics(row)} />
      <IconButton Icon={Pencil} label={`Editar ${row.product.title}`} disabled />
    </div>
  );
}

function StatusSwitch({ row, onToggleStatus }: { row: CatalogRow } & Pick<Props, 'onToggleStatus'>) {
  const active = row.product.status === 'active';
  return (
    <Switch
      checked={active}
      onChange={() => onToggleStatus(row)}
      label={`${row.product.title} ${active ? 'ativo' : 'inativo'}`}
      text={PRODUCT_STATUS_LABEL[row.product.status]}
    />
  );
}

const FIT_COLUMN = 'whitespace-nowrap';

function SortHeader({ label, sortKey, sort, onSort, fill = false }: { label: string; sortKey: SortKey; fill?: boolean } & Pick<Props, 'sort' | 'onSort'>) {
  const current = sort.key === sortKey;
  const SortIcon = !current ? ArrowUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th
      scope="col"
      aria-sort={current ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={`px-md py-sm text-left font-semibold ${fill ? 'w-2/5' : FIT_COLUMN}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-xs rounded-control hover:text-ink ${current ? 'text-ink' : ''}`}
      >
        {label}
        <SortIcon size={icon.size.sm} strokeWidth={icon.strokeWidth} aria-hidden />
      </button>
    </th>
  );
}

export function CatalogList({ rows, sort, onSort, onShowMetrics, onToggleStatus }: Props) {
  return (
    <>
      <table className="hidden w-full lg:table">
        <thead>
          <tr className="border-b border-border text-caption text-ink-muted">
            <SortHeader label="Item" sortKey="title" sort={sort} onSort={onSort} fill />
            <th scope="col" className={`px-md py-sm text-left font-semibold ${FIT_COLUMN}`}>
              Tipo
            </th>
            <SortHeader label="Nota média" sortKey="average" sort={sort} onSort={onSort} />
            <SortHeader label="Avaliações" sortKey="count" sort={sort} onSort={onSort} />
            <th scope="col" className={`px-md py-sm text-left font-semibold ${FIT_COLUMN}`}>
              Status
            </th>
            <th scope="col" className="w-px px-md py-sm text-right font-semibold whitespace-nowrap">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.product.id} className="border-b border-border last:border-b-0">
              <td className="max-w-zero px-md py-sm">
                <div className="flex min-w-zero items-center gap-md">
                  <img
                    src={row.product.imageUrl}
                    alt=""
                    loading="lazy"
                    className="h-avatar-md w-avatar-md shrink-0 rounded-control bg-surface-alt object-cover"
                  />
                  <div className="flex min-w-zero flex-col">
                    <span className="truncate font-semibold text-ink" title={row.product.title}>
                      {row.product.title}
                    </span>
                    <span className="truncate text-caption text-ink-muted">{categoriesOf(row)}</span>
                  </div>
                </div>
              </td>
              <td className="px-md py-sm whitespace-nowrap text-ink-muted">{PRODUCT_KIND_LABEL[row.product.kind]}</td>
              <td className="px-md py-sm whitespace-nowrap">
                <RatingValue average={row.average} />
              </td>
              <td className="px-md py-sm text-ink tabular-nums">{formatInt(row.count)}</td>
              <td className="px-md py-sm">
                <StatusSwitch row={row} onToggleStatus={onToggleStatus} />
              </td>
              <td className="px-md py-sm">
                <Actions row={row} onShowMetrics={onShowMetrics} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="flex flex-col lg:hidden">
        {rows.map((row) => (
          <li key={row.product.id} className="flex flex-col gap-sm border-b border-border py-md last:border-b-0">
            <div className="flex min-w-zero items-start gap-md">
              <img
                src={row.product.imageUrl}
                alt=""
                loading="lazy"
                className="h-avatar-lg w-avatar-lg shrink-0 rounded-control bg-surface-alt object-cover"
              />
              <div className="flex min-w-zero flex-1 flex-col gap-xs">
                <span className="font-semibold text-ink">{row.product.title}</span>
                <span className="text-caption text-ink-muted">
                  {PRODUCT_KIND_LABEL[row.product.kind]} · {categoriesOf(row)}
                </span>
                <div className="flex flex-wrap items-center gap-md text-caption">
                  <RatingValue average={row.average} />
                  <span className="text-ink-muted">
                    {formatInt(row.count)} {row.count === 1 ? 'avaliação' : 'avaliações'}
                  </span>
                  <StatusSwitch row={row} onToggleStatus={onToggleStatus} />
                </div>
              </div>
            </div>
            <Actions row={row} onShowMetrics={onShowMetrics} />
          </li>
        ))}
      </ul>
    </>
  );
}
