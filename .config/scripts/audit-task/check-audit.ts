import { checkFast } from '../fast-gates.ts';
import { runBrowserAuditStage } from './run-browser-audit-stage.ts';
import { runCoreAudits } from './run-core-audits.ts';
import { runLighthouseAuditStage } from './run-lighthouse-audit-stage.ts';

export async function check(): Promise<void> {
  if (process.env['TOOLING_PROFILE'] !== 'audit') {
    throw new Error('Use the workspace-audit Docker target for just check');
  }

  const failures: unknown[] = [];

  try {
    await checkFast();
  } catch (error) {
    failures.push(error);
  }

  const coreFailures = await runCoreAudits();

  failures.push(...coreFailures);

  await runBrowserAuditStage();
  await runLighthouseAuditStage();

  if (failures.length > 0) {
    throw new AggregateError(failures, 'Quality audit failed');
  }
}
