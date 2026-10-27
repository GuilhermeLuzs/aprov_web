import { useCallback, useState } from 'react';
import { Gift, ListPlus, Plus, ShoppingCart, Smartphone, Store, TriangleAlert, type LucideIcon } from 'lucide-react';
import { Button, ChoiceGroup, EmptyNotice, PageSizeSelect, Pagination } from '../../../components';
import { coinSettingsOrDefault, useCoinSettings } from '../../../store/coins';
import { useCouponOffers } from '../../../store/coupons';
import { setCouponSource, useIntegrationSettings } from '../../../store/integrations';
import { useCurrentAccount } from '../../../store/session';
import { icon } from '../../../theme';
import type { CouponOffer, CouponSource } from '../../../types';
import { LOW_STOCK, availableCount, deliveredCount } from '../../../utils/coupons';
import { formatInt, formatLongDay, plural } from '../../../utils/format';
import { pageCountOf, pageSlice } from '../../../utils/pagination';
import { AdvancedIntegration } from './AdvancedIntegration';
import { CodesModal } from './CodesModal';
import { CouponModal } from './CouponModal';

const CODE_ORIGIN: Record<CouponSource | 'unset', string> = {
  unset: 'Da lista que você cadastra aqui ou criado pela sua loja virtual, como você escolher abaixo. Nunca vai para dois clientes.',
  manual: 'O próximo da lista que você cadastrou. Cada código sai da lista ao ser entregue e nunca vai para dois clientes.',
  automatic: 'Criado na hora pela sua loja virtual, pelo fluxo do N8N. Cada resgate gera um código novo.',
};

function howItWorks(source: CouponSource | undefined): { Icon: LucideIcon; title: string; text: string }[] {
  return [
    {
      Icon: Smartphone,
      title: 'O cliente troca moedas por um cupom',
      text: 'No app, ele escolhe um dos seus cupons e paga com as moedas que ganhou avaliando. As moedas saem do saldo dele na hora.',
    },
    {
      Icon: Gift,
      title: 'Ele recebe um código só dele',
      text: CODE_ORIGIN[source ?? 'unset'],
    },
    {
      Icon: Store,
      title: 'Ele usa como qualquer cupom seu',
      text: 'No site ou no balcão. O desconto e a conferência são seus: a APROV entrega o código, mas não acompanha se ele foi usado.',
    },
  ];
}

const SOURCE_OPTIONS = [
  {
    value: 'automatic',
    label: 'Minha loja virtual gera os cupons',
    description:
      'Para quem vende em loja virtual (Nuvemshop, Shopify, WooCommerce e outras). A cada resgate, um cupom novo é criado na sua loja e o código vai para o cliente. Você configura uma vez só.',
    Icon: ShoppingCart,
  },
  {
    value: 'manual',
    label: 'Eu cadastro os códigos aqui',
    description:
      'Para delivery, balcão ou quem não tem loja virtual. Você cria os códigos onde quiser e cola a lista aqui. Cada cliente que resgata recebe um código diferente.',
    Icon: ListPlus,
  },
];

const PAGE_SIZES = [6, 12, 24] as const;

type ModalState = { offer: CouponOffer | null } | null;

type OfferCardProps = { offer: CouponOffer; coinName: string; onAddCodes: () => void; onViewCodes: () => void };

function OfferCard({ offer, coinName, onAddCodes, onViewCodes }: OfferCardProps) {
  const available = availableCount(offer);
  const low = available <= LOW_STOCK;

  return (
    <li className="flex flex-col gap-md rounded-card border border-border bg-surface p-lg">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div className="flex min-w-zero flex-col gap-xs">
          <span className="font-display font-semibold text-subtitle text-ink">{offer.title}</span>
          <span className="text-caption text-ink-muted">
            {formatInt(offer.coinCost)} {coinName} · vale até {formatLongDay(offer.validUntil)}
          </span>
        </div>
        <Button label="Adicionar códigos" variant="outline" onClick={onAddCodes} />
      </div>
      <div className="flex flex-wrap items-center gap-lg text-caption">
        <span className="text-ink">
          <span className="font-semibold">{formatInt(available)}</span> {available === 1 ? 'disponível' : 'disponíveis'}
        </span>
        <span className="text-ink-muted">{plural(deliveredCount(offer), 'entregue', 'entregues')}</span>
        <button type="button" onClick={onViewCodes} className="font-semibold text-primary hover:text-primary-press">
          Ver códigos
        </button>
      </div>
      {low ? (
        <p className="flex items-center gap-sm rounded-control bg-value-dim px-md py-sm text-caption text-ink">
          <TriangleAlert size={icon.size.sm} strokeWidth={icon.strokeWidth} className="shrink-0 text-value-deep" aria-hidden />
          {available === 0
            ? 'Os códigos acabaram: o cupom saiu do app até você adicionar mais.'
            : `${available === 1 ? 'Resta' : 'Restam'} ${plural(available, 'código', 'códigos')}. Adicione mais para os clientes continuarem resgatando.`}
        </p>
      ) : null}
    </li>
  );
}

export default function CouponsScreen() {
  const account = useCurrentAccount();
  const companyId = account?.companyId ?? '';
  const coin = coinSettingsOrDefault(companyId, useCoinSettings(companyId));
  const offers = useCouponOffers().filter((o) => o.companyId === companyId);
  const [modal, setModal] = useState<ModalState>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const closeCodes = useCallback(() => setViewingId(null), []);
  const closeModal = useCallback(() => setModal(null), []);
  const coinName = coin.name || 'moedas';
  const viewingOffer = offers.find((o) => o.id === viewingId);
  const source = useIntegrationSettings(companyId).couponSource;
  const pageCount = pageCountOf(offers.length, pageSize);
  const currentPage = Math.min(page, pageCount);
  const pageOffers = pageSlice(offers, currentPage, pageSize);
  const firstShown = (currentPage - 1) * pageSize + 1;
  const lastShown = firstShown + pageOffers.length - 1;

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-lg px-lg py-xl lg:px-xxl">
      <div className="flex flex-col gap-xs">
        <h1 className="font-display font-bold text-display text-ink">Cupons</h1>
        <p className="text-ink-muted">Como o cliente troca as {coinName} por um cupom de desconto da sua empresa.</p>
      </div>

      <ol className="grid gap-md md:grid-cols-3">
        {howItWorks(source).map((step, index) => (
          <li key={step.title} className="flex gap-md rounded-card bg-primary-dim p-lg">
            <span className="flex h-avatar-md w-avatar-md shrink-0 items-center justify-center rounded-pill bg-surface text-primary">
              <step.Icon size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
            </span>
            <span className="flex flex-col gap-xs">
              <span className="font-semibold text-ink">
                {index + 1}. {step.title}
              </span>
              <span className="text-caption text-ink-muted">{step.text}</span>
            </span>
          </li>
        ))}
      </ol>

      <ChoiceGroup
        label="Como os seus cupons são criados?"
        options={SOURCE_OPTIONS}
        value={source ?? ''}
        onChange={(value) => setCouponSource(companyId, value as CouponSource)}
      />

      {source === 'manual' ? (
        <section className="flex flex-col gap-md">
          <div className="flex flex-wrap items-center justify-between gap-md">
            <div className="flex flex-col gap-xs">
              <h2 className="font-display font-semibold text-title text-ink">Seus cupons</h2>
              <p className="text-caption text-ink-muted">
                Crie os códigos onde preferir (na loja virtual, no caixa, numa planilha) e cole aqui.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModal({ offer: null })}
              className="inline-flex h-control items-center gap-sm rounded-pill bg-primary px-xl font-semibold text-surface hover:bg-primary-press"
            >
              <Plus size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
              Novo cupom
            </button>
          </div>
          {offers.length === 0 ? (
            <EmptyNotice
              mood="neutral"
              title="Nenhum cupom ainda"
              text="Sem cupons, os clientes juntam moedas mas não têm onde trocar. Crie o primeiro e cole os códigos."
            />
          ) : (
            <>
              <ul className="grid gap-md lg:grid-cols-2">
                {pageOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    coinName={coinName}
                    onAddCodes={() => setModal({ offer })}
                    onViewCodes={() => setViewingId(offer.id)}
                  />
                ))}
              </ul>
              <div className="flex flex-col items-center gap-md border-t border-border pt-lg lg:grid lg:grid-cols-3">
                <span aria-live="polite" className="text-caption text-ink-muted lg:justify-self-start">
                  Mostrando {firstShown} a {lastShown} de {plural(offers.length, 'cupom', 'cupons')} · Página {currentPage} de{' '}
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
      ) : null}

      {source === 'automatic' ? <AdvancedIntegration /> : null}

      {modal ? (
        <CouponModal
          companyId={companyId}
          coinName={coinName}
          offer={modal.offer}
          takenCodes={offers.flatMap((o) => o.codes.map((c) => c.code))}
          onClose={closeModal}
        />
      ) : null}
      {viewingOffer ? <CodesModal offer={viewingOffer} onClose={closeCodes} /> : null}
    </div>
  );
}
