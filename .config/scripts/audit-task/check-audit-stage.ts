import type { AuditStage } from './audit-stage.types.ts';
import { runBrowserAuditStage } from './run-browser-audit-stage.ts';
import { runCoreAuditStage } from './run-core-audit-stage.ts';
import { runLighthouseAuditStage } from './run-lighthouse-audit-stage.ts';
import { runLinksAuditStage } from './run-links-audit-stage.ts';

const stages: Record<AuditStage, () => Promise<void>> = {
  core: runCoreAuditStage,
  browser: runBrowserAuditStage,
  lighthouse: runLighthouseAuditStage,
  links: runLinksAuditStage,
};

export async function checkAuditStage(): Promise<void> {
  if (process.env['TOOLING_PROFILE'] !== 'audit') {
    throw new Error('Use the workspace-audit Docker target for audit stages');
  }

  const stage = process.env['AUDIT_STAGE'];

  const allowedStages: AuditStage[] = [
    'core',
    'browser',
    'lighthouse',
    'links',
  ];

  if (!allowedStages.includes(stage as AuditStage)) {
    throw new Error(`Unknown audit stage: ${stage ?? 'missing'}`);
  }

  await stages[stage as AuditStage]();
}
