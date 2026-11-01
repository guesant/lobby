import { spawn } from 'node:child_process';

export async function runCommand(
  name: string,
  args: string[] = [],
  environment: NodeJS.ProcessEnv = {},
  cwd: string = process.cwd(),
): Promise<void> {
  await new Promise<void>((accept, reject): void => {
    const child = spawn(name, args, {
      cwd,
      stdio: 'inherit',
      env: {
        ...process.env,
        ...environment,
      },
    });

    child.on('error', reject);
    child.on('exit', (code, signal): void => {
      if (code === 0) {
        accept();

        return;
      }

      reject(new Error(`${name} failed: ${code ?? signal}`));
    });
  });
}
