import { useState } from 'react';
import { BarList, ChartCard, Tabs, type BarListItem } from '../../../components';
import { CATEGORY_LABEL, type ProductKind } from '../../../types';
import { formatInt, plural } from '../../../utils/format';
import type { CategoryKindCount } from '../../../utils/platform';

type KindFilter = 'all' | ProductKind;

const KIND_TABS: { key: KindFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'product', label: 'Produtos' },
  { key: 'service', label: 'Serviços' },
];

function valueOf(entry: CategoryKindCount, kind: KindFilter): number {
  return kind === 'all' ? entry.product + entry.service : entry[kind];
}

export function CategoryChart({ counts }: { counts: CategoryKindCount[] }) {
  const [kind, setKind] = useState<KindFilter>('all');

  const items: BarListItem[] = counts
    .map((entry) => ({
      id: entry.category,
      label: CATEGORY_LABEL[entry.category],
      value: valueOf(entry, kind),
      valueLabel: formatInt(valueOf(entry, kind)),
      detail:
        kind === 'all'
          ? `${plural(entry.product, 'produto', 'produtos')} · ${plural(entry.service, 'serviço', 'serviços')}`
          : undefined,
    }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));

  return (
    <ChartCard
      title="Itens por categoria"
      description="Produtos e serviços cadastrados pelas empresas, ativos e inativos."
      actions={<Tabs label="Tipo de item" tabs={KIND_TABS} value={kind} onChange={setKind} size="sm" />}
    >
      <BarList items={items} max={Math.max(0, ...items.map((item) => item.value))} emptyText="Nenhum item cadastrado ainda." />
      <p className="text-caption text-ink-muted">Um item pode estar em mais de uma categoria, por isso a soma passa do total.</p>
    </ChartCard>
  );
}
