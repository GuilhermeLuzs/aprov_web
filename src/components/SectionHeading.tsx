type Align = 'center' | 'left';

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: Align;
};

const ALIGN: Record<Align, string> = {
  center: 'mx-auto items-center text-center',
  left: 'items-start text-left',
};

export function SectionHeading({ eyebrow, title, description, align = 'center' }: Props) {
  return (
    <div className={`flex max-w-text flex-col gap-sm ${ALIGN[align]}`}>
      <span className="font-body font-semibold text-caption text-primary uppercase">{eyebrow}</span>
      <h2 className="font-display font-bold text-display text-ink">{title}</h2>
      {description ? <p className="text-ink-muted">{description}</p> : null}
    </div>
  );
}
