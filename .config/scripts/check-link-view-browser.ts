import type { Page } from 'puppeteer-core';
import { useBrowserLanguages } from './browser-presentation.ts';
import { animationFrames } from './browser-dom.ts';
import { inputIsChecked, anchorURLs } from './browser-dom.ts';
import type { Browser } from 'puppeteer-core';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readConfiguration, pagesFor } from './configuration.ts';
import type { ConfiguredPage } from '../../website/src/lib/configuration.ts';
import {
  responsiveWidths,
  applyAppearance,
  captureFromTop,
  editorialDestinations,
} from './browser-presentation.ts';

type ViewSnapshot = {
  overflow: boolean;
  stableLinks: boolean;
  checked: string;
  contentFits: boolean;
  details: boolean;
  columns: boolean;
  fullWidth: boolean;
  categoryHeaderLayout: boolean;
  linksIndependent: boolean;
  editorialBorders: boolean;
  editorialSummaries: boolean;
  numericFit: boolean;
  rails: boolean;
};

export default async function checkLinkViewBrowser(
  browser: Browser,
  baseURL: string,
  reportDirectory: string,
): Promise<void> {
  const config = readConfiguration();

  const base = new URL(baseURL);

  const href = (path: string): string => {
    return new URL(path.replace(/^\//, ''), base).href;
  };

  const routes = config.language_options.flatMap(
    ({
      id,
    }): (ConfiguredPage & {
      language: string;
    })[] => {
      return pagesFor(config, id)
        .filter((page: ConfiguredPage): boolean => {
          return [
            'home',
            'links-page',
          ].includes(page.type);
        })
        .map(
          (
            page: ConfiguredPage,
          ): ConfiguredPage & {
            language: string;
          } => {
            return {
              ...page,
              language: id,
            };
          },
        );
    },
  );

  const context = await browser.createBrowserContext();

  const checks: Record<string, unknown>[] = [];

  const errors: string[] = [];

  try {
    const page = await context.newPage();

    page.on('pageerror', (error): number => {
      return errors.push(String(error));
    });
    await useBrowserLanguages(page);
    await page.goto(href('/'), {
      waitUntil: 'networkidle0',
    });
    assert.equal(
      await page.$eval('html', (root): string | undefined => {
        return root.dataset.linkView;
      }),
      'compact',
    );

    const originalURL = page.url();

    await page.focus('#link-view-compact');
    await page.keyboard.press('ArrowRight');
    assert.equal(
      await page.$eval('html', (root): string | undefined => {
        return root.dataset.linkView;
      }),
      'detailed',
    );
    assert.equal(
      await page.$eval('#link-view-detailed', (input): boolean => {
        return (
          input === document.activeElement &&
          getComputedStyle(input.nextElementSibling!).outlineStyle === 'solid'
        );
      }),
      true,
    );
    assert.equal(page.url(), originalURL);
    await page.goto(href('/en/career/'), {
      waitUntil: 'networkidle0',
    });
    assert.equal(await page.$eval('#link-view-detailed', inputIsChecked), true);
    await page.reload({
      waitUntil: 'networkidle0',
    });
    assert.equal(
      await page.$eval('html', (root): string | undefined => {
        return root.dataset.linkView;
      }),
      'detailed',
    );
    await page.click('[data-settings-open]');
    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle0',
      }),
      page.select(
        '[data-language-switcher]',
        new URL(href('/pt-br/career/')).pathname,
      ),
    ]);
    assert.equal(
      await page.$eval('html', (root): string | undefined => {
        return root.dataset.linkView;
      }),
      'detailed',
    );
    await page.evaluate((): void => {
      return localStorage.removeItem('guesant-links-language');
    });

    for (const route of routes) {
      await page.goto(href(route.url), {
        waitUntil: 'networkidle2',
      });

      const labels = config.locales[route.language]!.ui;

      assert.equal(
        await page.$eval('.link-view-control legend', (legend): string => {
          return legend.textContent.trim();
        }),
        labels.link_view_label,
      );

      const initialLinks = await page.$$eval('.link-button', anchorURLs);

      await page.evaluate((): void => {
        window.initialViewLinks = [
          ...document.querySelectorAll<HTMLElement>('.link-button'),
        ];
      });

      for (const mode of [
        'compact',
        'detailed',
      ] as const) {
        await inspectLinkViewMode(
          page,
          mode,
          route,
          checks,
          reportDirectory,
          initialLinks,
        );
      }
    }

    await page.goto(href('/en/code/'), {
      waitUntil: 'networkidle0',
    });

    for (const mode of [
      'compact',
      'detailed',
    ] as const) {
      await page.click(`label[for="link-view-${mode}"]`);
      await page.evaluate((): void => {
        document.documentElement.style.fontSize = '200%';
        window.viewLongText = [
          ...document.querySelectorAll<HTMLElement>(
            '.link-title,.link-description',
          ),
        ].map(
          (
            element,
          ): [
            HTMLElement,
            string,
          ] => {
            return [
              element,
              element.textContent,
            ];
          },
        );

        for (const [
          element,
          text,
        ] of window.viewLongText) {
          element.textContent = text.repeat(4);
        }
      });

      for (const width of [
        320,
        390,
        768,
        1024,
        1440,
      ] as const) {
        await page.setViewport({
          width,
          height: 900,
        });
        assert.equal(
          await page.evaluate((): boolean => {
            return document.documentElement.scrollWidth > innerWidth;
          }),
          false,
          `${mode} enlarged text ${width}`,
        );
      }

      await page.evaluate((): void => {
        document.documentElement.style.removeProperty('font-size');

        for (const [
          element,
          text,
        ] of window.viewLongText) {
          element.textContent = text;
        }
      });
    }

    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }

  for (const blocked of [
    false,
    true,
  ]) {
    const isolated = await browser.createBrowserContext();

    try {
      const page = await isolated.newPage();

      await page.evaluateOnNewDocument((blocked): void => {
        if (blocked) {
          Object.defineProperty(window, 'localStorage', {
            get(): never {
              throw new Error('Storage blocked');
            },
          });
        } else {
          localStorage.setItem('guesant-links-view', 'invalid');
        }
      }, blocked);
      await page.goto(href('/pt-br/career/'), {
        waitUntil: 'networkidle0',
      });
      assert.equal(
        await page.$eval('html', (root): string | undefined => {
          return root.dataset.linkView;
        }),
        'compact',
      );
      await page.click('label[for=link-view-detailed]');
      assert.equal(
        await page.$eval('html', (root): string | undefined => {
          return root.dataset.linkView;
        }),
        'detailed',
      );
    } finally {
      await isolated.close();
    }
  }

  const noJS = await browser.createBrowserContext();

  try {
    const page = await noJS.newPage();

    await page.setJavaScriptEnabled(false);

    for (const route of [
      '/en/',
      '/en/career/',
    ] as const) {
      await page.goto(href(route), {
        waitUntil: 'networkidle0',
      });
      assert.equal(
        await page.$eval('.link-view-control', (control): number => {
          return control.getClientRects().length;
        }),
        0,
      );
      assert.equal(
        await page.$eval('html', (root): string | undefined => {
          return root.dataset.linkView;
        }),
        'compact',
      );
      assert.equal(
        await page.$eval('.link-description', (element): number => {
          return element.getClientRects().length;
        }),
        0,
      );
    }
  } finally {
    await noJS.close();
  }

  fs.writeFileSync(
    `${reportDirectory}/link-view-checks.json`,
    JSON.stringify(
      {
        passed: checks.length,
        failures: errors,
        checks,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({
      linkViewChecks: checks.length,
      failures: errors,
    }),
  );
}

async function inspectLinkViewMode(
  page: Page,
  mode: string,
  route: ConfiguredPage & {
    language: string;
  },
  checks: Record<string, unknown>[],
  reportDirectory: string,
  initialLinks: string[],
): Promise<void> {
  await page.click(`label[for="link-view-${mode}"]`);

  for (const theme of [
    'dark',
    'light',
  ] as const) {
    await applyAppearance(page, theme);

    for (const width of responsiveWidths) {
      await inspectLinkViewViewport(
        page,
        width,
        route,
        mode,
        theme,
        checks,
        reportDirectory,
      );
    }
  }

  assert.deepEqual(await page.$$eval('.link-button', anchorURLs), initialLinks);
}

async function inspectLinkViewViewport(
  page: Page,
  width: number,
  route: ConfiguredPage & {
    language: string;
  },
  mode: string,
  theme: string,
  checks: Record<string, unknown>[],
  reportDirectory: string,
): Promise<void> {
  await page.setViewport({
    width,
    height: 900,
  });
  await page.evaluate(animationFrames, 3);

  const actual = await page.evaluate((): ViewSnapshot => {
    const detailed = document.documentElement.dataset.linkView === 'detailed';

    const links = [
      ...document.querySelectorAll<HTMLElement>('.link-button'),
    ];

    const visible = (element: Element): boolean => {
      return element.getClientRects().length > 0;
    };

    return {
      overflow: document.documentElement.scrollWidth > innerWidth,
      stableLinks: links.every((link, index): boolean => {
        return link === window.initialViewLinks[index];
      }),
      checked: document.querySelector<HTMLInputElement>(
        '[data-link-view-control]:checked',
      )!.value,
      contentFits: links.every((link): boolean => {
        return link.scrollWidth <= link.clientWidth + 1;
      }),
      details: [
        ...document.querySelectorAll<HTMLElement>(
          '.link-url,.link-description,.link-badge,.statistics,.link-visual',
        ),
      ].every((element): boolean => {
        return visible(element) === detailed;
      }),
      columns: [
        ...document.querySelectorAll<HTMLElement>(
          '.link-list,.category-preview',
        ),
      ].every((list): boolean => {
        return (
          getComputedStyle(list).gridTemplateColumns.split(' ').length === 1
        );
      }),
      fullWidth: [
        ...document.querySelectorAll<HTMLElement>('.category-card'),
      ].every((card): boolean => {
        const style = getComputedStyle(card);

        const available =
          card.clientWidth -
          parseFloat(style.paddingLeft) -
          parseFloat(style.paddingRight);

        return (
          getComputedStyle(card).gridTemplateColumns.split(' ').length === 1 &&
          Math.abs(
            card
              .querySelector<HTMLElement>('.category-links')!
              .getBoundingClientRect().width - available,
          ) < 1
        );
      }),
      categoryHeaderLayout: [
        ...document.querySelectorAll<HTMLElement>('.category-summary'),
      ].every((summary): boolean => {
        const icon = summary
          .querySelector<HTMLElement>('.category-icon')!
          .getBoundingClientRect();

        const title = summary
          .querySelector<HTMLElement>('.category-title')!
          .getBoundingClientRect();

        const heading = summary
          .querySelector<HTMLElement>('.category-heading')!
          .getBoundingClientRect();

        const copy = summary
          .querySelector<HTMLElement>('.category-copy')
          ?.getBoundingClientRect();

        const rect = summary.getBoundingClientRect();

        const style = getComputedStyle(summary);

        const contentLeft = rect.left + parseFloat(style.paddingLeft);

        const contentWidth =
          summary.clientWidth -
          parseFloat(style.paddingLeft) -
          parseFloat(style.paddingRight);

        return (
          getComputedStyle(summary).gridTemplateColumns.split(' ').length ===
            1 &&
          Math.abs(
            heading.left + heading.width / 2 - contentLeft - contentWidth / 2,
          ) < 1 &&
          icon.bottom <= title.top &&
          Math.abs(icon.left + icon.width / 2 - title.left - title.width / 2) <
            1 &&
          (!copy ||
            (heading.bottom <= copy.top &&
              Math.abs(copy.width - contentWidth) < 1 &&
              getComputedStyle(
                summary.querySelector<HTMLElement>('.category-copy')!,
              ).textAlign === 'center'))
        );
      }),
      linksIndependent: [
        ...document.querySelectorAll<HTMLElement>('.category-preview-link'),
      ].every((link): boolean => {
        if (!link.parentElement) {
          return false;
        }

        return (
          link.parentElement.matches('.link-card') &&
          link.parentElement.closest('a') === null
        );
      }),
      editorialBorders: [
        ...document.querySelectorAll<HTMLElement>('.editorial-group-items'),
      ].every((group): boolean => {
        return parseFloat(getComputedStyle(group).borderBottomWidth) > 0;
      }),
      editorialSummaries: [
        ...document.querySelectorAll<HTMLElement>(
          '.editorial-entry:is([data-editorial-type="skill"],[data-editorial-type="project"]) .editorial-description',
        ),
      ].every(visible),
      numericFit: [
        ...document.querySelectorAll<HTMLElement>('.statistic dd'),
      ]
        .filter(visible)
        .every((element): boolean => {
          const range = document.createRange();

          range.selectNodeContents(element.firstChild!);

          return range.getClientRects().length === 1;
        }),
      rails: [
        ...document.querySelectorAll<HTMLElement>('.suspension-body'),
      ].every((body): boolean => {
        if (!visible(body)) {
          return true;
        }

        const top = body.getBoundingClientRect().top;

        const anchors = [
          ...document.querySelectorAll<HTMLElement>('[data-rail-anchor]'),
        ];

        const gap = parseFloat(
          getComputedStyle(
            document.querySelector<HTMLElement>('.suspended-content')!,
          ).rowGap,
        );

        return [
          ...body.querySelectorAll<HTMLElement>('[data-rail-lantern]'),
        ].every((lamp): boolean => {
          const anchor = anchors[Number(lamp.dataset.railLantern)];

          return (
            !anchor ||
            Math.abs(
              parseFloat(
                lamp.style.getPropertyValue('--rail-lantern-position'),
              ) -
                (anchor.getBoundingClientRect().bottom + gap / 2 - top),
            ) < 1
          );
        });
      }),
    };
  });

  assert.equal(
    actual.overflow,
    false,
    `${route.url} ${mode} ${theme} ${width} overflow`,
  );
  assert.equal(actual.checked, mode);

  const complete = {
    ...actual,
    editorialDestinations: await page.$$eval(
      '.editorial-entry:has(.editorial-details)',
      editorialDestinations,
    ),
  };

  for (const key of [
    'stableLinks',
    'contentFits',
    'details',
    'columns',
    'fullWidth',
    'categoryHeaderLayout',
    'editorialBorders',
    'editorialSummaries',
    'linksIndependent',
    'editorialDestinations',
    'numericFit',
    'rails',
  ] as const) {
    assert.equal(
      complete[key],
      true,
      `${route.url} ${mode} ${theme} ${width} ${key}`,
    );
  }

  checks.push({
    path: route.url,
    mode,
    theme,
    width,
  });

  if (
    route.language === 'pt-br' &&
    [
      'home',
      'career',
      'code',
    ].includes(route.id) &&
    [
      390,
      1440,
    ].includes(width)
  ) {
    await captureFromTop(
      page,
      `${reportDirectory}/view-${route.id}-${mode}-${theme}-${width}.png`,
    );
  }
}
