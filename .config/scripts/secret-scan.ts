import { runCommand as command } from './process.ts';

export async function secretScan(): Promise<void> {
  for (const path of [
    '.config',
    '.github',
    'website/src',
    'website/package.json',
    'website/pnpm-lock.yaml',
    'README.md',
    'justfile',
    'LICENSES',
  ]) {
    await command('gitleaks', [
      'dir',
      '--redact',
      '--no-banner',
      path,
    ]);
  }
}
