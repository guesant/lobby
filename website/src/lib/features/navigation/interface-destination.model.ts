export function interfaceDestination(
  current: URL,
  path: string,
  terminal: boolean,
): URL {
  const target = new URL(path, current);

  target.search = current.search;
  target.hash = current.hash;
  target.searchParams.delete('lobby-boot');

  if (terminal) {
    target.searchParams.set('lobby-boot', '1');
  }

  return target;
}
