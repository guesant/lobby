import type {
  Page,
  BrowserContext,
  Browser,
  HTTPRequest,
} from 'puppeteer-core';
import assert from 'node:assert/strict';

async function waitForLandscape(
  page: Page,
  previewFailed = false,
): Promise<void> {
  await page.evaluate((): Promise<unknown> => {
    return new Promise((accept): void => {
      requestAnimationFrame((): void => {
        requestAnimationFrame(accept);
      });
    });
  });

  try {
    await page.waitForFunction(
      (previewFailed): boolean | '' | undefined => {
        const root = document.documentElement;

        const landscape =
          document.querySelector<HTMLElement>('.world-landscape')!;

        const preview = document.querySelector<HTMLElement>(
          '.world-landscape-preview',
        )!;

        if (!landscape || !preview) {
          return false;
        }

        const expected = getComputedStyle(root)
          .getPropertyValue('--landscape-image')
          .match(/url\(["']?(.*?)["']?\)/)?.[1];

        const finalStyle = getComputedStyle(landscape);

        const resolveReady = (): string | undefined => {
          if (previewFailed) {
            return root.dataset.landscapePreviewFailed;
          }

          return root.dataset.landscapeReady;
        };

        const ready = resolveReady();

        return (
          ready === 'true' &&
          expected &&
          finalStyle.backgroundImage.includes(
            new URL(expected, location.href).href,
          ) &&
          Number(finalStyle.opacity) === 1 &&
          Number(getComputedStyle(preview).opacity) === 0
        );
      },
      {
        timeout: 10000,
      },
      previewFailed,
    );
  } catch (error) {
    const state = await page.evaluate(
      (): {
        url: string;
        width: number;
        state: {
          [name: string]: string | undefined;
        };
        expected: string;
        final: {
          inline: string;
          image: string;
          opacity: string;
        };
        preview: {
          image: string;
          opacity: string;
        };
      } => {
        const final = document.querySelector<HTMLElement>('.world-landscape')!;

        const preview = document.querySelector<HTMLElement>(
          '.world-landscape-preview',
        )!;

        return {
          url: location.href,
          width: innerWidth,
          state: {
            ...document.documentElement.dataset,
          },
          expected: getComputedStyle(document.documentElement)
            .getPropertyValue(
              '--landscape-image',
            ),
          final: final && {
            inline: final.style.backgroundImage,
            image: getComputedStyle(final).backgroundImage,
            opacity: getComputedStyle(final).opacity,
          },
          preview: preview && {
            image: getComputedStyle(preview).backgroundImage,
            opacity: getComputedStyle(preview).opacity,
          },
        };
      },
    );

    throw new Error(`Scene did not settle: ${JSON.stringify(state)}`, {
      cause: error,
    });
  }
}

async function createScenePage(
  context: BrowserContext,
  baseURL: string,
  {
    failure,
    hold = false,
    reduced = false,
    javascript = true,
  }: {
    failure?: string;
    hold?: boolean;
    reduced?: boolean;
    javascript?: boolean;
  } = {},
): Promise<{
  page: Page;
  held: Promise<void> | Promise<HTTPRequest>;
  release: () => Promise<void>;
  settle: () => Promise<void>;
}> {
  const page = await context.newPage();

  await page.setCacheEnabled(false);

  const requests: HTTPRequest[] = [];

  let holding = hold;

  const resolveHeld = (): Promise<void> | Promise<HTTPRequest> => {
    if (hold) {
      return page.waitForRequest(
        (request): boolean => {
          return request.url()
            .endsWith('/night-mobile.webp');
        },
        {
          timeout: 10000,
        },
      );
    }

    return Promise.resolve();
  };

  const held = resolveHeld();

  await page.setViewport({
    width: 390,
    height: 900,
  });

  const resolveValue = (): 'reduce' | 'no-preference' => {
    if (reduced) {
      return 'reduce';
    }

    return 'no-preference';
  };

  await page.emulateMediaFeatures([
    {
      name: 'prefers-color-scheme',
      value: 'dark',
    },
    {
      name: 'prefers-reduced-motion',
      value: resolveValue(),
    },
  ]);
  await page.setJavaScriptEnabled(javascript);
  await page.setRequestInterception(true);

  const pending = new Set<Promise<void>>();

  const failures: unknown[] = [];

  const handleRequest = async (request: HTTPRequest): Promise<void> => {
    const path = new URL(request.url()).pathname;

    if (failure && path.endsWith(failure)) {
      return request.abort();
    }

    if (holding && path.endsWith('/night-mobile.webp')) {
      requests.push(request);

      return;
    }

    return request.continue();
  };

  page.on('request', (request): void => {
    const completion = handleRequest(request)
      .catch((error: unknown): void => {
        failures.push(error);
      })
      .finally((): void => {
        pending.delete(completion);
      });

    pending.add(completion);
  });
  await page.goto(new URL('pt-br/', baseURL).href, {
    waitUntil: 'domcontentloaded',
  });

  return {
    page,
    held,
    settle: async (): Promise<void> => {
      await Promise.all(pending);
      assert.deepEqual(failures, [], 'request interception must succeed');
    },
    release: async (): Promise<void> => {
      holding = false;
      await Promise.all(
        requests.splice(0)
          .map((request): Promise<void> => {
            return request.continue();
          }),
      );
    },
  };
}

async function profileBounds(page: Page): Promise<{
  width: number;
  height: number;
  top: number;
  left: number;
}> {
  return page.$eval(
    '.profile',
    (
      element,
    ): {
      width: number;
      height: number;
      top: number;
      left: number;
    } => {
      const bounds = element.getBoundingClientRect();

      return {
        width: bounds.width,
        height: bounds.height,
        top: bounds.top,
        left: bounds.left,
      };
    },
  );
}

async function previewBounds(page: Page): Promise<{
  width: number;
  height: number;
  top: number;
  left: number;
}> {
  await page.waitForFunction((): boolean => {
    const preview = document.querySelector<HTMLElement>(
      '.world-landscape-preview',
    )!;

    const final = document.querySelector<HTMLElement>('.world-landscape')!;

    return (
      getComputedStyle(preview).opacity === '1' &&
      getComputedStyle(final).backgroundImage === 'none'
    );
  });

  return profileBounds(page);
}

async function checkTransition(
  context: BrowserContext,
  baseURL: string,
): Promise<void> {
  const {
    page,
    release,
    held,
    settle
  } = await createScenePage(
    context,
    baseURL,
    {
      hold: true,
    },
  );

  try {
    await held;
    await page.evaluate((): Promise<FontFaceSet> => {
      return document.fonts.ready;
    });

    const before = await previewBounds(page);

    await release();
    await waitForLandscape(page);

    const after = await profileBounds(page);

    assert.deepEqual(after, before, 'progressive images do not shift content');
    await page.setViewport({
      width: 1024,
      height: 900,
    });
    await waitForLandscape(page);
    assert.match(
      await page.$eval('.world-landscape', (element): string => {
        return getComputedStyle(element).backgroundImage;
      }),
      /night-desktop\.webp/,
    );
  } finally {
    await page.close();
    await settle();
  }
}

async function checkThemeRace(
  context: BrowserContext,
  baseURL: string,
): Promise<void> {
  const {
    page,
    release,
    held,
    settle
  } = await createScenePage(
    context,
    baseURL,
    {
      hold: true,
    },
  );

  try {
    await held;
    await previewBounds(page);
    await page.evaluate((): void => {
      document.documentElement.dataset.theme = 'light';
    });
    await waitForLandscape(page);
    await release();
    await page.waitForNetworkIdle({
      idleTime: 100,
    });
    await waitForLandscape(page);
    assert.match(
      await page.$eval('.world-landscape', (element): string => {
        return getComputedStyle(element).backgroundImage;
      }),
      /day-mobile\.webp/,
    );
  } finally {
    await page.close();
    await settle();
  }
}

async function checkFailure(
  context: BrowserContext,
  baseURL: string,
  previewFails: boolean,
): Promise<void> {
  const resolveFailure = ():
    | '/night-mobile.webp'
    | '/night-mobile-preview.webp' => {
    if (previewFails) {
      return '/night-mobile-preview.webp';
    }

    return '/night-mobile.webp';
  };

  const failure = resolveFailure();

  const {
    page,
    settle
  } = await createScenePage(context, baseURL, {
    failure,
  });

  try {
    await page.waitForNetworkIdle({
      idleTime: 100,
    });

    if (previewFails) {
      await waitForLandscape(page, true);
      await page.evaluate(async (): Promise<void> => {
        const image = new Image();

        image.src = '/assets/generated/night-mobile.webp';
        await image.decode();
      });
    } else {
      await previewBounds(page);
      assert.equal(
        await page.$eval('html', (element): boolean => {
          return element.hasAttribute('data-landscape-ready');
        }),
        false,
        'failed full image keeps the preview visible',
      );
    }
  } finally {
    await page.close();
    await settle();
  }
}

async function checkFallbacks(
  context: BrowserContext,
  baseURL: string,
): Promise<void> {
  const reduced = await createScenePage(context, baseURL, {
    reduced: true,
  });

  try {
    await waitForLandscape(reduced.page);
    assert.equal(
      await reduced.page.$eval('.world-landscape', (element): string => {
        return getComputedStyle(element).transitionDuration;
      }),
      '0s',
    );
  } finally {
    await reduced.page.close();
    await reduced.settle();
  }

  const native = await createScenePage(context, baseURL, {
    javascript: false,
  });

  try {
    await native.page.waitForNetworkIdle({
      idleTime: 100,
    });

    const state = await native.page.$eval(
      '.world-landscape',
      (
        element,
      ): {
        image: string;
        opacity: string;
      } => {
        return {
          image: getComputedStyle(element).backgroundImage,
          opacity: getComputedStyle(element).opacity,
        };
      },
    );

    assert.match(state.image, /night-mobile\.webp/);
    assert.equal(state.opacity, '1');
  } finally {
    await native.page.close();
    await native.settle();
  }
}

async function checkProgressiveScene(
  browser: Browser,
  baseURL: string,
): Promise<void> {
  const context = await browser.createBrowserContext();

  try {
    await checkTransition(context, baseURL);
    await checkThemeRace(context, baseURL);
    await checkFailure(context, baseURL, true);
    await checkFailure(context, baseURL, false);
    await checkFallbacks(context, baseURL);
    console.log(
      'Progressive scenery: transition, resize, theme race, failures, reduced motion and no-JavaScript fallback passed.',
    );
  } finally {
    await context.close();
  }
}

export { waitForLandscape, checkProgressiveScene };
