type Tab<T extends string> = { key: T; label: string; disabled?: boolean };

type Props<T extends string> = {
  label: string;
  tabs: Tab<T>[];
  value: T;
  onChange: (key: T) => void;
  size?: 'md' | 'sm';
};

export function Tabs<T extends string>({ label, tabs, value, onChange, size = 'md' }: Props<T>) {
  return (
    <div role="tablist" aria-label={label} className="flex w-max max-w-full rounded-pill bg-surface-alt p-xs">
      {tabs.map((tab) => {
        const selected = tab.key === value;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={tab.disabled}
            onClick={() => onChange(tab.key)}
            className={`rounded-pill font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:text-ink-faint ${
              size === 'md' ? 'px-lg py-sm' : 'px-md py-xs text-caption'
            } ${selected ? 'bg-surface text-ink shadow-card' : 'text-ink-muted enabled:hover:text-ink'}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
