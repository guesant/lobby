import type { LinkRequester, VerifiedLink } from './verify-links.types.ts';

export async function requestValidLink(
  url: string,
  request: LinkRequester,
): Promise<VerifiedLink> {
  if (!/^https?:\/\//i.test(url)) {
    throw new Error('Invalid retry URL');
  }

  const timeoutSignal = AbortSignal.timeout(20000);

  const response = await request(url, {
    method: 'GET',
    signal: timeoutSignal,
    headers: {
      'User-Agent': 'links-validation',
    },
  });

  await response.body?.cancel();

  if (!response.ok) {
    throw new Error(
      `Link retry failed: HTTP ${String(response.status)} ${url}`,
    );
  }

  return {
    url,
    status: response.status,
    method: 'GET',
  };
}
