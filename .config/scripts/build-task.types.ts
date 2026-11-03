import type { runCommand } from './process.ts';

export type Command = typeof runCommand;

export type BuildDependencies = {
  command: Command;
  sync(): Promise<unknown>;
  environment: NodeJS.ProcessEnv;
};
