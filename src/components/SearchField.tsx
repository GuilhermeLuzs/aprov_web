import { Search, X } from 'lucide-react';
import { icon } from '../theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
};

export function SearchField({ value, onChange, label, placeholder }: Props) {
  return (
    <div className="relative flex h-control min-w-zero items-center rounded-control border border-border bg-surface transition-colors focus-within:border-primary">
      <Search
        size={icon.size.md}
        strokeWidth={icon.strokeWidth}
        className="pointer-events-none absolute left-md text-ink-muted"
        aria-hidden
      />
      <input
        type="text"
        role="searchbox"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        placeholder={placeholder}
        className="h-full min-w-zero flex-1 rounded-control bg-surface pr-control pl-control text-ink outline-none placeholder:text-ink-faint"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          className="absolute right-zero flex h-control w-control items-center justify-center text-ink-muted hover:text-ink"
        >
          <X size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
