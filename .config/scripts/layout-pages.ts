import type { validateStatistics } from '../../website/src/lib/features/content/statistics.validation.ts';
import { waitForLandscape } from './check-progressive-scene.ts';
import type { readConfiguration } from './configuration.ts';
import {
  type ConfiguredPage,
  localizedURL,
  pagesFor,
} from './configuration.ts';
import { measureContent } from './layout-content.ts';
import { measureGeometry } from './layout-geometry.ts';
import type { CategoryPreviews, PreviewRecord } from './layout-helpers.ts';
import { installLayoutHelpers } from './layout-helpers.ts';
import { measureIconography } from './layout-iconography.ts';
import type { LayoutRoute } from './layout-types.ts';
import assert from 'node:assert/strict';
import type { ElementHandle, Page } from 'puppeteer-core';

export type LayoutContext = {
  config: ReturnType<typeof readConfiguration>;
  href: (path: string) => string;
  checks: Record<string, unknown>[];
  snapshots: ReturnType<typeof validateStatistics>;
  reportDirectory: string;
};

export async function inspectStatistics(
  route: LayoutRoute,
  page: Page,
  context: LayoutContext,
): Promise<void> {
  const {
    config,
    snapshots
  } = context;

  for (const entry of route.links ?? []) {
    if (!entry.stats) {
      continue;
    }

    const snapshot = snapshots[entry.id];

    assert.ok(snapshot, `Missing statistics snapshot: ${entry.id}`);

    assert(
      snapshot.profile_url === entry.url &&
        snapshot.provider === entry.stats.provider,
    );

    const actual = await page.$$eval(
      `[data-statistics="${entry.id}"] .statistic`,
      (
        statistics,
      ): {
        label: string;
        value: string;
      }[] => {
        return statistics.map(
          (
            statistic,
          ): {
            label: string;
            value: string;
          } => {
            const dt = window.lobbyAssertions.element(statistic, 'dt');

            const dd = window.lobbyAssertions.element(statistic, 'dd');

            const firstChildValue = dd.firstChild;

            if (firstChildValue === null) {
              throw new Error('Missing required firstChildValue');
            }

            const textContentValue = firstChildValue.textContent;

            if (textContentValue === null) {
              throw new Error('Missing required textContentValue');
            }

            return {
              label: dt.textContent.trim(),
              value: textContentValue.trim(),
            };
          },
        );
      },
    );

    assert.deepEqual(
      actual,
      entry.stats.metrics.map(
        (
          metric,
        ): {
          label: string | undefined;
          value: string;
        } => {
          const requiredValue = config.statistics.metrics[metric];

          if (requiredValue === undefined) {
            throw new Error('Missing required requiredValue');
          }

          return {
            label: requiredValue.labels[route.language],
            value: String(snapshot.metrics[metric]),
          };
        },
      ),
    );
  }
}

export async function inspectHomeCategories(input: {
  route: LayoutRoute;
  page: Page;
  nowPage: ConfiguredPage | undefined;
  context: LayoutContext;
}): Promise<void> {
  const {
    route,
    page,
    nowPage,
    context
  } = input;

  const {
    config,
    href
  } = context;

  if (route.id !== 'home') {
    return;
  }

  const categories = await page.$$eval(
    '.home-categories [data-category]',
    (cards): CategoryPreviews[] => {
      return window.lobbyLayout.categories(cards);
    },
  );

  const expectedCategories = pagesFor(config, route.language)
    .filter((entry): boolean => {
      return entry.type === 'links-page';
    })
    .map((entry): CategoryPreviews => {
      assert(entry.links, 'A category must expose its complete links');

      return {
        id: entry.id,
        previews: entry.links.map((link): PreviewRecord => {
          return {
            id: link.id,
            href: href(localizedURL(link, route.language)),
          };
        }),
      };
    });

  assert.deepEqual(categories, expectedCategories);
  assert.deepEqual(
    await page.$$eval(
      '[data-home-update="now"] [data-preview-id]',
      (links): PreviewRecord[] => {
        return window.lobbyLayout.previewLinks(links);
      },
    ),
    (config.now[route.language] ?? config.now['en'])?.sections.map(
      (
        section,
      ): {
        id: string;
        href: string;
      } => {
        if (nowPage === undefined) {
          throw new Error('Missing required nowPage');
        }

        return {
          id: `now-${section.id}`,
          href: `${href(nowPage.url)}#now-${section.id}`,
        };
      },
    ),
  );

  const requiredValue = config.language_options[0];

  if (requiredValue === undefined) {
    throw new Error('Missing required requiredValue');
  }

  if (route.language === requiredValue.id) {
    await page.evaluate((): void => {
      window.linkClicks = [];
      document.addEventListener('click', (event): void => {
        if (!(event.target instanceof Element)) {
          return;
        }

        const anchor = event.target.closest('a');

        if (!anchor) {
          return;
        }

        event.preventDefault();
        window.linkClicks.push(anchor.href);
      });
    });

    for (const anchor of await page.$$('.category-preview-link')) {
      const expected = await anchor.evaluate((link): string => {
        if (!(link instanceof HTMLAnchorElement)) {
          throw new Error('Expected HTMLAnchorElement: link');
        }

        return link.href;
      });

      await anchor.click();
      assert.equal(
        await page.evaluate((): string | undefined => {
          return window.linkClicks.at(-1);
        }),
        expected,
      );
    }

    for (const card of await page.$$('.category-card')) {
      await inspectCardCase(card);
    }

    await page.focus('.category-preview-link');
    assert.equal(
      await page.$eval(':focus', (link): boolean => {
        return link.classList.contains('category-preview-link');
      }),
      true,
    );

    const expected = await page.$eval(':focus', (link): string => {
      if (!(link instanceof HTMLAnchorElement)) {
        throw new Error('Expected HTMLAnchorElement: link');
      }

      return link.href;
    });

    await page.keyboard.press('Enter');
    assert.equal(
      await page.evaluate((): string | undefined => {
        return window.linkClicks.at(-1);
      }),
      expected,
    );
    await page.reload({
      waitUntil: 'networkidle2',
    });
  }

  async function inspectCardCase(card: ElementHandle): Promise<void> {
    await card.evaluate((element): void => {
      element.scrollIntoView({
        block: 'center',
        behavior: 'instant',
      });
    });

    const previousClickCount = await page.evaluate((): number => {
      return window.linkClicks.length;
    });

    const rect = await card.boundingBox();

    if (rect === null) {
      throw new Error('Missing required rect');
    }

    await page.mouse.click(rect.x + 12, rect.y + 12);
    assert.equal(
      await page.evaluate((): number => {
        return window.linkClicks.length;
      }),
      previousClickCount,
    );
  }
}

export async function inspectLayoutViewport(input: {
  page: Page;
  width: number;
  route: LayoutRoute;
  theme: string;
  context: LayoutContext;
}): Promise<void> {
  const {
    page,
    width,
    route,
    theme,
    context
  } = input;

  const {
    config,
    checks,
    reportDirectory
  } = context;

  await page.setViewport({
    width,
    height: 900,
  });
  await waitForLandscape(page);

  await page.evaluate(installLayoutHelpers);

  const layout = {
    ...(await page.evaluate(measureGeometry)),
    ...(await page.evaluate(measureIconography)),
    ...(await page.evaluate(measureContent)),
  };

  assert.equal(
    layout.overflow,
    false,
    `${route.url} overflow at ${String(width)}`,
  );

  for (const key of [
    'cardsAligned',
    'regionsAligned',
    'mainContentGeometry',
    'statisticsAligned',
    'numericValuesFit',
    'navigationCompact',
    'controlsFit',
    'noControlMotion',
    'iconBoxes',
    'opticalIcons',
    'quickContactsTransparent',
    'thirdPartyBadges',
    'repeatingFrames',
    'railConnections',
    'railContentClearance',
    'anchoredLanterns',
    'coloredIcons',
    'beveledIcons',
    'localIcons',
    'externalLinks',
    'footerDisclaimer',
    'calendarUptime',
    'uniformMedia',
    'galleryAligned',
    'categoryPreviewColumns',
    'rusticGeometry',
    'contiguousLists',
    'squareQuickAccess',
    'layeredBackground',
    'deferredOrnaments',
    'minimalContext',
    'galleryLinksAccessible',
    'footerAligned',
    'settingsClosed',
    'isolatedPreferences',
  ] as const) {
    assert.equal(
      layout[key],
      true,
      `${route.url} ${key} at ${String(width)}/${theme}`,
    );
  }

  assert(
    layout.columns.every((columns): boolean => {
      return columns === 1;
    }),
  );
  assert.equal(layout.languageControls, 1);

  if (route.id === 'home') {
    assert.equal(layout.galleryColumns, 1);
  }

  assert.equal(layout.statisticsImages, 0);
  assert.equal(layout.brokenImages, 0);
  checks.push({
    path: route.url,
    theme,
    width,
    passed: true,
  });

  if (
    route.language === config.language_options[0]?.id &&
    [
      390,
      1440,
    ].includes(width)
  ) {
    await page.evaluate((): void => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      scrollTo(0, 0);
    });
    await page.screenshot({
      path: `${reportDirectory}/${route.id}-${theme}-${String(width)}.png`,
      fullPage: true,
    });
  }
}
