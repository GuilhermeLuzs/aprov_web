import { useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartCard, ChartTooltip, type LegendItem } from '../../../components';
import { chart } from '../../../theme';
import type { DayCoins } from '../../../utils/coinEarnings';
import { formatReais } from '../../../utils/coins';
import { formatDay, formatInt, formatLongDay, plural } from '../../../utils/format';

type Props = { data: DayCoins[]; coinName: string; weekly: boolean; valueInReais: number };

function weekLabel(day: string): string {
  return `Semana de ${formatDay(day)}`;
}

export function EarningsChart({ data, coinName, weekly, valueInReais }: Props) {
  const lines = [
    { key: 'earned', label: `${coinName} ganhas` },
    { key: 'redeemed', label: `${coinName} resgatadas` },
  ];
  const legend: LegendItem[] = lines.map((line, series) => ({ key: line.key, label: line.label, series }));
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  const toggleKey = (key: string) =>
    setHiddenKeys((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]));

  return (
    <ChartCard title="Moedas ao longo do período" description={weekly ? 'Quanto os clientes ganharam e resgataram por semana.' : 'Quanto os clientes ganharam e resgataram por dia.'} legend={legend} hiddenKeys={hiddenKeys} onToggleKey={toggleKey}>
      <ResponsiveContainer width="100%" height={chart.height}>
        <LineChart data={data} margin={chart.margin}>
          <CartesianGrid stroke={chart.grid} vertical={false} />
          <XAxis
            dataKey="day"
            tickFormatter={formatDay}
            stroke={chart.axis}
            tick={{ fill: chart.inkMuted, fontSize: chart.axisFontSize }}
            tickLine={false}
            minTickGap={chart.minTickGap}
          />
          <YAxis
            allowDecimals={false}
            stroke={chart.axis}
            tick={{ fill: chart.inkMuted, fontSize: chart.axisFontSize }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ stroke: chart.axis, strokeWidth: 1 }}
            content={(props) => (
              <ChartTooltip
                active={props.active}
                payload={props.payload}
                label={props.label}
                formatLabel={weekly ? weekLabel : formatLongDay}
                formatValue={(coins) => `${formatInt(coins)} (${formatReais(coins * valueInReais)})`}
                formatDetail={(point) => {
                  const { reviews, coupons } = point as DayCoins;
                  return `${plural(reviews, 'avaliação', 'avaliações')} · ${plural(coupons, 'cupom', 'cupons')}`;
                }}
              />
            )}
          />
          {lines.map((line, index) => (
            <Line
              key={line.key}
              type="linear"
              dataKey={line.key}
              name={line.label}
              hide={hiddenKeys.includes(line.key)}
              stroke={chart.series[index]}
              strokeWidth={chart.lineWidth}
              dot={weekly ? { r: chart.dotRadius, fill: chart.series[index], stroke: chart.surface, strokeWidth: chart.dotRing } : false}
              activeDot={{ r: chart.activeDotRadius, stroke: chart.surface, strokeWidth: chart.dotRing }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
