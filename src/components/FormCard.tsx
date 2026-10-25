import type { ReactNode } from 'react';

type Width = 'form' | 'wide';

type Props = {
  title: string;
  description?: string;
  width?: Width;
  children: ReactNode;
};

const MAX_WIDTH: Record<Width, string> = {
  form: 'max-w-form',
  wide: 'max-w-form-wide',
};

export function FormCard({ title, description, width = 'form', children }: Props) {
  return (
    <div className="px-lg py-xl">
      <div
        className={`mx-auto flex w-full flex-col gap-lg rounded-card border border-border bg-surface p-xl shadow-card ${MAX_WIDTH[width]}`}
      >
        <div className="flex flex-col gap-xs">
          <h1 className="font-display font-bold text-display text-ink">{title}</h1>
          {description ? <p className="text-ink-muted">{description}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}
