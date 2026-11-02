export function focusTarget(node: HTMLElement): HTMLElement {
  if (node instanceof HTMLLabelElement && node.control) {
    return node.control;
  }

  return node;
}
