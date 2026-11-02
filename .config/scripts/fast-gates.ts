import type { Command } from './build-task.ts';
import { runCommand as command } from './process.ts';
import { secretScan } from './security-gates.ts';

export async function tests(): Promise<void> {
  await command('node', [
    '--test',
    '.config/scripts/check-stats.ts',
    '.config/scripts/check-public-resources.test.ts',
    '.config/scripts/check-pointer-sound.ts',
    '.config/scripts/check-link-view.ts',
    '.config/scripts/check-federation.ts',
    '.config/scripts/check-search.ts',
    '.config/scripts/check-security-fuzz.test.ts',
    '.config/scripts/check-security-gates.test.ts',
    '.config/scripts/check-code-spacing.test.ts',
    '.config/scripts/check-svelte-layout.test.ts',
    '.config/scripts/check-architecture.test.ts',
    '.config/scripts/check-ci.test.ts',
    '.config/scripts/check-publish-stats.test.ts',
  ]);
}

export type FastDependencies = {
  command: Command;
  secretScan(): Promise<void>;
  tests(): Promise<void>;
};

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
