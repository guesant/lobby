import { getSiteData } from '../../website/src/lib/features/content/content.server.ts';
import { publicProfile } from '../../website/src/lib/features/profile/public-profile.server.ts';
import { technologyGroups } from '../../website/src/lib/features/profile/technology-groups.model.ts';
import { validateFeed } from './federation-validation.ts';
import { websiteRoot } from './paths.ts';
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

test('profile export is allowlisted and respects hidden sections, links and interests', async (): Promise<void> => {
  const original = await getSiteData(websiteRoot);

  const data = structuredClone(original);

  data.federation.technologies = technologyGroups(catalog);

  for (const section of data.links.sections) {
    if (section.id === 'contact') {
      section.private = true;
    }

    for (const link of section.links) {
      if (link.id === 'linkedin') {
        link.private = true;
      }
    }
  }

  data.editorial.entries['interests']?.push({
    id: 'private-interest',
    private: true,
    labels: {
      en: {
        title: 'Not public',
      },
    },
  });

  const profile = publicProfile(data);

  assert.equal(
    profile.contacts.some((contact): boolean => {
      return contact.id === 'email' || contact.id === 'linkedin';
    }),
    false,
  );
  assert.equal(
    profile.interests.some((interest): boolean => {
      return interest.id === 'private-interest';
    }),
    false,
  );
  assert.equal(profile.name, 'Gabriel Rodrigues Antunes');
  assert.equal('birth_date' in profile, false);
  assert.equal('theme' in profile, false);
  delete data.federation.technologies;
  assert.throws((): unknown => {
    return publicProfile(data);
  }, /catalog/);
});
