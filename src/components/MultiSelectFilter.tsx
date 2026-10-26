import { useCallback, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { icon } from '../theme';
import { useDismiss } from './useDismiss';

type Option = { value: string; label: string };

type Props = {
  label: string;
  allLabel: string;
  pluralLabel: string;
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
};

export function MultiSelectFilter({ label, allLabel, pluralLabel, options, values, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(wrapperRef, open, close);

  const selected = options.filter((option) => values.includes(option.value));
  const summary =
    selected.length === 0 ? allLabel : selected.length === 1 ? selected[0].label : `${selected.length} ${pluralLabel}`;

  const toggle = (value: string) =>
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${label}: ${summary}`}
        className={`flex h-control w-full items-center justify-between gap-sm rounded-control border bg-surface pr-md pl-md text-left transition-colors ${
          open || selected.length > 0 ? 'border-primary' : 'border-border'
        } ${selected.length > 0 ? 'font-semibold text-primary' : 'text-ink'}`}
      >
        <span className="truncate">{summary}</span>
        <ChevronDown
          size={icon.size.md}
          strokeWidth={icon.strokeWidth}
          className={`shrink-0 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={panelId}
          role="group"
          aria-label={label}
          className="absolute top-full left-zero z-20 mt-xs flex w-full min-w-popover flex-col rounded-control border border-border bg-surface p-xs shadow-card"
        >
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-md rounded-control px-md py-sm text-ink hover:bg-surface-alt"
            >
              <input
                type="checkbox"
                checked={values.includes(option.value)}
                onChange={() => toggle(option.value)}
                className="h-legend-key w-legend-key shrink-0 accent-primary"
              />
              {option.label}
            </label>
          ))}
          <div className="mt-xs border-t border-border pt-xs">
            <button
              type="button"
              onClick={() => onChange([])}
              disabled={values.length === 0}
              className="w-full px-md py-sm text-left font-semibold text-caption text-primary enabled:hover:text-primary-press disabled:cursor-default disabled:text-ink-faint"
            >
              Limpar seleção
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
