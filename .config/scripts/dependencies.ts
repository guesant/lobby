import { spawn } from 'node:child_process';

async function install(directory: string): Promise<void> {
  await new Promise<void>((accept, reject): void => {
    const child = spawn(
      'pnpm',
      [
        '--dir',
        directory,
        'install',
        '--frozen-lockfile',
        '--store-dir',
        '/pnpm/store',
      ],
      {
        stdio: 'inherit',
      },
    );

    child.on('error', reject);
    child.on('exit', (code, signal): void => {
      if (code === 0) {
        accept();

        return;
      }

      reject(
        new Error(
          `Dependency installation failed in ${directory}: ${String(code ?? signal)}`,
        ),
      );
    });
  });
}

if (process.env['LINKS_CONTAINER'] !== '1') {
  throw new Error('Dependencies must be installed through Docker');
}

if (
  process.argv.includes('--audit') &&
  process.env['TOOLING_PROFILE'] !== 'audit'
) {
  throw new Error(
    'The complete audit requires the workspace-audit Docker target',
  );
}

await install('.config');
await install('website');

if (process.argv.includes('--audit')) {
  await install('.config/audit');
}
