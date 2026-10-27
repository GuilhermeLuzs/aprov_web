import { icon } from '../theme';
import { COIN_ICON_LABEL, type CoinIcon } from '../types';
import { COIN_ICON } from './CoinBadge';

type Props = {
  label: string;
  value: CoinIcon;
  onChange: (icon: CoinIcon) => void;
  options: CoinIcon[];
  color: string;
};

export function IconPicker({ label, value, onChange, options, color }: Props) {
  return (
    <fieldset className="flex flex-col gap-sm">
      <legend className="mb-xs font-semibold text-caption text-ink">{label}</legend>
      <div className="flex flex-wrap gap-sm">
        {options.map((key) => {
          const Icon = COIN_ICON[key];
          const selected = key === value;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-label={COIN_ICON_LABEL[key]}
              title={COIN_ICON_LABEL[key]}
              aria-pressed={selected}
              className={`flex h-avatar-md w-avatar-md items-center justify-center rounded-control border transition-colors ${
                selected ? 'border-transparent text-surface' : 'border-border bg-surface text-ink-muted hover:bg-surface-alt hover:text-ink'
              }`}
              style={selected ? { backgroundColor: color } : undefined}
            >
              <Icon size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
