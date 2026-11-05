import { runQuality } from './quality/run-quality.ts';

if (import.meta.main) {
  await runQuality();
}
