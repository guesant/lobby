import { runCommand as command } from '../process.ts';
import { knipWorkspaceArguments } from './knip-workspace-arguments.ts';
import { resolve } from 'node:path';

export async function lintCode(): Promise<void> {
  const websiteDirectory = resolve('website');

  await command('eslint', [
    '--config',
    'website/eslint.config.js',
    '.',
    '--max-warnings',
    '0',
  ]);

  const workspaceArguments = knipWorkspaceArguments();

  await command(
    'knip',
    [
      '--config',
      '../.config/knip.json',
      '--treat-config-hints-as-errors',
      ...workspaceArguments,
    ],
    {
      environment: {},
      cwd: websiteDirectory,
    },
  );
}
