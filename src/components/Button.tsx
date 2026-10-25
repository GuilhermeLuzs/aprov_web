import { Link } from 'react-router';

type Variant = 'primary' | 'secondary' | 'outline' | 'text' | 'onBrand' | 'outlineOnBrand';

type Props = {
  label: string;
  variant?: Variant;
  to?: string;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  fullWidth?: boolean;
};

const BASE =
  'inline-flex shrink-0 items-center justify-center whitespace-nowrap h-control px-xl rounded-pill font-body font-semibold text-body transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-primary text-surface hover:bg-primary-press focus-visible:outline-primary',
  secondary: 'bg-primary-dim text-primary hover:bg-surface-alt focus-visible:outline-primary',
  outline: 'border-2 border-primary text-primary hover:bg-primary-dim focus-visible:outline-primary',
  text: 'text-primary hover:bg-primary-dim focus-visible:outline-primary',
  onBrand: 'bg-surface text-primary hover:bg-primary-dim focus-visible:outline-surface',
  outlineOnBrand: 'border-2 border-surface text-surface hover:bg-surface/15 focus-visible:outline-surface',
};

export function Button({
  label,
  variant = 'primary',
  to,
  href,
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
}: Props) {
  const className = `${BASE} ${VARIANT[variant]} ${fullWidth ? 'w-full' : ''}`;

  if (to) {
    return (
      <Link to={to} className={className}>
        {label}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={className}>
      {label}
    </button>
  );
}
