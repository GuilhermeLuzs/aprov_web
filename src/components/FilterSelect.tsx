import { ChevronDown } from 'lucide-react';
import { icon } from '../theme';

type Option = { value: string; label: string };

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  options: Option[];
};

export function FilterSelect({ label, value, onChange, allLabel, options }: Props) {
  return (
    <div
      className={`relative flex h-control items-center rounded-control border bg-surface transition-colors focus-within:border-primary ${
        value ? 'border-primary' : 'border-border'
      }`}
    >
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className={`h-full w-full appearance-none rounded-control bg-surface pr-control pl-md outline-none ${
          value ? 'font-semibold text-primary' : 'text-ink'
        }`}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={icon.size.md}
        strokeWidth={icon.strokeWidth}
        className="pointer-events-none absolute right-md text-ink-muted"
        aria-hidden
      />
    </div>
  );
}
