import { record } from '../../../website/src/lib/features/content/validation.model.ts';
import { reportFailures } from './report-failures.ts';
import { requestValidLink } from './request-valid-link.ts';
import { retryableURLs } from './retryable-urls.ts';
import type { LinkRequester, VerifiedLink } from './verify-links.types.ts';

export async function verifyTransientFailures(
  value: unknown,
  request: LinkRequester = fetch,
): Promise<VerifiedLink[]> {
  const report = record(value, 'link report');

  const failures = reportFailures(report);

  if (!failures.length && !report['errors']) {
    return [];
  }

  const urls = retryableURLs(failures);

  const verified: VerifiedLink[] = [];

  for (const url of urls) {
    const result = await requestValidLink(url, request);

    verified.push(result);
  }

  return verified;
}
