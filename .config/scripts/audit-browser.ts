import type { Browser, Page } from 'puppeteer-core';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import {
  array,
  record,
  requiredText,
} from '../../website/src/lib/validation-primitives.ts';

type AccessibilityOptions = {
  browser: Browser;
  page: Page;
  ignoreUrl: boolean;
  runners: string[];
  standard: string;
  levelCapWhenNeedsReview: string;
  viewport: {
    width: number;
    height: number;
  };
};

export async function pa11y(
  url: string,
  options: AccessibilityOptions,
): Promise<{
  issues: Array<
    Record<string, unknown> & {
      type: string;
    }
  >;
}> {
  const imported: unknown = await import(
    pathToFileURL(
      createRequire(resolve('.config/audit/package.json'))
        .resolve('pa11y'),
    ).href
  );

  const method = record(imported, 'Pa11y module').default;

  if (typeof method !== 'function') {
    throw new Error('Missing Pa11y audit function');
  }

  const value: unknown = await Reflect.apply(method, undefined, [
    url,
    options,
  ]);

  const result = record(value, 'Pa11y result');

  return {
    issues: array(result.issues, 'Pa11y issues')
      .map(
        (
          value,
        ): Record<string, unknown> & {
          type: string;
        } => {
          const issue = record(value, 'Pa11y issue');

          return {
            ...issue,
            type: requiredText(issue.type, 'Pa11y issue type'),
          };
        },
      ),
  };
}
