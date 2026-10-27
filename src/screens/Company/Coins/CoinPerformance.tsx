import { useState } from 'react';
import { Download } from 'lucide-react';
import { BarList, EmptyNotice, PeriodFilter, StatTile } from '../../../components';
import { mockToday, redemptions as allRedemptions, reviews as allReviews } from '../../../mocks';
import { useProducts } from '../../../store/catalog';
import { icon } from '../../../theme';
import { REWARD_TOPIC_LABEL, type CoinSettings } from '../../../types';
import {
  WEEKLY_FROM_DAYS,
  coinsByDay,
  coinsByWeek,
  earningsInRange,
  earningsOf,
  redemptionsInRange,
  sumEarnings,
  sumRedemptions,
  totalsByTopic,
} from '../../../utils/coinEarnings';
import { earningsWorkbook } from '../../../utils/coinExport';
import { formatReais } from '../../../utils/coins';
import { formatInt } from '../../../utils/format';
import { presetRange, type DayRange, type PeriodKey } from '../../../utils/overview';
import { EarningsChart } from './EarningsChart';

const INVALID_RANGE = 'A data final precisa ser igual ou depois da inicial.';
const REVOKE_DELAY_MS = 1000;

function download(name: string, file: Blob) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}

export function CoinPerformance({ settings }: { settings: CoinSettings }) {
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [custom, setCustom] = useState<DayRange>(presetRange('30d', mockToday));
  const products = useProducts();

  const kindById = new Map(products.map((p) => [p.id, p.kind]));
  const reviews = allReviews.filter((r) => r.companyId === settings.companyId);
  const redemptions = allRedemptions.filter((r) => r.companyId === settings.companyId);
  const earnings = earningsOf(reviews, (r) => kindById.get(r.productId) ?? 'product', settings);
  const coinName = settings.name || 'moedas';

  const customInvalid = period === 'custom' && custom.start > custom.end;
  const range = period === 'custom' ? custom : presetRange(period, mockToday);
  const scopedEarnings = customInvalid ? [] : earningsInRange(earnings, range);
  const scopedRedemptions = customInvalid ? [] : redemptionsInRange(redemptions, range);

  const everEarned = sumEarnings(earnings);
  const inHands = everEarned - sumRedemptions(redemptions);
  const earned = sumEarnings(scopedEarnings);
  const redeemed = sumRedemptions(scopedRedemptions);
  const topics = totalsByTopic(scopedEarnings);
  const days = coinsByDay(scopedEarnings, scopedRedemptions, range);
  const weekly = days.length >= WEEKLY_FROM_DAYS;
  const toReais = (coins: number) => formatReais(coins * settings.valueInReais);

  if (everEarned === 0) {
    return (
      <EmptyNotice
        mood="neutral"
        title="Ainda não houve emissão de moedas"
        text={`Assim que um cliente avaliar um item seu, as ${coinName} ganhas aparecem aqui.`}
      />
    );
  }

  const exportSheet = async () => {
    const file = await earningsWorkbook({
      coinName,
      weekly,
      rows: weekly ? coinsByWeek(days) : days,
      topics,
      topicLabel: (topic) => REWARD_TOPIC_LABEL[topic],
      valueInReais: settings.valueInReais,
    });
    download(`${coinName}-${range.start}-a-${range.end}.xlsx`, file);
  };

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-md md:flex-row md:items-start md:justify-between">
        <button
          type="button"
          onClick={exportSheet}
          disabled={customInvalid}
          className="inline-flex h-control items-center gap-sm self-start rounded-pill border-2 border-primary px-lg font-semibold text-primary hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
          Exportar planilha
        </button>
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
          label={`${coinName} com os clientes`}
          value={formatInt(inHands)}
          detail={`${toReais(inHands)} em cupons que ainda podem sair`}
        />
        <StatTile label={`${coinName} ganhas no período`} value={formatInt(earned)} detail={`${toReais(earned)} em ${formatInt(scopedEarnings.length)} avaliações`} />
        <StatTile label="Cupons resgatados no período" value={formatInt(scopedRedemptions.length)} detail={`${toReais(redeemed)} em desconto, ${formatInt(redeemed)} ${coinName}`} />
      </div>

      {customInvalid ? null : earned === 0 && redeemed === 0 ? (
        <EmptyNotice mood="confused" title="Nenhuma movimentação neste período" text="Escolha um período maior para ver os ganhos e resgates." />
      ) : (
        <div className="grid items-start gap-lg xl:grid-cols-3">
          <div className="min-w-zero xl:col-span-2">
            <EarningsChart data={weekly ? coinsByWeek(days) : days} coinName={coinName} weekly={weekly} valueInReais={settings.valueInReais} />
          </div>
          <section className="flex min-w-zero flex-col gap-lg rounded-card border border-border bg-surface p-lg">
            <div className="flex flex-col gap-xs">
              <h2 className="font-display font-semibold text-subtitle text-ink">Ganhos por tópico</h2>
              <p className="text-caption text-ink-muted">Quantas {coinName} cada tópico da avaliação rendeu no período.</p>
            </div>
            <BarList
              max={Math.max(0, ...topics.map((t) => t.coins))}
              emptyText="Nenhum ganho no período."
              items={topics.map((t) => ({ id: t.topic, label: REWARD_TOPIC_LABEL[t.topic], value: t.coins, valueLabel: formatInt(t.coins) }))}
            />
          </section>
        </div>
      )}
    </div>
  );
}
