import { inputIsChecked } from './browser-dom.ts';
import { createAuditPage } from './browser-fixture.ts';
import { readConfiguration } from './configuration.ts';
import assert from 'node:assert/strict';
import type { Browser, Page } from 'puppeteer-core';

async function inspectNativeAssets(page: Page): Promise<void> {
  const assets = await page.evaluate(
    (): {
      fonts: string[];
      sprite: string;
    } => {
      return {
        fonts: [
          ...document.querySelectorAll<HTMLLinkElement>(
            'link[rel="preload"][as="font"]',
          ),
        ].map((font): string => {
          return font.href;
        }),
        sprite: getComputedStyle(document.documentElement)
          .getPropertyValue(
            '--icon-sprite',
          ),
      };
    },
  );

  assert.equal(assets.fonts.length, 2);

  for (const font of assets.fonts) {
    assert.match(
      new URL(font).pathname,
      /^\/_app\/immutable\/assets\/.+\.woff2$/,
    );

    const response = await fetch(font);

    await response.arrayBuffer();

    assert.equal(response.ok, true);
  }

  assert.match(
    assets.sprite,
    /\/_app\/immutable\/assets\/pixel-compact[.-][\w-]+\.webp/,
  );
}

async function inspectSearch(page: Page): Promise<void> {
  await page.keyboard.down('Control');
  await page.keyboard.press('k');
  await page.keyboard.up('Control');
  await page.waitForSelector('#search-query');
  await page.type('#search-query', 'GitHub');
  await page.waitForFunction((): boolean => {
    return document.querySelectorAll('#search-results a').length > 0;
  });
  await page.select('[data-search-filter="source"]', 'lobby');
  await page.click('#search-dialog .dialog-close');
  await page.waitForSelector('#search-dialog', {
    hidden: true,
  });
  await page.click('[data-search-open]');
  await page.waitForSelector('#search-query', {
    visible: true,
  });
  assert.equal(
    await page.$eval('[data-search-filter="source"]', (element): string => {
      if (!(element instanceof HTMLSelectElement)) {
        throw new Error('Expected search filter');
      }

      return element.value;
    }),
    '',
  );
  await page.keyboard.press('Escape');
}

async function inspectSoundPreference(page: Page): Promise<void> {
  await page.click('[data-settings-open]');
  await page.waitForSelector('#settings-dialog', {
    visible: true,
  });
  await page.click('label[for="sound-off"]');
  assert.equal(
    await page.evaluate((): string | null => {
      return localStorage.getItem('guesant-links-sound');
    }),
    'off',
  );
  await page.click('#settings-dialog [data-dialog-close]');
  await page.reload({
    waitUntil: 'networkidle2',
  });
  assert.equal(
    await page.$eval('html', (root): string | undefined => {
      return root.dataset['sound'];
    }),
    'off',
  );
  await page.click('[data-settings-open]');
  await page.waitForSelector('#settings-dialog', {
    visible: true,
  });
  assert.equal(await page.$eval('#sound-off', inputIsChecked), true);
  await page.click('#settings-dialog [data-dialog-close]');
}

async function inspectStaticErrors(
  browser: Browser,
  base: string,
): Promise<void> {
  const context = await browser.createBrowserContext();

  try {
    const page = await createAuditPage(context);

    await page.setJavaScriptEnabled(false);
    await page.goto(new URL('404.html', base).href, {
      waitUntil: 'networkidle2',
    });
    assert.equal(
      await page.$$eval('.not-found section[lang]', (sections): number => {
        return sections.length;
      }),
      6,
    );
    assert.equal(
      await page.$$eval('.not-found nav a', (links): number => {
        return links.length;
      }),
      6,
    );
    assert.equal(
      (await page.$('meta[name="robots"][content="noindex, follow"]')) !== null,
      true,
    );
    assert.equal(await page.$('.world-scene, .site-frame'), null);

    const body = await page.$eval('body', (element): string => {
      return element.className;
    });

    assert.equal(body, 'error-interface');
  } finally {
    await context.close();
  }
}

export default async function checkNativeRuntime(
  browser: Browser,
  base: string,
): Promise<void> {
  const context = await browser.createBrowserContext();

  try {
    const page = await createAuditPage(context);

    await page.goto(new URL('pt-br/', base).href, {
      waitUntil: 'networkidle2',
    });
    await inspectNativeAssets(page);
    await inspectSearch(page);
    await inspectSoundPreference(page);

    const configuration = readConfiguration();

    for (const language of configuration.language_options) {
      await page.goto(new URL(language.path.slice(1), base).href, {
        waitUntil: 'networkidle2',
      });
      assert.equal(
        await page.$eval('html', (root): string => {
          return root.lang;
        }),
        configuration.locales[language.id]?.ui.html_lang,
      );
    }

    await inspectStaticErrors(browser, base);
  } finally {
    await context.close();
  }
}
