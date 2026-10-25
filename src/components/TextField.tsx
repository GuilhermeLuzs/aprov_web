import { useId, useState, type HTMLInputTypeAttribute } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { icon } from '../theme';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  hint?: string;
  error?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'numeric' | 'tel';
  revealable?: boolean;
};

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
  error,
  autoComplete,
  inputMode,
  revealable = false,
}: Props) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const inputType = revealable && revealed ? 'text' : type;
  const note = error ?? hint;

  return (
    <div className="flex flex-col gap-xs">
      <label htmlFor={id} className="font-semibold text-caption text-ink">
        {label}
      </label>
      <div
        className={`flex h-control items-center rounded-control border bg-surface transition-colors focus-within:border-primary ${
          error ? 'border-disagree' : 'border-border'
        }`}
      >
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={error ? true : undefined}
          aria-describedby={note ? `${id}-nota` : undefined}
          className="h-full min-w-zero flex-1 rounded-control bg-surface px-md text-ink outline-none placeholder:text-ink-faint"
        />
        {revealable ? (
          <button
            type="button"
            onClick={() => setRevealed((shown) => !shown)}
            aria-label={revealed ? 'Esconder senha' : 'Mostrar senha'}
            className="flex h-control w-control shrink-0 items-center justify-center text-ink-muted hover:text-ink"
          >
            {revealed ? (
              <EyeOff size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
            ) : (
              <Eye size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
            )}
          </button>
        ) : null}
      </div>
      {note ? (
        <p id={`${id}-nota`} className={`text-caption ${error ? 'text-disagree' : 'text-ink-muted'}`}>
          {note}
        </p>
      ) : null}
    </div>
  );
}
