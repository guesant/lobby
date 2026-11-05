import { runBrowserAuditStage } from './run-browser-audit-stage.ts';
import { runCoreAudits } from './run-core-audits.ts';
import { runLighthouseAuditStage } from './run-lighthouse-audit-stage.ts';
import { runLinksAuditStage } from './run-links-audit-stage.ts';

export async function check(): Promise<void> {
  if (process.env['TOOLING_PROFILE'] !== 'audit') {
    throw new Error('Use the workspace-audit Docker target for just check');
  }

  const failures = await runCoreAudits();

  await runBrowserAuditStage();
  await runLighthouseAuditStage();
  await runLinksAuditStage();

  if (failures.length > 0) {
    throw new AggregateError(failures, 'Quality audit failed');
  }
}
