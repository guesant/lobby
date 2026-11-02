import { textOr } from '../../website/src/lib/features/content/text-or.model.ts';
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

  const destinationPath = resolve(destination);

  const siteConfiguration = configuration.readConfiguration();

  const repository = textOr(
    dependencies.environment['GITHUB_REPOSITORY'],
    siteConfiguration.site.repository,
  );

  const serverURL = textOr(
    dependencies.environment['GITHUB_SERVER_URL'],
    'https://github.com',
  );

  const sourceSHA = textOr(
    dependencies.environment['LOBBY_SOURCE_SHA'],
    dependencies.environment['GITHUB_SHA'],
  );

  const environment = {
    SITE_OUTPUT_DIR: destinationPath,
    GITHUB_REPOSITORY: repository,
    GITHUB_SERVER_URL: serverURL,
    GITHUB_SHA: sourceSHA ?? '',
    GITHUB_RUN_ID: dependencies.environment['GITHUB_RUN_ID'] ?? '',
    GITHUB_RUN_NUMBER: dependencies.environment['GITHUB_RUN_NUMBER'] ?? '',
  };

  return dependencies.command(
    'pnpm',
    [
      '--dir',
      'website',
      'run',
      'build',
    ],
    {
      environment,
    },
  );
}
