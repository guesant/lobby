import { runCommand as command } from './process.ts';
import { annotateSarif } from './sarif.ts';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function secretScan(): Promise<void> {
  let findings = 0;

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
    const safeName = path.replaceAll('/', '-');

    const reportName = safeName.replaceAll('.', '-');

    const reportPath = `.local/reports/sarif/gitleaks-${reportName}.sarif`;

    const reportDirectory = dirname(reportPath);

    await mkdir(reportDirectory, {
      recursive: true,
    });

    await command('gitleaks', [
      'dir',
      '--redact',
      '--no-banner',
      '--exit-code',
      '0',
      '--report-format',
      'sarif',
      '--report-path',
      reportPath,
      path,
    ]);

    findings += await annotateSarif(reportPath, `gitleaks/${path}`);
  }

  if (findings > 0) {
    const findingCount = String(findings);

    throw new Error(
      `Gitleaks found ${findingCount} secret(s); see redacted SARIF reports`,
    );
  }
}
