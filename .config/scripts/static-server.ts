import { spawn } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';

export async function withStaticServer(
  task: () => Promise<void>,
  directory: string = '.local/build/qa',
): Promise<void> {
  const server = spawn(
    'serve',
    [
      '--no-clipboard',
      '--no-etag',
      '--listen',
      'tcp://127.0.0.1:4173',
      directory,
    ],
    {
      stdio: [
        'ignore',
        'ignore',
        'inherit',
      ],
    },
  );

  try {
    for (let attempt = 0; ; attempt += 1) {
      try {
        const response = await fetch('http://127.0.0.1:4173/'); // nosemgrep: typescript.react.security.react-insecure-request.react-insecure-request

        await response.arrayBuffer();

        if (response.ok) {
          break;
        }
      } catch {}

      if (attempt >= 50) {
        throw new Error('Preview server did not start');
      }

      await setTimeout(100);
    }

    await task();
  } finally {
    server.kill('SIGTERM');
  }
}
