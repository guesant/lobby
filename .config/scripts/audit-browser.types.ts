import type { Browser, Page } from 'puppeteer-core';

export type AccessibilityOptions = {
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
