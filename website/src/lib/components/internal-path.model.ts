export function internalPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//');
}
