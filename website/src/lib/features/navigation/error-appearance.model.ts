export function errorAppearance(appearance: unknown): string {
  if (appearance === 'light' || appearance === 'dark') {
    return appearance;
  }

  return 'system';
}
