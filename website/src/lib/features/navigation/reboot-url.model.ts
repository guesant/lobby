export function rebootURL(current: URL): URL {
  const target = new URL(current);

  target.searchParams.set('lobby-boot', '1');

  return target;
}
