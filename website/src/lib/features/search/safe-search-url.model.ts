export function safeSearchURL(value: unknown): boolean {
  if (typeof value !== 'string' || !value.trim()) {
    return false;
  }

  try {
    const url = new URL(value, 'https://guesant.net');

    return [
      'https:',
      'http:',
      'mailto:',
      'tel:',
    ].includes(url.protocol);
  } catch {
    return false;
  }
}
