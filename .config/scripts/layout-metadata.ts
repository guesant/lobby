import { getSiteData } from '../../website/src/lib/features/content/content.server.ts';
import type { LinkDocument } from '../../website/src/lib/features/content/content.types.ts';
import { textOr } from '../../website/src/lib/features/content/text-or.model.ts';
import { profilePresentation } from '../../website/src/lib/features/profile/profile-presentation.model.ts';
import { localizedURL, pagesFor } from './configuration.ts';
import type { LayoutRoute } from './layout.types.ts';
import { websiteRoot } from './paths.ts';
import assert from 'node:assert/strict';
import type { Page } from 'puppeteer-core';

export async function verifyRouteMetadata(input: {
  page: Page;
  route: LayoutRoute;
  config: LinkDocument;
  represented: Set<string>;
  href: (path: string) => string;
}): Promise<ReturnType<typeof pagesFor>[number] | undefined> {
  const {
    page,
    route,
    config,
    represented,
    href
  } = input;

  const response = await page.goto(href(route.url), {
    waitUntil: 'networkidle2',
  });

  assert.ok(response, `Missing navigation response: ${route.url}`);

  assert.equal(response.status(), 200, route.url);
  await page.evaluate((): Promise<FontFaceSet> => {
    return document.fonts.ready;
  });

  const typography = await page.evaluate(
    async (): Promise<{
      body: string;
      control: string;
      heading: string;
      pixelHeading: boolean;
      loaded: boolean;
    }> => {
      const weights = [
        400,
        600,
        700,
      ];

      const loaded = await Promise.all(
        weights.map((weight): Promise<FontFace[]> => {
          return document.fonts.load(
            `${String(weight)} 16px "Oxanium"`,
            'Gabriel, música, aplicações, Ā, Ș',
          );
        }),
      );

      const headerNavigationLinksA = document.querySelector<HTMLAnchorElement>(
        '.header-navigation-links a',
      );

      if (headerNavigationLinksA === null) {
        throw new Error('Missing required headerNavigationLinksA');
      }

      const h1 = window.lobbyAssertions.element(document, 'h1');

      const h1Value = window.lobbyAssertions.element(document, 'h1');

      function inspectLoadedEntry(faces: FontFace[]): boolean {
        return (
          faces.length > 0 &&
          faces.every((face): boolean => {
            return face.status === 'loaded';
          })
        );
      }

      return {
        body: getComputedStyle(document.body).fontFamily,
        control: getComputedStyle(headerNavigationLinksA).fontFamily,
        heading: getComputedStyle(h1).fontFamily,
        pixelHeading: h1Value.matches('.profile-name, .section-toolbar-title'),
        loaded: loaded.every(inspectLoadedEntry),
      };
    },
  );

  assert.match(typography.body, /^"?Oxanium"?,/);
  assert.match(typography.control, /^"?Oxanium"?,/);

  function headingFont(): RegExp {
    if (typography.pixelHeading) {
      return /press start 2p/;
    }

    return /^"?Oxanium"?,/;
  }

  assert.match(typography.heading, headingFont());
  assert(typography.loaded, `Oxanium failed to load on ${route.url}`);

  const expectedNavigation = pagesFor(config, route.language)
    .filter((entry): boolean => {
      return (
        [
          'home',
          'links-page',
        ].includes(entry.type) || entry.id === 'now'
      );
    })
    .map(
      (
        entry,
      ): {
        title: string;
        url: string;
        current: boolean;
      } => {
        return {
          title: entry.title,
          url: href(entry.url),
          current: entry.id === route.id,
        };
      },
    );

  const expectedLinks = (route.links ?? [])
    .map((entry): string => {
      return href(localizedURL(entry, route.language));
    })
    .sort();

  for (const entry of route.links ?? []) {
    represented.add(entry.id);
  }

  if (config.navigation.links.includes(route.id)) {
    represented.add(route.id);
  }

  assert.deepEqual(
    await page.$$eval(
      '.header-navigation-links a',
      (
        tabs,
      ): {
        title: string;
        url: string;
        current: boolean;
      }[] => {
        return tabs.map(
          (
            tab,
          ): {
            title: string;
            url: string;
            current: boolean;
          } => {
            return {
              title: tab.textContent.trim(),
              url: tab.href,
              current: tab.getAttribute('aria-current') === 'page',
            };
          },
        );
      },
    ),
    expectedNavigation,
  );

  const nowPage = pagesFor(config, route.language)
    .find((entry): boolean => {
      return entry.id === 'now';
    });

  assert.ok(nowPage, 'Missing personal-update navigation entry');

  assert.deepEqual(
    await page.$$eval(
      '[data-now-shortcut]',
      (
        links,
      ): {
        href: string;
        current: boolean;
      }[] => {
        return links.map(
          (
            link,
          ): {
            href: string;
            current: boolean;
          } => {
            if (!(link instanceof HTMLAnchorElement)) {
              throw new Error('Expected HTMLAnchorElement: link');
            }

            return {
              href: link.href,
              current: link.getAttribute('aria-current') === 'page',
            };
          },
        );
      },
    ),
    Array.from(
      {
        length: 2,
      },
      (): {
        href: string;
        current: boolean;
      } => {
        return {
          href: href(nowPage.url),
          current: route.id === 'now',
        };
      },
    ),
  );
  assert.equal(
    await page.$$eval(
      '.quick-contacts [data-platform="linkedin"]',
      (icons): number => {
        return icons.length;
      },
    ),
    1,
  );
  await page.click('[data-settings-open]');
  await page.waitForSelector('#settings-dialog', {
    visible: true,
  });
  assert.deepEqual(
    await page.$$eval(
      '.language-select option',
      (
        options,
      ): {
        href: string;
        selected: boolean;
      }[] => {
        return options.map(
          (
            option,
          ): {
            href: string;
            selected: boolean;
          } => {
            return {
              href: new URL(option.value, location.href).href,
              selected: option.selected,
            };
          },
        );
      },
    ),
    config.language_options.map(
      (
        language,
      ): {
        href: string;
        selected: boolean;
      } => {
        const translated = pagesFor(config, language.id)
          .find(
            (entry): boolean => {
              return entry.id === route.id && !entry.fallback;
            },
          );

        return {
          href: href(textOr(translated?.url, language.path)),
          selected: language.id === route.language,
        };
      },
    ),
  );
  await page.click('#settings-dialog [data-dialog-close]');
  await page.waitForSelector('#settings-dialog', {
    hidden: true,
  });
  assert.deepEqual(
    await page.$$eval('.link-section .link-button', (links): string[] => {
      return links
        .map((link): string => {
          if (!(link instanceof HTMLAnchorElement)) {
            throw new Error('Expected HTMLAnchorElement: link');
          }

          return link.href;
        })
        .sort();
    }),
    expectedLinks,
  );
  assert.equal(
    await page.$$eval('h1', (headings): number => {
      return headings.length;
    }),
    1,
  );

  if (route.id === 'home') {
    const locale = config.locales[route.language];

    assert.ok(locale);

    const {
      personalProfile
    } = await getSiteData(websiteRoot);

    const expected = profilePresentation(
      personalProfile,
      locale,
      route.language,
    ).presentation;

    assert.deepEqual(
      await page.$eval(
        '.home-introduction',
        (
          panel,
        ): {
          title: string;
          facts: {
            icon: string | undefined;
            text: string;
          }[];
          site_title: string;
          topics: string[];
        } => {
          const headingID = panel.getAttribute('aria-labelledby');

          const heading = document.getElementById(headingID ?? '');

          if (!heading) {
            throw new Error('Missing introduction heading');
          }

          const aboutSiteTitle = window.lobbyAssertions.element(
            panel,
            '.about-site-title',
          );

          return {
            title: heading.textContent.trim(),
            facts: [
              ...panel.querySelectorAll<HTMLElement>('.about-fact'),
            ].map(
              (
                fact,
              ): {
                icon: string | undefined;
                text: string;
              } => {
                const dataPlatform = window.lobbyAssertions.element(
                  fact,
                  '[data-platform]',
                );

                return {
                  icon: dataPlatform.dataset['platform'],
                  text: fact.textContent.trim(),
                };
              },
            ),
            site_title: aboutSiteTitle.textContent.trim(),
            topics: [
              ...panel.querySelectorAll<HTMLElement>('.about-topics > li'),
            ].map((topic): string => {
              return topic.textContent.trim();
            }),
          };
        },
      ),
      expected,
    );
  }

  const expectedCanonical = `https://${String(config.site.first_party_domains[0])}${route.url}`;

  assert.equal(
    await page.$eval('link[rel="canonical"]', (link): string => {
      return link.href;
    }),
    expectedCanonical,
  );
  assert.equal(
    await page.$eval('html', (element): string => {
      return element.lang;
    }),
    config.locales[route.language]?.ui.html_lang,
  );

  return nowPage;
}
