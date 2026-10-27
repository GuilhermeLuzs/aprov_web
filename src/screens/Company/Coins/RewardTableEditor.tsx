import { useId } from 'react';
import {
  REWARD_THRESHOLD,
  REWARD_TOPIC_HINT,
  REWARD_TOPICS_BY_KIND,
  REWARD_TOPIC_LABEL,
  type ProductKind,
  type RewardRule,
  type RewardTable,
  type RewardTopic,
} from '../../../types';
import { ruleOf, type CoinFormErrors } from '../../../utils/coins';

type Props = {
  kind: ProductKind;
  table: RewardTable;
  onChange: (topic: RewardTopic, rule: RewardRule) => void;
  coinName: string;
  errors?: CoinFormErrors['rewards'];
};

const NUMBER_CELL =
  'h-control w-number-cell shrink-0 rounded-control border bg-surface px-sm text-right text-ink tabular-nums outline-none transition-colors focus:border-primary';

function digitsOnly(text: string): number {
  const digits = text.replace(/\D/g, '').slice(0, 4);
  return digits ? Number(digits) : 0;
}

type RowProps = {
  topic: RewardTopic;
  rule: RewardRule;
  onChange: (rule: RewardRule) => void;
  error?: string;
};

function Row({ topic, rule, onChange, error }: RowProps) {
  const id = useId();
  const threshold = REWARD_THRESHOLD[topic];
  const label = REWARD_TOPIC_LABEL[topic];
  const hint = REWARD_TOPIC_HINT[topic];
  const border = error ? 'border-disagree' : 'border-border';

  return (
    <li className="flex flex-col gap-xs border-b border-border py-sm last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-x-md gap-y-xs">
        <div className="flex min-w-zero flex-1 flex-col">
          <label htmlFor={`${id}-moedas`} className="text-ink">
            {label}
          </label>
          {hint ? <span className="text-caption text-ink-muted">{hint}</span> : null}
        </div>
        {threshold ? (
          <div className="flex items-center gap-sm text-caption text-ink-muted">
            <span>a partir de</span>
            <input
              value={rule.threshold ? String(rule.threshold) : ''}
              onChange={(event) => onChange({ ...rule, threshold: digitsOnly(event.target.value) || undefined })}
              inputMode="numeric"
              aria-label={`${label}: a partir de quantas ${threshold.unit}`}
              className={`${NUMBER_CELL} ${border}`}
            />
            <span>{threshold.unit}</span>
          </div>
        ) : null}
        <input
          id={`${id}-moedas`}
          value={String(rule.coins)}
          onChange={(event) => onChange({ ...rule, coins: digitsOnly(event.target.value) })}
          inputMode="numeric"
          aria-invalid={error ? true : undefined}
          className={`${NUMBER_CELL} font-semibold ${error ? 'border-disagree' : 'border-border'}`}
        />
      </div>
      {error ? <p className="text-caption text-disagree">{error}</p> : null}
    </li>
  );
}

export function RewardTableEditor({ kind, table, onChange, coinName, errors }: Props) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-md border-b border-border pb-sm text-caption font-semibold text-ink-muted">
        <span>Tópico da avaliação</span>
        <span className="max-w-text truncate" title={coinName}>
          {coinName}
        </span>
      </div>
      <ul className="flex flex-col">
        {REWARD_TOPICS_BY_KIND[kind].map((topic) => (
          <Row
            key={topic}
            topic={topic}
            rule={ruleOf(table, topic)}
            onChange={(rule) => onChange(topic, rule)}
            error={errors?.[`${kind}.${topic}`]}
          />
        ))}
      </ul>
    </div>
  );
}
