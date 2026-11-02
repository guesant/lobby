import { main } from './publish-stats/main.ts';

export { publishStatistics } from './publish-stats/publish-statistics.ts';
export type {
  PublicationOptions,
  PublicationResult,
} from './publish-stats/publish-stats.types.ts';

if (import.meta.main) {
  await main();
}
