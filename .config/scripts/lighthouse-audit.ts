import { runAudit } from './lighthouse-audit/run-audit.ts';

export { assertLighthouse } from './lighthouse-audit/assert-lighthouse.ts';
export { lighthouseResult } from './lighthouse-audit/lighthouse-result.ts';
export { lighthouseThresholds } from './lighthouse-audit/lighthouse-thresholds.ts';
export { runLighthouse } from './lighthouse-audit/run-lighthouse.ts';

if (import.meta.main) {
  await runAudit();
}
