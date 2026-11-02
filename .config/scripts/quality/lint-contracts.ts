import { runCommand as command } from '../process.ts';

export async function lintContracts(): Promise<void> {
  await command('node', [
    '.config/scripts/repository-quality.ts',
  ]);
  await command('node', [
    '.config/scripts/module-boundaries.ts',
  ]);
  await command('tsc', [
    '--project',
    '.config/tsconfig.json',
  ]);
  await command('pnpm', [
    '--dir',
    '.config',
    'run',
    'duplicates',
  ]);
  await command('stylelint', [
    '--config',
    'website/.stylelintrc.json',
    'website/src/assets/css/*.css',
  ]);
}
