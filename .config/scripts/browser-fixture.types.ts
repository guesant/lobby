import type { Page } from 'puppeteer-core';

export type PageFactory = {
  newPage(): Promise<Page>;
};
