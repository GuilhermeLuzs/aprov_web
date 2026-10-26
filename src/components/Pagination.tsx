import { ChevronLeft, ChevronRight } from 'lucide-react';
import { icon } from '../theme';
import { pageItems } from '../utils/pagination';

type Props = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
};

const CELL = 'flex h-control w-control items-center justify-center rounded-pill';

export function Pagination({ page, pageCount, onChange }: Props) {
  if (pageCount <= 1) return null;

  const go = (next: number) => {
    const clamped = Math.max(1, Math.min(next, pageCount));
    if (clamped !== page) onChange(clamped);
  };

  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-xs">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
        className={`${CELL} text-ink enabled:hover:bg-surface-alt disabled:cursor-not-allowed disabled:text-ink-faint`}
      >
        <ChevronLeft size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
      </button>

      {pageItems(page, pageCount).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className={`${CELL} text-ink-muted`} aria-hidden>
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => go(item)}
            aria-current={item === page ? 'page' : undefined}
            aria-label={item === page ? `Página ${item}, atual` : `Ir para a página ${item}`}
            className={`${CELL} tabular-nums ${item === page ? 'bg-primary font-semibold text-surface' : 'text-ink hover:bg-surface-alt'}`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= pageCount}
        aria-label="Próxima página"
        className={`${CELL} text-ink enabled:hover:bg-surface-alt disabled:cursor-not-allowed disabled:text-ink-faint`}
      >
        <ChevronRight size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
      </button>
    </nav>
  );
}
