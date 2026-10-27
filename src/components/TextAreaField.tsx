import { useId } from 'react';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  rows?: number;
  error?: string;
};

export function TextAreaField({ label, value, onChange, maxLength, placeholder, rows = 5, error }: Props) {
  const id = useId();
  const over = value.length > maxLength;

  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-baseline justify-between gap-md">
        <label htmlFor={id} className="font-semibold text-caption text-ink">
          {label}
        </label>
        <span className={`text-caption tabular-nums ${over ? 'text-disagree' : 'text-ink-muted'}`}>
          {value.length}/{maxLength}
        </span>
      </div>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-erro` : undefined}
        className={`resize-y rounded-control border bg-surface p-md text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-primary ${
          error ? 'border-disagree' : 'border-border'
        }`}
      />
      {error ? (
        <p id={`${id}-erro`} className="text-caption text-disagree">
          {error}
        </p>
      ) : null}
    </div>
  );
}
