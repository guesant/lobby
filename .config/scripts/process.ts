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
  await new Promise<void>((accept, reject): void => {
    const child = spawn(name, args, {
      cwd: options.cwd ?? process.cwd(),
      stdio: 'inherit',
      env: {
        ...process.env,
        ...options.environment,
      },
    });

    child.on('error', reject);
    child.on('exit', (code, signal): void => {
      if (code === 0) {
        accept();

        return;
      }

      reject(new Error(`${name} failed: ${String(code ?? signal)}`));
    });
  });
}
