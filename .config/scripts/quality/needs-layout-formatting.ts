export function needsLayoutFormatting(filePath: string): boolean {
  return /\.(?:[cm]?[jt]s|svelte)$/.test(filePath);
}
