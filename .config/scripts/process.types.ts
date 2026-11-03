export type ProcessState = {
  name: string;
  reject: (reason: Error) => void;
  resolve: (value: undefined) => void;
};

export type CommandOptions = {
  environment?: NodeJS.ProcessEnv;
  cwd?: string;
};
