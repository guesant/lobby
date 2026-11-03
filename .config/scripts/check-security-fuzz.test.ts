import { resolveDestination } from '../../website/src/lib/features/content/content.model.ts';
import { getSiteData } from '../../website/src/lib/features/content/content.server.ts';
import { jsonScriptContent } from '../../website/src/lib/features/metadata/serialization.model.ts';
import type { Source } from './federation.types.ts';
import { validateFeed } from './federation-validation.ts';
import { websiteRoot } from './paths.ts';
import * as fc from 'fast-check';
import assert from 'node:assert/strict';
import { test } from 'vitest';

function fuzzOptions(): fc.Parameters<unknown> {
  const options: fc.Parameters<unknown> = {
    numRuns: 100,
    plugins: [
      fc.interruptAfterTimeLimit(30000, {
        failOnInterrupt: true,
      }),
    ],
  };

  if (process.env['TOOLING_PROFILE'] === 'audit') {
    options.numRuns = 10000;
  }

  const seed = process.env['LOBBY_FUZZ_SEED'];

  if (seed !== undefined) {
    const parsed = Number(seed);

    if (!Number.isSafeInteger(parsed)) {
      throw new Error('LOBBY_FUZZ_SEED must be an integer');
    }

    options.seed = parsed;
  }

  const path = process.env['LOBBY_FUZZ_PATH'];

  if (path !== undefined) {
    options.path = path;
  }

  return options;
}

function assertNonpublicFeed(feed: unknown, source: Source): void {
  assert.throws((): unknown => {
    return validateFeed(feed, source);
  }, /Nonpublic/);
}

test(
  'fuzz: federated visibility cannot leak nonpublic entries or metadata',
  {
    timeout: 35000,
  },
  (): void => {
    const visibility = fc.record({
      private: fc.boolean(),
      draft: fc.boolean(),
      public: fc.boolean(),
      enabled: fc.boolean(),
    });

    const source = {
      id: 'blog',
      origin: 'https://blog.guesant.net',
      url: 'https://blog.guesant.net/lobby.json',
    };

    fc.assert(
      fc.property(
        visibility,
        fc.string({
          maxLength: 100,
        }),
        (flags, secret): void => {
          const feed = {
            version: 1,
            source: 'blog',
            items: [
              {
                id: 'public-post',
                language: 'pt-br',
                type: 'post',
                title: 'Public title',
                summary: 'Public summary',
                url: 'https://blog.guesant.net/post/',
                tags: [],
                metadata: {
                  internal_secret: secret,
                },
                ...flags,
              },
            ],
          };

          if (flags.private || flags.draft || !flags.public || !flags.enabled) {
            assertNonpublicFeed(feed, source);

            return;
          }

          const result = validateFeed(feed, source);

          assert.equal(result.items.length, 1);
          assert.deepEqual(result.items[0]?.metadata, {});
        },
      ),
      fuzzOptions(),
    );
  },
);

test(
  'fuzz: first-party domains do not accept suffix or prefix impersonation',
  {
    timeout: 35000,
  },
  async (): Promise<void> => {
    const data = await getSiteData(websiteRoot);

    const label = fc.stringMatching(/^[a-z][a-z0-9]{0,15}$/);

    fc.assert(
      fc.property(label, (prefix): void => {
        const own = resolveDestination(data.links.site, {
          url: `https://${prefix}.guesant.net/`,
        });

        assert.equal(own.thirdParty, false);
        assert.equal(own.external, true);
        assert.equal(own.target, '_blank');

        for (const host of [
          `guesant.net.${prefix}.invalid`,
          `${prefix}-guesant.net.invalid`,
        ]) {
          const thirdParty = resolveDestination(data.links.site, {
            url: `https://${host}/`,
          });

          assert.equal(thirdParty.thirdParty, true);
          assert.equal(thirdParty.target, '_blank');
        }
      }),
      fuzzOptions(),
    );
  },
);

test(
  'fuzz: structured data preserves JSON without allowing script termination',
  {
    timeout: 35000,
  },
  (): void => {
    const values = fc.oneof(
      fc.jsonValue({
        maxDepth: 4,
      }),
      fc
        .string({
          maxLength: 200,
        })
        .map(
          (
            value,
          ): {
            value: string;
          } => {
            return {
              value: `</script><script>${value}</script>`,
            };
          },
        ),
    );

    fc.assert(
      fc.property(values, (value): void => {
        const original = JSON.stringify(value);

        const serialized = jsonScriptContent(original);

        assert.equal(serialized.includes('<'), false);
        assert.deepEqual(
          JSON.parse(serialized) as unknown,
          JSON.parse(original) as unknown,
        );
        assert.equal(jsonScriptContent(serialized), serialized);
      }),
      fuzzOptions(),
    );
  },
);
