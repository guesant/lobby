import { textOr } from '../../website/src/lib/features/content/text.model.ts';
import * as configuration from './configuration.ts';
import { syncFederation } from './federation.ts';
import { runCommand as command } from './process.ts';
import { resolve } from 'node:path';

export type Command = typeof command;

export type BuildDependencies = {
  command: Command;
  sync(): Promise<unknown>;
  environment: NodeJS.ProcessEnv;
};

export async function build(
  destination = '.local/build/site',
  dependencies: BuildDependencies = {
    command,
    sync: syncFederation,
    environment: process.env,
  },
): Promise<void> {
  await dependencies.sync();
  await dependencies.command('node', [
    '.config/scripts/prepare-svelte-assets.ts',
  ]);

  return dependencies.command(
    'pnpm',
    [
      '--dir',
      'website',
      'run',
      'build',
    ],
    {
      environment: {
        SITE_OUTPUT_DIR: resolve(destination),
        GITHUB_REPOSITORY: textOr(
          dependencies.environment['GITHUB_REPOSITORY'],
          configuration.readConfiguration().site.repository,
        ),
        GITHUB_SERVER_URL: textOr(
          dependencies.environment['GITHUB_SERVER_URL'],
          'https://github.com',
        ),
        GITHUB_SHA:
          textOr(
            dependencies.environment['LOBBY_SOURCE_SHA'],
            dependencies.environment['GITHUB_SHA'],
          ) ?? '',
        GITHUB_RUN_ID: dependencies.environment['GITHUB_RUN_ID'] ?? '',
      },
    },
  );
}
