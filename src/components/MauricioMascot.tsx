import neutral from '../assets/mauricios/icon-mauricio.png';
import talking from '../assets/mauricios/icon-mau-fala.png';
import starry from '../assets/mauricios/icon-mau-estrela.png';
import angry from '../assets/mauricios/icon-mau-mau.png';
import serious from '../assets/mauricios/icon-mau-serio.png';
import confused from '../assets/mauricios/icon-mau-confuso.png';
import sad from '../assets/mauricios/icon-mau-triste.png';

export type MauricioMood = 'neutral' | 'talking' | 'starry' | 'angry' | 'serious' | 'confused' | 'sad';

type MascotSize = 'sm' | 'md' | 'lg';

const ART: Record<MauricioMood, string> = {
  neutral,
  talking,
  starry,
  angry,
  serious,
  confused,
  sad,
};

const HEIGHT: Record<MascotSize, string> = {
  sm: 'h-mascot-sm',
  md: 'h-mascot-md',
  lg: 'h-mascot-lg',
};

type Props = {
  mood?: MauricioMood;
  size?: MascotSize;
};

export function MauricioMascot({ mood = 'neutral', size = 'md' }: Props) {
  return <img src={ART[mood]} alt="Maurício" className={`${HEIGHT[size]} w-auto shrink-0`} />;
}
