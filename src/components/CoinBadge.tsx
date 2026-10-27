import {
  BookOpen,
  Coffee,
  Coins,
  Cpu,
  Eye,
  Flame,
  Gem,
  GraduationCap,
  Hammer,
  Heart,
  HeartPulse,
  Leaf,
  PawPrint,
  Snowflake,
  Sparkles,
  Star,
  Utensils,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { coin, icon } from '../theme';
import type { CoinIcon } from '../types';

export const COIN_ICON: Record<CoinIcon, LucideIcon> = {
  coins: Coins,
  cpu: Cpu,
  utensils: Utensils,
  sparkles: Sparkles,
  snowflake: Snowflake,
  coffee: Coffee,
  eye: Eye,
  'paw-print': PawPrint,
  'book-open': BookOpen,
  hammer: Hammer,
  'heart-pulse': HeartPulse,
  zap: Zap,
  'graduation-cap': GraduationCap,
  star: Star,
  heart: Heart,
  leaf: Leaf,
  gem: Gem,
  flame: Flame,
};

type Size = 'sm' | 'md' | 'lg';

const BOX: Record<Size, string> = {
  sm: 'h-avatar-sm w-avatar-sm',
  md: 'h-avatar-md w-avatar-md',
  lg: 'h-avatar-lg w-avatar-lg',
};

const ICON_SIZE: Record<Size, number> = { sm: icon.size.sm, md: icon.size.md, lg: icon.size.xl };

type Props = {
  icon: CoinIcon;
  color: string;
  size?: Size;
};

export function CoinBadge({ icon: iconKey, color, size = 'md' }: Props) {
  const Icon = COIN_ICON[iconKey];
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-pill ${BOX[size]}`} style={{ backgroundColor: color }} aria-hidden>
      <Icon size={ICON_SIZE[size]} color={coin.iconColor} strokeWidth={icon.strokeWidth} />
    </span>
  );
}
