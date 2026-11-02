export function currentPage(active: boolean): 'page' | undefined {
  if (active) {
    return 'page';
  }

  return undefined;
}
