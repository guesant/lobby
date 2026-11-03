import type { validateFeed } from './federation-validation.ts';

export type TestFeed = {
  version: number;
  source: string;
  items: Record<string, unknown>[];
};

export type Feed = ReturnType<typeof validateFeed>;
