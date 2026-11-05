import { runCommand as command } from './process.ts';
import { annotateSarif } from './sarif.ts';
import { basename, dirname } from 'node:path';

export async function scanSBOM(path: string): Promise<void> {
  const parentDirectory = dirname(path);

  const name = basename(parentDirectory);

  const sarifPath = `.local/reports/sarif/trivy-sbom-${name}.sarif`;

  const reportPath = path.replace('.cdx.json', '.trivy.json');

  await command('trivy', [
    'sbom',
    '--no-progress',
    '--severity',
    'CRITICAL,HIGH',
    '--exit-code',
    '0',
    '--format',
    'sarif',
    '--output',
    sarifPath,
    path,
  ]);

  const category = `trivy/sbom/${name}`;

  await annotateSarif(sarifPath, category);

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
    reportPath,
    path,
  ]);
}
