import type { ReactNode } from 'react';
import { MauricioMascot, type MauricioMood } from './MauricioMascot';

type Props = {
  mood: MauricioMood;
  title: string;
  text: string;
  action?: ReactNode;
};

export function EmptyNotice({ mood, title, text, action }: Props) {
  return (
    <div className="flex flex-col items-center gap-md rounded-card border border-border bg-surface p-xxl text-center">
      <MauricioMascot mood={mood} size="md" />
      <p className="font-display font-semibold text-subtitle text-ink">{title}</p>
      <p className="max-w-text text-ink-muted">{text}</p>
      {action}
    </div>
  );
}
