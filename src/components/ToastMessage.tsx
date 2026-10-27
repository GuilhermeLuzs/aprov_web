import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { icon } from '../theme';
import type { ToastTone } from '../types';

type Props = {
  tone: ToastTone;
  text: string;
  onClose: () => void;
};

const TONE: Record<ToastTone, { Icon: typeof CircleCheck; className: string }> = {
  success: { Icon: CircleCheck, className: 'border-agree bg-agree-dim text-agree' },
  error: { Icon: CircleAlert, className: 'border-disagree bg-disagree-dim text-disagree' },
};

export function ToastMessage({ tone, text, onClose }: Props) {
  const { Icon, className } = TONE[tone];

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex w-full items-center gap-md rounded-control border px-md py-sm shadow-card ${className}`}
    >
      <Icon size={icon.size.md} strokeWidth={icon.strokeWidth} className="shrink-0" aria-hidden />
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
