type Props = {
  current: number;
  labels: string[];
};

export function Stepper({ current, labels }: Props) {
  return (
    <div className="flex flex-col gap-sm">
      <div className="flex gap-xs" aria-hidden>
        {labels.map((label, index) => (
          <span
            key={label}
            className={`h-progress flex-1 rounded-pill ${index < current ? 'bg-primary' : 'bg-surface-alt'}`}
          />
        ))}
      </div>
      <p className="text-caption text-ink-muted">
        Etapa {current} de {labels.length} · {labels[current - 1]}
      </p>
    </div>
  );
}
