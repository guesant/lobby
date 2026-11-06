import { technologyGroups } from '../../website/src/lib/features/profile/technology-groups.model.ts';
import { validateFeed } from './federation-validation.ts';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const catalog = [
  {
    id: 'tools',
    labels: {
      en: 'Tools',
      'pt-br': 'Ferramentas',
      internal: 'hidden',
    },
    internal: 'hidden',
    items: [
      {
        id: 'git',
        name: 'Git',
        url: 'https://git-scm.com/',
        internal: 'hidden',
      },
      {
        id: 'unpublished',
        private: true,
      },
    ],
  },
];

test('federation retains the public catalog through validation and excludes unsafe or private entries', (): void => {
  const source = {
    id: 'resume',
    origin: 'https://curriculum.guesant.net',
  };

  const feed = validateFeed(
    {
      version: 1,
      source: 'resume',
      items: [],
      technologies: catalog,
    },
    source,
  );

  assert.equal(feed.technologies?.[0]?.items.length, 1);
  assert.equal(JSON.stringify(feed)
    .includes('hidden'), false);
  assert.equal(JSON.stringify(feed)
    .includes('unpublished'), false);
  assert.deepEqual(technologyGroups(feed.technologies), feed.technologies);
  assert.throws((): unknown => {
    return technologyGroups([
      {
        ...catalog[0],
        items: [
          {
            id: 'bad',
            name: 'Bad',
            url: 'javascript:alert(1)',
          },
        ],
      },
    ]);
  });
  assert.throws((): unknown => {
    return technologyGroups([
      catalog[0],
      catalog[0],
    ]);
  });
});
