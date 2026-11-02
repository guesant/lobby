import { runCommand } from '../process.ts';

export function runPreview(): Promise<void> {
  return runCommand('node', [
    '.config/scripts/static-server.ts',
  ]);
}
