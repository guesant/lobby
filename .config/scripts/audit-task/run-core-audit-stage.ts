import { runCoreAudits } from './run-core-audits.ts';

export async function runCoreAuditStage(): Promise<void> {
  const failures = await runCoreAudits();

  if (failures.length > 0) {
    throw new AggregateError(failures, 'Quality audit failed');
  }
}
