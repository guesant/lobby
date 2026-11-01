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

export function consumeBootRequest(current: URL): URL | null {
  if (current.searchParams.get('lobby-boot') !== '1') {
    return null;
  }

  const target = new URL(current);

  target.searchParams.delete('lobby-boot');

  return target;
}

export function rebootURL(current: URL): URL {
  const target = new URL(current);

  target.searchParams.set('lobby-boot', '1');

  return target;
}
