import { accessibilityAudits } from './accessibility-audits.ts';
import accessibilityViewports from './accessibility-viewports.ts';
import { build } from './build-task.ts';
import { checkFast } from './fast-gates.ts';
import { runCommand as command } from './process.ts';
import { security } from './security-gates.ts';
import { withStaticServer as withServer } from './static-server.ts';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function check(): Promise<void> {
  if (process.env['TOOLING_PROFILE'] !== 'audit') {
    throw new Error('Use the workspace-audit Docker target for just check');
  }

  await checkFast();
  await security();
  await command('node', [
    '--test',
    '.config/scripts/check-raster-browser.ts',
  ]);
  await mkdir('.local/reports', {
    recursive: true,
  });
  await build('.local/build/qa');

  await runBrowserAudits();
  await build('.local/build/lighthouse');

  await command('node', [
    '.config/scripts/lighthouse-audit.ts',
  ]);
  await build();
  await command('node', [
    '.config/scripts/verify-links.ts',
  ]);
}

async function runBrowserAudits(): Promise<void> {
  const {
    pa11y,
    measuredCount
  } = accessibilityAudits();

  await withServer(async (): Promise<void> => {
    await accessibilityViewports(
      pa11y.urls.slice(0, measuredCount),
      pa11y.defaults,
    );
    await writeFile('.local/reports/pa11y.json', JSON.stringify(pa11y));
    await command('pa11y-ci', [
      '--config=.local/reports/pa11y.json',
    ]);
    await command(
      'node',
      [
        '.config/scripts/check-layout.ts',
      ],
      {
        environment: {
          QA_BASE_URL: 'http://127.0.0.1:4173',
          QA_REPORT_DIR: resolve('.local/reports'),
        },
      },
    );
  });
}
