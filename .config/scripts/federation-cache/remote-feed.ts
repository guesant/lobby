import type { LoadOptions, Source } from '../federation.types.ts';
import { validateFeed } from '../federation-validation.ts';
import { cachedFeed } from './cached-feed.ts';
import { currentTime } from './current-time.ts';
import type { LoadedFeed } from './federation-cache.types.ts';
import { requestFeed } from './request-feed.ts';

export async function remoteFeed(
  source: Source,
  options: LoadOptions,
  prior: string | null,
): Promise<LoadedFeed> {
  let bytes: string;

  try {
    const response = await requestFeed(source, options.fetcher ?? fetch);

    bytes = await response.text();
  } catch (error) {
    return {
      feed: await cachedFeed(source, options, error),
      mode: 'cache',
      lastSuccessfulFetchAt: prior,
    };
  }

  if (bytes.length > 5_000_000) {
    throw new Error('Federation feed too large');
  }

  const parsed: unknown = JSON.parse(bytes);

  const feed = validateFeed(parsed, source);

  const now = options.now ?? currentTime;

  return {
    feed,
    mode: 'remote',
    lastSuccessfulFetchAt: now()
      .toISOString(),
  };
}
