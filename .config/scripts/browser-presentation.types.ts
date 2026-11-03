import type { readConfiguration } from './configuration.ts';
import type { BrowserContext, Page } from 'puppeteer-core';

export type BrowserAudit = {
  context: BrowserContext;
  page: Page;
  config: ReturnType<typeof readConfiguration>;
  checks: Record<string, unknown>[];
  errors: string[];
};
