import { requiredText } from './validation.model.ts';

export function federationURL(value: unknown, label: string): string {
  const url = new URL(requiredText(value, `${label}.url`));

  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error(`Invalid ${label}.url`);
  }

  return url.href;
}
