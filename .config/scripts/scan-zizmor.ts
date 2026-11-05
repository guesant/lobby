import { runSarifCommand } from './run-sarif-command.ts';
import { annotateSarif } from './sarif.ts';

export async function scanZizmor(): Promise<void> {
  const path = '.local/reports/sarif/zizmor.sarif';

  const code = await runSarifCommand(
    'zizmor',
    [
      '--offline',
      '--format',
      'sarif',
      '--no-progress',
      '.github/workflows',
    ],
    path,
  );

  await annotateSarif(path, 'zizmor/workflows');

  if (code !== 0) {
    throw new Error(`zizmor failed: ${String(code)}`);
  }
}
