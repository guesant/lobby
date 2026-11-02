import { runCommand as command } from './process.ts';
import { scanFilesystem } from './scan-filesystem.ts';
import { scanSBOM } from './scan-sbom.ts';
import { dependencySBOMs } from './security-inputs.ts';

export async function security(): Promise<void> {
  await command('renovate-config-validator', [
    '--strict',
    '.github/renovate.json',
  ]);
  await command('node', [
    '.config/scripts/check-renovate.ts',
  ]);
  await command('node', [
    '.config/scripts/check-osv.ts',
  ]);
  await scanFilesystem();

  for (const path of await dependencySBOMs()) {
    await scanSBOM(path);
  }

  await command('semgrep', [
    'scan',
    '--config',
    'auto',
    '--error',
    '--exclude',
    'website/node_modules/**',
    '--exclude',
    'website/.svelte-kit/**',
    '--exclude',
    '.cache/**',
    '--exclude',
    '.local/**',
    'website/src',
    '.config/scripts',
  ]);
}
