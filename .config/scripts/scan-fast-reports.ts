import type { FastDependencies } from './fast-gates/fast-gates.types.ts';
import { scanZizmor } from './scan-zizmor.ts';
import { throwOnRejected } from './throw-on-rejected.ts';

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

  throwOnRejected(results, 'Fast SARIF scanners failed');
}
