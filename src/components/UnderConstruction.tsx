import { MauricioMascot } from './MauricioMascot';

type Props = {
  title: string;
  text: string;
};

export function UnderConstruction({ title, text }: Props) {
  return (
    <div className="flex flex-col items-center gap-lg px-lg py-section text-center">
      <MauricioMascot mood="serious" size="lg" />
      <h1 className="font-display font-bold text-display text-ink">{title}</h1>
      <p className="max-w-text text-ink-muted">{text}</p>
    </div>
  );
}
