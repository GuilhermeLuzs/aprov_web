type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  text: string;
};

export function Switch({ checked, onChange, label, text }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-sm rounded-pill py-xs pr-xs font-semibold text-caption whitespace-nowrap"
    >
      <span
        className={`relative h-switch-track-h w-switch-track-w shrink-0 rounded-pill transition-colors ${
          checked ? 'bg-agree' : 'bg-ink-faint'
        }`}
        aria-hidden
      >
        <span
          className={`absolute top-switch-inset left-switch-inset h-switch-knob w-switch-knob rounded-pill bg-surface shadow-card transition-transform ${
            checked ? 'translate-x-switch-travel' : 'translate-x-zero'
          }`}
        />
      </span>
      <span className={checked ? 'text-agree' : 'text-ink-muted'}>{text}</span>
    </button>
  );
}
