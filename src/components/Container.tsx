import type { ReactNode } from 'react';

type Width = 'page' | 'wide';

type Props = {
  children: ReactNode;
  width?: Width;
  className?: string;
};

const MAX_WIDTH: Record<Width, string> = {
  page: 'max-w-page',
  wide: 'max-w-wide',
};

export function Container({ children, width = 'page', className = '' }: Props) {
  return <div className={`mx-auto w-full px-lg ${MAX_WIDTH[width]} ${className}`}>{children}</div>;
}
