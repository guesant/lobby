export function backgroundImageURL(background: string): string {
  return /^url\(["']?(.*?)["']?\)$/.exec(background)?.[1] ?? '';
}
