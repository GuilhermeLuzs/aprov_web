import { CircleCheck, X } from 'lucide-react';
import { icon } from '../theme';

type Props = {
  text: string;
  onClose: () => void;
};

export function SuccessNotice({ text, onClose }: Props) {
  return (
    <div role="status" className="flex items-center gap-md rounded-control border border-agree bg-agree-dim px-md py-sm text-agree">
      <CircleCheck size={icon.size.md} strokeWidth={icon.strokeWidth} className="shrink-0" aria-hidden />
      <span className="flex-1 font-semibold">{text}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar aviso"
        className="flex h-control w-control shrink-0 items-center justify-center rounded-pill hover:bg-surface"
      >
        <X size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
      </button>
    </div>
  );
}
