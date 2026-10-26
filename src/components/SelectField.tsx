import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { icon } from '../theme';

type Option = { value: string; label: string };

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  error?: string;
};

export function SelectField({ label, value, onChange, options, placeholder, error }: Props) {
  const id = useId();

  return (
    <div className="flex flex-col gap-xs">
      <label htmlFor={id} className="font-semibold text-caption text-ink">
        {label}
      </label>
      <div
        className={`relative flex h-control items-center rounded-control border bg-surface transition-colors focus-within:border-primary ${
          error ? 'border-disagree' : 'border-border'
        }`}
      >
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-erro` : undefined}
          className={`h-full w-full appearance-none rounded-control bg-surface pr-control pl-md outline-none ${
            value ? 'text-ink' : 'text-ink-faint'
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-ink">
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
      {error ? (
        <p id={`${id}-erro`} className="text-caption text-disagree">
          {error}
        </p>
      ) : null}
    </div>
  );
}
