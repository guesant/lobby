import { siteOrigin } from '../navigation/origin.model.ts';

export function isLocalURL(value: string): boolean {
  return new URL(value, `${siteOrigin}/`).origin === siteOrigin;
}
