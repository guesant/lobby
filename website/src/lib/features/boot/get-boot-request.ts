import { page } from '$app/state';

export function getBootRequest(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return page.url.searchParams.get('lobby-boot') === '1';
}
