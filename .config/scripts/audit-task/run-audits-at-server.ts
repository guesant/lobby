import type { accessibilityAudits } from '../accessibility-audits.ts';
import accessibilityViewports from '../accessibility-viewports.ts';
import { runCommand as command } from '../process.ts';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function runAuditsAtServer(
  pa11y: ReturnType<typeof accessibilityAudits>['pa11y'],
  measuredCount: number,
): Promise<void> {
  await mkdir('.local/reports', {
    recursive: true,
  });

  const urls = pa11y.urls.slice(0, measuredCount);

  await accessibilityViewports(urls, pa11y.defaults);

  const report = {
    ...pa11y,
    urls,
  };

  const serializedReport = JSON.stringify(report);

  await writeFile('.local/reports/pa11y.json', serializedReport);
  await command('pa11y-ci', [
    '--config=.local/reports/pa11y.json',
  ]);

  const reportDirectory = resolve('.local/reports');

  await command(
    'node',
    [
      '.config/scripts/check-layout.ts',
    ],
    {
      environment: {
        QA_BASE_URL: 'http://127.0.0.1:4173',
        QA_REPORT_DIR: reportDirectory,
      },
    },
  );
}
