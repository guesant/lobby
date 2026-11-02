import type { LoadOptions, Source } from '../federation.types.ts';
import { validateFeed } from '../federation-validation.ts';
import type { LoadedFeed } from './federation-cache.types.ts';
import { remoteFeed } from './remote-feed.ts';
import { readFile } from 'node:fs/promises';

export async function selectedFeed(
  source: Source,
  options: LoadOptions,
  prior: string | null,
): Promise<LoadedFeed> {
  if (options.localFile) {
    const sourceText = await readFile(options.localFile, 'utf8');

    const content: unknown = JSON.parse(sourceText);

    return {
      feed: validateFeed(content, source),
      mode: 'local',
      lastSuccessfulFetchAt: prior,
    };
  }

  return remoteFeed(source, options, prior);
}
