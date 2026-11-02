import { processError } from './process-error.ts';
import { processExit } from './process-exit.ts';
import { spawn } from 'node:child_process';

export type CommandOptions = {
  environment?: NodeJS.ProcessEnv;
  cwd?: string;
};

export async function runCommand(
  name: string,
  args: string[] = [],
  options: CommandOptions = {},
): Promise<void> {
  const completion = Promise.withResolvers<undefined>();

  const workingDirectory = options.cwd ?? process.cwd();

  const child = spawn(name, args, {
    cwd: workingDirectory,
    stdio: 'inherit',
    env: {
      ...process.env,
      ...options.environment,
    },
  });

  const state = {
    name,
    resolve: completion.resolve,
    reject: completion.reject,
  };

  const handleError = processError.bind(null, state);

  const handleExit = processExit.bind(null, state);

  child.on('error', handleError);
  child.on('exit', handleExit);

  return completion.promise;
}
