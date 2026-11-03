import type { Command } from '../build-task.types.ts';

export type FastDependencies = {
  command: Command;
  secretScan(): Promise<void>;
  tests(): Promise<void>;
};
