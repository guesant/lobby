import type { PageLoadData } from './lib/features/content/content.types.ts';
import type { ErrorLocale } from '#lib/features/navigation/not-found.model.ts';

declare global {
  namespace App {
    interface PageData extends Partial<PageLoadData> {
      errorPresentation?: ErrorLocale[];
    }
  }
}

export {};
