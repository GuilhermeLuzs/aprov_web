import { useCallback, useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { icon } from '../theme';
import { useDismiss } from './useDismiss';

type MenuItem = { label: string; description: string; to: string; Icon: LucideIcon };

type Props = {
  label: string;
  items: MenuItem[];
  align?: 'left' | 'right';
};

export function MenuButton({ label, items, align = 'right' }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(wrapperRef, open, close);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        className="inline-flex h-control items-center justify-center gap-sm rounded-pill bg-primary px-xl font-semibold whitespace-nowrap text-surface transition-colors hover:bg-primary-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {label}
        <ChevronDown
          size={icon.size.md}
          strokeWidth={icon.strokeWidth}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className={`absolute top-full z-20 mt-xs flex w-max min-w-popover flex-col rounded-control border border-border bg-surface p-xs shadow-card ${
            align === 'right' ? 'right-zero' : 'left-zero'
          }`}
        >
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              role="menuitem"
              onClick={close}
              className="flex items-start gap-md rounded-control p-md text-left hover:bg-surface-alt"
            >
              <item.Icon size={icon.size.md} strokeWidth={icon.strokeWidth} className="mt-xs shrink-0 text-primary" aria-hidden />
              <span className="flex flex-col gap-xs">
                <span className="font-semibold text-ink">{item.label}</span>
                <span className="text-caption text-ink-muted">{item.description}</span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
