import type { ErrorLocale } from './lib/not-found.ts';
import type { PageLoadData } from './lib/site-data.ts';

declare global {
  namespace App {
    interface PageData extends Partial<PageLoadData> {
      errorPresentation?: ErrorLocale[];
    }
  }
}

export {};
