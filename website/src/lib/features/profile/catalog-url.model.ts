import { requiredText } from '../content/validation.model.ts';

export function catalogURL(value: unknown): string {
  const text = requiredText(value, 'technology URL');

  const url = new URL(text);

  if (url.protocol !== 'https:' || url.username || url.password || url.port) {
    throw new Error('Invalid technology URL');
  }

  return url.href;
}
