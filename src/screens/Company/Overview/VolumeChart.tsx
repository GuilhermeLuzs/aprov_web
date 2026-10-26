import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartCard, ChartTooltip } from '../../../components';
import { chart } from '../../../theme';
import { WEEKDAY_LABELS, formatDay, formatInt, formatLongDay } from '../../../utils/format';
import type { DayCount } from '../../../utils/overview';

type Grouping = 'day' | 'weekday';

type Props = {
  byDay: DayCount[];
  byWeekday: number[];
};

const GROUPING_LABEL: Record<Grouping, string> = { day: 'Por dia', weekday: 'Por dia da semana' };

export function VolumeChart({ byDay, byWeekday }: Props) {
  const [grouping, setGrouping] = useState<Grouping>('day');

  const data =
    grouping === 'day'
      ? byDay.map((point) => ({ key: point.day, count: point.count }))
      : byWeekday.map((count, index) => ({ key: WEEKDAY_LABELS[index], count }));

  const formatKey = (key: string) => (grouping === 'day' ? formatDay(key) : key);
  const formatTooltipKey = (key: string) => (grouping === 'day' ? formatLongDay(key) : key);

  return (
    <ChartCard
      title="Volume de avaliações"
      description="Quantas avaliações chegaram no período."
      actions={
        <div className="flex rounded-pill bg-surface-alt p-xs" role="group" aria-label="Agrupar por">
          {(['day', 'weekday'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setGrouping(option)}
              aria-pressed={grouping === option}
              className={`rounded-pill px-md py-xs text-caption font-semibold transition-colors ${
                grouping === option ? 'bg-surface text-ink shadow-card' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {GROUPING_LABEL[option]}
            </button>
          ))}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={chart.height}>
        <BarChart data={data} margin={chart.margin}>
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
            cursor={{ fill: chart.cursor }}
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
          <Bar
            dataKey="count"
            name="avaliações"
            fill={chart.series[0]}
            maxBarSize={chart.barSize}
            radius={[chart.barRadius, chart.barRadius, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
