export function tooltipShift(rect: DOMRect): number {
  const rootStyles = getComputedStyle(document.documentElement);

  const gutterValue = rootStyles.getPropertyValue('--page-gutter');

  const gutter = parseFloat(gutterValue) || 0;

  if (rect.left < gutter) {
    return gutter - rect.left;
  }

  if (rect.right > innerWidth - gutter) {
    return innerWidth - gutter - rect.right;
  }

  return 0;
}
