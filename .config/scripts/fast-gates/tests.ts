import { runCommand as command } from '../process.ts';

export async function tests(): Promise<void> {
  await command('pnpm', [
    '--dir',
    '.config',
    'run',
    'test',
  ]);
}
