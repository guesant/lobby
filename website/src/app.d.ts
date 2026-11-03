import type { PageLoadData } from './lib/features/content/content.types.ts';
import type { ErrorLocale } from '#lib/features/navigation/not-found.types.ts';

declare global {
  interface ImportMetaEnv {
    readonly VITE_GA_MEASUREMENT_ID?: string;
  }

  namespace App {
    interface PageData extends Partial<PageLoadData> {
      errorPresentation?: ErrorLocale[];
    }
  }
}

export {};
