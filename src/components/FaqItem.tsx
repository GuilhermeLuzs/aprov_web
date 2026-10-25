import { ChevronDown } from 'lucide-react';
import { icon } from '../theme';

type Props = {
  question: string;
  answer: string;
};

export function FaqItem({ question, answer }: Props) {
  return (
    <details className="group rounded-card border border-border bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-lg p-lg font-body font-semibold text-ink">
        {question}
        <ChevronDown
          size={icon.size.md}
          strokeWidth={icon.strokeWidth}
          className="shrink-0 text-ink-muted transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <p className="px-lg pb-lg text-ink-muted">{answer}</p>
    </details>
  );
}
