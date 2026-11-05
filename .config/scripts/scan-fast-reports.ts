import type { FastDependencies } from './fast-gates/fast-gates.types.ts';
import { scanZizmor } from './scan-zizmor.ts';

export async function scanFastReports(
  dependencies: FastDependencies,
): Promise<void> {
  const secretScanPromise = dependencies.secretScan();

  const zizmorPromise = scanZizmor();

  const reportScans = [
    secretScanPromise,
    zizmorPromise,
  ];

  const results = await Promise.allSettled(reportScans);

  const failures: unknown[] = [];

  for (const result of results) {
    if (result.status === 'rejected') {
      failures.push(result.reason);
    }
  }

  if (failures.length > 0) {
    throw new AggregateError(failures, 'Fast SARIF scanners failed');
  }
}
