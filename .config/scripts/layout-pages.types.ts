import type { validateStatistics } from '../../website/src/lib/features/content/statistics.validation.ts';
import type { readConfiguration } from './configuration.ts';

export type LayoutContext = {
  config: ReturnType<typeof readConfiguration>;
  href: (path: string) => string;
  checks: Record<string, unknown>[];
  snapshots: ReturnType<typeof validateStatistics>;
  reportDirectory: string;
};
