import { runQuality } from './quality/run-quality.ts';

export { canonicalFormat } from './quality/canonical-format.ts';

if (import.meta.main) {
  await runQuality();
}
