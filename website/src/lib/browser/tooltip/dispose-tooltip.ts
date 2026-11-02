export function disposeTooltip(disposers: (() => void)[]): void {
  for (const dispose of disposers) {
    dispose();
  }
}
