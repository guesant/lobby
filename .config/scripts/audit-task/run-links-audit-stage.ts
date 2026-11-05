import { build } from '../build-task.ts';
import { runCommand as command } from '../process.ts';

export async function runLinksAuditStage(): Promise<void> {
  await build();
  await command('node', [
    '.config/scripts/verify-links.ts',
  ]);
}
