import { runBaseline } from './lighthouse-baseline/run-baseline.ts';

if (import.meta.main) {
  await runBaseline();
}
