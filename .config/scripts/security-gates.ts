import { runCommand as command } from './process.ts';
import { dependencySBOMs } from './security-inputs.ts';

export async function secretScan(): Promise<void> {
  const secretScanPaths = [
    '.config',
    '.github',
    'website/src',
    'website/package.json',
    'website/pnpm-lock.yaml',
    'README.md',
    'justfile',
    'LICENSES',
  ];

  for (const path of secretScanPaths) {
    await command('gitleaks', [
      'dir',
      '--redact',
      '--no-banner',
      path,
    ]);
  }
}

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
    await command('trivy', [
      'sbom',
      '--no-progress',
      '--severity',
      'CRITICAL,HIGH',
      '--exit-code',
      '1',
      '--format',
      'json',
      '--output',
      path.replace('.cdx.json', '.trivy.json'),
      path,
    ]);
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

async function scanFilesystem(): Promise<void> {
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
