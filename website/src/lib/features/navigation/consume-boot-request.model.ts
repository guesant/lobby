export function consumeBootRequest(current: URL): URL | null {
  if (current.searchParams.get('lobby-boot') !== '1') {
    return null;
  }

  const target = new URL(current);

  target.searchParams.delete('lobby-boot');

  return target;
}
