export function searchResultNavigation(
  key: string,
  count: number,
): key is 'ArrowDown' | 'ArrowUp' {
  return count > 0 && (key === 'ArrowDown' || key === 'ArrowUp');
}
