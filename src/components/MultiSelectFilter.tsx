import { useCallback, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { icon } from '../theme';
import { useDismiss } from './useDismiss';
import { usePopoverPlacement } from './usePopoverPlacement';

const OPTION_HEIGHT = 40;
const PANEL_CHROME = 60;

type Option = { value: string; label: string };

type Variant = 'filter' | 'field';

type Props = {
  label: string;
  allLabel: string;
  pluralLabel: string;
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
  variant?: Variant;
  error?: string;
};

function buttonTone(variant: Variant, open: boolean, hasSelection: boolean, error?: string): string {
  if (variant === 'filter') {
    return `${open || hasSelection ? 'border-primary' : 'border-border'} ${hasSelection ? 'font-semibold text-primary' : 'text-ink'}`;
  }
  const border = error ? 'border-disagree' : open ? 'border-primary' : 'border-border';
  return `${border} ${hasSelection ? 'text-ink' : 'text-ink-faint'}`;
}

export function MultiSelectFilter({ label, allLabel, pluralLabel, options, values, onChange, variant = 'filter', error }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(wrapperRef, open, close);
  const placement = usePopoverPlacement(wrapperRef, open, options.length * OPTION_HEIGHT + PANEL_CHROME);

  const selected = options.filter((option) => values.includes(option.value));
  const names = selected.map((option) => option.label).join(', ');
  const summary =
    selected.length === 0
      ? allLabel
      : selected.length === 1 || variant === 'field'
        ? names
        : `${selected.length} ${pluralLabel}`;

  const toggle = (value: string) =>
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);

  return (
    <div className="flex flex-col gap-xs">
      {variant === 'field' ? (
        <span className="font-semibold text-caption text-ink" aria-hidden>
          {label}
        </span>
      ) : null}
      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${label}: ${summary}`}
          aria-invalid={error ? true : undefined}
          className={`flex h-control w-full items-center justify-between gap-sm rounded-control border bg-surface pr-md pl-md text-left transition-colors ${buttonTone(
            variant,
            open,
            selected.length > 0,
            error,
          )}`}
        >
          <span className="truncate" title={selected.length > 1 ? names : undefined}>
            {summary}
          </span>
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
            style={{ maxHeight: placement.maxHeight }}
            className={`absolute left-zero z-20 flex w-full min-w-popover flex-col rounded-control border border-border bg-surface p-xs shadow-card ${
              placement.side === 'below' ? 'top-full mt-xs' : 'bottom-full mb-xs'
            }`}
          >
            <div className="flex min-h-zero flex-col overflow-y-auto">
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
            </div>
            <div className="mt-xs shrink-0 border-t border-border pt-xs">
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
      {error ? <p className="text-caption text-disagree">{error}</p> : null}
    </div>
  );
}
