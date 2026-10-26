type Props = {
  name: string;
  imageUrl?: string;
};

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export function CompanyAvatar({ name, imageUrl }: Props) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`Foto de ${name}`}
        className="h-avatar-md w-avatar-md shrink-0 rounded-pill border border-border object-cover"
      />
    );
  }

  return (
    <span
      className="flex h-avatar-md w-avatar-md shrink-0 items-center justify-center rounded-pill bg-primary-dim font-display font-bold text-caption text-primary"
      aria-hidden
    >
      {initialsOf(name)}
    </span>
  );
}
