import assert from 'node:assert/strict';
import type { ElementHandle, Page } from 'puppeteer-core';

async function interactiveControl(page: Page): Promise<ElementHandle | null> {
  return (
    (await page.$('.link-button')) ??
    (await page.$('.header-navigation-links a'))
  );
}

export async function verifyDialogs(page: Page, path: string): Promise<void> {
  const control = await interactiveControl(page);

  assert(control);

  await control.evaluate((element): void => {
    element.scrollIntoView({
      block: 'center',
      behavior: 'instant',
    });
  });

  const before = await control.boundingBox();

  await control.hover();

  const hovered = await control.boundingBox();

  assert.deepEqual(hovered, before, 'hover must not displace controls');
  await page.mouse.down();
  assert.equal(
    await control.evaluate((element): string => {
      return getComputedStyle(element).transform;
    }),
    'none',
  );
  await page.mouse.move(0, 0);
  await page.mouse.up();
  await page.setViewport({
    width: 320,
    height: 640,
  });

  const headerBefore = await page.$eval(
    '.profile',
    (
      element,
    ): {
      left: number;
      width: number;
    } => {
      const {
        left,
        width
      } = element.getBoundingClientRect();

      return {
        left,
        width,
      };
    },
  );

  await page.click('[data-settings-open]');

  const settings = await page.$eval(
    'dialog#settings-dialog',
    (
      dialog,
    ): {
      open: boolean;
      fits: boolean;
      singleLanguageControl: boolean;
      noOverflow: boolean;
      controlsFit: boolean;
    } => {
      const rect = dialog.getBoundingClientRect();

      const languages = [
        ...dialog.querySelectorAll<HTMLSelectElement>('.language-select'),
      ];

      return {
        open: dialog.open,
        fits:
          rect.left >= 0 &&
          rect.right <= innerWidth &&
          rect.top >= 0 &&
          rect.bottom <= innerHeight,
        singleLanguageControl: languages.length === 1,
        noOverflow: dialog.scrollWidth <= dialog.clientWidth,
        controlsFit: [
          ...dialog.querySelectorAll<HTMLSelectElement>(
            '.toggle-button,.language-select',
          ),
        ].every((control): boolean => {
          return (
            control.scrollWidth <= control.clientWidth &&
            control.getBoundingClientRect().height >= 44
          );
        }),
      };
    },
  );

  assert(
    settings.open &&
      settings.fits &&
      settings.singleLanguageControl &&
      settings.noOverflow &&
      settings.controlsFit,
    JSON.stringify({
      path: path,
      ...settings,
    }),
  );
  assert.deepEqual(
    await page.$eval(
      '.profile',
      (
        element,
      ): {
        left: number;
        width: number;
      } => {
        const {
          left,
          width
        } = element.getBoundingClientRect();

        return {
          left,
          width,
        };
      },
    ),
    headerBefore,
    'Opening settings must not move the identity panel',
  );
  await page.keyboard.press('Escape');
  assert.equal(
    await page.$eval(':focus', (element): boolean => {
      return element.hasAttribute('data-settings-open');
    }),
    true,
  );
  await page.click('[data-credits-open]');

  const dialog = await page.$eval(
    'dialog#credits-dialog',
    (
      dialog,
    ): {
      open: boolean;
      top: number;
      bottom: number;
      height: number;
      scrolls: boolean;
    } => {
      const creditsDialogContent = dialog.querySelector<HTMLDialogElement>(
        '.credits-dialog-content',
      );

      if (creditsDialogContent === null) {
        throw new Error('Missing required creditsDialogContent');
      }

      return {
        open: dialog.open,
        top: dialog.getBoundingClientRect().top,
        bottom: dialog.getBoundingClientRect().bottom,
        height: innerHeight,
        scrolls: getComputedStyle(creditsDialogContent).overflowY === 'auto',
      };
    },
  );

  assert(
    dialog.open &&
      dialog.top >= 0 &&
      dialog.bottom <= dialog.height &&
      dialog.scrolls,
  );
  await page.keyboard.press('Escape');
  assert.equal(
    await page.$eval('dialog#credits-dialog', (dialog): boolean => {
      return dialog.open;
    }),
    false,
  );
}
