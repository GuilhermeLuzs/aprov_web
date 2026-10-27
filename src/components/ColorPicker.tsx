import { useId } from 'react';
import { Check } from 'lucide-react';
import { coin, icon } from '../theme';

type Props = {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presets: readonly string[];
  error?: string;
};

export function ColorPicker({ label, value, onChange, presets, error }: Props) {
  const id = useId();
  const normalized = value.trim().toUpperCase();

  return (
    <fieldset className="flex flex-col gap-sm">
      <legend className="mb-xs font-semibold text-caption text-ink">{label}</legend>
      <div className="flex flex-wrap items-center gap-sm">
        {presets.map((color) => {
          const selected = color.toUpperCase() === normalized;
          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              aria-label={`Cor ${color}`}
              aria-pressed={selected}
              className={`flex h-avatar-sm w-avatar-sm items-center justify-center rounded-pill ring-offset-2 transition-shadow ${
                selected ? 'ring-2 ring-ink' : 'hover:ring-2 hover:ring-border'
              }`}
              style={{ backgroundColor: color }}
            >
              {selected ? <Check size={icon.size.sm} strokeWidth={icon.strokeWidth} color={coin.iconColor} aria-hidden /> : null}
            </button>
          );
        })}
        <label htmlFor={id} className="sr-only">
          Ou digite a cor
        </label>
        <div
          className={`flex h-control items-center gap-sm rounded-control border bg-surface px-md transition-colors focus-within:border-primary ${
            error ? 'border-disagree' : 'border-border'
          }`}
        >
          <span className="h-legend-key w-legend-key shrink-0 rounded-pill border border-border" style={{ backgroundColor: value }} aria-hidden />
          <input
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            maxLength={7}
            spellCheck={false}
            aria-invalid={error ? true : undefined}
            className="w-zero min-w-avatar-lg flex-1 bg-surface font-semibold text-ink uppercase tabular-nums outline-none"
          />
        </div>
      </div>
      {error ? <p className="text-caption text-disagree">{error}</p> : null}
    </fieldset>
  );
}
