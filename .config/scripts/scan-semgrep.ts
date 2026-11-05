import { formatError } from './format-error.ts';
import { runCommand } from './process.ts';
import { annotateSarif } from './sarif.ts';
import { mkdir } from 'node:fs/promises';

export async function scanSemgrep(): Promise<void> {
  const reportDirectory = '.local/reports/sarif';

  const reportPath = `${reportDirectory}/semgrep.sarif`;

  await mkdir(reportDirectory, {
    recursive: true,
  });

  let scanFailure: unknown;

  try {
    await runCommand('semgrep', [
      'scan',
      '--config',
      'auto',
      '--error',
      '--sarif-output',
      reportPath,
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
  } catch (error) {
    scanFailure = error;
  }

  await annotateSarif(reportPath, 'semgrep/source');

  if (scanFailure !== undefined) {
    const message = formatError(scanFailure);

    throw new Error(`Semgrep scan failed: ${message}`);
  }
}
