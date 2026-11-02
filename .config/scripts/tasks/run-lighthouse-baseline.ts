import { build } from '../build-task.ts';
import { runCommand } from '../process.ts';

export async function runLighthouseBaseline(): Promise<void> {
  await build('.local/build/lighthouse-baseline');
  await runCommand('node', [
    '.config/scripts/lighthouse-baseline.ts',
  ]);
}
