import { runCommand } from './process.ts';

export async function installDependencies(directory: string): Promise<void> {
  await runCommand('pnpm', [
    '--dir',
    directory,
    'install',
    '--frozen-lockfile',
    '--store-dir',
    '/pnpm/store',
  ]);
}
