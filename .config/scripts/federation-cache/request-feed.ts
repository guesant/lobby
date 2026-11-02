import type { LoadOptions, Source } from '../federation.types.ts';

export async function requestFeed(
  source: Source,
  fetcher: NonNullable<LoadOptions['fetcher']>,
): ReturnType<NonNullable<LoadOptions['fetcher']>> {
  if (!source.url) {
    throw new Error('Missing federation source URL');
  }

  const timeoutSignal = AbortSignal.timeout(10000);

  const response = await fetcher(source.url, {
    signal: timeoutSignal,
    redirect: 'error',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${String(response.status)}`);
  }

  return response;
}
