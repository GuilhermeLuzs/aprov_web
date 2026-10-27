import { useState } from 'react';
import { X } from 'lucide-react';
import { Modal, PageSizeSelect, Pagination, Tabs } from '../../../components';
import { removeCouponCode } from '../../../store/coupons';
import { icon } from '../../../theme';
import type { CouponOffer } from '../../../types';
import { formatLongDay, plural } from '../../../utils/format';
import { pageCountOf, pageSlice } from '../../../utils/pagination';
import { showToast } from '../../../store/toasts';

type CodesTab = 'available' | 'delivered';

const PAGE_SIZES = [10, 25, 50] as const;

type Props = { offer: CouponOffer; onClose: () => void };

export function CodesModal({ offer, onClose }: Props) {
  const [tab, setTab] = useState<CodesTab>('available');
  const [page, setPage] = useState(1);
  const [confirmingCode, setConfirmingCode] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const available = offer.codes.filter((c) => !c.deliveredAt);
  const delivered = offer.codes.filter((c) => c.deliveredAt);
  const listed = tab === 'available' ? available : delivered;
  const pageCount = pageCountOf(listed.length, pageSize);
  const currentPage = Math.min(page, pageCount);
  const shown = pageSlice(listed, currentPage, pageSize);
  const firstShown = (currentPage - 1) * pageSize + 1;
  const lastShown = firstShown + shown.length - 1;

  const changeTab = (next: CodesTab) => {
    setTab(next);
    setConfirmingCode(null);
    setPage(1);
  };

  const confirmRemoval = (code: string) => {
    removeCouponCode(offer.id, code);
    showToast('success', `Código ${code} removido.`);
    setConfirmingCode(null);
  };

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Códigos: ${offer.title}`}
      footer={
        listed.length > 0 ? (
          <div className="flex w-full flex-col items-center gap-md md:flex-row md:justify-between">
            <span aria-live="polite" className="text-caption text-ink-muted">
              {firstShown} a {lastShown} de {plural(listed.length, 'código', 'códigos')} · Página {currentPage} de {pageCount}
            </span>
            <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
            <PageSizeSelect value={pageSize} options={PAGE_SIZES} onChange={changePageSize} />
          </div>
        ) : undefined
      }
    >
      <Tabs
        label="Códigos"
        size="sm"
        value={tab}
        onChange={changeTab}
        tabs={[
          { key: 'available', label: `Disponíveis (${available.length})` },
          { key: 'delivered', label: `Entregues (${delivered.length})` },
        ]}
      />
      {shown.length === 0 ? (
        <p className="text-caption text-ink-muted">
          {tab === 'available'
            ? 'Nenhum código disponível. Adicione mais para o cupom voltar ao app.'
            : 'Nenhum código entregue ainda.'}
        </p>
      ) : (
        <ul className="flex flex-col">
          {shown.map((c) => (
            <li key={c.code} className="flex items-center justify-between gap-md border-b border-border py-sm last:border-b-0">
              <code className="sensitive font-mono text-ink">{c.code}</code>
              {c.deliveredAt ? (
                <span className="text-caption text-ink-muted">entregue em {formatLongDay(c.deliveredAt.slice(0, 10))}</span>
              ) : confirmingCode === c.code ? (
                <span className="flex items-center gap-md text-caption">
                  <span className="text-ink">Remover este código?</span>
                  <button
                    type="button"
                    onClick={() => setConfirmingCode(null)}
                    className="font-semibold text-ink-muted hover:text-ink"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmRemoval(c.code)}
                    className="font-semibold text-primary hover:text-primary-press"
                  >
                    Remover
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingCode(c.code)}
                  aria-label={`Remover o código ${c.code}`}
                  title="Remover"
                  className="flex h-avatar-sm w-avatar-sm items-center justify-center rounded-pill text-ink-muted hover:bg-surface-alt hover:text-ink"
                >
                  <X size={icon.size.sm} strokeWidth={icon.strokeWidth} aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {tab === 'delivered' && delivered.length > 0 ? (
        <p className="text-caption text-ink-muted">Códigos entregues não podem ser removidos nem cadastrados de novo.</p>
      ) : null}
    </Modal>
  );
}
