import type { LinkFailure } from './verify-links.types.ts';

const transientStatuses = new Set([
  429,
  500,
  502,
  503,
  504,
]);

export function retryableURLs(failures: LinkFailure[]): Set<string> {
  if (!failures.length) {
    throw new Error('Link validation contains non-retriable errors');
  }

  const urls = new Set<string>();

  for (const failure of failures) {
    if (!transientStatuses.has(failure.status.code)) {
      throw new Error('Link validation contains non-retriable errors');
    }

    urls.add(failure.url);
  }

  return urls;
}
