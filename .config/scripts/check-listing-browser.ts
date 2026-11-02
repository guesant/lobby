import type { LinkDocument } from '../../website/src/lib/features/content/content.types.ts';
import { textOr } from '../../website/src/lib/features/content/text-or.model.ts';
import { required } from './asset-data.ts';
import { createAuditPage } from './browser-fixture.ts';
import {
  applyLinkPresentation,
  responsiveWidths,
  useBrowserLanguages,
  withBrowser,
} from './browser-presentation.ts';
import { readConfiguration } from './configuration.ts';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Browser, CDPSession, ElementHandle, Page } from 'puppeteer-core';

type RowSnapshot = {
  color: string;
  background: string;
  outline: string;
  shadow: string;
  padding: [
    string,
    string,
    string,
    string,
  ];
  height: number;
  width: number;
};

type StateName = 'normal' | 'hover' | 'focus' | 'active';

type RowStates = Record<StateName, RowSnapshot>;

const families = {
  platform: '.action-row[data-link-id]',
  experience: '[data-editorial-type="experience"] .editorial-primary',
  project: '[data-editorial-type="project"] .editorial-primary',
  repository: '.editorial-details',
  fallback: '.editorial-related',
};

async function snapshot(row: ElementHandle): Promise<RowSnapshot> {
  return row.evaluate((element): RowSnapshot => {
    const style = getComputedStyle(element);

    const rect = element.getBoundingClientRect();

    return {
      color: style.color,
      background: style.backgroundColor,
      outline: style.outlineStyle,
      shadow: style.boxShadow,
      padding: [
        style.paddingTop,
        style.paddingRight,
        style.paddingBottom,
        style.paddingLeft,
      ],
      height: rect.height,
      width: rect.width,
    };
  });
}

async function inspectStates(input: {
  page: Page;
  session: CDPSession;
  documentID: number;
  selector: string;
}): Promise<RowStates | undefined> {
  const {
    page,
    session,
    documentID,
    selector
  } = input;

  const row = await page.$(selector);

  if (!row) {
    return undefined;
  }

  const {
    nodeId
  } = await session.send('DOM.querySelector', {
    nodeId: documentID,
    selector,
  });

  const measured = new Map<StateName, RowSnapshot>();

  for (const [
    name,
    forcedPseudoClasses,
  ] of Object.entries({
      normal: [],
      hover: [
        'hover',
      ],
      focus: [
        'focus-visible',
      ],
      active: [
        'hover',
        'active',
      ],
    })) {
    await session.send('CSS.forcePseudoState', {
      nodeId,
      forcedPseudoClasses,
    });
    measured.set(name as StateName, await snapshot(row));
  }

  await session.send('CSS.forcePseudoState', {
    nodeId,
    forcedPseudoClasses: [],
  });

  const states: RowStates = {
    normal: required(measured.get('normal')),
    hover: required(measured.get('hover')),
    focus: required(measured.get('focus')),
    active: required(measured.get('active')),
  };

  assert.notEqual(states.hover.background, states.normal.background, selector);
  assert.notEqual(states.hover.color, states.normal.color, selector);
  assert.equal(states.focus.background, states.hover.background, selector);
  assert.equal(states.focus.color, states.hover.color, selector);
  assert.equal(states.focus.outline, 'solid', selector);
  assert.notEqual(states.active.background, states.normal.background, selector);

  for (const state of Object.values(states)) {
    assert.equal(state.width, states.normal.width, selector);
    assert.equal(state.height, states.normal.height, selector);
    assert(state.height >= 44, selector);
  }

  assert.equal(states.normal.padding[0], states.normal.padding[2]);
  assert.equal(states.normal.padding[1], states.normal.padding[3]);
  assert(
    parseFloat(states.normal.padding[1]) > parseFloat(states.normal.padding[0]),
  );

  return states;
}

async function inspectPresentation(
  page: Page,
  session: CDPSession,
): Promise<number> {
  await page.mouse.move(0, 0);

  const {
    root
  } = await session.send('DOM.getDocument');

  let reference: RowStates | undefined;

  let count = 0;

  for (const selector of Object.values(families)) {
    const states = await inspectStates({
      page,
      session,
      documentID: root.nodeId,
      selector,
    });

    if (!states) {
      continue;
    }

    reference ??= states;

    for (const name of [
      'normal',
      'hover',
      'focus',
      'active',
    ] as const) {
      assert.equal(
        states[name].background,
        reference[name].background,
        selector,
      );
      assert.equal(states[name].color, reference[name].color, selector);
      assert.deepEqual(states[name].padding, reference[name].padding, selector);
    }

    count++;
  }

  assert(
    count >= 4,
    'real Home covers platforms, experience, projects and repositories',
  );
  await inspectStructure(page);

  return count;
}

async function inspectStructure(page: Page): Promise<void> {
  const actual = await page.evaluate(
    (): {
      borders: boolean;
      nested: boolean;
      markers: boolean;
      overflow: boolean;
      categoryActions: boolean;
    } => {
      const lists = [
        ...document.querySelectorAll<HTMLElement>('.divided-list'),
      ];

      function inspectBordersEntry(list: HTMLElement): boolean {
        const style = getComputedStyle(list);

        return (
          parseFloat(style.borderTopWidth) === 1 &&
          parseFloat(style.borderBottomWidth) === 1 &&
          [
            ...list.children,
          ].every((child, index): boolean => {
            const itemStyle = getComputedStyle(child);

            return (
              parseFloat(itemStyle.borderTopWidth) === Number(index > 0) &&
              parseFloat(itemStyle.borderBottomWidth) === 0
            );
          })
        );
      }

      const borders = lists.every(inspectBordersEntry);

      const rows = [
        ...document.querySelectorAll<HTMLAnchorElement>('.action-row'),
      ];

      return {
        borders,
        nested: Boolean(
          document.querySelector<HTMLAnchorElement>(
            'a a, .editorial-description a, .editorial-metadata a',
          ),
        ),
        markers: rows.every((row): boolean => {
          return (
            row.querySelectorAll<HTMLElement>('.external-link-icon').length <= 1
          );
        }),
        overflow: document.documentElement.scrollWidth > innerWidth,
        categoryActions: Boolean(
          document.querySelector<HTMLAnchorElement>(
            '.category-summary a, .terminal-directory-entry > header a',
          ),
        ),
      };
    },
  );

  assert.deepEqual(actual, {
    borders: true,
    nested: false,
    markers: true,
    overflow: false,
    categoryActions: false,
  });
}

async function inspectClicks(page: Page): Promise<void> {
  const selectors = [
    '.action-row[data-link-id]',
    '[data-editorial-type="project"] .editorial-primary',
    '.editorial-details',
  ];

  for (const selector of selectors) {
    const row = await page.$(selector);

    if (row === null) {
      throw new Error('Missing required row');
    }

    await row.evaluate((element): void => {
      if (!(element instanceof HTMLAnchorElement)) {
        throw new Error('Expected HTMLAnchorElement: element');
      }

      window.listingClicks = [];
      element.addEventListener('click', (event): void => {
        event.preventDefault();
        event.stopPropagation();
        window.listingClicks.push(element.href);
      });
      element.scrollIntoView({
        block: 'center',
      });
    });

    const expected = await row.evaluate((element): string => {
      if (!(element instanceof HTMLAnchorElement)) {
        throw new Error('Expected HTMLAnchorElement: element');
      }

      return element.href;
    });

    const box = await row.boundingBox();

    if (box === null) {
      throw new Error('Missing required box');
    }

    await page.mouse.click(box.x + 2, box.y + box.height / 2);
    await page.click(`${selector} .action-row-title`);
    await page.click(`${selector} .external-link-icon`);
    assert.deepEqual(
      await page.evaluate((): string[] => {
        return window.listingClicks;
      }),
      [
        expected,
        expected,
        expected,
      ],
    );
    await row.focus();
    await page.keyboard.press('Enter');
    assert.equal(
      (
        await page.evaluate((): string[] => {
          return window.listingClicks;
        })
      ).length,
      4,
    );
  }

  await page.focus('.action-row[data-link-id]');
  await page.keyboard.press('Tab');
  assert.equal(
    await page.evaluate((): boolean => {
      const activeElement = document.activeElement;

      if (!activeElement) {
        return false;
      }

      return (
        activeElement.matches('.action-row:focus-visible') &&
        getComputedStyle(activeElement).outlineStyle === 'solid'
      );
    }),
    true,
  );
}

async function inspectTextZoom(page: Page): Promise<void> {
  await page.$eval('html', (root): void => {
    root.style.fontSize = '200%';
  });

  try {
    assert.equal(
      await page.$$eval('.action-row', (rows): boolean => {
        return rows.every((row): boolean => {
          return row.scrollWidth <= row.clientWidth + 1;
        });
      }),
      true,
      'action rows fit with text enlarged to 200%',
    );
  } finally {
    await page.$eval('html', (root): void => {
      root.style.removeProperty('font-size');
    });
  }
}

async function inspectInformativeRecord(
  page: Page,
  language: LinkDocument['language_options'][number],
): Promise<void> {
  const {
    informativeRecordFixture
  } = await import(
    '../../website/test/listing-fixtures.ts'
  );

  const interfaceName = await page.$eval('html', (root): string | undefined => {
    return root.dataset['interface'];
  });

  const html = await informativeRecordFixture(language.id, interfaceName);

  await page.$eval(
    'main',
    (main, source): void => {
      main.insertAdjacentHTML('beforeend', source);
    },
    html,
  );

  const element = await page.$('[data-editorial-id="test-information"]');

  assert.ok(element, 'Informational fixture must exist');

  assert.equal(await element.$('a'), null);
  await page.mouse.move(0, 0);

  const initial = await snapshot(element);

  await element.hover();
  assert.deepEqual(await snapshot(element), initial);
  await element.evaluate((node): void => {
    node.remove();
  });
}

async function inspectPassiveCard(page: Page): Promise<void> {
  const card = await page.$('.category-card');

  if (!card) {
    return;
  }

  await page.mouse.move(0, 0);

  const initial = await snapshot(card);

  await card.hover();
  assert.deepEqual(
    await snapshot(card),
    initial,
    'passive container does not react to hover',
  );
}

async function inspectFallbacks(input: {
  page: Page;
  baseURL: string;
  language: LinkDocument['language_options'][number];
  terminal: boolean;
}): Promise<void> {
  const {
    page,
    baseURL,
    language,
    terminal
  } = input;

  let prefix = language.path;

  if (terminal) {
    prefix += 'terminal/';
  }

  await page.goto(new URL(`${prefix}uses/`, baseURL).href, {
    waitUntil: 'networkidle0',
  });

  if (await page.$('[data-editorial-empty="uses"]')) {
    assert.equal(
      await page.$eval('.editorial-related', (element): string => {
        if (!(element instanceof HTMLAnchorElement)) {
          throw new Error('Expected HTMLAnchorElement: element');
        }

        return new URL(element.href).pathname;
      }),
      prefix,
    );
  } else {
    assert(await page.$('[data-editorial-section="uses"] .editorial-entry'));
  }

  await page.goto(new URL(`${prefix}writing/`, baseURL).href, {
    waitUntil: 'networkidle0',
  });

  if (await page.$('[data-editorial-empty="writing"]')) {
    const href = await page.$eval(
      '.editorial-related',
      (element): string | null => {
        return element.getAttribute('href');
      },
    );

    assert.equal(href, '#links-writing');
  }

  assert(await page.$('#links-writing'));
}

async function inspectRoute(inputValue: {
  browser: Browser;
  baseURL: string;
  language: LinkDocument['language_options'][number];
  terminal: boolean;
  directory: string;
}): Promise<number> {
  const {
    browser,
    baseURL,
    language,
    terminal,
    directory
  } = inputValue;

  const page = await createAuditPage(browser);

  try {
    await useBrowserLanguages(page, [
      language.hreflang,
    ]);

    let prefix = language.path;

    if (terminal) {
      prefix += 'terminal/';
    }

    await page.goto(new URL(prefix, baseURL).href, {
      waitUntil: 'networkidle0',
    });
    await page.evaluate((): Promise<FontFaceSet> => {
      return document.fonts.ready;
    });

    const session = await page.createCDPSession();

    await session.send('DOM.enable');
    await session.send('CSS.enable');

    let count = 0;

    for (const width of responsiveWidths) {
      await page.setViewport({
        width,
        height: 900,
      });

      for (const theme of [
        'light',
        'dark',
      ] as const) {
        count = await inspectThemeCase(count, theme, session);
      }
    }

    await inspectClicks(page);
    await inspectPassiveCard(page);
    await inspectInformativeRecord(page, language);
    await page.screenshot({
      path: resolve(directory, `${language.id}-${String(terminal)}-rows.png`),
    });
    await inspectFallbacks({
      page,
      baseURL,
      language,
      terminal,
    });
    await page.setJavaScriptEnabled(false);
    await page.goto(new URL(`${prefix}career/`, baseURL).href, {
      waitUntil: 'networkidle0',
    });
    assert(await page.$('.action-row[data-link-id]'));
    await inspectStructure(page);

    return count;
  } finally {
    await page.close();
  }

  async function inspectThemeCase(
    count: number,
    theme: string,
    session: CDPSession,
  ): Promise<number> {
    for (const view of [
      'compact',
      'detailed',
    ] as const) {
      count = await inspectViewCase(theme, view, {
        count,
        session,
      });
    }

    return count;
  }

  async function inspectViewCase(
    theme: string,
    view: string,
    input: {
      count: number;
      session: CDPSession;
    },
  ): Promise<number> {
    let {
      count
    } = input;

    const {
      session
    } = input;

    await applyLinkPresentation(page, theme, view);
    count += await inspectPresentation(page, session);
    await inspectTextZoom(page);

    return count;
  }
}

async function checkListingBrowser(
  browser: Browser,
  baseURL: string,
  reportDirectory: string,
): Promise<void> {
  const directory = resolve(reportDirectory, 'listing-contract');

  await mkdir(directory, {
    recursive: true,
  });

  const config = readConfiguration();

  let states = 0;

  for (const language of config.language_options) {
    for (const terminal of [
      false,
      true,
    ]) {
      states += await inspectRoute({
        browser,
        baseURL,
        language,
        terminal,
        directory,
      });
    }
  }

  await writeFile(
    resolve(directory, 'checks.json'),
    JSON.stringify({
      states,
      passed: true,
    }),
  );
  console.log(
    `Listing contract: ${String(states)} row presentations with hover, focus, press, geometry, clicks and fallback checks passed.`,
  );
}

export default checkListingBrowser;

if (import.meta.main) {
  withBrowser(async (browser: Browser): Promise<void> => {
    await checkListingBrowser(
      browser,
      textOr(process.env['QA_BASE_URL'], 'http://127.0.0.1:4173/'),
      textOr(process.env['QA_REPORT_DIR'], '.local/reports'),
    );
  })
    .catch((error: unknown): void => {
      console.error(error);
      process.exitCode = 1;
    });
}
