import { runCommand as command } from './process.ts';
import { annotateSarif } from './sarif.ts';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function scanFilesystem(): Promise<void> {
  const sarifPath = '.local/reports/sarif/trivy-filesystem.sarif';

  const scanArguments = [
    '--no-progress',
    '--scanners',
    'vuln,secret',
    '--severity',
    'CRITICAL,HIGH',
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
  ];

  const sarifDirectory = dirname(sarifPath);

  await mkdir(sarifDirectory, {
    recursive: true,
  });

  await command('trivy', [
    'fs',
    ...scanArguments,
    '--format',
    'sarif',
    '--output',
    sarifPath,
    '--exit-code',
    '0',
    '.',
  ]);
  await annotateSarif(sarifPath, 'trivy/filesystem');
  await command('trivy', [
    'fs',
    ...scanArguments,
    '--exit-code',
    '1',
    '.',
  ]);
}
