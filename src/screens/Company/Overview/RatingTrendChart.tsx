import { useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartCard, ChartTooltip, type LegendItem } from '../../../components';
import { chart } from '../../../theme';
import { CHARACTERISTICS, CHARACTERISTIC_LABEL } from '../../../types';
import { formatDay, formatLongDay, formatRating } from '../../../utils/format';
import type { DayAverages } from '../../../utils/overview';

const LINES = [
  { key: 'overall', label: 'Nota geral' },
  ...CHARACTERISTICS.map((key) => ({ key, label: CHARACTERISTIC_LABEL[key] })),
] as const;

const LEGEND: LegendItem[] = LINES.map((line, series) => ({ key: line.key, label: line.label, series }));

const RATING_TICKS = [1, 2, 3, 4, 5];

export function RatingTrendChart({ data }: { data: DayAverages[] }) {
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);

  const toggleKey = (key: string) =>
    setHiddenKeys((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]));

  return (
    <ChartCard
      title="Notas ao longo do período"
      description="Média do dia, de 1 a 5, nos dias que tiveram avaliação."
      legend={LEGEND}
      hiddenKeys={hiddenKeys}
      onToggleKey={toggleKey}
    >
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
            domain={[1, 5]}
            ticks={RATING_TICKS}
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
                formatLabel={formatLongDay}
                formatValue={formatRating}
              />
            )}
          />
          {LINES.map((line, index) => (
            <Line
              key={line.key}
              type="linear"
              dataKey={line.key}
              name={line.label}
              hide={hiddenKeys.includes(line.key)}
              stroke={chart.series[index]}
              strokeWidth={chart.lineWidth}
              dot={{ r: chart.dotRadius, fill: chart.series[index], stroke: chart.surface, strokeWidth: chart.dotRing }}
              activeDot={{ r: chart.activeDotRadius, stroke: chart.surface, strokeWidth: chart.dotRing }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
