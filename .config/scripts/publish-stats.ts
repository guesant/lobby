import { main } from './publish-stats/main.ts';

export { publishStatistics } from './publish-stats/publish-statistics.ts';

if (import.meta.main) {
  await main();
}
