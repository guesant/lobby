import { runCommand as command } from '../process.ts';
import { scanFastReports } from '../scan-fast-reports.ts';
import { secretScan } from '../security-gates.ts';
import type { FastDependencies } from './fast-gates.types.ts';
import { tests } from './tests.ts';

export async function checkFast(
  dependencies: FastDependencies = {
    command,
    secretScan,
    tests,
  },
): Promise<void> {
  await scanFastReports(dependencies);

  await dependencies.command('pnpm', [
    '--dir',
    'website',
    'run',
    'format',
  ]);
  await dependencies.command('pnpm', [
    '--dir',
    'website',
    'run',
    'lint',
  ]);
  await dependencies.command('pnpm', [
    '--dir',
    'website',
    'run',
    'check',
  ]);
  await dependencies.command('actionlint');
  await dependencies.tests();
}
