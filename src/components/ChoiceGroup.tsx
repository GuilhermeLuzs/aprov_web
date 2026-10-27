import { useId } from 'react';
import type { LucideIcon } from 'lucide-react';
import { icon } from '../theme';

type Option = { value: string; label: string; description: string; Icon: LucideIcon };

type Props = {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  stackOnWide?: boolean;
};

const COLUMNS: Record<number, string> = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' };

export function ChoiceGroup({ label, options, value, onChange, error, stackOnWide = false }: Props) {
  const name = useId();

  return (
    <fieldset className="flex flex-col gap-sm" aria-describedby={error ? `${name}-erro` : undefined}>
      <legend className="mb-xs font-semibold text-caption text-ink">{label}</legend>
      <div className={`grid gap-sm ${COLUMNS[options.length] ?? 'sm:grid-cols-3'} ${stackOnWide ? 'xl:grid-cols-1' : ''}`}>
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-md rounded-control border p-md transition-colors focus-within:border-primary ${
                stackOnWide ? 'xl:items-center xl:px-md xl:py-sm' : ''
              } ${
                checked ? 'border-primary bg-primary-dim' : error ? 'border-disagree bg-surface' : 'border-border bg-surface hover:bg-surface-alt'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <option.Icon
                size={icon.size.md}
                strokeWidth={icon.strokeWidth}
                className={`shrink-0 ${checked ? 'text-primary' : 'text-ink-muted'}`}
                aria-hidden
              />
              <span className={`flex flex-col ${stackOnWide ? 'gap-xs xl:gap-zero' : 'gap-xs'}`}>
                <span className={`font-semibold ${checked ? 'text-primary' : 'text-ink'}`}>{option.label}</span>
                <span className="text-caption text-ink-muted">{option.description}</span>
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id={`${name}-erro`} className="text-caption text-disagree">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
