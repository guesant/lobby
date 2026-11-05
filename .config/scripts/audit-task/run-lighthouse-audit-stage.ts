import { build } from '../build-task.ts';
import { runCommand as command } from '../process.ts';

export async function runLighthouseAuditStage(): Promise<void> {
  await build('.local/build/lighthouse');
  await command('node', [
    '.config/scripts/lighthouse-audit.ts',
  ]);
}
