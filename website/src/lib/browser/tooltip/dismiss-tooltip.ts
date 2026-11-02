export function dismissTooltip(node: HTMLElement, event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    node.dataset['tooltipDismissed'] = 'true';
  }
}
