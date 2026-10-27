import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { BriefcaseBusiness, Package } from 'lucide-react';
import {
  Button,
  EmptyNotice,
  FilterSelect,
  MenuButton,
  Modal,
  MultiSelectFilter,
  PageSizeSelect,
  Pagination,
  SearchField,
} from '../../../components';
import { reviews } from '../../../mocks';
import { setProductStatus, useProducts } from '../../../store/catalog';
import { useCurrentAccount } from '../../../store/session';
import {
  CATEGORY_LABEL,
  PRODUCT_KIND_LABEL,
  PRODUCT_STATUS_LABEL,
  type Category,
  type ProductKind,
  type ProductStatus,
} from '../../../types';
import {
  DEFAULT_SORT,
  EMPTY_FILTERS,
  catalogRows,
  filterRows,
  hasActiveFilters,
  nextSort,
  sortRows,
  type CatalogFilters,
  type CatalogRow,
  type CatalogSort,
  type SortKey,
} from '../../../utils/catalog';
import { plural } from '../../../utils/format';
import { pageCountOf, pageSlice } from '../../../utils/pagination';
import { CatalogList } from './CatalogList';
import { ItemMetricsModal } from './ItemMetricsModal';
import { showToast } from '../../../store/toasts';

const PAGE_SIZES = [5, 10, 25, 50] as const;

const NEW_ITEM_OPTIONS = [
  { label: 'Novo produto', description: 'Algo que o cliente compra e recebe.', to: '/empresa/catalogo/novo/produto', Icon: Package },
  { label: 'Novo serviço', description: 'Algo que você faz para o cliente.', to: '/empresa/catalogo/novo/servico', Icon: BriefcaseBusiness },
];

const STATUS_OPTIONS = (Object.keys(PRODUCT_STATUS_LABEL) as ProductStatus[]).map((status) => ({
  value: status,
  label: status === 'active' ? 'Ativos' : 'Inativos',
}));

const KIND_OPTIONS = (Object.keys(PRODUCT_KIND_LABEL) as ProductKind[]).map((kind) => ({
  value: kind,
  label: kind === 'product' ? 'Produtos' : 'Serviços',
}));

export default function CatalogScreen() {
  const account = useCurrentAccount();
  const companyProducts = useProducts().filter((p) => p.companyId === account?.companyId);
  const companyReviews = reviews.filter((r) => r.companyId === account?.companyId);

  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<CatalogSort>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const [metricsRow, setMetricsRow] = useState<CatalogRow | null>(null);
  const [deactivating, setDeactivating] = useState<CatalogRow | null>(null);
  const navigate = useNavigate();

  const rows = catalogRows(companyProducts, companyReviews);
  const visibleRows = sortRows(filterRows(rows, filters), sort);
  const pageCount = pageCountOf(visibleRows.length, pageSize);
  const currentPage = Math.min(page, pageCount);
  const pageRows = pageSlice(visibleRows, currentPage, pageSize);

  const categoryOptions = [...new Set(companyProducts.flatMap((p) => p.categories))]
    .map((category) => ({ value: category, label: CATEGORY_LABEL[category] }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const updateFilters = (change: Partial<CatalogFilters>) => {
    setFilters((current) => ({ ...current, ...change }));
    setPage(1);
  };

  const changeSort = (key: SortKey) => {
    setSort((current) => nextSort(current, key));
    setPage(1);
  };

  const toggleStatus = (row: CatalogRow) => {
    if (row.product.status === 'active') setDeactivating(row);
    else {
      setProductStatus(row.product.id, 'active');
      showToast('success', `"${row.product.title}" ativado. Já aparece no app.`);
    }
  };

  const confirmDeactivation = () => {
    if (deactivating) {
      setProductStatus(deactivating.product.id, 'inactive');
      showToast('success', `"${deactivating.product.title}" desativado. Saiu do app.`);
    }
    setDeactivating(null);
  };

  const closeMetrics = useCallback(() => setMetricsRow(null), []);
  const closeDeactivation = useCallback(() => setDeactivating(null), []);

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const firstShown = (currentPage - 1) * pageSize + 1;
  const lastShown = firstShown + pageRows.length - 1;

  return (
    <div className="flex flex-col gap-xl px-lg py-xl lg:px-xxl">
      <div className="flex flex-col gap-lg md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-xs">
          <h1 className="font-display font-bold text-display text-ink">Catálogo</h1>
          <p className="text-ink-muted">
            Os produtos e serviços que a {account?.name ?? 'sua empresa'} oferece para
            avaliação.
          </p>
        </div>
        <MenuButton label="Cadastrar item" items={NEW_ITEM_OPTIONS} />
      </div>

      {companyProducts.length === 0 ? (
        <EmptyNotice
          mood="neutral"
          title="Seu catálogo ainda está vazio"
          text="Cadastre o primeiro produto ou serviço para os clientes começarem a avaliar pelo app."
          action={<MenuButton label="Cadastrar item" items={NEW_ITEM_OPTIONS} align="left" />}
        />
      ) : (
        <section className="flex min-w-zero flex-col gap-lg rounded-card border border-border bg-surface p-lg">
          <div className="grid gap-md md:grid-cols-2 xl:grid-cols-5">
            <div className="md:col-span-2">
              <SearchField
                value={filters.query}
                onChange={(query) => updateFilters({ query })}
                label="Buscar no catálogo"
                placeholder="Buscar por nome ou descrição"
              />
            </div>
            <MultiSelectFilter
              label="Categorias"
              allLabel="Todas as categorias"
              pluralLabel="categorias"
              options={categoryOptions}
              values={filters.categories}
              onChange={(values) => updateFilters({ categories: values as Category[] })}
            />
            <FilterSelect
              label="Status"
              value={filters.status}
              onChange={(value) => updateFilters({ status: value as ProductStatus | '' })}
              allLabel="Todos os status"
              options={STATUS_OPTIONS}
            />
            <FilterSelect
              label="Tipo"
              value={filters.kind}
              onChange={(value) => updateFilters({ kind: value as ProductKind | '' })}
              allLabel="Produtos e serviços"
              options={KIND_OPTIONS}
            />
          </div>

          {visibleRows.length === 0 ? (
            <EmptyNotice
              mood="confused"
              title="Nenhum item encontrado"
              text="Tente outra busca ou limpe os filtros para ver o catálogo inteiro."
              action={<Button label="Limpar filtros" variant="outline" onClick={() => updateFilters(EMPTY_FILTERS)} />}
            />
          ) : (
            <>
              {hasActiveFilters(filters) ? (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => updateFilters(EMPTY_FILTERS)}
                    className="font-semibold text-caption text-primary hover:text-primary-press"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : null}
              <CatalogList
                rows={pageRows}
                sort={sort}
                onSort={changeSort}
                onShowMetrics={setMetricsRow}
                onToggleStatus={toggleStatus}
                onEdit={(row) => navigate(`/empresa/catalogo/${row.product.id}/editar`)}
              />
              <div className="flex flex-col items-center gap-md border-t border-border pt-lg lg:grid lg:grid-cols-3">
                <span aria-live="polite" className="text-caption text-ink-muted lg:justify-self-start">
                  Mostrando {firstShown} a {lastShown} de {plural(visibleRows.length, 'item', 'itens')} · Página {currentPage} de{' '}
                  {pageCount}
                </span>
                <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
                <div className="lg:col-start-3 lg:justify-self-end">
                  <PageSizeSelect value={pageSize} options={PAGE_SIZES} onChange={changePageSize} />
                </div>
              </div>
            </>
          )}
        </section>
      )}

      <ItemMetricsModal row={metricsRow} reviews={companyReviews} onClose={closeMetrics} />

      <Modal
        open={deactivating !== null}
        onClose={closeDeactivation}
        title="Inativar este item?"
        size="sm"
        footer={
          <>
            <Button label="Cancelar" variant="text" onClick={closeDeactivation} />
            <Button label="Inativar" onClick={confirmDeactivation} />
          </>
        }
      >
        <p className="text-ink">
          <span className="font-semibold">{deactivating?.product.title}</span> sai das buscas e do catálogo no app. As
          avaliações dele continuam guardadas e você pode reativar quando quiser.
        </p>
      </Modal>
    </div>
  );
}
