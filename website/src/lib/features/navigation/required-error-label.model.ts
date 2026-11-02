export function requiredErrorLabel(
  ui: Record<string, string>,
  key: string,
  locale: string,
): string {
  const value = ui[key];

  if (!value) {
    throw new Error(`Missing 404 labels: ${locale}`);
  }

  return value;
}
