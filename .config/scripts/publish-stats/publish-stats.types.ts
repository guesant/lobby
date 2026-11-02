export type GitCommand = (args: string[]) => string;

export type PublicationOptions = {
  token?: string;
  repository?: unknown;
  ref?: string;
  runGit?: GitCommand;
  validate?: () => Promise<void>;
};

export type PublicationResult = {
  changed: boolean;
  sha: string;
};
