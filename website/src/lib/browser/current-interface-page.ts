import type { PageLoadData } from '../features/content/content.types.ts';
import { page } from '$app/state';

export function currentInterfacePage(): PageLoadData {
  return page.data as PageLoadData;
}
