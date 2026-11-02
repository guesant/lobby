import { syncFederation } from '../federation.ts';
import { runCommand } from '../process.ts';

export async function runDev(): Promise<void> {
  await syncFederation();
  await runCommand('node', [
    '.config/scripts/prepare-svelte-assets.ts',
  ]);
  await runCommand('pnpm', [
    '--dir',
    'website',
    'run',
    'dev',
  ]);
}
