import type { BrowserContext, HTTPRequest } from 'puppeteer-core';
import assert from 'node:assert/strict';

type ControlGeometry = {
  box: {
    x: number;
    y: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
    width: number;
    height: number;
  };
  visibility: string;
};

function controlGeometry(element: Element): ControlGeometry {
  const box = element.getBoundingClientRect();

  return {
    box: {
      x: box.x,
      y: box.y,
      top: box.top,
      right: box.right,
      bottom: box.bottom,
      left: box.left,
      width: box.width,
      height: box.height,
    },
    visibility: getComputedStyle(element).visibility,
  };
}

export async function inspectControlReadiness(
  context: BrowserContext,
  baseURL: string,
  minecraft: boolean,
): Promise<void> {
  const page = await context.newPage();

  try {
    await page.setCacheEnabled(false);
    await page.setViewport({
      width: 1280,
      height: 900,
    });
    await page.setRequestInterception(true);

    const held: HTTPRequest[] = [];

    let released = false;

    page.on('request', (request): void => {
      if (
        !released &&
        request.resourceType() === 'script' &&
        request.url()
          .includes('/_app/')
      ) {
        held.push(request);

        return;
      }

      void request.continue();
    });

    const script = page.waitForRequest((request): boolean => {
      return (
        request.resourceType() === 'script' && request.url()
          .includes('/_app/')
      );
    });

    const resolveNavigation = (): '' | 'terminal/' => {
      if (minecraft) {
        return '';
      }

      return 'terminal/';
    };

    const navigation = page.goto(
      new URL(`pt-br/${resolveNavigation()}code/`, baseURL).href,
      {
        waitUntil: 'domcontentloaded',
      },
    );

    await script;

    await page.waitForSelector('.link-view-control');
    await page.evaluate((): Promise<FontFaceSet> => {
      return document.fonts.ready;
    });

    const initial = await page.$eval('.link-view-control', controlGeometry);

    assert(
      initial.box.height > 0,
      'uninitialized controls reserve their layout space',
    );
    assert.equal(initial.visibility, 'hidden');
    released = true;
    await Promise.all(
      held.map((request): Promise<void> => {
        return request.continue();
      }),
    );
    await navigation;
    await page.waitForFunction((): boolean => {
      return document.documentElement.dataset.linkViewReady === 'true';
    });

    const ready = await page.$eval('.link-view-control', controlGeometry);

    assert.deepEqual(
      ready.box,
      initial.box,
      'enabling controls must not move content',
    );
    assert.equal(ready.visibility, 'visible');
  } finally {
    await page.close();
  }
}
