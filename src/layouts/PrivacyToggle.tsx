import { Eye, EyeOff } from 'lucide-react';
import { toggleDataHidden, useDataHidden } from '../store/privacy';
import { icon } from '../theme';

export function PrivacyToggle() {
  const hidden = useDataHidden();
  const label = hidden ? 'Mostrar os dados' : 'Esconder os dados';

  return (
    <button
      type="button"
      onClick={toggleDataHidden}
      aria-label={label}
      aria-pressed={hidden}
      title={label}
      className="flex h-control w-control shrink-0 items-center justify-center rounded-pill text-ink-muted hover:bg-surface-alt hover:text-ink"
    >
      {hidden ? (
        <EyeOff size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
      ) : (
        <Eye size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
      )}
    </button>
  );
}
