import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { icon } from '../theme';

type Props = {
  value: number;
  options: readonly number[];
  onChange: (size: number) => void;
};

export function PageSizeSelect({ value, options, onChange }: Props) {
  const id = useId();

  return (
    <div className="flex items-center gap-sm text-caption text-ink-muted">
      <label htmlFor={id} className="whitespace-nowrap">
        Itens por página
      </label>
      <div className="relative flex h-control items-center rounded-control border border-border bg-surface transition-colors focus-within:border-primary">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-full appearance-none rounded-control bg-surface pr-control pl-md font-semibold text-ink tabular-nums outline-none"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={icon.size.sm}
          strokeWidth={icon.strokeWidth}
          className="pointer-events-none absolute right-md text-ink-muted"
          aria-hidden
        />
      </div>
    </div>
  );
}
