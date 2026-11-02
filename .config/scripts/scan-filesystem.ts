import { runCommand as command } from './process.ts';

export async function scanFilesystem(): Promise<void> {
  await command('trivy', [
    'fs',
    '--no-progress',
    '--scanners',
    'vuln,secret',
    '--severity',
    'CRITICAL,HIGH',
    '--exit-code',
    '1',
    '--skip-dirs',
    '.git',
    '--skip-dirs',
    '.cache',
    '--skip-dirs',
    '.local',
    '--skip-dirs',
    '.config/node_modules',
    '--skip-dirs',
    '.config/audit/node_modules',
    '--skip-dirs',
    '.config/python/.venv',
    '--skip-dirs',
    'website/node_modules',
    '--skip-dirs',
    'website/.svelte-kit',
    '.',
  ]);
}
