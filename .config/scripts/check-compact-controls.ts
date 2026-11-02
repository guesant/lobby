import { dialogIsOpen, inputIsChecked } from './browser-dom.ts';
import {
  applyAppearance,
  createBrowserAudit,
  responsiveWidths,
  useBrowserLanguages,
} from './browser-presentation.ts';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import type { Browser, Page } from 'puppeteer-core';

export default async function checkCompactControls(
  browser: Browser,
  baseURL: string,
  reportDirectory: string,
): Promise<void> {
  const {
    config,
    context,
    page,
    checks
  } = await createBrowserAudit(browser);

  try {
    await useBrowserLanguages(page);

    for (const language of config.language_options) {
      for (const suffix of [
        '',
        'career/',
      ] as const) {
        await inspectCompactPage({
          language,
          suffix,
          baseURL,
          page,
          checks,
        });
      }
    }

    await page.goto(new URL('pt-br/', baseURL).href, {
      waitUntil: 'networkidle2',
    });

    for (const width of [
      320,
      1024,
    ] as const) {
      await inspectControlViewport(width);
    }

    fs.writeFileSync(
      `${reportDirectory}/compact-controls.json`,
      JSON.stringify(
        {
          passed: checks.length,
          checks,
        },
        null,
        2,
      ),
    );
    console.log(
      JSON.stringify({
        compactControlsChecks: checks.length,
        failures: [],
      }),
    );
  } finally {
    await context.close();
  }

  async function inspectControlViewport(width: number): Promise<void> {
    await page.setViewport({
      width,
      height: 900,
    });

    for (const selector of [
      'label[for=link-view-compact]',
      'label[for=link-view-detailed]',
      '.site-footer-repository',
      '[data-credits-open]',
      '[data-settings-open]',
    ] as const) {
      await page.hover(selector);

      const tooltip = `${selector} .control-tooltip`;

      assert.equal(
        await page.$eval(tooltip, (element): string => {
          return getComputedStyle(element).visibility;
        }),
        'visible',
      );

      const rect = await page.$eval(
        tooltip,
        (
          element,
        ): {
          left: number;
          right: number;
        } => {
          const r = element.getBoundingClientRect();

          return {
            left: r.left,
            right: r.right,
          };
        },
      );

      assert(
        rect.left >= 0 && rect.right <= width,
        `${selector} tooltip at ${String(width)}`,
      );
      await page.hover(tooltip);
      assert.equal(
        await page.$eval(tooltip, (element): string => {
          return getComputedStyle(element).visibility;
        }),
        'visible',
      );
      await page.keyboard.press('Escape');
      assert.equal(
        await page.$eval(tooltip, (element): string => {
          return getComputedStyle(element).visibility;
        }),
        'hidden',
      );
      await page.mouse.move(0, 0);

      function resolveFocus(): string {
        if (selector.startsWith('label')) {
          if (selector.includes('detailed')) {
            return '#link-view-detailed';
          }

          return '#link-view-compact';
        }

        return selector;
      }

      const focus = resolveFocus();

      await page.focus(focus);
      await page.keyboard.press('Tab');
      await page.keyboard.down('Shift');
      await page.keyboard.press('Tab');
      await page.keyboard.up('Shift');

      if (!selector.startsWith('label')) {
        assert.equal(
          await page.$eval(tooltip, (element): string => {
            return getComputedStyle(element).visibility;
          }),
          'visible',
        );
      }
    }

    await page.click('[data-credits-open]');
    assert.equal(await page.$eval('#credits-dialog', dialogIsOpen), true);
    await page.keyboard.press('Escape');
    await page.click('[data-settings-open]');
    assert.equal(await page.$eval('#settings-dialog', dialogIsOpen), true);
    await page.keyboard.press('Escape');
    await page.focus('#link-view-compact');
    await page.keyboard.press('ArrowRight');
    assert.equal(
      await page.$eval(
        'label[for=link-view-detailed] .control-tooltip',
        (element): string => {
          return getComputedStyle(element).visibility;
        },
      ),
      'visible',
      `Detailed view tooltip must reopen on keyboard focus at ${String(width)}`,
    );
    assert.equal(await page.$eval('#link-view-detailed', inputIsChecked), true);
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.$eval('#link-view-compact', inputIsChecked), true);
    await page.evaluate((): void => {
      document.documentElement.dataset['theme'] = 'dark';
    });
    await page.mouse.move(0, 0);
    await page.$eval('body', (element): void => {
      element.tabIndex = -1;
      element.focus();
    });

    for (const selector of [
      '.link-view-control',
      '.site-footer',
    ] as const) {
      const element = await page.$(selector);

      if (element === null) {
        throw new Error('Missing required element');
      }

      await element.screenshot({
        path: `${reportDirectory}/compact-${selector.slice(1)}-${String(width)}.png`,
      });
    }
  }
}

async function inspectCompactPage(input: {
  language: {
    id: string;
    path: string;
    label: string;
    hreflang: string;
  };
  suffix: string;
  baseURL: string;
  page: Page;
  checks: Record<string, unknown>[];
}): Promise<void> {
  const {
    language,
    suffix,
    baseURL,
    page,
    checks
  } = input;

  const url = new URL(`${language.path}${suffix}`.replace(/^\//, ''), baseURL)
    .href;

  await page.goto(url, {
    waitUntil: 'networkidle2',
  });

  for (const theme of [
    'dark',
    'light',
  ] as const) {
    await applyAppearance(page, theme);

    for (const width of responsiveWidths) {
      await inspectCompactViewport({
        page,
        width,
        url,
        theme,
        checks,
        language,
        suffix,
      });
    }
  }

  await page.setViewport({
    width: 320,
    height: 900,
  });
  await page.evaluate((): void => {
    document.documentElement.style.fontSize = '200%';
  });

  for (const selector of [
    'label[for=link-view-compact]',
    'label[for=link-view-detailed]',
    '.site-footer-repository',
    '[data-credits-open]',
    '[data-settings-open]',
  ] as const) {
    await page.hover(selector);
    assert.equal(
      await page.$eval(`${selector} .control-tooltip`, (element): boolean => {
        const rect = element.getBoundingClientRect();

        return (
          rect.left >= 0 &&
          rect.right <= innerWidth &&
          element.scrollWidth <= element.clientWidth
        );
      }),
      true,
      `${language.id} ${selector} enlarged tooltip`,
    );
  }

  await page.evaluate((): void => {
    document.documentElement.style.removeProperty('font-size');
  });
}

async function inspectCompactViewport(input: {
  page: Page;
  width: number;
  url: string;
  theme: string;
  checks: Record<string, unknown>[];
  language: {
    id: string;
    path: string;
    label: string;
    hreflang: string;
  };
  suffix: string;
}): Promise<void> {
  const {
    page,
    width,
    url,
    theme,
    checks,
    language,
    suffix
  } = input;

  await page.setViewport({
    width,
    height: 900,
  });

  const actual = await page.evaluate(
    (): {
      count: number;
      centered: boolean;
      rightAligned: boolean;
      symmetricPadding: boolean;
      intrinsicGroup: boolean;
      squareTargets: boolean;
      iconOnly: boolean;
      metadataSeparate: boolean;
      named: boolean;
      overflow: boolean;
      compactHeight: boolean;
    } => {
      const siteFooter = window.lobbyAssertions.element(
        document,
        '.site-footer',
      );

      const footer = siteFooter.getBoundingClientRect();

      const siteFooterContent = window.lobbyAssertions.element(
        document,
        '.site-footer-content',
      );

      const group = siteFooterContent.getBoundingClientRect();

      const buttons = [
        ...document.querySelectorAll<HTMLElement>('.site-footer-content > *'),
      ];

      const linkViewToolbar = window.lobbyAssertions.element(
        document,
        '.link-view-toolbar',
      );

      const toolbar = linkViewToolbar.getBoundingClientRect();

      const linkViewOptions = window.lobbyAssertions.element(
        document,
        '.link-view-options',
      );

      const options = linkViewOptions.getBoundingClientRect();

      const linkViewToolbarValue = window.lobbyAssertions.element(
        document,
        '.link-view-toolbar',
      );

      const toolbarStyle = getComputedStyle(linkViewToolbarValue);

      const controls = [
        ...document.querySelectorAll<HTMLElement>('.icon-control'),
      ];

      const size =
        parseFloat(
          getComputedStyle(document.documentElement)
            .getPropertyValue(
              '--control-min-height',
            ),
        ) * parseFloat(getComputedStyle(document.documentElement).fontSize);

      function resolveSymmetricPadding(): boolean {
        if (
          document.querySelector<HTMLElement>(
            '.page-content > .link-view-control',
          )
        ) {
          return parseFloat(toolbarStyle.paddingLeft) > 0;
        }

        return parseFloat(toolbarStyle.paddingLeft) === 0;
      }

      function inspectIconOnlyEntry(control: HTMLElement): boolean {
        return [
          ...control.childNodes,
        ]
          .filter((node): boolean => {
            return node.nodeType === Node.TEXT_NODE;
          })
          .every((node): boolean => {
            const textContentValue = node.textContent;

            if (textContentValue === null) {
              throw new Error('Missing required textContentValue');
            }

            return !textContentValue.trim();
          });
      }

      return {
        count: buttons.length,
        centered:
          Math.abs(
            footer.left + footer.width / 2 - group.left - group.width / 2,
          ) < 1,
        rightAligned:
          Math.abs(
            options.right -
              toolbar.right +
              parseFloat(toolbarStyle.paddingRight) +
              parseFloat(toolbarStyle.borderRightWidth),
          ) < 1,
        symmetricPadding:
          resolveSymmetricPadding() &&
          toolbarStyle.paddingLeft === toolbarStyle.paddingRight,
        intrinsicGroup: group.width < footer.width,
        squareTargets: controls.every((control): boolean => {
          return (
            Math.abs(control.offsetWidth - size) < 1 &&
            Math.abs(control.offsetHeight - size) < 1
          );
        }),
        iconOnly: controls.every(inspectIconOnlyEntry),
        metadataSeparate:
          !document.querySelector<HTMLAnchorElement>(
            '.site-footer-content .site-footer-commit,.site-footer-content .site-footer-build',
          ) &&
          Boolean(
            document.querySelector<HTMLElement>(
              '.site-footer-meta .site-footer-commit',
            ),
          ) &&
          Boolean(
            document.querySelector<HTMLAnchorElement>(
              '.site-footer-meta a.site-footer-build',
            ),
          ),
        named:
          buttons.every((button): boolean => {
            return Boolean(button.getAttribute('aria-label'));
          }) &&
          [
            ...document.querySelectorAll<HTMLElement>(
              '.link-view-options label',
            ),
          ].every((label): boolean => {
            const visuallyHidden = window.lobbyAssertions.element(
              label,
              '.visually-hidden',
            );

            return Boolean(visuallyHidden.textContent.trim());
          }),
        overflow: document.documentElement.scrollWidth > innerWidth,
        compactHeight: toolbar.height < size * 1.5,
      };
    },
  );

  assert.equal(actual.count, 5);
  assert.equal(
    actual.overflow,
    false,
    `${url} ${theme} ${String(width)} overflow`,
  );

  for (const [
    key,
    value,
  ] of Object.entries(actual)) {
    if (
      ![
        'count',
        'overflow',
      ].includes(key)
    ) {
      assert.equal(value, true, `${url} ${theme} ${String(width)} ${key}`);
    }
  }

  checks.push({
    language: language.id,
    suffix,
    theme,
    width,
  });
}
