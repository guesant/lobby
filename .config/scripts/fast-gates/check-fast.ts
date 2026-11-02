import { runCommand as command } from '../process.ts';
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
  await dependencies.command('pnpm', [
    '--dir',
    'website',
    'run',
    'format',
  ]);
  await dependencies.command('just', [
    '--fmt',
    '--check',
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
  await dependencies.command('zizmor', [
    '--offline',
    '.github/workflows',
  ]);
  await dependencies.secretScan();
  await dependencies.tests();
}
