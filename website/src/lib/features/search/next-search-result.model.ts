export function nextSearchResult(
  current: number,
  key: 'ArrowDown' | 'ArrowUp',
  count: number,
): number {
  if (count <= 0) {
    return -1;
  }

  if (current < 0) {
    if (key === 'ArrowUp') {
      return count - 1;
    }

    return 0;
  }

  if (key === 'ArrowUp') {
    return (current + count - 1) % count;
  }

  return (current + 1) % count;
}
