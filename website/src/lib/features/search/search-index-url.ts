import type { PageLoadData } from '../content/content.types.ts';
import { page } from '$app/state';

export function searchIndexURL(): string {
  const data = page.data as PageLoadData;

  return `/search/${data.locale}-${data.interfaceName}.json`;
}
