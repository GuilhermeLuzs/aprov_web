import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { icon } from '../theme';

type Size = 'sm' | 'lg';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: Size;
  header?: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

const WIDTH: Record<Size, string> = { sm: 'max-w-dialog', lg: 'max-w-modal' };

export function Modal({ open, onClose, title, size = 'lg', header, subtitle, footer, children }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ hiddenAbove: false, hiddenBelow: false });

  const measureEdges = useCallback(() => {
    const body = bodyRef.current;
    if (!body) return;
    const hiddenAbove = body.scrollTop > 0;
    const hiddenBelow = body.scrollTop + body.clientHeight < body.scrollHeight - 1;
    setEdges((current) =>
      current.hiddenAbove === hiddenAbove && current.hiddenBelow === hiddenBelow ? current : { hiddenAbove, hiddenBelow },
    );
  }, []);

  useEffect(() => {
    const body = bodyRef.current;
    if (!open || !body) return;
    measureEdges();
    const observer = new ResizeObserver(measureEdges);
    observer.observe(body);
    Array.from(body.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [open, measureEdges, children]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', closeOnEscape);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-zero z-30 flex items-center justify-center p-lg">
      <div className="absolute inset-zero bg-scrim" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative flex max-h-full w-full flex-col rounded-card bg-surface shadow-phone outline-none ${WIDTH[size]}`}
      >
        <div
          className={`relative z-10 flex items-start justify-between gap-lg rounded-t-card border-b p-lg transition-shadow ${
            edges.hiddenAbove ? 'border-border shadow-edge-below' : 'border-transparent'
          }`}
        >
          <div className="flex min-w-zero items-center gap-md">
            {header}
            <div className="flex min-w-zero flex-col gap-xs">
              <h2 id={titleId} className="font-display font-semibold text-title text-ink">
                {title}
              </h2>
              {subtitle}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-control w-control shrink-0 items-center justify-center rounded-pill text-ink hover:bg-surface-alt"
          >
            <X size={icon.size.lg} strokeWidth={icon.strokeWidth} aria-hidden />
          </button>
        </div>
        <div ref={bodyRef} onScroll={measureEdges} className="flex min-h-zero flex-col gap-lg overflow-y-auto px-lg pb-lg">
          {children}
        </div>
        {footer ? (
          <div
            className={`relative z-10 flex flex-wrap justify-end gap-md rounded-b-card border-t px-lg py-lg transition-shadow ${
              edges.hiddenBelow ? 'border-border shadow-edge-above' : 'border-transparent pt-zero'
            }`}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
