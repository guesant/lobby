import { siteOrigin } from '../features/navigation/origin.model.ts';

export function navigationOrigin(): string {
  if (typeof window === 'undefined') {
    return siteOrigin;
  }

  return window.location.origin;
}
