import { useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartCard, ChartTooltip, Tabs } from '../../../components';
import { chart } from '../../../theme';
import { WEEKDAY_LABELS, formatInt, formatLongMonth, formatMonth } from '../../../utils/format';
import type { MonthCount } from '../../../utils/platform';

type Grouping = 'month' | 'weekday';

const GROUPINGS: { key: Grouping; label: string }[] = [
  { key: 'month', label: 'Por mês' },
  { key: 'weekday', label: 'Por dia da semana' },
];

const WEEKDAY_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

const DESCRIPTION: Record<Grouping, string> = {
  month: 'Avaliações publicadas em cada mês, nos últimos 12 meses. O mês atual conta até hoje.',
  weekday: 'Total de avaliações publicadas em cada dia da semana, nos últimos 12 meses.',
};

type Props = {
  byMonth: MonthCount[];
  byWeekday: number[];
};

export function ReviewVolumeChart({ byMonth, byWeekday }: Props) {
  const [grouping, setGrouping] = useState<Grouping>('month');

  const data =
    grouping === 'month'
      ? byMonth.map((point) => ({ key: point.month, count: point.count }))
      : byWeekday.map((count, index) => ({ key: WEEKDAY_LABELS[index], count }));

  const formatKey = (key: string) => (grouping === 'month' ? formatMonth(key) : key);
  const formatTooltipKey = (key: string) =>
    grouping === 'month' ? formatLongMonth(key) : WEEKDAY_NAMES[WEEKDAY_LABELS.indexOf(key)];

  return (
    <ChartCard
      title="Volume de avaliações"
      description={DESCRIPTION[grouping]}
      actions={<Tabs label="Agrupar por" tabs={GROUPINGS} value={grouping} onChange={setGrouping} size="sm" />}
    >
      <ResponsiveContainer width="100%" height={chart.height}>
        <LineChart data={data} margin={chart.margin}>
          <CartesianGrid stroke={chart.grid} vertical={false} />
          <XAxis
            dataKey="key"
            tickFormatter={formatKey}
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
                formatLabel={formatTooltipKey}
                formatValue={formatInt}
              />
            )}
          />
          <Line
            type="linear"
            dataKey="count"
            name="avaliações"
            stroke={chart.series[0]}
            strokeWidth={chart.lineWidth}
            dot={{ r: chart.dotRadius, fill: chart.series[0], stroke: chart.surface, strokeWidth: chart.dotRing }}
            activeDot={{ r: chart.activeDotRadius, stroke: chart.surface, strokeWidth: chart.dotRing }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
