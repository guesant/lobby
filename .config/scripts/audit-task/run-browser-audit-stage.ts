import { build } from '../build-task.ts';
import { runCommand as command } from '../process.ts';
import { runBrowserAudits } from './run-browser-audits.ts';

export async function runBrowserAuditStage(): Promise<void> {
  await command('node', [
    '--test',
    '.config/scripts/check-raster-browser.ts',
  ]);
  await build('.local/build/qa');
  await runBrowserAudits();
}
