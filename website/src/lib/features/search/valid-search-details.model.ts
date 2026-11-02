import { safeSearchURL } from './safe-search-url.model.ts';

export function validSearchDetails(item: Record<string, unknown>): boolean {
  const detailsURL = item['details_url'];

  const detailsLabel = item['details_label'];

  if (detailsURL !== undefined && typeof detailsURL !== 'string') {
    return false;
  }

  if (detailsLabel !== undefined && typeof detailsLabel !== 'string') {
    return false;
  }

  if (!detailsURL) {
    return true;
  }

  return Boolean(detailsLabel) && safeSearchURL(detailsURL);
}
