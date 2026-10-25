export const icon = {
  size: { sm: 16, md: 20, lg: 24 },
  strokeWidth: 2,
  strokeWidthThin: 1,
} as const;

export type IconSizeToken = keyof typeof icon.size;
