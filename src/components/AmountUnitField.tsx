import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { icon } from '../theme';

type Option = { value: string; label: string };

type Props = {
  label: string;
  amount: string;
  onAmountChange: (value: string) => void;
  unit: string;
  onUnitChange: (value: string) => void;
  units: Option[];
  unitLabel: string;
  placeholder?: string;
  error?: string;
};

export function AmountUnitField({ label, amount, onAmountChange, unit, onUnitChange, units, unitLabel, placeholder, error }: Props) {
  const id = useId();

  return (
    <div className="flex min-w-zero flex-col gap-xs">
      <label htmlFor={id} className="font-semibold text-caption text-ink">
        {label}
      </label>
      <div
        className={`flex h-control min-w-zero items-center rounded-control border bg-surface transition-colors focus-within:border-primary ${
          error ? 'border-disagree' : 'border-border'
        }`}
      >
        <input
          id={id}
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          inputMode="numeric"
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-erro` : undefined}
          className="h-full w-zero min-w-zero flex-1 rounded-l-control bg-surface px-md text-ink tabular-nums outline-none placeholder:text-ink-faint"
        />
        <div className="relative flex h-full shrink-0 items-center border-l border-border">
          <select
            value={unit}
            onChange={(event) => onUnitChange(event.target.value)}
            aria-label={unitLabel}
            className="h-full appearance-none rounded-r-control bg-surface pr-xl pl-sm text-ink outline-none"
          >
            {units.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={icon.size.sm}
            strokeWidth={icon.strokeWidth}
            className="pointer-events-none absolute right-sm text-ink-muted"
            aria-hidden
          />
        </div>
      </div>
      {error ? (
        <p id={`${id}-erro`} className="text-caption text-disagree">
          {error}
        </p>
      ) : null}
    </div>
  );
}
