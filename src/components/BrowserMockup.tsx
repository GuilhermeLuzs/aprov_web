type Props = {
  src: string;
  alt: string;
  path: string;
};

const WINDOW_DOTS = ['close', 'minimize', 'expand'];

export function BrowserMockup({ src, alt, path }: Props) {
  return (
    <figure className="flex w-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-phone">
      <div className="flex items-center gap-md border-b border-border px-md py-sm" aria-hidden>
        <span className="flex gap-xs">
          {WINDOW_DOTS.map((dot) => (
            <span key={dot} className="h-legend-key w-legend-key rounded-pill bg-border" />
          ))}
        </span>
        <span className="min-w-zero flex-1 truncate rounded-pill bg-bg px-md py-xs text-caption text-ink-muted">aprov.com.br{path}</span>
      </div>
      <img src={src} alt={alt} loading="lazy" className="block aspect-desktop w-full object-cover object-top" />
    </figure>
  );
}
