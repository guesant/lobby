import type { Command } from '../build-task.ts';

export type FastDependencies = {
  command: Command;
  secretScan(): Promise<void>;
  tests(): Promise<void>;
};
