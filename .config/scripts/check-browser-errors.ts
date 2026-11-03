import type { BrowserError } from './check-browser-errors.types.ts';
import assert from 'node:assert/strict';
import type { Browser, Page, Target } from 'puppeteer-core';

function browserError(page: Page, error: unknown): BrowserError {
  if (error instanceof Error) {
    return {
      url: page.url(),
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    url: page.url(),
    message: String(error),
    stack: undefined,
  };
}

export default async function withBrowserErrors(
  browser: Browser,
  task: () => Promise<void>,
): Promise<void> {
  const errors: BrowserError[] = [];

  const observed = new Map<Page, (error: unknown) => void>();

  async function observe(target: Target): Promise<void> {
    const candidate = await target.page();

    if (!candidate) {
      return;
    }

    const page = candidate;

    function listener(error: unknown): void {
      errors.push(browserError(page, error));
    }

    observed.set(page, listener);
    page.on('pageerror', listener);
  }

  function observer(target: Target): void {
    void observe(target);
  }

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
      {
        cause: error,
      },
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
