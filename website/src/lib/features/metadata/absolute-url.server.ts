import { siteOrigin } from '../navigation/origin.model.ts';

export function absoluteURL(value: string): string {
  return new URL(value, `${siteOrigin}/`).href;
}
