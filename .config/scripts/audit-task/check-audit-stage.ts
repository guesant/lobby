import { runBrowserAuditStage } from './run-browser-audit-stage.ts';
import { runCoreAuditStage } from './run-core-audit-stage.ts';
import { runLighthouseAuditStage } from './run-lighthouse-audit-stage.ts';

export async function checkAuditStage(): Promise<void> {
  if (process.env['TOOLING_PROFILE'] !== 'audit') {
    throw new Error('Use the workspace-audit Docker target for audit stages');
  }

  const stage = process.env['AUDIT_STAGE'];

  switch (stage) {
    case 'core':
      return runCoreAuditStage();

    case 'browser':
      return runBrowserAuditStage();

    case 'lighthouse':
      return runLighthouseAuditStage();

    default:
      throw new Error(`Unknown audit stage: ${stage ?? 'missing'}`);
  }
}
