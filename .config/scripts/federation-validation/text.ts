export function text(value: unknown, max = 12000): string {
  if (typeof value !== 'string' || value.length > max) {
    throw new Error('Invalid federation text');
  }

  return value;
}
