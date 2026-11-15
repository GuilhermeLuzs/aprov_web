import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { BriefcaseBusiness, Package } from 'lucide-react';
import {
  Button,
  EmptyNotice,
  FilterSelect,
  LoadingNotice,
  MenuButton,
  Modal,
  MultiSelectFilter,
  PageSizeSelect,
  Pagination,
  SearchField,
} from '../../../components';
import { ApiError } from '../../../api';
import { useCatalogPage, useItemStatus } from '../../../queries/catalog';
import { useCurrentCompany } from '../../../store/session';
import { showToast } from '../../../store/toasts';
import {
  CATEGORY_LABEL,
  PRODUCT_KIND_LABEL,
  PRODUCT_STATUS_LABEL,
  type CatalogItem,
  type Category,
  type ProductKind,
  type ProductStatus,
} from '../../../types';
import {
  DEFAULT_SORT,
  EMPTY_FILTERS,
  catalogItemFromApi,
  catalogQueryOf,
  hasActiveFilters,
  nextSort,
  type CatalogFilters,
  type CatalogSort,
  type SortKey,
} from '../../../utils/catalog';
import { plural } from '../../../utils/format';
import { useDebouncedValue } from '../../../utils/useDebouncedValue';
import { CatalogList } from './CatalogList';
import { ItemMetricsModal } from './ItemMetricsModal';

const PAGE_SIZES = [5, 10, 25, 50] as const;
const SEARCH_DELAY_MS = 300;

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
  const company = useCurrentCompany();
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<CatalogSort>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const [metricsItem, setMetricsItem] = useState<CatalogItem | null>(null);
  const [deactivating, setDeactivating] = useState<CatalogItem | null>(null);
  const navigate = useNavigate();

  const search = useDebouncedValue(filters.query, SEARCH_DELAY_MS);
  const catalog = useCatalogPage(catalogQueryOf(filters, search, sort, page, pageSize));
  const statusChange = useItemStatus();

  const data = catalog.data;
  const items = (data?.items ?? []).map(catalogItemFromApi);
  const currentPage = data?.page ?? page;
  const categoryOptions = (data?.categories ?? [])
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

  const applyStatus = (item: CatalogItem, active: boolean) => {
    statusChange.mutate(
      { id: item.id, active },
      {
        onSuccess: () =>
          showToast('success', active ? `"${item.title}" ativado. Já aparece no app.` : `"${item.title}" inativado. Saiu do app.`),
        onError: (error) =>
          showToast('error', error instanceof ApiError ? error.message : 'Não deu para mudar o status agora. Tente de novo.'),
      },
    );
  };

  const toggleStatus = (item: CatalogItem) => {
    if (item.status === 'active') setDeactivating(item);
    else applyStatus(item, true);
  };

  const confirmDeactivation = () => {
    if (deactivating) applyStatus(deactivating, false);
    setDeactivating(null);
  };

  const closeMetrics = useCallback(() => setMetricsItem(null), []);
  const closeDeactivation = useCallback(() => setDeactivating(null), []);

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const firstShown = (currentPage - 1) * pageSize + 1;
  const lastShown = firstShown + items.length - 1;

  const content = () => {
    if (catalog.isPending) return <LoadingNotice text="Carregando o catálogo..." />;
    if (catalog.isError || !data) {
      return (
        <EmptyNotice
          mood="confused"
          title="Não deu para carregar o catálogo"
          text="Confira a internet e tente de novo."
          action={<Button label="Tentar de novo" variant="outline" onClick={() => void catalog.refetch()} />}
        />
      );
    }
    if (data.catalogSize === 0) {
      return (
        <EmptyNotice
          mood="neutral"
          title="Seu catálogo ainda está vazio"
          text="Cadastre o primeiro produto ou serviço para os clientes começarem a avaliar pelo app."
          action={<MenuButton label="Cadastrar item" items={NEW_ITEM_OPTIONS} align="left" />}
        />
      );
    }
    return (
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

        {data.total === 0 ? (
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
            <div aria-busy={catalog.isFetching} className={catalog.isPlaceholderData ? 'opacity-50' : undefined}>
              <CatalogList
                rows={items}
                sort={sort}
                onSort={changeSort}
                onShowMetrics={setMetricsItem}
                onToggleStatus={toggleStatus}
                onEdit={(item) => navigate(`/empresa/catalogo/${item.id}/editar`)}
              />
            </div>
            <div className="flex flex-col items-center gap-md border-t border-border pt-lg lg:grid lg:grid-cols-3">
              <span aria-live="polite" className="text-caption text-ink-muted lg:justify-self-start">
                Mostrando {firstShown} a {lastShown} de {plural(data.total, 'item', 'itens')} · Página {currentPage} de{' '}
                {data.pageCount}
              </span>
              <Pagination page={currentPage} pageCount={data.pageCount} onChange={setPage} />
              <div className="lg:col-start-3 lg:justify-self-end">
                <PageSizeSelect value={pageSize} options={PAGE_SIZES} onChange={changePageSize} />
              </div>
            </div>
          </>
        )}
      </section>
    );
  };

  return (
    <div className="flex flex-col gap-xl px-lg py-xl lg:px-xxl">
      <div className="flex flex-col gap-lg md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-xs">
          <h1 className="font-display font-bold text-display text-ink">Catálogo</h1>
          <p className="text-ink-muted">
            Os produtos e serviços que a <span className="sensitive">{company?.name ?? 'sua empresa'}</span> oferece para
            avaliação.
          </p>
        </div>
        <MenuButton label="Cadastrar item" items={NEW_ITEM_OPTIONS} />
      </div>

      {content()}

      <ItemMetricsModal item={metricsItem} onClose={closeMetrics} />

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
          <span className="font-semibold">{deactivating?.title}</span> sai das buscas e do catálogo no app. As avaliações
          dele continuam guardadas e você pode reativar quando quiser.
        </p>
      </Modal>
    </div>
  );
}
