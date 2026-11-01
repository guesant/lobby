import puppeteer, { type LaunchOptions, type Viewport } from 'puppeteer-core';

export type AccessibilityAudit = {
  url: string;
  actions?: string[];
  rootElement?: string;
  viewport?: Viewport;
};

export type AccessibilityDefaults = {
  chromeLaunchConfig: LaunchOptions;
  viewport: Viewport;
};

export default async function accessibilityViewports(
  audits: AccessibilityAudit[],
  defaults: AccessibilityDefaults,
): Promise<void> {
  const browser = await puppeteer.launch(defaults.chromeLaunchConfig);

  const heights = new Map<string, number>();

  try {
    const page = await browser.newPage();

    await page.setViewport(defaults.viewport);

    for (const audit of audits) {
      const resolveView = (): 'detailed' | 'compact' => {
        if (
          audit.actions?.includes(
            'click element label[for="link-view-detailed"]',
          )
        ) {
          return 'detailed';
        }

        return 'compact';
      };

      const view = resolveView();

      const key = `${audit.url}:${view}`;

      if (!heights.has(key)) {
        await page.goto(audit.url, {
          waitUntil: 'networkidle2',
        });
        await page.evaluate((view): void => {
          document.documentElement.dataset.linkView = view;
        }, view);
        await page.evaluate((): Promise<FontFaceSet> => {
          return document.fonts.ready;
        });
        heights.set(
          key,
          await page.evaluate((): number => {
            return document.documentElement.scrollHeight;
          }),
        );
      }

      audit.viewport = {
        ...defaults.viewport,
        height: Math.max(
          defaults.viewport.height,
          heights.get(key) ?? defaults.viewport.height,
        ),
      };
    }
  } finally {
    await browser.close();
  }
}
