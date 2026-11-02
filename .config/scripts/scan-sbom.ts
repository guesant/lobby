import { runCommand as command } from './process.ts';

export async function scanSBOM(path: string): Promise<void> {
  const reportPath = path.replace('.cdx.json', '.trivy.json');

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
