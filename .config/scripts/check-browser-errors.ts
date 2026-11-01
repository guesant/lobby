import assert from 'node:assert/strict';
import type { Browser, Page, Target } from 'puppeteer-core';

export default async function withBrowserErrors(
  browser: Browser,
  task: () => Promise<void>,
): Promise<void> {
  const errors: Array<{
    url: string;
    message: string;
    stack: string | undefined;
  }> = [];

  const observed = new Map<Page, (error: unknown) => void>();

  const observe = async (target: Target): Promise<void> => {
    const page = await target.page();

    if (!page) {
      return;
    }

    const listener = (error: unknown): void => {
      if (!(error instanceof Error)) {
        errors.push({
          url: page.url(),
          message: String(error),
          stack: undefined,
        });

        return;
      }

      errors.push({
        url: page.url(),
        message: error.message,
        stack: error.stack,
      });
    };

    observed.set(page, listener);
    page.on('pageerror', listener);
  };

  const observer = (target: Target): void => {
    void observe(target);
  };

  browser.on('targetcreated', observer);

  try {
    await task();
  } catch (error) {
    throw new AggregateError(
      [
        error,
        ...errors,
      ],
      'Browser scenario failed',
    );
  } finally {
    browser.off('targetcreated', observer);

    for (const [
      page,
      listener,
    ] of observed) {
      page.off('pageerror', listener);
    }
  }

  assert.deepEqual(errors, [], 'No uncaught errors during browser scenarios');
}
