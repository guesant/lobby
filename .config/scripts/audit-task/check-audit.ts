import { build } from '../build-task.ts';
import { checkFast } from '../fast-gates.ts';
import { runCommand as command } from '../process.ts';
import { security } from '../security-gates.ts';
import { runBrowserAudits } from './run-browser-audits.ts';

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
