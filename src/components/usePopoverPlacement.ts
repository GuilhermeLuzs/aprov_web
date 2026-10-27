import { useLayoutEffect, useState, type RefObject } from 'react';

export type PopoverPlacement = { side: 'below' | 'above'; maxHeight: number };

const EDGE_GAP = 16;

export function usePopoverPlacement(anchorRef: RefObject<HTMLElement | null>, open: boolean, preferredHeight: number) {
  const [placement, setPlacement] = useState<PopoverPlacement>({ side: 'below', maxHeight: preferredHeight });

  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
      const below = window.innerHeight - rect.bottom - EDGE_GAP;
      const above = rect.top - headerBottom - EDGE_GAP;
      const side = below >= preferredHeight || below >= above ? 'below' : 'above';
      setPlacement({ side, maxHeight: Math.max(0, Math.min(preferredHeight, side === 'below' ? below : above)) });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [anchorRef, open, preferredHeight]);

  return placement;
}
