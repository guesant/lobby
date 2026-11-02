import { siteOrigin } from '../navigation/origin.model.ts';
import type { InterfaceName } from './resources.server.ts';

export const interfaceNames: InterfaceName[] = [
  'minecraft',
  'terminal',
];

export function absoluteURL(value: string): string {
  return new URL(value, `${siteOrigin}/`).href;
}

export function isLocalURL(value: string): boolean {
  return new URL(value, `${siteOrigin}/`).origin === siteOrigin;
}
